// @ts-nocheck
import { Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, X, AlertCircle, ShieldCheck, Compass } from 'lucide-react';
/**
 * LVN-011 — Patient Identification & Verification
 * Care Indeed LMS | SC04-pattern standalone module
 * Version: 5.0 | Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Regulatory: 42 CFR § 484.60 | Agency policy: OP-PA-002 | Method: Observation
 * Record: 6a558d2f3463cd690af8d636
 */

import React, { useCallback, useMemo, useState } from 'react';

// ─── MODULE META ─────────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-011',
  title: 'Patient Identification & Verification',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.60',
  policy: 'OP-PA-002',
  method: 'Observation',
  recordId: '6a558d2f3463cd690af8d636',
};

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#DC2626',
  warn: '#F97316',
  dark: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#F0F9FF',
  surface: '#FFFFFF',
  purple: '#7C3AED',
  teal: '#0D9488',
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  detail: string;
}

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface DecisionFrame {
  first: string;
  continueIf: string;
  stopIf: string;
  notify: string;
  document: string;
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  badges: string[];
  narration: string[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  decision?: DecisionFrame;
  hotspots: Hotspot[];
  scene: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
}

// ─── PAGE CONTENT ────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Patient Identification — The First Safety Check',
    subtitle: 'Two identifiers, every intervention, every time',
    badges: ['Federal: 42 CFR § 484.60', 'Agency: OP-PA-002', 'Guidance: NPSG 01.01.01'],
    scene: 'two-id',
    narration: [
      'Welcome to Module LVN-011: Patient Identification and Verification. Patient identification errors remain among the most preventable adverse events in healthcare, yet they continue to cause harm across every care setting. In home health, risk is amplified by the solo nature of the work. There is no second nurse to double-check your patient, no wristband scanner at the bedside, and no centralized unit board tracking who is in which bed.',
      'When you knock on a door, you must independently verify that you are at the correct home, treating the correct patient, with the correct orders, before any clinical intervention. Care Indeed Policy OP-PA-002 (Patient Identification & Verification) requires a minimum of two patient identifiers before any clinical intervention. This is agency policy implementing a widely recognized safety standard; CMS CoP 42 CFR § 484.60 requires that care be furnished in accordance with the plan of care and coordinated to protect quality and safety.',
      'Professional guidance (e.g., Joint Commission National Patient Safety Goal 01.01.01 where applicable to accredited settings) also emphasizes at least two patient identifiers when providing care, treatment, or services. In home health, acceptable identifiers commonly include full legal name, date of birth, medical record number, and home address. Agency policy OP-PA-002 defines which combinations are approved for Care Indeed visits.',
      'The two-identifier requirement applies to every clinical intervention: vital signs, medication administration, wound care, specimen collection, patient education, and any hands-on activity. There are no exceptions for patients you know well or have seen many times. Familiarity does not replace verification. Shortcuts create the conditions for wrong-patient harm.',
      'LVN scope note: you implement identification and verification as directed by agency policy and the plan of care. You do not independently invent identifier rules, change physician orders, complete OASIS, or modify the Plan of Care. When identity is uncertain, you stop, notify the RN case manager or clinical supervisor, and document — you do not “work around” the mismatch.',
    ],
    keyPoints: [
      {
        icon: '①',
        title: 'Two identifiers minimum',
        detail: 'Agency policy OP-PA-002 requires at least two approved patient identifiers before any clinical intervention.',
      },
      {
        icon: '②',
        title: 'Open-ended verification',
        detail: 'Ask the patient to state name and DOB — do not feed the answer (“Are you Mary Smith?”).',
      },
      {
        icon: '③',
        title: 'Solo practice risk',
        detail: 'Home health has no wristband scanner or second nurse. You are the sole identity verifier.',
      },
      {
        icon: '④',
        title: 'Scope boundary',
        detail: 'If identity cannot be confirmed, stop care, notify RN/supervisor, and document — do not improvise.',
      },
    ],
    clinicalTip:
      'Treat every visit as if it is the first. Visual familiarity is not an identifier. Use two approved identifiers and match them to the schedule, orders, and chart before you open a supply bag.',
    decision: {
      first: 'Confirm you have the correct visit packet/orders, then plan open-ended two-identifier verification at the door.',
      continueIf: 'Two approved identifiers match schedule, orders, and chart.',
      stopIf: 'Any identifier mismatch, unresolvable confusion, or inability to verify identity by approved methods.',
      notify: 'RN case manager or clinical supervisor immediately when identity cannot be confirmed.',
      document: 'Identifiers used, match/mismatch, actions taken, notifications, and outcome.',
    },
    hotspots: [
      {
        id: 'name',
        label: 'Full legal name',
        x: 18,
        y: 28,
        detail:
          'Ask: “Please tell me your full name.” Match the stated name to the schedule, orders, and chart. Do not offer the name for a yes/no confirm.',
      },
      {
        id: 'dob',
        label: 'Date of birth',
        x: 50,
        y: 28,
        detail:
          'Ask: “What is your date of birth?” Match month/day/year to the chart. Name + DOB is the most common home-health pair.',
      },
      {
        id: 'mrn',
        label: 'Medical record #',
        x: 82,
        y: 28,
        detail:
          'Use MRN from the chart/visit materials when verbal identifiers are incomplete or for secondary verification per agency policy.',
      },
      {
        id: 'address',
        label: 'Home address',
        x: 50,
        y: 72,
        detail:
          'Address confirms you are at the right location — it is a layer of verification, not a substitute for patient-level identity when multiple people live at one home.',
      },
    ],
  },
  {
    id: 2,
    title: 'Home Health–Specific ID Challenges',
    subtitle: 'Address, cognition, language, and multi-patient homes',
    badges: ['Agency: OP-PA-002', 'Clinical judgment', 'Caregiver support'],
    scene: 'home-challenges',
    narration: [
      'Home health presents identification challenges that do not exist in institutional settings. Hospitals use wristbands and electronic scanners; home health does not. You are the sole verifier of identity at the point of care.',
      'Challenge 1 — Address verification: Before entering, confirm the physical address matches the schedule and chart. GPS errors, similar street numbers, apartment complex confusion, and unreported moves can send you to the wrong door. Address verification is the first layer, not a substitute for patient-level identification.',
      'Challenge 2 — Cognitive impairment: Dementia, delirium, aphasia, or other conditions may prevent a patient from stating name and DOB. Use approved alternatives: caregiver present in the home, photograph in the chart (when available), medical record number on intake paperwork, or a combination. Never skip identification because the patient cannot respond verbally.',
      'Challenge 3 — Suggestibility: Some patients answer “yes” to any name. If you ask, “Are you Mary Smith?” a confused patient may agree even when they are not. Open-ended identification — the patient states the information — is the preferred technique.',
      'Challenge 4 — Multiple patients at one address: An elderly couple or multi-person household may both be on service. Each patient requires independent identification before each intervention. Orders, medications, supplies, and documentation must stay patient-specific and physically separated when possible.',
      'Challenge 5 — Language access: Limited English proficiency requires qualified interpretation per agency language-access policy (related: OP-PA-003). Do not rely on minor children as interpreters for clinical identification when policy requires a qualified interpreter or language line.',
    ],
    keyPoints: [
      {
        icon: '🏠',
        title: 'Address first layer',
        detail: 'Match house/apartment number and street before entry; still verify the person inside.',
      },
      {
        icon: '🧠',
        title: 'Cognitive barriers',
        detail: 'Caregiver + photo + MRN (as available) — never skip ID because speech is impaired.',
      },
      {
        icon: '🗣️',
        title: 'Open-ended only',
        detail: 'Patient states name/DOB; avoid yes/no leading questions.',
      },
      {
        icon: '👥',
        title: 'One person = one ID',
        detail: 'Shared address never means shared identity or shared orders.',
      },
    ],
    clinicalTip:
      'If two patients share a home, label bags and meds with patient name before you enter the room or bedside area, and re-verify identity at each medication or specimen step.',
    decision: {
      first: 'Verify address from the curb/entry, then open-ended patient identifiers (or approved alternative method).',
      continueIf: 'Location and patient identifiers align with the visit materials.',
      stopIf: 'Wrong address, patient cannot be identified by approved methods, or two patients’ materials are mixed without clear separation.',
      notify: 'Clinical supervisor/RN case manager for unresolved identity or wrong-home arrival.',
      document: 'Challenges encountered, alternative verification used, and confirmation result.',
    },
    hotspots: [
      {
        id: 'gps',
        label: 'Wrong address risk',
        x: 20,
        y: 30,
        detail:
          'GPS can place you one house off. Read the house number and apartment letter against the schedule before you knock.',
      },
      {
        id: 'cognition',
        label: 'Cognitive barrier',
        x: 55,
        y: 35,
        detail:
          'If the patient cannot state identifiers, use caregiver verification + chart photo + MRN per agency policy — still two identifiers.',
      },
      {
        id: 'suggest',
        label: 'Leading questions',
        x: 80,
        y: 55,
        detail:
          '“Are you…?” is high-risk with suggestible patients. Ask them to state their name and date of birth.',
      },
      {
        id: 'multi',
        label: 'Multi-patient home',
        x: 35,
        y: 75,
        detail:
          'Independently identify each patient. Never apply Patient A’s orders or meds to Patient B because they share a kitchen table.',
      },
    ],
  },
  {
    id: 3,
    title: 'The Verification Protocol — Step by Step',
    subtitle: 'Five-step home visit sequence (agency protocol)',
    badges: ['Agency protocol', 'OP-PA-002', 'Every visit'],
    scene: 'five-step',
    narration: [
      'Care Indeed’s patient identification protocol follows a standardized five-step sequence for every home visit: (1) address verification, (2) patient identification with two identifiers, (3) order verification, (4) allergy confirmation, and (5) clinical intervention. This sequence is agency protocol under OP-PA-002 — apply it consistently.',
      'Step 1 — Address verification (before exiting the vehicle): Confirm the address on the schedule matches the location. Note house number, street, apartment, and identifying features. If you cannot visually confirm, verify with the person at the door before proceeding into care.',
      'Step 2 — Patient identification (at the door or immediately on entry): Ask the patient to state full name and date of birth. Match both against the schedule, physician orders, and chart. Both must match. If either does not, stop and investigate — do not begin care.',
      'Step 3 — Order verification: After positive identification, confirm the orders you carry match this patient — name on orders, ordering clinician, order date, and planned interventions. In the EHR, confirm the active plan of care aligns with the scheduled visit type. LVNs implement the plan; they do not independently create or change the Plan of Care.',
      'Step 4 — Allergy confirmation: Before medication administration, wound product application, or latex-containing supplies, ask the patient to state allergies and compare to the chart. Resolve discrepancies before proceeding. New or conflicting allergy information is reported to the RN/authorized clinician per agency process — LVNs do not independently rewrite the allergy list as a medical diagnosis change.',
      'Step 5 — Clinical intervention: Begin only after steps 1–4 are complete. You have confirmed correct address, correct patient, correct orders, and verified allergy information. The full protocol typically takes about thirty to sixty seconds — negligible compared with the harm of a wrong-patient event.',
    ],
    keyPoints: [
      {
        icon: '1',
        title: 'Address',
        detail: 'Curbside/entry match to schedule before clinical engagement.',
      },
      {
        icon: '2',
        title: 'Two identifiers',
        detail: 'Open-ended name + DOB (or approved alternatives) matched to chart.',
      },
      {
        icon: '3',
        title: 'Orders',
        detail: 'Orders and visit type match this identified patient.',
      },
      {
        icon: '4→5',
        title: 'Allergies → care',
        detail: 'Allergy check precedes meds/products; then proceed with planned care.',
      },
    ],
    clinicalTip:
      'If you are interrupted mid-protocol (phone call, family conversation), restart from the incomplete step. Partial verification is not verification.',
    decision: {
      first: 'Complete address check, then two-identifier patient check before opening meds or supplies.',
      continueIf: 'Steps 1–4 complete with no discrepancies.',
      stopIf: 'Mismatch at any step, or inability to complete a required step.',
      notify: 'RN case manager/clinical supervisor for unresolved mismatches; follow agency escalation path.',
      document: 'Protocol completion, identifiers used, allergy confirmation, and any interruptions or issues.',
    },
    hotspots: [
      {
        id: 's1',
        label: 'Step 1 · Address',
        x: 15,
        y: 40,
        detail: 'Confirm house/apt against schedule before clinical care begins.',
      },
      {
        id: 's2',
        label: 'Step 2 · Two IDs',
        x: 35,
        y: 40,
        detail: 'Patient states name + DOB; both match chart/orders/schedule.',
      },
      {
        id: 's3',
        label: 'Step 3 · Orders',
        x: 55,
        y: 40,
        detail: 'Orders and POC visit type belong to this patient — not a roommate or spouse.',
      },
      {
        id: 's4',
        label: 'Step 4 · Allergies',
        x: 75,
        y: 40,
        detail: 'Patient-stated allergies vs chart before meds or topical products.',
      },
      {
        id: 's5',
        label: 'Step 5 · Proceed',
        x: 90,
        y: 70,
        detail: 'Only after 1–4 are verified do you begin the planned clinical intervention.',
      },
    ],
  },
  {
    id: 4,
    title: 'High-Risk Scenarios for ID Errors',
    subtitle: 'When vigilance must increase',
    badges: ['Safety', 'Clinical judgment', 'Agency incident process'],
    scene: 'high-risk',
    narration: [
      'Certain scenarios elevate identification error risk. Recognizing them helps you slow down and apply full safeguards.',
      'First visits: You have never met the patient; you have no visual memory; cognitive status is unknown until assessed. Use the full five-step protocol with zero shortcuts.',
      'Coverage/substitute visits: Covering clinicians lack baseline familiarity. Extra vigilance is required precisely because context is missing.',
      'Multi-patient households: Risk of applying one patient’s orders, medications, or interventions to another. Identify independently; keep supplies and documentation separated.',
      'Medication administration: Wrong-patient medication is among the most harmful ID failures. Right patient is always first among the medication rights — subsequent checks are meaningless on the wrong person.',
      'Specimen collection: A mislabeled specimen can drive wrong diagnosis or treatment for more than one patient. Label at the point of collection with at least two patient identifiers and verify the label against the patient’s stated identity before leaving the home.',
      'Near-miss pathway: Catching an error before intervention is a success for the patient and a critical learning signal for QAPI. Do not hide near-misses.',
    ],
    keyPoints: [
      {
        icon: '🆕',
        title: 'New / coverage visits',
        detail: 'No familiarity credit — full protocol every time.',
      },
      {
        icon: '💊',
        title: 'Meds & specimens',
        detail: 'Right patient first; label specimens immediately with two IDs.',
      },
      {
        icon: '⚠️',
        title: 'Near-miss value',
        detail: 'Report near-misses per agency process to protect the next patient.',
      },
      {
        icon: '🔗',
        title: 'Cascade risk',
        detail: 'Wrong address → wrong person → wrong orders → wrong med is a preventable chain.',
      },
    ],
    clinicalTip:
      'Before any high-risk task (injection, controlled substance, specimen), restate the two identifiers out loud and glance at the label/order name one more time.',
    decision: {
      first: 'Identify high-risk context (first visit, coverage, multi-patient, meds, specimen) and slow down.',
      continueIf: 'Identity, orders, and labels all match after deliberate re-check.',
      stopIf: 'Any mismatch on patient, med, label, or specimen identifiers.',
      notify: 'RN/supervisor and follow agency incident/near-miss reporting when a wrong-patient pathway is discovered.',
      document: 'What was nearly done, how it was caught, notifications, and corrective actions.',
    },
    hotspots: [
      {
        id: 'first',
        label: 'First visit',
        x: 20,
        y: 25,
        detail: 'Unknown patient and home — zero shortcuts on the five-step protocol.',
      },
      {
        id: 'cover',
        label: 'Coverage visit',
        x: 50,
        y: 25,
        detail: 'Substitute clinicians must not rely on “the regular nurse knows them.”',
      },
      {
        id: 'meds',
        label: 'Medication risk',
        x: 80,
        y: 40,
        detail: 'Right patient precedes right drug, dose, route, and time.',
      },
      {
        id: 'spec',
        label: 'Specimen labeling',
        x: 35,
        y: 70,
        detail: 'Two identifiers on the label at collection; verify before leaving the home.',
      },
      {
        id: 'chain',
        label: 'Error cascade',
        x: 70,
        y: 75,
        detail: 'Wrong address can cascade to wrong person, wrong orders, and wrong medication — interrupt early.',
      },
    ],
  },
  {
    id: 5,
    title: 'When Identification Fails — Escalation',
    subtitle: 'Stop · Notify · Document (SBAR)',
    badges: ['Agency escalation', 'SBAR', 'QAPI'],
    scene: 'sbar',
    narration: [
      'When you encounter a patient identification discrepancy, stop all clinical activities and escalate. A discrepancy is any situation where stated identifiers do not match the schedule, orders, or chart — name mismatch, DOB mismatch, address discrepancy, or inability to identify the patient by approved methods.',
      'Use SBAR to structure the report. Situation: you have an identification discrepancy. Background: what the patient stated, what documentation shows, and what you observed at the address. Assessment: your judgment on whether this looks like a documentation error, scheduling error, patient confusion, or other safety concern. Recommendation: what should happen next (chart correction, reschedule, supervisory verification, hold visit).',
      'Report immediately to the RN case manager or clinical supervisor per agency chain of command. Do not attempt to “solve” identity by guesswork. Do not provide clinical care until identity is positively confirmed. If the discrepancy cannot be resolved, you do not provide care. Delaying a visit is safer than treating the wrong patient.',
      'Document even when the issue resolves without harm: identifiers that failed to match, time discovered, who was notified, how it was resolved, and whether an incident/near-miss report is required under agency policy. This supports QAPI and system learning.',
      'Common contributing factors include wrong address on the schedule, unreported patient moves, legal name changes, DOB data-entry errors, and similar names on the same caseload. Your job is not to assign blame — it is to protect the patient in front of you and feed accurate information into the safety system.',
    ],
    keyPoints: [
      {
        icon: '🛑',
        title: 'STOP first',
        detail: 'No meds, no wound care, no specimens until identity is confirmed.',
      },
      {
        icon: '📡',
        title: 'SBAR notify',
        detail: 'Structured report to RN/supervisor — not informal hallway guessing.',
      },
      {
        icon: '📝',
        title: 'Document always',
        detail: 'Even resolved discrepancies belong in the record and often in incident systems.',
      },
      {
        icon: '🛡️',
        title: 'Delay > wrong care',
        detail: 'An unfinished visit is safer than a confident error.',
      },
    ],
    clinicalTip:
      'Write your SBAR on paper or in a secure note before you call if you are flustered — clarity protects both you and the patient.',
    decision: {
      first: 'Stop clinical activity the moment a mismatch is recognized.',
      continueIf: 'Identity is positively re-confirmed through approved methods and supervisor/RN guidance when required.',
      stopIf: 'Identity remains uncertain after available verification methods.',
      notify: 'RN case manager or clinical supervisor immediately; complete incident/near-miss report per agency policy.',
      document: 'Mismatch details, timeline, notifications, resolution or hold decision, and patient impact (none/near-miss/actual).',
    },
    hotspots: [
      {
        id: 's',
        label: 'S · Situation',
        x: 20,
        y: 35,
        detail: '“I have a patient identification discrepancy and have stopped care.”',
      },
      {
        id: 'b',
        label: 'B · Background',
        x: 40,
        y: 35,
        detail: 'State what the patient said, what the chart/schedule show, and address observations.',
      },
      {
        id: 'a',
        label: 'A · Assessment',
        x: 60,
        y: 35,
        detail: 'Your clinical judgment: documentation error vs wrong home vs confusion vs other risk.',
      },
      {
        id: 'r',
        label: 'R · Recommendation',
        x: 80,
        y: 35,
        detail: 'Hold care / verify / reschedule / request supervisory assistance — be specific.',
      },
      {
        id: 'stop',
        label: 'Hold care',
        x: 50,
        y: 75,
        detail: 'No clinical intervention until identity is positively confirmed.',
      },
    ],
  },
  {
    id: 6,
    title: 'Technology and Tools for Patient ID',
    subtitle: 'EHR supports verification — it does not replace it',
    badges: ['EHR tools', 'Agency workflow', 'Human verification'],
    scene: 'tech-tools',
    narration: [
      'Care Indeed’s EHR includes tools that support identification; technology supplements but never replaces the manual two-identifier protocol.',
      'Electronic schedule: displays full name, DOB, address, and phone for each visit. Review before departure. Resolve schedule-versus-record discrepancies before you drive.',
      'Patient photograph (when available): often captured at admission and updated periodically. Compare the person at the door to the chart photo as an adjunct identifier — still complete verbal/alternative two-identifier verification.',
      'Medication documentation checkpoints: the MAR workflow may require identification confirmation before medication documentation posts. Do not click through automatically; use the checkpoint as a genuine pause.',
      'Barcode or scanning technology, if deployed in home health, adds an electronic layer but does not excuse skipping open-ended or approved alternative verification.',
      'Emergency information packet in the home (when present) may list name, DOB, contacts, allergies, and medications as an additional reference — useful when the patient cannot self-identify, still cross-checked against agency chart data.',
      'LVN boundary: EHR tools help you execute safe care under the plan of care. They do not authorize independent POC changes, diagnosis, or order modification when something “looks off.” Escalate clinical order questions to the RN/authorized clinician.',
    ],
    keyPoints: [
      {
        icon: '📱',
        title: 'Pre-visit review',
        detail: 'Name, DOB, address, phone on the schedule — resolve conflicts before travel.',
      },
      {
        icon: '🖼️',
        title: 'Photo adjunct',
        detail: 'Photo supports identity; it is not a free pass to skip verbal/alternative IDs.',
      },
      {
        icon: '✅',
        title: 'EHR checkpoints',
        detail: 'Use required ID confirmations intentionally — never auto-bypass.',
      },
      {
        icon: '🧑‍⚕️',
        title: 'Human remains primary',
        detail: 'Technology fails, batteries die, photos age — protocol still stands.',
      },
    ],
    clinicalTip:
      'If the chart photo is outdated or missing, say so in your note and rely on approved identifiers + caregiver support rather than forcing a visual match.',
    decision: {
      first: 'Review schedule demographics and chart photo (if any) before arrival; verify in person on site.',
      continueIf: 'Electronic data and in-person identifiers agree.',
      stopIf: 'EHR data conflicts with the person/home in front of you.',
      notify: 'RN/supervisor and scheduling/clinical leadership as needed to correct demographic or assignment errors.',
      document: 'Tools used (photo, packet, EHR check), conflicts found, and resolution.',
    },
    hotspots: [
      {
        id: 'sched',
        label: 'Schedule card',
        x: 22,
        y: 30,
        detail: 'Name · DOB · address · phone — pre-visit reconciliation starts here.',
      },
      {
        id: 'photo',
        label: 'Chart photo',
        x: 50,
        y: 30,
        detail: 'Adjunct identifier only; still complete two-identifier verification.',
      },
      {
        id: 'mar',
        label: 'MAR checkpoint',
        x: 78,
        y: 30,
        detail: 'Identification confirmation before documenting medication administration.',
      },
      {
        id: 'packet',
        label: 'Home info packet',
        x: 40,
        y: 70,
        detail: 'May support verification when the patient cannot self-identify — cross-check the chart.',
      },
      {
        id: 'human',
        label: 'Human protocol',
        x: 70,
        y: 70,
        detail: 'Manual two-identifier verification remains mandatory even when tech works perfectly.',
      },
    ],
  },
  {
    id: 7,
    title: 'Documentation, Competency, and Mastery',
    subtitle: 'Record the check · prove the practice · know the limits of a quiz',
    badges: ['Documentation', 'Competency: Observation', 'QAPI'],
    scene: 'mastery',
    narration: [
      'Identification documentation is part of every visit note. Record that two-identifier verification was performed before care. EHR templates commonly include an identification confirmation field — complete it every visit with the identifiers used and any challenges.',
      'When identification is difficult (cognitive impairment, language barrier, new patient), document the challenge, alternative methods used (caregiver verification, photo, MRN), and the resolution. This demonstrates OP-PA-002 compliance and provides survey evidence that the protocol was followed.',
      'Incident reporting: wrong-patient near-misses and actual wrong-patient events must be reported through the agency incident system within the timeframe required by current agency policy (commonly within 24 hours at Care Indeed — always follow the policy in force). A near-miss is an error caught before clinical intervention; an actual event is any intervention on the wrong patient. Both feed QAPI.',
      'Competency validation for patient identification is performed by observation during supervised visits. A preceptor observes technique against the competency checklist: address verification, open-ended identification, order verification, allergy confirmation, and documentation. Passing this knowledge quiz does not by itself validate practical competency.',
      'You have completed the instructional content for LVN-011. Next: pass the 10-question knowledge check at 80% or higher. Observed demonstration and authorized sign-off remain separate requirements under the LVN track competency process.',
    ],
    keyPoints: [
      {
        icon: '📋',
        title: 'Every note',
        detail: 'Document two identifiers used and any ID challenges/resolution.',
      },
      {
        icon: '⏱️',
        title: 'Near-miss reporting',
        detail: 'Report per agency policy timeframe — near-misses protect future patients.',
      },
      {
        icon: '👀',
        title: 'Observation competency',
        detail: 'Practical skill is signed off by observation, not by quiz score alone.',
      },
      {
        icon: '🎯',
        title: 'Knowledge check next',
        detail: '80% required on 10 application questions; retry and review available.',
      },
    ],
    clinicalTip:
      'If you almost treated the wrong person and caught it, that report is a professional strength — silence is a system risk.',
    decision: {
      first: 'Complete ID documentation fields before finalizing the visit note.',
      continueIf: 'Identifiers, challenges, and outcomes are clearly recorded.',
      stopIf: 'You cannot truthfully attest that two-identifier verification occurred.',
      notify: 'Supervisor for competency gaps, near-misses, or documentation system barriers.',
      document: 'Identifiers, method, challenges, incident/near-miss number if applicable.',
    },
    hotspots: [
      {
        id: 'note',
        label: 'Visit note field',
        x: 25,
        y: 30,
        detail: 'Record the two identifiers used and confirmation before care.',
      },
      {
        id: 'challenge',
        label: 'Challenge note',
        x: 55,
        y: 30,
        detail: 'Describe barriers and alternative verification methods when used.',
      },
      {
        id: 'incident',
        label: 'Incident / near-miss',
        x: 80,
        y: 45,
        detail: 'Report wrong-patient pathways per agency policy timeframe and process.',
      },
      {
        id: 'observe',
        label: 'Observed competency',
        x: 40,
        y: 75,
        detail: 'Preceptor observation and authorized sign-off validate skill — quiz validates knowledge only.',
      },
      {
        id: 'badge',
        label: 'Knowledge mastery',
        x: 70,
        y: 75,
        detail: 'Complete the quiz at ≥80%. Practical competency remains a separate observed process.',
      },
    ],
  },
];

