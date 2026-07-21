/**
 * ADM-011 — Emergency Operations & Continuity
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

import img01 from './assets/adm-011/adm-011-lesson-01.png';
import img02 from './assets/adm-011/adm-011-lesson-02.png';
import img03 from './assets/adm-011/adm-011-lesson-03.png';
import img04 from './assets/adm-011/adm-011-lesson-04.png';
import img05 from './assets/adm-011/adm-011-lesson-05.png';
import img06 from './assets/adm-011/adm-011-lesson-06.png';
import img07 from './assets/adm-011/adm-011-lesson-07.png';



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



const MODULE_META = { id: "ADM-011", title: "Emergency Operations & Continuity", pages: 7, quizCount: 10, passing: 80 };



const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health administration training scene for All-hazards risk assessment and emergency program governance, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Patient risk classification and continuity priorities, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Command structure, decision rights, communication, and activation, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Staffing, vendors, utilities, IT, records, medications, and supply continuity, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Evacuation, shelter-in-place, patient tracking, and external coordination, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Training, exercises, after-action review, and corrective action, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health administration training scene for Plan maintenance, governing-body approval, and readiness evidence, with realistic people, environment, documents, and three physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 All-haz",
    title: "All-hazards risk assessment and emergency program governance",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for all-hazards risk assessment and emergency program governance within Emergency Operations & Continuity. Begin with the current controlled versions of RM-EP-001, OP-FM-005, RM-EP-003, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — RM-EP-001, All-Hazards Risk Assessment. Conduct a written all-hazards risk assessment covering the agency's full geographic service area. The assessment shall identify: (a) natural hazards likely in the service area (Bay Area service-region context: earthquake, wildfire, flood, landslide, extreme heat event, local electric utility Public Safety Power Shutoff (PSPS) events, wildfire wind and smoke events); (b) man-made hazards (power grid failure, civil unrest, terrorism, regional contamination, water supply disruption); (c) public health hazards (pandemic influenza, novel pathogen emergence, regional outbreak); (d) technology hazards (EHR system failure, cybersecurity incident, telecommunications outage). The responsible role is Administrator / Risk Manager; the stated timing is Completed annually as a Care Indeed agency standard. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-001, Emergency Communication Plan. Maintain a current, printed Emergency Contact Directory (Appendix D) that is distributed to all supervisors and updated at least annually (or within 14 days of any contact change). The directory must contain: (a) All agency staff with primary and secondary phone contact methods; (b) Governing Body members; (c) Medicare Administrative Contractor (CGS or Palmetto, as applicable); (d) California Department of Public Health HCAI regional contact; (e) Cal OES State Operations Center (916-845-8911); (f) Local emergency management agency; (g) Local fire and law enforcement non-emergency lines; (h) HHA accreditation body (if applicable); (i) Key vendors (medical supply, pharmacy, EHR vendor). The responsible role is Administrator; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Emergency Activation and Response. Activate the Emergency Preparedness Plan when any of the following occurs: (a) a federal, state, or local emergency is declared affecting the agency's service area; (b) an event occurs that threatens the immediate safety of patients or staff; (c) the agency's ability to deliver essential services is disrupted; (d) the agency office becomes inaccessible or uninhabitable; (e) the IT/EHR system is down for more than 4 hours; (f) a public health emergency is declared (also activates OP-SL-006). The responsible role is Any Staff Member / Incident Commander; the stated timing is Immediately upon triggering event.. Upon activation: (a) assess the scope and severity of the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-003, 3\\. Policy Statements. 3.1 Patient Risk Assessment: At admission, the admitting RN shall complete a Patient Emergency Risk Assessment as part of the standard intake process. The assessment shall document: (a) Electrical-dependent equipment in use (oxygen concentrator, ventilator, suction machine, hospital bed, lifts); (b) Mobility status: ambulatory, wheelchair-dependent, bed-bound, ability to self-evacuate; (c) Communication limitations: language, hearing, vision, cognitive impairment; (d) Social support: emergency contact name, relationship, phone number; availability of caregiver; (e) Geographic risk: location in flood zone, wildfire risk area, or mobile home/manufactured housing; (f) Utility dependency: whether equipment or medications require refrigeration. 3.2 Patient Emergency Communication System: The agency shall maintain a current patient census. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to all-hazards risk assessment and emergency program governance. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.102" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "emergency-go-kit-1-1", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for all-hazards risk assessment and emergency program governance." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for all-hazards risk assessment and emergency program governance. This decide option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during all-hazards risk assessment and emergency program governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for all-hazards risk assessment and emergency program governance." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "bay-area-regional-map-1-2", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 37, y: 61, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in all-hazards risk assessment and emergency program governance. This identify option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for all-hazards risk assessment and emergency program governance." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during all-hazards risk assessment and emergency program governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for all-hazards risk assessment and emergency program governance." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "two-way-radio-1-3", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 80, y: 49, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for all-hazards risk assessment and emergency program governance." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during all-hazards risk assessment and emergency program governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during all-hazards risk assessment and emergency program governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for all-hazards risk assessment and emergency program governance." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for all-hazards risk assessment and emergency program governance. Identify the verified status, discrepancy, affected requirement, and accountable owner for all-hazards risk assessment and emergency program governance by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for all-hazards risk assessment and emergency program governance. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Patient",
    title: "Patient risk classification and continuity priorities",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for patient risk classification and continuity priorities within Emergency Operations & Continuity. Begin with the current controlled versions of RM-EP-001, OP-SL-006, RM-EP-003, OP-FM-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — RM-EP-001, Patient Vulnerability Assessment and Prioritization. At admission, complete the Patient Emergency Preparedness Vulnerability Assessment (Appendix A) for every patient. The assessment shall document: (a) patient reliance on electrically powered medical equipment (ventilator, oxygen concentrator, IV infusion pump, electric hospital bed, stair lift); (b) patient mobility limitations (non-ambulatory, wheelchair-dependent, unable to self-evacuate); (c) patient cognitive limitations affecting self-protective action; (d) patient's access to emergency contacts or caregivers; (e) geographic risk of the patient's location (flood zone, high fire hazard area, hillside property). The responsible role is Admitting Clinician; the stated timing is At admission; reviewed at each recertification or significant change in condition.. Maintain a current list of all Essential Patients. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-001, All-Hazards Risk Assessment. Conduct a written all-hazards risk assessment covering the agency's full geographic service area. The assessment shall identify: (a) natural hazards likely in the service area (Bay Area service-region context: earthquake, wildfire, flood, landslide, extreme heat event, local electric utility Public Safety Power Shutoff (PSPS) events, wildfire wind and smoke events); (b) man-made hazards (power grid failure, civil unrest, terrorism, regional contamination, water supply disruption); (c) public health hazards (pandemic influenza, novel pathogen emergence, regional outbreak); (d) technology hazards (EHR system failure, cybersecurity incident, telecommunications outage). The responsible role is Administrator / Risk Manager; the stated timing is Completed annually as a Care Indeed agency standard. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-SL-006, Patient Triage and Prioritization. Categorize all active patients using the Patient Acuity Triage Tool (Appendix A): PRIORITY 1 — Critical (must receive in-person visits; life-threatening if service interrupted); PRIORITY 2 — High (requires in-person visits; significant risk if delayed > 48 hours); PRIORITY 3 — Moderate (may be served via telehealth with periodic in-person visits); PRIORITY 4 — Low (may be temporarily managed via telehealth only with monitoring). The responsible role is Director of Nursing; the stated timing is Within 48 hours of activation.. Reassess patient prioritization weekly during the emergency. Adjust categories as patient conditions change. The responsible role is Director of Nursing; the stated timing is Weekly... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-003, 3\\. Policy Statements. 3.1 Patient Risk Assessment: At admission, the admitting RN shall complete a Patient Emergency Risk Assessment as part of the standard intake process. The assessment shall document: (a) Electrical-dependent equipment in use (oxygen concentrator, ventilator, suction machine, hospital bed, lifts); (b) Mobility status: ambulatory, wheelchair-dependent, bed-bound, ability to self-evacuate; (c) Communication limitations: language, hearing, vision, cognitive impairment; (d) Social support: emergency contact name, relationship, phone number; availability of caregiver; (e) Geographic risk: location in flood zone, wildfire risk area, or mobile home/manufactured housing; (f) Utility dependency: whether equipment or medications require refrigeration. 3.2 Patient Emergency Communication System: The agency shall maintain a current patient census. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Business Continuity. During LEVEL 2 and 3 emergencies, implement the Business Continuity Plan. Essential functions and their Recovery Time Objectives: The responsible role is Incident Commander / EMT; the stated timing is Immediately upon activation.. Essential Functions and Recovery Time Objectives: Essential Function: RTO. Source or operational basis: Continuity Strategy. Patient care for Priority 1 patients: 0 hours (no interruption). Source or operational basis: Pre-identified backup clinicians; geographic reassignment; partner agency agreements. Patient care for Priority 2 patients: 24 hours. Source or operational basis: Prioritized scheduling; telehealth if available. On-call / after-hours services: 0 hours (no interruption). Source or operational basis: On-call clinician continues; backup on-call designated.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to patient risk classification and continuity priorities. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.102(a)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "bay-area-regional-map-2-1", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in patient risk classification and continuity priorities. This identify option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient risk classification and continuity priorities." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient risk classification and continuity priorities." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during patient risk classification and continuity priorities.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient risk classification and continuity priorities." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "two-way-radio-2-2", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient risk classification and continuity priorities." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient risk classification and continuity priorities." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during patient risk classification and continuity priorities.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient risk classification and continuity priorities." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "emergency-go-kit-2-3", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for patient risk classification and continuity priorities." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for patient risk classification and continuity priorities. This decide option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during patient risk classification and continuity priorities." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during patient risk classification and continuity priorities.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient risk classification and continuity priorities." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for patient risk classification and continuity priorities. Identify the verified status, discrepancy, affected requirement, and accountable owner for patient risk classification and continuity priorities by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for patient risk classification and continuity priorities. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Command",
    title: "Command structure, decision rights, communication, and activation",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for command structure, decision rights, communication, and activation within Emergency Operations & Continuity. Begin with the current controlled versions of OP-FM-005, OP-SL-006, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — OP-FM-005, Emergency Activation and Response. Activate the Emergency Preparedness Plan when any of the following occurs: (a) a federal, state, or local emergency is declared affecting the agency's service area; (b) an event occurs that threatens the immediate safety of patients or staff; (c) the agency's ability to deliver essential services is disrupted; (d) the agency office becomes inaccessible or uninhabitable; (e) the IT/EHR system is down for more than 4 hours; (f) a public health emergency is declared (also activates OP-SL-006). The responsible role is Any Staff Member / Incident Commander; the stated timing is Immediately upon triggering event.. Upon activation: (a) assess the scope and severity of the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Deactivation and Recovery. Deactivate the EPP when: (a) the triggering event has resolved; (b) the agency can safely resume normal operations; (c) all essential functions have been restored. The responsible role is Incident Commander; the stated timing is When conditions warrant.. Upon deactivation: (a) notify all staff of return to normal operations; (b) notify all patients of service restoration; (c) notify external entities previously contacted; (d) begin recovery operations. The responsible role is Incident Commander; the stated timing is Within 4 hours of deactivation decision.. Coordinate recovery: (a) restore all services to normal levels; (b) reschedule all missed visits within 48 hours per OP-SL-001; (c) complete all paper. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Emergency Communication Plan. Maintain the following emergency contact lists, updated at least quarterly: (a) All staff — home phone, cell phone, email, home address; (b) All active patients — phone, emergency contact, address, priority level; (c) EMT members — all contact methods; (d) Key external contacts — local emergency management, fire department, police, hospital emergency departments, CMS Regional Office, California HCAI, MAC, utility companies, vendor emergency contacts. The responsible role is Operations Director; the stated timing is Updated quarterly; after any personnel/patient change.. During activation, communicate with patients per RM-EP-003 using the following priority: (1) Priority 1 patients — direct phone call within 4 hours; (2) Priority 2. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-SL-006, Activation of Public Health Emergency Protocols. Monitor public health advisories from CDC, CMS, California DPH, and local health departments. Activate the agency's Public Health Emergency Protocol when: (a) a federal, state, or local public health emergency is declared; (b) a local infectious disease outbreak threatens staff or patient safety; (c) CMS issues emergency waivers or flexibilities. The responsible role is Administrator; the stated timing is Continuous monitoring; activation within 24 hours of triggering event.. Convene the Emergency Management Team (Administrator, Director of Nursing, Operations Director, Compliance Officer) to assess the situation and develop the response plan. The responsible role is Administrator; the stated timing is Within 24 hours of activation.. Notify. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Emergency Management Team and Command Structure. Designate the Emergency Management Team (EMT). The EMT shall include: (a) Incident Commander — Administrator (primary), Operations Director (alternate); (b) Clinical Operations Lead — Director of Nursing / Clinical Manager; (c) Logistics Lead — Operations Director; (d) Communications Lead — Administrator or designee; (e) IT/Systems Lead — IT Director/CISO; (f) Compliance Lead — Compliance Officer; (g) HR Lead — HR Director. The responsible role is Administrator; the stated timing is At plan development; updated within 14 days of any personnel change.. Ensure all EMT members understand their emergency roles and have 24/7 contact information for all team members. Maintain an Emergency Contact Card (Appendix B). Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to command structure, decision rights, communication, and activation. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.102(a)" },
      { kind: "External Authority", text: "42 CFR § 484.102(b)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "two-way-radio-3-1", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 14, y: 44, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for command structure, decision rights, communication, and activation." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during command structure, decision rights, communication, and activation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during command structure, decision rights, communication, and activation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for command structure, decision rights, communication, and activation." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "emergency-go-kit-3-2", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 36, y: 40, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for command structure, decision rights, communication, and activation." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for command structure, decision rights, communication, and activation. This decide option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during command structure, decision rights, communication, and activation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during command structure, decision rights, communication, and activation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for command structure, decision rights, communication, and activation." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "bay-area-regional-map-3-3", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in command structure, decision rights, communication, and activation. This identify option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for command structure, decision rights, communication, and activation." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during command structure, decision rights, communication, and activation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during command structure, decision rights, communication, and activation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for command structure, decision rights, communication, and activation." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for command structure, decision rights, communication, and activation. Identify the verified status, discrepancy, affected requirement, and accountable owner for command structure, decision rights, communication, and activation by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for command structure, decision rights, communication, and activation. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Staffin",
    title: "Staffing, vendors, utilities, IT, records, medications, and supply continuity",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for staffing, vendors, utilities, it, records, medications, and supply continuity within Emergency Operations & Continuity. Begin with the current controlled versions of RM-EP-001, OP-FM-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — RM-EP-001, EP Policies and Procedures — Continuity of Care. Maintain written Continuity of Care Procedures (Appendix B) covering at minimum: (a) how scheduled visits will be prioritized and rescheduled during emergency-related service disruption; (b) how Essential Patients will be triaged for available staff capacity; (c) how abbreviated clinical visits or telephone check-ins will be authorized as an emergency substitution; (d) criteria for suspending vs. continuing services to patients in affected areas; (e) procedures for coordinating with discharging hospitals or receiving facilities if patients must be evacuated or hospitalized. The responsible role is Administrator / Director of Nursing; the stated timing is Current procedures maintained as Appendix B; reviewed annually as a Care Indeed agency. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Business Continuity. During LEVEL 2 and 3 emergencies, implement the Business Continuity Plan. Essential functions and their Recovery Time Objectives: The responsible role is Incident Commander / EMT; the stated timing is Immediately upon activation.. Essential Functions and Recovery Time Objectives: Essential Function: RTO. Source or operational basis: Continuity Strategy. Patient care for Priority 1 patients: 0 hours (no interruption). Source or operational basis: Pre-identified backup clinicians; geographic reassignment; partner agency agreements. Patient care for Priority 2 patients: 24 hours. Source or operational basis: Prioritized scheduling; telehealth if available. On-call / after-hours services: 0 hours (no interruption). Source or operational basis: On-call clinician continues; backup on-call designated.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-001, 7\\. Documentation Requirements. Written EP Plan (all 4 CoP elements): This policy + Appendices A–F. Source or operational basis: Administrator / Risk Manager. Care Indeed annual risk-assessment standard: Risk Assessment Report (Section 6.1). Source or operational basis: Risk Manager. Patient Vulnerability Assessment (Appendix A): Per-patient EP assessment. Source or operational basis: Admitting Clinician. Essential Patients list: Current census of EP Essential Patients. Source or operational basis: Director of Nursing. Continuity of Care Procedures (Appendix B): Written care continuity subplan. Source or operational basis: Administrator / DON. Office Continuity Procedures (Appendix C): Written operational continuity subplan. Source or operational basis: Administrator. Emergency Contact Directory (Appendix D): Current, printed contact. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 6\\. Documentation Requirements. Emergency Preparedness Plan (EPP): Written EPP per CMS requirements. Source or operational basis: Operations Director. Hazard Vulnerability Analysis: HVA Worksheet (Appendix A). Source or operational basis: Operations Director. Emergency Management Team roster: EMT roster with contact information. Source or operational basis: Administrator. Emergency Contact Card: Appendix B. Source or operational basis: Operations Director. Emergency Quick Reference Guide: Appendix C. Source or operational basis: Operations Director. Staff emergency contact list: Contact database. Source or operational basis: Operations Director / HR. Patient emergency contact list: Patient database / EHR. Source or operational basis: Clinical Manager. Cooperative agreements: Written agreements with partner agencies. Source or operational basis: Administrator.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to staffing, vendors, utilities, it, records, medications, and supply continuity. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.102(b)" },
      { kind: "External Authority", text: "42 CFR § 484.102(c)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "emergency-go-kit-4-1", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing, vendors, utilities, it, records, medications, and supply continuity." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for staffing, vendors, utilities, it, records, medications, and supply continuity. This decide option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "bay-area-regional-map-4-2", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 32, y: 74, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in staffing, vendors, utilities, it, records, medications, and supply continuity. This identify option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing, vendors, utilities, it, records, medications, and supply continuity." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "two-way-radio-4-3", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 81, y: 50, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for staffing, vendors, utilities, it, records, medications, and supply continuity." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during staffing, vendors, utilities, it, records, medications, and supply continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for staffing, vendors, utilities, it, records, medications, and supply continuity." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for staffing, vendors, utilities, it, records, medications, and supply continuity. Identify the verified status, discrepancy, affected requirement, and accountable owner for staffing, vendors, utilities, it, records, medications, and supply continuity by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for staffing, vendors, utilities, it, records, medications, and supply continuity. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Evacuat",
    title: "Evacuation, shelter-in-place, patient tracking, and external coordination",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for evacuation, shelter-in-place, patient tracking, and external coordination within Emergency Operations & Continuity. Begin with the current controlled versions of RM-EP-001, OP-SL-006, RM-EP-003, OP-FM-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — RM-EP-001, Patient Vulnerability Assessment and Prioritization. At admission, complete the Patient Emergency Preparedness Vulnerability Assessment (Appendix A) for every patient. The assessment shall document: (a) patient reliance on electrically powered medical equipment (ventilator, oxygen concentrator, IV infusion pump, electric hospital bed, stair lift); (b) patient mobility limitations (non-ambulatory, wheelchair-dependent, unable to self-evacuate); (c) patient cognitive limitations affecting self-protective action; (d) patient's access to emergency contacts or caregivers; (e) geographic risk of the patient's location (flood zone, high fire hazard area, hillside property). The responsible role is Admitting Clinician; the stated timing is At admission; reviewed at each recertification or significant change in condition.. Maintain a current list of all Essential Patients. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-SL-006, Patient Triage and Prioritization. Categorize all active patients using the Patient Acuity Triage Tool (Appendix A): PRIORITY 1 — Critical (must receive in-person visits; life-threatening if service interrupted); PRIORITY 2 — High (requires in-person visits; significant risk if delayed > 48 hours); PRIORITY 3 — Moderate (may be served via telehealth with periodic in-person visits); PRIORITY 4 — Low (may be temporarily managed via telehealth only with monitoring). The responsible role is Director of Nursing; the stated timing is Within 48 hours of activation.. Reassess patient prioritization weekly during the emergency. Adjust categories as patient conditions change. The responsible role is Director of Nursing; the stated timing is Weekly... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-003, 3\\. Policy Statements. 3.1 Patient Risk Assessment: At admission, the admitting RN shall complete a Patient Emergency Risk Assessment as part of the standard intake process. The assessment shall document: (a) Electrical-dependent equipment in use (oxygen concentrator, ventilator, suction machine, hospital bed, lifts); (b) Mobility status: ambulatory, wheelchair-dependent, bed-bound, ability to self-evacuate; (c) Communication limitations: language, hearing, vision, cognitive impairment; (d) Social support: emergency contact name, relationship, phone number; availability of caregiver; (e) Geographic risk: location in flood zone, wildfire risk area, or mobile home/manufactured housing; (f) Utility dependency: whether equipment or medications require refrigeration. 3.2 Patient Emergency Communication System: The agency shall maintain a current patient census. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Business Continuity. During LEVEL 2 and 3 emergencies, implement the Business Continuity Plan. Essential functions and their Recovery Time Objectives: The responsible role is Incident Commander / EMT; the stated timing is Immediately upon activation.. Essential Functions and Recovery Time Objectives: Essential Function: RTO. Source or operational basis: Continuity Strategy. Patient care for Priority 1 patients: 0 hours (no interruption). Source or operational basis: Pre-identified backup clinicians; geographic reassignment; partner agency agreements. Patient care for Priority 2 patients: 24 hours. Source or operational basis: Prioritized scheduling; telehealth if available. On-call / after-hours services: 0 hours (no interruption). Source or operational basis: On-call clinician continues; backup on-call designated.. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to evacuation, shelter-in-place, patient tracking, and external coordination. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.102(c)" },
      { kind: "External Authority", text: "42 CFR § 484.102(d)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "bay-area-regional-map-5-1", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 14, y: 67, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in evacuation, shelter-in-place, patient tracking, and external coordination. This identify option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evacuation, shelter-in-place, patient tracking, and external coordination." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "two-way-radio-5-2", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 36, y: 52, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evacuation, shelter-in-place, patient tracking, and external coordination." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "emergency-go-kit-5-3", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 78, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for evacuation, shelter-in-place, patient tracking, and external coordination." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for evacuation, shelter-in-place, patient tracking, and external coordination. This decide option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during evacuation, shelter-in-place, patient tracking, and external coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for evacuation, shelter-in-place, patient tracking, and external coordination." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for evacuation, shelter-in-place, patient tracking, and external coordination. Identify the verified status, discrepancy, affected requirement, and accountable owner for evacuation, shelter-in-place, patient tracking, and external coordination by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for evacuation, shelter-in-place, patient tracking, and external coordination. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Trainin",
    title: "Training, exercises, after-action review, and corrective action",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for training, exercises, after-action review, and corrective action within Emergency Operations & Continuity. Begin with the current controlled versions of RM-EP-001, OP-SL-006, OP-FM-005, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — RM-EP-001, Training and Testing. Provide EP training to all new employees as part of orientation, before they begin patient care duties, covering: (a) their specific role in the EP plan; (b) the patient vulnerability assessment and Essential Patients protocol; (c) communication tree and staff notification procedure; (d) emergency supply location; (e) ICS structure during emergencies; (f) how to report an emergency and what to do if they are isolated during a disaster. The responsible role is Risk Manager / Training Coordinator; the stated timing is At orientation, before first clinical duties.. Provide Care Indeed annual EP refresher training, which is an agency standard above the federal at-least-every-two-years program review/update. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-SL-006, Deactivation and After-Action Review. Deactivate public health emergency protocols when the triggering conditions no longer exist and public health authorities confirm the emergency has ended. The responsible role is Administrator; the stated timing is When conditions warrant.. Conduct an after-action review within 30 days of deactivation. Document: (a) what went well; (b) gaps identified; (c) corrective actions; (d) policy/procedure updates needed. Submit to QAPI and Governing Body. The responsible role is Emergency Management Team; the stated timing is Within 30 days of deactivation... Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 10\\. Training Requirements. 10.1 All staff shall receive emergency preparedness training within 14 calendar days of hire. Training shall cover: (a) the agency's Emergency Preparedness Plan; (b) activation and notification procedures; (c) individual roles and responsibilities during emergencies; (d) patient triage and prioritization; (e) communication procedures and emergency contacts; (f) EHR downtime procedures; (g) location of emergency supplies and reference materials; (h) California-specific hazards (earthquake, wildfire response). 10.2 Annual refresher training shall be conducted for all staff and documented per HR-TD-001 and HR-TD-005. 10.3 All Emergency Management Team members shall receive enhanced training on their specific emergency roles, including tabletop exercise participation, at least annually. 10.4 All staff. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, Training and Testing. Provide emergency preparedness training to all new staff within 14 calendar days of hire and to all staff annually per HR-TD-005. Training shall cover: (a) the agency's EPP and activation procedures; (b) individual roles and responsibilities; (c) communication procedures; (d) patient triage and prioritization; (e) evacuation/shelter procedures (if applicable); (f) EHR downtime procedures; (g) location of emergency supplies and reference materials. The responsible role is Operations Director / HR Director; the stated timing is At hire; annually.. Use Care Indeed exercise expectations while recognizing that the current federal regulation requires annual exercise activity under an alternating structure; (b) Exercise 2: Operations-based exercise (e.g., communication drill. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to training, exercises, after-action review, and corrective action. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.102(d)" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "two-way-radio-6-1", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for training, exercises, after-action review, and corrective action." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during training, exercises, after-action review, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for training, exercises, after-action review, and corrective action." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "emergency-go-kit-6-2", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 30, y: 51, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for training, exercises, after-action review, and corrective action." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for training, exercises, after-action review, and corrective action. This decide option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during training, exercises, after-action review, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for training, exercises, after-action review, and corrective action." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "bay-area-regional-map-6-3", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 76, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in training, exercises, after-action review, and corrective action. This identify option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for training, exercises, after-action review, and corrective action." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during training, exercises, after-action review, and corrective action." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during training, exercises, after-action review, and corrective action.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for training, exercises, after-action review, and corrective action." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for training, exercises, after-action review, and corrective action. Identify the verified status, discrepancy, affected requirement, and accountable owner for training, exercises, after-action review, and corrective action by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for training, exercises, after-action review, and corrective action. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Plan",
    title: "Plan maintenance, governing-body approval, and readiness evidence",
    subtitle: "Emergency Operations & Continuity",
    narration: [
      "This lesson develops administrator judgment for plan maintenance, governing-body approval, and readiness evidence within Emergency Operations & Continuity. Begin with the current controlled versions of OP-FM-005, RM-EP-002, RM-EP-001, the authority reserved to the governing body, and the administrator’s documented appointment and decision rights. Observe the real people, records, and physical evidence in the scene; identify what is verified, what conflicts, and what remains unresolved; decide within assigned authority; document the rationale, owner, communication, status, and follow-through. A polished administrator record should allow another qualified reviewer to reconstruct the decision without relying on memory, a dashboard color, or an informal custom. Knowledge practice supports this reasoning but never creates appointment, delegation, legal sign-off, observed competency, or independent authority.",
      "Emergency-preparedness correction — under current 42 CFR § 484.102, the emergency plan, policies and procedures, communication plan, and training program are reviewed and updated at least every two years; exercises remain annual under the regulation’s alternating structure. A Care Indeed annual review or added exercise may exceed the federal minimum but must be labeled as an agency standard. Hazard analysis must reflect the Bay Area service region, including earthquakes, wildfire and smoke, flooding, extreme heat, local utility public-safety power shutoffs, cyber events, and supply disruption—not a generic or different-region template.",
      "Controlled source application — OP-FM-005, Emergency Preparedness Plan Development and Maintenance. Develop and maintain the Emergency Preparedness Plan (EPP) addressing all four CMS-required elements: (a) risk assessment and planning (based on HVA); (b) policies and procedures; (c) communication plan; (d) training and testing program. The responsible role is Operations Director; the stated timing is Initial development prior to Medicare certification; maintained continuously.. Conduct or update the Hazard Vulnerability Analysis (HVA) annually using the HVA Worksheet (Appendix A). Evaluate at minimum: (a) earthquakes (California-specific); (b) wildfires; (c) power outages; (d) flooding; (e) severe weather; (f) pandemic/infectious disease; (g) cyberattack/data breach; (h) workplace violence; (i) civil unrest; (j) supply chain disruption. For each hazard, assess: probability, human impact. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-002, 3\\. Policy Statements. 3.1 Initial Training: All new employees shall complete emergency preparedness orientation training during the onboarding process before beginning independent patient care assignments per HR-TA-005. Initial training shall cover at minimum: (a) The agency's Emergency Operations Plan (RM-EP-001) and each employee's specific role; (b) Chain of command and communication procedures during emergencies; (c) Incident Command System (ICS) basics; (d) Patient population-specific emergency risks (electrical-dependent patients, mobility-limited patients); (e) Personal protective equipment (PPE) use per RM-SS-002; (f) Evacuation and shelter-in-place procedures. 3.2 Annual Training: All employees shall complete at minimum annual emergency preparedness training covering updates to the Emergency Operations Plan and any lessons learned from prior. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-001, Emergency Communication Plan. Maintain a current, printed Emergency Contact Directory (Appendix D) that is distributed to all supervisors and updated at least annually (or within 14 days of any contact change). The directory must contain: (a) All agency staff with primary and secondary phone contact methods; (b) Governing Body members; (c) Medicare Administrative Contractor (CGS or Palmetto, as applicable); (d) California Department of Public Health HCAI regional contact; (e) Cal OES State Operations Center (916-845-8911); (f) Local emergency management agency; (g) Local fire and law enforcement non-emergency lines; (h) HHA accreditation body (if applicable); (i) Key vendors (medical supply, pharmacy, EHR vendor). The responsible role is Administrator; the. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Controlled source application — RM-EP-001, What Surveyors and Auditors Will Look For. CMS surveyors conducting an Emergency Preparedness survey under the State Operations Manual Appendix B will specifically verify: 1. That a single, integrated EP program document exists covering all four required elements — not four separate policies. Surveyors are trained to ask for \"your Emergency Preparedness Plan\" and will note fragmentation as a program deficiency. 2. That the risk assessment was based on the agency's specific geographic service area — not a generic template. For agencies in Bay Area, surveyors know the region's hazards (earthquake, wildfire, wildfire wind and smoke, PSPS events) and will probe whether the plan addresses them. 3. That the patient vulnerability assessment. Translate the source into an operational check: confirm the authorized owner, current version, affected people or records, required evidence, exception path, and the point at which effectiveness will be verified.",
      "Now apply the evidence chain to plan maintenance, governing-body approval, and readiness evidence. Compare each visible object with corroborating records instead of treating a form, device, binder, or staff statement as self-proving. Separate federal minimums, California requirements, payer rules, and higher Care Indeed standards; label each one accurately. Preserve conflicting evidence, consult the assigned policy owner or qualified subject-matter reviewer, and do not let a material exception disappear merely because work was assigned. Close only when the record shows the objective finding, controlling source, decision and rationale, accountable owner, communications, current status, patient or organizational protection, and evidence that the corrective action remained effective.",
    ],
    keyPoints: [
      { icon: "🔎", title: "emergency go-kit", detail: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🧭", title: "Bay Area regional map", detail: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source." },
      { icon: "🛡️", title: "two-way radio", detail: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source." },
    ],
    clinicalTip: "Training supports source-based administrator decisions; it never expands appointment or delegated authority. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "RM-EP-001" },
      { kind: "Controlled Policy", text: "RM-EP-002" },
      { kind: "Controlled Policy", text: "RM-EP-003" },
      { kind: "Controlled Policy", text: "OP-SL-006" },
      { kind: "External Authority", text: "42 CFR § 484.105" },
      { kind: "External Authority", text: "42 CFR §484.70" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "emergency-go-kit-7-1", label: "emergency go-kit", shortLabel: "emergency go-kit", ariaLabel: "Investigate emergency go-kit",
        x: 14, y: 71, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status." },
          { id: "i2", label: "Treat emergency go-kit as complete proof without comparing Bay Area regional map or the controlled source. This identify option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan maintenance, governing-body approval, and readiness evidence." },
          { id: "i3", label: "Classify the emergency go-kit by department custom even though its authority and current status are unverified. This identify option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about emergency go-kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Approve emergency go-kit on the strength of the artifact alone and seek the assigned owner after implementation. This decide option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for emergency go-kit is resolved." },
          { id: "d3", label: "Send emergency go-kit to an unrelated department rather than the policy owner responsible for plan maintenance, governing-body approval, and readiness evidence. This decide option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan maintenance, governing-body approval, and readiness evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For emergency go-kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record only that emergency go-kit was reviewed, without source version, finding, decision, owner, or status. This document option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency go-kit." },
          { id: "doc3", label: "Keep the emergency go-kit decision in personal notes rather than the governed evidence location. This document option concerns emergency go-kit during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan maintenance, governing-body approval, and readiness evidence." },
        ],
        feedback: {
          observed: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
          meaning: "Observe the real emergency go-kit in the photographed scene. Compare it with the Bay Area regional map, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For emergency go-kit, compare the visible evidence with Bay Area regional map and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to emergency go-kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For emergency go-kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "bay-area-regional-map-7-2", label: "Bay Area regional map", shortLabel: "Bay Area regional map", ariaLabel: "Investigate Bay Area regional map",
        x: 53, y: 73, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status." },
          { id: "i2", label: "Assume Bay Area regional map applies to every role, location, and exception described in plan maintenance, governing-body approval, and readiness evidence. This identify option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan maintenance, governing-body approval, and readiness evidence." },
          { id: "i3", label: "Use the oldest available Bay Area regional map because prior approval is easier to confirm. This identify option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about Bay Area regional map." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Allow the affected activity to expand while the exception in Bay Area regional map remains unresolved. This decide option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for Bay Area regional map is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to Bay Area regional map. This decide option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan maintenance, governing-body approval, and readiness evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Mark Bay Area regional map closed on assignment, before completion and effectiveness evidence exist. This document option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Bay Area regional map." },
          { id: "doc3", label: "Retain only a summary of Bay Area regional map and discard the source artifact needed to reconstruct the decision. This document option concerns Bay Area regional map during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan maintenance, governing-body approval, and readiness evidence." },
        ],
        feedback: {
          observed: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
          meaning: "Observe the real Bay Area regional map in the photographed scene. Compare it with the two-way radio, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For Bay Area regional map, compare the visible evidence with two-way radio and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to Bay Area regional map; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For Bay Area regional map, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
      {
        id: "two-way-radio-7-3", label: "two-way radio", shortLabel: "two-way radio", ariaLabel: "Investigate two-way radio",
        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
        identifyChoices: [
          { id: "i1", label: "Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status." },
          { id: "i2", label: "Read two-way radio only for favorable indicators and omit the exception evidence connected to emergency go-kit. This identify option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "This misclassifies the evidence or omits corroboration required for plan maintenance, governing-body approval, and readiness evidence." },
          { id: "i3", label: "Treat an unsigned or unverified two-way radio as equivalent to the current controlled record. This identify option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Use the current controlling source and complete evidence chain rather than an assumption about two-way radio." },
        ],
        decideChoices: [
          { id: "d1", label: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close two-way radio when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "That response permits an approval, expansion, or closure before the material condition for two-way radio is resolved." },
          { id: "d3", label: "Defer the two-way radio decision to a routine future cycle even though current operations depend on it. This decide option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Decision rights and accountable ownership remain controlled during plan maintenance, governing-body approval, and readiness evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For two-way radio, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For two-way radio, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected result for two-way radio but omit the actual evidence, communications, and unresolved items. This document option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two-way radio." },
          { id: "doc3", label: "Combine two-way radio with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns two-way radio during plan maintenance, governing-body approval, and readiness evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan maintenance, governing-body approval, and readiness evidence." },
        ],
        feedback: {
          observed: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence.",
          meaning: "Observe the real two-way radio in the photographed scene. Compare it with the emergency go-kit, current controlled sources, assigned decision rights, and corroborating records for plan maintenance, governing-body approval, and readiness evidence. Identify the verified status, discrepancy, affected requirement, and accountable owner for plan maintenance, governing-body approval, and readiness evidence by reconciling all three photographed evidence objects with the current controlled source. For two-way radio, compare the visible evidence with emergency go-kit and the controlling source before classifying status.",
          action: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. Apply that decision specifically to two-way radio; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the designated policy owner and escalate material unresolved risk through the current administrator, compliance, clinical, privacy, financial, emergency, or governing-body pathway appropriate to the issue.",
          document: "Record the controlling source, objective evidence, decision and rationale, accountable owner, communications, status, corrective action, and effectiveness evidence for plan maintenance, governing-body approval, and readiness evidence. For two-way radio, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["OP-FM-005","RM-EP-001","RM-EP-002","RM-EP-003","OP-SL-006","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","42 CFR § 484.105","42 CFR §484.70"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During all-hazards risk assessment and emergency program governance, the two-way radio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat two-way radio as final approval because the artifact exists during all-hazards risk assessment and emergency program governance.",
      "Send two-way radio to an unrelated department rather than the policy owner responsible for all-hazards risk assessment and emergency program governance. This option concerns all-hazards risk assessment and emergency program governance.",
      "Approve two-way radio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns all-hazards risk assessment and emergency program governance.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in all-hazards risk assessment and emergency program governance. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 2,
    stem: "During patient risk classification and continuity priorities, the emergency go-kit evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities.",
      "Treat emergency go-kit as final approval because the artifact exists during patient risk classification and continuity priorities.",
      "Allow the affected activity to expand while the exception in emergency go-kit remains unresolved. This option concerns patient risk classification and continuity priorities.",
      "Replace the controlling requirement with an informal local workaround tailored to emergency go-kit. This option concerns patient risk classification and continuity priorities.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in patient risk classification and continuity priorities. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 3,
    stem: "During command structure, decision rights, communication, and activation, the Bay Area regional map evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Defer the Bay Area regional map decision to a routine future cycle even though current operations depend on it. This option concerns command structure, decision rights, communication, and activation.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation.",
      "Treat Bay Area regional map as final approval because the artifact exists during command structure, decision rights, communication, and activation.",
      "Close Bay Area regional map when work is submitted, without testing whether the correction changed the intended outcome. This option concerns command structure, decision rights, communication, and activation.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in command structure, decision rights, communication, and activation. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 4,
    stem: "During staffing, vendors, utilities, it, records, medications, and supply continuity, the two-way radio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Approve two-way radio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns staffing, vendors, utilities, it, records, medications, and supply continuity.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity.",
      "Send two-way radio to an unrelated department rather than the policy owner responsible for staffing, vendors, utilities, it, records, medications, and supply continuity. This option concerns staffing, vendors, utilities, it, records, medications, and supply continuity.",
      "Treat two-way radio as final approval because the artifact exists during staffing, vendors, utilities, it, records, medications, and supply continuity.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in staffing, vendors, utilities, it, records, medications, and supply continuity. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 5,
    stem: "During evacuation, shelter-in-place, patient tracking, and external coordination, the emergency go-kit evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Allow the affected activity to expand while the exception in emergency go-kit remains unresolved. This option concerns evacuation, shelter-in-place, patient tracking, and external coordination.",
      "Replace the controlling requirement with an informal local workaround tailored to emergency go-kit. This option concerns evacuation, shelter-in-place, patient tracking, and external coordination.",
      "Treat emergency go-kit as final approval because the artifact exists during evacuation, shelter-in-place, patient tracking, and external coordination.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination.",
    ],
    correct: 3,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in evacuation, shelter-in-place, patient tracking, and external coordination. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 6,
    stem: "During training, exercises, after-action review, and corrective action, the Bay Area regional map evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Treat Bay Area regional map as final approval because the artifact exists during training, exercises, after-action review, and corrective action.",
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action.",
      "Close Bay Area regional map when work is submitted, without testing whether the correction changed the intended outcome. This option concerns training, exercises, after-action review, and corrective action.",
      "Defer the Bay Area regional map decision to a routine future cycle even though current operations depend on it. This option concerns training, exercises, after-action review, and corrective action.",
    ],
    correct: 1,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in training, exercises, after-action review, and corrective action. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 7,
    stem: "During plan maintenance, governing-body approval, and readiness evidence, the two-way radio evidence shows an unresolved material exception. Which response follows the controlled decision pathway?",
    options: [
      "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence.",
      "Send two-way radio to an unrelated department rather than the policy owner responsible for plan maintenance, governing-body approval, and readiness evidence. This option concerns plan maintenance, governing-body approval, and readiness evidence.",
      "Treat two-way radio as final approval because the artifact exists during plan maintenance, governing-body approval, and readiness evidence.",
      "Approve two-way radio on the strength of the artifact alone and seek the assigned owner after implementation. This option concerns plan maintenance, governing-body approval, and readiness evidence.",
    ],
    correct: 0,
    rationale: "Use the current authority hierarchy to protect affected people and records, hold any unsupported approval or closure, assign the authorized owner, and resolve the material exception in plan maintenance, governing-body approval, and readiness evidence. The decision remains traceable to OP-FM-005, RM-EP-001, RM-EP-002, RM-EP-003, OP-SL-006.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.102 be used within Emergency Operations & Continuity?",
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
    stem: "What links Bay Area regional map and Bay Area regional map into an accountable Emergency Operations & Continuity control?",
    options: [
      "A familiar dashboard color without source validation.",
      "An unversioned local worksheet with no assigned reviewer.",
      "A verbal understanding that no exception will recur.",
      "Current source authority, explicit decision rights, accountable ownership, communication, status, and verified closure evidence.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis requires a reproducible evidence chain rather than isolated artifacts.",
  },
  {
    id: 10,
    stem: "What does successful completion of Emergency Operations & Continuity establish?",
    options: [
      "Knowledge of the controlled administrator concepts in Emergency Operations & Continuity, while formal appointment, delegation, competency, legal sign-off, and independent authority remain separate.",
      "Permission to replace the controlled policies with the Emergency Operations & Continuity quiz result.",
      "Observed operational competency without an authorized evaluator.",
      "Automatic appointment authority for every decision described in Emergency Operations & Continuity.",
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





const STORAGE_KEY = 'adm-011-progress-v6000';



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



export default function ADM011() {

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

          <span className="brand-text">ADM-011 — Emergency Operations</span>

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
