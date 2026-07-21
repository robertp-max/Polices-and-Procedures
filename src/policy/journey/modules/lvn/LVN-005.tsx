/**
 * LVN-005 — Plan of Care — LVN Implementation
 * Version: 5.4.1-RECOVERY
 * Lessons: 7 | Quiz: 10 | Pass: 80%
 * Restored from embedded LVN-005 source scenarios + CoP content
 * Observe → Identify → Decide → Document → Feedback → Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-005/lesson-01-plan-of-care.png';
import img02 from './assets/lvn-005/lesson-02-cms-485.png';
import img03 from './assets/lvn-005/lesson-03-frequency.png';
import img04 from './assets/lvn-005/lesson-04-missed-visit.png';
import img05 from './assets/lvn-005/lesson-05-delegation.png';
import img06 from './assets/lvn-005/lesson-06-patient-change.png';
import img07 from './assets/lvn-005/lesson-07-scope-practice.png';


const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#B94718', orangeDark: '#A94018', ink: '#2D3748',
  muted: '#64748B', slate: '#64748B', border: '#E2E8F0', red: '#EF4444',
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

const MODULE_META = { id: 'LVN-005', title: 'Plan of Care — LVN Implementation', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'Two clinicians review a de-identified current authorized plan of care with an RN escalation phone nearby.',
  'An LVN compares ordered wound-care supplies with a de-identified authorized plan and order-update phone.',
  'An LVN reviews a de-identified ordered visit-frequency schedule with a patient and RN authorization phone.',
  'An LVN documents a de-identified missed or refused visit beside an RN notification phone and closed planner.',
  'An LVN pauses an unclear task and contacts the supervising RN through the order-clarification pathway.',
  'An LVN assesses a de-identified patient change request with vital-sign equipment, RN phone, and documentation tablet.',
  'An LVN performs an authorized intervention with ordered supplies, current plan, RN phone, and competency cue.',
] as const;

const PAGES: PageData[] = [
  {
    id: 0, shortName: 'Plan of Care', title: 'The Plan of Care — Your Clinical Compass', subtitle: 'Implement authorized directives only',
    narration: [
      'Critical scope rules require that under RN direction the LVN implement only authorized directives. Developing or independently modifying the Plan of Care is outside the LVN role.',
      '42 CFR § 484.60: Home health services must be furnished in accordance with an individualized plan of care.',
      'When the patient presentation no longer matches the ordered plan, protect the patient within current orders, notify the supervising RN, and document objectively.'
    ],
    keyPoints: [
      { icon: '📋', title: 'Implement, do not author', detail: 'LVNs carry out the authorized POC under RN supervision; they do not independently rewrite it.' },
      { icon: '🔍', title: 'Detect plan mismatch', detail: 'Compare ordered interventions to findings on every visit.' },
      { icon: '📞', title: 'Escalate changes', detail: 'Report significant condition changes immediately to the supervising RN.' },
      { icon: '✍️', title: 'Document the pathway', detail: 'Record orders followed, findings, and RN notification with time.' }
    ],
    clinicalTip: 'Never invent a temporary undocumented care plan.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.60" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: 'poc', label: 'Authorized POC', shortLabel: 'Authorized POC', ariaLabel: 'Investigate Authorized POC',
        x: 50, y: 45, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-0',
        observe: "The current authorized POC lists the assigned intervention and parameters for this visit.",
        identifyChoices: [
          { id: 'i1', label: "Authority exists only when the current patient, order, intervention, and parameters match.", correct: true, rationale: "Correct. Authority exists only when the current patient, order, intervention, and parameters match." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed: verify the current authorized POC and implement the listed intervention exactly as ordered.", correct: true, rationale: "Correct. Proceed: verify the current authorized POC and implement the listed intervention exactly as ordered." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record current order reviewed, intervention and parameters, objective findings, patient response, RN name, notification time, direction, and follow-up when contacted.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The current authorized POC lists the assigned intervention and parameters for this visit.",
          meaning: "Authority exists only when the current patient, order, intervention, and parameters match.",
          action: "Proceed: verify the current authorized POC and implement the listed intervention exactly as ordered.",
          notify: "No routine notice for a match; notify the supervising RN during the visit for any mismatch, refusal, or new need.",
          document: "Record current order reviewed, intervention and parameters, objective findings, patient response, RN name, notification time, direction, and follow-up when contacted.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'mismatch', label: 'Plan mismatch', shortLabel: 'Plan mismatch', ariaLabel: 'Investigate Plan mismatch',
        x: 28, y: 65, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-1',
        observe: "The patient finding or requested care does not match the current authorized POC.",
        identifyChoices: [
          { id: 'i1', label: "A plan mismatch removes authority to improvise and requires RN assessment and an order when indicated.", correct: true, rationale: "Correct. A plan mismatch removes authority to improvise and requires RN assessment and an order when indicated." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the mismatched intervention; continue only other safe current orders and escalate the variance to the supervising RN.", correct: true, rationale: "Correct. Hold the mismatched intervention; continue only other safe current orders and escalate the variance to the supervising RN." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record exact order reviewed, objective mismatch, care held or continued, RN name/time, instructions, response, follow-up.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The patient finding or requested care does not match the current authorized POC.",
          meaning: "A plan mismatch removes authority to improvise and requires RN assessment and an order when indicated.",
          action: "Hold the mismatched intervention; continue only other safe current orders and escalate the variance to the supervising RN.",
          notify: "Notify the supervising RN during the visit before the mismatched intervention; use the emergency pathway for severe or rapidly worsening findings.",
          document: "Record exact order reviewed, objective mismatch, care held or continued, RN name/time, instructions, response, follow-up.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'escalate', label: 'RN escalation', shortLabel: 'RN escalation', ariaLabel: 'Investigate RN escalation',
        x: 75, y: 52, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-2',
        observe: "A significant change places the patient outside the expected POC pathway.",
        identifyChoices: [
          { id: 'i1', label: "The LVN must stop unauthorized action and obtain timely direction rather than create a temporary plan.", correct: true, rationale: "Correct. The LVN must stop unauthorized action and obtain timely direction rather than create a temporary plan." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Escalate now: protect the patient, stop unsafe or unauthorized intervention, and follow RN or emergency direction.", correct: true, rationale: "Correct. Escalate now: protect the patient, stop unsafe or unauthorized intervention, and follow RN or emergency direction." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record change and time identified, assessment values, action stopped or taken, emergency contact, RN name/time, directions, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A significant change places the patient outside the expected POC pathway.",
          meaning: "The LVN must stop unauthorized action and obtain timely direction rather than create a temporary plan.",
          action: "Escalate now: protect the patient, stop unsafe or unauthorized intervention, and follow RN or emergency direction.",
          notify: "Notify the supervising RN immediately; call emergency services first for life-threatening findings, then notify the RN as soon as feasible.",
          document: "Record change and time identified, assessment values, action stopped or taken, emergency contact, RN name/time, directions, disposition.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 1, shortName: 'CMS-485', title: 'Ordered Supplies & Services', subtitle: 'Current authorized plan and order pathway',
    narration: [
      'For the LVN, the CMS-485 is the ultimate authority. It specifies the exact types of services and the frequency of visits authorized for this patient.',
      'The LVN executes interventions on the CMS-485. The RN completes the comprehensive assessment (OASIS) that generates the plan.',
      'If a needed service is not on the current plan, the LVN cannot provide it without an updated physician-signed order processed through the supervising RN.'
    ],
    keyPoints: [
      { icon: '📄', title: 'Physician-authorized list', detail: 'Only listed interventions and frequencies are authorized.' },
      { icon: '🚫', title: 'No independent adds', detail: 'Patient requests do not create orders; route through the RN.' },
      { icon: '🔄', title: 'Order update pathway', detail: 'New services require updated physician orders via RN process.' }
    ],
    clinicalTip: 'Patient preference never overrides missing orders.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.60" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: '485', label: 'CMS-485 authority', shortLabel: 'CMS-485 auth…', ariaLabel: 'Investigate CMS-485 authority',
        x: 55, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0',
        observe: "The current plan lists the patient-specific service, supply, treatment parameters, frequency, and duration.",
        identifyChoices: [
          { id: 'i1', label: "Only listed supplies and services support authorized implementation; a request or available stock item is not an order.", correct: true, rationale: "Correct. Only listed supplies and services support authorized implementation; a request or available stock item is not an order." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed only after matching the patient, current plan, ordered service and supply, parameters, frequency, and duration.", correct: true, rationale: "Correct. Proceed only after matching the patient, current plan, ordered service and supply, parameters, frequency, and duration." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record plan/order version, ordered service and supplies used, parameters, findings, response, RN direction and time when contacted.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The current plan lists the patient-specific service, supply, treatment parameters, frequency, and duration.",
          meaning: "Only listed supplies and services support authorized implementation; a request or available stock item is not an order.",
          action: "Proceed only after matching the patient, current plan, ordered service and supply, parameters, frequency, and duration.",
          notify: "No routine notice for a complete match; notify the supervising RN before care when an item, service, parameter, or current order is missing or unclear.",
          document: "Record plan/order version, ordered service and supplies used, parameters, findings, response, RN direction and time when contacted.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'oasis', label: 'OASIS boundary', shortLabel: 'OASIS boundary', ariaLabel: 'Investigate OASIS boundary',
        x: 30, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-1',
        observe: "The comprehensive assessment or OASIS field belongs to an authorized assessing clinician, not the LVN in this workflow.",
        identifyChoices: [
          { id: 'i1', label: "The LVN may relay objective findings but may not complete or attest the RN/authorized-clinician assessment.", correct: true, rationale: "Correct. The LVN may relay objective findings but may not complete or attest the RN/authorized-clinician assessment." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop: do not enter or attest the comprehensive assessment; route objective findings to the supervising RN.", correct: true, rationale: "Correct. Stop: do not enter or attest the comprehensive assessment; route objective findings to the supervising RN." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record task presented, reason held, findings relayed, RN name/time, direction, authorized work completed.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The comprehensive assessment or OASIS field belongs to an authorized assessing clinician, not the LVN in this workflow.",
          meaning: "The LVN may relay objective findings but may not complete or attest the RN/authorized-clinician assessment.",
          action: "Stop: do not enter or attest the comprehensive assessment; route objective findings to the supervising RN.",
          notify: "Notify the supervising RN before proceeding if the LVN is assigned OASIS/comprehensive assessment or the plan cannot be verified without it.",
          document: "Record task presented, reason held, findings relayed, RN name/time, direction, authorized work completed.",
          policyRefs: ["CL-CP-001"],
        },
      },      {
        id: 'orders', label: 'Order updates', shortLabel: 'Order updates', ariaLabel: 'Investigate Order updates',
        x: 75, y: 60, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-2',
        observe: "A needed supply or service is absent from, different from, or unclear in the current authorized plan.",
        identifyChoices: [
          { id: 'i1', label: "Availability in the home does not authorize use; the RN/provider order pathway must resolve the discrepancy.", correct: true, rationale: "Correct. Availability in the home does not authorize use; the RN/provider order pathway must resolve the discrepancy." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the unlisted supply or service and escalate to the supervising RN for an updated authorized order before implementation.", correct: true, rationale: "Correct. Hold the unlisted supply or service and escalate to the supervising RN for an updated authorized order before implementation." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record missing/discrepant item, current order, care held, objective need, RN name/time, order communication relayed, final disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A needed supply or service is absent from, different from, or unclear in the current authorized plan.",
          meaning: "Availability in the home does not authorize use; the RN/provider order pathway must resolve the discrepancy.",
          action: "Hold the unlisted supply or service and escalate to the supervising RN for an updated authorized order before implementation.",
          notify: "Notify the supervising RN during the visit and before using the unlisted item; use urgent or emergency escalation if delay threatens safety.",
          document: "Record missing/discrepant item, current order, care held, objective need, RN name/time, order communication relayed, final disposition.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 2, shortName: 'Frequency', title: 'Visit Frequency & Scheduling', subtitle: 'Ordered cadence, not field improvisation',
    narration: [
      '42 CFR § 484.60(a): Services must be furnished in accordance with physician orders, including type, frequency, and duration.',
      'LVNs are strictly prohibited from altering visit frequency. If a patient asks to skip or add a visit, document and notify the supervising RN.',
      'Do not silently change the ordered pattern without RN coordination and proper authorization.'
    ],
    keyPoints: [
      { icon: '📅', title: 'Ordered frequency', detail: 'Stay within the authorized visit cadence on the plan.' },
      { icon: '🚫', title: 'No field edits', detail: 'LVNs do not change frequency based on convenience or request alone.' },
      { icon: '📞', title: 'Route requests', detail: 'Patient requests to alter frequency go to the supervising RN.' }
    ],
    clinicalTip: 'Do not promise extra visits without authorization.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.60" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: 'freq', label: 'Ordered frequency', shortLabel: 'Ordered freq…', ariaLabel: 'Investigate Ordered frequency',
        x: 50, y: 45, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-0',
        observe: "The current POC orders a specific visit type, frequency, and duration.",
        identifyChoices: [
          { id: 'i1', label: "The ordered cadence controls; the LVN does not independently add, omit, shorten, or move visits.", correct: true, rationale: "Correct. The ordered cadence controls; the LVN does not independently add, omit, shorten, or move visits." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with the assigned visit at the ordered frequency and duration when the schedule and current POC match.", correct: true, rationale: "Correct. Proceed with the assigned visit at the ordered frequency and duration when the schedule and current POC match." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record ordered frequency/duration, scheduled and actual visit details, care, variance, RN name/time, direction.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The current POC orders a specific visit type, frequency, and duration.",
          meaning: "The ordered cadence controls; the LVN does not independently add, omit, shorten, or move visits.",
          action: "Proceed with the assigned visit at the ordered frequency and duration when the schedule and current POC match.",
          notify: "No routine notice for a match; notify the supervising RN the same day if the schedule differs or the ordered visit cannot occur.",
          document: "Record ordered frequency/duration, scheduled and actual visit details, care, variance, RN name/time, direction.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'request', label: 'Patient request', shortLabel: 'Patient requ…', ariaLabel: 'Investigate Patient request',
        x: 30, y: 65, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-1',
        observe: "The patient asks to skip, add, shorten, or move a visit from the ordered cadence.",
        identifyChoices: [
          { id: 'i1', label: "The request matters but does not itself change authorized frequency.", correct: true, rationale: "Correct. The request matters but does not itself change authorized frequency." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the schedule change; assess immediate needs within current orders and escalate the request to the supervising RN.", correct: true, rationale: "Correct. Hold the schedule change; assess immediate needs within current orders and escalate the request to the supervising RN." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record patient exact request/reason, ordered cadence, immediate assessment, RN name/time, instructions, what patient was told.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The patient asks to skip, add, shorten, or move a visit from the ordered cadence.",
          meaning: "The request matters but does not itself change authorized frequency.",
          action: "Hold the schedule change; assess immediate needs within current orders and escalate the request to the supervising RN.",
          notify: "Notify the supervising RN the same day and before promising or scheduling a change; escalate urgently if significant change accompanies the request.",
          document: "Record patient exact request/reason, ordered cadence, immediate assessment, RN name/time, instructions, what patient was told.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'auth', label: 'Authorization', shortLabel: 'Authorization', ariaLabel: 'Investigate Authorization',
        x: 75, y: 50, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-2',
        observe: "A proposed cadence change is pending and is not yet present as a current authorized order.",
        identifyChoices: [
          { id: 'i1', label: "Discussion or a pending request is not authority to change the schedule unless received and processed under agency order policy.", correct: true, rationale: "Correct. Discussion or a pending request is not authority to change the schedule unless received and processed under agency order policy." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the changed cadence until the authorized order is received and verified; then proceed exactly as authorized.", correct: true, rationale: "Correct. Hold the changed cadence until the authorized order is received and verified; then proceed exactly as authorized." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record prior order, requested change, contact/name/time, pending direction, authorized order details, schedule update.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A proposed cadence change is pending and is not yet present as a current authorized order.",
          meaning: "Discussion or a pending request is not authority to change the schedule unless received and processed under agency order policy.",
          action: "Hold the changed cadence until the authorized order is received and verified; then proceed exactly as authorized.",
          notify: "Notify the supervising RN before the affected visit if authorization is absent or ambiguous; escalate promptly if the gap could interrupt necessary care.",
          document: "Record prior order, requested change, contact/name/time, pending direction, authorized order details, schedule update.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 3, shortName: 'Missed Visit', title: 'Missed Visit Protocol', subtitle: 'Document, notify, never silent make-up',
    narration: [
      'A missed visit is never “made up” without authorization. Document the missed visit in the clinical record and notify the supervising RN.',
      'If a patient refuses a visit, document the refusal and the reason given, then notify the RN so physician contact can occur if required.',
      'Skipping documentation of a miss creates an incomplete clinical and billing trail.'
    ],
    keyPoints: [
      { icon: '📝', title: 'Document the miss', detail: 'Record date, reason, and patient statements objectively.' },
      { icon: '📞', title: 'Notify the RN', detail: 'Missed and refused visits route to the supervising RN.' },
      { icon: '🚫', title: 'No silent make-up', detail: 'Extra visits require authorization; do not self-schedule make-ups.' }
    ],
    clinicalTip: 'Refusal is still a clinical event that must be recorded.',
    sourceLabels: [
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: 'refuse', label: 'Patient refusal', shortLabel: 'Patient refu…', ariaLabel: 'Investigate Patient refusal',
        x: 50, y: 45, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0',
        observe: "The patient refuses the scheduled visit or ordered intervention and states a reason.",
        identifyChoices: [
          { id: 'i1', label: "Refusal stops the refused care but does not erase the clinical event or permit an independent make-up visit.", correct: true, rationale: "Correct. Refusal stops the refused care but does not erase the clinical event or permit an independent make-up visit." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop the refused care, assess safety, explain relevant risks within scope, respect refusal, and escalate to the supervising RN.", correct: true, rationale: "Correct. Stop the refused care, assess safety, explain relevant risks within scope, respect refusal, and escalate to the supervising RN." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record scheduled care, patient exact refusal/reason, assessment, education, care not performed, RN name/time, instructions, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The patient refuses the scheduled visit or ordered intervention and states a reason.",
          meaning: "Refusal stops the refused care but does not erase the clinical event or permit an independent make-up visit.",
          action: "Stop the refused care, assess safety, explain relevant risks within scope, respect refusal, and escalate to the supervising RN.",
          notify: "Notify the supervising RN promptly the same day; use urgent/emergency escalation if refusal creates immediate danger or accompanies severe findings.",
          document: "Record scheduled care, patient exact refusal/reason, assessment, education, care not performed, RN name/time, instructions, disposition.",
          policyRefs: ["CL-CP-001"],
        },
      },      {
        id: 'record', label: 'Missed-visit record', shortLabel: 'Missed-visit…', ariaLabel: 'Investigate Missed-visit record',
        x: 30, y: 65, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1',
        observe: "The schedule shows an ordered visit, but the clinical record has no completed visit or approved disposition.",
        identifyChoices: [
          { id: 'i1', label: "This missed-visit mismatch requires reconciliation; it must not be marked complete or silently moved.", correct: true, rationale: "Correct. This missed-visit mismatch requires reconciliation; it must not be marked complete or silently moved." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Escalate the mismatch to the supervising RN and follow the missed-visit pathway; do not create a completion entry.", correct: true, rationale: "Correct. Escalate the mismatch to the supervising RN and follow the missed-visit pathway; do not create a completion entry." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record scheduled date/time, contact attempts, reason, safety assessment, RN name/time, instructions, provider contact relayed, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The schedule shows an ordered visit, but the clinical record has no completed visit or approved disposition.",
          meaning: "This missed-visit mismatch requires reconciliation; it must not be marked complete or silently moved.",
          action: "Escalate the mismatch to the supervising RN and follow the missed-visit pathway; do not create a completion entry.",
          notify: "Notify the supervising RN promptly when the miss is known and before arranging make-up; elevate urgently if interruption may harm the patient.",
          document: "Record scheduled date/time, contact attempts, reason, safety assessment, RN name/time, instructions, provider contact relayed, disposition.",
          policyRefs: ["CL-CP-001"],
        },
      },      {
        id: 'makeup', label: 'No silent make-up', shortLabel: 'No silent ma…', ariaLabel: 'Investigate No silent make-up',
        x: 75, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-2',
        observe: "A make-up slot is available, but no current authorization supports an extra or rescheduled visit.",
        identifyChoices: [
          { id: 'i1', label: "Scheduling capacity does not change ordered frequency or authorize a make-up visit.", correct: true, rationale: "Correct. Scheduling capacity does not change ordered frequency or authorize a make-up visit." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the make-up until the supervising RN confirms the authorized order and scheduling pathway; then proceed only as authorized.", correct: true, rationale: "Correct. Hold the make-up until the supervising RN confirms the authorized order and scheduling pathway; then proceed only as authorized." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record original missed visit, proposed make-up, order status, RN name/time, authorization/instructions, scheduled disposition, patient notification.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A make-up slot is available, but no current authorization supports an extra or rescheduled visit.",
          meaning: "Scheduling capacity does not change ordered frequency or authorize a make-up visit.",
          action: "Hold the make-up until the supervising RN confirms the authorized order and scheduling pathway; then proceed only as authorized.",
          notify: "Notify the supervising RN before scheduling or performing make-up; escalate same day if the missed service creates clinical risk.",
          document: "Record original missed visit, proposed make-up, order status, RN name/time, authorization/instructions, scheduled disposition, patient notification.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 4, shortName: 'Delegation', title: 'RN Direction & Order Pathway', subtitle: 'Clarify before unauthorized implementation',
    narration: [
      'The LVN/LPN functions under the direction and supervision of a licensed physician, dentist, or registered nurse (42 CFR § 484.115(e) context for home-health personnel).',
      'The LVN executes delegated tasks; the RN retains responsibility for overall assessment and plan direction.',
      'If you are unsure whether a task falls within your scope, do not perform it. Contact the supervising RN for clarification.'
    ],
    keyPoints: [
      { icon: '🔗', title: 'Under RN direction', detail: 'LVN practice is directed by RN or physician—not independent.' },
      { icon: '🛡️', title: 'Scope check', detail: 'When unsure, stop and clarify with the supervising RN.' },
      { icon: '🚫', title: 'No complex HHA delegation', detail: 'Do not push RN-level assessment work to the aide.' }
    ],
    clinicalTip: 'Staffing pressure does not expand legal scope.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.115(e)" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: 'direction', label: 'RN direction', shortLabel: 'RN direction', ariaLabel: 'Investigate RN direction',
        x: 50, y: 45, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-0',
        observe: "The task and current order are clear, and the LVN is working under RN or physician direction.",
        identifyChoices: [
          { id: 'i1', label: "RN-supervised LVN practice supports authorized implementation; it does not transfer plan-development authority.", correct: true, rationale: "Correct. RN-supervised LVN practice supports authorized implementation; it does not transfer plan-development authority." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with the authorized task within LVN scope, competence, current order, and supervising RN direction.", correct: true, rationale: "Correct. Proceed with the authorized task within LVN scope, competence, current order, and supervising RN direction." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record authorized task/order, findings, intervention, response, supervisory name/time/direction when contacted.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The task and current order are clear, and the LVN is working under RN or physician direction.",
          meaning: "RN-supervised LVN practice supports authorized implementation; it does not transfer plan-development authority.",
          action: "Proceed with the authorized task within LVN scope, competence, current order, and supervising RN direction.",
          notify: "No routine notice for expected care; notify the supervising RN during the visit for variance, new need, refusal, or direction conflict.",
          document: "Record authorized task/order, findings, intervention, response, supervisory name/time/direction when contacted.",
          policyRefs: ["42 CFR § 484.115(e)", "CL-CP-001"],
        },
      },      {
        id: 'scope', label: 'Scope check', shortLabel: 'Scope check', ariaLabel: 'Investigate Scope check',
        x: 30, y: 60, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-1',
        observe: "The task, parameter, or role assignment is unclear or may exceed LVN scope or validated competence.",
        identifyChoices: [
          { id: 'i1', label: "Uncertainty is a stop condition; staffing pressure and patient preference do not create authority.", correct: true, rationale: "Correct. Uncertainty is a stop condition; staffing pressure and patient preference do not create authority." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop the unclear task, maintain safety within current orders, and obtain supervising RN clarification before action.", correct: true, rationale: "Correct. Stop the unclear task, maintain safety within current orders, and obtain supervising RN clarification before action." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record task requested, scope concern, assessment, care held/continued, RN name/time, clarification, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The task, parameter, or role assignment is unclear or may exceed LVN scope or validated competence.",
          meaning: "Uncertainty is a stop condition; staffing pressure and patient preference do not create authority.",
          action: "Stop the unclear task, maintain safety within current orders, and obtain supervising RN clarification before action.",
          notify: "Notify the supervising RN immediately before the task; use the emergency pathway if waiting would leave the patient in immediate danger.",
          document: "Record task requested, scope concern, assessment, care held/continued, RN name/time, clarification, disposition.",
          policyRefs: ["42 CFR § 484.115(e)", "CL-CP-001"],
        },
      },      {
        id: 'hha', label: 'HHA boundary', shortLabel: 'HHA boundary', ariaLabel: 'Investigate HHA boundary',
        x: 75, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-2',
        observe: "A complex assessment, clinical judgment, or plan decision appears assigned to a home health aide.",
        identifyChoices: [
          { id: 'i1', label: "RN-level assessment and plan direction may not be shifted to the aide.", correct: true, rationale: "Correct. RN-level assessment and plan direction may not be shifted to the aide." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop the inappropriate assignment, protect the patient, and escalate the role mismatch to the supervising RN for reassignment.", correct: true, rationale: "Correct. Stop the inappropriate assignment, protect the patient, and escalate the role mismatch to the supervising RN for reassignment." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record task/assignment, objective patient need, action stopped, RN name/time, reassignment/instructions, outcome.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A complex assessment, clinical judgment, or plan decision appears assigned to a home health aide.",
          meaning: "RN-level assessment and plan direction may not be shifted to the aide.",
          action: "Stop the inappropriate assignment, protect the patient, and escalate the role mismatch to the supervising RN for reassignment.",
          notify: "Notify the supervising RN before the aide performs the task; escalate urgently when timely licensed assessment is needed.",
          document: "Record task/assignment, objective patient need, action stopped, RN name/time, reassignment/instructions, outcome.",
          policyRefs: ["CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 5, shortName: 'Patient Change', title: 'Patient Change Requests', subtitle: 'Assess, hold unsafe action, notify, and document',
    narration: [
      'You must report significant changes immediately to the Supervising RN. The RN evaluates clinical significance and coordinates physician communication as needed.',
      'A patient change request or abnormal finding follows the supervising RN and provider-order pathway; the LVN does not independently alter the plan.',
      'The LVN may never initiate a new medication, discontinue an existing one, or change a treatment protocol based on observation alone.'
    ],
    keyPoints: [
      { icon: '🛑', title: 'Immediate RN notify', detail: 'Abnormal vitals and significant changes go to the RN without delay.' },
      { icon: '🚫', title: 'No improvisation', detail: 'No new meds, discontinuations, or protocol changes without orders.' },
      { icon: '📝', title: 'Document the pathway', detail: 'Findings, notification time, instructions, and actions taken.' }
    ],
    clinicalTip: 'Knowledge completion is not practical field clearance.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.60" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: 'abnormal', label: 'Abnormal vitals', shortLabel: 'Abnormal vit…', ariaLabel: 'Investigate Abnormal vitals',
        x: 50, y: 45, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-0',
        observe: "A patient change request accompanies abnormal vital signs or a significant departure from ordered baseline.",
        identifyChoices: [
          { id: 'i1', label: "The finding may require reassessment and a POC/order change; the LVN may not independently alter treatment.", correct: true, rationale: "Correct. The finding may require reassessment and a POC/order change; the LVN may not independently alter treatment." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop any intervention made unsafe by the finding, protect the patient, and escalate immediately; call emergency services for life-threatening signs.", correct: true, rationale: "Correct. Stop any intervention made unsafe by the finding, protect the patient, and escalate immediately; call emergency services for life-threatening signs." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record request, symptoms/onset, vital values/method, baseline, care held/taken, emergency action, RN name/time, directions, reassessment, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "A patient change request accompanies abnormal vital signs or a significant departure from ordered baseline.",
          meaning: "The finding may require reassessment and a POC/order change; the LVN may not independently alter treatment.",
          action: "Stop any intervention made unsafe by the finding, protect the patient, and escalate immediately; call emergency services for life-threatening signs.",
          notify: "Notify the supervising RN immediately with values, symptoms, onset, and current orders; call emergency services first for life-threatening findings.",
          document: "Record request, symptoms/onset, vital values/method, baseline, care held/taken, emergency action, RN name/time, directions, reassessment, disposition.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'wait', label: 'Wait for instruction', shortLabel: 'Wait for ins…', ariaLabel: 'Investigate Wait for instruction',
        x: 30, y: 65, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-1',
        observe: "The supervising RN has been notified, but no new authorized direction or order has been received.",
        identifyChoices: [
          { id: 'i1', label: "Notification alone does not authorize a new medication, treatment, supply, or frequency.", correct: true, rationale: "Correct. Notification alone does not authorize a new medication, treatment, supply, or frequency." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold the new action; continue only safe current orders and monitoring while awaiting and verifying direction.", correct: true, rationale: "Correct. Hold the new action; continue only safe current orders and monitoring while awaiting and verifying direction." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record initial/repeat contacts and times, status/reassessments, care continued/held, direction, order verification, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The supervising RN has been notified, but no new authorized direction or order has been received.",
          meaning: "Notification alone does not authorize a new medication, treatment, supply, or frequency.",
          action: "Hold the new action; continue only safe current orders and monitoring while awaiting and verifying direction.",
          notify: "Re-contact the supervising RN promptly if the patient worsens or response is delayed; use chain of command or emergency pathway according to urgency.",
          document: "Record initial/repeat contacts and times, status/reassessments, care continued/held, direction, order verification, disposition.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'doc', label: 'Document pathway', shortLabel: 'Document pat…', ariaLabel: 'Investigate Document pathway',
        x: 75, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-2',
        observe: "The RN/order pathway produced instructions and, when required, a newly authorized order.",
        identifyChoices: [
          { id: 'i1', label: "The record must connect the patient change to notification, authorization, action, response, and follow-up.", correct: true, rationale: "Correct. The record must connect the patient change to notification, authorization, action, response, and follow-up." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed only with verified authorized instructions, reassess, and escalate again for unexpected response.", correct: true, rationale: "Correct. Proceed only with verified authorized instructions, reassess, and escalate again for unexpected response." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record before/after findings, request/change, current/new order, RN/provider communication relayed, names/times, action, response, teaching, follow-up.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The RN/order pathway produced instructions and, when required, a newly authorized order.",
          meaning: "The record must connect the patient change to notification, authorization, action, response, and follow-up.",
          action: "Proceed only with verified authorized instructions, reassess, and escalate again for unexpected response.",
          notify: "Notify at the priority directed and immediately for worsening/emergency findings; clarify incomplete or conflicting orders before action.",
          document: "Record before/after findings, request/change, current/new order, RN/provider communication relayed, names/times, action, response, teaching, follow-up.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      }
    ],
  },
  {
    id: 6, shortName: 'Scope Practice', title: 'Final Authorized Implementation', subtitle: 'Verify every gate before proceeding',
    narration: [
      'Integrate the full pathway: authorized plan → ordered frequency → delegated tasks under RN direction → escalate when findings no longer fit.',
      'When any step is unclear, the safe action is stop, protect the patient within current orders, notify the RN, and document.',
      'LMS knowledge completion remains separate from observed practical competency sign-off.'
    ],
    keyPoints: [
      { icon: '🧭', title: 'Full pathway', detail: 'Plan, frequency, delegation, and escalation work together.' },
      { icon: '🛑', title: 'Stop when unsure', detail: 'Unclear scope = stop, notify RN, document.' },
      { icon: '✅', title: 'Knowledge ≠ competency', detail: 'Quiz completion is not independent practice clearance.' }
    ],
    clinicalTip: 'When in doubt, escalate—never invent authority.',
    sourceLabels: [
      { kind: 'Federal', text: "42 CFR § 484.60" },
      { kind: 'Agency', text: "CL-CP-001" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: 'integrate', label: 'Integrate pathway', shortLabel: 'Integrate pa…', ariaLabel: 'Investigate Integrate pathway',
        x: 50, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-0',
        observe: "The patient, current POC, ordered supplies, frequency, assigned task, and expected findings all match.",
        identifyChoices: [
          { id: 'i1', label: "All authorization gates are satisfied for final implementation within LVN scope and competence.", correct: true, rationale: "Correct. All authorization gates are satisfied for final implementation within LVN scope and competence." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with the authorized intervention exactly as ordered; monitor response and stop or escalate if any gate changes.", correct: true, rationale: "Correct. Proceed with the authorized intervention exactly as ordered; monitor response and stop or escalate if any gate changes." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record current order/frequency, supplies, intervention/parameters, findings, response, teaching, RN contact when applicable.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The patient, current POC, ordered supplies, frequency, assigned task, and expected findings all match.",
          meaning: "All authorization gates are satisfied for final implementation within LVN scope and competence.",
          action: "Proceed with the authorized intervention exactly as ordered; monitor response and stop or escalate if any gate changes.",
          notify: "No routine notice for expected response; notify the supervising RN during the visit for mismatch, refusal, new need, or unexpected response.",
          document: "Record current order/frequency, supplies, intervention/parameters, findings, response, teaching, RN contact when applicable.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'stop', label: 'Stop when unsure', shortLabel: 'Stop when un…', ariaLabel: 'Investigate Stop when unsure',
        x: 28, y: 65, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-1',
        observe: "One gate—current order, supply, frequency, scope, competence, or patient match—is unclear.",
        identifyChoices: [
          { id: 'i1', label: "An unclear gate means implementation is not yet authorized, even when the task seems familiar.", correct: true, rationale: "Correct. An unclear gate means implementation is not yet authorized, even when the task seems familiar." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop the affected task, protect the patient within clear current orders, and escalate for RN clarification or updated order.", correct: true, rationale: "Correct. Stop the affected task, protect the patient within clear current orders, and escalate for RN clarification or updated order." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record unclear gate, order reviewed, assessment, care held/continued, RN name/time, clarification/order, disposition.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "One gate—current order, supply, frequency, scope, competence, or patient match—is unclear.",
          meaning: "An unclear gate means implementation is not yet authorized, even when the task seems familiar.",
          action: "Stop the affected task, protect the patient within clear current orders, and escalate for RN clarification or updated order.",
          notify: "Notify the supervising RN before the action; use urgent chain-of-command or emergency escalation when delay risks harm.",
          document: "Record unclear gate, order reviewed, assessment, care held/continued, RN name/time, clarification/order, disposition.",
          policyRefs: ["42 CFR § 484.60", "CL-CP-001"],
        },
      },      {
        id: 'competency', label: 'Competency boundary', shortLabel: 'Competency b…', ariaLabel: 'Investigate Competency boundary',
        x: 75, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-2',
        observe: "The learner completed the knowledge check, but no separate observed competency sign-off is present.",
        identifyChoices: [
          { id: 'i1', label: "Knowledge completion does not authorize independent field performance or expand LVN scope.", correct: true, rationale: "Correct. Knowledge completion does not authorize independent field performance or expand LVN scope." },
          { id: 'i2', label: "Treat it as routine without checking the current order, scope, or patient status.", correct: false, rationale: "Incorrect. Identify the actual authorization or safety condition first." }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold independent performance until an authorized evaluator documents practical competency; practice only under assigned supervision.", correct: true, rationale: "Correct. Hold independent performance until an authorized evaluator documents practical competency; practice only under assigned supervision." },
          { id: 'd2', label: "Proceed: make the requested change now and seek authorization later.", correct: false, rationale: "Incorrect. Later authorization does not validate an unapproved action." },
          { id: 'd3', label: "Stop all care and leave without assessing, notifying, or documenting.", correct: false, rationale: "Incorrect. A safe stop includes assessment, notification, authorized care when appropriate, and documentation." }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record skill, knowledge completion, observed evaluation status, supervisor/evaluator name/time, supervision/remediation plan, sign-off status.", correct: true, rationale: "Correct. These elements create a patient-specific authorization and communication trail." },
          { id: 'doc2', label: "Chart only ‘care provided as ordered’ or ‘RN aware’ without findings, names, times, direction, response, or disposition.", correct: false, rationale: "Incorrect. Generic wording does not establish what occurred or how it was resolved." }
        ],
        feedback: {
          observed: "The learner completed the knowledge check, but no separate observed competency sign-off is present.",
          meaning: "Knowledge completion does not authorize independent field performance or expand LVN scope.",
          action: "Hold independent performance until an authorized evaluator documents practical competency; practice only under assigned supervision.",
          notify: "Notify the supervisor/educator before accepting independent assignment; escalate a patient-care assignment conflict to the supervising RN.",
          document: "Record skill, knowledge completion, observed evaluation status, supervisor/evaluator name/time, supervision/remediation plan, sign-off status.",
          policyRefs: ["CL-CP-001"],
        },
      }
    ],
  }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1, stem: 'Based on scope of practice and the Plan of Care, what is the required course of action when the patient condition changes significantly?', options: [
      'Independently modify the Plan of Care',
      'Implement authorized directives and immediately report the condition change to the supervising RN',
      'Create a temporary undocumented care plan until the physician can be reached',
      'Continue the old plan without notification'
    ], correct: 1, rationale: 'LVNs implement the authorized POC and escalate condition changes to the RN. They do not independently rewrite the plan.',
  },
  {
    id: 2, stem: 'What is the LVN\'s relationship to the CMS-485 Plan of Care?', options: [
      'The LVN can add a new service if the patient requests it',
      'The CMS-485 is physician-authorized and binds the LVN to listed interventions only',
      'The LVN may independently discharge the patient when interventions are complete',
      'The LVN authors the 485 after each visit'
    ], correct: 1, rationale: 'The 485 is physician-authorized. LVNs perform listed interventions only.',
  },
  {
    id: 3, stem: 'What should you do if a patient refuses a visit?', options: [
      'Reschedule on your own for tomorrow',
      'Document as missed and notify the supervising RN',
      'Skip it and add an extra visit next week without notice',
      'Cancel the remaining episode'
    ], correct: 1, rationale: 'Missed/refused visits must be documented and routed to the RN.',
  },
  {
    id: 4, stem: 'Who does the LVN practice under in home health?', options: [
      'Completely independently',
      'Under the direction of an RN or physician',
      'Under the Home Health Aide',
      'Under family preference only'
    ], correct: 1, rationale: 'LVN practice is under RN or physician direction.',
  },
  {
    id: 5, stem: 'What do you do if a patient has abnormal vitals?', options: [
      'Give unprescribed OTC medication',
      'Document only and wait until next visit',
      'Immediately notify the supervising RN and wait for further instruction',
      'Change the POC frequency yourself'
    ], correct: 2, rationale: 'Abnormal findings require immediate RN notification and instructions.',
  },
  {
    id: 6, stem: 'Under 42 CFR § 484.60, home health services must be furnished:', options: [
      'According to clinician preference',
      'In accordance with an individualized plan of care',
      'Without orders if the patient agrees',
      'Only after the LVN completes OASIS'
    ], correct: 1, rationale: 'Federal CoP require services per an individualized plan of care.',
  },
  {
    id: 7, stem: 'An LVN may independently add a service to the CMS-485 when:', options: [
      'The patient requests it strongly',
      'Never — order updates require the physician/RN pathway',
      'The HHA agrees',
      'The visit is running long'
    ], correct: 1, rationale: 'LVNs cannot independently add services to the plan.',
  },
  {
    id: 8, stem: 'A missed visit should be:', options: [
      'Ignored if the patient felt fine',
      'Documented and reported to the supervising RN',
      'Silently made up next week',
      'Counted as completed'
    ], correct: 1, rationale: 'Missed visits require documentation and RN notification; make-ups need authorization.',
  },
  {
    id: 9, stem: 'If you are unsure whether a task is within LVN scope, you should:', options: [
      'Perform it carefully anyway',
      'Skip documentation',
      'Stop and contact the supervising RN for clarification',
      'Ask the HHA to decide'
    ], correct: 2, rationale: 'Unclear scope requires RN clarification before performance.',
  },
  {
    id: 10, stem: 'Knowledge-check completion in this module means:', options: [
      'Practical competency is certified',
      'Independent field clearance is granted',
      'Knowledge was assessed; practical competency remains a separate observed sign-off',
      'The LVN may modify the POC'
    ], correct: 2, rationale: 'LMS knowledge completion remains separate from practical competency validation.',
  }
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:10px;max-width:92px;white-space:normal;text-align:center;line-height:1.15}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:11px}
  .lvn002-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(560px,100%);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:11px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
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
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the LVN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
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
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, index) => (
          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden>{kp.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{kp.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{kp.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
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
        <div className="lvn002-scene-title" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
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
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
              { label: 'Conditional', color: CI.orange, tip: 'RN oversight required' },
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


const STORAGE_KEY = 'lvn-005-progress-v5500';

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

/** Static approved Care Indeed mark (non-interactive, non-animated) */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt="Care Indeed logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN005() {
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
          <BrandMark size={32} />
          <span className="brand-text">LVN-005 — Plan of Care</span>
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
