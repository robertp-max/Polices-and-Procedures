/**
 * ACHC-ART-M11 — Tuberculosis & Bloodborne Pathogens
 * Pass 5 production module | 7 lessons | 34 hotspots | 10-question Knowledge Check
 * Annual knowledge training only. This module does not authorize procedures,
 * replace role-specific competency validation, or provide respirator clearance.
 */
import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-exposure-control-plan.png';
import img02 from './assets/lesson-02-bloodborne-controls.png';
import img03 from './assets/lesson-03-sharps-specimens-biohazard.png';
import img04 from './assets/lesson-04-post-exposure-response.png';
import img05 from './assets/lesson-05-vaccination-rights-records.png';
import img06 from './assets/lesson-06-tb-respiratory-protection.png';
import img07 from './assets/lesson-07-combined-field-simulation.png';

const CI = {
  teal: '#0F5B54',
  tealSoft: '#EEF4F3',
  tealMuted: '#C8DFDC',
  orange: '#F26D33',
  orangeAccessible: '#C74612',
  orangeDark: '#A9380D',
  orangeSoft: '#FFF3EC',
  ink: '#2D3748',
  muted: '#64748B',
  border: '#E2E8F0',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  white: '#FFFFFF',
  bg: '#F8FAFC',
} as const;

const MODULE_META = {
  id: 'ACHC-ART-M11',
  title: 'Tuberculosis & Bloodborne Pathogens',
  lessonCount: 7,
  hotspotCount: 34,
  quizCount: 10,
  passingPercent: 80,
  requiredCorrect: 8,
  maxAttempts: 3,
  contentVersion: '1.0.0-pass5',
  questionBankVersion: 'm11-qb-1',
} as const;

const STORAGE_KEY = 'achc-art-m11-progress-v1';

type SafetyKind = 'protective' | 'caution' | 'hazard' | 'guidance';
type SourceKind = 'Care Indeed policy' | 'California requirement' | 'Federal requirement' | 'CDC guidance';

interface SourceRef {
  id: string;
  kind: SourceKind;
  label: string;
  url?: string;
}

interface KeyAction {
  icon: string;
  title: string;
  detail: string;
}

interface DetailSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  kind: SafetyKind;
  observed: string;
  why: string;
  action: string;
  notify?: string;
  document: string;
  sourceRefs: string[];
}

interface Lesson {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: [string, string, string];
  details: DetailSection[];
  keyActions: [KeyAction, KeyAction, KeyAction, KeyAction];
  clinicalTip: string;
  sourceRefs: string[];
  sceneImage: string;
  sceneAlt: string;
  hotspots: Hotspot[];
}

type QuestionMix = 'direct' | 'scenario' | 'documentation' | 'integrative';

interface QuizQuestion {
  id: number;
  mix: QuestionMix;
  competency: string;
  stem: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
  sourceRefs: string[];
}

const SOURCES: Record<string, SourceRef> = {
  'RM-OS-002': {
    id: 'RM-OS-002',
    kind: 'Care Indeed policy',
    label: 'RM-OS-002 · ATD Exposure Control Plan v1.0',
  },
  'RM-OS-003': {
    id: 'RM-OS-003',
    kind: 'Care Indeed policy',
    label: 'RM-OS-003 · Bloodborne Pathogen ECP v1.0',
  },
  'CL-SD-016': {
    id: 'CL-SD-016',
    kind: 'Care Indeed policy',
    label: 'CL-SD-016 · Infection Prevention & Control',
  },
  'RM-PS-002': {
    id: 'RM-PS-002',
    kind: 'Care Indeed policy',
    label: 'RM-PS-002 · Hazardous Materials & Waste',
  },
  'RM-ER-002': {
    id: 'RM-ER-002',
    kind: 'Care Indeed policy',
    label: 'RM-ER-002 · Incident Reporting & Investigation',
  },
  'HR-WM-003': {
    id: 'HR-WM-003',
    kind: 'Care Indeed policy',
    label: 'HR-WM-003 · Employee Health & Immunization',
  },
  '8CCR5193': {
    id: '8CCR5193',
    kind: 'California requirement',
    label: '8 CCR §5193 · Bloodborne Pathogens',
    url: 'https://www.dir.ca.gov/title8/5193.html',
  },
  '8CCR5199': {
    id: '8CCR5199',
    kind: 'California requirement',
    label: '8 CCR §5199 · Aerosol Transmissible Diseases',
    url: 'https://www.dir.ca.gov/title8/5199.html',
  },
  '8CCR5144': {
    id: '8CCR5144',
    kind: 'California requirement',
    label: '8 CCR §5144 · Respiratory Protection',
    url: 'https://www.dir.ca.gov/title8/5144.html',
  },
  '29CFR1910.1030': {
    id: '29CFR1910.1030',
    kind: 'Federal requirement',
    label: '29 CFR §1910.1030 · Bloodborne Pathogens',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1030',
  },
  'CDC-TB-SCREEN': {
    id: 'CDC-TB-SCREEN',
    kind: 'CDC guidance',
    label: 'CDC · TB screening for health care personnel',
    url: 'https://www.cdc.gov/tb-healthcare-settings/hcp/screening-testing/index.html',
  },
  'CDC-TB-SPREAD': {
    id: 'CDC-TB-SPREAD',
    kind: 'CDC guidance',
    label: 'CDC · How tuberculosis spreads',
    url: 'https://www.cdc.gov/tb/causes/index.html',
  },
  'CALOSHA-TB-FAQ': {
    id: 'CALOSHA-TB-FAQ',
    kind: 'California requirement',
    label: 'Cal/OSHA · TB testing requirements FAQ',
    url: 'https://www.dir.ca.gov/dosh/TB-testing.html',
  },
  'USPHS-2025': {
    id: 'USPHS-2025',
    kind: 'CDC guidance',
    label: '2025 USPHS · Occupational HIV exposure guidance',
    url: 'https://stacks.cdc.gov/view/cdc/183609',
  },
  'CDC-HCV': {
    id: 'CDC-HCV',
    kind: 'CDC guidance',
    label: 'CDC · Occupational HCV exposure guidance',
    url: 'https://www.cdc.gov/mmwr/volumes/69/rr/rr6906a1.htm',
  },
};

