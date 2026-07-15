/**
 * LVN-001: EHR System — LVN Documentation Module
 * Track: LVN — Licensed Vocational Nurse
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record ID: 6a55780e3463cd690af8d629
 * CMS: 42 CFR § 484.115(c) | Agency policy: EHR documentation standards
 *
 * Standalone SC04-style module: left narration (~55%) + instructional SVG (~45%).
 * Quiz validates knowledge only — observed demonstration and authorized sign-off
 * remain separate for practical competency.
 */

import React, { useCallback, useMemo, useState } from 'react';

// ─── MODULE META ─────────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-001',
  title: 'EHR System — LVN Documentation Module',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.115(c)',
  policy: 'EHR / agency documentation standards',
  duration: '~35 min',
  themeColor: '#0D9488',
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
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
  svgScene: string;
  hotspots: Hotspot[];
  clinicalTip: string;
  authorityNote?: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
}

interface SceneProps {
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
  hotspots: Hotspot[];
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Welcome to the EHR for LVNs',
    subtitle: 'Your Documentation Command Center',
    narration: [
      'Welcome to the Electronic Health Record training for Licensed Vocational Nurses at Care Indeed Home Health Care. As an LVN working under the supervision of a Registered Nurse per 42 CFR § 484.115(c) (federal requirement), your documentation in the EHR is critical for patient safety, regulatory compliance, and continuity of care.',
      'Unlike Registered Nurses, you will not complete OASIS assessments or initial comprehensive assessments — those remain RN/authorized clinician functions. However, every visit note you write becomes part of the permanent medical record and may be reviewed during CMS surveys. Surveyors may pull visit notes and evaluate them for specificity, clinical reasoning within LVN scope, timely completion, and evidence that the plan of care was followed.',
      'Incomplete or non-specific visit documentation can expose the agency to survey findings. At Care Indeed, we use a web-based EHR platform designed for home health documentation. This module walks you through the screens, fields, and workflows you need to document efficiently and compliantly within LVN scope.',
      'Your EHR access is role-based — you see the LVN-specific dashboard, not the RN or OASIS modules. This design reduces scope-of-practice documentation errors and keeps you within authorized fields. The EHR prompts for required information, timestamps entries, and routes notes to the supervising RN for co-signature per agency policy and federal supervision requirements.',
      'By the end of this module, you will be able to log in securely, navigate the LVN dashboard, open and complete a visit note, understand the co-signature workflow, and apply documentation timelines that support compliance. The knowledge quiz confirms understanding only; practical competency still requires observed demonstration and authorized sign-off where agency policy requires it.',
    ],
    keyPoints: [
      {
        icon: '🔐',
        title: 'Role-Based Access',
        detail: 'LVN dashboard only — no OASIS or comprehensive assessment modules',
      },
      {
        icon: '📋',
        title: 'Every Note May Be Reviewed',
        detail: 'CMS surveyors may pull visit notes during surveys (federal survey process)',
      },
      {
        icon: '⏱️',
        title: 'Timely Documentation',
        detail: 'Agency target: same-day entry; agency co-signature window applies after submit',
      },
      {
        icon: '🔗',
        title: 'Co-Signature Routing',
        detail: 'System routes notes to supervising RN for review & co-sign (federal supervision + agency workflow)',
      },
    ],
    svgScene: 'dashboard',
    hotspots: [
      {
        id: 'dashboard-nav',
        label: 'LVN Dashboard',
        x: 28,
        y: 28,
        info: 'Role-based landing page: today’s schedule, pending notes, and alerts. OASIS and comprehensive assessment tools are not available under LVN login.',
      },
      {
        id: 'visit-queue',
        label: 'Visit Queue',
        x: 58,
        y: 28,
        info: 'Assigned patients with status indicators — complete, in progress, or overdue. Open only the correct patient after ID verification.',
      },
      {
        id: 'note-panel',
        label: 'Visit Notes',
        x: 58,
        y: 58,
        info: 'Quick-launch panel to start, continue, or review visit notes within LVN-authorized fields only.',
      },
    ],
    clinicalTip:
      'Always verify patient identity (name + DOB + MRN per agency ID policy) before opening a chart. Wrong-patient documentation is a serious safety event and a HIPAA privacy risk.',
    authorityNote:
      'Federal: 42 CFR § 484.115(c) LVN services under RN supervision. OASIS/comprehensive assessment = not LVN. Agency policy governs dashboard layout and ID fields.',
  },
  {
    id: 2,
    title: 'Visit Note Structure — The SOAP Framework',
    subtitle: 'Building Clinical Narratives That Withstand Audit',
    narration: [
      'Every LVN visit note at Care Indeed follows the SOAP framework: Subjective, Objective, Assessment, and Plan. SOAP is widely recognized professional documentation guidance used by CMS surveyors, accrediting bodies, and clinical educators — and it is Care Indeed’s required note structure (agency policy). It creates a logical clinical narrative any reviewer can follow.',
      'The Subjective section captures what the patient (or caregiver) tells you: chief complaint, symptom description, pain levels using a validated scale, medication compliance reports, and concerns. Prefer direct quotes when possible — “Patient states chest pain is 4 out of 10 and worse with deep breathing” is stronger evidence than “patient has some chest pain.”',
      'The Objective section records what you observe and measure: vital signs, physical findings, wound measurements (without independently assigning RN/physician staging when staging is outside your authorized role), and functional observations. Be specific and quantifiable: “Left lower leg wound measures 2.3 cm × 1.8 cm × 0.2 cm, wound bed 80% granulation, 20% slough, moderate serous drainage, periwound skin intact, no erythema.”',
      'The Assessment section is your clinical interpretation within LVN scope — connecting subjective reports to objective findings and recognizing change. This section is often heavily reviewed because it shows clinical reasoning: “Pain decreased from 6/10 to 4/10 since last visit, correlating with prescribed NSAID use as reported; wound bed granulation increased versus last visit.” Do not invent diagnoses or independently modify the Plan of Care.',
      'The Plan section documents what happens next within the existing physician/RN plan of care: continuing ordered interventions, RN notifications, physician communication via the RN chain as required, patient/caregiver education provided, and the next scheduled visit. Always document when you notified the supervising RN and any instructions received. The Plan section helps prove communication and chain-of-command follow-through.',
    ],
    keyPoints: [
      {
        icon: '💬',
        title: 'S — Subjective',
        detail: 'Patient’s own words, direct quotes, symptoms, concerns',
      },
      {
        icon: '🔍',
        title: 'O — Objective',
        detail: 'Vitals, measurements, physical findings — quantifiable data',
      },
      {
        icon: '🧠',
        title: 'A — Assessment',
        detail: 'Clinical reasoning within LVN scope connecting S + O (often highly reviewed)',
      },
      {
        icon: '📋',
        title: 'P — Plan',
        detail: 'Next steps under existing POC, RN notifications, education, follow-up',
      },
    ],
    svgScene: 'soap',
    hotspots: [
      {
        id: 'soap-s',
        label: 'Subjective',
        x: 22,
        y: 18,
        info: 'Use direct patient quotes. Specify pain scale (0–10), onset, quality, and aggravating/relieving factors.',
      },
      {
        id: 'soap-o',
        label: 'Objective',
        x: 22,
        y: 40,
        info: 'All vital signs + physical findings. Wound measurements in cm. Functional observations with assist levels. No independent staging if staging is RN/authorized-clinician role.',
      },
      {
        id: 'soap-a',
        label: 'Assessment',
        x: 22,
        y: 62,
        info: 'Connect S + O findings. Show trending (improving/declining). Do not diagnose or rewrite the POC — escalate changes to the RN.',
      },
      {
        id: 'soap-p',
        label: 'Plan',
        x: 22,
        y: 84,
        info: 'Document communications — RN calls, instructions received, education topics, next visit — under the existing ordered plan of care.',
      },
    ],
    clinicalTip:
      'A strong Assessment connects Subjective and Objective findings and shows you recognized changes in patient status — then routed concerns to the RN when they exceed LVN independent decision-making.',
    authorityNote:
      'SOAP structure = agency documentation standard + professional guidance. LVN does not independently develop/modify the Plan of Care (federal POC rules + CA LVN scope boundaries).',
  },
  {
    id: 3,
    title: 'Documentation Timelines & Compliance',
    subtitle: 'Deadlines That Protect Patients and Compliance',
    narration: [
      'Documentation timeliness is a compliance expectation at Care Indeed. Federal CMS Conditions of Participation require clinical records to support care and be maintained appropriately; late or incomplete documentation is a frequent survey risk area. Specific hour-based deadlines below are Care Indeed agency policy unless a statute or regulation is cited.',
      'Your primary agency target is same-day documentation: complete the visit note before the end of the calendar day on which the visit occurred. Same-day documentation is preferred because clinical observations are freshest, patient statements are most accurate, and the supervising RN can act while the information is still clinically useful.',
      'Per agency policy, the maximum deadline for visit note completion is 24 hours after the visit. Notes submitted after that window are flagged in the EHR as late and may trigger supervisor and Quality alerts. Patterns of late documentation may lead to coaching or performance processes under agency HR/quality policy — not automatic federal “license revocation,” which would require separate regulatory or board processes.',
      'Co-signature adds a second agency-policy timeline: after you submit, the supervising RN is expected to review and co-sign within 48 hours. The RN cannot co-sign what does not exist — a late LVN note compresses the supervisory review window. Federal supervision (42 CFR § 484.115(c)) requires RN oversight of LVN services; the 48-hour clock is how Care Indeed operationalizes timely review.',
      'The EHR tracks timestamps: open, draft saves, submit, and RN co-sign. Surveyors may review these patterns. Extremely short open-to-submit intervals can raise questions about note quality; unrealistically long delays raise timeliness concerns. Use professional judgment and agency guidance — typically plan a focused documentation window after the visit rather than rushing or deferring for days.',
    ],
    keyPoints: [
      {
        icon: '🎯',
        title: 'Same-Day Target (Agency)',
        detail: 'Complete visit note before end of calendar day — preferred practice',
      },
      {
        icon: '⏰',
        title: '24-Hour Maximum (Agency)',
        detail: 'Agency absolute deadline — late notes flagged in the EHR',
      },
      {
        icon: '📝',
        title: '48-Hour Co-Sign (Agency)',
        detail: 'RN review/co-sign window after your submission (supports federal supervision)',
      },
      {
        icon: '🔎',
        title: 'Timestamp Audit Trail',
        detail: 'EHR records open/save/submit times — patterns may be reviewed',
      },
    ],
    svgScene: 'timeline',
    hotspots: [
      {
        id: 'clock-center',
        label: 'Documentation Clock',
        x: 50,
        y: 28,
        info: 'Agency compliance clock starts when the visit ends. Same-day is the target; 24 hours is the agency maximum.',
      },
      {
        id: 'milestone-1',
        label: 'Same-Day Entry',
        x: 22,
        y: 62,
        info: 'Best practice: complete the note before driving to the next patient or by end of day while recall is freshest.',
      },
      {
        id: 'milestone-2',
        label: 'RN Co-Sign Window',
        x: 22,
        y: 78,
        info: 'Agency 48-hour RN review window after submit. Your late note compresses RN review time and increases dual-flag risk.',
      },
    ],
    clinicalTip:
      'Draft SOAP elements in the secure EHR app while still at the home when policy and safety allow. Capture vitals and key findings immediately, then polish and submit the same day.',
    authorityNote:
      'Federal: timely, accurate clinical records + RN supervision of LVN services. Same-day / 24-hour / 48-hour figures = Care Indeed agency policy, not universal federal hour mandates.',
  },
  {
    id: 4,
    title: 'LVN-Specific Required Fields',
    subtitle: 'Every Field Matters for Compliance',
    narration: [
      'The EHR visit note template for LVNs contains required field groups mapped to federal record expectations, privacy/security good practice, and Care Indeed policy. Leaving required fields blank or entering generic data creates documentation deficiencies. Walk through each group and what constitutes compliant documentation.',
      'Patient identification fields include name, medical record number, and date of birth. These often auto-populate from the schedule, but you must verify identity at every visit per agency patient-identification policy. Wrong-patient documentation is a never-event risk.',
      'Visit logistics include date of service, time in, and time out. These must reflect actual times. Knowingly falsifying visit times can constitute fraud under the federal False Claims Act and related enforcement frameworks — never estimate “for convenience.” Where enabled, the EHR may geo-tag check-in/out using device GPS as an independent verification layer (agency system configuration).',
      'Vital signs are required at every skilled nursing visit per agency clinical documentation standards: temperature, pulse, respirations, blood pressure, oxygen saturation, weight when indicated, and pain level using a validated 0–10 numeric rating scale. Document method/position for blood pressure and device used for oxygen saturation when applicable. Missing vital-sign elements is among the most common LVN documentation gaps found in quality review.',
      'Clinical narrative sections (SOAP) require specificity. Generic phrases like “patient doing well” or “no changes noted” are usually insufficient. Every visit should reflect what you assessed, what you found, what ordered interventions you performed, how the patient responded, and what happens next under the plan of care. The narrative helps demonstrate that the visit was skilled, necessary, and consistent with the ordered plan.',
    ],
    keyPoints: [
      {
        icon: '👤',
        title: 'Patient ID Verification',
        detail: 'Name + MRN + DOB — verify every visit (agency ID policy)',
      },
      {
        icon: '📅',
        title: 'Actual Visit Times',
        detail: 'Real time in/out — GPS may verify; falsification can be fraud',
      },
      {
        icon: '💓',
        title: 'Complete Vital Signs',
        detail: 'T/P/R/BP/O2/Pain each visit — common quality gap when incomplete',
      },
      {
        icon: '📋',
        title: 'Skilled Narrative',
        detail: 'No empty generics — specific, measurable clinical language',
      },
    ],
    svgScene: 'fields',
    hotspots: [
      {
        id: 'field-time',
        label: 'Time In/Out',
        x: 18,
        y: 32,
        info: 'Actual times only. Rounded or invented times can flag for audit. GPS verification may apply per system settings.',
      },
      {
        id: 'field-vitals',
        label: 'Vital Signs',
        x: 18,
        y: 48,
        info: 'Required parameters typically include T, P, R, BP (with position), O2 (with device when used), and Pain (0–10 scale).',
      },
      {
        id: 'field-narrative',
        label: 'Clinical Narrative',
        x: 18,
        y: 68,
        info: 'Must show skilled observation, ordered interventions, response, and reasoning within LVN scope — not a task checklist alone.',
      },
    ],
    clinicalTip:
      'Mental checklist: ID → Time In → Vitals → Subjective → Objective → Interventions → Response → Plan → Time Out → Submit. Sequence reduces missed required fields.',
    authorityNote:
      'False Claims Act = federal. Required field sets and vital-sign panels = primarily agency policy implementing complete clinical records. LVN documents within scope only.',
  },
  {
    id: 5,
    title: 'Common Documentation Errors & Fixes',
    subtitle: 'Learn from Frequent Audit Failures',
    narration: [
      'This page covers five frequent documentation errors identified in home health quality review and survey preparation. Recognizing and avoiding them protects patients, your professional standing, and the agency’s certification readiness.',
      'Error one: Vague or generic language. Phrases like “patient doing well,” “no complaints,” or “condition stable” tell reviewers little about what you assessed. Fix: use specific, measurable documentation — “Patient reports pain decreased from 6/10 to 3/10 since medication adjustment. Ambulating 50 feet with rolling walker, steady gait, no loss of balance.”',
      'Error two: Missing vital signs. Oxygen saturation and pain level are among the parameters most often omitted when notes are incomplete. Fix: obtain and enter the full vital-sign set at the beginning of every skilled visit after patient identification, unless a documented clinical reason applies under agency protocol.',
      'Error three: Copy-paste from previous notes. The EHR may allow pull-forward templates, but identical clinical language across consecutive visits suggests the clinician did not perform an individualized assessment. Every note must reflect that day’s encounter. Templates may structure fields; they must not clone clinical findings.',
      'Error four: Failure to document RN notification. When you encounter abnormal findings, condition changes, or concerns outside LVN independent management, notify the supervising RN and document who you called, when, what you reported, and what instructions you received. Missing notification documentation weakens the supervision trail required under federal RN oversight of LVN services.',
      'Error five: Late submission. Notes delayed beyond agency timelines are more likely to omit details because clinical recall degrades. Timely documentation supports accurate documentation. If you must stop documentation for a safety issue (e.g., patient decompensation), stabilize and notify per protocol first, then complete the note as soon as clinically appropriate.',
    ],
    keyPoints: [
      {
        icon: '❌',
        title: 'Vague Language',
        detail: '“Doing well” → use specific, measurable clinical observations',
      },
      {
        icon: '❌',
        title: 'Missing Vitals',
        detail: 'O2 sat and pain are commonly missed — obtain the full set first',
      },
      {
        icon: '❌',
        title: 'Copy-Paste Notes',
        detail: 'Cloned narrative suggests no individualized assessment',
      },
      {
        icon: '❌',
        title: 'No RN Notification',
        detail: 'Always document: who, when, what reported, instructions received',
      },
    ],
    svgScene: 'errors',
    hotspots: [
      {
        id: 'error-1',
        label: 'Vague → Specific',
        x: 30,
        y: 20,
        info: 'Replace “doing well” with objective measurements, functional observations, and patient quotes.',
      },
      {
        id: 'error-3',
        label: 'Clone → Original',
        x: 30,
        y: 48,
        info: 'Each note must reflect TODAY’s assessment. Pull-forward structure is OK; rewrite clinical content.',
      },
      {
        id: 'error-5',
        label: 'Late → Timely',
        x: 30,
        y: 76,
        info: 'Same-day documentation supports best recall and fewer omissions. Use secure downtime wisely.',
      },
    ],
    clinicalTip:
      'After completing each note, reread it as if you were a surveyor who has never met the patient. Does the note alone tell a complete clinical story within LVN scope? If not, add detail.',
    authorityNote:
      'Error patterns = quality/guidance + agency audit themes. RN notification trail supports federal supervision. No invented agency percentages or enforcement outcome claims.',
  },
  {
    id: 6,
    title: 'Co-Signature Workflow & RN Supervision',
    subtitle: 'The Documentation Chain of Command',
    narration: [
      'The co-signature workflow is how documentation expresses RN supervision of LVN services under 42 CFR § 484.115(c). Every LVN visit note you create must be reviewed and co-signed by a Registered Nurse per agency policy implementing that federal supervision requirement. Consistent co-signature is essential survey evidence of supervision.',
      'Step one (agency EHR workflow): complete your visit note and select “Submit for RN Review.” Submission locks further casual editing and routes the note to the assigned supervising RN’s queue. The submission timestamp is permanently recorded.',
      'Step two: the supervising RN is notified that your note is pending review. They read the clinical narrative, verify findings make sense, and check required fields. If concerns exist, they may flag the note for revision — unlocking it to you with specific feedback (agency workflow).',
      'Step three: once satisfied, the RN applies an electronic co-signature. This is a professional attestation that the RN reviewed the note against documentation and supervision standards. The co-signature timestamp is permanently recorded with yours.',
      'Step four: the co-signed note is locked. Neither you nor the RN should alter the original entry without a formal, timestamped addendum per agency medical-records policy. Locked records support integrity during audits.',
      'If the RN does not co-sign within the agency 48-hour window, the EHR escalates per agency policy (often to nursing leadership). Late co-signature patterns are primarily a supervisory issue — but your late submission can cascade into late co-signature, so timely LVN documentation protects the whole chain.',
    ],
    keyPoints: [
      {
        icon: '📝',
        title: 'Step 1: LVN Submits',
        detail: 'Complete note → Submit → locked & routed to RN queue',
      },
      {
        icon: '📤',
        title: 'Step 2: RN Notified',
        detail: 'RN reviews full narrative and required fields',
      },
      {
        icon: '✅',
        title: 'Step 3: RN Co-Signs',
        detail: 'Attestation of review — timestamp permanently recorded',
      },
      {
        icon: '🔒',
        title: 'Step 4: Record Locked',
        detail: 'Sealed original — changes via formal addendum only',
      },
    ],
    svgScene: 'cosign',
    hotspots: [
      {
        id: 'step-1',
        label: 'Submit',
        x: 50,
        y: 18,
        info: '“Submit for RN Review” locks your note and starts the agency co-sign clock.',
      },
      {
        id: 'step-3',
        label: 'RN Co-Signs',
        x: 50,
        y: 52,
        info: 'RN electronic signature attests review. Supports evidence of RN supervision under 42 CFR § 484.115(c).',
      },
      {
        id: 'step-4',
        label: 'Locked Record',
        x: 50,
        y: 78,
        info: 'After co-sign, the original is sealed. Corrections require a formal, timestamped addendum per agency policy.',
      },
    ],
    clinicalTip:
      'If the RN flags your note for revision, treat feedback as coaching. Correct specifically and re-submit promptly. Collaboration improves documentation quality.',
    authorityNote:
      'Federal: RN supervision of LVN services (42 CFR § 484.115(c)). EHR steps, 48-hour window, and escalation path = agency policy operationalizing supervision.',
  },
  {
    id: 7,
    title: 'Module Summary & Competency Check',
    subtitle: 'Knowledge Check vs Practical Competency',
    narration: [
      'You have completed the didactic portion of LVN-001. Consolidate the core knowledge areas before the assessment.',
      'You understand LVN role-based EHR access, the visit note workflow, and security practices that protect patient information. Access is limited to LVN-authorized functions so you do not enter OASIS or other out-of-scope assessment modules.',
      'You can apply the SOAP framework: Subjective (patient-reported), Objective (findings/measurements), Assessment (reasoning within LVN scope connecting S and O), and Plan (next steps and supervisory communication under the existing plan of care).',
      'You can state Care Indeed timeline expectations: same-day documentation target, 24-hour agency maximum for note completion, and 48-hour RN co-signature window after submit — and you can distinguish those agency clocks from the federal RN-supervision requirement.',
      'You can identify frequent errors — vague language, missing vitals, cloned notes, missing RN notification, and late submission — and state the corrective action for each.',
      'You understand co-signature as the documentation expression of RN supervision under 42 CFR § 484.115(c), enabled by timely, complete LVN notes.',
      'Next is a 10-question knowledge assessment. Passing score is 80% (8 of 10). Passing validates knowledge only. Practical competency still requires observed demonstration (for example, a mock visit note in the training environment) and authorized sign-off per agency policy. You may review and retry if you score below 80%.',
    ],
    keyPoints: [
      {
        icon: '✅',
        title: 'EHR Navigation',
        detail: 'Role-based dashboard, visit note workflow, security',
      },
      {
        icon: '✅',
        title: 'SOAP Mastery',
        detail: 'Four sections, LVN-scope reasoning, audit-ready narratives',
      },
      {
        icon: '✅',
        title: 'Timeline Compliance',
        detail: 'Agency same-day / 24h / 48h clocks + federal supervision',
      },
      {
        icon: '✅',
        title: 'Error Prevention',
        detail: 'Five common errors with actionable fixes',
      },
    ],
    svgScene: 'summary',
    hotspots: [
      {
        id: 'sum-knowledge',
        label: 'Knowledge Quiz',
        x: 28,
        y: 35,
        info: 'This module’s quiz confirms cognitive understanding of EHR documentation rules. It does not by itself prove bedside competency.',
      },
      {
        id: 'sum-demo',
        label: 'Return Demo',
        x: 50,
        y: 55,
        info: 'Observed mock note (or equivalent) in the training EHR evaluates completeness and accuracy under supervision.',
      },
      {
        id: 'sum-signoff',
        label: 'Authorized Sign-Off',
        x: 72,
        y: 35,
        info: 'Practical competency is complete only after authorized sign-off per agency policy — separate from quiz pass.',
      },
    ],
    clinicalTip:
      'Competency for LVN-001 = knowledge assessment + observed documentation performance + authorized sign-off as required by agency policy. Do not treat quiz pass as full clinical competency.',
    authorityNote:
      'Quiz = knowledge only. Demonstration and sign-off = agency competency process. Federal supervision and record rules still apply in live practice.',
  },
];

