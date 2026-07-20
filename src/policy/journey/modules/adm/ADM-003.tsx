/**
 * ADM-003 — Agency Licensure & Certification Management
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

import img01 from './assets/adm-003/adm-003-lesson-01.png';
import img02 from './assets/adm-003/adm-003-lesson-02.png';
import img03 from './assets/adm-003/adm-003-lesson-03.png';
import img04 from './assets/adm-003/adm-003-lesson-04.png';
import img05 from './assets/adm-003/adm-003-lesson-05.png';
import img06 from './assets/adm-003/adm-003-lesson-06.png';
import img07 from './assets/adm-003/adm-003-lesson-07.png';



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



const MODULE_META = { id: "ADM-003", title: "Agency Licensure & Certification Management", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Licensure, Medicare certification, accreditation, and enrollment inventory, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Renewal calendar, ownership, and evidence control, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Reportable changes in ownership, leadership, location, and services, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Branch, service-area, and scope-of-services controls, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Deficiency, plan-of-correction, and reinspection workflow, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Preventing lapse, unauthorized operation, and outdated postings, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Continuous status dashboard and governing body reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Licensu",
    title: "Licensure, Medicare certification, accreditation, and enrollment inventory",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for licensure, medicare certification, accreditation, and enrollment inventory within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, Medicare Certification Maintenance. Maintain the agency's Medicare certification in continuous active status by ensuring ongoing compliance with all CMS Conditions of Participation (42 CFR Part 484). Medicare certification does not have a fixed renewal date; it continues as long as the agency remains in compliance and is not terminated by CMS. The responsible role is Administrator; the stated timing is Continuous.. Maintain continuous survey readiness per policy CO-RA-003. Ensure that all clinical, operational, administrative, and governance systems are maintained in a state of compliance that would satisfy an unannounced CMS state agency survey at any time. The responsible role is Administrator / Compliance Officer; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Accreditation Maintenance (If Applicable). If the agency holds national accreditation (ACHC, CHAP, Joint Commission, or other CMS-approved accrediting organization), maintain accreditation in active status by complying with all accrediting organization standards and requirements. The responsible role is Administrator; the stated timing is Continuous, if applicable.. Submit accreditation renewal applications within the timeframes specified by the accrediting organization, typically 6–12 months before accreditation expiration. The responsible role is Administrator; the stated timing is Per accrediting organization timeline.. Prepare for and facilitate accreditation surveys, following the same readiness protocols applied to CMS surveys per Section 6.3.3 and policy CO-RA-003. The responsible role is Administrator; the stated timing is As surveys are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 9\\. References. 9.1 Federal Regulations 42 CFR § 484.100: Condition of Participation: Compliance with Federal, State, and local laws. Source or operational basis: Requires the agency to maintain compliance with all applicable laws, including licensure and certification requirements.. 42 CFR § 484.105: Condition of Participation: Organization and Administration of Services. Source or operational basis: Governing body responsibility for ensuring the agency operates under valid licensure and certification.. 42 CFR Part 489: Provider Agreements and Supplier Approval. Source or operational basis: Governs Medicare provider agreements, termination, and change of information requirements.. 42 CFR § 489.13: Effective date of agreement or approval. Source or operational basis: Defines effective dates. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 5\\. Definitions. Agency Credential. Any license, certification, enrollment, accreditation, permit, or registration required by a federal, state, or local authority for the agency to operate lawfully and participate in healthcare programs.. California Home Health Agency License. The license issued by the California Department of Health Care Access and Information (HCAI) authorizing the agency to provide home health services in California.. Medicare Certification. The certification issued by CMS following a state survey agency's determination that the agency meets the Medicare Conditions of Participation (42 CFR Part 484), authorizing the agency to participate in the Medicare program and receive Medicare reimbursement.. CMS Certification Number (CCN). The unique identification number. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Medi-Cal Provider Enrollment Maintenance. If the agency is enrolled as a Medi-Cal provider, maintain the enrollment in active status by complying with all California Department of Health Care Services (DHCS) enrollment requirements. The responsible role is Administrator; the stated timing is Continuous, if applicable.. Submit Medi-Cal re-enrollment or revalidation applications within the timeframes specified by DHCS. Track submission and processing status. The responsible role is Administrator; the stated timing is Per DHCS-specified timelines; no later than 60 calendar days before the revalidation deadline.. Report any changes affecting Medi-Cal enrollment to DHCS within the required timeframes, including changes to agency name, address, ownership, administrator, or service area. The responsible role. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to licensure, medicare certification, accreditation, and enrollment inventory. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "framed-blank-license-certificate-1-1", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 16, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for licensure, medicare certification, accreditation, and enrollment inventory." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for licensure, medicare certification, accreditation, and enrollment inventory. This decide option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "renewal-calendar-with-no-readable-writing-1-2", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 33, y: 68, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in licensure, medicare certification, accreditation, and enrollment inventory. This identify option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for licensure, medicare certification, accreditation, and enrollment inventory." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "survey-evidence-binder-1-3", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 76, y: 48, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for licensure, medicare certification, accreditation, and enrollment inventory." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during licensure, medicare certification, accreditation, and enrollment inventory.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for licensure, medicare certification, accreditation, and enrollment inventory." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for licensure, medicare certification, accreditation, and enrollment inventory. Identify the verified status, discrepancy, affected requirement, and accountable owner for licensure, medicare certification, accreditation, and enrollment inventory by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for licensure, medicare certification, accreditation, and enrollment inventory. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Renewal",
    title: "Renewal calendar, ownership, and evidence control",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for renewal calendar, ownership, and evidence control within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, Renewal Application Quality Control. Before submitting any renewal application, conduct a quality review to verify: (a) all required fields are completed; (b) all required supporting documentation is attached; (c) all fees are calculated correctly and payment is included; (d) the agency's name, address, license numbers, and other identifying information are accurate and consistent across all documents; (e) any attestations are signed by the appropriate authorized individual. The responsible role is Administrator; the stated timing is Before each renewal submission.. Maintain a pre-submission checklist (Appendix B) for each credential type to ensure consistent and complete renewal submissions. The responsible role is Administrator; the stated timing is Used for each renewal. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, APPENDICES. Appendix A — Agency Credential Register Care Indeed Home Health Care, Inc. Policy Reference: GV-EA-004 | Version: 1.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To maintain a centralized, continuously updated record of all agency-level credentials required for the lawful operation of Care Indeed Home Health Care, Inc. and its participation in federal and state healthcare programs. Instructions: The Administrator shall update this Register within 3 calendar days of any status change for any credential. The Register shall be reviewed monthly and presented to the Governing Body at each quarterly meeting. A copy shall be. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, California Home Health Agency License Maintenance. Maintain the agency's California home health agency license (HCAI License No. 406412878) in continuous active status. Monitor HCAI requirements for any changes to licensure standards, renewal procedures, or reporting obligations. The responsible role is Administrator; the stated timing is Continuous.. Submit the license renewal application to HCAI no later than 90 calendar days before the license expiration date, including all required documentation, fees, and attestations. Retain a complete copy of the renewal application in the credential file. The responsible role is Administrator; the stated timing is No later than 90 calendar days before expiration.. Track the renewal application status with HCAI. If no acknowledgment of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 7\\. Documentation Requirements. Agency Credential Register: Centralized register of all required credentials with status, dates, and renewal tracking (Appendix A).. Source or operational basis: Administrator. Current credential documents: Current, valid copies of all licenses, certifications, enrollments, and accreditations.. Source or operational basis: Administrator. Renewal applications: Complete copies of all renewal applications submitted, with supporting documentation and proof of submission.. Source or operational basis: Administrator. Renewal confirmation records: Acknowledgments, confirmation letters, and renewed credential documents received from issuing authorities.. Source or operational basis: Administrator. Regulatory correspondence: All incoming and outgoing correspondence with HCAI, CMS, state survey agency, MAC, DHCS, and accrediting bodies.. Source or operational basis: Administrator. Survey records. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall maintain current, valid, and uninterrupted licensure, certification, and enrollment with all applicable federal, state, and local regulatory authorities at all times as a condition of its legal authority to operate and to participate in federal and state healthcare programs. 4.2 The Administrator is directly accountable to the Governing Body for the maintenance and timely renewal of all agency credentials. No credential shall be allowed to lapse, expire, or become inactive without immediate corrective action and Governing Body notification. 4.3 The Administrator shall maintain a centralized Agency Credential Register (Appendix A) that documents every required agency-level credential, including. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to renewal calendar, ownership, and evidence control. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "renewal-calendar-with-no-readable-writing-2-1", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 18, y: 72, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in renewal calendar, ownership, and evidence control. This identify option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for renewal calendar, ownership, and evidence control." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during renewal calendar, ownership, and evidence control." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for renewal calendar, ownership, and evidence control." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "survey-evidence-binder-2-2", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 32, y: 38, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for renewal calendar, ownership, and evidence control." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during renewal calendar, ownership, and evidence control." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for renewal calendar, ownership, and evidence control." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "framed-blank-license-certificate-2-3", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for renewal calendar, ownership, and evidence control." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for renewal calendar, ownership, and evidence control. This decide option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during renewal calendar, ownership, and evidence control." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during renewal calendar, ownership, and evidence control.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for renewal calendar, ownership, and evidence control." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for renewal calendar, ownership, and evidence control. Identify the verified status, discrepancy, affected requirement, and accountable owner for renewal calendar, ownership, and evidence control by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for renewal calendar, ownership, and evidence control. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Reporta",
    title: "Reportable changes in ownership, leadership, location, and services",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for reportable changes in ownership, leadership, location, and services within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, OP-FM-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify: Evidence that the agency holds a current, valid state license. Surveyors will request a copy of the current California home health agency license and verify it is not expired. They will also verify that the license is displayed in the agency's principal office. An expired or suspended license is a threshold finding that may terminate the survey process and trigger immediate CMS notification. Evidence that the agency's Medicare certification is in good standing. Surveyors will verify the CCN and cross-reference the agency's PECOS enrollment status. Any discrepancy between. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, California Home Health Agency License Maintenance. Maintain the agency's California home health agency license (HCAI License No. 406412878) in continuous active status. Monitor HCAI requirements for any changes to licensure standards, renewal procedures, or reporting obligations. The responsible role is Administrator; the stated timing is Continuous.. Submit the license renewal application to HCAI no later than 90 calendar days before the license expiration date, including all required documentation, fees, and attestations. Retain a complete copy of the renewal application in the credential file. The responsible role is Administrator; the stated timing is No later than 90 calendar days before expiration.. Track the renewal application status with HCAI. If no acknowledgment of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 4\\. Compliance Monitoring. Indicator: Method. Source or operational basis: Standard. Branch CMS enrollment current: Annual verification. Source or operational basis: 100%. Branch inspections completed quarterly: Inspection records. Source or operational basis: 100%. Branch quality metrics reviewed quarterly: QAPI reports. Source or operational basis: 100%. Appendix A — Branch Office Registration & Compliance Tracker CARE INDEED HOME HEALTH CARE, INC. Branch Office Registration & Compliance Tracker Policy Reference: OP-FM-002 | Version: 6.0 Instructions: Maintain this tracker for all branch offices and satellite locations. Update within 7 calendar days of any change. This tracker must be readily available for CMS survey review. Branch Location: Address. Source or operational basis: CMS. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Medicare Certification Maintenance. Maintain the agency's Medicare certification in continuous active status by ensuring ongoing compliance with all CMS Conditions of Participation (42 CFR Part 484). Medicare certification does not have a fixed renewal date; it continues as long as the agency remains in compliance and is not terminated by CMS. The responsible role is Administrator; the stated timing is Continuous.. Maintain continuous survey readiness per policy CO-RA-003. Ensure that all clinical, operational, administrative, and governance systems are maintained in a state of compliance that would satisfy an unannounced CMS state agency survey at any time. The responsible role is Administrator / Compliance Officer; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Medi-Cal Provider Enrollment Maintenance. If the agency is enrolled as a Medi-Cal provider, maintain the enrollment in active status by complying with all California Department of Health Care Services (DHCS) enrollment requirements. The responsible role is Administrator; the stated timing is Continuous, if applicable.. Submit Medi-Cal re-enrollment or revalidation applications within the timeframes specified by DHCS. Track submission and processing status. The responsible role is Administrator; the stated timing is Per DHCS-specified timelines; no later than 60 calendar days before the revalidation deadline.. Report any changes affecting Medi-Cal enrollment to DHCS within the required timeframes, including changes to agency name, address, ownership, administrator, or service area. The responsible role. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to reportable changes in ownership, leadership, location, and services. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR Part 489" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "survey-evidence-binder-3-1", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 20, y: 45, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for reportable changes in ownership, leadership, location, and services." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during reportable changes in ownership, leadership, location, and services." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reportable changes in ownership, leadership, location, and services." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "framed-blank-license-certificate-3-2", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 42, y: 42, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for reportable changes in ownership, leadership, location, and services." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for reportable changes in ownership, leadership, location, and services. This decide option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during reportable changes in ownership, leadership, location, and services." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reportable changes in ownership, leadership, location, and services." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "renewal-calendar-with-no-readable-writing-3-3", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in reportable changes in ownership, leadership, location, and services. This identify option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for reportable changes in ownership, leadership, location, and services." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during reportable changes in ownership, leadership, location, and services." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during reportable changes in ownership, leadership, location, and services.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for reportable changes in ownership, leadership, location, and services." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for reportable changes in ownership, leadership, location, and services. Identify the verified status, discrepancy, affected requirement, and accountable owner for reportable changes in ownership, leadership, location, and services by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for reportable changes in ownership, leadership, location, and services. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Branch",
    title: "Branch, service-area, and scope-of-services controls",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for branch, service-area, and scope-of-services controls within Agency Licensure & Certification Management. Begin with the current controlled versions of OP-FM-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-FM-002, 4\\. Compliance Monitoring. Indicator: Method. Source or operational basis: Standard. Branch CMS enrollment current: Annual verification. Source or operational basis: 100%. Branch inspections completed quarterly: Inspection records. Source or operational basis: 100%. Branch quality metrics reviewed quarterly: QAPI reports. Source or operational basis: 100%. Appendix A — Branch Office Registration & Compliance Tracker CARE INDEED HOME HEALTH CARE, INC. Branch Office Registration & Compliance Tracker Policy Reference: OP-FM-002 | Version: 6.0 Instructions: Maintain this tracker for all branch offices and satellite locations. Update within 7 calendar days of any change. This tracker must be readily available for CMS survey review. Branch Location: Address. Source or operational basis: CMS. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 3\\. Procedures. Before establishing a branch office: (a) submit CMS-855A branch enrollment; (b) obtain state licensure if required; (c) establish staffing, space, and operational readiness. The responsible role is Administrator; the stated timing is Prior to opening.. Assign a branch coordinator or designee responsible for day-to-day operations of each branch location. The branch coordinator reports to the Operations Director. The responsible role is Operations Director; the stated timing is At opening.. Conduct a site inspection of each branch office quarterly using the Facility Safety Inspection Checklist (OP-FM-001 Appendix A). The responsible role is Operations Director; the stated timing is Quarterly.. Include all branch locations in the internal. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 2\\. Policy Statements. 2.1 Any branch office or satellite location operated by the agency shall be: (a) properly enrolled with CMS; (b) licensed by the California Department of Health Care Access and Information (HCAI) if required; (c) operated under the direct supervision of the parent agency's administration. 2.2 All policies applicable to the parent agency apply equally to all branch offices. 2.3 The parent agency shall maintain direct oversight of all clinical, operational, and compliance functions of branch offices. 2.4 Quality indicators and compliance metrics shall be monitored for each branch location separately and in aggregate.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 1\\. Purpose. This policy establishes standards for the operation and oversight of any branch offices or satellite locations operated by Care Indeed Home Health Care, Inc. Branch offices and sub-units must maintain the same standards of care, compliance, and documentation as the parent agency per 42 CFR § 484.105 and CMS enrollment requirements.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, Policy Header. Policy ID. OP-FM-002. Title. Branch Office & Satellite Operations. Domain. OP — Operations. Subdomain. FM — Facility & Administration. Version. 6.0. Effective Date. 2025-07-10. Classification Tier. RECOMMENDED. Status. ACTIVE. Review Cycle. Biennial. Access Tier. Tier 1 — Public. Policy Owner/Steward. Operations Director.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to branch, service-area, and scope-of-services controls. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR Part 489" },
      { kind: "External Authority", text: "42 CFR § 489.13" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "framed-blank-license-certificate-4-1", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for branch, service-area, and scope-of-services controls." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for branch, service-area, and scope-of-services controls. This decide option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during branch, service-area, and scope-of-services controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for branch, service-area, and scope-of-services controls." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "renewal-calendar-with-no-readable-writing-4-2", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 31, y: 76, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in branch, service-area, and scope-of-services controls. This identify option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for branch, service-area, and scope-of-services controls." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during branch, service-area, and scope-of-services controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for branch, service-area, and scope-of-services controls." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "survey-evidence-binder-4-3", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 84, y: 51, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for branch, service-area, and scope-of-services controls." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during branch, service-area, and scope-of-services controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during branch, service-area, and scope-of-services controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for branch, service-area, and scope-of-services controls." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for branch, service-area, and scope-of-services controls. Identify the verified status, discrepancy, affected requirement, and accountable owner for branch, service-area, and scope-of-services controls by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for branch, service-area, and scope-of-services controls. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Deficie",
    title: "Deficiency, plan-of-correction, and reinspection workflow",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for deficiency, plan-of-correction, and reinspection workflow within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, CO-RA-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, 2\\. Purpose. This policy establishes the requirements for maintaining continuous, uninterrupted licensure, Medicare certification, Medicaid enrollment, and any applicable accreditation credentials for Care Indeed Home Health Care, Inc. The agency's legal authority to operate and to receive reimbursement from federal and state healthcare programs depends entirely on the currency and validity of these credentials. A lapse in any required license or certification — even for a single day — may result in termination of the agency's Medicare provider agreement, loss of reimbursement, state enforcement action, inability to admit new patients, and potential Condition-level deficiency under 42 CFR § 484.100. This policy ensures that all required credentials are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Common Failure Points. Failure Point: Risk. Source or operational basis: Mitigation. Renewal application submitted late or not at all.: Credential lapse; loss of legal authority to operate; loss of Medicare reimbursement; potential agency closure.. Source or operational basis: 90-day advance renewal submission requirement per Section 4.4; monthly Credential Register review per Section 6.1.2; Compliance Officer monitoring per Section 6.2.6.. License displayed in the office is expired.: State survey citation; public perception of non-compliance.. Source or operational basis: Update display within 3 calendar days of receiving renewed license per Section 6.7.1.. Changes not reported to CMS or HCAI within required timeframes.: Survey deficiency; potential administrative action; Medicare enrollment discrepancy... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-005, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. (HCAI License No. 406412878) shall maintain current, valid California home health agency licensure at all times. 4.2 The Administrator shall ensure all state licensure renewal requirements are completed no fewer than 90 calendar days before license expiration. 4.3 The agency shall comply with all California state regulations governing home health agency operations including staffing requirements, supervision standards, patient rights, and reporting obligations. 4.4 Any state licensure deficiency, citation, or enforcement action shall be reported to the Governing Body within 24 hours and addressed per CO-RA-007. 4.5 The Compliance Officer shall monitor California HCAI regulatory changes per CO-RA-001 and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-005, 5\\. Definitions. HCAI. California Health Care Access and Information — the state agency responsible for home health agency licensure.. State Licensure. The legal authorization granted by the State of California to operate as a home health agency.. Licensure Renewal. The periodic process of submitting required documentation and fees to maintain an active state license.. Deficiency Plan of Correction. The agency's written response to state licensure survey deficiencies... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-RA-005, State Survey Response. Upon receipt of state survey findings: notify Governing Body within 24 hours. Follow CO-RA-003 Section 6.4 for response protocol. The responsible role is Administrator; the stated timing is Within 24 hours.. Develop Deficiency Plan of Correction within state-required timeframe. The responsible role is Compliance Officer; the stated timing is Per state deadline... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to deficiency, plan-of-correction, and reinspection workflow. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR § 489.13" },
      { kind: "External Authority", text: "42 CFR § 489.52" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "renewal-calendar-with-no-readable-writing-5-1", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 14, y: 67, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in deficiency, plan-of-correction, and reinspection workflow. This identify option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency, plan-of-correction, and reinspection workflow." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency, plan-of-correction, and reinspection workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency, plan-of-correction, and reinspection workflow." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "survey-evidence-binder-5-2", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 33, y: 52, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency, plan-of-correction, and reinspection workflow." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency, plan-of-correction, and reinspection workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency, plan-of-correction, and reinspection workflow." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "framed-blank-license-certificate-5-3", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 73, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for deficiency, plan-of-correction, and reinspection workflow." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for deficiency, plan-of-correction, and reinspection workflow. This decide option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during deficiency, plan-of-correction, and reinspection workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during deficiency, plan-of-correction, and reinspection workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency, plan-of-correction, and reinspection workflow." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for deficiency, plan-of-correction, and reinspection workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for deficiency, plan-of-correction, and reinspection workflow by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for deficiency, plan-of-correction, and reinspection workflow. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Prevent",
    title: "Preventing lapse, unauthorized operation, and outdated postings",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for preventing lapse, unauthorized operation, and outdated postings within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, OP-FM-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, Escalation and Exception Handling. A renewal application has not been submitted by the 90-day deadline.: Compliance Officer notifies the Administrator in writing and the Governing Body Chair.. Source or operational basis: Administrator submits the renewal application immediately. If the credential is at risk of lapse, engage legal counsel per GV-EA-003 and the issuing authority to explore expedited processing. Governing Body notified at the next meeting or via special notification.. A credential expires before the renewal is processed (lapse occurs).: Administrator notifies the Governing Body Chair and Compliance Officer immediately.. Source or operational basis: Administrator contacts the issuing authority immediately to determine: (a) whether the agency may continue to operate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 3\\. Procedures. Before establishing a branch office: (a) submit CMS-855A branch enrollment; (b) obtain state licensure if required; (c) establish staffing, space, and operational readiness. The responsible role is Administrator; the stated timing is Prior to opening.. Assign a branch coordinator or designee responsible for day-to-day operations of each branch location. The branch coordinator reports to the Operations Director. The responsible role is Operations Director; the stated timing is At opening.. Conduct a site inspection of each branch office quarterly using the Facility Safety Inspection Checklist (OP-FM-001 Appendix A). The responsible role is Operations Director; the stated timing is Quarterly.. Include all branch locations in the internal. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-002, 4\\. Compliance Monitoring. Indicator: Method. Source or operational basis: Standard. Branch CMS enrollment current: Annual verification. Source or operational basis: 100%. Branch inspections completed quarterly: Inspection records. Source or operational basis: 100%. Branch quality metrics reviewed quarterly: QAPI reports. Source or operational basis: 100%. Appendix A — Branch Office Registration & Compliance Tracker CARE INDEED HOME HEALTH CARE, INC. Branch Office Registration & Compliance Tracker Policy Reference: OP-FM-002 | Version: 6.0 Instructions: Maintain this tracker for all branch offices and satellite locations. Update within 7 calendar days of any change. This tracker must be readily available for CMS survey review. Branch Location: Address. Source or operational basis: CMS. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 5\\. Definitions. Agency Credential. Any license, certification, enrollment, accreditation, permit, or registration required by a federal, state, or local authority for the agency to operate lawfully and participate in healthcare programs.. California Home Health Agency License. The license issued by the California Department of Health Care Access and Information (HCAI) authorizing the agency to provide home health services in California.. Medicare Certification. The certification issued by CMS following a state survey agency's determination that the agency meets the Medicare Conditions of Participation (42 CFR Part 484), authorizing the agency to participate in the Medicare program and receive Medicare reimbursement.. CMS Certification Number (CCN). The unique identification number. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 6\\. Procedures. 1: Administrator. Source or operational basis: Review policy requirements and confirm role-based responsibilities for GV-EA-004.. 2: Assigned Staff. Source or operational basis: Execute agency licensure & certification maintenance activities using approved tools, forms, and documentation standards.. 3: Compliance Officer / Designee. Source or operational basis: Audit completion, remediate variances, and document corrective actions in the compliance log... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to preventing lapse, unauthorized operation, and outdated postings. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR § 489.52" },
      { kind: "External Authority", text: "42 CFR § 424.510" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "survey-evidence-binder-6-1", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for preventing lapse, unauthorized operation, and outdated postings." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during preventing lapse, unauthorized operation, and outdated postings." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for preventing lapse, unauthorized operation, and outdated postings." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "framed-blank-license-certificate-6-2", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 33, y: 59, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for preventing lapse, unauthorized operation, and outdated postings." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for preventing lapse, unauthorized operation, and outdated postings. This decide option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during preventing lapse, unauthorized operation, and outdated postings." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for preventing lapse, unauthorized operation, and outdated postings." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "renewal-calendar-with-no-readable-writing-6-3", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in preventing lapse, unauthorized operation, and outdated postings. This identify option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for preventing lapse, unauthorized operation, and outdated postings." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during preventing lapse, unauthorized operation, and outdated postings." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during preventing lapse, unauthorized operation, and outdated postings.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for preventing lapse, unauthorized operation, and outdated postings." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for preventing lapse, unauthorized operation, and outdated postings. Identify the verified status, discrepancy, affected requirement, and accountable owner for preventing lapse, unauthorized operation, and outdated postings by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for preventing lapse, unauthorized operation, and outdated postings. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Continu",
    title: "Continuous status dashboard and governing body reporting",
    subtitle: "Agency Licensure & Certification Management",
    narration: [
      "This lesson develops administrator judgment for continuous status dashboard and governing body reporting within Agency Licensure & Certification Management. Begin with the current controlled versions of GV-EA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-004, Escalation and Exception Handling. A renewal application has not been submitted by the 90-day deadline.: Compliance Officer notifies the Administrator in writing and the Governing Body Chair.. Source or operational basis: Administrator submits the renewal application immediately. If the credential is at risk of lapse, engage legal counsel per GV-EA-003 and the issuing authority to explore expedited processing. Governing Body notified at the next meeting or via special notification.. A credential expires before the renewal is processed (lapse occurs).: Administrator notifies the Governing Body Chair and Compliance Officer immediately.. Source or operational basis: Administrator contacts the issuing authority immediately to determine: (a) whether the agency may continue to operate. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, APPENDICES. Appendix A — Agency Credential Register Care Indeed Home Health Care, Inc. Policy Reference: GV-EA-004 | Version: 1.0 | Date: 2025-07-10 Address: 890 Santa Cruz Ave, Menlo Park, CA 94025 | Phone: (408) 728-6020 Purpose: To maintain a centralized, continuously updated record of all agency-level credentials required for the lawful operation of Care Indeed Home Health Care, Inc. and its participation in federal and state healthcare programs. Instructions: The Administrator shall update this Register within 3 calendar days of any status change for any credential. The Register shall be reviewed monthly and presented to the Governing Body at each quarterly meeting. A copy shall be. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 7\\. Documentation Requirements. Agency Credential Register: Centralized register of all required credentials with status, dates, and renewal tracking (Appendix A).. Source or operational basis: Administrator. Current credential documents: Current, valid copies of all licenses, certifications, enrollments, and accreditations.. Source or operational basis: Administrator. Renewal applications: Complete copies of all renewal applications submitted, with supporting documentation and proof of submission.. Source or operational basis: Administrator. Renewal confirmation records: Acknowledgments, confirmation letters, and renewed credential documents received from issuing authorities.. Source or operational basis: Administrator. Regulatory correspondence: All incoming and outgoing correspondence with HCAI, CMS, state survey agency, MAC, DHCS, and accrediting bodies.. Source or operational basis: Administrator. Survey records. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall maintain current, valid, and uninterrupted licensure, certification, and enrollment with all applicable federal, state, and local regulatory authorities at all times as a condition of its legal authority to operate and to participate in federal and state healthcare programs. 4.2 The Administrator is directly accountable to the Governing Body for the maintenance and timely renewal of all agency credentials. No credential shall be allowed to lapse, expire, or become inactive without immediate corrective action and Governing Body notification. 4.3 The Administrator shall maintain a centralized Agency Credential Register (Appendix A) that documents every required agency-level credential, including. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-004, Medicare Certification Maintenance. Maintain the agency's Medicare certification in continuous active status by ensuring ongoing compliance with all CMS Conditions of Participation (42 CFR Part 484). Medicare certification does not have a fixed renewal date; it continues as long as the agency remains in compliance and is not terminated by CMS. The responsible role is Administrator; the stated timing is Continuous.. Maintain continuous survey readiness per policy CO-RA-003. Ensure that all clinical, operational, administrative, and governance systems are maintained in a state of compliance that would satisfy an unannounced CMS state agency survey at any time. The responsible role is Administrator / Compliance Officer; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to continuous status dashboard and governing body reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "framed blank license certificate", detail: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "renewal calendar with no readable writing", detail: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "survey evidence binder", detail: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "OP-FM-002" },
      { kind: "External Authority", text: "42 CFR § 424.510" },
      { kind: "External Authority", text: "42 CFR §484.100" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "framed-blank-license-certificate-7-1", label: "framed blank license certificate", shortLabel: "framed blank license certifica", ariaLabel: "Investigate framed blank license certificate",
        x: 14, y: 76, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat framed blank license certificate as complete proof without comparing renewal calendar with no readable writing or the controlled source. This identify option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous status dashboard and governing body reporting." },
          { id: "i3", label: "Classify the framed blank license certificate by department custom even though its authority and current status are unverified. This identify option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about framed blank license certificate." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve framed blank license certificate on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for framed blank license certificate is resolved." },
          { id: "d3", label: "Send framed blank license certificate to an unrelated department rather than the policy owner responsible for continuous status dashboard and governing body reporting. This decide option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous status dashboard and governing body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that framed blank license certificate was reviewed, without source version, finding, decision, owner, or status. This document option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of framed blank license certificate." },
          { id: "doc3", label: "Keep the framed blank license certificate decision in personal notes rather than the governed evidence location. This document option concerns framed blank license certificate during continuous status dashboard and governing body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous status dashboard and governing body reporting." },
        ],
        feedback: {
          observed: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
          meaning: "Observe the real framed blank license certificate in the photographed scene. Compare it with the renewal calendar with no readable writing, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For framed blank license certificate, compare the visible evidence with renewal calendar with no readable writing and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to framed blank license certificate; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For framed blank license certificate, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "renewal-calendar-with-no-readable-writing-7-2", label: "renewal calendar with no readable writing", shortLabel: "renewal calendar with no reada", ariaLabel: "Investigate renewal calendar with no readable writing",
        x: 39, y: 68, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume renewal calendar with no readable writing applies to every role, location, and exception described in continuous status dashboard and governing body reporting. This identify option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous status dashboard and governing body reporting." },
          { id: "i3", label: "Use the oldest available renewal calendar with no readable writing because prior approval is easier to confirm. This identify option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about renewal calendar with no readable writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in renewal calendar with no readable writing remains unresolved. This decide option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for renewal calendar with no readable writing is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to renewal calendar with no readable writing. This decide option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous status dashboard and governing body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark renewal calendar with no readable writing closed on assignment, before completion and effectiveness evidence exist. This document option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of renewal calendar with no readable writing." },
          { id: "doc3", label: "Retain only a summary of renewal calendar with no readable writing and discard the source artifact needed to reconstruct the decision. This document option concerns renewal calendar with no readable writing during continuous status dashboard and governing body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous status dashboard and governing body reporting." },
        ],
        feedback: {
          observed: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
          meaning: "Observe the real renewal calendar with no readable writing in the photographed scene. Compare it with the survey evidence binder, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For renewal calendar with no readable writing, compare the visible evidence with survey evidence binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to renewal calendar with no readable writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For renewal calendar with no readable writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
      {
        id: "survey-evidence-binder-7-3", label: "survey evidence binder", shortLabel: "survey evidence binder", ariaLabel: "Investigate survey evidence binder",
        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status." },
          { id: "i2", label: "Read survey evidence binder only for favorable indicators and omit the exception evidence connected to framed blank license certificate. This identify option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for continuous status dashboard and governing body reporting." },
          { id: "i3", label: "Treat an unsigned or unverified survey evidence binder as equivalent to the current controlled record. This identify option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about survey evidence binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close survey evidence binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for survey evidence binder is resolved." },
          { id: "d3", label: "Defer the survey evidence binder decision to a routine future cycle even though current operations depend on it. This decide option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during continuous status dashboard and governing body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For survey evidence binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for survey evidence binder but omit the actual evidence, communications, and unresolved items. This document option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of survey evidence binder." },
          { id: "doc3", label: "Combine survey evidence binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns survey evidence binder during continuous status dashboard and governing body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for continuous status dashboard and governing body reporting." },
        ],
        feedback: {
          observed: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting.",
          meaning: "Observe the real survey evidence binder in the photographed scene. Compare it with the framed blank license certificate, current controlled sources, assigned decision rights, and corroborating records for continuous status dashboard and governing body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for continuous status dashboard and governing body reporting by reconciling all three photographed evidence objects with the current controlled source. For survey evidence binder, compare the visible evidence with framed blank license certificate and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. Apply that decision specifically to survey evidence binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for continuous status dashboard and governing body reporting. For survey evidence binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-004","CO-RA-005","OP-FM-002","42 CFR § 484.100","42 CFR Part 484","42 CFR § 484.105","42 CFR Part 489","42 CFR § 489.13","42 CFR § 489.52","42 CFR § 424.510","42 CFR §484.100"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During licensure, medicare certification, accreditation, and enrollment inventory, the survey evidence binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat survey evidence binder as final approval because the artifact exists during licensure, medicare certification, accreditation, and enrollment inventory.",
      "Send survey evidence binder to an unrelated department rather than the policy owner responsible for licensure, medicare certification, accreditation, and enrollment inventory. This option concerns licensure, medicare certification, accreditation, and enrollment inventory.",
      "Approve survey evidence binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns licensure, medicare certification, accreditation, and enrollment inventory.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in licensure, medicare certification, accreditation, and enrollment inventory. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 2,
    stem: "During renewal calendar, ownership, and evidence control, the framed blank license certificate evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control.",
      "Treat framed blank license certificate as final approval because the artifact exists during renewal calendar, ownership, and evidence control.",
      "Replace the controlling requirement with an informal local workaround tailored to framed blank license certificate. This option concerns renewal calendar, ownership, and evidence control.",
      "Allow the affected activity to expand while the exception in framed blank license certificate remains unresolved. This option concerns renewal calendar, ownership, and evidence control.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in renewal calendar, ownership, and evidence control. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 3,
    stem: "During reportable changes in ownership, leadership, location, and services, the renewal calendar with no readable writing evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat renewal calendar with no readable writing as final approval because the artifact exists during reportable changes in ownership, leadership, location, and services.",
      "Close renewal calendar with no readable writing when work is submitted, without testing whether the correction changed the intended outcome. This option concerns reportable changes in ownership, leadership, location, and services.",
      "Defer the renewal calendar with no readable writing decision to a routine future cycle even though current operations depend on it. This option concerns reportable changes in ownership, leadership, location, and services.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in reportable changes in ownership, leadership, location, and services. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 4,
    stem: "During branch, service-area, and scope-of-services controls, the survey evidence binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve survey evidence binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns branch, service-area, and scope-of-services controls.",
      "Send survey evidence binder to an unrelated department rather than the policy owner responsible for branch, service-area, and scope-of-services controls. This option concerns branch, service-area, and scope-of-services controls.",
      "Treat survey evidence binder as final approval because the artifact exists during branch, service-area, and scope-of-services controls.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in branch, service-area, and scope-of-services controls. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 5,
    stem: "During deficiency, plan-of-correction, and reinspection workflow, the framed blank license certificate evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in framed blank license certificate remains unresolved. This option concerns deficiency, plan-of-correction, and reinspection workflow.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow.",
      "Treat framed blank license certificate as final approval because the artifact exists during deficiency, plan-of-correction, and reinspection workflow.",
      "Replace the controlling requirement with an informal local workaround tailored to framed blank license certificate. This option concerns deficiency, plan-of-correction, and reinspection workflow.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in deficiency, plan-of-correction, and reinspection workflow. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 6,
    stem: "During preventing lapse, unauthorized operation, and outdated postings, the renewal calendar with no readable writing evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close renewal calendar with no readable writing when work is submitted, without testing whether the correction changed the intended outcome. This option concerns preventing lapse, unauthorized operation, and outdated postings.",
      "Defer the renewal calendar with no readable writing decision to a routine future cycle even though current operations depend on it. This option concerns preventing lapse, unauthorized operation, and outdated postings.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings.",
      "Treat renewal calendar with no readable writing as final approval because the artifact exists during preventing lapse, unauthorized operation, and outdated postings.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in preventing lapse, unauthorized operation, and outdated postings. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 7,
    stem: "During continuous status dashboard and governing body reporting, the survey evidence binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve survey evidence binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns continuous status dashboard and governing body reporting.",
      "Send survey evidence binder to an unrelated department rather than the policy owner responsible for continuous status dashboard and governing body reporting. This option concerns continuous status dashboard and governing body reporting.",
      "Treat survey evidence binder as final approval because the artifact exists during continuous status dashboard and governing body reporting.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in continuous status dashboard and governing body reporting. The decision remains traceable to GV-EA-004, CO-RA-005, OP-FM-002.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.100 be used within Agency Licensure & Certification Management?",
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
    stem: "What links renewal calendar with no readable writing and renewal calendar with no readable writing into an accountable Agency Licensure & Certification Management control?",
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
    stem: "What does successful completion of Agency Licensure & Certification Management establish?",
    options: [
      "Automatic appointment authority for every decision described in Agency Licensure & Certification Management.",
      "Permission to replace the controlled policies with the Agency Licensure & Certification Management quiz result.",
      "Observed operational competency without an authorized evaluator.",
      "Knowledge of the controlled administrator concepts in Agency Licensure & Certification Management, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
    ],
    correct: 3,
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





const STORAGE_KEY = 'adm-003-progress-v6000';



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



export default function ADM003() {

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

          <span className="brand-text">ADM-003 — Licensure</span>

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
