/**
 * ADM-013 — Health Information Management & Privacy Oversight
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

import img01 from './assets/adm-013/adm-013-lesson-01.png';
import img02 from './assets/adm-013/adm-013-lesson-02.png';
import img03 from './assets/adm-013/adm-013-lesson-03.png';
import img04 from './assets/adm-013/adm-013-lesson-04.png';
import img05 from './assets/adm-013/adm-013-lesson-05.png';
import img06 from './assets/adm-013/adm-013-lesson-06.png';
import img07 from './assets/adm-013/adm-013-lesson-07.png';



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



const MODULE_META = { id: "ADM-013", title: "Health Information Management & Privacy Oversight", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Administrator oversight of legal health record and information governance, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Privacy, minimum necessary, patient access, amendment, and accounting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Security risk analysis, access control, encryption, and workforce safeguards, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Record content, authentication, timeliness, retention, and destruction, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Incident detection, breach risk assessment, notification, and evidence preservation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Downtime, backup, recovery, and continuity of records, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for HIM/privacy dashboard, audits, training, and governing-body reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Adminis",
    title: "Administrator oversight of legal health record and information governance",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for administrator oversight of legal health record and information governance within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, IT-SC-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, Information Security Program Governance. Formally designate the IT Director / CISO as the Information Security Official responsible for the agency's information security program. Document the designation in Governing Body minutes including: (a) name and qualifications; (b) scope of authority; (c) reporting structure; (d) effective date. The responsible role is Governing Body; the stated timing is Prior to agency operation; within 30 calendar days of any vacancy.. Develop and maintain a written Information Security Program Plan (ISPP) that documents: (a) program scope and objectives; (b) organizational security roles and responsibilities; (c) risk management approach; (d) security control framework; (e) incident response capability; (f) training requirements; (g) compliance monitoring approach. Submit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: Rating: Value. Source or operational basis: Definition. Low: 1. Source or operational basis: Unlikely to occur within the next 12 months.. Medium: 2. Source or operational basis: Possible occurrence. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall establish, implement, and maintain a comprehensive information security program that protects the confidentiality, integrity, and availability of all agency information assets, with particular emphasis on electronic protected health information (ePHI), as required by 45 CFR § 164.308(a)(1). 4.2 The Governing Body shall designate a qualified individual as the Information Security Official (IT Director / CISO) who is responsible for the development, implementation, and ongoing management of the information security program, as required by 45 CFR § 164.308(a)(2). 4.3 The information security program shall be based on a formal risk analysis conducted at least annually and updated whenever. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, 7\\. Documentation Requirements. Information Security Official designation: Written designation in Governing Body minutes including name, qualifications, scope of authority, and effective date.. Source or operational basis: Governing Body Chair. Information Security Program Plan (ISPP): Written plan per Section 6.1.2.. Source or operational basis: IT Director / CISO. Risk Analysis documentation: Completed Risk Analysis Worksheet (Appendix A) with all identified threats, vulnerabilities, likelihood, impact, and risk levels.. Source or operational basis: IT Director / CISO. Risk Register: Current Risk Register (Appendix B) with all identified risks, scores, owners, controls, and remediation status.. Source or operational basis: IT Director / CISO. Risk Management Plan: Written plan (Appendix C) for all. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to administrator oversight of legal health record and information governance. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "42 CFR § 484.110" },
      { kind: "External Authority", text: "45 CFR" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "locked-clinical-record-cart-1-1", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 14, y: 41, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for administrator oversight of legal health record and information governance." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for administrator oversight of legal health record and information governance. This decide option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during administrator oversight of legal health record and information governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during administrator oversight of legal health record and information governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for administrator oversight of legal health record and information governance." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "encrypted-laptop-with-dark-screen-1-2", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 35, y: 62, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in administrator oversight of legal health record and information governance. This identify option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for administrator oversight of legal health record and information governance." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during administrator oversight of legal health record and information governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during administrator oversight of legal health record and information governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for administrator oversight of legal health record and information governance." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "privacy-governance-binder-1-3", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 81, y: 46, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for administrator oversight of legal health record and information governance." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during administrator oversight of legal health record and information governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during administrator oversight of legal health record and information governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for administrator oversight of legal health record and information governance." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for administrator oversight of legal health record and information governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for administrator oversight of legal health record and information governance by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for administrator oversight of legal health record and information governance. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Privacy",
    title: "Privacy, minimum necessary, patient access, amendment, and accounting",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for privacy, minimum necessary, patient access, amendment, and accounting within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, CO-HP-001, IT-SC-001, CO-HP-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-001, Privacy Program Administration. Establish and maintain the HIPAA Privacy Program. Designate a Privacy Officer (may be the Compliance Officer) in writing. The responsible role is Compliance Officer / Privacy Officer; the stated timing is Prior to agency operation; maintained continuously.. Develop and maintain all required privacy policies and procedures per 45 CFR § 164.530(i). The responsible role is Privacy Officer; the stated timing is Maintained continuously; reviewed annually.. Maintain the current Notice of Privacy Practices (Appendix A). Update upon any material change and distribute revised NPP to patients. The responsible role is Privacy Officer; the stated timing is Maintained continuously; distributed to patients at SOC.. Ensure all workforce. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: Rating: Value. Source or operational basis: Definition. Low: 1. Source or operational basis: Unlikely to occur within the next 12 months.. Medium: 2. Source or operational basis: Possible occurrence. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-001, Patient Rights. Provide the NPP to each patient at the start of care. Obtain signed acknowledgment (Appendix B). If patient refuses to sign, document the refusal. The responsible role is Clinical Staff (SOC); the stated timing is At SOC.. Process patient requests per CO-HP-006: (a) access to records within 30 calendar days; (b) amendment requests within 60 calendar days; (c) accounting of disclosures within 60 calendar days; (d) restriction requests per applicable standards; (e) confidential communication requests. The responsible role is Privacy Officer; the stated timing is Per applicable timeframes... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-006, 6\\. Procedures. Direct all patient record requests to the Privacy Officer. The responsible role is Any staff member; the stated timing is Immediately upon receipt.. Log the request in the Patient Records Request Log (Appendix A). The responsible role is Privacy Officer; the stated timing is Within 1 business day.. For access requests: provide records in the format requested (if readily producible) within 30 calendar days. One 30-day extension permitted with written notice to patient. The responsible role is Privacy Officer; the stated timing is 30 calendar days; extension with notice.. For amendment requests: evaluate and respond within 60 calendar days. Accept or deny with written explanation.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to privacy, minimum necessary, patient access, amendment, and accounting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "45 CFR" },
      { kind: "External Authority", text: "45 CFR § 164.530(i)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "encrypted-laptop-with-dark-screen-2-1", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 18, y: 71, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in privacy, minimum necessary, patient access, amendment, and accounting. This identify option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for privacy, minimum necessary, patient access, amendment, and accounting." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "privacy-governance-binder-2-2", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 32, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for privacy, minimum necessary, patient access, amendment, and accounting." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "locked-clinical-record-cart-2-3", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for privacy, minimum necessary, patient access, amendment, and accounting." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for privacy, minimum necessary, patient access, amendment, and accounting. This decide option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during privacy, minimum necessary, patient access, amendment, and accounting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for privacy, minimum necessary, patient access, amendment, and accounting." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for privacy, minimum necessary, patient access, amendment, and accounting. Identify the verified status, discrepancy, affected requirement, and accountable owner for privacy, minimum necessary, patient access, amendment, and accounting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for privacy, minimum necessary, patient access, amendment, and accounting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Securit",
    title: "Security risk analysis, access control, encryption, and workforce safeguards",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for security risk analysis, access control, encryption, and workforce safeguards within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, IT-SC-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, Risk Analysis and Risk Management. Conduct a comprehensive risk analysis of all systems that create, receive, maintain, or transmit ePHI. The risk analysis shall: (a) identify all ePHI repositories and data flows; (b) identify and document reasonably anticipated threats and vulnerabilities; (c) assess the likelihood and impact of each identified threat-vulnerability pair; (d) determine the current level of risk for each pair; (e) document the analysis using the Risk Analysis Worksheet (Appendix A). The responsible role is IT Director / CISO; the stated timing is Annually; within 30 calendar days of any significant change to information systems, infrastructure, or operations.. Develop and maintain a Risk Register (Appendix B) documenting: (a). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: Rating: Value. Source or operational basis: Definition. Low: 1. Source or operational basis: Unlikely to occur within the next 12 months.. Medium: 2. Source or operational basis: Possible occurrence. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, Security Control Framework. Implement and maintain administrative safeguards including: (a) security management process with risk analysis, risk management, sanction policy, and information system activity review (45 CFR § 164.308(a)(1)); (b) assigned security responsibility (45 CFR § 164.308(a)(2)); (c) workforce security including authorization, supervision, clearance, and termination procedures (45 CFR § 164.308(a)(3)); (d) information access management (45 CFR § 164.308(a)(4)); (e) security awareness and training (45 CFR § 164.308(a)(5)); (f) security incident procedures (45 CFR § 164.308(a)(6)); (g) contingency plan (45 CFR § 164.308(a)(7)); (h) evaluation (45 CFR § 164.308(a)(8)); (i) business associate contracts (45 CFR § 164.308(b)). The responsible role is IT Director / CISO; the stated timing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, Information Security Program Governance. Formally designate the IT Director / CISO as the Information Security Official responsible for the agency's information security program. Document the designation in Governing Body minutes including: (a) name and qualifications; (b) scope of authority; (c) reporting structure; (d) effective date. The responsible role is Governing Body; the stated timing is Prior to agency operation; within 30 calendar days of any vacancy.. Develop and maintain a written Information Security Program Plan (ISPP) that documents: (a) program scope and objectives; (b) organizational security roles and responsibilities; (c) risk management approach; (d) security control framework; (e) incident response capability; (f) training requirements; (g) compliance monitoring approach. Submit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to security risk analysis, access control, encryption, and workforce safeguards. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "45 CFR § 164.530(i)" },
      { kind: "External Authority", text: "45 CFR § 164.530(j)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "privacy-governance-binder-3-1", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 14, y: 50, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security risk analysis, access control, encryption, and workforce safeguards." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "locked-clinical-record-cart-3-2", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 39, y: 38, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security risk analysis, access control, encryption, and workforce safeguards." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for security risk analysis, access control, encryption, and workforce safeguards. This decide option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "encrypted-laptop-with-dark-screen-3-3", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in security risk analysis, access control, encryption, and workforce safeguards. This identify option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security risk analysis, access control, encryption, and workforce safeguards." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during security risk analysis, access control, encryption, and workforce safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security risk analysis, access control, encryption, and workforce safeguards." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for security risk analysis, access control, encryption, and workforce safeguards. Identify the verified status, discrepancy, affected requirement, and accountable owner for security risk analysis, access control, encryption, and workforce safeguards by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security risk analysis, access control, encryption, and workforce safeguards. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Record",
    title: "Record content, authentication, timeliness, retention, and destruction",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for record content, authentication, timeliness, retention, and destruction within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, CO-HP-007, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-007, Destruction Procedures. Approve all record destruction. No records shall be destroyed without written Compliance Officer authorization. The responsible role is Compliance Officer; the stated timing is Before destruction.. Verify no litigation hold or investigation applies to records scheduled for destruction. The responsible role is Compliance Officer; the stated timing is Before destruction.. Destroy paper records containing PHI by cross-cut shredding. Destroy electronic records by secure wiping or physical destruction of media. The responsible role is Designated staff; the stated timing is Per schedule.. Maintain a Record Destruction Log (Appendix A) documenting: record type, date range, destruction method, destruction date, and authorizer. The responsible role is Compliance Officer. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CD-001, Visit Note Authentication. Authenticate every visit note and clinical record entry by applying the electronic signature in the EHR. Authentication includes: (a) the clinician's full legal name; (b) professional credential (RN, LVN, PT, OT, SLP, MSW, HHA); (c) the date and time of authentication. The responsible role is All Clinicians; the stated timing is Before or at the time of entry submission in the EHR.. Review the complete visit note for accuracy, completeness, and internal consistency before authenticating. Once authenticated, the note is a permanent part of the clinical record. Authentication without review is an attestation that an unreviewed note is accurate — do not authenticate without reviewing.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-007, Retention Schedule. Clinical/patient records: Care Indeed longer-period schedule, but never less than five years after discharge under 42 CFR § 484.110. Source or operational basis: California H&S Code; 42 CFR § 484.110. OASIS records; retain under the specifically identified current federal, state, payer, and agency authority. Billing/claims records: 7 years. Source or operational basis: 31 U.S.C. § 3731(b); CMS. Compliance records (audits, investigations, reports): 7 years. Source or operational basis: OIG guidance; agency standard. HIPAA documentation: 6 years from creation or last effective date. Source or operational basis: 45 CFR § 164.530(j) (agency applies 7-year standard). Governing Body records: Permanent. Source or operational basis: Agency standard. Personnel. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CD-001, 5\\. Definitions. Clinical Record. The complete, permanent collection of all clinical documentation for a patient — encompassing assessments, visit notes, care coordination records, physician orders, OASIS data, plan of care documents, and all other records created in connection with the patient's home health episode.. Visit Note. The clinical documentation entry created by a clinician for each patient visit, documenting the patient's status, the clinical services provided, the patient's response, education delivered, and the plan for follow-up.. Authentication. The process by which an entry in the clinical record is identified as the work of a specific clinician, accomplished by the clinician's signature (electronic or physical) including their name. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to record content, authentication, timeliness, retention, and destruction. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "45 CFR § 164.530(j)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "locked-clinical-record-cart-4-1", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 16, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for record content, authentication, timeliness, retention, and destruction." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for record content, authentication, timeliness, retention, and destruction. This decide option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during record content, authentication, timeliness, retention, and destruction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for record content, authentication, timeliness, retention, and destruction." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "encrypted-laptop-with-dark-screen-4-2", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 29, y: 76, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in record content, authentication, timeliness, retention, and destruction. This identify option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for record content, authentication, timeliness, retention, and destruction." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during record content, authentication, timeliness, retention, and destruction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for record content, authentication, timeliness, retention, and destruction." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "privacy-governance-binder-4-3", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 79, y: 52, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for record content, authentication, timeliness, retention, and destruction." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during record content, authentication, timeliness, retention, and destruction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during record content, authentication, timeliness, retention, and destruction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for record content, authentication, timeliness, retention, and destruction." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for record content, authentication, timeliness, retention, and destruction. Identify the verified status, discrepancy, affected requirement, and accountable owner for record content, authentication, timeliness, retention, and destruction by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for record content, authentication, timeliness, retention, and destruction. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Inciden",
    title: "Incident detection, breach risk assessment, notification, and evidence preservation",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for incident detection, breach risk assessment, notification, and evidence preservation within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, IT-SC-001, CO-HP-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, Risk Analysis and Risk Management. Conduct a comprehensive risk analysis of all systems that create, receive, maintain, or transmit ePHI. The risk analysis shall: (a) identify all ePHI repositories and data flows; (b) identify and document reasonably anticipated threats and vulnerabilities; (c) assess the likelihood and impact of each identified threat-vulnerability pair; (d) determine the current level of risk for each pair; (e) document the analysis using the Risk Analysis Worksheet (Appendix A). The responsible role is IT Director / CISO; the stated timing is Annually; within 30 calendar days of any significant change to information systems, infrastructure, or operations.. Develop and maintain a Risk Register (Appendix B) documenting: (a). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-003, Breach Identification and Risk Assessment. Report any suspected breach to the Privacy Officer immediately. The responsible role is Any workforce member; the stated timing is Immediately.. Conduct a four-factor risk assessment per 45 CFR § 164.402: (a) nature and extent of PHI involved; (b) unauthorized person who used/accessed PHI; (c) whether PHI was actually acquired or viewed; (d) extent to which risk has been mitigated. Document using the Breach Risk Assessment Form (Appendix A). The responsible role is Privacy Officer; the stated timing is Within 10 business days of report.. Determine whether the incident constitutes a reportable breach or falls within an exception (unintentional access, inadvertent disclosure, good faith belief. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: Rating: Value. Source or operational basis: Definition. Low: 1. Source or operational basis: Unlikely to occur within the next 12 months.. Medium: 2. Source or operational basis: Possible occurrence. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-003, Documentation. Maintain a Breach Log (Appendix C) documenting all suspected and confirmed breaches. The responsible role is Privacy Officer; the stated timing is Updated within 1 business day; retained 7 years.. 7–11. Standard sections per policy template. Appendix A — Breach Risk Assessment Form Incident Date. Date Discovered. 60-Day Notification Deadline. Description of Incident. PHI Involved (types). Number of Individuals Affected. Four-Factor Analysis: Factor. Assessment. 1. Nature and extent of PHI. 2. Unauthorized person(s). 3. Was PHI actually acquired or viewed?. ☐ Yes ☐ No ☐ Unknown. 4. Extent risk mitigated. Determination: ☐ Reportable Breach ☐ Not a Breach (exception applies: _______________) Appendix B — Individual. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to incident detection, breach risk assessment, notification, and evidence preservation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "45 CFR Part 160" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "encrypted-laptop-with-dark-screen-5-1", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in incident detection, breach risk assessment, notification, and evidence preservation. This identify option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for incident detection, breach risk assessment, notification, and evidence preservation." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "privacy-governance-binder-5-2", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 34, y: 49, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for incident detection, breach risk assessment, notification, and evidence preservation." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "locked-clinical-record-cart-5-3", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for incident detection, breach risk assessment, notification, and evidence preservation." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for incident detection, breach risk assessment, notification, and evidence preservation. This decide option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during incident detection, breach risk assessment, notification, and evidence preservation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for incident detection, breach risk assessment, notification, and evidence preservation." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for incident detection, breach risk assessment, notification, and evidence preservation. Identify the verified status, discrepancy, affected requirement, and accountable owner for incident detection, breach risk assessment, notification, and evidence preservation by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for incident detection, breach risk assessment, notification, and evidence preservation. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Downtim",
    title: "Downtime, backup, recovery, and continuity of records",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for downtime, backup, recovery, and continuity of records within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, IT-SC-001, CO-HP-007, CO-HP-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 | Version: 6.0 | Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: Rating: Value. Source or operational basis: Definition. Low: 1. Source or operational basis: Unlikely to occur within the next 12 months.. Medium: 2. Source or operational basis: Possible occurrence. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-007, Retention Schedule. Clinical/patient records: Care Indeed longer-period schedule, but never less than five years after discharge under 42 CFR § 484.110. Source or operational basis: California H&S Code; 42 CFR § 484.110. OASIS records; retain under the specifically identified current federal, state, payer, and agency authority. Billing/claims records: 7 years. Source or operational basis: 31 U.S.C. § 3731(b); CMS. Compliance records (audits, investigations, reports): 7 years. Source or operational basis: OIG guidance; agency standard. HIPAA documentation: 6 years from creation or last effective date. Source or operational basis: 45 CFR § 164.530(j) (agency applies 7-year standard). Governing Body records: Permanent. Source or operational basis: Agency standard. Personnel. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-006, 6. Documentation Requirements. Evidence of patient access to records execution: Assigned Staff. Source or operational basis: EHR / Policy workflow records. Variance and corrective action records: Compliance Officer / Designee. Source or operational basis: QAPI and compliance files. Policy acknowledgment and training records: HR / Administrator. Source or operational basis: Personnel and learning files.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-007, 4\\. Policy Statement. 4.1 The agency shall retain all clinical, financial, compliance, governance, and personnel records for the minimum retention periods defined in this policy. 4.2 No records shall be destroyed before the applicable retention period expires. 4.3 Records subject to litigation hold, government investigation, or audit shall not be destroyed regardless of retention schedule. 4.4 Destruction of records containing PHI shall be performed using methods that render PHI unreadable and indecipherable.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to downtime, backup, recovery, and continuity of records. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "45 CFR Part 160" },
      { kind: "External Authority", text: "45 CFR Part 164" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "privacy-governance-binder-6-1", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for downtime, backup, recovery, and continuity of records." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during downtime, backup, recovery, and continuity of records." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for downtime, backup, recovery, and continuity of records." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "locked-clinical-record-cart-6-2", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 31, y: 53, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for downtime, backup, recovery, and continuity of records." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for downtime, backup, recovery, and continuity of records. This decide option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during downtime, backup, recovery, and continuity of records." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for downtime, backup, recovery, and continuity of records." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "encrypted-laptop-with-dark-screen-6-3", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in downtime, backup, recovery, and continuity of records. This identify option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for downtime, backup, recovery, and continuity of records." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during downtime, backup, recovery, and continuity of records." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during downtime, backup, recovery, and continuity of records.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for downtime, backup, recovery, and continuity of records." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for downtime, backup, recovery, and continuity of records. Identify the verified status, discrepancy, affected requirement, and accountable owner for downtime, backup, recovery, and continuity of records by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for downtime, backup, recovery, and continuity of records. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 HIM",
    title: "HIM/privacy dashboard, audits, training, and governing-body reporting",
    subtitle: "Health Information Management & Privacy Oversight",
    narration: [
      "This lesson develops administrator judgment for him/privacy dashboard, audits, training, and governing-body reporting within Health Information Management & Privacy Oversight. Begin with the current controlled versions of CL-CD-001, CO-HP-001, IT-SC-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Retention correction — 42 CFR § 484.110 requires clinical records to be retained for five years after discharge unless state law requires longer. A California or Care Indeed schedule may require a longer period, but no event-based rule may permit destruction before the applicable federal minimum. Do not assign an OASIS retention duration generically to CMS; identify the actual controlling federal, California, payer, litigation-hold, and agency source before applying a longer schedule.",
      "Controlled source application — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. | Policy Reference: CL-CD-001 | Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. Abbreviation. Full Term. ADL. Activities of Daily Living. AM / PM. Morning / Afternoon. amb. Ambulation / Ambulate. bid. Twice daily. BP. Blood Pressure. BGL. Blood Glucose Level. c/o. Complains of. CAD. Coronary Artery Disease. CHF. Congestive Heart Failure. COPD.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-001, Privacy Program Administration. Establish and maintain the HIPAA Privacy Program. Designate a Privacy Officer (may be the Compliance Officer) in writing. The responsible role is Compliance Officer / Privacy Officer; the stated timing is Prior to agency operation; maintained continuously.. Develop and maintain all required privacy policies and procedures per 45 CFR § 164.530(i). The responsible role is Privacy Officer; the stated timing is Maintained continuously; reviewed annually.. Maintain the current Notice of Privacy Practices (Appendix A). Update upon any material change and distribute revised NPP to patients. The responsible role is Privacy Officer; the stated timing is Maintained continuously; distributed to patients at SOC.. Ensure all workforce. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SC-001, 10\\. Training Requirements. 10.1 The IT Director / CISO shall receive comprehensive training on the HIPAA Security Rule, risk analysis methodology, and information security program management within 30 calendar days of designation. Evidence of training shall be documented in the IT Director / CISO's personnel file. 10.2 All Information Security Steering Committee members shall receive orientation to this policy and their specific responsibilities within 14 calendar days of appointment to the committee. Orientation shall be conducted by the IT Director / CISO and documented using Appendix G. 10.3 All workforce members within scope of this policy shall complete security awareness training per IT-UP-004 upon hire and annually thereafter.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CD-001, 10\\. Training & Acknowledgment Requirements. 10.1 All clinical staff shall receive clinical documentation standards training within 14 calendar days of hire and annually thereafter, including: the universal required elements for visit notes; skilled documentation standards with examples from the agency's own audit findings; prohibited practices (copy-forward, pre-dating, falsification, unapproved abbreviations); the correction and late entry process per CO-DC-003; authentication requirements; and the consequences of documentation failures for billing and compliance. 10.2 All new clinical hires shall complete a supervised first visit with documentation review by the Director of Nursing or a designated preceptor before independently submitting documentation. The preceptor shall review the first visit note against the standards in this. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-HP-001, 7\\. Documentation Requirements. Privacy Officer designation: Written designation.. Source or operational basis: Compliance Officer. Notice of Privacy Practices: Current NPP (Appendix A).. Source or operational basis: Privacy Officer. NPP acknowledgments: Signed Appendix B for each patient.. Source or operational basis: Clinical staff (collection). Disclosure Tracking Log: Appendix C.. Source or operational basis: Privacy Officer. Privacy Complaint Log: Appendix D.. Source or operational basis: Privacy Officer. Training records: Per CO-CP-008.. Source or operational basis: Privacy Officer.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to him/privacy dashboard, audits, training, and governing-body reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "locked clinical-record cart", detail: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "encrypted laptop with dark screen", detail: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "privacy governance binder", detail: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-HP-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "Controlled Policy", text: "CO-HP-003" },
      { kind: "Controlled Policy", text: "CO-HP-004" },
      { kind: "Controlled Policy", text: "CO-HP-006" },
      { kind: "Controlled Policy", text: "CO-HP-007" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "External Authority", text: "45 CFR Part 164" },
      { kind: "External Authority", text: "45 CFR § 164.402" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "locked-clinical-record-cart-7-1", label: "locked clinical-record cart", shortLabel: "locked clinical-record cart", ariaLabel: "Investigate locked clinical-record cart",
        x: 14, y: 76, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat locked clinical-record cart as complete proof without comparing encrypted laptop with dark screen or the controlled source. This identify option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for him/privacy dashboard, audits, training, and governing-body reporting." },
          { id: "i3", label: "Classify the locked clinical-record cart by department custom even though its authority and current status are unverified. This identify option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about locked clinical-record cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve locked clinical-record cart on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for locked clinical-record cart is resolved." },
          { id: "d3", label: "Send locked clinical-record cart to an unrelated department rather than the policy owner responsible for him/privacy dashboard, audits, training, and governing-body reporting. This decide option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that locked clinical-record cart was reviewed, without source version, finding, decision, owner, or status. This document option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked clinical-record cart." },
          { id: "doc3", label: "Keep the locked clinical-record cart decision in personal notes rather than the governed evidence location. This document option concerns locked clinical-record cart during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
          meaning: "Observe the real locked clinical-record cart in the photographed scene. Compare it with the encrypted laptop with dark screen, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For locked clinical-record cart, compare the visible evidence with encrypted laptop with dark screen and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to locked clinical-record cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For locked clinical-record cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "encrypted-laptop-with-dark-screen-7-2", label: "encrypted laptop with dark screen", shortLabel: "encrypted laptop with dark scr", ariaLabel: "Investigate encrypted laptop with dark screen",
        x: 35, y: 67, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume encrypted laptop with dark screen applies to every role, location, and exception described in him/privacy dashboard, audits, training, and governing-body reporting. This identify option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for him/privacy dashboard, audits, training, and governing-body reporting." },
          { id: "i3", label: "Use the oldest available encrypted laptop with dark screen because prior approval is easier to confirm. This identify option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about encrypted laptop with dark screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in encrypted laptop with dark screen remains unresolved. This decide option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for encrypted laptop with dark screen is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to encrypted laptop with dark screen. This decide option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark encrypted laptop with dark screen closed on assignment, before completion and effectiveness evidence exist. This document option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of encrypted laptop with dark screen." },
          { id: "doc3", label: "Retain only a summary of encrypted laptop with dark screen and discard the source artifact needed to reconstruct the decision. This document option concerns encrypted laptop with dark screen during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
          meaning: "Observe the real encrypted laptop with dark screen in the photographed scene. Compare it with the privacy governance binder, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For encrypted laptop with dark screen, compare the visible evidence with privacy governance binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to encrypted laptop with dark screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For encrypted laptop with dark screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
      {
        id: "privacy-governance-binder-7-3", label: "privacy governance binder", shortLabel: "privacy governance binder", ariaLabel: "Investigate privacy governance binder",
        x: 76, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status." },
          { id: "i2", label: "Read privacy governance binder only for favorable indicators and omit the exception evidence connected to locked clinical-record cart. This identify option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for him/privacy dashboard, audits, training, and governing-body reporting." },
          { id: "i3", label: "Treat an unsigned or unverified privacy governance binder as equivalent to the current controlled record. This identify option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about privacy governance binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close privacy governance binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for privacy governance binder is resolved." },
          { id: "d3", label: "Defer the privacy governance binder decision to a routine future cycle even though current operations depend on it. This decide option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for privacy governance binder but omit the actual evidence, communications, and unresolved items. This document option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy governance binder." },
          { id: "doc3", label: "Combine privacy governance binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns privacy governance binder during him/privacy dashboard, audits, training, and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for him/privacy dashboard, audits, training, and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting.",
          meaning: "Observe the real privacy governance binder in the photographed scene. Compare it with the locked clinical-record cart, current controlled sources, assigned decision rights, and corroborating records for him/privacy dashboard, audits, training, and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for him/privacy dashboard, audits, training, and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For privacy governance binder, compare the visible evidence with locked clinical-record cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. Apply that decision specifically to privacy governance binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for him/privacy dashboard, audits, training, and governing-body reporting. For privacy governance binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-HP-001","CO-HP-002","CO-HP-003","CO-HP-004","CO-HP-006","CO-HP-007","CL-CD-001","CL-CD-002","IT-SC-001","42 CFR § 484.110","45 CFR","45 CFR § 164.530(i)","45 CFR § 164.530(j)","42 CFR §484.110","45 CFR Part 160","45 CFR Part 164","45 CFR § 164.402","45 CFR § 164.502(b)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During administrator oversight of legal health record and information governance, the privacy governance binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat privacy governance binder as final approval because the artifact exists during administrator oversight of legal health record and information governance.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance.",
      "Approve privacy governance binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns administrator oversight of legal health record and information governance.",
      "Send privacy governance binder to an unrelated department rather than the policy owner responsible for administrator oversight of legal health record and information governance. This option concerns administrator oversight of legal health record and information governance.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in administrator oversight of legal health record and information governance. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 2,
    stem: "During privacy, minimum necessary, patient access, amendment, and accounting, the locked clinical-record cart evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting.",
      "Replace the controlling requirement with an informal local workaround tailored to locked clinical-record cart. This option concerns privacy, minimum necessary, patient access, amendment, and accounting.",
      "Allow the affected activity to expand while the exception in locked clinical-record cart remains unresolved. This option concerns privacy, minimum necessary, patient access, amendment, and accounting.",
      "Treat locked clinical-record cart as final approval because the artifact exists during privacy, minimum necessary, patient access, amendment, and accounting.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in privacy, minimum necessary, patient access, amendment, and accounting. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 3,
    stem: "During security risk analysis, access control, encryption, and workforce safeguards, the encrypted laptop with dark screen evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the encrypted laptop with dark screen decision to a routine future cycle even though current operations depend on it. This option concerns security risk analysis, access control, encryption, and workforce safeguards.",
      "Treat encrypted laptop with dark screen as final approval because the artifact exists during security risk analysis, access control, encryption, and workforce safeguards.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards.",
      "Close encrypted laptop with dark screen when work is submitted, without testing whether the correction changed the intended outcome. This option concerns security risk analysis, access control, encryption, and workforce safeguards.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security risk analysis, access control, encryption, and workforce safeguards. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 4,
    stem: "During record content, authentication, timeliness, retention, and destruction, the privacy governance binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send privacy governance binder to an unrelated department rather than the policy owner responsible for record content, authentication, timeliness, retention, and destruction. This option concerns record content, authentication, timeliness, retention, and destruction.",
      "Treat privacy governance binder as final approval because the artifact exists during record content, authentication, timeliness, retention, and destruction.",
      "Approve privacy governance binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns record content, authentication, timeliness, retention, and destruction.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in record content, authentication, timeliness, retention, and destruction. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 5,
    stem: "During incident detection, breach risk assessment, notification, and evidence preservation, the locked clinical-record cart evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation.",
      "Treat locked clinical-record cart as final approval because the artifact exists during incident detection, breach risk assessment, notification, and evidence preservation.",
      "Replace the controlling requirement with an informal local workaround tailored to locked clinical-record cart. This option concerns incident detection, breach risk assessment, notification, and evidence preservation.",
      "Allow the affected activity to expand while the exception in locked clinical-record cart remains unresolved. This option concerns incident detection, breach risk assessment, notification, and evidence preservation.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in incident detection, breach risk assessment, notification, and evidence preservation. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 6,
    stem: "During downtime, backup, recovery, and continuity of records, the encrypted laptop with dark screen evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records.",
      "Treat encrypted laptop with dark screen as final approval because the artifact exists during downtime, backup, recovery, and continuity of records.",
      "Close encrypted laptop with dark screen when work is submitted, without testing whether the correction changed the intended outcome. This option concerns downtime, backup, recovery, and continuity of records.",
      "Defer the encrypted laptop with dark screen decision to a routine future cycle even though current operations depend on it. This option concerns downtime, backup, recovery, and continuity of records.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in downtime, backup, recovery, and continuity of records. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 7,
    stem: "During him/privacy dashboard, audits, training, and governing-body reporting, the privacy governance binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat privacy governance binder as final approval because the artifact exists during him/privacy dashboard, audits, training, and governing-body reporting.",
      "Send privacy governance binder to an unrelated department rather than the policy owner responsible for him/privacy dashboard, audits, training, and governing-body reporting. This option concerns him/privacy dashboard, audits, training, and governing-body reporting.",
      "Approve privacy governance binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns him/privacy dashboard, audits, training, and governing-body reporting.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in him/privacy dashboard, audits, training, and governing-body reporting. The decision remains traceable to CO-HP-001, CO-HP-002, CO-HP-003, CO-HP-004, CO-HP-006, CO-HP-007, CL-CD-001, CL-CD-002, IT-SC-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.110 be used within Health Information Management & Privacy Oversight?",
    options: [
      "Treat a citation label as proof that every operational detail is current.",
      "Apply the citation outside its stated subject and scope.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
      "Replace the controlled agency policies with course narration.",
    ],
    correct: 2,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links encrypted laptop with dark screen and encrypted laptop with dark screen into an accountable Health Information Management & Privacy Oversight control?",
    options: [
      "A verbal understanding that no exception will recur.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A familiar dashboard color without source validation.",
      "An unversioned local worksheet with no assigned reviewer.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Health Information Management & Privacy Oversight establish?",
    options: [
      "Knowledge of the controlled administrator concepts in Health Information Management & Privacy Oversight, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Permission to replace the controlled policies with the Health Information Management & Privacy Oversight quiz result.",
      "Observed operational competency without an authorized evaluator.",
      "Automatic appointment authority for every decision described in Health Information Management & Privacy Oversight.",
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





const STORAGE_KEY = 'adm-013-progress-v6000';



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



export default function ADM013() {

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

          <span className="brand-text">ADM-013 — HIM & Privacy</span>

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