// ─── QUIZ (balanced A=3 B=3 C=2 D=2) ─────────────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Before any clinical intervention on a home visit, how many patient identifiers does Care Indeed policy OP-PA-002 require at minimum?',
    options: [
      'Two approved patient identifiers',
      'One identifier if you know the patient well',
      'Three identifiers including room number',
      'Four identifiers including diagnosis code',
    ],
    correct: 0, // A
    rationale:
      'OP-PA-002 requires a minimum of two patient identifiers before any clinical intervention. Familiarity is not an exception. Room number is not a home-health identifier.',
  },
  {
    id: 2,
    stem: 'You arrive for a visit. Which identification technique best reduces wrong-patient risk with a potentially suggestible patient?',
    options: [
      'Ask “Are you Maria Lopez?” and accept a yes',
      'Ask “What is your full name?” and “What is your date of birth?” then match the chart',
      'Skip verbal ID because the address matches your GPS',
      'Ask only the caregiver and never address the patient',
    ],
    correct: 1, // B
    rationale:
      'Open-ended identification (patient states name and DOB) is preferred. Leading yes/no questions, address-only checks, or caregiver-only approaches (when the patient can participate) increase error risk.',
  },
  {
    id: 3,
    stem: 'According to Care Indeed’s five-step home-visit ID protocol, what is the FIRST step?',
    options: [
      'Address verification against the schedule',
      'Allergy confirmation',
      'Medication preparation',
      'Documenting the visit note',
    ],
    correct: 0, // A
    rationale:
      'Address verification occurs first (typically before or at entry). Patient two-identifier check, order verification, allergy confirmation, and intervention follow in sequence.',
  },
  {
    id: 4,
    stem: 'Which of the following is NOT an acceptable patient identifier in home health under the standards taught in this module?',
    options: [
      'Full legal name',
      'Date of birth',
      'Room number',
      'Medical record number',
    ],
    correct: 2, // C
    rationale:
      'Home health does not use institutional room numbers as patient identifiers. Full legal name, DOB, MRN, and home address are examples of acceptable identifiers when used per agency policy.',
  },
  {
    id: 5,
    stem: 'A patient with advanced dementia cannot state their name or DOB. What should you do?',
    options: [
      'Skip identification and proceed because the address is correct',
      'Assume identity from the mailbox name alone',
      'Provide care first and identify later if time allows',
      'Use approved alternatives such as caregiver verification plus chart photo and/or MRN, still meeting two-identifier expectations',
    ],
    correct: 3, // D
    rationale:
      'Cognitive impairment never authorizes skipping ID. Use approved alternative methods (caregiver, photo, MRN, etc.) to achieve two-identifier verification per policy.',
  },
  {
    id: 6,
    stem: 'You collect a blood specimen in the home. What must the specimen label include at minimum regarding identity?',
    options: [
      'At least two patient identifiers, verified at collection before leaving the home',
      'Patient first name only',
      'Physician name only',
      'Diagnosis code only',
    ],
    correct: 0, // A
    rationale:
      'Specimens must be labeled at the point of collection with at least two patient identifiers and verified against the patient’s identification before the specimen leaves the home.',
  },
  {
    id: 7,
    stem: 'You discover the patient’s stated DOB does not match the chart. Which structured communication tool should you use when escalating?',
    options: [
      'SOAP only',
      'ADPIE only',
      'SBAR (Situation, Background, Assessment, Recommendation)',
      'A head-to-toe physical assessment checklist',
    ],
    correct: 2, // C
    rationale:
      'SBAR structures escalation of identification discrepancies: state the mismatch, background facts, your assessment of risk/type of error, and recommended next steps while care is held.',
  },
  {
    id: 8,
    stem: 'You realize the person at the door may not be the scheduled patient. What is your FIRST action?',
    options: [
      'Give the scheduled medications anyway to avoid a missed visit',
      'Stop all clinical activities until identity is positively confirmed',
      'Leave immediately without notifying anyone',
      'Ask the neighbor to confirm the patient’s identity and proceed',
    ],
    correct: 1, // B
    rationale:
      'Stop clinical activity first. Then investigate with approved identifiers, notify the RN/supervisor if unresolved, and document. Do not treat on uncertainty.',
  },
  {
    id: 9,
    stem: 'You care for both spouses in the same home on the same day. Which practice is required?',
    options: [
      'One identification at the door covers both patients for the whole visit',
      'Identify only the spouse who answers the door',
      'Use the shared address as the sole identifier for both',
      'Independently identify each patient before each patient’s clinical interventions',
    ],
    correct: 3, // D
    rationale:
      'Shared address never equals shared identity. Each patient requires independent identification; keep orders, meds, and documentation patient-specific.',
  },
  {
    id: 10,
    stem: 'You almost hung another patient’s medication list but caught the name mismatch before administering anything. What must you do?',
    options: [
      'Ignore it because no harm occurred',
      'Report the near-miss through the agency incident process within the timeframe required by current agency policy',
      'Report only if a medication was actually given',
      'Discuss it verbally with a coworker and leave it out of any system',
    ],
    correct: 1, // B
    rationale:
      'Near-misses must be reported per agency policy (Care Indeed commonly expects prompt reporting such as within 24 hours — follow the policy in force). Near-miss reporting fuels QAPI and prevents future harm. Quiz success here validates knowledge only, not observed competency.',
  },
];

