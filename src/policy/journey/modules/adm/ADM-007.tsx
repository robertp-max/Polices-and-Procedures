/**
 * ADM-007 — Human Resources Oversight
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

import img01 from './assets/adm-007/adm-007-lesson-01.png';
import img02 from './assets/adm-007/adm-007-lesson-02.png';
import img03 from './assets/adm-007/adm-007-lesson-03.png';
import img04 from './assets/adm-007/adm-007-lesson-04.png';
import img05 from './assets/adm-007/adm-007-lesson-05.png';
import img06 from './assets/adm-007/adm-007-lesson-06.png';
import img07 from './assets/adm-007/adm-007-lesson-07.png';



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



const MODULE_META = { id: "ADM-007", title: "Human Resources Oversight", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Workforce planning, qualifications, and job-description controls, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Pre-employment screening, exclusions, licensure, and health clearance, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Orientation, training, and competency gates before assignment, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Performance evaluation, coaching, and development, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Progressive discipline, grievance, non-retaliation, and consistency, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Staffing adequacy, scheduling risk, and contingency response, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Personnel-file evidence, workforce dashboard, and governing-body reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Workfor",
    title: "Workforce planning, qualifications, and job-description controls",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for workforce planning, qualifications, and job-description controls within Human Resources Oversight. Begin with the current controlled versions of HR-TA-001, HR-TA-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TA-001, Job Posting and Candidate Sourcing. Develop a job posting that accurately reflects the approved job description including: (a) position title and Recruitment Tracking Number; (b) essential functions summary; (c) minimum qualifications and preferred qualifications; (d) required licensure/certifications; (e) physical requirements; (f) EEO statement; (g) application instructions including required documents (resume, application, licensure copy). The responsible role is HR Director; the stated timing is Within 3 business days of position authorization approval.. Post the position through approved recruitment channels which may include: agency website, job boards (Indeed, LinkedIn, etc.), professional associations, educational institutions, California EDD, social media (per IT-UP-003), and contracted staffing agencies. Internal candidates shall be notified of open positions. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-006, 2\\. Purpose. This policy establishes requirements for the development, approval, maintenance, and distribution of written job descriptions for all positions at Care Indeed Home Health Care, Inc. Job descriptions serve as the foundational document defining the qualifications, scope of authority, essential functions, reporting relationships, and regulatory requirements for each position. CMS surveyors verify that employees meet the qualifications defined in job descriptions per 42 CFR § 484.105 and § 484.115. Written job descriptions also support ADA compliance, performance management, recruitment, disciplinary processes, and workforce planning.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-006, 4\\. Policy Statements. 4.1 Every position at Care Indeed Home Health Care, Inc. shall have a current, written, approved job description on file with the HR Director. 4.2 Job descriptions shall be developed and approved before any individual is recruited for or appointed to a position per HR-TA-001 § 6.1.2. 4.3 Each job description must contain, at minimum, the following elements: (a) position title; (b) department/discipline; (c) FLSA classification (exempt/non-exempt); (d) reporting relationship (reports to); (e) supervisory responsibilities; (f) position summary; (g) essential functions (ADA-compliant language); (h) minimum qualifications (education, experience, licensure/certification); (i) preferred qualifications; (j) physical requirements and working conditions; (k) regulatory requirements specific to the position. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-006, 5\\. Definitions. Essential Functions. The fundamental duties of a position that an employee must be able to perform, with or without reasonable accommodation, as distinct from marginal functions. Essential functions are determined based on: the reason the position exists, the number of employees available to perform the function, and the degree of specialization required.. FLSA Classification. The determination of whether a position is exempt or non-exempt under the Fair Labor Standards Act, affecting overtime eligibility.. Minimum Qualifications. The education, experience, licensure, certification, and competency requirements that a candidate must possess to be considered for the position.. Preferred Qualifications. Additional qualifications that enhance a candidate's suitability but are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-006, 12\\. Appendices. Appendix A — Job Description Template Care Indeed Home Health Care, Inc. | HR-TA-006 | v6.0 POSITION TITLE. __________________. Department / Discipline. __________________. Reports To. __________________. FLSA Classification. ☐ Exempt ☐ Non-Exempt. Employment Status. ☐ Full-Time ☐ Part-Time ☐ Per Diem. Date Created. ________. Date Last Revised. ________. HR-JD Policy Reference (if applicable). __________________. POSITION SUMMARY: ESSENTIAL FUNCTIONS (ADA-compliant): #: Essential Function. Source or operational basis: % of Time. 1: __________________________________________________________________. Source or operational basis: ______%. 2: __________________________________________________________________. Source or operational basis: ______%. 3: __________________________________________________________________. Source or operational basis: ______%. 4: __________________________________________________________________. Source or operational basis: ______%. 5: __________________________________________________________________. Source or operational basis: ______%. 6. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to workforce planning, qualifications, and job-description controls. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "locked-personnel-file-1-1", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 16, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for workforce planning, qualifications, and job-description controls." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for workforce planning, qualifications, and job-description controls. This decide option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during workforce planning, qualifications, and job-description controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for workforce planning, qualifications, and job-description controls." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "blank-staff-identification-badge-1-2", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 39, y: 65, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in workforce planning, qualifications, and job-description controls. This identify option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for workforce planning, qualifications, and job-description controls." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during workforce planning, qualifications, and job-description controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for workforce planning, qualifications, and job-description controls." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "competency-checklist-clipboard-1-3", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 84, y: 43, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for workforce planning, qualifications, and job-description controls." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during workforce planning, qualifications, and job-description controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during workforce planning, qualifications, and job-description controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for workforce planning, qualifications, and job-description controls." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for workforce planning, qualifications, and job-description controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for workforce planning, qualifications, and job-description controls by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for workforce planning, qualifications, and job-description controls. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Pre-emp",
    title: "Pre-employment screening, exclusions, licensure, and health clearance",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for pre-employment screening, exclusions, licensure, and health clearance within Human Resources Oversight. Begin with the current controlled versions of HR-TA-001, HR-TA-003, HR-TA-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TA-001, Conditional Offer and Pre-Employment Screening. Issue a Conditional Offer Letter (Appendix E) to the selected candidate. The letter must clearly state that: (a) the offer is contingent upon successful completion of all pre-employment screening requirements; (b) the candidate may not perform any work duties until all screenings are completed and cleared; (c) a disqualifying result will result in rescission of the offer. The responsible role is HR Director; the stated timing is Within 2 business days of approved hiring recommendation.. Sign and return the Conditional Offer Letter acknowledging acceptance and providing written consent for all pre-employment screening activities. The responsible role is Candidate; the stated timing is Within 5 calendar. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-001, 12\\. Appendices. Appendix A — Position Authorization Request Care Indeed Home Health Care, Inc. Policy Reference: HR-TA-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The hiring manager shall complete this form and submit to the HR Director prior to any recruitment activity. Administrator approval (and DON co-approval for clinical positions) is required before recruitment may proceed. SECTION 1 — POSITION INFORMATION Recruitment Tracking Number (assigned by HR). __________________. Position Title. __________________. Department / Discipline. __________________. Reports To. __________________. FTE Status (Full-Time / Part-Time / Per Diem / Contract). __________________. Work Location. __________________. Current Job Description on File? (Y/N). __________________. Job Description Last Reviewed Date. __________________. SECTION 2. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-003, Monthly Ongoing Screening. Between the 1st and 15th of each calendar month, screen ALL individuals identified in Section 3 (all employees, contractors, Governing Body members, active vendors) against both the OIG LEIE and SAM databases. The responsible role is HR Director (or designee); the stated timing is Monthly; completed by the 15th of each month.. Use a master screening roster (Appendix B) listing every individual subject to screening. Verify the roster is current before each monthly screening cycle by cross-referencing with: (a) active employee list from payroll; (b) active contractor/staffing agency roster; (c) Governing Body membership roster (GV-GB-001, Appendix A); (d) active vendor list. The responsible role is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-002, Periodic Rescreening of Current Employees. Maintain a Rescreening Schedule tracking the date of each employee's most recent background check and the next required rescreening date (every 3 years from the date of the most recent check). The responsible role is HR Director; the stated timing is Ongoing; reviewed monthly.. Initiate rescreening for current employees at least 60 calendar days before the 3-year anniversary of their most recent background check. Notify the employee in writing that rescreening will be conducted. The responsible role is HR Director; the stated timing is 60 days before rescreening due date.. Immediately initiate an unscheduled background check if: (a) the agency receives credible information that an. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-003, 12\\. Appendices. Appendix A — OIG/SAM Screening Result Form Care Indeed Home Health Care, Inc. Policy Reference: HR-TA-003 | Version: 6.0 | Date: 2025-07-10 Instructions: Complete for each individual at pre-employment/pre-engagement screening and attach search result evidence (screenshot or printout). For monthly screening, use Appendix C (Monthly Log) instead. SECTION 1 — SUBJECT INFORMATION Full Legal Name. __________________. Aliases / Maiden Name(s) Searched. __________________. Date of Birth. __________________. NPI (if applicable). __________________. Position / Role. __________________. Screening Type: ☐ Pre-Employment ☐ Pre-Contract ☐ Pre-Appointment (GB) ☐ Triggered ☐ Other: _____. Date of Screening. __________________. SECTION 2 — SEARCH RESULTS Database: Searched?. Source or operational basis: Result. OIG. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to pre-employment screening, exclusions, licensure, and health clearance. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "blank-staff-identification-badge-2-1", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 14, y: 65, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in pre-employment screening, exclusions, licensure, and health clearance. This identify option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pre-employment screening, exclusions, licensure, and health clearance." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "competency-checklist-clipboard-2-2", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pre-employment screening, exclusions, licensure, and health clearance." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "locked-personnel-file-2-3", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pre-employment screening, exclusions, licensure, and health clearance." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for pre-employment screening, exclusions, licensure, and health clearance. This decide option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during pre-employment screening, exclusions, licensure, and health clearance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pre-employment screening, exclusions, licensure, and health clearance." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for pre-employment screening, exclusions, licensure, and health clearance. Identify the verified status, discrepancy, affected requirement, and accountable owner for pre-employment screening, exclusions, licensure, and health clearance by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pre-employment screening, exclusions, licensure, and health clearance. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Orienta",
    title: "Orientation, training, and competency gates before assignment",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for orientation, training, and competency gates before assignment within Human Resources Oversight. Begin with the current controlled versions of HR-TD-001, HR-TD-003, HR-TA-005, HR-TA-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TD-001, Training Delivery and Documentation. Deliver training per the approved calendar using approved content and delivery methods. Ensure all training sessions are documented using the Training Attendance Record (Appendix C). The responsible role is HR Director / Training Coordinator; the stated timing is Per calendar schedule.. At each training session, collect signatures on the Training Attendance Record (Appendix C) documenting: (a) training topic; (b) date; (c) instructor name; (d) delivery method; (e) each attendee's printed name and signature; (f) competency assessment results (if applicable). The responsible role is Training Instructor; the stated timing is At each training session.. For e-learning modules, ensure the LMS (learning management system) captures: (a) employee. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TD-003, Initial Competency Evaluation (During Orientation). Using the Clinical Competency Evaluation Tool (Appendix A), identify the competencies required for the new employee's position based on: (a) job description essential functions; (b) discipline-specific regulatory requirements; (c) agency clinical protocols; (d) current patient population care needs. The responsible role is Director of Nursing; the stated timing is Prior to orientation start.. Evaluate the new employee on all required competencies during the orientation period per HR-TA-005. Methods: (a) Skills check-off for hands-on competencies (Appendix A checklist); (b) Written assessment for knowledge-based competencies; (c) Supervised visit evaluations per HR-TA-005, Appendix E; (d) EHR proficiency demonstration; (e) OASIS competency assessment per CL-OA-003 and CL-OA-018 (for OASIS-authorized. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-005, General Agency Orientation (All Staff — Days 1-5). Conduct General Agency Orientation covering all topics listed on Appendix A. Orientation may be delivered in-person, via structured e-learning modules, or a combination, but must include opportunity for questions and interaction. The responsible role is HR Director; the stated timing is Completed within first 5 business days.. General Agency Orientation must cover, at minimum, the following topics (documented on Appendix A): (a) Agency mission, vision, and values; (b) Organizational structure and reporting relationships (GV-OG-001); (c) Scope of services (GV-OG-003); (d) Corporate compliance program overview (CO-CP-001, CO-CP-004); (e) HIPAA privacy and security (CO-HP-001, CO-HP-002) — including PHI handling, minimum necessary standard, breach reporting; (f) Patient rights. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-001, 10\\. Training Requirements. 10.1 All HR staff involved in recruitment and hiring shall receive training on this policy within 14 calendar days of hire or assignment to recruitment duties. Training shall cover: (a) the complete recruitment process from authorization through onboarding handoff; (b) pre-employment screening requirements and zero-exception policy; (c) EEO compliance and prohibited interview inquiries; (d) California Fair Chance Act individualized assessment requirements; (e) OIG/SAM screening procedures; (f) documentation standards and use of all appendix forms. 10.2 All hiring managers and supervisors who participate in candidate evaluation shall receive training on: (a) use of the Structured Interview Evaluation Form (Appendix C); (b) prohibited interview inquiries; (c) EEO. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-005, Role-Specific / Clinical Orientation (Days 1-30). Initiate role-specific orientation using the Role-Specific/Clinical Orientation Checklist (Appendix B). For clinical staff, the checklist must include: (a) EHR system training and proficiency demonstration; (b) OASIS training and assessment (per CL-OA-003, CL-OA-018); (c) Clinical documentation standards (CL-CD-001 through CL-CD-004); (d) Care planning and physician order management (CL-CP-001 through CL-CP-009); (e) Discipline-specific clinical protocols; (f) Medication management (CL-SD-012, CL-SD-013); (g) Fall risk assessment (CL-SD-015); (h) Wound care standards (CL-SD-011, if applicable); (i) Pain assessment (CL-SD-014); (j) Infection prevention — clinical application; (k) Patient identification and verification (OP-PA-002); (l) Homebound status determination (CL-CA-005); (m) Supervised patient visits (minimum 2 for experienced clinicians; minimum 5 for new graduates. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to orientation, training, and competency gates before assignment. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.115" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "competency-checklist-clipboard-3-1", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 14, y: 49, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for orientation, training, and competency gates before assignment." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during orientation, training, and competency gates before assignment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during orientation, training, and competency gates before assignment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orientation, training, and competency gates before assignment." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "locked-personnel-file-3-2", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 35, y: 39, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for orientation, training, and competency gates before assignment." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for orientation, training, and competency gates before assignment. This decide option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during orientation, training, and competency gates before assignment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during orientation, training, and competency gates before assignment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orientation, training, and competency gates before assignment." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "blank-staff-identification-badge-3-3", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 74, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in orientation, training, and competency gates before assignment. This identify option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for orientation, training, and competency gates before assignment." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during orientation, training, and competency gates before assignment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during orientation, training, and competency gates before assignment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orientation, training, and competency gates before assignment." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for orientation, training, and competency gates before assignment. Identify the verified status, discrepancy, affected requirement, and accountable owner for orientation, training, and competency gates before assignment by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for orientation, training, and competency gates before assignment. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Perform",
    title: "Performance evaluation, coaching, and development",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for performance evaluation, coaching, and development within Human Resources Oversight. Begin with the current controlled versions of HR-ER-001, HR-TD-003, HR-TA-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-ER-001, Evaluation Schedule and Preparation. Maintain an Evaluation Due Date Tracker (Appendix B). Send reminder to supervisors 45 days before each employee's evaluation due date. The responsible role is HR Director; the stated timing is 45 days before due date.. Gather evaluation inputs: (a) job description and performance expectations; (b) previous evaluation and any PIP status; (c) competency evaluation results (HR-TD-003); (d) training compliance records (HR-TD-001); (e) attendance records; (f) documented performance observations, commendations, and corrective actions from the evaluation period. The responsible role is Supervisor; the stated timing is During the 30 days before the evaluation meeting.. Complete the Employee Self-Assessment Section of the Performance Evaluation Form (Appendix A. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-001, Evaluation Meeting. Conduct a face-to-face evaluation meeting (in-person preferred; video acceptable). Review: (a) each performance area and rating; (b) employee self-assessment; (c) strengths; (d) areas for improvement; (e) professional development goals; (f) for clinical staff: competency evaluation results and QAPI-related performance data. The responsible role is Supervisor; the stated timing is Within 30 days of anniversary date.. Collaborate to set performance goals for the next evaluation period (Appendix A, Section 4). Goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound). The responsible role is Supervisor / Employee; the stated timing is During evaluation meeting.. Sign the evaluation form acknowledging receipt. The employee's signature indicates receipt and discussion. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TD-003, Annual Competency Evaluation. By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. The responsible role is Director of Nursing / HR Director; the stated timing is By January 31 each year.. Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific competencies; (c) agency focus competencies per the annual. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-001, Interview and Evaluation Process. Select qualified candidates for interview from the screened applicant pool. Interview panels shall consist of a minimum of 2 evaluators. For clinical positions, the panel must include at least one licensed clinician of the same or supervising discipline. All interviewers shall be provided the Structured Interview Evaluation Form (Appendix C) and instructed on prohibited inquiries prior to interviewing. The responsible role is HR Director / Hiring Manager; the stated timing is Interviews scheduled within 7 business days of screening completion.. Conduct interviews using the Structured Interview Evaluation Form (Appendix C), which contains standardized, job-related questions aligned to the position's essential functions, competency requirements, and behavioral. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-001, 90-Day Introductory Evaluation. Complete the Introductory Period Evaluation (Appendix C) before the 90th day. Determine: ☐ Successful completion — transition to regular status; ☐ Extended introductory period (with documented justification, max 30 additional days); ☐ Separation during introductory period per HR-ER-002/HR-ER-006. The responsible role is Supervisor; the stated timing is Before Day 90.. 7–8. Documentation & Compliance Monitoring Annual evaluations: Appendix A. Source or operational basis: 100% completed within 30 days of anniversary.. 90-day evaluations: Appendix C. Source or operational basis: 100% completed before Day 90.. Evaluation tracking: Appendix B. Source or operational basis: Zero overdue evaluations exceeding 45 days.. PIPs documented for below-expectations ratings: Per HR-ER-002. Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to performance evaluation, coaching, and development. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.115" },
      { kind: "External Authority", text: "42 CFR §484.80(d)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "locked-personnel-file-4-1", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 15, y: 43, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance evaluation, coaching, and development." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for performance evaluation, coaching, and development. This decide option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance evaluation, coaching, and development." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during performance evaluation, coaching, and development.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance evaluation, coaching, and development." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "blank-staff-identification-badge-4-2", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 35, y: 76, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in performance evaluation, coaching, and development. This identify option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance evaluation, coaching, and development." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance evaluation, coaching, and development." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during performance evaluation, coaching, and development.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance evaluation, coaching, and development." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "competency-checklist-clipboard-4-3", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 85, y: 54, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for performance evaluation, coaching, and development." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during performance evaluation, coaching, and development." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during performance evaluation, coaching, and development.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for performance evaluation, coaching, and development." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for performance evaluation, coaching, and development. Identify the verified status, discrepancy, affected requirement, and accountable owner for performance evaluation, coaching, and development by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for performance evaluation, coaching, and development. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Progres",
    title: "Progressive discipline, grievance, non-retaliation, and consistency",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for progressive discipline, grievance, non-retaliation, and consistency within Human Resources Oversight. Begin with the current controlled versions of HR-TD-003, HR-TA-005, HR-ER-002, HR-ER-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TD-003, 12\\. Appendices. Appendix A — Clinical Competency Evaluation Tool Care Indeed Home Health Care, Inc. | HR-TD-003 | v6.0 Employee Name: __________________. Source or operational basis: Position. Evaluation Type: ☐ Initial (Orientation) ☐ Annual Year: ______: Date. Source or operational basis: ________. #: Competency Area. Source or operational basis: Evaluation Method. CORE COMPETENCIES (All Clinical Staff): . Source or operational basis: . 1: Hand hygiene and infection control. Source or operational basis: Return Demo. 2: Standard precautions / PPE. Source or operational basis: Return Demo. 3: Patient identification and verification. Source or operational basis: Observation. 4: Vital signs — measurement and interpretation. Source or operational basis: Return. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. | HR-TA-005 | v6.0 Employee Name: __________________. Source or operational basis: Position. #: Orientation Topic. Source or operational basis: Policy Reference. 1: Agency mission, vision, and values. Source or operational basis: —. 2: Organizational structure and reporting. Source or operational basis: GV-OG-001. 3: Scope of services. Source or operational basis: GV-OG-003. 4: Corporate compliance program overview. Source or operational basis: CO-CP-001, CO-CP-004. 5: Compliance hotline and reporting mechanisms. Source or operational basis: CO-CP-006. 6: Whistleblower protection. Source or operational basis: CO-CP-005. 7: HIPAA privacy — PHI handling, minimum necessary. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-002, 4\\. Policy Statements. 4.1 The agency shall follow progressive discipline for most performance and conduct issues: (1) Verbal Warning (documented); (2) Written Warning; (3) Final Written Warning / Suspension; (4) Termination. 4.2 Progressive discipline is not mandatory for all situations. The agency reserves the right to skip steps or proceed directly to termination for severe violations including but not limited to: (a) abuse, neglect, or exploitation of a patient; (b) HIPAA violation involving intentional disclosure; (c) fraud, theft, or dishonesty; (d) workplace violence; (e) reporting to work under the influence; (f) abandonment of patient care; (g) licensure revocation; (h) exclusion from federal programs. 4.3 All disciplinary actions must. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-003, 4\\. Policy Statements. 4.1 Every employee has the right to file a grievance without retaliation. 4.2 Grievances shall be addressed through a three-step process: (1) Informal resolution with immediate supervisor; (2) Formal written grievance to HR Director; (3) Appeal to Administrator. Each step has defined timeframes. 4.3 Retaliation against an employee for filing a grievance is prohibited and shall be treated as a separate disciplinary matter per HR-ER-002. 4.4 All grievance records are confidential (Tier 3).. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-003, 12\\. Appendices. Appendix A — Formal Grievance Form Employee Name: __________________. Source or operational basis: Position. Grievance Description (specific issue, dates, individuals involved): __________________________________________________________________. Source or operational basis: . Resolution Sought: __________________________________________________________________. Source or operational basis: . Was Step 1 (informal) attempted?: ☐ Yes — Date: ________ Outcome: __________________ ☐ No — Reason: __________________. Source or operational basis: . Employee Signature: __________________. Source or operational basis: Date Filed. HR DIRECTOR RESPONSE (completed within 14 business days) Investigation Summary. __________________________________________________________________. Determination. __________________________________________________________________. Resolution / Action Taken. __________________________________________________________________. HR Director Signature. __________________. Employee Notified. ☐ Yes Date: ________. Appendix B — Grievance Appeal Form Employee Name: __________________. Source or. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to progressive discipline, grievance, non-retaliation, and consistency. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.80(d)" },
      { kind: "External Authority", text: "42 CFR §484.80(e)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "blank-staff-identification-badge-5-1", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 29, y: 71, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in progressive discipline, grievance, non-retaliation, and consistency. This identify option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for progressive discipline, grievance, non-retaliation, and consistency." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "competency-checklist-clipboard-5-2", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 31, y: 44, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for progressive discipline, grievance, non-retaliation, and consistency." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "locked-personnel-file-5-3", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for progressive discipline, grievance, non-retaliation, and consistency." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for progressive discipline, grievance, non-retaliation, and consistency. This decide option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during progressive discipline, grievance, non-retaliation, and consistency.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for progressive discipline, grievance, non-retaliation, and consistency." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for progressive discipline, grievance, non-retaliation, and consistency. Identify the verified status, discrepancy, affected requirement, and accountable owner for progressive discipline, grievance, non-retaliation, and consistency by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for progressive discipline, grievance, non-retaliation, and consistency. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Staffin",
    title: "Staffing adequacy, scheduling risk, and contingency response",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for staffing adequacy, scheduling risk, and contingency response within Human Resources Oversight. Begin with the current controlled versions of HR-TA-001, HR-TA-003, HR-TA-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TA-001, Staffing Agency / Contract Staff Hiring. When using contracted staffing agencies, verify that the agency has a current, signed contract that requires the staffing agency to perform all pre-employment screening equivalent to this policy's requirements and to provide documentation of the same. A Business Associate Agreement (BAA) must be in place per CO-HP-005 if the contract staff will access PHI. The responsible role is HR Director; the stated timing is Prior to any contract staff assignment.. Before any contract staff member begins work, obtain and verify: (a) written confirmation of completed background check; (b) OIG/SAM screening clearance; (c) current licensure/certification verification; (d) competency documentation appropriate to the assignment. Document on the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-003, Vendor and Staffing Agency Screening. Before engaging any new vendor, supplier, or staffing agency that will have access to patients, patient information, or federal healthcare program funds, screen the entity name against the OIG LEIE and SAM databases. The responsible role is HR Director / Operations Director; the stated timing is Prior to contract execution or first engagement.. Include vendor entities on the master screening roster (Appendix B) for monthly screening. The responsible role is HR Director; the stated timing is Added upon engagement; screened monthly thereafter.. For staffing agencies: independently screen each individual assigned to the agency per Section 6.1, regardless of the staffing agency's representations regarding their own. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-001, 12\\. Appendices. Appendix A — Position Authorization Request Care Indeed Home Health Care, Inc. Policy Reference: HR-TA-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The hiring manager shall complete this form and submit to the HR Director prior to any recruitment activity. Administrator approval (and DON co-approval for clinical positions) is required before recruitment may proceed. SECTION 1 — POSITION INFORMATION Recruitment Tracking Number (assigned by HR). __________________. Position Title. __________________. Department / Discipline. __________________. Reports To. __________________. FTE Status (Full-Time / Part-Time / Per Diem / Contract). __________________. Work Location. __________________. Current Job Description on File? (Y/N). __________________. Job Description Last Reviewed Date. __________________. SECTION 2. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-005, Contracted/Staffing Agency Personnel Abbreviated Orientation. Before any contracted/staffing agency clinician's first patient assignment, conduct an abbreviated orientation using the Contract Staff Orientation Checklist (Appendix C) covering: (a) Agency-specific clinical documentation system/EHR; (b) HIPAA and PHI handling per agency protocols; (c) Patient identification and safety; (d) Infection control — agency protocols; (e) Emergency procedures and communication; (f) Abuse/neglect reporting obligations; (g) Key contact numbers (DON, on-call, office). The responsible role is HR Director / Designee; the stated timing is Completed before first patient assignment.. Sign the Contract Staff Orientation Checklist (Appendix C). File in the contract staff file per HR-TA-001, Appendix I. The responsible role is Contract Staff / HR Director. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-001, Common Failure Points. Failure Point: Risk. Source or operational basis: Mitigation. Employee begins work before background check results are received: Survey finding; potential patient safety risk; liability exposure if incident occurs. Source or operational basis: Enforce zero-exception policy: no work begins until Appendix F is complete and signed.. OIG/SAM screening not completed before start date: CMS may impose civil monetary penalties; potential program exclusion for the agency. Source or operational basis: Automate OIG/SAM screening as part of pre-employment checklist; HR Director verifies before clearing start date.. Interview questions include prohibited inquiries: EEO complaint; DFEH investigation; litigation risk. Source or operational basis: Use standardized Appendix C form for all. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to staffing adequacy, scheduling risk, and contingency response. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.80(e)" },
      { kind: "External Authority", text: "42 CFR §484.80(f)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "competency-checklist-clipboard-6-1", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing adequacy, scheduling risk, and contingency response." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing adequacy, scheduling risk, and contingency response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing adequacy, scheduling risk, and contingency response." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "locked-personnel-file-6-2", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 33, y: 56, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing adequacy, scheduling risk, and contingency response." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for staffing adequacy, scheduling risk, and contingency response. This decide option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing adequacy, scheduling risk, and contingency response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing adequacy, scheduling risk, and contingency response." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "blank-staff-identification-badge-6-3", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in staffing adequacy, scheduling risk, and contingency response. This identify option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing adequacy, scheduling risk, and contingency response." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing adequacy, scheduling risk, and contingency response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during staffing adequacy, scheduling risk, and contingency response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing adequacy, scheduling risk, and contingency response." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for staffing adequacy, scheduling risk, and contingency response. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing adequacy, scheduling risk, and contingency response by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing adequacy, scheduling risk, and contingency response. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Personn",
    title: "Personnel-file evidence, workforce dashboard, and governing-body reporting",
    subtitle: "Human Resources Oversight",
    narration: [
      "This lesson develops administrator judgment for personnel-file evidence, workforce dashboard, and governing-body reporting within Human Resources Oversight. Begin with the current controlled versions of HR-TA-004, HR-TA-006, HR-TA-005, HR-ER-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — HR-TA-004, Ongoing Licensure Monitoring. Maintain a Licensure Expiration Tracking System (Appendix A) listing every licensed/certified employee, their license type(s), license number(s), and expiration date(s). The responsible role is HR Director; the stated timing is Ongoing; updated within 5 business days of any hire, separation, or renewal.. At least 90 calendar days before each license expiration date, send a License Renewal Reminder Notice (Appendix C) to the employee reminding them of: (a) the upcoming expiration; (b) their obligation to renew timely; (c) the requirement to provide evidence of renewal to HR; (d) the consequence of practicing on an expired license (immediate removal from clinical duties). The responsible role is HR. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-006, 4\\. Policy Statements. 4.1 Every position at Care Indeed Home Health Care, Inc. shall have a current, written, approved job description on file with the HR Director. 4.2 Job descriptions shall be developed and approved before any individual is recruited for or appointed to a position per HR-TA-001 § 6.1.2. 4.3 Each job description must contain, at minimum, the following elements: (a) position title; (b) department/discipline; (c) FLSA classification (exempt/non-exempt); (d) reporting relationship (reports to); (e) supervisory responsibilities; (f) position summary; (g) essential functions (ADA-compliant language); (h) minimum qualifications (education, experience, licensure/certification); (i) preferred qualifications; (j) physical requirements and working conditions; (k) regulatory requirements specific to the position. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-004, 12\\. Appendices. Appendix A — Licensure Expiration Tracking System Care Indeed Home Health Care, Inc. Policy Reference: HR-TA-004 | Version: 6.0 #: Employee Name. Source or operational basis: Position. 1: _________. Source or operational basis: _______. 2: _________. Source or operational basis: _______. 3: _________. Source or operational basis: _______. 4: _________. Source or operational basis: _______. 5: _________. Source or operational basis: _______. 6: _________. Source or operational basis: _______. 7: _________. Source or operational basis: _______. 8: _________. Source or operational basis: _______. Maintained By: __________________. Source or operational basis: Last Updated. Appendix B — Licensure Verification Record Care Indeed Home Health Care, Inc. Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. | HR-TA-005 | v6.0 Employee Name: __________________. Source or operational basis: Position. #: Orientation Topic. Source or operational basis: Policy Reference. 1: Agency mission, vision, and values. Source or operational basis: —. 2: Organizational structure and reporting. Source or operational basis: GV-OG-001. 3: Scope of services. Source or operational basis: GV-OG-003. 4: Corporate compliance program overview. Source or operational basis: CO-CP-001, CO-CP-004. 5: Compliance hotline and reporting mechanisms. Source or operational basis: CO-CP-006. 6: Whistleblower protection. Source or operational basis: CO-CP-005. 7: HIPAA privacy — PHI handling, minimum necessary. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — HR-ER-004, Reporting. Employee reports to any of: (a) immediate supervisor; (b) HR Director; (c) Administrator; (d) compliance hotline per CO-CP-006.: Recipient immediately notifies HR Director (if not the recipient).. Source or operational basis: Immediate; HR notification within 24 hours... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to personnel-file evidence, workforce dashboard, and governing-body reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked personnel file", detail: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank staff identification badge", detail: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "competency checklist clipboard", detail: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-TA-001" },
      { kind: "Controlled Policy", text: "HR-TA-002" },
      { kind: "Controlled Policy", text: "HR-TA-003" },
      { kind: "Controlled Policy", text: "HR-TA-004" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TA-006" },
      { kind: "Controlled Policy", text: "HR-ER-001" },
      { kind: "Controlled Policy", text: "HR-ER-002" },
      { kind: "Controlled Policy", text: "HR-ER-003" },
      { kind: "Controlled Policy", text: "HR-ER-004" },
      { kind: "Controlled Policy", text: "HR-ER-005" },
      { kind: "Controlled Policy", text: "HR-TD-001" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.80(f)" },
      { kind: "External Authority", text: "42 CFR § 1001" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "locked-personnel-file-7-1", label: "locked personnel file", shortLabel: "locked personnel file", ariaLabel: "Investigate locked personnel file",
        x: 14, y: 70, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked personnel file as complete proof without comparing blank staff identification badge or the controlled source. This identify option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel-file evidence, workforce dashboard, and governing-body reporting." },
          { id: "i3", label: "Classify the locked personnel file by department custom even though its authority and current status are unverified. This identify option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked personnel file." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked personnel file on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked personnel file is resolved." },
          { id: "d3", label: "Send locked personnel file to an unrelated department rather than the policy owner responsible for personnel-file evidence, workforce dashboard, and governing-body reporting. This decide option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For locked personnel file, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For locked personnel file, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked personnel file was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked personnel file." },
          { id: "doc3", label: "Keep the locked personnel file decision in personal notes rather than the governed evidence location. This document option concerns locked personnel file during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
          meaning: "Observe the real locked personnel file in the photographed scene. Compare it with the blank staff identification badge, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked personnel file, compare the visible evidence with blank staff identification badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to locked personnel file; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For locked personnel file, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "blank-staff-identification-badge-7-2", label: "blank staff identification badge", shortLabel: "blank staff identification bad", ariaLabel: "Investigate blank staff identification badge",
        x: 35, y: 66, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume blank staff identification badge applies to every role, location, and exception described in personnel-file evidence, workforce dashboard, and governing-body reporting. This identify option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel-file evidence, workforce dashboard, and governing-body reporting." },
          { id: "i3", label: "Use the oldest available blank staff identification badge because prior approval is easier to confirm. This identify option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank staff identification badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in blank staff identification badge remains unresolved. This decide option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank staff identification badge is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to blank staff identification badge. This decide option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark blank staff identification badge closed on assignment, before completion and effectiveness evidence exist. This document option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank staff identification badge." },
          { id: "doc3", label: "Retain only a summary of blank staff identification badge and discard the source artifact needed to reconstruct the decision. This document option concerns blank staff identification badge during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
          meaning: "Observe the real blank staff identification badge in the photographed scene. Compare it with the competency checklist clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank staff identification badge, compare the visible evidence with competency checklist clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to blank staff identification badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For blank staff identification badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
      {
        id: "competency-checklist-clipboard-7-3", label: "competency checklist clipboard", shortLabel: "competency checklist clipboard", ariaLabel: "Investigate competency checklist clipboard",
        x: 79, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status." },
          { id: "i2", label: "Read competency checklist clipboard only for favorable indicators and omit the exception evidence connected to locked personnel file. This identify option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel-file evidence, workforce dashboard, and governing-body reporting." },
          { id: "i3", label: "Treat an unsigned or unverified competency checklist clipboard as equivalent to the current controlled record. This identify option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about competency checklist clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close competency checklist clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for competency checklist clipboard is resolved." },
          { id: "d3", label: "Defer the competency checklist clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for competency checklist clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist clipboard." },
          { id: "doc3", label: "Combine competency checklist clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns competency checklist clipboard during personnel-file evidence, workforce dashboard, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel-file evidence, workforce dashboard, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting.",
          meaning: "Observe the real competency checklist clipboard in the photographed scene. Compare it with the locked personnel file, current controlled sources, assigned decision rights, and corroborating records for personnel-file evidence, workforce dashboard, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel-file evidence, workforce dashboard, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For competency checklist clipboard, compare the visible evidence with locked personnel file and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. Apply that decision specifically to competency checklist clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel-file evidence, workforce dashboard, and governing-body reporting. For competency checklist clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["HR-TA-001","HR-TA-002","HR-TA-003","HR-TA-004","HR-TA-005","HR-TA-006","HR-ER-001","HR-ER-002","HR-ER-003","HR-ER-004","HR-ER-005","HR-TD-001","HR-TD-003","42 CFR § 484.105","42 CFR § 484.80","42 CFR §484.110","42 CFR § 484.115","42 CFR §484.80(d)","42 CFR §484.80(e)","42 CFR §484.80(f)","42 CFR § 1001"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During workforce planning, qualifications, and job-description controls, the competency checklist clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve competency checklist clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns workforce planning, qualifications, and job-description controls.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls.",
      "Send competency checklist clipboard to an unrelated department rather than the policy owner responsible for workforce planning, qualifications, and job-description controls. This option concerns workforce planning, qualifications, and job-description controls.",
      "Treat competency checklist clipboard as final approval because the artifact exists during workforce planning, qualifications, and job-description controls.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in workforce planning, qualifications, and job-description controls. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 2,
    stem: "During pre-employment screening, exclusions, licensure, and health clearance, the locked personnel file evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in locked personnel file remains unresolved. This option concerns pre-employment screening, exclusions, licensure, and health clearance.",
      "Treat locked personnel file as final approval because the artifact exists during pre-employment screening, exclusions, licensure, and health clearance.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance.",
      "Replace the controlling requirement with an informal local workaround tailored to locked personnel file. This option concerns pre-employment screening, exclusions, licensure, and health clearance.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pre-employment screening, exclusions, licensure, and health clearance. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 3,
    stem: "During orientation, training, and competency gates before assignment, the blank staff identification badge evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the blank staff identification badge decision to a routine future cycle even though current operations depend on it. This option concerns orientation, training, and competency gates before assignment.",
      "Treat blank staff identification badge as final approval because the artifact exists during orientation, training, and competency gates before assignment.",
      "Close blank staff identification badge when work is submitted, without testing whether the correction changed the intended outcome. This option concerns orientation, training, and competency gates before assignment.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in orientation, training, and competency gates before assignment. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 4,
    stem: "During performance evaluation, coaching, and development, the competency checklist clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development.",
      "Treat competency checklist clipboard as final approval because the artifact exists during performance evaluation, coaching, and development.",
      "Send competency checklist clipboard to an unrelated department rather than the policy owner responsible for performance evaluation, coaching, and development. This option concerns performance evaluation, coaching, and development.",
      "Approve competency checklist clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns performance evaluation, coaching, and development.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in performance evaluation, coaching, and development. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 5,
    stem: "During progressive discipline, grievance, non-retaliation, and consistency, the locked personnel file evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency.",
      "Allow the affected activity to expand while the exception in locked personnel file remains unresolved. This option concerns progressive discipline, grievance, non-retaliation, and consistency.",
      "Treat locked personnel file as final approval because the artifact exists during progressive discipline, grievance, non-retaliation, and consistency.",
      "Replace the controlling requirement with an informal local workaround tailored to locked personnel file. This option concerns progressive discipline, grievance, non-retaliation, and consistency.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in progressive discipline, grievance, non-retaliation, and consistency. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 6,
    stem: "During staffing adequacy, scheduling risk, and contingency response, the blank staff identification badge evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response.",
      "Close blank staff identification badge when work is submitted, without testing whether the correction changed the intended outcome. This option concerns staffing adequacy, scheduling risk, and contingency response.",
      "Treat blank staff identification badge as final approval because the artifact exists during staffing adequacy, scheduling risk, and contingency response.",
      "Defer the blank staff identification badge decision to a routine future cycle even though current operations depend on it. This option concerns staffing adequacy, scheduling risk, and contingency response.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing adequacy, scheduling risk, and contingency response. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 7,
    stem: "During personnel-file evidence, workforce dashboard, and governing-body reporting, the competency checklist clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send competency checklist clipboard to an unrelated department rather than the policy owner responsible for personnel-file evidence, workforce dashboard, and governing-body reporting. This option concerns personnel-file evidence, workforce dashboard, and governing-body reporting.",
      "Approve competency checklist clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns personnel-file evidence, workforce dashboard, and governing-body reporting.",
      "Treat competency checklist clipboard as final approval because the artifact exists during personnel-file evidence, workforce dashboard, and governing-body reporting.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel-file evidence, workforce dashboard, and governing-body reporting. The decision remains traceable to HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-TD-001, HR-TD-003.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.105 be used within Human Resources Oversight?",
    options: [
      "Replace the controlled agency policies with course narration.",
      "Treat a citation label as proof that every operational detail is current.",
      "Apply the citation outside its stated subject and scope.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
    ],
    correct: 3,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links blank staff identification badge and blank staff identification badge into an accountable Human Resources Oversight control?",
    options: [
      "A verbal understanding that no exception will recur.",
      "An unversioned local worksheet with no assigned reviewer.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A familiar dashboard color without source validation.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Human Resources Oversight establish?",
    options: [
      "Knowledge of the controlled administrator concepts in Human Resources Oversight, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Automatic appointment authority for every decision described in Human Resources Oversight.",
      "Observed operational competency without an authorized evaluator.",
      "Permission to replace the controlled policies with the Human Resources Oversight quiz result.",
    ],
    correct: 0,
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





const STORAGE_KEY = 'adm-007-progress-v6000';



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



export default function ADM007() {

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

          <span className="brand-text">ADM-007 — Human Resources</span>

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
