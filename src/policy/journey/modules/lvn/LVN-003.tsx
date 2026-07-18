// @ts-nocheck
import { 
  Play, Pause, ChevronRight, ChevronLeft, 
  FileText, CheckCircle2, X, AlertCircle, Volume2, ShieldCheck,
  MessageSquare, ClipboardEdit, Compass, Calendar, Users 
} from 'lucide-react';
/**
 * LVN-003 — RN Co-Signature & Supervision Requirements
 * Track: LVN — Licensed Vocational Nurse | Version 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * CMS reference: 42 CFR § 484.115(c) (personnel qualifications / LVN framework)
 * Agency policy: CL-CS-001 (co-signature windows, supervision cadence, flag workflow)
 * Standalone SC04 shell: left content (~55%) + instructional SVG (~45%)
 */

import React, { useCallback, useMemo, useState } from 'react';
import { LvnLeftPanel } from './LvnLeftPanel';
import { LvnGaoPlayer } from './LvnGaoPlayer';
import { LvnSceneModal } from './LvnSceneModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  info: string;
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  narration: string[];
  keyPoints: KeyPoint[];
  scene: string;
  hotspots: Hotspot[];
  clinicalTip: string;
  authorityNote?: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number; // 0=A, 1=B, 2=C, 3=D
  rationale: string;
}

interface SceneProps {
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
  hotspots: Hotspot[];
}

// ─── Module metadata ─────────────────────────────────────────────────────────

const MODULE_META = {
  id: 'LVN-003',
  title: 'RN Co-Signature & Supervision Requirements',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.115(c)',
  policy: 'CL-CS-001',
  duration: '~35 min',
  themeColor: '#2563EB',
};

// ─── Page content (Level 5 corrected) ────────────────────────────────────────

