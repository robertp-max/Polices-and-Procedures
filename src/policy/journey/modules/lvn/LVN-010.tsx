// @ts-nocheck
import { Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, X, AlertCircle, ShieldCheck, Compass } from 'lucide-react';
/**
 * LVN-010 — Infection Prevention — Clinical Application
 * Version 5.0 | CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Track: LVN — Licensed Vocational Nurse
 * Regulatory: 42 CFR § 484.70 | Agency policy: CL-SD-016
 * Pages: 7 | Quiz: 10 | Pass: 80%
 *
 * Standalone SC04-style module: left rich content (~55%) + right instructional SVG (~45%).
 * Quiz validates knowledge only — observed demonstration and authorized sign-off remain separate.
 */
import React, { useCallback, useMemo, useState } from 'react';

// ─── MODULE META ─────────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-010',
  title: 'Infection Prevention — Clinical Application',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.70',
  policy: 'CL-SD-016',
  recordId: '6a558ccc3463cd690af8d635',
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
  correct: number; // 0=A, 1=B, 2=C, 3=D
  rationale: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#059669',
  primaryDark: '#047857',
  secondary: '#ECFDF5',
  accent: '#F59E0B',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  warn: '#D97706',
  bg: '#F0FDF4',
  panel: '#FFFFFF',
  border: '#D1FAE5',
  blue: '#3B82F6',
  orange: '#F97316',
  purple: '#7C3AED',
};

