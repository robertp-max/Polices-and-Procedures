/**
 * ADM-002 — Governing Body Relations & Reporting
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

import img01 from './assets/adm-002/adm-002-lesson-01.png';
import img02 from './assets/adm-002/adm-002-lesson-02.png';
import img03 from './assets/adm-002/adm-002-lesson-03.png';
import img04 from './assets/adm-002/adm-002-lesson-04.png';
import img05 from './assets/adm-002/adm-002-lesson-05.png';
import img06 from './assets/adm-002/adm-002-lesson-06.png';
import img07 from './assets/adm-002/adm-002-lesson-07.png';



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



const MODULE_META = { id: "ADM-002", title: "Governing Body Relations & Reporting", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Governing body reserved authority and administrator delegation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Organizational reporting and decision rights, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Meeting agenda, quorum, minutes, and action tracking, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Operational, financial, compliance, quality, and risk reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Conflict-of-interest disclosure and recusal, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Strategic planning, succession, and governance self-assessment, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Escalating unsafe or unlawful directives and documenting resolution, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Governi",
    title: "Governing body reserved authority and administrator delegation",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for governing body reserved authority and administrator delegation within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-002, GV-GB-005, GV-GB-003, GV-GB-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-002, APPENDICES. Appendix A — Annual Governing Body Meeting Schedule Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-002 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To document the official Governing Body meeting schedule for the calendar year, as required by policy GV-GB-002, Section 6.1, and GV-GB-001, Section 6.3.1. Instructions: The Governing Body Chair shall establish this schedule by December 15 of the preceding year. The Administrator shall distribute the schedule to all Governing Body members, the Clinical Manager, the Compliance Officer, and all standing report presenters within 3 calendar days of approval. Any. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, APPENDICES. Appendix A — Annual Governance Self-Assessment Tool Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-005 | Version: 6.0 | Date: 2025-07-10 ACCESS RESTRICTION: This completed form is a Tier 4 — Privileged record. Submit only to the Compliance Officer. Do not submit to the Administrator, Governing Body Chair, or any other individual. Instructions: Rate each item based on your honest, independent assessment of the Governing Body's performance over the past 12 months. Use the rating scale below. Add comments where useful to support aggregated discussion. Complete independently before the Q1 meeting or at the meeting before group discussion begins. Rating Scale: 3 — Performing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, Escalation and Exception Handling. Individual within scope fails to submit annual disclosure by deadline and does not respond to delinquency notice.: Administrator notifies Governing Body Chair in writing.. Source or operational basis: Governing Body Chair issues a formal written demand for disclosure with a 7-calendar-day deadline. Continued non-compliance results in suspension of governance participation until disclosure is complete. Governing Body determines additional consequences at next meeting.. Individual participates in a vote or decision on a matter involving an undisclosed conflict.: Compliance Officer notifies Governing Body Chair immediately.. Source or operational basis: Governing Body evaluates whether the decision should be voided and re-decided without the conflicted individual's participation. Compliance investigation. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, Escalation and Exception Handling. Quorum not achieved at a scheduled regular quarterly meeting: Governing Body Chair notifies all members in writing.. Source or operational basis: Chair reschedules the meeting within the same calendar quarter. If quorum is not achieved for 2 consecutive scheduled meetings, Chair initiates membership recruitment or replacement per the agency's bylaws and notifies the Compliance Officer to document the deficiency.. Draft minutes not completed within 14 calendar days of the meeting: Governing Body Chair. Source or operational basis: Chair issues a written notice to the Designated Secretary requiring immediate completion. If draft is not produced within 7 additional calendar days, Administrator assumes responsibility for producing the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-004, APPENDICES. Appendix A — Succession Plan Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-004 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 ACCESS RESTRICTION: This document is classified Tier 4 — Privileged. Distribution limited to: Governing Body members, Administrator, Compliance Officer. Governing Body Approval Date: _____________ Next Review Date (Biennial): _____________ POSITION 1 — ADMINISTRATOR Full Legal Name: . Source or operational basis: . Title: Administrator. Source or operational basis: . Qualifications Confirmed (Y/N): N/A — Current. Source or operational basis: . Qualification Basis: . Source or operational basis: Per GV-OG-002. License / Credential (if applicable): . Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to governing body reserved authority and administrator delegation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.100(b)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "board-meeting-folder-1-1", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 28, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing body reserved authority and administrator delegation." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for governing body reserved authority and administrator delegation. This decide option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing body reserved authority and administrator delegation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during governing body reserved authority and administrator delegation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing body reserved authority and administrator delegation." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "bound-minutes-book-1-2", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 29, y: 74, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in governing body reserved authority and administrator delegation. This identify option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing body reserved authority and administrator delegation." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing body reserved authority and administrator delegation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during governing body reserved authority and administrator delegation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing body reserved authority and administrator delegation." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "action-tracking-clipboard-1-3", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for governing body reserved authority and administrator delegation." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during governing body reserved authority and administrator delegation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during governing body reserved authority and administrator delegation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for governing body reserved authority and administrator delegation." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for governing body reserved authority and administrator delegation. Identify the verified status, discrepancy, affected requirement, and accountable owner for governing body reserved authority and administrator delegation by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for governing body reserved authority and administrator delegation. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Organiz",
    title: "Organizational reporting and decision rights",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for organizational reporting and decision rights within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-003, Mid-Year Disclosure for Changed Circumstances. Upon becoming aware of any new circumstance that creates or could create an actual, potential, or perceived conflict of interest, immediately complete and submit a supplemental Conflict of Interest Disclosure Form to the Compliance Officer. Changed circumstances requiring disclosure include but are not limited to: (a) accepting employment, a consulting engagement, or a board seat with a vendor, competitor, or referral source; (b) acquiring a financial interest in any entity doing business with or competing with the agency; (c) beginning or ending a personal or family relationship with a vendor, referral source, or competitor; (d) receiving a gift, loan, or compensation from any entity in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, APPENDICES. Appendix A — Conflict of Interest Disclosure Form Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-003 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To identify, document, and manage actual, potential, or perceived conflicts of interest for all individuals within the scope of policy GV-GB-003. Instructions: Complete all sections in full. Mark \"None\" or \"No\" affirmatively if no conflict exists in a given category. Do not leave any field blank. Submit the completed form to the Compliance Officer within the required timeframe. Submission of a materially false or incomplete disclosure is a. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, 3\\. Scope. This policy applies to: All voting and non-voting members of the Governing Body of Care Indeed Home Health Care, Inc. The Agency Administrator The Director of Nursing / Clinical Manager The Compliance Officer Any contracted management entity or individual performing governing body functions on behalf of the agency Senior leadership personnel who participate in budget approval, vendor selection, contract execution, or strategic decision-making on behalf of the agency Any individual appointed to serve on a subcommittee of the Governing Body with decision-making authority This policy does not apply to front-line clinical or administrative staff except to the extent they are appointed to a role listed. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, 5\\. Definitions. Conflict of Interest. Any actual, potential, or perceived situation in which an individual's personal, financial, or organizational interests could impair — or reasonably appear to impair — their ability to act in the best interest of Care Indeed Home Health Care, Inc. and the patients it serves.. Financial Interest. Any direct or indirect financial stake in a transaction, entity, or decision affecting the agency, including ownership interests, compensation arrangements, loans, gifts, or investment positions held by the individual or their immediate family.. Immediate Family. Spouse, domestic partner, parent, stepparent, child, stepchild, sibling, or any individual sharing a household with the disclosing party.. Material Conflict. A. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, 2\\. Purpose. This policy establishes the requirements for identifying, disclosing, managing, and resolving actual, potential, and perceived conflicts of interest for all Governing Body members, senior leadership, and key personnel of Care Indeed Home Health Care, Inc. Conflicts of interest — whether financial, professional, or organizational — pose a direct risk to the integrity of the Governing Body's fiduciary duty, the agency's regulatory compliance posture, and its standing with CMS and the OIG. This policy ensures that all individuals in positions of governance authority act solely in the best interest of the agency and the patients it serves, that no individual benefits personally from decisions made in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to organizational reporting and decision rights. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR §484.100(b)" },
      { kind: "External Authority", text: "42 CFR §484.105(a)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "bound-minutes-book-2-1", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 14, y: 57, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in organizational reporting and decision rights. This identify option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for organizational reporting and decision rights." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during organizational reporting and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during organizational reporting and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for organizational reporting and decision rights." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "action-tracking-clipboard-2-2", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 38, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for organizational reporting and decision rights." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during organizational reporting and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during organizational reporting and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for organizational reporting and decision rights." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "board-meeting-folder-2-3", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for organizational reporting and decision rights." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for organizational reporting and decision rights. This decide option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during organizational reporting and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during organizational reporting and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for organizational reporting and decision rights." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for organizational reporting and decision rights. Identify the verified status, discrepancy, affected requirement, and accountable owner for organizational reporting and decision rights by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for organizational reporting and decision rights. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Meeting",
    title: "Meeting agenda, quorum, minutes, and action tracking",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for meeting agenda, quorum, minutes, and action tracking within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-002, GV-GB-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-002, Conducting the Meeting and Recording Minutes. 6.4.1 — Quorum Verification Call the meeting to order and direct the Designated Secretary to record attendance. Quorum must be confirmed before any official business is conducted. The responsible role is Governing Body Chair; the stated timing is At the start of each meeting.. Record the full name, role, and attendance method (in-person or remote) of each member present and each member absent. The responsible role is Designated Secretary; the stated timing is At the start of each meeting.. Declare whether quorum has been achieved based on the number of voting members present relative to the quorum requirement defined in the agency's bylaws or operating. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, APPENDICES. Appendix A — Annual Governing Body Meeting Schedule Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-002 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To document the official Governing Body meeting schedule for the calendar year, as required by policy GV-GB-002, Section 6.1, and GV-GB-001, Section 6.3.1. Instructions: The Governing Body Chair shall establish this schedule by December 15 of the preceding year. The Administrator shall distribute the schedule to all Governing Body members, the Clinical Manager, the Compliance Officer, and all standing report presenters within 3 calendar days of approval. Any. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, Special Meeting Convening. Identify the need for a special meeting. Circumstances warranting a special meeting include but are not limited to: (a) CMS survey findings requiring immediate Governing Body action; (b) a serious adverse patient event requiring Governing Body-level response; (c) a regulatory enforcement action or subpoena; (d) a key leadership vacancy requiring emergency appointment; (e) a material compliance violation. The responsible role is Governing Body Chair or Administrator; the stated timing is Upon identification of qualifying circumstances.. Issue written notice of the special meeting to all Governing Body members, specifying: (a) the date, time, and location or remote access method; (b) the specific purpose and agenda for. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, 9\\. References. 9.1 Federal Regulations 42 CFR § 484.105: Condition of Participation: Organization and Administration of Services. Source or operational basis: Primary regulatory basis requiring a functioning Governing Body; meeting records are the primary evidence of compliance.. 42 CFR § 484.105(a): Standard: Governing body. Source or operational basis: Requires the Governing Body to hold full legal authority for agency operations; meeting minutes document the exercise of that authority.. 42 CFR § 484.105(b): Standard: Administrator. Source or operational basis: Administrator appointment and oversight must be documented in meeting minutes.. 42 CFR § 484.105(c): Standard: Clinical manager. Source or operational basis: Clinical Manager appointment and QAPI oversight documented in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Improvement Action Plan Monitoring. Monitor progress on each Improvement Action Plan item throughout the year. At each quarterly Governing Body meeting, include a brief standing item in the agenda for action plan status update. The responsible role is Governing Body Chair; the stated timing is Quarterly; included in each regular meeting agenda.. Report status of assigned improvement actions at each quarterly meeting where the item remains open. Status shall include: (a) actions completed; (b) actions in progress with percentage completion and current obstacles; (c) actions not yet initiated with explanation and revised target date. The responsible role is Responsible Party for Each Action Item; the stated timing is At. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to meeting agenda, quorum, minutes, and action tracking. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR §484.105(a)" },
      { kind: "External Authority", text: "42 CFR §484.105(h)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "action-tracking-clipboard-3-1", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 14, y: 58, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for meeting agenda, quorum, minutes, and action tracking." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during meeting agenda, quorum, minutes, and action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for meeting agenda, quorum, minutes, and action tracking." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "board-meeting-folder-3-2", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 52, y: 75, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for meeting agenda, quorum, minutes, and action tracking." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for meeting agenda, quorum, minutes, and action tracking. This decide option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during meeting agenda, quorum, minutes, and action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for meeting agenda, quorum, minutes, and action tracking." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "bound-minutes-book-3-3", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 74, y: 40, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in meeting agenda, quorum, minutes, and action tracking. This identify option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for meeting agenda, quorum, minutes, and action tracking." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during meeting agenda, quorum, minutes, and action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during meeting agenda, quorum, minutes, and action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for meeting agenda, quorum, minutes, and action tracking." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for meeting agenda, quorum, minutes, and action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for meeting agenda, quorum, minutes, and action tracking by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for meeting agenda, quorum, minutes, and action tracking. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Operati",
    title: "Operational, financial, compliance, quality, and risk reporting",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for operational, financial, compliance, quality, and risk reporting within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-005, GV-GB-003, GV-GB-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-005, APPENDICES. Appendix A — Annual Governance Self-Assessment Tool Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-005 | Version: 6.0 | Date: 2025-07-10 ACCESS RESTRICTION: This completed form is a Tier 4 — Privileged record. Submit only to the Compliance Officer. Do not submit to the Administrator, Governing Body Chair, or any other individual. Instructions: Rate each item based on your honest, independent assessment of the Governing Body's performance over the past 12 months. Use the rating scale below. Add comments where useful to support aggregated discussion. Complete independently before the Q1 meeting or at the meeting before group discussion begins. Rating Scale: 3 — Performing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, 7\\. Documentation Requirements. Initial disclosure: Completed and signed Conflict of Interest Disclosure Form (Appendix A) for each individual at appointment.. Source or operational basis: Individual (completion); Compliance Officer (receipt and filing). Annual disclosure: Completed and signed Conflict of Interest Disclosure Form for each individual within scope, completed annually at Q1.. Source or operational basis: Individual (completion); Compliance Officer (receipt and filing). Supplemental disclosure: Completed and signed Conflict of Interest Disclosure Form for any changed circumstances disclosed mid-year.. Source or operational basis: Individual (completion); Compliance Officer (receipt and filing). Disclosure tracking log: Running log of all disclosures received, indexed by individual and disclosure date (Appendix C).. Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, How Compliance Is Measured. Governing Body meets at least quarterly.: Review of meeting minutes confirming date, attendance, and quorum for each quarter.. Source or operational basis: Four or more meetings per calendar year; quorum confirmed at each.. Meeting agendas are distributed at least 7 days before each meeting.: Review of agenda distribution records and email timestamps.. Source or operational basis: 100% of agendas distributed within required timeframe; no exceptions without documented cause.. Draft minutes are completed within 14 calendar days of each meeting.: Review of draft completion dates on file.. Source or operational basis: 100% of drafts completed on time; no draft outstanding beyond 14 calendar days without a. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, APPENDICES. Appendix A — Conflict of Interest Disclosure Form Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-003 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To identify, document, and manage actual, potential, or perceived conflicts of interest for all individuals within the scope of policy GV-GB-003. Instructions: Complete all sections in full. Mark \"None\" or \"No\" affirmatively if no conflict exists in a given category. Do not leave any field blank. Submit the completed form to the Compliance Officer within the required timeframe. Submission of a materially false or incomplete disclosure is a. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, How Compliance Is Measured. All individuals within scope submit annual disclosures by the Q1 deadline.: Review of disclosure tracking log against current roster of in-scope individuals.. Source or operational basis: 100% submission rate; no lapsed disclosures; cure period applied and resolved for any late submissions.. Compliance Officer reviews all disclosures within 14 calendar days.: Review of materiality assessment memo dates against disclosure receipt dates in the tracking log.. Source or operational basis: 100% of disclosures reviewed within 14 calendar days; no review outstanding.. Annual conflict of interest status report presented at Q1 meeting.: Review of Q1 meeting agenda and minutes for presentation confirmation.. Source or operational basis: Report presented. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to operational, financial, compliance, quality, and risk reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR §484.105(h)" },
      { kind: "External Authority", text: "42 CFR §484.65(e)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "board-meeting-folder-4-1", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for operational, financial, compliance, quality, and risk reporting." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for operational, financial, compliance, quality, and risk reporting. This decide option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during operational, financial, compliance, quality, and risk reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for operational, financial, compliance, quality, and risk reporting." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "bound-minutes-book-4-2", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 35, y: 46, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in operational, financial, compliance, quality, and risk reporting. This identify option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for operational, financial, compliance, quality, and risk reporting." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during operational, financial, compliance, quality, and risk reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for operational, financial, compliance, quality, and risk reporting." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "action-tracking-clipboard-4-3", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for operational, financial, compliance, quality, and risk reporting." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during operational, financial, compliance, quality, and risk reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during operational, financial, compliance, quality, and risk reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for operational, financial, compliance, quality, and risk reporting." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for operational, financial, compliance, quality, and risk reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for operational, financial, compliance, quality, and risk reporting by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for operational, financial, compliance, quality, and risk reporting. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Conflic",
    title: "Conflict-of-interest disclosure and recusal",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for conflict-of-interest disclosure and recusal within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-003, Annual Disclosure Process. Distribute blank Conflict of Interest Disclosure Forms to all individuals within scope no later than 14 calendar days before the first quarterly Governing Body meeting of each calendar year. Distribution shall be accompanied by a written reminder of the disclosure obligation, recusal requirements, and the deadline for submission. The responsible role is Compliance Officer; the stated timing is Distributed no later than 14 calendar days before the Q1 meeting.. Complete and submit the annual Conflict of Interest Disclosure Form to the Compliance Officer by the deadline specified in the distribution notice. Annual disclosures must reflect the individual's current circumstances as of the date of signature. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, Initial Disclosure at Appointment. At the time of appointment or onboarding of any individual within the scope of this policy, provide the individual with: (a) a copy of this policy GV-GB-003; (b) a blank Conflict of Interest Disclosure Form (Appendix A); (c) a verbal or written explanation of the disclosure requirements, recusal obligations, and consequences of non-disclosure. The responsible role is Administrator / Governing Body Chair; the stated timing is At the time of appointment; no later than the individual's first day in their governance role.. Complete and sign the Conflict of Interest Disclosure Form in full. All sections must be completed — no section may be left blank.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, Recusal Procedures. Before each Governing Body meeting, review the current conflict of interest file and identify any agenda item that could implicate a disclosed conflict for any member or attendee. Notify the affected individual in writing at least 3 calendar days before the meeting of the specific agenda item requiring their recusal. The responsible role is Governing Body Chair / Administrator; the stated timing is At least 3 calendar days before the meeting.. At the meeting, when the conflicted agenda item is called: (a) publicly announce the recusal and the general nature of the conflict (without disclosing legally protected details); (b) physically or virtually withdraw from the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, APPENDICES. Appendix A — Conflict of Interest Disclosure Form Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-003 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To identify, document, and manage actual, potential, or perceived conflicts of interest for all individuals within the scope of policy GV-GB-003. Instructions: Complete all sections in full. Mark \"None\" or \"No\" affirmatively if no conflict exists in a given category. Do not leave any field blank. Submit the completed form to the Compliance Officer within the required timeframe. Submission of a materially false or incomplete disclosure is a. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-003, Mid-Year Disclosure for Changed Circumstances. Upon becoming aware of any new circumstance that creates or could create an actual, potential, or perceived conflict of interest, immediately complete and submit a supplemental Conflict of Interest Disclosure Form to the Compliance Officer. Changed circumstances requiring disclosure include but are not limited to: (a) accepting employment, a consulting engagement, or a board seat with a vendor, competitor, or referral source; (b) acquiring a financial interest in any entity doing business with or competing with the agency; (c) beginning or ending a personal or family relationship with a vendor, referral source, or competitor; (d) receiving a gift, loan, or compensation from any entity in. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to conflict-of-interest disclosure and recusal. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR §484.65(e)" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "bound-minutes-book-5-1", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 25, y: 43, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in conflict-of-interest disclosure and recusal. This identify option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for conflict-of-interest disclosure and recusal." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during conflict-of-interest disclosure and recusal." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict-of-interest disclosure and recusal." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "action-tracking-clipboard-5-2", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 49, y: 70, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for conflict-of-interest disclosure and recusal." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during conflict-of-interest disclosure and recusal." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict-of-interest disclosure and recusal." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "board-meeting-folder-5-3", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 81, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for conflict-of-interest disclosure and recusal." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for conflict-of-interest disclosure and recusal. This decide option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during conflict-of-interest disclosure and recusal." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during conflict-of-interest disclosure and recusal.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict-of-interest disclosure and recusal." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for conflict-of-interest disclosure and recusal. Identify the verified status, discrepancy, affected requirement, and accountable owner for conflict-of-interest disclosure and recusal by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for conflict-of-interest disclosure and recusal. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Strateg",
    title: "Strategic planning, succession, and governance self-assessment",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for strategic planning, succession, and governance self-assessment within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-OG-004, GV-GB-005, GV-GB-002, GV-GB-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-OG-004, Annual Strategic Planning Process. Initiate the annual strategic planning process by convening a strategic planning session with all department heads (Director of Nursing, Compliance Officer, HR Director, CFO/Revenue Cycle Director, Operations Director, IT Director, Risk Manager, QAPI Coordinator). The responsible role is Administrator; the stated timing is Q4 of the current planning period; at least 60 calendar days before the start of the new planning period.. Conduct an environmental assessment including: (a) SWOT analysis; (b) review of prior year strategic goal achievement; (c) regulatory environment scan (upcoming CMS rule changes, state requirements, OASIS updates); (d) financial performance review; (e) quality data review (Star Ratings, HHCAHPS, QAPI outcomes); (f) workforce. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Self-Assessment Preparation. Prepare the annual self-assessment materials for distribution to each Governing Body member. Materials shall include: (a) a copy of the Self-Assessment Tool (Appendix A); (b) a copy of the prior year's Governance Self-Assessment Summary Report and Improvement Action Plan for reference; (c) a copy of the current year's policy GV-GB-001 (Governing Body Authority & Responsibilities) for reference; (d) instructions for completing the self-assessment form. The responsible role is Compliance Officer; the stated timing is Materials prepared and distributed to all Governing Body members no later than 14 calendar days before the Q1 meeting.. Review the prior year's Improvement Action Plan and prepare a brief status. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-005, Governance Self-Assessment Summary Report and Improvement Action Plan. Prepare or oversee preparation of the Governance Self-Assessment Summary Report (Appendix B) following the Q1 meeting. The report shall document: (a) the assessment period (calendar year assessed); (b) the number of members who completed individual assessments; (c) aggregated domain ratings — strength, satisfactory, or needs improvement; (d) identified governance strengths; (e) identified improvement priorities with supporting rationale. The responsible role is Governing Body Chair; the stated timing is Draft completed within 21 calendar days of the Q1 meeting.. Develop the Governance Improvement Action Plan as part of the Summary Report. For each domain rated as needing improvement, the plan shall specify: (a) the specific improvement. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, Record Retention and Governance File Maintenance. Maintain the governance file in a secure physical or electronic location accessible to the Governing Body Chair, Governing Body members, Compliance Officer, and authorized agency staff. The governance file shall contain: (a) the annual meeting schedule; (b) all meeting agendas; (c) all approved meeting minutes and superseded drafts; (d) all supporting reports presented at each meeting (compliance, QAPI, financial, administrator); (e) attendance records; (f) the Action Item Tracker; (g) Governing Body appointment documentation per GV-GB-001. The responsible role is Administrator; the stated timing is Maintained continuously; reviewed for completeness quarterly before each meeting.. Maintain the Executive Session Log in a separately secured, restricted access file. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-004, Development and Maintenance of the Succession Plan. Prepare a draft Succession Plan (Appendix A) for all three key leadership positions. For each position, identify: (a) the current role holder's name, qualifications, and tenure; (b) the primary interim designee — name, title, confirmed qualifications, and contact information; (c) the secondary interim designee — same information; (d) a brief notation of any known factors that could affect designee availability (e.g., dual roles, geographic limitations). The responsible role is Administrator; the stated timing is Draft prepared no later than 30 calendar days before the Q2 Governing Body meeting.. Verify the qualifications of each identified designee against the minimum qualification standards for the respective role: (a). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to strategic planning, succession, and governance self-assessment. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR § 484.105(a)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "action-tracking-clipboard-6-1", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 18, y: 68, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for strategic planning, succession, and governance self-assessment." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during strategic planning, succession, and governance self-assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for strategic planning, succession, and governance self-assessment." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "board-meeting-folder-6-2", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 39, y: 42, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for strategic planning, succession, and governance self-assessment." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for strategic planning, succession, and governance self-assessment. This decide option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during strategic planning, succession, and governance self-assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for strategic planning, succession, and governance self-assessment." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "bound-minutes-book-6-3", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 78, y: 61, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in strategic planning, succession, and governance self-assessment. This identify option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for strategic planning, succession, and governance self-assessment." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during strategic planning, succession, and governance self-assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during strategic planning, succession, and governance self-assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for strategic planning, succession, and governance self-assessment." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for strategic planning, succession, and governance self-assessment. Identify the verified status, discrepancy, affected requirement, and accountable owner for strategic planning, succession, and governance self-assessment by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for strategic planning, succession, and governance self-assessment. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Escalat",
    title: "Escalating unsafe or unlawful directives and documenting resolution",
    subtitle: "Governing Body Relations & Reporting",
    narration: [
      "This lesson develops administrator judgment for escalating unsafe or unlawful directives and documenting resolution within Governing Body Relations & Reporting. Begin with the current controlled versions of GV-GB-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-GB-002, 5\\. Definitions. Regular Quarterly Meeting. A formally scheduled Governing Body meeting convened at least once per calendar quarter to fulfill standing oversight obligations including review of compliance, QAPI, financial, and administrative reports.. Special Meeting. A Governing Body meeting convened outside the regular quarterly schedule to address urgent or time-sensitive matters that cannot wait until the next regular meeting.. Executive Session. A closed portion of a regular or special meeting, restricted to Governing Body members and invited individuals, convened to discuss legally sensitive, personnel, litigation-related, or confidential matters.. Quorum. The minimum number of voting Governing Body members required to be present — in person or via approved remote. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, APPENDICES. Appendix A — Annual Governing Body Meeting Schedule Care Indeed Home Health Care, Inc. Policy Reference: GV-GB-002 | Version: 6.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To document the official Governing Body meeting schedule for the calendar year, as required by policy GV-GB-002, Section 6.1, and GV-GB-001, Section 6.3.1. Instructions: The Governing Body Chair shall establish this schedule by December 15 of the preceding year. The Administrator shall distribute the schedule to all Governing Body members, the Clinical Manager, the Compliance Officer, and all standing report presenters within 3 calendar days of approval. Any. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify: Evidence that Governing Body meetings are occurring at least quarterly. Surveyors will request all meeting minutes from the survey look-back period (typically 12–24 months) and verify that four or more meetings occurred in each calendar year with documented quorum. Quality of meeting minutes as evidence of active governance. Surveyors distinguish between minutes that document passive receipt of reports and minutes that demonstrate substantive engagement. Entries such as \"QAPI report received — no action\" are a common deficiency. Surveyors expect to see specific data points referenced, questions asked, and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, Executive Session Procedures. Announce the convening of an executive session, state the general subject matter category, and identify the individuals permitted to remain present. All guests and non-members not specifically authorized shall exit the meeting room or remote session. The responsible role is Governing Body Chair; the stated timing is At the time executive session is convened.. Record in the regular meeting minutes: the time executive session commenced, the general subject matter category, and the names of individuals present. The responsible role is Designated Secretary; the stated timing is During the meeting.. Maintain a separate, restricted Executive Session Log (Appendix D) documenting: (a) date and meeting to which. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-GB-002, Action Item Tracking. Maintain a running Action Item Tracker (Appendix E) documenting every directive issued at each meeting, including: (a) directive description; (b) meeting date issued; (c) responsible party; (d) completion deadline; (e) current status (open, in progress, completed, overdue); (f) date completed or escalated. The responsible role is Designated Secretary; the stated timing is Updated within 3 calendar days of each meeting.. Review the Action Item Tracker before each quarterly meeting and prepare a status update for all open and recently completed items. Overdue items must be flagged and an explanation provided. The responsible role is Administrator; the stated timing is Status update prepared and distributed with. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to escalating unsafe or unlawful directives and documenting resolution. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "board meeting folder", detail: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "bound minutes book", detail: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "action-tracking clipboard", detail: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-GB-001" },
      { kind: "Controlled Policy", text: "GV-GB-002" },
      { kind: "Controlled Policy", text: "GV-GB-003" },
      { kind: "Controlled Policy", text: "GV-GB-004" },
      { kind: "Controlled Policy", text: "GV-GB-005" },
      { kind: "Controlled Policy", text: "GV-OG-004" },
      { kind: "External Authority", text: "42 CFR § 484.105(a)" },
      { kind: "External Authority", text: "42 CFR § 484.105(b)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "board-meeting-folder-7-1", label: "board meeting folder", shortLabel: "board meeting folder", ariaLabel: "Investigate board meeting folder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status." },
          { id: "i2", label: "Treat board meeting folder as complete proof without comparing bound minutes book or the controlled source. This identify option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for escalating unsafe or unlawful directives and documenting resolution." },
          { id: "i3", label: "Classify the board meeting folder by department custom even though its authority and current status are unverified. This identify option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about board meeting folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve board meeting folder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for board meeting folder is resolved." },
          { id: "d3", label: "Send board meeting folder to an unrelated department rather than the policy owner responsible for escalating unsafe or unlawful directives and documenting resolution. This decide option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during escalating unsafe or unlawful directives and documenting resolution." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For board meeting folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For board meeting folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that board meeting folder was reviewed, without source version, finding, decision, owner, or status. This document option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of board meeting folder." },
          { id: "doc3", label: "Keep the board meeting folder decision in personal notes rather than the governed evidence location. This document option concerns board meeting folder during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalating unsafe or unlawful directives and documenting resolution." },
        ],
        feedback: {
          observed: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
          meaning: "Observe the real board meeting folder in the photographed scene. Compare it with the bound minutes book, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For board meeting folder, compare the visible evidence with bound minutes book and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to board meeting folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For board meeting folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "bound-minutes-book-7-2", label: "bound minutes book", shortLabel: "bound minutes book", ariaLabel: "Investigate bound minutes book",
        x: 44, y: 58, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Assume bound minutes book applies to every role, location, and exception described in escalating unsafe or unlawful directives and documenting resolution. This identify option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for escalating unsafe or unlawful directives and documenting resolution." },
          { id: "i3", label: "Use the oldest available bound minutes book because prior approval is easier to confirm. This identify option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about bound minutes book." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in bound minutes book remains unresolved. This decide option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for bound minutes book is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to bound minutes book. This decide option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during escalating unsafe or unlawful directives and documenting resolution." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For bound minutes book, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For bound minutes book, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark bound minutes book closed on assignment, before completion and effectiveness evidence exist. This document option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bound minutes book." },
          { id: "doc3", label: "Retain only a summary of bound minutes book and discard the source artifact needed to reconstruct the decision. This document option concerns bound minutes book during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalating unsafe or unlawful directives and documenting resolution." },
        ],
        feedback: {
          observed: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
          meaning: "Observe the real bound minutes book in the photographed scene. Compare it with the action-tracking clipboard, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For bound minutes book, compare the visible evidence with action-tracking clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to bound minutes book; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For bound minutes book, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
      {
        id: "action-tracking-clipboard-7-3", label: "action-tracking clipboard", shortLabel: "action-tracking clipboard", ariaLabel: "Investigate action-tracking clipboard",
        x: 85, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status." },
          { id: "i2", label: "Read action-tracking clipboard only for favorable indicators and omit the exception evidence connected to board meeting folder. This identify option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for escalating unsafe or unlawful directives and documenting resolution." },
          { id: "i3", label: "Treat an unsigned or unverified action-tracking clipboard as equivalent to the current controlled record. This identify option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about action-tracking clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close action-tracking clipboard when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for action-tracking clipboard is resolved." },
          { id: "d3", label: "Defer the action-tracking clipboard decision to a routine future cycle even though current operations depend on it. This decide option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during escalating unsafe or unlawful directives and documenting resolution." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for action-tracking clipboard but omit the actual evidence, communications, and unresolved items. This document option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action-tracking clipboard." },
          { id: "doc3", label: "Combine action-tracking clipboard with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns action-tracking clipboard during escalating unsafe or unlawful directives and documenting resolution.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalating unsafe or unlawful directives and documenting resolution." },
        ],
        feedback: {
          observed: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution.",
          meaning: "Observe the real action-tracking clipboard in the photographed scene. Compare it with the board meeting folder, current controlled sources, assigned decision rights, and corroborating records for escalating unsafe or unlawful directives and documenting resolution. Identify the verified status, discrepancy, affected requirement, and accountable owner for escalating unsafe or unlawful directives and documenting resolution by reconciling all three photographed evidence objects with the current controlled source. For action-tracking clipboard, compare the visible evidence with board meeting folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. Apply that decision specifically to action-tracking clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for escalating unsafe or unlawful directives and documenting resolution. For action-tracking clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-GB-001","GV-GB-002","GV-GB-003","GV-GB-004","GV-GB-005","GV-OG-004","42 CFR §484.110","42 CFR §484.100(b)","42 CFR §484.105(a)","42 CFR §484.105(h)","42 CFR §484.65(e)","42 CFR § 484.105","42 CFR § 484.105(a)","42 CFR § 484.105(b)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During governing body reserved authority and administrator delegation, the action-tracking clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat action-tracking clipboard as final approval because the artifact exists during governing body reserved authority and administrator delegation.",
      "Approve action-tracking clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns governing body reserved authority and administrator delegation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation.",
      "Send action-tracking clipboard to an unrelated department rather than the policy owner responsible for governing body reserved authority and administrator delegation. This option concerns governing body reserved authority and administrator delegation.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in governing body reserved authority and administrator delegation. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 2,
    stem: "During organizational reporting and decision rights, the board meeting folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat board meeting folder as final approval because the artifact exists during organizational reporting and decision rights.",
      "Replace the controlling requirement with an informal local workaround tailored to board meeting folder. This option concerns organizational reporting and decision rights.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights.",
      "Allow the affected activity to expand while the exception in board meeting folder remains unresolved. This option concerns organizational reporting and decision rights.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in organizational reporting and decision rights. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 3,
    stem: "During meeting agenda, quorum, minutes, and action tracking, the bound minutes book evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking.",
      "Close bound minutes book when work is submitted, without testing whether the correction changed the intended outcome. This option concerns meeting agenda, quorum, minutes, and action tracking.",
      "Treat bound minutes book as final approval because the artifact exists during meeting agenda, quorum, minutes, and action tracking.",
      "Defer the bound minutes book decision to a routine future cycle even though current operations depend on it. This option concerns meeting agenda, quorum, minutes, and action tracking.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in meeting agenda, quorum, minutes, and action tracking. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 4,
    stem: "During operational, financial, compliance, quality, and risk reporting, the action-tracking clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting.",
      "Approve action-tracking clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns operational, financial, compliance, quality, and risk reporting.",
      "Treat action-tracking clipboard as final approval because the artifact exists during operational, financial, compliance, quality, and risk reporting.",
      "Send action-tracking clipboard to an unrelated department rather than the policy owner responsible for operational, financial, compliance, quality, and risk reporting. This option concerns operational, financial, compliance, quality, and risk reporting.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in operational, financial, compliance, quality, and risk reporting. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 5,
    stem: "During conflict-of-interest disclosure and recusal, the board meeting folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat board meeting folder as final approval because the artifact exists during conflict-of-interest disclosure and recusal.",
      "Replace the controlling requirement with an informal local workaround tailored to board meeting folder. This option concerns conflict-of-interest disclosure and recusal.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal.",
      "Allow the affected activity to expand while the exception in board meeting folder remains unresolved. This option concerns conflict-of-interest disclosure and recusal.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in conflict-of-interest disclosure and recusal. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 6,
    stem: "During strategic planning, succession, and governance self-assessment, the bound minutes book evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment.",
      "Defer the bound minutes book decision to a routine future cycle even though current operations depend on it. This option concerns strategic planning, succession, and governance self-assessment.",
      "Close bound minutes book when work is submitted, without testing whether the correction changed the intended outcome. This option concerns strategic planning, succession, and governance self-assessment.",
      "Treat bound minutes book as final approval because the artifact exists during strategic planning, succession, and governance self-assessment.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in strategic planning, succession, and governance self-assessment. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 7,
    stem: "During escalating unsafe or unlawful directives and documenting resolution, the action-tracking clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve action-tracking clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns escalating unsafe or unlawful directives and documenting resolution.",
      "Send action-tracking clipboard to an unrelated department rather than the policy owner responsible for escalating unsafe or unlawful directives and documenting resolution. This option concerns escalating unsafe or unlawful directives and documenting resolution.",
      "Treat action-tracking clipboard as final approval because the artifact exists during escalating unsafe or unlawful directives and documenting resolution.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in escalating unsafe or unlawful directives and documenting resolution. The decision remains traceable to GV-GB-001, GV-GB-002, GV-GB-003, GV-GB-004, GV-GB-005, GV-OG-004.",
  },
  {
    id: 8,
    stem: "How should 42 CFR §484.110 be used within Governing Body Relations & Reporting?",
    options: [
      "Replace the controlled agency policies with course narration.",
      "Apply the citation outside its stated subject and scope.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
      "Treat a citation label as proof that every operational detail is current.",
    ],
    correct: 2,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links bound minutes book and bound minutes book into an accountable Governing Body Relations & Reporting control?",
    options: [
      "An unversioned local worksheet with no assigned reviewer.",
      "A verbal understanding that no exception will recur.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A familiar dashboard color without source validation.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Governing Body Relations & Reporting establish?",
    options: [
      "Knowledge of the controlled administrator concepts in Governing Body Relations & Reporting, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Permission to replace the controlled policies with the Governing Body Relations & Reporting quiz result.",
      "Observed operational competency without an authorized evaluator.",
      "Automatic appointment authority for every decision described in Governing Body Relations & Reporting.",
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





const STORAGE_KEY = 'adm-002-progress-v6000';



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



export default function ADM002() {

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

          <span className="brand-text">ADM-002 — Governing Body</span>

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