const LESSONS: Lesson[] = [
  {
    id: 0,
    shortName: 'Control Plans',
    title: 'Exposure Control Starts Before the Visit',
    subtitle: 'Two hazards, two routes, and a plan you can use under pressure',
    overview: [
      'Occupational exposure control begins before a worker touches a supply or enters a home. Care Indeed maintains a Bloodborne Pathogen Exposure Control Plan for blood and other potentially infectious materials, and a separate Aerosol Transmissible Disease plan for airborne hazards such as infectious tuberculosis. Both plans identify covered roles, tasks, controls, reporting routes, and medical follow-up.',
      'Bloodborne pathogens reach a worker through a specific route: a needlestick or cut, a splash to the eyes or mouth, or contact with non-intact skin. Tuberculosis is different. Infectious pulmonary or laryngeal TB can spread through shared air when an affected person coughs, speaks, or sings. Casual conversation does not transmit HBV, HCV, or HIV, and inactive TB is not contagious.',
      'Exposure determination is based on reasonably anticipated tasks without assuming PPE will prevent every event. Your assignment, order, competency, and agency plan still control what you may do.',
    ],
    details: [
      {
        heading: 'Read the task, then choose the plan',
        paragraphs: [
          'Before a visit, identify tasks that could place blood, OPIM, or respiratory secretions in your breathing zone or against vulnerable skin and mucous membranes. A wound-care visit may require the BBP plan; a referral noting prolonged cough and possible pulmonary TB may activate the ATD plan. A single visit can involve both, but one control system never substitutes for the other.',
          'The accessible BBP plan covers exposure determination, safer devices, work practices, PPE, hepatitis B vaccination, reporting, confidential evaluation, training, and records. The ATD plan adds screening, airborne precautions, respirator selection, fit testing, and exposure follow-up.',
        ],
        bullets: [
          'Blood or OPIM on intact skin alone is not the same as a defined exposure incident; clean it promptly and report concerns according to the plan.',
          'A splash to an eye, mouth, or non-intact skin—or a percutaneous injury—does trigger the exposure response.',
        ],
      },
      {
        heading: 'Know your boundary in the home',
        paragraphs: [
          'If a task, device, or precaution is not part of your current assignment or validated competency, stop before beginning. Protect the patient, keep the area safe, and contact the supervisor or Director of Nursing through the current escalation route. Do not improvise a procedure because supplies are present or because a patient or caregiver asks.',
          'Training provides recognition and response knowledge; job-specific competency, Employee Health, and the respiratory program provide separate authorization or clearance.',
        ],
      },
    ],
    keyActions: [
      { icon: '🗂️', title: 'Locate both plans', detail: 'Know how to access the current BBP and ATD plans before field work.' },
      { icon: '🧭', title: 'Name the route', detail: 'Blood/OPIM contact route and airborne inhalation require different controls.' },
      { icon: '🧤', title: 'Assess without PPE', detail: 'Exposure determination is made without assuming PPE eliminates the hazard.' },
      { icon: '📞', title: 'Stop and escalate', detail: 'Unclear task, missing control, or unexpected hazard means pause and call.' },
    ],
    clinicalTip: 'Start with one sentence: “What can reach me, by which route, during this exact task?” Then open the matching exposure-control plan.',
    sourceRefs: ['RM-OS-002', 'RM-OS-003', '8CCR5193', '8CCR5199', 'CDC-TB-SPREAD'],
    sceneImage: img01,
    sceneAlt: 'Home-health clinician reviewing an exposure-control binder beside gloves, eye protection, a sharps container, sanitizer, and a closed clinical bag.',
    hotspots: [
      {
        id: 'l1-plan', label: 'Current exposure-control plans', shortLabel: 'ECP', x: 28, y: 42, kind: 'guidance',
        observed: 'The clinician is reviewing a plain binder before the visit rather than relying on memory.',
        why: 'The current BBP and ATD plans define covered tasks, required controls, reporting, and follow-up. Older handouts or habits may be incomplete.',
        action: 'Confirm access to both current plans and the after-hours reporting instructions before beginning covered work.',
        notify: 'Supervisor or Risk Manager if a plan or reporting route cannot be accessed.',
        document: 'Report the access problem through the safety process; do not place confidential employee-health details in a patient chart.',
        sourceRefs: ['RM-OS-002', 'RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l1-task', label: 'Visit task and exposure determination', shortLabel: 'Task', x: 25, y: 84, kind: 'caution',
        observed: 'A task checklist is separated from the clinical supplies so hazards can be considered before set-up.',
        why: 'Exposure is determined from reasonably anticipated tasks without considering whether PPE will be worn. The task—not confidence or job title—drives the control.',
        action: 'Identify possible percutaneous, mucous-membrane, non-intact-skin, and inhalation pathways for the assigned tasks.',
        notify: 'Supervisor when the assignment includes an unlisted task or an exposure not addressed by the plan.',
        document: 'Record only the operational hazard or assignment clarification needed; no PHI belongs in training-state storage.',
        sourceRefs: ['RM-OS-002', 'RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l1-barriers', label: 'Barrier selection supplies', shortLabel: 'Barriers', x: 51, y: 80, kind: 'protective',
        observed: 'Gloves and protective eyewear are available before the clinical bag is opened.',
        why: 'PPE protects against remaining exposure after engineering and work-practice controls; it is not the first or only control.',
        action: 'Choose barriers for the anticipated route and amount of contact, and carry enough replacements for the visit.',
        notify: 'Supervisor if appropriate sizes or splash protection are unavailable.',
        document: 'If a supply gap changes or delays care, document the objective reason and escalation in the authorized workflow.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016', '8CCR5193'],
      },
      {
        id: 'l1-sharps', label: 'Point-of-use sharps container', shortLabel: 'Sharps', x: 69, y: 69, kind: 'protective',
        observed: 'An approved sharps container is available before a task involving a sharp could begin.',
        why: 'Preparing point-of-use disposal prevents carrying or setting down a contaminated sharp after use.',
        action: 'If a role-authorized task uses a sharp, position the container upright and within reach before starting.',
        notify: 'Supervisor if the container is missing, damaged, or near its fill line.',
        document: 'Report supply defects or safety-device failures through the incident or hazard-reporting process.',
        sourceRefs: ['RM-OS-003', 'RM-PS-002', '8CCR5193'],
      },
      {
        id: 'l1-bag', label: 'Closed clinical bag and clean boundary', shortLabel: 'Clean Bag', x: 88, y: 72, kind: 'protective',
        observed: 'The clinical bag remains closed while the worker completes the hazard review.',
        why: 'Opening supplies before choosing a clean work zone increases contamination risk and can distract from pre-visit screening.',
        action: 'Choose a clean, dry, stable surface and establish the work boundary before opening the bag.',
        notify: 'Supervisor if the home cannot support the planned task safely.',
        document: 'Describe the objective barrier, care held or modified within orders, and the person notified.',
        sourceRefs: ['CL-SD-016', 'RM-OS-003'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'BBP Controls',
    title: 'Break the Bloodborne Chain',
    subtitle: 'Match engineering controls, work practices, and PPE to the exposure',
    overview: [
      'HBV, HCV, and HIV are different viruses, but the occupational prevention logic is consistent: keep blood and OSHA-defined OPIM away from sharps injuries, mucous membranes, and non-intact skin. Use Universal Precautions for blood and OPIM within the broader Standard Precautions used in patient care. Do not use a patient’s appearance, diagnosis, or history to decide whether protection is needed.',
      'Controls follow a hierarchy. Avoid unnecessary exposure first. Use safer devices or other engineering controls. Apply work practices that keep hands and contaminated items out of the hazard path. Then use task-appropriate PPE for exposure that remains. Gloves alone cannot correct an unsafe device, crowded work surface, or missing sharps container.',
      'PPE selection is based on the task: gloves for anticipated blood, OPIM, mucous membrane, non-intact skin, or contaminated-item contact; gown or apron when clothing or skin may be contaminated; and mask plus eye protection or a face shield when splashes or sprays may reach the face. An N95 controls inhalation hazards and does not replace splash protection.',
    ],
    details: [
      {
        heading: 'Apply controls without stigma',
        paragraphs: [
          'HBV can be prevented through vaccination for eligible occupationally exposed workers. HCV has no vaccine, and HIV prevention after an exposure may include time-sensitive medical evaluation and prophylaxis. These facts support consistent precautions; they do not justify labeling or isolating a person. Standardize safe work for every patient and preserve confidentiality.',
          'Not every body fluid is automatically OPIM under the OSHA definition. Blood; certain listed body fluids; unfixed human tissue; and other material defined by the standard require BBP controls. If a body fluid type cannot be differentiated, follow the Exposure Control Plan and treat it as potentially infectious. Patient-care Standard Precautions may be broader than the occupational BBP definition.',
        ],
        bullets: [
          'Cover cuts, abrasions, and dermatitis before work; report conditions that prevent safe barrier use.',
          'Never wash or decontaminate disposable gloves for reuse. Replace torn or contaminated gloves promptly.',
          'Remove PPE to avoid contaminating clothing, equipment, phones, door handles, or the clinical bag.',
        ],
      },
      {
        heading: 'Hands, face, and the work zone',
        paragraphs: [
          'Perform hand hygiene after removing gloves and whenever indicated by the infection-prevention policy. If hands are visibly soiled, use soap and water. If a sink is not immediately available, use the agency-approved alternative and wash as soon as feasible under the current plan.',
          'Build a clean-to-dirty flow before the task. Keep unused supplies protected, place contaminated items only in the designated zone, and avoid touching phones or documentation devices with contaminated gloves. If the environment will not support safe separation, pause and escalate rather than improvising.',
        ],
      },
    ],
    keyActions: [
      { icon: '🛡️', title: 'Use the hierarchy', detail: 'Engineering and work-practice controls come before PPE.' },
      { icon: '🧤', title: 'Match the task', detail: 'Select gloves, gown, and face protection for the anticipated exposure.' },
      { icon: '🧼', title: 'Clean hands', detail: 'Hand hygiene follows glove removal and breaks in clean technique.' },
      { icon: '🤝', title: 'Protect without stigma', detail: 'Precautions are based on exposure, never assumptions about a patient.' },
    ],
    clinicalTip: 'A respirator, surgical mask, and face shield solve different problems. Name the route first; then select the barrier.',
    sourceRefs: ['RM-OS-003', 'CL-SD-016', '8CCR5193', '29CFR1910.1030'],
    sceneImage: img02,
    sceneAlt: 'Field clinician selecting packaged gloves beside a disposable gown, eye protection, face shield, CPR barrier, and a lined work zone in a home.',
    hotspots: [
      {
        id: 'l2-gloves', label: 'Packaged examination gloves', shortLabel: 'Gloves', x: 70, y: 67, kind: 'protective',
        observed: 'The worker selects intact gloves before contacting the patient-care zone.',
        why: 'Gloves protect hands when blood, OPIM, mucous membrane, non-intact skin, or contaminated items may be contacted, but they do not replace hand hygiene.',
        action: 'Use the correct size, inspect for damage, change when contaminated or torn, remove safely, and clean hands.',
        notify: 'Supervisor if appropriate non-latex or correct-size supplies are unavailable.',
        document: 'Document a supply-related delay or exposure event through the appropriate agency process.',
        sourceRefs: ['CL-SD-016', 'RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l2-gown', label: 'Fluid-resistant gown or apron', shortLabel: 'Gown', x: 19, y: 82, kind: 'protective',
        observed: 'A disposable gown is staged separately from the clean supply area.',
        why: 'Clothing and exposed skin need protection when splashes, sprays, or extensive contact are reasonably anticipated.',
        action: 'Select coverage for the task, tie or fasten it correctly, and remove it without contacting the contaminated exterior.',
        notify: 'Supervisor when the available garment does not provide adequate coverage.',
        document: 'If PPE limitations change the plan, record the objective limitation and escalation.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016'],
      },
      {
        id: 'l2-face', label: 'Face shield and protective eyewear', shortLabel: 'Face PPE', x: 32, y: 80, kind: 'protective',
        observed: 'Eye and face protection are ready for a possible splash or spray.',
        why: 'A mask alone may leave the eyes and face exposed. A face shield’s design and coverage determine whether separate eye protection is also needed.',
        action: 'Use agency-approved protection matched to the anticipated splash direction and amount.',
        notify: 'Supervisor if face protection is damaged, fogged beyond safe use, or unavailable.',
        document: 'Report a PPE failure that creates exposure; include the route and circumstances.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l2-cpr', label: 'Resuscitation barrier device', shortLabel: 'CPR Barrier', x: 48, y: 84, kind: 'guidance',
        observed: 'A one-way resuscitation barrier is available with other protective equipment.',
        why: 'Engineering controls can reduce contact during emergency ventilation. Equipment does not replace training or the emergency response plan.',
        action: 'Use only the agency-provided device for which you are trained, and follow the emergency protocol.',
        notify: 'Emergency services and agency leadership according to the event and current plan.',
        document: 'Record emergency actions, equipment used, exposure concerns, and required notifications.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016'],
      },
      {
        id: 'l2-zone', label: 'Clean and contaminated work-zone boundary', shortLabel: 'Work Zone', x: 88, y: 87, kind: 'caution',
        observed: 'The lined tray creates a visible boundary for items that may become contaminated.',
        why: 'A planned boundary prevents clean supplies, documentation tools, and the clinical bag from becoming part of the exposure pathway.',
        action: 'Arrange supplies before donning gloves; move from clean to dirty; avoid returning contaminated hands to clean items.',
        notify: 'Supervisor if the home environment prevents a safe set-up for the assigned task.',
        document: 'Describe the barrier and how care was safely delayed, modified within orders, or reassigned.',
        sourceRefs: ['CL-SD-016', 'RM-OS-003'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Sharps & Specimens',
    title: 'Engineer Out Sharps Risk',
    subtitle: 'Prepare disposal first, control the device, and contain every specimen',
    overview: [
      'Sharps safety is built into the workflow before the device is opened. Use the agency-selected safety-engineered device, place an approved container upright and within arm’s reach at the point of use, keep the work surface stable, and plan how the device will move directly from use to disposal. A worker should never need to carry an exposed sharp across a room.',
      'After use, activate the safety feature and dispose immediately. Do not bend, break, remove, hand-pass, or reach into a container. Routine recapping is prohibited. Only a documented procedure-specific exception may allow the approved mechanical device or one-hand method.',
      'Close the primary specimen container, keep its exterior clean, and add secondary containment when leakage, contamination, or puncture is possible. Follow the agency waste plan; not every used glove or bandage is regulated waste.',
    ],
    details: [
      {
        heading: 'Control the sharp from opening to disposal',
        paragraphs: [
          'Inspect the package and device before use. Do not bypass, disable, or defeat a safety feature. If a device looks damaged, the correct container is unavailable, or the work surface is unstable, stop before the procedure. A caregiver’s household bottle, trash can, or improvised container is not a substitute for an approved sharps container.',
          'If a safety mechanism fails, keep the device controlled and pointed away. Do not repair or force it. If immediate disposal is unsafe, guard the area and obtain supervisor direction; never hand it to another person.',
        ],
        bullets: [
          'Close and replace a sharps container at the manufacturer’s fill line; never compress contents.',
          'Use tongs or another mechanical tool—not fingers—to pick up potentially contaminated broken glass.',
          'Transport a closed container in the agency-approved secondary system, never a pocket or soft clinical bag compartment.',
        ],
      },
      {
        heading: 'Contain specimens, waste, and surface contamination',
        paragraphs: [
          'The primary specimen container must prevent leakage. If its outside becomes contaminated, use clean secondary containment without contaminating the new exterior. Protect requisitions and identifiers throughout transport.',
          'For a blood or OPIM spill, secure the area, wear task-appropriate PPE, remove visible material safely, and use an agency-approved EPA-registered hospital disinfectant according to its label—including dilution, surface compatibility, and wet contact time. Do not rely on a universal bleach ratio or an improvised alcohol soak. Report spills or supply failures through the current incident process.',
        ],
      },
    ],
    keyActions: [
      { icon: '📍', title: 'Place disposal first', detail: 'Container upright, stable, open, and within reach before the sharp is used.' },
      { icon: '🧷', title: 'Use the safety feature', detail: 'Activate as designed; never defeat, bend, or hand-pass the device.' },
      { icon: '🧪', title: 'Contain specimens', detail: 'Closed primary container plus secondary protection when needed.' },
      { icon: '🧽', title: 'Follow the label', detail: 'Use the approved disinfectant and its actual contact-time instructions.' },
    ],
    clinicalTip: 'The safest contaminated sharp is the one that travels the shortest possible distance: from the hand directly into the point-of-use container.',
    sourceRefs: ['RM-OS-003', 'RM-PS-002', 'CL-SD-016', '8CCR5193'],
    sceneImage: img03,
    sceneAlt: 'Clinician handling a safety-engineered device at a home table beside an open sharps container, stable tray, specimen pouch, and clean transport materials.',
    hotspots: [
      {
        id: 'l3-container', label: 'Approved point-of-use sharps container', shortLabel: 'Point of Use', x: 18, y: 52, kind: 'protective',
        observed: 'The approved container is upright, open, and within arm’s reach before the device is handled.',
        why: 'Point-of-use placement eliminates carrying or setting down a contaminated sharp and reduces the chance of an unplanned hand-off.',
        action: 'Confirm stability, available capacity, and an unobstructed path before starting any authorized sharps task.',
        notify: 'Supervisor if the container is unavailable, damaged, overfilled, or cannot be positioned safely.',
        document: 'Record a safety-supply defect or near miss in the authorized hazard-reporting workflow.',
        sourceRefs: ['RM-OS-003', 'RM-PS-002', '8CCR5193'],
      },
      {
        id: 'l3-device', label: 'Safety-engineered sharp', shortLabel: 'Safety Device', x: 57, y: 51, kind: 'caution',
        observed: 'The clinician controls the device near the disposal container without pointing it toward another person.',
        why: 'Safety features reduce risk only when they are selected, activated, and discarded as designed. Manipulation can create the injury they were intended to prevent.',
        action: 'Activate the feature as trained and dispose immediately. If it fails, do not recap, bend, repair, or hand it off.',
        notify: 'Supervisor and Risk Manager for a safety-device failure or near miss.',
        document: 'Device type and brand, task, failure point, circumstances, and actions taken.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l3-tray', label: 'Stable clean-to-dirty tray', shortLabel: 'Stable Tray', x: 37, y: 75, kind: 'protective',
        observed: 'The tray provides a stable surface with only the supplies needed for the task.',
        why: 'Crowding, unstable furniture, pets, and unexpected movement increase sharps and contamination risk in a home.',
        action: 'Establish the surface and control interruptions before opening a device. Stop if the environment changes.',
        notify: 'Supervisor when the task cannot be completed safely in the available environment.',
        document: 'Objective environmental barrier, care held, patient protection, and follow-up plan.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016'],
      },
      {
        id: 'l3-specimen', label: 'Secondary specimen transport pouch', shortLabel: 'Specimen', x: 67, y: 84, kind: 'protective',
        observed: 'A closed specimen tube is separated inside a secondary leak-resistant transport pouch.',
        why: 'Secondary containment protects the worker, vehicle, documents, and public if the primary container leaks or breaks.',
        action: 'Close and inspect the primary container, keep the exterior clean, and secure it in the approved secondary system.',
        notify: 'Supervisor or laboratory contact through the approved route if containment fails or labeling is uncertain.',
        document: 'Specimen type, collection time, container integrity, transport, and any variance handled.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l3-cleanup', label: 'Spill and waste control supplies', shortLabel: 'Cleanup', x: 88, y: 86, kind: 'guidance',
        observed: 'Cleanup materials are kept separate from the specimen and device work zone.',
        why: 'An approved product and a controlled sequence are safer than a memorized universal bleach recipe that may not match the surface or pathogen claim.',
        action: 'Secure the area, use required PPE, remove material safely, and follow the approved disinfectant label and agency waste pathway.',
        notify: 'Supervisor for a significant spill, missing product, or exposure during cleanup.',
        document: 'Location, material, cleanup product, actions, exposure if any, and required incident report.',
        sourceRefs: ['RM-OS-003', 'RM-PS-002', 'CL-SD-016'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Post-Exposure',
    title: 'Exposure: Act Without Delay',
    subtitle: 'First aid now, immediate reporting, and prompt confidential evaluation',
    overview: [
      'A needlestick, cut from a contaminated sharp, blood splash to the eyes or mouth, or contact with non-intact skin is time-sensitive. Stop the task safely. Wash a needlestick, cut, or affected skin immediately with soap and water. Begin flushing an eye or other mucous membrane immediately with clean water. Care Indeed’s current BBP plan specifies at least 15 minutes for eye or mucous-membrane flushing.',
      'Do not squeeze or milk a puncture, scrub aggressively, or apply bleach, disinfectant, or another caustic product to the body. Do not finish the visit before reporting. Contact the supervisor and Director of Nursing immediately through the current exposure route. The agency’s BBP workflow calls for the response to be initiated within two hours and same-day occupational-health evaluation.',
      'The evaluating healthcare professional—not the field worker—assesses baseline testing, source information, hepatitis B measures, HCV follow-up, and whether HIV post-exposure prophylaxis is indicated. When PEP is indicated, current guidance emphasizes starting as soon as possible; evaluation must not be delayed while waiting for source results.',
    ],
    details: [
      {
        heading: 'Separate first aid from medical decision-making',
        paragraphs: [
          'Your immediate duties are to control the scene, perform first aid, report, and reach the designated evaluation pathway. Do not decide that an injury is “too small,” base action on a patient’s diagnosis, or wait to see whether a mark develops. A hollow-bore needlestick, splash, cut, or other event receives an individualized professional assessment.',
          'Authorized agency personnel handle source identification, consent, testing, and legal limits. The exposed employee is offered confidential evaluation and follow-up at no cost. The worker does not demand a source sample, test a discarded needle, prescribe PEP, interpret results for the patient, or disclose either person’s infection status.',
        ],
        bullets: [
          'If exposure involves eyes or mucous membranes, begin clean-water flushing immediately; do not search for special chemicals first.',
          'If urgent patient safety is also involved, activate emergency help while another authorized person initiates the employee exposure pathway.',
          'Follow every appointment and laboratory instruction from the evaluating professional; do not self-select follow-up intervals.',
        ],
      },
      {
        heading: 'Document facts without moving medical data into the patient record',
        paragraphs: [
          'Capture the date and time, route of exposure, task, device type and brand when applicable, safety-feature status, PPE, first aid, reporting times, and referral. The agency maintains a confidential sharps injury log and employee medical record. These are different from the patient’s clinical note.',
          'Patient documentation should describe patient care and clinically appropriate notifications. Employee test results, diagnoses, counseling, and treatment remain in the confidential occupational-health process. If you are uncertain where a fact belongs, preserve it and ask Risk Management rather than placing sensitive employee information in the patient chart.',
        ],
      },
    ],
    keyActions: [
      { icon: '🚿', title: 'Wash or flush now', detail: 'Soap and water for skin; clean-water flushing for eyes or mucosa.' },
      { icon: '📞', title: 'Report immediately', detail: 'Use the current supervisor/DON exposure route without finishing the visit first.' },
      { icon: '🏥', title: 'Reach evaluation', detail: 'Prompt, same-day, no-cost, confidential occupational-health evaluation.' },
      { icon: '📝', title: 'Preserve facts', detail: 'Route, task, device, PPE, first aid, times, notifications, and referral.' },
    ],
    clinicalTip: 'First aid and reporting happen in parallel with patient protection. Source testing is never a reason to postpone the employee’s evaluation.',
    sourceRefs: ['RM-OS-003', 'CL-SD-016', 'RM-ER-002', '8CCR5193', 'USPHS-2025', 'CDC-HCV'],
    sceneImage: img04,
    sceneAlt: 'Home-health clinician washing an exposed hand at a residential sink beside a phone, clock, eye protection, irrigation bottle, blank incident card, and closed bag.',
    hotspots: [
      {
        id: 'l4-wash', label: 'Immediate skin first aid', shortLabel: 'Wash Now', x: 22, y: 66, kind: 'protective',
        observed: 'The worker stops and washes the affected skin immediately under running water.',
        why: 'Prompt washing removes contamination. Caustic agents, bleach, or aggressive squeezing can injure tissue and do not replace evaluation.',
        action: 'Wash needlesticks, cuts, or non-intact skin with soap and water, then continue the reporting pathway.',
        notify: 'Supervisor and Director of Nursing immediately.',
        document: 'Exposure route, first-aid start time and method, and notification times.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l4-clock', label: 'Time-sensitive response', shortLabel: 'Time', x: 79, y: 16, kind: 'caution',
        observed: 'A visible clock reinforces that exposure response should not wait until the visit or shift ends.',
        why: 'Some post-exposure decisions are time-sensitive. The agency workflow initiates supervisor response within two hours and arranges same-day evaluation.',
        action: 'Report immediately and follow the designated evaluation route; do not wait for symptoms or source results.',
        notify: 'Escalate through the after-hours chain if the first contact is unavailable.',
        document: 'Exact exposure, reporting, callback, and referral times.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016', 'USPHS-2025'],
      },
      {
        id: 'l4-phone', label: 'Immediate reporting phone', shortLabel: 'Report', x: 50, y: 82, kind: 'protective',
        observed: 'The phone is clean and reachable after first aid begins.',
        why: 'Immediate reporting activates occupational health, source procedures, incident documentation, and access to time-sensitive evaluation.',
        action: 'Call the current supervisor/DON exposure route and state the route, material, time, and first aid already performed.',
        notify: 'Use the agency escalation tree; call emergency services for a medical emergency.',
        document: 'Who was contacted, when, information given, and instructions received.',
        sourceRefs: ['RM-OS-003', 'RM-ER-002'],
      },
      {
        id: 'l4-flush', label: 'Eye and mucous-membrane flushing supplies', shortLabel: 'Flush', x: 70, y: 82, kind: 'guidance',
        observed: 'Protective eyewear and clean irrigation water are available near the work area.',
        why: 'An eye or mouth splash is a defined exposure route. Care Indeed’s BBP plan specifies immediate clean-water flushing for at least 15 minutes.',
        action: 'Begin flushing at once; remove contaminated contact lenses if feasible; do not place disinfectant in the eye.',
        notify: 'Supervisor/DON while flushing continues when possible, then proceed to evaluation.',
        document: 'Anatomic site, material, flushing start and duration, and referral.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l4-record', label: 'Objective incident facts and closed clinical bag', shortLabel: 'Record Facts', x: 88, y: 89, kind: 'guidance',
        observed: 'A blank incident card is kept outside the clinical bag and contains no patient or employee results.',
        why: 'Objective exposure facts support evaluation and prevention. Detailed employee medical information must remain confidential and separate from the patient chart.',
        action: 'Preserve route, device, task, PPE, safety-feature status, first aid, notifications, and referral facts.',
        notify: 'Risk Manager for the incident form, sharps log, and record-placement questions.',
        document: 'Use the employee incident and medical workflows; include only patient-care facts in the patient record.',
        sourceRefs: ['RM-OS-003', 'RM-ER-002', '8CCR5193'],
      },
    ],
  },
  {
    id: 4,
    shortName: 'Vaccine & Rights',
    title: 'Vaccination, Rights, and Confidentiality',
    subtitle: 'Know the hepatitis B offer, employee choices, and medical-record boundary',
    overview: [
      'For employees with occupational exposure, hepatitis B vaccination must be made available after required BBP training and within 10 working days of initial assignment, at no cost and at a reasonable time and place. Prior completion, documented immunity, or a medical contraindication may affect the process. Prescreening cannot be required as a condition of receiving the offer.',
      'An employee may decline and sign the required declination statement. If the employee later decides to accept while still covered by the standard, the employer must make vaccination available at no cost. The evaluating clinician determines the appropriate licensed product schedule, post-vaccination testing, and follow-up; this module does not hard-code a three-dose series or make individual medical recommendations.',
      'Occupational-health records are confidential and separate from ordinary personnel and patient records. Detailed diagnoses and laboratory results do not belong in a supervisor’s operational file or a patient chart. Restrictions, return-to-work decisions, and respirator medical clearance belong to the evaluating licensed healthcare professional and authorized agency leaders.',
    ],
    details: [
      {
        heading: 'An offer is access—not coercion',
        paragraphs: [
          'The employee receives information about efficacy, safety, administration, benefits, and the no-cost offer. A declination documents the choice; it does not erase the right to accept later. Supervisors should route questions to Employee Health rather than provide personal medical advice, pressure an employee, or discuss vaccination status with coworkers.',
          'Post-exposure hepatitis B management depends on vaccination and immune status, source information, and current professional guidance. The exposed worker should give accurate history to the evaluator and follow the recommended plan. Field workers do not interpret antibody results for themselves or others.',
        ],
        bullets: [
          'The offer applies to employees whose job exposure determination places them under the BBP standard.',
          'Vaccination and required post-exposure evaluation are provided at no cost to the covered employee.',
          'Declining today does not cancel later access while the employee remains covered.',
        ],
      },
      {
        heading: 'Keep the medical boundary intact',
        paragraphs: [
          'The employer maintains an occupational medical record that includes vaccination status, required evaluations, and the limited written opinion. Under the BBP standard, medical records are retained for the duration of employment plus 30 years. Access is controlled, and disclosure follows law and agency policy.',
          'The healthcare professional’s written opinion to the employer is limited to required information, such as whether vaccination is indicated or provided and whether the employee was informed of evaluation results and needed follow-up. Specific diagnoses or test results remain confidential. Training completion alone never clears an employee for exposure-prone tasks or respirator use.',
        ],
      },
    ],
    keyActions: [
      { icon: '💉', title: 'Offer on time', detail: 'After training and within 10 working days for covered initial assignments.' },
      { icon: '✍️', title: 'Respect the choice', detail: 'Declination is documented; later acceptance remains available at no cost.' },
      { icon: '🔒', title: 'Protect medical data', detail: 'Employee-health details stay in the confidential medical workflow.' },
      { icon: '🩺', title: 'Use the PLHCP', detail: 'Clinicians decide schedules, follow-up, restrictions, and fitness for duty.' },
    ],
    clinicalTip: 'A supervisor needs the operational clearance or restriction—not the employee’s diagnosis or laboratory values.',
    sourceRefs: ['RM-OS-003', 'HR-WM-003', '8CCR5193', '29CFR1910.1030'],
    sceneImage: img05,
    sceneAlt: 'Field clinician in a private occupational-health conversation beside a blank vaccine envelope, declination form, sealed confidential folder, privacy screen, and calendar.',
    hotspots: [
      {
        id: 'l5-offer', label: 'Hepatitis B vaccination offer', shortLabel: 'Vaccine Offer', x: 25, y: 82, kind: 'protective',
        observed: 'An unopened information envelope is available during a private occupational-health discussion.',
        why: 'Covered employees receive the hepatitis B offer after training and within 10 working days of initial assignment, at no cost.',
        action: 'Review the information, ask the designated clinician questions, and complete the agency acceptance or declination process.',
        notify: 'Employee Health or HR if the offer is delayed, inaccessible, or conditioned on prescreening.',
        document: 'Employee Health records the offer, date, and vaccination status in the confidential medical file.',
        sourceRefs: ['RM-OS-003', '8CCR5193', '29CFR1910.1030'],
      },
      {
        id: 'l5-decline', label: 'Declination and later acceptance', shortLabel: 'Choice', x: 49, y: 84, kind: 'guidance',
        observed: 'A blank declination form is discussed without pressure or public disclosure.',
        why: 'A declining covered employee signs the required statement and may later accept vaccination at no cost while still covered.',
        action: 'Make an informed choice, sign the required form if declining, and contact Employee Health if the decision changes.',
        notify: 'Employee Health—not coworkers or the patient—handles later acceptance or medical questions.',
        document: 'Store the declination or acceptance record only in the confidential employee-health file.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l5-file', label: 'Sealed confidential medical record', shortLabel: 'Confidential', x: 67, y: 84, kind: 'protective',
        observed: 'The employee-health folder is sealed and separated from the open workplace.',
        why: 'Vaccination, tests, evaluation, diagnoses, and follow-up are medical information with restricted access and long retention requirements.',
        action: 'Use the designated confidential channel and avoid copying details into email, scheduling notes, personnel narratives, or patient records.',
        notify: 'Privacy Officer, Employee Health, or Risk Manager if information is misdirected or exposed.',
        document: 'Follow the privacy incident process; do not reproduce the sensitive content unnecessarily.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l5-clearance', label: 'Work-status and follow-up calendar', shortLabel: 'Clearance', x: 89, y: 78, kind: 'caution',
        observed: 'A private calendar represents follow-up and clearance managed outside the patient-care record.',
        why: 'Return-to-work, restrictions, follow-up timing, and respirator clearance require professional evaluation; a training score cannot determine them.',
        action: 'Attend required follow-up and work only within the written clearance or restriction provided through the agency process.',
        notify: 'Employee Health and the authorized supervisor about operational restrictions without disclosing unnecessary medical detail.',
        document: 'Maintain the detailed medical record confidentially; supervisors retain only the operational information they are authorized to receive.',
        sourceRefs: ['HR-WM-003', 'RM-OS-003', '8CCR5193'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'TB & Respirators',
    title: 'Recognize and Respond to Tuberculosis Risk',
    subtitle: 'Airborne controls, screening rules, and the N95 sequence are not interchangeable',
    overview: [
      'Tuberculosis is caused by Mycobacterium tuberculosis. Active TB disease of the lungs or throat can release infectious particles into the air when a person coughs, speaks, or sings; risk is greater in enclosed areas with poor air circulation. Inactive or latent TB infection does not spread to other people. TB is not transmitted by touching bed linens, sharing food, or shaking hands.',
      'Possible symptoms include cough lasting three weeks or longer, chest pain, bloody sputum, fever, night sweats, unexplained weight loss, fatigue, and reduced appetite. These trigger screening and escalation, not a field diagnosis. Record “patient reports cough for four weeks and night sweats,” not “patient has TB.”',
      'Medical evaluation precedes fit testing for the exact assigned model and size; fit testing occurs before use and annually, and a seal check every donning. Care Indeed policy requires a surgical/procedure mask for every visit and fit-tested N95 for flagged/symptomatic visits. That internal mask minimum is not N95-equivalent TB protection.',
    ],
    details: [
      {
        heading: 'Screening: distinguish guidance, California duties, and agency practice',
        paragraphs: [
          'CDC recommends baseline screening for U.S. health care personnel at hire: individual risk assessment, symptom evaluation, and TB test, with further evaluation when indicated. CDC generally does not recommend annual serial testing after baseline without known exposure or ongoing transmission. Annual education and prompt post-exposure evaluation remain important.',
          'California requirements are separately controlling. Under the ATD standard, covered employees with occupational exposure must be offered latent-TB assessment and testing at least annually on paid time. Employee Health applies California and agency requirements to the worker’s role, history, and exposure. Workers with a prior positive test follow its symptom and medical process rather than memorized repeat tests or routine chest X-rays.',
        ],
        bullets: [
          'A baseline skin-test pathway may require two-step TST; an IGRA blood test is not described as a “two-step IGRA.”',
          'Use individual history, objective symptoms, known exposure, and public-health guidance—not race or ethnicity—to guide precautions.',
          'Report a potential exposure even if it seems brief; duration, proximity, ventilation, source infectiousness, and procedures all matter.',
        ],
      },
      {
        heading: 'At the home: pause outside the shared-air space',
        paragraphs: [
          'When possible infectious TB is identified before an unplanned visit, maintain distance and communicate outside the shared-air area. Offer source control if tolerated. Do not begin close care without the assigned airborne plan and the exact respirator for which you are cleared and fit-tested.',
          'Contact the supervisor or Director of Nursing for direction and coordination. Improve ventilation only when safe and directed; it supports but never replaces source control, respiratory protection, or escalation.',
        ],
      },
      {
        heading: 'Fit test versus seal check',
        paragraphs: [
          'A fit test is a formal procedure for a specific respirator after medical evaluation, before initial use, at least annually, with a different facepiece, or after fit-affecting physical change. A user seal check occurs each time the approved respirator is donned. Neither substitutes for the other.',
          'Do not use a tight-fitting respirator when facial hair or another condition interferes with its seal, borrow another model, stack masks, or improvise. Contact the respiratory program for an approved alternative and assignment direction.',
        ],
      },
    ],
    keyActions: [
      { icon: '🌬️', title: 'Treat TB as airborne', detail: 'Shared air—not blood contact or surfaces—is the occupational route.' },
      { icon: '😷', title: 'Use source control', detail: 'Offer a patient mask when safe; it does not replace worker protection.' },
      { icon: '🫁', title: 'Clear, fit, check', detail: 'Medical evaluation → fit test → user seal check every donning.' },
      { icon: '🚪', title: 'Pause before entry', detail: 'Unexpected symptoms mean distance, escalation, and an assigned airborne plan.' },
    ],
    clinicalTip: 'A seal check answers “Is this approved respirator seated now?” A fit test answers “Does this exact model fit this worker?”',
    sourceRefs: ['RM-OS-002', 'HR-WM-003', '8CCR5199', '8CCR5144', 'CDC-TB-SCREEN', 'CDC-TB-SPREAD', 'CALOSHA-TB-FAQ'],
    sceneImage: img06,
    sceneAlt: 'Fit-tested home-health clinician paused at a doorway with phone and closed bag while a masked patient sits at a distance near an open window and air cleaner.',
    hotspots: [
      {
        id: 'l6-worker-rpe', label: 'Worker respiratory protection', shortLabel: 'N95', x: 19, y: 23, kind: 'protective',
        observed: 'The clinician wears a tight-fitting respirator outside the close-care zone.',
        why: 'Airborne protection requires the employer-selected, medically cleared, fit-tested respirator.',
        action: 'Use only the exact make, model, style, and size for which you are currently fit-tested; perform a seal check every donning.',
        notify: 'Respiratory program administrator for fit, supply, facial-hair, damage, or clearance concerns.',
        document: 'Use approved fit records; record visit precautions without worker medical details.',
        sourceRefs: ['RM-OS-002', '8CCR5144', '8CCR5199'],
      },
      {
        id: 'l6-phone', label: 'Pre-entry escalation phone', shortLabel: 'Call First', x: 29, y: 50, kind: 'caution',
        observed: 'The clinician pauses at the doorway before entering shared air.',
        why: 'Unexpected TB symptoms require an assigned response, not diagnosis or improvised entry.',
        action: 'Maintain distance, communicate calmly, and contact the supervisor/DON for the airborne plan and visit disposition.',
        notify: 'Supervisor/DON; authorized personnel coordinate provider or public-health follow-up.',
        document: 'Objective symptoms, distance, source-control offer, ventilation, and instructions.',
        sourceRefs: ['RM-OS-002', '8CCR5199', 'CDC-TB-SPREAD'],
      },
      {
        id: 'l6-patient-mask', label: 'Patient source-control mask', shortLabel: 'Source Control', x: 64, y: 42, kind: 'protective',
        observed: 'The masked patient sits away from the doorway.',
        why: 'Source control can reduce released particles but neither diagnoses TB nor replaces worker protection.',
        action: 'Offer source control when tolerated and safe, explain it respectfully, and preserve distance while awaiting direction.',
        notify: 'Supervisor if the patient cannot tolerate or declines the mask; do not coerce.',
        document: 'Mask offer and response, objective symptoms, and care coordination.',
        sourceRefs: ['RM-OS-002', '8CCR5199'],
      },
      {
        id: 'l6-ventilation', label: 'Open window and air cleaning', shortLabel: 'Ventilation', x: 72, y: 29, kind: 'guidance',
        observed: 'An open window and air cleaner support airflow.',
        why: 'Ventilation may reduce airborne concentration, depending on airflow and device performance.',
        action: 'Improve ventilation only when safe and directed; continue source control, distance, respiratory protection, and escalation.',
        notify: 'Supervisor when ventilation is unsafe, unavailable, or inconsistent with the plan.',
        document: 'Conditions and precautions used; never call a room “safe” because one window is open.',
        sourceRefs: ['RM-OS-002', '8CCR5199', 'CDC-TB-SPREAD'],
      },
      {
        id: 'l6-package', label: 'Assigned respirator and fit record', shortLabel: 'Exact Model', x: 82, y: 87, kind: 'hazard',
        observed: 'Packaging alone does not establish respirator clearance or fit.',
        why: 'A seal check cannot validate a borrowed model; medical evaluation precedes fit testing and required use.',
        action: 'Do not use an unassigned model. Verify current clearance and fit for the exact respirator through the respiratory program.',
        notify: 'Respiratory program administrator and supervisor before entering a required-use area.',
        document: 'Supply or fit problem, held assignment, and authorized resolution; medical details stay confidential.',
        sourceRefs: ['8CCR5144', 'RM-OS-002'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Field Simulation',
    title: 'Combined Hazard Field Simulation',
    subtitle: 'Run separate needlestick and suspected-TB pathways without losing patient safety',
    overview: [
      'This final scene contains two hazards. A patient reports prolonged cough, night sweats, and unexplained weight loss. The worker stays outside close care, offers source control when safe, maintains distance, and calls for the airborne plan. Gloves or a surgical mask do not replace a required fit-tested respirator.',
      'On a later authorized visit, a safety device fails and causes a needlestick during an assigned sharps procedure. The clinician stops safely, disposes of or guards the device, washes immediately, reports, and enters the same-day occupational-health pathway while authorized personnel manage the source process.',
      'Keep the records separate. The TB pathway captures shared-air facts; the BBP pathway captures route, device, task, PPE, safety feature, first aid, reporting, and referral. Neither record contains speculation, stigma, or unnecessary employee medical details.',
    ],
    details: [
      {
        heading: 'Act 1: symptoms before entry',
        paragraphs: [
          'At the doorway, the patient reports a four-week cough and night sweats. The supplied N95 differs from the fit-tested model. The worker does not try to validate it with a seal check; the worker maintains distance, offers source control, avoids shared air, and contacts the supervisor/DON.',
          'Do not diagnose TB, contact public health independently, or leave without coordination. Use objective language and the authorized care-continuity plan. For an immediate medical emergency, activate emergency services while following the protection plan.',
        ],
      },
      {
        heading: 'Act 2: exposure during an authorized sharps task',
        paragraphs: [
          'During a later authorized finger-stick, an agency safety device fails to retract and punctures the clinician’s gloved finger. The clinician controls and disposes of it without recapping, washes immediately, and reports before resuming routine work.',
          'The confidential evaluation is individualized. The worker does not seek patient consent, draw source blood, or wait for results. Authorized personnel manage the source process, baseline testing, counseling, prophylaxis assessment, and follow-up.',
        ],
        bullets: [
          'Patient protection and worker first aid can occur in parallel; call for help when one person cannot safely do both.',
          'Do not use a hard number of minutes as the sole test for whether a possible TB exposure deserves reporting.',
          'A failed assessment attempt or unfinished scene never creates completion evidence or practical clearance.',
        ],
      },
      {
        heading: 'Defensible close-out',
        paragraphs: [
          'Use closed-loop communication: state each concern, confirm who owns the next step, repeat back instructions, and document in the correct system. Preserve device information for prevention review without retaining a contaminated device outside approved containment.',
          'Protect the patient, remain within assignment and scope, stop when controls are missing, notify the appropriate person, and document objectively. Completion demonstrates knowledge only; hands-on competency, Employee Health decisions, and respiratory-program requirements remain separate.',
        ],
      },
    ],
    keyActions: [
      { icon: '⏸️', title: 'Stop safely', detail: 'Control the immediate hazard and prevent secondary exposure.' },
      { icon: '↔️', title: 'Separate the routes', detail: 'Airborne TB controls and blood/OPIM controls run in parallel.' },
      { icon: '📲', title: 'Close the loop', detail: 'Report, repeat back instructions, and confirm who owns follow-up.' },
      { icon: '🧾', title: 'Use the right record', detail: 'Patient care, incident facts, and employee medical data stay separated.' },
    ],
    clinicalTip: 'When two hazards occur, do not blend them into one vague “infection-control” response. Name each route and run each plan.',
    sourceRefs: ['RM-OS-002', 'RM-OS-003', 'RM-ER-002', '8CCR5193', '8CCR5199', '8CCR5144', 'USPHS-2025'],
    sceneImage: img07,
    sceneAlt: 'Combined home-visit scene with sharps container and safety device in the foreground, clinician near a sink and phone, and a masked patient at a distance by an open window.',
    hotspots: [
      {
        id: 'l7-sharps', label: 'Sharps pathway at point of use', shortLabel: 'BBP Path', x: 13, y: 76, kind: 'protective',
        observed: 'The approved sharps container is positioned beside the task tray before the device is used.',
        why: 'The BBP pathway begins with engineering and work-practice controls, independent of the patient’s respiratory symptoms.',
        action: 'Keep the device controlled, activate its safety feature, and dispose immediately without recapping or hand-off.',
        notify: 'Supervisor/Risk Manager for a device failure, near miss, or exposure.',
        document: 'Device, task, route, safety feature, PPE, disposal, first aid, and reporting facts.',
        sourceRefs: ['RM-OS-003', '8CCR5193'],
      },
      {
        id: 'l7-device', label: 'Safety device and stable tray', shortLabel: 'Device', x: 35, y: 84, kind: 'caution',
        observed: 'A safety device rests on a stable tray with the point protected and no uncontrolled sharp visible.',
        why: 'A safety-feature problem can become an injury if the worker manipulates, repairs, or carries the device.',
        action: 'If safe disposal is not possible, stop, guard the area, keep people away, and obtain immediate direction.',
        notify: 'Supervisor and Risk Manager; seek evaluation immediately if contact occurred.',
        document: 'Exact failure and circumstances without speculation about the patient’s infection status.',
        sourceRefs: ['RM-OS-003', 'RM-PS-002'],
      },
      {
        id: 'l7-sink', label: 'Immediate first-aid location', shortLabel: 'First Aid', x: 27, y: 39, kind: 'protective',
        observed: 'The clinician moves toward the sink instead of continuing the task or approaching the patient.',
        why: 'After a defined blood/OPIM exposure, immediate washing or flushing and reporting take priority over finishing routine work.',
        action: 'Wash affected skin with soap and water or flush mucosa with clean water, then enter the agency exposure pathway.',
        notify: 'Supervisor/DON immediately and occupational health through the designated route.',
        document: 'First-aid method and times, reporting, instructions, and referral.',
        sourceRefs: ['RM-OS-003', 'CL-SD-016', '8CCR5193'],
      },
      {
        id: 'l7-airborne', label: 'Masked patient and open-window zone', shortLabel: 'ATD Path', x: 82, y: 47, kind: 'caution',
        observed: 'The masked patient remains several meters away near an open window while the worker stays out of close care.',
        why: 'Source control, distance, and ventilation support the TB pathway, but they do not replace the assigned respiratory plan and fit-tested respirator.',
        action: 'Maintain distance, avoid unplanned entry, and coordinate the visit through the supervisor/DON.',
        notify: 'Supervisor/DON; authorized personnel coordinate provider and public-health actions.',
        document: 'Symptoms, proximity, time, ventilation, source control, respirator status, and disposition.',
        sourceRefs: ['RM-OS-002', '8CCR5199', 'CDC-TB-SPREAD'],
      },
      {
        id: 'l7-report', label: 'Reporting phone and closed clinical bag', shortLabel: 'Escalate', x: 91, y: 68, kind: 'guidance',
        observed: 'The closed bag remains near the exit while communication occurs through a clean reporting route.',
        why: 'Closed-loop reporting prevents either hazard from being lost and avoids contaminating equipment or mixing employee medical facts into patient documentation.',
        action: 'State each hazard separately, repeat back instructions, confirm follow-up ownership, and preserve the clean boundary.',
        notify: 'Use the current supervisor/DON, Risk Management, and Employee Health pathways appropriate to each hazard.',
        document: 'Place patient-care, incident, and confidential employee-health facts only in their authorized records.',
        sourceRefs: ['RM-OS-002', 'RM-OS-003', 'RM-ER-002'],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    mix: 'direct',
    competency: 'Exposure definition',
    stem: 'Which event is a bloodborne-pathogen exposure incident?',
    options: [
      'Blood contacts only intact, unbroken forearm skin and is promptly cleaned.',
      'Blood splashes into the worker’s eye during wound irrigation.',
      'A worker speaks with a patient who has hepatitis C.',
      'A worker carries a sealed, clean specimen transport bag.',
    ],
    correct: 1,
    rationale: 'An eye is a mucous membrane. Specific mucous-membrane, non-intact-skin, or parenteral contact with blood or OPIM triggers the exposure-response process. Casual conversation does not transmit a bloodborne pathogen.',
    sourceRefs: ['RM-OS-003', '8CCR5193'],
  },
  {
    id: 2,
    mix: 'direct',
    competency: 'Respirator sequence',
    stem: 'Which statement correctly distinguishes medical evaluation, fit testing, and a user seal check?',
    options: [
      'A seal check is annual; a fit test is performed every time the respirator is donned.',
      'Passing a fit test with one N95 model covers every N95 model and size.',
      'Medical evaluation comes before fit testing; fit testing covers the exact respirator before use and at least annually; a seal check occurs every donning.',
      'A surgical mask can replace an N95 after a failed fit test.',
    ],
    correct: 2,
    rationale: 'Medical evaluation determines ability to use a respirator before fit testing or required use. Fit testing is for the exact make, model, style, and size before use and at least annually. A user seal check is performed each time that approved respirator is donned.',
    sourceRefs: ['RM-OS-002', '8CCR5144'],
  },
  {
    id: 3,
    mix: 'scenario',
    competency: 'Sharps control',
    stem: 'During an authorized finger-stick, a safety lancet fails to retract. The approved sharps container is upright and within reach. What is the best action?',
    options: [
      'Recap the device with two hands so no one sees the point.',
      'Set it on the bedside tray until documentation is finished.',
      'Keep it controlled, do not bend, recap, or manipulate it, and dispose immediately; if that cannot be done safely, stop, guard the area, and escalate.',
      'Hand it to the caregiver, who knows where household sharps are kept.',
    ],
    correct: 2,
    rationale: 'A failed safety mechanism must not lead to recapping, repair, carrying, or hand-off. Control the device and dispose at once; if safe disposal is not possible, stop, secure the area, and obtain supervisor direction.',
    sourceRefs: ['RM-OS-003', 'RM-PS-002', '8CCR5193'],
  },
  {
    id: 4,
    mix: 'scenario',
    competency: 'Needlestick response',
    stem: 'A used needle penetrates a worker’s glove and skin. Which sequence is correct?',
    options: [
      'Squeeze the wound, apply bleach, and wait for source status.',
      'Wash with soap and water, report immediately, and enter the agency’s prompt same-day occupational-health pathway.',
      'Finish the visit and report at the end of the week if the area becomes red.',
      'Call a personal clinician tomorrow without notifying the agency.',
    ],
    correct: 1,
    rationale: 'Immediate washing, immediate agency reporting, and prompt confidential evaluation are required. Do not squeeze the injury, use caustic chemicals, finish routine work first, or wait for source results.',
    sourceRefs: ['RM-OS-003', 'CL-SD-016', '8CCR5193'],
  },
  {
    id: 5,
    mix: 'scenario',
    competency: 'Mucous-membrane response',
    stem: 'Blood splashes into a worker’s eye during wound irrigation. What should occur?',
    options: [
      'Wipe the eye and continue if vision is normal.',
      'Flush immediately with clean water for the agency-specified duration, report immediately, and obtain prompt evaluation.',
      'Use a disinfecting wipe around the eye and report only if irritation develops.',
      'Report only when the source is known to have HIV.',
    ],
    correct: 1,
    rationale: 'Care Indeed’s BBP plan specifies immediate clean-water flushing for at least 15 minutes, followed by immediate reporting and prompt evaluation. The response does not depend on a known source diagnosis.',
    sourceRefs: ['RM-OS-003', '8CCR5193'],
  },
  {
    id: 6,
    mix: 'scenario',
    competency: 'Unexpected TB symptoms',
    stem: 'At the door, a patient reports four weeks of cough, night sweats, and weight loss. The worker is not currently fit-tested for the supplied N95. What is best?',
    options: [
      'Wear a surgical mask and enter because the visit is brief.',
      'Perform a seal check on the borrowed N95 and enter.',
      'Maintain distance, use patient source control if safe, do not enter or continue close care, and contact the supervisor/DON for the airborne plan.',
      'Enter wearing gloves because TB can be prevented by avoiding surface contact.',
    ],
    correct: 2,
    rationale: 'A seal check cannot replace fit testing, a surgical mask is not worker TB respiratory protection, and gloves do not control inhalation. Pause outside the shared-air area, maintain distance, offer source control when safe, and escalate.',
    sourceRefs: ['RM-OS-002', '8CCR5144', '8CCR5199', 'CDC-TB-SPREAD'],
  },
  {
    id: 7,
    mix: 'scenario',
    competency: 'TB surveillance',
    stem: 'A covered employee has a documented prior positive TB test, prior medical evaluation, and no current symptoms. Which annual approach is safest?',
    options: [
      'Repeat a two-step TST every year.',
      'Obtain a routine chest X-ray every five years without clinical review.',
      'Follow Employee Health’s symptom, risk, and medical process; do not repeat infection testing solely because an annual date arrived unless directed under the applicable plan.',
      'Skip TB education and never report symptoms because a prior positive result is permanent.',
    ],
    correct: 2,
    rationale: 'Workers with prior positive results follow the Employee Health process rather than memorized repeat-test or chest-X-ray schedules. CDC guidance, California duties, and agency rules must be applied to the individual by authorized personnel.',
    sourceRefs: ['HR-WM-003', 'CDC-TB-SCREEN', 'CALOSHA-TB-FAQ'],
  },
  {
    id: 8,
    mix: 'documentation',
    competency: 'Objective exposure record',
    stem: 'Which entry best documents a sharps incident?',
    options: [
      '“Patient probably has HIV; employee extremely upset.”',
      '“14:10, left index puncture from Brand X 30-gauge lancet before safety activation during authorized glucose check; gloves worn; washed immediately; supervisor notified 14:14; occupational-health referral initiated.”',
      'The employee’s laboratory results copied into the patient chart.',
      '“Needlestick happened,” with no device, route, task, or response detail.',
    ],
    correct: 1,
    rationale: 'The defensible entry records objective route, task, device, safety-feature point, PPE, first aid, reporting, and referral. It avoids assumptions about the patient and keeps employee medical results out of the patient chart.',
    sourceRefs: ['RM-OS-003', 'RM-ER-002', '8CCR5193'],
  },
  {
    id: 9,
    mix: 'documentation',
    competency: 'Escalation and confidentiality',
    stem: 'After a needlestick, the source patient asks whether the field worker can require immediate HBV, HCV, and HIV testing. What should the worker do?',
    options: [
      'Demand a blood sample before leaving the home.',
      'Wait for the patient to consent before seeking employee evaluation.',
      'Report the exposure and preserve facts; authorized employer and healthcare personnel handle consent and source testing while employee evaluation proceeds without waiting.',
      'Ask a family member to authorize testing on the patient’s behalf.',
    ],
    correct: 2,
    rationale: 'The worker reports and preserves exposure facts. Authorized personnel manage legal consent and source testing. The exposed employee’s prompt confidential evaluation is not delayed while that process occurs.',
    sourceRefs: ['RM-OS-003', '8CCR5193', 'USPHS-2025'],
  },
  {
    id: 10,
    mix: 'integrative',
    competency: 'Separate hazard pathways',
    stem: 'A patient has possible infectious TB and there is also a blood spill. Which plan correctly separates the hazards?',
    options: [
      'Use only an N95 because it protects against every infection route.',
      'Use a surgical mask and gloves only; both hazards are now controlled.',
      'Use the assigned fit-tested respirator and patient source control for TB; use gloves plus task-appropriate face/body protection and the approved disinfectant for blood if trained and assigned; escalate both hazards through their respective plans.',
      'Leave without reporting because the two hazards cancel each other out.',
    ],
    correct: 2,
    rationale: 'Respiratory controls address inhalation; BBP controls address blood or OPIM contact. Neither substitutes for the other. Apply the assigned controls within role and competency, protect the patient, and report each pathway separately.',
    sourceRefs: ['RM-OS-002', 'RM-OS-003', 'CL-SD-016', '8CCR5193', '8CCR5199'],
  },
];

const SAFETY: Record<SafetyKind, { label: string; color: string; soft: string; icon: React.ReactNode }> = {
  protective: { label: 'Protective control', color: CI.teal, soft: CI.tealSoft, icon: <CheckCircle2 size={18} /> },
  caution: { label: 'Pause and escalate', color: CI.orangeAccessible, soft: CI.orangeSoft, icon: <AlertTriangle size={18} /> },
  hazard: { label: 'Exposure hazard', color: CI.danger, soft: CI.dangerSoft, icon: <XCircle size={18} /> },
  guidance: { label: 'Key guidance', color: CI.muted, soft: '#F1F5F9', icon: <ShieldCheck size={18} /> },
};

const STYLES = `
.m11,.m11 *{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.m11-shell{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748}
.m11-top{height:64px;flex:0 0 64px;display:flex;align-items:center;gap:12px;padding:0 20px;background:#fff;border-bottom:1px solid #E2E8F0}
.m11-brand{display:flex;align-items:center;gap:8px;flex-shrink:0;color:#0F5B54;font-size:12px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
.m11-tabs{display:flex;flex:1;min-width:0;gap:6px;overflow-x:auto;scrollbar-width:none}
.m11-tabs::-webkit-scrollbar{display:none}
.m11-tab{min-height:44px;padding:8px 14px;border:0;border-radius:999px;background:transparent;color:#64748B;font-size:13px;font-weight:650;white-space:nowrap;cursor:pointer}
.m11-tab[aria-selected="true"]{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.m11-tab.quiz{border:2px solid #C74612;color:#A9380D;background:#fff}
.m11-tab.quiz[aria-selected="true"]{border-color:#0F5B54;background:#0F5B54;color:#fff}
.m11-exit{min-height:44px;flex-shrink:0;display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border:2px solid #C74612;border-radius:10px;background:#fff;color:#A9380D;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
.m11-content{display:flex;flex:1;min-height:0}
.m11-work{display:flex;flex:1;min-height:0;padding:16px}
.m11-left{width:42%;min-width:280px;max-width:520px;overflow-y:auto;padding:22px;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;scrollbar-gutter:stable}
.m11-right{display:flex;flex:1;min-width:0;padding:12px;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0}
.m11-stage-wrap{container-type:size;display:grid;width:100%;height:100%;min-height:0;place-items:center}
.m11-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border:1px solid #E2E8F0;border-radius:14px;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.12)}
@supports not (width:1cqh){.m11-stage{width:100%;height:auto}}
.m11-scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.m11-scene-title{position:absolute;top:10px;left:10px;z-index:8;max-width:min(42%,330px);padding:8px 10px;border:1px solid #E2E8F0;border-radius:12px;background:rgba(255,255,255,.95);box-shadow:0 4px 14px rgba(0,0,0,.08);pointer-events:none}
.m11-counter{position:absolute;top:10px;right:10px;z-index:8;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #E2E8F0;border-radius:999px;background:rgba(255,255,255,.95);color:#0F5B54;font-size:11px;font-weight:800;pointer-events:none}
.m11-reset{position:absolute;top:52px;right:10px;z-index:12;min-height:44px;padding:0 11px;display:inline-flex;align-items:center;gap:5px;border:1px solid #CBD5E1;border-radius:999px;background:rgba(255,255,255,.96);color:#475569;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
.m11-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;min-width:48px;min-height:48px;flex-direction:column;align-items:center;gap:5px;padding:0;border:0;background:transparent;cursor:pointer}
.m11-hotspot .orb{position:relative;display:grid;width:48px;height:48px;min-width:48px;min-height:48px;place-items:center;border:3px solid #fff;border-radius:50%;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,.22)}
.m11-hotspot .tag{max-width:140px;padding:5px 8px;border:1px solid #D7E4E2;border-radius:8px;background:rgba(255,255,255,.97);color:#0F5B54;font-size:11px;font-weight:800;line-height:1.2;letter-spacing:.02em;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.1)}
.m11-ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;opacity:.48;pointer-events:none;animation:m11-ping 1.2s cubic-bezier(0,0,.2,1) 2}
.m11-dialog-bg{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(15,91,84,.62);backdrop-filter:blur(6px);animation:m11-pop .25s cubic-bezier(.16,1,.3,1)}
.m11-dialog{width:min(480px,100%);max-height:min(90%,650px);overflow:auto;border:2px solid #C8DFDC;border-radius:16px;background:#fff;box-shadow:0 26px 70px rgba(0,0,0,.28)}
.m11-feedback{padding:12px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC}
.m11-feedback.action{border-color:#C8DFDC;background:#EEF4F3}
.m11-source-list{display:flex;flex-wrap:wrap;gap:6px}
.m11-source-chip{display:inline-flex;align-items:center;min-height:28px;padding:5px 8px;border:1px solid #D7E4E2;border-radius:7px;background:#FAFBF8;color:#475569;font-size:11px;font-weight:750;line-height:1.2;text-decoration:none}
.m11-details{margin:16px 0;border:1px solid #E2E8F0;border-radius:12px;background:#FAFBF8}
.m11-details>summary{min-height:44px;padding:12px 14px;color:#0F5B54;font-size:13px;font-weight:800;cursor:pointer}
.m11-detail-body{padding:14px;border-top:1px solid #E2E8F0;background:#fff}
.m11-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.m11-action{display:flex;gap:10px;padding:12px;border:1px solid #E2E8F0;border-radius:12px;background:#fff}
.m11-complete{position:absolute;inset:0;z-index:24;display:grid;place-items:center;padding:20px;background:rgba(15,91,84,.78);backdrop-filter:blur(7px);animation:m11-pop .25s cubic-bezier(.16,1,.3,1)}
.m11-bot{height:80px;flex:0 0 80px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 24px;background:#fff;border-top:1px solid #E2E8F0}
.m11-nav{min-height:44px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border:0;background:transparent;color:#475569;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.m11-nav:disabled{opacity:.38;cursor:not-allowed}
.m11-next{min-height:44px;display:inline-flex;align-items:center;gap:6px;padding:11px 18px;border:0;border-radius:10px;background:#C74612;color:#fff;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 14px rgba(199,70,18,.28)}
.m11-status{padding:8px 12px;border:1px solid #C8DFDC;border-radius:8px;background:#EEF4F3;color:#0F5B54;font-size:12px;font-weight:800;letter-spacing:.05em;text-align:center;text-transform:uppercase}
.m11-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.m11-quiz-card{width:min(760px,100%);align-self:flex-start;border:1px solid #E2E8F0;border-radius:24px;background:#fff;overflow:hidden;box-shadow:0 24px 60px rgba(15,91,84,.12);animation:m11-slide .3s cubic-bezier(.16,1,.3,1)}
.m11-quiz-header{padding:16px 22px;background:linear-gradient(135deg,#0F5B54 0%,#0A3D39 100%);color:#fff}
.m11-progress-track{height:8px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.2)}
.m11-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#F26D33,#FFB088);transition:width .25s ease}
.m11-option{width:100%;min-height:52px;display:flex;align-items:flex-start;gap:12px;padding:14px;border:2px solid #E2E8F0;border-radius:14px;background:#fff;color:#2D3748;text-align:left;cursor:pointer}
.m11-option[aria-checked="true"]{border-color:#0F5B54;background:#EEF4F3}
.m11-option.correct{border-color:#0F5B54;background:#EEF4F3}
.m11-option.wrong{border-color:#B91C1C;background:#FEF2F2}
.m11-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
.m11-live,.m11-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.m11 button:focus-visible,.m11 a:focus-visible,.m11 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
@keyframes m11-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes m11-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes m11-slide{0%{transform:translateX(20px);opacity:0}100%{transform:translateX(0);opacity:1}}
@media(max-width:900px){
  .m11-top{padding:0 10px;gap:8px}.m11-tab{padding:8px 10px;font-size:12px}.m11-work{flex-direction:column;gap:10px;overflow:auto;padding:10px}
  .m11-left,.m11-right{width:100%;max-width:none;border:1px solid #E2E8F0;border-radius:12px}.m11-left{max-height:42vh}.m11-right{min-height:360px}
  .m11-bot{height:72px;flex-basis:72px;padding:0 12px}.m11-hotspot .tag{max-width:110px}
}
@media(max-width:560px){
  .m11-actions,.m11-result-grid{grid-template-columns:1fr}.m11-status{max-width:42%;padding:6px 8px;font-size:10px}.m11-next{padding:10px 11px;font-size:11px}.m11-nav{font-size:11px}
  .m11-scene-title{max-width:50%}.m11-reset{padding:0 8px}.m11-quiz-page{padding:10px}.m11-quiz-card{border-radius:16px}
}
@media(max-width:420px){.m11-brand .brand-text{display:none}.m11-exit{padding:8px 9px;font-size:11px}.m11-exit .exit-text{display:none}.m11-stage{border-radius:10px}}
@media(prefers-reduced-motion:reduce){.m11-ping,.m11-dialog-bg,.m11-complete,.m11-quiz-card{animation:none!important}.m11-progress-fill{transition:none!important}}
`;

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

function SourceChips({ ids }: { ids: string[] }) {
  return (
    <div className="m11-source-list" role="group" aria-label="Sources">
      {ids.map((id) => {
        const source = SOURCES[id];
        if (!source) return null;
        const text = `${source.kind}: ${source.label}`;
        return source.url ? (
          <a key={id} className="m11-source-chip" href={source.url} target="_blank" rel="noreferrer" title={text}>{text}</a>
        ) : (
          <span key={id} className="m11-source-chip" title={text}>{text}</span>
        );
      })}
    </div>
  );
}

function FeedbackBlock({ label, body, action = false, icon }: {
  label: string;
  body: string;
  action?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`m11-feedback${action ? ' action' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: action ? CI.teal : CI.muted, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {icon}{label}
      </div>
      <div style={{ color: CI.ink, fontSize: 15.5, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function HotspotDialog({ hotspot, completed, onClose, onComplete, trigger }: {
  hotspot: Hotspot;
  completed: boolean;
  onClose: () => void;
  onComplete: () => void;
  trigger: HTMLButtonElement | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const safety = SAFETY[hotspot.kind];

  const closeAndReturn = useCallback(() => {
    onClose();
    window.setTimeout(() => trigger?.focus(), 0);
  }, [onClose, trigger]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 10);
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = priorOverflow;
    };
  }, [hotspot.id]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')).filter((node) => !node.hasAttribute('disabled'));
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
    root.addEventListener('keydown', handleKey);
    return () => root.removeEventListener('keydown', handleKey);
  }, [closeAndReturn]);

  return (
    <div className="m11-dialog-bg" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAndReturn(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="m11-dialog">
        <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 16, borderBottom: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.97)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'grid', width: 38, height: 38, flexShrink: 0, placeItems: 'center', borderRadius: 11, background: safety.color, color: '#fff' }}>{safety.icon}</div>
            <div>
              <h2 id={titleId} style={{ margin: 0, color: CI.teal, fontSize: 16, lineHeight: 1.3 }}>{hotspot.label}</h2>
              <div style={{ marginTop: 3, color: safety.color, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{safety.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close feedback" onClick={closeAndReturn} style={{ display: 'grid', width: 44, height: 44, minWidth: 44, placeItems: 'center', border: `1px solid ${CI.border}`, borderRadius: '50%', background: CI.bg, cursor: 'pointer' }}><X size={19} /></button>
        </div>
        <p id={descId} className="m11-sr-only">Observation feedback with safe action, notification, documentation, and sources.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: 16 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observed} icon={<Eye size={14} />} />
          <FeedbackBlock label="Why it matters" body={hotspot.why} />
          <FeedbackBlock label="Safe field-worker action" body={hotspot.action} action icon={<ShieldCheck size={14} />} />
          {hotspot.notify && <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <SourceChips ids={hotspot.sourceRefs} />
          <button type="button" onClick={() => { if (!completed) onComplete(); closeAndReturn(); }} style={{ minHeight: 48, border: 0, borderRadius: 12, background: completed ? CI.tealSoft : CI.teal, color: completed ? CI.teal : '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {completed ? 'Close review' : 'Mark observed'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonPanel({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <section className="m11-left" aria-labelledby={`m11-lesson-title-${lesson.id}`}>
      <div style={{ display: 'inline-block', marginBottom: 13, padding: '4px 10px', border: `1px solid ${CI.tealMuted}`, borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        Lesson {index + 1} · {index + 1} of {LESSONS.length}
      </div>
      <h1 id={`m11-lesson-title-${lesson.id}`} style={{ margin: '0 0 6px', color: '#1F1C1B', fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>{lesson.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeAccessible, fontSize: 15, fontWeight: 700 }}>{lesson.subtitle}</p>
      {lesson.overview.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex} style={{ margin: '0 0 12px', color: '#524C4B', fontSize: 17, lineHeight: 1.65 }}>{paragraph}</p>
      ))}

      <details className="m11-details">
        <summary>View Full Lesson Details</summary>
        <div className="m11-detail-body">
          {lesson.details.map((section) => (
            <section key={section.heading} style={{ marginBottom: 18 }}>
              <h2 style={{ margin: '0 0 9px', color: CI.teal, fontSize: 17, lineHeight: 1.35 }}>{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} style={{ margin: '0 0 10px', color: '#524C4B', fontSize: 16, lineHeight: 1.65 }}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 22, color: '#524C4B', fontSize: 16, lineHeight: 1.6 }}>
                  {section.bullets.map((bullet) => <li key={bullet} style={{ marginBottom: 7 }}>{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </details>

      <div style={{ marginBottom: 10, color: CI.muted, fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Key Clinical Actions</div>
      <div className="m11-actions">
        {lesson.keyActions.map((item) => (
          <div key={item.title} className="m11-action">
            <span aria-hidden="true" style={{ fontSize: 18 }}>{item.icon}</span>
            <div>
              <div style={{ marginBottom: 2, color: '#1F1C1B', fontSize: 13, fontWeight: 800 }}>{item.title}</div>
              <div style={{ color: CI.muted, fontSize: 14, lineHeight: 1.45 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <aside style={{ marginBottom: 14, padding: 14, border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeAccessible}`, borderRadius: 12, background: '#FAFBF8' }}>
        <div style={{ marginBottom: 6, color: CI.orangeAccessible, fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Clinical Tip</div>
        <div style={{ color: '#524C4B', fontSize: 15, lineHeight: 1.55 }}>{lesson.clinicalTip}</div>
      </aside>
      <SourceChips ids={lesson.sourceRefs} />
    </section>
  );
}

function ScenePanel({
  lesson,
  completed,
  onObserve,
  onReset,
  onContinue,
  continueLabel,
}: {
  lesson: Lesson;
  completed: string[];
  onObserve: (hotspotId: string) => void;
  onReset: () => void;
  onContinue: () => void;
  continueLabel: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<HTMLButtonElement | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const triggerMap = useRef<Record<string, HTMLButtonElement | null>>({});
  const completeRef = useRef<HTMLButtonElement>(null);
  const reviewCompleteRef = useRef<HTMLButtonElement>(null);
  const lastObservedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (showComplete) completeRef.current?.focus();
  }, [showComplete]);

  const activeHotspot = lesson.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const guidedId = lesson.hotspots.find((hotspot) => !completed.includes(hotspot.id))?.id;

  const observe = (hotspot: Hotspot) => {
    const willFinish = !completed.includes(hotspot.id) && completed.length + 1 === lesson.hotspots.length;
    lastObservedIdRef.current = hotspot.id;
    onObserve(hotspot.id);
    if (willFinish) window.setTimeout(() => setShowComplete(true), 30);
  };

  const dismissComplete = () => {
    setShowComplete(false);
    const lastId = lastObservedIdRef.current;
    window.setTimeout(() => { if (lastId) triggerMap.current[lastId]?.focus(); }, 0);
  };

  const handleCompleteKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismissComplete();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = [completeRef.current, reviewCompleteRef.current].filter((node): node is HTMLButtonElement => Boolean(node));
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

  return (
    <section id={`m11-panel-${lesson.id}`} role="tabpanel" aria-labelledby={`m11-tab-${lesson.id}`} className="m11-right">
      <div className="m11-stage-wrap">
        <div className="m11-stage" role="region" aria-label={`${lesson.title} interactive scene`}>
          <img className="m11-scene" src={lesson.sceneImage} alt={lesson.sceneAlt} draggable={false} />
          <div className="m11-scene-title" aria-hidden="true">
            <div style={{ color: CI.orangeAccessible, fontSize: 11, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase' }}>{lesson.shortName}</div>
            <div style={{ marginTop: 2, color: CI.teal, fontSize: 13, fontWeight: 800 }}>{lesson.title}</div>
          </div>
          <div className="m11-counter" aria-hidden="true"><Eye size={14} /> {completed.length} / {lesson.hotspots.length} observed</div>
          <div className="m11-live" aria-live="polite">{completed.length} of {lesson.hotspots.length} observations complete for {lesson.title}.</div>

          {lesson.hotspots.map((hotspot) => {
            const done = completed.includes(hotspot.id);
            const safety = SAFETY[hotspot.kind];
            return (
              <button
                key={hotspot.id}
                ref={(node) => { triggerMap.current[hotspot.id] = node; }}
                type="button"
                className="m11-hotspot"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                aria-label={done ? `${hotspot.label}, observed. Open review.` : `Investigate ${hotspot.label}`}
                onClick={(event) => {
                  setActiveTrigger(event.currentTarget);
                  setActiveId(hotspot.id);
                }}
              >
                <span className="orb" style={{ background: done ? CI.teal : safety.color }}>
                  {hotspot.id === guidedId && !done && <span className="m11-ping" aria-hidden="true" />}
                  {done ? <Check size={17} strokeWidth={3} aria-hidden="true" /> : safety.icon}
                </span>
                <span className="tag">{hotspot.shortLabel}</span>
              </button>
            );
          })}

          <button type="button" className="m11-reset" aria-label={`Reset observations for ${lesson.title}`} onClick={() => { onReset(); setShowComplete(false); }}>
            <RotateCcw size={14} /> Reset
          </button>

          {activeHotspot && (
            <HotspotDialog
              hotspot={activeHotspot}
              completed={completed.includes(activeHotspot.id)}
              trigger={activeTrigger}
              onClose={() => {
                setActiveId(null);
                setActiveTrigger(null);
              }}
              onComplete={() => observe(activeHotspot)}
            />
          )}

          {showComplete && (
            <div className="m11-complete" role="dialog" aria-modal="true" aria-labelledby={`m11-complete-title-${lesson.id}`} aria-describedby={`m11-complete-desc-${lesson.id}`} onKeyDown={handleCompleteKey}>
              <div style={{ width: 'min(410px,100%)', padding: 24, border: `4px solid ${CI.tealSoft}`, borderRadius: 17, background: '#fff', textAlign: 'center' }}>
                <div style={{ display: 'grid', width: 62, height: 62, margin: '0 auto 12px', placeItems: 'center', borderRadius: '50%', background: CI.tealSoft }}><ShieldCheck size={32} color={CI.teal} aria-hidden="true" /></div>
                <h2 id={`m11-complete-title-${lesson.id}`} style={{ margin: '0 0 7px', color: CI.teal, fontSize: 19 }}>Scene observations complete</h2>
                <p id={`m11-complete-desc-${lesson.id}`} style={{ margin: '0 0 16px', color: CI.muted, fontSize: 14, lineHeight: 1.55 }}>You may review any observation. Knowledge practice does not replace role-specific competency, Employee Health clearance, or respirator fit testing.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <button ref={completeRef} type="button" onClick={() => { setShowComplete(false); onContinue(); }} style={{ minHeight: 46, border: 0, borderRadius: 11, background: CI.orangeAccessible, color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer' }}>{continueLabel}</button>
                  <button ref={reviewCompleteRef} type="button" onClick={dismissComplete} style={{ minHeight: 44, border: `1px solid ${CI.border}`, borderRadius: 11, background: '#fff', color: CI.teal, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Review scene</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface AttemptRecord {
  attempt: number;
  score: number;
  percent: number;
  passed: boolean;
  completedAt: string;
}

export interface ProgressState {
  schemaVersion: 1;
  moduleId: typeof MODULE_META.id;
  contentVersion: string;
  questionBankVersion: string;
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers: Array<number | null>;
  quizSubmitted: boolean[];
  quizIndex: number;
  quizFinished: boolean;
  attemptHistory: AttemptRecord[];
  completionReported: boolean;
  updatedAt: string;
}

function blankProgress(): ProgressState {
  return {
    schemaVersion: 1,
    moduleId: MODULE_META.id,
    contentVersion: MODULE_META.contentVersion,
    questionBankVersion: MODULE_META.questionBankVersion,
    pageIndex: 0,
    mode: 'lessons',
    completedByPage: {},
    quizAnswers: Array(QUIZ.length).fill(null),
    quizSubmitted: Array(QUIZ.length).fill(false),
    quizIndex: 0,
    quizFinished: false,
    attemptHistory: [],
    completionReported: false,
    updatedAt: new Date().toISOString(),
  };
}

function clamp(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.trunc(value)))
    : fallback;
}

function sanitizeProgress(raw: unknown): ProgressState {
  const clean = blankProgress();
  if (!raw || typeof raw !== 'object') return clean;
  const candidate = raw as Partial<ProgressState>;
  if (candidate.moduleId !== MODULE_META.id || candidate.schemaVersion !== 1) return clean;

  clean.pageIndex = clamp(candidate.pageIndex, 0, LESSONS.length - 1, 0);
  clean.mode = candidate.mode === 'quiz' ? 'quiz' : 'lessons';

  if (candidate.completedByPage && typeof candidate.completedByPage === 'object') {
    LESSONS.forEach((lesson) => {
      const source = (candidate.completedByPage as Record<number, unknown>)[lesson.id];
      if (!Array.isArray(source)) return;
      const allowed = new Set(lesson.hotspots.map((hotspot) => hotspot.id));
      clean.completedByPage[lesson.id] = Array.from(new Set(source.filter((id): id is string => typeof id === 'string' && allowed.has(id))));
    });
  }

  const sameQuestionBank = candidate.questionBankVersion === MODULE_META.questionBankVersion;
  if (sameQuestionBank && Array.isArray(candidate.quizAnswers) && candidate.quizAnswers.length === QUIZ.length) {
    clean.quizAnswers = candidate.quizAnswers.map((answer) => (
      typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer <= 3 ? answer : null
    ));
  }
  if (sameQuestionBank && Array.isArray(candidate.quizSubmitted) && candidate.quizSubmitted.length === QUIZ.length) {
    clean.quizSubmitted = candidate.quizSubmitted.map((submitted, index) => Boolean(submitted) && clean.quizAnswers[index] !== null);
  }
  clean.quizIndex = sameQuestionBank ? clamp(candidate.quizIndex, 0, QUIZ.length - 1, 0) : 0;

  if (sameQuestionBank && Array.isArray(candidate.attemptHistory)) {
    clean.attemptHistory = candidate.attemptHistory.slice(0, MODULE_META.maxAttempts).flatMap((record, index) => {
      if (!record || typeof record !== 'object') return [];
      const item = record as Partial<AttemptRecord>;
      const score = clamp(item.score, 0, QUIZ.length, 0);
      const percent = Math.round((score / QUIZ.length) * 100);
      return [{
        attempt: index + 1,
        score,
        percent,
        passed: percent >= MODULE_META.passingPercent,
        completedAt: typeof item.completedAt === 'string' ? item.completedAt : clean.updatedAt,
      }];
    });
  }

  const allSubmitted = clean.quizSubmitted.every(Boolean);
  clean.quizFinished = Boolean(candidate.quizFinished) && allSubmitted && clean.attemptHistory.length > 0;
  clean.completionReported = Boolean(candidate.completionReported);
  clean.updatedAt = typeof candidate.updatedAt === 'string' ? candidate.updatedAt : clean.updatedAt;
  return clean;
}

function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return blankProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : blankProgress();
  } catch {
    return blankProgress();
  }
}

function persistProgress(progress: ProgressState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function lessonWorkComplete(progress: ProgressState): boolean {
  return LESSONS.every((lesson) => {
    const completed = progress.completedByPage[lesson.id] ?? [];
    return lesson.hotspots.every((hotspot) => completed.includes(hotspot.id));
  });
}

function scoreAnswers(answers: Array<number | null>): number {
  return QUIZ.reduce((score, question, index) => score + (answers[index] === question.correct ? 1 : 0), 0);
}

function QuizPage({
  progress,
  onSelect,
  onSubmit,
  onNext,
  onFinalize,
  onRetake,
  onBack,
}: {
  progress: ProgressState;
  onSelect: (optionIndex: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  onFinalize: () => void;
  onRetake: () => void;
  onBack: () => void;
}) {
  const question = QUIZ[progress.quizIndex];
  const selected = progress.quizAnswers[progress.quizIndex];
  const submitted = progress.quizSubmitted[progress.quizIndex];
  const questionTitleId = `m11-question-${question.id}`;
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const questionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!progress.quizFinished) questionRef.current?.focus();
  }, [progress.quizIndex, progress.quizFinished]);

  if (progress.quizFinished) {
    const latest = progress.attemptHistory[progress.attemptHistory.length - 1];
    const passed = Boolean(latest?.passed);
    const lessonComplete = lessonWorkComplete(progress);
    const completionEligible = passed && lessonComplete;
    const attemptsRemaining = MODULE_META.maxAttempts - progress.attemptHistory.length;
    return (
      <section id="m11-panel-quiz" role="tabpanel" aria-labelledby="m11-tab-quiz" className="m11-quiz-page">
        <div className="m11-quiz-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ marginBottom: 8, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase' }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }} aria-label={`Score ${latest?.percent ?? 0} percent`}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke={CI.border} strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={passed ? CI.teal : CI.orangeAccessible} strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray={`${latest?.percent ?? 0} 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div><div style={{ color: passed ? CI.teal : CI.orangeAccessible, fontSize: 28, fontWeight: 850 }}>{latest?.percent ?? 0}%</div><div style={{ color: CI.muted, fontSize: 11, fontWeight: 750 }}>{latest?.score ?? 0}/{QUIZ.length}</div></div>
            </div>
          </div>
          <h1 style={{ margin: '0 0 7px', color: CI.teal, fontSize: 23 }}>{passed ? 'Required score achieved' : 'Review and retake required'}</h1>
          <p style={{ maxWidth: 580, margin: '0 auto 12px', color: CI.muted, fontSize: 15, lineHeight: 1.6 }}>
            {passed
              ? completionEligible
                ? 'Assessment and required scene observations are complete. The host may now record annual-training knowledge completion.'
                : 'The assessment is passed. Complete all lesson observations before the host may record completion.'
              : `A score of ${MODULE_META.passingPercent}% is required. ${attemptsRemaining > 0 ? `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remain.` : 'All three attempts are used; contact the training administrator for assigned remediation or reset.'}`}
          </p>
          <p style={{ maxWidth: 620, margin: '0 auto 18px', padding: 13, border: `1px solid ${CI.tealMuted}`, borderRadius: 12, background: CI.tealSoft, color: CI.ink, fontSize: 13.5, lineHeight: 1.55 }}>
            Completion does not expand scope, authorize a sharps or specimen procedure, replace role-specific skills validation, provide respirator medical clearance or fit testing, or determine fitness for duty.
          </p>
          <div className="m11-result-grid" aria-label="Safety synthesis">
            {[
              { title: 'Prevent', detail: 'Plan · engineer · use safe work practices', color: CI.teal },
              { title: 'Respond', detail: 'Wash or flush · report immediately', color: CI.orangeAccessible },
              { title: 'Follow up', detail: 'Confidential evaluation · correct records', color: CI.teal },
            ].map((item) => (
              <div key={item.title} style={{ padding: 14, border: `1px solid ${CI.border}`, borderRadius: 14, background: CI.bg }}>
                <div style={{ width: 10, height: 10, margin: '0 auto 8px', borderRadius: '50%', background: item.color }} />
                <div style={{ color: CI.ink, fontSize: 12, fontWeight: 850 }}>{item.title}</div>
                <div style={{ marginTop: 4, color: CI.muted, fontSize: 11.5, lineHeight: 1.4 }}>{item.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 18px', border: `1px solid ${CI.border}`, borderRadius: 11, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Back to lessons</button>
            {!passed && attemptsRemaining > 0 && <button type="button" onClick={onRetake} style={{ minHeight: 44, padding: '0 18px', border: 0, borderRadius: 11, background: CI.orangeAccessible, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Retake Knowledge Check</button>}
          </div>
        </div>
      </section>
    );
  }

  const progressPercent = ((progress.quizIndex + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const isCorrect = selected === question.correct;
  const moveSelection = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(3, nextIndex));
    if (!submitted) onSelect(bounded);
    optionRefs.current[bounded]?.focus();
  };

  return (
    <section id="m11-panel-quiz" role="tabpanel" aria-labelledby="m11-tab-quiz" className="m11-quiz-page">
      <div className="m11-quiz-card">
        <header className="m11-quiz-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}><ShieldCheck size={17} /> Field Judgment Check</div>
            <div style={{ fontSize: 12, fontWeight: 750 }}>{progress.quizIndex + 1} / {QUIZ.length}</div>
          </div>
          <div className="m11-progress-track" role="progressbar" aria-label="Knowledge Check progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPercent)}>
            <div className="m11-progress-fill" style={{ width: `${Math.max(progressPercent, 4)}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', opacity: .9 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </header>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', marginBottom: 12, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{question.mix} · {question.competency}</div>
          <h1 ref={questionRef} tabIndex={-1} id={questionTitleId} style={{ margin: '0 0 18px', color: CI.ink, fontSize: 20, fontWeight: 800, lineHeight: 1.45 }}>{question.stem}</h1>
          <div role="radiogroup" aria-labelledby={questionTitleId} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map((option, optionIndex) => {
              const checked = selected === optionIndex;
              const optionCorrect = submitted && optionIndex === question.correct;
              const optionWrong = submitted && checked && !isCorrect;
              const tabIndex = selected === null ? (optionIndex === 0 ? 0 : -1) : (checked ? 0 : -1);
              return (
                <button
                  key={option}
                  ref={(node) => { optionRefs.current[optionIndex] = node; }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={tabIndex}
                  disabled={submitted}
                  className={`m11-option${optionCorrect ? ' correct' : ''}${optionWrong ? ' wrong' : ''}`}
                  onClick={() => { if (!submitted) onSelect(optionIndex); }}
                  onKeyDown={(event) => {
                    if (submitted) return;
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveSelection((selected ?? optionIndex) + 1 > 3 ? 0 : (selected ?? optionIndex) + 1); }
                    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveSelection((selected ?? optionIndex) - 1 < 0 ? 3 : (selected ?? optionIndex) - 1); }
                    else if (event.key === 'Home') { event.preventDefault(); moveSelection(0); }
                    else if (event.key === 'End') { event.preventDefault(); moveSelection(3); }
                    else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); onSelect(optionIndex); }
                  }}
                >
                  <span aria-hidden="true" style={{ display: 'grid', width: 28, height: 28, flexShrink: 0, placeItems: 'center', borderRadius: 8, background: checked ? CI.teal : '#E2E8F0', color: checked ? '#fff' : CI.ink, fontSize: 12, fontWeight: 850 }}>{String.fromCharCode(65 + optionIndex)}</span>
                  <span style={{ paddingTop: 3, fontSize: 16, fontWeight: 650, lineHeight: 1.5 }}>{option}</span>
                  {optionCorrect && <CheckCircle2 size={19} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true" />}
                  {optionWrong && <XCircle size={19} color={CI.danger} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div role="status" aria-live="polite" style={{ marginTop: 14, padding: 14, border: `1px solid ${isCorrect ? CI.tealMuted : '#F3B7A0'}`, borderRadius: 14, background: isCorrect ? CI.tealSoft : CI.orangeSoft }}>
              <div style={{ marginBottom: 6, color: isCorrect ? CI.teal : CI.orangeDark, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>{isCorrect ? 'Correct — rationale' : 'Review — rationale'}</div>
              <div style={{ marginBottom: 10, color: CI.ink, fontSize: 15.5, lineHeight: 1.6 }}>{question.rationale}</div>
              <SourceChips ids={question.sourceRefs} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', border: `1px solid ${CI.border}`, borderRadius: 11, background: '#fff', color: CI.muted, fontWeight: 800, cursor: 'pointer' }}>Exit to lessons</button>
            {!submitted ? (
              <button type="button" disabled={selected === null} onClick={onSubmit} style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 11, background: CI.orangeAccessible, color: '#fff', fontSize: 13, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? .5 : 1 }}>Lock in answer</button>
            ) : (
              <button type="button" onClick={progress.quizIndex === QUIZ.length - 1 ? onFinalize : onNext} style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 11, background: CI.orangeAccessible, color: '#fff', fontSize: 13, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {progress.quizIndex === QUIZ.length - 1 ? 'View results' : 'Next question'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export interface ACHCARTM11Props {
  onSaveExit?: (progress: Readonly<ProgressState>) => void | Promise<void>;
  onComplete?: (payload: {
    moduleId: typeof MODULE_META.id;
    score: number;
    percent: number;
    attempt: number;
    completedAt: string;
    knowledgeOnly: true;
  }) => void | Promise<void>;
}

export default function ACHCARTM11({ onSaveExit, onComplete }: ACHCARTM11Props) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const progressRef = useRef(progress);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const completionInFlight = useRef(false);

  const updateProgress = useCallback((producer: (current: ProgressState) => ProgressState): ProgressState => {
    const produced = producer(progressRef.current);
    const next = { ...produced, updatedAt: new Date().toISOString() };
    progressRef.current = next;
    setProgress(next);
    return next;
  }, []);

  useEffect(() => {
    try {
      persistProgress(progress);
    } catch {
      setSaveMessage('Progress could not be saved in this browser. Save & Exit will remain here until saving succeeds.');
    }
  }, [progress]);

  useEffect(() => {
    const latest = progress.attemptHistory[progress.attemptHistory.length - 1];
    const eligible = Boolean(latest?.passed) && lessonWorkComplete(progress);
    if (!eligible || progress.completionReported || !onComplete || completionInFlight.current) return;
    completionInFlight.current = true;
    const payload = {
      moduleId: MODULE_META.id,
      score: latest.score,
      percent: latest.percent,
      attempt: latest.attempt,
      completedAt: latest.completedAt,
      knowledgeOnly: true as const,
    };
    Promise.resolve(onComplete(payload))
      .then(() => {
        const next = updateProgress((current) => ({ ...current, completionReported: true }));
        try { persistProgress(next); } catch { /* Auto-save message already covers storage failure. */ }
      })
      .catch(() => setSaveMessage('Knowledge requirements are met, but host completion reporting failed. Your local progress remains saved; retry from the host.'))
      .finally(() => { completionInFlight.current = false; });
  }, [onComplete, progress, updateProgress]);

  const page = LESSONS[progress.pageIndex];
  const currentCompleted = progress.completedByPage[page.id] ?? [];
  const selectedTabIndex = progress.mode === 'quiz' ? LESSONS.length : progress.pageIndex;

  const goToLesson = (index: number) => {
    const bounded = Math.max(0, Math.min(LESSONS.length - 1, index));
    updateProgress((current) => ({ ...current, mode: 'lessons', pageIndex: bounded }));
  };
  const goToQuiz = () => updateProgress((current) => ({ ...current, mode: 'quiz' }));

  const activateTab = (index: number) => {
    if (index === LESSONS.length) goToQuiz();
    else goToLesson(index);
  };

  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % (LESSONS.length + 1);
    else if (event.key === 'ArrowLeft') next = (index - 1 + LESSONS.length + 1) % (LESSONS.length + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = LESSONS.length;
    else return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    activateTab(next);
  };

  const observeHotspot = (hotspotId: string) => {
    updateProgress((current) => {
      const existing = current.completedByPage[page.id] ?? [];
      if (existing.includes(hotspotId)) return current;
      return {
        ...current,
        completedByPage: { ...current.completedByPage, [page.id]: [...existing, hotspotId] },
      };
    });
  };

  const resetLesson = () => {
    updateProgress((current) => ({
      ...current,
      completedByPage: { ...current.completedByPage, [page.id]: [] },
      completionReported: false,
    }));
  };

  const selectQuizOption = (optionIndex: number) => {
    updateProgress((current) => {
      if (current.quizSubmitted[current.quizIndex] || current.quizFinished) return current;
      const answers = [...current.quizAnswers];
      answers[current.quizIndex] = optionIndex;
      return { ...current, quizAnswers: answers };
    });
  };

  const submitQuizAnswer = () => {
    updateProgress((current) => {
      if (current.quizAnswers[current.quizIndex] === null || current.quizSubmitted[current.quizIndex]) return current;
      const submitted = [...current.quizSubmitted];
      submitted[current.quizIndex] = true;
      return { ...current, quizSubmitted: submitted };
    });
  };

  const nextQuizQuestion = () => {
    updateProgress((current) => ({ ...current, quizIndex: Math.min(QUIZ.length - 1, current.quizIndex + 1) }));
  };

  const finalizeQuiz = () => {
    updateProgress((current) => {
      if (current.quizFinished || !current.quizSubmitted.every(Boolean)) return current;
      if (current.attemptHistory.length >= MODULE_META.maxAttempts) return current;
      const score = scoreAnswers(current.quizAnswers);
      const percent = Math.round((score / QUIZ.length) * 100);
      const record: AttemptRecord = {
        attempt: current.attemptHistory.length + 1,
        score,
        percent,
        passed: percent >= MODULE_META.passingPercent,
        completedAt: new Date().toISOString(),
      };
      return { ...current, quizFinished: true, attemptHistory: [...current.attemptHistory, record], completionReported: false };
    });
  };

  const retakeQuiz = () => {
    updateProgress((current) => {
      const latest = current.attemptHistory[current.attemptHistory.length - 1];
      if (latest?.passed || current.attemptHistory.length >= MODULE_META.maxAttempts) return current;
      return {
        ...current,
        mode: 'quiz',
        quizAnswers: Array(QUIZ.length).fill(null),
        quizSubmitted: Array(QUIZ.length).fill(false),
        quizIndex: 0,
        quizFinished: false,
        completionReported: false,
      };
    });
  };

  const saveAndExit = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const snapshot = progressRef.current;
      persistProgress(snapshot);
      if (onSaveExit) {
        await onSaveExit(snapshot);
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        setSaveMessage('Progress saved. This standalone preview has no host exit route; you may close the window safely.');
      }
    } catch {
      setSaveMessage('Progress could not be saved or the host exit failed. You have not been navigated away; retry Save & Exit.');
    } finally {
      setSaving(false);
    }
  };

  const latestAttempt = progress.attemptHistory[progress.attemptHistory.length - 1];
  const quizStatus = progress.quizFinished
    ? `${latestAttempt?.percent ?? 0}% · attempt ${latestAttempt?.attempt ?? 1}`
    : `Question ${progress.quizIndex + 1} of ${QUIZ.length}`;

  return (
    <div className="m11 m11-shell">
      <style>{STYLES}</style>
      <header className="m11-top">
        <div className="m11-brand" role="group" aria-label={`${MODULE_META.id}, ${MODULE_META.title}`}>
          <BrandMark />
          <span className="brand-text">TB &amp; BBP</span>
        </div>
        <div className="m11-tabs" role="tablist" aria-label="Module lessons and Knowledge Check">
          {LESSONS.map((lesson, index) => (
            <button
              key={lesson.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`m11-tab-${lesson.id}`}
              type="button"
              role="tab"
              aria-selected={progress.mode === 'lessons' && progress.pageIndex === index}
              aria-controls={`m11-panel-${lesson.id}`}
              tabIndex={selectedTabIndex === index ? 0 : -1}
              className="m11-tab"
              onClick={() => goToLesson(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              {index + 1}. {lesson.shortName}
            </button>
          ))}
          <button
            ref={(node) => { tabRefs.current[LESSONS.length] = node; }}
            id="m11-tab-quiz"
            type="button"
            role="tab"
            aria-selected={progress.mode === 'quiz'}
            aria-controls="m11-panel-quiz"
            tabIndex={selectedTabIndex === LESSONS.length ? 0 : -1}
            className="m11-tab quiz"
            onClick={goToQuiz}
            onKeyDown={(event) => handleTabKey(event, LESSONS.length)}
          >
            Knowledge Check
          </button>
        </div>
        <button type="button" className="m11-exit" onClick={saveAndExit} disabled={saving}>
          <Save size={16} aria-hidden="true" /><span className="exit-text">{saving ? 'Saving…' : 'Save & Exit'}</span>
        </button>
      </header>

      {saveMessage && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', top: 70, right: 12, zIndex: 80, maxWidth: 430, padding: '10px 13px', border: `1px solid ${saveMessage.includes('could not') || saveMessage.includes('failed') ? '#F3B7A0' : CI.tealMuted}`, borderRadius: 10, background: '#fff', color: CI.ink, boxShadow: '0 8px 26px rgba(0,0,0,.14)', fontSize: 13, lineHeight: 1.45 }}>
          {saveMessage}
        </div>
      )}

      <main className="m11-content">
        {progress.mode === 'quiz' ? (
          <QuizPage
          progress={progress}
          onSelect={selectQuizOption}
          onSubmit={submitQuizAnswer}
          onNext={nextQuizQuestion}
          onFinalize={finalizeQuiz}
          onRetake={retakeQuiz}
          onBack={() => goToLesson(progress.pageIndex)}
          />
        ) : (
          <div className="m11-work">
          <LessonPanel lesson={page} index={progress.pageIndex} />
          <ScenePanel
            key={page.id}
            lesson={page}
            completed={currentCompleted}
            onObserve={observeHotspot}
            onReset={resetLesson}
            onContinue={() => progress.pageIndex === LESSONS.length - 1 ? goToQuiz() : goToLesson(progress.pageIndex + 1)}
            continueLabel={progress.pageIndex === LESSONS.length - 1 ? 'Go to Knowledge Check' : 'Continue to next lesson'}
          />
          </div>
        )}
      </main>

      <footer className="m11-bot">
        <button
          type="button"
          className="m11-nav"
          disabled={progress.mode === 'lessons' && progress.pageIndex === 0}
          aria-label={progress.mode === 'quiz' ? 'Return to lessons' : 'Previous lesson'}
          onClick={() => progress.mode === 'quiz' ? goToLesson(progress.pageIndex) : goToLesson(progress.pageIndex - 1)}
        >
          <ChevronLeft size={17} aria-hidden="true" /> Previous
        </button>
        <div className="m11-status">
          {progress.mode === 'quiz'
            ? `Knowledge Check · ${quizStatus}`
            : `Lesson ${progress.pageIndex + 1} of ${LESSONS.length} · ${currentCompleted.length}/${page.hotspots.length} observed`}
        </div>
        {progress.mode === 'quiz' ? (
          <button type="button" className="m11-next" onClick={() => goToLesson(progress.pageIndex)}>Back to lessons <ChevronRight size={16} aria-hidden="true" /></button>
        ) : (
          <button type="button" className="m11-next" onClick={() => progress.pageIndex === LESSONS.length - 1 ? goToQuiz() : goToLesson(progress.pageIndex + 1)}>
            {progress.pageIndex === LESSONS.length - 1 ? 'Knowledge Check' : 'Next'} <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </footer>
    </div>
  );
}