// ─── PAGES (7) ───────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Infection Prevention Begins with the Clinician',
    subtitle: 'Chain of infection & the LVN at the point of care',
    scene: 'chain',
    narration: [
      'Welcome to Module LVN-010: Infection Prevention — Clinical Application. Prior infection-control foundations (hand hygiene, standard precautions, and transmission-based precautions) are assumed. This LVN-specific module applies those foundations to skilled nursing procedures you perform in the home: preventing infection during care, identifying infection early, protecting yourself and the community, and documenting and reporting to satisfy CMS and agency requirements.',
      'Care Indeed Policy CL-SD-016 (Infection Prevention and Control Clinical Standards) and 42 CFR § 484.70 (Condition of Participation: Infection Prevention and Control) establish the requirements for practice. CMS requires every home health agency to maintain an infection prevention and control program that protects patients, staff, and the community. As an LVN performing clinical procedures in the home, you are the primary infection-control practitioner at the point of care.',
      'There is no environmental services team cleaning the room before you arrive and no central supply department restocking your supplies. You create and maintain a clean, safe environment for every procedure you perform.',
      'The chain of infection has six links: (1) infectious agent / pathogen, (2) reservoir, (3) portal of exit, (4) mode of transmission, (5) portal of entry, and (6) susceptible host. Your clinical practice targets every link. Break the pathogen link with proper disinfection and sterilization; the reservoir with wound care and environmental cleaning; portal of exit with containment of body fluids; transmission with hand hygiene and PPE; portal of entry with aseptic technique; and host susceptibility with patient education, nutrition support, and vaccination advocacy (within LVN scope and under authorized orders).',
    ],
    keyPoints: [
      {
        icon: '🔗',
        title: 'Six links',
        detail: 'Pathogen → Reservoir → Exit → Transmission → Entry → Host. Break any link to interrupt infection.',
      },
      {
        icon: '🏠',
        title: 'Home setting',
        detail: 'You are the infection-control practitioner at the point of care—no EVS or central supply.',
      },
      {
        icon: '📜',
        title: 'Regulatory basis',
        detail: 'Federal CoP: 42 CFR § 484.70. Agency clinical standards: CL-SD-016 (agency policy).',
      },
    ],
    clinicalTip:
      'Decision framing: protect the patient and yourself first (hand hygiene/PPE), continue only with correct precautions and technique, stop if sterile field or PPE is compromised, notify the RN case manager for infection concerns or orders needed, and document objective findings and actions.',
    hotspots: [
      {
        id: 'pathogen',
        label: 'Pathogen',
        x: 50,
        y: 18,
        info: 'Infectious agent. Break with disinfection, sterilization, and antimicrobial therapy only when ordered by an authorized prescriber.',
      },
      {
        id: 'reservoir',
        label: 'Reservoir',
        x: 78,
        y: 32,
        info: 'Where organisms live and multiply (wounds, devices, environment). Break with wound care, device care, and environmental cleaning.',
      },
      {
        id: 'exit',
        label: 'Portal of Exit',
        x: 78,
        y: 62,
        info: 'How organisms leave the reservoir (drainage, secretions, aerosols). Break with containment, dressings, and respiratory hygiene.',
      },
      {
        id: 'transmission',
        label: 'Transmission',
        x: 50,
        y: 78,
        info: 'Contact, droplet, or airborne routes. Break with hand hygiene, PPE, bag technique, and equipment cleaning.',
      },
      {
        id: 'entry',
        label: 'Portal of Entry',
        x: 22,
        y: 62,
        info: 'How organisms enter a new host (wounds, devices, mucosa). Break with aseptic/sterile technique and safe injection practices.',
      },
      {
        id: 'host',
        label: 'Susceptible Host',
        x: 22,
        y: 32,
        info: 'Patient vulnerability (age, immunity, devices). Support with education, nutrition, vaccination advocacy, and early detection—within LVN scope.',
      },
    ],
  },
  {
    id: 2,
    title: 'Hand Hygiene — The Five Moments',
    subtitle: 'WHO framework applied to every home visit',
    scene: 'handHygiene',
    narration: [
      "The World Health Organization's Five Moments for Hand Hygiene define critical points during patient care when hand hygiene must be performed: (1) before touching the patient, (2) before a clean/aseptic procedure, (3) after body-fluid exposure risk, (4) after touching the patient, and (5) after touching patient surroundings. In home health, these moments apply to every visit and every patient interaction.",
      'Before touching the patient means before any physical contact—including vital signs, assessment, or transfers—after you enter the home and set up supplies but before the clinical encounter. This protects the patient from organisms acquired from the previous patient, your vehicle, or the home environment.',
      'Before a clean/aseptic procedure means immediately before wound care, catheter care, injections, IV access, tracheostomy care, or similar tasks. Even if you just performed hand hygiene, this moment requires a fresh event because assessment contact may have recontaminated your hands.',
      'After body-fluid exposure risk means after contact with blood, body fluids, secretions, excretions, mucous membranes, non-intact skin, or wound dressings—protecting you and preventing transfer to surfaces or other patients. After patient contact and after touching surroundings close the sequence before you touch your equipment, bag, or leave the care area.',
      'Consistent performance of all five moments is among the most effective interventions to prevent healthcare-associated infection. In home health you often work alone without observers; self-discipline is essential. Supervisors and CMS surveyors may observe technique during supervised visits. Alcohol-based hand rub is preferred when hands are not visibly soiled; soap and water is required when hands are visibly dirty or after care involving spore-forming organisms such as C. difficile (per CDC guidance and agency policy CL-SD-016).',
    ],
    keyPoints: [
      {
        icon: '1️⃣',
        title: 'Before patient',
        detail: 'After setup, before any physical contact—protects the patient.',
      },
      {
        icon: '2️⃣',
        title: 'Before aseptic task',
        detail: 'Immediately before wound care, catheter care, injections, device care.',
      },
      {
        icon: '3️⃣',
        title: 'After exposure / contact',
        detail: 'After body fluids, after patient contact, and after surroundings—protect you and the next surface.',
      },
    ],
    clinicalTip:
      'If you are interrupted mid-procedure and touch non-sterile surfaces, stop, perform hand hygiene again, and re-establish clean/sterile technique before continuing.',
    hotspots: [
      {
        id: 'm1',
        label: 'Moment 1',
        x: 18,
        y: 28,
        info: 'Before touching the patient: after supply setup, before vitals or assessment contact.',
      },
      {
        id: 'm2',
        label: 'Moment 2',
        x: 50,
        y: 18,
        info: 'Before clean/aseptic procedure: immediately before wound care or device procedures—even if you just washed.',
      },
      {
        id: 'm3',
        label: 'Moment 3',
        x: 82,
        y: 28,
        info: 'After body-fluid exposure risk: after blood, drainage, secretions, non-intact skin, or dressings.',
      },
      {
        id: 'm4',
        label: 'Moment 4',
        x: 68,
        y: 68,
        info: 'After touching the patient: before handling bag, phone, or environment outside the care sequence.',
      },
      {
        id: 'm5',
        label: 'Moment 5',
        x: 32,
        y: 68,
        info: 'After touching patient surroundings: rails, tables, remote—even without direct patient contact.',
      },
    ],
  },
  {
    id: 3,
    title: 'Standard and Transmission-Based Precautions',
    subtitle: 'PPE selection by procedure and risk—not by diagnosis alone',
    scene: 'ppe',
    narration: [
      'Standard precautions apply to every patient encounter regardless of diagnosis or presumed infection status. They rest on the principle that all blood, body fluids, secretions, excretions (except sweat), non-intact skin, and mucous membranes may contain transmissible infectious agents. Standard precautions include hand hygiene, PPE based on anticipated exposure, respiratory hygiene/cough etiquette, safe injection practices, and safe handling of potentially contaminated equipment and surfaces.',
      'PPE selection under standard precautions follows a risk assessment. For routine assessments with no anticipated body-fluid contact, gloves may not be required. For wound care, catheter care, or any procedure with potential body-fluid contact, gloves are required at minimum. Add a gown when clothing may contact blood or body fluids. Add face protection (mask and eye protection or face shield) when splashes or sprays are anticipated. Select PPE based on the procedure and exposure risk—not the diagnosis alone.',
      'Transmission-based precautions are added to standard precautions for known or suspected infections needing extra measures. Contact precautions (e.g., MRSA, VRE, C. difficile, scabies) require gloves and gown for interactions with the patient or environment. Droplet precautions (e.g., influenza, pertussis, many respiratory viruses) require a surgical mask within about six feet of the patient. Airborne precautions (e.g., tuberculosis, measles, varicella) require an N95 respirator or equivalent (fit-tested per agency policy).',
      'In the home you cannot place a patient in a negative-pressure room or fully restrict household members. Adapt institutional principles: educate patient and caregivers, maximize ventilation for airborne risk when feasible, and use portable HEPA filtration when available and directed by agency policy/clinical leadership. Always follow the Plan of Care and current orders; escalate unclear isolation status to the RN case manager.',
    ],
    keyPoints: [
      {
        icon: '🟦',
        title: 'Standard',
        detail: 'Every patient. PPE by exposure risk; hand hygiene; safe injections; equipment hygiene.',
      },
      {
        icon: '🟨',
        title: 'Contact + Droplet',
        detail: 'Contact: gloves + gown. Droplet: surgical mask within ~6 feet (plus standard).',
      },
      {
        icon: '🟥',
        title: 'Airborne',
        detail: 'N95 or equivalent; fit testing and agency respiratory protection program apply.',
      },
    ],
    clinicalTip:
      'If the chart or caregiver reports a multi-drug-resistant organism or active TB and orders/precautions are unclear, stop invasive procedures that can wait, use the higher precaution level, and notify the RN case manager before continuing non-urgent care.',
    hotspots: [
      {
        id: 'std',
        label: 'Standard',
        x: 18,
        y: 40,
        info: 'All patients. Hand hygiene always. Gloves/gown/face protection based on anticipated exposure.',
      },
      {
        id: 'contact',
        label: 'Contact',
        x: 40,
        y: 40,
        info: 'MRSA, VRE, C. diff, scabies, etc. Gloves + gown for patient and environment contact. Soap/water after C. diff care.',
      },
      {
        id: 'droplet',
        label: 'Droplet',
        x: 60,
        y: 40,
        info: 'Influenza, pertussis, many respiratory viruses. Surgical mask within ~6 feet + standard precautions.',
      },
      {
        id: 'airborne',
        label: 'Airborne',
        x: 82,
        y: 40,
        info: 'TB, measles, varicella. N95/equivalent; fit-tested. Ventilate home; educate household; follow agency RIPP.',
      },
    ],
  },
  {
    id: 4,
    title: 'Sterile vs. Clean Technique',
    subtitle: 'Clinical decision-making for home procedures',
    scene: 'technique',
    narration: [
      'Understanding sterile technique versus clean technique—and when each is required—is a core clinical competency. Sterile technique aims to eliminate microorganisms from the critical field and maintain sterility throughout the procedure. Clean technique (medical asepsis) reduces organism load and prevents transfer but does not eliminate all organisms.',
      'Sterile technique is required for procedures that access sterile body cavities or introduce devices into sterile systems. Examples include central-line dressing changes, urinary catheter insertion, tracheostomy care in the early post-placement period as ordered/policy directs, and procedures involving open surgical wounds. Use sterile gloves, create and maintain a sterile field, use only sterile supplies, and apply no-touch technique for critical surfaces.',
      'Clean technique is appropriate for many procedures on non-sterile surfaces or chronic wounds healing by secondary intention—including much chronic wound care, urinary catheter care (not insertion), blood glucose monitoring, and routine medication administration. Use clean gloves, clean supplies, rigorous hand hygiene, and prevent cross-contamination.',
      'The decision is guided by the procedure, wound classification, patient immune status, physician/RN orders, and agency policy CL-SD-016. When in doubt, use the higher level of asepsis. Using sterile technique when clean would suffice adds cost and time but does not harm the patient; using clean technique when sterile is required can introduce infection.',
      'For wounds: surgical wounds healing by primary intention in the early period often require sterile technique per orders/policy. Clean granulating chronic wounds may be managed with clean technique when ordered. Infected wounds, wounds with exposed bone or tendon, and wounds in immunocompromised patients commonly warrant sterile technique as a protective measure—follow the Plan of Care and do not independently change technique level without authorized direction.',
    ],
    keyPoints: [
      {
        icon: '✦',
        title: 'Sterile',
        detail: 'Central line dressings, catheter insertion, open surgical wounds—sterile field and supplies.',
      },
      {
        icon: '○',
        title: 'Clean',
        detail: 'Many chronic wounds, catheter care (not insert), glucose checks—reduce and prevent transfer.',
      },
      {
        icon: '⚖️',
        title: 'When unsure',
        detail: 'Use the higher asepsis level; clarify with RN/orders/agency policy rather than guessing down.',
      },
    ],
    clinicalTip:
      'If the sterile field is contaminated (reach-over, wet strike-through, glove tear), stop, discard, and restart. Do not “save” a compromised field to finish faster.',
    hotspots: [
      {
        id: 'sterile',
        label: 'Sterile',
        x: 28,
        y: 35,
        info: 'Eliminate microbes from critical field. Central lines, catheter insertion, early surgical wounds as ordered.',
      },
      {
        id: 'clean',
        label: 'Clean',
        x: 72,
        y: 35,
        info: 'Reduce microbes and prevent transfer. Chronic wound care, catheter care, routine meds when appropriate.',
      },
      {
        id: 'decide',
        label: 'Decision',
        x: 50,
        y: 72,
        info: 'Procedure + orders + CL-SD-016 + immune status. When unsure → higher asepsis; notify RN if orders conflict.',
      },
    ],
  },
  {
    id: 5,
    title: 'Infection Identification and Surveillance',
    subtitle: 'Early recognition, RN notification, and specimen role',
    scene: 'surveillance',
    narration: [
      'As an LVN performing regular skilled visits, you are often the first clinician to identify signs of infection. Early recognition matters because delayed treatment increases morbidity and mortality. Your assessment skills are a key part of the agency surveillance system—but you do not independently diagnose, prescribe, or revise the Plan of Care.',
      'Local signs include erythema, edema, warmth, pain, and purulence. For wounds, monitor increasing size, drainage color/odor changes, periwound erythema extending beyond about 2 cm from the wound edge, increased pain, and failure to progress toward healing despite appropriate ordered treatment. Systemic signs include fever (temperature greater than 100.4°F / 38°C), tachycardia, hypotension, altered mental status, laboratory leukocytosis when available, and malaise.',
      'In older adults, classic signs may be blunted. New confusion, falls, decreased appetite, or functional decline may be primary infection indicators rather than high fever. UTIs are common, especially with indwelling catheters (cloudy/foul urine, new confusion, suprapubic tenderness, fever, frequency/urgency when not catheterized). CAUTI definitions use specific clinical and laboratory criteria used by infection surveillance—report findings; do not self-assign surveillance categories without program guidance. Respiratory infection may present with cough, sputum changes, dyspnea, fever, and decreased oxygen saturation relative to the patient’s baseline.',
      'When you identify concerning signs: (1) document objective measurements, (2) notify the RN case manager promptly per agency policy, (3) obtain specimens only if ordered and within competency/authorization, (4) implement appropriate precautions, (5) educate patient/caregivers, and (6) follow existing orders while authorized clinicians update the Plan of Care if needed. Never start antibiotics or change antimicrobial orders yourself.',
    ],
    keyPoints: [
      {
        icon: '🌡️',
        title: 'Local + systemic',
        detail: 'Redness, swelling, warmth, pain, pus; fever, HR/BP changes, mental status, malaise.',
      },
      {
        icon: '🧓',
        title: 'Older adults',
        detail: 'Confusion, falls, appetite/function decline may appear before fever.',
      },
      {
        icon: '📞',
        title: 'First clinical action',
        detail: 'Document objectively and notify the RN—do not independently prescribe or rewrite the POC.',
      },
    ],
    clinicalTip:
      'Write what you measure: “T 101.2°F, periwound erythema 3 cm, purulent yellow drainage, HR 112.” Then record who was notified and when.',
    hotspots: [
      {
        id: 'local',
        label: 'Local signs',
        x: 22,
        y: 30,
        info: 'Erythema, edema, warmth, pain, purulence; wound enlargement or odor change.',
      },
      {
        id: 'systemic',
        label: 'Systemic',
        x: 50,
        y: 22,
        info: 'Fever >100.4°F, tachycardia, hypotension, altered mentation—escalate promptly to RN.',
      },
      {
        id: 'elder',
        label: 'Atypical',
        x: 78,
        y: 30,
        info: 'Older adults: new confusion, falls, anorexia, functional decline may signal infection.',
      },
      {
        id: 'notify',
        label: 'Notify RN',
        x: 50,
        y: 72,
        info: 'Document → notify RN case manager → obtain cultures only if ordered → precautions → education. No independent Rx.',
      },
    ],
  },
  {
    id: 6,
    title: 'Bag Technique and Environmental Management',
    subtitle: 'Preventing cross-contamination between homes',
    scene: 'bag',
    narration: [
      'Bag technique is the systematic method of organizing and using your nursing bag to prevent cross-contamination between patients and between the home environment and your equipment. It is a core home-health competency without a direct hospital parallel.',
      'Place the nursing bag on a clean barrier—never directly on the floor, furniture, or patient surfaces. Before entering, identify a clean, dry surface; place a disposable barrier (plastic bag or clean paper), then set the bag. If no suitable surface exists, keep the bag on a clean barrier in the vehicle and carry only visit-needed supplies inside.',
      'Organize clean supplies separately from contaminated items. Remove only what the current procedure needs. Never return used supplies to the clean compartment. After the visit, dispose of contaminated items properly, wipe the bag exterior with a disinfectant wipe, and restock for the next visit.',
      'Perform hand hygiene before opening the bag, after setting up the work area, before and after each procedure, and before closing the bag—so you neither contaminate bag contents nor transport organisms between patients.',
      'Assess the home each visit for infection risks: pests, mold, standing water, pet contamination, unsafe food storage, and general cleanliness. Document concerns and educate patients/caregivers. When conditions pose a direct risk to clinical procedures, report to the RN case manager for intervention. Provide puncture-resistant sharps containers for injection or sharps-generating care; educate on disposal; arrange full-container disposal per local regulation and agency policy. Never transport used sharps in your bag or vehicle without proper containment.',
    ],
    keyPoints: [
      {
        icon: '🧳',
        title: 'Barrier always',
        detail: 'Bag on disposable barrier on clean dry surface—or leave bag in vehicle and carry only needed items.',
      },
      {
        icon: '🔀',
        title: 'Clean vs dirty',
        detail: 'Separate compartments; never return used supplies to clean side; wipe exterior after visits.',
      },
      {
        icon: '💉',
        title: 'Sharps',
        detail: 'Puncture-resistant containers; proper disposal pathways; never loose sharps in bag/vehicle.',
      },
    ],
    clinicalTip:
      'If the home has no clean surface, do not place the bag on the bed or floor “just this once.” Leave it secured in the vehicle and work from a clean field you create with barriers and only the supplies needed.',
    hotspots: [
      {
        id: 'barrier',
        label: 'Barrier',
        x: 28,
        y: 55,
        info: 'Disposable barrier under bag on clean dry surface—never floor or patient bed as default placement.',
      },
      {
        id: 'cleanSide',
        label: 'Clean zone',
        x: 50,
        y: 28,
        info: 'Clean compartment: unused supplies only. Hand hygiene before accessing.',
      },
      {
        id: 'dirtySide',
        label: 'Dirty zone',
        x: 72,
        y: 55,
        info: 'Contaminated items stay separate; dispose properly; never return to clean side.',
      },
      {
        id: 'sharps',
        label: 'Sharps',
        x: 50,
        y: 78,
        info: 'Puncture-resistant container; educate patient; full-container disposal per local rules and agency policy.',
      },
    ],
  },
  {
    id: 7,
    title: 'Documentation, Reporting, and Mastery',
    subtitle: 'What surveyors and QAPI expect to see',
    scene: 'docs',
    narration: [
      'Infection-prevention documentation must be thorough, timely, and specific. CMS surveyors review infection-prevention documentation during surveys. Clinical notes should show that you assessed, implemented, and evaluated infection-prevention measures for each encounter—within LVN documentation standards and under the Plan of Care.',
      'For every visit, documentation commonly includes: precaution type in effect (standard or transmission-based), PPE used, hand hygiene (often EHR attestation plus narrative when relevant), patient/caregiver education on infection prevention, wound findings with objective measurements when applicable, and any infection signs with your clinical response.',
      'When you identify a potential infection, document: specific signs and symptoms with objective data (e.g., temperature 101.2°F, wound erythema 3 cm beyond wound edge, purulent drainage), clinical significance in plain terms, RN case manager notification with date, time, and name of person notified, any orders received and implemented, and patient response. Do not invent compliance rates or agency outcome percentages in notes.',
      'Infection reporting for suspected or confirmed infections follows the agency infection surveillance program under the Infection Preventionist and CL-SD-016 (agency policy). Complete the infection event report as required. Data support QAPI trending and mandatory public-health reporting when required. Passing this module’s quiz validates knowledge only; practical competency requires observed demonstration, skills check-offs, and authorized sign-off per agency policy.',
    ],
    keyPoints: [
      {
        icon: '📝',
        title: 'Every visit',
        detail: 'Precautions, PPE, hand hygiene, education, objective wound/infection findings as applicable.',
      },
      {
        icon: '🚨',
        title: 'If infection suspected',
        detail: 'Objective data + RN notification (who/when) + orders implemented + patient response.',
      },
      {
        icon: '✅',
        title: 'Knowledge vs competency',
        detail: 'Quiz = knowledge check. Return demo and authorized sign-off determine practical competency.',
      },
    ],
    clinicalTip:
      'If you cannot reach the RN and the patient has systemic instability (e.g., fever with hypotension or acute mental status change), follow agency emergency escalation—including 911 when clinically indicated—then continue notification attempts and document the timeline.',
    hotspots: [
      {
        id: 'visitDoc',
        label: 'Visit note',
        x: 25,
        y: 35,
        info: 'Precaution type, PPE, hand hygiene, education, objective assessments each visit.',
      },
      {
        id: 'event',
        label: 'Infection event',
        x: 50,
        y: 55,
        info: 'Objective signs, RN notified (name/time), orders, response; complete agency infection report.',
      },
      {
        id: 'qapi',
        label: 'Surveillance',
        x: 75,
        y: 35,
        info: 'Infection Preventionist / CL-SD-016 program uses reports for QAPI and required public-health reporting.',
      },
      {
        id: 'mastery',
        label: 'Mastery path',
        x: 50,
        y: 80,
        info: 'Quiz proves knowledge only. Observed practice and authorized sign-off complete competency.',
      },
    ],
  },
];

