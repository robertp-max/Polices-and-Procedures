/**
 * ADM-014 — Contracts, Vendors & Business Associates
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

import img01 from './assets/adm-014/adm-014-lesson-01.png';
import img02 from './assets/adm-014/adm-014-lesson-02.png';
import img03 from './assets/adm-014/adm-014-lesson-03.png';
import img04 from './assets/adm-014/adm-014-lesson-04.png';
import img05 from './assets/adm-014/adm-014-lesson-05.png';
import img06 from './assets/adm-014/adm-014-lesson-06.png';
import img07 from './assets/adm-014/adm-014-lesson-07.png';



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



const MODULE_META = { id: "ADM-014", title: "Contracts, Vendors & Business Associates", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for Vendor need, due diligence, conflicts, and approval authority, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Contract scope, performance, compliance, insurance, and termination clauses, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Business-associate determination and BAA execution before PHI, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Security/privacy assessment and least-necessary access, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Ongoing performance, credential, sanction, and incident monitoring, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Breach, service failure, dispute, remediation, and termination escalation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Contract repository, renewal calendar, dashboard, and board reporting, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Vendor",
    title: "Vendor need, due diligence, conflicts, and approval authority",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for vendor need, due diligence, conflicts, and approval authority within Contracts, Vendors & Business Associates. Begin with the current controlled versions of OP-FM-003, IT-SA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — OP-FM-003, Vendor Qualification. Collect vendor qualification documentation using the Vendor Qualification Checklist (Appendix B): (a) W-9 or tax identification; (b) business license or registration; (c) professional licenses or certifications (if applicable); (d) certificate of insurance (general liability, professional liability, workers' compensation as applicable); (e) references (minimum 2 current clients); (f) compliance certifications or attestations; (g) product certifications or FDA registrations (for medical suppliers). The responsible role is Operations Director; the stated timing is Within 14 business days of selection.. Perform exclusion screening: (a) verify vendor entity and principals against OIG LEIE; (b) verify against SAM exclusion database; (c) document results on the Vendor Qualification Checklist. If the vendor. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Operations Director review and recommendation; (b) Administrator approval; (c) re-acknowledgment by all personnel within scope within 14 calendar days; (d) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions (formatting, typographical corrections) may be approved by the Operations Director with notification to the Administrator. Appendix A — Vendor Request Form CARE INDEED HOME HEALTH CARE, INC. Vendor Request Form Policy Reference: OP-FM-003. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Vendor Termination. Terminate vendor relationships when: (a) the vendor receives an UNSATISFACTORY performance rating and does not improve; (b) the vendor or its principals are found on the OIG/SAM exclusion list; (c) the vendor fails to maintain required insurance; (d) the vendor violates contract terms; (e) the vendor poses a risk to patient safety; (f) the agency no longer requires the vendor's goods or services. The responsible role is Operations Director; the stated timing is Per contract termination provisions; immediate for exclusion or patient safety.. Document the termination reason. Notify the vendor in writing. Remove the vendor from the AVL. Ensure a replacement vendor is identified and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Annual Vendor Performance Evaluation. Conduct an annual performance evaluation for all vendors on the AVL using the Vendor Performance Evaluation Form (Appendix E). Evaluate: (a) quality of goods/services; (b) timeliness of delivery; (c) responsiveness to issues; (d) pricing competitiveness; (e) compliance and exclusion screening results; (f) insurance currency; (g) overall satisfaction. The responsible role is Operations Director; the stated timing is Annually; within 60 days of contract anniversary or fiscal year end.. Assign a performance rating: SATISFACTORY — Vendor meets or exceeds expectations. Continue relationship. NEEDS IMPROVEMENT — Vendor has documented deficiencies. Issue a Vendor Corrective Action Notice (Appendix F) with a 30-day improvement timeline. UNSATISFACTORY — Vendor has. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, Ongoing Vendor Security Monitoring. Conduct annual reassessment of all Tier 1 vendors. Request updated security documentation annually. The responsible role is IT Director / CISO; the stated timing is Annually; initiated 60 days before contract renewal.. Monitor vendor security breach notifications and public disclosures continuously. Subscribe to cybersecurity news sources covering major cloud providers and healthcare IT vendors. The responsible role is IT Director / CISO; the stated timing is Continuous.. Review all vendor remote access events in audit logs monthly per IT-DR-003. Verify that vendor access is limited to authorized activities and times. The responsible role is IT Director / CISO; the stated timing is Monthly.. Revoke vendor. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to vendor need, due diligence, conflicts, and approval authority. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "contract-portfolio-1-1", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 25, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for vendor need, due diligence, conflicts, and approval authority." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for vendor need, due diligence, conflicts, and approval authority. This decide option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during vendor need, due diligence, conflicts, and approval authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vendor need, due diligence, conflicts, and approval authority." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "vendor-credential-packet-1-2", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 34, y: 68, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in vendor need, due diligence, conflicts, and approval authority. This identify option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for vendor need, due diligence, conflicts, and approval authority." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during vendor need, due diligence, conflicts, and approval authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vendor need, due diligence, conflicts, and approval authority." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "secure-access-badge-1-3", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 79, y: 65, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for vendor need, due diligence, conflicts, and approval authority." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during vendor need, due diligence, conflicts, and approval authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during vendor need, due diligence, conflicts, and approval authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vendor need, due diligence, conflicts, and approval authority." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for vendor need, due diligence, conflicts, and approval authority. Identify the verified status, discrepancy, affected requirement, and accountable owner for vendor need, due diligence, conflicts, and approval authority by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for vendor need, due diligence, conflicts, and approval authority. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Contrac",
    title: "Contract scope, performance, compliance, insurance, and termination clauses",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for contract scope, performance, compliance, insurance, and termination clauses within Contracts, Vendors & Business Associates. Begin with the current controlled versions of GV-EA-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-001, Contract Monitoring and Performance Oversight. Monitor contractor performance on an ongoing basis, including: (a) quality and timeliness of services; (b) compliance with applicable agency policies; (c) staff competency and credential currency (for clinical contractors); (d) incident and complaint rates. The responsible role is Responsible Department Lead; the stated timing is Ongoing; formal performance documentation quarterly.. Conduct an annual formal review of all active contracts for: (a) performance against contractual standards; (b) cost and value; (c) compliance with law and agency policy; (d) renewal, modification, or termination decisions. The responsible role is Administrator; the stated timing is Annually; within 60 calendar days of each contract's anniversary date.. Conduct or commission an. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Initiation and Review. Submit a Contract Request Form (Appendix A) to the Administrator for any proposed new contract or agreement. The form must identify: (a) the proposed contractor or partner; (b) the scope of services; (c) estimated annual value; (d) whether the contract involves patient care, PHI access, or regulatory compliance obligations; (e) proposed term and renewal provisions. The responsible role is Initiating Department Lead / Administrator; the stated timing is Prior to initiating any contract negotiation or commitment.. Review each proposed contract for: (a) necessity and alignment with agency scope of services; (b) potential Anti-Kickback or Stark Law implications (consult Legal Counsel per GV-EA-003 for referral-related contracts). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Renewal and Termination. Maintain a contract renewal calendar (Appendix B) with notification alerts 90 calendar days before each contract's expiration date. The responsible role is Administrator; the stated timing is Alerts generated 90 days before expiration.. Review each expiring contract 60 calendar days before expiration to determine: (a) renewal with same terms; (b) renewal with negotiated modifications; (c) competitive replacement; or (d) termination. The responsible role is Administrator; the stated timing is 60 calendar days before expiration.. Material contract renewals and terminations shall be reviewed and approved per the approval authority in Section 6.2. The responsible role is Administrator; the stated timing is Prior to renewal execution or. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Execution. Execute the contract after all required reviews and approvals are complete. No contract shall be executed prior to completion of OIG/SAM screening of the contractor. The responsible role is Administrator; the stated timing is Upon completion of all required reviews and approvals.. File a fully executed copy of each contract in the Contract Register and assign a contract ID. Notify the initiating department of execution and provide relevant operational sections to staff who will interface with the contractor. The responsible role is Administrator; the stated timing is Within 3 business days of execution.. If the contract involves PHI access, confirm that a fully executed BAA. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Approval Authority. Contract Category: Approval Authority. Source or operational basis: Documentation. Non-material contracts (annual value <$25,000, no patient care/PHI/compliance implications): Administrator sole approval. Source or operational basis: Signed contract retained in Contract Register.. Material contracts (annual value ≥$25,000, or involving patient care/PHI/regulatory compliance): Administrator recommendation; Governing Body approval at next regular or special meeting.. Source or operational basis: Documented in Governing Body minutes; signed contract in Contract Register.. Emergency contracts (urgent operational need, cannot wait for next Governing Body meeting): Administrator executes; Governing Body ratification at next meeting within 30 calendar days.. Source or operational basis: Written notification to Governing Body Chair within 48 hours; ratification documented. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to contract scope, performance, compliance, insurance, and termination clauses. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "45 CFR" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "vendor-credential-packet-2-1", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 14, y: 58, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in contract scope, performance, compliance, insurance, and termination clauses. This identify option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract scope, performance, compliance, insurance, and termination clauses." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "secure-access-badge-2-2", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract scope, performance, compliance, insurance, and termination clauses." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "contract-portfolio-2-3", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract scope, performance, compliance, insurance, and termination clauses." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for contract scope, performance, compliance, insurance, and termination clauses. This decide option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during contract scope, performance, compliance, insurance, and termination clauses.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract scope, performance, compliance, insurance, and termination clauses." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract scope, performance, compliance, insurance, and termination clauses. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract scope, performance, compliance, insurance, and termination clauses by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract scope, performance, compliance, insurance, and termination clauses. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Busines",
    title: "Business-associate determination and BAA execution before PHI",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for business-associate determination and baa execution before phi within Contracts, Vendors & Business Associates. Begin with the current controlled versions of CO-BA-101, OP-FM-003, GV-EA-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-BA-101, Due Diligence and BAA Execution. Conduct vendor due diligence appropriate to the risk tier. Tier 1: formal security questionnaire, evidence of HIPAA compliance program, SOC 2 or equivalent report review, OIG/SAM screening. Tier 2: security questionnaire and OIG/SAM screening. Tier 3: OIG/SAM screening and written attestation of PHI handling capability. The responsible role is Compliance Officer; the stated timing is Prior to BAA execution.. Prepare and execute a BAA containing all elements required by 45 CFR § 164.504(e)(2) and § 164.314(a)(2). The BAA shall be reviewed by legal counsel for Tier 1 vendors. The responsible role is Compliance Officer / Legal Counsel; the stated timing is Prior to any PHI. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Contract Execution. Execute a written contract or purchase agreement with all qualified vendors providing recurring goods or services exceeding $2,500 annually. The contract must include: (a) detailed scope of goods or services; (b) pricing, payment terms, and invoice requirements; (c) quality and performance standards; (d) compliance with all applicable laws and regulations; (e) requirement to notify agency of any exclusion, sanction, or material change; (f) right to audit records related to services provided; (g) termination provisions (for cause and without cause); (h) insurance requirements and indemnification; (i) confidentiality and PHI protection (BAA if applicable); (j) dispute resolution mechanism. The responsible role is Operations Director / CFO; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Execution. Execute the contract after all required reviews and approvals are complete. No contract shall be executed prior to completion of OIG/SAM screening of the contractor. The responsible role is Administrator; the stated timing is Upon completion of all required reviews and approvals.. File a fully executed copy of each contract in the Contract Register and assign a contract ID. Notify the initiating department of execution and provide relevant operational sections to staff who will interface with the contractor. The responsible role is Administrator; the stated timing is Within 3 business days of execution.. If the contract involves PHI access, confirm that a fully executed BAA. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-BA-101, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall execute a compliant BAA with every business associate prior to permitting access to PHI, per 45 CFR § 164.502(e)(1) and CMIA Cal. Civ. Code § 56.10(c). No PHI shall be shared, transmitted, or made accessible to any entity until a fully executed BAA is on file. 4.2 The agency shall maintain a Business Associate Master Registry documenting all active and terminated business associate relationships, including: entity name, services provided, PHI categories accessed, BAA execution date, BAA expiration/renewal date, risk classification, and assigned internal owner. 4.3 All vendors with potential PHI access shall be classified into a risk. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, 7\\. Documentation Requirements. Contract Register: Centralized log of all active, pending, and recently terminated contracts (Appendix B).. Source or operational basis: Administrator. Fully executed contracts: Signed original or electronic copy of each executed contract.. Source or operational basis: Administrator. OIG/SAM screening records: Documentation of exclusion screening for each contractor at engagement and monthly.. Source or operational basis: Compliance Officer. BAA documentation: Executed BAA for each contractor accessing PHI.. Source or operational basis: Administrator / Compliance Officer. Governing Body approval records: Governing Body meeting minutes documenting approval of material contracts.. Source or operational basis: Designated Secretary. Annual contract review documentation: Written summary of annual contract performance review and renewal/termination. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to business-associate determination and baa execution before phi. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "45 CFR" },
      { kind: "External Authority", text: "42 CFR § 1001" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "secure-access-badge-3-1", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 14, y: 59, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for business-associate determination and baa execution before phi." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during business-associate determination and baa execution before phi." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during business-associate determination and baa execution before phi.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for business-associate determination and baa execution before phi." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "contract-portfolio-3-2", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 58, y: 69, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for business-associate determination and baa execution before phi." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for business-associate determination and baa execution before phi. This decide option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during business-associate determination and baa execution before phi." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during business-associate determination and baa execution before phi.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for business-associate determination and baa execution before phi." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "vendor-credential-packet-3-3", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 76, y: 41, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in business-associate determination and baa execution before phi. This identify option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for business-associate determination and baa execution before phi." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during business-associate determination and baa execution before phi." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during business-associate determination and baa execution before phi.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for business-associate determination and baa execution before phi." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for business-associate determination and baa execution before phi. Identify the verified status, discrepancy, affected requirement, and accountable owner for business-associate determination and baa execution before phi by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for business-associate determination and baa execution before phi. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Securit",
    title: "Security/privacy assessment and least-necessary access",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for security/privacy assessment and least-necessary access within Contracts, Vendors & Business Associates. Begin with the current controlled versions of IT-SA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — IT-SA-004, Third-Party Access Controls. Provision vendor access accounts through the IT-SC-002 access management process. Vendor accounts shall: (a) use unique, named accounts (no shared credentials); (b) have MFA enforced; (c) have access limited to specific systems and functions; (d) be time-limited for temporary access. The responsible role is IT Director / CISO; the stated timing is Before any vendor system access.. Require advance notice (minimum 24 hours) for any vendor remote access session, except for emergency support situations. Log all vendor remote access in the Vendor Remote Access Log (Appendix D). The responsible role is IT Director / CISO; the stated timing is For all non-emergency vendor access; emergency. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, Pre-Contract Security Assessment. Send the Vendor Security Questionnaire (Appendix B) to all Tier 1 and Tier 2 vendors before contract execution. Request the following documentation: (a) most recent SOC 2 Type II or equivalent audit report (HITRUST, ISO 27001); (b) HIPAA compliance attestation or BAA; (c) most recent penetration test report (within 12 months); (d) data breach history (past 3 years); (e) security policy summary; (f) incident response capability description; (g) subcontractor/subprocessor list. The responsible role is IT Director / CISO; the stated timing is Before contract execution; vendor has 10 business days to respond.. Review vendor responses and complete the Vendor Security Assessment Report (Appendix C). Score. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, APPENDICES. Appendix A — Vendor Security Assessment Registry Care Indeed Home Health Care, Inc. | Policy Reference: IT-SA-004 | Version: 6.0 | Date: 2025-07-10 Vendor Name: Service Provided. Source or operational basis: Risk Tier (1/2/3). __________: EHR System. Source or operational basis: 1. __________: Cloud Backup. Source or operational basis: 1. __________: IT Support / MSP. Source or operational basis: 2. __________: __________. Source or operational basis: __________. Registry Maintained By: __________________________ Last Updated: __________________________ Appendix B — Vendor Security Questionnaire Care Indeed Home Health Care, Inc. | Policy Reference: IT-SA-004 | Version: 6.0 | Date: 2025-07-10 Instructions for Vendor: Please complete all applicable sections and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, Vendor Risk Tiering and Assessment Requirements. Classify each vendor into a risk tier: Tier 1 (High) — direct access to ePHI or ePHI systems (EHR vendor, cloud backup, email provider with ePHI); Tier 2 (Medium) — access to agency systems without direct ePHI access (network management, IT support); Tier 3 (Low) — no system or data access (hardware delivery, office supplies). The responsible role is IT Director / CISO; the stated timing is At initial vendor onboarding and reviewed annually.. Determine assessment requirements by tier: Tier 1 — full security assessment + BAA required; Tier 2 — abbreviated assessment + standard data handling agreement; Tier 3 — no security assessment required.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, Ongoing Vendor Security Monitoring. Conduct annual reassessment of all Tier 1 vendors. Request updated security documentation annually. The responsible role is IT Director / CISO; the stated timing is Annually; initiated 60 days before contract renewal.. Monitor vendor security breach notifications and public disclosures continuously. Subscribe to cybersecurity news sources covering major cloud providers and healthcare IT vendors. The responsible role is IT Director / CISO; the stated timing is Continuous.. Review all vendor remote access events in audit logs monthly per IT-DR-003. Verify that vendor access is limited to authorized activities and times. The responsible role is IT Director / CISO; the stated timing is Monthly.. Revoke vendor. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to security/privacy assessment and least-necessary access. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR § 1001" },
      { kind: "External Authority", text: "42 CFR §484.105(d)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "contract-portfolio-4-1", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 14, y: 38, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security/privacy assessment and least-necessary access." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for security/privacy assessment and least-necessary access. This decide option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security/privacy assessment and least-necessary access." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during security/privacy assessment and least-necessary access.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security/privacy assessment and least-necessary access." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "vendor-credential-packet-4-2", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 34, y: 50, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in security/privacy assessment and least-necessary access. This identify option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security/privacy assessment and least-necessary access." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security/privacy assessment and least-necessary access." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during security/privacy assessment and least-necessary access.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security/privacy assessment and least-necessary access." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "secure-access-badge-4-3", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for security/privacy assessment and least-necessary access." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during security/privacy assessment and least-necessary access." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during security/privacy assessment and least-necessary access.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for security/privacy assessment and least-necessary access." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for security/privacy assessment and least-necessary access. Identify the verified status, discrepancy, affected requirement, and accountable owner for security/privacy assessment and least-necessary access by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for security/privacy assessment and least-necessary access. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Ongoing",
    title: "Ongoing performance, credential, sanction, and incident monitoring",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for ongoing performance, credential, sanction, and incident monitoring within Contracts, Vendors & Business Associates. Begin with the current controlled versions of GV-EA-001, OP-FM-003, CO-BA-101, IT-SA-004, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-001, Contract Monitoring and Performance Oversight. Monitor contractor performance on an ongoing basis, including: (a) quality and timeliness of services; (b) compliance with applicable agency policies; (c) staff competency and credential currency (for clinical contractors); (d) incident and complaint rates. The responsible role is Responsible Department Lead; the stated timing is Ongoing; formal performance documentation quarterly.. Conduct an annual formal review of all active contracts for: (a) performance against contractual standards; (b) cost and value; (c) compliance with law and agency policy; (d) renewal, modification, or termination decisions. The responsible role is Administrator; the stated timing is Annually; within 60 calendar days of each contract's anniversary date.. Conduct or commission an. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Annual Vendor Performance Evaluation. Conduct an annual performance evaluation for all vendors on the AVL using the Vendor Performance Evaluation Form (Appendix E). Evaluate: (a) quality of goods/services; (b) timeliness of delivery; (c) responsiveness to issues; (d) pricing competitiveness; (e) compliance and exclusion screening results; (f) insurance currency; (g) overall satisfaction. The responsible role is Operations Director; the stated timing is Annually; within 60 days of contract anniversary or fiscal year end.. Assign a performance rating: SATISFACTORY — Vendor meets or exceeds expectations. Continue relationship. NEEDS IMPROVEMENT — Vendor has documented deficiencies. Issue a Vendor Corrective Action Notice (Appendix F) with a 30-day improvement timeline. UNSATISFACTORY — Vendor has. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Ongoing Vendor Monitoring. Screen all active vendors against the OIG LEIE and SAM exclusion databases monthly. Document screening results. If a vendor is found to be excluded, immediately notify the Operations Director and Administrator. Cease all transactions with the excluded vendor within 24 hours. The responsible role is Compliance Officer; the stated timing is Monthly; immediate action upon exclusion finding.. Verify that all vendor insurance certificates remain current. Request updated certificates at least 30 days before expiration. Suspend services from any vendor with lapsed insurance. The responsible role is Operations Director; the stated timing is 30 days before expiration; suspension upon lapse.. Monitor vendor performance on an ongoing. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-BA-101, Ongoing Monitoring. Conduct annual reviews of all Tier 1 business associates including: (a) revalidation of services and PHI access scope; (b) OIG/SAM re-screening; (c) confirmation that vendor security controls remain adequate; (d) review of any reported incidents or breaches. The responsible role is Compliance Officer; the stated timing is Annually.. Conduct biennial reviews of Tier 2 business associates. The responsible role is Compliance Officer; the stated timing is Biennially.. Verify BAA renewal or renegotiation prior to expiration for all active business associates. The responsible role is Compliance Officer; the stated timing is At least 60 calendar days prior to BAA expiration.. Report the status of all business. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — IT-SA-004, Ongoing Vendor Security Monitoring. Conduct annual reassessment of all Tier 1 vendors. Request updated security documentation annually. The responsible role is IT Director / CISO; the stated timing is Annually; initiated 60 days before contract renewal.. Monitor vendor security breach notifications and public disclosures continuously. Subscribe to cybersecurity news sources covering major cloud providers and healthcare IT vendors. The responsible role is IT Director / CISO; the stated timing is Continuous.. Review all vendor remote access events in audit logs monthly per IT-DR-003. Verify that vendor access is limited to authorized activities and times. The responsible role is IT Director / CISO; the stated timing is Monthly.. Revoke vendor. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to ongoing performance, credential, sanction, and incident monitoring. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR §484.105(d)" },
      { kind: "External Authority", text: "42 CFR §484.105(e)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "vendor-credential-packet-5-1", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in ongoing performance, credential, sanction, and incident monitoring. This identify option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ongoing performance, credential, sanction, and incident monitoring." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ongoing performance, credential, sanction, and incident monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ongoing performance, credential, sanction, and incident monitoring." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "secure-access-badge-5-2", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 47, y: 65, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ongoing performance, credential, sanction, and incident monitoring." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ongoing performance, credential, sanction, and incident monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ongoing performance, credential, sanction, and incident monitoring." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "contract-portfolio-5-3", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 82, y: 38, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for ongoing performance, credential, sanction, and incident monitoring." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for ongoing performance, credential, sanction, and incident monitoring. This decide option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during ongoing performance, credential, sanction, and incident monitoring." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during ongoing performance, credential, sanction, and incident monitoring.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for ongoing performance, credential, sanction, and incident monitoring." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for ongoing performance, credential, sanction, and incident monitoring. Identify the verified status, discrepancy, affected requirement, and accountable owner for ongoing performance, credential, sanction, and incident monitoring by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for ongoing performance, credential, sanction, and incident monitoring. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Breach",
    title: "Breach, service failure, dispute, remediation, and termination escalation",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for breach, service failure, dispute, remediation, and termination escalation within Contracts, Vendors & Business Associates. Begin with the current controlled versions of CO-BA-101, GV-EA-001, OP-FM-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — CO-BA-101, Termination and Offboarding. Upon termination of a business associate relationship, issue a written notice to the business associate requiring: (a) return or destruction of all PHI, including PHI held by subcontractors; (b) written certification of return/destruction within 30 calendar days. The responsible role is Compliance Officer / Contract Owner; the stated timing is At termination.. Revoke all system access, VPN credentials, and remote access for the terminated business associate. The responsible role is IT Director / CISO; the stated timing is Within 24 hours of termination.. Update the Business Associate Master Registry to reflect termination, including: (a) termination date; (b) PHI return/destruction certification date; (c) access revocation confirmation.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Renewal and Termination. Maintain a contract renewal calendar (Appendix B) with notification alerts 90 calendar days before each contract's expiration date. The responsible role is Administrator; the stated timing is Alerts generated 90 days before expiration.. Review each expiring contract 60 calendar days before expiration to determine: (a) renewal with same terms; (b) renewal with negotiated modifications; (c) competitive replacement; or (d) termination. The responsible role is Administrator; the stated timing is 60 calendar days before expiration.. Material contract renewals and terminations shall be reviewed and approved per the approval authority in Section 6.2. The responsible role is Administrator; the stated timing is Prior to renewal execution or. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-003, Vendor Termination. Terminate vendor relationships when: (a) the vendor receives an UNSATISFACTORY performance rating and does not improve; (b) the vendor or its principals are found on the OIG/SAM exclusion list; (c) the vendor fails to maintain required insurance; (d) the vendor violates contract terms; (e) the vendor poses a risk to patient safety; (f) the agency no longer requires the vendor's goods or services. The responsible role is Operations Director; the stated timing is Per contract termination provisions; immediate for exclusion or patient safety.. Document the termination reason. Notify the vendor in writing. Remove the vendor from the AVL. Ensure a replacement vendor is identified and. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — CO-BA-101, Breach Responsibility. Ensure all BAAs require the business associate to report suspected or confirmed breaches to the agency without unreasonable delay, and in no event later than 30 calendar days after discovery. The responsible role is Compliance Officer; the stated timing is At BAA execution.. Upon receiving a breach notification from a business associate, initiate the agency's breach response per CO-IR-101, including HIPAA 4-factor risk assessment and California breach notification if applicable. The responsible role is Compliance Officer; the stated timing is Within 24 hours of notification receipt... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Escalation and Exception Handling. Contractor appears on OIG/SAM exclusion list: Administrator notifies Compliance Officer immediately.. Source or operational basis: Suspend services pending investigation; notify payers as required; document in Compliance file.. Contract dispute or threatened litigation: Administrator engages Legal Counsel per GV-EA-003 and notifies Governing Body Chair.. Source or operational basis: Legal Counsel leads response; Governing Body informed at next meeting or special meeting if urgent.. Material contract executed without Governing Body approval: Administrator documents the circumstances and presents for ratification.. Source or operational basis: Emergency ratification at next Governing Body meeting; process failure reviewed by Compliance Officer... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to breach, service failure, dispute, remediation, and termination escalation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR §484.105(e)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "secure-access-badge-6-1", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 14, y: 63, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for breach, service failure, dispute, remediation, and termination escalation." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during breach, service failure, dispute, remediation, and termination escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for breach, service failure, dispute, remediation, and termination escalation." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "contract-portfolio-6-2", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 33, y: 40, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for breach, service failure, dispute, remediation, and termination escalation." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for breach, service failure, dispute, remediation, and termination escalation. This decide option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during breach, service failure, dispute, remediation, and termination escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for breach, service failure, dispute, remediation, and termination escalation." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "vendor-credential-packet-6-3", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 79, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in breach, service failure, dispute, remediation, and termination escalation. This identify option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for breach, service failure, dispute, remediation, and termination escalation." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during breach, service failure, dispute, remediation, and termination escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during breach, service failure, dispute, remediation, and termination escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for breach, service failure, dispute, remediation, and termination escalation." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for breach, service failure, dispute, remediation, and termination escalation. Identify the verified status, discrepancy, affected requirement, and accountable owner for breach, service failure, dispute, remediation, and termination escalation by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for breach, service failure, dispute, remediation, and termination escalation. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Contrac",
    title: "Contract repository, renewal calendar, dashboard, and board reporting",
    subtitle: "Contracts, Vendors & Business Associates",
    narration: [
      "This lesson develops administrator judgment for contract repository, renewal calendar, dashboard, and board reporting within Contracts, Vendors & Business Associates. Begin with the current controlled versions of GV-EA-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Controlled source application — GV-EA-001, Contract Initiation and Review. Submit a Contract Request Form (Appendix A) to the Administrator for any proposed new contract or agreement. The form must identify: (a) the proposed contractor or partner; (b) the scope of services; (c) estimated annual value; (d) whether the contract involves patient care, PHI access, or regulatory compliance obligations; (e) proposed term and renewal provisions. The responsible role is Initiating Department Lead / Administrator; the stated timing is Prior to initiating any contract negotiation or commitment.. Review each proposed contract for: (a) necessity and alignment with agency scope of services; (b) potential Anti-Kickback or Stark Law implications (consult Legal Counsel per GV-EA-003 for referral-related contracts). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Renewal and Termination. Maintain a contract renewal calendar (Appendix B) with notification alerts 90 calendar days before each contract's expiration date. The responsible role is Administrator; the stated timing is Alerts generated 90 days before expiration.. Review each expiring contract 60 calendar days before expiration to determine: (a) renewal with same terms; (b) renewal with negotiated modifications; (c) competitive replacement; or (d) termination. The responsible role is Administrator; the stated timing is 60 calendar days before expiration.. Material contract renewals and terminations shall be reviewed and approved per the approval authority in Section 6.2. The responsible role is Administrator; the stated timing is Prior to renewal execution or. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Execution. Execute the contract after all required reviews and approvals are complete. No contract shall be executed prior to completion of OIG/SAM screening of the contractor. The responsible role is Administrator; the stated timing is Upon completion of all required reviews and approvals.. File a fully executed copy of each contract in the Contract Register and assign a contract ID. Notify the initiating department of execution and provide relevant operational sections to staff who will interface with the contractor. The responsible role is Administrator; the stated timing is Within 3 business days of execution.. If the contract involves PHI access, confirm that a fully executed BAA. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Monitoring and Performance Oversight. Monitor contractor performance on an ongoing basis, including: (a) quality and timeliness of services; (b) compliance with applicable agency policies; (c) staff competency and credential currency (for clinical contractors); (d) incident and complaint rates. The responsible role is Responsible Department Lead; the stated timing is Ongoing; formal performance documentation quarterly.. Conduct an annual formal review of all active contracts for: (a) performance against contractual standards; (b) cost and value; (c) compliance with law and agency policy; (d) renewal, modification, or termination decisions. The responsible role is Administrator; the stated timing is Annually; within 60 calendar days of each contract's anniversary date.. Conduct or commission an. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — GV-EA-001, Contract Approval Authority. Contract Category: Approval Authority. Source or operational basis: Documentation. Non-material contracts (annual value <$25,000, no patient care/PHI/compliance implications): Administrator sole approval. Source or operational basis: Signed contract retained in Contract Register.. Material contracts (annual value ≥$25,000, or involving patient care/PHI/regulatory compliance): Administrator recommendation; Governing Body approval at next regular or special meeting.. Source or operational basis: Documented in Governing Body minutes; signed contract in Contract Register.. Emergency contracts (urgent operational need, cannot wait for next Governing Body meeting): Administrator executes; Governing Body ratification at next meeting within 30 calendar days.. Source or operational basis: Written notification to Governing Body Chair within 48 hours; ratification documented. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to contract repository, renewal calendar, dashboard, and board reporting. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "contract portfolio", detail: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "vendor credential packet", detail: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "secure access badge", detail: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "GV-EA-001" },
      { kind: "Controlled Policy", text: "OP-FM-003" },
      { kind: "Controlled Policy", text: "CO-HP-005" },
      { kind: "Controlled Policy", text: "CO-BA-101" },
      { kind: "Controlled Policy", text: "IT-SA-004" },
      { kind: "Controlled Policy", text: "RM-ER-004" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.80(h)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "contract-portfolio-7-1", label: "contract portfolio", shortLabel: "contract portfolio", ariaLabel: "Investigate contract portfolio",
        x: 20, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status." },
          { id: "i2", label: "Treat contract portfolio as complete proof without comparing vendor credential packet or the controlled source. This identify option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract repository, renewal calendar, dashboard, and board reporting." },
          { id: "i3", label: "Classify the contract portfolio by department custom even though its authority and current status are unverified. This identify option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about contract portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve contract portfolio on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for contract portfolio is resolved." },
          { id: "d3", label: "Send contract portfolio to an unrelated department rather than the policy owner responsible for contract repository, renewal calendar, dashboard, and board reporting. This decide option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For contract portfolio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For contract portfolio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that contract portfolio was reviewed, without source version, finding, decision, owner, or status. This document option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of contract portfolio." },
          { id: "doc3", label: "Keep the contract portfolio decision in personal notes rather than the governed evidence location. This document option concerns contract portfolio during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        feedback: {
          observed: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
          meaning: "Observe the real contract portfolio in the photographed scene. Compare it with the vendor credential packet, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For contract portfolio, compare the visible evidence with vendor credential packet and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to contract portfolio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For contract portfolio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "vendor-credential-packet-7-2", label: "vendor credential packet", shortLabel: "vendor credential packet", ariaLabel: "Investigate vendor credential packet",
        x: 54, y: 70, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status." },
          { id: "i2", label: "Assume vendor credential packet applies to every role, location, and exception described in contract repository, renewal calendar, dashboard, and board reporting. This identify option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract repository, renewal calendar, dashboard, and board reporting." },
          { id: "i3", label: "Use the oldest available vendor credential packet because prior approval is easier to confirm. This identify option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about vendor credential packet." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in vendor credential packet remains unresolved. This decide option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for vendor credential packet is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to vendor credential packet. This decide option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For vendor credential packet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark vendor credential packet closed on assignment, before completion and effectiveness evidence exist. This document option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of vendor credential packet." },
          { id: "doc3", label: "Retain only a summary of vendor credential packet and discard the source artifact needed to reconstruct the decision. This document option concerns vendor credential packet during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        feedback: {
          observed: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
          meaning: "Observe the real vendor credential packet in the photographed scene. Compare it with the secure access badge, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For vendor credential packet, compare the visible evidence with secure access badge and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to vendor credential packet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For vendor credential packet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
      {
        id: "secure-access-badge-7-3", label: "secure access badge", shortLabel: "secure access badge", ariaLabel: "Investigate secure access badge",
        x: 82, y: 45, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status." },
          { id: "i2", label: "Read secure access badge only for favorable indicators and omit the exception evidence connected to contract portfolio. This identify option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for contract repository, renewal calendar, dashboard, and board reporting." },
          { id: "i3", label: "Treat an unsigned or unverified secure access badge as equivalent to the current controlled record. This identify option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about secure access badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close secure access badge when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for secure access badge is resolved." },
          { id: "d3", label: "Defer the secure access badge decision to a routine future cycle even though current operations depend on it. This decide option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For secure access badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For secure access badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for secure access badge but omit the actual evidence, communications, and unresolved items. This document option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of secure access badge." },
          { id: "doc3", label: "Combine secure access badge with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns secure access badge during contract repository, renewal calendar, dashboard, and board reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for contract repository, renewal calendar, dashboard, and board reporting." },
        ],
        feedback: {
          observed: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting.",
          meaning: "Observe the real secure access badge in the photographed scene. Compare it with the contract portfolio, current controlled sources, assigned decision rights, and corroborating records for contract repository, renewal calendar, dashboard, and board reporting. Identify the verified status, discrepancy, affected requirement, and accountable owner for contract repository, renewal calendar, dashboard, and board reporting by reconciling all three photographed evidence objects with the current controlled source. For secure access badge, compare the visible evidence with contract portfolio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. Apply that decision specifically to secure access badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for contract repository, renewal calendar, dashboard, and board reporting. For secure access badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["GV-EA-001","OP-FM-003","CO-HP-005","CO-BA-101","IT-SA-004","RM-ER-004","42 CFR Part 484","42 CFR § 484.105","45 CFR","42 CFR § 1001","42 CFR §484.105(d)","42 CFR §484.105(e)","42 CFR §484.110","42 CFR §484.80(h)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During vendor need, due diligence, conflicts, and approval authority, the secure access badge evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority.",
      "Treat secure access badge as final approval because the artifact exists during vendor need, due diligence, conflicts, and approval authority.",
      "Send secure access badge to an unrelated department rather than the policy owner responsible for vendor need, due diligence, conflicts, and approval authority. This option concerns vendor need, due diligence, conflicts, and approval authority.",
      "Approve secure access badge on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns vendor need, due diligence, conflicts, and approval authority.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in vendor need, due diligence, conflicts, and approval authority. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 2,
    stem: "During contract scope, performance, compliance, insurance, and termination clauses, the contract portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in contract portfolio remains unresolved. This option concerns contract scope, performance, compliance, insurance, and termination clauses.",
      "Replace the controlling requirement with an informal local workaround tailored to contract portfolio. This option concerns contract scope, performance, compliance, insurance, and termination clauses.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses.",
      "Treat contract portfolio as final approval because the artifact exists during contract scope, performance, compliance, insurance, and termination clauses.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract scope, performance, compliance, insurance, and termination clauses. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 3,
    stem: "During business-associate determination and baa execution before phi, the vendor credential packet evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the vendor credential packet decision to a routine future cycle even though current operations depend on it. This option concerns business-associate determination and baa execution before phi.",
      "Treat vendor credential packet as final approval because the artifact exists during business-associate determination and baa execution before phi.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi.",
      "Close vendor credential packet when work is submitted, without testing whether the correction changed the intended outcome. This option concerns business-associate determination and baa execution before phi.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in business-associate determination and baa execution before phi. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 4,
    stem: "During security/privacy assessment and least-necessary access, the secure access badge evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve secure access badge on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns security/privacy assessment and least-necessary access.",
      "Treat secure access badge as final approval because the artifact exists during security/privacy assessment and least-necessary access.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access.",
      "Send secure access badge to an unrelated department rather than the policy owner responsible for security/privacy assessment and least-necessary access. This option concerns security/privacy assessment and least-necessary access.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in security/privacy assessment and least-necessary access. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 5,
    stem: "During ongoing performance, credential, sanction, and incident monitoring, the contract portfolio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring.",
      "Treat contract portfolio as final approval because the artifact exists during ongoing performance, credential, sanction, and incident monitoring.",
      "Replace the controlling requirement with an informal local workaround tailored to contract portfolio. This option concerns ongoing performance, credential, sanction, and incident monitoring.",
      "Allow the affected activity to expand while the exception in contract portfolio remains unresolved. This option concerns ongoing performance, credential, sanction, and incident monitoring.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in ongoing performance, credential, sanction, and incident monitoring. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 6,
    stem: "During breach, service failure, dispute, remediation, and termination escalation, the vendor credential packet evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the vendor credential packet decision to a routine future cycle even though current operations depend on it. This option concerns breach, service failure, dispute, remediation, and termination escalation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation.",
      "Close vendor credential packet when work is submitted, without testing whether the correction changed the intended outcome. This option concerns breach, service failure, dispute, remediation, and termination escalation.",
      "Treat vendor credential packet as final approval because the artifact exists during breach, service failure, dispute, remediation, and termination escalation.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in breach, service failure, dispute, remediation, and termination escalation. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 7,
    stem: "During contract repository, renewal calendar, dashboard, and board reporting, the secure access badge evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve secure access badge on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns contract repository, renewal calendar, dashboard, and board reporting.",
      "Send secure access badge to an unrelated department rather than the policy owner responsible for contract repository, renewal calendar, dashboard, and board reporting. This option concerns contract repository, renewal calendar, dashboard, and board reporting.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting.",
      "Treat secure access badge as final approval because the artifact exists during contract repository, renewal calendar, dashboard, and board reporting.",
    ],
    correct: 2,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in contract repository, renewal calendar, dashboard, and board reporting. The decision remains traceable to GV-EA-001, OP-FM-003, CO-HP-005, CO-BA-101, IT-SA-004, RM-ER-004.",
  },
  {
    id: 8,
    stem: "How should 42 CFR Part 484 be used within Contracts, Vendors & Business Associates?",
    options: [
      "Apply the citation outside its stated subject and scope.",
      "Treat a citation label as proof that every operational detail is current.",
      "Use the current external requirement together with the controlled agency policy and document any conflict resolution.",
      "Replace the controlled agency policies with course narration.",
    ],
    correct: 2,
    rationale: "Visible external citations support traceability, while current controlled policy and verified applicability govern operational use.",
  },
  {
    id: 9,
    stem: "What links vendor credential packet and vendor credential packet into an accountable Contracts, Vendors & Business Associates control?",
    options: [
      "A familiar dashboard color without source validation.",
      "An unversioned local worksheet with no assigned reviewer.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
      "A verbal understanding that no exception will recur.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Contracts, Vendors & Business Associates establish?",
    options: [
      "Automatic appointment authority for every decision described in Contracts, Vendors & Business Associates.",
      "Observed operational competency without an authorized evaluator.",
      "Knowledge of the controlled administrator concepts in Contracts, Vendors & Business Associates, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Permission to replace the controlled policies with the Contracts, Vendors & Business Associates quiz result.",
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





const STORAGE_KEY = 'adm-014-progress-v6000';



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



export default function ADM014() {

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

          <span className="brand-text">ADM-014 — Contracts & Vendors</span>

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
