/**
 * LVN-002 — LVN Scope of Practice — CA B&P § 2859
 * Version: 5.3.5 — Final node placement & micro-QA
 * Narrow patch: strict TS colors, 11px/44px minima, quiz reconciliation, PICC wording,
 * quiz persistence, radio focus, reduced-motion, no runtime fonts, brand mark, abstract nodes
 * Pages: 7 scenes + Knowledge Check | Hotspots: 34 | Quiz: 10 | Pass: 80%
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-authority.png';
import img02 from './assets/lesson-02-authorized.png';
import img03 from './assets/lesson-03-prohibited.png';
import img04 from './assets/lesson-04-conditional.png';
import img05 from './assets/lesson-05-decision.png';
import img06 from './assets/lesson-06-accountability.png';
import img07 from './assets/lesson-07-complete.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeDark: '#E05922', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'authorized' | 'conditional' | 'prohibited' | 'neutral';
interface Hotspot {
  id: string;
  label: string;       // full name (aria + panel)
  shortLabel: string;  // visible chip (≥11px, concise)
  x: number; y: number; zone: ZoneKind;
  info: string; meaning: string; action: string; notify?: string; document: string; policyRefs: string[];
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

const MODULE_META = { id: 'LVN-002', title: 'LVN Scope of Practice — CA B&P § 2859', pages: 7, quizCount: 10, passing: 80 };

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Authority',
    title: 'The LVN License: Authority, Boundaries & Accountability',
    subtitle: 'Understanding what your license authorizes — and what it does not',
    narration: [
      'Your LVN credential is a state-issued grant of authority defined by CA B&P § 2859 and 16 CCR § 2518.5, operationalized through agency policy and federal Conditions of Participation.',
      'Map four layers before acting: California law, federal personnel qualifications (42 CFR § 484.115(e)), agency policy, and judgment within those boundaries. Law sets the ceiling; policy may be stricter; judgment never expands legal scope.'
    ],
    keyPoints: [
      { icon: '⚖️', title: 'Legal authority source', detail: 'CA B&P § 2859 sets the legal ceiling for LVN practice.' },
      { icon: '🔗', title: 'Federal overlay', detail: '42 CFR § 484.115(e) — LPN/LVN qualifications under RN supervision.' },
      { icon: '🏠', title: 'Home health context', detail: 'Solo visits elevate accountability, not legal scope.' },
      { icon: '📋', title: 'Three practice zones', detail: 'Authorized · Conditional · Prohibited — map every task.' }
    ],
    clinicalTip: 'If you must ask whether something is in scope, treat it as conditional and call the RN first.',
    sourceLabels: [
      { kind: 'CA law', text: 'B&P § 2859; 16 CCR § 2518.5' },
      { kind: 'Federal', text: '42 CFR § 484.115(e)' }
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: 'law', label: 'CA B&P § 2859', shortLabel: 'CA Law', x: 48, y: 56, zone: 'neutral',
        info: 'Tablet shows the care plan — statute defines what the LVN may implement.', meaning: 'California law is the hard ceiling. Policy may be stricter; urgency never expands scope.', action: 'Classify every non-routine task against statute, order, competency, and policy before acting.',
        notify: 'Supervising RN when classification is unclear.', document: 'Objective findings, authority basis, action taken or withheld, RN notification.', policyRefs: ['CA B&P § 2859', '16 CCR § 2518.5'],
      },
      {
        id: 'cop', label: '42 CFR § 484.115(e)', shortLabel: 'Federal CoP', x: 40, y: 88, zone: 'neutral',
        info: 'Clipboard and vitals gear on the table — federal rules require qualified personnel under RN supervision.', meaning: 'Services must be furnished under qualified RN supervision structures.', action: 'Confirm order, competency, and supervision conditions before proceeding.',
        notify: 'RN when supervision or scope alignment is unclear.', document: 'Service performed, parameters, supervisory communication when required.', policyRefs: ['42 CFR § 484.115(e)'],
      },
      {
        id: 'agency', label: 'Agency policy', shortLabel: 'Agency', x: 16, y: 72, zone: 'conditional',
        info: 'Nursing bag holds agency supplies and the authorization matrix in practice.', meaning: 'Agency policy can tighten, not expand, legal scope.', action: 'Verify matrix and competency before a conditional task.',
        notify: 'RN when policy gate is not met.', document: 'Policy condition checked, RN direction, final action.', policyRefs: ['Agency authorization matrix'],
      },
      {
        id: 'zones', label: 'Three zones', shortLabel: 'Three Zones', x: 86, y: 18, zone: 'authorized',
        info: 'The shared decision space between nurse and patient — every task maps to a zone before action.', meaning: 'Authorized = order + competency + expected condition. Conditional = RN oversight. Prohibited = RN-only.', action: 'Proceed only after zone classification is clear.',
        notify: 'RN for any mismatch.', document: 'Zone classification, findings, action, outcome.', policyRefs: ['CA B&P § 2859'],
      }
    ],
  },
  {

    id: 1,
    shortName: 'Authorized',
    title: 'Authorized Practice: The LVN Competency Constellation',
    subtitle: 'Skills you may perform — with orders, competency, and accountability',
    narration: [
      'Authorized skills require a current order, validated competency, and expected patient condition. LVNs implement the Plan of Care — they do not independently develop or revise it.',
      'Common authorized activities include ordered wound care, medication administration within route limits, vital signs and data collection, catheter care, patient education that reinforces the POC, and specimen collection per order.'
    ],
    keyPoints: [
      { icon: '🩹', title: 'Wound care (implement, not plan)', detail: 'Ordered dressing care under competency. Do not redesign the protocol.' },
      { icon: '💉', title: 'Medication administration', detail: 'Oral/topical/SQ/IM per order. Never alter dose or route.' },
      { icon: '🩺', title: 'Assessment vs evaluation', detail: 'Collect and trend data; comprehensive evaluation remains RN-led.' },
      { icon: '📋', title: 'Three-yes gate', detail: 'Order? Competency? Expected condition? Any no → stop and call RN.' }
    ],
    clinicalTip: 'Three-yes gate: order? competency? expected condition? Any no → stop and call RN.',
    sourceLabels: [
      { kind: 'CA law', text: 'B&P § 2859' },
      { kind: 'Clinical', text: 'CL-SD series' }
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: 'wound', label: 'Wound care', shortLabel: 'Wound Care', x: 56, y: 46, zone: 'authorized',
        info: 'Dressing on the lower leg — ordered wound care in progress.', meaning: 'Implement the ordered plan. Do not independently select a new protocol.', action: 'Perform ordered care; escalate deterioration.',
        notify: 'RN for infection signs or findings outside protocol.', document: 'Location, measurements, tissue/drainage, care performed, response.', policyRefs: ['CL-SD-011', '16 CCR § 2518.5'],
      },
      {
        id: 'meds', label: 'Med admin', shortLabel: 'Med Admin', x: 68, y: 80, zone: 'authorized',
        info: 'Medication bottle on the sterile tray.', meaning: 'Administer exactly as ordered after verification.', action: 'Verify and administer; do not alter dose/route/frequency.',
        notify: 'RN for adverse effects or discrepancy.', document: 'Drug, dose, route, time, parameters, response.', policyRefs: ['CL-SD-012'],
      },
      {
        id: 'vitals', label: 'Vital signs', shortLabel: 'Vitals', x: 18, y: 78, zone: 'authorized',
        info: 'BP cuff at the edge of the work surface — data collection tools.', meaning: 'Collect data and compare to baseline; do not independently diagnose.', action: 'Collect, compare, escalate significant variance.',
        notify: 'RN for unexpected findings.', document: 'Values, conditions, baseline comparison, action.', policyRefs: ['CL-SD-001', 'CL-CD-003'],
      },
      {
        id: 'cath', label: 'Catheter care', shortLabel: 'Catheter', x: 14, y: 72, zone: 'authorized',
        info: 'Lower extremity care zone — ordered catheter/related care when competency validated.', meaning: 'Ordered catheter care is authorized when competency is validated.', action: 'Perform ordered care; do not independently change catheter type/plan.',
        notify: 'RN for obstruction, infection signs, or unexpected findings.', document: 'Care performed, urine character, patient response, escalation if any.', policyRefs: ['CL-SD-008'],
      },
      {
        id: 'edu', label: 'Education', shortLabel: 'Education', x: 14, y: 56, zone: 'authorized',
        info: 'Patient education space — reinforce the existing plan of care.', meaning: 'Patient education supports the existing plan of care.', action: 'Teach ordered regimens; use teach-back; do not invent new treatment plans.',
        notify: 'RN if barriers prevent safe self-management.', document: 'Topics taught, teach-back result, materials provided.', policyRefs: ['CL-SD-017 — Patient Education & Self-Management'],
      },
      {
        id: 'spec', label: 'Specimens', shortLabel: 'Specimens', x: 14, y: 88, zone: 'authorized',
        info: 'Gauze and specimen supplies on the tray.', meaning: 'Specimen collection is authorized when ordered and protocol is followed.', action: 'Collect per order; label and handle correctly; do not order tests independently.',
        notify: 'RN for collection barriers or unexpected findings.', document: 'Specimen type, time, method, patient tolerance.', policyRefs: ['CL-SD-006'],
      }
    ],
  },
  {

    id: 2,
    shortName: 'Prohibited',
    title: 'Prohibited Territory: The RN-Only Practice Zone',
    subtitle: 'Hard boundaries — no exceptions for staffing pressure',
    narration: [
      'RN-only territory includes independent OASIS/comprehensive assessment, Plan of Care development/modification, formulating nursing diagnoses, independent IV push in this training, independent central-line management, and independent discharge judgments.',
      'Staffing pressure does not create exceptions. When asked to perform an RN-only task: decline, explain the boundary, notify the RN, and continue only authorized care.'
    ],
    keyPoints: [
      { icon: '🚫', title: 'Initial assessment & OASIS', detail: 'Contribute observations under direction; do not independently complete or authenticate.' },
      { icon: '🧠', title: 'Care plan authority', detail: 'Only authorized clinicians develop/modify/close the POC.' },
      { icon: '🩸', title: 'IV / central lines', detail: 'Independent IV push is not authorized in this module.' },
      { icon: '🚪', title: 'Discharge judgment', detail: 'Not an independent LVN decision.' }
    ],
    clinicalTip: 'If asked for an RN-only task: “That is outside my license. I am contacting my supervising nurse now.”',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.55; § 484.60' }
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: 'oasis', label: 'OASIS SOC', shortLabel: 'OASIS', x: 54, y: 74, zone: 'prohibited',
        info: 'Assessment form on the tablet — comprehensive assessment is not independent LVN work.', meaning: 'LVN may contribute observations under direction but may not independently complete or authenticate OASIS.', action: 'Stop. Route observations to the qualified RN.',
        notify: 'Supervising RN if workflow requests independent completion.', document: 'Observations contributed, RN notified, reassigned workflow.', policyRefs: ['42 CFR § 484.55', 'CL-CA-001'],
      },
      {
        id: 'poc', label: 'POC develop', shortLabel: 'POC Change', x: 42, y: 62, zone: 'prohibited',
        info: 'Care-plan fields on the tablet — plan development is RN/authorized clinician territory.', meaning: 'LVN does not independently develop or modify the Plan of Care.', action: 'Continue current authorized order when safe; escalate the request.',
        notify: 'Supervising RN for authorized order workflow.', document: 'Patient request, findings, care held or provided, RN instructions.', policyRefs: ['42 CFR § 484.60', 'CL-CP-001'],
      },
      {
        id: 'dx', label: 'Nursing diagnosis', shortLabel: 'Diagnosis', x: 16, y: 88, zone: 'prohibited',
        info: 'Clinical judgment zone on the chart — formulating nursing diagnoses is outside LVN scope here.', meaning: 'Formulating nursing diagnoses is outside LVN scope in this structure.', action: 'Report objective findings; do not independently assign nursing diagnoses.',
        notify: 'RN with objective findings for evaluation.', document: 'Objective findings reported; no independent diagnostic statement.', policyRefs: ['CA B&P § 2859'],
      },
      {
        id: 'ivpush', label: 'IV push / blood', shortLabel: 'IV Push', x: 48, y: 16, zone: 'prohibited',
        info: 'IV bag on the pole — independent IV-push medication and blood-product administration are prohibited.', meaning: 'IV push medication, blood-product administration, and PICC insertion are prohibited as independent LVN actions in this module.', action: 'Do not perform. Protect the patient, notify the supervising RN, and document the conflict.',
        notify: 'Supervising RN immediately.', document: 'Order presented, conflict, who was notified, disposition.', policyRefs: ['CL-SD-010', 'HR-TD-003'],
      },
      {
        id: 'picc', label: 'PICC / central', shortLabel: 'PICC / Central', x: 52, y: 34, zone: 'prohibited',
        info: 'IV tubing / central access path — independent/autonomous PICC management is prohibited.', meaning: 'PICC insertion and autonomous central-line management are prohibited. Conditional IV-related tasks require every prerequisite: legal authorization, certification, current order, agency authorization, validated competency, and required RN supervision.', action: 'If any prerequisite is missing: stop, protect the line/patient, notify the RN, and document. Do not independently manage the line.',
        notify: 'RN for any line issues.', document: 'Observations, RN notification, instructions.', policyRefs: ['CL-SD-010'],
      },
      {
        id: 'dc', label: 'Discharge judgment', shortLabel: 'Discharge', x: 88, y: 22, zone: 'prohibited',
        info: 'Patient resting on the sofa — discharge readiness is not an independent LVN decision.', meaning: 'Discharge readiness judgments are not independent LVN decisions.', action: 'Report status; do not independently discharge.',
        notify: 'RN / case manager for discharge pathway.', document: 'Status reported; no independent discharge action.', policyRefs: ['42 CFR § 484.60'],
      }
    ],
  },
  {

    id: 3,
    shortName: 'Conditional',
    title: 'Conditional Practice: Supervised & Co-Signature Zone',
    subtitle: 'Skills you perform — but not without RN oversight structures',
    narration: [
      'Conditional practice requires defined RN oversight: co-signature, consultation, supervisory contact, or agency gate. Unexpected findings are a classic trigger for consultation before leaving the home.',
      'Co-signature timing is agency policy (CL-CD-003/004). Write notes as if the co-signing RN will challenge every conclusion.'
    ],
    keyPoints: [
      { icon: '✍️', title: 'Co-signature workflow', detail: 'RN review is an oversight control. Timing is agency policy.' },
      { icon: '📞', title: 'Consultation protocol', detail: 'Unexpected finding → contact RN before leaving when indicated.' },
      { icon: '👁️', title: 'Supervisory structures', detail: 'Know the supervision model for each case type.' },
      { icon: '📊', title: 'Authorization matrix', detail: 'Operational map of conditional skills and required gates.' }
    ],
    clinicalTip: 'Write notes as if the co-signing RN will ask: What did you see? What did you do? Why? What needs follow-up?',
    sourceLabels: [
      { kind: 'Documentation', text: 'CL-CD-003; CL-CD-004' }
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: 'cosign', label: 'RN co-sign', shortLabel: 'RN Co-sign', x: 42, y: 86, zone: 'conditional',
        info: 'Clipboard with the visit note awaiting RN review.', meaning: 'Co-signature is supervisory review, not a rubber stamp.', action: 'Submit complete notes promptly. Do not lock before required review.',
        notify: 'Escalate if co-signature delayed beyond policy.', document: 'Submission timestamp, RN feedback, final co-signature status.', policyRefs: ['CL-CD-003', 'CL-CD-004', '42 CFR § 484.115(e)'],
      },
      {
        id: 'consult', label: 'RN consult', shortLabel: 'RN Consult', x: 84, y: 70, zone: 'conditional',
        info: 'Desk phone — real-time RN consultation path.', meaning: 'Conditional practice includes defined consultation structures.', action: 'Protect patient within current orders, contact RN, follow instructions.',
        notify: 'Supervising RN (or on-call per escalation tree).', document: 'Findings, notification time, who was reached, instructions, action.', policyRefs: ['CL-CD-003', 'Agency escalation protocol'],
      },
      {
        id: 'supervisory', label: 'Supervisory visit', shortLabel: 'Supervision', x: 64, y: 56, zone: 'conditional',
        info: 'Laptop with clinical documentation — supervision structures live in the record.', meaning: 'Supervision is a structural requirement, not optional courtesy.', action: 'Know the supervision model for each case type before the visit.',
        notify: 'RN when supervisory contact is required by policy.', document: 'Supervision contact completed when required; outcome documented.', policyRefs: ['42 CFR § 484.115(e)'],
      },
      {
        id: 'matrix', label: 'Auth matrix', shortLabel: 'Auth Matrix', x: 50, y: 50, zone: 'conditional',
        info: 'Tablet with the authorization workflow on the desk.', meaning: 'The authorization matrix is the operational map of conditional skills.', action: 'Check matrix before performing a borderline skill.',
        notify: 'RN when matrix requires prior authorization.', document: 'Matrix condition checked; authorization status; action taken.', policyRefs: ['Agency authorization matrix'],
      }
    ],
  },
  {

    id: 4,
    shortName: 'Decision',
    title: 'Decision Frame: First / Continue / Stop / Notify / Document',
    subtitle: 'A practical five-step checklist for every field decision',
    narration: [
      'First: current order? Continue: competency + expected condition? Stop: any mismatch. Notify: supervising RN. Document: objective findings, actions, instructions.',
      'When steps conflict, the answer is always stop and notify. The three-question gate (order / competency / condition) is the operational heart of the frame.'
    ],
    keyPoints: [
      { icon: '1', title: 'First', detail: 'Confirm current order / POC authorization' },
      { icon: '2', title: 'Continue', detail: 'Competency + expected condition' },
      { icon: '3', title: 'Stop', detail: 'Mismatch or unexpected finding' },
      { icon: '4', title: 'Notify + Document', detail: 'RN path + objective note' }
    ],
    clinicalTip: 'When steps conflict, the answer is always stop and notify.',
    sourceLabels: [
      { kind: 'Clinical judgment', text: 'Five-step field decision frame' }
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: 'first', label: 'First', shortLabel: 'First', x: 48, y: 68, zone: 'neutral',
        info: 'Tablet showing the vitals trend — confirm the current order first.', meaning: 'First step always verifies current authorization.', action: 'Check order/POC item before any non-routine action.',
        notify: 'RN if order is missing or ambiguous.', document: 'Order verified or gap identified.', policyRefs: ['CL-CD-001'],
      },
      {
        id: 'continue', label: 'Continue', shortLabel: 'Continue', x: 78, y: 62, zone: 'authorized',
        info: 'BP cuff on the patient’s arm — continue only if skill and condition still fit.', meaning: 'Continue only when competency and expected condition are both true.', action: 'Proceed with ordered care when the three-yes gate passes.',
        notify: 'RN if condition is not expected.', document: 'Care continued under current authorization.', policyRefs: ['CL-SD-001'],
      },
      {
        id: 'stop', label: 'Stop', shortLabel: 'Stop', x: 40, y: 52, zone: 'prohibited',
        info: 'Sphygmomanometer in the nurse’s hands — stop if readings or findings mismatch the plan.', meaning: 'Stop is a safety action, not a failure.', action: 'Interrupt the action path when any gate fails.',
        notify: 'RN with the specific mismatch.', document: 'What was stopped, why, when, who was notified.', policyRefs: ['CL-CD-003'],
      },
      {
        id: 'notify', label: 'Notify', shortLabel: 'Notify', x: 12, y: 78, zone: 'conditional',
        info: 'Open path toward escalation — contact the supervising RN.', meaning: 'Notification must be timely and objective.', action: 'Call with findings, current status, and what you need.',
        notify: 'Supervising RN / on-call.', document: 'Time called, who reached, content of report, instructions.', policyRefs: ['CL-CD-003'],
      },
      {
        id: 'document', label: 'Document', shortLabel: 'Document', x: 58, y: 82, zone: 'neutral',
        info: 'Tablet workspace for the contemporaneous note.', meaning: 'Documentation closes the clinical loop.', action: 'Write objective findings, actions, notifications, and response.',
        notify: 'N/A — documentation is always required.', document: 'Complete contemporaneous note with all required elements.', policyRefs: ['CL-CD-004'],
      },
      {
        id: 'gate', label: '3-question gate', shortLabel: '3-Q Gate', x: 50, y: 94, zone: 'conditional',
        info: 'Shared clinical space — run Order? Competency? Expected condition?', meaning: 'Three yes answers are required before continuing non-routine care.', action: 'Run the gate on every change-in-condition moment.',
        notify: 'RN when any answer is no or uncertain.', document: 'Gate answers and resulting action path.', policyRefs: ['CL-CD-001', 'CL-CD-003'],
      }
    ],
  },
  {

    id: 5,
    shortName: 'Accountable',
    title: 'Consequences & Professional Accountability',
    subtitle: 'Why scope adherence protects patients, your license, and the agency',
    narration: [
      'Scope violations can produce patient harm, Board action, survey deficiencies, and personal liability. Documented competence, POC adherence, and timely escalation are the three practical defenses.',
      'If pressured to perform an out-of-scope task, document the request and refusal, then escalate through the chain of command.'
    ],
    keyPoints: [
      { icon: '🛡️', title: 'Patient protection', detail: 'Scope limits exist to protect patients.' },
      { icon: '📜', title: 'License protection', detail: 'Practicing outside B&P § 2859 risks Board action.' },
      { icon: '🏢', title: 'Agency protection', detail: 'Surveyors examine personnel qualification compliance.' },
      { icon: '✅', title: 'Protect path', detail: 'Competence + POC adherence + timely escalation.' }
    ],
    clinicalTip: 'If pressured to perform an out-of-scope task, document the request and refusal, then escalate.',
    sourceLabels: [
      { kind: 'CA law', text: 'B&P § 2859 enforcement' },
      { kind: 'Federal', text: '42 CFR § 484.115(e)' }
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: 'patient', label: 'Patient safety', shortLabel: 'Patient Safety', x: 72, y: 88, zone: 'authorized',
        info: 'Patient resting on the sofa — primary purpose of scope limits.', meaning: 'Scope boundaries exist to prevent harm.', action: 'Choose the safer authorized path over speed.',
        notify: 'RN whenever safety and scope conflict.', document: 'Safety concern, action taken, notification.', policyRefs: ['CA B&P § 2859'],
      },
      {
        id: 'license', label: 'LVN license', shortLabel: 'LVN License', x: 28, y: 88, zone: 'conditional',
        info: 'Phone at the nurse’s ear — the path that protects the license is escalation, not silence.', meaning: 'Unauthorized practice risks Board action against the license.', action: 'Stay inside B&P § 2859 and agency policy.',
        notify: 'Supervisor if pressured to act outside scope.', document: 'Request refused if out of scope; escalation documented.', policyRefs: ['CA B&P § 2859', 'BVNPT'],
      },
      {
        id: 'agency', label: 'Agency survey', shortLabel: 'Agency Survey', x: 18, y: 88, zone: 'neutral',
        info: 'Home environment under survey standards — agencies are judged on personnel qualifications.', meaning: 'Scope violations can create survey deficiencies for the agency.', action: 'Follow qualified-role rules and documentation standards.',
        notify: 'Clinical leadership for systemic pressure issues.', document: 'Practice stayed within assigned role; exceptions escalated.', policyRefs: ['42 CFR § 484.115(e)'],
      },
      {
        id: 'protect', label: 'Protect path', shortLabel: 'Safe Path', x: 82, y: 88, zone: 'authorized',
        info: 'Raised hand — the deliberate stop that restores the safe path.', meaning: 'Competence, POC adherence, and timely escalation protect patient, license, and agency.', action: 'Stay competent, follow the POC, escalate early.',
        notify: 'RN early when findings drift from expected.', document: 'Competence applied, POC followed, escalation completed when needed.', policyRefs: ['CA B&P § 2859', '42 CFR § 484.115(e)'],
      }
    ],
  },
  {

    id: 6,
    shortName: 'Practice',
    title: 'Module Practice Complete',
    subtitle: 'Classify cases — then take the knowledge check',
    narration: [
      'Classify tasks into authorized, conditional, or prohibited; apply the five-step decision frame; escalate when findings exceed LVN scope.',
      'The knowledge check is a separate page. It validates knowledge only. Practical competency remains a separate skills sign-off.'
    ],
    keyPoints: [
      { icon: '✓', title: 'Three zones', detail: 'Authorized / Conditional / Prohibited' },
      { icon: '✓', title: 'Decision frame', detail: 'First → Continue → Stop → Notify → Document' },
      { icon: '✓', title: 'Quiz ≠ competency', detail: 'Knowledge only. Practical sign-off is separate.' },
      { icon: '✓', title: 'When in doubt', detail: 'Stop and call the RN.' }
    ],
    clinicalTip: 'When in doubt, stop and call the RN.',
    sourceLabels: [
      { kind: 'Module', text: 'LVN-002 knowledge complete' }
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: 'a', label: 'Authorized', shortLabel: 'Authorized', x: 42, y: 48, zone: 'authorized',
        info: 'Left column on the teaching card — ordered care with expected findings.', meaning: 'Order + competency + expected condition = authorized implementation.', action: 'Perform ordered care; document; escalate only if variance.',
        notify: 'RN only if findings are unexpected.', document: 'Care performed, measurements, response.', policyRefs: ['CL-SD-011'],
      },
      {
        id: 'b', label: 'Conditional', shortLabel: 'Conditional', x: 52, y: 48, zone: 'conditional',
        info: 'Center column — unexpected symptom or request needing RN direction.', meaning: 'Conditional path requires consultation.', action: 'Protect within current orders; notify RN; follow instructions.',
        notify: 'Supervising RN before leaving when indicated.', document: 'Findings, notification time, instructions, action.', policyRefs: ['CL-CD-003'],
      },
      {
        id: 'c', label: 'Prohibited', shortLabel: 'Prohibited', x: 62, y: 48, zone: 'prohibited',
        info: 'Right column — independent POC change or OASIS completion.', meaning: 'Hard stop — outside LVN authority.', action: 'Decline, explain boundary, notify RN, continue only authorized care.',
        notify: 'Supervising RN immediately.', document: 'Request, boundary explained, RN notification, authorized care continued.', policyRefs: ['42 CFR § 484.55', '42 CFR § 484.60', 'CA B&P § 2859'],
      },
      {
        id: 'gate', label: '3-question gate', shortLabel: '3-Q Gate', x: 50, y: 92, zone: 'neutral',
        info: 'Nursing bag on the sofa — gear is ready; judgment still runs the gate.', meaning: 'Always re-run order / competency / condition before acting.', action: 'If any answer is no → stop and notify.',
        notify: 'RN when uncertain.', document: 'Gate result and chosen path.', policyRefs: ['CL-CD-001'],
      }
    ],
  }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'An LVN in home health is visiting a patient who has a scheduled wound dressing change. Upon assessment, the LVN notes significant wound deterioration not present at the last visit. What is the PRIORITY action?',
    options: [
      'Document the wound assessment, call the supervising RN, and await updated orders before modifying the intervention',
      'Change the dressing using a more aggressive wound care product from the supply bag',
      'Instruct the family to take the patient to urgent care without notifying the agency',
      'Skip the dressing change and return tomorrow without documenting the change',
    ],
    correct: 0,
    rationale:
      'Significant change from baseline requires RN notification before modifying the care approach. The LVN assesses, documents, and escalates. Redesigning wound care without updated orders exceeds LVN authority (POC development/modification is not an LVN function). Knowledge of this rule is not a substitute for observed wound-care competency sign-off.',
  },
  {
    id: 1,
    stem: 'Which of the following is WITHIN the authorized scope of LVN practice in California home health (assuming order, competency, and policy are met)?',
    options: [
      'Completing the OASIS start-of-care assessment independently',
      'Formulating nursing diagnoses for a newly admitted patient',
      'Administering a scheduled subcutaneous insulin injection per physician order',
      'Initiating IV push medication for breakthrough pain',
    ],
    correct: 2,
    rationale:
      'Subcutaneous medication administration per physician order is within LVN scope when competency and policy allow. Independent OASIS start-of-care completion, nursing diagnosis formulation, and IV push administration are outside LVN home-health authority.',
  },
  {
    id: 2,
    stem: 'Under California home health practice structures, LVN clinical documentation typically requires:',
    options: [
      'RN co-signature within the agency-defined timeframe',
      'Physician counter-signature of every nursing note within 24 hours as a universal statute',
      'No co-signature if the LVN has two or more years of experience',
      'BVNPT review before the note may be filed in the chart',
    ],
    correct: 0,
    rationale:
      'RN co-signature is the standard supervisory review mechanism for LVN documentation in home health. Exact timing is agency policy, not a free pass based on experience. Physician countersignature rules apply to orders, not as a substitute for nursing oversight; BVNPT does not pre-clear visit notes.',
  },
  {
    id: 3,
    stem: 'Before continuing a non-routine intervention during a home visit, which three-yes gate must the LVN confirm?',
    options: [
      'Patient preference, family consent, and travel time remaining',
      'Current order, validated competency, and expected patient condition',
      'Prior identical visit, available supplies, and a signed waiver',
      'Verbal approval from any licensed clinician on the care team',
    ],
    correct: 1,
    rationale:
      'The field decision frame taught in this module requires three yes answers before continuing: a current order/POC authorization, validated competency for the skill, and an expected patient condition. Any no → stop and notify the RN.',
  },
  {
    id: 4,
    stem: 'A patient’s family member — who is also a licensed LVN — asks to manage the patient’s PICC line during the home visit. The visiting agency LVN should:',
    options: [
      'Allow it since both parties are LVNs and the family knows the patient best',
      'Decline independent/autonomous PICC management; protect the line, notify the supervising RN, and document — family license status does not authorize the agency LVN to facilitate out-of-scope care',
      'Allow it if the family LVN shows a current wallet card',
      'Obtain a verbal physician OK by phone and then hand supplies to the family LVN',
    ],
    correct: 1,
    rationale:
      'Independent PICC insertion and autonomous central-line management are prohibited. Narrowly defined IV-related tasks are conditional only when every prerequisite exists (legal authorization, certification, current order, agency authorization, validated competency, required RN supervision). A relative’s LVN license does not create those prerequisites for the agency visit. Stop, protect the patient, notify the RN, and document.',
  },
  {
    id: 5,
    stem: 'Which statement BEST describes the difference between “assessment” (LVN-authorized data collection) and “evaluation” (RN-level care-planning function) in home health?',
    options: [
      'Assessment involves systematic data collection; evaluation interprets data to form diagnoses and modify the care plan',
      'Assessment is faster; evaluation simply takes longer',
      'LVNs may evaluate fully if an RN is somewhere in the county',
      'There is no practical difference in home health documentation',
    ],
    correct: 0,
    rationale:
      'Assessment = systematic data collection (vitals, wound measurements, pain scores, observations). Evaluation that drives nursing diagnoses, POC modification, or discharge decisions requires RN (or other authorized clinician) accountability.',
  },
  {
    id: 6,
    stem: 'An LVN’s supervising RN is unreachable when the LVN discovers a significant unexpected finding during a home visit. What is the APPROPRIATE next action?',
    options: [
      'Proceed without any notification because RN oversight always happens after the visit',
      'Leave immediately without documenting and hope the next nurse notices',
      'Contact the on-call RN or DON using the agency’s emergency escalation protocol',
      'Ask the patient’s family whether they think the finding is serious enough to call 911 only',
    ],
    correct: 2,
    rationale:
      'Agency policy defines emergency escalation when the primary RN is unavailable. Use on-call RN/DON pathways. Do not rely on family clinical judgment as your supervision structure, and do not omit documentation.',
  },
  {
    id: 7,
    stem: 'A supervisor tells an LVN that due to short-staffing, the LVN must complete the OASIS start-of-care assessment independently today. The LVN should:',
    options: [
      'Complete the OASIS to help the team — it is only data entry',
      'Complete comfortable sections and leave the rest blank for later',
      'Ask the patient to complete clinical OASIS items from memory',
      'Decline clearly, document the request and refusal, and escalate to the DON',
    ],
    correct: 3,
    rationale:
      'Independent OASIS start-of-care / comprehensive assessment completion is not an LVN function. Staffing pressure never authorizes a scope violation. Decline, document, and escalate. Quiz knowledge ≠ practical authorization to perform comprehensive assessment.',
  },
  {
    id: 8,
    stem: 'Which body has authority to investigate LVN scope-of-practice violations in California and impose license discipline, including revocation?',
    options: [
      'California Department of Public Health (CDPH) alone as the LVN licensing board',
      'California Board of Registered Nursing (BRN) for all nursing licenses including LVN',
      'Centers for Medicare & Medicaid Services (CMS) as the day-to-day LVN licensing board',
      'California Board of Vocational Nursing and Psychiatric Technicians (BVNPT)',
    ],
    correct: 3,
    rationale:
      'BVNPT is the California licensing authority for LVNs and may investigate and discipline. CDPH regulates health facilities/agencies; BRN regulates RNs; CMS oversees federal CoP compliance — none of those replace BVNPT as the LVN licensing board.',
  },
  {
    id: 9,
    stem: 'A patient asks the LVN to increase the frequency of a medication that is already on the current Plan of Care. What is the correct action?',
    options: [
      'Adjust the frequency because the patient requested it and appears stable',
      'Document the request, continue the ordered frequency when safe, and notify the supervising RN',
      'Tell the patient a decision will be made at the next supervisory visit only',
      'Discontinue the medication until a new written order arrives',
    ],
    correct: 1,
    rationale:
      'LVNs implement the Plan of Care; they do not independently modify orders or the POC. Document the request, continue authorized care when safe, and escalate to the RN for the order workflow.',
  },
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
.lvn002-tab.quiz-tab{border:1px solid #F26D33;color:#F26D33}
.lvn002-tab.quiz-tab.active{background:#F26D33;color:#fff;border-color:#F26D33}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #F26D33;background:#fff;color:#F26D33;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#F26D33;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const z = ZONE[hotspot.zone];
  useEffect(() => { const t = window.setTimeout(() => closeRef.current?.focus(), 20); return () => window.clearTimeout(t); }, [hotspot.id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); triggerRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, triggerRef]);
  useEffect(() => {
    const root = dialogRef.current; if (!root) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', trap); return () => root.removeEventListener('keydown', trap);
  }, []);
  return (
    <div className="lvn002-drawer-bg" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="lvn002-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.96)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: z.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.zone === 'prohibited' ? <XCircle size={18} /> : hotspot.zone === 'conditional' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{z.label} practice</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={() => { onClose(); triggerRef.current?.focus(); }} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Clinical feedback</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.info} />
          <FeedbackBlock label="What it means" body={hotspot.meaning} />
          <FeedbackBlock label="What the LVN should do" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who must be notified" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What must be documented" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.policyRefs.map((r) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
            ))}
          </div>
          <button type="button" onClick={() => { onComplete(); triggerRef.current?.focus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
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
        {page.keyPoints.map((kp) => (
          <div key={kp.title} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
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
  return (
    <div className="lvn002-stage-wrap">
      <div className="lvn002-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt="" aria-hidden draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
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
              aria-describedby={[`lvn002-progress-${page.id}`, ({ zones: 'pn-zones', edu: 'pn-edu', cath: 'pn-cath', spec: 'pn-spec', dx: 'pn-dx', dc: 'pn-dc', picc: 'pn-picc', notify: 'pn-notify', gate: page.id === 4 ? 'pn-gate' : page.id === 6 ? 'pn-gate7' : undefined, agency: 'pn-unsafe', license: 'pn-unsafe', patient: 'pn-safe', protect: 'pn-safe' } as Record<string, string | undefined>)[hs.id]].filter(Boolean).join(' ') || undefined}
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
        {/* Accessible HTML process nodes — instructional, non-blocking, edge-docked */}
        {page.id === 0 && (
          <div id="pn-zones" className="lvn002-process-node" style={{ left: '86%', top: '18%' }} role="note">
            <strong>Three Zones</strong>
            Authorized · Conditional · Prohibited
          </div>
        )}
        {page.id === 1 && (
          <div className="lvn002-process-rail" role="group" aria-label="Additional authorized skills">
            <div id="pn-edu" className="lvn002-process-node" style={{ position: 'relative', left: 'auto', top: 'auto', transform: 'none' }} role="note">
              <strong>Education</strong>
              Reinforce the existing plan of care
            </div>
            <div id="pn-cath" className="lvn002-process-node" style={{ position: 'relative', left: 'auto', top: 'auto', transform: 'none' }} role="note">
              <strong>Catheter Care</strong>
              Ordered care when competency validated
            </div>
            <div id="pn-spec" className="lvn002-process-node" style={{ position: 'relative', left: 'auto', top: 'auto', transform: 'none' }} role="note">
              <strong>Specimens</strong>
              Collect only with current order
            </div>
          </div>
        )}
        {page.id === 2 && (
          <>
            <div id="pn-dx" className="lvn002-process-node" style={{ left: '16%', top: '88%' }} role="note">
              <strong>Nursing Diagnosis</strong>
              Report findings — do not independently diagnose
            </div>
            <div id="pn-dc" className="lvn002-process-node" style={{ left: '88%', top: '22%' }} role="note">
              <strong>Discharge</strong>
              Not an independent LVN decision
            </div>
            <div id="pn-picc" className="lvn002-process-node" style={{ left: '68%', top: '34%' }} role="note">
              <strong>PICC / Central</strong>
              No autonomous line management
            </div>
          </>
        )}
        {page.id === 4 && (
          <>
            <div id="pn-notify" className="lvn002-process-node" style={{ left: '12%', top: '78%' }} role="note">
              <strong>Notify RN</strong>
              Timely · objective · escalate
            </div>
            <div id="pn-gate" className="lvn002-gate-node" role="group" aria-label="Three-question gate">
              <span className="lvn002-gate-chip">Current order?</span>
              <span className="lvn002-gate-chip">Validated competency?</span>
              <span className="lvn002-gate-chip">Expected condition?</span>
            </div>
          </>
        )}
        {page.id === 5 && (
          <div className="lvn002-path-overlay" role="group" aria-label="Accountability pathways">
            <div id="pn-unsafe" className="lvn002-path-card" style={{ borderLeft: `3px solid ${CI.red}` }} role="note">
              <strong style={{ color: CI.red }}>Unsafe shortcut</strong>
              Ignore finding → unauthorized action → weak record → patient / license risk
            </div>
            <div id="pn-safe" className="lvn002-path-card" style={{ borderLeft: `3px solid ${CI.teal}` }} role="note">
              <strong style={{ color: CI.teal }}>Safe path</strong>
              Stop → protect → notify RN → authorized direction → document
            </div>
          </div>
        )}
        {page.id === 6 && (
          <>
            <div className="lvn002-zone-legend" role="group" aria-label="Practice zones">
              <span className="lvn002-zone-chip"><span style={{ width: 8, height: 8, borderRadius: '50%', background: CI.teal }} /> Authorized</span>
              <span className="lvn002-zone-chip"><span style={{ width: 8, height: 8, borderRadius: '50%', background: CI.orange }} /> Conditional</span>
              <span className="lvn002-zone-chip"><span style={{ width: 8, height: 8, borderRadius: '50%', background: CI.red }} /> Prohibited</span>
            </div>
            <div id="pn-gate7" className="lvn002-process-node" style={{ left: '50%', top: '92%' }} role="note">
              <strong>3-Question Gate</strong>
              Order? Competency? Expected?
            </div>
          </>
        )}
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


const STORAGE_KEY = 'lvn-002-progress-v535';

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

/** Official Care Indeed navigation mark (non-interactive, non-animated). */
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN002() {
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
          <BrandMark size={28} />
          <span className="brand-text">LVN Scope</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
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
