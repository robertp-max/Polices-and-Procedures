/**
 * LVN-012 — LVN-Specific Skills Check-offs per CA Practice Act
 * Track: LVN — Licensed Vocational Nurse
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record: 6a558d9a3463cd690af8d637
 *
 * Regulatory framing (source-aligned, Level 5 labeled):
 * - Federal: 42 CFR § 484.115 (personnel qualifications / competency expectation)
 * - California: B&P § 2859 (LVN scope of practice)
 * - Agency policy: HR-TC-001 Training & Competency (attempt limits, checklists, escalation)
 *
 * IMPORTANT: Passing the knowledge quiz validates knowledge only.
 * Observed skills demonstration, rubric scoring, remediation, and authorized
 * sign-off remain separate requirements for practical competency.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { LVNLessonNavigation, LVNNarrationFooter } from './shared/LVNModuleShell';

// ─── MODULE META ─────────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-012',
  title: 'LVN-Specific Skills Check-offs per CA Practice Act',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  citations: [
    '42 CFR § 484.115 (personnel qualifications)',
    'CA B&P § 2859 (LVN scope of practice)',
    'Agency Policy HR-TC-001 (Training & Competency)',
  ],
  recordId: '6a558d9a3463cd690af8d637',
} as const;

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  info: string;
}

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  narration: string[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  hotspots: Hotspot[];
  scene: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  /** 0=A, 1=B, 2=C, 3=D */
  correct: number;
  rationale: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#D97706',
  primaryDark: '#B45309',
  secondary: '#FFFBEB',
  accent: '#7C3AED',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#FDE68A',
  card: '#FFFFFF',
  panel: '#FFF7ED',
} as const;