const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Why Co-Signatures Matter',
    subtitle: 'Three pillars of documentation oversight',
    narration: [
      'Welcome to Module LVN-003. This module addresses the supervision and co-signature requirements that govern clinical documentation you produce as an LVN at Care Indeed. If LVN-002 defined the legal boundaries of what you may perform, this module defines the oversight structure that keeps documentation aligned with the plan of care and the standard of care.',
      'Co-signature requirements rest on three pillars. First, federal Conditions of Participation for home health agencies require that licensed practical/vocational nursing services be provided within an RN-supervised framework. CMS surveyors evaluate whether agencies maintain adequate professional supervision and personnel qualifications. Persistent gaps in supervision documentation can place an agency under heightened survey scrutiny. Exact deficiency levels and outcomes depend on the full survey record—not on any single missing signature alone.',
      'Second, co-signatures protect you. When a supervising RN reviews and co-signs your note, a second clinical eye has evaluated your observations, interventions, and plan-related narrative. If questions later arise about the appropriateness of care or documentation, the co-signed record shows that supervisory review occurred. That review is a professional safety net—not a substitute for your own accurate charting.',
      'Third, co-signatures protect patients. A structured second review helps catch incomplete vitals, weak clinical reasoning, interventions that do not match the authorized plan of care, and missed escalation cues. The co-signature step is a quality-assurance checkpoint in the continuum of care.',
      'At Care Indeed, co-signature expectations are defined in agency policy CL-CS-001. That policy sets an on-time co-signature target of 100% within the agency’s review window and assigns shared responsibility: the LVN submits complete notes promptly; the RN completes clinical review and co-signature. Your controllable contribution is timely, complete, in-scope documentation that gives the RN a workable review window.',
    ],
    keyPoints: [
      {
        icon: '§',
        title: 'CMS framework',
        detail: '42 CFR § 484.115(c) — LVN personnel qualifications within home health CoP supervision structure',
      },
      {
        icon: '🛡',
        title: 'LVN protection',
        detail: 'RN review documents supervisory oversight of your clinical documentation',
      },
      {
        icon: '♥',
        title: 'Patient safety',
        detail: 'Second clinical review catches incomplete, unclear, or misaligned documentation',
      },
      {
        icon: '📋',
        title: 'Agency policy CL-CS-001',
        detail: 'Defines co-signature window, queues, and on-time target (agency policy—not a universal federal deadline)',
      },
    ],
    scene: 'pillars',
    hotspots: [
      {
        id: 'pillar-cms',
        label: 'CMS framework',
        x: 90,
        y: 210,
        info: 'Federal CoPs require LVN services within an RN-supervised structure. Surveyors review supervision evidence; treat missing oversight documentation as a compliance risk, not a technicality.',
      },
      {
        id: 'pillar-lvn',
        label: 'LVN protection',
        x: 250,
        y: 210,
        info: 'A co-signed note shows a supervising RN reviewed your documentation. Keep your original note accurate—co-signature does not repair weak charting.',
      },
      {
        id: 'pillar-safety',
        label: 'Patient safety',
        x: 410,
        y: 210,
        info: 'RN review looks for incomplete vitals, weak Assessment reasoning, POC misalignment, and missed RN notifications that could affect care continuity.',
      },
    ],
    clinicalTip:
      'Treat the co-signature as quality assurance, not surveillance. Strong first-pass notes protect patients, your license, and the agency’s compliance posture.',
    authorityNote:
      'Authority: federal CoP framework (CMS) + Care Indeed agency policy CL-CS-001. Specific hour windows and dashboards below are agency policy unless stated otherwise.',
  },
  {
    id: 2,
    title: 'The Co-Signature Workflow',
    subtitle: 'From visit note to locked record — six steps',
    narration: [
      'The co-signature workflow at Care Indeed creates an auditable documentation chain. Understanding each step helps you submit complete notes the first time and avoid avoidable revision cycles.',
      'Step 1 — Complete the visit note. Use the agency EHR note structure (commonly SOAP). Populate required fields, document vital signs with method notes when required, record time-in/time-out, and write a clinical narrative that shows skilled observation and reasoning tied to the authorized plan of care. Do not claim RN-only actions (for example, independent plan-of-care changes, OASIS completion, diagnosis, or prescribing).',
      'Step 2 — Submit for RN review. Submission locks the note from casual editing, records a permanent submission timestamp, and routes the note to the assigned supervising RN’s review queue. Under CL-CS-001, this timestamp starts the agency co-signature review window (48 hours from submission).',
      'Step 3 — RN notification. The supervising RN receives EHR and/or email notification with patient identifiers, visit date, and your name. Pending notes are typically prioritized by age so older submissions are reviewed first.',
      'Step 4 — Comprehensive RN review. The RN verifies patient identification, visit logistics, vital signs completeness, narrative quality, intervention alignment with the plan of care, documented patient response, required RN notifications, scope compliance, and timeliness. This is clinical review—not a rubber stamp.',
      'Steps 5–6 — Co-sign and lock. If criteria are met, the RN applies an electronic co-signature (a legal attestation of review) with a permanent timestamp. The record then locks. Changes after lock require a formal, timestamped addendum process—never silent alteration of the original note.',
    ],
    keyPoints: [
      {
        icon: '1',
        title: 'Complete & submit',
        detail: 'Full note → Submit locks note and starts the CL-CS-001 48-hour review window',
      },
      {
        icon: '2',
        title: 'RN notified',
        detail: 'Dashboard/email alert; queue typically ordered by age',
      },
      {
        icon: '3',
        title: 'RN reviews',
        detail: 'ID, vitals, SOAP quality, POC alignment, scope, timeliness',
      },
      {
        icon: '4',
        title: 'Co-sign & lock',
        detail: 'Legal attestation → immutable record; addendum only for later corrections',
      },
    ],
    scene: 'workflow',
    hotspots: [
      {
        id: 'step-submit',
        label: 'Submit',
        x: 250,
        y: 70,
        info: 'Submit locks the note and starts the agency co-signature clock. Final-check vitals, SOAP, time-in/out, RN notifications, and POC-linked interventions first.',
      },
      {
        id: 'step-review',
        label: 'RN reviews',
        x: 250,
        y: 200,
        info: 'RN checks identity, logistics, vitals, narrative quality, POC match, scope boundaries, and submission timeliness. Expect real clinical scrutiny.',
      },
      {
        id: 'step-lock',
        label: 'Locked record',
        x: 250,
        y: 330,
        info: 'After co-signature the record is locked. Corrections use a formal addendum with its own timestamp trail—never overwrite the original.',
      },
    ],
    clinicalTip:
      'Before Submit, use a personal checklist: all vitals? SOAP complete with a reasoning-based Assessment? RN notifications documented? Plan section filled? Time-in/time-out recorded? One final pass prevents the flag cycle.',
    authorityNote:
      '48-hour co-signature window after submission is Care Indeed agency policy (CL-CS-001). Confirm current EHR workflow with your preceptor if screens change.',
  },
  {
    id: 3,
    title: 'What the RN Reviews',
    subtitle: 'The 10-point clinical review protocol',
    narration: [
      'Knowing what the supervising RN looks for helps you produce documentation that passes on the first attempt. Care Indeed RNs follow a standardized 10-point review protocol for every LVN note they co-sign (agency protocol under CL-CS-001).',
      'Points 1–3: Patient identification, visit logistics, and vital signs. The RN verifies correct patient name/MRN/DOB match, actual visit times, and required vital-sign parameters with appropriate methodology notes.',
      'Point 4: Note structure compliance. Sections must be complete—no blank required fields and no generic placeholder language that fails to show skilled observation.',
      'Point 5: Assessment quality. This is typically the most intensively reviewed element. The Assessment must show clinical reasoning—not merely restate objective data. Connect patient-reported symptoms to observations, identify trends (improving, declining, stable), and justify continued need for skilled services within your LVN scope. You do not diagnose or independently revise the plan of care.',
      'Points 6–8: Interventions, patient response, and RN notifications. Interventions must match what is authorized on the plan of care; patient response must be specific; RN notifications (when required) need who was notified, time, content, and instructions received.',
      'Points 9–10: Scope compliance and timeliness. No documentation may imply out-of-scope actions (for example, independent POC modification, OASIS completion, prescribing, or unauthorized wound staging). Note submission timing must meet agency expectations so the RN retains an adequate review window.',
    ],
    keyPoints: [
      {
        icon: '✓',
        title: 'ID + logistics + vitals',
        detail: 'Correct patient, visit times, complete vital signs',
      },
      {
        icon: '✓',
        title: 'Structure + Assessment',
        detail: 'Complete sections; Assessment shows clinical reasoning and trends',
      },
      {
        icon: '✓',
        title: 'POC alignment',
        detail: 'Interventions match orders; patient response documented',
      },
      {
        icon: '✓',
        title: 'Scope + timeliness',
        detail: 'No out-of-scope claims; submitted per agency time standards',
      },
    ],
    scene: 'checklist',
    hotspots: [
      {
        id: 'review-assessment',
        label: 'Assessment quality',
        x: 320,
        y: 180,
        info: 'Most scrutinized element. Strong Assessment: finding → interpretation → evidence → trend vs prior visit → why skilled services remain necessary (within LVN scope).',
      },
      {
        id: 'review-poc',
        label: 'POC alignment',
        x: 320,
        y: 250,
        info: 'Interventions must match the authorized plan of care. If needs change, notify the RN—do not independently rewrite the POC.',
      },
      {
        id: 'review-scope',
        label: 'Scope check',
        x: 320,
        y: 320,
        info: 'RN screens for language implying RN-only or unauthorized acts. Accurate scope language protects your license and the agency.',
      },
    ],
    clinicalTip:
      'Assessment template that survives review: “Patient’s [finding] suggests [interpretation] as evidenced by [data]. Compared with last visit, [trend]. Skilled services remain necessary because [reason within POC/orders].”',
  },
  {
    id: 4,
    title: 'Supervision Beyond Co-Signatures',
    subtitle: 'The full LVN oversight framework (agency policy layers)',
    narration: [
      'Co-signature review is one layer of LVN oversight. Federal home health rules require skilled services under appropriate professional supervision; Care Indeed implements a multi-layer schedule in agency policy CL-CS-001. Treat the intervals below as agency policy—not as invented universal federal visit minima.',
      'Layer 1 — Every-visit documentation review: Each LVN visit note receives RN co-signature review within the agency window (48 hours from submission under CL-CS-001). This creates a continuous, auditable supervision trail for clinical encounters.',
      'Layer 2 — Bi-weekly supervisory visit (every 14 days per CL-CS-001): The supervising RN accompanies you on a patient visit for direct observation of assessment technique, communication, clinical decision-making within scope, and documentation habits. The RN documents a supervisory visit note against competency criteria.',
      'Layer 3 — Monthly competency/documentation check (every 30 days per CL-CS-001): Formal review of documentation quality trends, recurring flag themes, and targeted coaching. High-risk skills may require re-demonstration per agency competency policy.',
      'Layer 4 — Comprehensive evaluation (90-day and ongoing per CL-CS-001): Broader competency review including skills demonstration, documentation audit, scope knowledge, and supervisory feedback. Practical competency for independent visits is determined by observed performance and authorized sign-off—not by this module’s quiz alone.',
      'Each layer is documented in the EHR/personnel file. Surveyors may request supervision records. Missing documentation of supervision is a risk even when supervision occurred—document what policy requires.',
    ],
    keyPoints: [
      {
        icon: '①',
        title: 'Every visit',
        detail: 'Co-signature review within agency 48-hour window — continuous oversight',
      },
      {
        icon: '②',
        title: 'Every 14 days',
        detail: 'RN supervisory visit with direct observation (CL-CS-001)',
      },
      {
        icon: '③',
        title: 'Every 30 days',
        detail: 'Documentation quality review + targeted skills coaching (CL-CS-001)',
      },
      {
        icon: '④',
        title: '90-day / ongoing',
        detail: 'Comprehensive competency evaluation — observed sign-off remains separate',
      },
    ],
    scene: 'supervision',
    hotspots: [
      {
        id: 'layer-1',
        label: 'Every visit',
        x: 90,
        y: 90,
        info: 'Co-signature is the minimum documentation oversight for each LVN clinical encounter under agency policy. No visit note is “exempt.”',
      },
      {
        id: 'layer-2',
        label: 'Bi-weekly visit',
        x: 90,
        y: 175,
        info: 'Direct observation visit. Schedule proactively with your supervising RN. Observation feedback accelerates safe skill growth.',
      },
      {
        id: 'layer-3',
        label: 'Monthly check',
        x: 90,
        y: 260,
        info: 'Trend review of flags, documentation quality, and skills needing re-check. Bring questions and examples of difficult notes.',
      },
      {
        id: 'layer-4',
        label: 'Comprehensive eval',
        x: 90,
        y: 345,
        info: 'Broader competency review. Practical privileges depend on observed demonstration and authorized sign-off—not quiz score alone.',
      },
    ],
    clinicalTip:
      'Welcome supervisory visits as professional development. Direct observation feedback is one of the fastest ways to improve clinical technique and documentation quality.',
    authorityNote:
      'Cadence (14/30/90-day) is Care Indeed agency policy CL-CS-001. If policy is revised, follow the current signed policy and your DON/supervisor guidance.',
  },
  {
    id: 5,
    title: 'When Your Note Is Flagged',
    subtitle: 'Revision workflow — feedback into better documentation',
    narration: [
      'Some LVN notes are returned (flagged) during co-signature review. A flag means the RN identified one or more elements that need strengthening before co-signature—not that you are “failed.” Flagging is a quality-improvement tool.',
      'When flagged, the system unlocks the note for correction and sends notification with specific feedback. Common reasons include: Assessment lacks clinical reasoning (most frequent theme), incomplete vital signs, generic language that does not show skilled observation, missing RN-notification documentation, and interventions not clearly aligned with the plan of care.',
      'Your responsibility: read the feedback carefully, correct the root issue, and re-submit within the agency revision window (24 hours under CL-CS-001). Do not merely add one vague sentence—rewrite the weak section so it meets the review standard.',
      'After re-submission, the RN focuses review on flagged elements. Adequate correction leads to co-signature and lock. Persistent issues may produce a second flag. Under CL-CS-001, a note flagged more than twice triggers mandatory coaching with the supervising RN and Director of Nursing (agency escalation procedure).',
      'Track your personal flag themes. If the same issue recurs (for example, weak Assessment), ask your RN for strong examples and coaching. Continuous improvement toward first-pass approval is the professional goal.',
    ],
    keyPoints: [
      {
        icon: '⚑',
        title: 'Flag = improve',
        detail: 'Quality tool with specific feedback—not a punitive label',
      },
      {
        icon: '✎',
        title: 'Correct thoroughly',
        detail: 'Fix the root cause of the feedback, not just a token sentence',
      },
      {
        icon: '⏱',
        title: '24-hour revision',
        detail: 'Re-submit within CL-CS-001 revision window after a flag',
      },
      {
        icon: '🎯',
        title: 'Pattern coaching',
        detail: '>2 flags on one note → mandatory RN/DON coaching (agency policy)',
      },
    ],
    scene: 'flagging',
    hotspots: [
      {
        id: 'approved-path',
        label: 'Approved path',
        x: 140,
        y: 120,
        info: 'First-pass co-signature when all review criteria are met. This is the target path—complete, specific, in-scope notes.',
      },
      {
        id: 'flagged-path',
        label: 'Flagged path',
        x: 360,
        y: 120,
        info: 'Note returned with RN feedback. Correct thoroughly and re-submit within 24 hours (CL-CS-001).',
      },
      {
        id: 'coaching-path',
        label: 'Coaching path',
        x: 250,
        y: 300,
        info: 'More than two flags on the same note triggers mandatory coaching with RN and DON under agency escalation policy.',
      },
    ],
    clinicalTip:
      'Keep a private flag log (reason + date). After several weeks, review patterns and request targeted coaching on the top recurring issue.',
  },
  {
    id: 6,
    title: 'Co-Signature Compliance Metrics',
    subtitle: 'How the agency dashboard frames shared accountability',
    narration: [
      'Care Indeed tracks co-signature compliance on a supervisory dashboard. Metrics exist to support patient safety and survey readiness—not to rank clinicians publicly. Understanding them clarifies how your documentation habits affect the agency’s compliance posture.',
      'Metric 1 — On-time co-signature rate: Percentage of LVN notes co-signed within the agency window (48 hours from submission under CL-CS-001). Agency target: 100%. Late co-signatures often follow late LVN submissions that compress the RN review window—timely submission is your primary lever.',
      'Metric 2 — Average review time: How quickly RNs complete review after submission. Notes submitted late evening or on weekends may wait longer for RN availability; plan documentation timing accordingly when operationally possible.',
      'Metric 3 — Flag rate: Percentage of notes returned for revision. Agency goal is a low rate with continuous improvement. Elevated individual flag rates typically trigger coaching—not automatic discipline. Consistently clean first-pass notes are recognized in performance conversations.',
      'Metric 4 — Supervisory visit compliance: Whether required bi-weekly observation visits (per CL-CS-001) are completed and documented. Both RN and LVN share scheduling responsibility.',
      'During CMS surveys, surveyors may request supervision and co-signature evidence. Strong individual habits—on-time complete notes, responsive revision, documented supervisory visits—support the agency’s overall picture. Do not invent or quote “current percentages” from memory; use the live dashboard and supervisor reports when metrics are needed.',
    ],
    keyPoints: [
      {
        icon: '📊',
        title: 'On-time rate',
        detail: 'Target 100% within CL-CS-001 window — driven heavily by timely LVN submission',
      },
      {
        icon: '⏱',
        title: 'Review time',
        detail: 'RN turnaround after submission; weekend/evening notes may wait longer',
      },
      {
        icon: '⚑',
        title: 'Flag rate',
        detail: 'Returned-note percentage — coaching focus when elevated',
      },
      {
        icon: '🤝',
        title: 'Supervisory visits',
        detail: 'Shared LVN/RN duty to schedule and document observation visits',
      },
    ],
    scene: 'dashboard',
    hotspots: [
      {
        id: 'metric-ontime',
        label: 'On-time rate',
        x: 120,
        y: 120,
        info: 'Agency target is 100% co-signature within the policy window. Submit complete notes promptly so RNs retain full review time.',
      },
      {
        id: 'metric-flags',
        label: 'Flag rate',
        x: 380,
        y: 120,
        info: 'Flags highlight documentation opportunities. Strengthen Assessment reasoning and complete RN notifications to reduce returns.',
      },
      {
        id: 'metric-visits',
        label: 'Supervisory visits',
        x: 250,
        y: 280,
        info: 'Bi-weekly observation visits must be scheduled and documented. Missing documentation is a compliance risk even if the visit occurred.',
      },
    ],
    clinicalTip:
      'Review your personal compliance indicators with your supervisor monthly. Compare patterns (lateness vs. content flags) so coaching targets the real gap.',
    authorityNote:
      'Dashboard definitions and targets are agency operational metrics under CL-CS-001. They are not federal numerical standards published in this module.',
  },
  {
    id: 7,
    title: 'Module Summary & Knowledge Check Prep',
    subtitle: 'Co-signature & supervision mastery — knowledge only',
    narration: [
      'You have completed the didactic portion of LVN-003. Consolidate the framework before the knowledge assessment.',
      'Why co-signatures exist: CMS/home health supervision framework, professional protection for LVNs through documented RN review, and patient safety via second-clinician quality checks.',
      'Six-step workflow: complete note → submit (lock + timestamp) → RN notified → RN comprehensive review → RN co-signs → record permanently locked (addendum for later corrections). The agency 48-hour co-signature window starts at submission (CL-CS-001).',
      'Ten-point review with special weight on Assessment quality: reasoning, trends, and skilled-service justification within LVN scope—never independent POC changes, OASIS, diagnosis, or prescribing.',
      'Supervision layers beyond co-signature (agency policy): every-visit review, bi-weekly observation, monthly quality/skills check, and comprehensive evaluations. Documented supervision matters for survey readiness.',
      'Flag response: read feedback → correct thoroughly → re-submit within 24 hours → track patterns. More than two flags on one note triggers RN/DON coaching under agency policy.',
      'Knowledge check next: passing validates knowledge of co-signature and supervision requirements only. Practical competency for independent patient visits still requires observed demonstration, rubric scoring where used, remediation if needed, and authorized sign-off. A quiz score never replaces those steps.',
    ],
    keyPoints: [
      {
        icon: '★',
        title: 'Three pillars',
        detail: 'CMS framework + LVN protection + patient safety',
      },
      {
        icon: '★',
        title: '6-step workflow',
        detail: 'Complete → Submit → Notify → Review → Co-sign → Lock',
      },
      {
        icon: '★',
        title: '10-point review',
        detail: 'Assessment quality and POC/scope alignment are critical',
      },
      {
        icon: '★',
        title: 'Quiz = knowledge',
        detail: 'Observed visits + authorized sign-off determine practical competency',
      },
    ],
    scene: 'summary',
    hotspots: [
      {
        id: 'sum-workflow',
        label: 'Workflow',
        x: 120,
        y: 200,
        info: 'Submission starts the agency co-signature clock. Complete notes protect the full 48-hour RN review window.',
      },
      {
        id: 'sum-scope',
        label: 'Scope boundary',
        x: 250,
        y: 200,
        info: 'LVN documents under RN supervision. Do not claim RN-only actions in notes or in practice.',
      },
      {
        id: 'sum-competency',
        label: 'Competency',
        x: 380,
        y: 200,
        info: 'This quiz measures knowledge only. Practical competency requires observation and authorized sign-off.',
      },
    ],
    clinicalTip:
      'Success formula: document thoroughly, document specifically, document on time—and stay inside LVN scope while escalating changes to the RN.',
  },
];

