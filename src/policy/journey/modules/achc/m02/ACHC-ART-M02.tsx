/**
 * ACHC-ART-M02 — Emergency & Disaster Preparedness
 * Care Indeed Home Health Care, Inc. annual field-worker learning module.
 * Seven lessons + 35 scene hotspots + seven decision checks + 10-item final quiz.
 * Knowledge practice only; this module does not expand scope or validate competency.
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  FileText, Phone, RotateCcw, ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-agency-plan.png';
import img02 from './assets/lesson-02-all-hazards.png';
import img03 from './assets/lesson-03-priority-triage.png';
import img04 from './assets/lesson-04-evacuation.png';
import img05 from './assets/lesson-05-dependencies.png';
import img06 from './assets/lesson-06-downtime.png';
import img07 from './assets/lesson-07-simulation.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#C2410C', orangeDark: '#9A3412', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#B91C1C',
  white: '#FFFFFF', bg: '#F8FAFC',
} as const;

type ActionKind = 'ready' | 'coordinate' | 'unsafe' | 'guidance';

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  kind: ActionKind;
  observed: string;
  why: string;
  action: string;
  notify?: string;
  document: string;
  refs: string[];
}

interface DecisionCheck {
  prompt: string;
  options: string[];
  correct: number;
  feedback: string;
}

interface Lesson {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: string[];
  actions: { icon: string; title: string; detail: string }[];
  tip: string;
  sources: { kind: string; text: string }[];
  image: string;
  imageAlt: string;
  hotspots: Hotspot[];
  check: DecisionCheck;
  overlay: { heading: string; body: string };
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
}

const KIND: Record<ActionKind, { label: string; color: string; soft: string }> = {
  ready: { label: 'Ready action', color: CI.teal, soft: CI.tealSoft },
  coordinate: { label: 'Coordinate first', color: CI.orange, soft: '#FFF3EC' },
  unsafe: { label: 'Unsafe action', color: CI.red, soft: '#FEF2F2' },
  guidance: { label: 'Decision guidance', color: CI.muted, soft: '#F1F5F9' },
};

const META = {
  id: 'ACHC-ART-M02',
  title: 'Emergency & Disaster Preparedness',
  passing: 80,
  storageKey: 'achc-art-m02-progress-v1',
};

const LESSONS: Lesson[] = [
  {
    id: 0,
    shortName: 'Your Role',
    title: 'The Agency Emergency Plan & Your Field Role',
    subtitle: 'Protect life, follow the active communication chain, and remain within the assignment you receive',
    overview: [
      'Emergency preparedness is patient care in a disrupted environment. A wildfire, earthquake, power loss, cyber outage, infectious-disease surge, or staffing failure can interrupt ordinary visits and make home dependencies unsafe.',
      'Your field role is consistent: protect immediate life safety, report verified facts, follow the current agency assignment, stay within the plan and your role, and document the actual sequence. You do not self-deploy, promise resources, or independently rewrite an emergency care plan.',
    ],
    details: [
      'Federal requirement: 42 CFR § 484.102 organizes a home health emergency program around four elements — a risk-based emergency plan, policies and procedures, a communication plan, and a training and testing program. It also requires individual patient planning, follow-up when services are interrupted, protected and available medical documentation, and coordination with emergency officials.',
      'California requirement: 22 CCR § 74721 requires a written emergency-preparedness plan designed to continue care and services when an emergency interrupts patient care. Accreditation traceability: the supplied compliance mapping links emergency management to ACHC HH7-2A.01, HH7-2B.01, and HH7-3A through HH7-3E; consult the agency’s licensed ACHC standards for exact accreditation language.',
      'The current federal rule requires the plan, policies, communication plan, and training program to be reviewed and updated at least every two years; it requires emergency training at least every two years and testing exercises at least annually. Care Indeed assigns this module on hire and annually as an agency training standard. The current approved emergency program controls any additional drill or exercise cadence; the annual training assignment is not the federal minimum.',
      'Agency leadership activates and directs the emergency response. Clinical leaders make continuity and patient-priority decisions. If you encounter immediate danger, leave the hazard area and call 911. Do not enter a restricted zone, cross a public-safety barrier, remain in an unsafe structure, or drive through floodwater to complete a routine assignment.',
      'Use the primary or alternate communication method in the active plan. Give a compact report: your safe location, verified hazard, patient status, failed dependency, action already taken, and help needed. Repeat back the instruction and identify the next check. An urgent voicemail without confirmed follow-through is not a closed loop.',
      'At a visit, compare the individualized emergency plan with current conditions. Report changed contacts, caregiver loss, a new device, failing backup power, relocation, blocked access, or a medication or supply dependency. Teach the existing plan and use teach-back; do not independently change orders, device settings, service frequency, or evacuation arrangements.',
    ],
    actions: [
      { icon: '🛡️', title: 'Protect life first', detail: 'Leave immediate danger and use 911 for a life-threatening emergency.' },
      { icon: '📞', title: 'Close the loop', detail: 'Use primary or alternate agency channels and repeat back direction.' },
      { icon: '🧭', title: 'Follow assignment', detail: 'Do not self-deploy, improvise treatment, or promise transport.' },
      { icon: '📝', title: 'Record the sequence', detail: 'Time-stamp observations, attempts, instructions, actions, and outcomes.' },
    ],
    tip: 'Use a 30-second report: safe location → hazard → patient status → unmet dependency → action taken → help needed.',
    sources: [
      { kind: 'Federal', text: '42 CFR § 484.102(a)–(d)' },
      { kind: 'California', text: '22 CCR § 74721' },
      { kind: 'ACHC traceability', text: 'HH7-2A.01; HH7-2B.01; HH7-3A–E' },
      { kind: 'Care Indeed', text: 'Current approved EPP; OP-FM-005; HR-TD-005' },
    ],
    image: img01,
    imageAlt: 'A field worker reviews an emergency plan with an older adult and caregiver at a table with a phone, tablet, flashlight, contact card, and go-bag.',
    overlay: { heading: 'Field role', body: 'Protect → report → follow assignment → document' },
    hotspots: [
      {
        id: 'plan', label: 'Individualized emergency plan', shortLabel: 'Patient Plan', x: 40, y: 65, kind: 'ready',
        observed: 'The patient, caregiver, and worker review the existing plan together.',
        why: 'The plan connects hazards, support, shelter or evacuation, and clinical dependencies to patient-specific actions.',
        action: 'Compare it with current conditions; report a mismatch instead of rewriting it independently.',
        notify: 'Clinical supervisor when location, contacts, dependencies, or caregiver capacity change.',
        document: 'Elements reviewed, change found, teaching, teach-back, and notification.',
        refs: ['42 CFR § 484.102(b)(1)', 'CL-PR-005'],
      },
      {
        id: 'alert', label: 'Official alert on the phone', shortLabel: 'Verify Alert', x: 33, y: 88, kind: 'guidance',
        observed: 'A phone displays a weather warning near the work area.',
        why: 'Official alerts may change travel or protective action; rumor is not operational direction.',
        action: 'Verify source, affected area, and time while stopped and safe; compare with agency direction.',
        notify: 'Agency contact tree if the alert affects a patient, visit, or your location.',
        document: 'Alert source and time, affected assignment, report, and instruction.',
        refs: ['OP-FM-005', '42 CFR § 484.102(c)'],
      },
      {
        id: 'contacts', label: 'Emergency contact card', shortLabel: 'Contacts', x: 55, y: 84, kind: 'ready',
        observed: 'A contact card is kept beside the patient plan.',
        why: 'Primary and alternate contacts help only when current, accessible, and approved.',
        action: 'Verify the contact pathway and securely report outdated or failed information.',
        notify: 'Clinical coordinator or supervisor for correction; use the alternate chain during disruption.',
        document: 'Contact verified, attempts, alternate used, and result.',
        refs: ['42 CFR § 484.102(c)', 'CL-PR-005'],
      },
      {
        id: 'gobag', label: 'Portable emergency supplies', shortLabel: 'Go-Bag', x: 80, y: 77, kind: 'coordinate',
        observed: 'A compact bag contains basic portable readiness items.',
        why: 'A generic kit cannot replace patient-specific medication, oxygen, device, mobility, or caregiver planning.',
        action: 'Use the current checklist; do not add clinical supplies or records outside the approved plan.',
        notify: 'Supervisor for absent, expired, inaccessible, or nonportable essential supplies.',
        document: 'Gap, immediate protection or education, notification, and follow-up owner.',
        refs: ['CL-PR-005', 'CDPH Preparedness Guidance'],
      },
      {
        id: 'detector', label: 'Household warning system', shortLabel: 'Home Hazard', x: 82, y: 14, kind: 'guidance',
        observed: 'A smoke detector represents a household alert and hazard-control system.',
        why: 'A failed alarm, blocked exit, smoke, extreme temperature, or structural damage may invalidate the plan.',
        action: 'Address immediate danger within role, move to safety when needed, and report the change.',
        notify: '911 or fire services for immediate danger; agency supervisor for a plan-impacting hazard.',
        document: 'Objective condition, location, protective action, notifications, and response.',
        refs: ['OP-FM-005', 'RM-PS-001'],
      },
    ],
    check: {
      prompt: 'An official alert expands toward your next visit area, but the agency has not issued a new assignment. What is the best action?',
      options: [
        'Self-deploy before roads become crowded',
        'Verify the alert while safe, report through the agency chain, and follow the assignment received',
        'Promise the patient that you will arrive regardless of closures',
      ],
      correct: 1,
      feedback: 'Verify, report, and follow the active plan. Urgency does not authorize unsafe travel or self-deployment. Sources: OP-FM-005; 42 CFR § 484.102(c).',
    },
  },
  {
    id: 1,
    shortName: 'All Hazards',
    title: 'Risk Awareness, Alerts & Personal Readiness',
    subtitle: 'Prepare for consequences — unsafe access, lost power, failed communications, delayed supplies, and caregiver disruption',
    overview: [
      'An all-hazards approach asks what has failed, who is exposed, which dependency is time-sensitive, and what safe communication method remains. Different events often create the same operational problems.',
      'California conditions can change block by block. Use official alerts and current agency direction. A clear sky at your location does not prove another service area is safe, and a scheduled visit never authorizes bypassing a closure.',
    ],
    details: [
      'Before travel, confirm the assignment, alert status, route, check-in and check-out method, backup communication, vehicle readiness, and a safe turn-around point. Pull over before reading an alert or rerouting. Never type, read, or navigate manually while driving.',
      'Do not enter moving water, dense smoke, falling debris, a closed road, or an evacuation zone because a patient is waiting. Report the exact barrier and your safe location so clinical leaders can select another continuity option. Accurate constraints are more useful than unsafe promises.',
      'Communication plans include primary and alternate paths. Approved options may include the agency phone, secure message, EHR, answering service, designated contact, landline, radio, paper list, or reporting point, depending on the active plan. Use minimum necessary patient information and only approved channels.',
      'Personal readiness supports reliable response. Maintain identification, a charged phone, compatible charger or power bank, flashlight, water, weather-appropriate clothing, and the items in current agency guidance. Make a household and dependent-care plan. Personal preparation does not mean stockpiling patient medications or self-assigning emergency work.',
      'Use official county, state, utility, weather, fire, and public-safety sources identified by the agency. Treat every alert as a cue to pause, verify, protect, notify, and document. If the agency cannot reach you, use the predetermined reporting method rather than guessing where to go.',
    ],
    actions: [
      { icon: '🌐', title: 'Think consequences', detail: 'Power, access, communications, supplies, and support may fail together.' },
      { icon: '📲', title: 'Verify alerts', detail: 'Use official sources and the active agency plan.' },
      { icon: '🚗', title: 'Travel safely', detail: 'Stop before reading or rerouting; obey closures and public-safety controls.' },
      { icon: '🔋', title: 'Prepare personally', detail: 'Maintain power, identification, contacts, and a household plan.' },
    ],
    tip: 'Before departure, say the check aloud: assignment, alert, route, check-in, backup channel, safe exit.',
    sources: [
      { kind: 'Federal', text: '42 CFR § 484.102(a)(1), (c)' },
      { kind: 'Care Indeed', text: 'OP-FM-005; OP-SL-007; RM-SS-003' },
      { kind: 'California', text: 'CDPH Be Prepared guidance' },
    ],
    image: img02,
    imageAlt: 'A field worker in a safely parked vehicle checks an alert and route map with a radio, power bank, water, packaged respirator, and identification nearby during smoky weather.',
    overlay: { heading: 'Before travel', body: 'Assignment · alert · route · check-in · safe exit' },
    hotspots: [
      {
        id: 'mobile-alert', label: 'Official mobile warning', shortLabel: 'Alert', x: 44, y: 42, kind: 'guidance',
        observed: 'The worker checks a warning while the vehicle is parked.',
        why: 'A verified alert can change travel or protective action; checking while moving creates another hazard.',
        action: 'Remain parked, verify the source and location, then follow agency direction.',
        notify: 'Supervisor or scheduling contact when the alert changes an assignment.',
        document: 'Source, time, affected area, travel decision, and instruction.',
        refs: ['OP-FM-005', 'OP-SL-007', 'RM-SS-003'],
      },
      {
        id: 'route-map', label: 'Primary and alternate route map', shortLabel: 'Routes', x: 60, y: 62, kind: 'coordinate',
        observed: 'A paper map remains available if data service fails.',
        why: 'An alternate route is useful only when open and authorized; a closed-road shortcut is unsafe.',
        action: 'Confirm access and turn back when official restrictions or conditions make travel unsafe.',
        notify: 'Agency chain with the exact barrier, safe location, and known alternatives.',
        document: 'Route avoided or attempted, barrier, notification, and reassignment.',
        refs: ['OP-FM-005', 'OP-SL-007', 'RM-SS-003'],
      },
      {
        id: 'radio', label: 'Alternate communication radio', shortLabel: 'Backup Comms', x: 12, y: 76, kind: 'ready',
        observed: 'A radio represents an approved alternate information or communication method.',
        why: 'Redundancy matters when phone, internet, or power service is interrupted.',
        action: 'Know when the current plan activates the alternate method and protect patient information.',
        notify: 'Assigned emergency contact at the required interval or when status changes.',
        document: 'Channel, attempts, minimum necessary message, and response.',
        refs: ['42 CFR § 484.102(c)(3)', 'OP-FM-005'],
      },
      {
        id: 'power-bank', label: 'Charged power bank', shortLabel: 'Power', x: 57, y: 84, kind: 'ready',
        observed: 'A charged pack supports an approved communication device.',
        why: 'Power readiness prevents a predictable loss of contact but cannot guarantee network service.',
        action: 'Charge before the shift, carry compatible cables, conserve power, and keep a backup method.',
        notify: 'Supervisor before accepting work if required contact cannot be maintained.',
        document: 'Communication limitation and agreed alternate method.',
        refs: ['OP-FM-005', 'Recommended readiness practice'],
      },
      {
        id: 'identification', label: 'Agency identification', shortLabel: 'Identification', x: 34, y: 89, kind: 'ready',
        observed: 'An agency badge is available for safe presentation.',
        why: 'Identification may support permitted access but never authorizes crossing a restricted perimeter.',
        action: 'Keep it current and follow the authority controlling access.',
        notify: 'Agency if access is denied or credentials are missing; never bypass controls.',
        document: 'Access point, authority instruction, safe disposition, and report.',
        refs: ['OP-FM-005', 'Local authority controls'],
      },
    ],
    check: {
      prompt: 'Your normal route is officially closed. A map app suggests a narrow shortcut through the same affected area. What should you do?',
      options: [
        'Use the shortcut because the patient is high need',
        'Ask the patient to meet you at the closure',
        'Remain safe, report the exact access barrier, and await the continuity or reassignment decision',
      ],
      correct: 2,
      feedback: 'Patient need does not authorize unsafe access. Report the barrier and let designated leadership choose another continuity option. Sources: OP-SL-007; RM-SS-003; OP-FM-005.',
    },
  },
  {
    id: 2,
    shortName: 'Prioritize',
    title: 'Current Patient Priority & Continuity Decisions',
    subtitle: 'Use the live EHR and individualized plan; report changed facts to the designated clinical lead',
    overview: [
      'Care Indeed source materials contain several legacy and current priority schemes. Do not memorize a label, color, number, or contact deadline from this course. During an event, use the current priority shown in the authorized record and the patient’s individualized emergency plan.',
      'Priority is dynamic. A patient who was stable can become urgent when power, oxygen, medication storage, caregiver support, access, mobility, or clinical condition changes. Field workers supply objective updates; designated clinical leaders assign or revise priority and allocate resources.',
    ],
    details: [
      'Report the facts that affect time to harm: current symptoms and stability, powered equipment and remaining backup according to the plan, time-sensitive medication or treatment, available and capable caregivers, mobility and evacuation needs, home and route safety, communication access, and supply status.',
      'Do not independently downgrade a patient because a caregiver answered once, or upgrade by promising services. Do not rely on an old paper class list, a color remembered from orientation, or a schedule sequence. If EHR access is unavailable, use the approved downtime priority list or contact the designated clinical lead.',
      'Continuity may involve an authorized caregiver step already in the plan, another qualified worker, safe rescheduling, permitted remote contact, DME or pharmacy coordination, physician direction, emergency medical services, evacuation assistance, or transfer to a higher level of care. The field worker does not promise which option leadership will select.',
      'A life-threatening condition bypasses routine sequencing: call 911 and then use the agency notification path. For all other conflicts, transmit a structured update, repeat back the decision, identify an owner and next check, and report deterioration or dependency failure immediately rather than waiting for the earlier plan to expire.',
      'Document the priority source you used, current location and condition, changed dependency, caregiver status, access, contact attempts, actions, direction, and follow-up. Avoid “disaster — unable.” A reviewer should be able to reconstruct what changed, who decided, and how the patient remained connected to care.',
    ],
    actions: [
      { icon: '🗂️', title: 'Use the live source', detail: 'Check current EHR priority and the individualized emergency plan.' },
      { icon: '🔎', title: 'Find changed facts', detail: 'Condition, backup, caregiver, access, medication, or supply may shift urgency.' },
      { icon: '📣', title: 'Report—do not relabel', detail: 'Designated clinical leaders own priority and resource allocation.' },
      { icon: '🔁', title: 'Recheck', detail: 'Repeat back the plan and update leadership when conditions change.' },
    ],
    tip: 'Priority report: current record status + what changed + time-sensitive consequence + support + access + action needed.',
    sources: [
      { kind: 'Care Indeed', text: 'CL-PR-005; current EHR registry/EPCP' },
      { kind: 'Federal', text: '42 CFR § 484.102(b)(1)–(3)' },
      { kind: 'Reconciliation', text: 'Legacy numeric schemes not taught' },
    ],
    image: img03,
    imageAlt: 'A clinical manager and field worker compare anonymous patient situation cards with a generic dashboard, phone, clock, dependency symbols, and route map.',
    overlay: { heading: 'Priority input', body: 'Current record + changed facts + time to harm' },
    hotspots: [
      {
        id: 'patient-cards', label: 'Anonymous patient situation cards', shortLabel: 'Compare Needs', x: 50, y: 66, kind: 'guidance',
        observed: 'Three cards represent different clinical, support, and dependency situations.',
        why: 'Diagnosis or schedule order alone cannot establish emergency priority.',
        action: 'Use the live record, gather current facts, and report changes to the designated lead.',
        notify: 'Clinical lead directing the active response.',
        document: 'Priority source, current facts, change, and decision received.',
        refs: ['CL-PR-005', '42 CFR § 484.102(b)(1)'],
      },
      {
        id: 'dependency-card', label: 'Technology-dependency marker', shortLabel: 'Dependency', x: 70, y: 62, kind: 'coordinate',
        observed: 'A device symbol marks a powered clinical dependency.',
        why: 'A failing dependency can make a stable patient urgent, but the response must use the individual plan.',
        action: 'Confirm status and backup from the approved source; do not change settings or improvise equipment.',
        notify: 'Clinical lead promptly; vendor or 911 as the plan and condition require.',
        document: 'Device, power, backup information, symptoms, action, and contacts.',
        refs: ['CL-PR-005', 'Patient EPCP'],
      },
      {
        id: 'caregiver-card', label: 'Caregiver availability marker', shortLabel: 'Caregiver', x: 70, y: 83, kind: 'guidance',
        observed: 'A phone marker represents the available support person.',
        why: 'Presence matters only when the caregiver is available, willing, and capable of the assigned steps.',
        action: 'Verify capacity and teach-back; never assume family can absorb clinical duties.',
        notify: 'Clinical lead when support is absent, overwhelmed, or unreachable.',
        document: 'Who was reached, capacity, limitation, teaching, and next action.',
        refs: ['CL-PR-005', 'Individualized plan'],
      },
      {
        id: 'clock', label: 'Time-to-harm marker', shortLabel: 'Time Matters', x: 90, y: 70, kind: 'guidance',
        observed: 'A clock represents time until a service or backup failure may cause harm.',
        why: 'A life threat or rapidly failing dependency requires immediate action regardless of routine priority.',
        action: 'Report the consequence and verified threshold, not only a priority label.',
        notify: '911 for immediate life threat; otherwise the designated clinical lead.',
        document: 'Onset, next due need or backup threshold, symptoms, and response.',
        refs: ['CL-PR-005', 'Emergency response principles'],
      },
      {
        id: 'access-map', label: 'Road closure and access map', shortLabel: 'Access', x: 88, y: 93, kind: 'coordinate',
        observed: 'The map shows that patient need and safe worker access may conflict.',
        why: 'High need does not authorize unsafe travel; leadership may choose another continuity path.',
        action: 'Report the exact closure and safe location, then follow reassignment or alternate direction.',
        notify: 'Incident lead or scheduler through the active chain.',
        document: 'Access barrier, source, route status, report, and alternate decision.',
        refs: ['42 CFR § 484.102(b)(2)–(3)', 'OP-FM-005'],
      },
    ],
    check: {
      prompt: 'The EHR shows a stable priority, but the caregiver reports that the patient’s device backup is failing. What is your role?',
      options: [
        'Change the priority label yourself and promise an immediate visit',
        'Report the changed device, backup, symptoms, support, and access facts to the designated clinical lead',
        'Ignore the change because the EHR label controls until recertification',
      ],
      correct: 1,
      feedback: 'Use the current record, but immediately report facts that may change urgency. The designated clinical lead owns reprioritization and resource allocation. Source: CL-PR-005.',
    },
  },
  {
    id: 3,
    shortName: 'Shelter / Go',
    title: 'Shelter-in-Place & Evacuation Coordination',
    subtitle: 'Match protective action to official direction, the home hazard, and the individualized plan',
    overview: [
      'Shelter-in-place and evacuation are different strategies. Sheltering may be safer when travel is hazardous and the home can support essential needs. Evacuation is needed when authorities order it, the home becomes unsafe, or the patient-specific plan reaches its leaving threshold.',
      'Never give a universal “always stay” or “always leave” instruction. Verify official direction, current conditions, the patient plan, destination, transportation resource, mobility, medication, oxygen or device support, caregiver capacity, and how the agency will learn the patient’s location.',
    ],
    details: [
      'For sheltering, consider structure safety, air quality, temperature, water, sanitation, power, communication, medication, oxygen, equipment, supplies, caregiver capacity, and expected duration. Escalate when the plan is no longer workable; a delayed last-minute evacuation can be more dangerous for a mobility- or technology-dependent person.',
      'For evacuation, keep exits clear and gather only the items specified in the current plan. Secure oxygen and equipment according to instructions, keep oxygen away from ignition, and preserve medication storage. Do not disconnect, lift, transfer, adjust, or operate equipment beyond role, order, training, and plan.',
      'Federal requirement: the agency must have procedures to inform state and local emergency officials about patients who need evacuation because of medical or psychiatric condition and the home environment. Field workers rapidly pass facts to the agency; authorized leaders coordinate with public resources. Call 911 for immediate danger.',
      'Transportation boundaries are firm. Do not place a patient in a personal vehicle, promise to drive, or improvise a lift unless a current, verified, role-specific agency procedure expressly assigns and authorizes that duty. Default to coordination with the caregiver, public safety, EMS, accessible transport, or another designated resource.',
      'If a patient refuses, remain respectful and avoid coercion. Explain the known risk and plan, use teach-back, notify the clinical lead, and escalate capacity or imminent-danger concerns. Document the patient’s own words, education, response, notifications, direction, and disposition — not merely “refused.”',
    ],
    actions: [
      { icon: '🏠', title: 'Shelter safely', detail: 'Confirm the structure and every essential dependency remain supportable.' },
      { icon: '🚪', title: 'Evacuate early', detail: 'Use official direction and the individualized leaving threshold.' },
      { icon: '♿', title: 'Coordinate access', detail: 'Match mobility, equipment, support, destination, and transportation.' },
      { icon: '🚫', title: 'Do not improvise', detail: 'No personal-vehicle transport or unsafe lifting outside assignment.' },
    ],
    tip: 'A destination is incomplete until transportation, access, medication, equipment support, caregiver needs, and location reporting are addressed.',
    sources: [
      { kind: 'Federal', text: '42 CFR § 484.102(b)(1)–(3)' },
      { kind: 'Care Indeed', text: 'CL-PR-005; OP-FM-005; OP-SL-003; OP-SL-007' },
      { kind: 'California', text: 'CDPH preparedness guidance' },
    ],
    image: img04,
    imageAlt: 'An older adult and caregiver prepare near a clear exit while a field worker coordinates by phone; a wheelchair, secured oxygen cylinder, medication bag, pet carrier, keys, and accessible vehicle are visible.',
    overlay: { heading: 'Protective action', body: 'Official direction + patient plan + workable support' },
    hotspots: [
      {
        id: 'official-direction', label: 'Official protective-action notice', shortLabel: 'Direction', x: 73, y: 18, kind: 'guidance',
        observed: 'A posted symbol notice represents a warning, order, or shelter instruction.',
        why: 'The correct action depends on the current affected zone, authority, and patient plan.',
        action: 'Verify source, location, effective time, and whether the plan remains workable.',
        notify: 'Agency chain when direction affects a patient or assignment; 911 for immediate danger.',
        document: 'Authority, time, zone, action, and communication.',
        refs: ['OP-FM-005', 'Local emergency authority'],
      },
      {
        id: 'wheelchair', label: 'Mobility and transfer dependency', shortLabel: 'Mobility', x: 13, y: 72, kind: 'coordinate',
        observed: 'A wheelchair shows the need for accessible movement and transportation.',
        why: 'Equipment presence does not prove that a caregiver or worker can transfer safely.',
        action: 'Use assigned assistance and the mobility plan; do not attempt an untrained lift.',
        notify: 'Clinical lead and designated evacuation resource when assistance is inadequate.',
        document: 'Limitation, helpers and equipment, request, and disposition.',
        refs: ['42 CFR § 484.102(b)(2)', 'CL-PR-005'],
      },
      {
        id: 'portable-oxygen', label: 'Secured portable oxygen', shortLabel: 'Oxygen', x: 67, y: 65, kind: 'coordinate',
        observed: 'A portable cylinder is secured upright without blocking the exit.',
        why: 'Evacuation planning must address supply, prescribed use, safe handling, and destination capacity.',
        action: 'Follow the existing oxygen plan and vendor instructions; keep away from ignition.',
        notify: 'Clinical lead for inadequate supply; vendor or EMS per plan and urgency.',
        document: 'Supply status, actions, contacts, destination support, and outcome.',
        refs: ['CL-PR-005', 'Patient EPCP'],
      },
      {
        id: 'medication-bag', label: 'Portable medication supply', shortLabel: 'Medications', x: 55, y: 84, kind: 'ready',
        observed: 'A medication bag is staged with the patient’s portable supplies.',
        why: 'Leaving without essential medication, directions, or temperature support can create another emergency.',
        action: 'Prompt the patient or caregiver to follow the plan; do not alter or repackage outside role.',
        notify: 'Clinical or pharmacy pathway when supply or storage cannot be maintained.',
        document: 'Gap, education, coordination, and final plan.',
        refs: ['CL-PR-005', 'CL-SD-012'],
      },
      {
        id: 'accessible-transport', label: 'Designated accessible transport', shortLabel: 'Transport', x: 49, y: 39, kind: 'unsafe',
        observed: 'An accessible service vehicle waits outside while the worker coordinates.',
        why: 'Transportation must be authorized and matched to mobility and clinical needs.',
        action: 'Do not use a personal vehicle or improvise transport without verified role-specific authorization.',
        notify: 'Agency incident lead; 911 or local evacuation resource for immediate assistance.',
        document: 'Resource requested, need shared, response, destination, and agency update.',
        refs: ['42 CFR § 484.102(b)(2)', 'OP-SL-003', 'OP-FM-005'],
      },
    ],
    check: {
      prompt: 'The patient needs accessible evacuation transport, but the expected service is delayed. What should the field worker do?',
      options: [
        'Place the patient in the worker’s personal vehicle',
        'Coordinate through the active agency and emergency-resource path and call 911 for immediate danger',
        'Attempt an untrained transfer into a neighbor’s vehicle',
      ],
      correct: 1,
      feedback: 'Do not improvise transport or lifting. Coordinate an authorized resource; use 911 for immediate life safety. Sources: 42 CFR § 484.102(b)(2); OP-SL-003; OP-FM-005.',
    },
  },
  {
    id: 4,
    shortName: 'Dependencies',
    title: 'Power, Medication, Oxygen, Devices & Supplies',
    subtitle: 'Find each single point of failure before it becomes a clinical emergency',
    overview: [
      'A patient may appear stable while a hidden countdown has started: a concentrator stopped, a pump battery is declining, refrigerated medication is warming, portable oxygen is limited, supplies are delayed, or the only capable caregiver must leave.',
      'Every dependency needs a failure signal, patient-specific consequence, approved backup, contact sequence, and escalation point. Field workers verify and report; they do not calculate unsupported safe time, repair equipment, change settings, or invent a clinical workaround.',
    ],
    details: [
      'Care Indeed’s individualized technology contingency planning identifies the device, consequence of failure, compatible backup, caregiver actions, vendor and clinical contacts, and destination. Compare the plan with what is actually present. A battery that is missing, uncharged, damaged, or incompatible is not a backup.',
      'A utility medical baseline or priority program may provide notices or other support, but registration does not guarantee uninterrupted service or restoration by a particular time. Never promise restoration. Escalate based on the individual plan, current symptoms, and verified backup status.',
      'For oxygen, distinguish a powered concentrator from portable backup. Follow the prescribed plan, keep oxygen away from smoking, flame, candles, grease, and heat, and never change flow outside authorization. Never operate a generator, grill, or fuel-burning heater indoors or near openings because carbon monoxide can be fatal.',
      'For medication, identify time, temperature, access, and quantity dependencies. Do not guess whether warmed medication remains usable or tell a patient to double, skip, stretch, or substitute doses. Preserve the known storage history and coordinate clinical and pharmacy direction before the planned threshold.',
      'Verify that a capable caregiver can perform the existing steps and that stairs, elevators, gates, keys, pets, smoke, or debris do not block assistance. If severe symptoms appear, a life-sustaining device fails without a workable backup, or the environment is immediately unsafe, call 911 and then notify the agency.',
    ],
    actions: [
      { icon: '🔌', title: 'Power threshold', detail: 'Know the failure signal, approved backup, and escalation point.' },
      { icon: '🫁', title: 'Oxygen safety', detail: 'Follow prescribed use; prevent ignition and unsafe substitution.' },
      { icon: '🧊', title: 'Medication integrity', detail: 'Track time and temperature; never guess usability or dose changes.' },
      { icon: '👥', title: 'Human dependency', detail: 'Verify caregiver ability and environmental access.' },
    ],
    tip: 'Ask four questions: What can fail? How will we know? What is the approved backup? Who is called before it fails?',
    sources: [
      { kind: 'Care Indeed', text: 'CL-PR-005; patient EPCP; CL-SD-012; CL-SD-020' },
      { kind: 'Federal', text: '42 CFR § 484.102(a), (b)(1)' },
      { kind: 'California', text: 'CDPH power and oxygen guidance' },
    ],
    image: img05,
    imageAlt: 'An older adult, caregiver, and clinician review an outage plan with an oxygen concentrator, secured cylinder, battery station, medication cooler, infusion pump, lantern, and flashlight.',
    overlay: { heading: 'Dependency check', body: 'Failure signal · backup · escalation · destination' },
    hotspots: [
      {
        id: 'concentrator', label: 'Powered oxygen concentrator', shortLabel: 'Concentrator', x: 12, y: 68, kind: 'coordinate',
        observed: 'The concentrator represents equipment that stops when household power fails.',
        why: 'The individual plan must address prescribed oxygen, failure, backup, and escalation.',
        action: 'Confirm status without changing settings; activate the existing contingency steps.',
        notify: 'Clinical lead promptly; DME vendor or 911 according to plan and symptoms.',
        document: 'Power loss, device, symptoms, backup, contacts, and response.',
        refs: ['CL-SD-020', 'CL-PR-005', 'Patient EPCP'],
      },
      {
        id: 'backup-oxygen', label: 'Secured backup oxygen cylinder', shortLabel: 'Backup Oxygen', x: 88, y: 66, kind: 'coordinate',
        observed: 'A cylinder is upright and secured beside the equipment stand.',
        why: 'Backup requires adequate supply, prescribed use, safe handling, caregiver ability, and replacement.',
        action: 'Follow the written plan; do not estimate duration or change flow outside authorization.',
        notify: 'Clinical lead for inadequate or uncertain supply; vendor or EMS per urgency.',
        document: 'Supply observation, plan step, notification, and outcome.',
        refs: ['CL-SD-020', 'CL-PR-005', 'Oxygen safety plan'],
      },
      {
        id: 'battery-station', label: 'Portable battery power station', shortLabel: 'Battery', x: 48, y: 75, kind: 'ready',
        observed: 'A battery unit is a planned temporary power source.',
        why: 'Capacity, compatibility, charge, and safe use must be established before an outage.',
        action: 'Use only as specified, conserve power, and escalate before the plan’s threshold.',
        notify: 'Clinical lead when charge is inadequate, damaged, incompatible, or declining unexpectedly.',
        document: 'Status, supported device, plan threshold, and contacts.',
        refs: ['CL-PR-005', 'Manufacturer instructions'],
      },
      {
        id: 'medication-cooler', label: 'Temperature-controlled medication cooler', shortLabel: 'Medication', x: 69, y: 79, kind: 'coordinate',
        observed: 'An insulated container and thermometer represent temperature-sensitive medication.',
        why: 'Appearance cannot establish whether medication remains safe after an outage.',
        action: 'Preserve storage, capture time and temperature facts, and obtain clinical or pharmacy direction.',
        notify: 'Clinical lead and pharmacy or prescriber as directed.',
        document: 'Outage and temperature history, medication affected, advice, and instruction.',
        refs: ['CL-SD-012', 'CL-PR-005'],
      },
      {
        id: 'powered-pump', label: 'Powered infusion or feeding pump', shortLabel: 'Pump', x: 90, y: 27, kind: 'unsafe',
        observed: 'A pump represents a time-sensitive powered therapy dependency.',
        why: 'Reprogramming, bypassing alarms, or inventing a manual method can cause serious harm.',
        action: 'Do not bypass or reprogram; protect the patient and follow the device-specific plan.',
        notify: 'Clinical lead immediately; vendor, prescriber, or 911 per plan and condition.',
        document: 'Alarm or display, therapy, symptoms, action, notification, and disposition.',
        refs: ['CL-PR-005', 'Current plan/order'],
      },
    ],
    check: {
      prompt: 'A temperature-sensitive medication warmed during an outage. The patient asks whether to use it and double the next dose if needed. What is safest?',
      options: [
        'Judge by appearance and advise the patient',
        'Discard it immediately and replace it from another patient’s supply',
        'Preserve the time and temperature facts and obtain direction through the clinical and pharmacy pathway',
      ],
      correct: 2,
      feedback: 'Do not guess stability, substitute, or change dosing. Preserve facts and obtain authorized direction. Sources: CL-SD-012; CL-PR-005.',
    },
  },
  {
    id: 5,
    shortName: 'Downtime',
    title: 'Missed Visits, Downtime Records & Recovery',
    subtitle: 'A disruption changes the workflow, not the duty to preserve facts, confidentiality, and follow-through',
    overview: [
      'A scheduled visit that does not occur is a missed visit even when wildfire, closure, evacuation, staffing, or system failure caused it. Never leave a blank schedule or create a normal visit note for care that did not occur.',
      'Use the current missed-visit and patient-not-found policy rather than memorizing a deadline from this course. Identify and report the event promptly, assess patient-specific impact within role, use approved contacts, and escalate through the designated clinical chain.',
    ],
    details: [
      'Care Indeed policy requires a missed-visit record with the scheduled discipline or service, specific cause, responsible factor, patient-specific clinical impact, contact attempts, and rescheduling or continuity plan. “Disaster” or “unable” alone does not explain the clinical risk or follow-through.',
      'If the patient is unreachable, use all approved contact methods and emergency contacts, record each attempt, and follow the current patient-not-found escalation procedure. The designated clinical leader decides whether a welfare check, physician contact, emergency-service request, or other response is warranted.',
      'During EHR downtime, use approved paper forms and minimum necessary information. Record the actual event time, secure pages from view, loss, and weather, and use the designated envelope or file box. Do not photograph records, share credentials, or place identifiers in personal notes, texts, or cloud tools.',
      'When systems recover, reconcile rather than recreate from memory. Enter or scan through the approved process, distinguish actual service time from later entry time, identify downtime, preserve the source record, prevent duplicates, and transfer every unresolved task. Never backdate or represent a missed visit as completed.',
      'Recovery includes patient follow-up, safe rescheduling through authorized coordination, restoration of ordered care, adverse-event reporting, supply and contact reconciliation, and assigned after-action review. Document the handoff owner and next check. The record should show what was known, attempted, decided, completed, and still open.',
    ],
    actions: [
      { icon: '📅', title: 'Name the variance', detail: 'A disaster-related nonvisit is still a missed visit.' },
      { icon: '☎️', title: 'Track attempts', detail: 'Use approved contacts and the current patient-not-found procedure.' },
      { icon: '📄', title: 'Use downtime forms', detail: 'Time-stamp, secure, and preserve the original chronology.' },
      { icon: '🔁', title: 'Reconcile recovery', detail: 'Transfer open tasks; never backdate, fabricate, or duplicate care.' },
    ],
    tip: 'Record: scheduled service → disruption → patient status or attempts → clinical impact → notifications → instruction → follow-up.',
    sources: [
      { kind: 'Care Indeed', text: 'CL-SD-024; CL-CD-004; OP-SL-005; OP-FM-005' },
      { kind: 'Federal', text: '42 CFR § 484.102(b)(3)–(4)' },
      { kind: 'Privacy', text: '45 CFR §§ 164.502(b), 164.530(c); ePHI: § 164.306' },
    ],
    image: img06,
    imageAlt: 'A field worker completes an anonymous paper downtime log at a temporary workstation with unavailable phone and tablet service, a watch, desk phone, privacy envelope, and secure file box.',
    overlay: { heading: 'Downtime record', body: 'Actual time · attempts · impact · direction · owner' },
    hotspots: [
      {
        id: 'downtime-form', label: 'Approved paper downtime form', shortLabel: 'Downtime Form', x: 57, y: 70, kind: 'ready',
        observed: 'The worker records activity on an approved form while systems are unavailable.',
        why: 'Downtime changes the medium, not the duty to document accurately and promptly.',
        action: 'Use the current form and record actual events in chronological order.',
        notify: 'Supervisor or downtime lead for safety issues, missing forms, or workflow conflicts.',
        document: 'Scheduled service, status, attempts, impact, decisions, and follow-up.',
        refs: ['42 CFR § 484.102(b)(4)', 'OP-SL-005', 'CL-CD-004'],
      },
      {
        id: 'timestamp', label: 'Actual event timestamp', shortLabel: 'Time-Stamp', x: 43, y: 65, kind: 'guidance',
        observed: 'A wristwatch emphasizes the time of each event.',
        why: 'A later entry time must not replace the real contact, direction, or action time.',
        action: 'Record events as they occur and identify later reconciliation honestly.',
        notify: 'Supervisor if a timestamp or source record is missing or disputed.',
        document: 'Event time, entry time when different, downtime reason, and author.',
        refs: ['CL-CD-004', 'CO-DC-003'],
      },
      {
        id: 'contact-method', label: 'Unavailable primary contact method', shortLabel: 'Contact', x: 36, y: 36, kind: 'coordinate',
        observed: 'A phone without network represents a failed primary channel.',
        why: 'One failed call does not end the duty to use approved alternate contacts.',
        action: 'Follow the current call tree and patient-not-found procedure while protecting PHI.',
        notify: 'Designated clinical lead according to current policy and sooner for urgent risk.',
        document: 'Role or number attempted, method, time, result, and escalation.',
        refs: ['CL-SD-024', '42 CFR § 484.102(b)(3)'],
      },
      {
        id: 'offline-ehr', label: 'Unavailable electronic record', shortLabel: 'EHR Offline', x: 56, y: 42, kind: 'unsafe',
        observed: 'The tablet cannot reach the clinical record.',
        why: 'An outage never permits fabricated entries, credential sharing, or personal-device workarounds.',
        action: 'Use the approved downtime process and minimum necessary information.',
        notify: 'Designated IT or downtime contact and clinical supervisor.',
        document: 'Outage, system, alternate workflow, open tasks, and recovery reconciliation.',
        refs: ['OP-SL-005', 'IT-DR-002', '42 CFR § 484.102(b)(4)'],
      },
      {
        id: 'secure-records', label: 'Privacy envelope and controlled file box', shortLabel: 'Secure Records', x: 76, y: 67, kind: 'ready',
        observed: 'Paper records are closed and controlled instead of left exposed.',
        why: 'Emergencies still require confidentiality, integrity, and availability.',
        action: 'Keep records attended or secured and transport only through the approved chain.',
        notify: 'Privacy or compliance contact for loss, access, or damage.',
        document: 'Custody transfer, contents, recipient, time, and any incident.',
        refs: ['42 CFR § 484.102(b)(4)', 'OP-SL-005', '45 CFR § 164.530(c)'],
      },
    ],
    check: {
      prompt: 'The EHR is unavailable and a visit cannot occur because the road is closed. Which record is defensible?',
      options: [
        'A normal visit note entered later so the schedule looks complete',
        'An approved downtime and missed-visit record with actual times, cause, impact, attempts, direction, and follow-up',
        'No entry because disaster conditions excuse documentation',
      ],
      correct: 1,
      feedback: 'Record the variance truthfully using approved downtime and missed-visit processes. Never backdate or document care that did not occur. Sources: CL-SD-024; 42 CFR § 484.102(b)(3)–(4).',
    },
  },
  {
    id: 6,
    shortName: 'Simulation',
    title: 'Multi-Patient Emergency Simulation & Debrief',
    subtitle: 'Observe, classify, decide, and defend a safe plan when needs compete',
    overview: [
      'Simulation: a wildfire order affects one neighborhood, smoke affects another, power is interrupted, cellular service is congested, and roads are closed. You are safe at the designated reporting point with three patient situations and the active communication plan.',
      'Patient A uses a powered respiratory device and the caregiver reports a shrinking backup. Patient B has time-sensitive care, stable current symptoms, and limited caregiver capacity. Patient C is stable with prepared support, but the normal route is closed. The designated clinical lead — not the learner — sets the response order.',
    ],
    details: [
      'Observe verified facts: official zones, road status, current EHR priority, patient location and symptoms, equipment and medication dependencies, caregiver ability, backup according to the plan, successful and failed contacts, and available resources. Record time because urgency can change as a backup declines.',
      'Classify actions rather than inventing labels. An immediate life threat needs 911. A failing dependency needs urgent clinical reporting and the patient-specific contingency path. A time-sensitive service needs clinical-lead coordination. A stable supported patient still needs contact, a documented continuity plan, and a next check.',
      'Decide within role: transmit structured reports, repeat back assignments, and use alternate channels. Do not reprogram equipment, promise arrival, drive into a restricted zone, transport in a personal vehicle, or independently change priority, frequency, or treatment. Update the lead when a condition changes.',
      'Defend with a contemporaneous record. For each patient, record the current source, present facts, dependency and consequence, support, access, attempts, instruction, action, owner, and next check. Explain a delayed visit and the authorized bridge; never describe one person as simply “more important.”',
      'Debrief: Which alert was verified? What contact failed? Which fact changed urgency? Was backup status verified or assumed? Did anyone self-deploy or exceed role? Were privacy and timestamps preserved? Did every open action get an owner? Report gaps for the formal after-action review. Knowledge practice does not validate field competency.',
    ],
    actions: [
      { icon: '👁️', title: 'Observe', detail: 'Verify hazard, location, status, dependency, support, and access.' },
      { icon: '🧩', title: 'Classify', detail: 'Separate life threat, failing dependency, time-sensitive need, and stable follow-up.' },
      { icon: '🧭', title: 'Decide', detail: 'Follow leader direction, travel controls, role limits, and alternate channels.' },
      { icon: '🗂️', title: 'Defend', detail: 'Record owners, next actions, next checks, and changed conditions.' },
    ],
    tip: 'End every emergency handoff with: owner, next action, next check time.',
    sources: [
      { kind: 'Care Indeed', text: 'CL-PR-005; OP-FM-005; HR-TD-005' },
      { kind: 'Federal', text: '42 CFR § 484.102' },
      { kind: 'Practice', text: 'Knowledge simulation; competency separate' },
    ],
    image: img07,
    imageAlt: 'Four home-health professionals conduct a tabletop wildfire and outage exercise around a hazard map with anonymous patient cards, communication cards, device planning materials, and a contact log.',
    overlay: { heading: 'Decision cycle', body: 'Observe → classify → decide → defend' },
    hotspots: [
      {
        id: 'hazard-map', label: 'Verified hazard and access map', shortLabel: 'Hazard Map', x: 51, y: 57, kind: 'guidance',
        observed: 'The map shows affected zones, closures, and patient locations.',
        why: 'Geography affects access, but the map must be current and paired with patient facts.',
        action: 'Verify source and time; identify affected patients and safe worker locations.',
        notify: 'Incident lead with zones, barriers, and safe locations.',
        document: 'Source, timestamp, affected assignments, and decision.',
        refs: ['OP-FM-005', '42 CFR § 484.102(a)'],
      },
      {
        id: 'patient-situations', label: 'Three patient situation cards', shortLabel: 'Patients A–C', x: 43, y: 73, kind: 'guidance',
        observed: 'Anonymous cards show different dependencies, conditions, and supports.',
        why: 'Response order depends on verified consequence and current facts, not personal preference.',
        action: 'Report every patient; let the designated clinical lead allocate resources.',
        notify: 'Clinical or incident lead; 911 for immediate life threat.',
        document: 'Current priority source, status, dependency, support, access, and disposition.',
        refs: ['CL-PR-005'],
      },
      {
        id: 'communication-tree', label: 'Primary and alternate communication tree', shortLabel: 'Call Tree', x: 86, y: 69, kind: 'ready',
        observed: 'Communication cards represent primary and backup reporting paths.',
        why: 'A resilient handoff reaches a responsible person and confirms the next action.',
        action: 'Use the approved sequence, repeat back direction, and set the next check.',
        notify: 'Continue through the escalation chain until required response is reached.',
        document: 'Attempts, recipient, message, read-back, owner, and next check.',
        refs: ['42 CFR § 484.102(c)', 'OP-FM-005'],
      },
      {
        id: 'device-contingency', label: 'Technology contingency card', shortLabel: 'Device Plan', x: 61, y: 88, kind: 'coordinate',
        observed: 'A card represents a powered respiratory dependency and backup.',
        why: 'A shrinking backup can increase urgency; response still follows plan and authorized direction.',
        action: 'Report status and symptoms; do not bypass, reprogram, or invent a substitute.',
        notify: 'Clinical lead urgently; vendor or 911 per plan and condition.',
        document: 'Device, failure, verified backup, symptoms, action, and disposition.',
        refs: ['CL-PR-005', 'Patient EPCP'],
      },
      {
        id: 'decision-log', label: 'Emergency contact and decision log', shortLabel: 'Decision Log', x: 82, y: 90, kind: 'ready',
        observed: 'A paper log is ready for chronology and open actions.',
        why: 'A shared log prevents missed patients, duplicate work, privacy drift, and ownerless follow-up.',
        action: 'Record minimum necessary facts, actual times, owners, and next checks.',
        notify: 'Handoff open actions to the designated lead; report record incidents.',
        document: 'Chronology, contacts, assignments, changes, and closure or handoff.',
        refs: ['42 CFR § 484.102(b)(3)–(4)', 'OP-FM-005'],
      },
    ],
    check: {
      prompt: 'In the simulation, Patient A’s backup is declining, Patient B has time-sensitive care, and Patient C’s route is closed. What is the field worker’s best first team action?',
      options: [
        'Choose a priority order independently and promise arrival times',
        'Send structured, time-stamped updates for all three to the designated clinical lead and call 911 for any immediate life threat',
        'Drive toward Patient A before contacting the agency',
      ],
      correct: 1,
      feedback: 'Transmit verified facts for all patients and let the designated lead allocate resources. Immediate life threat uses 911. Do not self-deploy or promise transport or timing. Sources: CL-PR-005; OP-FM-005.',
    },
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'Which set names the four core elements of the federal home health emergency preparedness program?',
    options: [
      'Risk-based emergency plan; policies and procedures; communication plan; training and testing program',
      'Risk-based emergency plan; evacuation policy; communication plan; annual staff competency program',
      'Hazard vulnerability analysis; patient-priority registry; business-continuity plan; annual full-scale exercise',
      'Emergency plan; incident-command structure; mutual-aid agreements; medical-record backup system',
    ],
    correct: 0,
    rationale: '42 CFR § 484.102(a)–(d) establishes the emergency plan, policies and procedures, communication plan, and training and testing program. Care Indeed may impose stricter internal practices, but they must not be presented as the federal minimum.',
  },
  {
    id: 1,
    stem: 'Under the current federal rule for a home health agency, which frequency statement is accurate?',
    options: [
      'Training and testing both occur annually, while the full plan is reviewed at least every two years',
      'Training must occur at least every two years, program elements are reviewed at least every two years, and testing occurs at least annually',
      'Training occurs at least every two years, two full-scale exercises occur annually, and policies are reviewed only after activation',
      'Training occurs annually, testing occurs every two years, and the communication plan is reviewed annually',
    ],
    correct: 1,
    rationale: 'Current 42 CFR § 484.102 requires at-least-every-two-years review and training, plus at-least-annual testing. Care Indeed’s hire-and-annual training assignment is a stricter agency standard; the current approved emergency program controls any additional exercise cadence.',
  },
  {
    id: 2,
    stem: 'You receive a wildfire alert while driving toward a scheduled home visit. What is the safest response?',
    options: [
      'Pull over, verify the alert, choose the safest open route in a map app, and notify the agency after reaching the patient',
      'Pull over, call the patient first, and use the patient’s local report to decide whether the visit can continue',
      'Pull over legally, verify the official alert, report through the agency chain, and follow the assignment received',
      'Pull over, verify the alert, leave a message for scheduling, and continue unless the agency cancels the visit',
    ],
    correct: 2,
    rationale: 'Safe travel and verified information come first. Report the exact barrier or alert while stopped, then follow the active agency plan. A scheduled visit never authorizes distracted driving or entry into a restricted area. Sources: OP-SL-007; RM-SS-003; OP-FM-005.',
  },
  {
    id: 3,
    stem: 'The current EHR priority appears stable, but the caregiver reports that backup power for a life-supporting device is failing. What should the field worker do?',
    options: [
      'Record the caregiver report in the EHR and continue the planned sequence until the clinical lead reviews it',
      'Report device status, verified backup, symptoms, caregiver capacity, and access to the designated clinical lead',
      'Use the recorded priority until the backup reaches the threshold in the prior plan, then report the change',
      'Ask the caregiver to conserve device use while the field worker contacts the equipment vendor before the agency',
    ],
    correct: 1,
    rationale: 'Use the live record but report changed time-to-harm facts immediately. The designated clinical lead owns reprioritization and resource allocation. Do not adjust equipment outside role and plan. Source: CL-PR-005.',
  },
  {
    id: 4,
    stem: 'An evacuation order applies to a patient who needs accessible transport. The planned vehicle is delayed. Which action is appropriate?',
    options: [
      'Obtain the patient’s consent to use the worker’s vehicle, document it, and notify the agency after transport',
      'Ask a capable neighbor to assist with transfer while the worker simultaneously notifies the agency',
      'Coordinate through the agency and designated public resource path; call 911 for immediate danger',
      'Continue sheltering while awaiting the planned vehicle, then update the agency if the patient’s plan becomes unworkable',
    ],
    correct: 2,
    rationale: 'Do not improvise transport or lifting. OP-SL-003 requires explicit prior authorization before patient transport in a personal vehicle, and the agency coordinates evacuation needs with emergency officials under 42 CFR § 484.102(b)(2). Use 911 for immediate life safety and follow the verified role-specific plan.',
  },
  {
    id: 5,
    stem: 'A power outage stops a patient’s oxygen concentrator. What is the best field response?',
    options: [
      'Switch to available portable oxygen at the caregiver’s remembered setting, then notify the agency',
      'Follow the patient-specific contingency plan, assess and report status, and use vendor or 911 pathways according to the plan and symptoms',
      'Contact the utility medical-baseline line before assessing the patient because restoration is the planned first backup',
      'Call the equipment vendor first and wait for replacement before clinical escalation while the patient appears stable',
    ],
    correct: 1,
    rationale: 'Use the individualized device and oxygen contingency plan; verify rather than recall the prescribed backup step and setting, assess the patient before pursuing logistics, and escalate clinically or to 911 without waiting on a vendor when the condition requires it. Sources: CL-SD-020; CL-PR-005; patient EPCP.',
  },
  {
    id: 6,
    stem: 'A temperature-sensitive medication has been outside its intended range during an outage. The patient asks whether to use it. What should you do?',
    options: [
      'Keep it in the cooler and advise holding the dose until the next routine visit',
      'Use the patient’s estimated time and temperature to apply a common storage window and continue the schedule',
      'Preserve the known time and temperature history and obtain direction through the clinical and pharmacy pathway',
      'Call the pharmacy only and follow the last known storage instruction if the pharmacy cannot be reached',
    ],
    correct: 2,
    rationale: 'Do not apply a generic storage window, independently hold a dose, or rely on an old instruction when current stability is uncertain. Preserve the storage facts and obtain authorized clinical and pharmacy direction. Sources: CL-SD-012; CL-PR-005.',
  },
  {
    id: 7,
    stem: 'A road closure prevents a scheduled visit. Which documentation is most defensible?',
    options: [
      'A missed-visit entry with the road closure and scheduler notification, adding clinical impact at the next completed visit',
      'An incident report describing the closure and worker safety issue, leaving the clinical record unchanged until rescheduling',
      'A cancellation entry with patient risk and reschedule plan, omitting unsuccessful contact attempts because no one answered',
      'A missed-visit record with actual times, specific cause, patient impact, contact attempts, direction, continuity or reschedule plan, and owner',
    ],
    correct: 3,
    rationale: 'A disaster-related nonvisit remains a missed visit. Record the specific variance, impact, attempts, direction, and follow-up; never document care that did not occur. Sources: CL-SD-024; 42 CFR § 484.102(b)(3).',
  },
  {
    id: 8,
    stem: 'The EHR and agency phone are unavailable during an emergency. Which action protects record integrity and confidentiality?',
    options: [
      'Use approved paper forms, then discard them after a complete EHR summary is entered to avoid duplicate PHI',
      'Use approved downtime forms, actual event times, minimum necessary information, secure custody, and later reconciliation',
      'Use a secure personal notebook with initials only until approved forms arrive, then transcribe the entries',
      'Wait for EHR restoration for routine communications and reconstruct them from agency call logs afterward',
    ],
    correct: 1,
    rationale: 'Approved downtime records preserve chronology, minimum-necessary use, confidentiality, integrity, and availability. Use the approved medium from the start, retain and transfer the source through the required custody process, and record communications contemporaneously rather than reconstructing them. Sources: OP-SL-005; 42 CFR § 484.102(b)(4); 45 CFR §§ 164.502(b), 164.530(c); ePHI safeguards at § 164.306.',
  },
  {
    id: 9,
    stem: 'During a multi-patient event, one backup device is declining, another patient has time-sensitive care, and a third patient’s route is closed. What is the best integrated decision?',
    options: [
      'Use the current EHR priority to sequence contacts and update the lead only when a planned backup has already failed',
      'Report structured, time-stamped facts for every patient to the designated clinical lead, use 911 for immediate life threats, and document owners and next checks',
      'Send summaries in scheduled order and begin travel to the first accessible patient while waiting for the lead’s response',
      'Ask each caregiver for preferred timing, provide provisional arrival windows, and then reconcile the commitments with the lead',
    ],
    correct: 1,
    rationale: 'Use the current EHR and individualized plans, but report changed consequences and access for every affected patient before assuming sequence or travel. Let the designated lead allocate resources, use 911 for immediate life threats, and do not create provisional commitments the agency has not confirmed. Sources: CL-PR-005; OP-FM-005.',
  },
];

const STYLES = [
  '.m02,.m02 *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
  '@keyframes m02-pop{from{transform:scale(.97);opacity:0}to{transform:scale(1);opacity:1}}',
  '@keyframes m02-ping{75%,100%{transform:scale(1.7);opacity:0}}',
  '.m02-shell{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;overflow:hidden;background:#F8FAFC;color:#2D3748}',
  '.m02-top{height:64px;flex:0 0 64px;display:flex;align-items:center;gap:12px;padding:0 20px;background:#fff;border-bottom:1px solid #E2E8F0}',
  '.m02-brand{display:flex;align-items:center;gap:8px;flex-shrink:0;color:#0F5B54;font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}',
  '.m02-tabs{display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow-x:auto;scrollbar-width:none}',
  '.m02-tabs::-webkit-scrollbar{display:none}',
  '.m02-tab{min-height:44px;padding:8px 13px;border:0;border-radius:999px;background:transparent;color:#64748B;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer}',
  '.m02-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}',
  '.m02-tab.quiz{border:1px solid #F26D33;color:#9A3412}',
  '.m02-tab.quiz.active{border-color:#C2410C;background:#C2410C;color:#fff}',
  '.m02-exit{min-height:44px;flex-shrink:0;padding:8px 15px;border:1px solid #F26D33;border-radius:10px;background:#fff;color:#9A3412;font-size:12px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}',
  '.m02-work{display:flex;flex:1;min-height:0;padding:16px}',
  '.m02-left{width:42%;min-width:280px;max-width:520px;overflow:auto;padding:22px;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px}',
  '.m02-right{display:flex;flex:1;min-width:0;padding:12px;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0}',
  '.m02-stage-wrap{display:grid;place-items:center;width:100%;height:100%;min-height:0}',
  '.m02-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border:1px solid #E2E8F0;border-radius:14px;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}',
  '@supports not (width:1cqh){.m02-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}',
  '.m02-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
  '.m02-hotspot{position:absolute;z-index:10;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:48px;min-height:48px;padding:0;border:0;background:transparent;transform:translate(-50%,-50%);cursor:pointer}',
  '.m02-orb{position:relative;display:grid;place-items:center;width:48px;height:48px;min-width:48px;min-height:48px;border:3px solid #fff;border-radius:50%;color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.22);font-weight:850}',
  '.m02-ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;opacity:.5;animation:m02-ping 1.2s cubic-bezier(0,0,.2,1) 2;pointer-events:none}',
  '.m02-tag{max-width:140px;padding:5px 9px;border:1px solid #C8DFDC;border-radius:8px;background:rgba(255,255,255,.97);color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.09);font-size:11px;font-weight:850;letter-spacing:.02em;line-height:1.2;white-space:nowrap}',
  '.m02-hotspot:focus-visible .m02-orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.5)}',
  '.m02-stage-label{position:absolute;top:10px;left:10px;z-index:8;max-width:min(48%,320px);padding:8px 10px;border:1px solid #E2E8F0;border-radius:12px;background:rgba(255,255,255,.95);pointer-events:none}',
  '.m02-counter{position:absolute;top:10px;right:10px;z-index:8;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #E2E8F0;border-radius:999px;background:rgba(255,255,255,.95);color:#0F5B54;font-size:11px;font-weight:850;pointer-events:none}',
  '.m02-stage-note{position:absolute;top:58px;right:10px;z-index:7;max-width:38%;padding:7px 9px;border:1px solid #E2E8F0;border-left:3px solid #F26D33;border-radius:10px;background:rgba(255,255,255,.94);color:#2D3748;font-size:11px;line-height:1.35;pointer-events:none}',
  '.m02-stage-note strong{display:block;color:#0F5B54;font-size:11px;letter-spacing:.05em;text-transform:uppercase}',
  '.m02-reset{position:absolute;right:10px;bottom:10px;z-index:12;display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:0 12px;border:1px solid #E2E8F0;border-radius:999px;background:rgba(255,255,255,.96);color:#0F5B54;font-size:11px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}',
  '.m02-dialog-bg{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(15,91,84,.58);backdrop-filter:blur(6px);animation:m02-pop .25s cubic-bezier(.16,1,.3,1)}',
  '.m02-dialog{width:min(470px,100%);max-height:min(90%,660px);overflow:auto;border:2px solid #EEF4F3;border-radius:16px;background:#fff;box-shadow:0 24px 60px rgba(0,0,0,.24)}',
  '.m02-complete{position:absolute;inset:0;z-index:25;display:grid;place-items:center;padding:20px;background:rgba(15,91,84,.8);backdrop-filter:blur(8px);animation:m02-pop .25s cubic-bezier(.16,1,.3,1)}',
  '.m02-bottom{height:80px;flex:0 0 80px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 24px;background:#fff;border-top:1px solid #E2E8F0}',
  '.m02-nav{display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:0 8px;border:0;background:transparent;color:#64748B;font-size:12px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}',
  '.m02-nav:disabled{opacity:.35;cursor:not-allowed}',
  '.m02-next{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:11px 18px;border:0;border-radius:10px;background:#C2410C;color:#fff;box-shadow:0 4px 14px rgba(194,65,12,.28);font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
  '.m02-quiz-page{display:flex;justify-content:center;flex:1;min-height:0;overflow:auto;padding:20px}',
  '.m02-quiz-card{width:min(780px,100%);align-self:flex-start;overflow:hidden;border:1px solid #E2E8F0;border-radius:24px;background:#fff;box-shadow:0 24px 60px rgba(15,91,84,.12)}',
  '.m02-option{display:flex;align-items:flex-start;gap:12px;width:100%;min-height:48px;padding:14px;border:2px solid #E2E8F0;border-radius:14px;background:#fff;text-align:left;cursor:pointer}',
  '.m02-option:disabled{cursor:default}',
  '.m02 button:focus-visible,.m02 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}',
  '.m02-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}',
  '@media (max-width:900px){.m02-work{flex-direction:column;gap:10px;overflow:auto;padding:10px}.m02-left,.m02-right{width:100%;max-width:none;border:1px solid #E2E8F0;border-radius:12px}.m02-left{max-height:44vh;min-height:300px}.m02-right{min-height:390px}.m02-top{gap:8px;padding:0 10px}.m02-tab{padding:8px 10px;font-size:12px}.m02-bottom{height:72px;flex-basis:72px;padding:0 12px}}',
  '@media (max-width:640px){.m02-tag{display:none}}',
  '@media (max-width:520px){.m02-brand span{display:none}.m02-exit{padding:8px 9px;font-size:11px}.m02-bottom-center{display:none!important}.m02-next{padding:10px 12px}.m02-left{min-width:0;max-height:47vh}.m02-right{min-height:330px;padding:6px}.m02-stage-note{display:none}}',
  '@media (prefers-reduced-motion:reduce){.m02-ping,.m02-dialog-bg,.m02-complete{animation:none!important}.m02 *{scroll-behavior:auto!important;transition:none!important}}',
].join('');

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

function FeedbackBlock({ label, body, accent = false, icon }: {
  label: string; body: string; accent?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{ padding: 12, border: '1px solid ' + (accent ? CI.tealMuted : CI.border), borderRadius: 12, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: accent ? CI.teal : CI.muted, fontSize: 11, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {icon}{label}
      </div>
      <div style={{ color: CI.ink, fontSize: 15.5, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function FeedbackDialog({ hotspot, onClose, onComplete, trigger }: {
  hotspot: Hotspot;
  onClose: () => void;
  onComplete: () => void;
  trigger: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  const palette = KIND[hotspot.kind];

  const closeAndReturn = () => {
    onClose();
    window.requestAnimationFrame(() => trigger.current?.focus());
  };

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [hotspot.id]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = root.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])');
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
    <div className="m02-dialog-bg" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeAndReturn();
    }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="m02-dialog">
        <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 16, borderBottom: '1px solid ' + CI.border, background: 'rgba(255,255,255,.97)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 10, background: palette.color, color: '#fff' }}>
              {hotspot.kind === 'unsafe' ? <XCircle size={19} /> : hotspot.kind === 'coordinate' ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, color: CI.teal, fontSize: 16, lineHeight: 1.3 }}>{hotspot.label}</h2>
              <div style={{ color: CI.muted, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{palette.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close feedback" onClick={closeAndReturn}
            style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, minWidth: 44, border: '1px solid ' + CI.border, borderRadius: '50%', background: CI.bg, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <p id={descId} className="m02-sr">Focused emergency-preparedness feedback</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: 16 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observed} />
          <FeedbackBlock label="Why it matters" body={hotspot.why} />
          <FeedbackBlock label="Safe field action" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.refs.map((ref) => (
              <span key={ref} style={{ padding: '4px 8px', border: '1px solid ' + CI.tealMuted, borderRadius: 6, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 850, letterSpacing: '.03em' }}>{ref}</span>
            ))}
          </div>
          <button type="button" onClick={() => {
            onComplete();
            window.requestAnimationFrame(() => trigger.current?.focus());
          }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontSize: 12, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Mark observed
          </button>
        </div>
      </div>
    </div>
  );
}

function DecisionCheckCard({ check, value, onAnswer }: {
  check: DecisionCheck;
  value: number | null;
  onAnswer: (answer: number) => void;
}) {
  const answered = value !== null;
  return (
    <div style={{ marginTop: 14, padding: 14, border: '1px solid ' + CI.tealMuted, borderRadius: 12, background: CI.tealSoft }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: CI.teal, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        <Sparkles size={14} /> Quick decision check
      </div>
      <div style={{ marginBottom: 10, color: CI.ink, fontSize: 15, fontWeight: 750, lineHeight: 1.5 }}>{check.prompt}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {check.options.map((option, index) => {
          const selected = value === index;
          const correct = answered && index === check.correct;
          const wrong = answered && selected && index !== check.correct;
          return (
            <button key={option} type="button" onClick={() => onAnswer(index)} aria-pressed={selected}
              style={{
                minHeight: 44, padding: '9px 11px',
                border: '2px solid ' + (correct ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border),
                borderRadius: 10, background: wrong ? '#FEF2F2' : '#fff', color: CI.ink,
                textAlign: 'left', fontSize: 14, fontWeight: 650, lineHeight: 1.45, cursor: 'pointer',
              }}>
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <div role="status" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid ' + CI.tealMuted, color: CI.ink, fontSize: 14, lineHeight: 1.55 }}>
          <strong style={{ color: value === check.correct ? CI.teal : CI.orangeDark }}>{value === check.correct ? 'Sound judgment. ' : 'Reconsider. '}</strong>
          {check.feedback}
        </div>
      )}
    </div>
  );
}

function LeftPanel({ lesson, index, microAnswer, onMicroAnswer }: {
  lesson: Lesson;
  index: number;
  microAnswer: number | null;
  onMicroAnswer: (answer: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'inline-block', marginBottom: 14, padding: '4px 10px', border: '1px solid ' + CI.tealMuted, borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        Lesson {index + 1} · {index + 1} of {LESSONS.length}
      </div>
      <h1 style={{ margin: '0 0 7px', color: '#1F1C1B', fontSize: 24, fontWeight: 850, lineHeight: 1.25 }}>{lesson.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 700, lineHeight: 1.45 }}>{lesson.subtitle}</p>
      {lesson.overview.map((paragraph) => (
        <p key={paragraph} style={{ margin: '0 0 12px', color: '#524C4B', fontSize: 17, lineHeight: 1.65 }}>{paragraph}</p>
      ))}
      <details style={{ marginBottom: 16, border: '1px solid ' + CI.border, borderRadius: 12, background: '#FAFBF8' }}>
        <summary style={{ minHeight: 44, padding: '12px 14px', color: CI.teal, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>View Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: '1px solid ' + CI.border, background: '#fff' }}>
          {lesson.details.map((paragraph) => (
            <p key={paragraph} style={{ margin: '0 0 12px', color: '#524C4B', fontSize: 16, lineHeight: 1.65 }}>{paragraph}</p>
          ))}
          <DecisionCheckCard check={lesson.check} value={microAnswer} onAnswer={onMicroAnswer} />
        </div>
      </details>
      <div style={{ marginBottom: 10, color: CI.muted, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {lesson.actions.map((item) => (
          <div key={item.title} style={{ display: 'flex', gap: 9, padding: 12, border: '1px solid ' + CI.border, borderRadius: 12, background: '#fff' }}>
            <span aria-hidden style={{ fontSize: 18 }}>{item.icon}</span>
            <div>
              <div style={{ marginBottom: 2, color: '#1F1C1B', fontSize: 13, fontWeight: 800 }}>{item.title}</div>
              <div style={{ color: CI.muted, fontSize: 14, lineHeight: 1.45 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14, padding: 14, border: '1px solid ' + CI.border, borderLeft: '4px solid ' + CI.orangeDark, borderRadius: 12, background: '#FAFBF8' }}>
        <div style={{ marginBottom: 6, color: CI.orangeDark, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>Clinical Tip</div>
        <div style={{ color: '#524C4B', fontSize: 15, lineHeight: 1.55 }}>{lesson.tip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {lesson.sources.map((source) => (
          <span key={source.kind + source.text} style={{ padding: '5px 8px', border: '1px solid ' + CI.border, borderRadius: 6, background: '#FAFBF8', color: CI.muted, fontSize: 11, fontWeight: 750, letterSpacing: '.03em' }}>
            {source.kind}: {source.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Scene({ lesson, completed, setCompleted, onAdvance }: {
  lesson: Lesson;
  completed: string[];
  setCompleted: (ids: string[]) => void;
  onAdvance: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const completionAction = useRef<HTMLButtonElement | null>(null);
  const active = lesson.hotspots.find((item) => item.id === activeId) ?? null;
  const done = lesson.hotspots.every((item) => completed.includes(item.id));
  const nextIncomplete = lesson.hotspots.find((item) => !completed.includes(item.id));

  useEffect(() => setActiveId(null), [lesson.id]);
  useEffect(() => {
    if (!done || activeId) return;
    const frame = window.requestAnimationFrame(() => completionAction.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [done, activeId]);

  return (
    <div className="m02-stage-wrap">
      <div className="m02-stage" role="region" aria-label={lesson.title + ' interactive scene'}>
        <img src={lesson.image} alt={lesson.imageAlt} draggable={false} />
        <div className="m02-stage-label">
          <div style={{ color: CI.orangeDark, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>{lesson.shortName}</div>
          <div style={{ color: CI.teal, fontSize: 13, fontWeight: 850 }}>{lesson.title}</div>
        </div>
        <div className="m02-counter" aria-hidden="true"><Eye size={14} /> {completed.length} / {lesson.hotspots.length} observed</div>
        <div className="m02-stage-note" role="note" style={lesson.id === 0 ? { left: 10, right: 'auto' } : undefined}>
          <strong>{lesson.overlay.heading}</strong>
          {lesson.overlay.body}
        </div>
        {lesson.hotspots.map((hotspot) => {
          const isDone = completed.includes(hotspot.id);
          const guided = !isDone && nextIncomplete?.id === hotspot.id;
          const palette = KIND[hotspot.kind];
          return (
            <button key={hotspot.id} type="button" className="m02-hotspot"
              style={{ left: hotspot.x + '%', top: hotspot.y + '%' }}
              tabIndex={done ? -1 : 0}
              aria-label={isDone ? hotspot.label + ', observed' : 'Investigate ' + hotspot.label}
              aria-describedby={'m02-progress-' + lesson.id}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setActiveId(hotspot.id);
              }}>
              <span className="m02-orb" style={{ background: isDone ? CI.teal : hotspot.kind === 'guidance' ? CI.orange : palette.color }}>
                {guided && <span className="m02-ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span aria-hidden>?</span>}
              </span>
              <span className="m02-tag">{hotspot.shortLabel}</span>
            </button>
          );
        })}
        <div id={'m02-progress-' + lesson.id} className="m02-sr" aria-live="polite">{completed.length} of {lesson.hotspots.length} hotspots observed</div>
        <button type="button" className="m02-reset" tabIndex={done ? -1 : 0} onClick={() => setCompleted([])} aria-label="Reset this lesson's hotspot progress">
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div className="m02-complete" role="status" aria-live="polite">
            <div className="m02-complete-card" style={{ width: 'min(390px,100%)', maxHeight: '100%', overflow: 'auto', padding: 24, border: '4px solid ' + CI.tealSoft, borderRadius: 16, background: '#fff', textAlign: 'center' }}>
              <div style={{ display: 'grid', placeItems: 'center', width: 64, height: 64, margin: '0 auto 12px', borderRadius: '50%', background: CI.tealSoft }}>
                <ShieldCheck size={32} color={CI.teal} />
              </div>
              <div style={{ marginBottom: 6, color: CI.teal, fontSize: 19, fontWeight: 850 }}>Scene complete</div>
              <div style={{ marginBottom: 14, color: CI.muted, fontSize: 14, lineHeight: 1.5 }}>Scenario practice complete. Knowledge practice only — field competency and emergency assignment remain separate.</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setCompleted([])} style={{ minHeight: 44, padding: '0 18px', border: '1px solid ' + CI.border, borderRadius: 10, background: '#fff', color: CI.teal, fontSize: 12, fontWeight: 850, cursor: 'pointer' }}>
                  Review scene
                </button>
                <button ref={completionAction} type="button" onClick={onAdvance} style={{ minHeight: 44, padding: '0 18px', border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontSize: 12, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {lesson.id === LESSONS.length - 1 ? 'Go to Knowledge Check' : 'Continue to next lesson'}
                </button>
              </div>
            </div>
          </div>
        )}
        {active && (
          <FeedbackDialog
            hotspot={active}
            trigger={trigger}
            onClose={() => setActiveId(null)}
            onComplete={() => {
              if (!completed.includes(active.id)) setCompleted([...completed, active.id]);
              setActiveId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

type QuizState = {
  answers: (number | null)[];
  index: number;
  selected: number | null;
  submitted: boolean;
  finished: boolean;
  attempts: number;
  bestScore: number;
  lastScore: number;
};

function Quiz({ state, setState, onBack }: {
  state: QuizState;
  setState: React.Dispatch<React.SetStateAction<QuizState>>;
  onBack: () => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const question = QUIZ[state.index];
  const score = useMemo(() => state.answers.reduce<number>((sum, answer, index) => sum + (answer === QUIZ[index].correct ? 1 : 0), 0), [state.answers]);
  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = percent >= META.passing;
  const isCorrect = state.selected === question.correct;

  const choose = (index: number) => {
    if (state.submitted) return;
    setState((current) => ({ ...current, selected: index }));
    window.requestAnimationFrame(() => refs.current[index]?.focus());
  };

  const advance = () => {
    if (state.selected === null) return;
    if (!state.submitted) {
      setState((current) => {
        const answers = [...current.answers];
        answers[current.index] = current.selected;
        return { ...current, answers, submitted: true };
      });
      return;
    }
    if (state.index === QUIZ.length - 1) {
      setState((current) => {
        const finalScore = current.answers.reduce<number>((sum, answer, index) => sum + (answer === QUIZ[index].correct ? 1 : 0), 0);
        return {
          ...current,
          finished: true,
          attempts: current.attempts + 1,
          bestScore: Math.max(current.bestScore, finalScore),
          lastScore: finalScore,
        };
      });
      return;
    }
    setState((current) => {
      const next = current.index + 1;
      const prior = current.answers[next];
      return { ...current, index: next, selected: prior, submitted: prior !== null };
    });
  };

  if (state.finished) {
    return (
      <div className="m02-quiz-page">
        <div className="m02-quiz-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ marginBottom: 8, color: CI.teal, fontSize: 11, fontWeight: 850, letterSpacing: '.16em', textTransform: 'uppercase' }}>Knowledge Check Complete</div>
          <div style={{ display: 'grid', placeItems: 'center', width: 140, height: 140, margin: '12px auto 18px', border: '10px solid ' + (passed ? CI.teal : CI.orange), borderRadius: '50%', background: CI.bg }}>
            <div>
              <div style={{ color: passed ? CI.teal : CI.orangeDark, fontSize: 30, fontWeight: 850 }}>{percent}%</div>
              <div style={{ color: CI.muted, fontSize: 12, fontWeight: 750 }}>{score}/{QUIZ.length}</div>
            </div>
          </div>
          <h2 style={{ margin: '0 0 7px', color: CI.teal, fontSize: 23 }}>{passed ? 'Knowledge threshold met' : 'Review and try again'}</h2>
          <p style={{ maxWidth: 520, margin: '0 auto 18px', color: CI.muted, fontSize: 15, lineHeight: 1.6 }}>
            {passed
              ? 'Scenario knowledge is complete for this attempt. This result does not assign an emergency role, expand professional scope, or validate hands-on field competency.'
              : 'Review the lesson details and feedback, then retake the check. Safe emergency decisions require current agency direction and patient-specific planning.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 22 }}>
            {[
              ['Protect', 'Immediate life and scene safety'],
              ['Coordinate', 'Current plan and designated lead'],
              ['Document', 'Facts, attempts, direction, owner'],
            ].map(([label, detail]) => (
              <div key={label} style={{ padding: 14, border: '1px solid ' + CI.border, borderRadius: 14, background: CI.bg }}>
                <div style={{ color: CI.teal, fontSize: 13, fontWeight: 850 }}>{label}</div>
                <div style={{ marginTop: 4, color: CI.muted, fontSize: 11, lineHeight: 1.35 }}>{detail}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 18, color: CI.muted, fontSize: 12 }}>Attempts: {state.attempts} · Last: {state.lastScore}/{QUIZ.length} · Best: {state.bestScore}/{QUIZ.length} · Passing threshold: {META.passing}%</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 18px', border: '1px solid ' + CI.border, borderRadius: 10, background: '#fff', color: CI.teal, fontWeight: 850, cursor: 'pointer' }}>Back to Lessons</button>
            <button type="button" onClick={() => setState((current) => ({
              ...current,
              answers: Array(QUIZ.length).fill(null),
              index: 0,
              selected: null,
              submitted: false,
              finished: false,
            }))} style={{ minHeight: 44, padding: '0 18px', border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 850, cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((state.index + (state.submitted ? 1 : 0)) / QUIZ.length) * 100;
  return (
    <div className="m02-quiz-page">
      <div className="m02-quiz-card">
        <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg,' + CI.teal + ',#0A3D39)', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12, fontSize: 12, fontWeight: 850, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            <span>Field Judgment Check</span><span>{state.index + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, overflow: 'hidden', borderRadius: 999, background: 'rgba(255,255,255,.18)' }}>
            <div style={{ width: Math.max(progress, 5) + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,' + CI.orange + ',#FFB088)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 750, letterSpacing: '.05em', textTransform: 'uppercase', opacity: .9 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            <Sparkles size={13} /> Item {state.index + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', color: CI.ink, fontSize: 20, fontWeight: 850, lineHeight: 1.45 }}>{question.stem}</h2>
          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'grid', gap: 10 }}
            onKeyDown={(event) => {
              if (state.submitted) return;
              const current = state.selected ?? 0;
              let next: number | null = null;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % question.options.length;
              if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + question.options.length) % question.options.length;
              if (event.key === 'Home') next = 0;
              if (event.key === 'End') next = question.options.length - 1;
              if (next !== null) {
                event.preventDefault();
                choose(next);
              }
            }}>
            {question.options.map((option, index) => {
              const selected = state.selected === index;
              const correct = state.submitted && index === question.correct;
              const wrong = state.submitted && selected && index !== question.correct;
              return (
                <button key={option} ref={(element) => { refs.current[index] = element; }} type="button" role="radio" aria-checked={selected}
                  className="m02-option"
                  tabIndex={selected || (state.selected === null && index === 0) ? 0 : -1}
                  disabled={state.submitted}
                  onClick={() => choose(index)}
                  style={{
                    borderColor: correct ? CI.teal : wrong ? CI.red : selected ? CI.teal : CI.border,
                    background: correct ? CI.tealSoft : wrong ? '#FEF2F2' : selected ? '#F3FBFA' : '#fff',
                  }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 29, height: 29, flexShrink: 0, borderRadius: 8, background: correct ? CI.teal : wrong ? CI.red : selected ? CI.teal : CI.bg, color: correct || wrong || selected ? '#fff' : CI.muted, fontSize: 12, fontWeight: 850 }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={{ paddingTop: 3, color: CI.ink, fontSize: 16, fontWeight: 650, lineHeight: 1.5 }}>{option}</span>
                  {correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {wrong && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
          {state.submitted && (
            <div role="status" style={{ marginTop: 14, padding: 14, border: '1px solid ' + (isCorrect ? CI.tealMuted : '#F6C7A8'), borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC' }}>
              <div style={{ marginBottom: 6, color: isCorrect ? CI.teal : CI.orangeDark, fontSize: 11, fontWeight: 850, letterSpacing: '.1em', textTransform: 'uppercase' }}>{isCorrect ? 'Correct judgment' : 'Recalibrate'}</div>
              <div style={{ color: CI.ink, fontSize: 15.5, lineHeight: 1.6 }}>{question.rationale}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', border: '1px solid ' + CI.border, borderRadius: 10, background: '#fff', color: CI.muted, fontWeight: 750, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={advance} disabled={state.selected === null}
              style={{ minHeight: 48, flex: 1, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', opacity: state.selected === null ? .5 : 1, fontSize: 13, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase', cursor: state.selected === null ? 'not-allowed' : 'pointer' }}>
              {!state.submitted ? 'Lock in answer' : state.index === QUIZ.length - 1 ? 'See preparedness results' : 'Next item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Persisted = {
  schemaVersion: 1;
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByLesson: Record<number, string[]>;
  microAnswers: Record<number, number>;
  quiz: QuizState;
};

const DEFAULT_QUIZ: QuizState = {
  answers: Array(QUIZ.length).fill(null),
  index: 0,
  selected: null,
  submitted: false,
  finished: false,
  attempts: 0,
  bestScore: 0,
  lastScore: 0,
};

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function normalizeQuiz(value: Partial<QuizState> | null | undefined): QuizState {
  const index = clampInteger(value?.index, 0, QUIZ.length - 1, 0);
  const answers = Array.from({ length: QUIZ.length }, (_, questionIndex) => {
    const answer = value?.answers?.[questionIndex];
    return typeof answer === 'number' && Number.isInteger(answer)
      && answer >= 0 && answer < QUIZ[questionIndex].options.length ? answer : null;
  });
  const selected = clampInteger(value?.selected, 0, QUIZ[index].options.length - 1, -1);
  return {
    answers,
    index,
    selected: selected >= 0 ? selected : null,
    submitted: Boolean(value?.submitted && selected >= 0),
    finished: Boolean(value?.finished),
    attempts: clampInteger(value?.attempts, 0, Number.MAX_SAFE_INTEGER, 0),
    bestScore: clampInteger(value?.bestScore, 0, QUIZ.length, 0),
    lastScore: clampInteger(value?.lastScore, 0, QUIZ.length, 0),
  };
}

function loadProgress(): Persisted | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(META.storageKey);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Persisted>;
    const completedByLesson = Object.fromEntries(LESSONS.map((lesson) => {
      const validIds = new Set(lesson.hotspots.map((hotspot) => hotspot.id));
      const storedIds = Array.isArray(value.completedByLesson?.[lesson.id])
        ? value.completedByLesson[lesson.id] : [];
      return [lesson.id, [...new Set(storedIds.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]];
    }));
    const microAnswers = Object.fromEntries(LESSONS.flatMap((lesson) => {
      const answer = value.microAnswers?.[lesson.id];
      return typeof answer === 'number' && Number.isInteger(answer)
        && answer >= 0 && answer < lesson.check.options.length ? [[lesson.id, answer]] : [];
    }));
    return {
      schemaVersion: 1,
      pageIndex: clampInteger(value.pageIndex, 0, LESSONS.length - 1, 0),
      mode: value.mode === 'quiz' ? 'quiz' : 'lessons',
      completedByLesson,
      microAnswers,
      quiz: normalizeQuiz(value.quiz),
    };
  } catch {
    return null;
  }
}

function saveProgress(value: Persisted) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(META.storageKey, JSON.stringify(value));
  } catch {
    // Private browsing or quota limits: the module remains usable for this session.
  }
}

export default function ACHCARTM02() {
  const initial = useMemo(() => loadProgress(), []);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const workRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLElement | null>(null);
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [completedByLesson, setCompletedByLesson] = useState<Record<number, string[]>>(initial?.completedByLesson ?? {});
  const [microAnswers, setMicroAnswers] = useState<Record<number, number>>(initial?.microAnswers ?? {});
  const [quiz, setQuiz] = useState<QuizState>(initial?.quiz ?? DEFAULT_QUIZ);
  const lesson = LESSONS[Math.min(Math.max(pageIndex, 0), LESSONS.length - 1)];
  const completed = completedByLesson[lesson.id] ?? [];

  const persist = (patch?: Partial<Persisted>) => {
    saveProgress({
      schemaVersion: 1,
      pageIndex,
      mode,
      completedByLesson,
      microAnswers,
      quiz,
      ...patch,
    });
  };

  useEffect(() => {
    persist();
  }, [pageIndex, mode, completedByLesson, microAnswers, quiz]);

  useEffect(() => {
    if (mode !== 'lessons') return;
    [workRef.current, leftRef.current].forEach((element) => {
      if (!element) return;
      if (typeof element.scrollTo === 'function') element.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      else element.scrollTop = 0;
    });
  }, [pageIndex, mode]);

  const saveAndExit = () => {
    persist();
    if (window.history.length > 1) window.history.back();
  };

  const activateTab = (index: number) => {
    if (index === LESSONS.length) {
      setMode('quiz');
      return;
    }
    setMode('lessons');
    setPageIndex(index);
  };

  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const tabCount = LESSONS.length + 1;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabCount;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabCount) % tabCount;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabCount - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateTab(nextIndex);
    window.requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  };

  const goForward = () => {
    if (lesson.id === LESSONS.length - 1) {
      setMode('quiz');
    } else {
      setPageIndex((current) => Math.min(LESSONS.length - 1, current + 1));
    }
  };

  return (
    <div className="m02 m02-shell">
      <style>{STYLES}</style>
      <header className="m02-top">
        <div className="m02-brand" aria-label="Care Indeed">
          <BrandMark />
          <span>M02 · Emergency Preparedness</span>
        </div>
        <div className="m02-tabs" role="tablist" aria-label="Module lessons">
          {LESSONS.map((item, index) => (
            <button key={item.id} id={'m02-tab-' + item.id} type="button" role="tab"
              ref={(element) => { tabRefs.current[index] = element; }}
              aria-selected={mode === 'lessons' && pageIndex === index}
              aria-controls="m02-lesson-panel"
              className={'m02-tab ' + (mode === 'lessons' && pageIndex === index ? 'active' : '')}
              tabIndex={mode === 'lessons' && pageIndex === index ? 0 : -1}
              onKeyDown={(event) => handleTabKey(event, index)}
              onClick={() => activateTab(index)}>
              {item.shortName}
            </button>
          ))}
          <button id="m02-tab-kc" type="button" role="tab" aria-selected={mode === 'quiz'} aria-controls="m02-quiz-panel"
            ref={(element) => { tabRefs.current[LESSONS.length] = element; }}
            tabIndex={mode === 'quiz' ? 0 : -1}
            className={'m02-tab quiz ' + (mode === 'quiz' ? 'active' : '')}
            onKeyDown={(event) => handleTabKey(event, LESSONS.length)}
            onClick={() => activateTab(LESSONS.length)}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="m02-exit" onClick={saveAndExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <main id="m02-quiz-panel" role="tabpanel" aria-labelledby="m02-tab-kc" style={{ display: 'contents' }}>
          <Quiz state={quiz} setState={setQuiz} onBack={() => setMode('lessons')} />
        </main>
      ) : (
        <main ref={workRef} id="m02-lesson-panel" role="tabpanel" aria-labelledby={'m02-tab-' + lesson.id} className="m02-work">
          <aside ref={leftRef} className="m02-left">
            <LeftPanel
              key={lesson.id}
              lesson={lesson}
              index={pageIndex}
              microAnswer={microAnswers[lesson.id] ?? null}
              onMicroAnswer={(answer) => setMicroAnswers((current) => ({ ...current, [lesson.id]: answer }))}
            />
          </aside>
          <section className="m02-right" aria-label="Interactive lesson scene">
            <Scene
              lesson={lesson}
              completed={completed}
              setCompleted={(ids) => setCompletedByLesson((current) => ({ ...current, [lesson.id]: ids }))}
              onAdvance={goForward}
            />
          </section>
        </main>
      )}

      <footer className="m02-bottom">
        <button type="button" className="m02-nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => mode === 'quiz' ? setMode('lessons') : setPageIndex((current) => Math.max(0, current - 1))}>
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="m02-bottom-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ padding: '8px 12px', border: '1px solid ' + CI.tealMuted, borderRadius: 8, background: CI.tealSoft, color: CI.teal, fontSize: 12, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {mode === 'quiz' ? 'Knowledge Check · ' + QUIZ.length + ' items · ' + META.passing + '% pass' : 'Lesson ' + (pageIndex + 1) + ' of ' + LESSONS.length + ' · ' + lesson.shortName}
          </span>
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="m02-next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="m02-next" onClick={goForward}>
            {pageIndex === LESSONS.length - 1 ? 'Knowledge Check' : 'Next · ' + LESSONS[pageIndex + 1].shortName} <ChevronRight size={16} />
          </button>
        )}
      </footer>
    </div>
  );
}