// ─── QUIZ (10) — balanced A=2 B=3 C=3 D=2 ────────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'How many links are in the chain of infection that the LVN targets during home care?',
    options: ['4', '5', '6', '8'],
    correct: 2, // C
    rationale:
      'The chain has six links: pathogen, reservoir, portal of exit, mode of transmission, portal of entry, and susceptible host. Breaking any link interrupts transmission.',
  },
  {
    id: 2,
    stem: 'Which WHO hand hygiene moment occurs IMMEDIATELY before wound care?',
    options: [
      'Before touching the patient',
      'Before a clean/aseptic procedure',
      'After body-fluid exposure risk',
      'After touching patient surroundings',
    ],
    correct: 1, // B
    rationale:
      'Moment 2—before a clean/aseptic procedure—is required immediately before wound care, even if hand hygiene was performed before general patient contact.',
  },
  {
    id: 3,
    stem: 'Contact precautions require which additional PPE beyond standard precautions for patient/environment contact?',
    options: ['Surgical mask only', 'N95 respirator', 'Gloves and gown', 'Face shield only'],
    correct: 2, // C
    rationale:
      'Contact precautions add gloves and gown for interactions with the patient or the patient’s environment (e.g., MRSA, VRE, C. difficile, scabies), always layered on standard precautions.',
  },
  {
    id: 4,
    stem: 'Airborne precautions require what type of respiratory protection?',
    options: ['N95 respirator (or equivalent)', 'Surgical mask only', 'Face shield alone', 'No respiratory protection'],
    correct: 0, // A
    rationale:
      'Airborne pathogens (e.g., TB, measles, varicella) require an N95 or equivalent respirator used within a fit-tested respiratory protection program—not a surgical mask alone.',
  },
  {
    id: 5,
    stem: 'When is sterile technique generally required rather than clean technique?',
    options: [
      'All wound care without exception',
      'Central-line dressing changes',
      'Blood glucose monitoring',
      'Oral medication administration',
    ],
    correct: 1, // B
    rationale:
      'Central-line dressing changes access a sterile intravascular system and require sterile technique. Clean technique is often appropriate for glucose checks and oral meds; not all wound care is sterile—follow orders and policy.',
  },
  {
    id: 6,
    stem: 'In many older adults, the PRIMARY early sign of UTI may be:',
    options: ['High spiking fever only', 'New-onset confusion', 'Gross hematuria only', 'Severe flank pain only'],
    correct: 1, // B
    rationale:
      'Older adults often present atypically. New confusion, falls, or functional decline may be the first clue to UTI rather than classic high fever or flank pain.',
  },
  {
    id: 7,
    stem: "Where should the nursing bag be placed in the patient's home?",
    options: [
      'Directly on the floor near the chair',
      "On the patient's bed without a barrier",
      'On a clean barrier on a clean, dry surface',
      "In the patient's bathroom sink area",
    ],
    correct: 2, // C
    rationale:
      'Bag technique requires a clean barrier on a clean, dry surface. Never place the bag directly on the floor or on the patient’s bed without appropriate barrier practice; if no surface exists, leave the bag in the vehicle.',
  },
  {
    id: 8,
    stem: 'Periwound erythema extending beyond approximately what distance from the wound edge is a concerning infection clue discussed in this module?',
    options: ['0.5 cm', '1 cm', '5 cm only (never less)', '2 cm'],
    correct: 3, // D
    rationale:
      'Periwound erythema extending beyond about 2 cm from the wound edge is a red-flag finding to document and escalate, along with other local/systemic signs.',
  },
  {
    id: 9,
    stem: "What is the primary federal regulatory basis for the home health agency's infection prevention and control program?",
    options: ['42 CFR § 484.55', '42 CFR § 484.60', '42 CFR § 484.80', '42 CFR § 484.70'],
    correct: 3, // D
    rationale:
      '42 CFR § 484.70 is the Condition of Participation for Infection Prevention and Control. Agency policy CL-SD-016 operationalizes clinical standards; it does not replace the federal CoP.',
  },
  {
    id: 10,
    stem: 'When you identify signs of infection during a skilled visit, your FIRST appropriate action is to:',
    options: [
      'Document objective findings and notify the RN case manager',
      'Independently start antibiotics from residual supply',
      'Discharge the patient from home health',
      'Always call 911 before any assessment documentation',
    ],
    correct: 0, // A
    rationale:
      'LVNs document objective findings and notify the RN case manager (and follow emergency escalation if the patient is unstable). LVNs do not independently prescribe antibiotics, discharge patients, or skip assessment—911 is for true emergencies per clinical judgment and agency policy.',
  },
];

