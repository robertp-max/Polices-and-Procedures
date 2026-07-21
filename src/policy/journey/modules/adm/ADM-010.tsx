/**
 * ADM-010 — QAPI Program Leadership
 * Canonical Administrator Pass 5 build from controlled architecture and policies.
 * Gold interaction shell: LVN-001 Pass 5 corrected.
 * Knowledge completion is separate from appointment, delegation, competency, legal sign-off, and independent authority.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import {

  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,

  Compass, Eye, FileText, MessageSquare, RotateCcw,

  ShieldCheck, Sparkles, X, XCircle,

} from 'lucide-react';

import img01 from './assets/adm-010/adm-010-lesson-01.png';
import img02 from './assets/adm-010/adm-010-lesson-02.png';
import img03 from './assets/adm-010/adm-010-lesson-03.png';
import img04 from './assets/adm-010/adm-010-lesson-04.png';
import img05 from './assets/adm-010/adm-010-lesson-05.png';
import img06 from './assets/adm-010/adm-010-lesson-06.png';
import img07 from './assets/adm-010/adm-010-lesson-07.png';



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



const MODULE_META = { id: "ADM-010", title: "QAPI Program Leadership", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Governing-body and administrator QAPI accountability, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Program scope, data sources, measures, and data integrity, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Prioritize high-risk, high-volume, and problem-prone processes, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Performance-improvement project charter and root-cause design, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Implement, measure, sustain, and spread corrective change, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Patient outcomes, experience, utilization, and public quality metrics, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for QAPI minutes, board reporting, and program effectiveness, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Governi",
    title: "Governing-body and administrator QAPI accountability",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for governing-body and administrator qapi accountability within QAPI Program Leadership. Begin with the current controlled versions of QA-PG-002, QA-PG-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PG-002, Annual QAPI Plan Development. Initiate the annual QAPI plan development process by conducting a comprehensive year-end quality assessment that includes: (a) review of all quality indicator trends for the current plan year; (b) analysis of PIP outcomes and sustainability; (c) review of adverse event and incident data; (d) review of patient satisfaction and HHCAHPS results; (e) review of Star Rating trends and Home Health Compare data; (f) review of infection surveillance data; (g) review of compliance audit findings and CMS survey results; (h) review of staff competency evaluation results; (i) feedback from QAPI Committee members and department heads; (j) assessment of new or changing regulatory requirements. The responsible role. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Program Integration. Establish a defined coordination protocol between the QAPI program and the Compliance program (CO-CP-001) to ensure: (a) compliance audit findings that indicate quality or patient safety implications are referred to the QAPI Committee; (b) QAPI findings that indicate potential regulatory non-compliance are referred to the Compliance Officer; (c) duplicative investigation is avoided through joint review when appropriate. The responsible role is QAPI Coordinator / Compliance Officer; the stated timing is Protocol established within 60 days of program establishment; reviewed annually.. Establish a defined coordination protocol between the QAPI program and the Risk Management program (RM-ER-001) to ensure: (a) incident reports are routed to the QAPI. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Committee Structure and Function. Establish and maintain the QAPI Committee with the following minimum composition: (a) QAPI Coordinator (Chair); (b) Director of Nursing / Clinical Manager; (c) Administrator or designee; (d) at least one representative from each active clinical discipline (nursing, therapy, aide services); (e) Compliance Officer or designee (standing invitation). Additional members may include intake, scheduling, billing, and HR representatives as needed for specific agenda items. The responsible role is QAPI Coordinator; the stated timing is Committee established within 30 calendar days of program establishment; membership roster updated within 7 calendar days of any change.. Convene QAPI Committee meetings no fewer than monthly. Meeting schedule for the upcoming. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, Governing Body QAPI Oversight. Prepare and submit a written QAPI Performance Report to the Governing Body no fewer than 7 calendar days before each quarterly Governing Body meeting. The report must include: (a) quality indicator trends with comparison to prior quarter and national benchmarks; (b) status of all active PIPs including progress against measurable goals; (c) adverse event summary with root cause analysis findings; (d) patient satisfaction data and HHCAHPS trends; (e) Star Rating / Home Health Compare trends; (f) infection surveillance summary; (g) open corrective action plans with status; (h) recommendations for Governing Body action. The responsible role is QAPI Coordinator; the stated timing is 7 calendar days. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Program Establishment. Formally establish the QAPI program through a resolution or directive documented in Governing Body minutes. The establishing action must identify: (a) the program's scope (agency-wide); (b) the designated QAPI Coordinator; (c) authorization for the QAPI Committee; (d) the initial resource allocation including dedicated QAPI Coordinator time. The responsible role is Governing Body; the stated timing is Prior to initial Medicare certification and maintained continuously thereafter.. Designate a qualified QAPI Coordinator. The QAPI Coordinator must be: (a) a licensed healthcare professional (RN, PT, OT, SLP, MSW) or an individual with documented quality management certification or equivalent experience; (b) granted authority to access all agency data systems. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to governing-body and administrator qapi accountability. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
      { kind: "External Authority", text: "42 CFR § 484.65(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-1-1", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 29, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing-body and administrator qapi accountability." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for governing-body and administrator qapi accountability. This decide option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing-body and administrator qapi accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during governing-body and administrator qapi accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing-body and administrator qapi accountability." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "performance-improvement-charter-binder-1-2", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 30, y: 72, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in governing-body and administrator qapi accountability. This identify option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing-body and administrator qapi accountability." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing-body and administrator qapi accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during governing-body and administrator qapi accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing-body and administrator qapi accountability." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "patient-experience-evidence-folder-1-3", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing-body and administrator qapi accountability." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing-body and administrator qapi accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during governing-body and administrator qapi accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing-body and administrator qapi accountability." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for governing-body and administrator qapi accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing-body and administrator qapi accountability by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing-body and administrator qapi accountability. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Program",
    title: "Program scope, data sources, measures, and data integrity",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for program scope, data sources, measures, and data integrity within QAPI Program Leadership. Begin with the current controlled versions of QA-PI-004, QA-SM-004, QA-PI-003, QA-PG-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PI-004, Data Analysis Standards. Establish minimum data analysis standards for QAPI decisions: (a) Trending — minimum 3 data points over time before identifying a trend; (b) Comparison — always compare to threshold, benchmark, or baseline; (c) Stratification — when aggregate data shows adverse trend, stratify by clinician, discipline, diagnosis, or other relevant variable to identify root cause; (d) Sample size — document sample size and acknowledge limitations when sample is small; (e) Timeliness — data must be current (within 60 days for clinical data, within 90 days for outcome data) to support current decisions. The responsible role is QAPI Coordinator; the stated timing is At program establishment; standards reviewed. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-004, Quarterly Data Review and Analysis. Upon each quarterly CMS data release, download the agency's current publicly reported quality measure data from iQIES and Home Health Compare. Prepare the Home Health Compare Quarterly Analysis Report (Appendix A) within 10 business days of data release. The report must include: (a) all reported quality measures with agency score, national average, and state average; (b) Quality of Patient Care Star Rating — current and trend; (c) Patient Survey Star Rating — current and trend; (d) measures below national average; (e) measures below state average; (f) measures trending in the wrong direction (declining over 3+ periods, even if still above average); (g) comparison to agency. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-003, Benchmark Data Sources and Collection. Identify and maintain access to the following benchmark data sources: (a) CMS Home Health Compare — quarterly quality measure data, Star Ratings; (b) CASPER/iQIES — OASIS-based outcome and process reports, potentially avoidable event reports; (c) HHCAHPS national and state comparative data; (d) state health department comparative reports (if available in California); (e) accreditation body comparative data (if applicable). Document all data sources in the QAPI Data Source Inventory per QA-PG-001 Section 6.4.4. The responsible role is QAPI Coordinator; the stated timing is At program establishment; sources reviewed annually.. Retrieve and compile benchmark comparison data at least quarterly. For each benchmarked measure, document: (a) agency performance. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Program Integration. Establish a defined coordination protocol between the QAPI program and the Compliance program (CO-CP-001) to ensure: (a) compliance audit findings that indicate quality or patient safety implications are referred to the QAPI Committee; (b) QAPI findings that indicate potential regulatory non-compliance are referred to the Compliance Officer; (c) duplicative investigation is avoided through joint review when appropriate. The responsible role is QAPI Coordinator / Compliance Officer; the stated timing is Protocol established within 60 days of program establishment; reviewed annually.. Establish a defined coordination protocol between the QAPI program and the Risk Management program (RM-ER-001) to ensure: (a) incident reports are routed to the QAPI. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, 9\\. References. 9.1 Federal Regulations (42 CFR Part 484) 42 CFR § 484.65: Condition of Participation: Quality Assessment and Performance Improvement. Source or operational basis: Primary regulatory basis for this policy. Requires an effective, ongoing, agency-wide, data-driven QAPI program.. 42 CFR § 484.65(a): Standard: Program scope. Source or operational basis: Requires QAPI program to reflect complexity of organization and services; maintain quality through ongoing programs for improvement.. 42 CFR § 484.65(b): Standard: Program data. Source or operational basis: Requires use of quality indicator data including patient care, OASIS, and other relevant data to monitor effectiveness of care.. 42 CFR § 484.65(c): Standard: Program activities. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to program scope, data sources, measures, and data integrity. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65(a)" },
      { kind: "External Authority", text: "42 CFR § 484.65(c)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "performance-improvement-charter-binder-2-1", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 14, y: 55, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in program scope, data sources, measures, and data integrity. This identify option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for program scope, data sources, measures, and data integrity." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during program scope, data sources, measures, and data integrity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program scope, data sources, measures, and data integrity." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "patient-experience-evidence-folder-2-2", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for program scope, data sources, measures, and data integrity." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during program scope, data sources, measures, and data integrity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program scope, data sources, measures, and data integrity." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-2-3", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 86, y: 65, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for program scope, data sources, measures, and data integrity." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for program scope, data sources, measures, and data integrity. This decide option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during program scope, data sources, measures, and data integrity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during program scope, data sources, measures, and data integrity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program scope, data sources, measures, and data integrity." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for program scope, data sources, measures, and data integrity. Identify the verified status, discrepancy, affected requirement, and accountable owner for program scope, data sources, measures, and data integrity by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for program scope, data sources, measures, and data integrity. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Priorit",
    title: "Prioritize high-risk, high-volume, and problem-prone processes",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for prioritize high-risk, high-volume, and problem-prone processes within QAPI Program Leadership. Begin with the current controlled versions of QA-PG-003, QA-PI-001, QA-PG-001, QA-PG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PG-003, Committee Composition and Appointment. Establish the QAPI Committee with the following minimum standing membership: (a) QAPI Coordinator (Chair); (b) Director of Nursing / Clinical Manager; (c) at least one registered nurse representative; (d) at least one therapy representative (PT, OT, or SLP); (e) at least one representative from home health aide services or supervision; (f) Intake/Scheduling representative; (g) Administrator or administrative designee. Standing invitations: Compliance Officer, CFO/Revenue Cycle Director (or designee). Additional members may be added based on agency scope. The responsible role is QAPI Coordinator; the stated timing is Within 30 calendar days of program establishment.. Prepare and maintain a formal Committee Membership Roster documenting: member name, title/role. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-001, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall maintain a minimum of two (2) active PIPs at all times, proportionate to the scope and complexity of the agency's services, as a Care Indeed agency standard; 42 CFR § 484.65(d) does not prescribe the number two. 4.2 At least one active PIP shall address a clinical outcome or patient safety topic. The second PIP may address clinical, operational, compliance, or patient experience areas. 4.3 PIPs shall be selected based on data analysis identifying areas of underperformance, adverse trends, high-risk processes, or areas with the greatest potential for patient impact. PIP selection shall not be arbitrary. 4.4. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, Governing Body QAPI Oversight. Prepare and submit a written QAPI Performance Report to the Governing Body no fewer than 7 calendar days before each quarterly Governing Body meeting. The report must include: (a) quality indicator trends with comparison to prior quarter and national benchmarks; (b) status of all active PIPs including progress against measurable goals; (c) adverse event summary with root cause analysis findings; (d) patient satisfaction data and HHCAHPS trends; (e) Star Rating / Home Health Compare trends; (f) infection surveillance summary; (g) open corrective action plans with status; (h) recommendations for Governing Body action. The responsible role is QAPI Coordinator; the stated timing is 7 calendar days. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-002, 10\\. Training Requirements. 10.1 The QAPI Coordinator and all QAPI Committee members shall be trained on QAPI plan development methodology, content requirements, and evaluation processes within 30 calendar days of appointment. 10.2 All department heads and supervisors responsible for achieving QAPI plan goals shall be briefed on the approved plan content, their specific responsibilities, and performance thresholds within 14 calendar days of Governing Body approval. 10.3 All personnel within scope shall sign the Policy Acknowledgment Form within 14 calendar days of the policy effective date, any revision, or new assignment.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-001, PIP Implementation and Monitoring. Implement interventions as defined in the approved charter. Document all implementation activities including: date of implementation, staff involved, processes changed, education delivered, and any barriers encountered. The responsible role is PIP Lead; the stated timing is Per charter timeline.. Collect data per the charter's data collection plan. Maintain a PIP data tracking document that records: data point, date collected, value, and variance from target. The responsible role is PIP Lead; the stated timing is Per charter frequency (minimum monthly).. Present a monthly PIP status report to the QAPI Committee including: (a) current data vs. baseline and target; (b) interventions implemented since last report; (c) barriers. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to prioritize high-risk, high-volume, and problem-prone processes. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65(c)" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "patient-experience-evidence-folder-3-1", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 14, y: 62, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for prioritize high-risk, high-volume, and problem-prone processes." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-3-2", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 55, y: 70, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for prioritize high-risk, high-volume, and problem-prone processes." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for prioritize high-risk, high-volume, and problem-prone processes. This decide option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "performance-improvement-charter-binder-3-3", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 79, y: 42, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in prioritize high-risk, high-volume, and problem-prone processes. This identify option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for prioritize high-risk, high-volume, and problem-prone processes." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during prioritize high-risk, high-volume, and problem-prone processes.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for prioritize high-risk, high-volume, and problem-prone processes." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for prioritize high-risk, high-volume, and problem-prone processes. Identify the verified status, discrepancy, affected requirement, and accountable owner for prioritize high-risk, high-volume, and problem-prone processes by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for prioritize high-risk, high-volume, and problem-prone processes. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Perform",
    title: "Performance-improvement project charter and root-cause design",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for performance-improvement project charter and root-cause design within QAPI Program Leadership. Begin with the current controlled versions of QA-PI-001, QA-PG-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PI-001, PIP Design and Charter. Develop a PIP Charter document for approval by the QAPI Committee. The charter must include: (a) Problem Statement — a concise, data-supported description of the issue; (b) Baseline Data — current performance level with data source, time period, and sample size; (c) Measurable Goal/Target — specific numeric or percentage target (e.g., \"Reduce 30-day hospitalization rate from 22% to 15% within 6 months\"); (d) Root Cause / Contributing Factor Analysis — documented analysis of why the current performance gap exists; (e) Interventions — specific, actionable changes to be implemented; (f) Team Members — named individuals with defined roles; (g) Data Collection Plan — data source, collection. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-001, Escalation and Exception Handling. Fewer than the number of active projects required by the current Care Indeed QAPI plan.: QAPI Coordinator notifies QAPI Committee.. Source or operational basis: Committee selects and charters a new PIP per Section 6.1.. PIP shows no measurable progress after 6 months.: PIP Lead escalates to QAPI Committee with analysis.. Source or operational basis: Committee reviews and either redesigns, provides additional resources, or replaces the PIP with a new project addressing the same area. Documented in minutes.. PIP Lead vacancy or inability to continue.: QAPI Coordinator reassigns immediately.. Source or operational basis: New PIP Lead appointed; briefed within 7 calendar days.. CMS survey finding requires. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-001, 7\\. Documentation Requirements. PIP selection rationale: QAPI Committee meeting minutes documenting data-driven selection and rationale.. Source or operational basis: QAPI Coordinator. PIP Charter: Formal charter per Section 6.2.1.. Source or operational basis: PIP Lead. Monthly PIP status reports: Written or dashboard reports per Section 6.3.3.. Source or operational basis: PIP Lead. PIP data tracking: Ongoing data collection documentation per charter.. Source or operational basis: PIP Lead. PIP Completion Report: Final report per Section 6.4.1.. Source or operational basis: PIP Lead. Sustainment monitoring data: Data collected during 3-month sustainment period.. Source or operational basis: PIP Lead. Archived PIP file: Complete project file per Section 6.4.4.. Source or operational basis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, 5\\. Definitions. QAPI. Quality Assessment and Performance Improvement — the structured, data-driven program required by 42 CFR § 484.65 for ongoing quality monitoring, performance improvement, and patient safety assurance.. QAPI Coordinator. The individual designated by the Governing Body with operational authority and accountability for administering the agency's QAPI program on a day-to-day basis. Must be a licensed healthcare professional or individual with demonstrated quality management expertise.. QAPI Committee. The multidisciplinary committee responsible for reviewing quality data, directing performance improvement projects, monitoring corrective actions, and reporting to the Governing Body.. Quality Indicator. A quantifiable measure used to assess agency performance in a defined area of clinical care, operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, How Compliance Is Measured. QAPI program is formally established and documented.: Review of Governing Body minutes; QAPI Program Description document.. Source or operational basis: Current establishing documentation and Program Description on file at all times.. QAPI Coordinator is designated with documented qualifications and authority.: Review of designation documentation; personnel file; Governing Body minutes.. Source or operational basis: Current designation on file; no vacancy exceeds 30 days without interim designee.. QAPI Committee meets at least monthly.: Review of meeting minutes with dates and attendance.. Source or operational basis: 12 or more meetings per calendar year with documented attendance.. QAPI Committee meeting minutes are complete and timely.: Review of minutes for. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to performance-improvement project charter and root-cause design. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR § 484.65(b)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-4-1", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance-improvement project charter and root-cause design." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for performance-improvement project charter and root-cause design. This decide option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance-improvement project charter and root-cause design." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during performance-improvement project charter and root-cause design.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance-improvement project charter and root-cause design." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "performance-improvement-charter-binder-4-2", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 40, y: 48, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in performance-improvement project charter and root-cause design. This identify option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance-improvement project charter and root-cause design." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance-improvement project charter and root-cause design." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance-improvement project charter and root-cause design." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "patient-experience-evidence-folder-4-3", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance-improvement project charter and root-cause design." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance-improvement project charter and root-cause design." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during performance-improvement project charter and root-cause design.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance-improvement project charter and root-cause design." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for performance-improvement project charter and root-cause design. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance-improvement project charter and root-cause design by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance-improvement project charter and root-cause design. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Impleme",
    title: "Implement, measure, sustain, and spread corrective change",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for implement, measure, sustain, and spread corrective change within QAPI Program Leadership. Begin with the current controlled versions of QA-PI-003, QA-PI-002, QA-SM-004, QA-PI-001, QA-SM-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PI-003, How Compliance Is Measured. Benchmark comparison conducted quarterly.: Review of quarterly benchmark reports.. Source or operational basis: Reports completed within 30 days of CMS data release each quarter.. All measures below benchmark have documented analysis.: Review of committee minutes.. Source or operational basis: 100% of below-benchmark measures have documented analysis.. Response plans exist for significantly below benchmark measures.: Review of response plan documents.. Source or operational basis: Written plan within 30 days for 100% of significantly-below measures.. Benchmarking reported to Governing Body quarterly.: Review of QAPI Performance Report and Governing Body minutes.. Source or operational basis: Included in all quarterly reports.. Benchmark data informs annual QAPI plan.: Review of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-002, Corrective Action Triggers. When an indicator falls below threshold for 2 consecutive reporting periods, the committee shall: (a) assign a committee member to conduct a contributing factor analysis; (b) review relevant data sources, incident reports, and process documentation; (c) determine whether a formal root cause analysis (QA-AE-002) or corrective action plan (QA-AE-003) is warranted; (d) determine whether a new or existing PIP should address the issue; (e) assign corrective action with responsible party, specific interventions, and measurable resolution target; (f) define monitoring frequency (minimum monthly); (g) document all analysis and decisions in committee minutes. The responsible role is QAPI Committee; the stated timing is At the meeting where. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-004, 12\\. Appendices. Appendix A: Home Health Compare Quarterly Analysis Report Care Indeed Home Health Care, Inc. Home Health Compare Quarterly Analysis Report Policy Reference: QA-SM-004 | CMS Data Release Quarter: Q____ | Year: ___________ Prepared By: _________________________ Date: _______________ SECTION 1 — STAR RATINGS Rating: Current Quarter. Source or operational basis: Prior Quarter. Quality of Patient Care Star Rating: ☐1 ☐2 ☐3 ☐4 ☐5. Source or operational basis: ☐1 ☐2 ☐3 ☐4 ☐5. Patient Survey (HHCAHPS) Star Rating: ☐1 ☐2 ☐3 ☐4 ☐5. Source or operational basis: ☐1 ☐2 ☐3 ☐4 ☐5. Status Key: ✅ At or above target | ⚠️ Below target (3 stars) | 🔴. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-001, PIP Implementation and Monitoring. Implement interventions as defined in the approved charter. Document all implementation activities including: date of implementation, staff involved, processes changed, education delivered, and any barriers encountered. The responsible role is PIP Lead; the stated timing is Per charter timeline.. Collect data per the charter's data collection plan. Maintain a PIP data tracking document that records: data point, date collected, value, and variance from target. The responsible role is PIP Lead; the stated timing is Per charter frequency (minimum monthly).. Present a monthly PIP status report to the QAPI Committee including: (a) current data vs. baseline and target; (b) interventions implemented since last report; (c) barriers. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-003, Corrective Action for Below-Benchmark Performance. When any HHCAHPS composite measure falls below the national average for 2 consecutive quarters, the committee shall: (a) identify the specific survey items driving the low composite score; (b) conduct a root cause analysis of the low-scoring items (possible causes: communication skills, timeliness, responsiveness, care quality, education effectiveness); (c) develop a targeted corrective action plan per QA-AE-003 with specific interventions, responsible parties, measurable targets, and timeline; (d) document analysis and plan in committee minutes. The responsible role is QAPI Committee; the stated timing is At the committee meeting where the second consecutive below-average quarter is confirmed; CAP within 14 calendar days.. Implement corrective interventions which. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to implement, measure, sustain, and spread corrective change. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65(b)" },
      { kind: "External Authority", text: "42 CFR § 484.65(d)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "performance-improvement-charter-binder-5-1", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 14, y: 46, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in implement, measure, sustain, and spread corrective change. This identify option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for implement, measure, sustain, and spread corrective change." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during implement, measure, sustain, and spread corrective change." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implement, measure, sustain, and spread corrective change." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "patient-experience-evidence-folder-5-2", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 45, y: 65, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for implement, measure, sustain, and spread corrective change." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during implement, measure, sustain, and spread corrective change." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implement, measure, sustain, and spread corrective change." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-5-3", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 85, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for implement, measure, sustain, and spread corrective change." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for implement, measure, sustain, and spread corrective change. This decide option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during implement, measure, sustain, and spread corrective change." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during implement, measure, sustain, and spread corrective change.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implement, measure, sustain, and spread corrective change." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for implement, measure, sustain, and spread corrective change. Identify the verified status, discrepancy, affected requirement, and accountable owner for implement, measure, sustain, and spread corrective change by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for implement, measure, sustain, and spread corrective change. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Patient",
    title: "Patient outcomes, experience, utilization, and public quality metrics",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for patient outcomes, experience, utilization, and public quality metrics within QAPI Program Leadership. Begin with the current controlled versions of QA-PI-002, QA-SM-003, QA-SM-004, QA-PG-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PI-002, Quality Indicator Selection and Dashboard Design. Establish the Quality Indicator Dashboard with indicators covering the following mandatory categories. For each indicator, define: (a) indicator name; (b) category; (c) data source; (d) calculation methodology; (e) reporting frequency; (f) performance threshold; (g) national benchmark (if available); (h) responsible data collector. The responsible role is QAPI Coordinator; the stated timing is Established within 60 days of program establishment; reviewed annually.. Minimum required indicator categories and examples (agency shall define specific indicators within each): Clinical Outcomes — acute care hospitalization rate, emergency department use without hospitalization, improvement in ambulation, improvement in bathing, improvement in pain management, wound healing rate. Patient Safety — fall rate, medication. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-003, 12\\. Appendices. Appendix A: HHCAHPS Patient Eligibility Tracking Log Care Indeed Home Health Care, Inc. HHCAHPS Patient Eligibility Tracking Log Policy Reference: QA-SM-003 | Calendar Quarter: Q____ | Year: ___________ Prepared By: _________________________ Date Submitted to Vendor: _______________ Instructions: List all patients discharged during the calendar quarter who meet CMS HHCAHPS eligibility criteria: (1) Medicare or Medicaid payer; (2) episode of ≥ 2 skilled visits; (3) not deceased at time of survey eligibility; (4) not discharged to inpatient facility within the look-back period; (5) no exclusion criteria apply. Submit list to HHCAHPS vendor per contract schedule. #: Patient ID. Source or operational basis: Payer. 1: . Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-003, Supplemental Patient Satisfaction Monitoring. Conduct Post-Discharge Satisfaction Calls for all discharged patients within 7 calendar days of discharge using the standardized call script (Appendix C). The call must address: (a) overall satisfaction with care; (b) communication experience with clinical staff; (c) whether care instructions were clear and understandable; (d) whether the patient would recommend the agency; (e) any complaints or unresolved concerns; (f) any quality or safety issues not previously reported. Document call results on the Post-Discharge Call Log (Appendix D). The responsible role is DON / Clinical Supervisors; the stated timing is Within 7 calendar days of discharge; goal 100% of discharges.. Compile monthly Post-Discharge Call Summary data. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-SM-004, 12\\. Appendices. Appendix A: Home Health Compare Quarterly Analysis Report Care Indeed Home Health Care, Inc. Home Health Compare Quarterly Analysis Report Policy Reference: QA-SM-004 | CMS Data Release Quarter: Q____ | Year: ___________ Prepared By: _________________________ Date: _______________ SECTION 1 — STAR RATINGS Rating: Current Quarter. Source or operational basis: Prior Quarter. Quality of Patient Care Star Rating: ☐1 ☐2 ☐3 ☐4 ☐5. Source or operational basis: ☐1 ☐2 ☐3 ☐4 ☐5. Patient Survey (HHCAHPS) Star Rating: ☐1 ☐2 ☐3 ☐4 ☐5. Source or operational basis: ☐1 ☐2 ☐3 ☐4 ☐5. Status Key: ✅ At or above target | ⚠️ Below target (3 stars) | 🔴. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, 9\\. References. 9.1 Federal Regulations (42 CFR Part 484) 42 CFR § 484.65: Condition of Participation: Quality Assessment and Performance Improvement. Source or operational basis: Primary regulatory basis for this policy. Requires an effective, ongoing, agency-wide, data-driven QAPI program.. 42 CFR § 484.65(a): Standard: Program scope. Source or operational basis: Requires QAPI program to reflect complexity of organization and services; maintain quality through ongoing programs for improvement.. 42 CFR § 484.65(b): Standard: Program data. Source or operational basis: Requires use of quality indicator data including patient care, OASIS, and other relevant data to monitor effectiveness of care.. 42 CFR § 484.65(c): Standard: Program activities. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to patient outcomes, experience, utilization, and public quality metrics. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65(d)" },
      { kind: "External Authority", text: "42 CFR § 484.65(e)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "patient-experience-evidence-folder-6-1", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 18, y: 70, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient outcomes, experience, utilization, and public quality metrics." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient outcomes, experience, utilization, and public quality metrics." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient outcomes, experience, utilization, and public quality metrics." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-6-2", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient outcomes, experience, utilization, and public quality metrics." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for patient outcomes, experience, utilization, and public quality metrics. This decide option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient outcomes, experience, utilization, and public quality metrics." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient outcomes, experience, utilization, and public quality metrics." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "performance-improvement-charter-binder-6-3", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 83, y: 61, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in patient outcomes, experience, utilization, and public quality metrics. This identify option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient outcomes, experience, utilization, and public quality metrics." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient outcomes, experience, utilization, and public quality metrics." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during patient outcomes, experience, utilization, and public quality metrics.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient outcomes, experience, utilization, and public quality metrics." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for patient outcomes, experience, utilization, and public quality metrics. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient outcomes, experience, utilization, and public quality metrics by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient outcomes, experience, utilization, and public quality metrics. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 QAPI",
    title: "QAPI minutes, board reporting, and program effectiveness",
    subtitle: "QAPI Program Leadership",
    narration: [
      "This lesson develops administrator judgment for qapi minutes, board reporting, and program effectiveness within QAPI Program Leadership. Begin with the current controlled versions of QA-PG-001, QA-PG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "QAPI correction — 42 CFR § 484.65(d) does not prescribe a minimum of two active performance-improvement projects. Federal project number and scope conducted annually must reflect the home health agency’s scope, complexity, and past performance. Care Indeed may retain two active projects as a higher agency operating standard, but staff must label it as agency policy and must not present fewer than two as a federal regulatory exception.",
      "Controlled source application — QA-PG-001, QAPI Program Integration. Establish a defined coordination protocol between the QAPI program and the Compliance program (CO-CP-001) to ensure: (a) compliance audit findings that indicate quality or patient safety implications are referred to the QAPI Committee; (b) QAPI findings that indicate potential regulatory non-compliance are referred to the Compliance Officer; (c) duplicative investigation is avoided through joint review when appropriate. The responsible role is QAPI Coordinator / Compliance Officer; the stated timing is Protocol established within 60 days of program establishment; reviewed annually.. Establish a defined coordination protocol between the QAPI program and the Risk Management program (RM-ER-001) to ensure: (a) incident reports are routed to the QAPI. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Program Establishment. Formally establish the QAPI program through a resolution or directive documented in Governing Body minutes. The establishing action must identify: (a) the program's scope (agency-wide); (b) the designated QAPI Coordinator; (c) authorization for the QAPI Committee; (d) the initial resource allocation including dedicated QAPI Coordinator time. The responsible role is Governing Body; the stated timing is Prior to initial Medicare certification and maintained continuously thereafter.. Designate a qualified QAPI Coordinator. The QAPI Coordinator must be: (a) a licensed healthcare professional (RN, PT, OT, SLP, MSW) or an individual with documented quality management certification or equivalent experience; (b) granted authority to access all agency data systems. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, QAPI Committee Structure and Function. Establish and maintain the QAPI Committee with the following minimum composition: (a) QAPI Coordinator (Chair); (b) Director of Nursing / Clinical Manager; (c) Administrator or designee; (d) at least one representative from each active clinical discipline (nursing, therapy, aide services); (e) Compliance Officer or designee (standing invitation). Additional members may include intake, scheduling, billing, and HR representatives as needed for specific agenda items. The responsible role is QAPI Coordinator; the stated timing is Committee established within 30 calendar days of program establishment; membership roster updated within 7 calendar days of any change.. Convene QAPI Committee meetings no fewer than monthly. Meeting schedule for the upcoming. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-002, Annual QAPI Plan Development. Initiate the annual QAPI plan development process by conducting a comprehensive year-end quality assessment that includes: (a) review of all quality indicator trends for the current plan year; (b) analysis of PIP outcomes and sustainability; (c) review of adverse event and incident data; (d) review of patient satisfaction and HHCAHPS results; (e) review of Star Rating trends and Home Health Compare data; (f) review of infection surveillance data; (g) review of compliance audit findings and CMS survey results; (h) review of staff competency evaluation results; (i) feedback from QAPI Committee members and department heads; (j) assessment of new or changing regulatory requirements. The responsible role. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PG-001, Governing Body QAPI Oversight. Prepare and submit a written QAPI Performance Report to the Governing Body no fewer than 7 calendar days before each quarterly Governing Body meeting. The report must include: (a) quality indicator trends with comparison to prior quarter and national benchmarks; (b) status of all active PIPs including progress against measurable goals; (c) adverse event summary with root cause analysis findings; (d) patient satisfaction data and HHCAHPS trends; (e) Star Rating / Home Health Compare trends; (f) infection surveillance summary; (g) open corrective action plans with status; (h) recommendations for Governing Body action. The responsible role is QAPI Coordinator; the stated timing is 7 calendar days. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to qapi minutes, board reporting, and program effectiveness. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "quality trend chart with shapes but no readable text", detail: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "performance-improvement charter binder", detail: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "patient-experience evidence folder", detail: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "QA-PG-001" },
      { kind: "Controlled Policy", text: "QA-PG-002" },
      { kind: "Controlled Policy", text: "QA-PG-003" },
      { kind: "Controlled Policy", text: "QA-PI-001" },
      { kind: "Controlled Policy", text: "QA-PI-002" },
      { kind: "Controlled Policy", text: "QA-PI-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "Controlled Policy", text: "QA-SM-003" },
      { kind: "Controlled Policy", text: "QA-SM-004" },
      { kind: "Controlled Policy", text: "QA-SM-005" },
      { kind: "External Authority", text: "42 CFR § 484.65(e)" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "quality-trend-chart-with-shapes-but-no-readabl-7-1", label: "quality trend chart with shapes but no readable text", shortLabel: "quality trend chart with shape", ariaLabel: "Investigate quality trend chart with shapes but no readable text",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat quality trend chart with shapes but no readable text as complete proof without comparing performance-improvement charter binder or the controlled source. This identify option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for qapi minutes, board reporting, and program effectiveness." },
          { id: "i3", label: "Classify the quality trend chart with shapes but no readable text by department custom even though its authority and current status are unverified. This identify option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about quality trend chart with shapes but no readable text." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve quality trend chart with shapes but no readable text on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for quality trend chart with shapes but no readable text is resolved." },
          { id: "d3", label: "Send quality trend chart with shapes but no readable text to an unrelated department rather than the policy owner responsible for qapi minutes, board reporting, and program effectiveness. This decide option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during qapi minutes, board reporting, and program effectiveness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that quality trend chart with shapes but no readable text was reviewed, without source version, finding, decision, owner, or status. This document option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of quality trend chart with shapes but no readable text." },
          { id: "doc3", label: "Keep the quality trend chart with shapes but no readable text decision in personal notes rather than the governed evidence location. This document option concerns quality trend chart with shapes but no readable text during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for qapi minutes, board reporting, and program effectiveness." },
        ],
        feedback: {
          observed: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
          meaning: "Observe the real quality trend chart with shapes but no readable text in the photographed scene. Compare it with the performance-improvement charter binder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For quality trend chart with shapes but no readable text, compare the visible evidence with performance-improvement charter binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to quality trend chart with shapes but no readable text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For quality trend chart with shapes but no readable text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "performance-improvement-charter-binder-7-2", label: "performance-improvement charter binder", shortLabel: "performance-improvement charte", ariaLabel: "Investigate performance-improvement charter binder",
        x: 46, y: 61, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume performance-improvement charter binder applies to every role, location, and exception described in qapi minutes, board reporting, and program effectiveness. This identify option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for qapi minutes, board reporting, and program effectiveness." },
          { id: "i3", label: "Use the oldest available performance-improvement charter binder because prior approval is easier to confirm. This identify option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance-improvement charter binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in performance-improvement charter binder remains unresolved. This decide option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance-improvement charter binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to performance-improvement charter binder. This decide option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during qapi minutes, board reporting, and program effectiveness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark performance-improvement charter binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance-improvement charter binder." },
          { id: "doc3", label: "Retain only a summary of performance-improvement charter binder and discard the source artifact needed to reconstruct the decision. This document option concerns performance-improvement charter binder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for qapi minutes, board reporting, and program effectiveness." },
        ],
        feedback: {
          observed: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
          meaning: "Observe the real performance-improvement charter binder in the photographed scene. Compare it with the patient-experience evidence folder, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For performance-improvement charter binder, compare the visible evidence with patient-experience evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to performance-improvement charter binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For performance-improvement charter binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
      {
        id: "patient-experience-evidence-folder-7-3", label: "patient-experience evidence folder", shortLabel: "patient-experience evidence fo", ariaLabel: "Investigate patient-experience evidence folder",
        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status." },
          { id: "i2", label: "Read patient-experience evidence folder only for favorable indicators and omit the exception evidence connected to quality trend chart with shapes but no readable text. This identify option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for qapi minutes, board reporting, and program effectiveness." },
          { id: "i3", label: "Treat an unsigned or unverified patient-experience evidence folder as equivalent to the current controlled record. This identify option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about patient-experience evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close patient-experience evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for patient-experience evidence folder is resolved." },
          { id: "d3", label: "Defer the patient-experience evidence folder decision to a routine future cycle even though current operations depend on it. This decide option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during qapi minutes, board reporting, and program effectiveness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for patient-experience evidence folder but omit the actual evidence, communications, and unresolved items. This document option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-experience evidence folder." },
          { id: "doc3", label: "Combine patient-experience evidence folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns patient-experience evidence folder during qapi minutes, board reporting, and program effectiveness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for qapi minutes, board reporting, and program effectiveness." },
        ],
        feedback: {
          observed: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness.",
          meaning: "Observe the real patient-experience evidence folder in the photographed scene. Compare it with the quality trend chart with shapes but no readable text, current controlled sources, assigned decision rights, and corroborating records for qapi minutes, board reporting, and program effectiveness. Identify the verified status, discrepancy, affected requirement, and accountable owner for qapi minutes, board reporting, and program effectiveness by reconciling all three photographed evidence objects with the current controlled source. For patient-experience evidence folder, compare the visible evidence with quality trend chart with shapes but no readable text and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. Apply that decision specifically to patient-experience evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for qapi minutes, board reporting, and program effectiveness. For patient-experience evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["QA-PG-001","QA-PG-002","QA-PG-003","QA-PI-001","QA-PI-002","QA-PI-003","QA-PI-004","QA-SM-003","QA-SM-004","QA-SM-005","42 CFR § 484.65","42 CFR § 484.65(a)","42 CFR § 484.65(c)","42 CFR Part 484","42 CFR § 484.65(b)","42 CFR § 484.65(d)","42 CFR § 484.65(e)","42 CFR § 484.105"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During governing-body and administrator qapi accountability, the patient-experience evidence folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send patient-experience evidence folder to an unrelated department rather than the policy owner responsible for governing-body and administrator qapi accountability. This option concerns governing-body and administrator qapi accountability.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability.",
      "Treat patient-experience evidence folder as final approval because the artifact exists during governing-body and administrator qapi accountability.",
      "Approve patient-experience evidence folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns governing-body and administrator qapi accountability.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing-body and administrator qapi accountability. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 2,
    stem: "During program scope, data sources, measures, and data integrity, the quality trend chart with shapes but no readable text evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in quality trend chart with shapes but no readable text remains unresolved. This option concerns program scope, data sources, measures, and data integrity.",
      "Treat quality trend chart with shapes but no readable text as final approval because the artifact exists during program scope, data sources, measures, and data integrity.",
      "Replace the controlling requirement with an informal local workaround tailored to quality trend chart with shapes but no readable text. This option concerns program scope, data sources, measures, and data integrity.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in program scope, data sources, measures, and data integrity. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 3,
    stem: "During prioritize high-risk, high-volume, and problem-prone processes, the performance-improvement charter binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close performance-improvement charter binder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns prioritize high-risk, high-volume, and problem-prone processes.",
      "Treat performance-improvement charter binder as final approval because the artifact exists during prioritize high-risk, high-volume, and problem-prone processes.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes.",
      "Defer the performance-improvement charter binder decision to a routine future cycle even though current operations depend on it. This option concerns prioritize high-risk, high-volume, and problem-prone processes.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in prioritize high-risk, high-volume, and problem-prone processes. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 4,
    stem: "During performance-improvement project charter and root-cause design, the patient-experience evidence folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design.",
      "Send patient-experience evidence folder to an unrelated department rather than the policy owner responsible for performance-improvement project charter and root-cause design. This option concerns performance-improvement project charter and root-cause design.",
      "Approve patient-experience evidence folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns performance-improvement project charter and root-cause design.",
      "Treat patient-experience evidence folder as final approval because the artifact exists during performance-improvement project charter and root-cause design.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance-improvement project charter and root-cause design. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 5,
    stem: "During implement, measure, sustain, and spread corrective change, the quality trend chart with shapes but no readable text evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Replace the controlling requirement with an informal local workaround tailored to quality trend chart with shapes but no readable text. This option concerns implement, measure, sustain, and spread corrective change.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change.",
      "Treat quality trend chart with shapes but no readable text as final approval because the artifact exists during implement, measure, sustain, and spread corrective change.",
      "Allow the affected activity to expand while the exception in quality trend chart with shapes but no readable text remains unresolved. This option concerns implement, measure, sustain, and spread corrective change.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in implement, measure, sustain, and spread corrective change. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 6,
    stem: "During patient outcomes, experience, utilization, and public quality metrics, the performance-improvement charter binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the performance-improvement charter binder decision to a routine future cycle even though current operations depend on it. This option concerns patient outcomes, experience, utilization, and public quality metrics.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics.",
      "Treat performance-improvement charter binder as final approval because the artifact exists during patient outcomes, experience, utilization, and public quality metrics.",
      "Close performance-improvement charter binder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns patient outcomes, experience, utilization, and public quality metrics.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient outcomes, experience, utilization, and public quality metrics. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 7,
    stem: "During qapi minutes, board reporting, and program effectiveness, the patient-experience evidence folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat patient-experience evidence folder as final approval because the artifact exists during qapi minutes, board reporting, and program effectiveness.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness.",
      "Approve patient-experience evidence folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns qapi minutes, board reporting, and program effectiveness.",
      "Send patient-experience evidence folder to an unrelated department rather than the policy owner responsible for qapi minutes, board reporting, and program effectiveness. This option concerns qapi minutes, board reporting, and program effectiveness.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in qapi minutes, board reporting, and program effectiveness. The decision remains traceable to QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-SM-003, QA-SM-004, QA-SM-005.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.65 be used within QAPI Program Leadership?",
    options: [
      "Apply the citation outside its stated subject and scope.",
      "Treat a citation label as proof that every operational detail is current.",
      "Replace the controlled agency policies with course narration.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
    ],
    correct: 3,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links performance-improvement charter binder and performance-improvement charter binder into an accountable QAPI Program Leadership control?",
    options: [
      "A familiar dashboard color without source validation.",
      "An unversioned local worksheet with no assigned reviewer.",
      "A verbal understanding that no exception will recur.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of QAPI Program Leadership establish?",
    options: [
      "Permission to replace the controlled policies with the QAPI Program Leadership quiz result.",
      "Knowledge of the controlled administrator concepts in QAPI Program Leadership, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Observed operational competency without an authorized evaluator.",
      "Automatic appointment authority for every decision described in QAPI Program Leadership.",
    ],
    correct: 1,
    rationale: "The module is a knowledge experience only; governance and authorization decisions remain outside the quiz.",
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

          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this evidence mean for administrator practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}

          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the administrator do next?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}

          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}

          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Decision feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the administrator should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}

        </div>

      </div>

    </div>, document.body,

  );

}



function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {

  const more = page.narration.length > 1;

  return (

    <div>

      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>

      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>

      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>

      <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>

      {more && (

        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>

          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>

          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>

            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}

          </div>

        </details>

      )}

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Administrator Actions</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>

        {page.keyPoints.map((kp, index) => (

          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10, minWidth: 0, overflow: 'hidden' }}>

            <span style={{ fontSize: 18 }} aria-hidden>{kp.icon}</span>

            <div>

              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2, overflowWrap: 'anywhere' }}>{kp.title}</div>

              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45, overflowWrap: 'anywhere' }}>{kp.detail}</div>

            </div>

          </div>

        ))}

      </div>

      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>

        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Administrator Tip</div>

        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>

      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>

        {page.sourceLabels.map((s) => (

          <span key={s.kind + s.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.kind}: {s.text}</span>

        ))}

      </div>

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

              { label: 'Conditional', color: CI.orange, tip: 'Policy-owner review required' },

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





const STORAGE_KEY = 'adm-010-progress-v6000';



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



export default function ADM010() {

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

          <span className="brand-text">ADM-010 — QAPI</span>

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
