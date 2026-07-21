/**
 * ACHC-ART-M05 — Infection Prevention & Control in the Home
 * PASS-5 standalone module · locked reference-parity architecture
 * Pages: 7 scenes + Knowledge Check | Hotspots: 34 | Quiz: 10 | Pass: 80%
 * Knowledge training only; practical competency and role authorization remain separate.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-break-the-chain.png';
import img02 from './assets/lesson-02-hand-hygiene.png';
import img03 from './assets/lesson-03-ppe.png';
import img04 from './assets/lesson-04-bag-technique.png';
import img05 from './assets/lesson-05-contain-clean-route.png';
import img06 from './assets/lesson-06-recognize-teach-report.png';
import img07 from './assets/lesson-07-full-visit.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeDark: '#E05922', orangeStrong: '#B94717', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC',
} as const;

type ControlKind = 'safe' | 'verify' | 'unsafe' | 'observe';

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  kind: ControlKind;
  info: string;
  meaning: string;
  action: string;
  notify?: string;
  document: string;
  policyRefs: string[];
}

interface KeyPoint { icon: string; title: string; detail: string; }
interface DetailSection { heading: string; paragraphs?: string[]; bullets?: string[]; callout?: string; }
interface EmbeddedCheck { prompt: string; answer: string; }

interface PageData {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: DetailSection[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  embeddedCheck: EmbeddedCheck;
  sourceLabels: { kind: string; text: string }[];
  sceneImage: string;
  imageAlt: string;
  hotspots: Hotspot[];
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
  sourceRefs: string[];
}

const CONTROL: Record<ControlKind, { label: string; color: string; soft: string }> = {
  safe: { label: 'Safe control', color: CI.teal, soft: CI.tealSoft },
  verify: { label: 'Pause and verify', color: CI.orangeStrong, soft: '#FFF3EC' },
  unsafe: { label: 'Unsafe practice', color: CI.red, soft: '#FEF2F2' },
  observe: { label: 'Observe and assess', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = {
  id: 'ACHC-ART-M05',
  title: 'Infection Prevention & Control in the Home',
  pages: 7,
  quizCount: 10,
  passing: 80,
};

const BASE_PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Break the Chain',
    title: 'Break the Chain in the Home',
    subtitle: 'Standard Precautions begin before the first touch.',
    overview: [
      `Infection prevention starts with observation, not a diagnosis. The chain of infection gives you six places to interrupt spread: the infectious agent, reservoir, portal of exit, mode of transmission, portal of entry, and susceptible host. In a home, a tissue, hand, reusable cuff, wound, shared bathroom surface, or caregiver can become part of that chain. Your task is to notice the route and place a control where it will matter.`,
      `Standard Precautions are the minimum infection-prevention practices for every patient and every visit. They are selected from the care activity and anticipated exposure—not from whether a chart contains an infection label. Additional Contact, Droplet, Airborne, or other patient-specific controls are added when the documented plan and current risk require them.`,
      `A home is not a controlled treatment room, but it is also not automatically “dirty.” Respectfully scan for a workable care zone, hand-hygiene access, required PPE, household respiratory symptoms, children or pets near supplies, and equipment that will travel to another patient. If a new risk is not covered by the current plan, pause and contact the appropriate clinical leader before proceeding.`,
    ],
    details: [
      {
        heading: 'Use the chain as an observation tool',
        paragraphs: [
          `An infectious agent needs a place to live, a way out, a route across the environment, a way into another person, and a susceptible host. The practical value of the chain is that you do not need to name the organism to interrupt spread. Hand hygiene can interrupt transfer; respiratory source control can contain a portal of exit; an intact dressing can protect a portal of entry; and correct equipment reprocessing can remove a reservoir before the next visit.`,
          `Do not stigmatize a household. Limited running water, poor ventilation, clutter, shared bathrooms, pets, children, invasive devices, caregiver-provided care, and immunosuppression are planning conditions. Describe the condition objectively, create a safer workflow when possible, and escalate an unresolved barrier.`,
        ],
      },
      {
        heading: 'Standard Precautions at every visit',
        bullets: [
          `Perform hand hygiene at the indicated moments and repeat it after recontamination.`,
          `Select PPE from the expected contact, splash, spray, clothing, eye, mucous-membrane, or respiratory exposure.`,
          `Use respiratory hygiene and source control for new cough or respiratory symptoms.`,
          `Keep injections, medication preparation, sharps, reusable equipment, linen, and environmental surfaces in a clean-to-dirty workflow.`,
          `Add the patient-specific transmission-based controls documented by the authorized clinical team; never replace Standard Precautions with them.`,
        ],
      },
      {
        heading: 'The entry scan',
        bullets: [
          `Confirm the patient, current plan, precaution alert, ordered task, and your role/competency.`,
          `Ask about new patient or household symptoms that may change the visit risk.`,
          `Locate a clean, dry, hard work surface and a safe hand-hygiene method.`,
          `Confirm required PPE, supplies, and an approved sharps container when sharps are anticipated.`,
          `Plan a sequence that protects clean supplies and prevents used equipment from returning to the next patient.`,
        ],
        callout: `Decision rule: every patient, every visit—Standard Precautions. Add documented controls when the condition, task, or current risk requires them. If the safe plan is unclear, pause, protect, notify, and document.`,
      },
    ],
    keyPoints: [
      { icon: '👁️', title: 'Scan first', detail: 'Observe people, care area, supplies, and likely exposure before opening the bag.' },
      { icon: '🔗', title: 'Break one link', detail: 'Choose the control that blocks the actual transmission route.' },
      { icon: '🛡️', title: 'Use the baseline', detail: 'Standard Precautions apply without waiting for a diagnosis.' },
      { icon: '📞', title: 'Escalate change', detail: 'Report a new symptom, exposure, or barrier; do not independently diagnose.' },
    ],
    clinicalTip: `“Home” describes the setting, not the risk. A tidy room can still contain an exposure route, and a cluttered room can often be made safer through respectful planning.`,
    embeddedCheck: {
      prompt: `The patient has no documented infection. May the worker skip the entry scan and Standard Precautions?`,
      answer: `No. Standard Precautions apply to every patient. A diagnosis may change which additional precautions are needed; it never turns the baseline on or off.`,
    },
    sourceLabels: [
      { kind: 'Federal requirement', text: '42 CFR §484.70(a)–(c)' },
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4.1, 4.3, 6.1–6.2' },
      { kind: 'Recommended practice', text: 'CDC Core IPC Practices §§5–6' },
      { kind: 'Accreditation crosswalk', text: 'ACHC HH7-1A topic map' },
    ],
    sceneImage: img01,
    imageAlt: `A home-health clinician pauses at the living-room entrance while an older patient covers a cough; hand sanitizer, a nursing bag, a pet gate, tissues, a lined bin, and an open window are visible.`,
    hotspots: [
      {
        id: 'l1-respiratory', label: 'Patient cough, tissues, and lined bin', shortLabel: 'Source Control', x: 84, y: 48, kind: 'verify',
        info: `The patient is using tissues for a new cough; a lined bin is nearby.`,
        meaning: `Secretions can contaminate hands, surfaces, or another person and may change visit controls.`,
        action: `Apply current respiratory, source-control, ventilation, masking, disposal, and hand-hygiene instructions.`,
        notify: `Promptly report a new or worsening cough that changes risk or stability.`,
        document: `Record the symptom, controls, notification, response, and follow-up.`,
        policyRefs: ['42 CFR §484.70(a)', 'CL-SD-016 §§4.1, 4.3', 'CDC Core IPC §5e'],
      },
      {
        id: 'l1-hands', label: 'Entry hand-hygiene station', shortLabel: 'Clean Hands', x: 13, y: 65, kind: 'safe',
        info: `Alcohol-based hand rub is ready before patient, surface, or supply contact.`,
        meaning: `Clean hands interrupt transfer before the clean supply zone opens.`,
        action: `Use the indicated approved method, cover every hand surface, and let ABHR dry.`,
        document: `Record a hand-hygiene barrier, variance, teaching, or required audit entry.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC Core IPC §5a'],
      },
      {
        id: 'l1-bag', label: 'Closed nursing bag at entry', shortLabel: 'Bag Closed', x: 22, y: 49, kind: 'safe',
        info: `The nursing bag stays closed during the entry scan.`,
        meaning: `Early opening exposes clean contents before the work zone is controlled.`,
        action: `Open only after preparing the approved hard surface, barrier, and clean hands.`,
        notify: `Pause and call the supervisor if no safe work zone exists.`,
        document: `Record the barrier, direction, visit change, and patient response.`,
        policyRefs: ['Bag Technique Corridor §6-013 steps 1–3', 'CL-SD-016 §6.1.3'],
      },
      {
        id: 'l1-pet', label: 'Pet separated from the care zone', shortLabel: 'Control Traffic', x: 51, y: 64, kind: 'safe',
        info: `A household cat is separated from supplies and the care zone.`,
        meaning: `Pets, children, and traffic can disrupt clean or sharps zones.`,
        action: `Respectfully ask the household to control traffic during the task.`,
        notify: `Escalate when the environment cannot support safe care.`,
        document: `Record the barrier, teaching, response, action, and direction.`,
        policyRefs: ['42 CFR §484.70(a)', 'CL-SD-016 §6.6'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Full Visit',
    title: 'Full Visit: Clean From Door to Door',
    subtitle: 'Observe → classify → protect → perform → close the loop.',
    overview: [
      `You arrive for ordered wound care. The caregiver reports a new cough, the patient reports increased drainage, and the room contains both clean supplies and potential cross-contamination points. The integrated task is not to make the room perfect—it is to notice each break, reset the sequence, and prevent risk from following you to the next patient.`,
      `Continue only when the task is within the current order and role, required competency is separately current, PPE and supplies are available, a safe work zone exists, and the patient is stable enough for the planned care or an authorized clinician has given direction. Any “no” means pause, protect, notify, and document.`,
      `From entry through exit, combine Standard Precautions, current additional controls, hand hygiene, task-based PPE, bag technique, point-of-use containment, equipment reprocessing, patient/caregiver teaching, objective reporting, and a defensible record. Completion of this knowledge simulation does not validate hands-on competency.`,
    ],
    details: [
      {
        heading: '1. Observe and classify',
        bullets: [
          `Review the current order, plan, precaution alert, assigned role, and required competency before opening the bag.`,
          `Identify the caregiver’s new respiratory signal, the patient’s reported drainage change, and any environmental or supply barrier.`,
          `Apply current Care Indeed masking and respiratory/source-control directions; contact the clinical leader if the new risk changes visit controls.`,
          `Use the emergency pathway for immediate threats; otherwise pause for direction rather than diagnosing or automatically cancelling.`,
        ],
      },
      {
        heading: '2. Build and protect the clean zone',
        paragraphs: [
          `Choose a clean, dry, hard surface and place the required barrier. Clean hands before opening the bag. Remove anticipated supplies, close the bag, and keep household traffic, pets, children, used PPE, phones, and contaminated equipment away from the clean zone.`,
          `Select PPE from the task and documented controls. Perform care from clean toward dirty. If a glove touches a contaminated site and the next task is clean, stop, remove or change gloves as appropriate, perform hand hygiene, and re-establish the clean sequence.`,
        ],
      },
      {
        heading: '3. Contain, reprocess, and exit cleanly',
        bullets: [
          `Dispose of any sharp immediately into the approved point-of-use container.`,
          `Place an ordered specimen into approved primary and secondary containment.`,
          `Route linen and waste according to the current item-specific agency process.`,
          `Keep the used cuff or stethoscope out of the bag until reprocessing follows the device IFU and product label and the item is dry.`,
          `Doff without touching contaminated fronts, perform hand hygiene, remove the barrier without contaminating the bag, clean hands again as needed, then close and secure the bag.`,
        ],
      },
      {
        heading: '4. Teach and close the loop',
        paragraphs: [
          `Use plain language and teach-back for wound signs, hand hygiene, respiratory hygiene/source control, and sharps safety. Confirm what the patient or caregiver will do and whom they will call.`,
          `Document objective wound and respiratory findings, controls used, care within the order, teaching and teach-back, barrier resolution, each notification and response/order, and required follow-up. A strong record shows not only what you did, but why the safe sequence changed.`,
        ],
      },
      {
        heading: 'Debrief: Observe → Classify → Decide → Defend',
        bullets: [
          `Observe: what changed from the expected visit?`,
          `Classify: which risks are baseline Standard Precaution issues, additional-control issues, or stop-and-notify barriers?`,
          `Decide: what must happen before patient touch or bag entry?`,
          `Defend: which facts, controls, notifications, orders, teaching, and outcomes belong in the record?`,
        ],
      },
    ],
    keyPoints: [
      { icon: '⏸️', title: 'Pause at change', detail: 'A new symptom or missing control triggers reassessment.' },
      { icon: '▭', title: 'Build a clean zone', detail: 'Hard surface, barrier, clean hands, supplies out, bag closed.' },
      { icon: '📍', title: 'Contain before moving', detail: 'Sharps, used equipment, linen, waste, and specimens stay routed.' },
      { icon: '🔁', title: 'Close communication', detail: 'Teach, notify, record the response, and track follow-up.' },
    ],
    clinicalTip: `A safe visit is not a perfect room. It is a controlled sequence in which you notice each break, reset the workflow, and do not carry contamination to the next patient.`,
    embeddedCheck: {
      prompt: `One go/no-go answer is “no”: the required PPE is missing. Should you improvise and complete the exposure-risk task?`,
      answer: `No. Protect the patient, avoid unprotected exposure-risk care, contact the verified supervisor/clinician for direction, use the emergency pathway if needed, and document the barrier and outcome.`,
    },
    sourceLabels: [
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4–7' },
      { kind: 'Care Indeed addendum', text: 'Bag Technique Corridor §6-013' },
      { kind: 'Care Indeed policy', text: 'RM-PS-002 §§4–5 · QA-SM-002 §4.3' },
      { kind: 'Federal requirement', text: '42 CFR §484.70' },
      { kind: 'Recommended practice', text: 'CDC Core IPC §§3–6' },
    ],
    sceneImage: img07,
    imageAlt: `An integrated home-health visit with a clinician, older patient, and caregiver; a nursing bag sits partly outside its disposable barrier while sanitizer, gloves, eye protection, wipes, stethoscope, tissues, lined bin, sharps container, and documentation tablet are visible.`,
    hotspots: [
      {
        id: 'l7-bag', label: 'Bag partly outside the disposable barrier', shortLabel: 'Spot the Break', x: 14, y: 69, kind: 'unsafe',
        info: `Part of the clinical bag sits outside the disposable barrier.`,
        meaning: `Incomplete placement breaks the protected setup and requires a reset before opening.`,
        action: `With clean hands, place the bag fully on a suitable barrier or pause.`,
        notify: `Report an unusable work zone or suspected supply contamination.`,
        document: `Record the barrier, correction, direction, and visit change.`,
        policyRefs: ['Bag Technique Corridor §6-013 step 1', 'CL-SD-016 §6.6'],
      },
      {
        id: 'l7-clean-zone', label: 'Hand hygiene and task-based PPE zone', shortLabel: 'Prepare Safely', x: 37, y: 83, kind: 'verify',
        info: `Hand sanitizer, gloves, and eye protection are staged for care.`,
        meaning: `PPE still must match the task; the bag/barrier break comes first.`,
        action: `Reset the zone, clean hands, review precautions, and don task-matched PPE.`,
        document: `Record any PPE or clean-zone barrier and corrective action.`,
        policyRefs: ['CL-SD-016 §§4.2, 4.4', 'CDC Core IPC §§5a, 5d'],
      },
      {
        id: 'l7-equipment', label: 'Reusable stethoscope, wipes, and documentation tablet', shortLabel: 'Reprocess & Record', x: 72, y: 84, kind: 'verify',
        info: `Used equipment, wipes, and a documentation tablet share the exit workflow.`,
        meaning: `Equipment stays used until reprocessed and dry; contaminated gloves must not touch the tablet.`,
        action: `Separate, reprocess by IFU/label, dry, then document with clean hands.`,
        document: `Record findings, controls, response, notifications, teaching, and follow-up.`,
        policyRefs: ['CL-SD-016 §§6.1.5, 7', 'CDC Core IPC §5f', 'EPA label directions'],
      },
      {
        id: 'l7-respiratory', label: 'Tissues and lined waste bin near the household', shortLabel: 'Source Control', x: 54, y: 48, kind: 'verify',
        info: `Tissues and a lined bin support response to the new cough.`,
        meaning: `A household respiratory signal may change controls for the wound-care visit.`,
        action: `Apply current respiratory, masking, disposal, and hand-hygiene instructions.`,
        notify: `Promptly report a symptom that changes precautions or risk.`,
        document: `Record the symptom, observations, controls, direction, and follow-up.`,
        policyRefs: ['CL-SD-016 §§4.1, 4.3', 'CDC Core IPC §5e'],
      },
      {
        id: 'l7-sharps', label: 'Rigid sharps container in the integrated visit', shortLabel: 'Secure Sharps', x: 91, y: 48, kind: 'safe',
        info: `A rigid sharps container is upright and outside the clean zone.`,
        meaning: `Safe placement enables immediate disposal and protects children and pets.`,
        action: `Check access, stability, fill level, and closure; never recap or carry the sharp.`,
        notify: `Report a missing, damaged, unsafe, or overfilled container before care.`,
        document: `Record unsafe conditions, corrections, exposures, and notifications.`,
        policyRefs: ['8 CCR §5193(d)(3)(B)–(D)', 'RM-PS-002 §5.2'],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: `Which statement BEST describes Standard Precautions in home health?`,
    options: [
      `They are used only after a clinician confirms an infectious diagnosis.`,
      `They apply to every patient and are selected according to the care activity and anticipated exposure; additional precautions are added when indicated.`,
      `They are replaced by Contact, Droplet, or Airborne Precautions whenever an organism is identified.`,
      `They apply only to tasks involving visible blood.`,
    ],
    correct: 1,
    rationale: `Standard Precautions are the minimum infection-prevention practices used for all patient care regardless of suspected or confirmed infection status. PPE is selected from the anticipated interaction and exposure. Transmission-based precautions are added when the risk cannot be managed by Standard Precautions alone; they do not replace the baseline.`,
    sourceRefs: ['42 CFR §484.70(a)', 'CL-SD-016 §§4.1, 4.3', 'CDC Core IPC §§5–6', 'CMS Appendix B G682'],
  },
  {
    id: 1,
    stem: `After providing oral care, a worker removes gloves. The worker’s hands are not visibly soiled, and the patient is not on a C. difficile or norovirus precaution. What is the PREFERRED next action?`,
    options: [
      `Put on a new pair of gloves without cleaning the hands.`,
      `Wash with soap and water because alcohol-based hand rub may never be used after glove removal.`,
      `Apply agency-approved alcohol-based hand rub containing at least 60% alcohol to all hand surfaces and rub until dry.`,
      `Skip hand hygiene because the gloves remained intact.`,
    ],
    correct: 2,
    rationale: `Hand hygiene is required immediately after glove removal. Care Indeed policy prefers alcohol-based hand rub containing at least 60% alcohol when hands are not visibly soiled and no policy-specific soap/water indication applies. Gloves do not replace hand hygiene, and the product must cover all surfaces and dry fully.`,
    sourceRefs: ['CL-SD-016 §§4.2, 6.1.3', 'CDC Core IPC §5a', 'CDC Clinical Safety: Hand Hygiene'],
  },
  {
    id: 2,
    stem: `A patient has documented C. difficile infection. After care, the worker removes gown and gloves, and a safe sink with soap and paper towels is available. Which hand-hygiene method should the worker use under current Care Indeed policy?`,
    options: [
      `Wash with soap and water, covering all hand surfaces, then dry without recontaminating the hands.`,
      `Use alcohol-based hand rub only, because it is always preferred when hands look clean.`,
      `Use a disinfectant surface wipe on the hands.`,
      `No hand hygiene is needed after correct gown and glove removal.`,
    ],
    correct: 0,
    rationale: `Current Care Indeed policy specifically requires soap and water after caring for a patient with C. difficile or norovirus. This is a Care Indeed operational rule and should not be described as a universal federal minimum. Hand hygiene remains required after PPE removal.`,
    sourceRefs: ['CL-SD-016 §4.2', 'CDC Preventing C. difficile'],
  },
  {
    id: 3,
    stem: `A worker is preparing for ordered wound irrigation and reasonably expects splashing. In addition to the agency-required visit mask, which PPE set BEST matches the task?`,
    options: [
      `Gloves only, because the wound is below the worker’s face.`,
      `A fit-tested N95 only, with no gloves or eye protection.`,
      `Two pairs of gloves, with no gown or eye protection.`,
      `Gloves, a task-appropriate gown, and approved eye protection or a face shield that protects the eyes, nose, and mouth.`,
    ],
    correct: 3,
    rationale: `Splash or spray risk requires protection of the hands, clothing/skin, eyes, nose, and mouth. A respirator addresses a respiratory hazard under a documented plan; it does not replace splash PPE. The module does not provide respirator fit testing or assignment clearance.`,
    sourceRefs: ['CL-SD-016 §§4.4, 6.1.2', 'CDC Core IPC §5d', '8 CCR §5193(d)(3)'],
  },
  {
    id: 4,
    stem: `During a dressing change, the worker realizes that extra tape is still inside the closed clinical bag. The worker is wearing used gloves. What is the safest response?`,
    options: [
      `Reach into the bag with the hand that appears less contaminated.`,
      `Pause, remove gloves safely, perform hand hygiene, retrieve the tape, close the bag, and put on new gloves if the task requires them.`,
      `Ask the caregiver to search the bag while the worker continues care.`,
      `Place the bag on the bed and open it so the supplies are easier to reach.`,
    ],
    correct: 1,
    rationale: `Used gloves may not enter the clean bag zone. Reset the sequence: remove gloves, clean hands, retrieve the item, close the bag, and re-don PPE as needed. Asking a caregiver or using a “cleaner” gloved hand still transfers contamination.`,
    sourceRefs: ['Bag Technique Corridor §6-013 steps 2–4', 'CL-SD-016 §6.1.3'],
  },
  {
    id: 5,
    stem: `A reusable blood-pressure cuff is visibly soiled after use. The worker cleans it, applies an approved disinfectant wipe, but the surface dries after 30 seconds while the label requires three minutes of wet contact time for the intended use. What should the worker do?`,
    options: [
      `Return the cuff to the clean bag because wiping once is sufficient.`,
      `Spray an unapproved household cleaner on it to extend the wet time.`,
      `Follow device compatibility and product-label instructions and reapply the approved product as needed so the surface stays visibly wet for the full contact time; dry before clean storage.`,
      `Place the still-used cuff in a plastic bag and use it on the next patient.`,
    ],
    correct: 2,
    rationale: `Reprocessing requires the device instructions and disinfectant label, including full wet contact time. The used cuff remains separate from clean supplies until reprocessing and drying are complete. Do not substitute an unapproved chemical or a generic contact time.`,
    sourceRefs: ['CDC Core IPC §§5b, 5f', 'EPA label directions', 'CL-SD-016 §6.1.5', 'CMS Appendix B G682'],
  },
  {
    id: 6,
    stem: `A worker has just used a lancet. An approved sharps container is upright and within reach. What is the correct next step?`,
    options: [
      `Put the lancet directly into the sharps container immediately without recapping, bending, breaking, or carrying it elsewhere.`,
      `Recap it with two hands so it cannot injure anyone on the way to the kitchen.`,
      `Wrap it in gauze and place it in the red bag.`,
      `Put it in a uniform pocket until the visit is complete.`,
    ],
    correct: 0,
    rationale: `Contaminated sharps must go immediately or as soon as feasible into an accessible, upright, rigid, puncture-resistant, leak-resistant, labeled container. Routine recapping, bending, breaking, pocketing, hand-carrying, or red-bag disposal is unsafe.`,
    sourceRefs: ['8 CCR §5193(d)(3)(B)–(D)', 'CL-SD-016 §§4.5, 6.3', 'RM-PS-002 §5.2'],
  },
  {
    id: 7,
    stem: `During ordered wound care, a worker observes new redness extending beyond the documented wound edge, increased warmth, and new drainage. What documentation and escalation are MOST defensible?`,
    options: [
      `Write “wound infection confirmed,” advise the family to start leftover antibiotics, and tell the RN at the next visit.`,
      `Complete the dressing silently because diagnosing is outside the worker’s role.`,
      `Photograph the wound on a personal phone and text it to a coworker.`,
      `Record objective findings and change from baseline, protect the patient and remain within the current order and scope, notify the appropriate supervising or assigned clinician promptly, document the notification and response, and complete the internal surveillance route if assigned.`,
    ],
    correct: 3,
    rationale: `A field worker observes and reports; the worker does not independently diagnose, prescribe, or change the plan. The record should show objective facts, actions, notification time/person, response or orders, and follow-up. Personal-device photography and vague or delayed reporting are not defensible.`,
    sourceRefs: ['CL-SD-016 §§6.5.1, 7', 'QA-SM-002 §§4.3, 6.2', 'CL-SD-017 §§4.3–4.6'],
  },
  {
    id: 8,
    stem: `A field worker learns of a newly identified condition but is unsure whether it appears on California’s current reportable-disease list. Which action is BEST?`,
    options: [
      `Wait until the annual module is updated with a new disease list.`,
      `Promptly send the objective facts through the role-specific IPC, DON, or supervisor pathway, document who was notified and when, and follow the current agency and legal reporting procedure rather than guessing or delaying.`,
      `Post the condition in a team group chat so someone else can decide.`,
      `Independently send a report to CDPH even if the worker is not an authorized reporter and does not know the required form or destination.`,
    ],
    correct: 1,
    rationale: `The list and urgency categories can change. Staff should not delay internal reporting while trying to memorize or interpret them. California directs specified health-care providers to report to the local health officer. Each worker follows the duty applicable to that role and documents the closed loop.`,
    sourceRefs: ['17 CCR §2500', 'Current CDPH Reportable Diseases list', 'QA-SM-002 §§4.3, 6.7', '42 CFR §484.70(b)'],
  },
  {
    id: 9,
    stem: `At an ordered wound-care visit, the caregiver has a new cough, the bag’s only obvious resting place is an upholstered chair, a child is near an unsafe sharps container, and the patient reports increased drainage. Which sequence BEST protects this patient and the next patient?`,
    options: [
      `Put on gloves, place the bag on the chair, finish quickly, and document only the wound care performed.`,
      `Cancel the visit solely because someone coughed, without assessing the patient or notifying the agency.`,
      `Pause and assess the new risks; apply current respiratory and agency masking instructions; establish a clean hard work zone; perform hand hygiene and task-based PPE; follow clean-to-dirty bag technique; contain sharps and waste and reprocess equipment; teach with teach-back; and document and escalate new findings and unresolved barriers.`,
      `Call the local health department before protecting the patient or contacting the agency.`,
    ],
    correct: 2,
    rationale: `The integrated safe path combines Standard Precautions, current additional controls, bag technique, point-of-use containment, equipment reprocessing, teaching, and closed-loop reporting. A new finding or unsafe environment may require pausing for direction, but neither speed nor automatic cancellation substitutes for risk assessment.`,
    sourceRefs: ['42 CFR §484.70', 'CL-SD-016 §§4–7', 'Bag Technique Corridor §6-013', 'RM-PS-002 §§4–5', 'QA-SM-002 §4.3', 'CDC Core IPC §§3–6'],
  },
];

const STYLES = `
.achcm05,.achcm05 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm05-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm05-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm05-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm05-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40;overflow:hidden}
.achcm05-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0;min-width:0}
.achcm05-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.achcm05-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm05-tabs::-webkit-scrollbar{display:none}
.achcm05-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm05-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm05-tab.quiz-tab{border:1px solid #B94717;color:#B94717}
.achcm05-tab.quiz-tab.active{background:#B94717;color:#fff;border-color:#B94717}
.achcm05-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94717;background:#fff;color:#B94717;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm05-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm05-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px;scrollbar-gutter:stable}
.achcm05-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm05-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.achcm05-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm05-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm05-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm05-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm05-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.achcm05-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:achcm05-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm05-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.achcm05-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.45)}
.achcm05-modal-bg{position:fixed;inset:0;z-index:100;background:rgba(15,91,84,.58);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm05-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm05-modal{width:min(460px,100%);max-height:min(88vh,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.achcm05-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px;min-width:0}
.achcm05-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm05-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm05-bot button.next{background:#B94717;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.achcm05-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm05-quiz-card{width:min(760px,100%);animation:achcm05-slide .35s cubic-bezier(.16,1,.3,1)}
.achcm05-option:focus-visible,.achcm05-tab:focus-visible,.achcm05-exit:focus-visible,.achcm05 button:focus-visible,.achcm05 summary:focus-visible{outline:3px solid #F26D33;outline-offset:3px}
.achcm05-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.achcm05-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.achcm05-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
@media (max-width:900px){
  .achcm05-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm05-left,.achcm05-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm05-right{min-height:360px}
  .achcm05-left{max-height:42vh}
  .achcm05-top{padding:0 10px;gap:8px}
  .achcm05-tab{padding:8px 10px;font-size:12px}
  .achcm05-bot{padding:0 12px;height:72px}
  .achcm05-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:560px){
  .achcm05-bot{gap:6px;padding:0 8px}
  .achcm05-bot button.next{padding:10px 12px;font-size:10px;letter-spacing:.05em}
  .achcm05-bot button.nav{font-size:10px;padding:0 4px}
  .achcm05-footer-id{font-size:10px!important;padding:7px 8px!important;letter-spacing:.04em!important}
  .achcm05-result-grid{grid-template-columns:1fr}
}
@media (max-width:420px){
  .achcm05-brand span.brand-text{display:none}
  .achcm05-exit{padding:8px 10px;font-size:11px}
  .achcm05-stage{border-radius:10px}
  .achcm05-quiz-page{padding:10px}
}
@media (prefers-reduced-motion:reduce){
  .achcm05-hotspot .ping,.achcm05-modal-bg,.achcm05-quiz-card{animation:none!important}
  .achcm05-rm-transition,.achcm05-complete-overlay{transition:none!important;animation:none!important}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function ClinicalFeedbackOverlay({ hotspot, onClose, onComplete, triggerRef }: {
  hotspot: Hotspot;
  onClose: () => void;
  onComplete: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const control = CONTROL[hotspot.kind];

  const closeAndRestore = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [hotspot.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndRestore();
      }
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeAndRestore]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', trap);
    return () => root.removeEventListener('keydown', trap);
  }, []);

  return (
    <div className="achcm05-modal-bg" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm05-modal">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.98)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: control.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.kind === 'unsafe' ? <XCircle size={18} /> : hotspot.kind === 'verify' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{control.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close feedback" onClick={closeAndRestore} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} className="achcm05-sr-only">Infection-prevention feedback for the selected scene object.</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.info} />
          <FeedbackBlock label="Why it matters" body={hotspot.meaning} />
          <FeedbackBlock label="Safe action" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who to notify and when" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Sources">
            {hotspot.policyRefs.map((ref) => (
              <span key={ref} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{ref}</span>
            ))}
          </div>
          <button type="button" onClick={() => { onComplete(); window.requestAnimationFrame(() => triggerRef.current?.focus()); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orangeStrong, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

const EXTRA_PAGES: PageData[] = [
  {
    id: 4,
    shortName: 'Contain & Clean',
    title: 'Contain, Clean, and Route Safely',
    subtitle: 'Separate clean from soiled, contain at the point of use, and follow the label.',
    overview: [
      `After a care task, several streams may exist at once: reusable equipment, a specimen, a sharp, linen, ordinary waste, regulated waste, or a contaminated surface. They are not interchangeable. Separate them where they are generated, protect the household, and keep every used item away from the clean clinical bag.`,
      `A disinfectant wipe is not a magic step. Reprocessing depends on the right product for the intended use and surface, removal of visible soil when required, compatibility with the device, the full wet contact time on the product label, and complete drying before clean storage. Never substitute a memorized bleach ratio or mix chemicals.`,
      `If containment, labeling, transport packaging, equipment instructions, or the authorized waste route is missing, leaking, or unclear, stop and call the appropriate clinical leader. Do not improvise a bottle, bag, temperature, chemical, or personal-vehicle transport method.`,
    ],
    details: [
      {
        heading: 'Reusable equipment',
        paragraphs: [
          `Treat patient-contact equipment as used until visible soil is addressed and reprocessing follows the device IFU and an agency-approved, compatible EPA-registered product label. Follow application, safety, wet contact time, and drying directions exactly.`,
          `Keep the surface visibly wet for the full label time, reapplying only as permitted. Separate the item from clean supplies until dry; use dedicated equipment when the patient-specific plan requires it.`,
        ],
      },
      {
        heading: 'Specimens',
        bullets: [
          `Close the correctly identified, leak-resistant primary container; inspect its exterior and seal it in approved secondary packaging.`,
          `Keep it away from clean supplies, food, and personal items; follow laboratory timing, temperature, requisition, and handoff instructions.`,
          `For leakage, mislabeling, missing packaging, or uncertainty, stop and contact the laboratory or clinical leader.`,
        ],
      },
      {
        heading: 'Sharps',
        bullets: [
          `Before care, place an approved container upright, stable, and near the point of use. Dispose immediately without recapping, bending, breaking, passing, pocketing, or carrying.`,
          `Do not overfill; close before movement and use required secondary containment for leakage risk. Never use a bag, household trash, pocket, clinical bag, or improvised bottle.`,
          `Keep patient self-injection and agency-generated sharps routes distinct; teach the approved patient-specific process.`,
        ],
      },
      {
        heading: 'Linen and waste',
        paragraphs: [
          `Handle linen minimally and contain it where used; do not sort or rinse it. Prevent leakage and never place it in the clinical bag.`,
          `Separate ordinary, regulated/biohazardous, sharps, pharmaceutical, and specialty waste where generated. Because supplied policies conflict at part of the field threshold, follow the current item-specific agency tool and ask when uncertain.`,
          `Add secondary containment for leakage, outside contamination, or a designated route—not routinely. Never improvise personal-vehicle transport; use only an authorized, compliant agency process.`,
        ],
      },
      {
        heading: 'Spills and exposure recognition',
        bullets: [
          `Restrict access, protect the household, select task PPE, and use a tool—not hands—for sharp debris.`,
          `Remove visible material, then disinfect by the approved label and spill procedure; never mix chemicals or invent a dilution.`,
          `For skin, eye, mouth, non-intact-skin, or parenteral exposure, wash or flush immediately and report. M11 covers full occupational follow-up.`,
        ],
      },
    ],
    keyPoints: [
      { icon: '↔️', title: 'Separate clean and used', detail: 'Used equipment stays out of the clean bag until fully reprocessed.' },
      { icon: '📍', title: 'Contain at point of use', detail: 'Sharps, specimens, linen, and waste enter the right route immediately.' },
      { icon: '🏷️', title: 'Follow IFU and label', detail: 'Compatibility, application, wet contact time, and drying all matter.' },
      { icon: '🛑', title: 'Stop leaks and exposure', detail: 'Protect, wash/flush if exposed, report, and use M11 for full follow-up.' },
    ],
    clinicalTip: `A wipe is not a magic step. The correct product, correct surface, removal of soil, full wet contact time, and correct drying and return pathway all matter.`,
    embeddedCheck: {
      prompt: `A disinfectant wipe dries after 30 seconds, but its label requires three minutes of wet contact time for the intended use. What should you do?`,
      answer: `Follow the label and device compatibility instructions. Reapply the approved product as permitted so the surface stays visibly wet for the full three minutes, then allow the item to dry before clean storage.`,
    },
    sourceLabels: [
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4.5–4.6, 6.1.5, 6.3' },
      { kind: 'Care Indeed policy', text: 'RM-PS-002 §§4–5.3' },
      { kind: 'California requirement', text: '8 CCR §5193(d)(3)(C)–(J)' },
      { kind: 'Federal requirement', text: '29 CFR §1910.1030(d)(2)–(4)' },
      { kind: 'Recommended practice', text: 'CDC Core IPC §§5b, 5f · EPA label directions' },
    ],
    sceneImage: img05,
    imageAlt: `A gloved home-health clinician disinfects a blood-pressure cuff on a hard table; a rigid sharps container, sealed specimen bag, disinfectant wipes, contained linen, lined waste bin, and absorbent spill towels are separated.`,
    hotspots: [
      {
        id: 'l5-sharps', label: 'Upright rigid sharps container', shortLabel: 'Sharps at Point', x: 15, y: 67, kind: 'safe',
        info: `An approved sharps container is upright and within reach.`,
        meaning: `Point-of-use placement prevents recapping, carrying, pocketing, or surface placement.`,
        action: `Dispose immediately without recapping, bending, or breaking; close before movement.`,
        notify: `Report a missing, damaged, leaking, misplaced, or overfilled container before care.`,
        document: `Record unsafe conditions, corrective action, exposure, and notification.`,
        policyRefs: ['8 CCR §5193(d)(3)(B)–(D)', 'CL-SD-016 §§4.5, 6.3', 'RM-PS-002 §5.2'],
      },
      {
        id: 'l5-specimen', label: 'Specimen inside sealed secondary packaging', shortLabel: 'Specimen Route', x: 30, y: 84, kind: 'safe',
        info: `A closed specimen tube is sealed in secondary transport packaging.`,
        meaning: `Correct identification and containment protect handlers from leakage or error.`,
        action: `Verify identifiers, inspect and seal both containers, then follow laboratory timing and transport instructions.`,
        notify: `Stop for leakage, mislabeling, missing packaging, or routing uncertainty.`,
        document: `Record specimen, collection, tolerance, handoff, and any variance without exposing PHI.`,
        policyRefs: ['8 CCR §5193(d)(3)(F)', 'CL-SD-016 §6.3'],
      },
      {
        id: 'l5-cuff', label: 'Reusable cuff being cleaned and disinfected', shortLabel: 'Reprocess Cuff', x: 43, y: 63, kind: 'verify',
        info: `The clinician is reprocessing a used blood-pressure cuff.`,
        meaning: `It remains used until cleaned as required, disinfected for full contact time, and dry.`,
        action: `Follow the cuff IFU and product label; keep it outside clean storage.`,
        document: `Complete required logs and record damage, failure, or exposure.`,
        policyRefs: ['CL-SD-016 §6.1.5', 'CDC Core IPC §5f', 'EPA label directions'],
      },
      {
        id: 'l5-wipes', label: 'Approved disinfectant wipes', shortLabel: 'Read the Label', x: 54, y: 82, kind: 'observe',
        info: `Approved disinfectant wipes are beside the used equipment.`,
        meaning: `Product, surface, and intended use determine application and wet contact time.`,
        action: `Verify approval, compatibility, label directions, and safety; never mix chemicals.`,
        document: `Record a product, contact-time, equipment, or reprocessing variance.`,
        policyRefs: ['CDC Core IPC §5b', 'EPA Selected Registered Disinfectants'],
      },
      {
        id: 'l5-linen', label: 'Contained soiled linen', shortLabel: 'Handle Minimally', x: 69, y: 59, kind: 'safe',
        info: `Soiled linen is contained where used and away from clean supplies.`,
        meaning: `Agitation or leakage can spread contamination to people and surfaces.`,
        action: `Use task PPE, handle minimally, contain leakage, and follow the laundry plan.`,
        document: `Record teaching, barriers, leakage, exposure, or workflow changes.`,
        policyRefs: ['8 CCR §5193(d)(3)(J)', 'RM-PS-002 §5.3'],
      },
      {
        id: 'l5-spill', label: 'Contained small spill and cleanup materials', shortLabel: 'Control the Spill', x: 85, y: 84, kind: 'verify',
        info: `Absorbent towels mark a small, contained spill area.`,
        meaning: `Spills can contaminate people, footwear, equipment, and household surfaces.`,
        action: `Restrict access, don PPE, remove material safely, disinfect by label, and route waste.`,
        notify: `Immediately report exposure, uncontrolled spill, missing supplies, or routing uncertainty.`,
        document: `Record material, location, cleanup, product/process, notifications, and outcome.`,
        policyRefs: ['8 CCR §5193(d)(3)', 'RM-PS-002 §5.3', 'EPA label directions'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Recognize & Report',
    title: 'Recognize, Teach, Report',
    subtitle: 'Observe facts, protect the patient, and route the concern to the right person.',
    overview: [
      `Field workers recognize changes; they do not independently diagnose an infection. Observe new or worsening redness, warmth, swelling, pain, odor, drainage, respiratory symptoms, vomiting or diarrhea, urinary changes, rash, device-site changes, or a household cluster, then compare the objective finding with the patient-specific plan and baseline.`,
      `Protect the patient within the current order, emergency protocol, role, and competency. Do not change wound products, start treatment, recommend leftover antibiotics, or tell the family that infection is confirmed. Report the concern at identification through the assigned clinician, supervisor, Director of Nursing, or Infection Prevention pathway.`,
      `Teaching must be understandable and verified. Adapt to language, literacy, cognition, sensory needs, culture, and the person’s preferred method. Ask the patient or caregiver to show or explain what they will do and when they will call, then document that specific teach-back response—not merely “verbalized understanding.”`,
    ],
    details: [
      {
        heading: 'Recognize without diagnosing',
        bullets: [
          `Describe the location, color, amount, odor, measured value, patient-reported symptom, and change from baseline.`,
          `Follow the patient-specific plan for fever or other thresholds; do not teach one universal number when policies or conditions differ.`,
          `Keep planned care within the current order unless an authorized clinician provides new direction.`,
          `Use the emergency pathway for immediate threats; otherwise report promptly and do not wait until the next visit.`,
        ],
      },
      {
        heading: 'Internal and external reporting',
        paragraphs: [
          `QA-SM-002 sets a 24-hour outer limit for clinical staff reporting patient infection and staff infection/exposure signals, while CL-SD-016 expects notification at identification for clinical findings. The operational behavior is therefore: report at identification—do not wait. Use the surveillance form only when assigned; patient-care findings still belong in the clinical visit record.`,
          `California’s reportable-condition list and urgency categories can change. Title 17 places duties on specified health-care providers and directs reports to the local health officer for the patient’s jurisdiction. Follow the duty applicable to your role and the current agency process. A worker who is not the authorized external reporter sends objective facts immediately through the internal chain and documents the closed loop rather than guessing, delaying, or contacting the wrong destination.`,
        ],
      },
      {
        heading: 'Teach the actual risk',
        bullets: [
          `Explain the hand-hygiene, respiratory, wound/device, equipment/linen, sharps, and symptom-reporting behavior relevant to this patient.`,
          `Use plain language, a qualified interpreter or accessible format when required, demonstration, and return demonstration when appropriate.`,
          `Ask for teach-back: “Show me how,” or “Tell me what you will watch for and who you will call.”`,
          `Record the person’s demonstrated or stated response and the exact point needing reinforcement.`,
        ],
      },
      {
        heading: 'Resolve home barriers respectfully',
        paragraphs: [
          `Possible barriers include no safe running water, no clean hard work surface, missing PPE or sharps container, incompatible cleaning products, uncontrolled pets or children, unsafe ventilation, caregiver technique failure, or refusal of precautions. Explain the safety need without shaming the household.`,
          `If required care cannot be delivered safely, stop and contact the clinical leader for direction. Document the objective barrier, patient-protection actions, person notified, direction received, visit change, and unresolved follow-up. Do not place confidential employee occupational-health details in the patient record.`,
        ],
      },
      {
        heading: 'Defensible documentation',
        bullets: [
          `Date/time and exact objective findings, including change from baseline.`,
          `Patient-reported symptoms in neutral language without converting them into a diagnosis.`,
          `Precautions, patient-protection actions, and any safe deviation from the planned visit.`,
          `Teaching topic, method, teach-back response, and remaining barrier.`,
          `Who was notified, when, what was reported, the response/orders, and required follow-up.`,
        ],
      },
    ],
    keyPoints: [
      { icon: '📝', title: 'Describe, don’t diagnose', detail: 'Record objective facts and change from baseline.' },
      { icon: '⏱️', title: 'Report at identification', detail: 'Use the role-specific chain; do not wait until the next visit.' },
      { icon: '🗣️', title: 'Teach and verify', detail: 'Use plain language and teach-back, not a checkbox.' },
      { icon: '🔁', title: 'Close the loop', detail: 'Document notification, response, instructions, and follow-up.' },
    ],
    clinicalTip: `“Patient educated” does not prove understanding. Record the specific behavior or explanation the patient or caregiver produced during teach-back.`,
    embeddedCheck: {
      prompt: `A weak note says, “Wound infected. Patient educated. MD aware.” What must change?`,
      answer: `Replace diagnosis and vague claims with objective findings and baseline change, safety actions, exact teaching/teach-back, notification time and person, response/orders, and follow-up.`,
    },
    sourceLabels: [
      { kind: 'Federal requirement', text: '42 CFR §484.70(b)–(c)' },
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4.7, 6.5, 7' },
      { kind: 'Care Indeed policy', text: 'QA-SM-002 §§4.3, 6.2, 6.7' },
      { kind: 'Care Indeed policy', text: 'CL-SD-017 §§4.3–4.6, 6.2–6.3' },
      { kind: 'California requirement', text: '17 CCR §2500 · current CDPH list' },
    ],
    sceneImage: img06,
    imageAlt: `A home-health clinician uses an icon-based teaching card with an older patient and caregiver at a dining table; tissues, lined bin, sanitizer, thermometer, blank symptom sheet, masks, phone, sink, and water dispenser are visible.`,
    hotspots: [
      {
        id: 'l6-teach', label: 'Picture-based teaching and teach-back card', shortLabel: 'Teach-Back', x: 39, y: 52, kind: 'safe',
        info: `The clinician uses a picture card with the patient and caregiver.`,
        meaning: `Teaching must match language, literacy, cognition, sensory access, culture, and preference.`,
        action: `Use accessible language, request teach-back or demonstration, and reinforce gaps.`,
        document: `Record topic, accommodation, participants, teach-back, and reinforcement needs.`,
        policyRefs: ['42 CFR §484.70(c)', 'CL-SD-017 §§4.3–4.6, 6.2–6.3'],
      },
      {
        id: 'l6-findings', label: 'Thermometer and blank symptom tracking sheet', shortLabel: 'Objective Facts', x: 39, y: 86, kind: 'observe',
        info: `A thermometer and blank log support objective observation without PHI.`,
        meaning: `Values, symptoms, and baseline change support evaluation—not worker diagnosis.`,
        action: `Collect only authorized data, protect the patient, and report change promptly.`,
        notify: `Notify the assigned clinician at identification; escalate immediate threats emergently.`,
        document: `Record time, facts, baseline, action, notification, response, and follow-up.`,
        policyRefs: ['CL-SD-016 §§6.5, 7', 'QA-SM-002 §4.3'],
      },
      {
        id: 'l6-prevention', label: 'Tissues, lined bin, masks, and hand sanitizer', shortLabel: 'Prevention Plan', x: 19, y: 82, kind: 'safe',
        info: `Respiratory and hand-hygiene supplies are accessible to the household.`,
        meaning: `Practical teaching connects source control, disposal, clean hands, and reporting.`,
        action: `Demonstrate the sequence, confirm supplies, request teach-back, and identify barriers.`,
        notify: `Report new symptoms or unresolved access barriers through the clinical chain.`,
        document: `Record symptoms, controls, teaching, teach-back, barrier, and response.`,
        policyRefs: ['CL-SD-016 §§4.1–4.4', 'CDC Core IPC §5e'],
      },
      {
        id: 'l6-phone', label: 'Agency contact and escalation path', shortLabel: 'Report & Close Loop', x: 92, y: 87, kind: 'verify',
        info: `A phone supports the role-specific agency reporting path outside hands-on care.`,
        meaning: `Internal escalation and external legal reporting have different owners and triggers.`,
        action: `Send objective facts through the assigned clinician, supervisor, DON, or IPC pathway.`,
        notify: `Follow any role-specific duty and current local-health-officer process.`,
        document: `Record who, when, facts sent, response/orders, and follow-up.`,
        policyRefs: ['17 CCR §2500', 'QA-SM-002 §§4.3, 6.7', '42 CFR §484.70(b)'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Clean Hands',
    title: 'Clean Hands at the Right Moment',
    subtitle: 'Method matters; timing matters more than habit.',
    overview: [
      `Hand hygiene is a sequence of moments, not a one-time ritual at the front door. Perform it immediately before patient contact, before an aseptic task, after patient or immediate-environment contact, after blood/body-fluid or non-intact-skin contact, after glove removal, and when moving from a soiled body site to a clean site on the same patient.`,
      `For most clinical moments when hands are not visibly soiled, Care Indeed policy prefers alcohol-based hand rub containing at least 60% alcohol. Use the amount directed by the product, cover palms, backs, thumbs, fingertips, between fingers, and around nails, and rub until dry. Do not wipe it off or put gloves on wet hands.`,
      `Use soap and water when hands are visibly soiled and when current Care Indeed policy requires it after caring for a patient with C. difficile or norovirus. If the required method is not safely available, do not improvise with a surface wipe or assume gloves solve the problem—pause and contact the clinical leader.`,
    ],
    details: [
      {
        heading: 'Choose the method',
        bullets: [
          `Hands not visibly soiled during a routine clinical moment: use agency-approved ABHR with at least 60% alcohol and rub until completely dry.`,
          `Visible dirt, blood, or proteinaceous material: wash with soap and water.`,
          `After C. difficile or norovirus care: use soap and water under current Care Indeed policy.`,
          `After glove removal: clean hands immediately, selecting ABHR or soap/water from the same method rules.`,
          `If a safe sink, soap, towels, or approved ABHR is missing: stop and escalate rather than substituting an unapproved method.`,
        ],
      },
      {
        heading: 'Repeat after recontamination',
        paragraphs: [
          `Gloves are not hand hygiene. They may have microscopic defects, hands can be contaminated during removal, and a gloved hand can carry organisms to a phone, pen, bag zipper, faucet, or clean wrapper. A worker who cleans hands and then touches a used phone before an aseptic task must clean hands again.`,
          `When moving from a contaminated body site to a clean site on the same patient, remove or change gloves as the task requires and perform hand hygiene before the clean task. Do not use one pair of gloves to move across care activities.`,
        ],
      },
      {
        heading: 'Technique and common misses',
        bullets: [
          `Use enough product to keep all surfaces wet during rubbing; follow the label-directed amount.`,
          `Cover thumbs, fingertips, finger webs, backs of hands, and the areas around nails—not only the palms.`,
          `With soap and water, scrub every surface thoroughly, rinse, dry with a clean disposable towel when available, and avoid recontaminating hands at the faucet or door.`,
          `Do not wipe ABHR off before dry, put gloves on wet hands, wear artificial nails contrary to policy, or rely on a memorized timer instead of complete technique.`,
        ],
        callout: `A phone, watch, bag zipper, supply wrapper, or faucet can undo correct hand hygiene in one touch. Follow the clean path all the way into the task.`,
      },
    ],
    keyPoints: [
      { icon: '1', title: 'Clean before touch', detail: 'Start patient contact with clean hands.' },
      { icon: '2', title: 'Clean before asepsis', detail: 'Protect clean procedures and invasive-device work.' },
      { icon: '3', title: 'Clean after exposure', detail: 'Body fluids, environment, and glove removal reset the moment.' },
      { icon: '4', title: 'Repeat if touched', detail: 'A contaminated phone, zipper, or faucet requires another cycle.' },
    ],
    clinicalTip: `Track your fingertips. The phone, bag zipper, pen, faucet, and supply wrapper can undo correct hand hygiene in one touch.`,
    embeddedCheck: {
      prompt: `After ABHR dries, the worker touches a used phone before an aseptic task. What happens next?`,
      answer: `Perform hand hygiene again. The phone contact created a new contamination opportunity; clean hands must be restored before the aseptic task.`,
    },
    sourceLabels: [
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4.2, 6.1.1, 6.1.3' },
      { kind: 'Recommended practice', text: 'CDC Core IPC §5a' },
      { kind: 'Recommended practice', text: 'CDC Clinical Safety: Hand Hygiene' },
      { kind: 'Care Indeed addendum', text: 'Bag Technique Corridor §6-013' },
    ],
    sceneImage: img02,
    imageAlt: `A home-health clinician washes both hands at a residential sink while an older patient waits; soap, paper towels, alcohol hand rub, gloves, and a removed wristwatch are visible.`,
    hotspots: [
      {
        id: 'l2-sink', label: 'Hands under running water', shortLabel: 'Soap & Water', x: 33, y: 68, kind: 'safe',
        info: `The clinician washes every hand surface under running water.`,
        meaning: `Soap and water are required for visible soil and Care Indeed’s organism-specific indications.`,
        action: `Scrub all surfaces, rinse, dry safely, and avoid immediate recontamination.`,
        document: `Record required teaching/audit data or any barrier and resolution.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC Clinical Safety: Hand Hygiene'],
      },
      {
        id: 'l2-soap', label: 'Liquid soap at the sink', shortLabel: 'Method Choice', x: 10, y: 69, kind: 'observe',
        info: `Liquid soap is available at the sink.`,
        meaning: `Method follows soil, organism-specific policy, and access—not convenience.`,
        action: `Use soap/water when indicated; otherwise use approved ABHR for routine moments.`,
        document: `Record an unavailable method, unsafe substitution, or unresolved barrier.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC Core IPC §5a'],
      },
      {
        id: 'l2-abhr', label: 'Alcohol-based hand rub on the clean counter', shortLabel: 'ABHR', x: 70, y: 75, kind: 'safe',
        info: `Alcohol-based hand rub is available on the clean counter.`,
        meaning: `Care Indeed prefers approved ABHR with at least 60% alcohol when appropriate.`,
        action: `Use the label amount, cover every surface, and rub until dry.`,
        document: `Record a product, access, technique, or teaching variance when required.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC Clinical Safety: Hand Hygiene'],
      },
      {
        id: 'l2-gloves', label: 'Unopened glove box', shortLabel: 'Gloves ≠ Hygiene', x: 69, y: 88, kind: 'verify',
        info: `Clean gloves are staged but not yet donned.`,
        meaning: `Gloves neither replace hand hygiene nor prevent contamination between tasks.`,
        action: `Clean and dry hands, use task-specific gloves, remove safely, and clean hands again.`,
        document: `Record PPE barriers, technique breaks, correction, or exposure.`,
        policyRefs: ['CL-SD-016 §§4.2, 4.4', 'CDC Core IPC §5d'],
      },
      {
        id: 'l2-watch', label: 'Wristwatch removed from the care sequence', shortLabel: 'Common Misses', x: 91, y: 88, kind: 'observe',
        info: `The wristwatch is outside the handwashing splash zone.`,
        meaning: `Personal items can block coverage or recontaminate clean hands.`,
        action: `Follow agency requirements and clean thumbs, fingertips, webs, nails, and wrists.`,
        document: `Record a policy, skin-integrity, or technique barrier when applicable.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC Clinical Safety: Hand Hygiene'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Match PPE',
    title: 'Match PPE to the Exposure',
    subtitle: 'Select barriers for the task, then remove them without carrying contamination forward.',
    overview: [
      `Begin with one question: what could contact your hands, clothing, eyes, nose, mouth, or respiratory tract during this task? Select PPE for that anticipated exposure and the documented precaution plan. Choosing PPE only from a diagnosis—or wearing gloves for everything—misses the actual route.`,
      `Gloves protect against anticipated contact with blood, body fluids, mucous membranes, non-intact skin, and contaminated items. Add a task-appropriate gown when clothing or skin may be exposed, and approved eye protection with a procedure mask or face shield when splash or spray is reasonably anticipated.`,
      `A procedure mask and a fit-tested respirator are not interchangeable. A respirator is used only when the documented airborne/ATD plan requires it and the worker has the required medical clearance, fit test, training, and assignment. This module teaches recognition and safe escalation; it does not provide respirator qualification or fit testing.`,
    ],
    details: [
      {
        heading: 'Match the barrier to the route',
        bullets: [
          `Intact-skin contact with no body-fluid exposure: follow current Care Indeed masking direction and hand hygiene; gloves are not automatically required solely because care is occurring.`,
          `Blood, body fluids, mucosa, non-intact skin, or a contaminated item: wear gloves and add clothing/face protection when contact, splash, or spray is possible.`,
          `Wound irrigation or another splash-risk task: gloves, a task-appropriate gown, and approved eye/face protection are needed in addition to the required mask.`,
          `Contact, Droplet, or Airborne/ATD precautions: follow the current documented patient plan and agency direction; do not independently design or downgrade precautions.`,
        ],
      },
      {
        heading: 'Care Indeed masking rule',
        paragraphs: [
          `The supplied RM-OS-002 policy currently requires a surgical/procedure mask for all field visits. That is a stricter Care Indeed occupational-safety rule, not a universal CDC or federal minimum. Because respiratory guidance can change, follow the current approved agency rule at the time of the visit. Add gloves, gown, eye protection, or a respirator according to the task and documented precautions.`,
          `A procedure mask may support source control, droplet protection, and splash protection as directed. It does not create a seal and is not a substitute for respiratory protection when the plan requires a NIOSH-approved, fit-tested respirator.`,
        ],
      },
      {
        heading: 'Don clean; doff without self-contamination',
        paragraphs: [
          `One common donning sequence is hand hygiene, gown, mask or respirator, goggles or face shield, then gloves over the gown cuffs. A common removal sequence is gloves, eye protection handled from the back, gown turned contaminated-side inward, then mask by the ties or loops. A respirator is removed only at the location and time directed by the applicable plan. Perform hand hygiene immediately after removal and between steps if hands become contaminated.`,
          `The exact sequence must fit the PPE configuration and current agency training. Never touch the front of used PPE, wear used PPE into the clean supply zone, reuse single-use PPE, or remove eye protection by grasping its contaminated front.`,
        ],
      },
      {
        heading: 'Respiratory hygiene and new symptoms',
        bullets: [
          `Ask a symptomatic person to cover coughs and sneezes with a tissue or elbow and discard tissues safely.`,
          `Offer or use source-control measures as tolerated and directed; increase separation or ventilation when safe and consistent with the plan.`,
          `Clean hands after contact with respiratory secretions and frequently touched objects.`,
          `Report a new cough, diarrhea, rash, or other transmissible-disease signal so an authorized clinician can determine whether the plan must change.`,
        ],
      },
    ],
    keyPoints: [
      { icon: '🔎', title: 'Predict exposure', detail: 'Ask which body surface or respiratory route could be reached.' },
      { icon: '🧤', title: 'Don before risk', detail: 'Put on the full task-matched set before exposure begins.' },
      { icon: '↔️', title: 'Touch clean-to-clean', detail: 'Keep contaminated PPE away from face, clothing, phone, and bag.' },
      { icon: '🧼', title: 'Doff and clean', detail: 'Remove from clean sides/back and finish with hand hygiene.' },
    ],
    clinicalTip: `The most contaminated PPE surface is often the part a learner instinctively grabs. Remove from the back or clean side, and clean hands whenever the sequence is broken.`,
    embeddedCheck: {
      prompt: `A worker expects wound-irrigation splash. Are gloves plus the agency-required procedure mask enough?`,
      answer: `No. Add task-appropriate clothing protection and approved eye/face protection. A respirator is not the answer unless a respiratory hazard and the documented plan require it.`,
    },
    sourceLabels: [
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§4.3–4.4, 6.1–6.2' },
      { kind: 'Care Indeed policy', text: 'RM-OS-002 §§5.3–5.5, 6.2–6.3' },
      { kind: 'Recommended practice', text: 'CDC Core IPC §§5d–5e, 6' },
      { kind: 'California boundary', text: '8 CCR §§5144, 5199 · M11 owns depth' },
    ],
    sceneImage: img03,
    imageAlt: `A home-health clinician stages a disposable gown, gloves, procedure mask, protective eyewear, hand sanitizer, and a lined waste bin on a clean table before care.`,
    hotspots: [
      {
        id: 'l3-gown', label: 'Disposable gown held from the clean side', shortLabel: 'Protect Clothing', x: 52, y: 48, kind: 'safe',
        info: `The clinician holds a clean gown before anticipated exposure.`,
        meaning: `A gown protects skin and clothing when contact or splash is expected.`,
        action: `Don before exposure, secure coverage, glove over cuffs, and doff inward.`,
        document: `Record PPE barriers, variance, exposure, or required precautions.`,
        policyRefs: ['CL-SD-016 §4.4', 'CDC Core IPC §5d'],
      },
      {
        id: 'l3-gloves', label: 'Clean gloves matched to the task', shortLabel: 'Gloves', x: 22, y: 84, kind: 'safe',
        info: `A glove box is staged in the clean preparation zone.`,
        meaning: `Task-specific gloves protect expected contact but never replace hand hygiene.`,
        action: `Don with clean, dry hands; change between dirty and clean tasks; doff safely.`,
        document: `Record missing PPE, technique breaks, correction, or exposure.`,
        policyRefs: ['CL-SD-016 §§4.2, 4.4', '8 CCR §5193(d)(3)'],
      },
      {
        id: 'l3-face', label: 'Procedure mask and approved eye protection', shortLabel: 'Protect Face', x: 61, y: 86, kind: 'safe',
        info: `A procedure mask and protective goggles are staged together.`,
        meaning: `Splash can reach eyes, nose, and mouth; ordinary glasses may not protect.`,
        action: `Use task-matched face/eye protection and remove from the clean side.`,
        document: `Record unavailable protection, a contamination break, or exposure.`,
        policyRefs: ['CL-SD-016 §4.4', 'CDC Core IPC §5d'],
      },
      {
        id: 'l3-hands', label: 'Hand hygiene before donning', shortLabel: 'Hands First', x: 79, y: 80, kind: 'safe',
        info: `Hand sanitizer is positioned before the PPE sequence.`,
        meaning: `Clean, dry hands protect the inner surfaces and integrity of PPE.`,
        action: `Clean and dry before donning; repeat after doffing or contamination.`,
        document: `Record a hand-hygiene/PPE barrier, correction, or exposure.`,
        policyRefs: ['CL-SD-016 §4.2', 'CDC PPE sequence'],
      },
      {
        id: 'l3-waste', label: 'Lined disposal bin near the exit path', shortLabel: 'Doffing Route', x: 90, y: 67, kind: 'verify',
        info: `A lined bin is near the planned doffing route.`,
        meaning: `Used PPE must not cross the clean zone; waste routing is item-specific.`,
        action: `Plan doffing and containment before care; never improvise a route.`,
        notify: `Report missing PPE or an unsafe doffing/containment setup before exposure-risk care.`,
        document: `Record the barrier, protection, notification, direction, and visit change.`,
        policyRefs: ['CL-SD-016 §6.1.2', 'RM-PS-002 §§4–5'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Bag Technique',
    title: 'Keep the Clinical Bag Clean',
    subtitle: 'The bag is a clean supply zone only if you protect it at every handoff.',
    overview: [
      `The clinical bag moves between homes, so each visit must protect its clean interior. Plan the task before entry and carry only needed, intact, in-date supplies. Keep the bag closed until you have selected a clean, dry, hard surface, placed the required disposable barrier, and cleaned your hands.`,
      `Remove the supplies you expect to use and close the bag during care. Work from clean tasks and supplies toward dirty tasks. A glove used in patient care never touches the bag, a clean wrapper, a phone, or a pen. If you need another item, reset the sequence rather than reaching in.`,
      `Nothing dirty returns. Used single-use items follow the correct disposal stream. Reusable equipment remains outside the clean bag until it has been cleaned and disinfected according to both the device instructions and disinfectant label, including complete wet contact time, and is fully dry.`,
    ],
    details: [
      {
        heading: 'Seven-step clean-to-dirty sequence',
        bullets: [
          `Plan the task and supplies; keep the bag protected and closed before setup.`,
          `Choose a clean, dry, hard surface. Never place the bag on a floor, bed, or upholstered furniture.`,
          `Place a clean disposable barrier under the bag and perform hand hygiene before opening it.`,
          `Remove anticipated supplies to the clean side and close the bag during care.`,
          `Perform care from clean toward dirty, protecting the bag from gloves and used equipment.`,
          `Contain sharps/waste at point of use and fully reprocess reusable items before clean storage.`,
          `Clean hands, discard the barrier without touching the bag, and close/secure the bag.`,
        ],
      },
      {
        heading: 'When you need one more item',
        paragraphs: [
          `Pause the task. Remove gloves and other PPE safely as applicable. Perform hand hygiene. Retrieve the item with clean hands, close the bag, then don new PPE if the task requires it. Asking the caregiver to search the bag or using the “cleaner” gloved hand transfers contamination into the supply zone.`,
          `Careful planning reduces re-entry, but the safe reset matters more than pretending an unexpected need will never occur.`,
        ],
      },
      {
        heading: 'Bag maintenance and higher-risk visits',
        paragraphs: [
          `The supplied Care Indeed corridor addendum calls for exterior decontamination at least weekly and whenever visibly soiled, with the applicable cleaning log and observed competency. It also directs staff, for identified higher-risk or isolation visits, to secure the main bag in the vehicle and carry only needed supplies in a disposable bag. Follow the current approved version and preserve medication/device temperature, sterility, security, and manufacturer storage requirements.`,
          `The addendum currently shares the policy identifier RM-ER-002 with a different incident-reporting policy. Until governance resolves that collision, the source is identified in this module by its full title and Corridor §6-013. Bag-technique skill validation requires direct observation outside this e-learning module.`,
        ],
      },
    ],
    keyPoints: [
      { icon: '▭', title: 'Barrier under bag', detail: 'Use a clean, dry, hard surface—not floor, bed, or upholstery.' },
      { icon: '🧼', title: 'Hands before entry', detail: 'Clean hands before opening or re-entering the bag.' },
      { icon: '🔒', title: 'Close during care', detail: 'Protect the clean interior while exposure-risk work occurs.' },
      { icon: '↩️', title: 'Nothing dirty returns', detail: 'Reprocess reusable equipment completely before clean storage.' },
    ],
    clinicalTip: `Needing “one more item” is a predictable contamination point. Plan the task, but when it happens, reset the sequence instead of reaching in with used gloves.`,
    embeddedCheck: {
      prompt: `Mid-dressing change, you need extra tape from the closed bag while wearing used gloves. What is the safe reset?`,
      answer: `Remove gloves safely, perform hand hygiene, retrieve the tape, close the bag, and put on new gloves if the task requires them. Do not ask the caregiver to search the bag.`,
    },
    sourceLabels: [
      { kind: 'Care Indeed addendum', text: 'Bag Technique Corridor §6-013 steps 1–9' },
      { kind: 'Care Indeed policy', text: 'CL-SD-016 §§6.1.3, 6.1.5' },
      { kind: 'Recommended practice', text: 'CDC Core IPC §§5b, 5f' },
      { kind: 'Accreditation crosswalk', text: 'ACHC HH7-1A / HH7-2A.01 topic map' },
    ],
    sceneImage: img04,
    imageAlt: `A home-health clinician disinfects a stethoscope beside an organized navy nursing bag on a disposable barrier over a hard dining table; sanitizer, clean supplies, and a sealed discard pouch are separated.`,
    hotspots: [
      {
        id: 'l4-barrier', label: 'Clean disposable barrier on a hard table', shortLabel: 'Clean Work Zone', x: 45, y: 83, kind: 'safe',
        info: `The bag sits on a disposable barrier over a dry, hard table.`,
        meaning: `The barrier defines the protected zone; it does not make unsuitable surfaces safe.`,
        action: `Inspect, place without contamination, and keep clean supplies inside the zone.`,
        notify: `Pause if no safe hard work surface can be established.`,
        document: `Record the barrier, direction, and resulting visit change.`,
        policyRefs: ['Bag Technique Corridor §6-013 step 1', 'CL-SD-016 §6.6'],
      },
      {
        id: 'l4-hands', label: 'Hand hygiene before bag entry', shortLabel: 'Hands Before Bag', x: 18, y: 73, kind: 'safe',
        info: `Alcohol-based hand rub is at the clean setup.`,
        meaning: `Contaminated hands can transfer organisms to every bagged supply.`,
        action: `Clean hands before opening or re-entry; let ABHR dry fully.`,
        document: `Record any access, technique, or contamination variance.`,
        policyRefs: ['Bag Technique Corridor §6-013 steps 2–4', 'CL-SD-016 §4.2'],
      },
      {
        id: 'l4-bag', label: 'Organized nursing bag on the barrier', shortLabel: 'Protected Bag', x: 63, y: 55, kind: 'safe',
        info: `The organized bag holds separated, intact clean supplies.`,
        meaning: `Closing during care protects the interior from gloves, splashes, and traffic.`,
        action: `Remove anticipated supplies, close the bag, and use a clean-hands reset before re-entry.`,
        document: `Record suspected bag contamination and the corrective action.`,
        policyRefs: ['Bag Technique Corridor §6-013 steps 3–5'],
      },
      {
        id: 'l4-equipment', label: 'Stethoscope being disinfected before return', shortLabel: 'Reprocess First', x: 50, y: 49, kind: 'verify',
        info: `The clinician reprocesses a stethoscope before clean storage.`,
        meaning: `It remains used until the IFU/label process and drying are complete.`,
        action: `Keep it outside the bag and follow the full label contact time.`,
        document: `Complete required logs and record breaks, exposure, or equipment barriers.`,
        policyRefs: ['CL-SD-016 §6.1.5', 'CDC Core IPC §5f', 'EPA label directions'],
      },
      {
        id: 'l4-discard', label: 'Sealed discard pouch outside the clean zone', shortLabel: 'Dirty Stays Out', x: 84, y: 82, kind: 'safe',
        info: `Used disposable materials are contained away from the clean bag.`,
        meaning: `Single-use items stay out; containment follows actual waste and leakage risk.`,
        action: `Use the current item-specific agency route at the point of generation.`,
        notify: `Ask the supervisor when classification or routing is unclear.`,
        document: `Record waste variance, spill, exposure, or unresolved routing barrier.`,
        policyRefs: ['RM-PS-002 §§4–5.3', '8 CCR §5193(d)(3)'],
      },
    ],
  },
];

const PAGES: PageData[] = [...BASE_PAGES, ...EXTRA_PAGES].sort((a, b) => a.id - b.id);

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>
        {page.shortName} · {pageIndex + 1} of {total}
      </div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeStrong, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      {page.overview.map((paragraph, index) => (
        <p key={index} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>
      ))}

      <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', margin: '4px 0 16px' }}>
        <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {page.details.map((section) => (
            <section key={section.heading} style={{ marginBottom: 18 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.4, color: CI.teal }}>{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => <p key={index} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
              {section.bullets && (
                <ul style={{ margin: '0 0 10px', paddingLeft: 22, color: '#524C4B' }}>
                  {section.bullets.map((bullet, index) => <li key={index} style={{ marginBottom: 7, fontSize: 16, lineHeight: 1.55 }}>{bullet}</li>)}
                </ul>
              )}
              {section.callout && <div style={{ padding: 12, borderRadius: 10, background: CI.tealSoft, borderLeft: `4px solid ${CI.teal}`, fontSize: 16, lineHeight: 1.55, color: CI.ink }}>{section.callout}</div>}
            </section>
          ))}
          <div style={{ padding: 14, borderRadius: 12, background: '#FFF3EC', border: '1px solid #F6C7A8' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeStrong, marginBottom: 6 }}>Check your judgment</div>
            <div style={{ fontSize: 16, lineHeight: 1.55, color: CI.ink, fontWeight: 700, marginBottom: 8 }}>{page.embeddedCheck.prompt}</div>
            <details>
              <summary style={{ color: CI.teal, fontWeight: 800, fontSize: 13, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>Reveal the safe response</summary>
              <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.6, color: '#524C4B' }}>{page.embeddedCheck.answer}</p>
            </details>
          </div>
        </div>
      </details>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((point) => (
          <div key={point.title} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden="true">{point.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{point.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{point.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeStrong, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Lesson sources">
        {page.sourceLabels.map((source) => (
          <span key={source.kind + source.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{source.kind}: {source.text}</span>
        ))}
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData;
  completed: string[];
  setCompleted: (ids: string[]) => void;
  onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const progressId = useId();
  const active = page.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const validCompleted = completed.filter((id) => page.hotspots.some((hotspot) => hotspot.id === id));
  const done = page.hotspots.length > 0 && validCompleted.length === page.hotspots.length;
  const nextIncomplete = page.hotspots.find((hotspot) => !validCompleted.includes(hotspot.id));

  useEffect(() => { setActiveId(null); }, [page.id]);

  return (
    <div className="achcm05-stage-wrap">
      <div className="achcm05-stage" role="region" aria-label={`${page.title} interactive home-health scene`}>
        <img className="scene" src={page.sceneImage} alt={page.imageAlt} draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeStrong }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {validCompleted.length} / {page.hotspots.length} observed
        </div>

        {page.hotspots.map((hotspot) => {
          const isDone = validCompleted.includes(hotspot.id);
          const guided = !isDone && nextIncomplete?.id === hotspot.id;
          const control = CONTROL[hotspot.kind];
          return (
            <button
              key={hotspot.id}
              type="button"
              className={`achcm05-hotspot ${isDone ? 'done' : ''} ${guided ? 'guided' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={isDone ? `${hotspot.label} — observed` : `Investigate ${hotspot.label}`}
              aria-describedby={progressId}
              onClick={(event) => { triggerRef.current = event.currentTarget; setActiveId(hotspot.id); }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : control.color }}>
                {guided && <span className="ping" aria-hidden="true" />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <span style={{ fontSize: 15 }} aria-hidden="true">?</span>}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
              {isDone && <span className="achcm05-sr-only">Completed</span>}
            </button>
          );
        })}

        <div id={progressId} className="achcm05-live" aria-live="polite">
          {validCompleted.length} of {page.hotspots.length} scene objects observed
        </div>

        <button type="button" aria-label={`Reset ${page.shortName} lesson progress`} onClick={() => setCompleted([])}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>

        {done && !activeId && (
          <div className="achcm05-complete-overlay achcm05-rm-transition" style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'achcm05-pop .3s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 390, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Practice Complete</div>
              <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario practice complete. Knowledge practice does not replace role-specific instruction or observed competency validation.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orangeStrong, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
              )}
            </div>
          </div>
        )}

        {active && (
          <ClinicalFeedbackOverlay
            hotspot={active}
            onClose={() => setActiveId(null)}
            onComplete={() => {
              if (!validCompleted.includes(active.id)) setCompleted([...validCompleted, active.id]);
              setActiveId(null);
            }}
            triggerRef={triggerRef}
          />
        )}
      </div>
    </div>
  );
}

type QuizSnapshot = {
  answers: (number | null)[];
  idx: number;
  finished: boolean;
  selected: number | null;
  submitted: boolean;
};

function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  attemptCount,
  bestScore,
  onAttemptComplete,
  onPersist,
}: {
  onBack: () => void;
  initialAnswers: (number | null)[];
  initialIdx: number;
  initialFinished: boolean;
  initialSelected: number | null;
  initialSubmitted: boolean;
  attemptCount: number;
  bestScore: number;
  onAttemptComplete: (score: number) => void;
  onPersist: (state: QuizSnapshot) => void;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const [selected, setSelected] = useState<number | null>(initialSelected);
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [answers, setAnswers] = useState<(number | null)[]>(initialAnswers);
  const [finished, setFinished] = useState(initialFinished);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const finishingRef = useRef(false);
  const question = QUIZ[idx];
  const isCorrect = selected === question.correct;
  const score = useMemo(() => answers.reduce<number>((total, answer, questionIndex) => total + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0), [answers]);
  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = score >= 8;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted });
  }, [answers, idx, finished, onPersist, selected, submitted]);

  const focusOption = (optionIndex: number) => {
    setSelected(optionIndex);
    window.requestAnimationFrame(() => optionRefs.current[optionIndex]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const nextAnswers = [...answers];
      nextAnswers[idx] = selected;
      setAnswers(nextAnswers);
      setSubmitted(true);
      return;
    }
    if (idx === QUIZ.length - 1) {
      if (finishingRef.current) return;
      finishingRef.current = true;
      onAttemptComplete(score);
      setFinished(true);
      return;
    }
    const nextIndex = idx + 1;
    setIdx(nextIndex);
    setSelected(answers[nextIndex]);
    setSubmitted(answers[nextIndex] !== null);
  };

  const startRetake = () => {
    finishingRef.current = false;
    setIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers(Array(QUIZ.length).fill(null));
    setFinished(false);
    window.requestAnimationFrame(() => optionRefs.current[0]?.focus());
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <div className="achcm05-quiz-page" role="tabpanel" id="achcm05-panel-quiz" aria-labelledby="achcm05-tab-quiz">
        <div className="achcm05-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: passed ? CI.teal : CI.orangeStrong, marginBottom: 8 }}>{passed ? 'Knowledge Check Passed' : 'Attempt complete — not yet passed'}</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="achcm05-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orangeStrong }}>{percent}%</div><div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div></div>
            </div>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: passed ? CI.teal : CI.orangeStrong, margin: '0 0 8px' }}>{passed ? 'Safe decisions, clearly defended' : 'Review, reset, and retake'}</h1>
          <p style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, margin: '0 auto 18px', maxWidth: 520 }}>
            {passed
              ? 'You passed the annual knowledge check. Continue to follow your role, current plan/order, agency policy, and required observed competencies.'
              : 'This attempt is finished, but the 80% passing threshold was not met. Review and retake; no completion is reported.'}
          </p>
          <div style={{ fontSize: 12, color: CI.muted, marginBottom: 18 }}>Attempts completed: {attemptCount} · Best score: {Math.max(bestScore, score)}/{QUIZ.length}</div>
          <div className="achcm05-result-grid">
            {[
              { label: 'Clean hands', tip: 'Use the right method at the right moment', color: CI.teal },
              { label: 'Match the exposure', tip: 'Select PPE and controls from the task', color: CI.orange },
              { label: 'Close the loop', tip: 'Protect, notify, teach, and document', color: '#385E8D' },
            ].map((item) => (
              <div key={item.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{item.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{item.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={startRetake} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orangeStrong, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achcm05-quiz-page" role="tabpanel" id="achcm05-panel-quiz" aria-labelledby="achcm05-tab-quiz">
      <div className="achcm05-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Compass size={18} /><span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Infection-Control Judgment Check</span></div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="achcm05-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}><span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span></div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}><Sparkles size={13} /> Scenario {idx + 1}</div>
          <h1 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{question.stem}</h1>

          <div role="radiogroup" aria-label={`Answer choices for question ${idx + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(event) => {
              if (submitted) return;
              const targetIndex = optionRefs.current.indexOf(event.target as HTMLButtonElement);
              const current = targetIndex >= 0 ? targetIndex : (selected ?? 0);
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); focusOption((current + 1) % question.options.length); }
              else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); focusOption((current - 1 + question.options.length) % question.options.length); }
              else if (event.key === 'Home') { event.preventDefault(); focusOption(0); }
              else if (event.key === 'End') { event.preventDefault(); focusOption(question.options.length - 1); }
              else if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); focusOption(current); }
            }}>
            {question.options.map((option, optionIndex) => {
              const checked = selected === optionIndex;
              let border: string = CI.border;
              let background: string = '#fff';
              let letterBackground: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && optionIndex === question.correct) { border = CI.teal; background = CI.tealSoft; letterBackground = CI.teal; letterColor = '#fff'; }
              else if (submitted && checked && !isCorrect) { border = CI.red; background = '#FEF2F2'; letterBackground = CI.red; letterColor = '#fff'; }
              else if (checked) { border = CI.teal; background = '#F3FBFA'; letterBackground = CI.teal; letterColor = '#fff'; }
              return (
                <button key={optionIndex} type="button" role="radio" aria-checked={checked} aria-disabled={submitted}
                  ref={(element) => { optionRefs.current[optionIndex] = element; }}
                  tabIndex={checked || (selected === null && optionIndex === 0) ? 0 : -1}
                  onClick={() => { if (!submitted) setSelected(optionIndex); }}
                  style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 48 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBackground, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[optionIndex]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{option}</span>
                  {submitted && optionIndex === question.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Correct option" />}
                  {submitted && checked && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Selected option is incorrect" />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div aria-live="polite" style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeStrong, marginBottom: 6 }}>{isCorrect ? 'Correct judgment' : 'Recalibrate'}</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{question.rationale}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }} aria-label="Question sources">
                {question.sourceRefs.map((source) => <span key={source} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: '#fff', color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{source}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orangeStrong, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? .5 : 1 }}>
              {submitted ? (idx === QUIZ.length - 1 ? 'See results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'achc-art-m05-progress-v1';

type Persisted = {
  version: 1;
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers: (number | null)[];
  quizIdx: number;
  quizFinished: boolean;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizAttemptCount: number;
  quizBestScore: number;
  quizLastScore: number;
  quizPassed: boolean;
};

const DEFAULT_PROGRESS: Persisted = {
  version: 1,
  pageIndex: 0,
  mode: 'lessons',
  completedByPage: {},
  quizAnswers: Array(QUIZ.length).fill(null),
  quizIdx: 0,
  quizFinished: false,
  quizSelected: null,
  quizSubmitted: false,
  quizAttemptCount: 0,
  quizBestScore: 0,
  quizLastScore: 0,
  quizPassed: false,
};

function boundedInteger(value: unknown, minimum: number, maximum: number, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function validateProgress(value: unknown): Persisted {
  if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) return { ...DEFAULT_PROGRESS, quizAnswers: [...DEFAULT_PROGRESS.quizAnswers] };
  const candidate = value as Partial<Persisted>;
  const pageIndex = boundedInteger(candidate.pageIndex, 0, PAGES.length - 1, 0);
  const quizIdx = boundedInteger(candidate.quizIdx, 0, QUIZ.length - 1, 0);
  const quizAnswers = Array.from({ length: QUIZ.length }, (_, index) => {
    const answer = Array.isArray(candidate.quizAnswers) ? candidate.quizAnswers[index] : null;
    return typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < 4 ? answer : null;
  });
  const rawSelected = candidate.quizSelected;
  const quizSelected = typeof rawSelected === 'number' && Number.isInteger(rawSelected) && rawSelected >= 0 && rawSelected < 4 ? rawSelected : null;
  const quizSubmitted = candidate.quizSubmitted === true && quizAnswers[quizIdx] !== null;
  const quizFinished = candidate.quizFinished === true && quizAnswers.every((answer) => answer !== null);
  const completedByPage: Record<number, string[]> = {};
  if (candidate.completedByPage && typeof candidate.completedByPage === 'object') {
    for (const page of PAGES) {
      const rawIds = (candidate.completedByPage as Record<number, unknown>)[page.id];
      if (!Array.isArray(rawIds)) continue;
      const allowed = new Set(page.hotspots.map((hotspot) => hotspot.id));
      completedByPage[page.id] = [...new Set(rawIds.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
    }
  }
  const quizAttemptCount = boundedInteger(candidate.quizAttemptCount, 0, 1_000_000, 0);
  const quizBestScore = boundedInteger(candidate.quizBestScore, 0, QUIZ.length, 0);
  const quizLastScore = boundedInteger(candidate.quizLastScore, 0, QUIZ.length, 0);
  return {
    version: 1,
    pageIndex,
    mode: candidate.mode === 'quiz' ? 'quiz' : 'lessons',
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished,
    quizSelected: quizSubmitted ? quizAnswers[quizIdx] : quizSelected,
    quizSubmitted,
    quizAttemptCount,
    quizBestScore,
    quizLastScore,
    quizPassed: quizBestScore >= 8,
  };
}

function loadProgress(): Persisted {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS, quizAnswers: [...DEFAULT_PROGRESS.quizAnswers] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? validateProgress(JSON.parse(raw)) : { ...DEFAULT_PROGRESS, quizAnswers: [...DEFAULT_PROGRESS.quizAnswers] };
  } catch {
    return { ...DEFAULT_PROGRESS, quizAnswers: [...DEFAULT_PROGRESS.quizAnswers] };
  }
}

function saveProgress(data: Persisted) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* private mode or storage quota */ }
}

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