// Verify distribution at build time (dev guard)
const _dist = QUIZ.reduce(
  (acc, q) => {
    acc[q.correct] += 1;
    return acc;
  },
  [0, 0, 0, 0] as number[],
);
if (_dist[0] !== 2 || _dist[1] !== 3 || _dist[2] !== 3 || _dist[3] !== 2) {
  // eslint-disable-next-line no-console
  console.warn('LVN-010 quiz distribution expected A2 B3 C3 D2, got', _dist);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    background: THEME.bg,
    color: THEME.dark,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '12px 20px',
    background: `linear-gradient(135deg, ${THEME.primaryDark}, ${THEME.primary})`,
    color: '#fff',
    boxShadow: '0 2px 8px rgba(4,120,87,0.25)',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  badgeRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.28)',
  },
  progressWrap: { minWidth: 160, textAlign: 'right' as const },
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    background: THEME.accent,
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    flexDirection: 'row' as const,
  },
  left: {
    flex: '0 0 55%',
    maxWidth: '55%',
    padding: 20,
    overflowY: 'auto' as const,
    background: THEME.panel,
    borderRight: `1px solid ${THEME.border}`,
  },
  right: {
    flex: '0 0 45%',
    maxWidth: '45%',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    background: THEME.secondary,
    minHeight: 480,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    borderTop: `1px solid ${THEME.border}`,
    background: THEME.panel,
  },
  btn: {
    padding: '10px 22px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    border: 'none',
  },
  btnPrimary: {
    background: THEME.primary,
    color: '#fff',
  },
  btnSecondary: {
    background: '#fff',
    color: THEME.primary,
    border: `1px solid ${THEME.primary}`,
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  h1: { fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: THEME.dark },
  h2: { fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: THEME.primary },
  para: {
    fontSize: 14,
    lineHeight: 1.65,
    margin: '0 0 12px',
    color: '#334155',
  },
  tip: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    background: '#FFFBEB',
    border: `1px solid #FDE68A`,
    fontSize: 13,
    lineHeight: 1.5,
    color: '#78350F',
  },
  kpGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 8,
    marginTop: 12,
  },
  kpCard: {
    display: 'flex',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    background: THEME.secondary,
    border: `1px solid ${THEME.border}`,
  },
  feedback: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: '#fff',
    border: `2px solid ${THEME.primary}`,
    fontSize: 13,
    lineHeight: 1.5,
    color: THEME.dark,
    boxShadow: '0 4px 12px rgba(5,150,105,0.12)',
  },
  quizCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    background: '#fff',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 10px',
    marginTop: 6,
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1.4,
  },
};

