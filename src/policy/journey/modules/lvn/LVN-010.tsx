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
import { LvnLeftPanel } from './LvnLeftPanel';
import { LvnGaoPlayer } from './LvnGaoPlayer';
import { LvnSceneModal } from './LvnSceneModal';

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

function SceneQuizActive() {
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#ECFDF5" />
      <circle cx="200" cy="140" r="56" fill={THEME.primary} opacity={0.15} />
      <text x="200" y="148" textAnchor="middle" fontSize="42">
        🛡️
      </text>
      <text x="200" y="220" textAnchor="middle" fontSize="16" fontWeight="700" fill={THEME.primaryDark}>
        Knowledge Check Active
      </text>
      <text x="200" y="244" textAnchor="middle" fontSize="12" fill={THEME.muted}>
        10 questions · 80% to pass · review & retry available
      </text>
      <text x="200" y="270" textAnchor="middle" fontSize="11" fill={THEME.muted}>
        Passing validates knowledge only—not practical competency
      </text>
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LVN010InfectionPrevention: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const page = PAGES[pageIndex];
  const totalPages = PAGES.length;
  const passCount = Math.ceil((MODULE_META.passing / 100) * MODULE_META.quizCount);

  const progressPct = quizMode
    ? 100
    : Math.round(((pageIndex + 1) / totalPages) * 100);

  const activeInfo = useMemo(() => {
    if (!page || !activeHotspot) return undefined;
    return page.hotspots.find((h) => h.id === activeHotspot);
  }, [page, activeHotspot]);

  const onHotspot = useCallback((id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  }, []);

  const goPrev = () => {
    if (quizMode) {
      setQuizMode(false);
      setPageIndex(totalPages - 1);
      setActiveHotspot(null);
      return;
    }
    setPageIndex((p) => Math.max(0, p - 1));
    setActiveHotspot(null);
  };

  const goNext = () => {
    if (quizMode) return;
    if (pageIndex < totalPages - 1) {
      setPageIndex((p) => p + 1);
      setActiveHotspot(null);
    } else {
      setQuizMode(true);
      setActiveHotspot(null);
    }
  };

  const submitQuiz = () => {
    let s = 0;
    QUIZ.forEach((q, i) => {
      if (answers[i] === q.correct) s += 1;
    });
    setScore(s);
    setSubmitted(true);
    setShowReview(true);
  };

  const retryQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowReview(false);
  };

  const passed = submitted && score >= passCount;

  const renderScene = () => {
    if (quizMode) return <SceneQuizActive />;
    const props = {
      hotspots: page.hotspots,
      activeId: activeHotspot,
      onHotspot,
    };
    switch (page.scene) {
      case 'chain':
        return <SceneChain {...props} />;
      case 'handHygiene':
        return <SceneHandHygiene {...props} />;
      case 'ppe':
        return <ScenePPE {...props} />;
      case 'technique':
        return <SceneTechnique {...props} />;
      case 'surveillance':
        return <SceneSurveillance {...props} />;
      case 'bag':
        return <SceneBag {...props} />;
      case 'docs':
        return <SceneDocs {...props} />;
      default:
        return <SceneQuizActive />;
    }
  };

  if (!quizMode) {
    return (
      <>
        <LvnGaoPlayer
        pages={PAGES}
        pageIndex={pageIndex}
        onSelectPage={(index) => {
          setPageIndex(index);
          setActiveHotspot(null);
        }}
        onPrevious={goPrev}
        onNext={goNext}
        nextLabel={pageIndex < totalPages - 1 ? 'Next Lesson →' : 'Start Quiz →'}
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
        renderRight={() => (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {renderScene()}
            {activeInfo && (
              <div style={styles.feedback} role="status" aria-live="polite">
                <div style={{ fontWeight: 700, color: THEME.primaryDark, marginBottom: 4 }}>
                  {activeInfo.label}
                </div>
                {activeInfo.info}
              </div>
            )}
            {!activeInfo && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: THEME.muted,
                  textAlign: 'center',
                }}
              >
                Tap numbered hotspots on the scene for clinical detail.
              </div>
            )}
          </div>
        )}
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

  
  if (false as any) { console.log(progressPct, showReview, setShowReview, passed); }
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
              onClick={() => setShowReview((v: any) => !v)}
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
              {showReview ? 'Hide' : 'Show'} answer review
            </button>

            {showReview &&
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

export default LVN010InfectionPrevention;
