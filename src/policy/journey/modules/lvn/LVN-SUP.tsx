// @ts-nocheck
import { Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, X, AlertCircle, ShieldCheck, Compass } from 'lucide-react';
/**
 * LVN-SUP — Supervised Patient Visits
 * Track: LVN — Licensed Vocational Nurse
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record: 6a558e063463cd690af8d638
 * Regulatory: 42 CFR § 484.115(c); agency policy HR-TA-005 § 6.3; Appendix E evaluation
 * CAPSTONE — supervised competency module (quiz = knowledge only)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ─── MODULE METADATA ─────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-SUP',
  title: 'Supervised Patient Visits',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.115(c)',
  policy: 'HR-TA-005 § 6.3 | Appendix E (Supervised Visit Form)',
  recordId: '6a558e063463cd690af8d638',
  themeColor: '#7C3AED',
};

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
  scopeNote?: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
}

interface SceneProps {
  activeHotspot: string | null;
  setActiveHotspot: (id: string | null) => void;
  hotspots: Hotspot[];
  animPhase: number;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  secondary: '#F5F3FF',
  accent: '#F59E0B',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  bg: '#FAF5FF',
  white: '#FFFFFF',
  border: '#E2E8F0',
  panel: '#FFFFFF',
};

// ─── PAGE CONTENT ────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'From Classroom to Caseload',
    subtitle: 'Capstone practicum — supervised visits under an RN preceptor',
    narration: [
      'Welcome to Module LVN-SUP: Supervised Patient Visits, the final module in your LVN track at Care Indeed Home Health Care. This is not another didactic module with lectures and reading alone. It is the clinical practicum that bridges your training and independent field practice. Everything you have learned in modules LVN-001 through LVN-012, plus the entire GAO track, is applied in real patient encounters under the direct supervision of an RN preceptor.',
      'Agency policy HR-TA-005 § 6.3 governs supervised patient visits. You must complete the number of supervised visits required by current agency policy for your experience category. Counts may differ for clinicians with recent home health experience versus those new to home health (or whose home health experience is older than the policy window). These requirements are set by current policy—not by this quiz. Your preceptor may extend the supervised period beyond the policy minimum if additional observation is needed to confirm readiness.',
      'The supervised visit period serves two purposes. First, it lets you apply didactic training in the real clinical environment with the safety net of an experienced RN who can observe and intervene if needed. The home health environment differs from institutional settings: every home is different, supplies are limited to what you carry, and clinical complexity is often high because patients manage multiple chronic conditions. Second, the period gives the agency documented evidence that you can perform safely before independent field authorization. Federal Conditions of Participation require agencies to verify clinician qualifications and competency; agency policy operationalizes how that verification is documented for orientation supervised visits.',
      'Passing the knowledge check in this module validates knowledge only. Practical competency is determined by observed supervised visits, Appendix E rubric scoring, any required remediation, and authorized sign-off.',
    ],
    keyPoints: [
      {
        icon: '🎓',
        title: 'Capstone bridge',
        detail:
          'LVN-SUP applies LVN-001–012 and GAO learning in real visits under RN preceptor observation—not lecture alone.',
      },
      {
        icon: '📋',
        title: 'Count = current agency policy',
        detail:
          'Complete the number of supervised visits required by current agency policy for your experience category. Preceptors may extend observation when needed.',
      },
      {
        icon: '⚖️',
        title: 'Knowledge vs practical competency',
        detail:
          'Quiz pass ≠ field clearance. Observed visits, rubric scores, remediation, and authorized signatures determine practical competency.',
      },
    ],
    clinicalTip:
      'Confirm your required supervised visit count with the clinical educator before your first preceptor assignment. Do not rely on memory of “standard” numbers from prior employers.',
    scopeNote:
      'Federal: agency must verify qualifications/competency under CoPs (incl. personnel qualifications framing at 42 CFR § 484.115). Agency policy: HR-TA-005 § 6.3 and Appendix E operationalize visit counts, scoring, and clearance. This module does not invent universal visit minima.',
    hotspots: [
      {
        id: 'p1-policy',
        label: 'HR-TA-005 § 6.3',
        x: 18,
        y: 22,
        info: 'Agency policy controls supervised visit requirements, evaluation tool, and progressive independence expectations.',
      },
      {
        id: 'p1-count',
        label: 'Policy-required count',
        x: 50,
        y: 48,
        info: 'Complete the number required by current agency policy for your experience category—not a fixed universal number from this quiz.',
      },
      {
        id: 'p1-evidence',
        label: 'Documented evidence',
        x: 82,
        y: 28,
        info: 'Appendix E evaluations create the agency’s documented evidence of supervised performance before independent authorization.',
      },
      {
        id: 'p1-knowledge',
        label: 'Quiz = knowledge only',
        x: 70,
        y: 72,
        info: 'Passing this knowledge check does not clear you for independent caseload. Observed visits and authorized sign-off still apply.',
      },
    ],
  },
  {
    id: 2,
    title: 'Your RN Preceptor',
    subtitle: 'Mentor, observer, evaluator — not your employment supervisor alone',
    narration: [
      'Your RN preceptor is assigned by the clinical educator or Director of Nursing (DON). The preceptor is an experienced RN trained for the preceptor role and familiar with the agency’s competency evaluation criteria. The preceptor is not primarily your employment supervisor; the preceptor is your clinical mentor and evaluator during the supervised visit period.',
      'The preceptor’s role is observation, evaluation, and teaching. The preceptor observes performance from arrival through departure, scores competency domains using the Appendix E evaluation tool, and teaches through real-time guidance when you encounter unfamiliar situations and through post-visit debriefing.',
      'During the first supervised visit, the preceptor typically takes the lead while you observe. You watch visit flow, patient interaction style, time management, documentation approach, and infection control in the home. On subsequent visits you progressively assume the lead. Later visits should show you performing with the preceptor observing and available for questions. The preceptor intervenes when patient safety is at risk or when you request assistance.',
      'Build a relationship of trust and professional respect. Ask questions, admit uncertainty, and request demonstrations. Clinicians who seek guidance during orientation become safer independent practitioners than those who pretend to know everything.',
    ],
    keyPoints: [
      {
        icon: '👩‍⚕️',
        title: 'Assigned RN preceptor',
        detail:
          'Clinical educator or DON assigns a trained RN preceptor who uses Appendix E and agency competency criteria.',
      },
      {
        icon: '👁️',
        title: 'Observe → lead → independent under watch',
        detail:
          'Early visits: preceptor leads. Later visits: you lead with support, then perform with silent observation unless safety requires intervention.',
      },
      {
        icon: '🛑',
        title: 'When the preceptor intervenes',
        detail:
          'Intervene for patient safety risk or when you request help—not after every procedure and not “never.”',
      },
    ],
    clinicalTip:
      'Before each visit, agree on who leads, what skills you will demonstrate, and how you will signal for help without alarming the patient.',
    scopeNote:
      'LVN works under RN direction. The preceptor evaluates LVN performance; the LVN does not independently develop the Plan of Care, complete OASIS, diagnose, prescribe, or stage wounds when that is an RN/authorized clinician role.',
    hotspots: [
      {
        id: 'p2-assign',
        label: 'Assignment',
        x: 20,
        y: 30,
        info: 'Clinical educator or DON assigns the RN preceptor; preceptor is mentor/evaluator for the supervised period.',
      },
      {
        id: 'p2-observe',
        label: 'Observation',
        x: 48,
        y: 55,
        info: 'Preceptor observes arrival → departure and scores domains on Appendix E.',
      },
      {
        id: 'p2-teach',
        label: 'Teaching',
        x: 78,
        y: 32,
        info: 'Real-time guidance for unfamiliar situations plus structured post-visit debrief.',
      },
      {
        id: 'p2-safety',
        label: 'Safety intervene',
        x: 65,
        y: 75,
        info: 'Preceptor steps in if patient safety is at risk or if you request assistance.',
      },
    ],
  },
  {
    id: 3,
    title: 'The Supervised Visit Structure',
    subtitle: 'Pre-visit prep → clinical visit → post-visit debrief',
    narration: [
      'Each supervised visit follows a structured format with three phases: pre-visit preparation, the clinical visit, and post-visit debriefing. All three phases are evaluated and documented.',
      'Pre-visit preparation occurs before you arrive at the home. Review the chart: Plan of Care, recent visit notes, active orders, medication list, and alerts or precautions. Gather supplies for planned interventions. Verify address and schedule. The preceptor evaluates organization, clinical reasoning in supply selection, and chart-review thoroughness.',
      'The clinical visit is the core. Perform the visit as you would independently, following visit flow from didactic modules: patient identification, vital signs, focused assessment based on the care plan, skilled interventions as ordered, patient/caregiver education, medication management within LVN scope, and documentation. The preceptor observes and notes performance for debrief.',
      'Observation domains include clinical assessment accuracy and thoroughness, technical skill execution, documentation completeness and accuracy, patient and caregiver communication, safety and infection control compliance, and professional behavior. Weighted scoring is captured on the Appendix E form (see next page).',
      'Post-visit debrief occurs immediately after leaving the home or as soon as practical. Share self-assessment, discuss challenges, ask about clinical decisions, and seek guidance. The preceptor documents the debrief and action items for subsequent visits.',
    ],
    keyPoints: [
      {
        icon: '🗂️',
        title: 'Pre-visit prep',
        detail:
          'Chart review (POC, orders, meds, alerts), supplies, address/schedule verification—observed for organization and reasoning.',
      },
      {
        icon: '🏠',
        title: 'Clinical visit flow',
        detail:
          'ID → vitals → focused assessment → ordered skilled care → education → med management in scope → documentation.',
      },
      {
        icon: '💬',
        title: 'Debrief is two-way',
        detail:
          'Strengths, gaps, self-assessment, questions, and action items are documented for the next visit.',
      },
    ],
    clinicalTip:
      'Write three personal goals before the visit (for example: bag technique, wound procedure steps, concise note). Review them in debrief.',
    scopeNote:
      'LVN implements the RN/physician Plan of Care. Report condition changes to the RN case manager. Do not modify the POC or write new orders.',
    hotspots: [
      {
        id: 'p3-prep',
        label: 'Pre-visit',
        x: 18,
        y: 40,
        info: 'Chart review, supplies, schedule/address—preceptor scores preparation quality.',
      },
      {
        id: 'p3-clinical',
        label: 'Clinical visit',
        x: 50,
        y: 28,
        info: 'Full visit flow under observation; notes feed the debrief and Appendix E scores.',
      },
      {
        id: 'p3-debrief',
        label: 'Debrief',
        x: 82,
        y: 40,
        info: 'Two-way feedback with documented action items for progressive improvement.',
      },
      {
        id: 'p3-domains',
        label: 'Observed domains',
        x: 50,
        y: 72,
        info: 'Assessment, technical skill, documentation, communication, safety/IC, professionalism—mapped to Appendix E scoring.',
      },
    ],
  },
  {
    id: 4,
    title: 'The Appendix E Evaluation Tool',
    subtitle: 'HR-TA-005 Appendix E — standardized supervised visit scoring',
    narration: [
      'The Appendix E evaluation tool (HR-TA-005 — Supervised Visit Form) is the standardized instrument used to assess your performance during each supervised visit. Understanding the criteria helps you prepare and self-assess readiness.',
      'Appendix E evaluates weighted competency domains. Clinical assessment accounts for 25%: accurate vital signs, focused assessment relevant to the care plan, identifying changes from baseline, recognizing abnormal findings, and making appropriate judgments within LVN scope (including when to notify the RN). Technical execution accounts for 25%: safe, effective skilled interventions such as wound care within LVN role, medication administration accuracy, catheter care, specimen collection, and other ordered hands-on procedures.',
      'Documentation accounts for 20%: completeness, accuracy, timeliness, and clinical relevance. Notes should reflect findings, interventions, patient response, education, and communication of issues—using standardized terminology and meeting home health documentation expectations. Communication accounts for 15%: rapport, plain-language explanations, education, response to concerns, and appropriate escalation to the RN case manager. Safety and infection control accounts for 15%: standard precautions, hand hygiene, bag technique, sharps safety, patient identification, and environmental safety awareness.',
      'Agency policy commonly requires an overall passing score of 80% or higher on each supervised visit evaluation. If you score below the passing threshold on any visit, additional supervised visits and/or remediation are required per current policy. Do not self-declare readiness after a failed evaluation.',
    ],
    keyPoints: [
      {
        icon: '📊',
        title: 'Domain weights',
        detail:
          'Clinical assessment 25% · Technical execution 25% · Documentation 20% · Communication 15% · Safety/IC 15%.',
      },
      {
        icon: '✅',
        title: 'Pass threshold (agency form)',
        detail:
          'Meet the overall passing score on Appendix E for each evaluated visit (agency policy commonly uses 80%). Failures trigger more observation/remediation.',
      },
      {
        icon: '🔁',
        title: 'Remediation path',
        detail:
          'Below-threshold scores → additional supervised visits and targeted skill work—not automatic independent clearance.',
      },
    ],
    clinicalTip:
      'Self-score each domain after every visit before debrief. Compare your self-score with the preceptor’s Appendix E to calibrate judgment.',
    scopeNote:
      'Wound staging, OASIS, POC development/modification, diagnosis, and prescribing remain outside LVN independent authority. Technical domain scores only procedures within LVN scope and ordered plan.',
    hotspots: [
      {
        id: 'p4-assess',
        label: 'Assessment 25%',
        x: 22,
        y: 30,
        info: 'Vitals, focused assessment, baseline change recognition, and appropriate escalation judgments.',
      },
      {
        id: 'p4-tech',
        label: 'Technical 25%',
        x: 50,
        y: 22,
        info: 'Ordered skilled procedures performed safely and effectively within LVN scope.',
      },
      {
        id: 'p4-doc',
        label: 'Documentation 20%',
        x: 78,
        y: 30,
        info: 'Complete, accurate, timely, clinically relevant visit notes.',
      },
      {
        id: 'p4-comm',
        label: 'Communication 15%',
        x: 35,
        y: 70,
        info: 'Patient/caregiver rapport, education, and RN escalation when findings warrant.',
      },
      {
        id: 'p4-safe',
        label: 'Safety/IC 15%',
        x: 68,
        y: 72,
        info: 'Hand hygiene, bag technique, sharps, patient ID, environmental safety.',
      },
    ],
  },
  {
    id: 5,
    title: 'Progressive Independence',
    subtitle: 'Observation → guided lead → independent performance under watch',
    narration: [
      'The supervised visit period builds confidence and competence progressively. Each visit should show growth. Your preceptor evaluates absolute performance and trajectory of improvement.',
      'Early visit pattern (typical): Visit one is often an observation visit—the preceptor performs while you observe, take notes, and ask questions. Afterward, discuss clinical reasoning, time management, and documentation strategy. This sets the performance standard in a real home.',
      'Next phase: you transition into the lead clinician role with close preceptor support. You perform with real-time guidance as needed. The preceptor may prompt missed steps, redirect protocol deviations, or demonstrate techniques. Evaluation focuses on visit-flow independence and receptiveness to guidance.',
      'Later visits are independent performance visits: you complete the visit without prompting. The preceptor observes silently and intervenes only if patient safety is at risk. These visits are scored as readiness for independent practice. Complete the number of supervised visits required by current agency policy; additional visits—if required by policy or preceptor judgment—should demonstrate consistent performance across different patient types and clinical scenarios.',
      'If the preceptor identifies a significant competency concern, the preceptor reports to the clinical educator or DON promptly. The supervised period may be extended, additional training provided, or specific skills re-validated before visits continue. Remediation is a safety action, not a personal failure.',
    ],
    keyPoints: [
      {
        icon: '1️⃣',
        title: 'Observe first',
        detail:
          'Typical first visit: preceptor leads; you learn real-world flow, timing, and documentation habits.',
      },
      {
        icon: '2️⃣',
        title: 'Guided lead',
        detail:
          'You lead with prompts/redirects allowed; receptiveness to coaching is part of readiness.',
      },
      {
        icon: '3️⃣',
        title: 'Independent under watch',
        detail:
          'Silent observation unless safety risk; performance must meet Appendix E and policy count requirements.',
      },
    ],
    clinicalTip:
      'Ask the preceptor to schedule varied case types (wounds, med teaching, complex social dynamics) so adaptability—not a single familiar routine—is evaluated.',
    scopeNote:
      'Progressive independence never expands LVN scope. Complex findings still escalate to the RN; POC changes remain RN/physician authority.',
    hotspots: [
      {
        id: 'p5-obs',
        label: 'Observe',
        x: 18,
        y: 50,
        info: 'Preceptor leads; you watch reasoning, flow, and IC practices.',
      },
      {
        id: 'p5-guide',
        label: 'Guided lead',
        x: 50,
        y: 35,
        info: 'You perform with coaching; prompts and demos are expected learning tools.',
      },
      {
        id: 'p5-indep',
        label: 'Independent under watch',
        x: 82,
        y: 50,
        info: 'Silent observation; intervene only for safety or requested help.',
      },
      {
        id: 'p5-remed',
        label: 'Remediation gate',
        x: 50,
        y: 78,
        info: 'Competency concerns → educator/DON notification, extended observation, skill re-validation.',
      },
    ],
  },
  {
    id: 6,
    title: 'Common Challenges and How to Succeed',
    subtitle: 'Time, documentation, communication, environment, asking for help',
    narration: [
      'Orientation clinicians commonly face predictable challenges during supervised visits. Anticipating them improves performance.',
      'Time management is frequently cited. Routine skilled nursing visits often target about 45–60 minutes by agency scheduling norms, but treat targets as operational guidance—not a reason to skip safety or assessment. New clinicians run long when visit flow is unfamiliar, documentation is slow, or assessment priorities are unclear. Improve by reviewing the chart thoroughly, organizing supplies before entry, following a consistent sequence, and practicing efficient EHR documentation.',
      'Documentation is the second common challenge: notes that are too brief, missing required elements, or padded with irrelevant detail. Effective home health documentation is focused, objective, and clinically relevant. Every statement should justify the visit, describe findings, document interventions, record patient response, or plan the next visit.',
      'Communication differs from institutional settings. You are a guest in the home. Balance rapport and social needs with clinical focus and time. Redirect gently when conversation leaves clinical priorities. Environment adaptation is constant: lighting, space, cleanliness, pets, family dynamics, and supply access vary. Perform procedures safely in imperfect settings; preceptor strategies help, but adaptability grows with experience.',
      'Asking for help is a skill, not a weakness. During supervised visits you have an experienced clinician present—use that resource for unfamiliar wounds (within scope/reporting limits), medication questions, difficult interactions, and documentation strategy. Knowledge gained here stays with you throughout your career.',
    ],
    keyPoints: [
      {
        icon: '⏱️',
        title: 'Time without cutting safety',
        detail:
          'Prep and sequence improve efficiency; never omit ID, critical assessment, or infection control to “make time.”',
      },
      {
        icon: '📝',
        title: 'Purpose-driven notes',
        detail:
          'Each statement: justify visit, findings, actions, response, or next plan—nothing decorative.',
      },
      {
        icon: '🙋',
        title: 'Ask early',
        detail:
          'Uncertainty → ask preceptor. Guessing during a graded observation is riskier than a clear question.',
      },
    ],
    clinicalTip:
      'If a home environment is unsafe (threats, severe sanitation hazards, missing essential equipment), stop, ensure safety, notify per agency policy, and document—do not improvise beyond scope to “finish” the visit.',
    scopeNote:
      'Medication order changes require authorized prescriber/RN process. LVN does not independently reconcile by changing orders or alter the POC.',
    hotspots: [
      {
        id: 'p6-time',
        label: 'Time management',
        x: 20,
        y: 28,
        info: 'Chart prep + supply setup + consistent flow reduce overtime without skipping safety.',
      },
      {
        id: 'p6-doc',
        label: 'Documentation',
        x: 50,
        y: 22,
        info: 'Focused, objective notes tied to findings, actions, response, and plan.',
      },
      {
        id: 'p6-comm',
        label: 'Home communication',
        x: 80,
        y: 30,
        info: 'Guest mindset: rapport plus firm, respectful redirection to clinical priorities.',
      },
      {
        id: 'p6-env',
        label: 'Environment',
        x: 35,
        y: 70,
        info: 'Adapt procedure setup to home constraints; escalate unsafe conditions per policy.',
      },
      {
        id: 'p6-help',
        label: 'Ask for help',
        x: 70,
        y: 72,
        info: 'Use the preceptor for clinical, interpersonal, and documentation coaching in real time.',
      },
    ],
  },
  {
    id: 7,
    title: 'Completion, Sign-Off, and Independent Practice',
    subtitle: 'Observed competency + authorized signatures — not quiz alone',
    narration: [
      'Completion of the supervised visit requirement is determined by the preceptor in consultation with the clinical educator and DON. Completion criteria include: you have completed the number of supervised visits required by current agency policy; you have achieved the passing score on Appendix E evaluations (agency policy commonly requires 80% or higher on each evaluated visit); the preceptor has documented a recommendation for independent practice on the final Appendix E; and required skills check-offs (including LVN-012) have been validated.',
      'Sign-off typically involves four parties. The RN preceptor signs the final Appendix E and independent practice recommendation. You sign acknowledging completion of the supervised period and understanding of independent practice responsibilities. The clinical educator reviews Appendix E evaluations, confirms competency criteria, and signs the aggregate review. The DON provides final authorization on the agency’s track completion / clearance document (as specified in current HR-TA-005 / related HR-TD forms), authorizing independent field practice within LVN scope.',
      'Independent practice does not mean unsupervised practice. You continue under the direction of the RN case manager for each patient. The RN develops the Plan of Care; you implement it. Report condition changes to the RN. Follow physician orders as communicated through the RN or directly when within LVN scope and agency process.',
      'You have finished the instructional content for LVN-SUP, the capstone of the LVN track. Combined with GAO and LVN-001 through LVN-012, this completes didactic preparation. To earn module credit for the knowledge component, pass the 10-question check at 80% or higher. Remember: quiz success validates knowledge only. Practical competency still depends on observed visits, rubric scoring, remediation if needed, and authorized sign-off.',
    ],
    keyPoints: [
      {
        icon: '📑',
        title: 'Completion criteria',
        detail:
          'Policy-required visit count + passing Appendix E scores + preceptor recommendation + skills check-offs validated.',
      },
      {
        icon: '✍️',
        title: 'Four-party sign-off',
        detail:
          'RN preceptor → you (learner) → clinical educator → DON final authorization per agency forms.',
      },
      {
        icon: '🔗',
        title: 'Still under RN direction',
        detail:
          '“Independent” means field-ready within LVN scope under RN case management—not autonomous practice.',
      },
    ],
    clinicalTip:
      'Keep copies/screenshots (per agency privacy rules) of completed Appendix E forms and clearance signatures until HR confirms your personnel file is complete.',
    scopeNote:
      'DON clearance authorizes independent visits within LVN scope and agency policy—not RN-level assessment ownership, prescribing, or POC authorship.',
    hotspots: [
      {
        id: 'p7-preceptor',
        label: 'Preceptor sign',
        x: 18,
        y: 40,
        info: 'Final Appendix E + recommendation for independent practice.',
      },
      {
        id: 'p7-learner',
        label: 'Learner acknowledge',
        x: 40,
        y: 55,
        info: 'You acknowledge supervised period completion and independent practice responsibilities.',
      },
      {
        id: 'p7-educator',
        label: 'Educator review',
        x: 62,
        y: 40,
        info: 'Aggregate Appendix E review and competency criteria confirmation.',
      },
      {
        id: 'p7-don',
        label: 'DON final',
        x: 84,
        y: 55,
        info: 'Final authorization on the agency clearance/track completion document.',
      },
      {
        id: 'p7-quiz',
        label: 'Knowledge only',
        x: 50,
        y: 82,
        info: '80% quiz = knowledge credit for this module. Field competency remains observation + sign-off.',
      },
    ],
  },
];

// ─── QUIZ (10 Q, balanced A=2 B=3 C=3 D=2) ───────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'How many supervised patient visits must an LVN complete before independent field authorization?',
    options: [
      'The number required by current agency policy for the clinician’s experience category (preceptor may extend)',
      'Always exactly two visits for every LVN, regardless of experience',
      'Always ten visits before any patient contact is allowed',
      'None — passing this quiz alone clears the LVN for independent caseload',
    ],
    correct: 0,
    rationale:
      'HR-TA-005 § 6.3 is implemented through current agency policy. Visit counts are policy-defined (and may vary by experience category); preceptors may extend observation. The knowledge quiz never replaces observed competency.',
  },
  {
    id: 2,
    stem: 'During a typical first supervised visit, what is the LVN’s primary role?',
    options: [
      'Perform the entire visit independently with the preceptor waiting in the car',
      'Observe the RN preceptor leading the visit while taking notes and asking questions',
      'Complete OASIS and revise the Plan of Care without RN involvement',
      'Document only and avoid any clinical observation',
    ],
    correct: 1,
    rationale:
      'Early progressive-independence design usually has the preceptor lead while the LVN observes flow, IC, communication, and documentation—then debriefs.',
  },
  {
    id: 3,
    stem: 'Which standardized tool is used to score each supervised visit?',
    options: [
      'Appendix A medication reconciliation worksheet only',
      'Appendix C payroll timesheet',
      'HR-TA-005 Appendix E (Supervised Visit Form)',
      'A self-scored informal checklist the LVN keeps privately',
    ],
    correct: 2,
    rationale:
      'Appendix E under HR-TA-005 is the supervised visit evaluation instrument used by the RN preceptor for domain scoring and readiness documentation.',
  },
  {
    id: 4,
    stem: 'Who provides the final authorization signature for independent practice clearance after supervised visits and reviews are complete?',
    options: [
      'The LVN alone after self-assessment',
      'Any HHA on the care team',
      'The patient or caregiver',
      'The Director of Nursing (DON) on the agency clearance / track completion document',
    ],
    correct: 3,
    rationale:
      'Sign-off is multi-party: preceptor, learner, clinical educator review, and DON final authorization per agency forms. The LVN cannot self-clear.',
  },
  {
    id: 5,
    stem: 'When should the RN preceptor intervene during a supervised visit in which the LVN is leading?',
    options: [
      'Never — intervention would invalidate the evaluation',
      'When patient safety is at risk or the LVN requests assistance',
      'After every procedure, regardless of performance',
      'Only after the visit is fully documented and the team has left the home',
    ],
    correct: 1,
    rationale:
      'Patient safety overrides silent observation. The preceptor also assists when the orientee asks. Routine interruption after every step is not the progressive model.',
  },
  {
    id: 6,
    stem: 'On the Appendix E weighting described in this module, which domains share the highest weight?',
    options: [
      'Communication and Safety only (15% each) as the largest domains',
      'Documentation alone at 50%',
      'Clinical assessment and technical execution (tied at 25% each)',
      'Professional attire scoring at 40%',
    ],
    correct: 2,
    rationale:
      'Clinical assessment (25%) and technical execution (25%) are the largest domains; documentation 20%; communication and safety/IC 15% each.',
  },
  {
    id: 7,
    stem: 'After DON clearance for “independent practice,” what is still true for the LVN?',
    options: [
      'The LVN continues to practice under RN case manager direction within LVN scope and the Plan of Care',
      'The LVN may independently develop and modify the Plan of Care without RN involvement',
      'The LVN may prescribe medications and diagnose new conditions',
      'The LVN no longer needs to report patient condition changes to the RN',
    ],
    correct: 0,
    rationale:
      'Independent field practice means authorized to visit without a preceptor beside you—not unsupervised autonomous practice. RN direction, POC limits, and escalation duties remain.',
  },
  {
    id: 8,
    stem: 'Which policy citation primarily governs supervised patient visits for orientation competency?',
    options: [
      'CL-SD-016 only, with no HR orientation linkage',
      'HR-TA-005 § 6.3 (agency orientation / supervised visit requirements)',
      'A social media guideline with no clinical competency section',
      'Pharmacy inventory policy OP-PH-999',
    ],
    correct: 1,
    rationale:
      'Supervised visits for role orientation competency are anchored to HR-TA-005 § 6.3 and Appendix E documentation, alongside federal personnel qualification expectations.',
  },
  {
    id: 9,
    stem: 'An LVN scores 100% on this module’s knowledge check but has not finished observed supervised visits. What is correct?',
    options: [
      'The LVN is fully cleared for independent caseload immediately',
      'The quiz grade replaces Appendix E scores',
      'The quiz validates knowledge only; practical competency still requires observed visits, rubric scoring, remediation if needed, and authorized sign-off',
      'The preceptor must ignore any further skill gaps because the quiz was perfect',
    ],
    correct: 2,
    rationale:
      'Capstone rule: knowledge assessment ≠ practical competency. Observed performance and signatures drive field clearance.',
  },
  {
    id: 10,
    stem: 'An LVN scores below the Appendix E passing threshold on a supervised visit. What should happen next?',
    options: [
      'Automatically discharge the patient from service',
      'Have the LVN silently self-declare readiness and skip further visits',
      'Continue independent caseload while “catching up” paperwork later',
      'Follow agency policy for additional supervised visits and/or remediation; notify educator/DON for significant concerns',
    ],
    correct: 3,
    rationale:
      'Below-threshold evaluations trigger more observation and remediation pathways. Significant competency concerns escalate to the clinical educator or DON. Self-clearance is not allowed.',
  },
];

// ─── HOTSPOT OVERLAY ─────────────────────────────────────────────────────────
const HotspotLayer: React.FC<SceneProps> = ({
  activeHotspot,
  setActiveHotspot,
  hotspots,
}) => {
  const active = hotspots.find((h) => h.id === activeHotspot);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {hotspots.map((h) => {
        const isOn = activeHotspot === h.id;
        return (
          <button
            key={h.id}
            type="button"
            aria-label={h.label}
            onClick={() => setActiveHotspot(isOn ? null : h.id)}
            style={{
              position: 'absolute',
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: `2px solid ${isOn ? THEME.accent : THEME.primary}`,
              background: isOn ? THEME.accent : 'rgba(124,58,237,0.15)',
              color: isOn ? THEME.dark : THEME.primary,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: isOn
                ? '0 0 0 6px rgba(245,158,11,0.25)'
                : '0 2px 6px rgba(0,0,0,0.12)',
              zIndex: 3,
            }}
          >
            {isOn ? '×' : 'i'}
          </button>
        );
      })}
      {active && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            background: 'rgba(30,41,59,0.94)',
            color: THEME.white,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12,
            lineHeight: 1.45,
            pointerEvents: 'auto',
            zIndex: 4,
            border: `1px solid ${THEME.accent}`,
          }}
        >
          <div style={{ fontWeight: 700, color: THEME.accent, marginBottom: 4 }}>
            {active.label}
          </div>
          {active.info}
        </div>
      )}
    </div>
  );
};

// ─── SVG SCENES ──────────────────────────────────────────────────────────────
const SceneLifecycleWheel: React.FC<SceneProps> = (props) => {
  const phases = [
    { label: 'Pre-Visit Prep', color: '#3B82F6' },
    { label: 'Arrival & Setup', color: '#8B5CF6' },
    { label: 'Clinical Care', color: '#7C3AED' },
    { label: 'Documentation', color: '#F59E0B' },
    { label: 'Debrief', color: '#10B981' },
  ];
  const cx = 160;
  const cy = 150;
  const r = 78;
  const activeIdx = Math.floor((props.animPhase / 72) % phases.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Supervised visit lifecycle wheel">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="28" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Supervised Visit Lifecycle
        </text>
        {phases.map((p, i) => {
          const a0 = (-90 + i * 72) * (Math.PI / 180);
          const a1 = (-90 + (i + 1) * 72) * (Math.PI / 180);
          const x0 = cx + r * Math.cos(a0);
          const y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          const large = 0;
          const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
          const mid = (-90 + i * 72 + 36) * (Math.PI / 180);
          const lx = cx + (r + 34) * Math.cos(mid);
          const ly = cy + (r + 34) * Math.sin(mid);
          const isActive = i === activeIdx;
          return (
            <g key={p.label}>
              <path
                d={d}
                fill={p.color}
                opacity={isActive ? 1 : 0.55}
                stroke={THEME.white}
                strokeWidth={2}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fill={THEME.dark}
                fontSize="9"
                fontWeight={isActive ? 700 : 500}
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={36} fill={THEME.white} stroke={THEME.primary} strokeWidth={3} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={THEME.primary} fontSize="11" fontWeight="700">
          LVN-SUP
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={THEME.muted} fontSize="9">
          Capstone
        </text>
        <text x="160" y="285" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Tap hotspots · phase highlight rotates
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const ScenePreceptorRadar: React.FC<SceneProps> = (props) => {
  const axes = ['Assessment', 'Documentation', 'Safety', 'Communication', 'Technical', 'Professionalism'];
  const scores = [0.85, 0.78, 0.92, 0.88, 0.82, 0.9];
  const cx = 160;
  const cy = 155;
  const maxR = 90;
  const pts = scores
    .map((s, i) => {
      const ang = (-90 + i * (360 / axes.length)) * (Math.PI / 180);
      return `${cx + maxR * s * Math.cos(ang)},${cy + maxR * s * Math.sin(ang)}`;
    })
    .join(' ');
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Preceptor evaluation radar">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Preceptor Evaluation Radar
        </text>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <circle
            key={t}
            cx={cx}
            cy={cy}
            r={maxR * t}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth={1}
          />
        ))}
        {axes.map((a, i) => {
          const ang = (-90 + i * (360 / axes.length)) * (Math.PI / 180);
          const x = cx + maxR * Math.cos(ang);
          const y = cy + maxR * Math.sin(ang);
          const lx = cx + (maxR + 22) * Math.cos(ang);
          const ly = cy + (maxR + 22) * Math.sin(ang);
          return (
            <g key={a}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#DDD6FE" strokeWidth={1} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={THEME.dark} fontSize="9" fontWeight="600">
                {a}
              </text>
            </g>
          );
        })}
        <polygon points={pts} fill="rgba(124,58,237,0.25)" stroke={THEME.primary} strokeWidth={2} />
        {scores.map((s, i) => {
          const ang = (-90 + i * (360 / axes.length)) * (Math.PI / 180);
          return (
            <circle
              key={i}
              cx={cx + maxR * s * Math.cos(ang)}
              cy={cy + maxR * s * Math.sin(ang)}
              r={4}
              fill={THEME.accent}
            />
          );
        })}
        <text x="160" y="285" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Illustrative profile · Appendix E drives formal scores
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneVisitStructure: React.FC<SceneProps> = (props) => {
  const phases = [
    {
      title: 'Pre-Visit Prep',
      items: ['Chart / POC review', 'Orders & meds', 'Supplies & address'],
      color: '#3B82F6',
    },
    {
      title: 'Clinical Visit',
      items: ['ID + vitals', 'Focused assess', 'Skilled care + edu'],
      color: '#7C3AED',
    },
    {
      title: 'Post-Visit Debrief',
      items: ['Strengths / gaps', 'Self-assessment', 'Action items'],
      color: '#10B981',
    },
  ];
  const active = Math.floor((props.animPhase / 100) % phases.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Supervised visit three-phase structure">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Supervised Visit Structure
        </text>
        <text x="160" y="44" textAnchor="middle" fill={THEME.muted} fontSize="10">
          All three phases are observed and documented
        </text>
        {phases.map((p, i) => {
          const x = 18 + i * 102;
          const on = i === active;
          return (
            <g key={p.title}>
              {i < phases.length - 1 && (
                <polygon
                  points={`${x + 88},120 ${x + 98},128 ${x + 88},136`}
                  fill="#C4B5FD"
                />
              )}
              <rect
                x={x}
                y={58}
                width={92}
                height={160}
                rx={12}
                fill={on ? p.color : THEME.white}
                stroke={on ? p.color : '#C4B5FD'}
                strokeWidth={2}
                opacity={on ? 1 : 0.95}
              />
              <text
                x={x + 46}
                y={82}
                textAnchor="middle"
                fill={on ? THEME.white : THEME.dark}
                fontSize="10"
                fontWeight="700"
              >
                {p.title}
              </text>
              {p.items.map((it, j) => (
                <text
                  key={it}
                  x={x + 46}
                  y={112 + j * 28}
                  textAnchor="middle"
                  fill={on ? '#EDE9FE' : THEME.muted}
                  fontSize="9"
                >
                  {it}
                </text>
              ))}
            </g>
          );
        })}
        <text x="160" y="250" textAnchor="middle" fill={THEME.primaryDark} fontSize="11" fontWeight="700">
          Prep → Clinical → Debrief
        </text>
        <text x="160" y="270" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Domains map to Appendix E scoring next
        </text>
        <text x="160" y="288" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Required visit total still set by current agency policy
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneAppendixERubric: React.FC<SceneProps> = (props) => {
  const rows = [
    { name: 'Clinical Assessment', w: 25, color: '#3B82F6' },
    { name: 'Technical Execution', w: 25, color: '#7C3AED' },
    { name: 'Documentation', w: 20, color: '#F59E0B' },
    { name: 'Communication', w: 15, color: '#10B981' },
    { name: 'Safety & IC', w: 15, color: '#EC4899' },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Appendix E scoring rubric">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Appendix E Domain Weights
        </text>
        <text x="160" y="44" textAnchor="middle" fill={THEME.muted} fontSize="10">
          HR-TA-005 Supervised Visit Form
        </text>
        {rows.map((r, i) => {
          const y = 62 + i * 36;
          const barW = r.w * 7.2;
          return (
            <g key={r.name}>
              <text x="16" y={y + 12} fill={THEME.dark} fontSize="10" fontWeight="600">
                {r.name}
              </text>
              <rect x="150" y={y} width={180} height="18" rx="4" fill="#EDE9FE" />
              <rect x="150" y={y} width={barW} height="18" rx="4" fill={r.color} />
              <text x={150 + barW + 6} y={y + 13} fill={THEME.dark} fontSize="10" fontWeight="700">
                {r.w}%
              </text>
            </g>
          );
        })}
        <rect x="40" y="248" width="240" height="32" rx="8" fill="#D1FAE5" stroke={THEME.success} />
        <text x="160" y="268" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
          Pass threshold: agency form (commonly 80%)
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneReadinessGate: React.FC<SceneProps> = (props) => {
  const stages = [
    { t: 'Observe', d: 'Preceptor leads' },
    { t: 'Guided', d: 'You lead + coach' },
    { t: 'Independent', d: 'Silent watch' },
    { t: 'Remediate', d: 'If gaps found' },
  ];
  const active = Math.floor((props.animPhase / 90) % stages.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Progressive independence readiness gate">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="28" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Progressive Independence Gate
        </text>
        {stages.map((s, i) => {
          const x = 24 + i * 74;
          const on = i === active;
          return (
            <g key={s.t}>
              {i < stages.length - 1 && (
                <line
                  x1={x + 56}
                  y1={110}
                  x2={x + 74}
                  y2={110}
                  stroke="#C4B5FD"
                  strokeWidth={3}
                  strokeDasharray="4 3"
                />
              )}
              <rect
                x={x}
                y={70}
                width={60}
                height={80}
                rx={10}
                fill={on ? THEME.primary : THEME.white}
                stroke={on ? THEME.primaryDark : '#C4B5FD'}
                strokeWidth={2}
              />
              <text
                x={x + 30}
                y={105}
                textAnchor="middle"
                fill={on ? THEME.white : THEME.dark}
                fontSize="10"
                fontWeight="700"
              >
                {s.t}
              </text>
              <text
                x={x + 30}
                y={125}
                textAnchor="middle"
                fill={on ? '#EDE9FE' : THEME.muted}
                fontSize="8"
              >
                {s.d}
              </text>
            </g>
          );
        })}
        <rect x="30" y="180" width="260" height="90" rx="12" fill={THEME.white} stroke="#DDD6FE" />
        <text x="160" y="208" textAnchor="middle" fill={THEME.primaryDark} fontSize="12" fontWeight="700">
          Readiness is trajectory + scores
        </text>
        <text x="160" y="230" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Significant gaps → educator/DON + extended observation
        </text>
        <text x="160" y="250" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Complete the number required by current agency policy
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

/** Page 6 — challenges map (matches time / doc / communication / environment / ask-for-help hotspots) */
const SceneChallenges: React.FC<SceneProps> = (props) => {
  const cards = [
    { title: 'Time', tip: 'Prep + flow', x: 18, y: 52, w: 90, h: 88, color: '#3B82F6' },
    { title: 'Documentation', tip: 'Purpose-driven', x: 115, y: 52, w: 90, h: 88, color: '#F59E0B' },
    { title: 'Communication', tip: 'Guest + focus', x: 212, y: 52, w: 90, h: 88, color: '#8B5CF6' },
    { title: 'Environment', tip: 'Adapt safely', x: 50, y: 160, w: 100, h: 88, color: '#10B981' },
    { title: 'Ask for help', tip: 'Use preceptor', x: 170, y: 160, w: 100, h: 88, color: '#EC4899' },
  ];
  const active = Math.floor((props.animPhase / 72) % cards.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Common supervised visit challenges">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Common Challenges Map
        </text>
        <text x="160" y="44" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Succeed without cutting safety or scope
        </text>
        {cards.map((c, i) => {
          const on = i === active;
          return (
            <g key={c.title}>
              <rect
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx={12}
                fill={on ? c.color : THEME.white}
                stroke={on ? c.color : '#C4B5FD'}
                strokeWidth={2}
              />
              <text
                x={c.x + c.w / 2}
                y={c.y + 34}
                textAnchor="middle"
                fill={on ? THEME.white : THEME.dark}
                fontSize="11"
                fontWeight="700"
              >
                {c.title}
              </text>
              <text
                x={c.x + c.w / 2}
                y={c.y + 56}
                textAnchor="middle"
                fill={on ? '#EDE9FE' : THEME.muted}
                fontSize="9"
              >
                {c.tip}
              </text>
            </g>
          );
        })}
        <text x="160" y="275" textAnchor="middle" fill={THEME.primaryDark} fontSize="10" fontWeight="700">
          Tap hotspots for coaching cues
        </text>
        <text x="160" y="290" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Unsafe home → stop, notify per policy, document
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

/** Page 7 — four-party sign-off chain + knowledge-only inset */
const SceneSignOffFlow: React.FC<SceneProps> = (props) => {
  const parties = [
    { label: 'RN Preceptor', sub: 'Appendix E + recommend' },
    { label: 'LVN Learner', sub: 'Acknowledge duties' },
    { label: 'Clin. Educator', sub: 'Aggregate review' },
    { label: 'DON', sub: 'Final authorization' },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Competency sign-off flow">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="22" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Competency Sign-Off Flow
        </text>
        <text x="160" y="38" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Observed visits + rubric + authorized signatures
        </text>
        {parties.map((p, i) => {
          const y = 46 + i * 42;
          return (
            <g key={p.label}>
              {i > 0 && (
                <line x1="70" y1={y - 6} x2="70" y2={y + 2} stroke={THEME.primary} strokeWidth={2} />
              )}
              <circle cx="70" cy={y + 14} r="14" fill={i === 3 ? THEME.accent : THEME.primary} />
              <text x="70" y={y + 18} textAnchor="middle" fill={THEME.white} fontSize="11" fontWeight="700">
                {i + 1}
              </text>
              <rect x="100" y={y} width="190" height="30" rx="8" fill={THEME.white} stroke="#DDD6FE" />
              <text x="112" y={y + 12} fill={THEME.dark} fontSize="11" fontWeight="700">
                {p.label}
              </text>
              <text x="112" y={y + 24} fill={THEME.muted} fontSize="9">
                {p.sub}
              </text>
            </g>
          );
        })}
        <rect x="28" y="222" width="264" height="60" rx="10" fill={THEME.primary} />
        <text x="160" y="244" textAnchor="middle" fill={THEME.white} fontSize="11" fontWeight="700">
          Quiz = knowledge only
        </text>
        <text x="160" y="262" textAnchor="middle" fill="#EDE9FE" fontSize="9">
          Field clearance needs policy visit count + Appendix E + this chain
        </text>
        <text x="160" y="292" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Still practice under RN case manager direction
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SCENES: React.FC<SceneProps>[] = [
  SceneLifecycleWheel,
  ScenePreceptorRadar,
  SceneVisitStructure,
  SceneAppendixERubric,
  SceneReadinessGate,
  SceneChallenges,
  SceneSignOffFlow,
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────



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
            <div className="text-[12px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase">MODULE LVN-SUP</div>
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

export default function LVNSUP() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);

  // In actual implementation, QUIZ might be an array or QUIZZES object.
  // @ts-ignore
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