// ─── PAGES (7) ───────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Competency Validation Is Your License Protection',
    subtitle: 'Why skills check-offs exist — patient, license, and agency protection',
    scene: 'wheel',
    narration: [
      'Welcome to Module LVN-012: LVN-Specific Skills Check-offs per the California Practice Act. This module explains Care Indeed’s formal competency validation system—the process that confirms every Licensed Vocational Nurse can safely perform assigned clinical tasks before independent practice is authorized.',
      'Skills check-offs are not optional practice drills. They are required competency validations grounded in federal personnel qualification expectations under 42 CFR § 484.115, California Business and Professions Code § 2859 (LVN scope of practice), and Care Indeed agency policy HR-TC-001 (Training & Competency). Always distinguish these layers: federal requirement, California law, and agency policy.',
      'Competency validation serves three essential purposes. First, it protects patients by confirming clinicians can perform skills in the home health setting—with the equipment, supplies, and environmental conditions of the field—not only in school or a lab. Graduation from a vocational nursing program shows educational requirements were met; it does not alone authorize independent performance of every procedure on the caseload.',
      'Second, competency validation protects your license. The California Board of Vocational Nursing and Psychiatric Technicians expects LVNs to practice within demonstrated competency and statutory scope (B&P § 2859). Documented check-offs are evidence that you were trained, observed, and signed off before performing procedures independently.',
      'Third, competency validation protects the agency. Surveyors expect documented competency for procedures clinicians perform. Operating outside documented competency exposes patients, your license, and the agency.',
      'Critical distinction for this module: completing the knowledge quiz validates knowledge only. Practical competency requires observed demonstration, checklist scoring, and authorized sign-off. Quiz pass ≠ skills authorization.',
    ],
    keyPoints: [
      {
        icon: '🛡️',
        title: 'Three protections',
        detail: 'Patients, your LVN license, and agency compliance all depend on documented skills validation.',
      },
      {
        icon: '📜',
        title: 'Layered authority',
        detail: 'Federal CoP personnel expectations + CA B&P § 2859 scope + agency HR-TC-001 process.',
      },
      {
        icon: '🧪',
        title: 'Quiz ≠ practical competency',
        detail: 'Knowledge check is Level 1 only. Observed demo and authorized sign-off remain separate.',
      },
    ],
    clinicalTip:
      'Never perform a procedure independently if it is not on your validated competency record. Stop, notify your supervisor or clinical educator, and request check-off or reassignment.',
    hotspots: [
      {
        id: 'vs',
        label: 'Vital Signs',
        x: 200,
        y: 72,
        info: 'Vital signs technique must be validated for home conditions—manual BP, pulse quality, SpO₂, and pain scales—not assumed from school alone.',
      },
      {
        id: 'wound',
        label: 'Wound Care',
        x: 300,
        y: 120,
        info: 'Wound care check-off covers assessment observations, clean/sterile technique as ordered, dressing selection per protocol, and documentation. Wound staging (when required as an authorized clinician role) is not independently claimed by the LVN.',
      },
      {
        id: 'med',
        label: 'Med Admin',
        x: 320,
        y: 220,
        info: 'Medication administration validation is route-specific (oral, SC, IM, topical, inhaled, etc.). Authorization is skill-specific—not universal.',
      },
      {
        id: 'cath',
        label: 'Catheter Care',
        x: 280,
        y: 300,
        info: 'Catheter care, irrigation, and change only when within LVN scope, physician orders, and agency protocol—and only after skill-specific check-off.',
      },
      {
        id: 'bg',
        label: 'Glucose Mon.',
        x: 120,
        y: 300,
        info: 'Blood glucose monitoring includes technique, device operation, result interpretation, and following sliding-scale orders within scope—never changing orders.',
      },
      {
        id: 'inj',
        label: 'Injections',
        x: 80,
        y: 220,
        info: 'Injection check-off includes site selection, needle choice, six rights, and sharps safety. Critical-step failures = automatic non-pass.',
      },
      {
        id: 'trach',
        label: 'Trach Care',
        x: 80,
        y: 120,
        info: 'Tracheostomy care is high-risk/low-frequency for many caseloads—expect initial validation and possible more frequent re-validation per agency policy.',
      },
      {
        id: 'spec',
        label: 'Specimens',
        x: 200,
        y: 340,
        info: 'Specimen collection (wound culture, urine, capillary/venipuncture when authorized) requires its own validation pathway when assigned.',
      },
    ],
  },
  {
    id: 2,
    title: 'The Competency Validation Framework',
    subtitle: 'Four-level pyramid: knowledge → simulation → return demo → independent practice',
    scene: 'pyramid',
    narration: [
      'Care Indeed’s competency validation framework follows a four-level pyramid. Each level is completed before advancing. Independent practice is not assumed from knowledge completion alone.',
      'Level 1 — Knowledge assessment: verifies theoretical foundation—indications, contraindications, equipment, step-by-step technique, expected outcomes, complications, and documentation. LMS modules (including this one) support the knowledge level. Passing a knowledge quiz does not authorize independent performance.',
      'Level 2 — Simulation / laboratory practice: controlled, low-risk practice (mannequins, equipment stations, scenarios). Some lower-risk skills may combine Levels 2 and 3 in a single session per agency policy and evaluator judgment.',
      'Level 3 — Return demonstration (formal check-off): you perform the skill under direct observation by a qualified evaluator (typically an RN clinical educator, DON, or designated competency evaluator). A standardized skill checklist identifies critical (must-pass) and non-critical steps. Any critical-step failure requires remediation and re-evaluation.',
      'Level 4 — Independent practice authorization: granted only after successful Levels 1–3 and authorized sign-off. Authorization is skill-specific. Wound care validation does not authorize catheter insertion. New devices, products, or protocols require their own pathway.',
      'Employee decision framing: If you have completed knowledge only—stop short of independent performance. If you have observed authorization on the skill—you may continue within orders and protocol. If competency is missing or expired for an assigned skill—notify your supervisor/educator and document the barrier.',
    ],
    keyPoints: [
      {
        icon: '1️⃣',
        title: 'Knowledge',
        detail: 'Written/electronic assessment and LMS modules—foundation only.',
      },
      {
        icon: '2️⃣',
        title: 'Simulation / lab',
        detail: 'Practice before patient care; may be combined with return demo for lower-risk skills.',
      },
      {
        icon: '3️⃣',
        title: 'Return demonstration',
        detail: 'Observed check-off with critical-step scoring—this is practical competency evidence.',
      },
      {
        icon: '4️⃣',
        title: 'Independent practice',
        detail: 'Authorized sign-off, skill-specific, tracked in personnel/competency systems.',
      },
    ],
    clinicalTip:
      'If a visit requires a skill not on your validated list, do not improvise. Contact the case manager/RN supervisor, protect the patient, and escalate for staffing or check-off.',
    hotspots: [
      {
        id: 'L4',
        label: 'Independent Practice',
        x: 200,
        y: 70,
        info: 'Level 4: Authorized only after successful knowledge, practice as required, observed return demo, and authorized sign-off. Skill-specific.',
      },
      {
        id: 'L3',
        label: 'Return Demonstration',
        x: 200,
        y: 140,
        info: 'Level 3: Formal observed check-off. Evaluator does not coach mid-procedure (unless safety risk). Critical steps must all pass.',
      },
      {
        id: 'L2',
        label: 'Simulation / Lab',
        x: 200,
        y: 210,
        info: 'Level 2: Controlled practice environment. Builds muscle memory before patient-facing evaluation.',
      },
      {
        id: 'L1',
        label: 'Knowledge Assessment',
        x: 200,
        y: 280,
        info: 'Level 1: Theory and decision rules. This module’s quiz supports Level 1 only—not practical sign-off.',
      },
    ],
  },
  {
    id: 3,
    title: 'Core Skills Check-off List',
    subtitle: 'Minimum LVN skills requiring validation before independent home health practice',
    scene: 'scope',
    narration: [
      'Care Indeed requires competency validation for core LVN skills before independent home health practice. The list below is a minimum set; additional skills may be required based on assigned patient population and caseload complexity (agency policy).',
      'Vital signs: temperature routes as applicable, pulse (radial/apical/pedal as indicated), respirations, blood pressure (manual and automatic), SpO₂, and pain assessment with standardized scales. Home environments require adaptation—noise, positioning, equipment limits—so technique is still formally validated.',
      'Wound care: wound assessment observations and measurement, bed preparation, dressing application for ordered wound types, NPWT management when assigned and trained, compression when ordered, and photography/documentation per protocol. Report changes to the RN/authorized clinician; do not independently diagnose or invent treatment changes. Staging, when an authorized clinician function, is not assumed to be LVN-independent.',
      'Medication administration: oral, subcutaneous, intramuscular, topical, ophthalmic/otic, inhaled, and reconciliation support as assigned. Demonstrate six rights, route-specific technique, site selection, and patient education within LVN scope. LVNs do not prescribe or change medication orders.',
      'Catheter care: indwelling care, irrigation, change only when within LVN scope per CA practice boundaries, physician orders, and agency protocol, plus CAUTI prevention practices.',
      'Blood glucose monitoring and insulin administration per sliding-scale orders; specimen collection (wound culture, clean-catch/catheterized urine, capillary or venipuncture when authorized and validated). High-risk skills (e.g., trach care) require explicit check-off before independent performance.',
      'California scope reminder (B&P § 2859): LVN practice is directed and within vocational nursing scope—not independent RN-level assessment ownership (OASIS completion, Plan of Care development/modification, diagnosis, prescribing, or discharge determinations).',
    ],
    keyPoints: [
      {
        icon: '📋',
        title: 'Minimum core set',
        detail: 'Vitals, wound care technique, med routes, catheter care, glucose/insulin, specimens—plus caseload-specific skills.',
      },
      {
        icon: '⚖️',
        title: 'CA B&P § 2859',
        detail: 'Practice within LVN scope under direction; no independent POC changes, diagnosis, or prescribing.',
      },
      {
        icon: '🔑',
        title: 'Skill-specific keys',
        detail: 'Each skill unlocks separately. New devices/protocols reopen the validation pathway.',
      },
    ],
    clinicalTip:
      'Before accepting a complex assignment, review your competency record. Missing skill + assigned patient = escalate before the visit, not after a near-miss.',
    hotspots: [
      {
        id: 'in_scope',
        label: 'Within LVN Scope',
        x: 120,
        y: 160,
        info: 'When trained/validated and ordered: vitals, med admin by allowed routes, wound care technique, catheter care per protocol, glucose monitoring, injections, trach care if assigned/validated.',
      },
      {
        id: 'directed',
        label: 'Directed Practice',
        x: 200,
        y: 100,
        info: 'LVN practice is directed. Follow physician orders and the Plan of Care. Report changes; do not modify the POC yourself.',
      },
      {
        id: 'out_scope',
        label: 'Not Independent LVN',
        x: 280,
        y: 160,
        info: 'Not independent LVN functions: completing OASIS, developing/modifying the Plan of Care, diagnosing, prescribing, changing medication orders, or making discharge judgments.',
      },
      {
        id: 'policy',
        label: 'Agency Policy Layer',
        x: 200,
        y: 260,
        info: 'HR-TC-001 and skill checklists define attempt limits, evaluator qualifications, documentation, and escalation—agency operational rules on top of law.',
      },
    ],
  },
  {
    id: 4,
    title: 'The Check-off Process — What to Expect',
    subtitle: 'Preparation, observation rules, scoring, and sign-off',
    scene: 'tracker',
    narration: [
      'The formal skills check-off is a structured evaluation with defined roles for you and the evaluator. Understanding the process reduces anxiety and improves preparation.',
      'Before: You receive the skill-specific competency checklist. It lists every step, marks critical (must-pass) vs non-critical items, and states the acceptable performance standard. Review carefully. Practice mentally and, when available, in lab/simulation. Arrive with required supplies.',
      'During: The evaluator observes from setup through completion and documentation. The evaluator does not prompt, assist, or correct mid-procedure unless patient (or simulated patient) safety is at immediate risk. You may clarify checklist items before starting; once you begin, evaluation is in progress.',
      'Scoring: Each step is typically scored satisfactory, needs improvement, or unsatisfactory. Satisfactory = correct and complete. Needs improvement = performed with minor deviations that did not compromise safety/outcomes. Unsatisfactory = omitted, incorrect, or unsafe. All critical steps must be satisfactory to pass. Non-critical “needs improvement” may still allow a pass but triggers coaching notes.',
      'After: Immediate verbal feedback. Pass → evaluator and you sign; form enters personnel/competency systems. Non-pass → specific deficiencies + written remediation plan. Knowledge modules you already completed do not replace this observed pathway.',
      'Decision framing during evaluation: If you recognize a critical error (e.g., sterile field break)—stop and correct (re-glove/replace supplies) rather than hoping it was unseen. Self-correction on a critical safety step is part of competent practice; concealment is not.',
    ],
    keyPoints: [
      {
        icon: '📎',
        title: 'Know the checklist',
        detail: 'Critical vs non-critical steps are listed before evaluation day—use them as your study guide.',
      },
      {
        icon: '👁️',
        title: 'Observe, don’t coach',
        detail: 'Evaluator role is observation without prompting unless safety requires intervention.',
      },
      {
        icon: '✍️',
        title: 'Dual signature',
        detail: 'Passing check-off requires authorized evaluator sign-off plus your acknowledgment.',
      },
    ],
    clinicalTip:
      'Treat the check-off like real patient care: two identifiers, hand hygiene, six rights, sharps safety—every time. Critical-step discipline is non-negotiable.',
    hotspots: [
      {
        id: 'prep',
        label: 'Prepare',
        x: 70,
        y: 80,
        info: 'Obtain checklist, review critical steps, gather supplies, complete knowledge/sim prerequisites.',
      },
      {
        id: 'demo',
        label: 'Demonstrate',
        x: 200,
        y: 80,
        info: 'Perform full procedure under observation without coaching. Self-correct safety breaks when recognized.',
      },
      {
        id: 'score',
        label: 'Score',
        x: 330,
        y: 80,
        info: 'Critical steps must all be satisfactory. Any critical fail = non-pass for the skill attempt.',
      },
      {
        id: 'sign',
        label: 'Sign-off',
        x: 200,
        y: 280,
        info: 'Pass → authorized signature + your acknowledgment + tracking system update. Still skill-specific.',
      },
    ],
  },
  {
    id: 5,
    title: 'Critical Steps and Zero-Tolerance Items',
    subtitle: 'Must-pass safety steps that auto-fail a check-off if missed',
    scene: 'critical',
    narration: [
      'Certain steps are designated critical because failure creates immediate risk of harm. On competency checklists these are zero-tolerance items: failure on any single critical step yields an automatic non-passing evaluation, regardless of excellence on other steps.',
      'Patient identification: before any clinical intervention, verify identity with at least two identifiers. Missing ID check during check-off = automatic fail.',
      'Hand hygiene: before and after procedures, with correct timing and technique (adequate duration/coverage). Evaluators specifically watch timing relative to the procedure.',
      'Sterile technique (when required): breaking sterility—touching non-sterile surfaces with sterile gloves, reaching across a sterile field, using contaminated supplies—is a critical fail unless you recognize and correctly remediate (re-glove/replace) as the procedure requires.',
      'Medication safety: the six rights (right patient, medication, dose, route, time, documentation) must be verified. Missing a right is a critical fail. LVNs administer per order; they do not change orders.',
      'Sharps safety: no recapping unsafe practices, no improper disposal, no unattended sharps. Emergency recognition: if a simulated change in patient condition is introduced, you must recognize and initiate appropriate response within LVN scope and agency emergency procedures—failure to recognize/respond is a critical fail.',
      'Non-critical steps still matter for coaching, but only critical failures force automatic non-pass. Know which is which before evaluation day.',
    ],
    keyPoints: [
      {
        icon: '🚨',
        title: 'One critical fail = non-pass',
        detail: 'No partial pass on critical safety steps—full attempt fails and remediation starts.',
      },
      {
        icon: '🆔',
        title: 'Universal criticals',
        detail: 'Two identifiers + hand hygiene appear on essentially every procedure checklist.',
      },
      {
        icon: '💉',
        title: 'Med & sharps criticals',
        detail: 'Six rights and sharps safety are zero-tolerance during med/injection check-offs.',
      },
    ],
    clinicalTip:
      'If you break sterile technique, stop immediately, re-glove, and replace contaminated supplies. Continuing without correction is both a check-off fail and a patient safety event pattern.',
    hotspots: [
      {
        id: 'id',
        label: 'Patient ID',
        x: 90,
        y: 100,
        info: 'Two identifiers before every intervention. Universal critical step—automatic fail if omitted.',
      },
      {
        id: 'hh',
        label: 'Hand Hygiene',
        x: 200,
        y: 70,
        info: 'Correct timing and technique before/after. Duration and coverage are observed.',
      },
      {
        id: 'sterile',
        label: 'Sterile Field',
        x: 310,
        y: 100,
        info: 'When sterility is required, breaks must be recognized and corrected—or the attempt fails.',
      },
      {
        id: 'six',
        label: 'Six Rights',
        x: 90,
        y: 240,
        info: 'Right patient, medication, dose, route, time, documentation—all verified.',
      },
      {
        id: 'sharps',
        label: 'Sharps Safety',
        x: 200,
        y: 290,
        info: 'Safe handling and disposal every time. Unsafe recapping/unattended sharps = critical fail.',
      },
      {
        id: 'emerg',
        label: 'Emergency Response',
        x: 310,
        y: 240,
        info: 'Recognize simulated deterioration and initiate appropriate LVN-scope response + notification.',
      },
    ],
  },
  {
    id: 6,
    title: 'Remediation and Re-evaluation',
    subtitle: 'Supportive pathway after a non-pass — not punishment',
    scene: 'remediation',
    narration: [
      'A non-passing skills check-off starts a structured remediation process. Remediation is educational support designed to achieve safe competency—not a punitive ritual.',
      'Plan development: The evaluator, with the clinical educator or DON as needed, documents specific deficiencies, corrective actions, training resources, and re-evaluation timing. You receive a written plan and sign acknowledging understanding and commitment.',
      'Activities: Knowledge gaps may trigger module review, reading, or 1:1 instruction. Technique gaps may trigger guided practice, video review of correct method, or mentored practice with an experienced clinician. Complete all plan elements before re-evaluation.',
      'Re-evaluation: Same checklist format as the original attempt, with focused attention on previously deficient areas. Agency policy (HR-TC-001): Care Indeed allows a maximum of three attempts per skills check-off before DON escalation. The DON may authorize additional remediation/attempt, reassign caseload away from the skill, or initiate a performance improvement plan. In rare cases where competency cannot be demonstrated despite extensive support, employment separation may be considered under agency HR processes.',
      'Documentation: Both passing and non-passing evaluations are retained in the personnel/competency record. This supports CMS survey readiness and protects patients, clinicians, and the agency after incidents.',
      'Remember: LMS quiz success does not close a failed skills check-off. Only observed re-demonstration and authorized sign-off clear the skill for independent practice.',
    ],
    keyPoints: [
      {
        icon: '📝',
        title: 'Written plan',
        detail: 'Deficiencies, actions, resources, and timeline—signed acknowledgment required.',
      },
      {
        icon: '🔁',
        title: 'Agency attempt limit',
        detail: 'Per HR-TC-001: up to three attempts, then DON review/escalation (agency policy).',
      },
      {
        icon: '📂',
        title: 'Record retention',
        detail: 'Pass and non-pass documentation remain part of the competency file.',
      },
    ],
    clinicalTip:
      'Own the remediation plan early. Request practice time before re-evaluation. Arriving unprepared for attempt two wastes a limited agency-policy attempt.',
    hotspots: [
      {
        id: 'def',
        label: 'Deficiency Identified',
        x: 70,
        y: 180,
        info: 'Evaluator documents exactly which critical/non-critical steps failed and why.',
      },
      {
        id: 'plan',
        label: 'Remediation Plan',
        x: 140,
        y: 100,
        info: 'Written plan with actions, resources, and re-evaluation timing; employee acknowledgment.',
      },
      {
        id: 'train',
        label: 'Additional Training',
        x: 220,
        y: 180,
        info: 'Knowledge review, guided practice, mentored sessions—matched to the gap type.',
      },
      {
        id: 'redemo',
        label: 'Re-demonstration',
        x: 300,
        y: 100,
        info: 'Full observed checklist again. Prior fails get special scrutiny.',
      },
      {
        id: 'val',
        label: 'Competency Validated',
        x: 340,
        y: 220,
        info: 'Only after pass + authorized sign-off. Otherwise escalate per agency policy (DON).',
      },
    ],
  },
  {
    id: 7,
    title: 'Annual Re-validation and Mastery',
    subtitle: 'Competency is ongoing — annual review, new skills, high-risk low-frequency',
    scene: 'mastery',
    narration: [
      'Competency validation is not a one-time event. Care Indeed requires annual re-validation of core clinical competencies, operationalizing federal personnel qualification expectations (42 CFR § 484.115), California LVN practice boundaries (B&P § 2859), and agency policy HR-TC-001. Exact scheduling windows and roster lists follow current agency policy.',
      'Annual re-validation uses the same checklist framework. For consistently competent clinicians, evaluation may focus on critical steps; any concern triggers a full check-off. New skills, products, devices, or protocol changes require initial full pathway validation regardless of annual status.',
      'High-risk, low-frequency skills (emergency response, certain device cares, trach emergencies, etc.) may require more frequent re-validation or just-in-time protocol review per agency policy because skill decay risk is higher.',
      'Your competency record lives in the personnel file and the electronic competency tracking system. You may review it and must report discrepancies to your supervisor or clinical educator immediately.',
      'You have completed the instructional content for LVN-012. Next: a 10-question knowledge check (80% to pass). Passing confirms knowledge only. Observed demonstration, rubric scoring, remediation if needed, and authorized sign-off remain separate requirements for practical skills competency and independent practice authorization.',
    ],
    keyPoints: [
      {
        icon: '📅',
        title: 'Annual re-validation',
        detail: 'Core skills refresh on an agency-scheduled annual cycle; not “once and forever.”',
      },
      {
        icon: '🆕',
        title: 'New skill = new pathway',
        detail: 'New devices/protocols reopen Levels 1–4 even if annuals are current.',
      },
      {
        icon: '🏅',
        title: 'Mastery evidence',
        detail: 'Tracking systems + signed checklists are survey-ready proof—not the LMS quiz alone.',
      },
    ],
    clinicalTip:
      'Before annual season, self-audit your skill list against your actual caseload. Request check-offs for gaps early rather than declining visits unprepared.',
    hotspots: [
      {
        id: 'annual',
        label: 'Annual Cycle',
        x: 100,
        y: 120,
        info: 'Core competencies re-validated on the agency annual schedule; focused or full based on performance.',
      },
      {
        id: 'newskill',
        label: 'New Skill Path',
        x: 200,
        y: 80,
        info: 'New product/device/protocol → full competency pathway before independent use.',
      },
      {
        id: 'hrlf',
        label: 'High-Risk Low-Freq',
        x: 300,
        y: 120,
        info: 'May need more frequent validation or protocol review—follow current agency policy.',
      },
      {
        id: 'record',
        label: 'Competency Record',
        x: 200,
        y: 260,
        info: 'Personnel file + electronic tracking. Review for accuracy; report discrepancies promptly.',
      },
    ],
  },
];