// ─── SVG HELPERS ─────────────────────────────────────────────────────────────
function HotspotDot({
  hx,
  hy,
  active,
  label,
  onClick,
}: {
  hx: number;
  hy: number;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <circle
        cx={`${hx}%`}
        cy={`${hy}%`}
        r={active ? 16 : 13}
        fill={active ? THEME.accent : THEME.primary}
        stroke="#fff"
        strokeWidth={3}
        opacity={0.95}
      >
        <animate attributeName="r" values="12;15;12" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <text
        x={`${hx}%`}
        y={`${hy}%`}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={9}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {label.length > 8 ? label.slice(0, 7) + '…' : label}
      </text>
    </g>
  );
}

// ─── SCENES ──────────────────────────────────────────────────────────────────
function SceneChain({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  const links = [
    'Pathogen',
    'Reservoir',
    'Portal of Exit',
    'Mode of Transmission',
    'Portal of Entry',
    'Susceptible Host',
  ];
  const colors = [THEME.danger, THEME.orange, THEME.accent, THEME.blue, THEME.purple, THEME.primary];
  const cx = 200;
  const cy = 170;
  const r = 110;
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <defs>
        <radialGradient id="chainBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </radialGradient>
      </defs>
      <rect width="400" height="340" rx="16" fill="url(#chainBg)" />
      <text x="200" y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Chain of Infection — Break a Link
      </text>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.primary} strokeWidth="2" strokeDasharray="6 4" opacity={0.5} />
      <circle cx={cx} cy={cy} r={36} fill={THEME.primary} opacity={0.15} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.primaryDark}>
        BREAK
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={THEME.primaryDark}>
        THE CHAIN
      </text>
      {links.map((label, i) => {
        const angle = (Math.PI * 2 * i) / links.length - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return (
          <g key={label}>
            <circle cx={x} cy={y} r={34} fill={colors[i]} opacity={0.9} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
              {i + 1}
            </text>
          </g>
        );
      })}
      {hotspots.map((h) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(hotspots.indexOf(h) + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneHandHygiene({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  const moments = [
    { n: 1, t: 'Before patient' },
    { n: 2, t: 'Before aseptic' },
    { n: 3, t: 'After body fluid' },
    { n: 4, t: 'After patient' },
    { n: 5, t: 'After surroundings' },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#ECFDF5" />
      <text x="200" y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        WHO Five Moments — Hand Hygiene
      </text>
      <text x="200" y="46" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Tap each moment — no invented compliance rates
      </text>
      {/* Patient silhouette */}
      <ellipse cx="200" cy="200" rx="48" ry="70" fill="#A7F3D0" stroke={THEME.primary} strokeWidth="2" />
      <circle cx="200" cy="120" r="28" fill="#6EE7B7" stroke={THEME.primary} strokeWidth="2" />
      {moments.map((m, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 120;
        const y = 175 + Math.sin(angle) * 100;
        return (
          <g key={m.n}>
            <rect x={x - 42} y={y - 18} width={84} height={36} rx={8} fill="#fff" stroke={THEME.primary} strokeWidth="1.5" />
            <text x={x} y={y - 2} textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.primaryDark}>
              M{m.n}
            </text>
            <text x={x} y={y + 12} textAnchor="middle" fontSize="8" fill={THEME.dark}>
              {m.t}
            </text>
          </g>
        );
      })}
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function ScenePPE({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  const rows = [
    { type: 'Standard', gloves: 'Risk', gown: 'Risk', mask: 'Risk', color: THEME.blue },
    { type: 'Contact', gloves: 'Yes', gown: 'Yes', mask: 'Std', color: THEME.accent },
    { type: 'Droplet', gloves: 'Std', gown: 'Std', mask: 'Surg', color: THEME.orange },
    { type: 'Airborne', gloves: 'Std', gown: 'Std', mask: 'N95', color: THEME.danger },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#FFF7ED" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        PPE Selection Matrix
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Select by procedure risk + transmission type
      </text>
      {/* header */}
      <text x="70" y="70" fontSize="10" fontWeight="700" fill={THEME.muted}>
        Type
      </text>
      <text x="160" y="70" fontSize="10" fontWeight="700" fill={THEME.muted}>
        Gloves
      </text>
      <text x="230" y="70" fontSize="10" fontWeight="700" fill={THEME.muted}>
        Gown
      </text>
      <text x="300" y="70" fontSize="10" fontWeight="700" fill={THEME.muted}>
        Mask
      </text>
      {rows.map((r, i) => {
        const y = 90 + i * 48;
        return (
          <g key={r.type}>
            <rect x="24" y={y - 18} width="352" height="40" rx="8" fill="#fff" stroke={r.color} strokeWidth="2" />
            <circle cx="44" cy={y} r="8" fill={r.color} />
            <text x="62" y={y + 4} fontSize="11" fontWeight="700" fill={THEME.dark}>
              {r.type}
            </text>
            <text x="160" y={y + 4} fontSize="11" fill={THEME.dark}>
              {r.gloves}
            </text>
            <text x="230" y={y + 4} fontSize="11" fill={THEME.dark}>
              {r.gown}
            </text>
            <text x="300" y={y + 4} fontSize="11" fontWeight="600" fill={r.color}>
              {r.mask}
            </text>
          </g>
        );
      })}
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneTechnique({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#F5F3FF" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Sterile vs Clean Decision
      </text>
      {/* Sterile panel */}
      <rect x="24" y="50" width="160" height="180" rx="12" fill="#EEF2FF" stroke={THEME.purple} strokeWidth="2" />
      <text x="104" y="78" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.purple}>
        STERILE
      </text>
      <text x="104" y="104" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Central line dressing
      </text>
      <text x="104" y="122" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Catheter insertion
      </text>
      <text x="104" y="140" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Open surgical wound
      </text>
      <text x="104" y="168" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Sterile field + gloves
      </text>
      <text x="104" y="186" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        No-touch critical sites
      </text>
      {/* Clean panel */}
      <rect x="216" y="50" width="160" height="180" rx="12" fill="#ECFDF5" stroke={THEME.primary} strokeWidth="2" />
      <text x="296" y="78" textAnchor="middle" fontSize="13" fontWeight="700" fill={THEME.primaryDark}>
        CLEAN
      </text>
      <text x="296" y="104" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Chronic wound care*
      </text>
      <text x="296" y="122" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Catheter care (not insert)
      </text>
      <text x="296" y="140" textAnchor="middle" fontSize="10" fill={THEME.dark}>
        Glucose / oral meds
      </text>
      <text x="296" y="168" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Clean gloves + hygiene
      </text>
      <text x="296" y="186" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Prevent cross-contam.
      </text>
      <rect x="80" y="250" width="240" height="48" rx="10" fill="#FFFBEB" stroke={THEME.accent} strokeWidth="2" />
      <text x="200" y="270" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.warn}>
        When in doubt → higher asepsis
      </text>
      <text x="200" y="288" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Follow orders + CL-SD-016; do not down-scope alone
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneSurveillance({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  const stages = [
    { day: 'Day 0–2', label: 'Contamination', color: THEME.blue },
    { day: 'Day 2–4', label: 'Colonization', color: THEME.accent },
    { day: 'Day 4–7', label: 'Local infection', color: THEME.orange },
    { day: 'Day 7+', label: 'Systemic risk', color: THEME.danger },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#FEF2F2" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Infection Progression & Escalation
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Timeline is illustrative — escalate on findings, not day count alone
      </text>
      <line x1="40" y1="120" x2="360" y2="120" stroke="#FECACA" strokeWidth="4" />
      {stages.map((s, i) => {
        const x = 55 + i * 90;
        return (
          <g key={s.label}>
            <circle cx={x} cy={120} r={16} fill={s.color} />
            <text x={x} y={124} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
              {i + 1}
            </text>
            <text x={x} y="155" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.dark}>
              {s.day}
            </text>
            <text x={x} y="170" textAnchor="middle" fontSize="9" fill={s.color}>
              {s.label}
            </text>
          </g>
        );
      })}
      <rect x="50" y="200" width="300" height="90" rx="12" fill="#fff" stroke={THEME.danger} strokeWidth="2" />
      <text x="200" y="228" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.danger}>
        LVN pathway
      </text>
      <text x="200" y="250" textAnchor="middle" fontSize="11" fill={THEME.dark}>
        Assess → Document → Notify RN → Precautions
      </text>
      <text x="200" y="270" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        No independent diagnosis, prescribing, or POC rewrite
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneBag({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#F0F9FF" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Bag Technique — Clean Field
      </text>
      {/* Barrier */}
      <rect x="90" y="200" width="220" height="14" rx="2" fill="#FDE68A" stroke={THEME.accent} />
      <text x="200" y="228" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Disposable barrier
      </text>
      {/* Bag */}
      <rect x="130" y="110" width="140" height="90" rx="10" fill="#0F766E" stroke={THEME.primaryDark} strokeWidth="2" />
      <rect x="140" y="120" width="55" height="70" rx="6" fill="#A7F3D0" />
      <rect x="205" y="120" width="55" height="70" rx="6" fill="#FECACA" />
      <text x="167" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.primaryDark}>
        CLEAN
      </text>
      <text x="232" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.danger}>
        DIRTY
      </text>
      <text x="200" y="95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
        Nursing Bag
      </text>
      {/* Sharps */}
      <rect x="160" y="250" width="80" height="50" rx="6" fill="#FEF3C7" stroke={THEME.warn} strokeWidth="2" />
      <text x="200" y="280" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.warn}>
        SHARPS
      </text>
      <text x="200" y="55" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Hand hygiene before open / after close
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneDocs({
  hotspots,
  activeId,
  onHotspot,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#ECFDF5" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Documentation & Reporting Mastery
      </text>
      <rect x="40" y="50" width="150" height="160" rx="10" fill="#fff" stroke={THEME.primary} strokeWidth="2" />
      <text x="115" y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.primaryDark}>
        Visit Note
      </text>
      <text x="115" y="100" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Precautions
      </text>
      <text x="115" y="116" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        PPE used
      </text>
      <text x="115" y="132" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Hand hygiene
      </text>
      <text x="115" y="148" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Education
      </text>
      <text x="115" y="164" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Objective findings
      </text>
      <rect x="210" y="50" width="150" height="160" rx="10" fill="#fff" stroke={THEME.danger} strokeWidth="2" />
      <text x="285" y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.danger}>
        If Infection
      </text>
      <text x="285" y="100" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Signs + measures
      </text>
      <text x="285" y="116" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        RN notified (who/when)
      </text>
      <text x="285" y="132" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Orders implemented
      </text>
      <text x="285" y="148" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Patient response
      </text>
      <text x="285" y="164" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        Event report (CL-SD-016)
      </text>
      <rect x="90" y="230" width="220" height="70" rx="12" fill={THEME.primary} opacity={0.95} />
      <text x="200" y="258" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        Quiz = knowledge only
      </text>
      <text x="200" y="278" textAnchor="middle" fontSize="10" fill="#ECFDF5">
        Observed demo + authorized sign-off = competency
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}




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
            <div className="text-[12px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase">MODULE LVN-010</div>
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

export default function LVN010() {
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
