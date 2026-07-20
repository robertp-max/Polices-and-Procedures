/**
 * ADM-012 — Community Relations & Referral Compliance
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

import img01 from './assets/adm-012/adm-012-lesson-01.png';
import img02 from './assets/adm-012/adm-012-lesson-02.png';
import img03 from './assets/adm-012/adm-012-lesson-03.png';
import img04 from './assets/adm-012/adm-012-lesson-04.png';
import img05 from './assets/adm-012/adm-012-lesson-05.png';
import img06 from './assets/adm-012/adm-012-lesson-06.png';
import img07 from './assets/adm-012/adm-012-lesson-07.png';



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



const MODULE_META = { id: "ADM-012", title: "Community Relations & Referral Compliance", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Community relations aligned with mission, capability, and service area, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Ethical referral-source engagement and patient choice, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Referral intake, eligibility, capacity, and timely clinical screening, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for No inducements, steering, quid pro quo, or misleading claims, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Interagency agreements, transfer communication, and accountability, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Complaint, conflict, and inappropriate referral escalation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Outreach/referral audit trail and governing-body reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Communi",
    title: "Community relations aligned with mission, capability, and service area",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for community relations aligned with mission, capability, and service area within Community Relations & Referral Compliance. Begin with the current controlled versions of OP-IM-001, CL-CP-007, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-IM-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Intake Clinical Screening Form CARE INDEED HOME HEALTH CARE, INC. Intake Clinical Screening Form Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Referral Declination. Document the specific reason for declining the referral on the Referral Declination Form (Appendix B). Acceptable reasons include: (a) patient outside service area; (b) agency lacks clinical competency or licensure for required services; (c) insufficient staffing to safely provide services; (d) patient does not meet home health eligibility criteria; (e) no valid physician order obtainable; (f) patient/family declines services. Non-acceptable reasons: diagnosis type, payer source (except non-contracted Medicaid managed care with documented non-participation), race, ethnicity, gender, age, disability, or socioeconomic status. The responsible role is Intake RN / Clinical Manager; the stated timing is At the time of declination decision.. Notify the referral source of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, Emergency Department Visits Without Admission. When the agency becomes aware that a patient has visited the emergency department but was not admitted as an inpatient, document the ED visit in the clinical record including: date, reason, facility, and outcome. The responsible role is Assigned RN; the stated timing is Within 24 hours of becoming aware.. Contact the patient within 24 hours of the ED visit to assess the patient's current status, obtain the ED discharge instructions, and perform a medication reconciliation if medications were changed. The responsible role is Assigned RN; the stated timing is Within 24 hours of becoming aware of the ED visit.. Assess whether the ED visit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 3\\. Definitions. Referral. A communication from a physician, hospital, skilled nursing facility, patient/family, or other source requesting home health services for a patient.. Intake. The administrative and clinical screening process that evaluates a referral for appropriateness, eligibility, and agency capacity prior to acceptance or denial.. Referral Source. Any individual or entity that initiates a referral, including physicians, discharge planners, case managers, patients, family members, and community organizations.. Clinical Eligibility Screening. The clinical review of referral information to determine whether the patient meets criteria for home health services including homebound status, skilled need, and medical necessity.. Intake Coordinator. The designated staff member responsible for receiving, logging, screening, and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 5\\. Definitions. Transfer to Inpatient Facility. A patient move from home health services to an inpatient setting (hospital, SNF, IRF, LTACH) where the patient is admitted as an inpatient. For OASIS and billing purposes, this is distinct from an ED visit that does not result in inpatient admission.. Resumption of Care (ROC). The first billable visit following a patient's return to home health after an inpatient facility stay. ROC requires a new comprehensive assessment and OASIS completion.. Transfer OASIS. The OASIS assessment completed at the time a patient is transferred to an inpatient facility, documenting the patient's clinical and functional status at the time of transfer.. Warm. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to community relations aligned with mission, capability, and service area. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "blank-community-outreach-brochure-1-1", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 24, y: 38, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for community relations aligned with mission, capability, and service area." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for community relations aligned with mission, capability, and service area. This decide option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during community relations aligned with mission, capability, and service area." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for community relations aligned with mission, capability, and service area." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "referral-intake-folder-1-2", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 34, y: 68, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in community relations aligned with mission, capability, and service area. This identify option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for community relations aligned with mission, capability, and service area." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during community relations aligned with mission, capability, and service area." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for community relations aligned with mission, capability, and service area." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "partnership-agreement-binder-1-3", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for community relations aligned with mission, capability, and service area." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during community relations aligned with mission, capability, and service area." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during community relations aligned with mission, capability, and service area.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for community relations aligned with mission, capability, and service area." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for community relations aligned with mission, capability, and service area. Identify the verified status, discrepancy, affected requirement, and accountable owner for community relations aligned with mission, capability, and service area by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for community relations aligned with mission, capability, and service area. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Ethical",
    title: "Ethical referral-source engagement and patient choice",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for ethical referral-source engagement and patient choice within Community Relations & Referral Compliance. Begin with the current controlled versions of CL-CP-007, OP-IM-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CL-CP-007, Transfer to Inpatient Facility. When a patient requires transfer to an inpatient facility — whether due to clinical deterioration, emergent medical need, physician order, or patient/caregiver request — immediately notify the attending physician (if the physician has not already ordered the transfer) and the Director of Nursing. If the transfer is emergent, call 911 first, then notify the physician and Director of Nursing. The responsible role is Assigned RN / Any Clinician; the stated timing is Immediately upon identification of transfer need; physician notification within 1 hour for non-emergent transfers.. Prepare the Clinical Transfer Summary (Appendix A) including all elements defined in Section 4.2. The summary shall be generated. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, Resumption of Care (ROC) Following Inpatient Stay. Upon notification that the patient has been discharged from the inpatient facility and is returning to home health services, schedule the ROC visit with the assigned RN within 48 hours of the patient's return home (or per physician order if sooner). The responsible role is Clinical Coordinator / Operations; the stated timing is ROC visit within 48 hours of return home.. Before the ROC visit, obtain the inpatient facility's discharge summary, discharge medication list, and any pending follow-up orders. If the discharge summary is not yet available, contact the facility directly and document the request. The responsible role is Assigned RN; the stated timing is. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 4\\. Policy Statement. 4.1 When a patient is transferred from home health to an inpatient facility, the agency shall ensure that: (a) the attending physician is notified and, where clinically appropriate, orders or approves the transfer; (b) a comprehensive clinical summary is prepared and transmitted to the receiving facility; (c) a warm handoff (direct clinician-to-clinician communication) occurs with the receiving care team; (d) the transfer OASIS assessment is completed within CMS-required timeframes; (e) the patient's medication list, active diagnoses, current plan of care, and advance directive status are communicated to the receiving facility; (f) the patient and caregiver are informed of the transfer and the reason for it.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 5\\. Definitions. Transfer to Inpatient Facility. A patient move from home health services to an inpatient setting (hospital, SNF, IRF, LTACH) where the patient is admitted as an inpatient. For OASIS and billing purposes, this is distinct from an ED visit that does not result in inpatient admission.. Resumption of Care (ROC). The first billable visit following a patient's return to home health after an inpatient facility stay. ROC requires a new comprehensive assessment and OASIS completion.. Transfer OASIS. The OASIS assessment completed at the time a patient is transferred to an inpatient facility, documenting the patient's clinical and functional status at the time of transfer.. Warm. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Intake Clinical Screening Form CARE INDEED HOME HEALTH CARE, INC. Intake Clinical Screening Form Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to ethical referral-source engagement and patient choice. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "referral-intake-folder-2-1", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 14, y: 60, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in ethical referral-source engagement and patient choice. This identify option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ethical referral-source engagement and patient choice." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ethical referral-source engagement and patient choice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ethical referral-source engagement and patient choice." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "partnership-agreement-binder-2-2", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 31, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ethical referral-source engagement and patient choice." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ethical referral-source engagement and patient choice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during ethical referral-source engagement and patient choice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ethical referral-source engagement and patient choice." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "blank-community-outreach-brochure-2-3", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ethical referral-source engagement and patient choice." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for ethical referral-source engagement and patient choice. This decide option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ethical referral-source engagement and patient choice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during ethical referral-source engagement and patient choice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ethical referral-source engagement and patient choice." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for ethical referral-source engagement and patient choice. Identify the verified status, discrepancy, affected requirement, and accountable owner for ethical referral-source engagement and patient choice by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ethical referral-source engagement and patient choice. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Referra",
    title: "Referral intake, eligibility, capacity, and timely clinical screening",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for referral intake, eligibility, capacity, and timely clinical screening within Community Relations & Referral Compliance. Begin with the current controlled versions of OP-IM-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-IM-001, Intake Screening — Clinical Eligibility. Perform clinical eligibility screening based on referral information. Evaluate: (a) homebound status indicators; (b) skilled nursing or therapy need; (c) medical necessity for home health services; (d) physician willingness to certify/order services; (e) patient/caregiver willingness to participate; (f) safety of the home environment (based on available information). The responsible role is Intake RN / Clinical Manager; the stated timing is Within 4 hours (Urgent) / 24 hours (Routine).. If clinical eligibility cannot be determined from referral documents alone, contact the referral source or physician office to obtain additional clinical information. Document all outreach attempts and outcomes. The responsible role is Intake RN / Clinical Manager. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Referral Receipt and Logging. Receive referral via any approved channel (fax, electronic referral, phone, secure portal, walk-in). Log immediately in the referral tracking system with: (a) unique referral number; (b) date and time of receipt; (c) referral source name, title, organization, and contact information; (d) patient name, date of birth, and contact information; (e) referring physician name and NPI; (f) primary diagnosis and reason for referral; (g) urgency level (Urgent / Routine). The responsible role is Intake Coordinator; the stated timing is At time of receipt.. Assign urgency classification: URGENT — patient has immediate clinical need, same-day or next-day SOC required (e.g., post-surgical, wound vac, IV therapy, fall risk). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Intake Clinical Screening Form CARE INDEED HOME HEALTH CARE, INC. Intake Clinical Screening Form Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 6\\. Documentation Requirements. Referral log entry: Referral tracking system entry with all required data points per 5.1.1. Source or operational basis: Intake Coordinator. Clinical screening: Intake Clinical Screening Form (Appendix A). Source or operational basis: Intake RN. Payer verification: Insurance verification documentation. Source or operational basis: Intake Coordinator. Acceptance notification: Written notification to referral source. Source or operational basis: Intake Coordinator. Patient notification: Documentation of patient/family notification. Source or operational basis: Intake Coordinator. Declination documentation: Referral Declination Form (Appendix B). Source or operational basis: Intake RN / Clinical Manager. Declination notification: Written notification to referral source with alternatives. Source or operational basis: Intake Coordinator. Pending referral follow-up: Documented. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Intake Screening — Administrative. Verify patient resides within the agency's defined service area per OP-IM-003. If outside the service area, proceed to Section 5.6 (Declination). The responsible role is Intake Coordinator; the stated timing is Within 2 hours (Urgent) / 8 hours (Routine).. Verify insurance/payer information: (a) confirm active coverage; (b) verify home health benefit eligibility; (c) identify prior authorization requirements; (d) confirm Medicare beneficiary status if applicable; (e) document verification results in the referral record. The responsible role is Intake Coordinator; the stated timing is Within 4 hours (Urgent) / 24 hours (Routine).. Collect and verify all required referral documentation: (a) physician face-to-face encounter documentation (if available); (b). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to referral intake, eligibility, capacity, and timely clinical screening. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "partnership-agreement-binder-3-1", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 14, y: 60, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral intake, eligibility, capacity, and timely clinical screening." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "blank-community-outreach-brochure-3-2", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 54, y: 72, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral intake, eligibility, capacity, and timely clinical screening." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for referral intake, eligibility, capacity, and timely clinical screening. This decide option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "referral-intake-folder-3-3", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 74, y: 42, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in referral intake, eligibility, capacity, and timely clinical screening. This identify option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral intake, eligibility, capacity, and timely clinical screening." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during referral intake, eligibility, capacity, and timely clinical screening.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral intake, eligibility, capacity, and timely clinical screening." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for referral intake, eligibility, capacity, and timely clinical screening. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral intake, eligibility, capacity, and timely clinical screening by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral intake, eligibility, capacity, and timely clinical screening. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 No",
    title: "No inducements, steering, quid pro quo, or misleading claims",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for no inducements, steering, quid pro quo, or misleading claims within Community Relations & Referral Compliance. Begin with the current controlled versions of CO-CP-001, GV-EA-001, OP-IM-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-CP-001, 5\\. Definitions. Corporate Compliance Program. The formal, structured system of policies, procedures, oversight mechanisms, training, and accountability structures designed to prevent, detect, and correct violations of law, regulation, or ethical standards.. Compliance Officer. The individual designated by the Governing Body with authority and independence to operate the Corporate Compliance Program, per policy CO-CP-002.. Compliance Committee. The multi-disciplinary body chaired by the Compliance Officer that provides operational oversight of the Program, per policy CO-CP-003.. OIG. Office of Inspector General of the U.S. Department of Health and Human Services — the federal body responsible for combating fraud, waste, and abuse in federal health care programs.. LEIE. List of Excluded. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Common Failure Points. Failure Point: Risk. Source or operational basis: Mitigation. PHI-accessing vendor engaged without BAA.: HIPAA breach; regulatory citation; OIG investigation risk.. Source or operational basis: BAA checklist in Contract Request Form; Compliance Officer review required before PHI access.. Excluded contractor not identified before services begin.: False Claims Act exposure; Medicare exclusion violation.. Source or operational basis: Pre-engagement OIG/SAM screening mandatory per Section 6.3.4.. Material contracts not presented to Governing Body.: Governing Body fails oversight obligation; undocumented financial and legal risk.. Source or operational basis: Contract approval matrix enforced; Administrator accountable for routing per Section 6.2.. Contracts auto-renew without review.: Unfavorable terms perpetuated; performance deficiencies unaddressed.. Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Internal Monitoring and Auditing. Develop and maintain an annual compliance audit work plan. The work plan shall prioritize: (a) billing and claims accuracy; (b) OASIS data integrity; (c) medical necessity documentation; (d) exclusion screening compliance; (e) policy acknowledgment rates; (f) fraud and abuse risk areas identified by OIG Work Plan. The responsible role is Compliance Officer; the stated timing is Approved at first Compliance Committee meeting of each calendar year.. Conduct or commission audits per the annual work plan and document all findings, methodology, sample sizes, and corrective actions, per policy CO-RA-002. The responsible role is Compliance Officer; the stated timing is Per audit work plan schedule.. Present audit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Policy Header. Policy ID. OP-IM-001. Title. Referral & Intake Management. Domain. OP — Operations. Subdomain. IM — Intake Management. Version. 6.0. Effective Date. 2025-07-10. Approved By. Governing Body Chair — Care Indeed Home Health Care, Inc.. Last Reviewed. 2025-07-10. Next Review Date. 2026-07-10. Supersedes. N/A (Initial Version). Classification Tier. REQUIRED. Status. ACTIVE. Review Cycle. Annual. Access Tier. Tier 2 — Restricted. Policy Owner/Steward. Operations Director.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 1\\. Purpose. This policy establishes standards for receiving, screening, processing, and managing patient referrals and intake activities at Care Indeed Home Health Care, Inc. The referral and intake process is the gateway to all home health services and must ensure timely, accurate, and compliant processing of every referral to support patient access, regulatory compliance, and continuity of care. This policy ensures the agency satisfies applicable requirements of 42 CFR § 484.105 (Organization and Administration), 42 CFR § 484.50 (Patient Rights — timely acceptance/notification), and 42 CFR § 484.55 (Comprehensive Assessment).. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to no inducements, steering, quid pro quo, or misleading claims. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "blank-community-outreach-brochure-4-1", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for no inducements, steering, quid pro quo, or misleading claims." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for no inducements, steering, quid pro quo, or misleading claims. This decide option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during no inducements, steering, quid pro quo, or misleading claims." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for no inducements, steering, quid pro quo, or misleading claims." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "referral-intake-folder-4-2", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 35, y: 49, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in no inducements, steering, quid pro quo, or misleading claims. This identify option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for no inducements, steering, quid pro quo, or misleading claims." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during no inducements, steering, quid pro quo, or misleading claims." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for no inducements, steering, quid pro quo, or misleading claims." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "partnership-agreement-binder-4-3", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for no inducements, steering, quid pro quo, or misleading claims." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during no inducements, steering, quid pro quo, or misleading claims." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during no inducements, steering, quid pro quo, or misleading claims.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for no inducements, steering, quid pro quo, or misleading claims." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for no inducements, steering, quid pro quo, or misleading claims. Identify the verified status, discrepancy, affected requirement, and accountable owner for no inducements, steering, quid pro quo, or misleading claims by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for no inducements, steering, quid pro quo, or misleading claims. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Interag",
    title: "Interagency agreements, transfer communication, and accountability",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for interagency agreements, transfer communication, and accountability within Community Relations & Referral Compliance. Begin with the current controlled versions of CL-CP-007, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CL-CP-007, Transfer to Inpatient Facility. When a patient requires transfer to an inpatient facility — whether due to clinical deterioration, emergent medical need, physician order, or patient/caregiver request — immediately notify the attending physician (if the physician has not already ordered the transfer) and the Director of Nursing. If the transfer is emergent, call 911 first, then notify the physician and Director of Nursing. The responsible role is Assigned RN / Any Clinician; the stated timing is Immediately upon identification of transfer need; physician notification within 1 hour for non-emergent transfers.. Prepare the Clinical Transfer Summary (Appendix A) including all elements defined in Section 4.2. The summary shall be generated. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, Transfer to Another Home Health Agency (Inter-Agency Transfer). When a patient is being transferred to another home health agency (due to relocation, patient preference, or service area limitations), coordinate with the receiving agency's clinical leadership to ensure a smooth transition. Obtain the patient's written consent (or verbal consent documented per CL-PR-003) to share clinical records with the receiving agency. The responsible role is Director of Nursing / Assigned RN; the stated timing is As soon as the transfer decision is made.. Prepare and transmit to the receiving agency: (a) a comprehensive clinical summary including current plan of care, medication list, active diagnoses, functional status, and current goals; (b) the most recent OASIS assessment. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 7\\. Documentation Requirements. Clinical Transfer Summary: Comprehensive summary per Section 4.2 (Appendix A). Source or operational basis: Assigned RN. Warm handoff documentation: Record of verbal communication with receiving provider. Source or operational basis: Assigned RN. Transfer OASIS: OASIS assessment at the time of transfer. Source or operational basis: Assigned RN. ROC comprehensive assessment: Full OASIS assessment at resumption of care. Source or operational basis: Assigned RN. Medication reconciliation at ROC: Medication Reconciliation Worksheet per CL-SD-013. Source or operational basis: Assigned RN. Updated plan of care at ROC: Plan of care reflecting post-facility status. Source or operational basis: Assigned RN. Physician notification: Documentation of physician contact regarding transfer. Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 9\\. References. 9.1 Federal Regulations 42 CFR § 484.60(c): Standard: Coordination of care. Source or operational basis: Requires coordination of services and communication with receiving providers at transfer. 42 CFR § 484.60(a): Standard: Plan of care. Source or operational basis: Plan of care must be updated at resumption of care following transfer. 42 CFR § 484.55: Condition of Participation: Comprehensive assessment. Source or operational basis: Comprehensive assessment required at ROC. 42 CFR § 484.110: Condition of Participation: Clinical records. Source or operational basis: Clinical record must document transfers and all associated clinical communications. 9.2 CMS Guidance Document. Relevance. CMS State Operations Manual, Appendix B. Survey guidance for. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CL-CP-007, 4\\. Policy Statement. 4.1 When a patient is transferred from home health to an inpatient facility, the agency shall ensure that: (a) the attending physician is notified and, where clinically appropriate, orders or approves the transfer; (b) a comprehensive clinical summary is prepared and transmitted to the receiving facility; (c) a warm handoff (direct clinician-to-clinician communication) occurs with the receiving care team; (d) the transfer OASIS assessment is completed within CMS-required timeframes; (e) the patient's medication list, active diagnoses, current plan of care, and advance directive status are communicated to the receiving facility; (f) the patient and caregiver are informed of the transfer and the reason for it.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to interagency agreements, transfer communication, and accountability. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR §484.55(a)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "referral-intake-folder-5-1", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 29, y: 41, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in interagency agreements, transfer communication, and accountability. This identify option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interagency agreements, transfer communication, and accountability." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interagency agreements, transfer communication, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interagency agreements, transfer communication, and accountability." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "partnership-agreement-binder-5-2", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 51, y: 71, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interagency agreements, transfer communication, and accountability." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interagency agreements, transfer communication, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interagency agreements, transfer communication, and accountability." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "blank-community-outreach-brochure-5-3", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 82, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for interagency agreements, transfer communication, and accountability." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for interagency agreements, transfer communication, and accountability. This decide option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during interagency agreements, transfer communication, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during interagency agreements, transfer communication, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interagency agreements, transfer communication, and accountability." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for interagency agreements, transfer communication, and accountability. Identify the verified status, discrepancy, affected requirement, and accountable owner for interagency agreements, transfer communication, and accountability by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for interagency agreements, transfer communication, and accountability. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Complai",
    title: "Complaint, conflict, and inappropriate referral escalation",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for complaint, conflict, and inappropriate referral escalation within Community Relations & Referral Compliance. Begin with the current controlled versions of OP-IM-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-IM-001, Referral Receipt and Logging. Receive referral via any approved channel (fax, electronic referral, phone, secure portal, walk-in). Log immediately in the referral tracking system with: (a) unique referral number; (b) date and time of receipt; (c) referral source name, title, organization, and contact information; (d) patient name, date of birth, and contact information; (e) referring physician name and NPI; (f) primary diagnosis and reason for referral; (g) urgency level (Urgent / Routine). The responsible role is Intake Coordinator; the stated timing is At time of receipt.. Assign urgency classification: URGENT — patient has immediate clinical need, same-day or next-day SOC required (e.g., post-surgical, wound vac, IV therapy, fall risk). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Intake Clinical Screening Form CARE INDEED HOME HEALTH CARE, INC. Intake Clinical Screening Form Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Referral Pending Management. If a referral cannot be accepted or declined within the standard timeframe due to missing information, pending physician orders, or payer verification delays, update status to PENDING with documented reason. The responsible role is Intake Coordinator; the stated timing is At the point the standard timeframe is exceeded.. Follow up on all pending items daily. Document each follow-up attempt including date, time, method, and outcome. The responsible role is Intake Coordinator; the stated timing is Daily until resolved; minimum 1 documented attempt per business day.. Review all referrals in PENDING status exceeding 72 hours. Escalate to the Administrator if resolution is not achieved within 5. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Referral Acceptance and Admission Initiation. Upon clinical eligibility confirmation and payer verification, update referral status to ACCEPTED. The responsible role is Intake Coordinator; the stated timing is Immediately upon approval.. Notify the referral source of acceptance verbally and in writing. Provide: (a) estimated SOC date; (b) agency contact information; (c) after-hours contact number. The responsible role is Intake Coordinator; the stated timing is Within 2 hours of acceptance (Urgent) / within 24 hours (Routine).. Notify the patient and/or family/caregiver of acceptance: (a) introduce the agency; (b) provide the estimated SOC visit date and time window; (c) advise of patient rights notification (to be delivered at SOC); (d) collect any additional. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall maintain a structured referral and intake process that ensures every referral is received, logged, screened, and dispositioned in a timely, accurate, and non-discriminatory manner. 4.2 All referrals shall be processed within defined timeframes to support timely access to care. Urgent referrals shall be triaged within 2 hours of receipt; routine referrals shall be processed within 24 hours of receipt. 4.3 No referral shall be declined on the basis of race, color, national origin, sex, age, disability, religion, sexual orientation, gender identity, or diagnosis except where the agency lacks the clinical competency, licensure, or staffing to safely provide. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to complaint, conflict, and inappropriate referral escalation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR §484.55(a)" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "partnership-agreement-binder-6-1", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 16, y: 68, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for complaint, conflict, and inappropriate referral escalation." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during complaint, conflict, and inappropriate referral escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complaint, conflict, and inappropriate referral escalation." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "blank-community-outreach-brochure-6-2", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 38, y: 40, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for complaint, conflict, and inappropriate referral escalation." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for complaint, conflict, and inappropriate referral escalation. This decide option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during complaint, conflict, and inappropriate referral escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complaint, conflict, and inappropriate referral escalation." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "referral-intake-folder-6-3", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 81, y: 58, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in complaint, conflict, and inappropriate referral escalation. This identify option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for complaint, conflict, and inappropriate referral escalation." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during complaint, conflict, and inappropriate referral escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during complaint, conflict, and inappropriate referral escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complaint, conflict, and inappropriate referral escalation." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for complaint, conflict, and inappropriate referral escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for complaint, conflict, and inappropriate referral escalation by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for complaint, conflict, and inappropriate referral escalation. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Outreac",
    title: "Outreach/referral audit trail and governing-body reporting",
    subtitle: "Community Relations & Referral Compliance",
    narration: [
      "This lesson develops administrator judgment for outreach/referral audit trail and governing-body reporting within Community Relations & Referral Compliance. Begin with the current controlled versions of OP-IM-001, CO-CP-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-IM-001, Referral Receipt and Logging. Receive referral via any approved channel (fax, electronic referral, phone, secure portal, walk-in). Log immediately in the referral tracking system with: (a) unique referral number; (b) date and time of receipt; (c) referral source name, title, organization, and contact information; (d) patient name, date of birth, and contact information; (e) referring physician name and NPI; (f) primary diagnosis and reason for referral; (g) urgency level (Urgent / Routine). The responsible role is Intake Coordinator; the stated timing is At time of receipt.. Assign urgency classification: URGENT — patient has immediate clinical need, same-day or next-day SOC required (e.g., post-surgical, wound vac, IV therapy, fall risk). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Intake Clinical Screening Form CARE INDEED HOME HEALTH CARE, INC. Intake Clinical Screening Form Policy. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Communication and Reporting Lines. Maintain multiple accessible reporting mechanisms per policy CO-CP-006 including a compliance hotline, anonymous reporting option, and direct email to the Compliance Officer. The responsible role is Compliance Officer; the stated timing is Continuously.. Ensure all workforce members are informed of reporting mechanisms at hire, during annual training, and upon any change to reporting channels. The responsible role is Compliance Officer; the stated timing is At hire; annually; upon change.. Prepare and deliver a written compliance status report to the Governing Body no fewer than 7 calendar days before each quarterly meeting. The report must address: (a) active compliance investigations (without compromising confidentiality); (b) audit findings. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-CP-001, Internal Monitoring and Auditing. Develop and maintain an annual compliance audit work plan. The work plan shall prioritize: (a) billing and claims accuracy; (b) OASIS data integrity; (c) medical necessity documentation; (d) exclusion screening compliance; (e) policy acknowledgment rates; (f) fraud and abuse risk areas identified by OIG Work Plan. The responsible role is Compliance Officer; the stated timing is Approved at first Compliance Committee meeting of each calendar year.. Conduct or commission audits per the annual work plan and document all findings, methodology, sample sizes, and corrective actions, per policy CO-RA-002. The responsible role is Compliance Officer; the stated timing is Per audit work plan schedule.. Present audit. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-IM-001, Referral Declination. Document the specific reason for declining the referral on the Referral Declination Form (Appendix B). Acceptable reasons include: (a) patient outside service area; (b) agency lacks clinical competency or licensure for required services; (c) insufficient staffing to safely provide services; (d) patient does not meet home health eligibility criteria; (e) no valid physician order obtainable; (f) patient/family declines services. Non-acceptable reasons: diagnosis type, payer source (except non-contracted Medicaid managed care with documented non-participation), race, ethnicity, gender, age, disability, or socioeconomic status. The responsible role is Intake RN / Clinical Manager; the stated timing is At the time of declination decision.. Notify the referral source of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to outreach/referral audit trail and governing-body reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank community outreach brochure", detail: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "referral intake folder", detail: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "partnership agreement binder", detail: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-IM-001" },
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "CL-CP-007" },
      { kind: "Controlled Policy", text: "CO-CP-001" },
      { kind: "Controlled Policy", text: "CO-CP-004" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "blank-community-outreach-brochure-7-1", label: "blank community outreach brochure", shortLabel: "blank community outreach broch", ariaLabel: "Investigate blank community outreach brochure",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank community outreach brochure as complete proof without comparing referral intake folder or the controlled source. This identify option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for outreach/referral audit trail and governing-body reporting." },
          { id: "i3", label: "Classify the blank community outreach brochure by department custom even though its authority and current status are unverified. This identify option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank community outreach brochure." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank community outreach brochure on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank community outreach brochure is resolved." },
          { id: "d3", label: "Send blank community outreach brochure to an unrelated department rather than the policy owner responsible for outreach/referral audit trail and governing-body reporting. This decide option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during outreach/referral audit trail and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank community outreach brochure was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank community outreach brochure." },
          { id: "doc3", label: "Keep the blank community outreach brochure decision in personal notes rather than the governed evidence location. This document option concerns blank community outreach brochure during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for outreach/referral audit trail and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
          meaning: "Observe the real blank community outreach brochure in the photographed scene. Compare it with the referral intake folder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For blank community outreach brochure, compare the visible evidence with referral intake folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to blank community outreach brochure; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For blank community outreach brochure, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "referral-intake-folder-7-2", label: "referral intake folder", shortLabel: "referral intake folder", ariaLabel: "Investigate referral intake folder",
        x: 34, y: 58, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume referral intake folder applies to every role, location, and exception described in outreach/referral audit trail and governing-body reporting. This identify option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for outreach/referral audit trail and governing-body reporting." },
          { id: "i3", label: "Use the oldest available referral intake folder because prior approval is easier to confirm. This identify option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about referral intake folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in referral intake folder remains unresolved. This decide option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for referral intake folder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to referral intake folder. This decide option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during outreach/referral audit trail and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For referral intake folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For referral intake folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark referral intake folder closed on assignment, before completion and effectiveness evidence exist. This document option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral intake folder." },
          { id: "doc3", label: "Retain only a summary of referral intake folder and discard the source artifact needed to reconstruct the decision. This document option concerns referral intake folder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for outreach/referral audit trail and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
          meaning: "Observe the real referral intake folder in the photographed scene. Compare it with the partnership agreement binder, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For referral intake folder, compare the visible evidence with partnership agreement binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to referral intake folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For referral intake folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
      {
        id: "partnership-agreement-binder-7-3", label: "partnership agreement binder", shortLabel: "partnership agreement binder", ariaLabel: "Investigate partnership agreement binder",
        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status." },
          { id: "i2", label: "Read partnership agreement binder only for favorable indicators and omit the exception evidence connected to blank community outreach brochure. This identify option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for outreach/referral audit trail and governing-body reporting." },
          { id: "i3", label: "Treat an unsigned or unverified partnership agreement binder as equivalent to the current controlled record. This identify option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about partnership agreement binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close partnership agreement binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for partnership agreement binder is resolved." },
          { id: "d3", label: "Defer the partnership agreement binder decision to a routine future cycle even though current operations depend on it. This decide option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during outreach/referral audit trail and governing-body reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for partnership agreement binder but omit the actual evidence, communications, and unresolved items. This document option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of partnership agreement binder." },
          { id: "doc3", label: "Combine partnership agreement binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns partnership agreement binder during outreach/referral audit trail and governing-body reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for outreach/referral audit trail and governing-body reporting." },
        ],
        feedback: {
          observed: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting.",
          meaning: "Observe the real partnership agreement binder in the photographed scene. Compare it with the blank community outreach brochure, current controlled sources, assigned decision rights, and corroborating records for outreach/referral audit trail and governing-body reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for outreach/referral audit trail and governing-body reporting by reconciling all three photographed evidence objects with the current controlled source. For partnership agreement binder, compare the visible evidence with blank community outreach brochure and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. Apply that decision specifically to partnership agreement binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for outreach/referral audit trail and governing-body reporting. For partnership agreement binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-IM-001","GV-EA-001","CL-CP-007","CO-CP-001","CO-CP-004","42 CFR § 484.105","42 CFR § 484.50","42 CFR § 484.55","42 CFR §484.110","42 CFR § 484.100","42 CFR §484.55(a)","42 CFR §484.60(a)","42 CFR Part 484"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During community relations aligned with mission, capability, and service area, the partnership agreement binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat partnership agreement binder as final approval because the artifact exists during community relations aligned with mission, capability, and service area.",
      "Send partnership agreement binder to an unrelated department rather than the policy owner responsible for community relations aligned with mission, capability, and service area. This option concerns community relations aligned with mission, capability, and service area.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area.",
      "Approve partnership agreement binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns community relations aligned with mission, capability, and service area.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in community relations aligned with mission, capability, and service area. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 2,
    stem: "During ethical referral-source engagement and patient choice, the blank community outreach brochure evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in blank community outreach brochure remains unresolved. This option concerns ethical referral-source engagement and patient choice.",
      "Replace the controlling requirement with an informal local workaround tailored to blank community outreach brochure. This option concerns ethical referral-source engagement and patient choice.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice.",
      "Treat blank community outreach brochure as final approval because the artifact exists during ethical referral-source engagement and patient choice.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ethical referral-source engagement and patient choice. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 3,
    stem: "During referral intake, eligibility, capacity, and timely clinical screening, the referral intake folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat referral intake folder as final approval because the artifact exists during referral intake, eligibility, capacity, and timely clinical screening.",
      "Close referral intake folder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns referral intake, eligibility, capacity, and timely clinical screening.",
      "Defer the referral intake folder decision to a routine future cycle even though current operations depend on it. This option concerns referral intake, eligibility, capacity, and timely clinical screening.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral intake, eligibility, capacity, and timely clinical screening. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 4,
    stem: "During no inducements, steering, quid pro quo, or misleading claims, the partnership agreement binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat partnership agreement binder as final approval because the artifact exists during no inducements, steering, quid pro quo, or misleading claims.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims.",
      "Approve partnership agreement binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns no inducements, steering, quid pro quo, or misleading claims.",
      "Send partnership agreement binder to an unrelated department rather than the policy owner responsible for no inducements, steering, quid pro quo, or misleading claims. This option concerns no inducements, steering, quid pro quo, or misleading claims.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in no inducements, steering, quid pro quo, or misleading claims. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 5,
    stem: "During interagency agreements, transfer communication, and accountability, the blank community outreach brochure evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability.",
      "Treat blank community outreach brochure as final approval because the artifact exists during interagency agreements, transfer communication, and accountability.",
      "Replace the controlling requirement with an informal local workaround tailored to blank community outreach brochure. This option concerns interagency agreements, transfer communication, and accountability.",
      "Allow the affected activity to expand while the exception in blank community outreach brochure remains unresolved. This option concerns interagency agreements, transfer communication, and accountability.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in interagency agreements, transfer communication, and accountability. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 6,
    stem: "During complaint, conflict, and inappropriate referral escalation, the referral intake folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close referral intake folder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns complaint, conflict, and inappropriate referral escalation.",
      "Treat referral intake folder as final approval because the artifact exists during complaint, conflict, and inappropriate referral escalation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation.",
      "Defer the referral intake folder decision to a routine future cycle even though current operations depend on it. This option concerns complaint, conflict, and inappropriate referral escalation.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in complaint, conflict, and inappropriate referral escalation. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 7,
    stem: "During outreach/referral audit trail and governing-body reporting, the partnership agreement binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Send partnership agreement binder to an unrelated department rather than the policy owner responsible for outreach/referral audit trail and governing-body reporting. This option concerns outreach/referral audit trail and governing-body reporting.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting.",
      "Approve partnership agreement binder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns outreach/referral audit trail and governing-body reporting.",
      "Treat partnership agreement binder as final approval because the artifact exists during outreach/referral audit trail and governing-body reporting.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in outreach/referral audit trail and governing-body reporting. The decision remains traceable to OP-IM-001, GV-EA-001, CL-CP-007, CO-CP-001, CO-CP-004.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.105 be used within Community Relations & Referral Compliance?",
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
    stem: "What links referral intake folder and referral intake folder into an accountable Community Relations & Referral Compliance control?",
    options: [
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A verbal understanding that no exception will recur.",
      "An unversioned local worksheet with no assigned reviewer.",
      "A familiar dashboard color without source validation.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Community Relations & Referral Compliance establish?",
    options: [
      "Observed operational competency without an authorized evaluator.",
      "Permission to replace the controlled policies with the Community Relations & Referral Compliance quiz result.",
      "Automatic appointment authority for every decision described in Community Relations & Referral Compliance.",
      "Knowledge of the controlled administrator concepts in Community Relations & Referral Compliance, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
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





const STORAGE_KEY = 'adm-012-progress-v6000';



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



export default function ADM012() {

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

          <span className="brand-text">ADM-012 — Community & Referrals</span>

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