// ─── QUIZ (10) — balanced A=2 B=3 C=3 D=2 ────────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'You finished this LMS module’s knowledge quiz with a high score. What does that authorize you to do for a new wound-care skill not yet on your competency record?',
    options: [
      'A) Nothing independent yet — knowledge only; observed return demo and authorized sign-off are still required',
      'B) Perform the skill independently on any assigned patient immediately',
      'C) Skip return demonstration because the quiz score was ≥80%',
      'D) Modify the Plan of Care to add the wound treatment you prefer',
    ],
    correct: 0, // A
    rationale:
      'The quiz validates knowledge (pyramid Level 1) only. Practical competency requires observed demonstration, checklist scoring, and authorized sign-off. LVNs also do not independently modify the Plan of Care.',
  },
  {
    id: 2,
    stem: 'Which California code section defines LVN scope of practice boundaries relevant to skills you may be checked off to perform?',
    options: [
      'A) B&P § 2725 (RN scope)',
      'B) B&P § 2859 (LVN scope)',
      'C) B&P § 2570 (occupational therapy)',
      'D) B&P § 2052 (practice of medicine)',
    ],
    correct: 1, // B
    rationale:
      'California Business and Professions Code § 2859 addresses LVN scope. Other cited sections govern different professions and must not be used as LVN practice authority.',
  },
  {
    id: 3,
    stem: 'During a catheter-care check-off you omit two-identifier patient identification but complete every other step perfectly. The expected result is:',
    options: [
      'A) Verbal warning only with a pass',
      'B) Partial credit averaging to a pass',
      'C) Automatic non-passing evaluation because patient ID is a critical/zero-tolerance step',
      'D) Pass, since non-ID steps were excellent',
    ],
    correct: 2, // C
    rationale:
      'Critical steps are zero-tolerance. Failure on any critical step—including patient identification—produces an automatic non-pass regardless of other performance.',
  },
  {
    id: 4,
    stem: 'Per Care Indeed agency policy (HR-TC-001), how many skills check-off attempts are allowed for a given skill before DON escalation/review?',
    options: [
      'A) 2 attempts',
      'B) 3 attempts',
      'C) 5 attempts',
      'D) Unlimited attempts without escalation',
    ],
    correct: 1, // B
    rationale:
      'Agency policy HR-TC-001 allows a maximum of three attempts per skills check-off before DON escalation. This is agency policy, not a universal state statute.',
  },
  {
    id: 5,
    stem: 'Which item is a zero-tolerance critical step expected on essentially every clinical procedure check-off?',
    options: [
      'A) Checking room temperature before starting',
      'B) Counting all supplies aloud twice',
      'C) Documenting exact start time to the second',
      'D) Verifying patient identity with at least two identifiers',
    ],
    correct: 3, // D
    rationale:
      'Two-identifier patient identification is a universal critical safety step. Environmental or administrative preferences are not substitutes for ID verification.',
  },
  {
    id: 6,
    stem: 'Care Indeed’s competency validation pyramid has how many levels from knowledge through independent practice authorization?',
    options: [
      'A) 4 levels',
      'B) 2 levels',
      'C) 3 levels',
      'D) 6 levels',
    ],
    correct: 0, // A
    rationale:
      'Four levels: (1) knowledge assessment, (2) simulation/lab, (3) return demonstration, (4) independent practice authorization after sign-off.',
  },
  {
    id: 7,
    stem: 'Midway through a sterile dressing return demonstration you brush a sterile glove against a non-sterile bedrail. What should you do?',
    options: [
      'A) Continue and hope the evaluator did not notice',
      'B) Ask the evaluator to complete the sterile portion for you',
      'C) Stop, re-glove, and replace contaminated supplies before continuing',
      'D) Finish the dressing then mention the break afterward only if asked',
    ],
    correct: 2, // C
    rationale:
      'Recognizing and correcting a sterile technique break (re-glove/replace contaminated supplies) is required. Continuing without correction is unsafe and fails the critical step.',
  },
  {
    id: 8,
    stem: 'You are validated for vital signs and subcutaneous injections. A new patient requires indwelling catheter change and you have no catheter check-off on file. Correct action:',
    options: [
      'A) Proceed because any one clinical validation unlocks all nursing skills',
      'B) Do not perform the catheter skill independently — competency authorization is skill-specific; notify supervisor/educator',
      'C) Perform it once “carefully” then request check-off later',
      'D) Change the order to a skill you already have validated',
    ],
    correct: 1, // B
    rationale:
      'Authorization is skill-specific. Missing competency means stop/escalate—not improvise, not alter orders, not assume universal privileges from other skills.',
  },
  {
    id: 9,
    stem: 'What is the evaluator’s primary role during the formal return-demonstration check-off?',
    options: [
      'A) Help you complete difficult steps so you pass',
      'B) Provide continuous real-time coaching throughout',
      'C) Observe without prompting or assisting unless safety is at immediate risk, scoring against the checklist',
      'D) Grade on a curve based on years of experience',
    ],
    correct: 2, // C
    rationale:
      'Formal check-off is an observation against a standardized checklist. Coaching/assistance mid-procedure is not the evaluator role except for immediate safety intervention.',
  },
  {
    id: 10,
    stem: 'Where is your official competency validation record maintained after a successful skills check-off?',
    options: [
      'A) Only in your personal notebook at home',
      'B) Only on the evaluator’s personal desk clipboard',
      'C) Only at the state Board with no agency copy',
      'D) In your personnel file and the agency electronic competency tracking system',
    ],
    correct: 3, // D
    rationale:
      'Competency records are maintained in the personnel file and electronic tracking system for survey readiness and assignment decisions. Personal or informal copies are not the system of record.',
  },
];

