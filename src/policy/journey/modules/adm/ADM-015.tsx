/**
 * ADM-015 — Administrator Performance & Accountability
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

import img01 from './assets/adm-015/adm-015-lesson-01.png';
import img02 from './assets/adm-015/adm-015-lesson-02.png';
import img03 from './assets/adm-015/adm-015-lesson-03.png';
import img04 from './assets/adm-015/adm-015-lesson-04.png';
import img05 from './assets/adm-015/adm-015-lesson-05.png';
import img06 from './assets/adm-015/adm-015-lesson-06.png';
import img07 from './assets/adm-015/adm-015-lesson-07.png';



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



const MODULE_META = { id: "ADM-015", title: "Administrator Performance & Accountability", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Performance expectations traced to appointment, strategy, and regulation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Balanced measures across compliance, operations, finance, quality, people, and risk, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Evidence-based self-assessment and governing-body evaluation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Goal setting, professional development, and quarterly progress, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Performance gap, corrective plan, support, and re-evaluation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Succession, alternate coverage, and leadership continuity, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Annual accountability report and formal governing-body decision, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Perform",
    title: "Performance expectations traced to appointment, strategy, and regulation",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for performance expectations traced to appointment, strategy, and regulation within Administrator Performance & Accountability. Begin with the current controlled versions of GV-OG-002, HR-ER-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-OG-002, Appointment of the Administrator. Formally appoint the Administrator through a documented action recorded in Governing Body meeting minutes per GV-GB-002. The appointment documentation must include: (a) the individual's name; (b) effective date of appointment; (c) qualifications verified; (d) scope of delegated authority (referencing GV-OG-005); (e) reporting relationship (reports directly to Governing Body). The responsible role is Governing Body; the stated timing is Prior to initial agency operation; within 30 calendar days of any vacancy per GV-GB-001.. Verify all minimum qualifications prior to the Governing Body's formal appointment. Verification shall include: (a) education credentials (original or certified copies); (b) employment history verification; (c) professional references; (d) criminal background check per. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Administrator Performance Evaluation. Conduct or commission an annual performance evaluation of the Administrator per GV-GB-001, Section 6.2.2.4. The evaluation shall assess: (a) operational management effectiveness; (b) regulatory compliance record; (c) financial performance; (d) quality outcomes; (e) personnel management; (f) implementation of Governing Body directives; (g) leadership and communication. The responsible role is Governing Body; the stated timing is Annually; completed within 60 calendar days of the end of each fiscal year.. Document the evaluation results and any corrective directives in executive session minutes. Provide written feedback to the Administrator within 14 calendar days of the evaluation meeting. The responsible role is Governing Body Chair; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-001, Below-Expectations Performance. If the overall rating is \"Below Expectations\" or \"Unsatisfactory\": develop a Performance Improvement Plan (PIP) per HR-ER-002 in coordination with the HR Director. The responsible role is Supervisor; the stated timing is PIP developed within 14 calendar days of evaluation.. Review PIP progress at defined intervals. Document progress or continued deficiency. The responsible role is Supervisor; the stated timing is Per PIP schedule (typically 30/60/90 days)... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, APPENDICES. Appendix A — Administrator Qualification Verification Checklist Care Indeed Home Health Care, Inc. Policy Reference: GV-OG-002 | Version: 6.0 | Date: 2025-07-10 Purpose: To document verification of all minimum qualifications for the Administrator position prior to Governing Body appointment. Instructions: The HR Director shall complete this checklist prior to the Governing Body's formal appointment action. All items must be verified and documented before the appointment is finalized. Candidate Name: _________________________ #: Qualification Item. Source or operational basis: Verified (Y/N). 1: Education credentials (degree or equivalent). Source or operational basis: . 2: Minimum 2 years healthcare administration experience. Source or operational basis: . 3: Minimum 1. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, 7\\. Documentation Requirements. Administrator appointment: Written appointment documented in Governing Body minutes (GV-GB-002); formal appointment letter.. Source or operational basis: Governing Body Chair. Qualification verification: Documented verification of education, experience, background check, exclusion screening, and any licensure.. Source or operational basis: HR Director. Annual performance evaluation: Written evaluation documented in executive session minutes; written feedback to Administrator.. Source or operational basis: Governing Body. Ongoing exclusion screening: Monthly OIG/SAM screening results per HR-TA-003.. Source or operational basis: Compliance Officer. Absence notification: Written notification to Governing Body Chair for absences exceeding 5 business days; designee identification.. Source or operational basis: Administrator. Financial reports to Governing Body: Quarterly financial performance reports... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to performance expectations traced to appointment, strategy, and regulation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "performance-evaluation-portfolio-1-1", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 24, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance expectations traced to appointment, strategy, and regulation." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for performance expectations traced to appointment, strategy, and regulation. This decide option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance expectations traced to appointment, strategy, and regulation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance expectations traced to appointment, strategy, and regulation." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "blank-balanced-scorecard-1-2", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 35, y: 66, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in performance expectations traced to appointment, strategy, and regulation. This identify option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance expectations traced to appointment, strategy, and regulation." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance expectations traced to appointment, strategy, and regulation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance expectations traced to appointment, strategy, and regulation." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "succession-planning-binder-1-3", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 77, y: 47, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance expectations traced to appointment, strategy, and regulation." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance expectations traced to appointment, strategy, and regulation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during performance expectations traced to appointment, strategy, and regulation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance expectations traced to appointment, strategy, and regulation." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance expectations traced to appointment, strategy, and regulation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance expectations traced to appointment, strategy, and regulation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance expectations traced to appointment, strategy, and regulation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Balance",
    title: "Balanced measures across compliance, operations, finance, quality, people, and risk",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for balanced measures across compliance, operations, finance, quality, people, and risk within Administrator Performance & Accountability. Begin with the current controlled versions of GV-GB-005, GV-OG-002, QA-PI-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-005, APPENDICES. Appendix A — Annual Governance Self-Assessment Tool Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-005 | Version: 6.0 | Date: 2025-07-10 ACCESS RESTRICTION: This completed form is a Tier 4 — Privileged record. Submit only to the Compliance Officer. Do not submit to the Administrator, Governing Body Chair, or any other individual. Instructions: Rate each item based on your honest, independent assessment of the Governing Body's performance over the past 12 months. Use the rating scale below. Add comments where useful to support aggregated discussion. Complete independently before the Q1 meeting or at the meeting before group discussion begins. Rating Scale: 3 — Performing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Core Responsibilities of the Administrator. The Administrator of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities. While the Administrator may delegate specific tasks in accordance with GV-OG-005, the Administrator retains accountability to the Governing Body for all functions. 6.3.1 — Agency Operations Management Oversee the day-to-day operations of the agency including all clinical, administrative, financial, and compliance functions. Ensure all operations comply with federal, state, and local laws, the agency's policies, and the directives of the Governing Body. The responsible role is Administrator; the stated timing is Continuous.. Maintain the agency's organizational structure (GV-OG-001) and ensure all positions are filled with qualified personnel. Report any vacancy in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, How Compliance Is Measured. Annual self-assessment is conducted at Q1 each year.: Review of Q1 meeting minutes confirming self-assessment was conducted and aggregated findings were discussed.. Source or operational basis: Self-assessment conducted and documented in Q1 minutes in every calendar year.. Majority of Governing Body members complete individual assessments.: Compliance Officer records number of completed forms received against current member roster.. Source or operational basis: Minimum 75% completion rate; 100% target; any non-completion documented with reason.. Governance Self-Assessment Summary Report completed within 35 days of Q1 meeting.: Review of report filing date against Q1 meeting date.. Source or operational basis: Report finalized and filed within 35 calendar days of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Escalation and Exception Handling. Fewer than a majority of Governing Body members complete individual self-assessment forms.: Governing Body Chair notifies Administrator in writing.. Source or operational basis: Chair issues a follow-up request to non-completing members with a 7-calendar-day deadline. If quorum of completed forms is not achieved, the group discussion and action plan are deferred to a special meeting.. Self-assessment identifies a critical regulatory compliance gap (e.g., QAPI oversight failure, conflict of interest management deficiency).: Governing Body Chair immediately escalates to Compliance Officer.. Source or operational basis: Compliance Officer assesses whether the gap constitutes an active compliance risk requiring corrective action under policy QA-AE-003. If so, a corrective action. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-004, How Compliance Is Measured. Quality improvement decisions supported by data.: Annual audit of Decision Support Summaries for a sample of QAPI decisions.. Source or operational basis: ≥ 90% of audited decisions have documented data support.. QAPI Committee evaluates data quality of proposals.: Review of committee minutes for documented evaluation.. Source or operational basis: Evidence of data evaluation documented at ≥ 80% of meetings where proposals are reviewed.. Data literacy training completed by all required staff.: Review of training records.. Source or operational basis: 100% of QAPI Committee members and department heads trained within required timeframes.. Anecdotal concerns validated with data before action.: Review of validation records.. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to balanced measures across compliance, operations, finance, quality, people, and risk. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "blank-balanced-scorecard-2-1", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in balanced measures across compliance, operations, finance, quality, people, and risk. This identify option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for balanced measures across compliance, operations, finance, quality, people, and risk." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "succession-planning-binder-2-2", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 34, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for balanced measures across compliance, operations, finance, quality, people, and risk." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "performance-evaluation-portfolio-2-3", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 85, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for balanced measures across compliance, operations, finance, quality, people, and risk." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for balanced measures across compliance, operations, finance, quality, people, and risk. This decide option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during balanced measures across compliance, operations, finance, quality, people, and risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for balanced measures across compliance, operations, finance, quality, people, and risk." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for balanced measures across compliance, operations, finance, quality, people, and risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for balanced measures across compliance, operations, finance, quality, people, and risk by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for balanced measures across compliance, operations, finance, quality, people, and risk. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Evidenc",
    title: "Evidence-based self-assessment and governing-body evaluation",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for evidence-based self-assessment and governing-body evaluation within Administrator Performance & Accountability. Begin with the current controlled versions of HR-ER-001, GV-GB-005, HR-TD-003, GV-OG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-ER-001, Evaluation Schedule and Preparation. Maintain an Evaluation Due Date Tracker (Appendix B). Send reminder to supervisors 45 days before each employee's evaluation due date. The responsible role is HR Director; the stated timing is 45 days before due date.. Gather evaluation inputs: (a) job description and performance expectations; (b) previous evaluation and any PIP status; (c) competency evaluation results (HR-TD-003); (d) training compliance records (HR-TD-001); (e) attendance records; (f) documented performance observations, commendations, and corrective actions from the evaluation period. The responsible role is Supervisor; the stated timing is During the 30 days before the evaluation meeting.. Complete the Employee Self-Assessment Section of the Performance Evaluation Form (Appendix A. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Self-Assessment Preparation. Prepare the annual self-assessment materials for distribution to each Governing Body member. Materials shall include: (a) a copy of the Self-Assessment Tool (Appendix A); (b) a copy of the prior year's Governance Self-Assessment Summary Report and Improvement Action Plan for reference; (c) a copy of the current year's policy GV-GB-001 (Governing Body Authority & Responsibilities) for reference; (d) instructions for completing the self-assessment form. The responsible role is Compliance Officer; the stated timing is Materials prepared and distributed to all Governing Body members no later than 14 calendar days before the Q1 meeting.. Review the prior year's Improvement Action Plan and prepare a brief status. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TD-003, Annual Competency Evaluation. By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. The responsible role is Director of Nursing / HR Director; the stated timing is By January 31 each year.. Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific competencies; (c) agency focus competencies per the annual. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Administrator Performance Evaluation. Conduct or commission an annual performance evaluation of the Administrator per GV-GB-001, Section 6.2.2.4. The evaluation shall assess: (a) operational management effectiveness; (b) regulatory compliance record; (c) financial performance; (d) quality outcomes; (e) personnel management; (f) implementation of Governing Body directives; (g) leadership and communication. The responsible role is Governing Body; the stated timing is Annually; completed within 60 calendar days of the end of each fiscal year.. Document the evaluation results and any corrective directives in executive session minutes. Provide written feedback to the Administrator within 14 calendar days of the evaluation meeting. The responsible role is Governing Body Chair; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-001, Evaluation Meeting. Conduct a face-to-face evaluation meeting (in-person preferred; video acceptable). Review: (a) each performance area and rating; (b) employee self-assessment; (c) strengths; (d) areas for improvement; (e) professional development goals; (f) for clinical staff: competency evaluation results and QAPI-related performance data. The responsible role is Supervisor; the stated timing is Within 30 days of anniversary date.. Collaborate to set performance goals for the next evaluation period (Appendix A, Section 4). Goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound). The responsible role is Supervisor / Employee; the stated timing is During evaluation meeting.. Sign the evaluation form acknowledging receipt. The employee's signature indicates receipt and discussion. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to evidence-based self-assessment and governing-body evaluation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
      { kind: "External Authority", text: "42 CFR §484.100(b)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "succession-planning-binder-3-1", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evidence-based self-assessment and governing-body evaluation." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evidence-based self-assessment and governing-body evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evidence-based self-assessment and governing-body evaluation." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "performance-evaluation-portfolio-3-2", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 41, y: 39, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evidence-based self-assessment and governing-body evaluation." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for evidence-based self-assessment and governing-body evaluation. This decide option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evidence-based self-assessment and governing-body evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evidence-based self-assessment and governing-body evaluation." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "blank-balanced-scorecard-3-3", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in evidence-based self-assessment and governing-body evaluation. This identify option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evidence-based self-assessment and governing-body evaluation." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evidence-based self-assessment and governing-body evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during evidence-based self-assessment and governing-body evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evidence-based self-assessment and governing-body evaluation." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for evidence-based self-assessment and governing-body evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for evidence-based self-assessment and governing-body evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evidence-based self-assessment and governing-body evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Goal",
    title: "Goal setting, professional development, and quarterly progress",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for goal setting, professional development, and quarterly progress within Administrator Performance & Accountability. Begin with the current controlled versions of GV-OG-004, GV-GB-005, HR-ER-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-OG-004, Quarterly Progress Review. Prepare a quarterly strategic plan progress report that includes: (a) status of each operational objective (on track / at risk / off track / completed); (b) KPI performance against targets; (c) barriers and challenges identified; (d) corrective actions taken or proposed; (e) resource reallocation needs. The responsible role is Administrator; the stated timing is Prepared at least 7 calendar days before each quarterly Governing Body meeting.. Present the quarterly strategic plan progress report to the Governing Body as part of the Administrator's regular report per GV-GB-001, Section 6.2.5.2. The responsible role is Administrator; the stated timing is At each quarterly Governing Body meeting.. Review the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Improvement Action Plan Monitoring. Monitor progress on each Improvement Action Plan item throughout the year. At each quarterly Governing Body meeting, include a brief standing item in the agenda for action plan status update. The responsible role is Governing Body Chair; the stated timing is Quarterly; included in each regular meeting agenda.. Report status of assigned improvement actions at each quarterly meeting where the item remains open. Status shall include: (a) actions completed; (b) actions in progress with percentage completion and current obstacles; (c) actions not yet initiated with explanation and revised target date. The responsible role is Responsible Party for Each Action Item; the stated timing is At. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-004, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall develop, document, and maintain an annual strategic plan that defines the agency's priorities, goals, and operational objectives for the upcoming year. 4.2 The strategic plan shall be developed under the direction of the Administrator with input from all department heads and presented to the Governing Body for review and approval at the first quarterly meeting of each calendar year or within 30 calendar days of the start of the agency's fiscal year. 4.3 The strategic plan shall include, at minimum: (a) a mission and vision statement; (b) strategic priorities for the planning period; (c) measurable goals with. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-004, 7\\. Documentation Requirements. Annual strategic plan: Written strategic plan document with priorities, objectives, KPIs, timelines, and accountable parties.. Source or operational basis: Administrator (development); Governing Body (approval). Governing Body approval: Meeting minutes documenting review and approval of the strategic plan per GV-GB-002.. Source or operational basis: Designated Secretary. Quarterly progress reports: Written progress reports on strategic goal achievement.. Source or operational basis: Administrator. SWOT analysis: Documented environmental assessment.. Source or operational basis: Administrator / Department Heads. Plan modifications: Written modification proposals and Governing Body approval.. Source or operational basis: Administrator. Policy acknowledgment: Signed acknowledgment of this policy (Appendix B).. Source or operational basis: Each individual (completion); Administrator (collection).. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-001, 12\\. Appendices. Appendix A — Performance Evaluation Form Care Indeed Home Health Care, Inc. | HR-ER-001 | v6.0 SECTION 1 — EMPLOYEE INFORMATION Employee Name. __________________. Position. __________________. Department. __________________. Supervisor. __________________. Evaluation Period. ________ to ________. Evaluation Type: ☐ Annual ☐ 90-Day ☐ Other: _____. SECTION 2 — SUPERVISOR EVALUATION #: Performance Area. Source or operational basis: Rating (5=Exceptional, 4=Exceeds, 3=Meets, 2=Below, 1=Unsatisfactory). 1: Job Knowledge & Clinical/Technical Skills. Source or operational basis: ☐5 ☐4 ☐3 ☐2 ☐1. 2: Quality of Work / Accuracy. Source or operational basis: ☐5 ☐4 ☐3 ☐2 ☐1. 3: Productivity / Efficiency. Source or operational basis: ☐5 ☐4 ☐3 ☐2 ☐1.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to goal setting, professional development, and quarterly progress. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR §484.100(b)" },
      { kind: "External Authority", text: "42 CFR §484.105(a)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "performance-evaluation-portfolio-4-1", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 21, y: 45, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for goal setting, professional development, and quarterly progress." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for goal setting, professional development, and quarterly progress. This decide option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during goal setting, professional development, and quarterly progress." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for goal setting, professional development, and quarterly progress." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "blank-balanced-scorecard-4-2", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 31, y: 77, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in goal setting, professional development, and quarterly progress. This identify option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for goal setting, professional development, and quarterly progress." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during goal setting, professional development, and quarterly progress." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for goal setting, professional development, and quarterly progress." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "succession-planning-binder-4-3", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 81, y: 55, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for goal setting, professional development, and quarterly progress." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during goal setting, professional development, and quarterly progress." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during goal setting, professional development, and quarterly progress.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for goal setting, professional development, and quarterly progress." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for goal setting, professional development, and quarterly progress. Identify the verified status, discrepancy, affected requirement, and accountable owner for goal setting, professional development, and quarterly progress by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for goal setting, professional development, and quarterly progress. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Perform",
    title: "Performance gap, corrective plan, support, and re-evaluation",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for performance gap, corrective plan, support, and re-evaluation within Administrator Performance & Accountability. Begin with the current controlled versions of GV-OG-004, GV-GB-005, GV-OG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-OG-004, Annual Strategic Planning Process. Initiate the annual strategic planning process by convening a strategic planning session with all department heads (Director of Nursing, Compliance Officer, HR Director, CFO/Revenue Cycle Director, Operations Director, IT Director, Risk Manager, QAPI Coordinator). The responsible role is Administrator; the stated timing is Q4 of the current planning period; at least 60 calendar days before the start of the new planning period.. Conduct an environmental assessment including: (a) SWOT analysis; (b) review of prior year strategic goal achievement; (c) regulatory environment scan (upcoming CMS rule changes, state requirements, OASIS updates); (d) financial performance review; (e) quality data review (Star Ratings, HHCAHPS, QAPI outcomes); (f) workforce. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Governance Self-Assessment Summary Report and Improvement Action Plan. Prepare or oversee preparation of the Governance Self-Assessment Summary Report (Appendix B) following the Q1 meeting. The report shall document: (a) the assessment period (calendar year assessed); (b) the number of members who completed individual assessments; (c) aggregated domain ratings — strength, satisfactory, or needs improvement; (d) identified governance strengths; (e) identified improvement priorities with supporting rationale. The responsible role is Governing Body Chair; the stated timing is Draft completed within 21 calendar days of the Q1 meeting.. Develop the Governance Improvement Action Plan as part of the Summary Report. For each domain rated as needing improvement, the plan shall specify: (a) the specific improvement. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Administrator Performance Evaluation. Conduct or commission an annual performance evaluation of the Administrator per GV-GB-001, Section 6.2.2.4. The evaluation shall assess: (a) operational management effectiveness; (b) regulatory compliance record; (c) financial performance; (d) quality outcomes; (e) personnel management; (f) implementation of Governing Body directives; (g) leadership and communication. The responsible role is Governing Body; the stated timing is Annually; completed within 60 calendar days of the end of each fiscal year.. Document the evaluation results and any corrective directives in executive session minutes. Provide written feedback to the Administrator within 14 calendar days of the evaluation meeting. The responsible role is Governing Body Chair; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Improvement Action Plan Monitoring. Monitor progress on each Improvement Action Plan item throughout the year. At each quarterly Governing Body meeting, include a brief standing item in the agenda for action plan status update. The responsible role is Governing Body Chair; the stated timing is Quarterly; included in each regular meeting agenda.. Report status of assigned improvement actions at each quarterly meeting where the item remains open. Status shall include: (a) actions completed; (b) actions in progress with percentage completion and current obstacles; (c) actions not yet initiated with explanation and revised target date. The responsible role is Responsible Party for Each Action Item; the stated timing is At. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, APPENDICES. Appendix A — Annual Governance Self-Assessment Tool Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-005 | Version: 6.0 | Date: 2025-07-10 ACCESS RESTRICTION: This completed form is a Tier 4 — Privileged record. Submit only to the Compliance Officer. Do not submit to the Administrator, Governing Body Chair, or any other individual. Instructions: Rate each item based on your honest, independent assessment of the Governing Body's performance over the past 12 months. Use the rating scale below. Add comments where useful to support aggregated discussion. Complete independently before the Q1 meeting or at the meeting before group discussion begins. Rating Scale: 3 — Performing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to performance gap, corrective plan, support, and re-evaluation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR §484.105(a)" },
      { kind: "External Authority", text: "42 CFR §484.105(h)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "blank-balanced-scorecard-5-1", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 14, y: 68, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in performance gap, corrective plan, support, and re-evaluation. This identify option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance gap, corrective plan, support, and re-evaluation." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance gap, corrective plan, support, and re-evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance gap, corrective plan, support, and re-evaluation." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "succession-planning-binder-5-2", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 33, y: 52, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance gap, corrective plan, support, and re-evaluation." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance gap, corrective plan, support, and re-evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance gap, corrective plan, support, and re-evaluation." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "performance-evaluation-portfolio-5-3", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 80, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance gap, corrective plan, support, and re-evaluation." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for performance gap, corrective plan, support, and re-evaluation. This decide option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance gap, corrective plan, support, and re-evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during performance gap, corrective plan, support, and re-evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance gap, corrective plan, support, and re-evaluation." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for performance gap, corrective plan, support, and re-evaluation. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance gap, corrective plan, support, and re-evaluation by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance gap, corrective plan, support, and re-evaluation. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Success",
    title: "Succession, alternate coverage, and leadership continuity",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for succession, alternate coverage, and leadership continuity within Administrator Performance & Accountability. Begin with the current controlled versions of GV-OG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-OG-002, Administrator Absence and Succession. Designate a qualified Administrator Designee (HR-JD-002) to act on the Administrator's behalf during planned absences. The designation must be documented in writing and the designee must meet minimum qualifications defined in Section 6.1. The responsible role is Administrator; the stated timing is Prior to any planned absence.. Notify the Governing Body Chair in writing of any planned absence exceeding 5 consecutive business days, identifying the designee and the dates of absence. The responsible role is Administrator; the stated timing is At least 7 calendar days before the planned absence begins.. In the event of an unplanned Administrator absence (illness, incapacitation, termination, resignation), activate the succession. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify: Evidence that an Administrator has been appointed by the Governing Body. Surveyors will review Governing Body minutes for documented appointment. Evidence that the Administrator meets qualification requirements. Surveyors will review the Administrator's personnel file for education, experience, and background verification. Evidence that the Administrator is responsible for day-to-day management. Surveyors will look for documented authority, reporting relationships, and evidence of active management oversight. Evidence that the Administrator reports to the Governing Body. Surveyors will verify reporting relationship through the organizational chart, Governing Body minutes, and interview. Evidence that. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Core Responsibilities of the Administrator. The Administrator of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities. While the Administrator may delegate specific tasks in accordance with GV-OG-005, the Administrator retains accountability to the Governing Body for all functions. 6.3.1 — Agency Operations Management Oversee the day-to-day operations of the agency including all clinical, administrative, financial, and compliance functions. Ensure all operations comply with federal, state, and local laws, the agency's policies, and the directives of the Governing Body. The responsible role is Administrator; the stated timing is Continuous.. Maintain the agency's organizational structure (GV-OG-001) and ensure all positions are filled with qualified personnel. Report any vacancy in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Common Failure Points. Failure Point: Risk. Source or operational basis: Mitigation. No documented Governing Body appointment of the Administrator.: Condition-level deficiency under 42 CFR § 484.105(b).. Source or operational basis: Document appointment in Governing Body minutes; issue formal appointment letter.. Administrator's qualifications are not verified or documented.: Surveyor may find insufficient evidence of a \"qualified\" administrator.. Source or operational basis: Verify all qualifications prior to appointment; maintain verification records in personnel file.. Administrator vacancy exceeds 30 calendar days without interim designee.: Surveyor will cite failure to ensure adequate management.. Source or operational basis: Maintain succession plan (GV-GB-004); appoint interim within 14 days per GV-GB-001.. No evidence of Administrator. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, 10\\. Training & Acknowledgment Requirements. 10.1 The Administrator shall receive comprehensive orientation to this policy and all Governing Body-level governance policies (GV-GB-001 through GV-GB-005, GV-OG-001 through GV-OG-005) within 14 calendar days of appointment. Orientation shall be conducted by the Governing Body Chair or designated member and shall cover: (a) qualifications and ongoing eligibility requirements; (b) scope of authority and delegation limits; (c) reporting obligations to the Governing Body; (d) financial, compliance, and quality oversight responsibilities; (e) performance evaluation process; (f) absence and succession requirements. 10.2 The Administrator and all personnel within scope (Section 3) shall sign the Policy Acknowledgment Form (Appendix C) within 14 calendar days of the policy effective. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to succession, alternate coverage, and leadership continuity. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR §484.105(h)" },
      { kind: "External Authority", text: "42 CFR §484.65(e)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "succession-planning-binder-6-1", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for succession, alternate coverage, and leadership continuity." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during succession, alternate coverage, and leadership continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for succession, alternate coverage, and leadership continuity." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "performance-evaluation-portfolio-6-2", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 35, y: 53, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for succession, alternate coverage, and leadership continuity." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for succession, alternate coverage, and leadership continuity. This decide option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during succession, alternate coverage, and leadership continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for succession, alternate coverage, and leadership continuity." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "blank-balanced-scorecard-6-3", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in succession, alternate coverage, and leadership continuity. This identify option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for succession, alternate coverage, and leadership continuity." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during succession, alternate coverage, and leadership continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during succession, alternate coverage, and leadership continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for succession, alternate coverage, and leadership continuity." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for succession, alternate coverage, and leadership continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for succession, alternate coverage, and leadership continuity by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for succession, alternate coverage, and leadership continuity. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Annual",
    title: "Annual accountability report and formal governing-body decision",
    subtitle: "Administrator Performance & Accountability",
    narration: [
      "This lesson develops administrator judgment for annual accountability report and formal governing-body decision within Administrator Performance & Accountability. Begin with the current controlled versions of GV-GB-005, QA-PI-004, HR-TD-003, GV-OG-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-005, Governance Self-Assessment Summary Report and Improvement Action Plan. Prepare or oversee preparation of the Governance Self-Assessment Summary Report (Appendix B) following the Q1 meeting. The report shall document: (a) the assessment period (calendar year assessed); (b) the number of members who completed individual assessments; (c) aggregated domain ratings — strength, satisfactory, or needs improvement; (d) identified governance strengths; (e) identified improvement priorities with supporting rationale. The responsible role is Governing Body Chair; the stated timing is Draft completed within 21 calendar days of the Q1 meeting.. Develop the Governance Improvement Action Plan as part of the Summary Report. For each domain rated as needing improvement, the plan shall specify: (a) the specific improvement. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-PI-004, Decision Criteria and Documentation Requirements. When proposing a quality improvement action, process change, or resource allocation, prepare a Decision Support Summary that includes: (a) Issue Statement — concise description of the problem or opportunity; (b) Data Presented — specific data sources, sample size, timeframe, and methodology; (c) Analysis — description of how the data was analyzed (trending, stratification, comparison, RCA); (d) Findings — key data findings that support the proposed action; (e) Recommended Action — specific action proposed with rationale directly linked to data findings; (f) Expected Outcome — measurable outcome expected from the action; (g) Monitoring Plan — how the impact of the action will be measured. The responsible. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TD-003, Annual Competency Evaluation. By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. The responsible role is Director of Nursing / HR Director; the stated timing is By January 31 each year.. Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific competencies; (c) agency focus competencies per the annual. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, APPENDICES. Appendix A — Annual Governance Self-Assessment Tool Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-005 | Version: 6.0 | Date: 2025-07-10 ACCESS RESTRICTION: This completed form is a Tier 4 — Privileged record. Submit only to the Compliance Officer. Do not submit to the Administrator, Governing Body Chair, or any other individual. Instructions: Rate each item based on your honest, independent assessment of the Governing Body's performance over the past 12 months. Use the rating scale below. Add comments where useful to support aggregated discussion. Complete independently before the Q1 meeting or at the meeting before group discussion begins. Rating Scale: 3 — Performing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-OG-002, Core Responsibilities of the Administrator. The Administrator of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities. While the Administrator may delegate specific tasks in accordance with GV-OG-005, the Administrator retains accountability to the Governing Body for all functions. 6.3.1 — Agency Operations Management Oversee the day-to-day operations of the agency including all clinical, administrative, financial, and compliance functions. Ensure all operations comply with federal, state, and local laws, the agency's policies, and the directives of the Governing Body. The responsible role is Administrator; the stated timing is Continuous.. Maintain the agency's organizational structure (GV-OG-001) and ensure all positions are filled with qualified personnel. Report any vacancy in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to annual accountability report and formal governing-body decision. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "performance evaluation portfolio", detail: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank balanced scorecard", detail: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "succession planning binder", detail: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-002" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "QA-PI-004" },
      { kind: "External Authority", text: "42 CFR §484.65(e)" },
      { kind: "External Authority", text: "42 CFR § 484.105(b)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "performance-evaluation-portfolio-7-1", label: "performance evaluation portfolio", shortLabel: "performance evaluation portfol", ariaLabel: "Investigate performance evaluation portfolio",
        x: 14, y: 77, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status." },
          { id: "i2", label: "Treat performance evaluation portfolio as complete proof without comparing blank balanced scorecard or the controlled source. This identify option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for annual accountability report and formal governing-body decision." },
          { id: "i3", label: "Classify the performance evaluation portfolio by department custom even though its authority and current status are unverified. This identify option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about performance evaluation portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve performance evaluation portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for performance evaluation portfolio is resolved." },
          { id: "d3", label: "Send performance evaluation portfolio to an unrelated department rather than the policy owner responsible for annual accountability report and formal governing-body decision. This decide option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during annual accountability report and formal governing-body decision." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that performance evaluation portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of performance evaluation portfolio." },
          { id: "doc3", label: "Keep the performance evaluation portfolio decision in personal notes rather than the governed evidence location. This document option concerns performance evaluation portfolio during annual accountability report and formal governing-body decision.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for annual accountability report and formal governing-body decision." },
        ],
        feedback: {
          observed: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
          meaning: "Observe the real performance evaluation portfolio in the photographed scene. Compare it with the blank balanced scorecard, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For performance evaluation portfolio, compare the visible evidence with blank balanced scorecard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to performance evaluation portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For performance evaluation portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "blank-balanced-scorecard-7-2", label: "blank balanced scorecard", shortLabel: "blank balanced scorecard", ariaLabel: "Investigate blank balanced scorecard",
        x: 54, y: 70, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank balanced scorecard applies to every role, location, and exception described in annual accountability report and formal governing-body decision. This identify option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for annual accountability report and formal governing-body decision." },
          { id: "i3", label: "Use the oldest available blank balanced scorecard because prior approval is easier to confirm. This identify option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank balanced scorecard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank balanced scorecard remains unresolved. This decide option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank balanced scorecard is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank balanced scorecard. This decide option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during annual accountability report and formal governing-body decision." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank balanced scorecard closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank balanced scorecard." },
          { id: "doc3", label: "Retain only a summary of blank balanced scorecard and discard the source artifact needed to reconstruct the decision. This document option concerns blank balanced scorecard during annual accountability report and formal governing-body decision.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for annual accountability report and formal governing-body decision." },
        ],
        feedback: {
          observed: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
          meaning: "Observe the real blank balanced scorecard in the photographed scene. Compare it with the succession planning binder, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For blank balanced scorecard, compare the visible evidence with succession planning binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to blank balanced scorecard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For blank balanced scorecard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "succession-planning-binder-7-3", label: "succession planning binder", shortLabel: "succession planning binder", ariaLabel: "Investigate succession planning binder",
        x: 75, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read succession planning binder only for favorable indicators and omit the exception evidence connected to performance evaluation portfolio. This identify option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for annual accountability report and formal governing-body decision." },
          { id: "i3", label: "Treat an unsigned or unverified succession planning binder as equivalent to the current controlled record. This identify option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about succession planning binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close succession planning binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for succession planning binder is resolved." },
          { id: "d3", label: "Defer the succession planning binder decision to a routine future cycle even though current operations depend on it. This decide option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during annual accountability report and formal governing-body decision." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For succession planning binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For succession planning binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for succession planning binder but omit the actual evidence, communications, and unresolved items. This document option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of succession planning binder." },
          { id: "doc3", label: "Combine succession planning binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns succession planning binder during annual accountability report and formal governing-body decision.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for annual accountability report and formal governing-body decision." },
        ],
        feedback: {
          observed: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision.",
          meaning: "Observe the real succession planning binder in the photographed scene. Compare it with the performance evaluation portfolio, current controlled sources, assigned decision rights, and corroborating records for annual accountability report and formal governing-body decision. Identify the verified status, discrepancy, affected requirement, and accountable owner for annual accountability report and formal governing-body decision by reconciling all three photographed evidence objects with the current controlled source. For succession planning binder, compare the visible evidence with performance evaluation portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. Apply that decision specifically to succession planning binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for annual accountability report and formal governing-body decision. For succession planning binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-005","GV-OG-002","GV-OG-004","HR-ER-001","HR-TD-003","QA-PI-004","42 CFR § 484.105","42 CFR §484.110","42 CFR § 484.65","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During performance expectations traced to appointment, strategy, and regulation, the succession planning binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation.",
      "Approve succession planning binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns performance expectations traced to appointment, strategy, and regulation.",
      "Send succession planning binder to an unrelated department rather than the policy owner responsible for performance expectations traced to appointment, strategy, and regulation. This option concerns performance expectations traced to appointment, strategy, and regulation.",
      "Treat succession planning binder as final approval because the artifact exists during performance expectations traced to appointment, strategy, and regulation.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance expectations traced to appointment, strategy, and regulation. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 2,
    stem: "During balanced measures across compliance, operations, finance, quality, people, and risk, the performance evaluation portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat performance evaluation portfolio as final approval because the artifact exists during balanced measures across compliance, operations, finance, quality, people, and risk.",
      "Allow the affected activity to expand while the exception in performance evaluation portfolio remains unresolved. This option concerns balanced measures across compliance, operations, finance, quality, people, and risk.",
      "Replace the controlling requirement with an informal local workaround tailored to performance evaluation portfolio. This option concerns balanced measures across compliance, operations, finance, quality, people, and risk.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in balanced measures across compliance, operations, finance, quality, people, and risk. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 3,
    stem: "During evidence-based self-assessment and governing-body evaluation, the blank balanced scorecard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation.",
      "Treat blank balanced scorecard as final approval because the artifact exists during evidence-based self-assessment and governing-body evaluation.",
      "Defer the blank balanced scorecard decision to a routine future cycle even though current operations depend on it. This option concerns evidence-based self-assessment and governing-body evaluation.",
      "Close blank balanced scorecard when work is submitted, without testing whether the correction changed the intended outcome. This option concerns evidence-based self-assessment and governing-body evaluation.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evidence-based self-assessment and governing-body evaluation. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 4,
    stem: "During goal setting, professional development, and quarterly progress, the succession planning binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat succession planning binder as final approval because the artifact exists during goal setting, professional development, and quarterly progress.",
      "Approve succession planning binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns goal setting, professional development, and quarterly progress.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress.",
      "Send succession planning binder to an unrelated department rather than the policy owner responsible for goal setting, professional development, and quarterly progress. This option concerns goal setting, professional development, and quarterly progress.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in goal setting, professional development, and quarterly progress. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 5,
    stem: "During performance gap, corrective plan, support, and re-evaluation, the performance evaluation portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Replace the controlling requirement with an informal local workaround tailored to performance evaluation portfolio. This option concerns performance gap, corrective plan, support, and re-evaluation.",
      "Treat performance evaluation portfolio as final approval because the artifact exists during performance gap, corrective plan, support, and re-evaluation.",
      "Allow the affected activity to expand while the exception in performance evaluation portfolio remains unresolved. This option concerns performance gap, corrective plan, support, and re-evaluation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance gap, corrective plan, support, and re-evaluation. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 6,
    stem: "During succession, alternate coverage, and leadership continuity, the blank balanced scorecard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close blank balanced scorecard when work is submitted, without testing whether the correction changed the intended outcome. This option concerns succession, alternate coverage, and leadership continuity.",
      "Defer the blank balanced scorecard decision to a routine future cycle even though current operations depend on it. This option concerns succession, alternate coverage, and leadership continuity.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity.",
      "Treat blank balanced scorecard as final approval because the artifact exists during succession, alternate coverage, and leadership continuity.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in succession, alternate coverage, and leadership continuity. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 7,
    stem: "During annual accountability report and formal governing-body decision, the succession planning binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat succession planning binder as final approval because the artifact exists during annual accountability report and formal governing-body decision.",
      "Send succession planning binder to an unrelated department rather than the policy owner responsible for annual accountability report and formal governing-body decision. This option concerns annual accountability report and formal governing-body decision.",
      "Approve succession planning binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns annual accountability report and formal governing-body decision.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in annual accountability report and formal governing-body decision. The decision remains traceable to GV-GB-005, GV-OG-002, GV-OG-004, HR-ER-001, HR-TD-003, QA-PI-004.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.105 be used within Administrator Performance & Accountability?",
    options: [
      "Apply the citation outside its stated subject and scope.",
      "Replace the controlled agency policies with course narration.",
      "Treat a citation label as proof that every operational detail is current.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
    ],
    correct: 3,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links blank balanced scorecard and blank balanced scorecard into an accountable Administrator Performance & Accountability control?",
    options: [
      "A verbal understanding that no exception will recur.",
      "A familiar dashboard color without source validation.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "An unversioned local worksheet with no assigned reviewer.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Administrator Performance & Accountability establish?",
    options: [
      "Observed operational competency without an authorized evaluator.",
      "Knowledge of the controlled administrator concepts in Administrator Performance & Accountability, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Automatic appointment authority for every decision described in Administrator Performance & Accountability.",
      "Permission to replace the controlled policies with the Administrator Performance & Accountability quiz result.",
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





const STORAGE_KEY = 'adm-015-progress-v6000';



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



export default function ADM015() {

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

          <span className="brand-text">ADM-015 — Performance</span>

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
