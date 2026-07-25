/**
 * DON-014 — Adverse Event Management, Incident Reporting & Root Cause Analysis
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
import img01 from './assets/don-014/don-014-lesson-01.png';
import img02 from './assets/don-014/don-014-lesson-02.png';
import img03 from './assets/don-014/don-014-lesson-03.png';
import img04 from './assets/don-014/don-014-lesson-04.png';
import img05 from './assets/don-014/don-014-lesson-05.png';
import img06 from './assets/don-014/don-014-lesson-06.png';
import img07 from './assets/don-014/don-014-lesson-07.png';

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

const MODULE_META = { id: "DON-014", title: "Adverse Event Management, Incident Reporting & Root Cause Analysis", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health DON leadership scene for Adverse events, near misses, and patient-safety governance, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Reporting culture, intake, triage, and immediate protection, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Clinical response, notifications, and evidence preservation, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Investigation methods and root-cause analysis, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Policy-specific external reporting and escalation decisions, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Aggregate trends, QAPI integration, and corrective action, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Closure, effectiveness monitoring, and safety learning, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Adverse",
    title: "Adverse events, near misses, and patient-safety governance",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for adverse events, near misses, and patient-safety governance within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses QA-AE-001 (Adverse Event Classification and Reportable Events), QA-AE-001 (4. Policy Statements), QA-AE-001 (Reporting Procedures), QA-AE-001 (Common Failure Points), QA-AE-001 (5. Definitions). These sources are presented as a governed control map rather than pasted policy tables. For adverse events, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For near misses, confirm that an operational practice does not silently expand beyond its approved scope. For patient-safety governance, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for adverse events, near misses, and patient-safety governance centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to adverse events, near misses, and patient-safety governance. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for adverse events, near misses, and patient-safety governance should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for adverse events, near misses, and patient-safety governance, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Adverse Incident Report", detail: "The adverse incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the near evidence envelope and current source before acting." },
      { icon: "🧭", title: "Near Evidence Envelope", detail: "The near evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the patient-safety root-cause worksheet and current source before acting." },
      { icon: "🛡️", title: "Patient-safety Root-cause Worksheet", detail: "The patient-safety root-cause worksheet contains a correction with no author, date, or reason. Verify it against the adverse incident report and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "adverse-incident-report-1-1", label: "adverse incident report", shortLabel: "adverse incident report", ariaLabel: "Investigate adverse incident report",        x: 27, y: 38, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "The photographed adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. The adjacent near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance, while the near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. The adjacent near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance, while the near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat adverse incident report as complete proof without comparing near evidence envelope or the controlled source. This identify option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for adverse events, near misses, and patient-safety governance." },
          { id: "i3", label: "Classify the adverse incident report by department custom even though its authority and current status are unverified. This identify option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about adverse incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the adverse incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the adverse incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from adverse incident report alone and seek the authorized owner only after implementation. This decide option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for adverse incident report is resolved." },
          { id: "d3", label: "Send adverse incident report to an unrelated department rather than the policy owner responsible for adverse events, near misses, and patient-safety governance. This decide option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during adverse events, near misses, and patient-safety governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For adverse incident report, record the exact visible discrepancy, the conflicting near evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For adverse incident report, record the exact visible discrepancy, the conflicting near evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that adverse incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of adverse incident report." },
          { id: "doc3", label: "Keep the adverse incident report decision in personal notes rather than the governed evidence location. This document option concerns adverse incident report during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for adverse events, near misses, and patient-safety governance." },
        ],
        feedback: {
          observed: "The photographed adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. The adjacent near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. The adjacent near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance, while the near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the adverse incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For adverse events, near misses, and patient-safety governance, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For adverse incident report, record the exact visible discrepancy, the conflicting near evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "near-evidence-envelope-1-2", label: "near evidence envelope", shortLabel: "near evidence envelope", ariaLabel: "Investigate near evidence envelope",        x: 32, y: 66, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "The photographed near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. The adjacent patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance, while the patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. The adjacent patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance, while the patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume near evidence envelope applies to every role, patient, location, and exception described in adverse events, near misses, and patient-safety governance. This identify option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for adverse events, near misses, and patient-safety governance." },
          { id: "i3", label: "Use the oldest available near evidence envelope because prior approval is easier to confirm. This identify option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about near evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the near evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the near evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in near evidence envelope remains unresolved. This decide option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for near evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to near evidence envelope. This decide option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during adverse events, near misses, and patient-safety governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For near evidence envelope, record the exact visible discrepancy, the conflicting patient-safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For near evidence envelope, record the exact visible discrepancy, the conflicting patient-safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark near evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of near evidence envelope." },
          { id: "doc3", label: "Retain only a summary of near evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns near evidence envelope during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for adverse events, near misses, and patient-safety governance." },
        ],
        feedback: {
          observed: "The photographed near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. The adjacent patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. The adjacent patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance, while the patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the near evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For adverse events, near misses, and patient-safety governance, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For near evidence envelope, record the exact visible discrepancy, the conflicting patient-safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "patient-safety-root-cause-worksheet-1-3", label: "patient-safety root-cause worksheet", shortLabel: "patient-safety root-cause", ariaLabel: "Investigate patient-safety root-cause worksheet",        x: 81, y: 64, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "The photographed patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. The adjacent adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance, while the adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. The adjacent adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance, while the adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read patient-safety root-cause worksheet only for favorable indicators and omit the exception evidence connected to adverse incident report. This identify option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for adverse events, near misses, and patient-safety governance." },
          { id: "i3", label: "Treat an unsigned or unverified patient-safety root-cause worksheet as equivalent to the current controlled record. This identify option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about patient-safety root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close patient-safety root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for patient-safety root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the patient-safety root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during adverse events, near misses, and patient-safety governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For patient-safety root-cause worksheet, record the exact visible discrepancy, the conflicting adverse incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For patient-safety root-cause worksheet, record the exact visible discrepancy, the conflicting adverse incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for patient-safety root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-safety root-cause worksheet." },
          { id: "doc3", label: "Combine patient-safety root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-safety root-cause worksheet during adverse events, near misses, and patient-safety governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for adverse events, near misses, and patient-safety governance." },
        ],
        feedback: {
          observed: "The photographed patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. The adjacent adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance. The adjacent adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient-safety root-cause worksheet contains a correction with no author, date, or reason for adverse events, near misses, and patient-safety governance, while the adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For adverse events, near misses, and patient-safety governance, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For adverse events, near misses, and patient-safety governance, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For adverse events, near misses, and patient-safety governance, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For patient-safety root-cause worksheet, record the exact visible discrepancy, the conflicting adverse incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Reporti",
    title: "Reporting culture, intake, triage, and immediate protection",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for reporting culture, intake, triage, and immediate protection within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses QA-AE-001 (External Reporting), RM-ER-002 (Immediate Response), QA-AE-001 (Non-Punitive Reporting Culture), QA-AE-004 (Safety Culture Promotion), RM-ER-002 (Mandatory External Reporting). These sources are presented as a governed control map rather than pasted policy tables. For reporting culture, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For intake, confirm that an operational practice does not silently expand beyond its approved scope. For triage, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for reporting culture, intake, triage, and immediate protection centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to reporting culture, intake, triage, and immediate protection. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for reporting culture, intake, triage, and immediate protection should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for reporting culture, intake, triage, and immediate protection, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Reporting Evidence Envelope", detail: "The reporting evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the intake root-cause worksheet and current source before acting." },
      { icon: "🧭", title: "Intake Root-cause Worksheet", detail: "The intake root-cause worksheet contains a correction with no author, date, or reason. Verify it against the triage incident report and current source before acting." },
      { icon: "🛡️", title: "Triage Incident Report", detail: "The triage incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the reporting evidence envelope and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.70" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "reporting-evidence-envelope-2-1", label: "reporting evidence envelope", shortLabel: "reporting evidence envelope", ariaLabel: "Investigate reporting evidence envelope",        x: 14, y: 56, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "The photographed reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. The adjacent intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection, while the intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. The adjacent intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection, while the intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume reporting evidence envelope applies to every role, patient, location, and exception described in reporting culture, intake, triage, and immediate protection. This identify option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "This omits controlled-source verification or corroboration required for reporting culture, intake, triage, and immediate protection." },
          { id: "i3", label: "Use the oldest available reporting evidence envelope because prior approval is easier to confirm. This identify option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about reporting evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in reporting evidence envelope remains unresolved. This decide option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for reporting evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to reporting evidence envelope. This decide option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during reporting culture, intake, triage, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For reporting evidence envelope, record the exact visible discrepancy, the conflicting intake root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For reporting evidence envelope, record the exact visible discrepancy, the conflicting intake root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark reporting evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reporting evidence envelope." },
          { id: "doc3", label: "Retain only a summary of reporting evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns reporting evidence envelope during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reporting culture, intake, triage, and immediate protection." },
        ],
        feedback: {
          observed: "The photographed reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. The adjacent intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. The adjacent intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection, while the intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For reporting culture, intake, triage, and immediate protection, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For reporting evidence envelope, record the exact visible discrepancy, the conflicting intake root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "intake-root-cause-worksheet-2-2", label: "intake root-cause worksheet", shortLabel: "intake root-cause worksheet", ariaLabel: "Investigate intake root-cause worksheet",        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "The photographed intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. The adjacent triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection, while the triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. The adjacent triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection, while the triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read intake root-cause worksheet only for favorable indicators and omit the exception evidence connected to triage incident report. This identify option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "This omits controlled-source verification or corroboration required for reporting culture, intake, triage, and immediate protection." },
          { id: "i3", label: "Treat an unsigned or unverified intake root-cause worksheet as equivalent to the current controlled record. This identify option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about intake root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the intake root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the intake root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close intake root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for intake root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the intake root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during reporting culture, intake, triage, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For intake root-cause worksheet, record the exact visible discrepancy, the conflicting triage incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For intake root-cause worksheet, record the exact visible discrepancy, the conflicting triage incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for intake root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of intake root-cause worksheet." },
          { id: "doc3", label: "Combine intake root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns intake root-cause worksheet during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reporting culture, intake, triage, and immediate protection." },
        ],
        feedback: {
          observed: "The photographed intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. The adjacent triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection. The adjacent triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection, while the triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the intake root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For reporting culture, intake, triage, and immediate protection, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For intake root-cause worksheet, record the exact visible discrepancy, the conflicting triage incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "triage-incident-report-2-3", label: "triage incident report", shortLabel: "triage incident report", ariaLabel: "Investigate triage incident report",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "The photographed triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. The adjacent reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection, while the reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. The adjacent reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection, while the reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat triage incident report as complete proof without comparing reporting evidence envelope or the controlled source. This identify option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "This omits controlled-source verification or corroboration required for reporting culture, intake, triage, and immediate protection." },
          { id: "i3", label: "Classify the triage incident report by department custom even though its authority and current status are unverified. This identify option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about triage incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the triage incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the triage incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from triage incident report alone and seek the authorized owner only after implementation. This decide option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for triage incident report is resolved." },
          { id: "d3", label: "Send triage incident report to an unrelated department rather than the policy owner responsible for reporting culture, intake, triage, and immediate protection. This decide option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during reporting culture, intake, triage, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For triage incident report, record the exact visible discrepancy, the conflicting reporting evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For triage incident report, record the exact visible discrepancy, the conflicting reporting evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that triage incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of triage incident report." },
          { id: "doc3", label: "Keep the triage incident report decision in personal notes rather than the governed evidence location. This document option concerns triage incident report during reporting culture, intake, triage, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reporting culture, intake, triage, and immediate protection." },
        ],
        feedback: {
          observed: "The photographed triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. The adjacent reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. The adjacent reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection, while the reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the triage incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For reporting culture, intake, triage, and immediate protection, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For reporting culture, intake, triage, and immediate protection, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For triage incident report, record the exact visible discrepancy, the conflicting reporting evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Clinica",
    title: "Clinical response, notifications, and evidence preservation",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for clinical response, notifications, and evidence preservation within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses RM-ER-005 (7. Compliance Monitoring and Measurement), QA-AE-001 (Reporting Procedures), RM-ER-002 (5. Procedures), RM-ER-002 (Immediate Response), RM-ER-002 (9. Training Requirements). These sources are presented as a governed control map rather than pasted policy tables. For clinical response, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For notifications, confirm that an operational practice does not silently expand beyond its approved scope. For evidence preservation, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for clinical response, notifications, and evidence preservation centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to clinical response, notifications, and evidence preservation. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for clinical response, notifications, and evidence preservation should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for clinical response, notifications, and evidence preservation, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Clinical Root-cause Worksheet", detail: "The clinical root-cause worksheet contains a correction with no author, date, or reason. Verify it against the notifications incident report and current source before acting." },
      { icon: "🧭", title: "Notifications Incident Report", detail: "The notifications incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the evidence envelope and current source before acting." },
      { icon: "🛡️", title: "Evidence Envelope", detail: "The evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the clinical root-cause worksheet and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR § 484.70" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "clinical-root-cause-worksheet-3-1", label: "clinical root-cause worksheet", shortLabel: "clinical root-cause worksheet", ariaLabel: "Investigate clinical root-cause worksheet",        x: 14, y: 59, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "The photographed clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. The adjacent notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation, while the notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. The adjacent notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation, while the notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read clinical root-cause worksheet only for favorable indicators and omit the exception evidence connected to notifications incident report. This identify option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical response, notifications, and evidence preservation." },
          { id: "i3", label: "Treat an unsigned or unverified clinical root-cause worksheet as equivalent to the current controlled record. This identify option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close clinical root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the clinical root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical response, notifications, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For clinical root-cause worksheet, record the exact visible discrepancy, the conflicting notifications incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For clinical root-cause worksheet, record the exact visible discrepancy, the conflicting notifications incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for clinical root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical root-cause worksheet." },
          { id: "doc3", label: "Combine clinical root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns clinical root-cause worksheet during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical response, notifications, and evidence preservation." },
        ],
        feedback: {
          observed: "The photographed clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. The adjacent notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. The adjacent notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation, while the notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical response, notifications, and evidence preservation, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For clinical root-cause worksheet, record the exact visible discrepancy, the conflicting notifications incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "notifications-incident-report-3-2", label: "notifications incident report", shortLabel: "notifications incident report", ariaLabel: "Investigate notifications incident report",        x: 41, y: 70, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "The photographed notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. The adjacent evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation, while the evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. The adjacent evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation, while the evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat notifications incident report as complete proof without comparing evidence envelope or the controlled source. This identify option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical response, notifications, and evidence preservation." },
          { id: "i3", label: "Classify the notifications incident report by department custom even though its authority and current status are unverified. This identify option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about notifications incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the notifications incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the notifications incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from notifications incident report alone and seek the authorized owner only after implementation. This decide option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for notifications incident report is resolved." },
          { id: "d3", label: "Send notifications incident report to an unrelated department rather than the policy owner responsible for clinical response, notifications, and evidence preservation. This decide option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical response, notifications, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For notifications incident report, record the exact visible discrepancy, the conflicting evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For notifications incident report, record the exact visible discrepancy, the conflicting evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that notifications incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of notifications incident report." },
          { id: "doc3", label: "Keep the notifications incident report decision in personal notes rather than the governed evidence location. This document option concerns notifications incident report during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical response, notifications, and evidence preservation." },
        ],
        feedback: {
          observed: "The photographed notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. The adjacent evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation. The adjacent evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The notifications incident report summarizes compliance while an attachment documents an unresolved exception for clinical response, notifications, and evidence preservation, while the evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the notifications incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical response, notifications, and evidence preservation, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For notifications incident report, record the exact visible discrepancy, the conflicting evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "evidence-envelope-3-3", label: "evidence envelope", shortLabel: "evidence envelope", ariaLabel: "Investigate evidence envelope",        x: 81, y: 46, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "The photographed evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. The adjacent clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation, while the clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. The adjacent clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation, while the clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume evidence envelope applies to every role, patient, location, and exception described in clinical response, notifications, and evidence preservation. This identify option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical response, notifications, and evidence preservation." },
          { id: "i3", label: "Use the oldest available evidence envelope because prior approval is easier to confirm. This identify option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in evidence envelope remains unresolved. This decide option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to evidence envelope. This decide option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical response, notifications, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For evidence envelope, record the exact visible discrepancy, the conflicting clinical root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For evidence envelope, record the exact visible discrepancy, the conflicting clinical root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of evidence envelope." },
          { id: "doc3", label: "Retain only a summary of evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns evidence envelope during clinical response, notifications, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical response, notifications, and evidence preservation." },
        ],
        feedback: {
          observed: "The photographed evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. The adjacent clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation. The adjacent clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation, while the clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical response, notifications, and evidence preservation, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical response, notifications, and evidence preservation, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical response, notifications, and evidence preservation, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For evidence envelope, record the exact visible discrepancy, the conflicting clinical root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Investi",
    title: "Investigation methods and root-cause analysis",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for investigation methods and root-cause analysis within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses RM-ER-002 (Investigation Process), QA-AE-001 (Investigation and Analysis), QA-AE-002 (RCA Investigation Methodology), RM-ER-005 (Trending Analysis), RM-ER-002 (Trending and Analysis). These sources are presented as a governed control map rather than pasted policy tables. For investigation methods, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For root-cause analysis, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for investigation methods and root-cause analysis centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to investigation methods and root-cause analysis. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for investigation methods and root-cause analysis should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for investigation methods and root-cause analysis, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Investigation Incident Report", detail: "The investigation incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the root-cause evidence envelope and current source before acting." },
      { icon: "🧭", title: "Root-cause Evidence Envelope", detail: "The root-cause evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the exception root-cause worksheet and current source before acting." },
      { icon: "🛡️", title: "Exception Root-cause Worksheet", detail: "The exception root-cause worksheet contains a correction with no author, date, or reason. Verify it against the investigation incident report and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "investigation-incident-report-4-1", label: "investigation incident report", shortLabel: "investigation incident report", ariaLabel: "Investigate investigation incident report",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "The photographed investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. The adjacent root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis, while the root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. The adjacent root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis, while the root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat investigation incident report as complete proof without comparing root-cause evidence envelope or the controlled source. This identify option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for investigation methods and root-cause analysis." },
          { id: "i3", label: "Classify the investigation incident report by department custom even though its authority and current status are unverified. This identify option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about investigation incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the investigation incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the investigation incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from investigation incident report alone and seek the authorized owner only after implementation. This decide option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for investigation incident report is resolved." },
          { id: "d3", label: "Send investigation incident report to an unrelated department rather than the policy owner responsible for investigation methods and root-cause analysis. This decide option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during investigation methods and root-cause analysis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For investigation incident report, record the exact visible discrepancy, the conflicting root-cause evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For investigation incident report, record the exact visible discrepancy, the conflicting root-cause evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that investigation incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of investigation incident report." },
          { id: "doc3", label: "Keep the investigation incident report decision in personal notes rather than the governed evidence location. This document option concerns investigation incident report during investigation methods and root-cause analysis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for investigation methods and root-cause analysis." },
        ],
        feedback: {
          observed: "The photographed investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. The adjacent root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. The adjacent root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis, while the root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the investigation incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For investigation methods and root-cause analysis, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For investigation incident report, record the exact visible discrepancy, the conflicting root-cause evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "root-cause-evidence-envelope-4-2", label: "root-cause evidence envelope", shortLabel: "root-cause evidence envelope", ariaLabel: "Investigate root-cause evidence envelope",        x: 36, y: 49, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "The photographed root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. The adjacent exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis, while the exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. The adjacent exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis, while the exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume root-cause evidence envelope applies to every role, patient, location, and exception described in investigation methods and root-cause analysis. This identify option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for investigation methods and root-cause analysis." },
          { id: "i3", label: "Use the oldest available root-cause evidence envelope because prior approval is easier to confirm. This identify option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about root-cause evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the root-cause evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the root-cause evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in root-cause evidence envelope remains unresolved. This decide option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for root-cause evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to root-cause evidence envelope. This decide option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during investigation methods and root-cause analysis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For root-cause evidence envelope, record the exact visible discrepancy, the conflicting exception root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For root-cause evidence envelope, record the exact visible discrepancy, the conflicting exception root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark root-cause evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of root-cause evidence envelope." },
          { id: "doc3", label: "Retain only a summary of root-cause evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns root-cause evidence envelope during investigation methods and root-cause analysis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for investigation methods and root-cause analysis." },
        ],
        feedback: {
          observed: "The photographed root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. The adjacent exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. The adjacent exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis, while the exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the root-cause evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For investigation methods and root-cause analysis, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For root-cause evidence envelope, record the exact visible discrepancy, the conflicting exception root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "exception-root-cause-worksheet-4-3", label: "exception root-cause worksheet", shortLabel: "exception root-cause worksheet", ariaLabel: "Investigate exception root-cause worksheet",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "The photographed exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. The adjacent investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis, while the investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. The adjacent investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis, while the investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception root-cause worksheet only for favorable indicators and omit the exception evidence connected to investigation incident report. This identify option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for investigation methods and root-cause analysis." },
          { id: "i3", label: "Treat an unsigned or unverified exception root-cause worksheet as equivalent to the current controlled record. This identify option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the exception root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during investigation methods and root-cause analysis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception root-cause worksheet, record the exact visible discrepancy, the conflicting investigation incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception root-cause worksheet, record the exact visible discrepancy, the conflicting investigation incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception root-cause worksheet." },
          { id: "doc3", label: "Combine exception root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception root-cause worksheet during investigation methods and root-cause analysis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for investigation methods and root-cause analysis." },
        ],
        feedback: {
          observed: "The photographed exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. The adjacent investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis. The adjacent investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception root-cause worksheet contains a correction with no author, date, or reason for investigation methods and root-cause analysis, while the investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For investigation methods and root-cause analysis, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For investigation methods and root-cause analysis, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception root-cause worksheet, record the exact visible discrepancy, the conflicting investigation incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Policy-",
    title: "Policy-specific external reporting and escalation decisions",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for policy-specific external reporting and escalation decisions within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses QA-AE-001 (External Reporting), RM-ER-002 (Mandatory External Reporting), QA-AE-001 (Non-Punitive Reporting Culture), QA-AE-001 (Escalation and Exception Handling), QA-PI-001 (Escalation and Exception Handling). These sources are presented as a governed control map rather than pasted policy tables. For policy-specific external reporting, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For escalation decisions, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for policy-specific external reporting and escalation decisions centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to policy-specific external reporting and escalation decisions. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for policy-specific external reporting and escalation decisions should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for policy-specific external reporting and escalation decisions, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Policy-specific Evidence Envelope", detail: "The policy-specific evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the escalation root-cause worksheet and current source before acting." },
      { icon: "🧭", title: "Escalation Root-cause Worksheet", detail: "The escalation root-cause worksheet contains a correction with no author, date, or reason. Verify it against the exception incident report and current source before acting." },
      { icon: "🛡️", title: "Exception Incident Report", detail: "The exception incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the policy-specific evidence envelope and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.65(d)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "policy-specific-evidence-envelope-5-1", label: "policy-specific evidence envelope", shortLabel: "policy-specific evidence", ariaLabel: "Investigate policy-specific evidence envelope",        x: 14, y: 47, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "The photographed policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. The adjacent escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions, while the escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. The adjacent escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions, while the escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume policy-specific evidence envelope applies to every role, patient, location, and exception described in policy-specific external reporting and escalation decisions. This identify option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "This omits controlled-source verification or corroboration required for policy-specific external reporting and escalation decisions." },
          { id: "i3", label: "Use the oldest available policy-specific evidence envelope because prior approval is easier to confirm. This identify option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about policy-specific evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the policy-specific evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the policy-specific evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in policy-specific evidence envelope remains unresolved. This decide option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for policy-specific evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to policy-specific evidence envelope. This decide option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during policy-specific external reporting and escalation decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For policy-specific evidence envelope, record the exact visible discrepancy, the conflicting escalation root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For policy-specific evidence envelope, record the exact visible discrepancy, the conflicting escalation root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark policy-specific evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of policy-specific evidence envelope." },
          { id: "doc3", label: "Retain only a summary of policy-specific evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns policy-specific evidence envelope during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for policy-specific external reporting and escalation decisions." },
        ],
        feedback: {
          observed: "The photographed policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. The adjacent escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. The adjacent escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions, while the escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the policy-specific evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For policy-specific external reporting and escalation decisions, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For policy-specific evidence envelope, record the exact visible discrepancy, the conflicting escalation root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "escalation-root-cause-worksheet-5-2", label: "escalation root-cause worksheet", shortLabel: "escalation root-cause", ariaLabel: "Investigate escalation root-cause worksheet",        x: 44, y: 71, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "The photographed escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. The adjacent exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions, while the exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. The adjacent exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions, while the exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read escalation root-cause worksheet only for favorable indicators and omit the exception evidence connected to exception incident report. This identify option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "This omits controlled-source verification or corroboration required for policy-specific external reporting and escalation decisions." },
          { id: "i3", label: "Treat an unsigned or unverified escalation root-cause worksheet as equivalent to the current controlled record. This identify option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about escalation root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close escalation root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for escalation root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the escalation root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during policy-specific external reporting and escalation decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For escalation root-cause worksheet, record the exact visible discrepancy, the conflicting exception incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For escalation root-cause worksheet, record the exact visible discrepancy, the conflicting exception incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for escalation root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of escalation root-cause worksheet." },
          { id: "doc3", label: "Combine escalation root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns escalation root-cause worksheet during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for policy-specific external reporting and escalation decisions." },
        ],
        feedback: {
          observed: "The photographed escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. The adjacent exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions. The adjacent exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions, while the exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For policy-specific external reporting and escalation decisions, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For escalation root-cause worksheet, record the exact visible discrepancy, the conflicting exception incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "exception-incident-report-5-3", label: "exception incident report", shortLabel: "exception incident report", ariaLabel: "Investigate exception incident report",        x: 85, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "The photographed exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. The adjacent policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions, while the policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. The adjacent policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions, while the policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat exception incident report as complete proof without comparing policy-specific evidence envelope or the controlled source. This identify option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "This omits controlled-source verification or corroboration required for policy-specific external reporting and escalation decisions." },
          { id: "i3", label: "Classify the exception incident report by department custom even though its authority and current status are unverified. This identify option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from exception incident report alone and seek the authorized owner only after implementation. This decide option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception incident report is resolved." },
          { id: "d3", label: "Send exception incident report to an unrelated department rather than the policy owner responsible for policy-specific external reporting and escalation decisions. This decide option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during policy-specific external reporting and escalation decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception incident report, record the exact visible discrepancy, the conflicting policy-specific evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception incident report, record the exact visible discrepancy, the conflicting policy-specific evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that exception incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception incident report." },
          { id: "doc3", label: "Keep the exception incident report decision in personal notes rather than the governed evidence location. This document option concerns exception incident report during policy-specific external reporting and escalation decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for policy-specific external reporting and escalation decisions." },
        ],
        feedback: {
          observed: "The photographed exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. The adjacent policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. The adjacent policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions, while the policy-specific evidence envelope has a chain-of-custody line with no receiving signature for policy-specific external reporting and escalation decisions. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For policy-specific external reporting and escalation decisions, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For policy-specific external reporting and escalation decisions, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For policy-specific external reporting and escalation decisions, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For exception incident report, record the exact visible discrepancy, the conflicting policy-specific evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Aggrega",
    title: "Aggregate trends, QAPI integration, and corrective action",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for aggregate trends, QAPI integration, and corrective action within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses RM-ER-002 (Corrective Action and Follow-Up), QA-AE-002 (Corrective Action Development and Tracking), QA-AE-001 (Trending and QAPI Integration), QA-AE-004 (Integration with QAPI and Governing Body Reporting), QA-AE-004 (7. Documentation Requirements). These sources are presented as a governed control map rather than pasted policy tables. For aggregate trends, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For QAPI integration, confirm that an operational practice does not silently expand beyond its approved scope. For corrective action, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for aggregate trends, QAPI integration, and corrective action centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to aggregate trends, QAPI integration, and corrective action. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for aggregate trends, QAPI integration, and corrective action should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for aggregate trends, QAPI integration, and corrective action, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Aggregate Root-cause Worksheet", detail: "The aggregate root-cause worksheet contains a correction with no author, date, or reason. Verify it against the QAPI incident report and current source before acting." },
      { icon: "🧭", title: "QAPI Incident Report", detail: "The QAPI incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the corrective evidence envelope and current source before acting." },
      { icon: "🛡️", title: "Corrective Evidence Envelope", detail: "The corrective evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the aggregate root-cause worksheet and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR §484.65(d)" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "aggregate-root-cause-worksheet-6-1", label: "aggregate root-cause worksheet", shortLabel: "aggregate root-cause worksheet", ariaLabel: "Investigate aggregate root-cause worksheet",        x: 22, y: 70, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "The photographed aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. The adjacent QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action, while the QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. The adjacent QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action, while the QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read aggregate root-cause worksheet only for favorable indicators and omit the exception evidence connected to QAPI incident report. This identify option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "This omits controlled-source verification or corroboration required for aggregate trends, QAPI integration, and corrective action." },
          { id: "i3", label: "Treat an unsigned or unverified aggregate root-cause worksheet as equivalent to the current controlled record. This identify option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about aggregate root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the aggregate root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the aggregate root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close aggregate root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for aggregate root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the aggregate root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during aggregate trends, QAPI integration, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For aggregate root-cause worksheet, record the exact visible discrepancy, the conflicting QAPI incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For aggregate root-cause worksheet, record the exact visible discrepancy, the conflicting QAPI incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for aggregate root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of aggregate root-cause worksheet." },
          { id: "doc3", label: "Combine aggregate root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns aggregate root-cause worksheet during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aggregate trends, QAPI integration, and corrective action." },
        ],
        feedback: {
          observed: "The photographed aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. The adjacent QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. The adjacent QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action, while the QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the aggregate root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For aggregate trends, QAPI integration, and corrective action, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For aggregate root-cause worksheet, record the exact visible discrepancy, the conflicting QAPI incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "qapi-incident-report-6-2", label: "QAPI incident report", shortLabel: "QAPI incident report", ariaLabel: "Investigate QAPI incident report",        x: 40, y: 38, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "The photographed QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. The adjacent corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action, while the corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. The adjacent corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action, while the corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat QAPI incident report as complete proof without comparing corrective evidence envelope or the controlled source. This identify option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "This omits controlled-source verification or corroboration required for aggregate trends, QAPI integration, and corrective action." },
          { id: "i3", label: "Classify the QAPI incident report by department custom even though its authority and current status are unverified. This identify option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about QAPI incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the QAPI incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the QAPI incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from QAPI incident report alone and seek the authorized owner only after implementation. This decide option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for QAPI incident report is resolved." },
          { id: "d3", label: "Send QAPI incident report to an unrelated department rather than the policy owner responsible for aggregate trends, QAPI integration, and corrective action. This decide option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during aggregate trends, QAPI integration, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For QAPI incident report, record the exact visible discrepancy, the conflicting corrective evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For QAPI incident report, record the exact visible discrepancy, the conflicting corrective evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that QAPI incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of QAPI incident report." },
          { id: "doc3", label: "Keep the QAPI incident report decision in personal notes rather than the governed evidence location. This document option concerns QAPI incident report during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aggregate trends, QAPI integration, and corrective action." },
        ],
        feedback: {
          observed: "The photographed QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. The adjacent corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action. The adjacent corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The QAPI incident report summarizes compliance while an attachment documents an unresolved exception for aggregate trends, QAPI integration, and corrective action, while the corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the QAPI incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For aggregate trends, QAPI integration, and corrective action, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For QAPI incident report, record the exact visible discrepancy, the conflicting corrective evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "corrective-evidence-envelope-6-3", label: "corrective evidence envelope", shortLabel: "corrective evidence envelope", ariaLabel: "Investigate corrective evidence envelope",        x: 81, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "The photographed corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. The adjacent aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action, while the aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. The adjacent aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action, while the aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume corrective evidence envelope applies to every role, patient, location, and exception described in aggregate trends, QAPI integration, and corrective action. This identify option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "This omits controlled-source verification or corroboration required for aggregate trends, QAPI integration, and corrective action." },
          { id: "i3", label: "Use the oldest available corrective evidence envelope because prior approval is easier to confirm. This identify option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about corrective evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in corrective evidence envelope remains unresolved. This decide option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for corrective evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to corrective evidence envelope. This decide option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during aggregate trends, QAPI integration, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For corrective evidence envelope, record the exact visible discrepancy, the conflicting aggregate root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For corrective evidence envelope, record the exact visible discrepancy, the conflicting aggregate root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark corrective evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of corrective evidence envelope." },
          { id: "doc3", label: "Retain only a summary of corrective evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns corrective evidence envelope during aggregate trends, QAPI integration, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aggregate trends, QAPI integration, and corrective action." },
        ],
        feedback: {
          observed: "The photographed corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. The adjacent aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. The adjacent aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action, while the aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For aggregate trends, QAPI integration, and corrective action, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For aggregate trends, QAPI integration, and corrective action, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For aggregate trends, QAPI integration, and corrective action, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For corrective evidence envelope, record the exact visible discrepancy, the conflicting aggregate root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Closure",
    title: "Closure, effectiveness monitoring, and safety learning",
    subtitle: "Adverse Event Management, Incident Reporting & Root Cause Analysis",
    narration: [
      "This lesson develops Director of Nursing judgment for closure, effectiveness monitoring, and safety learning within Adverse Event Management, Incident Reporting & Root Cause Analysis. The leadership objective is a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses QA-AE-004 (Safety Culture Promotion), QA-AE-003 (Monitoring and Effectiveness Verification), QA-AE-004 (Standing Patient Safety Focus Areas), QA-AE-004 (Patient Safety Program Structure), QA-AE-004 (Proactive Safety Assessments). These sources are presented as a governed control map rather than pasted policy tables. For closure, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For effectiveness monitoring, confirm that an operational practice does not silently expand beyond its approved scope. For safety learning, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for closure, effectiveness monitoring, and safety learning centers on event facts, immediate patient status, notifications, evidence, contributing factors, reporting pathway, corrective action, and outcome. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to closure, effectiveness monitoring, and safety learning. The safe leadership response is to protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for closure, effectiveness monitoring, and safety learning should preserve event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for closure, effectiveness monitoring, and safety learning, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Closure Incident Report", detail: "The closure incident report summarizes compliance while an attachment documents an unresolved exception. Verify it against the effectiveness evidence envelope and current source before acting." },
      { icon: "🧭", title: "Effectiveness Evidence Envelope", detail: "The effectiveness evidence envelope has a chain-of-custody line with no receiving signature. Verify it against the safety root-cause worksheet and current source before acting." },
      { icon: "🛡️", title: "Safety Root-cause Worksheet", detail: "The safety root-cause worksheet contains a correction with no author, date, or reason. Verify it against the closure incident report and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-002" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "QA-AE-004" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "closure-incident-report-7-1", label: "closure incident report", shortLabel: "closure incident report", ariaLabel: "Investigate closure incident report",        x: 18, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "The photographed closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. The adjacent effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning, while the effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. The adjacent effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning, while the effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat closure incident report as complete proof without comparing effectiveness evidence envelope or the controlled source. This identify option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for closure, effectiveness monitoring, and safety learning." },
          { id: "i3", label: "Classify the closure incident report by department custom even though its authority and current status are unverified. This identify option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about closure incident report." },
        ],
        decideChoices: [
          { id: "d1", label: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the closure incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the closure incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from closure incident report alone and seek the authorized owner only after implementation. This decide option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for closure incident report is resolved." },
          { id: "d3", label: "Send closure incident report to an unrelated department rather than the policy owner responsible for closure, effectiveness monitoring, and safety learning. This decide option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during closure, effectiveness monitoring, and safety learning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For closure incident report, record the exact visible discrepancy, the conflicting effectiveness evidence envelope, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For closure incident report, record the exact visible discrepancy, the conflicting effectiveness evidence envelope, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that closure incident report was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closure incident report." },
          { id: "doc3", label: "Keep the closure incident report decision in personal notes rather than the governed evidence location. This document option concerns closure incident report during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for closure, effectiveness monitoring, and safety learning." },
        ],
        feedback: {
          observed: "The photographed closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. The adjacent effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. The adjacent effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning, while the effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the closure incident report discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For closure, effectiveness monitoring, and safety learning, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For closure incident report, record the exact visible discrepancy, the conflicting effectiveness evidence envelope, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "effectiveness-evidence-envelope-7-2", label: "effectiveness evidence envelope", shortLabel: "effectiveness evidence", ariaLabel: "Investigate effectiveness evidence envelope",        x: 53, y: 72, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "The photographed effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. The adjacent safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning, while the safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. The adjacent safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning, while the safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume effectiveness evidence envelope applies to every role, patient, location, and exception described in closure, effectiveness monitoring, and safety learning. This identify option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for closure, effectiveness monitoring, and safety learning." },
          { id: "i3", label: "Use the oldest available effectiveness evidence envelope because prior approval is easier to confirm. This identify option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about effectiveness evidence envelope." },
        ],
        decideChoices: [
          { id: "d1", label: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the effectiveness evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the effectiveness evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in effectiveness evidence envelope remains unresolved. This decide option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for effectiveness evidence envelope is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to effectiveness evidence envelope. This decide option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during closure, effectiveness monitoring, and safety learning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For effectiveness evidence envelope, record the exact visible discrepancy, the conflicting safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For effectiveness evidence envelope, record the exact visible discrepancy, the conflicting safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark effectiveness evidence envelope closed on assignment, before completion and effectiveness evidence exist. This document option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of effectiveness evidence envelope." },
          { id: "doc3", label: "Retain only a summary of effectiveness evidence envelope and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns effectiveness evidence envelope during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for closure, effectiveness monitoring, and safety learning." },
        ],
        feedback: {
          observed: "The photographed effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. The adjacent safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. The adjacent safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning, while the safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the effectiveness evidence envelope discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For closure, effectiveness monitoring, and safety learning, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For effectiveness evidence envelope, record the exact visible discrepancy, the conflicting safety root-cause worksheet, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
      {
        id: "safety-root-cause-worksheet-7-3", label: "safety root-cause worksheet", shortLabel: "safety root-cause worksheet", ariaLabel: "Investigate safety root-cause worksheet",        x: 83, y: 48, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "The photographed safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. The adjacent closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning, while the closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. The adjacent closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning, while the closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read safety root-cause worksheet only for favorable indicators and omit the exception evidence connected to closure incident report. This identify option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for closure, effectiveness monitoring, and safety learning." },
          { id: "i3", label: "Treat an unsigned or unverified safety root-cause worksheet as equivalent to the current controlled record. This identify option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about safety root-cause worksheet." },
        ],
        decideChoices: [
          { id: "d1", label: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close safety root-cause worksheet when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for safety root-cause worksheet is resolved." },
          { id: "d3", label: "Defer the safety root-cause worksheet decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during closure, effectiveness monitoring, and safety learning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For safety root-cause worksheet, record the exact visible discrepancy, the conflicting closure incident report, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For safety root-cause worksheet, record the exact visible discrepancy, the conflicting closure incident report, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for safety root-cause worksheet but omit the actual evidence, communications, and unresolved items. This document option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of safety root-cause worksheet." },
          { id: "doc3", label: "Combine safety root-cause worksheet with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns safety root-cause worksheet during closure, effectiveness monitoring, and safety learning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for closure, effectiveness monitoring, and safety learning." },
        ],
        feedback: {
          observed: "The photographed safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. The adjacent closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning. The adjacent closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The safety root-cause worksheet contains a correction with no author, date, or reason for closure, effectiveness monitoring, and safety learning, while the closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning. Classify this as an unresolved exception involving a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For closure, effectiveness monitoring, and safety learning, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the safety root-cause worksheet discrepancy, apply the immediate safeguard, use this escalation route: provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For closure, effectiveness monitoring, and safety learning, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For closure, effectiveness monitoring, and safety learning, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. For safety root-cause worksheet, record the exact visible discrepancy, the conflicting closure incident report, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["QA-AE-001","QA-AE-002","QA-AE-003","QA-AE-004","RM-ER-002","RM-ER-005","QA-PI-001","42 CFR § 484.65","42 CFR § 484.60","42 CFR § 484.70","42 CFR § 484.50","42 CFR §484.110","42 CFR §484.65(d)","42 CFR § 484.100","42 CFR Part 484"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During adverse events, near misses, and patient-safety governance, the photographed adverse incident report summarizes compliance while an attachment documents an unresolved exception for adverse events, near misses, and patient-safety governance; the near evidence envelope has a chain-of-custody line with no receiving signature for adverse events, near misses, and patient-safety governance. Which finding can the Director of Nursing support before authorizing action?",
    options: [
      "Treat the mismatch between the adverse incident report and near evidence envelope as an unresolved a just, timely adverse-event system that protects patients, preserves evidence, learns causes, and verifies correction exception; verify the current source, patient impact, and authorized owner.",
      "Average the two artifact statuses and classify adverse events, near misses, and patient-safety governance as partially complete.",
      "Remove the conflicting near evidence envelope so the file presents one consistent answer.",
      "Accept the adverse incident report because its visible status appears more recent than the near evidence envelope.",
    ],
    correct: 0,
    rationale: "The physical evidence conflicts. A supportable classification preserves both artifacts and verifies authority and patient impact before action. Controlled-policy traceability for this lesson includes QA-AE-001.",
  },
  {
    id: 2,
    stem: "During reporting culture, intake, triage, and immediate protection, the photographed intake root-cause worksheet contains a correction with no author, date, or reason for reporting culture, intake, triage, and immediate protection; the triage incident report summarizes compliance while an attachment documents an unresolved exception for reporting culture, intake, triage, and immediate protection. What is the safest authorized next action?",
    options: [
      "Continue the affected work and ask the intake root-cause worksheet author to correct it during the next routine review.",
      "For reporting culture, intake, triage, and immediate protection, protect the patient first; preserve facts; investigate system causes; apply only the reporting pathway verified for the event. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. Apply that response to the intake root-cause worksheet discrepancy and keep the exception visible pending verification.",
      "Use the triage incident report as authority because it contains fewer blank fields.",
      "Transfer the entire decision to the artifact custodian and remove DON follow-through.",
    ],
    correct: 1,
    rationale: "The response addresses the module-specific decision while preserving the discrepancy, accountable ownership, and effectiveness review. Controlled-policy traceability for this lesson includes QA-AE-002.",
  },
  {
    id: 3,
    stem: "During clinical response, notifications, and evidence preservation, the photographed evidence envelope has a chain-of-custody line with no receiving signature for clinical response, notifications, and evidence preservation; the clinical root-cause worksheet contains a correction with no author, date, or reason for clinical response, notifications, and evidence preservation. Which escalation creates a closed clinical-leadership loop?",
    options: [
      "Email an unassigned distribution list about the evidence envelope without requesting a decision or confirmation.",
      "Send only a screenshot of the evidence envelope and omit the patient impact, safeguard, and unresolved question.",
      "Wait for the clinical root-cause worksheet owner to notice the conflict, because escalation would duplicate the record.",
      "For clinical response, notifications, and evidence preservation, escalate through or to the current provider, Administrator, quality, compliance, legal, insurer, or external authority as the controlled pathway requires. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
    ],
    correct: 3,
    rationale: "The module-specific route identifies what to communicate, who must own the response, and how receipt and follow-through are confirmed. Controlled-policy traceability for this lesson includes QA-AE-003.",
  },
  {
    id: 4,
    stem: "During investigation methods and root-cause analysis, the photographed investigation incident report summarizes compliance while an attachment documents an unresolved exception for investigation methods and root-cause analysis; the root-cause evidence envelope has a chain-of-custody line with no receiving signature for investigation methods and root-cause analysis. Which entry makes the DON decision reconstructable?",
    options: [
      "Record the planned result for the root-cause evidence envelope but omit the visible finding, source, owner, and communication.",
      "For investigation methods and root-cause analysis, document event chronology, assessment, protection, notifications, evidence, analysis, corrective actions, owners, and effectiveness, including unresolved evidence and the next verification point. Identify the conflicting investigation incident report and root-cause evidence envelope, rather than recording only a completion status.",
      "Write “reviewed” beside the investigation incident report and keep the discrepancy in personal notes.",
      "Mark the issue closed when the correction is assigned, before verification evidence exists.",
    ],
    correct: 1,
    rationale: "A qualified reviewer must be able to reconstruct the exact evidence, source, rationale, communication, owner, and final verification. Controlled-policy traceability for this lesson includes QA-AE-004.",
  },
  {
    id: 5,
    stem: "During policy-specific external reporting and escalation decisions, correction of the escalation root-cause worksheet is assigned while the photographed escalation root-cause worksheet contains a correction with no author, date, or reason for policy-specific external reporting and escalation decisions; the exception incident report summarizes compliance while an attachment documents an unresolved exception for policy-specific external reporting and escalation decisions. What accountability remains with the DON?",
    options: [
      "Treat assignment of the escalation root-cause worksheet correction as transfer of all clinical-leadership accountability.",
      "Let the assignee select a different governing source without documenting or escalating the change.",
      "Close the exception when the assignee acknowledges the task, even if the exception incident report still conflicts.",
      "Confirm that the assignee has authority and capacity, monitor patient and operational consequences, escalate the escalation root-cause worksheet conflict, and verify the corrected result.",
    ],
    correct: 3,
    rationale: "Delegating a task does not remove DON accountability for clinical consequences, escalation, and effectiveness verification. Controlled-policy traceability for this lesson includes RM-ER-002.",
  },
  {
    id: 6,
    stem: "During aggregate trends, QAPI integration, and corrective action, the photographed corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action; the aggregate root-cause worksheet contains a correction with no author, date, or reason for aggregate trends, QAPI integration, and corrective action. What evidence supports closure?",
    options: [
      "An authorized owner resolves the corrective evidence envelope and aggregate root-cause worksheet conflict, documents the action and communication, and verifies the intended patient or operational result.",
      "The assigned owner reports being busy but expects the aggregate root-cause worksheet to be corrected.",
      "The corrective evidence envelope is uploaded to the governed location, even though its discrepancy remains.",
      "A meeting agenda lists the issue without a decision, owner, safeguard, or verification result.",
    ],
    correct: 0,
    rationale: "Closure requires completed action plus objective verification; submission, assignment, or discussion alone is not effectiveness evidence. Controlled-policy traceability for this lesson includes RM-ER-005.",
  },
  {
    id: 7,
    stem: "During closure, effectiveness monitoring, and safety learning, the photographed closure incident report summarizes compliance while an attachment documents an unresolved exception for closure, effectiveness monitoring, and safety learning; the effectiveness evidence envelope has a chain-of-custody line with no receiving signature for closure, effectiveness monitoring, and safety learning. How should the source conflict be resolved?",
    options: [
      "Choose the closure incident report because it is easier to read and discard the effectiveness evidence envelope.",
      "Copy a conclusion from a prior case and omit the current patient and authority evidence.",
      "Use department custom to resolve the conflict without checking the controlled source.",
      "Preserve both artifacts, verify the controlled source and role authority, reconcile patient-specific evidence, document the resolution, and escalate any remaining closure incident report exception.",
    ],
    correct: 3,
    rationale: "Conflicting physical evidence must remain traceable until current authority, patient-specific facts, ownership, and resolution are documented. Controlled-policy traceability for this lesson includes QA-PI-001.",
  },
  {
    id: 8,
    stem: "A staff member cites 42 CFR § 484.65 to override the patient-specific evidence and controlled workflow in Adverse Event Management, Incident Reporting & Root Cause Analysis. How should the DON respond?",
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
    stem: "The reporting evidence envelope has a chain-of-custody line with no receiving signature for reporting culture, intake, triage, and immediate protection, while the later corrective evidence envelope has a chain-of-custody line with no receiving signature for aggregate trends, QAPI integration, and corrective action. What connects these distinct findings into defensible DON practice for Adverse Event Management, Incident Reporting & Root Cause Analysis?",
    options: [
      "Close both findings because two different artifacts cannot be evaluated in one leadership evidence chain.",
      "Use the later corrective evidence envelope to overwrite the earlier reporting evidence envelope without preserving the source conflict.",
      "Preserve both findings; verify controlled authority and patient-specific impact; assign and confirm accountable action; then document effectiveness across the reporting evidence envelope and corrective evidence envelope.",
      "Treat the reporting evidence envelope as a training issue and the corrective evidence envelope as another department’s issue, with no shared owner or trend review.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis connects distinct evidence through current authority, clinical reasoning, closed-loop ownership, trend awareness, and verified outcomes.",
  },
  {
    id: 10,
    stem: "After a passing score in Adverse Event Management, Incident Reporting & Root Cause Analysis, a learner asks to perform every discussed activity independently. What does successful completion actually establish?",
    options: [
      "Permission to replace current policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled DON concepts in Adverse Event Management, Incident Reporting & Root Cause Analysis; appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate decisions.",
      "Observed clinical competency even though no authorized evaluator witnessed performance.",
      "Automatic authority to perform every activity discussed in Adverse Event Management, Incident Reporting & Root Cause Analysis without supervision.",
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


const STORAGE_KEY = 'don-014-progress-v6000';

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

export default function DON014() {
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
          <span className="brand-text">DON-014 — Adverse Events</span>
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