// Expected distribution: A=2, B=3, C=3, D=2 (indices 0,1,2,3)

// ─── SHARED UI BITS ──────────────────────────────────────────────────────────
function FeedbackBanner({
  activeId,
  hotspots,
}: {
  activeId: string | null;
  hotspots: Hotspot[];
}) {
  const hs = hotspots.find((h) => h.id === activeId);
  if (!hs) {
    return (
      <div
        style={{
          marginTop: 8,
          padding: '10px 12px',
          borderRadius: 8,
          background: '#F1F5F9',
          color: THEME.muted,
          fontSize: 13,
          border: '1px dashed #CBD5E1',
        }}
      >
        Click a numbered hotspot on the diagram for instructional detail.
      </div>
    );
  }
  return (
    <div
      style={{
        marginTop: 8,
        padding: '12px 14px',
        borderRadius: 8,
        background: '#EEF2FF',
        border: `2px solid ${THEME.accent}`,
        color: THEME.dark,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <strong style={{ color: THEME.accent }}>{hs.label}:</strong> {hs.info}
    </div>
  );
}

function HotspotDot({
  hs,
  index,
  active,
  onSelect,
}: {
  hs: Hotspot;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(hs.id);
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={hs.label}
    >
      <circle
        cx={hs.x}
        cy={hs.y}
        r={active ? 16 : 14}
        fill={active ? THEME.accent : THEME.primary}
        stroke="#fff"
        strokeWidth={2}
        opacity={0.95}
      />
      <text
        x={hs.x}
        y={hs.y + 4}
        textAnchor="middle"
        fill="#fff"
        fontSize={11}
        fontWeight={700}
      >
        {index + 1}
      </text>
      <text
        x={hs.x}
        y={hs.y + 28}
        textAnchor="middle"
        fill={THEME.dark}
        fontSize={10}
        fontWeight={600}
      >
        {hs.label.length > 16 ? `${hs.label.slice(0, 14)}…` : hs.label}
      </text>
    </g>
  );
}

// ─── SCENES ──────────────────────────────────────────────────────────────────
function SceneCompetencyWheel({
  hotspots,
  activeHotspot,
  onSelect,
  phase,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
  phase: number;
}) {
  const skills = [
    { name: 'Vital Signs', color: '#3B82F6' },
    { name: 'Wound Care', color: '#10B981' },
    { name: 'Med Admin', color: '#8B5CF6' },
    { name: 'Catheter Care', color: '#F59E0B' },
    { name: 'Specimens', color: '#DC2626' },
    { name: 'Injections', color: '#059669' },
    { name: 'Trach Care', color: '#EC4899' },
    { name: 'Glucose Mon.', color: '#6366F1' },
  ];
  const cx = 200;
  const cy = 190;
  const r = 110;
  const pulse = 1 + Math.sin(phase * 0.05) * 0.03;

  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Core LVN Skills — Competency Wheel
      </text>
      <circle cx={cx} cy={cy} r={r * pulse} fill="#FEF3C7" stroke={THEME.primary} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={36} fill={THEME.primary} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        LVN
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#FFF7ED" fontSize="9">
        Skills
      </text>
      {skills.map((s, i) => {
        const ang = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        return (
          <g key={s.name}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={s.color} strokeWidth="2" opacity={0.5} />
            <circle cx={x} cy={y} r={22} fill={s.color} opacity={0.9} />
            <text x={x} y={y + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">
              {s.name.split(' ')[0]}
            </text>
          </g>
        );
      })}
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
      <text x="200" y="368" textAnchor="middle" fill={THEME.muted} fontSize="10">
        Each spoke = skill-specific validation (not universal)
      </text>
    </svg>
  );
}

function SceneValidationPyramid({
  hotspots,
  activeHotspot,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
}) {
  const levels = [
    { label: '4 · Independent Practice', y: 55, w: 140, color: '#10B981' },
    { label: '3 · Return Demonstration', y: 115, w: 200, color: '#3B82F6' },
    { label: '2 · Simulation / Lab', y: 175, w: 260, color: '#F59E0B' },
    { label: '1 · Knowledge Assessment', y: 235, w: 320, color: '#8B5CF6' },
  ];
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Competency Validation Pyramid
      </text>
      {levels.map((lv) => (
        <g key={lv.label}>
          <rect
            x={200 - lv.w / 2}
            y={lv.y}
            width={lv.w}
            height={48}
            rx={8}
            fill={lv.color}
            opacity={0.92}
          />
          <text
            x={200}
            y={lv.y + 30}
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="700"
          >
            {lv.label}
          </text>
        </g>
      ))}
      <text x="200" y="310" textAnchor="middle" fill={THEME.muted} fontSize="11">
        Climb only after the level below is complete
      </text>
      <text x="200" y="330" textAnchor="middle" fill={THEME.danger} fontSize="11" fontWeight="600">
        Quiz pass = Level 1 knowledge — not Level 3/4
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function SceneScopeBoundary({
  hotspots,
  activeHotspot,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        CA B&P § 2859 — LVN Scope Boundary
      </text>
      <rect x="30" y="50" width="160" height="200" rx="12" fill="#D1FAE5" stroke="#10B981" strokeWidth="2" />
      <text x="110" y="78" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="700">
        WITHIN SCOPE*
      </text>
      <text x="110" y="105" textAnchor="middle" fill="#047857" fontSize="10">
        When ordered + validated
      </text>
      {[
        'Vitals / assessments',
        'Med admin (allowed routes)',
        'Wound care technique',
        'Catheter care (protocol)',
        'Injections / glucose',
      ].map((t, i) => (
        <text key={t} x="45" y={130 + i * 20} fill="#065F46" fontSize="10">
          • {t}
        </text>
      ))}

      <rect x="210" y="50" width="160" height="200" rx="12" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
      <text x="290" y="78" textAnchor="middle" fill="#991B1B" fontSize="12" fontWeight="700">
        NOT INDEPENDENT
      </text>
      <text x="290" y="105" textAnchor="middle" fill="#B91C1C" fontSize="10">
        LVN does not alone…
      </text>
      {[
        'Complete OASIS',
        'Develop/modify POC',
        'Diagnose',
        'Prescribe / change orders',
        'Discharge judgments',
      ].map((t, i) => (
        <text key={t} x="225" y={130 + i * 20} fill="#991B1B" fontSize="10">
          • {t}
        </text>
      ))}

      <rect x="30" y="270" width="340" height="48" rx="10" fill="#EDE9FE" stroke={THEME.accent} strokeWidth="2" />
      <text x="200" y="290" textAnchor="middle" fill={THEME.accent} fontSize="11" fontWeight="700">
        Agency Policy HR-TC-001 operationalizes checklists,
      </text>
      <text x="200" y="306" textAnchor="middle" fill={THEME.accent} fontSize="11" fontWeight="700">
        attempts, evaluators, and sign-off documentation
      </text>
      <text x="200" y="348" textAnchor="middle" fill={THEME.muted} fontSize="10">
        *Within scope still requires orders + skill-specific validation
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function SceneCheckoffTracker({
  hotspots,
  activeHotspot,
  onSelect,
  phase,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
  phase: number;
}) {
  const rows = [
    { name: 'Vital Signs', pct: 100, color: '#10B981' },
    { name: 'Wound Care', pct: 85, color: '#3B82F6' },
    { name: 'Med Administration', pct: 90, color: '#8B5CF6' },
    { name: 'Catheter Care', pct: 70, color: '#F59E0B' },
    { name: 'Blood Glucose', pct: 100, color: '#10B981' },
    { name: 'Injection Technique', pct: 60, color: '#DC2626' },
  ];
  const glow = 0.5 + Math.sin(phase * 0.04) * 0.2;

  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Check-off Process Tracker (illustrative)
      </text>
      {/* Process steps */}
      {[
        { x: 70, label: 'Prepare' },
        { x: 200, label: 'Demonstrate' },
        { x: 330, label: 'Score' },
      ].map((s, i) => (
        <g key={s.label}>
          <circle cx={s.x} cy={70} r={22} fill={THEME.info} opacity={0.9} />
          <text x={s.x} y={74} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
            {i + 1}
          </text>
          <text x={s.x} y={108} textAnchor="middle" fill={THEME.dark} fontSize="10" fontWeight="600">
            {s.label}
          </text>
          {i < 2 && (
            <line x1={s.x + 26} y1={70} x2={s.x + 100} y2={70} stroke={THEME.info} strokeWidth="2" strokeDasharray="4 3" />
          )}
        </g>
      ))}
      <rect x="140" y="125" width="120" height="36" rx="18" fill={THEME.success} opacity={0.85 + glow * 0.15} />
      <text x="200" y="148" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
        Authorized Sign-off
      </text>
      {rows.map((r, i) => {
        const y = 180 + i * 28;
        return (
          <g key={r.name}>
            <text x="24" y={y + 10} fill={THEME.dark} fontSize="10">
              {r.name}
            </text>
            <rect x="140" y={y} width="220" height="14" rx="7" fill="#E2E8F0" />
            <rect x="140" y={y} width={220 * (r.pct / 100)} height="14" rx="7" fill={r.color} />
            <text x="368" y={y + 11} fill={THEME.muted} fontSize="9">
              {r.pct}%
            </text>
          </g>
        );
      })}
      <text x="200" y="368" textAnchor="middle" fill={THEME.muted} fontSize="9">
        Bars are instructional examples — your record is skill-specific & official
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function SceneCriticalMatrix({
  hotspots,
  activeHotspot,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Critical vs Non-Critical Steps
      </text>
      <rect x="24" y="48" width="170" height="200" rx="12" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
      <text x="109" y="72" textAnchor="middle" fill="#991B1B" fontSize="12" fontWeight="700">
        CRITICAL (auto-fail)
      </text>
      {[
        'Patient ID ×2',
        'Hand hygiene timing',
        'Sterile technique',
        'Six rights',
        'Sharps safety',
        'Emergency recognition',
      ].map((t, i) => (
        <text key={t} x="40" y={100 + i * 22} fill="#7F1D1D" fontSize="11">
          ⛔ {t}
        </text>
      ))}
      <rect x="206" y="48" width="170" height="200" rx="12" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
      <text x="291" y="72" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="700">
        NON-CRITICAL
      </text>
      {[
        'Minor sequence order',
        'Supply layout style',
        'Verbal phrasing',
        'Non-safety finesse',
        'Coaching notes OK',
        'May still pass overall',
      ].map((t, i) => (
        <text key={t} x="222" y={100 + i * 22} fill="#1E3A8A" fontSize="11">
          • {t}
        </text>
      ))}
      <rect x="24" y="268" width="352" height="56" rx="10" fill="#FEF3C7" stroke={THEME.primary} strokeWidth="2" />
      <text x="200" y="292" textAnchor="middle" fill={THEME.primaryDark} fontSize="12" fontWeight="700">
        Any single critical fail = non-pass for the attempt
      </text>
      <text x="200" y="310" textAnchor="middle" fill={THEME.dark} fontSize="11">
        Remediation + re-demonstration required (not quiz retake alone)
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function SceneRemediationPathway({
  hotspots,
  activeHotspot,
  onSelect,
  phase,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
  phase: number;
}) {
  const nodes = [
    { label: 'Deficiency', x: 55, y: 160, c: '#DC2626' },
    { label: 'Plan', x: 130, y: 90, c: '#F59E0B' },
    { label: 'Training', x: 205, y: 160, c: '#3B82F6' },
    { label: 'Re-demo', x: 280, y: 90, c: '#8B5CF6' },
    { label: 'Validated', x: 345, y: 200, c: '#10B981' },
  ];
  const dash = (phase / 2) % 24;

  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Remediation Pathway
      </text>
      <path
        d="M55 160 L130 90 L205 160 L280 90 L345 200"
        fill="none"
        stroke={THEME.primary}
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeDashoffset={-dash}
      />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={28} fill={n.c} opacity={0.9} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
            {n.label}
          </text>
        </g>
      ))}
      <rect x="40" y="250" width="320" height="70" rx="10" fill="#FFF" stroke={THEME.border} strokeWidth="2" />
      <text x="200" y="275" textAnchor="middle" fill={THEME.dark} fontSize="12" fontWeight="700">
        Agency policy (HR-TC-001): max 3 attempts → DON review
      </text>
      <text x="200" y="298" textAnchor="middle" fill={THEME.muted} fontSize="11">
        Remediation is support. Quiz retake ≠ skills re-validation.
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function SceneDocumentationMastery({
  hotspots,
  activeHotspot,
  onSelect,
  phase,
}: {
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
  phase: number;
}) {
  const pulse = 8 + Math.sin(phase * 0.05) * 4;
  return (
    <svg viewBox="0 0 400 380" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="380" rx="16" fill={THEME.secondary} />
      <text x="200" y="28" textAnchor="middle" fill={THEME.dark} fontSize="14" fontWeight="700">
        Documentation & Ongoing Mastery
      </text>
      {/* Badge */}
      <circle cx="200" cy="130" r={50 + pulse * 0.3} fill="#FEF3C7" stroke={THEME.primary} strokeWidth="3" />
      <circle cx="200" cy="130" r="40" fill={THEME.primary} />
      <text x="200" y="125" textAnchor="middle" fill="#fff" fontSize="20">
        🏅
      </text>
      <text x="200" y="145" textAnchor="middle" fill="#FFFBEB" fontSize="10" fontWeight="700">
        VALIDATED
      </text>
      {/* Record cards */}
      <rect x="40" y="200" width="140" height="70" rx="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
      <text x="110" y="228" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
        Personnel File
      </text>
      <text x="110" y="248" textAnchor="middle" fill="#047857" fontSize="10">
        Signed checklists
      </text>
      <rect x="220" y="200" width="140" height="70" rx="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
      <text x="290" y="228" textAnchor="middle" fill="#1E40AF" fontSize="11" fontWeight="700">
        e-Tracking System
      </text>
      <text x="290" y="248" textAnchor="middle" fill="#1D4ED8" fontSize="10">
        Assignment source of truth
      </text>
      <rect x="40" y="288" width="320" height="48" rx="10" fill="#EEF2FF" stroke={THEME.accent} strokeWidth="2" />
      <text x="200" y="308" textAnchor="middle" fill={THEME.accent} fontSize="11" fontWeight="700">
        Annual re-validation + new-skill pathways keep mastery current
      </text>
      <text x="200" y="324" textAnchor="middle" fill={THEME.dark} fontSize="10">
        Knowledge quiz completion is recorded separately from skills sign-off
      </text>
      {hotspots.map((hs, i) => (
        <HotspotDot key={hs.id} hs={hs} index={i} active={activeHotspot === hs.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function InstructionalScene({
  scene,
  hotspots,
  activeHotspot,
  onSelect,
  phase,
}: {
  scene: string;
  hotspots: Hotspot[];
  activeHotspot: string | null;
  onSelect: (id: string) => void;
  phase: number;
}) {
  switch (scene) {
    case 'wheel':
      return (
        <SceneCompetencyWheel
          hotspots={hotspots}
          activeHotspot={activeHotspot}
          onSelect={onSelect}
          phase={phase}
        />
      );
    case 'pyramid':
      return (
        <SceneValidationPyramid hotspots={hotspots} activeHotspot={activeHotspot} onSelect={onSelect} />
      );
    case 'scope':
      return <SceneScopeBoundary hotspots={hotspots} activeHotspot={activeHotspot} onSelect={onSelect} />;
    case 'tracker':
      return (
        <SceneCheckoffTracker
          hotspots={hotspots}
          activeHotspot={activeHotspot}
          onSelect={onSelect}
          phase={phase}
        />
      );
    case 'critical':
      return <SceneCriticalMatrix hotspots={hotspots} activeHotspot={activeHotspot} onSelect={onSelect} />;
    case 'remediation':
      return (
        <SceneRemediationPathway
          hotspots={hotspots}
          activeHotspot={activeHotspot}
          onSelect={onSelect}
          phase={phase}
        />
      );
    case 'mastery':
      return (
        <SceneDocumentationMastery
          hotspots={hotspots}
          activeHotspot={activeHotspot}
          onSelect={onSelect}
          phase={phase}
        />
      );
    default:
      return (
        <svg viewBox="0 0 400 380" width="100%">
          <rect width="400" height="380" fill={THEME.secondary} rx="16" />
          <text x="200" y="190" textAnchor="middle" fill={THEME.muted}>
            Instructional scene
          </text>
        </svg>
      );
  }
}

// ─── MAIN MODULE ─────────────────────────────────────────────────────────────
const LVN012SkillsCheckoffs: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'results'>('learn');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 360), 50);
    return () => clearInterval(t);
  }, []);

  const totalLearnPages = PAGES.length;
  const isLastLearn = pageIndex >= totalLearnPages - 1;
  const page = PAGES[Math.min(pageIndex, totalLearnPages - 1)];


  const answeredCount = Object.keys(answers).length;

  const submitQuiz = useCallback(() => {
    let s = 0;
    QUIZ.forEach((q) => {
      if (answers[q.id] === q.correct) s += 1;
    });
    setScore(s);
    setPassed(s >= 8);
    setMode('results');
    setShowReview(false);
  }, [answers]);

  const retryQuiz = useCallback(() => {
    setAnswers({});
    setScore(0);
    setPassed(false);
    setShowReview(false);
    setMode('quiz');
  }, []);

  const goLearn = useCallback(() => {
    setMode('learn');
    setPageIndex(0);
    setActiveHotspot(null);
  }, []);

  const selectHotspot = useCallback((id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  }, []);

  // ── Quiz view ──
  if (mode === 'quiz') {
    return (
      <div
        className="lvn-module-shell"
        style={{
          fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif',
          color: THEME.dark,
          background: THEME.panel,
          minHeight: '100vh',
          padding: 16,
        }}
      >
                <LVNLessonNavigation
          lessons={PAGES}
          activeIndex={-1}
          onLessonChange={(index) => {
            setMode('learn');
            setPageIndex(index);
            setActiveHotspot(null);
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 900, margin: '0 auto' }}>
          {QUIZ.map((q) => (
            <div
              key={q.id}
              style={{
                background: THEME.card,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${THEME.border}`,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                {q.id}. {q.stem}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <label
                      key={oi}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `2px solid ${selected ? THEME.primary : '#E2E8F0'}`,
                        background: selected ? '#FFFBEB' : '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        style={{ marginTop: 3 }}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            maxWidth: 900,
            margin: '18px auto 40px',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('learn');
              setPageIndex(totalLearnPages - 1);
            }}
            style={btnSecondary}
          >
            ← Back to content
          </button>
          <button
            type="button"
            disabled={answeredCount < QUIZ.length}
            onClick={submitQuiz}
            style={{
              ...btnPrimary,
              opacity: answeredCount < QUIZ.length ? 0.5 : 1,
              cursor: answeredCount < QUIZ.length ? 'not-allowed' : 'pointer',
            }}
          >
            Submit quiz ({answeredCount}/{QUIZ.length})
          </button>
        </div>
      </div>
    );
  }

  // ── Results view ──
  if (mode === 'results') {
    const pct = score * 10;
    return (
      <div
        className="lvn-module-shell"
        style={{
          fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif',
          color: THEME.dark,
          background: THEME.panel,
          minHeight: '100vh',
          padding: 16,
        }}
      >
        <LVNLessonNavigation
          lessons={PAGES}
          activeIndex={-1}
          onLessonChange={(index) => {
            setMode('learn');
            setPageIndex(index);
            setActiveHotspot(null);
          }}
        />

        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: THEME.card,
            borderRadius: 16,
            padding: 24,
            border: `2px solid ${passed ? THEME.success : THEME.danger}`,
          }}
        >
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 600 }}>
            {MODULE_META.id} · Results
          </div>
          <h1 style={{ margin: '6px 0 12px', fontSize: 22 }}>
            Score: {score}/10 ({pct}%)
          </h1>
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: passed ? '#D1FAE5' : '#FEE2E2',
              color: passed ? '#065F46' : '#991B1B',
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {passed
              ? '✅ PASSED — Knowledge check complete for this module.'
              : '❌ Below 80% — Review content and retry the knowledge check.'}
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: '#EEF2FF',
              border: `1px solid ${THEME.accent}`,
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 18,
            }}
          >
            <strong>Competency boundary:</strong> Passing this quiz validates{' '}
            <em>knowledge only</em>. Skills check-offs require observed demonstration, critical-step
            scoring, remediation when needed, and authorized sign-off before independent practice.
            Quiz pass ≠ practical competency authorization.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            <button type="button" style={btnPrimary} onClick={() => setShowReview((v) => !v)}>
              {showReview ? 'Hide review' : 'Review answers'}
            </button>
            {!passed && (
              <button type="button" style={btnPrimary} onClick={retryQuiz}>
                Retry quiz
              </button>
            )}
            {passed && (
              <button type="button" style={btnSecondary} onClick={retryQuiz}>
                Retake knowledge check
              </button>
            )}
            <button type="button" style={btnSecondary} onClick={goLearn}>
              Review module pages
            </button>
          </div>

          {showReview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUIZ.map((q) => {
                const chosen = answers[q.id];
                const ok = chosen === q.correct;
                return (
                  <div
                    key={q.id}
                    style={{
                      borderRadius: 10,
                      padding: 14,
                      border: `1px solid ${ok ? THEME.success : THEME.danger}`,
                      background: ok ? '#F0FDF4' : '#FEF2F2',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {q.id}. {q.stem}{' '}
                      <span style={{ color: ok ? THEME.success : THEME.danger }}>
                        {ok ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      Your answer: {chosen === undefined ? '—' : q.options[chosen]}
                    </div>
                    {!ok && (
                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        Correct: {q.options[q.correct]}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: THEME.muted, lineHeight: 1.45 }}>
                      <strong>Rationale:</strong> {q.rationale}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p style={{ marginTop: 20, fontSize: 12, color: THEME.muted }}>
            Status: {MODULE_META.status} · Citations: {MODULE_META.citations.join(' · ')}
          </p>
        </div>
      </div>
    );
  }

  // ── Learn view ──
  return (
    <div
      className="lvn-module-shell"
      style={{
        fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif',
        color: THEME.dark,
        background: THEME.panel,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
            <LVNLessonNavigation
        lessons={PAGES}
        activeIndex={pageIndex}
        onLessonChange={(index) => {
          setMode('learn');
          setPageIndex(index);
          setActiveHotspot(null);
        }}
      />

      {/* Split panels */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 55fr) minmax(0, 45fr)',
          gap: 0,
          minHeight: 0,
        }}
        className="lvn012-split"
      >
        {/* LEFT — narration */}
        <main
          style={{
            padding: '18px 20px 28px',
            overflow: 'auto',
            background: THEME.card,
            borderRight: `1px solid ${THEME.border}`,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: '#FEF3C7',
              color: THEME.primaryDark,
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 99,
              marginBottom: 8,
            }}
          >
            Page {page.id} · Instructional
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, lineHeight: 1.25 }}>{page.title}</h2>
          <p style={{ margin: '0 0 14px', color: THEME.muted, fontSize: 14 }}>{page.subtitle}</p>

          {page.narration.map((para, i) => (
            <p key={i} style={{ fontSize: 14.5, lineHeight: 1.6, margin: '0 0 12px' }}>
              {para}
            </p>
          ))}

          <div
            style={{
              display: 'grid',
              gap: 10,
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            {page.keyPoints.map((kp) => (
              <div
                key={kp.title}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: 12,
                  borderRadius: 10,
                  background: THEME.secondary,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <div style={{ fontSize: 20, lineHeight: 1 }}>{kp.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{kp.title}</div>
                  <div style={{ fontSize: 13, color: THEME.muted, lineHeight: 1.45 }}>{kp.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: '#ECFDF5',
              border: `1px solid ${THEME.success}`,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#065F46' }}>Field tip: </strong>
            {page.clinicalTip}
          </div>

          {page.id === 7 && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                background: '#EEF2FF',
                border: `1px solid ${THEME.accent}`,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Ready for the knowledge check? Remember: 80% passes the <em>quiz</em>. Skills
              competency still requires observed demonstration and authorized sign-off under HR-TC-001.
            </div>
          )}
        </main>

        {/* RIGHT — scene */}
        <aside
          style={{
            padding: '16px 14px 24px',
            background: THEME.panel,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.muted, marginBottom: 8 }}>
            Interactive scene — tap hotspots
          </div>
          <InstructionalScene
            scene={page.scene}
            hotspots={page.hotspots}
            activeHotspot={activeHotspot}
            onSelect={selectHotspot}
            phase={phase}
          />
          <FeedbackBanner activeId={activeHotspot} hotspots={page.hotspots} />
        </aside>
      </div>

      {/* Footer nav */}
            <LVNNarrationFooter
        currentIndex={pageIndex}
        total={totalLearnPages}
        onPrevious={() => setPageIndex((p) => Math.max(0, p - 1))}
        previousDisabled={pageIndex === 0}
        onNext={() => {
          if (isLastLearn) {
            setMode('quiz');
          } else {
            setPageIndex((p) => p + 1);
            setActiveHotspot(null);
          }
        }}
        nextLabel={isLastLearn ? 'Start Quiz →' : 'Next Lesson →'}
        centerLabel={'Lesson ' + (pageIndex + 1) + ' of ' + totalLearnPages}
      />

      <style>{`
        @media (max-width: 900px) {
          .lvn012-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  background: THEME.primary,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14,
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 20px',
  background: '#fff',
  color: THEME.primaryDark,
  border: `1px solid ${THEME.primary}`,
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14,
};

export default LVN012SkillsCheckoffs;
