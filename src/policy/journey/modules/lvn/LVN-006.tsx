// @ts-nocheck
import { Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, X, AlertCircle, ShieldCheck, Compass } from 'lucide-react';
/**
 * LVN-006 — Medication Management & Reconciliation
 * Track: LVN — Licensed Vocational Nurse
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record: 6a558b113463cd690af8d631
 * Regulatory: 42 CFR § 484.60(a)(2); agency policy CL-SD-012, CL-SD-013
 * Scope: LVN med admin/recon within CA LVN scope; no independent order changes/prescribing
 * Quiz validates knowledge only — practical competency requires observed skills check-off
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ─── MODULE METADATA ─────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-006',
  title: 'Medication Management & Reconciliation',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.60(a)(2)',
  policy: 'CL-SD-012 (Medication Administration Safety), CL-SD-013 (Medication Reconciliation)',
  recordId: '6a558b113463cd690af8d631',
  themeColor: '#DC2626',
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
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#EF4444',
  secondary: '#FEF2F2',
  accent: '#F59E0B',
  dark: '#0F172A',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  info: '#3B82F6',
  purple: '#8B5CF6',
  bg: '#FEF2F2',
  white: '#FFFFFF',
  border: '#FECACA',
  panel: '#FFFFFF',
};

// ─── PAGE CONTENT ────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: "The LVN's Medication Safety Imperative",
    subtitle: 'Why medication safety is a top clinical priority in home health',
    narration: [
      'Medication errors are among the most common types of medical error in healthcare, and home health carries unique risks that make medication safety especially challenging. You are alone in the patient\'s home. There is no pharmacy double-check at the bedside. There is no second nurse to verify a dose calculation. The patient\'s medication supply is managed by the patient and caregivers, not a hospital pharmacy. In this environment, your knowledge and discipline are the primary barriers between a medication error and patient harm.',
      'Federal Conditions of Participation require that drugs and treatments be administered only as ordered by the physician (or allowed practitioner) under 42 CFR § 484.60(a)(2). Agency policy CL-SD-012 (Medication Administration Safety) and CL-SD-013 (Medication Reconciliation) operationalize how Care Indeed expects LVNs to administer, reconcile, educate, and respond when something goes wrong.',
      'Medication-related harm in home health can be harder to detect and reverse than in a hospital: discovery may be delayed because monitoring is intermittent; emergency response is not on-site; patients may not recognize adverse drug effects; and the next skilled visit may be days away. Prevention—not late rescue—is the reliable strategy.',
      'This module covers the complete medication safety framework for the LVN in home health: the Six Rights of medication administration, medication reconciliation at every skilled visit, high-alert medication protocols, patient education with teach-back, error classification and prevention, and the mandatory error-response sequence. Passing the knowledge check validates knowledge only; practical competency requires observed demonstration and authorized skills check-off per agency policy.',
    ],
    keyPoints: [
      {
        icon: '🏠',
        title: 'Solo practice risk',
        detail:
          'No second nurse, no bedside pharmacy verification, patient-managed supply, delayed discovery, delayed emergency response.',
      },
      {
        icon: '📜',
        title: 'Federal + agency anchors',
        detail:
          '42 CFR § 484.60(a)(2): administer drugs/treatments per order. CL-SD-012 / CL-SD-013: agency admin safety and reconciliation expectations.',
      },
      {
        icon: '🎓',
        title: 'Knowledge vs competency',
        detail:
          'Quiz pass = knowledge only. Observed skills demonstration and authorized sign-off remain separate for practical competency.',
      },
    ],
    clinicalTip:
      'Scenario cue — Mr. Vasquez, 74, new warfarin after DVT, also takes daily aspirin and fish oil. Before teaching or administering, reconcile the full list, flag bleeding-risk interactions, and notify the RN; do not independently discontinue or change any medication.',
    scopeNote:
      'Federal: drugs/treatments per physician (or allowed practitioner) orders — 42 CFR § 484.60(a)(2). Agency policy: CL-SD-012, CL-SD-013. LVN may administer ordered medications within CA LVN scope under the POC and RN direction; LVN does not prescribe, independently change orders, or decide discharge medication plans.',
    hotspots: [
      {
        id: 'p1-solo',
        label: 'Solo environment',
        x: 22,
        y: 30,
        info: 'You are often the only clinician present. Build habits that replace hospital double-checks: slow verification, written comparison, and early RN escalation.',
      },
      {
        id: 'p1-federal',
        label: '42 CFR § 484.60(a)(2)',
        x: 55,
        y: 48,
        info: 'Federal CoP expectation: drugs and treatments are administered as ordered. Do not invent doses, routes, or frequencies.',
      },
      {
        id: 'p1-policy',
        label: 'CL-SD-012 / 013',
        x: 78,
        y: 28,
        info: 'Agency policies define administration safety steps, reconciliation every skilled visit, high-alert handling, education, and error response.',
      },
      {
        id: 'p1-knowledge',
        label: 'Quiz = knowledge',
        x: 68,
        y: 74,
        info: 'Passing this knowledge check does not alone prove practical medication competency. Skills check-off and RN oversight still apply.',
      },
    ],
  },
  {
    id: 2,
    title: 'The Six Rights of Medication Administration',
    subtitle: 'Six rights × three verification moments = every administration',
    narration: [
      'The Six Rights are not a checklist you run once. They are a cognitive discipline applied at three separate moments during every medication administration: when you retrieve the medication, when you prepare the dose, and at the point of administration. Three checks, six rights each check, every time—for all medications, not only high-alert drugs.',
      'Right Patient: verify identity with two identifiers (full name and date of birth). In home health, “I already know this patient” is not a substitute for disciplined verification—especially with cognitive impairment, shared households, or look-alike family members. Right Drug: compare the label to the MAR/order; resolve brand vs generic names; pause on look-alike/sound-alike pairs (for example metFORMIN vs metroNIDAZOLE). If any doubt remains, do not administer—contact the RN or pharmacist pathway per agency process.',
      'Right Dose: match the ordered dose exactly. Recheck calculations for liquids and insulin. If a dose seems unusually high or low for the drug, stop and verify with the RN (and pharmacy/physician as directed) before giving. Right Route: PO, SL, topical, SQ, IM, inhalation, ophthalmic, and others each have technique rules; do not change route without an order. Right Time: administer per schedule and agency timing window (commonly within a 30-minute window of scheduled time where agency policy specifies one); document actual time given. Some drugs have critical timing relative to food or other meds—follow the order and drug-specific instructions. Right Documentation: document immediately after administration (drug, dose, route, actual time, site if injection, response, refusals). Never pre-document or batch-document hours later.',
      'An undocumented administration has no legal standing. Documenting a medication you did not give is fraud and creates a safety risk for the next clinician. If the patient refuses, document the refusal, the reason stated, education provided, and RN notification.',
    ],
    keyPoints: [
      {
        icon: '1️⃣',
        title: 'Three verification moments',
        detail:
          'Retrieve → prepare → administer. Repeat all Six Rights at each moment for every medication.',
      },
      {
        icon: '✅',
        title: 'Six Rights',
        detail:
          'Patient, Drug, Dose, Route, Time, Documentation—each is independently fail-able and independently checkable.',
      },
      {
        icon: '📝',
        title: 'Document actuals',
        detail:
          'Record actual time given, sites, responses, and refusals. Never pre-chart. Notify RN of refusals and concerns.',
      },
    ],
    clinicalTip:
      'If interrupted while preparing a medication, start the entire preparation and verification process over. You cannot reliably reconstruct which rights you completed before the interruption.',
    scopeNote:
      'Timing windows and MAR workflows are agency policy/professional practice details layered on the federal requirement to administer as ordered. LVN does not change dose, route, or schedule independently—escalate order questions to RN/physician/pharmacy per process.',
    hotspots: [
      {
        id: 'p2-patient',
        label: 'Right Patient',
        x: 18,
        y: 35,
        info: 'Two identifiers (name + DOB). Verify even for familiar patients; use caregiver/medical ID when cognition is impaired.',
      },
      {
        id: 'p2-drug',
        label: 'Right Drug',
        x: 38,
        y: 55,
        info: 'Label vs MAR/order. Resolve brand/generic and look-alike names before pouring or drawing.',
      },
      {
        id: 'p2-dose',
        label: 'Right Dose',
        x: 58,
        y: 35,
        info: 'Exact ordered dose; recheck calculations. Unusual doses → stop and verify with RN/pharmacy pathway.',
      },
      {
        id: 'p2-route-time',
        label: 'Route · Time · Doc',
        x: 80,
        y: 60,
        info: 'Route only as ordered; time per schedule/agency window; document immediately after giving—never before.',
      },
    ],
  },
  {
    id: 3,
    title: 'Medication Reconciliation Protocol',
    subtitle: 'Every skilled visit: POC list vs what is actually in the home',
    narration: [
      'Medication reconciliation is a systematic comparison of the patient\'s current Plan of Care (POC) medication list against medications actually present and used in the home. Per agency policy CL-SD-013, reconciliation is required at every skilled nursing visit—not only at Start of Care or Discharge. This is not a casual glance at bottles; it is a structured audit that catches discrepancies before they become adverse events.',
      'Process: (1) Obtain the current POC/EHR medication list—drug, dose, route, frequency, prescriber, indication when available. (2) Physically audit the home: kitchen, bathroom, bedroom, purses, nightstands—patients store medications everywhere. Note label name/strength, expiration, quantity remaining, and storage conditions (for example refrigeration for insulin). (3) Side-by-side comparison: flag POC meds missing from home, home meds not on POC (including other providers and OTC/supplements), dose mismatches, expired products, and duplicate therapies. (4) Document every discrepancy with specifics. (5) Notify the RN of all discrepancies—do not independently decide which ones “matter.”',
      'Watch for clinically important interaction patterns the patient may not recognize: anticoagulant + NSAID/aspirin/supplements with bleeding risk; oral hypoglycemics with poor intake; ACE inhibitor + potassium supplements. Your job is to find, document, and escalate—not to independently redesign the regimen.',
      'At every visit, ask three high-yield questions before or during the bottle audit: Have any medications changed since the last visit? Have you seen any other doctors? Have you started any new OTC medications or supplements? These questions often reveal discrepancies early; they do not replace the physical audit.',
    ],
    keyPoints: [
      {
        icon: '📋',
        title: 'Every skilled visit',
        detail:
          'CL-SD-013: reconcile at each skilled nursing visit—compare EHR/POC list to home supply and use.',
      },
      {
        icon: '🔍',
        title: 'Five-step forensic audit',
        detail:
          'POC list → physical home audit → side-by-side compare → document discrepancies → notify RN.',
      },
      {
        icon: '🚫',
        title: 'No independent list edits',
        detail:
          'LVN does not add/remove ordered meds on the POC or tell the patient to stop a drug without RN/physician direction.',
      },
    ],
    clinicalTip:
      'Finding OTC ibuprofen in the home of a patient on warfarin is a bleeding-risk signal. Document the finding and notify the RN immediately. Do not independently instruct the patient to stop the NSAID—that clinical decision belongs to the ordering practitioner via the RN/physician pathway.',
    scopeNote:
      'Agency policy: CL-SD-013 requires visit-level reconciliation. Federal CoPs require care per the plan of care/orders. LVN surfaces discrepancies; RN coordinates clinical significance and physician notification. LVN does not independently modify orders or the POC medication list.',
    hotspots: [
      {
        id: 'p3-poc',
        label: 'POC list',
        x: 20,
        y: 32,
        info: 'Start from the current EHR/POC medication list—your reference standard for comparison.',
      },
      {
        id: 'p3-audit',
        label: 'Home audit',
        x: 48,
        y: 52,
        info: 'Inspect all storage locations. Note name, strength, expiration, quantity, and storage conditions.',
      },
      {
        id: 'p3-flag',
        label: 'Discrepancies',
        x: 75,
        y: 30,
        info: 'Missing, extra, wrong dose, expired, duplicates, OTC/supplements not on list—document each with specifics.',
      },
      {
        id: 'p3-rn',
        label: 'Notify RN',
        x: 70,
        y: 72,
        info: 'Report all discrepancies to the supervising RN. Do not triage “minor” findings into silence.',
      },
    ],
  },
  {
    id: 4,
    title: 'High-Alert Medications',
    subtitle: 'Heightened harm potential — zero casual handling',
    narration: [
      'High-alert medications are drugs that carry a heightened risk of significant patient harm when used in error. The Institute for Safe Medication Practices (ISMP) maintains widely used high-alert lists—professional guidance that informs agency practice. In home health, five categories account for many serious medication-related events: anticoagulants, insulin, opioids, cardiac glycosides (digoxin), and oral hypoglycemics such as metformin.',
      'Per agency policy CL-SD-012 high-alert expectations: verify against the EHR/order, verify against the medication label, and re-verify at the point of administration. Any uncertainty means do not administer—contact the RN immediately. There is no “I will ask later” for high-alert drugs. Independent double-nurse check is often unavailable in the home; your disciplined triple verification and early escalation replace institutional second checks.',
      'Anticoagulants (warfarin and others): assess for bleeding signs each visit; reconcile for NSAIDs, aspirin, antibiotics, and supplements; educate on consistent vitamin K intake when relevant; report new meds from other providers. Therapeutic INR targets are indication-specific and set by the ordering practitioner—use the ordered parameters and available lab results; do not invent a universal INR “rule.” Insulin: check glucose before administration when ordered/appropriate; read the full label (type/concentration); use insulin-specific syringes/devices; rotate sites; hold and notify per ordered parameters when glucose is below hold thresholds (commonly <70 mg/dL when ordered as such). Opioids: assess pain, respiratory rate, sedation, and bowel function; confirm naloxone availability when prescribed; count controlled substances per CL-SD-012 controlled-substance procedures and report count discrepancies immediately.',
      'Digoxin: narrow therapeutic index. Before each dose, take an apical pulse for a full 60 seconds. Hold and notify the physician (and RN per agency escalation) if apical pulse is below the ordered parameter—commonly <60 BPM when the order so states—or if toxicity signs appear (nausea, visual changes, anorexia, fatigue). Hypokalemia can potentiate digoxin toxicity—flag relevant labs/symptoms to the RN. Metformin and oral hypoglycemics: take with food when instructed; monitor glucose as ordered; watch for serious illness signs that warrant urgent RN/physician contact; educate on alcohol interaction risk where relevant.',
      'Never adjust a high-alert dose without a specific physician (or allowed practitioner) order. If the patient says “my doctor told me to take two,” verify the order change through proper channels before administering a different dose.',
    ],
    keyPoints: [
      {
        icon: '⚠️',
        title: 'Triple verification',
        detail:
          'Order ↔ label ↔ point of administration. Uncertainty = hold and contact RN immediately.',
      },
      {
        icon: '💊',
        title: 'Five high-risk families',
        detail:
          'Anticoagulants, insulin, opioids, digoxin, oral hypoglycemics—know assessment and hold cues for each.',
      },
      {
        icon: '🛑',
        title: 'No independent dose changes',
        detail:
          'Patient verbal claims about “new instructions” are not orders. Verify before giving a different dose.',
      },
    ],
    clinicalTip:
      'For digoxin, apical pulse must be counted for a full 60 seconds—not 15×4. Hold per ordered parameters and notify RN/physician before giving when the pulse is below the hold threshold or toxicity is suspected.',
    scopeNote:
      'ISMP high-alert lists = professional guidance. Hold parameters and INR/glucose targets = physician orders + clinical standards as ordered. Agency policy CL-SD-012 operationalizes high-alert and controlled-substance handling. LVN administers within order; does not prescribe or titrate independently.',
    hotspots: [
      {
        id: 'p4-warfarin',
        label: 'Anticoagulants',
        x: 18,
        y: 40,
        info: 'Bleeding assessment, interaction recon (NSAIDs/OTC), educate consistency, escalate new meds—use ordered INR targets.',
      },
      {
        id: 'p4-insulin',
        label: 'Insulin',
        x: 40,
        y: 28,
        info: 'Confirm type/concentration, glucose before dose when indicated, correct device, hold per ordered low-glucose parameters.',
      },
      {
        id: 'p4-opioids',
        label: 'Opioids',
        x: 62,
        y: 40,
        info: 'Pain, RR, sedation, bowels; naloxone if prescribed; controlled-count per policy; report count discrepancies now.',
      },
      {
        id: 'p4-digoxin',
        label: 'Digoxin / OHAs',
        x: 82,
        y: 62,
        info: 'Digoxin: full 60-sec apical pulse; hold/notify per order. Oral hypoglycemics: food, glucose monitoring, serious-illness red flags.',
      },
    ],
  },
  {
    id: 5,
    title: 'Patient Education & Teach-Back',
    subtitle: 'Confirm understanding — do not accept a polite “yes”',
    narration: [
      'Medication education is not merely telling patients about their drugs—it is verifying understanding. Teach-back is the gold-standard method for confirming comprehension and is required by agency policy CL-SD-012 for medication-related education. Many errors between visits occur because the patient did not understand purpose, side effects, technique, or how to remember the regimen.',
      'Teach-back is not asking “Do you understand?” (patients usually say yes). Teach-back is asking the patient to explain or demonstrate in their own words or actions: “Tell me how you take your warfarin,” or “Show me how you prepare your insulin.” Chunk complex regimens: teach 2–3 medications, teach-back, then continue—spread education across visits when needed.',
      'Four education domains: (1) Purpose—why this drug for this patient, in plain language. (2) Side effects—focus on actionable warning signs that require calling the clinician (for example bleeding signs on anticoagulants). (3) Technique—with/without food, injection site rotation, inhaler steps; have the patient demonstrate. (4) Adherence—pill organizers, alarms, routine linking, caregiver help, refill planning; identify barriers such as cost, side effects, cognition, or regimen complexity.',
      'Document education with: topics taught, methods used (verbal, demonstration, written materials), the patient\'s teach-back response (verbatim when possible), your assessment of comprehension (good / partial—needs reinforcement / poor—needs RN follow-up), and the plan for continued teaching. Escalate persistent misunderstanding to the RN.',
    ],
    keyPoints: [
      {
        icon: '🗣️',
        title: 'Teach-back required',
        detail:
          'Patient explains or demonstrates. Yes/no “Do you understand?” is not teach-back (CL-SD-012).',
      },
      {
        icon: '📦',
        title: 'Four domains',
        detail:
          'Purpose, side effects (actionable), technique (show me), adherence (how will you remember?).',
      },
      {
        icon: '🗂️',
        title: 'Chunk and document',
        detail:
          '2–3 meds at a time; record teach-back response and comprehension level; plan follow-up teaching.',
      },
    ],
    clinicalTip:
      'For inhalers and insulin, demonstration beats lecture. Watch the patient perform the steps and correct technique in the moment.',
    scopeNote:
      'Education content must align with ordered therapy and the POC. LVN teaches and verifies understanding within scope; complex regimen redesign, new prescriptions, and order changes remain RN/physician/pharmacy roles.',
    hotspots: [
      {
        id: 'p5-purpose',
        label: 'Purpose',
        x: 22,
        y: 35,
        info: 'Plain-language “why.” Teach-back: “Tell me what this medication does for you.”',
      },
      {
        id: 'p5-side',
        label: 'Side effects',
        x: 48,
        y: 28,
        info: 'Actionable warning signs and when to call—not a dump of every rare effect.',
      },
      {
        id: 'p5-tech',
        label: 'Technique',
        x: 72,
        y: 40,
        info: 'Show-me verification for injections, inhalers, eye drops, and special oral instructions.',
      },
      {
        id: 'p5-adhere',
        label: 'Adherence',
        x: 55,
        y: 72,
        info: 'Memory aids, caregiver support, barriers (cost, side effects, cognition). Plan realistic routines.',
      },
    ],
  },
  {
    id: 6,
    title: 'Medication Error Prevention & Classification',
    subtitle: 'Knowledge, performance, and system vulnerabilities',
    narration: [
      'Medication errors rarely have a single cause. Safety science describes layered defenses (often called the Swiss cheese model): when holes align, an error reaches the patient. Understanding error types helps you build personal safeguards and report system weaknesses.',
      'Type A — Knowledge-based: you do not know something you should (unfamiliar drug, dose range, interaction, technique). Prevention: look up unfamiliar drugs before administration; ask RN/pharmacy when knowledge is incomplete. Type B — Performance-based: you know the right action but fail to execute it (skipped verification under time pressure, misread label 10 mg vs 100 mg, similar bottles). Prevention: slow down, use adequate lighting, eliminate distractions during preparation; if interrupted, start over. Type C — System-based: look-alike packaging, unclear orders, communication failures between providers, rushed schedules. Prevention: report vulnerabilities and near-misses through the QA pathway so leadership can fix systems.',
      'A near-miss is an error caught before it reaches the patient (wrong bottle noticed, calculation corrected, interaction recognized in time). Near-misses should be reported—not ignored. Reporting is a safety practice, not a request for punishment. Agency policy expects transparent reporting so vulnerabilities can be fixed before harm occurs.',
      'High-risk home health situations: multiple patients with similar regimens in one day; medication changes between visits not communicated to you; family “reorganization” of bottles; poor lighting; patient distraction during prep; end-of-day fatigue. Personal habits: prepare one patient at a time; three label reads (pick up, pour/draw, return); if something feels wrong—stop.',
    ],
    keyPoints: [
      {
        icon: 'A',
        title: 'Knowledge errors',
        detail:
          'Unknown drug/dose/interaction/technique → look up and clarify before giving.',
      },
      {
        icon: 'B',
        title: 'Performance errors',
        detail:
          'Rushing, interruptions, misreads → light, focus, start over after interruptions.',
      },
      {
        icon: 'C',
        title: 'System + near-miss',
        detail:
          'Report look-alikes, unclear orders, and near-misses via QA. Near-miss reports protect future patients.',
      },
    ],
    clinicalTip:
      'Never prepare medications for two patients simultaneously. Context switching is a classic setup for giving Patient A’s dose to Patient B’s workflow.',
    scopeNote:
      'Error taxonomy is professional safety guidance. Reporting timelines and QA systems are agency policy. Disciplinary rules for concealment (for example HR policies) are agency HR—not clinical scope of practice statutes.',
    hotspots: [
      {
        id: 'p6-typea',
        label: 'Type A',
        x: 22,
        y: 40,
        info: 'Knowledge gaps. Never administer an unfamiliar medication without a drug reference and clarification path.',
      },
      {
        id: 'p6-typeb',
        label: 'Type B',
        x: 50,
        y: 30,
        info: 'Performance slips under pressure. Interruptions → restart preparation from the beginning.',
      },
      {
        id: 'p6-typec',
        label: 'Type C',
        x: 78,
        y: 42,
        info: 'System traps: look-alikes, unclear orders, handoff failures. Report so the system can improve.',
      },
      {
        id: 'p6-near',
        label: 'Near-miss',
        x: 55,
        y: 72,
        info: 'Caught before patient impact → report through QA as a positive safety catch, not something to hide.',
      },
    ],
  },
  {
    id: 7,
    title: 'Error Response & Module Summary',
    subtitle: 'STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT',
    narration: [
      'Despite strong prevention, medication errors or suspected errors can still occur. When they do, response must be immediate, systematic, and transparent. Agency policy CL-SD-012 error-response expectations apply whether or not harm is obvious. “No harm” events still require full protocol because they reveal process vulnerabilities.',
      'Sequence: (1) STOP — cease medication administration; secure remaining medications; do not “fix” the error with unsolicited extra doses. (2) ASSESS — vital signs and symptoms related to the specific error; clarify what was given versus what was ordered (drug, dose, route, time). (3) NOTIFY — supervising RN immediately; physician per RN direction or directly if RN unavailable per agency escalation; pharmacy for drug-specific guidance when appropriate. Provide patient identity, what was given vs ordered, vitals, and symptoms. (4) INTERVENE — within LVN scope and only per RN/physician direction (monitoring, positioning, ordered antidotes if competent and ordered—for example naloxone when ordered and available). Do not leave the patient until directed regarding monitoring level. (5) DOCUMENT — visit note narrative plus formal incident/QA entry. (6) REPORT — submit the QA incident report same day per agency policy; participate honestly in root-cause review. RCA aims to improve systems, not to replace accountability for concealment.',
      'Never conceal a medication error. Concealment is typically a terminable offense under agency HR policy and can convert a clinical event into a trust and legal crisis. Late reporting is always better than no reporting.',
      'Module summary: Six Rights with triple verification, every-visit reconciliation, high-alert discipline, teach-back education, error-type prevention, and transparent error response form your medication safety framework. In home health you practice with high independence of presence—not independence of order authority. You administer as ordered, reconcile and escalate, educate and verify, and stop when uncertain. This knowledge check validates knowledge only; observed medication skills demonstration and authorized check-off remain required for practical competency per agency policy.',
    ],
    keyPoints: [
      {
        icon: '🛑',
        title: 'STOP first',
        detail:
          'Cease admin and secure meds before assess/notify/intervene. Panic fixes cause second errors.',
      },
      {
        icon: '📞',
        title: 'Notify chain',
        detail:
          'RN immediately; physician per escalation; pharmacy as needed. Give facts: given vs ordered + vitals.',
      },
      {
        icon: '📣',
        title: 'No concealment',
        detail:
          'Document + QA report same day per policy. Late report beats silence. Quiz ≠ field competency alone.',
      },
    ],
    clinicalTip:
      'If you realize hours later that a dose may have been wrong, still STOP further related admin if ongoing, ASSESS current status, and NOTIFY the RN immediately—do not wait for the next scheduled visit.',
    scopeNote:
      'LVN implements ordered interventions and monitoring within CA LVN scope. Antidotes and emergency meds only when ordered and within competency. LVN does not independently prescribe reversal agents or alter the POC. Practical competency = observed skills check-off + authorized sign-off, separate from this quiz.',
    hotspots: [
      {
        id: 'p7-stop',
        label: 'STOP',
        x: 16,
        y: 45,
        info: 'First action always: stop administration and secure remaining medications.',
      },
      {
        id: 'p7-assess',
        label: 'ASSESS',
        x: 34,
        y: 30,
        info: 'Vitals, symptoms, and exact given-vs-ordered reconstruction.',
      },
      {
        id: 'p7-notify',
        label: 'NOTIFY',
        x: 52,
        y: 45,
        info: 'RN immediately; physician/pharmacy per agency escalation and clinical need.',
      },
      {
        id: 'p7-doc',
        label: 'DOC / REPORT',
        x: 78,
        y: 55,
        info: 'Visit narrative + incident/QA report same day. Honest RCA participation. Never conceal.',
      },
    ],
  },
];

// ─── QUIZ (10 Q, balanced A=2 B=3 C=3 D=2) ───────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'How many times should you verify the Six Rights during a single medication administration?',
    options: [
      'Once, only at the moment the patient swallows or receives the dose',
      'Twice: when preparing and when documenting after the visit',
      'Three times: when retrieving, when preparing, and when administering',
      'Only when administering high-alert medications',
    ],
    correct: 2,
    rationale:
      'Three verification moments apply to every medication: retrieve, prepare, and administer. High-alert drugs get extra caution but are not the only medications requiring triple verification.',
  },
  {
    id: 2,
    stem: 'What is the teach-back method, and why is it required for medication education?',
    options: [
      'Asking “Do you understand?” so the patient can confirm with yes/no',
      'Having the patient explain or demonstrate in their own words/actions to verify actual comprehension',
      'Repeating the same monologue every visit until the patient memorizes it',
      'Handing written materials and obtaining a signature that materials were received',
    ],
    correct: 1,
    rationale:
      'Teach-back requires explanation or demonstration. Yes/no questions and signatures alone do not prove comprehension. Agency policy CL-SD-012 expects teach-back for medication-related education.',
  },
  {
    id: 3,
    stem: 'During reconciliation you find OTC ibuprofen in the home of a patient on warfarin; ibuprofen is not on the POC. What is the correct LVN action?',
    options: [
      'Document the finding and notify the RN immediately because of bleeding-risk interaction potential',
      'Tell the patient to permanently stop ibuprofen on your own authority',
      'Ignore OTC products because only prescription drugs count in reconciliation',
      'Add ibuprofen to the POC medication list yourself without RN/physician involvement',
    ],
    correct: 0,
    rationale:
      'NSAID + anticoagulant is a significant bleeding-risk pattern. Document and notify the RN. The LVN does not independently discontinue therapies or edit the POC medication list; order changes require the proper practitioner pathway.',
  },
  {
    id: 4,
    stem: 'Before administering digoxin, what assessment is expected, and what should you do if the hold parameter is met?',
    options: [
      'Check blood pressure only; hold if systolic is under 100 and give the dose later without notice',
      'Take apical pulse for a full 60 seconds; hold if below the ordered parameter (commonly <60 BPM when so ordered) and notify RN/physician before giving',
      'Check respiratory rate only; hold if under 12 and document without notification',
      'Check capillary blood glucose; hold if under 70 and crush the digoxin into food',
    ],
    correct: 1,
    rationale:
      'Digoxin requires a full 60-second apical pulse. Hold and notify per ordered parameters (commonly <60 BPM when ordered). Do not invent substitute assessments or silent holds.',
  },
  {
    id: 5,
    stem: 'What is the first step in the medication error response protocol?',
    options: [
      'Document the event in the visit note before doing anything else',
      'Notify the supervising RN before securing medications',
      'Assess vital signs while continuing other medication administrations',
      'STOP all medication administration and secure remaining medications',
    ],
    correct: 3,
    rationale:
      'STOP is first: cease administration and secure remaining medications. ASSESS, NOTIFY, INTERVENE, DOCUMENT, and REPORT follow in sequence.',
  },
  {
    id: 6,
    stem: 'Per agency medication reconciliation expectations referenced in this module, reconciliation must be performed:',
    options: [
      'Only at Start of Care and Discharge',
      'At every skilled nursing visit',
      'Once per calendar month regardless of visit frequency',
      'Only when the patient volunteers that a medication changed',
    ],
    correct: 1,
    rationale:
      'CL-SD-013 requires medication reconciliation at every skilled nursing visit so discrepancies between the POC list and home use are caught between visits—not only at admission or discharge.',
  },
  {
    id: 7,
    stem: 'What makes home health medication administration uniquely high-risk compared with many hospital settings?',
    options: [
      'Home health patients always take fewer medications than inpatients',
      'Home health always has better bedside barcode verification than hospitals',
      'You are often alone—no second nurse check, no bedside pharmacy verification, delayed discovery, and delayed on-site emergency response',
      'Home health patients are uniformly lower acuity and need less vigilance',
    ],
    correct: 2,
    rationale:
      'Solo practice, patient-managed supply, intermittent monitoring, and delayed emergency resources increase reliance on personal verification discipline and early escalation.',
  },
  {
    id: 8,
    stem: 'A near-miss medication event (caught before reaching the patient) should be:',
    options: [
      'Reported through the agency QA/incident pathway as a safety catch so vulnerabilities can be fixed',
      'Ignored because no harm occurred and reporting would only create paperwork',
      'Mentioned informally to a coworker but never entered into any system',
      'Reported only if a supervisor specifically asks about it weeks later',
    ],
    correct: 0,
    rationale:
      'Near-miss reporting is a core safety practice. Events caught early reveal system and process holes before patients are harmed. Silence removes the chance to improve.',
  },
  {
    id: 9,
    stem: 'You are interrupted while preparing a medication. What is the correct action?',
    options: [
      'Continue from memory at the exact step where you stopped',
      'Ask the patient to remind you which tablets you already counted',
      'Start the entire preparation and verification process over from the beginning',
      'Administer whatever is already poured to avoid “wasting” time',
    ],
    correct: 2,
    rationale:
      'Interruptions drive performance errors. Restarting preparation and Six Rights verification is safer than reconstructing incomplete steps from memory.',
  },
  {
    id: 10,
    stem: 'Which three questions best open reconciliation discussions at visits (in addition to the physical medication audit)?',
    options: [
      '“Are you taking your medications? Do they work? Do you have enough?” only',
      '“Do you need refills? Are you having side effects? Can you afford your medications?” only',
      '“Did you take every dose today? What time? Did you miss any?” only',
      '“Have any medications changed? Have you seen other doctors? Have you started any OTC medications or supplements?”',
    ],
    correct: 3,
    rationale:
      'Change of meds, other prescribers, and new OTC/supplements commonly introduce unlisted therapies and interactions. They complement—not replace—the physical home audit. Other questions may be useful clinically but are not the primary reconciliation triad taught here.',
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
              background: isOn ? THEME.accent : 'rgba(220,38,38,0.12)',
              color: isOn ? THEME.dark : THEME.primary,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: isOn
                ? '0 0 0 6px rgba(245,158,11,0.28)'
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
            background: 'rgba(15,23,42,0.94)',
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

// ─── SVG SCENES (7 distinct) ─────────────────────────────────────────────────
const SceneSafetyCommand: React.FC<SceneProps> = (props) => {
  const domains = [
    { label: 'Six Rights', color: '#10B981' },
    { label: 'Recon', color: '#3B82F6' },
    { label: 'High-Alert', color: '#DC2626' },
    { label: 'Teach-Back', color: '#F59E0B' },
    { label: 'Prevention', color: '#8B5CF6' },
    { label: 'Response', color: '#EF4444' },
  ];
  const pulse = 0.5 + 0.5 * Math.sin(props.animPhase / 12);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Medication safety domains">
        <defs>
          <radialGradient id="medGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FEE2E2" />
            <stop offset="100%" stopColor="#FEF2F2" />
          </radialGradient>
        </defs>
        <rect width="320" height="300" fill="url(#medGlow)" rx="12" />
        <text x="160" y="26" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Medication Safety Map
        </text>
        <circle cx="160" cy="145" r={52 + pulse * 4} fill="#FEE2E2" stroke={THEME.primary} strokeWidth="2" opacity="0.9" />
        <circle cx="160" cy="145" r="36" fill={THEME.white} stroke={THEME.primary} strokeWidth="2" />
        <text x="160" y="140" textAnchor="middle" fill={THEME.primaryDark} fontSize="11" fontWeight="700">
          LVN
        </text>
        <text x="160" y="156" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Safety Core
        </text>
        {domains.map((d, i) => {
          const ang = (-90 + i * 60) * (Math.PI / 180);
          const x = 160 + 100 * Math.cos(ang);
          const y = 145 + 88 * Math.sin(ang);
          return (
            <g key={d.label}>
              <rect x={x - 36} y={y - 14} width="72" height="28" rx="8" fill={THEME.white} stroke={d.color} strokeWidth="1.5" />
              <circle cx={x - 24} cy={y} r="5" fill={d.color} />
              <text x={x + 4} y={y + 4} textAnchor="middle" fill={THEME.dark} fontSize="9" fontWeight="600">
                {d.label}
              </text>
            </g>
          );
        })}
        <text x="160" y="285" textAnchor="middle" fill={THEME.muted} fontSize="9">
          Solo home setting — verification is your primary defense
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneSixRightsChain: React.FC<SceneProps> = (props) => {
  const rights = [
    { t: 'Patient', c: '#3B82F6' },
    { t: 'Drug', c: '#8B5CF6' },
    { t: 'Dose', c: '#10B981' },
    { t: 'Route', c: '#F59E0B' },
    { t: 'Time', c: '#EF4444' },
    { t: 'Doc', c: '#0891B2' },
  ];
  const moments = ['Retrieve', 'Prepare', 'Administer'];
  const activeMoment = Math.floor((props.animPhase / 60) % 3);
  const activeRight = Math.floor((props.animPhase / 30) % 6);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Six Rights verification chain">
        <rect width="320" height="300" fill="#F0FDF4" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Six Rights × Three Moments
        </text>
        {moments.map((m, i) => {
          const x = 40 + i * 95;
          const on = i === activeMoment;
          return (
            <g key={m}>
              <rect
                x={x}
                y={40}
                width="86"
                height="28"
                rx="8"
                fill={on ? '#10B981' : THEME.white}
                stroke={on ? '#059669' : '#86EFAC'}
                strokeWidth="1.5"
              />
              <text x={x + 43} y={58} textAnchor="middle" fill={on ? THEME.white : THEME.dark} fontSize="11" fontWeight="700">
                {i + 1}. {m}
              </text>
              {i < 2 && (
                <path d={`M ${x + 90} 54 L ${x + 92} 54`} stroke="#86EFAC" strokeWidth="2" markerEnd="url(#arrow)" />
              )}
            </g>
          );
        })}
        {rights.map((r, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = 28 + col * 95;
          const y = 100 + row * 70;
          const on = i === activeRight;
          return (
            <g key={r.t}>
              <rect
                x={x}
                y={y}
                width="86"
                height="52"
                rx="10"
                fill={on ? r.c : THEME.white}
                stroke={r.c}
                strokeWidth="2"
                opacity={on ? 1 : 0.92}
              />
              <text x={x + 43} y={y + 22} textAnchor="middle" fill={on ? THEME.white : r.c} fontSize="10" fontWeight="700">
                Right
              </text>
              <text x={x + 43} y={y + 38} textAnchor="middle" fill={on ? THEME.white : THEME.dark} fontSize="12" fontWeight="700">
                {r.t}
              </text>
            </g>
          );
        })}
        <text x="160" y="275" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Active moment: {moments[activeMoment]} — re-check all six
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneReconciliationLab: React.FC<SceneProps> = (props) => {
  const rows = [
    { drug: 'Warfarin 5 mg', poc: 'Yes', home: 'Yes', ok: true },
    { drug: 'Ibuprofen OTC', poc: 'No', home: 'Yes', ok: false },
    { drug: 'Metformin 500', poc: 'BID', home: '1000 mg', ok: false },
    { drug: 'Lisinopril 10', poc: 'Yes', home: 'Yes', ok: true },
  ];
  const flash = Math.floor(props.animPhase / 40) % rows.length;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Medication reconciliation comparison">
        <rect width="320" height="300" fill="#EFF6FF" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Reconciliation Forensics
        </text>
        <rect x="16" y="40" width="140" height="28" rx="6" fill="#DBEAFE" stroke="#3B82F6" />
        <text x="86" y="58" textAnchor="middle" fill="#1E40AF" fontSize="11" fontWeight="700">
          POC / EHR List
        </text>
        <rect x="164" y="40" width="140" height="28" rx="6" fill="#FEE2E2" stroke="#DC2626" />
        <text x="234" y="58" textAnchor="middle" fill="#991B1B" fontSize="11" fontWeight="700">
          Home Audit
        </text>
        {rows.map((r, i) => {
          const y = 84 + i * 42;
          const highlight = i === flash;
          return (
            <g key={r.drug}>
              <rect
                x="16"
                y={y}
                width="288"
                height="36"
                rx="8"
                fill={r.ok ? '#ECFDF5' : highlight ? '#FEF3C7' : '#FFF7ED'}
                stroke={r.ok ? '#10B981' : THEME.primary}
                strokeWidth={highlight && !r.ok ? 2.5 : 1}
              />
              <text x="28" y={y + 22} fill={THEME.dark} fontSize="11" fontWeight="600">
                {r.drug}
              </text>
              <text x="175" y={y + 22} fill={THEME.muted} fontSize="10">
                POC:{r.poc}
              </text>
              <text x="235" y={y + 22} fill={THEME.muted} fontSize="10">
                Home:{r.home}
              </text>
              <circle cx="290" cy={y + 18} r="8" fill={r.ok ? '#10B981' : '#DC2626'} />
              <text x="290" y={y + 22} textAnchor="middle" fill={THEME.white} fontSize="10" fontWeight="700">
                {r.ok ? '✓' : '!'}
              </text>
            </g>
          );
        })}
        <text x="160" y="280" textAnchor="middle" fill={THEME.primaryDark} fontSize="10" fontWeight="600">
          Flag discrepancies → document → notify RN
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneHighAlertDashboard: React.FC<SceneProps> = (props) => {
  const meds = [
    { name: 'Warfarin', c: '#DC2626', tip: 'Bleed risk' },
    { name: 'Insulin', c: '#3B82F6', tip: 'Type/dose' },
    { name: 'Opioids', c: '#F59E0B', tip: 'RR / count' },
    { name: 'Digoxin', c: '#8B5CF6', tip: 'Apical 60s' },
    { name: 'Metformin', c: '#10B981', tip: 'Glucose' },
  ];
  const active = Math.floor((props.animPhase / 45) % meds.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="High-alert medication dashboard">
        <rect width="320" height="300" fill="#FFF7ED" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          High-Alert Sentinel
        </text>
        <rect x="40" y="40" width="240" height="36" rx="8" fill="#FEE2E2" stroke="#DC2626" />
        <text x="160" y="62" textAnchor="middle" fill="#991B1B" fontSize="11" fontWeight="700">
          Order ↔ Label ↔ Point of Admin
        </text>
        {meds.map((m, i) => {
          const x = 18 + (i % 5) * 60;
          const y = 100;
          const on = i === active;
          return (
            <g key={m.name}>
              <rect
                x={x}
                y={y}
                width="54"
                height="90"
                rx="10"
                fill={on ? m.c : THEME.white}
                stroke={m.c}
                strokeWidth="2"
              />
              <circle cx={x + 27} cy={y + 28} r="14" fill={on ? THEME.white : m.c} opacity={on ? 1 : 0.15} />
              <text x={x + 27} y={y + 32} textAnchor="middle" fill={on ? m.c : m.c} fontSize="10" fontWeight="800">
                !
              </text>
              <text x={x + 27} y={y + 58} textAnchor="middle" fill={on ? THEME.white : THEME.dark} fontSize="8" fontWeight="700">
                {m.name}
              </text>
              <text x={x + 27} y={y + 74} textAnchor="middle" fill={on ? '#FEF3C7' : THEME.muted} fontSize="8">
                {m.tip}
              </text>
            </g>
          );
        })}
        <rect x="24" y="210" width="272" height="60" rx="10" fill={THEME.white} stroke="#FDBA74" />
        <text x="160" y="234" textAnchor="middle" fill={THEME.dark} fontSize="11" fontWeight="700">
          Focus: {meds[active].name}
        </text>
        <text x="160" y="252" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Uncertainty → DO NOT give → contact RN now
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneTeachBackMatrix: React.FC<SceneProps> = (props) => {
  const domains = [
    { title: 'Purpose', q: 'Why take it?', c: '#3B82F6' },
    { title: 'Side effects', q: 'Watch for?', c: '#EF4444' },
    { title: 'Technique', q: 'Show me', c: '#10B981' },
    { title: 'Adherence', q: 'How remember?', c: '#F59E0B' },
  ];
  const active = Math.floor((props.animPhase / 50) % 4);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Teach-back education matrix">
        <rect width="320" height="300" fill="#F8FAFC" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Teach-Back Matrix
        </text>
        <rect x="50" y="40" width="220" height="40" rx="20" fill="#DBEAFE" stroke="#3B82F6" />
        <text x="160" y="58" textAnchor="middle" fill="#1E3A8A" fontSize="11" fontWeight="700">
          Not “Do you understand?”
        </text>
        <text x="160" y="72" textAnchor="middle" fill="#1E40AF" fontSize="10">
          Patient explains / demonstrates
        </text>
        {domains.map((d, i) => {
          const x = 20 + (i % 2) * 150;
          const y = 100 + Math.floor(i / 2) * 80;
          const on = i === active;
          return (
            <g key={d.title}>
              <rect
                x={x}
                y={y}
                width="130"
                height="66"
                rx="12"
                fill={on ? d.c : THEME.white}
                stroke={d.c}
                strokeWidth="2"
              />
              <text x={x + 65} y={y + 26} textAnchor="middle" fill={on ? THEME.white : d.c} fontSize="12" fontWeight="700">
                {d.title}
              </text>
              <text x={x + 65} y={y + 46} textAnchor="middle" fill={on ? '#FEF3C7' : THEME.muted} fontSize="10">
                {d.q}
              </text>
            </g>
          );
        })}
        <text x="160" y="280" textAnchor="middle" fill={THEME.muted} fontSize="10">
          Chunk 2–3 meds → teach-back → continue
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneErrorCascade: React.FC<SceneProps> = (props) => {
  const types = [
    { id: 'A', title: 'Knowledge', desc: 'Look up first', c: '#3B82F6' },
    { id: 'B', title: 'Performance', desc: 'Slow · restart', c: '#F59E0B' },
    { id: 'C', title: 'System', desc: 'Report traps', c: '#EF4444' },
  ];
  const active = Math.floor((props.animPhase / 55) % 3);
  const drip = (props.animPhase % 80) / 80;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Error types and cascade prevention">
        <rect width="320" height="300" fill="#FFFBEB" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Error Types & Near-Miss
        </text>
        {types.map((t, i) => {
          const x = 24 + i * 100;
          const on = i === active;
          return (
            <g key={t.id}>
              <rect
                x={x}
                y={44}
                width="88"
                height="88"
                rx="12"
                fill={on ? t.c : THEME.white}
                stroke={t.c}
                strokeWidth="2"
              />
              <text x={x + 44} y={78} textAnchor="middle" fill={on ? THEME.white : t.c} fontSize="22" fontWeight="800">
                {t.id}
              </text>
              <text x={x + 44} y={100} textAnchor="middle" fill={on ? THEME.white : THEME.dark} fontSize="10" fontWeight="700">
                {t.title}
              </text>
              <text x={x + 44} y={116} textAnchor="middle" fill={on ? '#FEF3C7' : THEME.muted} fontSize="9">
                {t.desc}
              </text>
            </g>
          );
        })}
        {/* Cascade funnel */}
        <path
          d="M 40 160 L 280 160 L 220 230 L 100 230 Z"
          fill="#FEE2E2"
          stroke="#DC2626"
          strokeWidth="1.5"
          opacity="0.85"
        />
        <text x="160" y="178" textAnchor="middle" fill="#991B1B" fontSize="11" fontWeight="700">
          Unchecked holes align
        </text>
        <text x="160" y="196" textAnchor="middle" fill="#B91C1C" fontSize="10">
          → patient reaches harm zone
        </text>
        <circle cx={160} cy={210 + drip * 40} r="6" fill="#DC2626" opacity={1 - drip * 0.6} />
        <rect x="90" y="248" width="140" height="32" rx="8" fill="#D1FAE5" stroke="#10B981" />
        <text x="160" y="268" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
          Near-miss → REPORT
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SceneErrorResponse: React.FC<SceneProps> = (props) => {
  const steps = [
    { t: 'STOP', c: '#DC2626' },
    { t: 'ASSESS', c: '#F59E0B' },
    { t: 'NOTIFY', c: '#EAB308' },
    { t: 'INTERVENE', c: '#10B981' },
    { t: 'DOCUMENT', c: '#3B82F6' },
    { t: 'REPORT', c: '#8B5CF6' },
  ];
  const active = Math.floor((props.animPhase / 40) % steps.length);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 320 300" width="100%" height="100%" role="img" aria-label="Medication error response protocol">
        <rect width="320" height="300" fill="#FEF2F2" rx="12" />
        <text x="160" y="24" textAnchor="middle" fill={THEME.dark} fontSize="13" fontWeight="700">
          Error Response Protocol
        </text>
        {steps.map((s, i) => {
          const y = 42 + i * 36;
          const on = i === active;
          return (
            <g key={s.t}>
              <rect
                x="36"
                y={y}
                width="248"
                height="30"
                rx="8"
                fill={on ? s.c : THEME.white}
                stroke={s.c}
                strokeWidth="1.8"
              />
              <circle cx="56" cy={y + 15} r="10" fill={on ? THEME.white : s.c} />
              <text x="56" y={y + 19} textAnchor="middle" fill={on ? s.c : THEME.white} fontSize="10" fontWeight="800">
                {i + 1}
              </text>
              <text x="160" y={y + 19} textAnchor="middle" fill={on ? THEME.white : THEME.dark} fontSize="12" fontWeight="700">
                {s.t}
              </text>
            </g>
          );
        })}
        <text x="160" y="285" textAnchor="middle" fill={THEME.primaryDark} fontSize="10" fontWeight="600">
          Never conceal · Knowledge quiz ≠ competency alone
        </text>
      </svg>
      <HotspotLayer {...props} />
    </div>
  );
};

const SCENES: React.FC<SceneProps>[] = [
  SceneSafetyCommand,
  SceneSixRightsChain,
  SceneReconciliationLab,
  SceneHighAlertDashboard,
  SceneTeachBackMatrix,
  SceneErrorCascade,
  SceneErrorResponse,
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
            <div className="text-[12px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase">MODULE LVN-006</div>
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

export default function LVN006() {
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
