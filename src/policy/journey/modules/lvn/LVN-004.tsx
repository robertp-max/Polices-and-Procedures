/**
 * LVN-004 — Clinical Documentation Standards
 * Track: LVN — Licensed Vocational Nurse
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record: 6a558a1a3463cd690af8d62f
 * Regulatory: 42 CFR § 484.110(a); 42 CFR § 409.42 (homebound concept);
 *             CA B&P § 2859 (LVN scope); agency documentation / co-sign policy
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LvnLeftPanel } from './LvnLeftPanel';
import { LvnGaoPlayer } from './LvnGaoPlayer';
import { LvnSceneModal } from './LvnSceneModal';

// ─── MODULE METADATA ─────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-004',
  title: 'Clinical Documentation Standards',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.110(a); 42 CFR § 409.42',
  policy: 'Agency visit-note / co-signature standards | CA B&P § 2859',
  recordId: '6a558a1a3463cd690af8d62f',
  themeColor: '#0F766E',
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
  primary: '#0F766E',
  primaryDark: '#115E59',
  secondary: '#F0FDFA',
  accent: '#F59E0B',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  bg: '#F0FDFA',
  white: '#FFFFFF',
  border: '#E2E8F0',
  panel: '#FFFFFF',
};

// ─── PAGE CONTENT ────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Why Documentation Defines Your Practice',
    subtitle: 'Your visit note is the legal, clinical, and billing record of home care',
    narration: [
      'As a Licensed Vocational Nurse in home health, your clinical documentation is the single most important product of every patient visit. In the home health model, your documentation is often the only tangible evidence that a visit occurred, that skilled services were provided, that the patient condition was observed and reported, that interventions were delivered as ordered, and that the Plan of Care (POC) was followed within your LVN scope. Unlike a hospital where multiple clinicians co-observe care delivery, in home health you are frequently the sole witness to the clinical encounter. Your documentation must stand alone as a complete, accurate, defensible record.',
      'Documentation serves five critical functions simultaneously. First, it is a clinical communication tool: the RN case manager, physician, and other interdisciplinary team members rely on your visit notes to understand the patient\'s current status. Second, it is the legal record—the practical standard is that if it was not documented, it cannot be defended as done. Third, it supports Medicare coverage and billing integrity: notes that fail skilled-service justification may be non-billable and, if billed without support, create compliance risk under false-claims frameworks. Fourth, it feeds quality measurement and the agency QAPI program. Fifth, it supports survey readiness for accreditation and state surveyors who sample visit notes for specificity, timeliness, and POC alignment.',
      'Under federal regulation 42 CFR § 484.110(a), home health agencies must maintain a clinical record for each patient that includes, among other required elements, documentation of all services provided. California Business and Professions Code § 2859 defines the LVN scope of practice; you document and perform only within that scope under RN direction. Agency policy operationalizes formats (such as SOAP), submission timelines, vital-sign sets, and co-signature workflows—those operational details are agency standards unless a statute or federal rule expressly requires them.',
      'Passing the knowledge check in this module validates documentation knowledge only. Observed clinical performance, RN co-signature review, competency check-offs, and authorized sign-off remain separate requirements for practical competency.',
    ],
    keyPoints: [
      {
        icon: '📝',
        title: 'Sole-witness record',
        detail:
          'In home health your note often stands alone as proof of the visit, skilled care, observations, teaching, and POC adherence within LVN scope.',
      },
      {
        icon: '⚖️',
        title: 'Five simultaneous functions',
        detail:
          'Clinical communication, legal record, billing/coverage support, quality/QAPI input, and survey readiness—all from the same note.',
      },
      {
        icon: '🏛️',
        title: 'Federal vs CA vs agency',
        detail:
          '§ 484.110(a) requires clinical records; CA B&P § 2859 bounds LVN scope; agency policy sets SOAP, 24-hour targets, and co-sign deadlines.',
      },
    ],
    clinicalTip:
      'Before you leave the driveway, ask: “Could an RN who was not with me understand what I found, what I did, why it was skilled, and what must happen next?”',
    scopeNote:
      'Federal: 42 CFR § 484.110(a) clinical records. California: B&P § 2859 LVN scope under direction. Agency policy: note format, submission window, and co-signature timeline. LVNs do not independently complete OASIS, develop/modify the POC, diagnose, prescribe, or stage wounds when staging is an RN/authorized clinician role.',
    hotspots: [
      {
        id: 'p1-clinical',
        label: 'Clinical communication',
        x: 18,
        y: 28,
        info: 'RN case managers, physicians, and IDT members rely on your note for current status, teaching, and change-in-condition cues.',
      },
      {
        id: 'p1-legal',
        label: 'Legal record',
        x: 50,
        y: 22,
        info: 'If it is not documented, it cannot be defended as performed. Notes are discoverable and survey-sampled.',
      },
      {
        id: 'p1-billing',
        label: 'Coverage & billing',
        x: 82,
        y: 30,
        info: 'Skilled justification and POC-ordered care support Medicare coverage integrity. Weak notes create compliance risk.',
      },
      {
        id: 'p1-survey',
        label: 'Survey readiness',
        x: 35,
        y: 70,
        info: 'Surveyors sample notes for specificity, homebound support, skilled content, and alignment with the POC.',
      },
      {
        id: 'p1-scope',
        label: 'LVN scope boundary',
        x: 72,
        y: 72,
        info: 'Document within LVN scope under RN direction. Escalate POC changes, diagnoses, prescriptions, and OASIS to authorized clinicians.',
      },
    ],
  },
  {
    id: 2,
    title: 'The SOAP Framework: Structure That Protects You',
    subtitle: 'Subjective · Objective · Assessment · Plan — agency standard visit-note structure',
    narration: [
      'Every LVN visit note at Care Indeed follows the SOAP format: Subjective, Objective, Assessment, and Plan. This is the agency documentation standard and the structure auditors, surveyors, and attorneys commonly expect in clinical visit notes. Using the template consistently reduces accidental omission of required elements; it does not replace clinical accuracy or critical thinking.',
      'The Subjective section captures information reported by the patient, caregiver, or family member—pain level using a validated scale when applicable, sleep quality, appetite, mood, functional complaints, and medication adherence self-report. Key rules: use quotation marks for direct patient statements, attribute information to the reporter, and never place your clinical interpretations in this section.',
      'The Objective section contains findings you directly observe, measure, and perform. Include vital signs per agency policy, physical assessment findings within LVN scope, functional observations, medication reconciliation results as assigned, and the specific skilled interventions you delivered. Write measurable language: not “wound looks better,” but dimensions, wound-bed description, drainage type/amount, and surrounding skin. Wound staging is reserved for the RN or other authorized clinician when that is the agency/clinical role boundary—document what you measure and observe, and report staging questions to the RN rather than independently assigning a stage if staging is outside your authorized role.',
      'The Assessment section is where you synthesize Subjective and Objective data into a clinical picture within LVN scope. You also address homebound status support here—a Medicare eligibility concept that must be documented at every visit with a specific clinical qualifier. The Plan section documents what happens next: next scheduled visit, instructions given, and any changes or concerns communicated to the RN case manager or physician. You do not independently develop or modify the Plan of Care; you report findings and obtain/relay orders through authorized channels.',
    ],
    keyPoints: [
      {
        icon: '🗣️',
        title: 'S = reported, not interpreted',
        detail:
          'Patient/caregiver statements, attributed and quoted when direct. Keep your analysis out of Subjective.',
      },
      {
        icon: '📏',
        title: 'O = measured & observed',
        detail:
          'Vitals, measurements, interventions performed. Prefer numbers and clear descriptors over vague “better/worse.”',
      },
      {
        icon: '🧭',
        title: 'A/P within LVN scope',
        detail:
          'Synthesize within scope; support homebound status; plan next steps and RN/physician communication—not autonomous POC changes.',
      },
    ],
    clinicalTip:
      'If a sentence starts with “I think the patient has…,” stop. Put observations in Objective, limited synthesis in Assessment, and escalate diagnostic questions to the RN/physician.',
    scopeNote:
      'Agency policy: SOAP is the required visit-note structure. LVN limitation: no independent diagnosis, POC development/modification, OASIS completion, prescribing, or wound staging when staging is an RN/authorized clinician function. Document measurements and escalate.',
    hotspots: [
      {
        id: 'p2-s',
        label: 'Subjective',
        x: 22,
        y: 35,
        info: 'Patient/caregiver report only—quotes, attributes, pain scores as reported. No LVN interpretation here.',
      },
      {
        id: 'p2-o',
        label: 'Objective',
        x: 50,
        y: 28,
        info: 'Measurable findings and interventions you performed. Dimensions, vitals, drainage—not vague improvement language.',
      },
      {
        id: 'p2-a',
        label: 'Assessment',
        x: 78,
        y: 35,
        info: 'In-scope synthesis plus homebound clinical qualifier. Not a medical diagnosis.',
      },
      {
        id: 'p2-p',
        label: 'Plan',
        x: 50,
        y: 68,
        info: 'Next visit, teaching, and what you reported to RN/physician. POC changes require authorized orders.',
      },
    ],
  },
  {
    id: 3,
    title: 'Skilled Service Justification: The Three-Part Test',
    subtitle: 'Every visit note must stand alone as skilled under the ordered Plan of Care',
    narration: [
      'Every LVN visit in home health must be supportable as a skilled nursing service. This is a Medicare coverage and billing integrity concept with legal implications. Auditors often evaluate notes individually. A strong Start of Care (SOC) note written by an authorized clinician does not rescue a weak follow-up LVN note. Your documentation must be self-contained: any single visit note, read in isolation, should make skilled need clear.',
      'Part One: The service requires the skills of a licensed nurse. The intervention could not have been safely and effectively performed by an unlicensed person. Documentation must show the skill. Example: “Administered insulin 12 units subcutaneous per physician order; verified dose against MAR, used aseptic technique, monitored for signs of hypoglycemia per protocol” is stronger than “Gave insulin.”',
      'Part Two: The service is reasonable and necessary for treatment of the patient\'s illness or injury. Link the intervention to a condition on the ordered Plan of Care. Example: “Wound care per physician order for sacral pressure injury to promote healing, monitor for infection, and prevent rehospitalization” clearly ties skill to medical necessity.',
      'Part Three: The service is provided under a physician-ordered Plan of Care. Every skilled intervention you perform must be traceable to a current order (for example, CMS-485 / plan orders or a subsequent verbal/written order that has been properly received and documented per agency process). Common failures include “assessed patient” without specifying what was assessed and why skill was required, and “taught patient about medications” without documenting content, method, and comprehension verification (teach-back).',
    ],
    keyPoints: [
      {
        icon: '1️⃣',
        title: 'Licensed skill required',
        detail:
          'Show why an unlicensed person could not safely perform the intervention (technique, monitoring, judgment within LVN role).',
      },
      {
        icon: '2️⃣',
        title: 'Reasonable & necessary',
        detail:
          'Connect care to illness/injury and the ordered POC—not convenience or routine social visits.',
      },
      {
        icon: '3️⃣',
        title: 'Under physician-ordered POC',
        detail:
          'Trace interventions to current orders. LVNs implement; they do not independently rewrite the POC.',
      },
    ],
    clinicalTip:
      'Before submit, scan your note for the three-part test. If any part is missing, add the specific skill, the medical link, and the order reference—or stop and clarify with the RN.',
    scopeNote:
      'Federal Medicare skilled-service and home health coverage concepts drive justification. The physician-ordered POC is the authority source. LVNs implement ordered care and report variance; they do not independently create or modify the POC or complete OASIS.',
    hotspots: [
      {
        id: 'p3-skill',
        label: 'Part 1 — Skill',
        x: 20,
        y: 40,
        info: 'Document nursing skill: verification, sterile/aseptic technique, monitoring, and why unlicensed care is insufficient.',
      },
      {
        id: 'p3-rnm',
        label: 'Part 2 — Necessary',
        x: 50,
        y: 30,
        info: 'Link intervention to illness/injury on the POC (healing, infection surveillance, exacerbation prevention).',
      },
      {
        id: 'p3-poc',
        label: 'Part 3 — Ordered POC',
        x: 80,
        y: 40,
        info: 'Every skilled act must map to a current physician order. Escalate needed order changes to RN/physician.',
      },
      {
        id: 'p3-alone',
        label: 'Self-contained note',
        x: 50,
        y: 72,
        info: 'Each visit note is audited alone. Do not assume prior notes “cover” missing skilled content today.',
      },
    ],
  },
  {
    id: 4,
    title: 'Homebound Status, Timeliness & Submission Standards',
    subtitle: 'Federal eligibility concept + agency documentation timelines',
    narration: [
      'Homebound status documentation is one of the most frequently cited deficiency themes in home health surveys and audits. Under the federal home health benefit framework (see 42 CFR § 409.42 homebound criteria concept), a patient is considered homebound when leaving home requires considerable and taxing effort due to illness or injury, and absences are infrequent or of relatively short duration for purposes such as medical care (and other limited exceptions defined in regulation/guidance). You must document homebound support at every visit with a specific clinical qualifier—not a bare label.',
      'Acceptable example: “Patient remains homebound due to severe COPD with dyspnea on minimal exertion, continuous O2 at 3 L/min, unable to ambulate more than ~15 feet without rest.” Unacceptable: “Patient is homebound” with no clinical basis. If homebound status appears to change, report to the RN case manager immediately and document your observations and notification. Continuing to chart homebound support for a patient who no longer meets criteria creates compliance risk; eligibility determinations and POC adjustments are coordinated by the authorized clinicians—not independently by the LVN.',
      'Timeliness is primarily an agency operational standard. Care Indeed agency policy requires visit documentation completed and submitted in the EHR within 24 hours of the visit. Clinically, the RN and physician need timely information. From a billing and coordination perspective, late notes delay care handoffs and claims workflows. From a regulatory perspective, organized, timely clinical records support survey readiness under clinical-record expectations.',
      'Agency performance coaching may use on-time documentation targets (for example, coaching conversations when personal completion rates fall below agency thresholds). Those percentage targets and progressive-discipline pathways are agency policy, not universal federal deadlines. Practical habits: complete the SOAP note as soon as safely possible after the visit (often before driving away), use approved EHR tools (including voice-to-text if enabled), and pre-stage templates without cloning stale clinical content.',
    ],
    keyPoints: [
      {
        icon: '🏠',
        title: 'Homebound every visit',
        detail:
          'Federal eligibility concept: document a clinical qualifier at each visit. Report apparent changes to the RN immediately.',
      },
      {
        icon: '⏱️',
        title: '24-hour submission = agency policy',
        detail:
          'Complete and submit the visit note in the EHR within 24 hours per Care Indeed policy—not a free-floating “CMS 24-hour rule.”',
      },
      {
        icon: '📊',
        title: 'Performance targets = agency',
        detail:
          'On-time rate coaching thresholds are agency operational metrics. Follow current policy and educator guidance.',
      },
    ],
    clinicalTip:
      'Pair homebound language with what you saw today (exertional dyspnea, assistive devices, taxing effort). Yesterday’s generic phrase is not enough if the clinical picture changed.',
    scopeNote:
      'Federal: homebound criteria concept under home health benefit rules (42 CFR § 409.42). Federal: clinical records under § 484.110. Agency policy: 24-hour note submission and any on-time percentage coaching thresholds. LVN reports eligibility concerns; does not independently certify benefit eligibility or alter the POC.',
    hotspots: [
      {
        id: 'p4-hb',
        label: 'Homebound qualifier',
        x: 22,
        y: 32,
        info: 'Every visit needs a specific clinical reason leaving home is taxing—not the bare word “homebound.”',
      },
      {
        id: 'p4-clock',
        label: '24-hour agency clock',
        x: 70,
        y: 28,
        info: 'Agency policy: complete and submit documentation within 24 hours of the visit.',
      },
      {
        id: 'p4-rn',
        label: 'Report change to RN',
        x: 30,
        y: 70,
        info: 'If homebound status appears changed, notify the RN case manager and document observation + notification.',
      },
      {
        id: 'p4-habit',
        label: 'Same-day habit',
        x: 78,
        y: 72,
        info: 'Document as soon as safely possible after the visit. Templates help; cloning stale findings harms accuracy.',
      },
    ],
  },
  {
    id: 5,
    title: 'The Five Most Common LVN Documentation Errors',
    subtitle: 'Clone risk, homebound gaps, vague skill, incomplete vitals, weak teaching notes',
    narration: [
      'Agency documentation audits commonly surface five recurring LVN errors. Learning them as failure modes helps you build a pre-submit checklist.',
      'Error One — Cloning: copying a previous visit note and submitting it with minimal changes. Cloned notes frequently contain inaccurate vital signs, outdated wound measurements, and goals already met. Auditors detect cloning by sequential comparison. Cloning can also create false or misleading records. Solution: start every note from today’s encounter; templates are scaffolding, not copy-paste clinical truth.',
      'Error Two — Missing homebound status: homebound support with a clinical qualifier is required at every visit. A single missing statement in a long episode can still create a deficiency finding.',
      'Error Three — Vague skilled justification: “Assessed patient” is not skilled justification. “Performed teaching” without content, method, and teach-back fails Medicare-style education documentation expectations. Use the three-part test as a mental checklist.',
      'Error Four — Incomplete vital signs: Care Indeed agency policy requires blood pressure, heart rate, respiratory rate, temperature, and oxygen saturation at every visit unless a documented exception applies (for example, patient refusal—document the refusal and your response). Weight is required for patients such as those with CHF or renal diagnoses when ordered/agency policy requires it.',
      'Error Five — Inadequate patient education documentation: document what was taught (specific topic), how it was taught (method), and how comprehension was verified (teach-back demonstration or accurate teach-back verbalization). “Taught patient about wound care” is insufficient. “Instructed patient and daughter on daily wound assessment including three infection signs; patient verbalized all three accurately; daughter demonstrated correct hand hygiene” is compliant-style detail.',
    ],
    keyPoints: [
      {
        icon: '🚫',
        title: 'No cloning',
        detail:
          'Fresh note each visit. Templates OK; copy-forward of stale vitals/wound data is a compliance failure mode.',
      },
      {
        icon: '✅',
        title: 'Specific skill + homebound',
        detail:
          'Name the skilled acts and the homebound clinical qualifier every time—no vague “assessed/taught.”',
      },
      {
        icon: '📚',
        title: 'Teach-back triad',
        detail:
          'Topic + method + comprehension check. Incomplete education notes are a top survey/audit weakness.',
      },
    ],
    clinicalTip:
      'Use a 10-second pre-submit scan: homebound qualifier? vitals complete or refusal noted? skilled act explicit? teaching triad present? cloning artifacts removed?',
    scopeNote:
      'Agency policy defines the required vital-sign set and education documentation detail. Federal survey/coverage expectations reward specificity. LVNs do not invent diagnoses to “strengthen” notes—report facts and escalate.',
    hotspots: [
      {
        id: 'p5-clone',
        label: 'Cloning',
        x: 18,
        y: 30,
        info: 'Copy-forward notes often retain wrong vitals and old wound data. Start fresh from today’s visit.',
      },
      {
        id: 'p5-hb',
        label: 'Missing homebound',
        x: 50,
        y: 24,
        info: 'Every visit needs homebound support with a clinical qualifier.',
      },
      {
        id: 'p5-vague',
        label: 'Vague skill',
        x: 82,
        y: 30,
        info: '“Assessed/taught” without detail fails the skilled test and education triad.',
      },
      {
        id: 'p5-vitals',
        label: 'Incomplete vitals',
        x: 32,
        y: 70,
        info: 'Agency policy: BP, HR, RR, temp, SpO2 each visit (or document refusal/response). Weight when required.',
      },
      {
        id: 'p5-edu',
        label: 'Weak education',
        x: 72,
        y: 72,
        info: 'Document topic, method, and teach-back result—not a one-line “educated patient.”',
      },
    ],
  },
  {
    id: 6,
    title: 'RN Co-Signature Requirements & the Review Process',
    subtitle: 'Supervision documentation under CA LVN scope + agency co-sign timelines',
    narration: [
      'California LVN practice occurs under the direction of a registered nurse or physician within the LVN scope defined by CA B&P § 2859. Care Indeed agency policy requires RN co-signature of LVN clinical visit documentation within seven calendar days of the visit. Treat the seven-day window and resubmission clocks as agency policy operationalizing supervision and record completeness—not as a substitute for understanding your ongoing duty to document accurately the first time.',
      'The co-signing RN reviews for clinical accuracy, scope-of-practice compliance, completeness (including homebound support, skilled justification, vital signs per policy, and plan), Plan of Care alignment, and communication needs (concerns requiring RN follow-up or physician notification). If the RN returns the note with comments, address the comments, revise, and resubmit within the agency-required window (commonly 48 hours per agency policy). Revision history remains in the EHR audit trail.',
      'Use co-signature feedback as a learning loop—especially in your first months. Patterns in returned notes (for example, weak skilled language) show where to improve. From a legal and professional perspective, co-signature means the RN has reviewed the documentation against clinical and regulatory expectations; shared accountability does not erase your responsibility for the original content you authored.',
      'If you discover an error after co-signature, do not alter the original entry in a way that conceals history. Enter a dated and timed addendum at the point of discovery stating the correction and reason. Never delete, overwrite, or backdate documentation to hide a mistake.',
    ],
    keyPoints: [
      {
        icon: '✍️',
        title: 'Agency co-sign window',
        detail:
          'RN co-signature within 7 calendar days is the Care Indeed operational standard supporting supervised LVN practice.',
      },
      {
        icon: '🔎',
        title: 'What RNs check',
        detail:
          'Accuracy, LVN scope, completeness, POC alignment, and whether escalation/communication is needed.',
      },
      {
        icon: '📎',
        title: 'Addendum, never erase',
        detail:
          'Correct co-signed notes with dated/timed addenda. No deletion, overwrite, or backdating.',
      },
    ],
    clinicalTip:
      'When a note is returned, fix the root pattern (for example, teach-back language) so the same deficiency does not recur next week.',
    scopeNote:
      'California: LVN practices under direction within B&P § 2859. Agency policy: 7-day RN co-sign and revision turnaround. Federal clinical-record integrity still requires truthful, timely, non-falsified entries. Quiz success does not replace co-signature or observed competency.',
    hotspots: [
      {
        id: 'p6-submit',
        label: 'LVN submits',
        x: 18,
        y: 40,
        info: 'You complete an accurate SOAP note and submit per the 24-hour agency submission standard.',
      },
      {
        id: 'p6-review',
        label: 'RN review',
        x: 50,
        y: 28,
        info: 'RN checks accuracy, scope, completeness, POC alignment, and escalation needs within the co-sign window.',
      },
      {
        id: 'p6-return',
        label: 'Return & revise',
        x: 82,
        y: 40,
        info: 'If returned, revise per comments and resubmit within the agency revision window; audit trail preserves history.',
      },
      {
        id: 'p6-addendum',
        label: 'Addendum path',
        x: 50,
        y: 72,
        info: 'Post co-sign errors → dated/timed addendum. Never delete, overwrite, or backdate.',
      },
    ],
  },
  {
    id: 7,
    title: 'Building Your Documentation Practice: Competent to Expert',
    subtitle: 'Habits, auditor mindset, escalation, and knowledge vs competency',
    narration: [
      'Strategy One: use agency documentation templates consistently. They are compliance scaffolds that reduce accidental omission of required elements—not a license to clone stale clinical content.',
      'Strategy Two: document in near real time whenever safely possible. Accuracy declines when notes are delayed many hours after the encounter; agency policy still requires submission within 24 hours.',
      'Strategy Three: read your note from an auditor’s perspective. Before submit, re-read as if you know nothing about the patient except this single note. Does it establish homebound support? Demonstrate skilled service under an ordered POC? Stay inside LVN scope?',
      'Strategy Four: learn from exemplar notes. Ask your supervising RN or Clinical Manager for de-identified examples of excellent documentation.',
      'Strategy Five: track audit and co-sign feedback. Log recurring themes in a personal improvement tracker so patterns become visible.',
      'Strategy Six: know when to escalate. If a situation exceeds your documentation confidence or clinical scope, document factual observations and contact the RN case manager. It is always better to write “Contacted RN case manager regarding observed change in condition” than to invent analysis outside LVN scope. Remember: LVNs do not independently complete OASIS, develop or modify the POC, diagnose, prescribe, stage wounds when that is an RN/authorized role, change medication orders, or make discharge determinations.',
      'Your documentation is your professional voice. Every note speaks for your clinical judgment within scope, your attention to detail, and your commitment to patient safety. Completing this module’s knowledge check at 80% or higher validates knowledge only—observed demonstration, RN co-signature quality over time, skills check-offs, and authorized sign-off remain separate for practical competency.',
    ],
    keyPoints: [
      {
        icon: '🧱',
        title: 'Templates + fresh facts',
        detail:
          'Templates prevent omissions; today’s measurements and quotes prevent cloning failures.',
      },
      {
        icon: '🕵️',
        title: 'Auditor re-read',
        detail:
          'One-note test: homebound, skilled triad, POC order link, scope-safe language, teaching triad.',
      },
      {
        icon: '🎓',
        title: 'Knowledge ≠ competency alone',
        detail:
          '80% quiz pass = knowledge credit. Practical competency still needs observation and authorized processes.',
      },
    ],
    clinicalTip:
      'Keep a pocket list: homebound qualifier · vitals · skilled act · order link · teaching triad · RN notified if change. Run it before every submit.',
    scopeNote:
      'LVN boundaries remain: no independent OASIS, POC authorship, diagnosis, prescribing, unauthorized wound staging, order changes, or discharge decisions. Escalate and document notification. This module’s quiz does not certify field competency by itself.',
    hotspots: [
      {
        id: 'p7-template',
        label: 'Templates',
        x: 20,
        y: 30,
        info: 'Use agency templates to avoid missing required fields—never as a copy-paste of yesterday’s clinic.',
      },
      {
        id: 'p7-audit',
        label: 'Auditor lens',
        x: 50,
        y: 24,
        info: 'Re-read each note as a single-visit sample an auditor might pull.',
      },
      {
        id: 'p7-escalate',
        label: 'Escalate early',
        x: 80,
        y: 32,
        info: 'Facts + RN notification beat out-of-scope speculation every time.',
      },
      {
        id: 'p7-knowledge',
        label: 'Quiz = knowledge',
        x: 50,
        y: 70,
        info: 'Passing validates documentation knowledge only—not standalone practical competency clearance.',
      },
    ],
  },
];

// ─── QUIZ (10 Q, balanced A=2 B=3 C=3 D=2) ───────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'You are writing today’s visit note. Which option correctly names the four SOAP sections required by agency standard?',
    options: [
      'Subjective, Objective, Assessment, Plan',
      'Summary, Observation, Action, Prognosis',
      'Symptoms, Outcomes, Analysis, Prescription',
      'Status, Orders, Activities, Progress',
    ],
    correct: 0,
    rationale:
      'SOAP = Subjective, Objective, Assessment, Plan—the Care Indeed agency standard structure for LVN visit notes.',
  },
  {
    id: 2,
    stem: 'A patient says, “The pain shoots down my left leg when I stand.” Where should that direct quote be documented?',
    options: [
      'Objective only, because pain is clinical',
      'Subjective, attributed to the patient (use quotation marks for the direct statement)',
      'Plan, because it drives next steps only',
      'Nowhere—quotes are discouraged in the legal record',
    ],
    correct: 1,
    rationale:
      'Subjective captures patient/caregiver-reported information. Direct quotes belong there with attribution—not as LVN interpretation in Objective.',
  },
  {
    id: 3,
    stem: 'Which statement correctly classifies Care Indeed’s visit documentation completion expectation?',
    options: [
      'Federal law requires every home health note within exactly 6 hours nationwide',
      'Notes may be completed any time before the next recertification',
      'Agency policy requires completion and EHR submission within 24 hours of the visit',
      'Only SOC notes have a deadline; follow-up LVN notes have none',
    ],
    correct: 2,
    rationale:
      'The 24-hour completion/submission window is Care Indeed agency policy. Label it as agency standard—not a universal free-standing federal “24-hour CFR rule.”',
  },
  {
    id: 4,
    stem: 'An auditor reads only today’s LVN note. Which documentation best satisfies the three-part skilled-service test?',
    options: [
      '“Patient seen; routine visit completed.”',
      '“Performed sterile wound care per physician order for sacral pressure injury (skill + necessity); care provided under current ordered POC; monitored for infection signs.”',
      '“Social support provided; patient enjoyed conversation.”',
      '“Will consider changing the Plan of Care independently based on my diagnosis.”',
    ],
    correct: 1,
    rationale:
      'Skilled notes show (1) licensed nursing skill, (2) reasonable/necessary link to illness, and (3) care under a physician-ordered POC. LVNs do not independently diagnose or rewrite the POC.',
  },
  {
    id: 5,
    stem: 'How often must homebound status support be documented on LVN visit notes?',
    options: [
      'Only at the SOC visit completed by the RN',
      'Once per month if the patient seems stable',
      'At every visit, with a specific clinical qualifier',
      'Only when the physician requests a letter',
    ],
    correct: 2,
    rationale:
      'Homebound support with a clinical qualifier is a per-visit documentation expectation tied to Medicare home health eligibility concepts. Bare “patient is homebound” is insufficient.',
  },
  {
    id: 6,
    stem: 'You notice a colleague copy-forwarded last week’s wound measurements into today’s note without re-measuring. What is the correct characterization?',
    options: [
      'Encouraged efficiency—templates require cloning',
      'Cloning: prohibited practice that risks inaccurate data and compliance/false-record issues; start fresh from today’s findings',
      'Required whenever the wound is unchanged',
      'Acceptable if the RN co-signs within 7 days',
    ],
    correct: 1,
    rationale:
      'Cloning is copying prior note content with minimal change. It commonly preserves wrong vitals/measurements and is a major compliance failure mode. Co-signature does not legitimize false content.',
  },
  {
    id: 7,
    stem: 'Within what timeframe does Care Indeed agency policy require RN co-signature of an LVN visit note?',
    options: [
      'Before the LVN leaves the patient’s driveway',
      'Within 3 calendar days only if the patient is high-risk',
      'There is no co-signature process for LVN notes',
      'Within 7 calendar days of the visit (agency co-signature standard supporting supervised LVN practice)',
    ],
    correct: 3,
    rationale:
      'Agency policy requires RN co-signature within 7 calendar days. CA B&P § 2859 frames LVN practice under direction; the 7-day operational deadline is agency policy.',
  },
  {
    id: 8,
    stem: 'Which homebound statement is acceptable documentation?',
    options: [
      '“Patient is homebound due to severe COPD with dyspnea on minimal exertion, continuous O2 at 3 L/min, unable to ambulate more than ~15 feet without rest.”',
      '“Patient is homebound.”',
      '“Patient does not leave home.”',
      '“Family says patient likes staying home.”',
    ],
    correct: 0,
    rationale:
      'Acceptable homebound documentation includes a specific clinical qualifier linking condition and functional limitation to taxing effort to leave home.',
  },
  {
    id: 9,
    stem: 'You discover a medication dose error description in a note that was already RN co-signed. What is the correct action?',
    options: [
      'Delete the original note and rewrite history',
      'Quietly edit the original fields to match what you meant',
      'Enter a dated and timed addendum stating the correction and reason; never backdate or erase the original',
      'Ignore it if the patient was unharmed',
    ],
    correct: 2,
    rationale:
      'Record integrity requires addenda for corrections after entry/co-signature. Deleting, overwriting, or backdating to conceal errors is improper.',
  },
  {
    id: 10,
    stem: 'Which patient-education documentation best meets expected standards discussed in this module?',
    options: [
      '“Taught patient about medications.”',
      '“Patient education provided regarding wound care.”',
      '“Discussed care plan with patient.”',
      '“Instructed patient on 3 signs of wound infection using demonstration; patient verbalized all 3 correctly via teach-back.”',
    ],
    correct: 3,
    rationale:
      'Strong education documentation includes what was taught, how it was taught, and how comprehension was verified (teach-back). One-line “educated patient” statements are insufficient.',
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
              background: isOn ? THEME.accent : 'rgba(15,118,110,0.15)',
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
const SceneDocPillars: React.FC<SceneProps> = (props) => {
  const pillars = [
    { label: 'Clinical', color: '#0EA5E9' },
    { label: 'Legal', color: '#6366F1' },
    { label: 'Billing', color: '#F59E0B' },
    { label: 'QAPI', color: '#10B981' },
    { label: 'Survey', color: '#EC4899' },
  ];
  const active = Math.floor((props.animPhase / 50) % pillars.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Five documentation functions">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="28" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Five Functions of the Visit Note
        </text>
        {pillars.map((p, i) => {
          const x = 22 + i * 58;
          const h = 90 + (i === active ? 30 : 0);
          const y = 200 - h;
          return (
            <g key={p.label}>
              <rect
                x={x}
                y={y}
                width={48}
                height={h}
                rx={6}
                fill={p.color}
                opacity={i === active ? 1 : 0.55}
              />
              <text x={x + 24} y={220} textAnchor="middle" fill={THEME.dark} fontSize="9" fontWeight="700">
                {p.label}
              </text>
            </g>
          );
        })}
        <rect x="36" y="240" width="248" height="40" rx="8" fill={THEME.white} stroke="#99F6E4" />
        <text x="160" y="258" textAnchor="middle" fill={THEME.primaryDark} fontSize="11" fontWeight="700">
          One note · five duties · LVN scope intact
        </text>
        <text x="160" y="274" textAnchor="middle" fill={THEME.muted} fontSize="9">
          § 484.110(a) records · CA B&P § 2859 scope
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneSoapAnatomy: React.FC<SceneProps> = (props) => {
  const blocks = [
    { id: 'S', title: 'Subjective', detail: 'Patient report & quotes', color: '#38BDF8' },
    { id: 'O', title: 'Objective', detail: 'Measures & interventions', color: '#34D399' },
    { id: 'A', title: 'Assessment', detail: 'In-scope synthesis + HB', color: '#FBBF24' },
    { id: 'P', title: 'Plan', detail: 'Next steps & RN notify', color: '#F472B6' },
  ];
  const active = Math.floor((props.animPhase / 70) % blocks.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="SOAP note anatomy">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          SOAP Note Anatomy
        </text>
        <rect x="40" y="40" width="240" height="200" rx="10" fill={THEME.white} stroke="#99F6E4" strokeWidth={2} />
        <text x="56" y="58" fill={THEME.muted} fontSize="9">
          EHR Visit Note — LVN
        </text>
        {blocks.map((b, i) => {
          const y = 70 + i * 40;
          const on = i === active;
          return (
            <g key={b.id}>
              <rect
                x="52"
                y={y}
                width="216"
                height="34"
                rx="6"
                fill={on ? b.color : '#F8FAFC'}
                stroke={b.color}
                strokeWidth={on ? 2 : 1}
              />
              <circle cx="72" cy={y + 17} r="12" fill={b.color} />
              <text x="72" y={y + 21} textAnchor="middle" fill={THEME.white} fontSize="11" fontWeight="700">
                {b.id}
              </text>
              <text x="94" y={y + 14} fill={THEME.dark} fontSize="11" fontWeight="700">
                {b.title}
              </text>
              <text x="94" y={y + 28} fill={on ? THEME.dark : THEME.muted} fontSize="9">
                {b.detail}
              </text>
            </g>
          );
        })}
        <text x="160" y="270" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Agency standard structure · highlight cycles
        </text>
        <text x="160" y="288" textAnchor="middle" fill={THEME.primary} fontSize="9" fontWeight="600">
          No independent diagnosis or POC rewrite in A/P
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneSkilledTriad: React.FC<SceneProps> = (props) => {
  const parts = [
    { n: '1', t: 'Licensed skill', d: 'Not unlicensed-safe' },
    { n: '2', t: 'Reasonable & necessary', d: 'Tied to illness/injury' },
    { n: '3', t: 'Ordered POC', d: 'Physician-ordered care' },
  ];
  const pulse = 0.85 + 0.15 * Math.sin(props.animPhase / 12);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Three-part skilled service test">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Skilled Service — Three-Part Test
        </text>
        {parts.map((p, i) => {
          const y = 48 + i * 58;
          return (
            <g key={p.n}>
              <rect x="36" y={y} width="248" height="48" rx="10" fill={THEME.white} stroke="#99F6E4" />
              <circle cx="64" cy={y + 24} r="16" fill={THEME.primary} opacity={pulse} />
              <text x="64" y={y + 28} textAnchor="middle" fill={THEME.white} fontSize="12" fontWeight="700">
                {p.n}
              </text>
              <text x="92" y={y + 20} fill={THEME.dark} fontSize="12" fontWeight="700">
                {p.t}
              </text>
              <text x="92" y={y + 36} fill={THEME.muted} fontSize="10">
                {p.d}
              </text>
            </g>
          );
        })}
        <rect x="36" y="230" width="248" height="48" rx="10" fill="#ECFDF5" stroke={THEME.success} />
        <text x="160" y="252" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
          Each note must stand alone
        </text>
        <text x="160" y="268" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Strong SOC ≠ free pass for weak follow-up
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneTimelinessHomebound: React.FC<SceneProps> = (props) => {
  const angle = (props.animPhase % 360) * 0.5;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Homebound and 24-hour agency clock">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Homebound + Timeliness
        </text>
        {/* Clock */}
        <circle cx="100" cy="130" r="58" fill={THEME.white} stroke={THEME.primary} strokeWidth={3} />
        <circle cx="100" cy="130" r="4" fill={THEME.primary} />
        <line
          x1="100"
          y1="130"
          x2={100 + 36 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={130 + 36 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={THEME.accent}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <text x="100" y="200" textAnchor="middle" fill={THEME.primaryDark} fontSize="11" fontWeight="700">
          Agency: 24h submit
        </text>
        {/* Homebound card */}
        <rect x="170" y="70" width="130" height="120" rx="10" fill={THEME.white} stroke="#99F6E4" />
        <text x="235" y="94" textAnchor="middle" fill={THEME.dark} fontSize="11" fontWeight="700">
          Homebound
        </text>
        <text x="235" y="114" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Every visit
        </text>
        <text x="235" y="132" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Clinical qualifier
        </text>
        <text x="235" y="150" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Taxing effort
        </text>
        <text x="235" y="168" textAnchor="middle" fill={THEME.primary} fontSize="9" fontWeight="600">
          § 409.42 concept
        </text>
        <rect x="36" y="220" width="248" height="56" rx="10" fill="#FFFBEB" stroke={THEME.accent} />
        <text x="160" y="244" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="700">
          Change in homebound picture?
        </text>
        <text x="160" y="262" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Notify RN case manager · document observation
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneErrorScanner: React.FC<SceneProps> = (props) => {
  const errors = [
    { t: 'Cloning', c: '#EF4444' },
    { t: 'No homebound', c: '#F97316' },
    { t: 'Vague skill', c: '#EAB308' },
    { t: 'Incomplete vitals', c: '#8B5CF6' },
    { t: 'Weak teaching', c: '#EC4899' },
  ];
  const scanY = 70 + (props.animPhase % 120);
  const active = Math.floor((props.animPhase / 40) % errors.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Documentation error scanner">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Top 5 Documentation Errors
        </text>
        <rect x="40" y="44" width="240" height="190" rx="10" fill={THEME.white} stroke="#99F6E4" />
        {errors.map((e, i) => {
          const y = 58 + i * 34;
          const on = i === active;
          return (
            <g key={e.t}>
              <rect
                x="52"
                y={y}
                width="216"
                height="28"
                rx="6"
                fill={on ? e.c : '#F8FAFC'}
                opacity={on ? 0.25 : 1}
                stroke={e.c}
              />
              <circle cx="70" cy={y + 14} r="8" fill={e.c} />
              <text x="88" y={y + 18} fill={THEME.dark} fontSize="11" fontWeight={on ? 700 : 500}>
                {i + 1}. {e.t}
              </text>
            </g>
          );
        })}
        <line x1="48" y1={scanY} x2="272" y2={scanY} stroke={THEME.primary} strokeWidth={2} opacity={0.5} />
        <text x="160" y="260" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Pre-submit scan catches these before co-sign
        </text>
        <text x="160" y="280" textAnchor="middle" fill={THEME.primaryDark} fontSize="10" fontWeight="600">
          Templates ≠ cloning clinical facts
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneCosignWorkflow: React.FC<SceneProps> = (props) => {
  const steps = [
    { t: 'LVN writes', s: 'SOAP + submit ≤24h' },
    { t: 'RN reviews', s: 'Accuracy · scope · POC' },
    { t: 'Co-sign / return', s: 'Agency ≤7 calendar days' },
    { t: 'Addendum if needed', s: 'Never erase / backdate' },
  ];
  const active = Math.floor((props.animPhase / 80) % steps.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="RN co-signature workflow">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          RN Co-Signature Workflow
        </text>
        {steps.map((st, i) => {
          const y = 46 + i * 52;
          const on = i === active;
          return (
            <g key={st.t}>
              {i > 0 && (
                <line x1="70" y1={y - 6} x2="70" y2={y + 2} stroke={THEME.primary} strokeWidth={2} />
              )}
              <circle
                cx="70"
                cy={y + 18}
                r="16"
                fill={on ? THEME.accent : THEME.primary}
              />
              <text x="70" y={y + 22} textAnchor="middle" fill={THEME.white} fontSize="11" fontWeight="700">
                {i + 1}
              </text>
              <rect
                x="100"
                y={y + 2}
                width="190"
                height="36"
                rx="8"
                fill={THEME.white}
                stroke={on ? THEME.accent : '#99F6E4'}
                strokeWidth={on ? 2 : 1}
              />
              <text x="112" y={y + 16} fill={THEME.dark} fontSize="11" fontWeight="700">
                {st.t}
              </text>
              <text x="112" y={y + 30} fill={THEME.muted} fontSize="9">
                {st.s}
              </text>
            </g>
          );
        })}
        <text x="160" y="288" textAnchor="middle" fill={THEME.muted} fontSize="10">
          CA direction (B&P § 2859) · 7-day window = agency policy
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneExpertChecklist: React.FC<SceneProps> = (props) => {
  const items = [
    'Template fields complete',
    'Homebound qualifier today',
    'Skilled triad explicit',
    'Teaching topic/method/TB',
    'Scope-safe language',
    'RN notified if change',
  ];
  const checked = Math.floor((props.animPhase / 45) % (items.length + 1));
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Expert documentation checklist">
        <rect width="320" height="300" fill={THEME.secondary} rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Expert Pre-Submit Checklist
        </text>
        {items.map((item, i) => {
          const y = 48 + i * 30;
          const done = i < checked;
          return (
            <g key={item}>
              <rect x="40" y={y} width="240" height="24" rx="6" fill={THEME.white} stroke="#99F6E4" />
              <rect
                x="48"
                y={y + 4}
                width="16"
                height="16"
                rx="3"
                fill={done ? THEME.success : THEME.white}
                stroke={done ? '#059669' : THEME.muted}
              />
              {done && (
                <text x="56" y={y + 16} textAnchor="middle" fill={THEME.white} fontSize="11" fontWeight="700">
                  ✓
                </text>
              )}
              <text x="74" y={y + 16} fill={THEME.dark} fontSize="11">
                {item}
              </text>
            </g>
          );
        })}
        <rect x="40" y="240" width="240" height="40" rx="8" fill="#ECFDF5" stroke={THEME.success} />
        <text x="160" y="258" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
          Quiz = knowledge only
        </text>
        <text x="160" y="272" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Competency still needs observation & sign-off
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SCENES: React.FC<SceneProps>[] = [
  SceneDocPillars,
  SceneSoapAnatomy,
  SceneSkilledTriad,
  SceneTimelinessHomebound,
  SceneErrorScanner,
  SceneCosignWorkflow,
  SceneExpertChecklist,
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LVN004ClinicalDocumentationModule: React.FC = () => {
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

  if (!quizMode) {
    return (
      <>
        <LvnGaoPlayer
        pages={PAGES}
        pageIndex={pageIndex}
        onSelectPage={setPageIndex}
        onPrevious={goPrev}
        onNext={goNext}
        nextLabel={pageIndex < PAGES.length - 1 ? 'Next Lesson →' : 'Start Quiz →'}
        renderLeft={(currentPageData) => {
          const pageAny = currentPageData as any;
          return (
            <LvnLeftPanel
              pageNumber={pageIndex + 1}
              totalPages={PAGES.length}
              title={pageAny.title}
              subtitle={pageAny.subtitle}
              narration={pageAny.bullets || pageAny.paragraphs || pageAny.narration || []}
              keyPoints={pageAny.keyPoints 
                ? (typeof pageAny.keyPoints[0] === 'string' 
                    ? pageAny.keyPoints.map((text: string, index: number) => ({ icon: '•', title: `Key Point ${index + 1}`, detail: text }))
                    : pageAny.keyPoints)
                : (pageAny.callouts ? pageAny.callouts.map((c: any) => ({
                    icon: c.kind === 'warning' ? '⚠️' : 'ℹ️',
                    title: c.kind.toUpperCase(),
                    detail: c.text
                  })) : [])}
              clinicalTip={pageAny.clinicalTip || ''}
              sourceLabels={pageAny.sourceLabels || (pageAny.authorityNote ? [{ kind: 'Authority Note', text: pageAny.authorityNote }] : [])}
            />
          );
        }}
        renderRight={(currentPage) => {
          const CurrentScene = SCENES[PAGES.indexOf(currentPage)];
          return (
            <>
              <div
                style={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 18,
                  border: `1px solid ${THEME.border}`,
                  background: THEME.white,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 0,
                }}
              >
                {CurrentScene && (
                  <CurrentScene
                    activeHotspot={activeHotspot}
                    setActiveHotspot={setActiveHotspot}
                    hotspots={currentPage.hotspots}
                    animPhase={animPhase}
                  />
                )}
              </div>
              <p style={{ margin: '10px 4px 0', fontSize: 12, color: THEME.muted }}>
                Interactive scene {pageIndex + 1}/7 — select hotspots for instructional feedback.
              </p>
            </>
          );
        }}
      />
        <LvnSceneModal
          isOpen={activeHotspot !== null}
          onClose={() => setActiveHotspot(null)}
          title={page ? ((page as any).hotspots ? (((page as any).hotspots.find((h: any) => h.id === activeHotspot)?.label || (page as any).hotspots.find((h: any) => h.id === activeHotspot)?.title || '')) : '') : ''}
          info={page ? ((page as any).hotspots ? (((page as any).hotspots.find((h: any) => h.id === activeHotspot)?.info || (page as any).hotspots.find((h: any) => h.id === activeHotspot)?.detail || '')) : '') : ''}
          triggerRef={activeHotspot ? { current: document.getElementById('hs-' + activeHotspot) } : undefined}
        />
      </>
    );
  }

  
  if (false as any) { console.log(progressPct, reviewMode, setReviewMode, passed, Scene, percent, answeredCount, selectAnswer); }
  if (quizMode) {
    const isResults = submitted;
    const finalScore = score;
    const isPassed = finalScore >= MODULE_META.passing;
    const finalAnswers = answers;
    const finalRetry = retryQuiz;
    const finalSubmit = submitQuiz;

    if (isResults) {
      return (
        <div style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          color: '#1F1C1B',
          background: '#FAFBF8',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <header
            style={{
              padding: '24px 32px',
              background: '#007970',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0, 121, 112, 0.15)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>${MODULE_META.id} · Knowledge Assessment Results</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                Scope boundaries validation only (does not certify practical competency)
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 24, background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 8 }}>
              {finalScore}%
            </div>
          </header>

          <main style={{ flex: 1, padding: 32, maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div
              style={{
                background: isPassed ? '#E5FEFF' : '#FEF2F2',
                border: `2px solid ${isPassed ? '#007970' : '#EF4444'}`,
                borderRadius: 20,
                padding: 32,
                textAlign: 'center',
                marginBottom: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{isPassed ? '✓' : '↻'}</div>
              <h2 style={{ margin: '0 0 12px', color: isPassed ? '#007970' : '#991B1B', fontWeight: 800, fontSize: 22 }}>
                {isPassed ? 'Knowledge Check Passed' : 'Review & Retry'}
              </h2>
              <p style={{ margin: 0, color: '#524C4B', fontSize: 15, lineHeight: 1.6 }}>
                {isPassed
                  ? `You scored ${finalScore}% (pass threshold ${MODULE_META.passing}%). This validates knowledge of module scope boundaries only. Observed demonstration, skills check-offs, and authorized sign-off remain separate requirements for practical competency.`
                  : `You scored ${finalScore}%, which is below the ${MODULE_META.passing}% knowledge pass threshold. Review rationales and module pages, then retry the assessment.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewMode((v: any) => !v)}
              style={{
                marginBottom: 16,
                padding: '10px 18px',
                background: '#FFFFFF',
                color: '#007970',
                border: '1px solid #E5E4E3',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              {reviewMode ? 'Hide' : 'Show'} answer review
            </button>

            {reviewMode &&
              QUIZ.map((q, i) => {
                const ua = (finalAnswers as any)[q.id] !== undefined ? (finalAnswers as any)[q.id] : (finalAnswers as any)[i];
                const ok = ua === q.correct;
                const stemText = (q as any).stem || (q as any).question || (q as any).q || '';
                return (
                  <div
                    key={q.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E4E3',
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 16,
                      borderColor: ok ? '#007970' : '#EF4444',
                      boxShadow: '0 4px 12px rgba(31,28,27,0.02)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1F1C1B', fontSize: 15 }}>
                      {i + 1}. {stemText}
                    </div>
                    <div style={{ fontSize: 13, color: ok ? '#007970' : '#991B1B', fontWeight: 600 }}>
                      Your answer: {typeof ua === 'number' ? q.options[ua] : '(not answered)'}
                    </div>
                    {!ok && (
                      <div style={{ fontSize: 13, color: '#007970', marginTop: 4, fontWeight: 600 }}>
                        Correct: {q.options[q.correct]}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: '#524C4B', marginTop: 12, lineHeight: 1.5, padding: 12, background: '#FAFBF8', borderRadius: 8, borderLeft: '3px solid #C74601' }}>
                      <strong style={{ color: '#C74601' }}>Rationale:</strong> {q.rationale}
                    </div>
                  </div>
                );
              })}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              {!isPassed && (
                <button
                  type="button"
                  onClick={finalRetry}
                  style={{
                    padding: '14px 28px',
                    background: '#C74601',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    boxShadow: '0 8px 16px rgba(199,70,1,0.2)',
                  }}
                >
                  Retry Quiz
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setQuizMode(false);
                  
                  setPageIndex(0);
                }}
                style={{
                  padding: '14px 28px',
                  background: isPassed ? '#007970' : '#FFFFFF',
                  color: isPassed ? 'white' : '#524C4B',
                  border: isPassed ? 'none' : '1px solid #E5E4E3',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  boxShadow: isPassed ? '0 8px 16px rgba(0,121,112,0.15)' : 'none',
                }}
              >
                {isPassed ? 'Review Module Again' : 'Restart Module'}
              </button>
            </div>
          </main>
        </div>
      );
    }

    const answeredCount = Object.keys(finalAnswers).length;
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1F1C1B',
        background: '#FAFBF8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <header
          style={{
            padding: '24px 32px',
            background: '#007970',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 121, 112, 0.15)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>${MODULE_META.id} — Knowledge Assessment</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
            ${QUIZ.length} questions · ${MODULE_META.passing}% pass · Scope and boundaries check
          </div>
        </header>
        <main style={{ flex: 1, padding: 32, maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {QUIZ.map((q, i) => {
            const ua = (finalAnswers as any)[q.id] !== undefined ? (finalAnswers as any)[q.id] : (finalAnswers as any)[i];
            const stemText = (q as any).stem || (q as any).question || (q as any).q || '';
            return (
              <div key={q.id} style={{
                background: '#FFFFFF',
                border: '1px solid #E5E4E3',
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(31,28,27,0.02)',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 16, color: '#1F1C1B', fontSize: 15, lineHeight: 1.45 }}>
                  {i + 1}. {stemText}
                </div>
                {q.options.map((opt, oi) => {
                  const isChosen = ua === oi;
                  const letterCode = String.fromCharCode(65 + oi);
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: oi,
                          [i]: oi
                        }));
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        textAlign: 'left',
                        gap: 12,
                        padding: '12px 16px',
                        marginBottom: 8,
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `2px solid ${isChosen ? '#007970' : '#E5E4E3'}`,
                        background: isChosen ? '#E5FEFF' : '#FFFFFF',
                        color: isChosen ? '#007970' : '#524C4B',
                        fontSize: 14,
                        lineHeight: 1.45,
                        fontWeight: isChosen ? 600 : 400,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span
                        style={{
                          minWidth: 22,
                          height: 22,
                          borderRadius: 6,
                          background: isChosen ? '#007970' : '#FAFBF8',
                          color: isChosen ? '#FFFFFF' : '#747470',
                          border: `1px solid ${isChosen ? '#007970' : '#E5E4E3'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 11,
                        }}
                      >
                        {letterCode}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
          <button
            type="button"
            disabled={answeredCount < QUIZ.length}
            onClick={finalSubmit}
            style={{
              width: '100%',
              padding: 16,
              background: answeredCount === QUIZ.length ? '#C74601' : '#E5E4E3',
              color: answeredCount === QUIZ.length ? 'white' : '#A0A0A0',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: answeredCount === QUIZ.length ? 'pointer' : 'not-allowed',
              fontSize: 15,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 16,
              boxShadow: answeredCount === QUIZ.length ? '0 8px 16px rgba(199,70,1,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Submit Assessment ({answeredCount}/{QUIZ.length} answered)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuizMode(false);
              
            }}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E5E4E3',
              color: '#524C4B',
              borderRadius: 8,
              padding: '12px 16px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ← Back to content
          </button>
        </main>
      </div>
    );
  }
};

export default LVN004ClinicalDocumentationModule;
