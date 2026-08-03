import './assets.d.ts';
/**
 * DON-003 — Clinical Supervision Framework
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
import img01 from './assets/don-003/don-003-lesson-01.png';
import img02 from './assets/don-003/don-003-lesson-02.png';
import img03 from './assets/don-003/don-003-lesson-03.png';
import img04 from './assets/don-003/don-003-lesson-04.png';
import img05 from './assets/don-003/don-003-lesson-05.png';
import img06 from './assets/don-003/don-003-lesson-06.png';
import img07 from './assets/don-003/don-003-lesson-07.png';

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

const MODULE_META = { id: "DON-003", title: "Clinical Supervision Framework", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health DON leadership scene for Clinical supervision governance and accountability, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Discipline roles, reporting lines, and decision rights, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Supervision planning by role, risk, and current policy, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Field observation, record review, and patient feedback, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Coaching, corrective guidance, and remediation boundaries, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Escalation of unsafe practice and unresolved performance risk, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Supervision evidence, trending, and program evaluation, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Clinica",
    title: "Clinical supervision governance and accountability",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for clinical supervision governance and accountability within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-TA-005 (Role-Specific / Clinical Orientation (Days 1-30)), CL-SD-008 (Director of Nursing Monthly Clinical Review), CL-SD-008 (New Employee Clinical Supervision), CL-SD-008 (4. Policy Statement), CL-SD-008 (Ongoing Professional Staff Supervision). These sources are presented as a governed control map rather than pasted policy tables. For clinical supervision governance, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For accountability, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for clinical supervision governance and accountability centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to clinical supervision governance and accountability. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for clinical supervision governance and accountability should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for clinical supervision governance and accountability, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Clinical Supervision Checklist", detail: "The clinical supervision checklist is marked complete even though one required evidence line is blank. Verify it against the accountability de-identified visit record and current source before acting." },
      { icon: "🧭", title: "Accountability De-identified Visit Record", detail: "The accountability de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the exception coaching note and current source before acting." },
      { icon: "🛡️", title: "Exception Coaching Note", detail: "The exception coaching note has no author, date, or accountable next action. Verify it against the clinical supervision checklist and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "clinical-supervision-checklist-1-1", label: "clinical supervision checklist", shortLabel: "clinical supervision checklist", ariaLabel: "Investigate clinical supervision checklist",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "The photographed clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. The adjacent accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability, while the accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. The adjacent accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability, while the accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat clinical supervision checklist as complete proof without comparing accountability de-identified visit record or the controlled source. This identify option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical supervision governance and accountability." },
          { id: "i3", label: "Classify the clinical supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from clinical supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical supervision checklist is resolved." },
          { id: "d3", label: "Send clinical supervision checklist to an unrelated department rather than the policy owner responsible for clinical supervision governance and accountability. This decide option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical supervision governance and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For clinical supervision checklist, record the exact visible discrepancy, the conflicting accountability de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For clinical supervision checklist, record the exact visible discrepancy, the conflicting accountability de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that clinical supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical supervision checklist." },
          { id: "doc3", label: "Keep the clinical supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns clinical supervision checklist during clinical supervision governance and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical supervision governance and accountability." },
        ],
        feedback: {
          observed: "The photographed clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. The adjacent accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. The adjacent accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability, while the accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical supervision governance and accountability, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For clinical supervision checklist, record the exact visible discrepancy, the conflicting accountability de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "accountability-de-identified-visit-record-1-2", label: "accountability de-identified visit record", shortLabel: "accountability de-identified", ariaLabel: "Investigate accountability de-identified visit record",        x: 37, y: 67, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "The photographed accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. The adjacent exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability, while the exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. The adjacent exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability, while the exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume accountability de-identified visit record applies to every role, patient, location, and exception described in clinical supervision governance and accountability. This identify option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical supervision governance and accountability." },
          { id: "i3", label: "Use the oldest available accountability de-identified visit record because prior approval is easier to confirm. This identify option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about accountability de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in accountability de-identified visit record remains unresolved. This decide option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for accountability de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to accountability de-identified visit record. This decide option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical supervision governance and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For accountability de-identified visit record, record the exact visible discrepancy, the conflicting exception coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For accountability de-identified visit record, record the exact visible discrepancy, the conflicting exception coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark accountability de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of accountability de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of accountability de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns accountability de-identified visit record during clinical supervision governance and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical supervision governance and accountability." },
        ],
        feedback: {
          observed: "The photographed accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. The adjacent exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. The adjacent exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability, while the exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical supervision governance and accountability, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For accountability de-identified visit record, record the exact visible discrepancy, the conflicting exception coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "exception-coaching-note-1-3", label: "exception coaching note", shortLabel: "exception coaching note", ariaLabel: "Investigate exception coaching note",        x: 84, y: 46, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "The photographed exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. The adjacent clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability, while the clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. The adjacent clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability, while the clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception coaching note only for favorable indicators and omit the exception evidence connected to clinical supervision checklist. This identify option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical supervision governance and accountability." },
          { id: "i3", label: "Treat an unsigned or unverified exception coaching note as equivalent to the current controlled record. This identify option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception coaching note is resolved." },
          { id: "d3", label: "Defer the exception coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical supervision governance and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception coaching note, record the exact visible discrepancy, the conflicting clinical supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception coaching note, record the exact visible discrepancy, the conflicting clinical supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception coaching note." },
          { id: "doc3", label: "Combine exception coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception coaching note during clinical supervision governance and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical supervision governance and accountability." },
        ],
        feedback: {
          observed: "The photographed exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. The adjacent clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability. The adjacent clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception coaching note has no author, date, or accountable next action for clinical supervision governance and accountability, while the clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical supervision governance and accountability, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical supervision governance and accountability, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical supervision governance and accountability, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception coaching note, record the exact visible discrepancy, the conflicting clinical supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Discipl",
    title: "Discipline roles, reporting lines, and decision rights",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for discipline roles, reporting lines, and decision rights within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-SD-008 (4. Policy Statement), HR-TA-005 (General Agency Orientation (All Staff — Days 1-5)), HR-TD-003 (Annual Competency Evaluation), CL-SD-008 (Director of Nursing Monthly Clinical Review), CL-SD-008 (LVN, PTA, and COTA Supervision). These sources are presented as a governed control map rather than pasted policy tables. For discipline roles, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For reporting lines, confirm that an operational practice does not silently expand beyond its approved scope. For decision rights, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for discipline roles, reporting lines, and decision rights centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to discipline roles, reporting lines, and decision rights. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for discipline roles, reporting lines, and decision rights should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for discipline roles, reporting lines, and decision rights, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Discipline De-identified Visit Record", detail: "The discipline de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the reporting coaching note and current source before acting." },
      { icon: "🧭", title: "Reporting Coaching Note", detail: "The reporting coaching note has no author, date, or accountable next action. Verify it against the decision supervision checklist and current source before acting." },
      { icon: "🛡️", title: "Decision Supervision Checklist", detail: "The decision supervision checklist is marked complete even though one required evidence line is blank. Verify it against the discipline de-identified visit record and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
      { kind: "External Authority", text: "42 CFR § 484.115(b)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "discipline-de-identified-visit-record-2-1", label: "discipline de-identified visit record", shortLabel: "discipline de-identified", ariaLabel: "Investigate discipline de-identified visit record",        x: 16, y: 68, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "The photographed discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. The adjacent reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights, while the reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. The adjacent reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights, while the reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume discipline de-identified visit record applies to every role, patient, location, and exception described in discipline roles, reporting lines, and decision rights. This identify option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for discipline roles, reporting lines, and decision rights." },
          { id: "i3", label: "Use the oldest available discipline de-identified visit record because prior approval is easier to confirm. This identify option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about discipline de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the discipline de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the discipline de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in discipline de-identified visit record remains unresolved. This decide option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for discipline de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to discipline de-identified visit record. This decide option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during discipline roles, reporting lines, and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For discipline de-identified visit record, record the exact visible discrepancy, the conflicting reporting coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For discipline de-identified visit record, record the exact visible discrepancy, the conflicting reporting coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark discipline de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of discipline de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of discipline de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns discipline de-identified visit record during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discipline roles, reporting lines, and decision rights." },
        ],
        feedback: {
          observed: "The photographed discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. The adjacent reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. The adjacent reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights, while the reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the discipline de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For discipline roles, reporting lines, and decision rights, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For discipline de-identified visit record, record the exact visible discrepancy, the conflicting reporting coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "reporting-coaching-note-2-2", label: "reporting coaching note", shortLabel: "reporting coaching note", ariaLabel: "Investigate reporting coaching note",        x: 32, y: 40, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "The photographed reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. The adjacent decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights, while the decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. The adjacent decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights, while the decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read reporting coaching note only for favorable indicators and omit the exception evidence connected to decision supervision checklist. This identify option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for discipline roles, reporting lines, and decision rights." },
          { id: "i3", label: "Treat an unsigned or unverified reporting coaching note as equivalent to the current controlled record. This identify option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about reporting coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close reporting coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for reporting coaching note is resolved." },
          { id: "d3", label: "Defer the reporting coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during discipline roles, reporting lines, and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For reporting coaching note, record the exact visible discrepancy, the conflicting decision supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For reporting coaching note, record the exact visible discrepancy, the conflicting decision supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for reporting coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reporting coaching note." },
          { id: "doc3", label: "Combine reporting coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns reporting coaching note during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discipline roles, reporting lines, and decision rights." },
        ],
        feedback: {
          observed: "The photographed reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. The adjacent decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights. The adjacent decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights, while the decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For discipline roles, reporting lines, and decision rights, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For reporting coaching note, record the exact visible discrepancy, the conflicting decision supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "decision-supervision-checklist-2-3", label: "decision supervision checklist", shortLabel: "decision supervision checklist", ariaLabel: "Investigate decision supervision checklist",        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "The photographed decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. The adjacent discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights, while the discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. The adjacent discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights, while the discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat decision supervision checklist as complete proof without comparing discipline de-identified visit record or the controlled source. This identify option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for discipline roles, reporting lines, and decision rights." },
          { id: "i3", label: "Classify the decision supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about decision supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from decision supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for decision supervision checklist is resolved." },
          { id: "d3", label: "Send decision supervision checklist to an unrelated department rather than the policy owner responsible for discipline roles, reporting lines, and decision rights. This decide option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during discipline roles, reporting lines, and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For decision supervision checklist, record the exact visible discrepancy, the conflicting discipline de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For decision supervision checklist, record the exact visible discrepancy, the conflicting discipline de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that decision supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of decision supervision checklist." },
          { id: "doc3", label: "Keep the decision supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns decision supervision checklist during discipline roles, reporting lines, and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discipline roles, reporting lines, and decision rights." },
        ],
        feedback: {
          observed: "The photographed decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. The adjacent discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. The adjacent discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights, while the discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For discipline roles, reporting lines, and decision rights, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For discipline roles, reporting lines, and decision rights, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For decision supervision checklist, record the exact visible discrepancy, the conflicting discipline de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Supervi",
    title: "Supervision planning by role, risk, and current policy",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for supervision planning by role, risk, and current policy within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-TA-005 (Role-Specific / Clinical Orientation (Days 1-30)), HR-TA-005 (Orientation for Internal Transfers / Role Changes), CL-SD-008 (New Employee Clinical Supervision), CL-SD-008 (Ongoing Professional Staff Supervision), CL-SD-008 (LVN, PTA, and COTA Supervision). These sources are presented as a governed control map rather than pasted policy tables. For supervision planning by role, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For risk, confirm that an operational practice does not silently expand beyond its approved scope. For current policy, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for supervision planning by role, risk, and current policy centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to supervision planning by role, risk, and current policy. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for supervision planning by role, risk, and current policy should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for supervision planning by role, risk, and current policy, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Supervision Coaching Note", detail: "The supervision coaching note has no author, date, or accountable next action. Verify it against the risk supervision checklist and current source before acting." },
      { icon: "🧭", title: "Risk Supervision Checklist", detail: "The risk supervision checklist is marked complete even though one required evidence line is blank. Verify it against the lesson 3 de-identified visit record and current source before acting." },
      { icon: "🛡️", title: "Lesson 3 De-identified Visit Record", detail: "The lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the supervision coaching note and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.115(b)" },
      { kind: "External Authority", text: "42 CFR § 484.80(h)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "supervision-coaching-note-3-1", label: "supervision coaching note", shortLabel: "supervision coaching note", ariaLabel: "Investigate supervision coaching note",        x: 14, y: 50, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "The photographed supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. The adjacent risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy, while the risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. The adjacent risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy, while the risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read supervision coaching note only for favorable indicators and omit the exception evidence connected to risk supervision checklist. This identify option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision planning by role, risk, and current policy." },
          { id: "i3", label: "Treat an unsigned or unverified supervision coaching note as equivalent to the current controlled record. This identify option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about supervision coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close supervision coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for supervision coaching note is resolved." },
          { id: "d3", label: "Defer the supervision coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision planning by role, risk, and current policy." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision coaching note, record the exact visible discrepancy, the conflicting risk supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision coaching note, record the exact visible discrepancy, the conflicting risk supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for supervision coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of supervision coaching note." },
          { id: "doc3", label: "Combine supervision coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns supervision coaching note during supervision planning by role, risk, and current policy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision planning by role, risk, and current policy." },
        ],
        feedback: {
          observed: "The photographed supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. The adjacent risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. The adjacent risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy, while the risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision planning by role, risk, and current policy, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision coaching note, record the exact visible discrepancy, the conflicting risk supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "risk-supervision-checklist-3-2", label: "risk supervision checklist", shortLabel: "risk supervision checklist", ariaLabel: "Investigate risk supervision checklist",        x: 35, y: 41, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "The photographed risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. The adjacent lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy, while the lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. The adjacent lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy, while the lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat risk supervision checklist as complete proof without comparing lesson 3 de-identified visit record or the controlled source. This identify option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision planning by role, risk, and current policy." },
          { id: "i3", label: "Classify the risk supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about risk supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the risk supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the risk supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from risk supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for risk supervision checklist is resolved." },
          { id: "d3", label: "Send risk supervision checklist to an unrelated department rather than the policy owner responsible for supervision planning by role, risk, and current policy. This decide option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision planning by role, risk, and current policy." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For risk supervision checklist, record the exact visible discrepancy, the conflicting lesson 3 de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For risk supervision checklist, record the exact visible discrepancy, the conflicting lesson 3 de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that risk supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk supervision checklist." },
          { id: "doc3", label: "Keep the risk supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns risk supervision checklist during supervision planning by role, risk, and current policy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision planning by role, risk, and current policy." },
        ],
        feedback: {
          observed: "The photographed risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. The adjacent lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy. The adjacent lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The risk supervision checklist is marked complete even though one required evidence line is blank for supervision planning by role, risk, and current policy, while the lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the risk supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision planning by role, risk, and current policy, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For risk supervision checklist, record the exact visible discrepancy, the conflicting lesson 3 de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "lesson-3-de-identified-visit-record-3-3", label: "lesson 3 de-identified visit record", shortLabel: "lesson 3 de-identified visit", ariaLabel: "Investigate lesson 3 de-identified visit record",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "The photographed lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. The adjacent supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy, while the supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. The adjacent supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy, while the supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume lesson 3 de-identified visit record applies to every role, patient, location, and exception described in supervision planning by role, risk, and current policy. This identify option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision planning by role, risk, and current policy." },
          { id: "i3", label: "Use the oldest available lesson 3 de-identified visit record because prior approval is easier to confirm. This identify option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about lesson 3 de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the lesson 3 de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the lesson 3 de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in lesson 3 de-identified visit record remains unresolved. This decide option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for lesson 3 de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to lesson 3 de-identified visit record. This decide option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision planning by role, risk, and current policy." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For lesson 3 de-identified visit record, record the exact visible discrepancy, the conflicting supervision coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For lesson 3 de-identified visit record, record the exact visible discrepancy, the conflicting supervision coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark lesson 3 de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of lesson 3 de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of lesson 3 de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns lesson 3 de-identified visit record during supervision planning by role, risk, and current policy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision planning by role, risk, and current policy." },
        ],
        feedback: {
          observed: "The photographed lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. The adjacent supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy. The adjacent supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy, while the supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision planning by role, risk, and current policy, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the lesson 3 de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision planning by role, risk, and current policy, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision planning by role, risk, and current policy, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For lesson 3 de-identified visit record, record the exact visible discrepancy, the conflicting supervision coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Field",
    title: "Field observation, record review, and patient feedback",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for field observation, record review, and patient feedback within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-SD-001 (Skilled Nursing Visit Execution), CL-SD-008 (Director of Nursing Monthly Clinical Review), CL-SD-001 (LVN Practice Oversight), HR-TA-005 (4. Policy Statements), CL-SD-008 (4. Policy Statement). These sources are presented as a governed control map rather than pasted policy tables. For field observation, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For record review, confirm that an operational practice does not silently expand beyond its approved scope. For patient feedback, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for field observation, record review, and patient feedback centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to field observation, record review, and patient feedback. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for field observation, record review, and patient feedback should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for field observation, record review, and patient feedback, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Field Supervision Checklist", detail: "The field supervision checklist is marked complete even though one required evidence line is blank. Verify it against the review de-identified visit record and current source before acting." },
      { icon: "🧭", title: "Review De-identified Visit Record", detail: "The review de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the patient coaching note and current source before acting." },
      { icon: "🛡️", title: "Patient Coaching Note", detail: "The patient coaching note has no author, date, or accountable next action. Verify it against the field supervision checklist and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80(h)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "field-supervision-checklist-4-1", label: "field supervision checklist", shortLabel: "field supervision checklist", ariaLabel: "Investigate field supervision checklist",        x: 19, y: 43, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "The photographed field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. The adjacent review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback, while the review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. The adjacent review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback, while the review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat field supervision checklist as complete proof without comparing review de-identified visit record or the controlled source. This identify option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "This omits controlled-source verification or corroboration required for field observation, record review, and patient feedback." },
          { id: "i3", label: "Classify the field supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about field supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the field supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the field supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from field supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for field supervision checklist is resolved." },
          { id: "d3", label: "Send field supervision checklist to an unrelated department rather than the policy owner responsible for field observation, record review, and patient feedback. This decide option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during field observation, record review, and patient feedback." },
        ],
        documentChoices: [
          { id: "doc1", label: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For field supervision checklist, record the exact visible discrepancy, the conflicting review de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For field supervision checklist, record the exact visible discrepancy, the conflicting review de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that field supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of field supervision checklist." },
          { id: "doc3", label: "Keep the field supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns field supervision checklist during field observation, record review, and patient feedback.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for field observation, record review, and patient feedback." },
        ],
        feedback: {
          observed: "The photographed field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. The adjacent review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. The adjacent review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback, while the review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the field supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For field observation, record review, and patient feedback, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For field supervision checklist, record the exact visible discrepancy, the conflicting review de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "review-de-identified-visit-record-4-2", label: "review de-identified visit record", shortLabel: "review de-identified visit", ariaLabel: "Investigate review de-identified visit record",        x: 32, y: 76, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "The photographed review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. The adjacent patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback, while the patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. The adjacent patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback, while the patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume review de-identified visit record applies to every role, patient, location, and exception described in field observation, record review, and patient feedback. This identify option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "This omits controlled-source verification or corroboration required for field observation, record review, and patient feedback." },
          { id: "i3", label: "Use the oldest available review de-identified visit record because prior approval is easier to confirm. This identify option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about review de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in review de-identified visit record remains unresolved. This decide option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for review de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to review de-identified visit record. This decide option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during field observation, record review, and patient feedback." },
        ],
        documentChoices: [
          { id: "doc1", label: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For review de-identified visit record, record the exact visible discrepancy, the conflicting patient coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For review de-identified visit record, record the exact visible discrepancy, the conflicting patient coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark review de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of review de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of review de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns review de-identified visit record during field observation, record review, and patient feedback.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for field observation, record review, and patient feedback." },
        ],
        feedback: {
          observed: "The photographed review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. The adjacent patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. The adjacent patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback, while the patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For field observation, record review, and patient feedback, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For review de-identified visit record, record the exact visible discrepancy, the conflicting patient coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "patient-coaching-note-4-3", label: "patient coaching note", shortLabel: "patient coaching note", ariaLabel: "Investigate patient coaching note",        x: 82, y: 56, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "The photographed patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. The adjacent field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback, while the field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. The adjacent field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback, while the field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read patient coaching note only for favorable indicators and omit the exception evidence connected to field supervision checklist. This identify option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "This omits controlled-source verification or corroboration required for field observation, record review, and patient feedback." },
          { id: "i3", label: "Treat an unsigned or unverified patient coaching note as equivalent to the current controlled record. This identify option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about patient coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close patient coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for patient coaching note is resolved." },
          { id: "d3", label: "Defer the patient coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during field observation, record review, and patient feedback." },
        ],
        documentChoices: [
          { id: "doc1", label: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For patient coaching note, record the exact visible discrepancy, the conflicting field supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For patient coaching note, record the exact visible discrepancy, the conflicting field supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for patient coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient coaching note." },
          { id: "doc3", label: "Combine patient coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient coaching note during field observation, record review, and patient feedback.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for field observation, record review, and patient feedback." },
        ],
        feedback: {
          observed: "The photographed patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. The adjacent field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback. The adjacent field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient coaching note has no author, date, or accountable next action for field observation, record review, and patient feedback, while the field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For field observation, record review, and patient feedback, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For field observation, record review, and patient feedback, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For patient coaching note, record the exact visible discrepancy, the conflicting field supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Coachin",
    title: "Coaching, corrective guidance, and remediation boundaries",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for coaching, corrective guidance, and remediation boundaries within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-TD-003 (Competency Remediation), CL-SD-001 (Escalation and Exception Handling), HR-TA-005 (7. Documentation Requirements), CL-SD-008 (5. Definitions), HR-TD-003 (4. Policy Statements). These sources are presented as a governed control map rather than pasted policy tables. For coaching, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For corrective guidance, confirm that an operational practice does not silently expand beyond its approved scope. For remediation boundaries, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for coaching, corrective guidance, and remediation boundaries centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to coaching, corrective guidance, and remediation boundaries. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for coaching, corrective guidance, and remediation boundaries should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for coaching, corrective guidance, and remediation boundaries, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Coaching De-identified Visit Record", detail: "The coaching de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the corrective coaching note and current source before acting." },
      { icon: "🧭", title: "Corrective Coaching Note", detail: "The corrective coaching note has no author, date, or accountable next action. Verify it against the remediation supervision checklist and current source before acting." },
      { icon: "🛡️", title: "Remediation Supervision Checklist", detail: "The remediation supervision checklist is marked complete even though one required evidence line is blank. Verify it against the coaching de-identified visit record and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "coaching-de-identified-visit-record-5-1", label: "coaching de-identified visit record", shortLabel: "coaching de-identified visit", ariaLabel: "Investigate coaching de-identified visit record",        x: 14, y: 67, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "The photographed coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. The adjacent corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries, while the corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. The adjacent corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries, while the corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume coaching de-identified visit record applies to every role, patient, location, and exception described in coaching, corrective guidance, and remediation boundaries. This identify option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "This omits controlled-source verification or corroboration required for coaching, corrective guidance, and remediation boundaries." },
          { id: "i3", label: "Use the oldest available coaching de-identified visit record because prior approval is easier to confirm. This identify option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about coaching de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the coaching de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the coaching de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in coaching de-identified visit record remains unresolved. This decide option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for coaching de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to coaching de-identified visit record. This decide option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during coaching, corrective guidance, and remediation boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For coaching de-identified visit record, record the exact visible discrepancy, the conflicting corrective coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For coaching de-identified visit record, record the exact visible discrepancy, the conflicting corrective coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark coaching de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of coaching de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of coaching de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns coaching de-identified visit record during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for coaching, corrective guidance, and remediation boundaries." },
        ],
        feedback: {
          observed: "The photographed coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. The adjacent corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. The adjacent corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries, while the corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the coaching de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For coaching, corrective guidance, and remediation boundaries, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For coaching de-identified visit record, record the exact visible discrepancy, the conflicting corrective coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "corrective-coaching-note-5-2", label: "corrective coaching note", shortLabel: "corrective coaching note", ariaLabel: "Investigate corrective coaching note",        x: 37, y: 46, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "The photographed corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. The adjacent remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries, while the remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. The adjacent remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries, while the remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read corrective coaching note only for favorable indicators and omit the exception evidence connected to remediation supervision checklist. This identify option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "This omits controlled-source verification or corroboration required for coaching, corrective guidance, and remediation boundaries." },
          { id: "i3", label: "Treat an unsigned or unverified corrective coaching note as equivalent to the current controlled record. This identify option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about corrective coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close corrective coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for corrective coaching note is resolved." },
          { id: "d3", label: "Defer the corrective coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during coaching, corrective guidance, and remediation boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For corrective coaching note, record the exact visible discrepancy, the conflicting remediation supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For corrective coaching note, record the exact visible discrepancy, the conflicting remediation supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for corrective coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of corrective coaching note." },
          { id: "doc3", label: "Combine corrective coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns corrective coaching note during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for coaching, corrective guidance, and remediation boundaries." },
        ],
        feedback: {
          observed: "The photographed corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. The adjacent remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries. The adjacent remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries, while the remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For coaching, corrective guidance, and remediation boundaries, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For corrective coaching note, record the exact visible discrepancy, the conflicting remediation supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "remediation-supervision-checklist-5-3", label: "remediation supervision checklist", shortLabel: "remediation supervision", ariaLabel: "Investigate remediation supervision checklist",        x: 76, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "The photographed remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. The adjacent coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries, while the coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. The adjacent coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries, while the coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat remediation supervision checklist as complete proof without comparing coaching de-identified visit record or the controlled source. This identify option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "This omits controlled-source verification or corroboration required for coaching, corrective guidance, and remediation boundaries." },
          { id: "i3", label: "Classify the remediation supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about remediation supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the remediation supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the remediation supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from remediation supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for remediation supervision checklist is resolved." },
          { id: "d3", label: "Send remediation supervision checklist to an unrelated department rather than the policy owner responsible for coaching, corrective guidance, and remediation boundaries. This decide option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during coaching, corrective guidance, and remediation boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For remediation supervision checklist, record the exact visible discrepancy, the conflicting coaching de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For remediation supervision checklist, record the exact visible discrepancy, the conflicting coaching de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that remediation supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remediation supervision checklist." },
          { id: "doc3", label: "Keep the remediation supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns remediation supervision checklist during coaching, corrective guidance, and remediation boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for coaching, corrective guidance, and remediation boundaries." },
        ],
        feedback: {
          observed: "The photographed remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. The adjacent coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. The adjacent coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries, while the coaching de-identified visit record shows a completed status while a required patient-specific field is blank for coaching, corrective guidance, and remediation boundaries. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For coaching, corrective guidance, and remediation boundaries, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the remediation supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For coaching, corrective guidance, and remediation boundaries, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For coaching, corrective guidance, and remediation boundaries, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For remediation supervision checklist, record the exact visible discrepancy, the conflicting coaching de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Escalat",
    title: "Escalation of unsafe practice and unresolved performance risk",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for escalation of unsafe practice and unresolved performance risk within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-SD-008 (Escalation and Exception Handling), HR-TA-005 (Escalation and Exception Handling), CL-SD-001 (Escalation and Exception Handling), CL-SD-001 (LVN Practice Oversight), CL-SD-001 (4. Policy Statement). These sources are presented as a governed control map rather than pasted policy tables. For escalation of unsafe practice, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For unresolved performance risk, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for escalation of unsafe practice and unresolved performance risk centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to escalation of unsafe practice and unresolved performance risk. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for escalation of unsafe practice and unresolved performance risk should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for escalation of unsafe practice and unresolved performance risk, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Escalation Coaching Note", detail: "The escalation coaching note has no author, date, or accountable next action. Verify it against the unresolved supervision checklist and current source before acting." },
      { icon: "🧭", title: "Unresolved Supervision Checklist", detail: "The unresolved supervision checklist is marked complete even though one required evidence line is blank. Verify it against the exception de-identified visit record and current source before acting." },
      { icon: "🛡️", title: "Exception De-identified Visit Record", detail: "The exception de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the escalation coaching note and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "escalation-coaching-note-6-1", label: "escalation coaching note", shortLabel: "escalation coaching note", ariaLabel: "Investigate escalation coaching note",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "The photographed escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. The adjacent unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk, while the unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. The adjacent unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk, while the unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read escalation coaching note only for favorable indicators and omit the exception evidence connected to unresolved supervision checklist. This identify option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation of unsafe practice and unresolved performance risk." },
          { id: "i3", label: "Treat an unsigned or unverified escalation coaching note as equivalent to the current controlled record. This identify option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about escalation coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close escalation coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for escalation coaching note is resolved." },
          { id: "d3", label: "Defer the escalation coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation of unsafe practice and unresolved performance risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For escalation coaching note, record the exact visible discrepancy, the conflicting unresolved supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For escalation coaching note, record the exact visible discrepancy, the conflicting unresolved supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for escalation coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of escalation coaching note." },
          { id: "doc3", label: "Combine escalation coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns escalation coaching note during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation of unsafe practice and unresolved performance risk." },
        ],
        feedback: {
          observed: "The photographed escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. The adjacent unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. The adjacent unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk, while the unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation of unsafe practice and unresolved performance risk, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For escalation coaching note, record the exact visible discrepancy, the conflicting unresolved supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "unresolved-supervision-checklist-6-2", label: "unresolved supervision checklist", shortLabel: "unresolved supervision", ariaLabel: "Investigate unresolved supervision checklist",        x: 31, y: 51, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "The photographed unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. The adjacent exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk, while the exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. The adjacent exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk, while the exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat unresolved supervision checklist as complete proof without comparing exception de-identified visit record or the controlled source. This identify option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation of unsafe practice and unresolved performance risk." },
          { id: "i3", label: "Classify the unresolved supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about unresolved supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from unresolved supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for unresolved supervision checklist is resolved." },
          { id: "d3", label: "Send unresolved supervision checklist to an unrelated department rather than the policy owner responsible for escalation of unsafe practice and unresolved performance risk. This decide option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation of unsafe practice and unresolved performance risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For unresolved supervision checklist, record the exact visible discrepancy, the conflicting exception de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For unresolved supervision checklist, record the exact visible discrepancy, the conflicting exception de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that unresolved supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of unresolved supervision checklist." },
          { id: "doc3", label: "Keep the unresolved supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns unresolved supervision checklist during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation of unsafe practice and unresolved performance risk." },
        ],
        feedback: {
          observed: "The photographed unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. The adjacent exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk. The adjacent exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The unresolved supervision checklist is marked complete even though one required evidence line is blank for escalation of unsafe practice and unresolved performance risk, while the exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation of unsafe practice and unresolved performance risk, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For unresolved supervision checklist, record the exact visible discrepancy, the conflicting exception de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "exception-de-identified-visit-record-6-3", label: "exception de-identified visit record", shortLabel: "exception de-identified visit", ariaLabel: "Investigate exception de-identified visit record",        x: 76, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "The photographed exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. The adjacent escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk, while the escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. The adjacent escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk, while the escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume exception de-identified visit record applies to every role, patient, location, and exception described in escalation of unsafe practice and unresolved performance risk. This identify option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation of unsafe practice and unresolved performance risk." },
          { id: "i3", label: "Use the oldest available exception de-identified visit record because prior approval is easier to confirm. This identify option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in exception de-identified visit record remains unresolved. This decide option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to exception de-identified visit record. This decide option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation of unsafe practice and unresolved performance risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception de-identified visit record, record the exact visible discrepancy, the conflicting escalation coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception de-identified visit record, record the exact visible discrepancy, the conflicting escalation coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark exception de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of exception de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns exception de-identified visit record during escalation of unsafe practice and unresolved performance risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation of unsafe practice and unresolved performance risk." },
        ],
        feedback: {
          observed: "The photographed exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. The adjacent escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. The adjacent escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk, while the escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation of unsafe practice and unresolved performance risk, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation of unsafe practice and unresolved performance risk, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation of unsafe practice and unresolved performance risk, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For exception de-identified visit record, record the exact visible discrepancy, the conflicting escalation coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Supervi",
    title: "Supervision evidence, trending, and program evaluation",
    subtitle: "Clinical Supervision Framework",
    narration: [
      "This lesson develops Director of Nursing judgment for supervision evidence, trending, and program evaluation within Clinical Supervision Framework. The leadership objective is a functioning supervision system matched to role, risk, assignment, and patient need. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-TD-003 (Annual Competency Evaluation), HR-TD-003 (Initial Competency Evaluation (During Orientation)), CL-SD-008 (New Employee Clinical Supervision), CL-SD-008 (Ongoing Professional Staff Supervision), CL-SD-008 (LVN, PTA, and COTA Supervision). These sources are presented as a governed control map rather than pasted policy tables. For supervision evidence, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For trending, confirm that an operational practice does not silently expand beyond its approved scope. For program evaluation, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for supervision evidence, trending, and program evaluation centers on assignment, supervisor qualification, direct observation, chart review, patient feedback, coaching, and follow-through. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to supervision evidence, trending, and program evaluation. The safe leadership response is to correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for supervision evidence, trending, and program evaluation should preserve supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for supervision evidence, trending, and program evaluation, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Supervision Checklist", detail: "The supervision checklist is marked complete even though one required evidence line is blank. Verify it against the trending de-identified visit record and current source before acting." },
      { icon: "🧭", title: "Trending De-identified Visit Record", detail: "The trending de-identified visit record shows a completed status while a required patient-specific field is blank. Verify it against the evaluation coaching note and current source before acting." },
      { icon: "🛡️", title: "Evaluation Coaching Note", detail: "The evaluation coaching note has no author, date, or accountable next action. Verify it against the supervision checklist and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "supervision-checklist-7-1", label: "supervision checklist", shortLabel: "supervision checklist", ariaLabel: "Investigate supervision checklist",        x: 15, y: 72, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "The photographed supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. The adjacent trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation, while the trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. The adjacent trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation, while the trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat supervision checklist as complete proof without comparing trending de-identified visit record or the controlled source. This identify option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision evidence, trending, and program evaluation." },
          { id: "i3", label: "Classify the supervision checklist by department custom even though its authority and current status are unverified. This identify option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about supervision checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from supervision checklist alone and seek the authorized owner only after implementation. This decide option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for supervision checklist is resolved." },
          { id: "d3", label: "Send supervision checklist to an unrelated department rather than the policy owner responsible for supervision evidence, trending, and program evaluation. This decide option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision evidence, trending, and program evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision checklist, record the exact visible discrepancy, the conflicting trending de-identified visit record, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision checklist, record the exact visible discrepancy, the conflicting trending de-identified visit record, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that supervision checklist was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of supervision checklist." },
          { id: "doc3", label: "Keep the supervision checklist decision in personal notes rather than the governed evidence location. This document option concerns supervision checklist during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision evidence, trending, and program evaluation." },
        ],
        feedback: {
          observed: "The photographed supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. The adjacent trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. The adjacent trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation, while the trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision checklist discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision evidence, trending, and program evaluation, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For supervision checklist, record the exact visible discrepancy, the conflicting trending de-identified visit record, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "trending-de-identified-visit-record-7-2", label: "trending de-identified visit record", shortLabel: "trending de-identified visit", ariaLabel: "Investigate trending de-identified visit record",        x: 42, y: 65, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "The photographed trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. The adjacent evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation, while the evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. The adjacent evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation, while the evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume trending de-identified visit record applies to every role, patient, location, and exception described in supervision evidence, trending, and program evaluation. This identify option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision evidence, trending, and program evaluation." },
          { id: "i3", label: "Use the oldest available trending de-identified visit record because prior approval is easier to confirm. This identify option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about trending de-identified visit record." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the trending de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the trending de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in trending de-identified visit record remains unresolved. This decide option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for trending de-identified visit record is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to trending de-identified visit record. This decide option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision evidence, trending, and program evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For trending de-identified visit record, record the exact visible discrepancy, the conflicting evaluation coaching note, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For trending de-identified visit record, record the exact visible discrepancy, the conflicting evaluation coaching note, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark trending de-identified visit record closed on assignment, before completion and effectiveness evidence exist. This document option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of trending de-identified visit record." },
          { id: "doc3", label: "Retain only a summary of trending de-identified visit record and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns trending de-identified visit record during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision evidence, trending, and program evaluation." },
        ],
        feedback: {
          observed: "The photographed trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. The adjacent evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. The adjacent evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation, while the evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the trending de-identified visit record discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision evidence, trending, and program evaluation, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For trending de-identified visit record, record the exact visible discrepancy, the conflicting evaluation coaching note, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "evaluation-coaching-note-7-3", label: "evaluation coaching note", shortLabel: "evaluation coaching note", ariaLabel: "Investigate evaluation coaching note",        x: 75, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "The photographed evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. The adjacent supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation, while the supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. The adjacent supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation, while the supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read evaluation coaching note only for favorable indicators and omit the exception evidence connected to supervision checklist. This identify option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for supervision evidence, trending, and program evaluation." },
          { id: "i3", label: "Treat an unsigned or unverified evaluation coaching note as equivalent to the current controlled record. This identify option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about evaluation coaching note." },
        ],
        decideChoices: [
          { id: "d1", label: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evaluation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evaluation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close evaluation coaching note when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for evaluation coaching note is resolved." },
          { id: "d3", label: "Defer the evaluation coaching note decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during supervision evidence, trending, and program evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For evaluation coaching note, record the exact visible discrepancy, the conflicting supervision checklist, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For evaluation coaching note, record the exact visible discrepancy, the conflicting supervision checklist, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for evaluation coaching note but omit the actual evidence, communications, and unresolved items. This document option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of evaluation coaching note." },
          { id: "doc3", label: "Combine evaluation coaching note with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns evaluation coaching note during supervision evidence, trending, and program evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervision evidence, trending, and program evaluation." },
        ],
        feedback: {
          observed: "The photographed evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. The adjacent supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation. The adjacent supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evaluation coaching note has no author, date, or accountable next action for supervision evidence, trending, and program evaluation, while the supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation. Classify this as an unresolved exception involving a functioning supervision system matched to role, risk, assignment, and patient need until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For supervision evidence, trending, and program evaluation, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evaluation coaching note discrepancy, apply the immediate safeguard, use this escalation route: Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For supervision evidence, trending, and program evaluation, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For supervision evidence, trending, and program evaluation, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. For evaluation coaching note, record the exact visible discrepancy, the conflicting supervision checklist, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-SD-008","CL-SD-001","HR-TD-003","HR-TA-005","42 CFR § 484.75","42 CFR § 484.80","42 CFR § 484.115(b)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During clinical supervision governance and accountability, the photographed clinical supervision checklist is marked complete even though one required evidence line is blank for clinical supervision governance and accountability; the accountability de-identified visit record shows a completed status while a required patient-specific field is blank for clinical supervision governance and accountability. Which finding can the Director of Nursing support before authorizing action?",
    options: [
      "Accept the clinical supervision checklist because its visible status appears more recent than the accountability de-identified visit record.",
      "Treat the mismatch between the clinical supervision checklist and accountability de-identified visit record as an unresolved a functioning supervision system matched to role, risk, assignment, and patient need exception; verify the current source, patient impact, and authorized owner.",
      "Average the two artifact statuses and classify clinical supervision governance and accountability as partially complete.",
      "Remove the conflicting accountability de-identified visit record so the file presents one consistent answer.",
    ],
    correct: 1,
    rationale: "The physical evidence conflicts. A supportable classification preserves both artifacts and verifies authority and patient impact before action. Controlled-policy traceability for this lesson includes CL-SD-008.",
  },
  {
    id: 2,
    stem: "During discipline roles, reporting lines, and decision rights, the photographed reporting coaching note has no author, date, or accountable next action for discipline roles, reporting lines, and decision rights; the decision supervision checklist is marked complete even though one required evidence line is blank for discipline roles, reporting lines, and decision rights. What is the safest authorized next action?",
    options: [
      "Transfer the entire decision to the artifact custodian and remove DON follow-through.",
      "For discipline roles, reporting lines, and decision rights, correct unsafe assignment or supervision gaps before relying on routine coaching or retrospective review. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. Apply that response to the reporting coaching note discrepancy and keep the exception visible pending verification.",
      "Continue the affected work and ask the reporting coaching note author to correct it during the next routine review.",
      "Use the decision supervision checklist as authority because it contains fewer blank fields.",
    ],
    correct: 1,
    rationale: "The response addresses the module-specific decision while preserving the discrepancy, accountable ownership, and effectiveness review. Controlled-policy traceability for this lesson includes CL-SD-001.",
  },
  {
    id: 3,
    stem: "During supervision planning by role, risk, and current policy, the photographed lesson 3 de-identified visit record shows a completed status while a required patient-specific field is blank for supervision planning by role, risk, and current policy; the supervision coaching note has no author, date, or accountable next action for supervision planning by role, risk, and current policy. Which escalation creates a closed clinical-leadership loop?",
    options: [
      "Email an unassigned distribution list about the lesson 3 de-identified visit record without requesting a decision or confirmation.",
      "Send only a screenshot of the lesson 3 de-identified visit record and omit the patient impact, safeguard, and unresolved question.",
      "For supervision planning by role, risk, and current policy, escalate through or to the current Administrator, HR, compliance, or the authorized discipline lead when safety or performance risk remains. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
      "Wait for the supervision coaching note owner to notice the conflict, because escalation would duplicate the record.",
    ],
    correct: 2,
    rationale: "The module-specific route identifies what to communicate, who must own the response, and how receipt and follow-through are confirmed. Controlled-policy traceability for this lesson includes HR-TD-003.",
  },
  {
    id: 4,
    stem: "During field observation, record review, and patient feedback, the photographed field supervision checklist is marked complete even though one required evidence line is blank for field observation, record review, and patient feedback; the review de-identified visit record shows a completed status while a required patient-specific field is blank for field observation, record review, and patient feedback. Which entry makes the DON decision reconstructable?",
    options: [
      "Record the planned result for the review de-identified visit record but omit the visible finding, source, owner, and communication.",
      "Mark the issue closed when the correction is assigned, before verification evidence exists.",
      "For field observation, record review, and patient feedback, document supervision purpose, evidence reviewed, observed performance, guidance, restrictions, reassessment, and final status, including unresolved evidence and the next verification point. Identify the conflicting field supervision checklist and review de-identified visit record, rather than recording only a completion status.",
      "Write “reviewed” beside the field supervision checklist and keep the discrepancy in personal notes.",
    ],
    correct: 2,
    rationale: "A qualified reviewer must be able to reconstruct the exact evidence, source, rationale, communication, owner, and final verification. Controlled-policy traceability for this lesson includes HR-TA-005.",
  },
  {
    id: 5,
    stem: "During coaching, corrective guidance, and remediation boundaries, correction of the corrective coaching note is assigned while the photographed corrective coaching note has no author, date, or accountable next action for coaching, corrective guidance, and remediation boundaries; the remediation supervision checklist is marked complete even though one required evidence line is blank for coaching, corrective guidance, and remediation boundaries. What accountability remains with the DON?",
    options: [
      "Treat assignment of the corrective coaching note correction as transfer of all clinical-leadership accountability.",
      "Let the assignee select a different governing source without documenting or escalating the change.",
      "Confirm that the assignee has authority and capacity, monitor patient and operational consequences, escalate the corrective coaching note conflict, and verify the corrected result.",
      "Close the exception when the assignee acknowledges the task, even if the remediation supervision checklist still conflicts.",
    ],
    correct: 2,
    rationale: "Delegating a task does not remove DON accountability for clinical consequences, escalation, and effectiveness verification. Controlled-policy traceability for this lesson includes CL-SD-008.",
  },
  {
    id: 6,
    stem: "During escalation of unsafe practice and unresolved performance risk, the photographed exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk; the escalation coaching note has no author, date, or accountable next action for escalation of unsafe practice and unresolved performance risk. What evidence supports closure?",
    options: [
      "An authorized owner resolves the exception de-identified visit record and escalation coaching note conflict, documents the action and communication, and verifies the intended patient or operational result.",
      "The assigned owner reports being busy but expects the escalation coaching note to be corrected.",
      "The exception de-identified visit record is uploaded to the governed location, even though its discrepancy remains.",
      "A meeting agenda lists the issue without a decision, owner, safeguard, or verification result.",
    ],
    correct: 0,
    rationale: "Closure requires completed action plus objective verification; submission, assignment, or discussion alone is not effectiveness evidence. Controlled-policy traceability for this lesson includes CL-SD-001.",
  },
  {
    id: 7,
    stem: "During supervision evidence, trending, and program evaluation, the photographed supervision checklist is marked complete even though one required evidence line is blank for supervision evidence, trending, and program evaluation; the trending de-identified visit record shows a completed status while a required patient-specific field is blank for supervision evidence, trending, and program evaluation. How should the source conflict be resolved?",
    options: [
      "Choose the supervision checklist because it is easier to read and discard the trending de-identified visit record.",
      "Copy a conclusion from a prior case and omit the current patient and authority evidence.",
      "Use department custom to resolve the conflict without checking the controlled source.",
      "Preserve both artifacts, verify the controlled source and role authority, reconcile patient-specific evidence, document the resolution, and escalate any remaining supervision checklist exception.",
    ],
    correct: 3,
    rationale: "Conflicting physical evidence must remain traceable until current authority, patient-specific facts, ownership, and resolution are documented. Controlled-policy traceability for this lesson includes HR-TD-003.",
  },
  {
    id: 8,
    stem: "A staff member cites 42 CFR § 484.75 to override the patient-specific evidence and controlled workflow in Clinical Supervision Framework. How should the DON respond?",
    options: [
      "Accept the citation label as proof that every local workflow and exception is governed by the same rule.",
      "Replace the patient-specific order and assessment with a remembered summary of the citation.",
      "Verify the external requirement’s current subject and scope, reconcile it with controlled agency policy and patient-specific evidence, and document any conflict before acting.",
      "Apply the citation to roles and circumstances that were not verified within its subject or scope.",
    ],
    correct: 2,
    rationale: "External authority informs practice only after its current scope and controlled implementation are verified; a citation label alone does not resolve the case.",
  },
  {
    id: 9,
    stem: "The discipline de-identified visit record shows a completed status while a required patient-specific field is blank for discipline roles, reporting lines, and decision rights, while the later exception de-identified visit record shows a completed status while a required patient-specific field is blank for escalation of unsafe practice and unresolved performance risk. What connects these distinct findings into defensible DON practice for Clinical Supervision Framework?",
    options: [
      "Preserve both findings; verify controlled authority and patient-specific impact; assign and confirm accountable action; then document effectiveness across the discipline de-identified visit record and exception de-identified visit record.",
      "Close both findings because two different artifacts cannot be evaluated in one leadership evidence chain.",
      "Use the later exception de-identified visit record to overwrite the earlier discipline de-identified visit record without preserving the source conflict.",
      "Treat the discipline de-identified visit record as a training issue and the exception de-identified visit record as another department’s issue, with no shared owner or trend review.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis connects distinct evidence through current authority, clinical reasoning, closed-loop ownership, trend awareness, and verified outcomes.",
  },
  {
    id: 10,
    stem: "After a passing score in Clinical Supervision Framework, a learner asks to perform every discussed activity independently. What does successful completion actually establish?",
    options: [
      "Permission to replace current policies, orders, and role restrictions with the quiz result.",
      "Automatic authority to perform every activity discussed in Clinical Supervision Framework without supervision.",
      "Observed clinical competency even though no authorized evaluator witnessed performance.",
      "Knowledge of the controlled DON concepts in Clinical Supervision Framework; appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate decisions.",
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


const STORAGE_KEY = 'don-003-progress-v6000';

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

export default function DON003() {
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
          <span className="brand-text">DON-003 — Supervision</span>
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
