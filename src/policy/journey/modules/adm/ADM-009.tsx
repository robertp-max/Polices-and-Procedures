/**
 * ADM-009 — Survey Readiness & CMS Conditions of Participation
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

import img01 from './assets/adm-009/adm-009-lesson-01.png';
import img02 from './assets/adm-009/adm-009-lesson-02.png';
import img03 from './assets/adm-009/adm-009-lesson-03.png';
import img04 from './assets/adm-009/adm-009-lesson-04.png';
import img05 from './assets/adm-009/adm-009-lesson-05.png';
import img06 from './assets/adm-009/adm-009-lesson-06.png';
import img07 from './assets/adm-009/adm-009-lesson-07.png';



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



const MODULE_META = { id: "ADM-009", title: "Survey Readiness & CMS Conditions of Participation", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Continuous readiness and CMS condition-level framework, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Entrance conference, survey roles, document control, and staff response, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Personnel, clinical-record, policy, QAPI, and emergency evidence tracers, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Interview consistency and observation readiness, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Deficiency classification, immediate protection, and factual response, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Plan of correction, root cause, systemic remediation, and monitoring, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Mock survey dashboard and governing-body closure, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Continu",
    title: "Continuous readiness and CMS condition-level framework",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for continuous readiness and cms condition-level framework within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of CO-RA-003, GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-RA-003, Survey Readiness Binder Maintenance. Establish and maintain the Survey Readiness Binder containing at minimum: (a) current agency license; (b) Medicare certification; (c) Governing Body roster and meeting minutes (last 12 months); (d) organizational chart; (e) scope of services; (f) current QAPI plan; (g) QAPI committee minutes (last 12 months); (h) compliance program description; (i) emergency preparedness plan; (j) infection control plan; (k) patient rights notice; (l) advance directive policy; (m) current employee roster with license verification dates; (n) OIG/SAM screening log (last 12 months); (o) policy index with review dates; (p) training completion summary. The responsible role is Compliance Officer; the stated timing is Maintained continuously; reviewed monthly.. Designate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Medicare Certification Maintenance. Maintain the agency's Medicare certification in continuous active status by ensuring ongoing compliance with all CMS Conditions of Participation (42 CFR Part 484). Medicare certification does not have a fixed renewal date; it continues as long as the agency remains in compliance and is not terminated by CMS. The responsible role is Administrator; the stated timing is Continuous.. Maintain continuous survey readiness per policy CO-RA-003. Ensure that all clinical, operational, administrative, and governance systems are maintained in a state of compliance that would satisfy an unannounced CMS state agency survey at any time. The responsible role is Administrator / Compliance Officer; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 5\\. Definitions. Survey Readiness. The continuous state of documented compliance with all applicable regulatory standards enabling the agency to demonstrate compliance during any unannounced survey.. Mock Survey. An internally conducted or externally commissioned simulation of a CMS or state licensure survey using the applicable survey protocol (SOM Appendix B for CMS).. Plan of Correction (POC). The agency's formal, written response to survey deficiencies that identifies root cause, corrective actions, responsible parties, completion dates, and ongoing monitoring.. Condition-Level Deficiency. A survey finding indicating that the agency fails to meet a Condition of Participation in its entirety — the most serious survey finding that may result in termination of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall maintain continuous survey readiness at all times. Survey readiness is not an event-driven activity; it is a continuous operational standard. 4.2 The agency shall conduct at minimum one comprehensive mock survey annually and one focused mock survey per quarter, targeting areas identified as high-risk through internal audit findings, OIG Work Plan priorities, or prior survey deficiencies. 4.3 All staff shall be trained on surveyor interaction protocols including: (a) greeting and badge verification; (b) immediate notification of the Administrator and Compliance Officer; (c) answering only questions within their scope of knowledge; (d) providing only requested documentation; (e) never. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 7\\. Documentation Requirements. Survey Readiness Binder: Compiled binder with all required documents.. Source or operational basis: Survey Readiness Coordinator. Monthly verification log: Appendix A checklist completed monthly.. Source or operational basis: Survey Readiness Coordinator. Mock survey schedule: Annual mock survey schedule.. Source or operational basis: Compliance Officer. Mock survey findings: Appendix B reports for each mock survey.. Source or operational basis: Compliance Officer. Survey interaction guidelines: Current Appendix C distributed to all staff.. Source or operational basis: Compliance Officer. External survey findings: CMS-2567 and agency POC.. Source or operational basis: Compliance Officer. External audit log: Appendix D log of all external audit requests.. Source or operational basis: Compliance. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to continuous readiness and cms condition-level framework. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR §484.100" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "surveyor-clipboard-1-1", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous readiness and cms condition-level framework." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for continuous readiness and cms condition-level framework. This decide option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous readiness and cms condition-level framework." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during continuous readiness and cms condition-level framework.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous readiness and cms condition-level framework." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "mobile-evidence-cart-1-2", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 35, y: 62, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in continuous readiness and cms condition-level framework. This identify option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous readiness and cms condition-level framework." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous readiness and cms condition-level framework." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during continuous readiness and cms condition-level framework.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous readiness and cms condition-level framework." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "tabbed-policy-binders-1-3", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 81, y: 43, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous readiness and cms condition-level framework." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous readiness and cms condition-level framework." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during continuous readiness and cms condition-level framework.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous readiness and cms condition-level framework." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for continuous readiness and cms condition-level framework. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous readiness and cms condition-level framework by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous readiness and cms condition-level framework. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Entranc",
    title: "Entrance conference, survey roles, document control, and staff response",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for entrance conference, survey roles, document control, and staff response within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of CO-RA-003, GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-RA-003, Mock Survey Program. Develop an annual mock survey schedule. Schedule must include: (a) one comprehensive mock survey annually using CMS SOM Appendix B survey protocol; (b) one focused mock survey per quarter targeting high-risk areas. The responsible role is Compliance Officer; the stated timing is Approved at Q1 Compliance Committee meeting.. Conduct or commission each mock survey per the schedule. For comprehensive mock surveys: utilize an external consultant or cross-trained internal team that did not create the documentation being reviewed. The responsible role is Compliance Officer; the stated timing is Per annual schedule.. Document all mock survey findings using the Mock Survey Findings Report (Appendix B). Findings shall. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify: Evidence that the agency holds a current, valid state license. Surveyors will request a copy of the current California home health agency license and verify it is not expired. They will also verify that the license is displayed in the agency's principal office. An expired or suspended license is a threshold finding that may terminate the survey process and trigger immediate CMS notification. Evidence that the agency's Medicare certification is in good standing. Surveyors will verify the CCN and cross-reference the agency's PECOS enrollment status. Any discrepancy between. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 11\\. Version Control. Per EN-LC-001 standards. Only the most current approved version is valid. Substantive revision requires Governing Body approval and re-acknowledgment within 14 calendar days. Appendix A — Survey Readiness Binder Monthly Verification Checklist Care Indeed Home Health Care, Inc. | Policy Reference: CO-RA-003 | Version: 1.0 Instructions: Complete monthly. Verify each item is current and accessible. Report any gaps to the Compliance Officer within 5 business days. Month/Year: _______________: Verified By: _______________. Source or operational basis: Date: _______________. #: Binder Item. Source or operational basis: Current?. 1: California HCAI License (current). Source or operational basis: ☐ Yes ☐ No. 2: Medicare Certification (current). Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Staff Survey Interaction Training. Develop and maintain Survey Interaction Guidelines (Appendix C) covering: (a) immediate surveyor notification chain; (b) badge and identification verification; (c) interview demeanor and response standards; (d) documentation provision protocols; (e) prohibited behaviors (arguing, volunteering information, destroying documents). The responsible role is Compliance Officer; the stated timing is Maintained continuously; updated annually.. Include survey interaction training in compliance orientation (CO-CP-008) and annual refresher training for all workforce members. The responsible role is Compliance Officer; the stated timing is At hire; annually.. Conduct a survey readiness drill at least once annually — unannounced to staff — simulating surveyor arrival, notification chain activation, and initial document request. Document. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Survey Readiness Binder Maintenance. Establish and maintain the Survey Readiness Binder containing at minimum: (a) current agency license; (b) Medicare certification; (c) Governing Body roster and meeting minutes (last 12 months); (d) organizational chart; (e) scope of services; (f) current QAPI plan; (g) QAPI committee minutes (last 12 months); (h) compliance program description; (i) emergency preparedness plan; (j) infection control plan; (k) patient rights notice; (l) advance directive policy; (m) current employee roster with license verification dates; (n) OIG/SAM screening log (last 12 months); (o) policy index with review dates; (p) training completion summary. The responsible role is Compliance Officer; the stated timing is Maintained continuously; reviewed monthly.. Designate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to entrance conference, survey roles, document control, and staff response. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR §484.100" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "mobile-evidence-cart-2-1", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in entrance conference, survey roles, document control, and staff response. This identify option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for entrance conference, survey roles, document control, and staff response." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during entrance conference, survey roles, document control, and staff response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for entrance conference, survey roles, document control, and staff response." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "tabbed-policy-binders-2-2", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 32, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for entrance conference, survey roles, document control, and staff response." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during entrance conference, survey roles, document control, and staff response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for entrance conference, survey roles, document control, and staff response." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "surveyor-clipboard-2-3", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for entrance conference, survey roles, document control, and staff response." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for entrance conference, survey roles, document control, and staff response. This decide option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during entrance conference, survey roles, document control, and staff response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during entrance conference, survey roles, document control, and staff response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for entrance conference, survey roles, document control, and staff response." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for entrance conference, survey roles, document control, and staff response. Identify the verified status, discrepancy, affected requirement, and accountable owner for entrance conference, survey roles, document control, and staff response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for entrance conference, survey roles, document control, and staff response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Personn",
    title: "Personnel, clinical-record, policy, QAPI, and emergency evidence tracers",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for personnel, clinical-record, policy, qapi, and emergency evidence tracers within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of QA-AE-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — QA-AE-003, 7\\. Documentation Requirements. CAP document: Completed CAP per Section 6.2.1 (Appendix A).. Source or operational basis: CAP Lead. QAPI Corrective Action Tracker: Central log per Section 4.3 (Appendix B).. Source or operational basis: QAPI Coordinator. Monthly progress reports: Written reports per Section 6.3.2.. Source or operational basis: CAP Lead. CAP Closure Recommendation: Recommendation per Section 6.4.3 (Appendix C).. Source or operational basis: CAP Lead. QAPI Committee review documentation: Meeting minutes documenting CAP review and decisions.. Source or operational basis: QAPI Coordinator. CMS Plan of Correction: POC per Section 6.5.1.. Source or operational basis: Administrator / QAPI Coordinator. Policy acknowledgments: Signed forms.. Source or operational basis: Each individual; QAPI. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, Monitoring and Effectiveness Verification. Monitor the effectiveness of corrective actions by collecting and analyzing data per the CAP monitoring plan. Compare actual performance to the measurable outcome target at each monitoring interval. The responsible role is CAP Lead / QAPI Coordinator; the stated timing is Per monitoring plan frequency (minimum monthly).. Present CAP status to the QAPI Committee monthly as part of the QAPI Action Item Tracker review. For each open CAP: report implementation status, current performance vs. target, and recommendation (continue monitoring / ready for closure / escalate). The responsible role is QAPI Coordinator; the stated timing is Monthly at QAPI Committee meeting.. When the measurable outcome target. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, Escalation and Exception Handling. CAP implementation falls behind approved timeline by > 30 days.: CAP Lead reports to QAPI Coordinator with explanation.. Source or operational basis: QAPI Coordinator presents to QAPI Committee for review. Committee may approve revised timeline, assign additional resources, or reassign lead.. CAP fails to achieve measurable outcome target after full implementation period.: CAP Lead reports failure to QAPI Coordinator.. Source or operational basis: QAPI Committee reviews and may: (a) extend monitoring; (b) modify corrective actions; (c) initiate a new RCA per QA-AE-002; (d) escalate to Governing Body.. CAP closure criteria met but deficiency recurs within 6 months of closure.: QAPI Coordinator reopens the CAP or. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, 12\\. Appendices. Appendix A: Corrective Action Plan Template Care Indeed Home Health Care, Inc. Corrective Action Plan (CAP) Policy Reference: QA-AE-003 | Version: 6.0 CAP Reference #: _______ Date Initiated: _____________ CAP Lead: _________________________ Trigger Source: ☐ RCA (Ref#: _____) ☐ Quality Indicator Below Threshold ☐ CMS Survey Finding ☐ Compliance Audit Finding ☐ Governing Body Directive ☐ QAPI Committee Directive ☐ Other: _____________ Problem Statement: (Concise, specific description of the deficiency) Root Cause / Contributing Factors: (From RCA or contributing factor analysis) Corrective Actions: Action #: Specific Corrective Action. Source or operational basis: Root Cause Addressed. 1: . Source or operational basis: . 2: . Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, 4\\. Policy Statements. 4.1 A Corrective Action Plan shall be developed for every: (a) Root Cause Analysis completed per QA-AE-002; (b) quality indicator below threshold for 2 consecutive periods with QAPI Committee directive; (c) CMS survey finding requiring a Plan of Correction; (d) compliance audit finding classified as high-risk; (e) Governing Body directive for corrective action; (f) any other deficiency the QAPI Committee determines warrants formal corrective action. 4.2 Each CAP must include: (a) a clear problem statement; (b) the identified root cause or contributing factors; (c) specific corrective actions; (d) responsible party for each action; (e) measurable outcome targets; (f) implementation timeline; (g) monitoring plan; (h) effectiveness. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to personnel, clinical-record, policy, qapi, and emergency evidence tracers. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "tabbed-policy-binders-3-1", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 14, y: 47, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "surveyor-clipboard-3-2", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 40, y: 42, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for personnel, clinical-record, policy, qapi, and emergency evidence tracers. This decide option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "mobile-evidence-cart-3-3", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 73, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in personnel, clinical-record, policy, qapi, and emergency evidence tracers. This identify option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during personnel, clinical-record, policy, qapi, and emergency evidence tracers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, clinical-record, policy, qapi, and emergency evidence tracers." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for personnel, clinical-record, policy, qapi, and emergency evidence tracers. Identify the verified status, discrepancy, affected requirement, and accountable owner for personnel, clinical-record, policy, qapi, and emergency evidence tracers by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for personnel, clinical-record, policy, qapi, and emergency evidence tracers. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Intervi",
    title: "Interview consistency and observation readiness",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for interview consistency and observation readiness within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of CO-RA-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-RA-003, Survey Readiness Binder Maintenance. Establish and maintain the Survey Readiness Binder containing at minimum: (a) current agency license; (b) Medicare certification; (c) Governing Body roster and meeting minutes (last 12 months); (d) organizational chart; (e) scope of services; (f) current QAPI plan; (g) QAPI committee minutes (last 12 months); (h) compliance program description; (i) emergency preparedness plan; (j) infection control plan; (k) patient rights notice; (l) advance directive policy; (m) current employee roster with license verification dates; (n) OIG/SAM screening log (last 12 months); (o) policy index with review dates; (p) training completion summary. The responsible role is Compliance Officer; the stated timing is Maintained continuously; reviewed monthly.. Designate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 2\\. Purpose. This policy establishes the continuous survey readiness program of Care Indeed Home Health Care, Inc. Survey readiness is the state of operational preparedness in which the agency can demonstrate compliance with all applicable Conditions of Participation (42 CFR Part 484), state licensure requirements, and accreditation standards at any point in time — including unannounced CMS surveys. This policy ensures the agency maintains documented evidence of compliance, conducts mock surveys, prepares staff for surveyor interactions, and responds promptly and effectively to external audit and survey findings.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 10\\. Training Requirements. All workforce members shall receive survey interaction training during compliance orientation within 14 calendar days of hire per CO-CP-008. All workforce members shall receive annual survey readiness refresher training. The Administrator shall conduct at least one unannounced survey readiness drill annually. The Compliance Officer shall receive training on CMS survey protocol (SOM Appendix B) within 30 calendar days of designation.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Policy Header. Policy ID. CO-RA-003. Policy Title. External Audit & Survey Readiness. Domain. CO — Compliance & Regulatory. Subdomain. RA — Regulatory Affairs. Classification Tier. REQUIRED. Version. 1.0. Effective Date. 2025-07-10. Approved By. Governing Body Chair — Care Indeed Home Health Care, Inc.. Last Reviewed. 2025-07-10. Next Review Date. 2026-07-10. Policy Owner/Steward. Compliance Officer. Status. ACTIVE. Review Cycle. Annual. Access Tier. Tier 2 — Restricted. Supersedes. N/A (Initial Version).. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall maintain continuous survey readiness at all times. Survey readiness is not an event-driven activity; it is a continuous operational standard. 4.2 The agency shall conduct at minimum one comprehensive mock survey annually and one focused mock survey per quarter, targeting areas identified as high-risk through internal audit findings, OIG Work Plan priorities, or prior survey deficiencies. 4.3 All staff shall be trained on surveyor interaction protocols including: (a) greeting and badge verification; (b) immediate notification of the Administrator and Compliance Officer; (c) answering only questions within their scope of knowledge; (d) providing only requested documentation; (e) never. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to interview consistency and observation readiness. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "surveyor-clipboard-4-1", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interview consistency and observation readiness." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for interview consistency and observation readiness. This decide option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interview consistency and observation readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during interview consistency and observation readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interview consistency and observation readiness." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "mobile-evidence-cart-4-2", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 47, y: 75, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in interview consistency and observation readiness. This identify option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interview consistency and observation readiness." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interview consistency and observation readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during interview consistency and observation readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interview consistency and observation readiness." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "tabbed-policy-binders-4-3", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 86, y: 54, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interview consistency and observation readiness." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interview consistency and observation readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during interview consistency and observation readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interview consistency and observation readiness." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for interview consistency and observation readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for interview consistency and observation readiness by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interview consistency and observation readiness. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Deficie",
    title: "Deficiency classification, immediate protection, and factual response",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for deficiency classification, immediate protection, and factual response within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of CO-RA-003, GV-EA-004, CO-RA-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-RA-003, Response to External Audits (MAC, ZPIC/UPIC, OIG, RAC). Upon receipt of an external audit request (Additional Documentation Request, medical record request, or audit notification): notify the Compliance Officer within 24 hours. The responsible role is Administrator / Revenue Cycle Director; the stated timing is Within 24 hours.. Log the audit request in the External Audit Log (Appendix D). Assign tracking number and designate response coordinator. The responsible role is Compliance Officer; the stated timing is Within 1 business day.. Compile requested documentation within the auditor's required timeframe. All records submitted must be reviewed by the Compliance Officer before submission. The responsible role is Response Coordinator; the stated timing is Per audit deadline (typically. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Escalation and Exception Handling. A renewal application has not been submitted by the 90-day deadline.: Compliance Officer notifies the Administrator in writing and the Governing Body Chair.. Source or operational basis: Administrator submits the renewal application immediately. If the credential is at risk of lapse, engage legal counsel per GV-EA-003 and the issuing authority to explore expedited processing. Governing Body notified at the next meeting or via special notification.. A credential expires before the renewal is processed (lapse occurs).: Administrator notifies the Governing Body Chair and Compliance Officer immediately.. Source or operational basis: Administrator contacts the issuing authority immediately to determine: (a) whether the agency may continue to operate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Response to External Survey Findings. Upon receipt of survey findings (Statement of Deficiencies / Form CMS-2567): notify the Governing Body Chair and Compliance Officer within 24 hours. Convene an emergency leadership meeting within 48 hours. The responsible role is Administrator; the stated timing is Within 24 hours of receipt; meeting within 48 hours.. Analyze each cited deficiency. Classify as: (a) Condition-level; (b) Standard-level; (c) Immediate Jeopardy. Determine root cause for each finding. The responsible role is Compliance Officer; the stated timing is Within 5 calendar days of receipt.. Develop the Plan of Correction (POC) per CMS requirements. Each POC element must include: (a) what corrective action will be accomplished; (b). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-005, State Survey Response. Upon receipt of state survey findings: notify Governing Body within 24 hours. Follow CO-RA-003 Section 6.4 for response protocol. The responsible role is Administrator; the stated timing is Within 24 hours.. Develop Deficiency Plan of Correction within state-required timeframe. The responsible role is Compliance Officer; the stated timing is Per state deadline... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall maintain current, valid, and uninterrupted licensure, certification, and enrollment with all applicable federal, state, and local regulatory authorities at all times as a condition of its legal authority to operate and to participate in federal and state healthcare programs. 4.2 The Administrator is directly accountable to the Governing Body for the maintenance and timely renewal of all agency credentials. No credential shall be allowed to lapse, expire, or become inactive without immediate corrective action and Governing Body notification. 4.3 The Administrator shall maintain a centralized Agency Credential Register (Appendix A) that documents every required agency-level credential, including. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to deficiency classification, immediate protection, and factual response. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR Part 489" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "mobile-evidence-cart-5-1", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 14, y: 70, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in deficiency classification, immediate protection, and factual response. This identify option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency classification, immediate protection, and factual response." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency classification, immediate protection, and factual response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency classification, immediate protection, and factual response." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "tabbed-policy-binders-5-2", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 36, y: 51, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency classification, immediate protection, and factual response." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency classification, immediate protection, and factual response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency classification, immediate protection, and factual response." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "surveyor-clipboard-5-3", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 78, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency classification, immediate protection, and factual response." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for deficiency classification, immediate protection, and factual response. This decide option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency classification, immediate protection, and factual response." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during deficiency classification, immediate protection, and factual response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency classification, immediate protection, and factual response." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for deficiency classification, immediate protection, and factual response. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency classification, immediate protection, and factual response by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency classification, immediate protection, and factual response. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Plan",
    title: "Plan of correction, root cause, systemic remediation, and monitoring",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for plan of correction, root cause, systemic remediation, and monitoring within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of QA-AE-003, CO-RA-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — QA-AE-003, Monitoring and Effectiveness Verification. Monitor the effectiveness of corrective actions by collecting and analyzing data per the CAP monitoring plan. Compare actual performance to the measurable outcome target at each monitoring interval. The responsible role is CAP Lead / QAPI Coordinator; the stated timing is Per monitoring plan frequency (minimum monthly).. Present CAP status to the QAPI Committee monthly as part of the QAPI Action Item Tracker review. For each open CAP: report implementation status, current performance vs. target, and recommendation (continue monitoring / ready for closure / escalate). The responsible role is QAPI Coordinator; the stated timing is Monthly at QAPI Committee meeting.. When the measurable outcome target. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, CMS Survey Plan of Correction. For CMS survey findings requiring a Plan of Correction: develop the POC per CMS format requirements using this policy's CAP development process (Section 6.2) as the foundation. The POC must include: (a) corrective actions for each cited deficiency; (b) how the agency will ensure the deficiency is corrected for the cited patient(s); (c) how the agency will identify other patients potentially affected; (d) what systemic changes will prevent recurrence; (e) how the agency will monitor effectiveness; (f) completion date for each action. The responsible role is Administrator / QAPI Coordinator; the stated timing is Per CMS-required timeframe (typically 10 calendar days from receipt of survey. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, 12\\. Appendices. Appendix A: Corrective Action Plan Template Care Indeed Home Health Care, Inc. Corrective Action Plan (CAP) Policy Reference: QA-AE-003 | Version: 6.0 CAP Reference #: _______ Date Initiated: _____________ CAP Lead: _________________________ Trigger Source: ☐ RCA (Ref#: _____) ☐ Quality Indicator Below Threshold ☐ CMS Survey Finding ☐ Compliance Audit Finding ☐ Governing Body Directive ☐ QAPI Committee Directive ☐ Other: _____________ Problem Statement: (Concise, specific description of the deficiency) Root Cause / Contributing Factors: (From RCA or contributing factor analysis) Corrective Actions: Action #: Specific Corrective Action. Source or operational basis: Root Cause Addressed. 1: . Source or operational basis: . 2: . Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — QA-AE-003, CAP Development. Develop the Corrective Action Plan using the CAP Template (Appendix A). The plan must include all of the following elements: (a) CAP Reference Number; (b) Trigger Source (RCA, quality indicator, survey finding, etc.); (c) Problem Statement — concise, specific description of the deficiency; (d) Root Cause / Contributing Factors — from RCA findings or contributing factor analysis; (e) Corrective Actions — specific, actionable steps to address each root cause; each action must be individually numbered; (f) Responsible Party — named individual for each corrective action; (g) Measurable Outcome Target — the specific, quantifiable standard the corrective action must achieve (e.g., \"Medication reconciliation completion rate ≥. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-005, State Regulatory Compliance Monitoring. Monitor California HCAI regulatory updates per CO-RA-001 Appendix A monitoring schedule. The responsible role is Compliance Officer; the stated timing is Monthly.. Conduct an annual state licensure compliance review verifying: (a) staffing requirements; (b) supervision ratios; (c) reporting obligations; (d) patient rights compliance; (e) record retention per state requirements. The responsible role is Compliance Officer; the stated timing is Annually by end of Q1.. Document the annual state compliance review and present findings to the Governing Body. The responsible role is Compliance Officer; the stated timing is Q1 Governing Body meeting... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to plan of correction, root cause, systemic remediation, and monitoring. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR Part 489" },
      { kind: "External Authority", text: "42 CFR § 489.13" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "tabbed-policy-binders-6-1", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan of correction, root cause, systemic remediation, and monitoring." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "surveyor-clipboard-6-2", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 34, y: 55, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan of correction, root cause, systemic remediation, and monitoring." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for plan of correction, root cause, systemic remediation, and monitoring. This decide option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "mobile-evidence-cart-6-3", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in plan of correction, root cause, systemic remediation, and monitoring. This identify option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan of correction, root cause, systemic remediation, and monitoring." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during plan of correction, root cause, systemic remediation, and monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan of correction, root cause, systemic remediation, and monitoring." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for plan of correction, root cause, systemic remediation, and monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan of correction, root cause, systemic remediation, and monitoring by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan of correction, root cause, systemic remediation, and monitoring. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Mock",
    title: "Mock survey dashboard and governing-body closure",
    subtitle: "Survey Readiness & CMS Conditions of Participation",
    narration: [
      "This lesson develops administrator judgment for mock survey dashboard and governing-body closure within Survey Readiness & CMS Conditions of Participation. Begin with the current controlled versions of CO-RA-003, GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-RA-003, Mock Survey Program. Develop an annual mock survey schedule. Schedule must include: (a) one comprehensive mock survey annually using CMS SOM Appendix B survey protocol; (b) one focused mock survey per quarter targeting high-risk areas. The responsible role is Compliance Officer; the stated timing is Approved at Q1 Compliance Committee meeting.. Conduct or commission each mock survey per the schedule. For comprehensive mock surveys: utilize an external consultant or cross-trained internal team that did not create the documentation being reviewed. The responsible role is Compliance Officer; the stated timing is Per annual schedule.. Document all mock survey findings using the Mock Survey Findings Report (Appendix B). Findings shall. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify: Evidence that the agency holds a current, valid state license. Surveyors will request a copy of the current California home health agency license and verify it is not expired. They will also verify that the license is displayed in the agency's principal office. An expired or suspended license is a threshold finding that may terminate the survey process and trigger immediate CMS notification. Evidence that the agency's Medicare certification is in good standing. Surveyors will verify the CCN and cross-reference the agency's PECOS enrollment status. Any discrepancy between. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, 11\\. Version Control. Per EN-LC-001 standards. Only the most current approved version is valid. Substantive revision requires Governing Body approval and re-acknowledgment within 14 calendar days. Appendix A — Survey Readiness Binder Monthly Verification Checklist Care Indeed Home Health Care, Inc. | Policy Reference: CO-RA-003 | Version: 1.0 Instructions: Complete monthly. Verify each item is current and accessible. Report any gaps to the Compliance Officer within 5 business days. Month/Year: _______________: Verified By: _______________. Source or operational basis: Date: _______________. #: Binder Item. Source or operational basis: Current?. 1: California HCAI License (current). Source or operational basis: ☐ Yes ☐ No. 2: Medicare Certification (current). Source or operational. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Staff Survey Interaction Training. Develop and maintain Survey Interaction Guidelines (Appendix C) covering: (a) immediate surveyor notification chain; (b) badge and identification verification; (c) interview demeanor and response standards; (d) documentation provision protocols; (e) prohibited behaviors (arguing, volunteering information, destroying documents). The responsible role is Compliance Officer; the stated timing is Maintained continuously; updated annually.. Include survey interaction training in compliance orientation (CO-CP-008) and annual refresher training for all workforce members. The responsible role is Compliance Officer; the stated timing is At hire; annually.. Conduct a survey readiness drill at least once annually — unannounced to staff — simulating surveyor arrival, notification chain activation, and initial document request. Document. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-003, Survey Readiness Binder Maintenance. Establish and maintain the Survey Readiness Binder containing at minimum: (a) current agency license; (b) Medicare certification; (c) Governing Body roster and meeting minutes (last 12 months); (d) organizational chart; (e) scope of services; (f) current QAPI plan; (g) QAPI committee minutes (last 12 months); (h) compliance program description; (i) emergency preparedness plan; (j) infection control plan; (k) patient rights notice; (l) advance directive policy; (m) current employee roster with license verification dates; (n) OIG/SAM screening log (last 12 months); (o) policy index with review dates; (p) training completion summary. The responsible role is Compliance Officer; the stated timing is Maintained continuously; reviewed monthly.. Designate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to mock survey dashboard and governing-body closure. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "surveyor clipboard", detail: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "mobile evidence cart", detail: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "tabbed policy binders", detail: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "External Authority", text: "42 CFR § 489.13" },
      { kind: "External Authority", text: "42 CFR § 489.52" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "surveyor-clipboard-7-1", label: "surveyor clipboard", shortLabel: "surveyor clipboard", ariaLabel: "Investigate surveyor clipboard",
        x: 21, y: 74, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status." },
          { id: "i2", label: "Treat surveyor clipboard as complete proof without comparing mobile evidence cart or the controlled source. This identify option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for mock survey dashboard and governing-body closure." },
          { id: "i3", label: "Classify the surveyor clipboard by department custom even though its authority and current status are unverified. This identify option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about surveyor clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve surveyor clipboard on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for surveyor clipboard is resolved." },
          { id: "d3", label: "Send surveyor clipboard to an unrelated department rather than the policy owner responsible for mock survey dashboard and governing-body closure. This decide option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during mock survey dashboard and governing-body closure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that surveyor clipboard was reviewed, without source version, finding, decision, owner, or status. This document option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of surveyor clipboard." },
          { id: "doc3", label: "Keep the surveyor clipboard decision in personal notes rather than the governed evidence location. This document option concerns surveyor clipboard during mock survey dashboard and governing-body closure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock survey dashboard and governing-body closure." },
        ],
        feedback: {
          observed: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
          meaning: "Observe the real surveyor clipboard in the photographed scene. Compare it with the mobile evidence cart, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For surveyor clipboard, compare the visible evidence with mobile evidence cart and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to surveyor clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For surveyor clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "mobile-evidence-cart-7-2", label: "mobile evidence cart", shortLabel: "mobile evidence cart", ariaLabel: "Investigate mobile evidence cart",
        x: 59, y: 72, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status." },
          { id: "i2", label: "Assume mobile evidence cart applies to every role, location, and exception described in mock survey dashboard and governing-body closure. This identify option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for mock survey dashboard and governing-body closure." },
          { id: "i3", label: "Use the oldest available mobile evidence cart because prior approval is easier to confirm. This identify option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in mobile evidence cart remains unresolved. This decide option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for mobile evidence cart is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to mobile evidence cart. This decide option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during mock survey dashboard and governing-body closure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark mobile evidence cart closed on assignment, before completion and effectiveness evidence exist. This document option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mobile evidence cart." },
          { id: "doc3", label: "Retain only a summary of mobile evidence cart and discard the source artifact needed to reconstruct the decision. This document option concerns mobile evidence cart during mock survey dashboard and governing-body closure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock survey dashboard and governing-body closure." },
        ],
        feedback: {
          observed: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
          meaning: "Observe the real mobile evidence cart in the photographed scene. Compare it with the tabbed policy binders, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For mobile evidence cart, compare the visible evidence with tabbed policy binders and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to mobile evidence cart; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For mobile evidence cart, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
      {
        id: "tabbed-policy-binders-7-3", label: "tabbed policy binders", shortLabel: "tabbed policy binders", ariaLabel: "Investigate tabbed policy binders",
        x: 75, y: 40, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Read tabbed policy binders only for favorable indicators and omit the exception evidence connected to surveyor clipboard. This identify option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for mock survey dashboard and governing-body closure." },
          { id: "i3", label: "Treat an unsigned or unverified tabbed policy binders as equivalent to the current controlled record. This identify option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about tabbed policy binders." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close tabbed policy binders when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for tabbed policy binders is resolved." },
          { id: "d3", label: "Defer the tabbed policy binders decision to a routine future cycle even though current operations depend on it. This decide option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during mock survey dashboard and governing-body closure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for tabbed policy binders but omit the actual evidence, communications, and unresolved items. This document option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tabbed policy binders." },
          { id: "doc3", label: "Combine tabbed policy binders with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns tabbed policy binders during mock survey dashboard and governing-body closure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock survey dashboard and governing-body closure." },
        ],
        feedback: {
          observed: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure.",
          meaning: "Observe the real tabbed policy binders in the photographed scene. Compare it with the surveyor clipboard, current controlled sources, assigned decision rights, and corroborating records for mock survey dashboard and governing-body closure. Identify the verified status, discrepancy, affected requirement, and accountable owner for mock survey dashboard and governing-body closure by reconciling all three photographed evidence objects with the current controlled source. For tabbed policy binders, compare the visible evidence with surveyor clipboard and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. Apply that decision specifically to tabbed policy binders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for mock survey dashboard and governing-body closure. For tabbed policy binders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CO-RA-003","CO-RA-005","GV-EA-004","QA-AE-003","42 CFR Part 484","42 CFR §484.100","42 CFR §484.110","42 CFR § 484.100","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During continuous readiness and cms condition-level framework, the tabbed policy binders evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat tabbed policy binders as final approval because the artifact exists during continuous readiness and cms condition-level framework.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework.",
      "Send tabbed policy binders to an unrelated department rather than the policy owner responsible for continuous readiness and cms condition-level framework. This option concerns continuous readiness and cms condition-level framework.",
      "Approve tabbed policy binders on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns continuous readiness and cms condition-level framework.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous readiness and cms condition-level framework. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 2,
    stem: "During entrance conference, survey roles, document control, and staff response, the surveyor clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in surveyor clipboard remains unresolved. This option concerns entrance conference, survey roles, document control, and staff response.",
      "Treat surveyor clipboard as final approval because the artifact exists during entrance conference, survey roles, document control, and staff response.",
      "Replace the controlling requirement with an informal local workaround tailored to surveyor clipboard. This option concerns entrance conference, survey roles, document control, and staff response.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in entrance conference, survey roles, document control, and staff response. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 3,
    stem: "During personnel, clinical-record, policy, qapi, and emergency evidence tracers, the mobile evidence cart evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat mobile evidence cart as final approval because the artifact exists during personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
      "Defer the mobile evidence cart decision to a routine future cycle even though current operations depend on it. This option concerns personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
      "Close mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This option concerns personnel, clinical-record, policy, qapi, and emergency evidence tracers.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in personnel, clinical-record, policy, qapi, and emergency evidence tracers. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 4,
    stem: "During interview consistency and observation readiness, the tabbed policy binders evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness.",
      "Treat tabbed policy binders as final approval because the artifact exists during interview consistency and observation readiness.",
      "Send tabbed policy binders to an unrelated department rather than the policy owner responsible for interview consistency and observation readiness. This option concerns interview consistency and observation readiness.",
      "Approve tabbed policy binders on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns interview consistency and observation readiness.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interview consistency and observation readiness. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 5,
    stem: "During deficiency classification, immediate protection, and factual response, the surveyor clipboard evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response.",
      "Treat surveyor clipboard as final approval because the artifact exists during deficiency classification, immediate protection, and factual response.",
      "Replace the controlling requirement with an informal local workaround tailored to surveyor clipboard. This option concerns deficiency classification, immediate protection, and factual response.",
      "Allow the affected activity to expand while the exception in surveyor clipboard remains unresolved. This option concerns deficiency classification, immediate protection, and factual response.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency classification, immediate protection, and factual response. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 6,
    stem: "During plan of correction, root cause, systemic remediation, and monitoring, the mobile evidence cart evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This option concerns plan of correction, root cause, systemic remediation, and monitoring.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring.",
      "Defer the mobile evidence cart decision to a routine future cycle even though current operations depend on it. This option concerns plan of correction, root cause, systemic remediation, and monitoring.",
      "Treat mobile evidence cart as final approval because the artifact exists during plan of correction, root cause, systemic remediation, and monitoring.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan of correction, root cause, systemic remediation, and monitoring. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 7,
    stem: "During mock survey dashboard and governing-body closure, the tabbed policy binders evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send tabbed policy binders to an unrelated department rather than the policy owner responsible for mock survey dashboard and governing-body closure. This option concerns mock survey dashboard and governing-body closure.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure.",
      "Approve tabbed policy binders on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns mock survey dashboard and governing-body closure.",
      "Treat tabbed policy binders as final approval because the artifact exists during mock survey dashboard and governing-body closure.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in mock survey dashboard and governing-body closure. The decision remains traceable to CO-RA-003, CO-RA-005, GV-EA-004, QA-AE-003.",
  },
  {
    id: 8,
    stem: "How should 42 CFR Part 484 be used within Survey Readiness & CMS Conditions of Participation?",
    options: [
      "Replace the controlled agency policies with course narration.",
      "Treat a citation label as proof that every operational detail is current.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
      "Apply the citation outside its stated subject and scope.",
    ],
    correct: 2,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links mobile evidence cart and mobile evidence cart into an accountable Survey Readiness & CMS Conditions of Participation control?",
    options: [
      "A familiar dashboard color without source validation.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "An unversioned local worksheet with no assigned reviewer.",
      "A verbal understanding that no exception will recur.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Survey Readiness & CMS Conditions of Participation establish?",
    options: [
      "Automatic appointment authority for every decision described in Survey Readiness & CMS Conditions of Participation.",
      "Permission to replace the controlled policies with the Survey Readiness & CMS Conditions of Participation quiz result.",
      "Knowledge of the controlled administrator concepts in Survey Readiness & CMS Conditions of Participation, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Observed operational competency without an authorized evaluator.",
    ],
    correct: 2,
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





const STORAGE_KEY = 'adm-009-progress-v6000';



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



export default function ADM009() {

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

          <span className="brand-text">ADM-009 — Survey Readiness</span>

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