// ─── Quiz (10 questions; balanced A=3 B=3 C=2 D=2) ───────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Which CMS citation is the federal personnel-qualifications reference used in this module for the LVN home health framework?',
    options: [
      '42 CFR § 484.115(c)',
      '42 CFR § 484.55 (comprehensive assessment only)',
      '42 CFR § 484.70 (infection prevention only)',
      '42 CFR § 482.23 (hospital nursing services)',
    ],
    correct: 0, // A
    rationale:
      'This module’s CMS basis is 42 CFR § 484.115(c), the home health personnel-qualifications provision addressing the LPN/LVN. Co-signature operations also sit inside the broader CoP supervision structure and agency policy CL-CS-001.',
  },
  {
    id: 2,
    stem: 'According to Care Indeed teaching in this module, co-signatures exist primarily for which three reasons?',
    options: [
      'Cost reduction, staffing efficiency, and marketing',
      'CMS/supervision compliance framework, LVN professional protection, and patient safety',
      'Physician convenience, insurance advertising, and termination decisions',
      'Billing speed, supply inventory, and HR scheduling only',
    ],
    correct: 1, // B
    rationale:
      'The three pillars are: compliance with the home health supervision/personnel framework, professional protection via documented RN review, and patient safety through a second clinical quality check.',
  },
  {
    id: 3,
    stem: 'Under Care Indeed agency policy CL-CS-001, what is the maximum time allowed for an RN to co-sign an LVN visit note after the LVN submits it?',
    options: [
      '48 hours from submission',
      '7 calendar days from the visit date only',
      '30 days from the end of the episode',
      'No time limit if the patient is stable',
    ],
    correct: 0, // A
    rationale:
      'CL-CS-001 sets a 48-hour co-signature window measured from the LVN’s submission timestamp. This is agency policy—not a universal federal hour standard printed in the CFR for every agency.',
  },
  {
    id: 4,
    stem: 'Which element of the visit note is MOST often the focus when an RN flags an LVN note for weak clinical reasoning?',
    options: [
      'The font size of the printed copy',
      'The mileage field only',
      'The Assessment section',
      'The insurance authorization number',
    ],
    correct: 2, // C
    rationale:
      'Assessment quality is the most frequently emphasized flag theme: RNs expect interpretation, trend, and skilled-service justification—not a bare restatement of vitals.',
  },
  {
    id: 5,
    stem: 'Per Care Indeed CL-CS-001 supervision cadence taught in this module, how often must the supervising RN conduct a direct supervisory (observation) visit with the LVN?',
    options: [
      'Only once at hire',
      'Every 14 days (bi-weekly)',
      'Only when a complaint is filed',
      'Only at annual evaluation',
    ],
    correct: 1, // B
    rationale:
      'Agency policy CL-CS-001 schedules bi-weekly (every 14 days) RN supervisory observation visits in addition to every-visit co-signature review. Follow current signed policy if intervals are updated.',
  },
  {
    id: 6,
    stem: 'If your note is flagged by the RN, what is your deadline under CL-CS-001 for making corrections and re-submitting?',
    options: [
      'Whenever you next see the patient',
      'Within 14 days',
      'Before annual competency only',
      'Within 24 hours',
    ],
    correct: 3, // D
    rationale:
      'Flagged notes must be corrected thoroughly and re-submitted within 24 hours under CL-CS-001. Address the specific feedback, not a token one-line add-on.',
  },
  {
    id: 7,
    stem: 'Under agency escalation policy in this module, what happens if an LVN note is flagged more than twice in the co-signature process?',
    options: [
      'A mandatory coaching session with the supervising RN and DON is triggered',
      'The note is auto-deleted from the EHR',
      'The LVN may independently lock the note without RN co-signature',
      'The physician must rewrite the entire plan of care immediately',
    ],
    correct: 0, // A
    rationale:
      'More than two flags on the same note triggers mandatory coaching with the supervising RN and Director of Nursing (agency escalation under CL-CS-001).',
  },
  {
    id: 8,
    stem: 'After the RN applies an electronic co-signature, what is the correct status of the clinical record?',
    options: [
      'It remains freely editable by any clinician for 30 days',
      'It is emailed to the patient portal for rewriting',
      'It is permanently locked; later changes require a formal timestamped addendum',
      'It can be silently overwritten if the LVN remembers a detail',
    ],
    correct: 2, // C
    rationale:
      'Co-signature locks the record to preserve integrity. Corrections use a formal, dated/timed addendum that preserves the original entry—never silent alteration.',
  },
  {
    id: 9,
    stem: 'What is Care Indeed’s stated target for on-time co-signature rate under CL-CS-001?',
    options: [
      '75%',
      '100%',
      '50% if census is high',
      'No target is defined',
    ],
    correct: 1, // B
    rationale:
      'The agency target is 100% on-time co-signature within the policy window. Timely, complete LVN submission is a primary driver of meeting that target.',
  },
  {
    id: 10,
    stem: 'During a CMS survey focused on LVN oversight, which documentation set best matches what surveyors may review?',
    options: [
      'Only the marketing brochure',
      'Only the LVN’s lunch receipts',
      'Only unsigned draft notes kept on paper at home',
      'Co-signature records, supervisory visit notes, competency evaluations, and compliance metrics',
    ],
    correct: 3, // D
    rationale:
      'Surveyors may examine the full supervision trail: co-signatures, supervisory visit documentation, competency evaluations, and related compliance evidence—not a single artifact in isolation.',
  },
];