// ─── QUIZ (balanced A2 B3 C3 D2) ─────────────────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Under 42 CFR § 484.115(c), LVN services in home health must be provided under the supervision of which professional?',
    options: [
      'Physician only (no nursing supervision required)',
      'Registered Nurse',
      'Director of Nursing exclusively, not a staff RN',
      'Physical Therapist',
    ],
    correct: 1, // B
    rationale:
      'Federal requirement: CMS requires LVN services be provided under the supervision of a Registered Nurse per 42 CFR § 484.115(c). Agency co-signature workflows operationalize that supervision in the EHR.',
  },
  {
    id: 2,
    stem: 'Which section of the SOAP note is MOST often scrutinized to evaluate clinical reasoning during documentation review?',
    options: [
      'Subjective only',
      'Objective only',
      'Assessment',
      'Header demographics',
    ],
    correct: 2, // C
    rationale:
      'The Assessment section shows how the LVN connects subjective reports to objective findings within scope. Reviewers often focus here to evaluate clinical reasoning (professional guidance / survey practice — not a separate statute).',
  },
  {
    id: 3,
    stem: 'What is Care Indeed’s agency documentation timeline standard for LVN visit note completion?',
    options: [
      'Same calendar day (target), 24 hours (maximum)',
      'Within 1 hour of visit only',
      'Within 72 hours is always acceptable',
      'No timeline — complete whenever convenient',
    ],
    correct: 0, // A
    rationale:
      'Agency policy: same-day documentation is the target; 24 hours is the agency maximum. These hour clocks are Care Indeed policy supporting timely clinical records, not a universal federal hour mandate.',
  },
  {
    id: 4,
    stem: 'Which vital sign elements are MOST commonly omitted when LVN visit notes are incomplete?',
    options: [
      'Blood pressure only',
      'Temperature only',
      'Oxygen saturation and pain level',
      'Pulse rate only',
    ],
    correct: 2, // C
    rationale:
      'Quality review commonly finds oxygen saturation and pain level missing when notes are incomplete. Obtain and document the full required vital-sign set each skilled visit per agency standards.',
  },
  {
    id: 5,
    stem: 'An LVN submits a visit note. What is Care Indeed’s agency RN co-signature window after submission?',
    options: [
      '24 hours',
      '48 hours',
      '7 calendar days',
      'No co-signature is required for LVN notes',
    ],
    correct: 1, // B
    rationale:
      'Agency policy expects the supervising RN to co-sign within 48 hours of LVN submission. Federal law requires RN supervision of LVN services; the 48-hour window is how the agency times that review.',
  },
  {
    id: 6,
    stem: 'An LVN finds a patient’s blood pressure is 182/96 after providing ordered care. What MUST be documented regarding escalation?',
    options: [
      'Only the blood pressure reading',
      'The reading and a note to recheck next visit only',
      'RN notification — who was called, when, what was reported, and instructions received',
      'A diagnosis of hypertensive emergency entered by the LVN',
    ],
    correct: 2, // C
    rationale:
      'Abnormal findings require RN notification (and further chain-of-command per agency protocol). Document who, when, what reported, and instructions received. LVNs do not independently diagnose or rewrite the plan of care.',
  },
  {
    id: 7,
    stem: 'Why is copy-pasting identical clinical narrative from a previous visit note a documentation deficiency?',
    options: [
      'It suggests the clinician did not perform an individualized assessment for today’s encounter',
      'It always saves the agency money',
      'It is a problem only if the patient’s name is wrong',
      'It uses too much storage space',
    ],
    correct: 0, // A
    rationale:
      'Cloned notes suggest no individualized assessment. Reviewers may compare consecutive notes for identical language as evidence of inadequate skilled visit documentation.',
  },
  {
    id: 8,
    stem: 'After an RN co-signs an LVN visit note, what happens to the original record under agency EHR integrity rules?',
    options: [
      'It remains freely editable for 7 days',
      'It can be modified silently by the DON',
      'It is automatically deleted after 30 days',
      'It is locked — changes require a formal, timestamped addendum',
    ],
    correct: 3, // D
    rationale:
      'Co-signed notes are locked to preserve integrity. Post–co-signature changes require a formal, timestamped addendum per agency medical-records policy.',
  },
  {
    id: 9,
    stem: 'When enabled, EHR GPS verification is primarily used to support which documentation element?',
    options: [
      'Patient medical diagnosis coding',
      'Visit time-in and time-out verification',
      'Automatic wound staging by the LVN',
      'Physician e-prescribing',
    ],
    correct: 1, // B
    rationale:
      'GPS geo-tagging (when configured) helps verify actual visit times. Falsifying time-in/time-out can implicate federal fraud frameworks such as the False Claims Act. GPS does not authorize LVN diagnosis, staging, or prescribing.',
  },
  {
    id: 10,
    stem: 'Which statement BEST describes the purpose of the LVN’s role-based EHR access?',
    options: [
      'To reduce the number of patients on the LVN’s schedule',
      'To lower EHR licensing costs only',
      'To hide all patient names from the LVN',
      'To prevent scope-of-practice documentation errors (e.g., no OASIS completion by LVN)',
    ],
    correct: 3, // D
    rationale:
      'Role-based access limits LVNs to authorized documentation functions and helps prevent inadvertent out-of-scope entries such as OASIS completion, which is not an LVN function.',
  },
];

