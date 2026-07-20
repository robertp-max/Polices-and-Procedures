/**
 * LVN-001 — EHR System — LVN Documentation Module
 * Version: 5.4.0-RECOVERY
 * Shell baseline: LVN-002 v5.3.5 + full ScenarioStage interaction
 * Policy: 42 CFR § 484.115(e) (corrected from (c))
 * Interaction: Observe → Identify → Decide → Document → Feedback → Complete
 * Practical competency remains separate from knowledge completion.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-001/lesson-01-ehr-dashboard.png';
import img02 from './assets/lvn-001/lesson-02-soap-note.png';
import img03 from './assets/lvn-001/lesson-03-timelines.png';
import img04 from './assets/lvn-001/lesson-04-required-fields.png';
import img05 from './assets/lvn-001/lesson-05-doc-errors.png';
import img06 from './assets/lvn-001/lesson-06-cosign.png';
import img07 from './assets/lvn-001/lesson-07-complete.png';

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

const MODULE_META = { id: 'LVN-001', title: 'EHR System — LVN Documentation Module', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'De-identified LVN EHR dashboard with role-safe navigation, patient queue, and visit note panel aligned to the lesson hotspots.',
  'De-identified correct patient chart with four large SOAP note field areas aligned vertically for hotspot overlays.',
  'De-identified same-day documentation timeline with audit trail, completion milestone, and RN review window.',
  'De-identified EHR form showing required time, vital-sign, and skilled-narrative validation areas.',
  'De-identified amendment workflow preserving the locked original note beside a timestamped addendum and audit trail.',
  'De-identified RN review queue with submitted LVN note, co-sign action, and final locked record.',
  'De-identified completed patient-specific note with ordered-care response, RN notification, authentication, and supervised practice context.',
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Welcome',
    title: 'Welcome to the EHR for LVNs',
    subtitle: 'Your Documentation Command Center',
    narration: [
      'Welcome to the Electronic Health Record training for Licensed Vocational Nurses at Care Indeed Home Health Care. As an LVN working under the supervision of a Registered Nurse per 42 CFR § 484.115(e) (federal requirement), your documentation in the EHR is critical for patient safety, regulatory compliance, and continuity of care.',
      'Unlike Registered Nurses, you will not complete OASIS assessments or initial comprehensive assessments — those remain RN/authorized clinician functions. However, every visit note you write becomes part of the permanent medical record and may be reviewed during CMS surveys. Surveyors may pull visit notes and evaluate them for specificity, clinical reasoning within LVN scope, timely completion, and evidence that the plan of care was followed.',
      'Incomplete or non-specific visit documentation can expose the agency to survey findings. At Care Indeed, we use a web-based EHR platform designed for home health documentation. This module walks you through the screens, fields, and workflows you need to document efficiently and compliantly within LVN scope.',
      'Your EHR access is role-based — you see the LVN-specific dashboard, not the RN or OASIS modules. This design reduces scope-of-practice documentation errors and keeps you within authorized fields. The EHR prompts for required information, timestamps entries, and routes notes to the supervising RN for co-signature per agency policy and federal supervision requirements.'
    ],
    keyPoints: [
      { icon: '🔐', title: 'Role-Based Access', detail: 'LVN dashboard only — no OASIS or comprehensive assessment modules' },
      { icon: '📋', title: 'Every Note May Be Reviewed', detail: 'CMS surveyors may pull visit notes during surveys (federal survey process)' },
      { icon: '⏱️', title: 'Timely Documentation', detail: 'Agency target: same-day entry; agency co-signature window applies after submit' },
      { icon: '🔗', title: 'Co-Signature Routing', detail: 'System routes notes to supervising RN for review & co-sign (federal supervision + agency workflow)' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Federal", text: "42 CFR § 484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: 'dashboard-nav',
        label: 'LVN Dashboard',
        shortLabel: 'LVN Dashboard',
        ariaLabel: 'Investigate LVN Dashboard',
        x: 58, y: 52, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-0-0',
        observe: 'Role-based landing page: today’s schedule, pending notes, and alerts. OASIS and comprehensive assessment tools are not available under LVN login.',
        identifyChoices: [
          { id: 'i1', label: "The dashboard is the LVN’s authorized entry point showing only the schedule, pending notes, and alerts.", correct: true, rationale: "Correct. The dashboard is the LVN’s authorized entry point showing only the schedule, pending notes, and alerts." },
          { id: 'i2', label: 'LVN Dashboard can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'LVN Dashboard is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed: Open today’s assigned work from the LVN dashboard; do not attempt OASIS or comprehensive-assessment functions.", correct: true, rationale: "Correct. Open today’s assigned work from the LVN dashboard; do not attempt OASIS or comprehensive-assessment functions." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "For a patient-specific alert, record the alert, acknowledgement time, RN name, notification time, and direction received.", correct: true, rationale: "Correct. For a patient-specific alert, record the alert, acknowledgement time, RN name, notification time, and direction received." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Role-based landing page: today’s schedule, pending notes, and alerts. OASIS and comprehensive assessment tools are not available under LVN login.',
          meaning: "The dashboard is the LVN’s authorized entry point showing only the schedule, pending notes, and alerts.",
          action: "Open today’s assigned work from the LVN dashboard; do not attempt OASIS or comprehensive-assessment functions.",
          notify: "No routine notice is needed. If a patient-specific alert is critical, notify the supervising RN at the urgency stated in the alert.",
          document: "For a patient-specific alert, record the alert, acknowledgement time, RN name, notification time, and direction received.",
          policyRefs: ["CL-CD-001", "42 CFR § 484.110"],
        },
      },      {
        id: 'visit-queue',
        label: 'Visit Queue',
        shortLabel: 'Visit Queue',
        ariaLabel: 'Investigate Visit Queue',
        x: 18, y: 72, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-0-1',
        observe: 'Assigned patients with status indicators — complete, in progress, or overdue. Open only the correct patient after ID verification.',
        identifyChoices: [
          { id: 'i1', label: "The visit queue lists assigned patients and statuses; the correct chart may be opened only after two-identifier verification.", correct: true, rationale: "Correct. The visit queue lists assigned patients and statuses; the correct chart may be opened only after two-identifier verification." },
          { id: 'i2', label: 'Visit Queue can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Visit Queue is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold for identity verification: Hold chart entry until two approved identifiers match, then open the assigned visit.", correct: true, rationale: "Correct. Hold chart entry until two approved identifiers match, then open the assigned visit." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record the identifiers used, verification result, any mismatch, RN notified, time, and direction.", correct: true, rationale: "Correct. Record the identifiers used, verification result, any mismatch, RN notified, time, and direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Assigned patients with status indicators — complete, in progress, or overdue. Open only the correct patient after ID verification.',
          meaning: "The visit queue lists assigned patients and statuses; the correct chart may be opened only after two-identifier verification.",
          action: "Hold chart entry until two approved identifiers match, then open the assigned visit.",
          notify: "If identity cannot be verified or the wrong patient appears, stop and notify the supervising RN before documenting.",
          document: "Record the identifiers used, verification result, any mismatch, RN notified, time, and direction.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'note-panel',
        label: 'Visit Notes',
        shortLabel: 'Visit Notes',
        ariaLabel: 'Investigate Visit Notes',
        x: 72, y: 78, zone: 'authorized' as ZoneKind,
        leftAnchorId: 'kp-0-2',
        observe: 'Quick-launch panel to start, continue, or review visit notes within LVN-authorized fields only.',
        identifyChoices: [
          { id: 'i1', label: "The note panel starts or resumes documentation only in LVN-authorized fields.", correct: true, rationale: "Correct. The note panel starts or resumes documentation only in LVN-authorized fields." },
          { id: 'i2', label: 'Visit Notes can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Visit Notes is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed within authorized fields: Complete the assigned visit note in unlocked LVN fields; leave RN-only and OASIS fields untouched.", correct: true, rationale: "Correct. Complete the assigned visit note in unlocked LVN fields; leave RN-only and OASIS fields untouched." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record note status, fields completed, system limitation, person notified, time, and resolution.", correct: true, rationale: "Correct. Record note status, fields completed, system limitation, person notified, time, and resolution." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Quick-launch panel to start, continue, or review visit notes within LVN-authorized fields only.',
          meaning: "The note panel starts or resumes documentation only in LVN-authorized fields.",
          action: "Complete the assigned visit note in unlocked LVN fields; leave RN-only and OASIS fields untouched.",
          notify: "If a required LVN field is unexpectedly unavailable, notify the supervising RN or EHR support before end of day.",
          document: "Record note status, fields completed, system limitation, person notified, time, and resolution.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      }
    ],
  },
  {
    id: 1,
    shortName: 'SOAP',
    title: 'Visit Note Structure — The SOAP Framework',
    subtitle: 'Building Clinical Narratives That Withstand Audit',
    narration: [
      'Every LVN visit note at Care Indeed follows the SOAP framework: Subjective, Objective, Assessment, and Plan. SOAP is widely recognized professional documentation guidance used by CMS surveyors, accrediting bodies, and clinical educators — and it is Care Indeed’s required note structure (agency policy). It creates a logical clinical narrative any reviewer can follow.',
      'The Subjective section captures what the patient (or caregiver) tells you: chief complaint, symptom description, pain levels using a validated scale, medication compliance reports, and concerns. Prefer direct quotes when possible — “Patient states chest pain is 4 out of 10 and worse with deep breathing” is stronger evidence than “patient has some chest pain.”',
      'The Objective section records what you observe and measure: vital signs, physical findings, wound measurements (without independently assigning RN/physician staging when staging is outside your authorized role), and functional observations. Be specific and quantifiable: “Left lower leg wound measures 2.3 cm × 1.8 cm × 0.2 cm, wound bed 80% granulation, 20% slough, moderate serous drainage, periwound skin intact, no erythema.”',
      'The Assessment section is your clinical interpretation within LVN scope — connecting subjective reports to objective findings and recognizing change. This section is often heavily reviewed because it shows clinical reasoning: “Pain decreased from 6/10 to 4/10 since last visit, correlating with prescribed NSAID use as reported; wound bed granulation increased versus last visit.” Do not invent diagnoses or independently modify the Plan of Care.'
    ],
    keyPoints: [
      { icon: '💬', title: 'S — Subjective', detail: 'Patient’s own words, direct quotes, symptoms, concerns' },
      { icon: '🔍', title: 'O — Objective', detail: 'Vitals, measurements, physical findings — quantifiable data' },
      { icon: '🧠', title: 'A — Assessment', detail: 'Clinical reasoning within LVN scope connecting S + O (often highly reviewed)' },
      { icon: '📋', title: 'P — Plan', detail: 'Next steps under existing POC, RN notifications, education, follow-up' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-003" },
      { kind: "Federal", text: "42 CFR § 484.110" },
      { kind: "Federal", text: "42 CFR § 484.115(e)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: 'soap-s',
        label: 'Subjective',
        shortLabel: 'Subjective',
        ariaLabel: 'Investigate Subjective',
        x: 42, y: 35, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-1-0',
        observe: 'Use direct patient quotes. Specify pain scale (0–10), onset, quality, and aggravating/relieving factors.',
        identifyChoices: [
          { id: 'i1', label: "SOAP Subjective captures the patient’s own report through direct quotation and structured symptom details.", correct: true, rationale: "Correct. SOAP Subjective captures the patient’s own report through direct quotation and structured symptom details." },
          { id: 'i2', label: 'Subjective can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Subjective is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with patient-reported data: Enter the exact quote plus pain score, onset, quality, and aggravating or relieving factors without diagnosing.", correct: true, rationale: "Correct. Enter the exact quote plus pain score, onset, quality, and aggravating or relieving factors without diagnosing." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record quoted words, pain score, onset, quality, aggravating and relieving factors, report time, RN notified, time, and direction.", correct: true, rationale: "Correct. Record quoted words, pain score, onset, quality, aggravating and relieving factors, report time, RN notified, time, and direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Use direct patient quotes. Specify pain scale (0–10), onset, quality, and aggravating/relieving factors.',
          meaning: "SOAP Subjective captures the patient’s own report through direct quotation and structured symptom details.",
          action: "Enter the exact quote plus pain score, onset, quality, and aggravating or relieving factors without diagnosing.",
          notify: "New severe symptoms such as chest pain or sudden dyspnea require urgent RN or clinical-supervisor escalation under the emergency pathway.",
          document: "Record quoted words, pain score, onset, quality, aggravating and relieving factors, report time, RN notified, time, and direction.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'soap-o',
        label: 'Objective',
        shortLabel: 'Objective',
        ariaLabel: 'Investigate Objective',
        x: 42, y: 50, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-1-1',
        observe: 'All vital signs + physical findings. Wound measurements in cm. Functional observations with assist levels. No independent staging if staging is RN/authorized-clinician role.',
        identifyChoices: [
          { id: 'i1', label: "SOAP Objective records measured and observed facts, not independent staging or diagnosis.", correct: true, rationale: "Correct. SOAP Objective records measured and observed facts, not independent staging or diagnosis." },
          { id: 'i2', label: 'Objective can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Objective is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with objective findings: Capture complete vital signs, measurements, findings, and assist levels; do not assign staging reserved to the RN or provider.", correct: true, rationale: "Correct. Capture complete vital signs, measurements, findings, and assist levels; do not assign staging reserved to the RN or provider." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record exact values with position or device, measurements, assist level, RN name, notification time, mode, and instructions.", correct: true, rationale: "Correct. Record exact values with position or device, measurements, assist level, RN name, notification time, mode, and instructions." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'All vital signs + physical findings. Wound measurements in cm. Functional observations with assist levels. No independent staging if staging is RN/authorized-clinician role.',
          meaning: "SOAP Objective records measured and observed facts, not independent staging or diagnosis.",
          action: "Capture complete vital signs, measurements, findings, and assist levels; do not assign staging reserved to the RN or provider.",
          notify: "Values outside ordered parameters require same-visit RN notification, with urgency based on severity.",
          document: "Record exact values with position or device, measurements, assist level, RN name, notification time, mode, and instructions.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'soap-a',
        label: 'Assessment',
        shortLabel: 'Assessment',
        ariaLabel: 'Investigate Assessment',
        x: 42, y: 65, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-1-2',
        observe: 'Connect S + O findings. Show trending (improving/declining). Do not diagnose or rewrite the POC — escalate changes to the RN.',
        identifyChoices: [
          { id: 'i1', label: "SOAP Assessment links subjective and objective findings and trends within LVN scope without diagnosing or changing the plan of care.", correct: true, rationale: "Correct. SOAP Assessment links subjective and objective findings and trends within LVN scope without diagnosing or changing the plan of care." },
          { id: 'i2', label: 'Assessment can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Assessment is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with scoped reasoning: Connect the patient report to measured findings and trend; escalate change rather than creating a diagnosis or order.", correct: true, rationale: "Correct. Connect the patient report to measured findings and trend; escalate change rather than creating a diagnosis or order." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record the S-to-O connection, trend from baseline, RN notified, time, report, and instructions.", correct: true, rationale: "Correct. Record the S-to-O connection, trend from baseline, RN notified, time, report, and instructions." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Connect S + O findings. Show trending (improving/declining). Do not diagnose or rewrite the POC — escalate changes to the RN.',
          meaning: "SOAP Assessment links subjective and objective findings and trends within LVN scope without diagnosing or changing the plan of care.",
          action: "Connect the patient report to measured findings and trend; escalate change rather than creating a diagnosis or order.",
          notify: "A worsening trend or out-of-parameter finding requires same-day RN notification, urgent when the finding is severe.",
          document: "Record the S-to-O connection, trend from baseline, RN notified, time, report, and instructions.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      },      {
        id: 'soap-p',
        label: 'Plan',
        shortLabel: 'Plan',
        ariaLabel: 'Investigate Plan',
        x: 42, y: 78, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-1-3',
        observe: 'Document communications — RN calls, instructions received, education topics, next visit — under the existing ordered plan of care.',
        identifyChoices: [
          { id: 'i1', label: "SOAP Plan records authorized next steps, education, patient response, and RN communication under the existing plan of care.", correct: true, rationale: "Correct. SOAP Plan records authorized next steps, education, patient response, and RN communication under the existing plan of care." },
          { id: 'i2', label: 'Plan can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Plan is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed under the ordered plan: Continue only ordered actions and record teaching, response, RN direction, and next-visit focus; do not create independent orders.", correct: true, rationale: "Correct. Continue only ordered actions and record teaching, response, RN direction, and next-visit focus; do not create independent orders." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record whom was notified, time, reason, instructions, teach-back, response, ordered actions continued, and next-visit task.", correct: true, rationale: "Correct. Record whom was notified, time, reason, instructions, teach-back, response, ordered actions continued, and next-visit task." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Document communications — RN calls, instructions received, education topics, next visit — under the existing ordered plan of care.',
          meaning: "SOAP Plan records authorized next steps, education, patient response, and RN communication under the existing plan of care.",
          action: "Continue only ordered actions and record teaching, response, RN direction, and next-visit focus; do not create independent orders.",
          notify: "Notify the RN for new needs or parameter breaches at routine, same-day, or urgent priority according to the finding.",
          document: "Record whom was notified, time, reason, instructions, teach-back, response, ordered actions continued, and next-visit task.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      }
    ],
  },
  {
    id: 2,
    shortName: 'Timelines',
    title: 'Documentation Timelines & Compliance',
    subtitle: 'Deadlines That Protect Patients and Compliance',
    narration: [
      'Documentation timeliness is a compliance expectation at Care Indeed. Federal CMS Conditions of Participation require clinical records to support care and be maintained appropriately; late or incomplete documentation is a frequent survey risk area. Specific hour-based deadlines below are Care Indeed agency policy unless a statute or regulation is cited.',
      'Your primary agency target is same-day documentation: complete the visit note before the end of the calendar day on which the visit occurred. Same-day documentation is preferred because clinical observations are freshest, patient statements are most accurate, and the supervising RN can act while the information is still clinically useful.',
      'Per agency policy, the maximum deadline for visit note completion is 24 hours after the visit. Notes submitted after that window are flagged in the EHR as late and may trigger supervisor and Quality alerts. Patterns of late documentation may lead to coaching or performance processes under agency HR/quality policy — not automatic federal “license revocation,” which would require separate regulatory or board processes.',
      'Co-signature adds a second agency-policy timeline: after you submit, the supervising RN is expected to review and co-sign within 48 hours. The RN cannot co-sign what does not exist — a late LVN note compresses the supervisory review window. Federal supervision (42 CFR § 484.115(e)) requires RN oversight of LVN services; the 48-hour clock is how Care Indeed operationalizes timely review.'
    ],
    keyPoints: [
      { icon: '🎯', title: 'Same-Day Target (Agency)', detail: 'Complete visit note before end of calendar day — preferred practice' },
      { icon: '⏰', title: '24-Hour Maximum (Agency)', detail: 'Agency absolute deadline — late notes flagged in the EHR' },
      { icon: '📝', title: '48-Hour Co-Sign (Agency)', detail: 'RN review/co-sign window after your submission (supports federal supervision)' },
      { icon: '🔎', title: 'Timestamp Audit Trail', detail: 'EHR records open/save/submit times — patterns may be reviewed' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-004" },
      { kind: "Federal", text: "42 CFR § 484.110" },
      { kind: "Federal", text: "42 CFR § 484.115(e)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: 'clock-center',
        label: 'Documentation Clock',
        shortLabel: 'Documentatio…',
        ariaLabel: 'Investigate Documentation Clock',
        x: 78, y: 18, zone: 'authorized' as ZoneKind,
        leftAnchorId: 'kp-2-0',
        observe: 'Agency compliance clock starts when the visit ends. Same-day is the target; 24 hours is the agency maximum.',
        identifyChoices: [
          { id: 'i1', label: "The agency timing standard is same-day completion with a 24-hour maximum from visit end.", correct: true, rationale: "Correct. The agency timing standard is same-day completion with a 24-hour maximum from visit end." },
          { id: 'i2', label: 'Documentation Clock can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Documentation Clock is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed within the agency clock: Finish and submit the note the same day and never later than 24 hours after the visit ends.", correct: true, rationale: "Correct. Finish and submit the note the same day and never later than 24 hours after the visit ends." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record actual visit end and submit times, delay reason, temporary record method, RN or support contact, time, and resolution.", correct: true, rationale: "Correct. Record actual visit end and submit times, delay reason, temporary record method, RN or support contact, time, and resolution." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Agency compliance clock starts when the visit ends. Same-day is the target; 24 hours is the agency maximum.',
          meaning: "The agency timing standard is same-day completion with a 24-hour maximum from visit end.",
          action: "Finish and submit the note the same day and never later than 24 hours after the visit ends.",
          notify: "If downtime or an emergency threatens same-day completion, promptly notify the supervising RN and EHR support and use the secure downtime process.",
          document: "Record actual visit end and submit times, delay reason, temporary record method, RN or support contact, time, and resolution.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      },      {
        id: 'milestone-1',
        label: 'Same-Day Entry',
        shortLabel: 'Same-Day Entry',
        ariaLabel: 'Investigate Same-Day Entry',
        x: 55, y: 60, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-2-1',
        observe: 'Best practice: complete the note before driving to the next patient or by end of day while recall is freshest.',
        identifyChoices: [
          { id: 'i1', label: "Completing the note before the next patient or end of day reduces omissions while recall is fresh.", correct: true, rationale: "Correct. Completing the note before the next patient or end of day reduces omissions while recall is fresh." },
          { id: 'i2', label: 'Same-Day Entry can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Same-Day Entry is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed before the next patient: Prioritize the current patient’s complete note before opening another chart whenever feasible.", correct: true, rationale: "Correct. Prioritize the current patient’s complete note before opening another chart whenever feasible." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record visit and completion times and, for delay, the RN contacted, time, reason, and expected submission.", correct: true, rationale: "Correct. Record visit and completion times and, for delay, the RN contacted, time, reason, and expected submission." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Best practice: complete the note before driving to the next patient or by end of day while recall is freshest.',
          meaning: "Completing the note before the next patient or end of day reduces omissions while recall is fresh.",
          action: "Prioritize the current patient’s complete note before opening another chart whenever feasible.",
          notify: "If workload threatens timely completion, notify the supervising RN before end of day with the expected submission time.",
          document: "Record visit and completion times and, for delay, the RN contacted, time, reason, and expected submission.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      },      {
        id: 'milestone-2',
        label: 'RN Co-Sign Window',
        shortLabel: 'RN Co-Sign W…',
        ariaLabel: 'Investigate RN Co-Sign Window',
        x: 28, y: 72, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-2-2',
        observe: 'Agency 48-hour RN review window after submit. Your late note compresses RN review time and increases dual-flag risk.',
        identifyChoices: [
          { id: 'i1', label: "The agency 48-hour RN review window begins after submission; a late note compresses supervision review time.", correct: true, rationale: "Correct. The agency 48-hour RN review window begins after submission; a late note compresses supervision review time." },
          { id: 'i2', label: 'RN Co-Sign Window can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'RN Co-Sign Window is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed promptly to protect review time: Submit an accurate note promptly so the RN retains the full agency review interval.", correct: true, rationale: "Correct. Submit an accurate note promptly so the RN retains the full agency review interval." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record submission time, delay reason, RN notified, notification time, and review direction.", correct: true, rationale: "Correct. Record submission time, delay reason, RN notified, notification time, and review direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Agency 48-hour RN review window after submit. Your late note compresses RN review time and increases dual-flag risk.',
          meaning: "The agency 48-hour RN review window begins after submission; a late note compresses supervision review time.",
          action: "Submit an accurate note promptly so the RN retains the full agency review interval.",
          notify: "If submission will be late relative to the visit day, notify the supervising RN that day so review can be prioritized.",
          document: "Record submission time, delay reason, RN notified, notification time, and review direction.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      }
    ],
  },
  {
    id: 3,
    shortName: 'Required Fields',
    title: 'LVN-Specific Required Fields',
    subtitle: 'Every Field Matters for Compliance',
    narration: [
      'The EHR visit note template for LVNs contains required field groups mapped to federal record expectations, privacy/security good practice, and Care Indeed policy. Leaving required fields blank or entering generic data creates documentation deficiencies. Walk through each group and what constitutes compliant documentation.',
      'Patient identification fields include name, medical record number, and date of birth. These often auto-populate from the schedule, but you must verify identity at every visit per agency patient-identification policy. Wrong-patient documentation is a never-event risk.',
      'Visit logistics include date of service, time in, and time out. These must reflect actual times. Knowingly falsifying visit times can constitute fraud under the federal False Claims Act and related enforcement frameworks — never estimate “for convenience.” Where enabled, the EHR may geo-tag check-in/out using device GPS as an independent verification layer (agency system configuration).',
      'Vital signs are required at every skilled nursing visit per agency clinical documentation standards: temperature, pulse, respirations, blood pressure, oxygen saturation, weight when indicated, and pain level using a validated 0–10 numeric rating scale. Document method/position for blood pressure and device used for oxygen saturation when applicable. Missing vital-sign elements is among the most common LVN documentation gaps found in quality review.'
    ],
    keyPoints: [
      { icon: '👤', title: 'Patient ID Verification', detail: 'Name + MRN + DOB — verify every visit (agency ID policy)' },
      { icon: '📅', title: 'Actual Visit Times', detail: 'Real time in/out — GPS may verify; falsification can be fraud' },
      { icon: '💓', title: 'Complete Vital Signs', detail: 'T/P/R/BP/O2/Pain each visit — common quality gap when incomplete' },
      { icon: '📋', title: 'Skilled Narrative', detail: 'No empty generics — specific, measurable clinical language' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-003" },
      { kind: "Federal", text: "42 CFR § 484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: 'field-time',
        label: 'Time In/Out',
        shortLabel: 'Time In/Out',
        ariaLabel: 'Investigate Time In/Out',
        x: 48, y: 40, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-3-0',
        observe: 'Actual times only. Rounded or invented times can flag for audit. GPS verification may apply per system settings.',
        identifyChoices: [
          { id: 'i1', label: "Time in and time out must reflect actual visit boundaries; GPS may corroborate but never replaces honest entry.", correct: true, rationale: "Correct. Time in and time out must reflect actual visit boundaries; GPS may corroborate but never replaces honest entry." },
          { id: 'i2', label: 'Time In/Out can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Time In/Out is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold until times are accurate: Enter exact times. Hold submission and resolve an estimate, mismatch, or device failure rather than rounding or inventing.", correct: true, rationale: "Correct. Enter exact times. Hold submission and resolve an estimate, mismatch, or device failure rather than rounding or inventing." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record actual time in and out, GPS match or mismatch, correction source, RN or support contact, time, and resolution.", correct: true, rationale: "Correct. Record actual time in and out, GPS match or mismatch, correction source, RN or support contact, time, and resolution." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Actual times only. Rounded or invented times can flag for audit. GPS verification may apply per system settings.',
          meaning: "Time in and time out must reflect actual visit boundaries; GPS may corroborate but never replaces honest entry.",
          action: "Enter exact times. Hold submission and resolve an estimate, mismatch, or device failure rather than rounding or inventing.",
          notify: "Notify the supervising RN or EHR support the same day when a GPS or time mismatch remains unresolved before submission.",
          document: "Record actual time in and out, GPS match or mismatch, correction source, RN or support contact, time, and resolution.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'field-vitals',
        label: 'Vital Signs',
        shortLabel: 'Vital Signs',
        ariaLabel: 'Investigate Vital Signs',
        x: 48, y: 55, zone: 'authorized' as ZoneKind,
        leftAnchorId: 'kp-3-1',
        observe: 'Required parameters typically include T, P, R, BP (with position), O2 (with device when used), and Pain (0–10 scale).',
        identifyChoices: [
          { id: 'i1', label: "Required vital signs include temperature, pulse, respirations, blood pressure with position, oxygen saturation with device or room air, and pain.", correct: true, rationale: "Correct. Required vital signs include temperature, pulse, respirations, blood pressure with position, oxygen saturation with device or room air, and pain." },
          { id: 'i2', label: 'Vital Signs can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Vital Signs is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed after completing the full set: Obtain and enter the complete set while with the patient; do not leave oxygen context or pain blank.", correct: true, rationale: "Correct. Obtain and enter the complete set while with the patient; do not leave oxygen context or pain blank." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record each value, BP position, oxygen device or room air, pain score, symptoms, RN name, notification time, mode, and instructions.", correct: true, rationale: "Correct. Record each value, BP position, oxygen device or room air, pain score, symptoms, RN name, notification time, mode, and instructions." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Required parameters typically include T, P, R, BP (with position), O2 (with device when used), and Pain (0–10 scale).',
          meaning: "Required vital signs include temperature, pulse, respirations, blood pressure with position, oxygen saturation with device or room air, and pain.",
          action: "Obtain and enter the complete set while with the patient; do not leave oxygen context or pain blank.",
          notify: "Values outside ordered parameters, such as BP 182/96, require same-visit RN notification with urgency based on symptoms and agency protocol.",
          document: "Record each value, BP position, oxygen device or room air, pain score, symptoms, RN name, notification time, mode, and instructions.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'field-narrative',
        label: 'Clinical Narrative',
        shortLabel: 'Clinical Nar…',
        ariaLabel: 'Investigate Clinical Narrative',
        x: 48, y: 72, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-3-2',
        observe: 'Must show skilled observation, ordered interventions, response, and reasoning within LVN scope — not a task checklist alone.',
        identifyChoices: [
          { id: 'i1', label: "The clinical narrative must show skilled observation, ordered intervention, patient response, and scoped reasoning rather than a checklist alone.", correct: true, rationale: "Correct. The clinical narrative must show skilled observation, ordered intervention, patient response, and scoped reasoning rather than a checklist alone." },
          { id: 'i2', label: 'Clinical Narrative can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Clinical Narrative is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed with a skilled narrative: Write a patient-specific account connecting findings, ordered actions, response, and clinical reasoning.", correct: true, rationale: "Correct. Write a patient-specific account connecting findings, ordered actions, response, and clinical reasoning." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record finding details, ordered intervention, measurable response, reasoning, RN name, notification time, and direction.", correct: true, rationale: "Correct. Record finding details, ordered intervention, measurable response, reasoning, RN name, notification time, and direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Must show skilled observation, ordered interventions, response, and reasoning within LVN scope — not a task checklist alone.',
          meaning: "The clinical narrative must show skilled observation, ordered intervention, patient response, and scoped reasoning rather than a checklist alone.",
          action: "Write a patient-specific account connecting findings, ordered actions, response, and clinical reasoning.",
          notify: "An unexpected or adverse response requires prompt RN notification, urgent when severe.",
          document: "Record finding details, ordered intervention, measurable response, reasoning, RN name, notification time, and direction.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "CL-CD-004", "42 CFR § 484.110"],
        },
      }
    ],
  },
  {
    id: 4,
    shortName: 'Doc Errors',
    title: 'Common Documentation Errors & Fixes',
    subtitle: 'Learn from Frequent Audit Failures',
    narration: [
      'This page covers five frequent documentation errors identified in home health quality review and survey preparation. Recognizing and avoiding them protects patients, your professional standing, and the agency’s certification readiness.',
      'Error one: Vague or generic language. Phrases like “patient doing well,” “no complaints,” or “condition stable” tell reviewers little about what you assessed. Fix: use specific, measurable documentation — “Patient reports pain decreased from 6/10 to 3/10 since medication adjustment. Ambulating 50 feet with rolling walker, steady gait, no loss of balance.”',
      'Error two: Missing vital signs. Oxygen saturation and pain level are among the parameters most often omitted when notes are incomplete. Fix: obtain and enter the full vital-sign set at the beginning of every skilled visit after patient identification, unless a documented clinical reason applies under agency protocol.',
      'Error three: Copy-paste from previous notes. The EHR may allow pull-forward templates, but identical clinical language across consecutive visits suggests the clinician did not perform an individualized assessment. Every note must reflect that day’s encounter. Templates may structure fields; they must not clone clinical findings.'
    ],
    keyPoints: [
      { icon: '❌', title: 'Vague Language', detail: '“Doing well” → use specific, measurable clinical observations' },
      { icon: '❌', title: 'Missing Vitals', detail: 'O2 sat and pain are commonly missed — obtain the full set first' },
      { icon: '❌', title: 'Copy-Paste Notes', detail: 'Cloned narrative suggests no individualized assessment' },
      { icon: '❌', title: 'No RN Notification', detail: 'Always document: who, when, what reported, instructions received' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-003" },
      { kind: "Agency Policy", text: "CL-CD-004" },
      { kind: "Federal", text: "42 CFR § 484.110" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: 'error-1',
        label: 'Vague → Specific',
        shortLabel: 'Vague → Spec…',
        ariaLabel: 'Investigate Vague → Specific',
        x: 28, y: 45, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-4-0',
        observe: 'Replace “doing well” with objective measurements, functional observations, and patient quotes.',
        identifyChoices: [
          { id: 'i1', label: "Vague language fails to show the patient’s condition or skilled assessment.", correct: true, rationale: "Correct. Vague language fails to show the patient’s condition or skilled assessment." },
          { id: 'i2', label: 'Vague → Specific can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Vague → Specific is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold and replace vague wording: Hold submission and replace vague wording with measurements, functional observations, and direct quotes.", correct: true, rationale: "Correct. Hold submission and replace vague wording with measurements, functional observations, and direct quotes." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record exact measurements, assist level, direct quote, observed response, and any triggered RN notification.", correct: true, rationale: "Correct. Record exact measurements, assist level, direct quote, observed response, and any triggered RN notification." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Replace “doing well” with objective measurements, functional observations, and patient quotes.',
          meaning: "Vague language fails to show the patient’s condition or skilled assessment.",
          action: "Hold submission and replace vague wording with measurements, functional observations, and direct quotes.",
          notify: "No routine notice is needed for wording alone; notify the RN if the clarified facts reveal an out-of-parameter finding.",
          document: "Record exact measurements, assist level, direct quote, observed response, and any triggered RN notification.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "42 CFR § 484.110"],
        },
      },      {
        id: 'error-3',
        label: 'Clone → Original',
        shortLabel: 'Clone → Orig…',
        ariaLabel: 'Investigate Clone → Original',
        x: 72, y: 45, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-4-1',
        observe: 'Each note must reflect TODAY’s assessment. Pull-forward structure is OK; rewrite clinical content.',
        identifyChoices: [
          { id: 'i1', label: "Copied prior-visit clinical content creates an inaccurate record even when a template structure is reused.", correct: true, rationale: "Correct. Copied prior-visit clinical content creates an inaccurate record even when a template structure is reused." },
          { id: 'i2', label: 'Clone → Original can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Clone → Original is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold and rewrite for today: Hold submission and rewrite every clinical section with today’s quotes, measurements, interventions, and response.", correct: true, rationale: "Correct. Hold submission and rewrite every clinical section with today’s quotes, measurements, interventions, and response." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record current-visit facts only; for a locked error, add a timestamped correction, reason, RN notified, time, and direction.", correct: true, rationale: "Correct. Record current-visit facts only; for a locked error, add a timestamped correction, reason, RN notified, time, and direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Each note must reflect TODAY’s assessment. Pull-forward structure is OK; rewrite clinical content.',
          meaning: "Copied prior-visit clinical content creates an inaccurate record even when a template structure is reused.",
          action: "Hold submission and rewrite every clinical section with today’s quotes, measurements, interventions, and response.",
          notify: "If copied content is already locked, notify the supervising RN the same day for the formal addendum pathway.",
          document: "Record current-visit facts only; for a locked error, add a timestamped correction, reason, RN notified, time, and direction.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      },      {
        id: 'error-5',
        label: 'Late → Timely',
        shortLabel: 'Late → Timely',
        ariaLabel: 'Investigate Late → Timely',
        x: 50, y: 78, zone: 'authorized' as ZoneKind,
        leftAnchorId: 'kp-4-2',
        observe: 'Same-day documentation supports best recall and fewer omissions. Use secure downtime wisely.',
        identifyChoices: [
          { id: 'i1', label: "Delayed documentation risks inaccurate recall and compressed RN review; secure downtime preserves timely facts.", correct: true, rationale: "Correct. Delayed documentation risks inaccurate recall and compressed RN review; secure downtime preserves timely facts." },
          { id: 'i2', label: 'Late → Timely can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Late → Timely is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Escalate a threatened late entry: Document same day; if the EHR is unavailable, use secure downtime and later transcribe faithfully with an audit note.", correct: true, rationale: "Correct. Document same day; if the EHR is unavailable, use secure downtime and later transcribe faithfully with an audit note." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record downtime start and end, secure temporary method, transcription time, original visit times, contacts, times, and resolution.", correct: true, rationale: "Correct. Record downtime start and end, secure temporary method, transcription time, original visit times, contacts, times, and resolution." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Same-day documentation supports best recall and fewer omissions. Use secure downtime wisely.',
          meaning: "Delayed documentation risks inaccurate recall and compressed RN review; secure downtime preserves timely facts.",
          action: "Document same day; if the EHR is unavailable, use secure downtime and later transcribe faithfully with an audit note.",
          notify: "Notify the supervising RN and EHR support promptly the same day when downtime or another barrier threatens the timing target.",
          document: "Record downtime start and end, secure temporary method, transcription time, original visit times, contacts, times, and resolution.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      }
    ],
  },
  {
    id: 5,
    shortName: 'Co-Signature',
    title: 'Co-Signature Workflow & RN Supervision',
    subtitle: 'The Documentation Chain of Command',
    narration: [
      'The co-signature workflow is how documentation expresses RN supervision of LVN services under 42 CFR § 484.115(e). Every LVN visit note you create must be reviewed and co-signed by a Registered Nurse per agency policy implementing that federal supervision requirement. Consistent co-signature is essential survey evidence of supervision.',
      'Step one (agency EHR workflow): complete your visit note and select “Submit for RN Review.” Submission locks further casual editing and routes the note to the assigned supervising RN’s queue. The submission timestamp is permanently recorded.',
      'Step two: the supervising RN is notified that your note is pending review. They read the clinical narrative, verify findings make sense, and check required fields. If concerns exist, they may flag the note for revision — unlocking it to you with specific feedback (agency workflow).',
      'Step three: once satisfied, the RN applies an electronic co-signature. This is a professional attestation that the RN reviewed the note against documentation and supervision standards. The co-signature timestamp is permanently recorded with yours.'
    ],
    keyPoints: [
      { icon: '📝', title: 'Step 1: LVN Submits', detail: 'Complete note → Submit → locked & routed to RN queue' },
      { icon: '📤', title: 'Step 2: RN Notified', detail: 'RN reviews full narrative and required fields' },
      { icon: '✅', title: 'Step 3: RN Co-Signs', detail: 'Attestation of review — timestamp permanently recorded' },
      { icon: '🔒', title: 'Step 4: Record Locked', detail: 'Sealed original — changes via formal addendum only' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-004" },
      { kind: "Federal", text: "42 CFR § 484.110" },
      { kind: "Federal", text: "42 CFR § 484.115(e)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: 'step-1',
        label: 'Submit',
        shortLabel: 'Submit',
        ariaLabel: 'Investigate Submit',
        x: 72, y: 38, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-5-0',
        observe: '“Submit for RN Review” locks your note and starts the agency co-sign clock.',
        identifyChoices: [
          { id: 'i1', label: "Submission locks the LVN note, routes it to the RN, and begins the review workflow.", correct: true, rationale: "Correct. Submission locks the LVN note, routes it to the RN, and begins the review workflow." },
          { id: 'i2', label: 'Submit can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Submit is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed only after final review: Verify required fields and accuracy, submit once complete, and confirm routing to the supervising RN.", correct: true, rationale: "Correct. Verify required fields and accuracy, submit once complete, and confirm routing to the supervising RN." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record submit timestamp, route confirmation, and any urgent clinical notification with recipient, time, and direction.", correct: true, rationale: "Correct. Record submit timestamp, route confirmation, and any urgent clinical notification with recipient, time, and direction." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: '“Submit for RN Review” locks your note and starts the agency co-sign clock.',
          meaning: "Submission locks the LVN note, routes it to the RN, and begins the review workflow.",
          action: "Verify required fields and accuracy, submit once complete, and confirm routing to the supervising RN.",
          notify: "Queue routing handles routine review; separately call or message the RN for any urgent clinical finding.",
          document: "Record submit timestamp, route confirmation, and any urgent clinical notification with recipient, time, and direction.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      },      {
        id: 'step-3',
        label: 'RN Co-Signs',
        shortLabel: 'RN Co-Signs',
        ariaLabel: 'Investigate RN Co-Signs',
        x: 55, y: 58, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-5-1',
        observe: 'RN electronic signature attests review. Supports evidence of RN supervision under 42 CFR § 484.115(e).',
        identifyChoices: [
          { id: 'i1', label: "The RN electronic signature attests review and documents supervision of the LVN service.", correct: true, rationale: "Correct. The RN electronic signature attests review and documents supervision of the LVN service." },
          { id: 'i2', label: 'RN Co-Signs can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'RN Co-Signs is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed through RN review: Await RN review after submission and respond promptly to requests through the authorized clarification or addendum path.", correct: true, rationale: "Correct. Await RN review after submission and respond promptly to requests through the authorized clarification or addendum path." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record RN signer and time plus any query, response, correction, and follow-up.", correct: true, rationale: "Correct. Record RN signer and time plus any query, response, correction, and follow-up." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'RN electronic signature attests review. Supports evidence of RN supervision under 42 CFR § 484.115(e).',
          meaning: "The RN electronic signature attests review and documents supervision of the LVN service.",
          action: "Await RN review after submission and respond promptly to requests through the authorized clarification or addendum path.",
          notify: "Respond to RN clarification the same day; escalate a co-sign delay beyond the agency 48-hour expectation through the supervision chain.",
          document: "Record RN signer and time plus any query, response, correction, and follow-up.",
          policyRefs: ["CL-CD-004", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      },      {
        id: 'step-4',
        label: 'Locked Record',
        shortLabel: 'Locked Record',
        ariaLabel: 'Investigate Locked Record',
        x: 82, y: 72, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-5-2',
        observe: 'After co-sign, the original is sealed. Corrections require a formal, timestamped addendum per agency policy.',
        identifyChoices: [
          { id: 'i1', label: "A sealed original preserves the audit trail; post-lock corrections must be additive, attributed, and timestamped.", correct: true, rationale: "Correct. A sealed original preserves the audit trail; post-lock corrections must be additive, attributed, and timestamped." },
          { id: 'i2', label: 'Locked Record can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Locked Record is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Stop silent editing; use an addendum: Stop any attempt to overwrite the locked note and use the formal addendum workflow.", correct: true, rationale: "Correct. Stop any attempt to overwrite the locked note and use the formal addendum workflow." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record addendum author and time, corrected facts, reason, original-note link, RN notified, time, and re-review outcome.", correct: true, rationale: "Correct. Record addendum author and time, corrected facts, reason, original-note link, RN notified, time, and re-review outcome." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'After co-sign, the original is sealed. Corrections require a formal, timestamped addendum per agency policy.',
          meaning: "A sealed original preserves the audit trail; post-lock corrections must be additive, attributed, and timestamped.",
          action: "Stop any attempt to overwrite the locked note and use the formal addendum workflow.",
          notify: "Notify the supervising RN the same day when a material clinical correction requires re-review.",
          document: "Record addendum author and time, corrected facts, reason, original-note link, RN notified, time, and re-review outcome.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110"],
        },
      }
    ],
  },
  {
    id: 6,
    shortName: 'Practice',
    title: 'Module Summary & Competency Check',
    subtitle: 'Knowledge Check vs Practical Competency',
    narration: [
      'You have completed the didactic portion of LVN-001. Consolidate the core knowledge areas before the assessment.',
      'You understand LVN role-based EHR access, the visit note workflow, and security practices that protect patient information. Access is limited to LVN-authorized functions so you do not enter OASIS or other out-of-scope assessment modules.',
      'You can apply the SOAP framework: Subjective (patient-reported), Objective (findings/measurements), Assessment (reasoning within LVN scope connecting S and O), and Plan (next steps and supervisory communication under the existing plan of care).',
      'You can state Care Indeed timeline expectations: same-day documentation target, 24-hour agency maximum for note completion, and 48-hour RN co-signature window after submit — and you can distinguish those agency clocks from the federal RN-supervision requirement.'
    ],
    keyPoints: [
      { icon: '✅', title: 'EHR Navigation', detail: 'Role-based dashboard, visit note workflow, security' },
      { icon: '✅', title: 'SOAP Mastery', detail: 'Four sections, LVN-scope reasoning, audit-ready narratives' },
      { icon: '✅', title: 'Timeline Compliance', detail: 'Agency same-day / 24h / 48h clocks + federal supervision' },
      { icon: '✅', title: 'Error Prevention', detail: 'Five common errors with actionable fixes' }
    ],
    clinicalTip: 'Document the same day when possible; incomplete notes delay RN supervision.',
    sourceLabels: [
      { kind: "Agency Policy", text: "CL-CD-001" },
      { kind: "Agency Policy", text: "CL-CD-004" },
      { kind: "Federal", text: "42 CFR § 484.110" },
      { kind: "Federal", text: "42 CFR § 484.115(e)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: 'sum-knowledge',
        label: 'Knowledge Quiz',
        shortLabel: 'Knowledge Quiz',
        ariaLabel: 'Investigate Knowledge Quiz',
        x: 55, y: 55, zone: 'authorized' as ZoneKind,
        leftAnchorId: 'kp-6-0',
        observe: 'This module’s quiz confirms cognitive understanding of EHR documentation rules. It does not by itself prove bedside competency.',
        identifyChoices: [
          { id: 'i1', label: "The quiz verifies cognitive understanding of EHR documentation rules but does not authorize independent practice.", correct: true, rationale: "Correct. The quiz verifies cognitive understanding of EHR documentation rules but does not authorize independent practice." },
          { id: 'i2', label: 'Knowledge Quiz can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Knowledge Quiz is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed as a knowledge check only: Complete the quiz as knowledge evidence without treating a passing score as competency clearance.", correct: true, rationale: "Correct. Complete the quiz as knowledge evidence without treating a passing score as competency clearance." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record attempt and score as knowledge evidence only, with no patient-specific content or competency claim.", correct: true, rationale: "Correct. Record attempt and score as knowledge evidence only, with no patient-specific content or competency claim." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'This module’s quiz confirms cognitive understanding of EHR documentation rules. It does not by itself prove bedside competency.',
          meaning: "The quiz verifies cognitive understanding of EHR documentation rules but does not authorize independent practice.",
          action: "Complete the quiz as knowledge evidence without treating a passing score as competency clearance.",
          notify: "No clinical notice is required; training noncompletion follows the educator or supervisor process.",
          document: "Record attempt and score as knowledge evidence only, with no patient-specific content or competency claim.",
          policyRefs: ["CL-CD-001", "42 CFR § 484.110"],
        },
      },      {
        id: 'sum-demo',
        label: 'Return Demo',
        shortLabel: 'Return Demo',
        ariaLabel: 'Investigate Return Demo',
        x: 18, y: 48, zone: 'conditional' as ZoneKind,
        leftAnchorId: 'kp-6-1',
        observe: 'Observed mock note (or equivalent) in the training EHR evaluates completeness and accuracy under supervision.',
        identifyChoices: [
          { id: 'i1', label: "A supervised mock note evaluates completeness and accuracy but remains a practice activity.", correct: true, rationale: "Correct. A supervised mock note evaluates completeness and accuracy but remains a practice activity." },
          { id: 'i2', label: 'Return Demo can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Return Demo is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Proceed under supervision: Complete the mock note under supervision and accept coaching without claiming final competency.", correct: true, rationale: "Correct. Complete the mock note under supervision and accept coaching without claiming final competency." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record mock-note elements, evaluator feedback, identified gaps, remediation tasks, and follow-up date.", correct: true, rationale: "Correct. Record mock-note elements, evaluator feedback, identified gaps, remediation tasks, and follow-up date." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Observed mock note (or equivalent) in the training EHR evaluates completeness and accuracy under supervision.',
          meaning: "A supervised mock note evaluates completeness and accuracy but remains a practice activity.",
          action: "Complete the mock note under supervision and accept coaching without claiming final competency.",
          notify: "Immediately tell the educator or RN preceptor if the exercise reveals an unsafe habit such as fabricated times.",
          document: "Record mock-note elements, evaluator feedback, identified gaps, remediation tasks, and follow-up date.",
          policyRefs: ["CL-CD-001", "CL-CD-003", "CL-CD-004", "42 CFR § 484.110"],
        },
      },      {
        id: 'sum-signoff',
        label: 'Authorized Sign-Off',
        shortLabel: 'Authorized S…',
        ariaLabel: 'Investigate Authorized Sign-Off',
        x: 48, y: 78, zone: 'neutral' as ZoneKind,
        leftAnchorId: 'kp-6-2',
        observe: 'Practical competency is complete only after authorized sign-off per agency policy — separate from quiz pass.',
        identifyChoices: [
          { id: 'i1', label: "Practical competency requires a separate authorized evaluation; a quiz or mock note alone is not sign-off.", correct: true, rationale: "Correct. Practical competency requires a separate authorized evaluation; a quiz or mock note alone is not sign-off." },
          { id: 'i2', label: 'Authorized Sign-Off can be skipped when the visit is short', correct: false, rationale: 'Required documentation is not optional based on visit length.' },
          { id: 'i3', label: 'Authorized Sign-Off is always RN-only and the LVN must never complete it', correct: false, rationale: 'Know which fields are LVN-authorized versus RN-only (e.g., OASIS).' }
        ],
        decideChoices: [
          { id: 'd1', label: "Hold independent practice until sign-off: Hold independent documentation privileges until an authorized RN or educator records the competency decision.", correct: true, rationale: "Correct. Hold independent documentation privileges until an authorized RN or educator records the competency decision." },
          { id: 'd2', label: 'Copy the prior visit narrative to save time', correct: false, rationale: 'Copy-paste clinical narrative is a documentation integrity failure.' },
          { id: 'd3', label: 'Leave blank for the RN to complete at co-signature', correct: false, rationale: 'The LVN is responsible for authorized visit documentation.' }
        ],
        documentChoices: [
          { id: 'doc1', label: "Record evaluation date, evaluator name and title, observed skills, result, restrictions, remediation, and supervision status.", correct: true, rationale: "Correct. Record evaluation date, evaluator name and title, observed skills, result, restrictions, remediation, and supervision status." },
          { id: 'doc2', label: 'Document only that care was provided as ordered with no patient-specific detail', correct: false, rationale: 'Non-specific documentation fails clinical and survey standards.' }
        ],
        feedback: {
          observed: 'Practical competency is complete only after authorized sign-off per agency policy — separate from quiz pass.',
          meaning: "Practical competency requires a separate authorized evaluation; a quiz or mock note alone is not sign-off.",
          action: "Hold independent documentation privileges until an authorized RN or educator records the competency decision.",
          notify: "Notify the supervising RN or educator when ready for observed evaluation; never self-release.",
          document: "Record evaluation date, evaluator name and title, observed skills, result, restrictions, remediation, and supervision status.",
          policyRefs: ["CL-CD-001", "CL-CD-004", "42 CFR § 484.110", "42 CFR § 484.115(e)"],
        },
      }
    ],
  }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Under 42 CFR § 484.115(e), LVN services in home health must be provided under the supervision of which professional?',
    options: [
      'Physician only (no nursing supervision required)',
      'Registered Nurse',
      'Director of Nursing exclusively, not a staff RN',
      'Physical Therapist'
    ],
    correct: 1,
    rationale: 'Federal requirement: CMS requires LVN services be provided under the supervision of a Registered Nurse per 42 CFR § 484.115(e). Agency co-signature workflows operationalize that supervision in the EHR.',
  },
  {
    id: 2,
    stem: 'Which section of the SOAP note is MOST often scrutinized to evaluate clinical reasoning during documentation review?',
    options: [
      'Subjective only',
      'Objective only',
      'Assessment',
      'Header demographics'
    ],
    correct: 2,
    rationale: 'The Assessment section shows how the LVN connects subjective reports to objective findings within scope. Reviewers often focus here to evaluate clinical reasoning (professional guidance / survey practice — not a separate statute).',
  },
  {
    id: 3,
    stem: 'What is Care Indeed’s agency documentation timeline standard for LVN visit note completion?',
    options: [
      'Same calendar day (target), 24 hours (maximum)',
      'Within 1 hour of visit only',
      'Within 72 hours is always acceptable',
      'No timeline — complete whenever convenient'
    ],
    correct: 0,
    rationale: 'Agency policy: same-day documentation is the target; 24 hours is the agency maximum. These hour clocks are Care Indeed policy supporting timely clinical records, not a universal federal hour mandate.',
  },
  {
    id: 4,
    stem: 'Which vital sign elements are MOST commonly omitted when LVN visit notes are incomplete?',
    options: [
      'Blood pressure only',
      'Temperature only',
      'Oxygen saturation and pain level',
      'Pulse rate only'
    ],
    correct: 2,
    rationale: 'Quality review commonly finds oxygen saturation and pain level missing when notes are incomplete. Obtain and document the full required vital-sign set each skilled visit per agency standards.',
  },
  {
    id: 5,
    stem: 'An LVN submits a visit note. What is Care Indeed’s agency RN co-signature window after submission?',
    options: [
      '24 hours',
      '48 hours',
      '7 calendar days',
      'No co-signature is required for LVN notes'
    ],
    correct: 1,
    rationale: 'Agency policy expects the supervising RN to co-sign within 48 hours of LVN submission. Federal law requires RN supervision of LVN services; the 48-hour window is how the agency times that review.',
  },
  {
    id: 6,
    stem: 'An LVN finds a patient’s blood pressure is 182/96 after providing ordered care. What MUST be documented regarding escalation?',
    options: [
      'Only the blood pressure reading',
      'The reading and a note to recheck next visit only',
      'RN notification — who was called, when, what was reported, and instructions received',
      'A diagnosis of hypertensive emergency entered by the LVN'
    ],
    correct: 2,
    rationale: 'Abnormal findings require RN notification (and further chain-of-command per agency protocol). Document who, when, what reported, and instructions received. LVNs do not independently diagnose or rewrite the plan of care.',
  },
  {
    id: 7,
    stem: 'Why is copy-pasting identical clinical narrative from a previous visit note a documentation deficiency?',
    options: [
      'It suggests the clinician did not perform an individualized assessment for today’s encounter',
      'It always saves the agency money',
      'It is a problem only if the patient’s name is wrong',
      'It uses too much storage space'
    ],
    correct: 0,
    rationale: 'Cloned notes suggest no individualized assessment. Reviewers may compare consecutive notes for identical language as evidence of inadequate skilled visit documentation.',
  },
  {
    id: 8,
    stem: 'After an RN co-signs an LVN visit note, what happens to the original record under agency EHR integrity rules?',
    options: [
      'It remains freely editable for 7 days',
      'It can be modified silently by the DON',
      'It is automatically deleted after 30 days',
      'It is locked — changes require a formal, timestamped addendum'
    ],
    correct: 3,
    rationale: 'Co-signed notes are locked to preserve integrity. Post–co-signature changes require a formal, timestamped addendum per agency medical-records policy.',
  },
  {
    id: 9,
    stem: 'When enabled, EHR GPS verification is primarily used to support which documentation element?',
    options: [
      'Patient medical diagnosis coding',
      'Visit time-in and time-out verification',
      'Automatic wound staging by the LVN',
      'Physician e-prescribing'
    ],
    correct: 1,
    rationale: 'GPS geo-tagging (when configured) helps verify actual visit times. Falsifying time-in/time-out can implicate federal fraud frameworks such as the False Claims Act. GPS does not authorize LVN diagnosis, staging, or prescribing.',
  },
  {
    id: 10,
    stem: 'Which statement BEST describes the purpose of the LVN’s role-based EHR access?',
    options: [
      'To reduce the number of patients on the LVN’s schedule',
      'To lower EHR licensing costs only',
      'To hide all patient names from the LVN',
      'To prevent scope-of-practice documentation errors (e.g., no OASIS completion by LVN)'
    ],
    correct: 3,
    rationale: 'Role-based access limits LVNs to authorized documentation functions and helps prevent inadvertent out-of-scope entries such as OASIS completion, which is not an LVN function.',
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
  .lvn002-hotspot .tag{font-size:11px;max-width:110px}
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


const STORAGE_KEY = 'lvn-001-progress-v5414';

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

/** Static approved Care Indeed logo (non-interactive, non-animated). */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt="Care Indeed Home Health Care"
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN001() {
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
          <span className="brand-text">LVN-001 — EHR</span>
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
