/**
 * ADM-004 — Compliance Program Oversight
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

import img01 from './assets/adm-004/adm-004-lesson-01.png';
import img02 from './assets/adm-004/adm-004-lesson-02.png';
import img03 from './assets/adm-004/adm-004-lesson-03.png';
import img04 from './assets/adm-004/adm-004-lesson-04.png';
import img05 from './assets/adm-004/adm-004-lesson-05.png';
import img06 from './assets/adm-004/adm-004-lesson-06.png';
import img07 from './assets/adm-004/adm-004-lesson-07.png';



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



const MODULE_META = { id: "ADM-004", title: "Compliance Program Oversight", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Effective compliance program and governing-body accountability, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Compliance officer independence and committee structure, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Code of conduct, education, and accessible reporting channels, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Non-retaliation and initial report triage, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Risk-based monitoring, auditing, and investigation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Consistent discipline, corrective action, and overpayment escalation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Compliance dashboard, board reporting, and effectiveness review, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Effecti",
    title: "Effective compliance program and governing-body accountability",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for effective compliance program and governing-body accountability within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-002, CO-CP-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-002, 9\\. References. OIG Compliance Program Guidance for HHAs: OIG (1999, updated). Source or operational basis: Requires designated compliance officer with authority.. 42 CFR § 484.100: Compliance with Federal, State, and Local Laws. Source or operational basis: Governing body must ensure legal compliance.. CO-CP-001: Corporate Compliance Program. Source or operational basis: Program within which CO operates.. CO-CP-003: Compliance Committee. Source or operational basis: CO chairs the Compliance Committee.. GV-GB-001: Governing Body Authority. Source or operational basis: Governing Body designates CO.. HR-TA-002: Background Check. Source or operational basis: CO subject to background screening.. HR-TA-003: OIG/SAM Exclusion Screening. Source or operational basis: CO subject to monthly screening.. GV-GB-003: Conflict of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Annual Program Effectiveness Review. Conduct an annual assessment of Program effectiveness using the metrics in Section 8 of this policy. Present findings to the Governing Body at the first quarterly meeting of each calendar year. The responsible role is Compliance Officer; the stated timing is Annually at Q1 Governing Body meeting.. Review the annual Program effectiveness assessment and direct any structural improvements. Document review and directives in meeting minutes. The responsible role is Governing Body; the stated timing is Annually at Q1 meeting.. Update the Program description and all CO-domain policies as needed based on the effectiveness review. The responsible role is Compliance Officer; the stated timing is Within. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, How Compliance Is Measured. Program is formally adopted by Governing Body.: Review of Governing Body minutes for adoption resolution.. Source or operational basis: Documented adoption on file at all times.. Compliance Officer is designated and functioning.: Review of designation documentation; Governing Body minutes.. Source or operational basis: Current designation documented; no vacancy exceeds 30 days without interim designee.. Annual audit work plan is approved.: Review of Compliance Committee minutes; work plan document.. Source or operational basis: Approved at Q1 Compliance Committee meeting; 100% of planned audits initiated.. Quarterly compliance reports submitted to Governing Body.: Review of report submission dates vs. quarterly meeting dates.. Source or operational basis: 100% of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, 11\\. Version Control. This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. Only the most current approved version of this policy is valid for any operational, compliance, or regulatory purpose. Any substantive revision requires: (a) Governing Body approval documented in meeting minutes; (b) re-acknowledgment by all applicable workforce members within 14 calendar days; (c) update to the enterprise policy index per EN-TG-001. Non-substantive revisions (formatting, typographical corrections) may be approved by the Compliance Officer with notification to the Governing Body at the next regular meeting. Appendix A — Corporate Compliance Program Seven-Element Reference Chart Care Indeed Home Health Care, Inc. Policy Reference. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Program Establishment and Governance. Formally adopt and approve the Corporate Compliance Program through a documented resolution recorded in Governing Body meeting minutes. The responsible role is Governing Body; the stated timing is Prior to initial Medicare certification and at each substantive Program revision.. Designate a qualified Compliance Officer per the requirements of policy CO-CP-002. Document the designation in Governing Body minutes. The responsible role is Governing Body; the stated timing is Prior to agency operation; within 30 calendar days of any vacancy.. Establish and chair the Compliance Committee per policy CO-CP-003. The responsible role is Compliance Officer; the stated timing is Within 30 calendar days of Compliance Officer designation... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to effective compliance program and governing-body accountability. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "code-of-conduct-binder-1-1", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 23, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for effective compliance program and governing-body accountability." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for effective compliance program and governing-body accountability. This decide option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during effective compliance program and governing-body accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during effective compliance program and governing-body accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for effective compliance program and governing-body accountability." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "confidential-hotline-telephone-1-2", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 31, y: 73, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in effective compliance program and governing-body accountability. This identify option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for effective compliance program and governing-body accountability." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during effective compliance program and governing-body accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during effective compliance program and governing-body accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for effective compliance program and governing-body accountability." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "compliance-audit-folder-1-3", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for effective compliance program and governing-body accountability." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during effective compliance program and governing-body accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during effective compliance program and governing-body accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for effective compliance program and governing-body accountability." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for effective compliance program and governing-body accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for effective compliance program and governing-body accountability by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for effective compliance program and governing-body accountability. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Complia",
    title: "Compliance officer independence and committee structure",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for compliance officer independence and committee structure within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-002, CO-CP-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-002, 9\\. References. OIG Compliance Program Guidance for HHAs: OIG (1999, updated). Source or operational basis: Requires designated compliance officer with authority.. 42 CFR § 484.100: Compliance with Federal, State, and Local Laws. Source or operational basis: Governing body must ensure legal compliance.. CO-CP-001: Corporate Compliance Program. Source or operational basis: Program within which CO operates.. CO-CP-003: Compliance Committee. Source or operational basis: CO chairs the Compliance Committee.. GV-GB-001: Governing Body Authority. Source or operational basis: Governing Body designates CO.. HR-TA-002: Background Check. Source or operational basis: CO subject to background screening.. HR-TA-003: OIG/SAM Exclusion Screening. Source or operational basis: CO subject to monthly screening.. GV-GB-003: Conflict of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, 11\\. Version Control. This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. Only the most current approved version of this policy is valid for any operational, compliance, or regulatory purpose. Any substantive revision requires: (a) Governing Body approval documented in meeting minutes; (b) re-acknowledgment by all applicable workforce members within 14 calendar days; (c) update to the enterprise policy index per EN-TG-001. Non-substantive revisions (formatting, typographical corrections) may be approved by the Compliance Officer with notification to the Governing Body at the next regular meeting. Appendix A — Corporate Compliance Program Seven-Element Reference Chart Care Indeed Home Health Care, Inc. Policy Reference. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, How Compliance Is Measured. Program is formally adopted by Governing Body.: Review of Governing Body minutes for adoption resolution.. Source or operational basis: Documented adoption on file at all times.. Compliance Officer is designated and functioning.: Review of designation documentation; Governing Body minutes.. Source or operational basis: Current designation documented; no vacancy exceeds 30 days without interim designee.. Annual audit work plan is approved.: Review of Compliance Committee minutes; work plan document.. Source or operational basis: Approved at Q1 Compliance Committee meeting; 100% of planned audits initiated.. Quarterly compliance reports submitted to Governing Body.: Review of report submission dates vs. quarterly meeting dates.. Source or operational basis: 100% of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, 7\\. Documentation Requirements. Program adoption: Governing Body resolution adopting the Program.. Source or operational basis: Governing Body Chair. Compliance Officer designation: Written designation with authority granted.. Source or operational basis: Governing Body Chair. Annual compliance audit work plan: Written work plan with scope, methods, and schedule.. Source or operational basis: Compliance Officer. Quarterly compliance reports: Written report submitted to Governing Body.. Source or operational basis: Compliance Officer. Training completion logs: Documentation of all workforce compliance training.. Source or operational basis: Compliance Officer. Disciplinary action log: Aggregate compliance-related disciplinary records.. Source or operational basis: Compliance Officer. Investigation records: Documentation of all compliance investigations per CO-CP-007.. Source or operational basis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-002, 8\\. Compliance Measurement. Compliance Officer is designated and documented.: Review of Governing Body minutes and Appendix A letter.. Source or operational basis: Current designation on file at all times; Appendix A letter executed.. No vacancy exceeds 30 days without interim designee.: Review of vacancy notification and interim designation dates.. Source or operational basis: 100% compliance; interim appointed within 14 days of vacancy.. Compliance Officer has direct Governing Body reporting line.: Review of Designation and Authority Letter; Governing Body meeting minutes.. Source or operational basis: Documented direct reporting line in Appendix A.. Compliance Officer conflict of interest is absent or managed.: Review of CO's Conflict of Interest Disclosure Form... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to compliance officer independence and committee structure. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR §1128" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "confidential-hotline-telephone-2-1", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 15, y: 55, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in compliance officer independence and committee structure. This identify option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance officer independence and committee structure." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance officer independence and committee structure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during compliance officer independence and committee structure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance officer independence and committee structure." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "compliance-audit-folder-2-2", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 38, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance officer independence and committee structure." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance officer independence and committee structure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during compliance officer independence and committee structure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance officer independence and committee structure." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "code-of-conduct-binder-2-3", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance officer independence and committee structure." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for compliance officer independence and committee structure. This decide option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance officer independence and committee structure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during compliance officer independence and committee structure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance officer independence and committee structure." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance officer independence and committee structure. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance officer independence and committee structure by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance officer independence and committee structure. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Code",
    title: "Code of conduct, education, and accessible reporting channels",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for code of conduct, education, and accessible reporting channels within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-001, CO-CP-006, CO-CP-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-001, Communication and Reporting Lines. Maintain multiple accessible reporting mechanisms per policy CO-CP-006 including a compliance hotline, anonymous reporting option, and direct email to the Compliance Officer. The responsible role is Compliance Officer; the stated timing is Continuously.. Ensure all workforce members are informed of reporting mechanisms at hire, during annual training, and upon any change to reporting channels. The responsible role is Compliance Officer; the stated timing is At hire; annually; upon change.. Prepare and deliver a written compliance status report to the Governing Body no fewer than 7 calendar days before each quarterly meeting. The report must address: (a) active compliance investigations (without compromising confidentiality); (b) audit findings. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-006, Publicizing Reporting Mechanisms. Distribute reporting mechanism information to all workforce members at hire. The responsible role is Administrator; the stated timing is At hire.. Maintain posted Non-Retaliation Notice (CO-CP-005 Appendix A) with hotline and reporting contact information in accessible areas throughout the agency. The responsible role is Compliance Officer; the stated timing is Continuously.. Include reporting mechanisms in the annual compliance training per CO-CP-008. The responsible role is Compliance Officer; the stated timing is Annually.. Post reporting mechanism information on the agency intranet or shared drive accessible to all workforce members. The responsible role is Compliance Officer; the stated timing is Continuously; updated within 5 days of any. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-004, 10\\. References. 42 U.S.C. § 1320a-7b. Anti-Kickback Statute — gift and referral prohibitions.. 31 U.S.C. §§ 3729–3733. False Claims Act — billing integrity requirements.. 42 CFR § 484.100. Compliance with Federal, State, and Local Laws.. HIPAA Privacy Rule (45 CFR Parts 160 & 164). Patient confidentiality standards.. OIG Compliance Program Guidance for HHAs. Code of Conduct is a required Program element.. CO-CP-001. Corporate Compliance Program — Code is an element.. CO-CP-005. Whistleblower Protection — non-retaliation for reporting.. CO-CP-006. Reporting mechanisms for Code violations.. CO-HP-001. HIPAA Privacy Program.. CL-PR-001. Patient Rights.. HR-ER-004. Anti-Harassment.. Appendix A — Code of Conduct and Ethics Attestation Form Care Indeed Home Health Care. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-004, 4\\. Policy Statement. 4.1 Every individual within the scope of this policy shall conduct themselves in accordance with the standards of this Code at all times, whether on or off agency premises, when representing the agency in any capacity. 4.2 Adherence to this Code is a condition of employment or contract with Care Indeed Home Health Care, Inc. Violations are subject to disciplinary action up to and including termination or contract cancellation. 4.3 No one in a position of authority — including the Administrator or Governing Body members — may authorize conduct that violates this Code, applicable law, or regulation. 4.4 All workforce members have the affirmative obligation. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-004, 5\\. Core Standards of Conduct. 5.1 Patient-Centered Care and Dignity All workforce members shall: Treat every patient with dignity, respect, and compassion regardless of diagnosis, age, race, color, national origin, sex, disability, religion, or ability to pay. Protect patient privacy and confidentiality at all times per policies CO-HP-001 and CO-HP-002. Honor patient rights as defined in policy CL-PR-001. Never exploit, abuse, neglect, or mistreat a patient. All suspected abuse, neglect, or exploitation shall be reported immediately per policies CL-PR-006 and HR-ER-009. Provide only services that are ordered, medically necessary, and within their scope of practice. 5.2 Integrity in Billing and Documentation All workforce members shall: Document clinical services accurately, completely. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to code of conduct, education, and accessible reporting channels. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR §1128" },
      { kind: "External Authority", text: "42 CFR §420" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "compliance-audit-folder-3-1", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 14, y: 59, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for code of conduct, education, and accessible reporting channels." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during code of conduct, education, and accessible reporting channels." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for code of conduct, education, and accessible reporting channels." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "code-of-conduct-binder-3-2", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 52, y: 76, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for code of conduct, education, and accessible reporting channels." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for code of conduct, education, and accessible reporting channels. This decide option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during code of conduct, education, and accessible reporting channels." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for code of conduct, education, and accessible reporting channels." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "confidential-hotline-telephone-3-3", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 79, y: 45, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in code of conduct, education, and accessible reporting channels. This identify option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for code of conduct, education, and accessible reporting channels." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during code of conduct, education, and accessible reporting channels." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during code of conduct, education, and accessible reporting channels.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for code of conduct, education, and accessible reporting channels." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for code of conduct, education, and accessible reporting channels. Identify the verified status, discrepancy, affected requirement, and accountable owner for code of conduct, education, and accessible reporting channels by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for code of conduct, education, and accessible reporting channels. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Non-ret",
    title: "Non-retaliation and initial report triage",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for non-retaliation and initial report triage within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-006, CO-CP-001, CO-CP-004, CO-CP-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-006, Report Receipt and Logging. Log every report received through any channel in the Compliance Report Log (Appendix A) within 1 business day of receipt. Assign a unique tracking number to each report. The responsible role is Compliance Officer (or designee); the stated timing is Within 1 business day.. Acknowledge receipt of non-anonymous reports within 5 business days. Anonymous hotline reports: no acknowledgment (to protect anonymity). The responsible role is Compliance Officer; the stated timing is Within 5 business days.. Conduct initial triage of the report to determine: (a) urgency (immediate patient safety risk vs. standard investigation); (b) whether interim protective action is required pending investigation; (c) referral to appropriate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-006, Feedback to Reporters. Provide non-anonymous reporters a status update acknowledging that the investigation is in progress. The responsible role is Compliance Officer; the stated timing is Within 30 calendar days of report receipt.. Notify non-anonymous reporters when the investigation is closed and whether the report was substantiated or unsubstantiated. Specific findings are not disclosed if confidentiality of others would be compromised. The responsible role is Compliance Officer; the stated timing is Within 7 days of investigation close.. For reports that result in corrective action, notify the reporter (if non-anonymous) that corrective action has been taken (without disclosing confidential details of personnel actions). The responsible role is Compliance Officer. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Communication and Reporting Lines. Maintain multiple accessible reporting mechanisms per policy CO-CP-006 including a compliance hotline, anonymous reporting option, and direct email to the Compliance Officer. The responsible role is Compliance Officer; the stated timing is Continuously.. Ensure all workforce members are informed of reporting mechanisms at hire, during annual training, and upon any change to reporting channels. The responsible role is Compliance Officer; the stated timing is At hire; annually; upon change.. Prepare and deliver a written compliance status report to the Governing Body no fewer than 7 calendar days before each quarterly meeting. The report must address: (a) active compliance investigations (without compromising confidentiality); (b) audit findings. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-004, 6\\. Reporting Violations. 6.1 All workforce members have an affirmative obligation to report suspected violations of this Code, applicable law, or agency policy. 6.2 Reports may be made through any of the following mechanisms (per policy CO-CP-006): Direct contact with the Compliance Officer Agency compliance hotline (anonymous option available) Direct contact with the Governing Body Chair (for matters involving the Compliance Officer or Administrator) 6.3 Reports may be made anonymously. Anonymous reports will be investigated to the extent practicable given the information provided. 6.4 No individual will be retaliated against for making a good-faith compliance report, per policy CO-CP-005.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-005, How to Make a Protected Report. Method: Contact. Source or operational basis: Anonymity Available?. Direct report to Compliance Officer: [Compliance Officer contact maintained in agency directory]. Source or operational basis: No (but confidentiality maintained). Compliance Hotline: [Hotline number maintained in agency directory per CO-CP-006]. Source or operational basis: Yes. Anonymous written report: Submitted per CO-CP-006 instructions. Source or operational basis: Yes. Direct report to Governing Body Chair: [Governing Body Chair contact per GV-GB-001 roster]. Source or operational basis: No (but confidentiality maintained). External report to OIG Hotline: 1-800-HHS-TIPS (1-800-447-8477). Source or operational basis: Yes. External report to California DHCS: Per DHCS complaint process. Source or operational basis: Variable.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to non-retaliation and initial report triage. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR §420" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "code-of-conduct-binder-4-1", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for non-retaliation and initial report triage." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for non-retaliation and initial report triage. This decide option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during non-retaliation and initial report triage." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during non-retaliation and initial report triage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for non-retaliation and initial report triage." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "confidential-hotline-telephone-4-2", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 34, y: 42, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in non-retaliation and initial report triage. This identify option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for non-retaliation and initial report triage." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during non-retaliation and initial report triage." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during non-retaliation and initial report triage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for non-retaliation and initial report triage." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "compliance-audit-folder-4-3", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for non-retaliation and initial report triage." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during non-retaliation and initial report triage." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during non-retaliation and initial report triage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for non-retaliation and initial report triage." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for non-retaliation and initial report triage. Identify the verified status, discrepancy, affected requirement, and accountable owner for non-retaliation and initial report triage by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for non-retaliation and initial report triage. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Risk-ba",
    title: "Risk-based monitoring, auditing, and investigation",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for risk-based monitoring, auditing, and investigation within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-007, CO-CP-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-007, Investigation Initiation. Upon receiving a report (via CO-CP-006) or self-identifying a compliance concern, complete the Initial Triage Assessment (Appendix A) within 5 business days. The responsible role is Compliance Officer; the stated timing is Within 5 business days of receipt.. Based on triage, classify the concern as: (a) Requires Formal Investigation — credible allegation of violation; (b) Administrative Review — policy question or minor deviation; (c) No Action Required — report not credible or not a violation; (d) Referral — matter outside agency jurisdiction (e.g., patient abuse requiring mandatory reporting). Document triage decision with rationale. The responsible role is Compliance Officer; the stated timing is Within 5. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-007, Investigation Closure. Prepare an Investigation Closure Memorandum (Appendix E) upon: (a) completion of investigation and CAP implementation; (b) determination of no further action required; (c) referral to external authority. The responsible role is Compliance Officer; the stated timing is Within 7 days of CAP confirmation or determination of no action.. Update the Compliance Report Log (CO-CP-006 Appendix A) with investigation outcome and closure date. The responsible role is Compliance Officer; the stated timing is Within 1 business day of closure.. Notify non-anonymous reporters of investigation closure and outcome (without disclosing confidential details) per CO-CP-006 Section 6.4. The responsible role is Compliance Officer; the stated timing is Within. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-007, 9\\. References. 31 U.S.C. §§ 3729–3733. False Claims Act — investigation triggers repayment obligation.. 42 U.S.C. § 1320a-7b. Anti-Kickback Statute — investigation trigger.. OIG Compliance Program Guidance for HHAs. Investigation and response are required Program elements.. CO-CP-001. Corporate Compliance Program.. CO-CP-005. Non-Retaliation — applies to all investigation participants.. CO-CP-006. Reporting mechanisms — source of investigations.. QA-AE-003. CAP development.. FN-BC-004. Overpayment refund — 60-day rule.. HR-ER-002. Progressive discipline for confirmed violations.. GV-GB-001. Governing Body notification requirements.. Appendix A — Initial Triage Assessment Form Care Indeed Home Health Care, Inc. Policy Reference: CO-CP-007 | Version: 1.0 | CONFIDENTIAL Report Tracking Number (from CO-CP-006 log). Date Report Received. Triage Completed. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-007, 7\\. Documentation Requirements. Initial Triage Assessment: Appendix A form for every report evaluated.. Source or operational basis: Compliance Officer. Investigation Opening Memorandum: Appendix B.. Source or operational basis: Compliance Officer. Evidence log: Log of all evidence collected with chain of custody notation.. Source or operational basis: Investigator. Interview notes: Contemporaneous notes per Appendix C.. Source or operational basis: Investigator. Findings Memorandum: Appendix D.. Source or operational basis: Investigator / Compliance Officer. Corrective Action Plan: Per QA-AE-003 template.. Source or operational basis: Compliance Officer. Investigation Closure Memorandum: Appendix E.. Source or operational basis: Compliance Officer. Compliance Report Log: Updated per CO-CP-006 Appendix A.. Source or operational basis: Compliance Officer.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Internal Monitoring and Auditing. Develop and maintain an annual compliance audit work plan. The work plan shall prioritize: (a) billing and claims accuracy; (b) OASIS data integrity; (c) medical necessity documentation; (d) exclusion screening compliance; (e) policy acknowledgment rates; (f) fraud and abuse risk areas identified by OIG Work Plan. The responsible role is Compliance Officer; the stated timing is Approved at first Compliance Committee meeting of each calendar year.. Conduct or commission audits per the annual work plan and document all findings, methodology, sample sizes, and corrective actions, per policy CO-RA-002. The responsible role is Compliance Officer; the stated timing is Per audit work plan schedule.. Present audit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to risk-based monitoring, auditing, and investigation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.100" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "confidential-hotline-telephone-5-1", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 14, y: 46, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in risk-based monitoring, auditing, and investigation. This identify option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk-based monitoring, auditing, and investigation." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk-based monitoring, auditing, and investigation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk-based monitoring, auditing, and investigation." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "compliance-audit-folder-5-2", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 28, y: 66, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk-based monitoring, auditing, and investigation." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk-based monitoring, auditing, and investigation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk-based monitoring, auditing, and investigation." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "code-of-conduct-binder-5-3", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 80, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk-based monitoring, auditing, and investigation." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for risk-based monitoring, auditing, and investigation. This decide option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk-based monitoring, auditing, and investigation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during risk-based monitoring, auditing, and investigation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk-based monitoring, auditing, and investigation." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for risk-based monitoring, auditing, and investigation. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk-based monitoring, auditing, and investigation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk-based monitoring, auditing, and investigation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Consist",
    title: "Consistent discipline, corrective action, and overpayment escalation",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for consistent discipline, corrective action, and overpayment escalation within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-007, CO-CP-001, CO-CP-003, CO-CP-006, CO-CP-008, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-007, Corrective Action. For substantiated investigations: develop a Corrective Action Plan (CAP) per policy QA-AE-003 within 14 calendar days of the Findings Memorandum approval. The CAP must address: (a) root cause; (b) immediate corrective measures; (c) systemic process improvements; (d) responsible parties; (e) deadlines; (f) monitoring metrics. The responsible role is Compliance Officer; the stated timing is Within 14 calendar days of Findings Memorandum approval.. For substantiated investigations involving individual employee misconduct: recommend disciplinary action per CO-CP-004 severity scale and HR-ER-002 progressive discipline policy. The responsible role is Compliance Officer / HR Director; the stated timing is Within 5 business days of Findings Memorandum approval.. For substantiated overpayment. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Enforcement and Discipline. Ensure disciplinary standards for compliance violations are defined in the Code of Conduct (CO-CP-004) and Employee Handbook. Disciplinary standards must be consistently applied without exception for seniority or role. The responsible role is Compliance Officer / HR Director; the stated timing is Continuously.. Apply progressive discipline for compliance violations per policy HR-ER-002. All disciplinary actions related to compliance violations shall be reported to the Compliance Officer within 5 calendar days. The responsible role is HR Director; the stated timing is Within 5 calendar days of disciplinary action.. Maintain a disciplinary action log for all compliance-related violations. Report aggregate trends to the Governing Body quarterly. The. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-003, Escalation to Governing Body. High-risk compliance deficiency identified: Compliance Officer notifies Governing Body in writing; special meeting may be requested.. Source or operational basis: Within 14 calendar days of identification.. Active investigation of fraud, waste, or abuse: Compliance Officer reports to Governing Body per CO-CP-001 Section 6.4.3.. Source or operational basis: At next quarterly meeting or sooner if risk warrants.. Corrective action plan not completed within deadline: Compliance Officer escalates to Governing Body with updated risk assessment.. Source or operational basis: At next quarterly meeting.. Regulatory agency contact or survey findings: Compliance Officer notifies Governing Body Chair within 24 hours; written summary within 5 days.. Source or operational basis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-006, Feedback to Reporters. Provide non-anonymous reporters a status update acknowledging that the investigation is in progress. The responsible role is Compliance Officer; the stated timing is Within 30 calendar days of report receipt.. Notify non-anonymous reporters when the investigation is closed and whether the report was substantiated or unsubstantiated. Specific findings are not disclosed if confidentiality of others would be compromised. The responsible role is Compliance Officer; the stated timing is Within 7 days of investigation close.. For reports that result in corrective action, notify the reporter (if non-anonymous) that corrective action has been taken (without disclosing confidential details of personnel actions). The responsible role is Compliance Officer. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-008, Non-Completion Escalation. Generate a non-completion report identifying all workforce members who have not completed required training by the deadline. The responsible role is Compliance Officer; the stated timing is On deadline date.. Notify the non-compliant workforce member's direct supervisor in writing. The responsible role is Compliance Officer; the stated timing is Within 5 business days of deadline.. Issue written notice to the non-compliant workforce member requiring completion within 7 additional calendar days. The responsible role is Supervisor / HR Director; the stated timing is Within 5 business days of notification.. If training is not completed within the extended 7-day period, initiate formal disciplinary action per CO-CP-004 and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to consistent discipline, corrective action, and overpayment escalation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR §484.100" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "compliance-audit-folder-6-1", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for consistent discipline, corrective action, and overpayment escalation." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during consistent discipline, corrective action, and overpayment escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent discipline, corrective action, and overpayment escalation." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "code-of-conduct-binder-6-2", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 37, y: 39, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for consistent discipline, corrective action, and overpayment escalation." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for consistent discipline, corrective action, and overpayment escalation. This decide option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during consistent discipline, corrective action, and overpayment escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent discipline, corrective action, and overpayment escalation." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "confidential-hotline-telephone-6-3", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 75, y: 57, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in consistent discipline, corrective action, and overpayment escalation. This identify option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for consistent discipline, corrective action, and overpayment escalation." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during consistent discipline, corrective action, and overpayment escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during consistent discipline, corrective action, and overpayment escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent discipline, corrective action, and overpayment escalation." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for consistent discipline, corrective action, and overpayment escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for consistent discipline, corrective action, and overpayment escalation by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for consistent discipline, corrective action, and overpayment escalation. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Complia",
    title: "Compliance dashboard, board reporting, and effectiveness review",
    subtitle: "Compliance Program Oversight",
    narration: [
      "This lesson develops administrator judgment for compliance dashboard, board reporting, and effectiveness review within Compliance Program Oversight. Begin with the current controlled versions of CO-CP-001, CO-CP-002, CO-CP-008, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-001, How Compliance Is Measured. Program is formally adopted by Governing Body.: Review of Governing Body minutes for adoption resolution.. Source or operational basis: Documented adoption on file at all times.. Compliance Officer is designated and functioning.: Review of designation documentation; Governing Body minutes.. Source or operational basis: Current designation documented; no vacancy exceeds 30 days without interim designee.. Annual audit work plan is approved.: Review of Compliance Committee minutes; work plan document.. Source or operational basis: Approved at Q1 Compliance Committee meeting; 100% of planned audits initiated.. Quarterly compliance reports submitted to Governing Body.: Review of report submission dates vs. quarterly meeting dates.. Source or operational basis: 100% of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-002, 9\\. References. OIG Compliance Program Guidance for HHAs: OIG (1999, updated). Source or operational basis: Requires designated compliance officer with authority.. 42 CFR § 484.100: Compliance with Federal, State, and Local Laws. Source or operational basis: Governing body must ensure legal compliance.. CO-CP-001: Corporate Compliance Program. Source or operational basis: Program within which CO operates.. CO-CP-003: Compliance Committee. Source or operational basis: CO chairs the Compliance Committee.. GV-GB-001: Governing Body Authority. Source or operational basis: Governing Body designates CO.. HR-TA-002: Background Check. Source or operational basis: CO subject to background screening.. HR-TA-003: OIG/SAM Exclusion Screening. Source or operational basis: CO subject to monthly screening.. GV-GB-003: Conflict of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Annual Program Effectiveness Review. Conduct an annual assessment of Program effectiveness using the metrics in Section 8 of this policy. Present findings to the Governing Body at the first quarterly meeting of each calendar year. The responsible role is Compliance Officer; the stated timing is Annually at Q1 Governing Body meeting.. Review the annual Program effectiveness assessment and direct any structural improvements. Document review and directives in meeting minutes. The responsible role is Governing Body; the stated timing is Annually at Q1 meeting.. Update the Program description and all CO-domain policies as needed based on the effectiveness review. The responsible role is Compliance Officer; the stated timing is Within. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-002, 8\\. Compliance Measurement. Compliance Officer is designated and documented.: Review of Governing Body minutes and Appendix A letter.. Source or operational basis: Current designation on file at all times; Appendix A letter executed.. No vacancy exceeds 30 days without interim designee.: Review of vacancy notification and interim designation dates.. Source or operational basis: 100% compliance; interim appointed within 14 days of vacancy.. Compliance Officer has direct Governing Body reporting line.: Review of Designation and Authority Letter; Governing Body meeting minutes.. Source or operational basis: Documented direct reporting line in Appendix A.. Compliance Officer conflict of interest is absent or managed.: Review of CO's Conflict of Interest Disclosure Form... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-008, Required Compliance Orientation Curriculum. #: Training Module. Source or operational basis: Content Summary. 1: Corporate Compliance Program Overview. Source or operational basis: Seven OIG elements; structure; CO role; Compliance Committee. 2: Code of Conduct & Ethics. Source or operational basis: Standards; prohibited conduct; consequences. 3: Fraud, Waste & Abuse Prevention. Source or operational basis: FCA; AKS; Stark Law; FWA definitions; examples. 4: HIPAA Privacy Fundamentals. Source or operational basis: PHI; minimum necessary; patient rights; permitted disclosures. 5: HIPAA Security Basics. Source or operational basis: Access controls; password security; device security; breach prevention. 6: Reporting Mechanisms & Non-Retaliation. Source or operational basis: Hotline; reporting methods; whistleblower protection. 7: OIG/SAM Exclusion. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to compliance dashboard, board reporting, and effectiveness review. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "code-of-conduct binder", detail: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "confidential hotline telephone", detail: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "compliance audit folder", detail: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-002" },
      { kind: "Controlled Policy", text: "CO-CP-003" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "Controlled Policy", text: "CO-CP-005" },
      { kind: "Controlled Policy", text: "CO-CP-006" },
      { kind: "Controlled Policy", text: "CO-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-008" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "45 CFR" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "code-of-conduct-binder-7-1", label: "code-of-conduct binder", shortLabel: "code-of-conduct binder", ariaLabel: "Investigate code-of-conduct binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status." },
          { id: "i2", label: "Treat code-of-conduct binder as complete proof without comparing confidential hotline telephone or the controlled source. This identify option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance dashboard, board reporting, and effectiveness review." },
          { id: "i3", label: "Classify the code-of-conduct binder by department custom even though its authority and current status are unverified. This identify option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about code-of-conduct binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve code-of-conduct binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for code-of-conduct binder is resolved." },
          { id: "d3", label: "Send code-of-conduct binder to an unrelated department rather than the policy owner responsible for compliance dashboard, board reporting, and effectiveness review. This decide option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance dashboard, board reporting, and effectiveness review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that code-of-conduct binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of code-of-conduct binder." },
          { id: "doc3", label: "Keep the code-of-conduct binder decision in personal notes rather than the governed evidence location. This document option concerns code-of-conduct binder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance dashboard, board reporting, and effectiveness review." },
        ],
        feedback: {
          observed: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
          meaning: "Observe the real code-of-conduct binder in the photographed scene. Compare it with the confidential hotline telephone, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For code-of-conduct binder, compare the visible evidence with confidential hotline telephone and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to code-of-conduct binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For code-of-conduct binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "confidential-hotline-telephone-7-2", label: "confidential hotline telephone", shortLabel: "confidential hotline telephone", ariaLabel: "Investigate confidential hotline telephone",
        x: 44, y: 54, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume confidential hotline telephone applies to every role, location, and exception described in compliance dashboard, board reporting, and effectiveness review. This identify option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance dashboard, board reporting, and effectiveness review." },
          { id: "i3", label: "Use the oldest available confidential hotline telephone because prior approval is easier to confirm. This identify option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about confidential hotline telephone." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in confidential hotline telephone remains unresolved. This decide option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for confidential hotline telephone is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to confidential hotline telephone. This decide option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance dashboard, board reporting, and effectiveness review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark confidential hotline telephone closed on assignment, before completion and effectiveness evidence exist. This document option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confidential hotline telephone." },
          { id: "doc3", label: "Retain only a summary of confidential hotline telephone and discard the source artifact needed to reconstruct the decision. This document option concerns confidential hotline telephone during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance dashboard, board reporting, and effectiveness review." },
        ],
        feedback: {
          observed: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
          meaning: "Observe the real confidential hotline telephone in the photographed scene. Compare it with the compliance audit folder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For confidential hotline telephone, compare the visible evidence with compliance audit folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to confidential hotline telephone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For confidential hotline telephone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
      {
        id: "compliance-audit-folder-7-3", label: "compliance audit folder", shortLabel: "compliance audit folder", ariaLabel: "Investigate compliance audit folder",
        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status." },
          { id: "i2", label: "Read compliance audit folder only for favorable indicators and omit the exception evidence connected to code-of-conduct binder. This identify option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for compliance dashboard, board reporting, and effectiveness review." },
          { id: "i3", label: "Treat an unsigned or unverified compliance audit folder as equivalent to the current controlled record. This identify option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about compliance audit folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close compliance audit folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for compliance audit folder is resolved." },
          { id: "d3", label: "Defer the compliance audit folder decision to a routine future cycle even though current operations depend on it. This decide option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during compliance dashboard, board reporting, and effectiveness review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For compliance audit folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for compliance audit folder but omit the actual evidence, communications, and unresolved items. This document option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance audit folder." },
          { id: "doc3", label: "Combine compliance audit folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns compliance audit folder during compliance dashboard, board reporting, and effectiveness review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for compliance dashboard, board reporting, and effectiveness review." },
        ],
        feedback: {
          observed: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review.",
          meaning: "Observe the real compliance audit folder in the photographed scene. Compare it with the code-of-conduct binder, current controlled sources, assigned decision rights, and corroborating records for compliance dashboard, board reporting, and effectiveness review. Identify the verified status, discrepancy, affected requirement, and accountable owner for compliance dashboard, board reporting, and effectiveness review by reconciling all three photographed evidence objects with the current controlled source. For compliance audit folder, compare the visible evidence with code-of-conduct binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. Apply that decision specifically to compliance audit folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for compliance dashboard, board reporting, and effectiveness review. For compliance audit folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-CP-001","CO-CP-002","CO-CP-003","CO-CP-004","CO-CP-005","CO-CP-006","CO-CP-007","CO-CP-008","42 CFR § 484.100","42 CFR § 484.105","42 CFR §1128","42 CFR §420","42 CFR §484.110","42 CFR §484.100","42 CFR Part 484","45 CFR"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During effective compliance program and governing-body accountability, the compliance audit folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability.",
      "Send compliance audit folder to an unrelated department rather than the policy owner responsible for effective compliance program and governing-body accountability. This option concerns effective compliance program and governing-body accountability.",
      "Treat compliance audit folder as final approval because the artifact exists during effective compliance program and governing-body accountability.",
      "Approve compliance audit folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns effective compliance program and governing-body accountability.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in effective compliance program and governing-body accountability. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 2,
    stem: "During compliance officer independence and committee structure, the code-of-conduct binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in code-of-conduct binder remains unresolved. This option concerns compliance officer independence and committee structure.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure.",
      "Treat code-of-conduct binder as final approval because the artifact exists during compliance officer independence and committee structure.",
      "Replace the controlling requirement with an informal local workaround tailored to code-of-conduct binder. This option concerns compliance officer independence and committee structure.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance officer independence and committee structure. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 3,
    stem: "During code of conduct, education, and accessible reporting channels, the confidential hotline telephone evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the confidential hotline telephone decision to a routine future cycle even though current operations depend on it. This option concerns code of conduct, education, and accessible reporting channels.",
      "Close confidential hotline telephone when work is submitted, without testing whether the correction changed the intended outcome. This option concerns code of conduct, education, and accessible reporting channels.",
      "Treat confidential hotline telephone as final approval because the artifact exists during code of conduct, education, and accessible reporting channels.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in code of conduct, education, and accessible reporting channels. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 4,
    stem: "During non-retaliation and initial report triage, the compliance audit folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send compliance audit folder to an unrelated department rather than the policy owner responsible for non-retaliation and initial report triage. This option concerns non-retaliation and initial report triage.",
      "Treat compliance audit folder as final approval because the artifact exists during non-retaliation and initial report triage.",
      "Approve compliance audit folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns non-retaliation and initial report triage.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in non-retaliation and initial report triage. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 5,
    stem: "During risk-based monitoring, auditing, and investigation, the code-of-conduct binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in code-of-conduct binder remains unresolved. This option concerns risk-based monitoring, auditing, and investigation.",
      "Treat code-of-conduct binder as final approval because the artifact exists during risk-based monitoring, auditing, and investigation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation.",
      "Replace the controlling requirement with an informal local workaround tailored to code-of-conduct binder. This option concerns risk-based monitoring, auditing, and investigation.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk-based monitoring, auditing, and investigation. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 6,
    stem: "During consistent discipline, corrective action, and overpayment escalation, the confidential hotline telephone evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation.",
      "Close confidential hotline telephone when work is submitted, without testing whether the correction changed the intended outcome. This option concerns consistent discipline, corrective action, and overpayment escalation.",
      "Treat confidential hotline telephone as final approval because the artifact exists during consistent discipline, corrective action, and overpayment escalation.",
      "Defer the confidential hotline telephone decision to a routine future cycle even though current operations depend on it. This option concerns consistent discipline, corrective action, and overpayment escalation.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in consistent discipline, corrective action, and overpayment escalation. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 7,
    stem: "During compliance dashboard, board reporting, and effectiveness review, the compliance audit folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send compliance audit folder to an unrelated department rather than the policy owner responsible for compliance dashboard, board reporting, and effectiveness review. This option concerns compliance dashboard, board reporting, and effectiveness review.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review.",
      "Approve compliance audit folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns compliance dashboard, board reporting, and effectiveness review.",
      "Treat compliance audit folder as final approval because the artifact exists during compliance dashboard, board reporting, and effectiveness review.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in compliance dashboard, board reporting, and effectiveness review. The decision remains traceable to CO-CP-001, CO-CP-002, CO-CP-003, CO-CP-004, CO-CP-005, CO-CP-006, CO-CP-007, CO-CP-008.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.100 be used within Compliance Program Oversight?",
    options: [
      "Treat a citation label as proof that every operational detail is current.",
      "Replace the controlled agency policies with course narration.",
      "Apply the citation outside its stated subject and scope.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
    ],
    correct: 3,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links confidential hotline telephone and confidential hotline telephone into an accountable Compliance Program Oversight control?",
    options: [
      "A familiar dashboard color without source validation.",
      "A verbal understanding that no exception will recur.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "An unversioned local worksheet with no assigned reviewer.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Compliance Program Oversight establish?",
    options: [
      "Observed operational competency without an authorized evaluator.",
      "Knowledge of the controlled administrator concepts in Compliance Program Oversight, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Automatic appointment authority for every decision described in Compliance Program Oversight.",
      "Permission to replace the controlled policies with the Compliance Program Oversight quiz result.",
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





const STORAGE_KEY = 'adm-004-progress-v6000';



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



export default function ADM004() {

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

          <span className="brand-text">ADM-004 — Compliance</span>

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