// Distribution check (build-time documentation):
// A(0): Q1, Q3, Q7  → 3
// B(1): Q2, Q5, Q9  → 3
// C(2): Q4, Q8      → 2
// D(3): Q6, Q10     → 2

// ─── Shared SVG helpers ──────────────────────────────────────────────────────

const svgBg = '#F8FAFC';
const ink = '#0F172A';
const muted = '#64748B';
const blue = '#2563EB';
const indigo = '#4338CA';
const green = '#059669';
const amber = '#D97706';
const rose = '#E11D48';
const slate = '#334155';

function HotspotDot({
  x,
  y,
  id: _id,
  label,
  active,
  onClick,
}: {
  x: number;
  y: number;
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  void _id;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <circle
        cx={x}
        cy={y}
        r={active ? 16 : 14}
        fill={active ? blue : '#FFFFFF'}
        stroke={blue}
        strokeWidth={3}
      />
      <circle cx={x} cy={y} r={5} fill={active ? '#FFFFFF' : blue} />
      {active && (
        <circle cx={x} cy={y} r={22} fill="none" stroke={blue} strokeWidth={2} opacity={0.35}>
          <animate attributeName="r" values="18;26;18" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

export function FeedbackBanner({ hotspot }: { hotspot: Hotspot | null }) {
  if (!hotspot) {
    return (
      <div
        style={{
          marginTop: 8,
          padding: '10px 12px',
          borderRadius: 8,
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: slate,
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        Tap a blue hotspot on the diagram to reveal instructional feedback.
      </div>
    );
  }
  return (
    <div
      style={{
        marginTop: 8,
        padding: '10px 12px',
        borderRadius: 8,
        background: '#EEF2FF',
        border: `2px solid ${indigo}`,
        color: ink,
        fontSize: 13,
        lineHeight: 1.45,
      }}
      role="status"
    >
      <strong style={{ color: indigo }}>{hotspot.label}: </strong>
      {hotspot.info}
    </div>
  );
}

// ─── Scenes (7 distinct instructional SVGs) ──────────────────────────────────

function PillarsScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const pillars = [
    { id: 'pillar-cms', title: 'CMS', sub: 'Supervision\nframework', x: 90, color: blue },
    { id: 'pillar-lvn', title: 'LVN', sub: 'Professional\nprotection', x: 250, color: indigo },
    { id: 'pillar-safety', title: 'Patient', sub: 'Safety\ncheckpoint', x: 410, color: green },
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Three pillars of co-signature oversight">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="36" textAnchor="middle" fill={ink} fontSize="16" fontWeight="700">
        Three Pillars of Co-Signature Oversight
      </text>
      <line x1="40" y1="340" x2="460" y2="340" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
      {pillars.map((p) => {
        const active = activeHotspot === p.id;
        return (
          <g key={p.id}>
            <rect
              x={p.x - 50}
              y={active ? 100 : 120}
              width="100"
              height={active ? 220 : 200}
              rx="10"
              fill={active ? p.color : '#FFFFFF'}
              stroke={p.color}
              strokeWidth="3"
            />
            <text
              x={p.x}
              y={active ? 160 : 175}
              textAnchor="middle"
              fill={active ? '#FFFFFF' : p.color}
              fontSize="18"
              fontWeight="700"
            >
              {p.title}
            </text>
            {p.sub.split('\n').map((line, i) => (
              <text
                key={line}
                x={p.x}
                y={(active ? 200 : 215) + i * 18}
                textAnchor="middle"
                fill={active ? '#E0E7FF' : muted}
                fontSize="12"
              >
                {line}
              </text>
            ))}
            <rect x={p.x - 58} y="330" width="116" height="14" rx="4" fill={p.color} opacity={0.85} />
          </g>
        );
      })}
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function WorkflowScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const steps = [
    { label: '1. Complete note', y: 70, id: 'complete' },
    { label: '2. Submit (lock + clock)', y: 125, id: 'step-submit' },
    { label: '3. RN notified', y: 180, id: 'notify' },
    { label: '4. RN reviews', y: 235, id: 'step-review' },
    { label: '5. Co-sign attestation', y: 290, id: 'cosign' },
    { label: '6. Record locked', y: 345, id: 'step-lock' },
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Six-step co-signature workflow">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="32" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        Co-Signature Workflow (CL-CS-001)
      </text>
      <line x1="250" y1="55" x2="250" y2="360" stroke="#CBD5E1" strokeWidth="4" />
      {steps.map((s, idx) => {
        const linked = s.id.startsWith('step-') ? s.id : null;
        const active = linked != null && activeHotspot === linked;
        return (
          <g key={s.label}>
            <circle
              cx="250"
              cy={s.y}
              r={active ? 18 : 14}
              fill={active ? blue : idx % 2 === 0 ? indigo : blue}
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            <rect
              x={idx % 2 === 0 ? 40 : 280}
              y={s.y - 16}
              width="160"
              height="32"
              rx="8"
              fill={active ? '#DBEAFE' : '#FFFFFF'}
              stroke={active ? blue : '#CBD5E1'}
              strokeWidth="2"
            />
            <text
              x={idx % 2 === 0 ? 120 : 360}
              y={s.y + 5}
              textAnchor="middle"
              fill={ink}
              fontSize="12"
              fontWeight="600"
            >
              {s.label}
            </text>
          </g>
        );
      })}
      <text x="250" y="390" textAnchor="middle" fill={muted} fontSize="11">
        48-hour RN review window starts at Submit (agency policy)
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function ChecklistScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const items = [
    '1. Patient ID match',
    '2. Visit times',
    '3. Vital signs complete',
    '4. Structure / SOAP complete',
    '5. Assessment reasoning',
    '6. Interventions ↔ POC',
    '7. Patient response',
    '8. RN notifications',
    '9. Scope compliance',
    '10. Submission timeliness',
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Ten-point RN co-signature checklist">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="30" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        RN 10-Point Review Protocol
      </text>
      <rect x="30" y="48" width="280" height="330" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      {items.map((item, i) => {
        const emphasis =
          (i === 4 && activeHotspot === 'review-assessment') ||
          (i === 5 && activeHotspot === 'review-poc') ||
          (i === 8 && activeHotspot === 'review-scope');
        return (
          <g key={item}>
            <rect
              x="42"
              y={58 + i * 31}
              width="256"
              height="26"
              rx="6"
              fill={emphasis ? '#DBEAFE' : i % 2 === 0 ? '#F1F5F9' : '#FFFFFF'}
              stroke={emphasis ? blue : 'transparent'}
              strokeWidth="2"
            />
            <rect
              x="50"
              y={64 + i * 31}
              width="14"
              height="14"
              rx="3"
              fill={emphasis ? green : '#E2E8F0'}
              stroke={slate}
              strokeWidth="1"
            />
            {emphasis && (
              <path
                d={`M${53} ${71 + i * 31} l3 3 l6 -7`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            )}
            <text x="74" y={75 + i * 31} fill={ink} fontSize="12" fontWeight={emphasis ? 700 : 500}>
              {item}
            </text>
          </g>
        );
      })}
      <rect x="330" y="80" width="150" height="240" rx="12" fill="#EEF2FF" stroke={indigo} strokeWidth="2" />
      <text x="405" y="115" textAnchor="middle" fill={indigo} fontSize="13" fontWeight="700">
        Focus zones
      </text>
      <text x="405" y="150" textAnchor="middle" fill={slate} fontSize="11">
        Assessment quality
      </text>
      <text x="405" y="180" textAnchor="middle" fill={slate} fontSize="11">
        POC alignment
      </text>
      <text x="405" y="210" textAnchor="middle" fill={slate} fontSize="11">
        Scope boundary
      </text>
      <text x="405" y="255" textAnchor="middle" fill={muted} fontSize="10">
        LVN does not change
      </text>
      <text x="405" y="270" textAnchor="middle" fill={muted} fontSize="10">
        POC / OASIS / orders
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function SupervisionScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const layers = [
    { id: 'layer-1', label: 'Every visit — co-signature', color: blue, y: 90 },
    { id: 'layer-2', label: 'Every 14 days — observation', color: indigo, y: 175 },
    { id: 'layer-3', label: 'Every 30 days — quality check', color: amber, y: 260 },
    { id: 'layer-4', label: '90-day / ongoing — full eval', color: green, y: 345 },
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Four-layer LVN supervision framework">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="32" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        Supervision Layers (Agency Policy CL-CS-001)
      </text>
      {layers.map((L, idx) => {
        const active = activeHotspot === L.id;
        const width = 200 + idx * 45;
        return (
          <g key={L.id}>
            <rect
              x={(500 - width) / 2}
              y={L.y - 28}
              width={width}
              height="56"
              rx="12"
              fill={active ? L.color : '#FFFFFF'}
              stroke={L.color}
              strokeWidth="3"
            />
            <text
              x="250"
              y={L.y + 5}
              textAnchor="middle"
              fill={active ? '#FFFFFF' : L.color}
              fontSize="13"
              fontWeight="700"
            >
              {L.label}
            </text>
          </g>
        );
      })}
      <text x="250" y="392" textAnchor="middle" fill={muted} fontSize="10">
        Quiz ≠ practical competency — observation + authorized sign-off still required
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function FlaggingScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const approved = activeHotspot === 'approved-path';
  const flagged = activeHotspot === 'flagged-path';
  const coaching = activeHotspot === 'coaching-path';
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Note flagging and revision paths">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="30" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        Flag &amp; Revision Pathways
      </text>
      {/* Start node */}
      <rect x="175" y="50" width="150" height="40" rx="8" fill={blue} />
      <text x="250" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
        Note submitted
      </text>
      <line x1="250" y1="90" x2="250" y2="115" stroke={slate} strokeWidth="2" />
      <line x1="140" y1="115" x2="360" y2="115" stroke={slate} strokeWidth="2" />
      <line x1="140" y1="115" x2="140" y2="140" stroke={slate} strokeWidth="2" />
      <line x1="360" y1="115" x2="360" y2="140" stroke={slate} strokeWidth="2" />
      {/* Approved */}
      <rect
        x="55"
        y="140"
        width="170"
        height="70"
        rx="10"
        fill={approved ? green : '#FFFFFF'}
        stroke={green}
        strokeWidth="3"
      />
      <text x="140" y="170" textAnchor="middle" fill={approved ? '#FFFFFF' : green} fontSize="13" fontWeight="700">
        Approved path
      </text>
      <text x="140" y="190" textAnchor="middle" fill={approved ? '#D1FAE5' : muted} fontSize="11">
        Co-sign → Lock
      </text>
      {/* Flagged */}
      <rect
        x="275"
        y="140"
        width="170"
        height="70"
        rx="10"
        fill={flagged ? amber : '#FFFFFF'}
        stroke={amber}
        strokeWidth="3"
      />
      <text x="360" y="170" textAnchor="middle" fill={flagged ? '#FFFFFF' : amber} fontSize="13" fontWeight="700">
        Flagged path
      </text>
      <text x="360" y="190" textAnchor="middle" fill={flagged ? '#FEF3C7' : muted} fontSize="11">
        Correct ≤ 24 hrs
      </text>
      <line x1="360" y1="210" x2="360" y2="240" stroke={slate} strokeWidth="2" />
      <line x1="250" y1="240" x2="360" y2="240" stroke={slate} strokeWidth="2" />
      <line x1="250" y1="240" x2="250" y2="265" stroke={slate} strokeWidth="2" />
      <rect
        x="150"
        y="265"
        width="200"
        height="70"
        rx="10"
        fill={coaching ? rose : '#FFFFFF'}
        stroke={rose}
        strokeWidth="3"
      />
      <text x="250" y="295" textAnchor="middle" fill={coaching ? '#FFFFFF' : rose} fontSize="13" fontWeight="700">
        &gt;2 flags → Coaching
      </text>
      <text x="250" y="315" textAnchor="middle" fill={coaching ? '#FFE4E6' : muted} fontSize="11">
        RN + DON (agency policy)
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function DashboardScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const cards = [
    { id: 'metric-ontime', title: 'On-time rate', value: 'Target 100%', x: 40, color: blue },
    { id: 'metric-flags', title: 'Flag rate', value: 'Low + improve', x: 270, color: amber },
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Co-signature compliance dashboard concepts">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="30" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        Compliance Dashboard Concepts
      </text>
      <text x="250" y="50" textAnchor="middle" fill={muted} fontSize="11">
        Definitions &amp; targets — not live invented percentages
      </text>
      {cards.map((c) => {
        const active = activeHotspot === c.id;
        return (
          <g key={c.id}>
            <rect
              x={c.x}
              y="70"
              width="190"
              height="110"
              rx="12"
              fill={active ? c.color : '#FFFFFF'}
              stroke={c.color}
              strokeWidth="3"
            />
            <text x={c.x + 95} y="115" textAnchor="middle" fill={active ? '#FFFFFF' : c.color} fontSize="14" fontWeight="700">
              {c.title}
            </text>
            <text x={c.x + 95} y="145" textAnchor="middle" fill={active ? '#E0E7FF' : slate} fontSize="13">
              {c.value}
            </text>
          </g>
        );
      })}
      <rect
        x="100"
        y="210"
        width="300"
        height="100"
        rx="12"
        fill={activeHotspot === 'metric-visits' ? green : '#FFFFFF'}
        stroke={green}
        strokeWidth="3"
      />
      <text
        x="250"
        y="255"
        textAnchor="middle"
        fill={activeHotspot === 'metric-visits' ? '#FFFFFF' : green}
        fontSize="14"
        fontWeight="700"
      >
        Supervisory visit compliance
      </text>
      <text
        x="250"
        y="280"
        textAnchor="middle"
        fill={activeHotspot === 'metric-visits' ? '#D1FAE5' : muted}
        fontSize="12"
      >
        Shared LVN + RN scheduling duty
      </text>
      {/* Decorative bar chart without fake stats */}
      <rect x="60" y="340" width="40" height="40" fill={blue} opacity="0.8" />
      <rect x="120" y="320" width="40" height="60" fill={indigo} opacity="0.8" />
      <rect x="180" y="300" width="40" height="80" fill={green} opacity="0.8" />
      <text x="320" y="360" fill={muted} fontSize="11">
        Improve → first-pass notes
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

function SummaryScene({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const nodes = [
    { id: 'sum-workflow', label: 'Workflow', x: 120, color: blue },
    { id: 'sum-scope', label: 'Scope', x: 250, color: indigo },
    { id: 'sum-competency', label: 'Competency', x: 380, color: green },
  ];
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" role="img" aria-label="Module summary mastery map">
      <rect width="500" height="400" fill={svgBg} rx="12" />
      <text x="250" y="36" textAnchor="middle" fill={ink} fontSize="15" fontWeight="700">
        LVN-003 Mastery Map
      </text>
      <circle cx="250" cy="200" r="70" fill="#EEF2FF" stroke={indigo} strokeWidth="3" />
      <text x="250" y="195" textAnchor="middle" fill={indigo} fontSize="14" fontWeight="700">
        RN Co-Sign
      </text>
      <text x="250" y="215" textAnchor="middle" fill={indigo} fontSize="14" fontWeight="700">
        &amp; Supervision
      </text>
      {nodes.map((n) => {
        const active = activeHotspot === n.id;
        return (
          <g key={n.id}>
            <line x1="250" y1="200" x2={n.x} y2="110" stroke={n.color} strokeWidth="3" opacity={0.5} />
            <circle cx={n.x} cy="100" r={active ? 42 : 36} fill={active ? n.color : '#FFFFFF'} stroke={n.color} strokeWidth="3" />
            <text x={n.x} y="105" textAnchor="middle" fill={active ? '#FFFFFF' : n.color} fontSize="12" fontWeight="700">
              {n.label}
            </text>
          </g>
        );
      })}
      <rect x="70" y="300" width="360" height="60" rx="10" fill="#FEF3C7" stroke={amber} strokeWidth="2" />
      <text x="250" y="325" textAnchor="middle" fill={ink} fontSize="12" fontWeight="700">
        Knowledge quiz ≠ practical competency alone
      </text>
      <text x="250" y="345" textAnchor="middle" fill={slate} fontSize="11">
        Observed visits + authorized sign-off remain required
      </text>
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          x={h.x}
          y={h.y}
          id={h.id}
          label={h.label}
          active={activeHotspot === h.id}
          onClick={() => onHotspot(activeHotspot === h.id ? null : h.id)}
        />
      ))}
    </svg>
  );
}

const SCENE_MAP: Record<string, React.FC<SceneProps>> = {
  pillars: PillarsScene,
  workflow: WorkflowScene,
  checklist: ChecklistScene,
  supervision: SupervisionScene,
  flagging: FlaggingScene,
  dashboard: DashboardScene,
  summary: SummaryScene,
};

// ─── Main module component ───────────────────────────────────────────────────



const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Ambient Background Pattern */
    .bg-dots {
      background-image: radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
    }

    /* Flow Animations for SVG Paths */
    @keyframes flow-dash {
      to { stroke-dashoffset: -24; }
    }
    @keyframes flow-dash-reverse {
      to { stroke-dashoffset: 24; }
    }
    .animate-flow-teal {
      stroke-dasharray: 8 8;
      animation: flow-dash 1s linear infinite;
    }
    .animate-flow-orange {
      stroke-dasharray: 8 8;
      animation: flow-dash 1s linear infinite;
    }
    .animate-flow-orange-reverse {
      stroke-dasharray: 8 8;
      animation: flow-dash-reverse 1s linear infinite;
    }

    /* Node & Card Pop-in Animations */
    @keyframes pop-in {
      0% { opacity: 0; transform: scale(0.85) translateY(15px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .node-animate {
      opacity: 0;
      animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    /* Staggered Fade In for Left Panel */
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .stagger-1 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.1s forwards; }
    .stagger-2 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.2s forwards; }
    .stagger-3 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.3s forwards; }
    .stagger-4 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.4s forwards; }

    /* Button Pulses and Shines */
    @keyframes pulse-soft {
      0%, 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(234, 88, 12, 0); }
    }
    .btn-pulse {
      animation: pulse-soft 2.5s infinite;
    }
    
    .btn-shine {
      position: relative;
      overflow: hidden;
    }
    .btn-shine::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      transform: skewX(-25deg);
      animation: shine 4s infinite;
    }
    @keyframes shine {
      0%, 20% { left: -100%; }
      20%, 100% { left: 200%; }
    }

    /* Compass Rotation */
    @keyframes rotate-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: rotate-slow 40s linear infinite;
    }

    .scroll-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

const TopNav = ({ activeLesson, setActiveLesson, totalLessons }: any) => {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50 sticky top-0 shadow-sm">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#047857] flex items-center justify-center shadow-lg shadow-teal-900/20">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <div>
            <div className="text-[12px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase">MODULE LVN-003</div>
            <div className="text-[15px] font-bold text-slate-800 tracking-tight">{MODULE_META?.title || 'LVN Documentation Module'}</div>
          </div>
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {Array.from({length: totalLessons}).map((_, i) => (
            <button
              key={i+1}
              onClick={() => setActiveLesson(i+1)}
              className={`relative px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center space-x-2 ${activeLesson === i+1 ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
            >
              {activeLesson === i+1 && <div className="absolute inset-0 bg-gradient-to-r from-[#0f766e] to-[#047857] rounded-xl -z-10"></div>}
              <span>{String(i+1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>
      
      <button className="px-6 py-2.5 rounded-xl text-[12px] font-extrabold text-[#ea580c] uppercase tracking-[0.1em] border-2 border-[#ea580c]/20 hover:bg-[#ea580c]/5 transition-colors flex items-center space-x-2">
        <span>Save & Exit</span>
      </button>
    </div>
  );
};

const BottomNav = ({ activeLesson, setActiveLesson, totalLessons, isPlaying, setIsPlaying }: any) => {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-50 sticky bottom-0">
      <button 
        onClick={() => setActiveLesson(Math.max(1, activeLesson - 1))}
        disabled={activeLesson === 1}
        className={`px-6 py-3 rounded-2xl text-[13px] font-extrabold uppercase tracking-[0.1em] flex items-center space-x-2 transition-all ${activeLesson === 1 ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100' : 'text-slate-600 bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm'}`}
      >
        <ChevronLeft size={18} />
        <span>Previous</span>
      </button>

      <div className="flex items-center space-x-6">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0f766e] to-[#047857] flex items-center justify-center text-white shadow-xl shadow-teal-900/20 hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex flex-col">
          <div className="text-[14px] font-bold text-slate-800">00:00 / 00:00</div>
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Lesson {activeLesson} of {totalLessons}</div>
        </div>
      </div>

      <button 
        onClick={() => setActiveLesson(Math.min(totalLessons, activeLesson + 1))}
        disabled={activeLesson === totalLessons}
        className={`px-8 py-3 rounded-2xl text-[13px] font-extrabold uppercase tracking-[0.1em] flex items-center space-x-2 transition-all btn-shine ${activeLesson === totalLessons ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40'}`}
      >
        <span>{activeLesson === totalLessons ? 'Complete' : 'Next Lesson'}</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

const ChallengeModal = ({ onClose, quizData }: any) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const question = quizData[0] || { stem: "Knowledge Check", options: ["Option A", "Option B"], correct: 0 };
  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg">
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] p-10 shadow-2xl relative node-animate">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"><X size={20} /></button>
        <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">Knowledge Check</div>
        <h3 className="text-slate-800 text-[20px] font-bold mb-8">{question.stem}</h3>
        <div className="space-y-4 mb-8">
          {question.options.map((opt: string, i: number) => (
            <div key={i} onClick={() => !isSubmitted && setSelectedAnswer(i)} className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 ${isSubmitted ? (i === question.correct ? 'bg-[#ecfdf5] border-[#10b981]' : (selectedAnswer === i ? 'bg-[#fef2f2] border-[#ef4444]' : 'border-slate-100 opacity-40')) : (selectedAnswer === i ? 'border-[#0f766e] bg-[#f0fdfa]' : 'border-slate-200')} `}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSubmitted ? (i === question.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === i ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300')) : (selectedAnswer === i ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}`}>{isSubmitted && i === question.correct && <CheckCircle2 size={14} className="text-white"/>}{isSubmitted && i !== question.correct && selectedAnswer === i && <X size={14} className="text-white"/>}</div>
              <span className="text-[15px] font-semibold">{opt}</span>
            </div>
          ))}
        </div>
        <button onClick={isSubmitted ? onClose : () => selectedAnswer !== null && setIsSubmitted(true)} disabled={selectedAnswer === null && !isSubmitted} className={`w-full py-4 rounded-2xl font-extrabold shadow-md ${selectedAnswer === null && !isSubmitted ? 'bg-slate-100 text-slate-400' : isSubmitted ? (isCorrect ? 'bg-[#10b981] text-white' : 'bg-[#0f766e] text-white') : 'bg-[#ea580c] text-white'}`}>{isSubmitted ? (isCorrect ? 'CORRECT - CONTINUE' : 'RETRY') : 'SUBMIT'}</button>
      </div>
    </div>
  );
};

const LeftContent = ({ page }: { page: any }) => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8 border-r border-slate-200/50">
      <div className="max-w-[95%]">
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            {page.title.split('—').length > 1 ? (
              <>
                {page.title.split('—')[0].trim()} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">
                  {page.title.split('—').slice(1).join('—').trim()}
                </span>
              </>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">
                  {page.title}
              </span>
            )}
          </h1>
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <AlertCircle size={20} className="mr-2 opacity-80" />
            {page.subtitle}
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.7] mb-12 stagger-2 font-medium">
          {page.narration.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {page.keyPoints && page.keyPoints.length > 0 && (
          <div className="mb-12 stagger-3">
            <h4 className="text-[12px] font-extrabold text-slate-400 tracking-[0.2em] uppercase mb-6 flex items-center">
              Key Clinical Actions
              <div className="flex-1 h-px bg-slate-200 ml-4"></div>
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {page.keyPoints.map((kp: any, i: number) => (
                <div key={i} className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0f766e]/30 transition-all flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[24px] group-hover:scale-110 group-hover:bg-[#f0fdfa] transition-all">
                    {kp.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <h5 className="text-[15px] font-bold text-slate-800 mb-1">{kp.title}</h5>
                    <p className="text-[14px] text-slate-500 leading-relaxed">{kp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stagger-4 space-y-4 pb-12">
          {page.clinicalTip && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-[#fed7aa] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h4 className="text-[#c2410c] text-[12px] font-extrabold uppercase tracking-widest mb-2 flex items-center">
                <Compass size={16} className="mr-2 animate-spin-slow" /> Clinical Tip
              </h4>
              <p className="text-[#9a3412] text-[14px] font-medium leading-relaxed relative z-10">
                {page.clinicalTip}
              </p>
            </div>
          )}

          {page.authorityNote && (
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-500 font-medium">
              <ShieldCheck size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-slate-700 font-bold">Authority Note:</strong> {page.authorityNote}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const RightPanel = ({ page, isPlaying, setShowChallenge }: { page: any, isPlaying: boolean, setShowChallenge: (b: boolean) => void }) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  
  return (
    <div className="w-1/2 relative bg-[#fafafa] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
      
      <div className="relative z-10 w-full h-full p-12 flex flex-col items-center justify-center">
        <div className="w-full flex-1 max-h-[600px] node-animate bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center relative p-8">
           { typeof InstructionalScene !== 'undefined' ? (
             // @ts-ignore
             <InstructionalScene
                scene={page.svgScene}
                activeHotspot={activeHotspot}
                onHotspot={setActiveHotspot}
                hotspots={page.hotspots || []}
             />
           ) : (
             <div className="text-slate-400 text-center font-bold uppercase tracking-widest text-[12px]">InstructionalScene missing</div>
           )}
        </div>
        
        <div className="mt-6 text-[12px] font-semibold text-slate-500 uppercase tracking-widest node-animate" style={{ animationDelay: '0.1s' }}>
          Interactive hotspots reveal system-specific documentation requirements
        </div>

        <button 
          onClick={() => setShowChallenge(true)}
          className="mt-8 px-8 py-4 rounded-2xl bg-white border-2 border-[#0f766e] text-[#0f766e] font-extrabold uppercase tracking-[0.1em] text-[13px] hover:bg-[#0f766e] hover:text-white transition-all shadow-lg shadow-teal-900/10 flex items-center space-x-3 btn-pulse node-animate"
          style={{ animationDelay: '0.2s' }}
        >
          <ShieldCheck size={20} />
          <span>Launch Knowledge Check</span>
        </button>
      </div>
    </div>
  );
};

export default function LVN003() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);

  // In actual implementation, QUIZ might be an array or QUIZZES object.
  // @ts-ignore
  const quizData = typeof QUIZ !== 'undefined' ? QUIZ : (typeof QUIZZES !== 'undefined' ? QUIZZES : []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-white font-sans antialiased flex flex-col z-[9999]">
      <GlobalStyles />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-radial from-transparent to-slate-200/50 mix-blend-multiply z-0"></div>
      
      <div className="w-full h-full flex flex-col relative z-10">
        <TopNav activeLesson={activeLesson} setActiveLesson={setActiveLesson} totalLessons={PAGES.length} />
        
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          <LeftContent page={PAGES[activeLesson - 1]} />
          <RightPanel page={PAGES[activeLesson - 1]} isPlaying={isPlaying} setShowChallenge={setShowChallenge} />
          
          {showChallenge && <ChallengeModal onClose={() => setShowChallenge(false)} quizData={quizData} />}
        </div>
        
        <BottomNav 
          activeLesson={activeLesson} 
          setActiveLesson={setActiveLesson} 
          totalLessons={PAGES.length}
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
        />
      </div>
    </div>
  );
}
