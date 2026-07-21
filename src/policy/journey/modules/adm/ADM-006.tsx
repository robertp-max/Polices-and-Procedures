/**
 * ADM-006 — Revenue Cycle & Billing Compliance
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

import img01 from './assets/adm-006/adm-006-lesson-01.png';
import img02 from './assets/adm-006/adm-006-lesson-02.png';
import img03 from './assets/adm-006/adm-006-lesson-03.png';
import img04 from './assets/adm-006/adm-006-lesson-04.png';
import img05 from './assets/adm-006/adm-006-lesson-05.png';
import img06 from './assets/adm-006/adm-006-lesson-06.png';
import img07 from './assets/adm-006/adm-006-lesson-07.png';



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



const MODULE_META = { id: "ADM-006", title: "Revenue Cycle & Billing Compliance", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Referral-to-payment revenue-cycle control points, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Eligibility, authorization, orders, face-to-face, and claim readiness, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for PDGM data integrity without finance-driven clinical coding, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Claim submission, reconciliation, denial, and appeal workflow, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for False Claims, Anti-Kickback, Stark, overpayment, and self-disclosure risk, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Audit/ADR/UPIC response and legal-compliance escalation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Revenue integrity dashboard and corrective action tracking, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Referra",
    title: "Referral-to-payment revenue-cycle control points",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for referral-to-payment revenue-cycle control points within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-004, FN-BC-001, FN-BC-002, FN-BC-007, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-004, 11\\. Version Control. 11.1 This policy is maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Compliance Officer and CFO review; (b) Governing Body approval documented in meeting minutes; (c) re-acknowledgment by all in-scope personnel within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the CFO with notification to the Compliance Officer and Governing Body at the next regular meeting. Appendix A — Overpayment Notification Form CARE INDEED HOME HEALTH CARE, INC. Overpayment Notification Form Policy Reference: FN-BC-004. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 11.2 Only the most current approved version, as reflected in the policy header, is valid for any operational, billing, or compliance purpose. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Any substantive revision requires: (a) review by the CFO and Compliance Officer; (b) approval by the Governing Body, documented in meeting minutes; (c) re-acknowledgment by all personnel within scope within 14 calendar days of the revised effective date; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, 11\\. Version Control. 11.1 Maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions archived and marked. 11.3 Substantive revisions require CFO and Compliance Officer review, Governing Body approval, and re-acknowledgment within 14 calendar days. 11.4 Non-substantive revisions approved by CFO with notification to Compliance Officer and Governing Body. Appendix A — Denial Tracking Log CARE INDEED HOME HEALTH CARE, INC. Denial Tracking Log Policy Reference: FN-BC-002 | Version: 6.0 | Effective: 2025-07-10 Instructions: Log every Medicare denial within 1 business day of receipt. This log shall be maintained continuously by the Revenue Cycle Director, reviewed weekly, and retained for 7 years. All fields are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-007, 11\\. Version Control. Per EN-LC-001. Substantive revisions require CFO review and Governing Body approval. Re-acknowledgment within 14 calendar days. Appendix A — Payment Reconciliation Worksheet CARE INDEED HOME HEALTH CARE, INC. Payment Reconciliation Worksheet Policy Reference: FN-BC-007 | Version: 6.0 | Effective: 2025-07-10 Instructions: Complete for every paid Medicare claim within 30 calendar days of remittance receipt. Retained 7 years. CLAIM INFORMATION Patient Name. _________________________. Medicare Number. _________________________. 30-Day Period Dates. _________________________. Claim Control Number. _________________________. Remittance Advice Date. _________________________. Remittance Transaction #. _________________________. PDGM CLASSIFICATION Element: Billed. Source or operational basis: MAC Determination (per 835). Clinical Grouping: _____________. Source or operational basis: _____________. Functional Level: _____________. Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, Billing Integrity Controls. All Billing Personnel The responsible role is Billing staff shall not submit claims for services that were not actually rendered. No exceptions.; the stated timing is Ongoing. All Billing Personnel The responsible role is Billing staff shall not alter, backdate, or falsify any billing data, claim submission date, or supporting documentation.; the stated timing is Ongoing. All Billing/Coding Personnel The responsible role is Billing staff shall not assign or accept diagnosis codes that do not have supporting physician documentation in the medical record.; the stated timing is Ongoing. All Billing Personnel The responsible role is Billing staff who identify a potentially improper claim — whether. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to referral-to-payment revenue-cycle control points. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "45 CFR Parts 160 and 162" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "blank-institutional-claim-forms-1-1", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 26, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral-to-payment revenue-cycle control points." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for referral-to-payment revenue-cycle control points. This decide option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral-to-payment revenue-cycle control points." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral-to-payment revenue-cycle control points." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "noa-readiness-binder-1-2", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 36, y: 74, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in referral-to-payment revenue-cycle control points. This identify option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral-to-payment revenue-cycle control points." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral-to-payment revenue-cycle control points." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral-to-payment revenue-cycle control points." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "remittance-reconciliation-folder-1-3", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for referral-to-payment revenue-cycle control points." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during referral-to-payment revenue-cycle control points." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during referral-to-payment revenue-cycle control points.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral-to-payment revenue-cycle control points." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for referral-to-payment revenue-cycle control points. Identify the verified status, discrepancy, affected requirement, and accountable owner for referral-to-payment revenue-cycle control points by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for referral-to-payment revenue-cycle control points. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Eligibi",
    title: "Eligibility, authorization, orders, face-to-face, and claim readiness",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for eligibility, authorization, orders, face-to-face, and claim readiness within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-001, FN-CM-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-001, Claims Submission Process. Billing Coordinator The responsible role is Confirm that the NOA has been submitted and accepted for this episode per FN-BC-006. If NOA is missing, resolve before final claim submission.; the stated timing is Before claim release. Billing Coordinator The responsible role is Transmit the final claim electronically via the agency's designated clearinghouse using the 837I institutional claim transaction format per HIPAA electronic transaction standards (45 CFR Parts 160 and 162).; the stated timing is Within 14 calendar days of the end of each 30-day payment period, but never later than the 12-month timely filing deadline. Billing Coordinator The responsible role is Confirm clearinghouse acknowledgment (999. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 11.2 Only the most current approved version, as reflected in the policy header, is valid for any operational, billing, or compliance purpose. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Any substantive revision requires: (a) review by the CFO and Compliance Officer; (b) approval by the Governing Body, documented in meeting minutes; (c) re-acknowledgment by all personnel within scope within 14 calendar days of the revised effective date; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-CM-004, Prior Authorization Management (Non-Medicare). Billing Coordinator The responsible role is Maintain a Prior Authorization Tracking Log (Appendix B) for all non-Medicare episodes.; the stated timing is Ongoing. Billing Coordinator The responsible role is At 14 calendar days before authorization expiration, generate a reauthorization alert and initiate the renewal process with the payer.; the stated timing is 14 days before expiration. Billing Coordinator + DON The responsible role is If reauthorization is denied or delayed: (a) notify the Director of Nursing to evaluate clinical options; (b) notify the patient per FN-BC-003; (c) issue ABN if applicable; (d) place claims on billing hold for unauthorized periods.; the stated timing is Within. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, Pre-Billing Verification Process. 6.1.1 Prior to submitting any final claim (Request for Final Payment) for any 30-day payment period, the Billing Coordinator shall complete the Pre-Billing Verification Checklist (Appendix A) and obtain Revenue Cycle Director sign-off. 6.1.2 The pre-billing verification shall confirm all of the following: Signed Plan of Care (485) with valid certification period covering the billed 30-day period. Signature must be original or authenticated electronic; stamped signatures are not accepted. The responsible role is Physician certification on file; the stated timing is Billing Coordinator. Plan of Care signed and dated by physician prior to final claim submission per CMS certification requirements The responsible role is Physician. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, 9\\. References. 9.1 Federal Regulations 42 CFR Part 424: Conditions for Medicare Payment. Source or operational basis: Primary regulatory basis for Medicare payment requirements. 42 CFR § 424.22: Requirements for Home Health Services. Source or operational basis: Physician certification, plan of care, face-to-face requirements. 42 CFR § 484.50: Condition of Participation: Patient rights. Source or operational basis: Patient notification of billing rights. 42 CFR § 484.100: Condition of Participation: Compliance with Federal, State, and local laws. Source or operational basis: Agency must comply with all applicable billing and payment laws. 42 CFR § 484.105: Condition of Participation: Organization and Administration. Source or operational basis: Governing Body oversight. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to eligibility, authorization, orders, face-to-face, and claim readiness. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "noa-readiness-binder-2-1", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 14, y: 60, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in eligibility, authorization, orders, face-to-face, and claim readiness. This identify option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for eligibility, authorization, orders, face-to-face, and claim readiness." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "remittance-reconciliation-folder-2-2", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for eligibility, authorization, orders, face-to-face, and claim readiness." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "blank-institutional-claim-forms-2-3", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for eligibility, authorization, orders, face-to-face, and claim readiness." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for eligibility, authorization, orders, face-to-face, and claim readiness. This decide option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during eligibility, authorization, orders, face-to-face, and claim readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for eligibility, authorization, orders, face-to-face, and claim readiness." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for eligibility, authorization, orders, face-to-face, and claim readiness. Identify the verified status, discrepancy, affected requirement, and accountable owner for eligibility, authorization, orders, face-to-face, and claim readiness by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for eligibility, authorization, orders, face-to-face, and claim readiness. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 PDGM",
    title: "PDGM data integrity without finance-driven clinical coding",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for pdgm data integrity without finance-driven clinical coding within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-001, FN-BC-002, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 11.2 Only the most current approved version, as reflected in the policy header, is valid for any operational, billing, or compliance purpose. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Any substantive revision requires: (a) review by the CFO and Compliance Officer; (b) approval by the Governing Body, documented in meeting minutes; (c) re-acknowledgment by all personnel within scope within 14 calendar days of the revised effective date; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, 11\\. Version Control. 11.1 Maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions archived and marked. 11.3 Substantive revisions require CFO and Compliance Officer review, Governing Body approval, and re-acknowledgment within 14 calendar days. 11.4 Non-substantive revisions approved by CFO with notification to Compliance Officer and Governing Body. Appendix A — Denial Tracking Log CARE INDEED HOME HEALTH CARE, INC. Denial Tracking Log Policy Reference: FN-BC-002 | Version: 6.0 | Effective: 2025-07-10 Instructions: Log every Medicare denial within 1 business day of receipt. This log shall be maintained continuously by the Revenue Cycle Director, reviewed weekly, and retained for 7 years. All fields are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, 5\\. Definitions. PDGM. Patient-Driven Groupings Model — the CMS payment methodology effective January 1, 2020, that classifies home health episodes into 30-day payment periods based on five factors: admission source and timing, clinical grouping (primary diagnosis), functional impairment level, comorbidity adjustment, and episode timing (early vs. late).. 30-Day Payment Period. The unit of payment under PDGM. Each 60-day certification period is divided into two 30-day payment periods, each classified and reimbursed independently.. NOA. Notice of Admission — the electronic notification submitted to the MAC within 5 calendar days of the start of care date to initiate the payment episode. Replaced the legacy advance-payment notice (legacy advance-payment notice). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Denial Classification. 6.2.1 The Revenue Cycle Director shall classify each denial within 3 business days of logging using the following standardized category system: Denial Category: Description. Source or operational basis: Primary Owner. Administrative — Eligibility: Patient eligibility or enrollment issue. Source or operational basis: Billing Coordinator. Administrative — Technical: Incorrect data elements, missing fields, duplicate claim. Source or operational basis: Billing Coordinator. Administrative — Timely Filing: Claim submitted beyond 12-month filing deadline. Source or operational basis: Revenue Cycle Director. Clinical — Medical Necessity: Services determined not medically necessary by MAC/RA__. Source or operational basis: Director of Nursing + Revenue Cycle Director. Clinical — Homebound: Homebound status documentation. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Appeal Merit Assessment. Revenue Cycle Director The responsible role is For administrative denials: Revenue Cycle Director determines whether the error is correctable and resubmittable without appeal. If correctable, correct and resubmit within 5 business days.; the stated timing is Within 5 business days. Revenue Cycle Director + Director of Nursing The responsible role is For clinical denials: Revenue Cycle Director and Director of Nursing shall jointly review the clinical record, denial reason, and documentation quality to determine appeal merit. The Director of Nursing shall provide a written clinical assessment of whether the documentation supports the billed services.; the stated timing is Within 5 business days of denial classification__.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to pdgm data integrity without finance-driven clinical coding. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR Part 424" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "remittance-reconciliation-folder-3-1", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pdgm data integrity without finance-driven clinical coding." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pdgm data integrity without finance-driven clinical coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pdgm data integrity without finance-driven clinical coding." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "blank-institutional-claim-forms-3-2", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 55, y: 69, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pdgm data integrity without finance-driven clinical coding." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for pdgm data integrity without finance-driven clinical coding. This decide option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pdgm data integrity without finance-driven clinical coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pdgm data integrity without finance-driven clinical coding." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "noa-readiness-binder-3-3", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 81, y: 38, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in pdgm data integrity without finance-driven clinical coding. This identify option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for pdgm data integrity without finance-driven clinical coding." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during pdgm data integrity without finance-driven clinical coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during pdgm data integrity without finance-driven clinical coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pdgm data integrity without finance-driven clinical coding." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for pdgm data integrity without finance-driven clinical coding. Identify the verified status, discrepancy, affected requirement, and accountable owner for pdgm data integrity without finance-driven clinical coding by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for pdgm data integrity without finance-driven clinical coding. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Claim",
    title: "Claim submission, reconciliation, denial, and appeal workflow",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for claim submission, reconciliation, denial, and appeal workflow within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-002, FN-BC-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-002, 11\\. Version Control. 11.1 Maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions archived and marked. 11.3 Substantive revisions require CFO and Compliance Officer review, Governing Body approval, and re-acknowledgment within 14 calendar days. 11.4 Non-substantive revisions approved by CFO with notification to Compliance Officer and Governing Body. Appendix A — Denial Tracking Log CARE INDEED HOME HEALTH CARE, INC. Denial Tracking Log Policy Reference: FN-BC-002 | Version: 6.0 | Effective: 2025-07-10 Instructions: Log every Medicare denial within 1 business day of receipt. This log shall be maintained continuously by the Revenue Cycle Director, reviewed weekly, and retained for 7 years. All fields are. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, Claims Submission Process. Billing Coordinator The responsible role is Confirm that the NOA has been submitted and accepted for this episode per FN-BC-006. If NOA is missing, resolve before final claim submission.; the stated timing is Before claim release. Billing Coordinator The responsible role is Transmit the final claim electronically via the agency's designated clearinghouse using the 837I institutional claim transaction format per HIPAA electronic transaction standards (45 CFR Parts 160 and 162).; the stated timing is Within 14 calendar days of the end of each 30-day payment period, but never later than the 12-month timely filing deadline. Billing Coordinator The responsible role is Confirm clearinghouse acknowledgment (999. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Denial Receipt and Logging. Billing Coordinator The responsible role is Upon receipt of any Medicare Remittance Advice (MRA/835 transaction) or denial letter containing a denied or adjusted claim, the Billing Coordinator shall log the denial in the Denial Tracking Log (Appendix A) within 1 business day. Log entries shall include: patient name, Medicare number, claim control number, denial date, denial reason code(s), denial reason description, denial category (per §6.2), dollar amount denied, and 30-day period dates__; the stated timing is Within 1 business day of receipt. Billing Coordinator The responsible role is The Billing Coordinator shall immediately flag any denial involving a dollar amount exceeding $5,000 or any denial. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001. 11.2 Only the most current approved version, as reflected in the policy header, is valid for any operational, billing, or compliance purpose. All superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Any substantive revision requires: (a) review by the CFO and Compliance Officer; (b) approval by the Governing Body, documented in meeting minutes; (c) re-acknowledgment by all personnel within scope within 14 calendar days of the revised effective date; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Denial Trending and Root Cause Analysis. Revenue Cycle Director The responsible role is Revenue Cycle Director shall produce a Monthly Denial Analysis Report (Appendix B) by the 15th of the following month. Report shall include: total denials, denial rate, denial by category, appeal filing rate, appeal win rate by level, top 3 denial reasons, dollar impact, and trending comparison to prior 3 months.; the stated timing is Monthly — by 15th of following month. CFO The responsible role is Monthly Denial Analysis Report shall be reviewed by CFO within 5 business days of receipt; the stated timing is Within 5 business days. Compliance Officer The responsible role is Quarterly denial summary. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to claim submission, reconciliation, denial, and appeal workflow. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "42 CFR Part 424" },
      { kind: "External Authority", text: "45 CFR" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "blank-institutional-claim-forms-4-1", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for claim submission, reconciliation, denial, and appeal workflow." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for claim submission, reconciliation, denial, and appeal workflow. This decide option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during claim submission, reconciliation, denial, and appeal workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for claim submission, reconciliation, denial, and appeal workflow." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "noa-readiness-binder-4-2", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in claim submission, reconciliation, denial, and appeal workflow. This identify option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for claim submission, reconciliation, denial, and appeal workflow." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during claim submission, reconciliation, denial, and appeal workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for claim submission, reconciliation, denial, and appeal workflow." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "remittance-reconciliation-folder-4-3", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for claim submission, reconciliation, denial, and appeal workflow." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during claim submission, reconciliation, denial, and appeal workflow." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during claim submission, reconciliation, denial, and appeal workflow.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for claim submission, reconciliation, denial, and appeal workflow." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for claim submission, reconciliation, denial, and appeal workflow. Identify the verified status, discrepancy, affected requirement, and accountable owner for claim submission, reconciliation, denial, and appeal workflow by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for claim submission, reconciliation, denial, and appeal workflow. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 False",
    title: "False Claims, Anti-Kickback, Stark, overpayment, and self-disclosure risk",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for false claims, anti-kickback, stark, overpayment, and self-disclosure risk within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-004, 11\\. Version Control. 11.1 This policy is maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Compliance Officer and CFO review; (b) Governing Body approval documented in meeting minutes; (c) re-acknowledgment by all in-scope personnel within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the CFO with notification to the Compliance Officer and Governing Body at the next regular meeting. Appendix A — Overpayment Notification Form CARE INDEED HOME HEALTH CARE, INC. Overpayment Notification Form Policy Reference: FN-BC-004. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, Overpayment Reporting and Refund. Compliance Officer (preparation); Revenue Cycle Director (billing data); CFO (financial review) The responsible role is Upon completion of quantification (or estimation if full quantification is not yet complete), the Compliance Officer shall prepare the Overpayment Report and Refund Package (Appendix D) containing: (a) written disclosure letter to the MAC identifying the overpayment; (b) reason for the overpayment; (c) affected claims (patient names, Medicare numbers, claim control numbers, dates of service, amounts); (d) total overpayment amount (actual or estimated); (e) methodology used for quantification (including statistical sampling methodology if applicable); (f) root cause of the overpayment; (g) corrective actions implemented or planned to prevent recurrence.; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, 9\\. References. 9.1 Federal Regulations 42 U.S.C. § 1320a-7k(d): Reporting and Returning of Overpayments. Source or operational basis: Primary statutory basis — 60-day rule. 42 CFR § 401.305: Requirements for Reporting and Returning of Overpayments. Source or operational basis: Implementing regulation — definitions, deadlines, lookback period. 31 U.S.C. §§ 3729–3733: False Claims Act. Source or operational basis: Reverse false claim liability for retained overpayments. 42 U.S.C. § 1320a-7b: Anti-Kickback Statute. Source or operational basis: Overpayments resulting from kickback arrangements. 42 U.S.C. § 1395nn: Physician Self-Referral (Stark Law). Source or operational basis: Overpayments resulting from Stark violations. 42 CFR § 484.100: Condition of Participation: Compliance with laws. Source. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, 5\\. Definitions. Overpayment. Any funds that a person has received or retained under Medicare or Medicaid to which the person, after applicable reconciliation, is not entitled under such program. (42 U.S.C. § 1320a-7k(d)(4)(B)). 60-Day Rule. The requirement under 42 U.S.C. § 1320a-7k(d) and 42 CFR § 401.305 that identified overpayments must be reported and returned within 60 calendar days of identification.. Identification Date. The date on which the agency has, or should have through reasonable diligence, determined that an overpayment exists. Per CMS, this includes the date the agency receives credible information of a potential overpayment, triggering a duty to investigate with reasonable diligence.. Credible Information. Facts. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall report and return any identified overpayment to Medicare or Medicaid within 60 calendar days of the date the overpayment is identified, without exception, as required by 42 U.S.C. § 1320a-7k(d) and 42 CFR § 401.305. 4.2 An overpayment is \"identified\" when the agency has, or should have through the exercise of reasonable diligence, determined that it has received funds to which it is not entitled under applicable payment rules. The identification date is the date the agency first had credible information creating an obligation to investigate — not the date quantification is completed. 4.3 Upon receipt of. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "45 CFR" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "noa-readiness-binder-5-1", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 14, y: 46, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. This identify option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "remittance-reconciliation-folder-5-2", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 32, y: 64, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "blank-institutional-claim-forms-5-3", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 82, y: 39, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. This decide option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for false claims, anti-kickback, stark, overpayment, and self-disclosure risk." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Identify the verified status, discrepancy, affected requirement, and accountable owner for false claims, anti-kickback, stark, overpayment, and self-disclosure risk by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for false claims, anti-kickback, stark, overpayment, and self-disclosure risk. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Audit",
    title: "Audit/ADR/UPIC response and legal-compliance escalation",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for audit/adr/upic response and legal-compliance escalation within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-FP-007, FN-BC-002, FN-BC-004, FN-BC-001, FN-BC-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-FP-007, Quarterly Internal Financial Audit. Compliance Officer The responsible role is Select audit sample: minimum 5% of claims billed in the quarter (minimum 15 claims).; the stated timing is Quarterly. Audit Lead The responsible role is For each sampled claim: (a) verify all services billed were actually rendered; (b) verify documentation supports all billed services; (c) verify coding accuracy per FN-CM-001/002; (d) verify PDGM classification accuracy; (e) verify physician certification on file; (f) verify no duplicate billing.; the stated timing is During audit. Compliance Officer The responsible role is Analyze referral source financial data for AKS risk per CO-FA-001: (a) identify all referral sources; (b) review any financial arrangements with. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Surveyor and Auditor Expectations. MAC/RAC auditors will request documentation supporting denied and overturned claims. Agencies must demonstrate a functioning denial management process with tracking, appeals, and trending. OIG compliance auditors expect evidence that denial patterns are analyzed for systemic root causes and that the agency has a corrective action process. Agencies that simply accept denials without investigation risk a finding of inadequate compliance program. CMS surveyors reviewing 42 CFR § 484.100 (compliance with federal laws) will look for evidence that billing processes include quality control and error correction. CERT auditors will request complete medical records for sampled claims. Non-response results in automatic improper payment finding.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, Surveyor and Auditor Expectations. OIG compliance program auditors will specifically request evidence that the agency has a functioning overpayment identification and refund process. Agencies that cannot demonstrate a formal process risk a finding of inadequate compliance program. RAC/CERT/UPIC auditors issue overpayment demands; surveyors will verify that the agency responded timely and refunded amounts owed. CMS surveyors reviewing 42 CFR § 484.100 (compliance with federal laws) will look for evidence that the agency self-identifies and returns overpayments. OIG auditors will test whether the agency's lookback extends the full 6-year period required by regulation. DOJ attorneys investigating False Claims Act matters will seek evidence of when the agency first became aware. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-001, Escalation Matrix. Clinical documentation deficiency prevents claim submission: Revenue Cycle Director notifies Director of Nursing in writing. Source or operational basis: DON assigns clinical staff to complete documentation within 7 calendar days. If unresolved, escalate to Administrator.. Timely filing deadline within 30 calendar days with unresolved deficiency: Revenue Cycle Director escalates to Administrator and Director of Nursing jointly. Source or operational basis: Emergency clinical documentation remediation. Administrator may direct prioritization of documentation completion.. Claim denial rate exceeds 5% in any 30-day period: Revenue Cycle Director reports to CFO and Compliance Officer in writing. Source or operational basis: Root cause analysis initiated per FN-BC-002. Corrective action plan within. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-006, Timeliness Monitoring and Escalation. Revenue Cycle Director The responsible role is The Revenue Cycle Director shall review the NOA Submission Tracking Log (Appendix A) daily to identify any SOC/ROC dates that are approaching the 5-day submission deadline without a submitted NOA.; the stated timing is Daily. Revenue Cycle Director The responsible role is Any episode at day 3 without NOA submission shall be flagged as \"approaching deadline\" and the Billing Coordinator shall be notified in writing to prioritize submission.; the stated timing is At day 3. Revenue Cycle Director The responsible role is Any episode at day 5 without NOA submission shall trigger immediate escalation to the Revenue Cycle. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to audit/adr/upic response and legal-compliance escalation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "remittance-reconciliation-folder-6-1", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 16, y: 63, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for audit/adr/upic response and legal-compliance escalation." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during audit/adr/upic response and legal-compliance escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit/adr/upic response and legal-compliance escalation." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "blank-institutional-claim-forms-6-2", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 39, y: 38, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for audit/adr/upic response and legal-compliance escalation." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for audit/adr/upic response and legal-compliance escalation. This decide option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during audit/adr/upic response and legal-compliance escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit/adr/upic response and legal-compliance escalation." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "noa-readiness-binder-6-3", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 83, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in audit/adr/upic response and legal-compliance escalation. This identify option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for audit/adr/upic response and legal-compliance escalation." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during audit/adr/upic response and legal-compliance escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during audit/adr/upic response and legal-compliance escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit/adr/upic response and legal-compliance escalation." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for audit/adr/upic response and legal-compliance escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for audit/adr/upic response and legal-compliance escalation by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for audit/adr/upic response and legal-compliance escalation. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Revenue",
    title: "Revenue integrity dashboard and corrective action tracking",
    subtitle: "Revenue Cycle & Billing Compliance",
    narration: [
      "This lesson develops administrator judgment for revenue integrity dashboard and corrective action tracking within Revenue Cycle & Billing Compliance. Begin with the current controlled versions of FN-BC-004, FN-BC-002, FN-BC-007, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Current billing correction — recurring home-health Requests for Anticipated Payment are obsolete. Use the current one-time Notice of Admission process, confirm its acceptance for the episode, and use current claim-readiness terminology. Never force a submission to protect cash flow; hold release until eligibility, authorization, orders, face-to-face support, coding integrity, and other controlled readiness elements are resolved.",
      "Controlled source application — FN-BC-004, Corrective Action and Recurrence Prevention. Compliance Officer The responsible role is For every identified overpayment, the Compliance Officer shall complete a Root Cause Analysis (Appendix E) identifying: (a) the specific process, system, or human failure that caused the overpayment; (b) whether the failure was isolated or systemic; (c) contributing factors; (d) the duration of the error.; the stated timing is Within 14 calendar days of refund submission. Compliance Officer + affected department head(s) The responsible role is Based on the root cause analysis, the Compliance Officer shall develop a Corrective Action Plan per QA-AE-003 with: (a) specific corrective actions; (b) responsible parties; (c) implementation deadlines; (d) measurable outcomes to verify. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, Medicare Administrative Appeals Process. 6.4.1 Level 1 — Redetermination (MAC) Element. Requirement. Filing Deadline. 120 calendar days from the date of the initial determination. Filed With. MAC that processed the original claim. Submission Requirements. Written request for Redetermination; copy of MRA/initial determination; complete medical record for the episode; written clinical argument addressing each denial reason code; any additional supporting documentation not previously submitted. MAC Decision Deadline. 60 calendar days from receipt of request__. Tracking. Log appeal filing date, deadline for MAC decision, and follow-up dates in Appendix A. Revenue Cycle Director (billing component); Director of Nursing (clinical argument) The responsible role is Prepare Redetermination request package including clinical argument. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-002, 7\\. Documentation Requirements. Denial logging: Denial Tracking Log (Appendix A) with full tracking data for each denial. Source or operational basis: Revenue Cycle Director / Billing Coordinator. Monthly trending: Monthly Denial Analysis Report (Appendix B). Source or operational basis: Revenue Cycle Director. Write-off authorization: Write-Off Authorization Form (Appendix C) with CFO countersignature. Source or operational basis: Revenue Cycle Director + CFO. ADR tracking: ADR Tracking Log (Appendix D) with dates, deadlines, submission, outcome. Source or operational basis: Revenue Cycle Director. All denial notices: MRAs, denial letters, and correspondence from MAC/RAC/QIC/AL__. Source or operational basis: Revenue Cycle Director. All appeal submissions: Complete appeal packages at each level including clinical. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-004, 11\\. Version Control. 11.1 This policy is maintained under EN-LC-001. 11.2 Only the current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Compliance Officer and CFO review; (b) Governing Body approval documented in meeting minutes; (c) re-acknowledgment by all in-scope personnel within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the CFO with notification to the Compliance Officer and Governing Body at the next regular meeting. Appendix A — Overpayment Notification Form CARE INDEED HOME HEALTH CARE, INC. Overpayment Notification Form Policy Reference: FN-BC-004. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — FN-BC-007, Variance Investigation. Revenue Cycle Director The responsible role is For each claim with a variance exceeding $100, investigate the cause. Common variance causes include:; the stated timing is Within 10 business days of identification. Variance Type: Common Cause. Source or operational basis: Investigation Action. Underpayment — lower than expected: MAC applied different PDGM group than billed; LUPA applied unexpectedly; PEP applied; sequestration rate changed; wage index adjustment. Source or operational basis: Verify PDGM classification on claim vs. MAC determination on 835; check for LUPA/PEP indicators; verify current sequestration rate. Underpayment — partial payment: Portion of claim denied; adjustment applied. Source or operational basis: Review adjustment reason codes. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to revenue integrity dashboard and corrective action tracking. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "blank institutional claim forms", detail: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "NOA readiness binder", detail: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "remittance reconciliation folder", detail: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "FN-BC-001" },
      { kind: "Controlled Policy", text: "FN-BC-002" },
      { kind: "Controlled Policy", text: "FN-BC-003" },
      { kind: "Controlled Policy", text: "FN-BC-004" },
      { kind: "Controlled Policy", text: "FN-BC-005" },
      { kind: "Controlled Policy", text: "FN-BC-006" },
      { kind: "Controlled Policy", text: "FN-BC-007" },
      { kind: "Controlled Policy", text: "FN-FP-007" },
      { kind: "Controlled Policy", text: "FN-CM-004" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "blank-institutional-claim-forms-7-1", label: "blank institutional claim forms", shortLabel: "blank institutional claim form", ariaLabel: "Investigate blank institutional claim forms",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat blank institutional claim forms as complete proof without comparing NOA readiness binder or the controlled source. This identify option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for revenue integrity dashboard and corrective action tracking." },
          { id: "i3", label: "Classify the blank institutional claim forms by department custom even though its authority and current status are unverified. This identify option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about blank institutional claim forms." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve blank institutional claim forms on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for blank institutional claim forms is resolved." },
          { id: "d3", label: "Send blank institutional claim forms to an unrelated department rather than the policy owner responsible for revenue integrity dashboard and corrective action tracking. This decide option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during revenue integrity dashboard and corrective action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that blank institutional claim forms was reviewed, without source version, finding, decision, owner, or status. This document option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blank institutional claim forms." },
          { id: "doc3", label: "Keep the blank institutional claim forms decision in personal notes rather than the governed evidence location. This document option concerns blank institutional claim forms during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for revenue integrity dashboard and corrective action tracking." },
        ],
        feedback: {
          observed: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
          meaning: "Observe the real blank institutional claim forms in the photographed scene. Compare it with the NOA readiness binder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For blank institutional claim forms, compare the visible evidence with NOA readiness binder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to blank institutional claim forms; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For blank institutional claim forms, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "noa-readiness-binder-7-2", label: "NOA readiness binder", shortLabel: "NOA readiness binder", ariaLabel: "Investigate NOA readiness binder",
        x: 35, y: 60, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume NOA readiness binder applies to every role, location, and exception described in revenue integrity dashboard and corrective action tracking. This identify option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for revenue integrity dashboard and corrective action tracking." },
          { id: "i3", label: "Use the oldest available NOA readiness binder because prior approval is easier to confirm. This identify option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about NOA readiness binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in NOA readiness binder remains unresolved. This decide option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for NOA readiness binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to NOA readiness binder. This decide option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during revenue integrity dashboard and corrective action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark NOA readiness binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of NOA readiness binder." },
          { id: "doc3", label: "Retain only a summary of NOA readiness binder and discard the source artifact needed to reconstruct the decision. This document option concerns NOA readiness binder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for revenue integrity dashboard and corrective action tracking." },
        ],
        feedback: {
          observed: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
          meaning: "Observe the real NOA readiness binder in the photographed scene. Compare it with the remittance reconciliation folder, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For NOA readiness binder, compare the visible evidence with remittance reconciliation folder and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to NOA readiness binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For NOA readiness binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
      {
        id: "remittance-reconciliation-folder-7-3", label: "remittance reconciliation folder", shortLabel: "remittance reconciliation fold", ariaLabel: "Investigate remittance reconciliation folder",
        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status." },
          { id: "i2", label: "Read remittance reconciliation folder only for favorable indicators and omit the exception evidence connected to blank institutional claim forms. This identify option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for revenue integrity dashboard and corrective action tracking." },
          { id: "i3", label: "Treat an unsigned or unverified remittance reconciliation folder as equivalent to the current controlled record. This identify option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about remittance reconciliation folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close remittance reconciliation folder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for remittance reconciliation folder is resolved." },
          { id: "d3", label: "Defer the remittance reconciliation folder decision to a routine future cycle even though current operations depend on it. This decide option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during revenue integrity dashboard and corrective action tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for remittance reconciliation folder but omit the actual evidence, communications, and unresolved items. This document option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of remittance reconciliation folder." },
          { id: "doc3", label: "Combine remittance reconciliation folder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns remittance reconciliation folder during revenue integrity dashboard and corrective action tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for revenue integrity dashboard and corrective action tracking." },
        ],
        feedback: {
          observed: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking.",
          meaning: "Observe the real remittance reconciliation folder in the photographed scene. Compare it with the blank institutional claim forms, current controlled sources, assigned decision rights, and corroborating records for revenue integrity dashboard and corrective action tracking. Identify the verified status, discrepancy, affected requirement, and accountable owner for revenue integrity dashboard and corrective action tracking by reconciling all three photographed evidence objects with the current controlled source. For remittance reconciliation folder, compare the visible evidence with blank institutional claim forms and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. Apply that decision specifically to remittance reconciliation folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for revenue integrity dashboard and corrective action tracking. For remittance reconciliation folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["FN-BC-001","FN-BC-002","FN-BC-003","FN-BC-004","FN-BC-005","FN-BC-006","FN-BC-007","FN-FP-007","FN-CM-004","45 CFR Parts 160 and 162","42 CFR § 484.60","42 CFR Part 484","42 CFR Part 424","45 CFR","42 CFR § 484.100","42 CFR § 424.22","42 CFR § 484.50","42 CFR § 484.105","42 CFR Part 420"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During referral-to-payment revenue-cycle control points, the remittance reconciliation folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat remittance reconciliation folder as final approval because the artifact exists during referral-to-payment revenue-cycle control points.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points.",
      "Approve remittance reconciliation folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns referral-to-payment revenue-cycle control points.",
      "Send remittance reconciliation folder to an unrelated department rather than the policy owner responsible for referral-to-payment revenue-cycle control points. This option concerns referral-to-payment revenue-cycle control points.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in referral-to-payment revenue-cycle control points. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 2,
    stem: "During eligibility, authorization, orders, face-to-face, and claim readiness, the blank institutional claim forms evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in blank institutional claim forms remains unresolved. This option concerns eligibility, authorization, orders, face-to-face, and claim readiness.",
      "Replace the controlling requirement with an informal local workaround tailored to blank institutional claim forms. This option concerns eligibility, authorization, orders, face-to-face, and claim readiness.",
      "Treat blank institutional claim forms as final approval because the artifact exists during eligibility, authorization, orders, face-to-face, and claim readiness.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in eligibility, authorization, orders, face-to-face, and claim readiness. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 3,
    stem: "During pdgm data integrity without finance-driven clinical coding, the NOA readiness binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Close NOA readiness binder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns pdgm data integrity without finance-driven clinical coding.",
      "Treat NOA readiness binder as final approval because the artifact exists during pdgm data integrity without finance-driven clinical coding.",
      "Defer the NOA readiness binder decision to a routine future cycle even though current operations depend on it. This option concerns pdgm data integrity without finance-driven clinical coding.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in pdgm data integrity without finance-driven clinical coding. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 4,
    stem: "During claim submission, reconciliation, denial, and appeal workflow, the remittance reconciliation folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat remittance reconciliation folder as final approval because the artifact exists during claim submission, reconciliation, denial, and appeal workflow.",
      "Send remittance reconciliation folder to an unrelated department rather than the policy owner responsible for claim submission, reconciliation, denial, and appeal workflow. This option concerns claim submission, reconciliation, denial, and appeal workflow.",
      "Approve remittance reconciliation folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns claim submission, reconciliation, denial, and appeal workflow.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in claim submission, reconciliation, denial, and appeal workflow. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 5,
    stem: "During false claims, anti-kickback, stark, overpayment, and self-disclosure risk, the blank institutional claim forms evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Replace the controlling requirement with an informal local workaround tailored to blank institutional claim forms. This option concerns false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
      "Treat blank institutional claim forms as final approval because the artifact exists during false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
      "Allow the affected activity to expand while the exception in blank institutional claim forms remains unresolved. This option concerns false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in false claims, anti-kickback, stark, overpayment, and self-disclosure risk. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 6,
    stem: "During audit/adr/upic response and legal-compliance escalation, the NOA readiness binder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat NOA readiness binder as final approval because the artifact exists during audit/adr/upic response and legal-compliance escalation.",
      "Close NOA readiness binder when work is submitted, without testing whether the correction changed the intended outcome. This option concerns audit/adr/upic response and legal-compliance escalation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation.",
      "Defer the NOA readiness binder decision to a routine future cycle even though current operations depend on it. This option concerns audit/adr/upic response and legal-compliance escalation.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in audit/adr/upic response and legal-compliance escalation. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 7,
    stem: "During revenue integrity dashboard and corrective action tracking, the remittance reconciliation folder evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve remittance reconciliation folder on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns revenue integrity dashboard and corrective action tracking.",
      "Treat remittance reconciliation folder as final approval because the artifact exists during revenue integrity dashboard and corrective action tracking.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking.",
      "Send remittance reconciliation folder to an unrelated department rather than the policy owner responsible for revenue integrity dashboard and corrective action tracking. This option concerns revenue integrity dashboard and corrective action tracking.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in revenue integrity dashboard and corrective action tracking. The decision remains traceable to FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-FP-007, FN-CM-004.",
  },
  {
    id: 8,
    stem: "How should 45 CFR Parts 160 and 162 be used within Revenue Cycle & Billing Compliance?",
    options: [
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
      "Apply the citation outside its stated subject and scope.",
      "Treat a citation label as proof that every operational detail is current.",
      "Replace the controlled agency policies with course narration.",
    ],
    correct: 0,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links NOA readiness binder and NOA readiness binder into an accountable Revenue Cycle & Billing Compliance control?",
    options: [
      "An unversioned local worksheet with no assigned reviewer.",
      "A familiar dashboard color without source validation.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A verbal understanding that no exception will recur.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Revenue Cycle & Billing Compliance establish?",
    options: [
      "Knowledge of the controlled administrator concepts in Revenue Cycle & Billing Compliance, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Observed operational competency without an authorized evaluator.",
      "Permission to replace the controlled policies with the Revenue Cycle & Billing Compliance quiz result.",
      "Automatic appointment authority for every decision described in Revenue Cycle & Billing Compliance.",
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





const STORAGE_KEY = 'adm-006-progress-v6000';



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



export default function ADM006() {

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

          <span className="brand-text">ADM-006 — Revenue Cycle</span>

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
