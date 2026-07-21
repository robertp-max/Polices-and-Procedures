/**
 * ADM-008 — Risk Management & Liability
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

import img01 from './assets/adm-008/adm-008-lesson-01.png';
import img02 from './assets/adm-008/adm-008-lesson-02.png';
import img03 from './assets/adm-008/adm-008-lesson-03.png';
import img04 from './assets/adm-008/adm-008-lesson-04.png';
import img05 from './assets/adm-008/adm-008-lesson-05.png';
import img06 from './assets/adm-008/adm-008-lesson-06.png';
import img07 from './assets/adm-008/adm-008-lesson-07.png';



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



const MODULE_META = { id: "ADM-008", title: "Risk Management & Liability", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Enterprise risk domains, appetite, register, and ownership, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Just-culture event and near-miss reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Triage, investigation, root-cause analysis, and immediate protection, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Corrective-action strength, owner, deadline, and effectiveness check, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Risk trending, thresholds, and predictive indicators, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Insurance notification, claims preservation, and litigation support, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Risk committee dashboard and governing-body decisions, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Enterpr",
    title: "Enterprise risk domains, appetite, register, and ownership",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for enterprise risk domains, appetite, register, and ownership within Risk Management & Liability. Begin with the current controlled versions of RM-ER-001, RM-ER-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-001, Risk Monitoring and Reporting. Maintain the centralized Risk Register (Appendix C) with current status for all identified risks. The Risk Register must document: (a) Risk ID; (b) date identified; (c) risk description; (d) category; (e) likelihood score; (f) severity score; (g) risk score; (h) priority; (i) Risk Owner; (j) mitigation status; (k) residual risk; (l) last review date; (m) next review date. The responsible role is Risk Manager; the stated timing is Updated continuously; formally reviewed quarterly.. Prepare and submit a quarterly Enterprise Risk Report (Appendix D) to the Risk Management Committee and Administrator, documenting: (a) Risk Register summary with trending; (b) new risks identified; (c) risks closed/resolved; (d). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, 10\\. Version Control. 10.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 10.2 Only the most current approved version is valid. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 10.3 Any substantive revision requires: (a) review and approval by the Governing Body; (b) re-acknowledgment by all in-scope personnel within 14 calendar days; (c) update to the enterprise policy index per EN-TG-001. 10.4 Non-substantive revisions may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Appendix A — Risk Assessment Matrix Care Indeed Home Health Care, Inc. Policy Reference: RM-ER-001. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-003, Annual Comprehensive Risk Assessment. Develop the annual risk assessment plan, identifying: (a) domains to be assessed; (b) assessment methodology; (c) data sources; (d) timeline; (e) participants required. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Distribute the Departmental Risk Identification Worksheet (Appendix A) to all department directors with instructions. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Complete the Departmental Risk Identification Worksheet by identifying the top 5 risks within their domain, with preliminary likelihood/severity estimates and supporting data. The responsible role is Department Directors; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Mitigation Planning. Develop a Risk Mitigation Plan (Appendix B) for each Critical and High priority risk, documenting: (a) risk description and root cause; (b) current controls in place; (c) proposed mitigation actions; (d) responsible party (Risk Owner); (e) implementation timeline; (f) success metrics; (g) residual risk assessment; (h) monitoring frequency. The responsible role is Risk Manager; the stated timing is Within 7 calendar days for Critical; within 14 calendar days for High.. Implement approved mitigation actions per the plan timeline and report progress to the Risk Manager at defined intervals. The responsible role is Risk Owner (Assigned); the stated timing is Per plan timeline; progress reports at. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Assessment and Prioritization. Assess each identified risk using the agency's standardized Risk Assessment Matrix (Appendix A) evaluating: (a) Likelihood of occurrence (1–5 scale); (b) Severity of impact (1–5 scale); (c) Risk Score = Likelihood × Severity. The responsible role is Risk Manager; the stated timing is Within 14 calendar days of risk identification.. Categorize each assessed risk by domain: Clinical, Compliance/Regulatory, Financial, Operational, Technology, Human Resources, Reputational, Legal/Litigation, Environmental/Safety. The responsible role is Risk Manager; the stated timing is Concurrent with assessment.. Classify each risk by priority level per the Risk Assessment Matrix: Critical (20–25), High (12–19), Moderate (6–11), Low (1–5). The responsible role is Risk Manager; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to enterprise risk domains, appetite, register, and ownership. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "risk-register-binder-1-1", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for enterprise risk domains, appetite, register, and ownership." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for enterprise risk domains, appetite, register, and ownership. This decide option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during enterprise risk domains, appetite, register, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for enterprise risk domains, appetite, register, and ownership." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "incident-evidence-folder-1-2", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 32, y: 67, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in enterprise risk domains, appetite, register, and ownership. This identify option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for enterprise risk domains, appetite, register, and ownership." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during enterprise risk domains, appetite, register, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for enterprise risk domains, appetite, register, and ownership." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "insurance-portfolio-1-3", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 81, y: 60, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for enterprise risk domains, appetite, register, and ownership." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during enterprise risk domains, appetite, register, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during enterprise risk domains, appetite, register, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for enterprise risk domains, appetite, register, and ownership." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for enterprise risk domains, appetite, register, and ownership. Identify the verified status, discrepancy, affected requirement, and accountable owner for enterprise risk domains, appetite, register, and ownership by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for enterprise risk domains, appetite, register, and ownership. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Just-cu",
    title: "Just-culture event and near-miss reporting",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for just-culture event and near-miss reporting within Risk Management & Liability. Begin with the current controlled versions of QA-AE-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — QA-AE-001, 12\\. Appendices. Appendix A: Adverse Event Report Form Care Indeed Home Health Care, Inc. CONFIDENTIAL — Adverse Event Report Form Policy Reference: QA-AE-001 | Version: 6.0 DO NOT FILE IN THE PATIENT'S CLINICAL RECORD. Submit to Director of Nursing within 24 hours of event. SECTION 1 — EVENT IDENTIFICATION Patient Name:. Patient ID / MR#:. Date of Event:. Time of Event:. Location of Event:. ☐ Patient Home ☐ Community ☐ Other: _____________. Date Discovered (if different from event date):. Reporting Staff Member Name:. Reporting Staff Member Title:. Reporting Staff Member Signature:. Date / Time Report Completed:. SECTION 2 — EVENT CATEGORY (check all that apply) Category. ✓.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, Adverse Event Classification and Reportable Events. Maintain a written Adverse Event Classification Guide that defines the agency's adverse event categories, severity levels, and reporting requirements. The guide must be accessible to all staff and included in orientation training. The responsible role is QAPI Coordinator; the stated timing is At policy effective date; reviewed annually.. Report the following categories of events using the Adverse Event Report Form (Appendix A): (a) Patient falls (with or without injury); (b) Medication errors (wrong drug, wrong dose, wrong route, wrong time, omission); (c) Adverse drug reactions; (d) Hospital admissions/emergency department visits during an active episode; (e) Infections acquired during the episode of care; (f) Skin breakdown. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, External Reporting. Comply with all applicable California state mandatory reporting requirements. Determine whether the event requires reporting to: (a) California Department of Public Health (CDPH); (b) Adult Protective Services / Child Protective Services (for suspected abuse/neglect per CL-PR-006); (c) CMS (if the event triggers a reporting obligation under CoP); (d) law enforcement (if criminal activity suspected); (e) the patient's physician (per Section 6.2.2). Document all external reports made. The responsible role is Administrator / Compliance Officer; the stated timing is Per applicable regulatory timeframes; typically within 24–72 hours depending on reporting requirement.. Maintain a log of all external adverse event reports submitted, including the reporting agency, date. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, Reporting Procedures. Immediately ensure patient safety — provide or arrange for any necessary emergency care. The responsible role is Discovering Staff Member; the stated timing is Immediately upon discovery.. Notify the patient's physician of any adverse event that has the potential to affect the patient's plan of care or clinical status. Document the notification in the clinical record. The responsible role is Discovering Staff Member; the stated timing is Within 1 hour of discovery for Level 3–5 events; within 4 hours for Level 1–2 events or by end of the visit.. Notify the clinical supervisor / Director of Nursing verbally. The responsible role is Discovering Staff Member. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, Non-Punitive Reporting Culture. Communicate to all staff — during orientation, annual training, and in policy acknowledgment — that adverse event reporting is non-punitive. Staff who report in good faith shall not be subject to retaliation or discipline for the act of reporting, per CO-CP-005. The responsible role is Administrator / QAPI Coordinator; the stated timing is Ongoing; reinforced annually.. Ensure that disciplinary action related to an adverse event is directed at the underlying conduct (e.g., willful deviation from protocol, impairment, falsification), not at the act of reporting. Document this distinction in any disciplinary action. The responsible role is Administrator; the stated timing is Ongoing... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to just-culture event and near-miss reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "incident-evidence-folder-2-1", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 14, y: 57, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in just-culture event and near-miss reporting. This identify option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for just-culture event and near-miss reporting." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during just-culture event and near-miss reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during just-culture event and near-miss reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for just-culture event and near-miss reporting." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "insurance-portfolio-2-2", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 32, y: 38, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for just-culture event and near-miss reporting." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during just-culture event and near-miss reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during just-culture event and near-miss reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for just-culture event and near-miss reporting." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "risk-register-binder-2-3", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for just-culture event and near-miss reporting." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for just-culture event and near-miss reporting. This decide option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during just-culture event and near-miss reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during just-culture event and near-miss reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for just-culture event and near-miss reporting." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for just-culture event and near-miss reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for just-culture event and near-miss reporting by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for just-culture event and near-miss reporting. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Triage",
    title: "Triage, investigation, root-cause analysis, and immediate protection",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for triage, investigation, root-cause analysis, and immediate protection within Risk Management & Liability. Begin with the current controlled versions of RM-ER-002, QA-AE-001, RM-ER-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-002, Investigation Process. For Level 3–5 incidents, initiate a formal investigation. Preserve all relevant evidence including: (a) clinical records; (b) staff schedules; (c) equipment involved; (d) photographs (if applicable); (e) witness statements; (f) electronic system logs. The responsible role is Risk Manager; the stated timing is Investigation initiated within 24 hours for Level 4–5; within 72 hours for Level 3.. Interview all involved parties and witnesses. Document interviews using the Witness Statement Form (Appendix D). Interviews shall be conducted individually in a private setting. The responsible role is Risk Manager; the stated timing is Within 7 calendar days of incident for Level 3; within 48 hours for Level. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, Investigation and Analysis. For Level 1–3 events: Conduct or assign an initial review to determine: (a) immediate cause; (b) contributing factors; (c) whether the event was preventable; (d) whether the event represents an isolated incident or potential pattern; (e) immediate corrective actions needed. Document findings on the Adverse Event Investigation Summary (Appendix C). The responsible role is QAPI Coordinator; the stated timing is Investigation completed within 14 calendar days of event report.. For Level 4–5 events (Sentinel Events): Initiate a formal Root Cause Analysis per QA-AE-002 within 48 hours. Notify the Governing Body within 72 hours per QA-PG-001 Section 6.3.4. The responsible role is QAPI Coordinator / Risk. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-002, Immediate Response. Ensure immediate safety of all persons involved. Provide first aid or emergency medical care as needed. Call 911 if life-threatening emergency exists. The responsible role is Reporting Staff Member; the stated timing is Immediately upon incident occurrence.. Notify the immediate supervisor verbally of the incident. The responsible role is Reporting Staff Member; the stated timing is Within 1 hour of incident occurrence.. For sentinel events or serious adverse events: Notify the Risk Manager, Director of Nursing, and Administrator immediately by phone. The responsible role is Supervisor; the stated timing is Within 1 hour of notification.. For patient-related incidents: Assess the patient's current condition and ensure. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-006, Claims Investigation and Coordination. Conduct an internal claims investigation (separate from any incident investigation already completed per RM-ER-002). Document: (a) chronology of events; (b) all relevant records; (c) staff involved; (d) standard of care analysis; (e) potential liability exposure assessment. The responsible role is Risk Manager; the stated timing is Within 14 calendar days.. Prepare a Claims Investigation Summary (Appendix B) for legal counsel and insurance carrier. The responsible role is Risk Manager; the stated timing is Within 14 calendar days.. Coordinate with insurance carrier claims adjusters. Respond to information requests. Attend case conferences as required. The responsible role is Risk Manager; the stated timing is Ongoing.. If deposition. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-001, 12\\. Appendices. Appendix A: Adverse Event Report Form Care Indeed Home Health Care, Inc. CONFIDENTIAL — Adverse Event Report Form Policy Reference: QA-AE-001 | Version: 6.0 DO NOT FILE IN THE PATIENT'S CLINICAL RECORD. Submit to Director of Nursing within 24 hours of event. SECTION 1 — EVENT IDENTIFICATION Patient Name:. Patient ID / MR#:. Date of Event:. Time of Event:. Location of Event:. ☐ Patient Home ☐ Community ☐ Other: _____________. Date Discovered (if different from event date):. Reporting Staff Member Name:. Reporting Staff Member Title:. Reporting Staff Member Signature:. Date / Time Report Completed:. SECTION 2 — EVENT CATEGORY (check all that apply) Category. ✓.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to triage, investigation, root-cause analysis, and immediate protection. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
      { kind: "External Authority", text: "42 CFR § 484.70" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "insurance-portfolio-3-1", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 14, y: 61, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for triage, investigation, root-cause analysis, and immediate protection." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during triage, investigation, root-cause analysis, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for triage, investigation, root-cause analysis, and immediate protection." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "risk-register-binder-3-2", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 59, y: 74, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for triage, investigation, root-cause analysis, and immediate protection." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for triage, investigation, root-cause analysis, and immediate protection. This decide option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during triage, investigation, root-cause analysis, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for triage, investigation, root-cause analysis, and immediate protection." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "incident-evidence-folder-3-3", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 74, y: 42, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in triage, investigation, root-cause analysis, and immediate protection. This identify option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for triage, investigation, root-cause analysis, and immediate protection." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during triage, investigation, root-cause analysis, and immediate protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during triage, investigation, root-cause analysis, and immediate protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for triage, investigation, root-cause analysis, and immediate protection." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for triage, investigation, root-cause analysis, and immediate protection. Identify the verified status, discrepancy, affected requirement, and accountable owner for triage, investigation, root-cause analysis, and immediate protection by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for triage, investigation, root-cause analysis, and immediate protection. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Correct",
    title: "Corrective-action strength, owner, deadline, and effectiveness check",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for corrective-action strength, owner, deadline, and effectiveness check within Risk Management & Liability. Begin with the current controlled versions of RM-ER-005, RM-ER-002, QA-AE-003, RM-ER-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-005, 7\\. Compliance Monitoring and Measurement. Monthly trending analysis completed: Review of Dashboard update dates. Source or operational basis: 12 updates per year.. Quarterly Trending Report completed: Review of report files. Source or operational basis: 4 reports per year.. Clusters identified and escalated within 24 hours: Review of cluster documentation and notification records. Source or operational basis: 100% compliance.. Trending data shared with QAPI: Review of QAPI meeting minutes. Source or operational basis: Documented at each quarterly QAPI meeting.. ACHC Survey-Defensible Operational Controls - HH1-1A.01: Risk Manager and safety program owners execute and monitor governance accountability, licensing oversight, and operational control execution. Work steps are tracked with defined owner accountability, required. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-002, 5\\. Procedures. 1: Risk Manager. Source or operational basis: Review policy requirements and confirm role-based responsibilities for RM-ER-002.. 2: Assigned Staff. Source or operational basis: Execute incident reporting & investigation activities using approved tools, forms, and documentation standards.. 3: Compliance Officer / Designee. Source or operational basis: Audit completion, remediate variances, and document corrective actions in the compliance log.. ACHC Survey-Defensible Operational Controls - HH2-4A: Risk Manager and safety program owners execute and monitor documented operational controls, accountable ownership, and auditable evidence maintenance. Work steps are tracked with defined owner accountability, required completion timing, and exception escalation; survey evidence is retained in patient/staff communications, acknowledgments, complaint/compliance logs. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, Monitoring and Effectiveness Verification. Monitor the effectiveness of corrective actions by collecting and analyzing data per the CAP monitoring plan. Compare actual performance to the measurable outcome target at each monitoring interval. The responsible role is CAP Lead / QAPI Coordinator; the stated timing is Per monitoring plan frequency (minimum monthly).. Present CAP status to the QAPI Committee monthly as part of the QAPI Action Item Tracker review. For each open CAP: report implementation status, current performance vs. target, and recommendation (continue monitoring / ready for closure / escalate). The responsible role is QAPI Coordinator; the stated timing is Monthly at QAPI Committee meeting.. When the measurable outcome target. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-005, Data Collection and Aggregation. Aggregate data monthly from all risk data sources: (a) incident reports (RM-ER-002); (b) Risk Register (RM-ER-001); (c) QAPI adverse event data (QA-AE-001); (d) complaint and grievance data (OP-PA-001); (e) workers' compensation claims (HR-WM-004); (f) infection surveillance data (QA-SM-002); (g) claims and litigation data (RM-ER-006); (h) staff safety reports (RM-SS-001); (i) compliance audit findings (CO-RA-002). The responsible role is Risk Manager; the stated timing is Monthly, by the 10th of the following month.. Maintain the Risk Trending Dashboard (Appendix A) tracking monthly and quarterly metrics across all risk categories. The responsible role is Risk Manager; the stated timing is Updated monthly.. ACHC Survey-Defensible Operational Controls -. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Monitoring and Reporting. Maintain the centralized Risk Register (Appendix C) with current status for all identified risks. The Risk Register must document: (a) Risk ID; (b) date identified; (c) risk description; (d) category; (e) likelihood score; (f) severity score; (g) risk score; (h) priority; (i) Risk Owner; (j) mitigation status; (k) residual risk; (l) last review date; (m) next review date. The responsible role is Risk Manager; the stated timing is Updated continuously; formally reviewed quarterly.. Prepare and submit a quarterly Enterprise Risk Report (Appendix D) to the Risk Management Committee and Administrator, documenting: (a) Risk Register summary with trending; (b) new risks identified; (c) risks closed/resolved; (d). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to corrective-action strength, owner, deadline, and effectiveness check. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.70" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "risk-register-binder-4-1", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for corrective-action strength, owner, deadline, and effectiveness check." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for corrective-action strength, owner, deadline, and effectiveness check. This decide option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "incident-evidence-folder-4-2", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 32, y: 44, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in corrective-action strength, owner, deadline, and effectiveness check. This identify option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for corrective-action strength, owner, deadline, and effectiveness check." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "insurance-portfolio-4-3", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for corrective-action strength, owner, deadline, and effectiveness check." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during corrective-action strength, owner, deadline, and effectiveness check.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrective-action strength, owner, deadline, and effectiveness check." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for corrective-action strength, owner, deadline, and effectiveness check. Identify the verified status, discrepancy, affected requirement, and accountable owner for corrective-action strength, owner, deadline, and effectiveness check by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for corrective-action strength, owner, deadline, and effectiveness check. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Risk",
    title: "Risk trending, thresholds, and predictive indicators",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for risk trending, thresholds, and predictive indicators within Risk Management & Liability. Begin with the current controlled versions of RM-ER-001, RM-ER-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-001, Risk Monitoring and Reporting. Maintain the centralized Risk Register (Appendix C) with current status for all identified risks. The Risk Register must document: (a) Risk ID; (b) date identified; (c) risk description; (d) category; (e) likelihood score; (f) severity score; (g) risk score; (h) priority; (i) Risk Owner; (j) mitigation status; (k) residual risk; (l) last review date; (m) next review date. The responsible role is Risk Manager; the stated timing is Updated continuously; formally reviewed quarterly.. Prepare and submit a quarterly Enterprise Risk Report (Appendix D) to the Risk Management Committee and Administrator, documenting: (a) Risk Register summary with trending; (b) new risks identified; (c) risks closed/resolved; (d). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-003, Annual Comprehensive Risk Assessment. Develop the annual risk assessment plan, identifying: (a) domains to be assessed; (b) assessment methodology; (c) data sources; (d) timeline; (e) participants required. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Distribute the Departmental Risk Identification Worksheet (Appendix A) to all department directors with instructions. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Complete the Departmental Risk Identification Worksheet by identifying the top 5 risks within their domain, with preliminary likelihood/severity estimates and supporting data. The responsible role is Department Directors; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, 10\\. Version Control. 10.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 10.2 Only the most current approved version is valid. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 10.3 Any substantive revision requires: (a) review and approval by the Governing Body; (b) re-acknowledgment by all in-scope personnel within 14 calendar days; (c) update to the enterprise policy index per EN-TG-001. 10.4 Non-substantive revisions may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Appendix A — Risk Assessment Matrix Care Indeed Home Health Care, Inc. Policy Reference: RM-ER-001. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Mitigation Planning. Develop a Risk Mitigation Plan (Appendix B) for each Critical and High priority risk, documenting: (a) risk description and root cause; (b) current controls in place; (c) proposed mitigation actions; (d) responsible party (Risk Owner); (e) implementation timeline; (f) success metrics; (g) residual risk assessment; (h) monitoring frequency. The responsible role is Risk Manager; the stated timing is Within 7 calendar days for Critical; within 14 calendar days for High.. Implement approved mitigation actions per the plan timeline and report progress to the Risk Manager at defined intervals. The responsible role is Risk Owner (Assigned); the stated timing is Per plan timeline; progress reports at. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Assessment and Prioritization. Assess each identified risk using the agency's standardized Risk Assessment Matrix (Appendix A) evaluating: (a) Likelihood of occurrence (1–5 scale); (b) Severity of impact (1–5 scale); (c) Risk Score = Likelihood × Severity. The responsible role is Risk Manager; the stated timing is Within 14 calendar days of risk identification.. Categorize each assessed risk by domain: Clinical, Compliance/Regulatory, Financial, Operational, Technology, Human Resources, Reputational, Legal/Litigation, Environmental/Safety. The responsible role is Risk Manager; the stated timing is Concurrent with assessment.. Classify each risk by priority level per the Risk Assessment Matrix: Critical (20–25), High (12–19), Moderate (6–11), Low (1–5). The responsible role is Risk Manager; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to risk trending, thresholds, and predictive indicators. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR § 484.102" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "incident-evidence-folder-5-1", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in risk trending, thresholds, and predictive indicators. This identify option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk trending, thresholds, and predictive indicators." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk trending, thresholds, and predictive indicators." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk trending, thresholds, and predictive indicators." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "insurance-portfolio-5-2", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 29, y: 64, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk trending, thresholds, and predictive indicators." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk trending, thresholds, and predictive indicators." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk trending, thresholds, and predictive indicators." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "risk-register-binder-5-3", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 81, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk trending, thresholds, and predictive indicators." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for risk trending, thresholds, and predictive indicators. This decide option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk trending, thresholds, and predictive indicators." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during risk trending, thresholds, and predictive indicators.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk trending, thresholds, and predictive indicators." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk trending, thresholds, and predictive indicators. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk trending, thresholds, and predictive indicators by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk trending, thresholds, and predictive indicators. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Insuran",
    title: "Insurance notification, claims preservation, and litigation support",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for insurance notification, claims preservation, and litigation support within Risk Management & Liability. Begin with the current controlled versions of RM-ER-004, RM-ER-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-004, Insurance Program Management. Maintain the Insurance Coverage Inventory (Appendix A), documenting all active policies including: carrier, policy number, coverage type, limits, deductibles, premium, effective date, and expiration date. The responsible role is Risk Manager; the stated timing is Maintained continuously; updated within 7 calendar days of any policy change.. Conduct an annual insurance adequacy review evaluating: (a) current coverage against risk exposure; (b) claims history; (c) industry benchmarks; (d) regulatory requirements; (e) changes in agency size/services. The responsible role is Risk Manager; the stated timing is Annually; completed 120 calendar days before renewal.. Present insurance adequacy review findings and coverage recommendations to the Administrator. The responsible role is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-004, Claims Notification and Management. Upon receipt of any claim, demand letter, lawsuit, or notice of potential claim, notify the applicable insurance carrier(s) per the policy's notice provisions. The responsible role is Risk Manager; the stated timing is Within 24 hours of receipt; or per policy terms if shorter.. Notify the Administrator and Compliance Officer of any claim or potential claim. The responsible role is Risk Manager; the stated timing is Within 24 hours of receipt.. Notify the Governing Body of any claim or lawsuit per GV-GB-001 §6.5 and RM-ER-006. The responsible role is Administrator; the stated timing is Within 72 hours; at next meeting for ongoing status.. Coordinate with. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-006, Litigation Hold and Evidence Preservation. Issue a Litigation Hold Notice (Appendix A) to all relevant custodians of records and information. The notice shall: (a) identify the matter; (b) describe categories of records/data to be preserved; (c) suspend all routine destruction or deletion of relevant materials; (d) require written acknowledgment from each custodian. The responsible role is Risk Manager; the stated timing is Within 24 hours of lawsuit or credible litigation threat.. Acknowledge receipt of the Litigation Hold Notice in writing and immediately suspend any destruction or alteration of identified records. The responsible role is All Custodians; the stated timing is Within 48 hours of notice receipt.. Identify and secure all. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-006, Claims Investigation and Coordination. Conduct an internal claims investigation (separate from any incident investigation already completed per RM-ER-002). Document: (a) chronology of events; (b) all relevant records; (c) staff involved; (d) standard of care analysis; (e) potential liability exposure assessment. The responsible role is Risk Manager; the stated timing is Within 14 calendar days.. Prepare a Claims Investigation Summary (Appendix B) for legal counsel and insurance carrier. The responsible role is Risk Manager; the stated timing is Within 14 calendar days.. Coordinate with insurance carrier claims adjusters. Respond to information requests. Attend case conferences as required. The responsible role is Risk Manager; the stated timing is Ongoing.. If deposition. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-004, 3\\. Definitions. Professional Liability Insurance. Coverage protecting the agency and its clinical staff against claims arising from professional services, including malpractice, negligence, and errors/omissions.. General Liability Insurance. Coverage for bodily injury, property damage, and personal/advertising injury claims arising from agency operations.. Workers' Compensation Insurance. State-mandated coverage for employee work-related injuries and illnesses.. Directors & Officers (D&O) Insurance. Coverage protecting Governing Body members and officers against claims arising from their management decisions.. Cyber Liability Insurance. Coverage for losses arising from data breaches, cyberattacks, and privacy violations.. Certificate of Insurance (COI). A document issued by an insurance carrier confirming the existence and terms of an insurance policy.. Risk Transfer.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to insurance notification, claims preservation, and litigation support. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.102" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "insurance-portfolio-6-1", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 14, y: 63, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for insurance notification, claims preservation, and litigation support." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during insurance notification, claims preservation, and litigation support." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for insurance notification, claims preservation, and litigation support." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "risk-register-binder-6-2", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for insurance notification, claims preservation, and litigation support." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for insurance notification, claims preservation, and litigation support. This decide option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during insurance notification, claims preservation, and litigation support." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for insurance notification, claims preservation, and litigation support." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "incident-evidence-folder-6-3", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 82, y: 55, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in insurance notification, claims preservation, and litigation support. This identify option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for insurance notification, claims preservation, and litigation support." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during insurance notification, claims preservation, and litigation support." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during insurance notification, claims preservation, and litigation support.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for insurance notification, claims preservation, and litigation support." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for insurance notification, claims preservation, and litigation support. Identify the verified status, discrepancy, affected requirement, and accountable owner for insurance notification, claims preservation, and litigation support by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for insurance notification, claims preservation, and litigation support. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Risk",
    title: "Risk committee dashboard and governing-body decisions",
    subtitle: "Risk Management & Liability",
    narration: [
      "This lesson develops administrator judgment for risk committee dashboard and governing-body decisions within Risk Management & Liability. Begin with the current controlled versions of RM-ER-001, RM-ER-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — RM-ER-001, Risk Monitoring and Reporting. Maintain the centralized Risk Register (Appendix C) with current status for all identified risks. The Risk Register must document: (a) Risk ID; (b) date identified; (c) risk description; (d) category; (e) likelihood score; (f) severity score; (g) risk score; (h) priority; (i) Risk Owner; (j) mitigation status; (k) residual risk; (l) last review date; (m) next review date. The responsible role is Risk Manager; the stated timing is Updated continuously; formally reviewed quarterly.. Prepare and submit a quarterly Enterprise Risk Report (Appendix D) to the Risk Management Committee and Administrator, documenting: (a) Risk Register summary with trending; (b) new risks identified; (c) risks closed/resolved; (d). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-003, Annual Comprehensive Risk Assessment. Develop the annual risk assessment plan, identifying: (a) domains to be assessed; (b) assessment methodology; (c) data sources; (d) timeline; (e) participants required. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Distribute the Departmental Risk Identification Worksheet (Appendix A) to all department directors with instructions. The responsible role is Risk Manager; the stated timing is Within 30 calendar days of fiscal year start.. Complete the Departmental Risk Identification Worksheet by identifying the top 5 risks within their domain, with preliminary likelihood/severity estimates and supporting data. The responsible role is Department Directors; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, 10\\. Version Control. 10.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 10.2 Only the most current approved version is valid. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 10.3 Any substantive revision requires: (a) review and approval by the Governing Body; (b) re-acknowledgment by all in-scope personnel within 14 calendar days; (c) update to the enterprise policy index per EN-TG-001. 10.4 Non-substantive revisions may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Appendix A — Risk Assessment Matrix Care Indeed Home Health Care, Inc. Policy Reference: RM-ER-001. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Mitigation Planning. Develop a Risk Mitigation Plan (Appendix B) for each Critical and High priority risk, documenting: (a) risk description and root cause; (b) current controls in place; (c) proposed mitigation actions; (d) responsible party (Risk Owner); (e) implementation timeline; (f) success metrics; (g) residual risk assessment; (h) monitoring frequency. The responsible role is Risk Manager; the stated timing is Within 7 calendar days for Critical; within 14 calendar days for High.. Implement approved mitigation actions per the plan timeline and report progress to the Risk Manager at defined intervals. The responsible role is Risk Owner (Assigned); the stated timing is Per plan timeline; progress reports at. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-ER-001, Risk Assessment and Prioritization. Assess each identified risk using the agency's standardized Risk Assessment Matrix (Appendix A) evaluating: (a) Likelihood of occurrence (1–5 scale); (b) Severity of impact (1–5 scale); (c) Risk Score = Likelihood × Severity. The responsible role is Risk Manager; the stated timing is Within 14 calendar days of risk identification.. Categorize each assessed risk by domain: Clinical, Compliance/Regulatory, Financial, Operational, Technology, Human Resources, Reputational, Legal/Litigation, Environmental/Safety. The responsible role is Risk Manager; the stated timing is Concurrent with assessment.. Classify each risk by priority level per the Risk Assessment Matrix: Critical (20–25), High (12–19), Moderate (6–11), Low (1–5). The responsible role is Risk Manager; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to risk committee dashboard and governing-body decisions. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "risk register binder", detail: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "incident evidence folder", detail: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "insurance portfolio", detail: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "RM-ER-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "Controlled Policy", text: "RM-ER-003" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "Controlled Policy", text: "RM-ER-005" },
      { kind: "Controlled Policy", text: "RM-ER-006" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.65(d)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "risk-register-binder-7-1", label: "risk register binder", shortLabel: "risk register binder", ariaLabel: "Investigate risk register binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat risk register binder as complete proof without comparing incident evidence folder or the controlled source. This identify option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk committee dashboard and governing-body decisions." },
          { id: "i3", label: "Classify the risk register binder by department custom even though its authority and current status are unverified. This identify option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about risk register binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve risk register binder on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for risk register binder is resolved." },
          { id: "d3", label: "Send risk register binder to an unrelated department rather than the policy owner responsible for risk committee dashboard and governing-body decisions. This decide option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk committee dashboard and governing-body decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For risk register binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For risk register binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that risk register binder was reviewed, without source version, finding, decision, owner, or status. This document option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk register binder." },
          { id: "doc3", label: "Keep the risk register binder decision in personal notes rather than the governed evidence location. This document option concerns risk register binder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk committee dashboard and governing-body decisions." },
        ],
        feedback: {
          observed: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
          meaning: "Observe the real risk register binder in the photographed scene. Compare it with the incident evidence folder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For risk register binder, compare the visible evidence with incident evidence folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to risk register binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For risk register binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "incident-evidence-folder-7-2", label: "incident evidence folder", shortLabel: "incident evidence folder", ariaLabel: "Investigate incident evidence folder",
        x: 33, y: 59, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Assume incident evidence folder applies to every role, location, and exception described in risk committee dashboard and governing-body decisions. This identify option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk committee dashboard and governing-body decisions." },
          { id: "i3", label: "Use the oldest available incident evidence folder because prior approval is easier to confirm. This identify option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about incident evidence folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in incident evidence folder remains unresolved. This decide option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for incident evidence folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to incident evidence folder. This decide option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk committee dashboard and governing-body decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For incident evidence folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark incident evidence folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of incident evidence folder." },
          { id: "doc3", label: "Retain only a summary of incident evidence folder and discard the source artifact needed to reconstruct the decision. This document option concerns incident evidence folder during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk committee dashboard and governing-body decisions." },
        ],
        feedback: {
          observed: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
          meaning: "Observe the real incident evidence folder in the photographed scene. Compare it with the insurance portfolio, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For incident evidence folder, compare the visible evidence with insurance portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to incident evidence folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For incident evidence folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
      {
        id: "insurance-portfolio-7-3", label: "insurance portfolio", shortLabel: "insurance portfolio", ariaLabel: "Investigate insurance portfolio",
        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status." },
          { id: "i2", label: "Read insurance portfolio only for favorable indicators and omit the exception evidence connected to risk register binder. This identify option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for risk committee dashboard and governing-body decisions." },
          { id: "i3", label: "Treat an unsigned or unverified insurance portfolio as equivalent to the current controlled record. This identify option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about insurance portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close insurance portfolio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for insurance portfolio is resolved." },
          { id: "d3", label: "Defer the insurance portfolio decision to a routine future cycle even though current operations depend on it. This decide option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during risk committee dashboard and governing-body decisions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For insurance portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for insurance portfolio but omit the actual evidence, communications, and unresolved items. This document option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of insurance portfolio." },
          { id: "doc3", label: "Combine insurance portfolio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns insurance portfolio during risk committee dashboard and governing-body decisions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for risk committee dashboard and governing-body decisions." },
        ],
        feedback: {
          observed: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions.",
          meaning: "Observe the real insurance portfolio in the photographed scene. Compare it with the risk register binder, current controlled sources, assigned decision rights, and corroborating records for risk committee dashboard and governing-body decisions. Identify the verified status, discrepancy, affected requirement, and accountable owner for risk committee dashboard and governing-body decisions by reconciling all three photographed evidence objects with the current controlled source. For insurance portfolio, compare the visible evidence with risk register binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. Apply that decision specifically to insurance portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for risk committee dashboard and governing-body decisions. For insurance portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["RM-ER-001","RM-ER-002","RM-ER-003","RM-ER-004","RM-ER-005","RM-ER-006","QA-AE-001","QA-AE-003","42 CFR Part 484","42 CFR § 484.105","42 CFR § 484.65","42 CFR § 484.70","42 CFR § 484.100","42 CFR § 484.102","42 CFR §484.110","42 CFR §484.65(d)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During enterprise risk domains, appetite, register, and ownership, the insurance portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve insurance portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns enterprise risk domains, appetite, register, and ownership.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership.",
      "Send insurance portfolio to an unrelated department rather than the policy owner responsible for enterprise risk domains, appetite, register, and ownership. This option concerns enterprise risk domains, appetite, register, and ownership.",
      "Treat insurance portfolio as final approval because the artifact exists during enterprise risk domains, appetite, register, and ownership.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in enterprise risk domains, appetite, register, and ownership. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 2,
    stem: "During just-culture event and near-miss reporting, the risk register binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting.",
      "Replace the controlling requirement with an informal local workaround tailored to risk register binder. This option concerns just-culture event and near-miss reporting.",
      "Allow the affected activity to expand while the exception in risk register binder remains unresolved. This option concerns just-culture event and near-miss reporting.",
      "Treat risk register binder as final approval because the artifact exists during just-culture event and near-miss reporting.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in just-culture event and near-miss reporting. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 3,
    stem: "During triage, investigation, root-cause analysis, and immediate protection, the incident evidence folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat incident evidence folder as final approval because the artifact exists during triage, investigation, root-cause analysis, and immediate protection.",
      "Close incident evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns triage, investigation, root-cause analysis, and immediate protection.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection.",
      "Defer the incident evidence folder decision to a routine future cycle even though current operations depend on it. This option concerns triage, investigation, root-cause analysis, and immediate protection.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in triage, investigation, root-cause analysis, and immediate protection. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 4,
    stem: "During corrective-action strength, owner, deadline, and effectiveness check, the insurance portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check.",
      "Approve insurance portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns corrective-action strength, owner, deadline, and effectiveness check.",
      "Send insurance portfolio to an unrelated department rather than the policy owner responsible for corrective-action strength, owner, deadline, and effectiveness check. This option concerns corrective-action strength, owner, deadline, and effectiveness check.",
      "Treat insurance portfolio as final approval because the artifact exists during corrective-action strength, owner, deadline, and effectiveness check.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in corrective-action strength, owner, deadline, and effectiveness check. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 5,
    stem: "During risk trending, thresholds, and predictive indicators, the risk register binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in risk register binder remains unresolved. This option concerns risk trending, thresholds, and predictive indicators.",
      "Treat risk register binder as final approval because the artifact exists during risk trending, thresholds, and predictive indicators.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators.",
      "Replace the controlling requirement with an informal local workaround tailored to risk register binder. This option concerns risk trending, thresholds, and predictive indicators.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk trending, thresholds, and predictive indicators. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 6,
    stem: "During insurance notification, claims preservation, and litigation support, the incident evidence folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the incident evidence folder decision to a routine future cycle even though current operations depend on it. This option concerns insurance notification, claims preservation, and litigation support.",
      "Treat incident evidence folder as final approval because the artifact exists during insurance notification, claims preservation, and litigation support.",
      "Close incident evidence folder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns insurance notification, claims preservation, and litigation support.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in insurance notification, claims preservation, and litigation support. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 7,
    stem: "During risk committee dashboard and governing-body decisions, the insurance portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve insurance portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns risk committee dashboard and governing-body decisions.",
      "Treat insurance portfolio as final approval because the artifact exists during risk committee dashboard and governing-body decisions.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions.",
      "Send insurance portfolio to an unrelated department rather than the policy owner responsible for risk committee dashboard and governing-body decisions. This option concerns risk committee dashboard and governing-body decisions.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in risk committee dashboard and governing-body decisions. The decision remains traceable to RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, QA-AE-001, QA-AE-003.",
  },
  {
    id: 8,
    stem: "How should 42 CFR Part 484 be used within Risk Management & Liability?",
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
    stem: "What links incident evidence folder and incident evidence folder into an accountable Risk Management & Liability control?",
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
    stem: "What does successful completion of Risk Management & Liability establish?",
    options: [
      "Observed operational competency without an authorized evaluator.",
      "Knowledge of the controlled administrator concepts in Risk Management & Liability, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Automatic appointment authority for every decision described in Risk Management & Liability.",
      "Permission to replace the controlled policies with the Risk Management & Liability quiz result.",
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





const STORAGE_KEY = 'adm-008-progress-v6000';



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



export default function ADM008() {

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

          <span className="brand-text">ADM-008 — Risk Management</span>

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