export default function ACHCARTM05() {
  const [initial] = useState(loadProgress);
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial.mode);
  const [pageIndex, setPageIndex] = useState(initial.pageIndex);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial.completedByPage);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial.quizAnswers);
  const [quizIdx, setQuizIdx] = useState(initial.quizIdx);
  const [quizFinished, setQuizFinished] = useState(initial.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial.quizSelected);
  const [quizSubmitted, setQuizSubmitted] = useState(initial.quizSubmitted);
  const [quizAttemptCount, setQuizAttemptCount] = useState(initial.quizAttemptCount);
  const [quizBestScore, setQuizBestScore] = useState(initial.quizBestScore);
  const [quizLastScore, setQuizLastScore] = useState(initial.quizLastScore);
  const [quizPassed, setQuizPassed] = useState(initial.quizPassed);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const page = PAGES[pageIndex];
  const completed = completedByPage[page.id] ?? [];

  const snapshot = useCallback((patch?: Partial<Persisted>): Persisted => ({
    version: 1,
    pageIndex,
    mode,
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished,
    quizSelected,
    quizSubmitted,
    quizAttemptCount,
    quizBestScore,
    quizLastScore,
    quizPassed,
    ...patch,
  }), [completedByPage, mode, pageIndex, quizAnswers, quizAttemptCount, quizBestScore, quizFinished, quizIdx, quizLastScore, quizPassed, quizSelected, quizSubmitted]);

  useEffect(() => { saveProgress(snapshot()); }, [snapshot]);

  const activateTab = (tabIndex: number) => {
    if (tabIndex === PAGES.length) setMode('quiz');
    else { setMode('lessons'); setPageIndex(tabIndex); }
  };

  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    const totalTabs = PAGES.length + 1;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % totalTabs;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + totalTabs) % totalTabs;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = totalTabs - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateTab(nextIndex);
    window.requestAnimationFrame(() => tabRefs.current[nextIndex!]?.focus());
  };

  const handleQuizPersist = useCallback((state: QuizSnapshot) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
  }, []);

  const handleAttemptComplete = useCallback((score: number) => {
    setQuizAttemptCount((count) => count + 1);
    setQuizLastScore(score);
    setQuizBestScore((best) => Math.max(best, score));
    if (score >= 8) setQuizPassed(true);
  }, []);

  const handleSaveExit = () => {
    saveProgress(snapshot());
    if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
  };

  const panelId = mode === 'quiz' ? 'achcm05-panel-quiz' : `achcm05-panel-${page.id}`;

  return (
    <div className="achcm05 achcm05-shell" role="main" aria-label={`${MODULE_META.id}: ${MODULE_META.title}`}>
      <style>{STYLES}</style>
      <div className="achcm05-top">
        <div className="achcm05-brand"><BrandMark size={28} /><span className="brand-text">Care Indeed · M05</span></div>
        <div className="achcm05-tabs" role="tablist" aria-label="Module lessons and knowledge check">
          {PAGES.map((tabPage, index) => {
            const selected = mode === 'lessons' && index === pageIndex;
            return (
              <button key={tabPage.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab"
                id={`achcm05-tab-${tabPage.id}`} aria-controls={`achcm05-panel-${tabPage.id}`} aria-selected={selected} tabIndex={selected ? 0 : -1}
                className={`achcm05-tab ${selected ? 'active' : ''}`} onClick={() => activateTab(index)} onKeyDown={(event) => handleTabKey(event, index)}>
                {tabPage.shortName}
              </button>
            );
          })}
          <button ref={(element) => { tabRefs.current[PAGES.length] = element; }} type="button" role="tab" id="achcm05-tab-quiz" aria-controls="achcm05-panel-quiz"
            aria-selected={mode === 'quiz'} tabIndex={mode === 'quiz' ? 0 : -1} className={`achcm05-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => activateTab(PAGES.length)} onKeyDown={(event) => handleTabKey(event, PAGES.length)}>Knowledge Check</button>
        </div>
        <button type="button" className="achcm05-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </div>

      {mode === 'quiz' ? (
        <QuizPage onBack={() => setMode('lessons')} initialAnswers={quizAnswers} initialIdx={quizIdx} initialFinished={quizFinished}
          initialSelected={quizSelected} initialSubmitted={quizSubmitted} attemptCount={quizAttemptCount} bestScore={quizBestScore}
          onAttemptComplete={handleAttemptComplete} onPersist={handleQuizPersist} />
      ) : (
        <div className="achcm05-work" role="tabpanel" id={panelId} aria-labelledby={`achcm05-tab-${page.id}`}>
          <aside className="achcm05-left" aria-label={`${page.shortName} lesson content`}><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
          <section className="achcm05-right" aria-label={`${page.shortName} practice scene`}>
            <RightPanel page={page} completed={completed} setCompleted={(ids) => setCompletedByPage((previous) => ({ ...previous, [page.id]: ids }))} onGoQuiz={() => setMode('quiz')} />
          </section>
        </div>
      )}

      <div className="achcm05-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => { if (mode === 'quiz') setMode('lessons'); else setPageIndex((index) => Math.max(0, index - 1)); }}><ChevronLeft size={16} /> Prev</button>
        <div className="achcm05-footer-id" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          {mode === 'quiz' ? `Knowledge Check · ${QUIZ.length} items · ${MODULE_META.passing}% pass` : `Lesson ${pageIndex + 1} of ${PAGES.length} · ${page.shortName}`}
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => setPageIndex((index) => Math.min(PAGES.length - 1, index + 1))}>Next · {PAGES[pageIndex + 1]?.shortName} <ChevronRight size={16} /></button>
        )}
      </div>
    </div>
  );
}
