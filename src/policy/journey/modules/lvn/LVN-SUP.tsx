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
import { LvnGaoPlayer } from './LvnGaoPlayer';

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
const LVNSUPSupervisedVisits: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setAnimPhase((p) => (p + 1) % 360), 50);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setActiveHotspot(null);
  }, [pageIndex, quizMode]);

  const page = PAGES[pageIndex];
  const Scene = SCENES[pageIndex];
  const totalQ = QUIZ.length;
  const passCount = Math.ceil((MODULE_META.passing / 100) * totalQ);
  const percent = Math.round((score / totalQ) * 100);
  const passed = score >= passCount;

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[Number(k)] !== undefined).length,
    [answers],
  );

  const submitQuiz = useCallback(() => {
    let s = 0;
    QUIZ.forEach((q, i) => {
      if (answers[i] === q.correct) s += 1;
    });
    setScore(s);
    setSubmitted(true);
    setReviewMode(true);
  }, [answers]);

  const retryQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setReviewMode(false);
  }, []);

  const selectAnswer = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  };

  const goNext = () => {
    if (quizMode) return;
    if (pageIndex < PAGES.length - 1) setPageIndex((p) => p + 1);
    else setQuizMode(true);
  };

  const goPrev = () => {
    if (quizMode) {
      setQuizMode(false);
      setPageIndex(PAGES.length - 1);
      return;
    }
    setPageIndex((p) => Math.max(0, p - 1));
  };

  const progressPct = quizMode
    ? 100
    : Math.round(((pageIndex + 1) / (PAGES.length + 1)) * 100);

  if (!quizMode && page) {
    return (
      <LvnGaoPlayer
        pages={PAGES}
        pageIndex={pageIndex}
        onSelectPage={(index) => {
          setPageIndex(index);
          setActiveHotspot(null);
        }}
        onPrevious={goPrev}
        onNext={goNext}
        nextLabel={pageIndex < PAGES.length - 1 ? 'Next Lesson →' : 'Start Knowledge Check →'}
        renderLeft={(currentPage) => (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, color: THEME.primaryDark }}>
              {currentPage.title}
            </h2>
            <p style={{ margin: '0 0 16px', color: THEME.muted, fontSize: 14 }}>
              {currentPage.subtitle}
            </p>

            {currentPage.narration.map((para, i) => (
              <p
                key={i}
                style={{
                  margin: '0 0 12px',
                  lineHeight: 1.6,
                  fontSize: 14.5,
                  color: THEME.dark,
                }}
              >
                {para}
              </p>
            ))}

            <div
              style={{
                display: 'grid',
                gap: 10,
                margin: '18px 0',
              }}
            >
              {currentPage.keyPoints.map((kp) => (
                <div
                  key={kp.title}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: THEME.secondary,
                    border: '1px solid #DDD6FE',
                  }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{kp.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{kp.title}</div>
                    <div style={{ fontSize: 13, color: THEME.muted, marginTop: 2 }}>
                      {kp.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: '#FFFBEB',
                border: `1px solid ${THEME.accent}`,
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              <strong style={{ color: '#B45309' }}>Clinical tip: </strong>
              {currentPage.clinicalTip}
            </div>

            {currentPage.scopeNote && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: '#14532D',
                }}
              >
                <strong>Scope / regulatory note: </strong>
                {currentPage.scopeNote}
              </div>
            )}
          </>
        )}
        renderRight={(currentPage) => {
          const CurrentScene = SCENES[PAGES.indexOf(currentPage)];
          return (
            <>
              <div
                style={{
                  flex: 1,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `1px solid ${THEME.border}`,
                  background: THEME.white,
                  position: 'relative',
                  minHeight: 360,
                }}
              >
                <CurrentScene
                  activeHotspot={activeHotspot}
                  setActiveHotspot={setActiveHotspot}
                  hotspots={currentPage.hotspots}
                  animPhase={animPhase}
                />
              </div>
              <p style={{ margin: '10px 4px 0', fontSize: 12, color: THEME.muted }}>
                Interactive scene {pageIndex + 1}/7 — select hotspots for instructional feedback.
              </p>
            </>
          );
        }}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily:
          'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        color: THEME.dark,
        background: THEME.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: `linear-gradient(135deg, ${THEME.primaryDark}, ${THEME.primary})`,
          color: THEME.white,
          padding: '14px 20px',
          boxShadow: '0 2px 10px rgba(91,33,182,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.9, letterSpacing: 0.4 }}>
              {MODULE_META.id} · v{MODULE_META.version} · CAPSTONE
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>
              {MODULE_META.title}
            </h1>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
              {MODULE_META.track} · {MODULE_META.cms} · {MODULE_META.policy}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>
              {quizMode ? 'Knowledge Check' : `Page ${pageIndex + 1} of ${PAGES.length}`}
            </div>
            <div style={{ opacity: 0.9 }}>{MODULE_META.status}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            height: 8,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: THEME.accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </header>

      {/* Body */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: quizMode ? '1fr' : 'minmax(0, 55%) minmax(280px, 45%)',
          gap: 0,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* LEFT */}
        <section
          style={{
            padding: 20,
            overflow: 'auto',
            background: THEME.panel,
            borderRight: quizMode ? 'none' : `1px solid ${THEME.border}`,
          }}
        >
          {!quizMode && page && (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, color: THEME.primaryDark }}>
                {page.title}
              </h2>
              <p style={{ margin: '0 0 16px', color: THEME.muted, fontSize: 14 }}>
                {page.subtitle}
              </p>

              {page.narration.map((para, i) => (
                <p
                  key={i}
                  style={{
                    margin: '0 0 12px',
                    lineHeight: 1.6,
                    fontSize: 14.5,
                    color: THEME.dark,
                  }}
                >
                  {para}
                </p>
              ))}

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  margin: '18px 0',
                }}
              >
                {page.keyPoints.map((kp) => (
                  <div
                    key={kp.title}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: THEME.secondary,
                      border: '1px solid #DDD6FE',
                    }}
                  >
                    <div style={{ fontSize: 22, lineHeight: 1 }}>{kp.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{kp.title}</div>
                      <div style={{ fontSize: 13, color: THEME.muted, marginTop: 2 }}>
                        {kp.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: '#FFFBEB',
                  border: `1px solid ${THEME.accent}`,
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                <strong style={{ color: '#B45309' }}>Clinical tip: </strong>
                {page.clinicalTip}
              </div>

              {page.scopeNote && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: '#14532D',
                  }}
                >
                  <strong>Scope / regulatory note: </strong>
                  {page.scopeNote}
                </div>
              )}
            </>
          )}

          {quizMode && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, color: THEME.primaryDark }}>
                Knowledge Check — 10 Questions
              </h2>
              <p style={{ margin: '0 0 8px', color: THEME.muted, fontSize: 14 }}>
                Pass threshold: {MODULE_META.passing}% ({passCount}/{totalQ}). This quiz validates{' '}
                <strong>knowledge only</strong>. Practical competency requires observed supervised
                visits, Appendix E rubric scoring, remediation if needed, and authorized sign-off.
              </p>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: THEME.primaryDark, fontWeight: 600 }}>
                Answered: {answeredCount}/{totalQ}
              </p>

              {QUIZ.map((q, qi) => {
                const selected = answers[qi];
                const showReview = submitted && reviewMode;
                return (
                  <div
                    key={q.id}
                    style={{
                      marginBottom: 16,
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${
                        showReview
                          ? selected === q.correct
                            ? THEME.success
                            : THEME.danger
                          : THEME.border
                      }`,
                      background: THEME.white,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                      {qi + 1}. {q.stem}
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {q.options.map((opt, oi) => {
                        const letter = ['A', 'B', 'C', 'D'][oi];
                        const isSel = selected === oi;
                        const isCorrect = q.correct === oi;
                        let bg = THEME.secondary;
                        let border = '#DDD6FE';
                        if (showReview) {
                          if (isCorrect) {
                            bg = '#D1FAE5';
                            border = THEME.success;
                          } else if (isSel && !isCorrect) {
                            bg = '#FEE2E2';
                            border = THEME.danger;
                          }
                        } else if (isSel) {
                          bg = '#EDE9FE';
                          border = THEME.primary;
                        }
                        return (
                          <label
                            key={oi}
                            style={{
                              display: 'flex',
                              gap: 10,
                              alignItems: 'flex-start',
                              padding: '10px 12px',
                              borderRadius: 8,
                              background: bg,
                              border: `1px solid ${border}`,
                              cursor: submitted ? 'default' : 'pointer',
                              fontSize: 13.5,
                              lineHeight: 1.4,
                            }}
                          >
                            <input
                              type="radio"
                              name={`q-${qi}`}
                              checked={isSel || false}
                              disabled={submitted}
                              onChange={() => selectAnswer(qi, oi)}
                              style={{ marginTop: 3 }}
                            />
                            <span>
                              <strong>{letter}.</strong> {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {showReview && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          borderRadius: 8,
                          background: '#F8FAFC',
                          fontSize: 12.5,
                          lineHeight: 1.45,
                          color: THEME.dark,
                        }}
                      >
                        <strong>Rationale: </strong>
                        {q.rationale}
                      </div>
                    )}
                  </div>
                );
              })}

              {!submitted ? (
                <button
                  type="button"
                  onClick={submitQuiz}
                  disabled={answeredCount < totalQ}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: answeredCount < totalQ ? '#A78BFA' : THEME.primary,
                    color: THEME.white,
                    fontWeight: 700,
                    cursor: answeredCount < totalQ ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                  }}
                >
                  Submit Quiz
                </button>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: passed ? '#D1FAE5' : '#FEE2E2',
                    border: `2px solid ${passed ? THEME.success : THEME.danger}`,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: passed ? '#065F46' : '#991B1B',
                    }}
                  >
                    Score: {score}/{totalQ} ({percent}%) — {passed ? 'PASSED (knowledge)' : 'Not passed'}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.5 }}>
                    {passed
                      ? 'You met the knowledge threshold for LVN-SUP. This does not by itself authorize independent caseload. Complete the number of supervised visits required by current agency policy, achieve Appendix E pass scores, finish remediation if assigned, and obtain authorized sign-off.'
                      : `You need ${passCount}/${totalQ} (${MODULE_META.passing}%) to pass. Review rationales, retry the quiz, and re-read pages on policy counts, Appendix E, progressive independence, and sign-off.`}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={retryQuiz}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: THEME.primary,
                        color: THEME.white,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Retry Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewMode((r) => !r)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: `1px solid ${THEME.primary}`,
                        background: THEME.white,
                        color: THEME.primary,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {reviewMode ? 'Hide Review' : 'Show Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizMode(false);
                        setPageIndex(0);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.secondary,
                        color: THEME.dark,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Review Module Pages
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT */}
        {!quizMode && page && Scene && (
          <aside
            style={{
              padding: 16,
              background: THEME.bg,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                flex: 1,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${THEME.border}`,
                background: THEME.white,
                position: 'relative',
                minHeight: 360,
              }}
            >
              <Scene
                activeHotspot={activeHotspot}
                setActiveHotspot={setActiveHotspot}
                hotspots={page.hotspots}
                animPhase={animPhase}
              />
            </div>
            <p style={{ margin: '10px 4px 0', fontSize: 12, color: THEME.muted }}>
              Interactive scene {pageIndex + 1}/7 — select hotspots for instructional feedback.
            </p>
          </aside>
        )}
      </main>

      {/* Footer nav */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderTop: `1px solid ${THEME.border}`,
          background: THEME.white,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={!quizMode && pageIndex === 0}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: `1px solid ${THEME.primary}`,
            background: THEME.white,
            color: THEME.primary,
            fontWeight: 600,
            cursor: !quizMode && pageIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: !quizMode && pageIndex === 0 ? 0.4 : 1,
          }}
        >
          ← Previous
        </button>

        <div style={{ fontSize: 12, color: THEME.muted, textAlign: 'center' }}>
          {MODULE_META.id} · Record {MODULE_META.recordId}
        </div>

        {!quizMode ? (
          <button
            type="button"
            onClick={goNext}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: THEME.primary,
              color: THEME.white,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {pageIndex < PAGES.length - 1 ? 'Next →' : 'Start Knowledge Check →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setQuizMode(false)}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: `1px solid ${THEME.primary}`,
              background: THEME.secondary,
              color: THEME.primaryDark,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Content
          </button>
        )}
      </footer>
    </div>
  );
};

export default LVNSUPSupervisedVisits;