// Distribution check: A=2 (Q3,Q7), B=3 (Q1,Q5,Q9), C=3 (Q2,Q4,Q6), D=2 (Q8,Q10)

// ─── STYLES ──────────────────────────────────────────────────────────────────
const theme = {
  primary: '#0D9488',
  primaryDark: '#0F766E',
  primaryLight: '#CCFBF1',
  accent: '#0891B2',
  bg: '#F0FDFA',
  panel: '#FFFFFF',
  text: '#134E4A',
  muted: '#5B7C7A',
  border: '#99F6E4',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#059669',
  dark: '#042F2E',
  quizBg: '#ECFDF5',
};

// ─── SVG SCENES ──────────────────────────────────────────────────────────────
function HotspotDots({
  hotspots,
  activeHotspot,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
}) {
  return (
    <>
      {hotspots.map((hs) => {
        const active = activeHotspot === hs.id;
        return (
          <g
            key={hs.id}
            transform={`translate(${(hs.x / 100) * 400}, ${(hs.y / 100) * 380})`}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onHotspot(active ? null : hs.id);
            }}
          >
            <circle
              r={active ? 16 : 12}
              fill={active ? theme.primary : 'rgba(13,148,136,0.25)'}
              stroke={theme.primary}
              strokeWidth={2}
            >
              {!active && (
                <animate
                  attributeName="r"
                  values="12;15;12"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle r={5} fill={active ? '#fff' : theme.primary} />
            <text
              y={28}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={theme.dark}
            >
              {hs.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function FeedbackBanner({
  hotspots,
  activeHotspot,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
}) {
  const hs = hotspots.find((h) => h.id === activeHotspot);
  if (!hs) {
    return (
      <text x={200} y={368} textAnchor="middle" fontSize={11} fill={theme.muted}>
        Tap a glowing hotspot for instructional feedback
      </text>
    );
  }
  return (
    <g>
      <rect
        x={16}
        y={330}
        width={368}
        height={42}
        rx={8}
        fill={theme.primaryDark}
        opacity={0.95}
      />
      <text x={28} y={348} fontSize={11} fontWeight={700} fill="#fff">
        {hs.label}
      </text>
      <foreignObject x={28} y={352} width={344} height={18}>
        <div
          style={{
            color: '#CCFBF1',
            fontSize: 10,
            lineHeight: 1.3,
            fontFamily: 'system-ui,sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={hs.info}
        >
          {hs.info}
        </div>
      </foreignObject>
    </g>
  );
}

function SceneDashboard({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const focus = activeHotspot;
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="LVN EHR dashboard scene">
      <defs>
        <linearGradient id="dashBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#CFFAFE" />
        </linearGradient>
      </defs>
      <rect width={400} height={380} fill="url(#dashBg)" rx={12} />
      <rect x={20} y={20} width={360} height={300} rx={10} fill="#fff" stroke={theme.border} />
      {/* Title bar */}
      <rect x={20} y={20} width={360} height={36} rx={10} fill={theme.primary} />
      <rect x={20} y={40} width={360} height={16} fill={theme.primary} />
      <text x={36} y={44} fill="#fff" fontSize={13} fontWeight={700}>
        Care Indeed EHR — LVN Workspace
      </text>
      <text x={340} y={44} fill="#CCFBF1" fontSize={10}>
        LVN role
      </text>
      {/* Sidebar */}
      <rect
        x={28}
        y={64}
        width={100}
        height={244}
        rx={8}
        fill={focus === 'dashboard-nav' ? theme.primaryLight : '#F8FAFC'}
        stroke={focus === 'dashboard-nav' ? theme.primary : theme.border}
        strokeWidth={focus === 'dashboard-nav' ? 2 : 1}
      />
      <text x={40} y={86} fontSize={11} fontWeight={700} fill={theme.dark}>
        Dashboard
      </text>
      {['Schedule', 'Visit Queue', 'Notes', 'Messages'].map((label, i) => (
        <g key={label}>
          <rect
            x={36}
            y={98 + i * 36}
            width={84}
            height={28}
            rx={6}
            fill={i === 0 ? theme.primary : '#fff'}
            stroke={theme.border}
          />
          <text
            x={78}
            y={116 + i * 36}
            textAnchor="middle"
            fontSize={10}
            fill={i === 0 ? '#fff' : theme.text}
          >
            {label}
          </text>
        </g>
      ))}
      {/* Visit queue */}
      <rect
        x={140}
        y={64}
        width={228}
        height={110}
        rx={8}
        fill={focus === 'visit-queue' ? theme.primaryLight : '#F8FAFC'}
        stroke={focus === 'visit-queue' ? theme.primary : theme.border}
        strokeWidth={focus === 'visit-queue' ? 2 : 1}
      />
      <text x={152} y={84} fontSize={11} fontWeight={700} fill={theme.dark}>
        Today’s Visit Queue
      </text>
      {[
        { name: 'M. Rivera', st: '#059669', t: 'Complete' },
        { name: 'J. Chen', st: '#D97706', t: 'In progress' },
        { name: 'A. Brooks', st: '#DC2626', t: 'Note due' },
      ].map((row, i) => (
        <g key={row.name}>
          <circle cx={160} cy={104 + i * 22} r={5} fill={row.st} />
          <text x={174} y={108 + i * 22} fontSize={11} fill={theme.text}>
            {row.name}
          </text>
          <text x={300} y={108 + i * 22} fontSize={10} fill={theme.muted}>
            {row.t}
          </text>
        </g>
      ))}
      {/* Notes panel */}
      <rect
        x={140}
        y={184}
        width={228}
        height={124}
        rx={8}
        fill={focus === 'note-panel' ? theme.primaryLight : '#F8FAFC'}
        stroke={focus === 'note-panel' ? theme.primary : theme.border}
        strokeWidth={focus === 'note-panel' ? 2 : 1}
      />
      <text x={152} y={206} fontSize={11} fontWeight={700} fill={theme.dark}>
        Visit Notes
      </text>
      <rect x={152} y={218} width={90} height={28} rx={6} fill={theme.primary} />
      <text x={197} y={236} textAnchor="middle" fontSize={10} fill="#fff">
        Start note
      </text>
      <rect x={252} y={218} width={100} height={28} rx={6} fill="#fff" stroke={theme.primary} />
      <text x={302} y={236} textAnchor="middle" fontSize={10} fill={theme.primary}>
        Continue draft
      </text>
      <text x={152} y={268} fontSize={10} fill={theme.muted}>
        No OASIS / comprehensive assessment modules
      </text>
      <text x={152} y={286} fontSize={10} fill={theme.muted}>
        Routes to supervising RN after submit
      </text>
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneSoap({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const blocks = [
    { id: 'soap-s', letter: 'S', title: 'Subjective', color: '#0EA5E9', y: 28 },
    { id: 'soap-o', letter: 'O', title: 'Objective', color: '#10B981', y: 100 },
    { id: 'soap-a', letter: 'A', title: 'Assessment', color: '#8B5CF6', y: 172 },
    { id: 'soap-p', letter: 'P', title: 'Plan', color: '#F59E0B', y: 244 },
  ];
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="SOAP note structure scene">
      <rect width={400} height={380} fill="#F5F3FF" rx={12} />
      <text x={200} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        SOAP Visit Note Assembly
      </text>
      {blocks.map((b) => {
        const active = activeHotspot === b.id;
        return (
          <g
            key={b.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onHotspot(active ? null : b.id)}
          >
            <rect
              x={48}
              y={b.y}
              width={304}
              height={62}
              rx={10}
              fill={active ? b.color : '#fff'}
              stroke={b.color}
              strokeWidth={2}
              opacity={active ? 0.95 : 1}
            />
            <circle cx={78} cy={b.y + 31} r={18} fill={active ? '#fff' : b.color} />
            <text
              x={78}
              y={b.y + 36}
              textAnchor="middle"
              fontSize={14}
              fontWeight={800}
              fill={active ? b.color : '#fff'}
            >
              {b.letter}
            </text>
            <text
              x={110}
              y={b.y + 28}
              fontSize={13}
              fontWeight={700}
              fill={active ? '#fff' : theme.dark}
            >
              {b.title}
            </text>
            <text x={110} y={b.y + 46} fontSize={10} fill={active ? '#F8FAFC' : theme.muted}>
              {active
                ? hotspots.find((h) => h.id === b.id)?.info.slice(0, 48) + '…'
                : 'Click to expand clinical expectations'}
            </text>
          </g>
        );
      })}
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneTimeline({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const angle = activeHotspot === 'clock-center' ? 220 : 140;
  const rad = ((angle - 90) * Math.PI) / 180;
  const hx = 200 + Math.cos(rad) * 48;
  const hy = 110 + Math.sin(rad) * 48;
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="Documentation timeline scene">
      <rect width={400} height={380} fill="#FFF7ED" rx={12} />
      <text x={200} y={22} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        Agency Documentation Clock
      </text>
      {/* Clock */}
      <circle
        cx={200}
        cy={110}
        r={70}
        fill={activeHotspot === 'clock-center' ? '#FEF3C7' : '#fff'}
        stroke={theme.warning}
        strokeWidth={4}
      />
      <circle cx={200} cy={110} r={4} fill={theme.dark} />
      <line x1={200} y1={110} x2={hx} y2={hy} stroke={theme.primary} strokeWidth={3} strokeLinecap="round" />
      <line x1={200} y1={110} x2={200} y2={70} stroke={theme.dark} strokeWidth={2} strokeLinecap="round" />
      <text x={200} y={195} textAnchor="middle" fontSize={10} fill={theme.muted}>
        Federal: timely records + RN supervision
      </text>
      {/* Milestones */}
      {[
        {
          id: 'milestone-1',
          y: 220,
          title: 'Same-day target (agency)',
          detail: 'Complete before end of calendar day',
          color: theme.success,
        },
        {
          id: 'milestone-2',
          y: 270,
          title: '24h max note / 48h RN co-sign (agency)',
          detail: 'Late flags compress the supervision chain',
          color: theme.warning,
        },
      ].map((m) => {
        const active = activeHotspot === m.id || (m.id === 'milestone-1' && activeHotspot === 'clock-center');
        return (
          <g key={m.id} style={{ cursor: 'pointer' }} onClick={() => onHotspot(activeHotspot === m.id ? null : m.id)}>
            <rect
              x={40}
              y={m.y}
              width={320}
              height={42}
              rx={8}
              fill={activeHotspot === m.id ? m.color : '#fff'}
              stroke={m.color}
              strokeWidth={2}
            />
            <text
              x={56}
              y={m.y + 18}
              fontSize={12}
              fontWeight={700}
              fill={activeHotspot === m.id ? '#fff' : theme.dark}
            >
              {m.title}
            </text>
            <text
              x={56}
              y={m.y + 34}
              fontSize={10}
              fill={activeHotspot === m.id ? '#FFFBEB' : theme.muted}
            >
              {m.detail}
            </text>
          </g>
        );
      })}
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneFields({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const rows = [
    { id: 'field-time', label: 'Time In / Time Out', req: true, sample: '09:12 – 09:48 (actual)' },
    { id: 'field-vitals', label: 'Vital Signs Panel', req: true, sample: 'T · P · R · BP · SpO₂ · Pain' },
    { id: 'field-narrative', label: 'SOAP Clinical Narrative', req: true, sample: 'Skilled, specific, in-scope' },
  ];
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="LVN required fields scene">
      <rect width={400} height={380} fill="#EFF6FF" rx={12} />
      <text x={200} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        LVN Visit Note — Required Fields
      </text>
      <rect x={36} y={40} width={328} height={270} rx={10} fill="#fff" stroke="#BFDBFE" />
      <rect x={36} y={40} width={328} height={32} rx={10} fill="#1D4ED8" />
      <rect x={36} y={56} width={328} height={16} fill="#1D4ED8" />
      <text x={52} y={62} fill="#fff" fontSize={12} fontWeight={700}>
        Patient: verified ID · MRN matched
      </text>
      {rows.map((r, i) => {
        const active = activeHotspot === r.id;
        return (
          <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onHotspot(active ? null : r.id)}>
            <rect
              x={52}
              y={88 + i * 70}
              width={296}
              height={58}
              rx={8}
              fill={active ? theme.primaryLight : '#F8FAFC'}
              stroke={active ? theme.primary : '#E2E8F0'}
              strokeWidth={active ? 2 : 1}
            />
            <text x={68} y={112 + i * 70} fontSize={12} fontWeight={700} fill={theme.dark}>
              {r.label} {r.req ? '● required' : ''}
            </text>
            <text x={68} y={130 + i * 70} fontSize={11} fill={theme.muted}>
              {r.sample}
            </text>
          </g>
        );
      })}
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneErrors({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const cards = [
    {
      id: 'error-1',
      bad: '“Patient doing well”',
      good: 'Pain 3/10; amb 50 ft w/ RW',
      y: 40,
    },
    {
      id: 'error-3',
      bad: 'Cloned prior note',
      good: 'Today’s unique findings',
      y: 140,
    },
    {
      id: 'error-5',
      bad: 'Submitted day 3',
      good: 'Same-day / ≤24h agency',
      y: 240,
    },
  ];
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="Documentation error correction scene">
      <rect width={400} height={380} fill="#FEF2F2" rx={12} />
      <text x={200} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        Error → Fix Toggle
      </text>
      {cards.map((c) => {
        const active = activeHotspot === c.id;
        return (
          <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => onHotspot(active ? null : c.id)}>
            <rect
              x={30}
              y={c.y}
              width={150}
              height={80}
              rx={10}
              fill={active ? '#FECACA' : '#fff'}
              stroke={theme.danger}
              strokeWidth={2}
            />
            <text x={105} y={c.y + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={theme.danger}>
              Avoid
            </text>
            <text x={105} y={c.y + 52} textAnchor="middle" fontSize={11} fill={theme.dark}>
              {c.bad}
            </text>
            <text x={200} y={c.y + 48} textAnchor="middle" fontSize={18} fill={theme.muted}>
              →
            </text>
            <rect
              x={220}
              y={c.y}
              width={150}
              height={80}
              rx={10}
              fill={active ? '#A7F3D0' : '#fff'}
              stroke={theme.success}
              strokeWidth={2}
            />
            <text x={295} y={c.y + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={theme.success}>
              Prefer
            </text>
            <text x={295} y={c.y + 52} textAnchor="middle" fontSize={11} fill={theme.dark}>
              {c.good}
            </text>
          </g>
        );
      })}
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneCosign({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const steps = [
    { id: 'step-1', label: '1. LVN Submit', y: 50, color: theme.primary },
    { id: 'step-2', label: '2. RN Review', y: 120, color: theme.accent },
    { id: 'step-3', label: '3. RN Co-Sign', y: 190, color: '#8B5CF6' },
    { id: 'step-4', label: '4. Record Locked', y: 260, color: theme.success },
  ];
  // step-2 is visual only; hotspots map to 1,3,4 from content
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="Co-signature workflow scene">
      <rect width={400} height={380} fill="#F0F9FF" rx={12} />
      <text x={200} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        Co-Signature Chain (Federal supervision + agency flow)
      </text>
      {steps.map((s, i) => {
        const hsId = s.id === 'step-2' ? null : s.id;
        const active = hsId != null && activeHotspot === hsId;
        return (
          <g key={s.id}>
            {i < steps.length - 1 && (
              <line
                x1={200}
                y1={s.y + 36}
                x2={200}
                y2={steps[i + 1].y}
                stroke={theme.border}
                strokeWidth={3}
              />
            )}
            <g
              style={{ cursor: hsId ? 'pointer' : 'default' }}
              onClick={() => {
                if (!hsId) return;
                onHotspot(active ? null : hsId);
              }}
            >
              <rect
                x={100}
                y={s.y}
                width={200}
                height={40}
                rx={20}
                fill={active ? s.color : '#fff'}
                stroke={s.color}
                strokeWidth={2}
              />
              <text
                x={200}
                y={s.y + 25}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={active ? '#fff' : theme.dark}
              >
                {s.label}
              </text>
            </g>
          </g>
        );
      })}
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function SceneSummary({ activeHotspot, onHotspot, hotspots }: SceneProps) {
  const nodes = [
    { id: 'sum-knowledge', label: 'Knowledge\nQuiz', x: 90, y: 120, color: theme.primary },
    { id: 'sum-demo', label: 'Observed\nDemo', x: 200, y: 200, color: theme.warning },
    { id: 'sum-signoff', label: 'Authorized\nSign-Off', x: 310, y: 120, color: theme.success },
  ];
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" role="img" aria-label="Competency pathway summary scene">
      <rect width={400} height={380} fill="#ECFDF5" rx={12} />
      <text x={200} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill={theme.dark}>
        Competency Pathway — Not Quiz Alone
      </text>
      <line x1={90} y1={120} x2={200} y2={200} stroke={theme.border} strokeWidth={3} />
      <line x1={200} y1={200} x2={310} y2={120} stroke={theme.border} strokeWidth={3} />
      {nodes.map((n) => {
        const active = activeHotspot === n.id;
        const lines = n.label.split('\n');
        return (
          <g
            key={n.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onHotspot(active ? null : n.id)}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={active ? 48 : 42}
              fill={active ? n.color : '#fff'}
              stroke={n.color}
              strokeWidth={3}
            />
            {lines.map((ln, i) => (
              <text
                key={ln}
                x={n.x}
                y={n.y + (i === 0 ? -4 : 12)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={active ? '#fff' : theme.dark}
              >
                {ln}
              </text>
            ))}
          </g>
        );
      })}
      <text x={200} y={280} textAnchor="middle" fontSize={11} fill={theme.muted}>
        80% quiz pass = knowledge only
      </text>
      <text x={200} y={298} textAnchor="middle" fontSize={11} fill={theme.muted}>
        Live competency requires demo + sign-off (agency policy)
      </text>
      <HotspotDots hotspots={hotspots} activeHotspot={activeHotspot} onHotspot={onHotspot} />
      <FeedbackBanner hotspots={hotspots} activeHotspot={activeHotspot} />
    </svg>
  );
}

function InstructionalScene({
  scene,
  activeHotspot,
  onHotspot,
  hotspots,
}: {
  scene: string;
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
  hotspots: Hotspot[];
}) {
  const props: SceneProps = { activeHotspot, onHotspot, hotspots };
  switch (scene) {
    case 'dashboard':
      return <SceneDashboard {...props} />;
    case 'soap':
      return <SceneSoap {...props} />;
    case 'timeline':
      return <SceneTimeline {...props} />;
    case 'fields':
      return <SceneFields {...props} />;
    case 'errors':
      return <SceneErrors {...props} />;
    case 'cosign':
      return <SceneCosign {...props} />;
    case 'summary':
      return <SceneSummary {...props} />;
    default:
      return (
        <svg viewBox="0 0 400 380" width="100%" height="100%">
          <rect width={400} height={380} fill={theme.bg} rx={12} />
          <text x={200} y={190} textAnchor="middle" fill={theme.muted}>
            Scene unavailable
          </text>
        </svg>
      );
  }
}

// ─── MAIN MODULE ─────────────────────────────────────────────────────────────
export default function LVN001EHRDocumentationModule() {
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'results'>('learn');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const page = PAGES[pageIndex];
  const progressPct = useMemo(
    () =>
      mode === 'learn'
        ? Math.round(((pageIndex + 1) / PAGES.length) * 100)
        : mode === 'quiz'
          ? Math.round((Object.keys(answers).length / QUIZ.length) * 100)
          : 100,
    [mode, pageIndex, answers],
  );

  const scoreData = useMemo(() => {
    let correct = 0;
    QUIZ.forEach((q) => {
      if (answers[q.id] === q.correct) correct += 1;
    });
    const pct = Math.round((correct / QUIZ.length) * 100);
    return { correct, pct, passed: pct >= MODULE_META.passing };
  }, [answers]);

  const goNext = useCallback(() => {
    setActiveHotspot(null);
    if (pageIndex < PAGES.length - 1) setPageIndex((p) => p + 1);
    else setMode('quiz');
  }, [pageIndex]);

  const goPrev = useCallback(() => {
    setActiveHotspot(null);
    if (mode === 'quiz') {
      setMode('learn');
      setPageIndex(PAGES.length - 1);
      return;
    }
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  }, [mode, pageIndex]);

  const selectAnswer = (qid: number, opt: number) => {
    if (quizSubmitted && !reviewMode) return;
    if (quizSubmitted && reviewMode) return;
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < QUIZ.length) return;
    setQuizSubmitted(true);
    setMode('results');
  };

  const retryQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setReviewMode(false);
    setMode('quiz');
  };

  const reviewQuiz = () => {
    setReviewMode(true);
    setMode('quiz');
  };

  const backToLearn = () => {
    setMode('learn');
    setPageIndex(0);
    setActiveHotspot(null);
  };

  // ─── QUIZ UI ──────────────────────────────────────────────────────────────
  if (mode === 'quiz') {
    return (
      <div
        style={{
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          color: theme.text,
          background: theme.quizBg,
          minHeight: '100vh',
          padding: 20,
        }}
      >
        <header style={{ maxWidth: 900, margin: '0 auto 16px' }}>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 4 }}>
            {MODULE_META.id} · v{MODULE_META.version} · {MODULE_META.status}
          </div>
          <h1 style={{ margin: 0, fontSize: 22, color: theme.dark }}>
            Knowledge Assessment — {MODULE_META.title}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: theme.muted, maxWidth: 720 }}>
            10 application questions · 80% to pass · Validates <strong>knowledge only</strong>.
            Observed demonstration and authorized sign-off remain separate for practical competency.
          </p>
          <div
            style={{
              marginTop: 12,
              height: 8,
              background: '#D1FAE5',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: theme.primary,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 14 }}>
          {QUIZ.map((q, idx) => {
            const selected = answers[q.id];
            const showKey = reviewMode && quizSubmitted;
            return (
              <div
                key={q.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                  Question {idx + 1} of {QUIZ.length}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.45 }}>{q.stem}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const isSel = selected === oi;
                    const isCorrect = q.correct === oi;
                    let border = theme.border;
                    let bg = '#fff';
                    if (showKey && isCorrect) {
                      border = theme.success;
                      bg = '#ECFDF5';
                    } else if (showKey && isSel && !isCorrect) {
                      border = theme.danger;
                      bg = '#FEF2F2';
                    } else if (isSel) {
                      border = theme.primary;
                      bg = theme.primaryLight;
                    }
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => selectAnswer(q.id, oi)}
                        disabled={showKey}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: `2px solid ${border}`,
                          background: bg,
                          cursor: showKey ? 'default' : 'pointer',
                          fontSize: 14,
                          color: theme.dark,
                        }}
                      >
                        <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</strong>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showKey && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 10,
                      borderRadius: 8,
                      background: '#F0FDFA',
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: theme.text,
                    }}
                  >
                    <strong>Rationale: </strong>
                    {q.rationale}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            maxWidth: 900,
            margin: '20px auto 40px',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            style={btnSecondary}
          >
            ← Back to module
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {reviewMode ? (
              <button type="button" onClick={() => setMode('results')} style={btnPrimary}>
                Back to results
              </button>
            ) : (
              <button
                type="button"
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < QUIZ.length}
                style={{
                  ...btnPrimary,
                  opacity: Object.keys(answers).length < QUIZ.length ? 0.5 : 1,
                }}
              >
                Submit answers ({Object.keys(answers).length}/{QUIZ.length})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS UI ───────────────────────────────────────────────────────────
  if (mode === 'results') {
    return (
      <div
        style={{
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          minHeight: '100vh',
          background: theme.bg,
          padding: 24,
          color: theme.text,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 8px 24px rgba(13,148,136,0.08)',
          }}
        >
          <div style={{ fontSize: 12, color: theme.muted }}>
            {MODULE_META.id} · v{MODULE_META.version}
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 24, color: theme.dark }}>
            {scoreData.passed ? 'Knowledge check passed' : 'Knowledge check not yet passed'}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: theme.muted }}>
            Score: <strong style={{ color: theme.dark }}>{scoreData.pct}%</strong> (
            {scoreData.correct}/{QUIZ.length} correct). Passing threshold is {MODULE_META.passing}%.
          </p>
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              background: scoreData.passed ? '#ECFDF5' : '#FEF3C7',
              border: `1px solid ${scoreData.passed ? '#A7F3D0' : '#FCD34D'}`,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {scoreData.passed ? (
              <>
                You met the knowledge standard for this module. This result validates{' '}
                <strong>cognitive understanding only</strong>. Practical competency still requires
                observed demonstration (e.g., mock visit note) and authorized sign-off per agency
                policy.
              </>
            ) : (
              <>
                Review the module content and rationales, then retry the quiz. Coaching and
                re-assessment follow agency education policy. Quiz failure alone is not a clinical
                competency determination.
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <button type="button" onClick={reviewQuiz} style={btnSecondary}>
              Review answers
            </button>
            <button type="button" onClick={retryQuiz} style={btnSecondary}>
              Retry quiz
            </button>
            <button type="button" onClick={backToLearn} style={btnPrimary}>
              Return to learning pages
            </button>
          </div>
          {scoreData.passed && (
            <div
              style={{
                marginTop: 20,
                fontSize: 12,
                color: theme.muted,
                borderTop: `1px solid ${theme.border}`,
                paddingTop: 12,
              }}
            >
              Completion recorded for knowledge assessment · {MODULE_META.title} · CMS basis{' '}
              {MODULE_META.cms}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LEARN UI ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        color: theme.text,
        background: theme.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          background: `linear-gradient(120deg, ${theme.primaryDark}, ${theme.accent})`,
          color: '#fff',
          padding: '14px 20px',
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.9, letterSpacing: 0.3 }}>
          {MODULE_META.id} · {MODULE_META.track} · v{MODULE_META.version} · {MODULE_META.status}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>{MODULE_META.title}</h1>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
              {MODULE_META.cms} · Policy: {MODULE_META.policy} · {MODULE_META.duration}
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Page {pageIndex + 1} of {MODULE_META.pages}
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            height: 6,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: '#fff',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
          gap: 0,
          minHeight: 0,
        }}
        className="lvn001-split"
      >
        {/* LEFT — content */}
        <section
          style={{
            padding: '20px 22px 100px',
            overflow: 'auto',
            background: theme.panel,
            borderRight: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ fontSize: 12, color: theme.primary, fontWeight: 700, marginBottom: 4 }}>
            {page.subtitle}
          </div>
          <h2 style={{ margin: '0 0 14px', fontSize: 22, color: theme.dark, lineHeight: 1.25 }}>
            {page.title}
          </h2>

          {page.authorityNote && (
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.45,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#F0FDFA',
                border: `1px solid ${theme.border}`,
                marginBottom: 14,
                color: theme.text,
              }}
            >
              <strong>Authority map: </strong>
              {page.authorityNote}
            </div>
          )}

          {page.narration.map((para, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 12px',
                fontSize: 14.5,
                lineHeight: 1.6,
                color: theme.text,
              }}
            >
              {para}
            </p>
          ))}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            {page.keyPoints.map((kp) => (
              <div
                key={kp.title}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: 12,
                  background: theme.bg,
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 4 }}>
                  {kp.icon}{' '}
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.dark }}>{kp.title}</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, color: theme.muted }}>{kp.detail}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 10,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <strong>Clinical tip: </strong>
            {page.clinicalTip}
          </div>
        </section>

        {/* RIGHT — SVG scene */}
        <section
          style={{
            padding: '16px 16px 100px',
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 420,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, marginBottom: 8 }}>
            Interactive scene — select hotspots
          </div>
          <div style={{ flex: 1, minHeight: 380 }}>
            <InstructionalScene
              scene={page.svgScene}
              activeHotspot={activeHotspot}
              onHotspot={setActiveHotspot}
              hotspots={page.hotspots}
            />
          </div>
          {activeHotspot && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: theme.primaryDark,
                color: '#fff',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {page.hotspots.find((h) => h.id === activeHotspot)?.label}
              </div>
              {page.hotspots.find((h) => h.id === activeHotspot)?.info}
            </div>
          )}
        </section>
      </main>

      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.96)',
          borderTop: `1px solid ${theme.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <button type="button" onClick={goPrev} disabled={pageIndex === 0} style={btnSecondary}>
          ← Previous
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {PAGES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              title={p.title}
              onClick={() => {
                setPageIndex(i);
                setActiveHotspot(null);
              }}
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                border: 'none',
                padding: 0,
                background: i === pageIndex ? theme.primary : '#CBD5E1',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        {pageIndex < PAGES.length - 1 ? (
          <button type="button" onClick={goNext} style={btnPrimary}>
            Next →
          </button>
        ) : (
          <button type="button" onClick={() => setMode('quiz')} style={btnPrimary}>
            Start Quiz →
          </button>
        )}
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .lvn001-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: `linear-gradient(120deg, ${theme.primaryDark}, ${theme.accent})`,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 18px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  background: '#fff',
  color: theme.dark,
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  padding: '10px 18px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};