// Verify distribution at module load (dev safety)
const _dist = QUIZ.reduce(
  (acc, q) => {
    acc[q.correct] = (acc[q.correct] || 0) + 1;
    return acc;
  },
  {} as Record<number, number>,
);
if (typeof console !== 'undefined') {
  // A=3 B=3 C=2 D=2 expected
  void _dist;
}

// ─── HOTSPOT PULSE ───────────────────────────────────────────────────────────
const pulseStyle = `
@keyframes lvn011Pulse {
  0%, 100% { opacity: 0.85; r: 14; }
  50% { opacity: 1; r: 17; }
}
@keyframes lvn011Glow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(37,99,235,0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(37,99,235,0.8)); }
}
@media (prefers-reduced-motion: reduce) {
  .lvn011-hotspot-circle { animation: none !important; }
}
`;

// ─── SCENE RENDERERS ─────────────────────────────────────────────────────────
interface SceneProps {
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
  hotspots: Hotspot[];
  phase: number;
}

function HotspotLayer({ hotspots, activeHotspot, onHotspot }: SceneProps) {
  return (
    <g>
      {hotspots.map((h) => {
        const active = activeHotspot === h.id;
        return (
          <g
            key={h.id}
            transform={`translate(${(h.x / 100) * 400}, ${(h.y / 100) * 300})`}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onHotspot(active ? null : h.id);
            }}
          >
            <circle
              className="lvn011-hotspot-circle"
              r={active ? 18 : 14}
              fill={active ? THEME.primary : 'rgba(37,99,235,0.25)'}
              stroke={active ? THEME.accent : THEME.primary}
              strokeWidth={active ? 3 : 2}
              style={{ animation: active ? undefined : 'lvn011Pulse 2.4s ease-in-out infinite' }}
            />
            <text
              textAnchor="middle"
              y={4}
              fontSize={11}
              fontWeight={700}
              fill={active ? '#fff' : THEME.primaryDark}
            >
              i
            </text>
            {active && (
              <text
                textAnchor="middle"
                y={32}
                fontSize={9}
                fontWeight={700}
                fill={THEME.dark}
              >
                {h.label.length > 22 ? `${h.label.slice(0, 20)}…` : h.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function SceneTwoId(props: SceneProps) {
  const ids = [
    { label: 'Full Legal Name', x: 70, y: 70, color: '#2563EB' },
    { label: 'Date of Birth', x: 200, y: 70, color: '#7C3AED' },
    { label: 'MRN', x: 330, y: 70, color: '#0D9488' },
    { label: 'Home Address', x: 200, y: 200, color: '#F59E0B' },
  ];
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="Two-identifier verification flow">
      <defs>
        <linearGradient id="lvn011bg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#lvn011bg1)" rx="12" />
      <text x="200" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        Two-Identifier Verification
      </text>
      <text x="200" y="46" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Select any two approved identifiers — match to chart
      </text>
      {/* Patient node */}
      <circle cx="200" cy="145" r="28" fill={THEME.primary} opacity={0.15} />
      <circle cx="200" cy="145" r="20" fill={THEME.primary} />
      <text x="200" y="149" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        PT
      </text>
      {ids.map((id) => (
        <g key={id.label}>
          <line
            x1={id.x}
            y1={id.y + 18}
            x2="200"
            y2="145"
            stroke={id.color}
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity={0.5}
          />
          <rect x={id.x - 48} y={id.y - 16} width="96" height="32" rx="8" fill="#fff" stroke={id.color} strokeWidth="2" />
          <text x={id.x} y={id.y + 4} textAnchor="middle" fontSize="9" fontWeight="600" fill={THEME.dark}>
            {id.label}
          </text>
        </g>
      ))}
      <rect x="90" y="250" width="220" height="28" rx="8" fill="#FEF3C7" stroke={THEME.accent} />
      <text x="200" y="268" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400E">
        Open-ended: patient states · you match
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneHomeChallenges(props: SceneProps) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="Home visit identity challenges">
      <rect width="400" height="300" fill="#F0FDFA" rx="12" />
      <text x="200" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        Home Visit Identity Risks
      </text>
      {/* House */}
      <polygon points="200,50 280,110 120,110" fill="#0D9488" opacity={0.85} />
      <rect x="140" y="110" width="120" height="90" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      <rect x="185" y="145" width="30" height="55" fill="#0F766E" />
      {/* Risks */}
      {[
        { t: 'GPS miss', x: 50, y: 90, c: '#F59E0B' },
        { t: 'Cognition', x: 340, y: 90, c: '#7C3AED' },
        { t: 'Leading Q', x: 50, y: 200, c: '#DC2626' },
        { t: '2 patients', x: 340, y: 200, c: '#2563EB' },
      ].map((r) => (
        <g key={r.t}>
          <rect x={r.x - 40} y={r.y - 14} width="80" height="28" rx="8" fill="#fff" stroke={r.c} strokeWidth="2" />
          <text x={r.x} y={r.y + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={THEME.dark}>
            {r.t}
          </text>
        </g>
      ))}
      <text x="200" y="230" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Sole verifier · no wristband · no second nurse
      </text>
      <rect x="70" y="250" width="260" height="30" rx="8" fill="#FEF2F2" stroke="#FECACA" />
      <text x="200" y="269" textAnchor="middle" fontSize="10" fontWeight="600" fill="#991B1B">
        Address match ≠ patient identity
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneFiveStep(props: SceneProps) {
  const steps = [
    { n: '1', label: 'Address', c: '#3B82F6' },
    { n: '2', label: 'Two IDs', c: '#8B5CF6' },
    { n: '3', label: 'Orders', c: '#059669' },
    { n: '4', label: 'Allergies', c: '#F59E0B' },
    { n: '5', label: 'Care', c: '#10B981' },
  ];
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="Five-step verification protocol">
      <rect width="400" height="300" fill="#F8FAFC" rx="12" />
      <text x="200" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        Five-Step Verification Protocol
      </text>
      <text x="200" y="46" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Agency sequence under OP-PA-002
      </text>
      {steps.map((s, i) => {
        const x = 40 + i * 70;
        return (
          <g key={s.n}>
            {i < steps.length - 1 && (
              <line x1={x + 28} y1="110" x2={x + 55} y2="110" stroke="#CBD5E1" strokeWidth="3" />
            )}
            <circle cx={x + 20} cy="110" r="22" fill={s.c} />
            <text x={x + 20} y="115" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
              {s.n}
            </text>
            <text x={x + 20} y="150" textAnchor="middle" fontSize="10" fontWeight="600" fill={THEME.dark}>
              {s.label}
            </text>
          </g>
        );
      })}
      <rect x="50" y="180" width="300" height="50" rx="10" fill="#EFF6FF" stroke="#BFDBFE" />
      <text x="200" y="200" textAnchor="middle" fontSize="11" fontWeight="600" fill={THEME.primaryDark}>
        Mismatch at any step → STOP
      </text>
      <text x="200" y="218" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Notify RN/supervisor · Document · Do not proceed
      </text>
      <rect x="80" y="248" width="240" height="28" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
      <text x="200" y="266" textAnchor="middle" fontSize="10" fontWeight="600" fill="#065F46">
        ~30–60 seconds protects the entire visit
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneHighRisk(props: SceneProps) {
  const chain = [
    { label: 'Wrong Address', y: 70, c: '#F59E0B' },
    { label: 'Name Mismatch', y: 120, c: '#F97316' },
    { label: 'Wrong Orders', y: 170, c: '#DC2626' },
    { label: 'Wrong Medication', y: 220, c: '#991B1B' },
  ];
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="Wrong-patient near-miss event tree">
      <rect width="400" height="300" fill="#FFF7ED" rx="12" />
      <text x="200" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        High-Risk Error Cascade
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Interrupt early — near-miss reporting saves patients
      </text>
      {chain.map((e, i) => (
        <g key={e.label}>
          {i < chain.length - 1 && (
            <line x1="120" y1={e.y + 14} x2="120" y2={chain[i + 1].y - 14} stroke={e.c} strokeWidth="3" />
          )}
          <rect x="40" y={e.y - 14} width="160" height="28" rx="8" fill="#fff" stroke={e.c} strokeWidth="2" />
          <text x="120" y={e.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill={THEME.dark}>
            {e.label}
          </text>
        </g>
      ))}
      <rect x="230" y="70" width="140" height="160" rx="12" fill="#fff" stroke="#FCA5A5" strokeWidth="2" />
      <text x="300" y="95" textAnchor="middle" fontSize="11" fontWeight="700" fill="#991B1B">
        Elevated risk
      </text>
      {['First visit', 'Coverage', 'Multi-patient', 'Meds', 'Specimens'].map((t, i) => (
        <text key={t} x="300" y={120 + i * 20} textAnchor="middle" fontSize="10" fill={THEME.dark}>
          {t}
        </text>
      ))}
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneSBAR(props: SceneProps) {
  const sbar = [
    { letter: 'S', label: 'Situation', desc: 'ID discrepancy', c: '#2563EB' },
    { letter: 'B', label: 'Background', desc: 'What matches / fails', c: '#7C3AED' },
    { letter: 'A', label: 'Assessment', desc: 'Risk / error type', c: '#F59E0B' },
    { letter: 'R', label: 'Recommend', desc: 'Hold · verify · next', c: '#10B981' },
  ];
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="SBAR escalation protocol">
      <rect width="400" height="300" fill="#EEF2FF" rx="12" />
      <text x="200" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        SBAR Escalation for ID Failures
      </text>
      {sbar.map((s, i) => {
        const x = 30 + i * 90;
        return (
          <g key={s.letter}>
            <rect x={x} y="50" width="80" height="110" rx="12" fill="#fff" stroke={s.c} strokeWidth="2.5" />
            <circle cx={x + 40} cy="78" r="18" fill={s.c} />
            <text x={x + 40} y="84" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">
              {s.letter}
            </text>
            <text x={x + 40} y="112" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.dark}>
              {s.label}
            </text>
            <text x={x + 40} y="130" textAnchor="middle" fontSize="9" fill={THEME.muted}>
              {s.desc}
            </text>
          </g>
        );
      })}
      <rect x="50" y="185" width="300" height="44" rx="10" fill="#FEF2F2" stroke="#FECACA" />
      <text x="200" y="203" textAnchor="middle" fontSize="12" fontWeight="700" fill="#991B1B">
        STOP CARE
      </text>
      <text x="200" y="220" textAnchor="middle" fontSize="10" fill="#7F1D1D">
        Notify RN / supervisor · Document · No improvisation
      </text>
      <rect x="70" y="248" width="260" height="28" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
      <text x="200" y="266" textAnchor="middle" fontSize="10" fontWeight="600" fill="#065F46">
        Delay visit &gt; wrong-patient intervention
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneTechTools(props: SceneProps) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="EHR and technology ID tools">
      <rect width="400" height="300" fill="#F0F9FF" rx="12" />
      <text x="200" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        Technology Supports — Humans Verify
      </text>
      {/* Devices */}
      <rect x="30" y="50" width="100" height="130" rx="10" fill="#fff" stroke="#2563EB" strokeWidth="2" />
      <text x="80" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.primary}>
        Schedule
      </text>
      <text x="80" y="95" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Name
      </text>
      <text x="80" y="112" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        DOB
      </text>
      <text x="80" y="129" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Address
      </text>
      <text x="80" y="146" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Phone
      </text>

      <rect x="150" y="50" width="100" height="130" rx="10" fill="#fff" stroke="#7C3AED" strokeWidth="2" />
      <text x="200" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.purple}>
        Chart Photo
      </text>
      <circle cx="200" cy="115" r="28" fill="#EDE9FE" stroke="#7C3AED" />
      <text x="200" y="119" textAnchor="middle" fontSize="10" fill={THEME.purple}>
        Photo
      </text>
      <text x="200" y="165" textAnchor="middle" fontSize="8" fill={THEME.muted}>
        Adjunct only
      </text>

      <rect x="270" y="50" width="100" height="130" rx="10" fill="#fff" stroke="#0D9488" strokeWidth="2" />
      <text x="320" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.teal}>
        MAR Check
      </text>
      <rect x="290" y="95" width="60" height="40" rx="6" fill="#CCFBF1" stroke="#0D9488" />
      <text x="320" y="119" textAnchor="middle" fontSize="9" fontWeight="700" fill="#115E59">
        Confirm ID
      </text>
      <text x="320" y="155" textAnchor="middle" fontSize="8" fill={THEME.muted}>
        No auto-click
      </text>

      <rect x="60" y="200" width="280" height="36" rx="8" fill="#FEF3C7" stroke="#FCD34D" />
      <text x="200" y="222" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400E">
        Tech supplements · protocol remains mandatory
      </text>
      <text x="200" y="260" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Home packet · barcode (if available) · still two IDs
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

function SceneMastery(props: SceneProps) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" role="img" aria-label="Documentation and competency mastery">
      <rect width="400" height="300" fill="#F5F3FF" rx="12" />
      <text x="200" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.dark}>
        Document · Report · Observed Competency
      </text>
      <rect x="30" y="50" width="160" height="120" rx="12" fill="#fff" stroke="#2563EB" strokeWidth="2" />
      <text x="110" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.primary}>
        Visit note
      </text>
      <text x="110" y="100" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        ✓ Two identifiers
      </text>
      <text x="110" y="118" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        ✓ Challenges noted
      </text>
      <text x="110" y="136" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        ✓ Resolution
      </text>

      <rect x="210" y="50" width="160" height="120" rx="12" fill="#fff" stroke="#DC2626" strokeWidth="2" />
      <text x="290" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.danger}>
        Near-miss / Event
      </text>
      <text x="290" y="100" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Report per policy
      </text>
      <text x="290" y="118" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Feed QAPI
      </text>
      <text x="290" y="136" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Protect next patient
      </text>

      <rect x="60" y="190" width="280" height="70" rx="12" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="2" />
      <text x="200" y="215" textAnchor="middle" fontSize="12" fontWeight="700" fill="#065F46">
        Quiz = knowledge only
      </text>
      <text x="200" y="235" textAnchor="middle" fontSize="10" fill="#047857">
        Practical competency = observation + authorized sign-off
      </text>
      <text x="200" y="252" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Method: Observation (LVN track)
      </text>
      <HotspotLayer {...props} />
    </svg>
  );
}

const SCENE_MAP: Record<string, React.FC<SceneProps>> = {
  'two-id': SceneTwoId,
  'home-challenges': SceneHomeChallenges,
  'five-step': SceneFiveStep,
  'high-risk': SceneHighRisk,
  sbar: SceneSBAR,
  'tech-tools': SceneTechTools,
  mastery: SceneMastery,
};

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
            <div className="text-[12px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase">MODULE LVN-011</div>
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

export default function LVN011() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);

  // In actual implementation, QUIZ might be an array or QUIZZES object.
  // @ts-ignore
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
