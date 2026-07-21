/**
 * ACHC-ART-M12 — Medical Device Reporting & Safety
 * PASS5 learner-ready annual training module
 * Pages: 7 lessons + Knowledge Check | Hotspots: 36 | Quiz: 10 | Pass: 80%
 * Persistence: achc-art-m12-progress-v1
 * Completion confirms knowledge only; device-specific competency and external-reporting
 * authority remain separate agency processes.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-recognize-device-hazards.png';
import img02 from './assets/lesson-02-protect-patient-first.png';
import img03 from './assets/lesson-03-preserve-device-evidence.png';
import img04 from './assets/lesson-04-reporting-chain.png';
import img05 from './assets/lesson-05-mdr-medwatch.png';
import img06 from './assets/lesson-06-recall-quarantine.png';
import img07 from './assets/lesson-07-integrated-simulation.png';

const CI = {
  teal: '#0F5B54', tealDark: '#093F3A', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeText: '#9A3412', orangeAction: '#B54713', orangeSoft: '#FFF3EC',
  ink: '#2D3748', muted: '#596579', border: '#D8E0E8', red: '#B42318', redSoft: '#FEF2F2',
  white: '#FFFFFF', bg: '#F8FAFC', slateSoft: '#F1F5F9',
} as const;

type SignalKind = 'protect' | 'escalate' | 'stop' | 'evidence';

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  signal: SignalKind;
  observed: string;
  why: string;
  action: string;
  notify?: string;
  document: string;
  sourceRefs: string[];
}

interface KeyAction { icon: string; title: string; detail: string; }

interface Lesson {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: string[];
  keyActions: KeyAction[];
  clinicalTip: string;
  sourceLabels: { kind: string; text: string }[];
  sceneImage: string;
  sceneAlt: string;
  hotspots: Hotspot[];
}

interface QuizQuestion {
  id: number;
  category: 'Application' | 'Scenario' | 'Documentation' | 'Integrated judgment';
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
  source: string;
}

const SIGNAL: Record<SignalKind, { label: string; color: string; soft: string }> = {
  protect: { label: 'Protect', color: CI.teal, soft: CI.tealSoft },
  escalate: { label: 'Escalate', color: CI.orangeAction, soft: CI.orangeSoft },
  stop: { label: 'Stop unsafe use', color: CI.red, soft: CI.redSoft },
  evidence: { label: 'Preserve evidence', color: '#475569', soft: CI.slateSoft },
};

const MODULE_META = {
  id: 'ACHC-ART-M12',
  title: 'Medical Device Reporting & Safety',
  pages: 7,
  quizCount: 10,
  passing: 80,
};

const LESSONS: Lesson[] = [
  {
    id: 0,
    shortName: 'Recognize',
    title: 'Recognize Devices, Hazards & Safety Signals',
    subtitle: 'Notice the whole device system and report uncertainty before harm occurs',
    overview: [
      'A home device includes its main unit, tubing, sensors, power, software, disposables, slings, and connectors.',
      'Failure, use difficulty, incompatible parts, alarms, recalls, or unsafe conditions can affect performance even when causation is uncertain.',
    ],
    details: [
      'Compare performance with the care plan, instructions, and patient baseline. Signals include an unexplained alarm, implausible reading, interrupted therapy, heat, odor, damage, leak, or intermittent power.',
      'Confusing controls, labeling, setup, training, or environment may contribute to use error. Describe facts and user understanding without blame.',
      'Report actual or potential harm, near misses, suspected malfunctions, complaints, recalls, and alerts internally. Risk/Compliance decides root cause and federal reportability.',
      'A recall may require inspection, correction, repair, replacement, or removal. Preserve the notice and match exact identifiers, not appearance.',
    ],
    keyActions: [
      { icon: '👁️', title: 'Notice', detail: 'Compare actual and intended performance.' },
      { icon: '🧩', title: 'Include', detail: 'Check accessories, power, tubing, software, and supplies.' },
      { icon: '⚠️', title: 'Classify broadly', detail: 'Recognize harm, near miss, malfunction, use problem, or recall.' },
      { icon: '📞', title: 'Report uncertainty', detail: 'Do not wait for proof.' },
    ],
    clinicalTip: 'If the cause is unclear, report what happened. Investigation—not the field visit—decides what contributed.',
    sourceLabels: [
      { kind: 'Federal', text: '21 CFR § 803.3' },
      { kind: 'Care Indeed', text: 'RM-ER-002 §§ 4.1, 5.3' },
      { kind: 'Care Indeed', text: 'OP-SL-004 § 3.5' },
    ],
    sceneImage: img01,
    sceneAlt: 'A clinician checks an oxygen concentrator, tubing, pulse oximeter, and compact pump while a patient sits nearby.',
    hotspots: [
      {
        id: 'patient-baseline', label: 'Patient condition and baseline', shortLabel: 'Patient First', x: 29, y: 39, signal: 'protect',
        observed: 'The patient appears comfortable during the device check.',
        why: 'Patient status and baseline determine urgency; an alarm alone does not.',
        action: 'Assess within role. Call 911 for a life-threatening change before investigating equipment.',
        notify: '911 for emergency; otherwise supervisor/on-call.',
        document: 'Objective findings, baseline, care, response, time, and notifications.',
        sourceRefs: ['RM-ER-002 § 5.1.1'],
      },
      {
        id: 'tubing', label: 'Oxygen tubing and connections', shortLabel: 'Tubing', x: 54, y: 61, signal: 'escalate',
        observed: 'Tubing crosses the care area and may be kinked.',
        why: 'Kinks, leaks, disconnections, or incompatible parts can interrupt therapy.',
        action: 'Keep settings unchanged. Correct only within training and authority; otherwise escalate.',
        notify: 'Supervisor/on-call and authorized DME route.',
        document: 'Routing, connections, intervention, patient response, and direction received.',
        sourceRefs: ['CL-SD-020', 'OP-SL-004'],
      },
      {
        id: 'concentrator', label: 'Oxygen concentrator performance', shortLabel: 'Concentrator', x: 73, y: 74, signal: 'escalate',
        observed: 'A concentrator is operating beside the patient.',
        why: 'Unexpected alarm, heat, odor, output, or power loss may signal failure.',
        action: 'Record indicators. Keep ordered parameters and use only an approved contingency.',
        notify: 'Supervisor/on-call, DME, and 911 when emergent.',
        document: 'Alarm, setting, performance, patient status, backup, and contacts.',
        sourceRefs: ['CL-SD-020', 'RM-ER-002'],
      },
      {
        id: 'pump', label: 'Compact infusion pump', shortLabel: 'Pump', x: 75, y: 39, signal: 'evidence',
        observed: 'A compact pump sits in the device area.',
        why: 'Pump, container, cassette, tubing, power, and display form one evidence set.',
        action: 'Do not open, repair, or reprogram outside role. Preserve the as-found state after safety.',
        notify: 'Supervisor/on-call and authorized DME/pharmacy route.',
        document: 'Display, settings, components, therapy, patient status, and disposition.',
        sourceRefs: ['RM-ER-002 § 5.4.1', '21 CFR § 803.32'],
      },
      {
        id: 'identity', label: 'Model, serial, lot, and UDI area', shortLabel: 'Identifiers', x: 76, y: 84, signal: 'evidence',
        observed: 'The device identification plate is accessible.',
        why: 'Exact identifiers link the unit to investigation and recall scope.',
        action: 'Copy labels exactly; use only approved secure photos without unnecessary PHI.',
        notify: 'Risk Manager or Operations.',
        document: 'Manufacturer, product, model, serial, lot/batch, UDI, owner, and label condition.',
        sourceRefs: ['21 CFR § 803.32', 'OP-SL-004 Appendix A'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Protect',
    title: 'Protect the Patient Before Investigating the Device',
    subtitle: 'Treat the patient—not the alarm—and use only an approved safe transition',
    overview: [
      'Immediate safety comes first. Assess the patient and scene; call 911 for life-threatening findings.',
      'Use only an ordered contingency within role and demonstrated competency. Collect evidence after immediate danger is controlled.',
    ],
    details: [
      'Use Protect → Transition → Escalate → Preserve. Stop unsafe use only when stopping will not create greater danger; essential support may need an ordered backup first.',
      'Never delay 911 for troubleshooting, photos, vendor calls, or forms. Remain until a safe handoff occurs.',
      'Do not bypass alarms, open housings, improvise repairs, use unapproved accessories, or independently change flow, rate, dose, mode, or programmed limits.',
      'Smoke, fire, arcing, hot batteries, liquid, or oxygen-enriched hazards may require evacuation and emergency help. Personal safety outranks evidence.',
      'For active serious risk, continue the approved chain until a qualified person receives the report and gives direction.',
    ],
    keyActions: [
      { icon: '🩺', title: 'Assess', detail: 'Patient and scene determine urgency.' },
      { icon: '🚑', title: 'Activate', detail: 'Use 911 and the approved contingency when indicated.' },
      { icon: '⏸️', title: 'Transition', detail: 'Only when safe, ordered, trained, and within role.' },
      { icon: '📞', title: 'Escalate', detail: 'Reach a live clinical decision-maker.' },
    ],
    clinicalTip: 'If safety requires changing the device, record the prior state when possible, then the change, reason, time, and direction.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'RM-ER-002 § 5.1' },
      { kind: 'Care Indeed', text: 'CL-SD-020' },
      { kind: 'Practice', text: 'Protect → Transition → Escalate → Preserve' },
    ],
    sceneImage: img02,
    sceneAlt: 'A clinician assesses a patient while a concentrator warns, a caregiver holds a phone, and backup oxygen is secured nearby.',
    hotspots: [
      {
        id: 'respiratory-status', label: 'Patient respiratory status', shortLabel: 'Assess', x: 52, y: 37, signal: 'protect',
        observed: 'The clinician checks the patient before the machine.',
        why: 'Symptoms, responsiveness, measurements, and baseline establish urgency.',
        action: 'Assess within role; call 911 for emergency signs and provide authorized care.',
        notify: '911, supervisor/on-call, and physician as directed.',
        document: 'Symptoms, findings, baseline, response time, care, and outcome.',
        sourceRefs: ['RM-ER-002 § 5.1.1', 'CL-SD-020'],
      },
      {
        id: 'pulse-ox', label: 'Pulse oximeter reading', shortLabel: 'Verify Reading', x: 44, y: 51, signal: 'protect',
        observed: 'Pulse oximetry is one part of assessment.',
        why: 'Placement, motion, circulation, symptoms, and baseline affect interpretation.',
        action: 'Confirm trained use and escalate inconsistent results; never dismiss visible distress.',
        notify: 'Supervisor/on-call or 911 based on severity.',
        document: 'Reading, conditions, symptoms, authorized recheck, and escalation.',
        sourceRefs: ['CL-SD-020', 'RM-ER-002'],
      },
      {
        id: 'alarm', label: 'Concentrator warning and output', shortLabel: 'Alarm', x: 73, y: 69, signal: 'escalate',
        observed: 'The concentrator has a warning indicator.',
        why: 'Exact lights, sounds, errors, and output support care and investigation.',
        action: 'Do not bypass alarms or change flow. Follow approved instructions and contingency.',
        notify: 'Supervisor/on-call, DME, and 911 if needed.',
        document: 'Warning, setting, time, interruption, action, and response.',
        sourceRefs: ['CL-SD-020', 'OP-SL-004 § 4.3.3'],
      },
      {
        id: 'backup', label: 'Secured backup oxygen supply', shortLabel: 'Backup Plan', x: 86, y: 59, signal: 'protect',
        observed: 'A secured backup cylinder is available.',
        why: 'Backup must be ordered, sufficient, stored safely, and used by trained people.',
        action: 'Use ordered settings only when the plan and role allow; otherwise seek emergency direction.',
        notify: 'On-call clinician, DME, and emergency services.',
        document: 'Backup, setting, start time, supply, direction, and response.',
        sourceRefs: ['CL-SD-020', 'Patient emergency plan'],
      },
      {
        id: 'caregiver-phone', label: 'Caregiver and emergency communication', shortLabel: 'Call', x: 91, y: 29, signal: 'escalate',
        observed: 'The caregiver has a phone ready.',
        why: 'Delegating a call can speed response while the clinician assesses.',
        action: 'Specify who to call and what to report; confirm connection and read back instructions.',
        notify: '911 and/or the approved on-call chain.',
        document: 'Caller, recipient, time, report, instructions, and handoff.',
        sourceRefs: ['RM-ER-002 § 5.1', 'OP-SL-002'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Preserve',
    title: 'Preserve the Device, Settings & Evidence',
    subtitle: 'Once the patient is safe, treat the complete device system like a witness',
    overview: [
      'Resetting, cleaning, repairing, discarding, or returning equipment can erase evidence.',
      'Preserve the safe as-found state, settings, accessories, packaging, identifiers, power, and objective notes without creating privacy or custody risk.',
    ],
    details: [
      'Record time, location, patient status, manufacturer, model, serial, lot, UDI, owner, exact alarm, and displayed settings before authorized intervention.',
      'Keep connected tubing, cassettes, sensors, containers, batteries, chargers, cords, slings, disposables, and packaging together when safe.',
      'Do not clean, reset, test, repair, update, ship, return, or discard the system until Risk or Operations authorizes disposition.',
      'Do not confiscate patient- or DME-owned equipment. Coordinate safe replacement and custody, especially for essential support.',
      'Use only approved secure photos; never personal phone, email, text, or cloud. Avoid unnecessary PHI.',
      'Contain contamination or electrical hazards only through the approved route. Patient and worker safety always outrank preservation.',
    ],
    keyActions: [
      { icon: '🛑', title: 'Freeze', detail: 'Do not reset, clean, repair, discard, or return.' },
      { icon: '🔎', title: 'Capture', detail: 'Record display, settings, identifiers, and environment.' },
      { icon: '🧩', title: 'Keep together', detail: 'Preserve accessories, consumables, power, and packaging.' },
      { icon: '🔐', title: 'Secure', detail: 'Tag and track custody through the authorized path.' },
    ],
    clinicalTip: 'When safety changes the evidence, record the prior state if possible, then the exact change, reason, time, and direction.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'RM-ER-002 §§ 5.2, 5.4' },
      { kind: 'Care Indeed', text: 'OP-SL-004 § 4.3.3' },
      { kind: 'Federal', text: '21 CFR § 803.32' },
    ],
    sceneImage: img03,
    sceneAlt: 'A clinician documents a disconnected pump beside its tubing, adapter, packaging, label, secure phone, and agency tablet.',
    hotspots: [
      {
        id: 'pump-state', label: 'Pump as-found state', shortLabel: 'Do Not Reset', x: 27, y: 68, signal: 'evidence',
        observed: 'The pump remains intact after patient protection.',
        why: 'Power-cycling, opening, reprogramming, or clearing history changes evidence.',
        action: 'Leave controls and housing unchanged unless safety or an authorized investigator requires action.',
        notify: 'Supervisor, Risk, and Operations/DME.',
        document: 'Power state, display, settings, visible history, and any safety change.',
        sourceRefs: ['RM-ER-002 § 5.4.1', 'OP-SL-004 § 4.3.3'],
      },
      {
        id: 'accessories', label: 'Tubing, adapter, and connected accessories', shortLabel: 'Keep Together', x: 39, y: 83, signal: 'evidence',
        observed: 'Tubing and accessories remain beside the pump.',
        why: 'Connectors, cassettes, power parts, sensors, or disposables may explain failure.',
        action: 'Preserve the connected system separately; never mix components from different devices.',
        notify: 'Risk or Operations for custody instructions.',
        document: 'Components, brand/model, lot/expiration, connection state, and custody.',
        sourceRefs: ['21 CFR § 803.32', 'RM-ER-002 Appendix A'],
      },
      {
        id: 'package', label: 'Packaging and product information', shortLabel: 'Packaging', x: 18, y: 48, signal: 'evidence',
        observed: 'Shipping and accessory packaging remain available.',
        why: 'Packaging may identify catalog, lot, UDI, expiration, storage, and distribution.',
        action: 'Keep it with evidence when safe; never alter the original label.',
        notify: 'Operations or Risk if stored separately.',
        document: 'Catalog, lot, packaging condition, location, and custodian.',
        sourceRefs: ['RM-PS-003', '21 CFR § 803.32'],
      },
      {
        id: 'approved-photo', label: 'Authorized device photograph', shortLabel: 'Secure Photo', x: 58, y: 28, signal: 'evidence',
        observed: 'The device—not the patient or home—is framed.',
        why: 'A focused image preserves transient details; personal devices and PHI create risk.',
        action: 'Use only an authorized secured device and destination; otherwise write exact facts.',
        notify: 'Supervisor or Risk if authority is unclear.',
        document: 'Authorization, device, subject, capture time, destination, and transfer.',
        sourceRefs: ['RM-ER-002 § 5.4.1', 'Agency privacy/security policy'],
      },
      {
        id: 'contemporaneous-note', label: 'Contemporaneous factual note', shortLabel: 'Write Facts', x: 65, y: 69, signal: 'escalate',
        observed: 'An agency tablet supports immediate notes.',
        why: 'Timely notes preserve displays, findings, contacts, instructions, and actions.',
        action: 'Write objective facts and attributed statements; avoid blame, speculation, or causation claims.',
        notify: 'Complete both clinical and separate incident routes.',
        document: 'Who, what, when, where, identifiers, patient impact, actions, evidence, and disposition.',
        sourceRefs: ['RM-ER-002 § 5.2.1', 'CL-CD-001'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Report',
    title: 'Use the Internal Reporting Chain',
    subtitle: 'Verbal escalation comes before paperwork in an active event',
    overview: [
      'Field workers observe, protect, preserve, report, and document; they do not own every decision.',
      'Clinical, Operations, Risk/Compliance, QAPI, and leaders coordinate care, replacement, investigation, external review, trends, and corrective action.',
    ],
    details: [
      'After safety actions, verbally notify the supervisor promptly and within one hour under RM-ER-002. Use the approved on-call route; notify Operations immediately for suspected defective agency equipment.',
      'For serious active risk, continue until a live handoff. State patient status, device behavior, support, actions, evidence, and the decision needed; repeat back directions.',
      'Complete the confidential incident form within 24 hours. Chart assessment, care, response, communications, orders, replacement, and follow-up separately in the clinical record.',
      'Do not interrogate, promise outcomes, assign blame, decide causation, or call a device defective. Risk leads interviews, evidence review, classification, and root-cause work.',
      'Coordinate vendor or manufacturer contact. Never return, ship, surrender, repair, or exchange evidence without approved instructions and a safe patient transition.',
      'Risk tracks the event; clinical leadership protects care; Operations manages equipment; the designated official reviews external duties; QAPI identifies trends.',
    ],
    keyActions: [
      { icon: '📞', title: 'Call', detail: 'Reach the live supervisor/on-call route.' },
      { icon: '🧭', title: 'Route', detail: 'Clinical, Operations, Risk, and leaders own different work.' },
      { icon: '🔁', title: 'Close the loop', detail: 'Confirm receipt and repeat back direction.' },
      { icon: '🗂️', title: 'Separate records', detail: 'Chart care; send the event form to Risk.' },
    ],
    clinicalTip: 'Say the device may have contributed and report evidence. Never state that a person or device caused the event before investigation.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'RM-ER-002 §§ 4–6' },
      { kind: 'Care Indeed', text: 'OP-SL-004 § 4.3.3' },
      { kind: 'Federal', text: '21 CFR § 803.17' },
    ],
    sceneImage: img04,
    sceneAlt: 'A clinician makes a secure escalation call beside a tagged device and agency tablet while a patient remains with a caregiver.',
    hotspots: [
      {
        id: 'live-call', label: 'Live supervisor or on-call contact', shortLabel: 'Live Handoff', x: 31, y: 25, signal: 'escalate',
        observed: 'The clinician makes a live agency call.',
        why: 'Active serious risk requires confirmed receipt and clinical direction.',
        action: 'State patient, device, support, action, and need; read back directions and continue if unanswered.',
        notify: 'Supervisor/on-call; 911 and others as needed.',
        document: 'Call time, person, report, direction, read-back, and next step.',
        sourceRefs: ['RM-ER-002 § 5.1.2', 'OP-SL-002'],
      },
      {
        id: 'tagged-device', label: 'Tagged device protected from reuse', shortLabel: 'Out of Service', x: 73, y: 60, signal: 'stop',
        observed: 'The device is disconnected and tagged.',
        why: 'A suspected defective agency device could harm another patient if reused.',
        action: 'Prevent reuse and preserve it through agency containment; never self-clear the unit.',
        notify: 'Operations immediately and Risk for an event or near miss.',
        document: 'Tag time, identifiers, location, custodian, and disposition direction.',
        sourceRefs: ['OP-SL-004 § 4.3.3', 'RM-ER-002'],
      },
      {
        id: 'incident-portal', label: 'Separate incident-reporting record', shortLabel: 'Incident Form', x: 88, y: 68, signal: 'evidence',
        observed: 'The tablet represents internal incident reporting.',
        why: 'The confidential event record supports investigation and is not the clinical note.',
        action: 'Submit factual fields within 24 hours through the Risk route.',
        notify: 'Supervisor and Risk Manager.',
        document: 'Event, patient impact, identifiers, actions, notifications, evidence, and disposition.',
        sourceRefs: ['RM-ER-002 §§ 4.3, 5.2'],
      },
      {
        id: 'clock', label: 'Awareness and notification times', shortLabel: 'Time Matters', x: 74, y: 11, signal: 'escalate',
        observed: 'A clock marks the reporting sequence.',
        why: 'Awareness starts regulatory timing; investigation does not pause the clock.',
        action: 'Record event, discovery, calls, care, directions, and handoff times; never await certainty.',
        notify: 'Risk immediately for death, serious injury, or potential reportability.',
        document: 'Exact dates and times each role learned the information.',
        sourceRefs: ['21 CFR § 803.30', 'RM-ER-002 § 5.1'],
      },
      {
        id: 'contact-card', label: 'Authorized DME and clinical contact route', shortLabel: 'Right Route', x: 82, y: 84, signal: 'escalate',
        observed: 'Configured contacts are available beside the device.',
        why: 'Clinical, replacement, custody, and external-review owners may differ.',
        action: 'Use current configured routes; never return equipment without authorization.',
        notify: 'Supervisor/on-call, Operations/DME, and Risk as required.',
        document: 'Contact, role, route, time, direction, confirmation, and replacement plan.',
        sourceRefs: ['OP-SL-004', 'RM-PS-003'],
      },
    ],
  },
  {
    id: 4,
    shortName: 'MDR / MedWatch',
    title: 'Distinguish FDA MDR from Voluntary MedWatch',
    subtitle: 'Reporter category, event, recipient, and timing determine the federal route',
    overview: [
      'Medical Device Reporting is the mandatory federal system; MedWatch also supports voluntary safety reporting.',
      'Field workers report internally without delay. The designated Risk/Compliance owner decides and files for the organization.',
    ],
    details: [
      '21 CFR § 803.3 includes home health care groups in the outpatient-treatment facility definition. The authorized official applies the device user-facility framework and written MDR procedure.',
      'A user facility reports information reasonably suggesting device contribution to death to FDA and the known manufacturer within 10 work days after awareness. Serious injury goes to the known manufacturer, or FDA if manufacturer is unknown, within 10 work days.',
      'Serious injury is life-threatening, permanently impairs or damages a body function or structure, or requires intervention to prevent permanent impairment or damage.',
      'Malfunction alone is not a mandatory user-facility MDR, but remains internally reportable and may support MedWatch, a manufacturer complaint, recall response, maintenance, or QAPI. Never import a manufacturer 30-calendar-day rule into this route.',
      'Form 3500 is voluntary; Form 3500A or an allowed electronic equivalent supports mandatory reporting; Form 3419 is the annual user-facility summary. Voluntary reporting never replaces internal or mandatory duties.',
      '“May have caused or contributed” is not proof of defect or fault. Agency sources conflict on filer, timing, and ownership; the approved MDR procedure and designated official govern filing.',
    ],
    keyActions: [
      { icon: '🔎', title: 'Recognize', detail: 'Internal reporting is broader than federal MDR.' },
      { icon: '📤', title: 'Forward', detail: 'Immediate escalation protects the reporting clock.' },
      { icon: '⚖️', title: 'Distinguish', detail: 'Mandatory MDR and voluntary MedWatch differ.' },
      { icon: '⏱️', title: 'Do not delay', detail: 'Proof is not required before internal reporting.' },
    ],
    clinicalTip: 'Do not file for Care Indeed unless formally authorized. Individual voluntary rights do not replace internal reporting or agency duties.',
    sourceLabels: [
      { kind: 'Federal', text: '21 CFR §§ 803.3, 803.17, 803.30–33' },
      { kind: 'FDA', text: 'Mandatory Reporting Requirements' },
      { kind: 'FDA', text: 'MedWatch Forms' },
    ],
    sceneImage: img05,
    sceneAlt: 'Risk and nursing leaders review a device, event file, forms, and manufacturer information while a clinician joins securely.',
    hotspots: [
      {
        id: 'event-file', label: 'User-facility event file', shortLabel: 'Event Facts', x: 27, y: 78, signal: 'evidence',
        observed: 'Authorized leaders review a structured event file.',
        why: 'Classification needs patient impact, identifiers, awareness date, reporter, and narrative.',
        action: 'Forward accurate facts promptly; never await final root cause or repair findings.',
        notify: 'Designated Risk/Compliance MDR owner.',
        document: 'Awareness date, impact, device system, event, reporter, actions, and missing facts.',
        sourceRefs: ['21 CFR §§ 803.30, 803.32'],
      },
      {
        id: 'known-manufacturer', label: 'Known manufacturer and device identity', shortLabel: 'Manufacturer', x: 82, y: 76, signal: 'evidence',
        observed: 'Product information identifies the manufacturer.',
        why: 'Known manufacturer status changes the serious-injury recipient and supports recall review.',
        action: 'Preserve manufacturer, model, serial, lot, UDI, and contacts without choosing the route.',
        notify: 'Risk/Compliance; external contact only through approved workflow.',
        document: 'Manufacturer, source, contact, complaint/report number, and date.',
        sourceRefs: ['21 CFR § 803.30', 'FDA mandatory reporting'],
      },
      {
        id: 'mandatory-route', label: 'Mandatory user-facility route', shortLabel: '3500A / eMDR', x: 72, y: 42, signal: 'escalate',
        observed: 'The workstation represents mandatory reporting.',
        why: 'Death and serious injury have different recipients but the same 10-work-day outer limit.',
        action: 'Report internally immediately; the owner verifies reportability, recipients, method, and completeness.',
        notify: 'MDR owner and Administrator/DON per procedure.',
        document: 'Decision, citation, recipients, submission, number, follow-up, and retained file.',
        sourceRefs: ['21 CFR § 803.30', 'FDA Form 3500A/electronic equivalent'],
      },
      {
        id: 'voluntary-route', label: 'Voluntary MedWatch route', shortLabel: 'Form 3500', x: 48, y: 73, signal: 'escalate',
        observed: 'A separate form represents voluntary reporting.',
        why: 'Voluntary MedWatch is not the agency mandatory user-facility report.',
        action: 'Follow the internal process first; never substitute voluntary reporting for agency duties.',
        notify: 'Risk/Compliance for coordinated review.',
        document: 'Internal report and any authorized submission or complaint date and reference.',
        sourceRefs: ['FDA MedWatch Forms', 'FDA MDR: How to Report'],
      },
      {
        id: 'awareness-date', label: 'Date the facility became aware', shortLabel: 'Awareness Clock', x: 51, y: 55, signal: 'escalate',
        observed: 'A calendar marks regulatory review.',
        why: 'Timing starts with awareness of information suggesting a reportable relationship.',
        action: 'Escalate immediately and record when relevant information first became known.',
        notify: 'Authorized MDR owner.',
        document: 'Event date, discovery time, reporter, awareness basis, and escalation timestamps.',
        sourceRefs: ['21 CFR § 803.30'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Recall',
    title: 'Respond to Recalls, Quarantine & Maintenance Signals',
    subtitle: 'Match the exact product, protect continuity of care, and prevent reuse',
    overview: [
      'A recall may require removal, inspection, repair, software correction, relabeling, new instructions, or monitoring.',
      'Risk and Operations interpret and close the notice; field workers protect, preserve, and report promptly.',
    ],
    details: [
      'Match brand, product, model, serial, lot, UDI, software, and dates to the official notice. Appearance never proves inclusion or exclusion.',
      'Segregate and label affected agency equipment when directed. Never erase settings, strip labels, swap parts, dispose, or release without authorization.',
      'Do not remove essential patient-use equipment without an approved replacement or contingency unless immediate danger requires emergency action.',
      'Maintenance and calibration records may reveal patterns but do not prove causation. Report repeated failures, complaints, recalls, alerts, and suspected defects.',
      'Preserve the original notice and verify suspicious links or numbers through FDA, manufacturer, DME, or agency sources.',
      'QAPI aggregates events and near misses to improve training, maintenance, purchasing, vendor oversight, policy, and corrective-action effectiveness.',
    ],
    keyActions: [
      { icon: '🔢', title: 'Verify', detail: 'Match identifiers and dates—not appearance.' },
      { icon: '🚧', title: 'Quarantine', detail: 'Prevent unauthorized reuse when directed and safe.' },
      { icon: '🔄', title: 'Replace safely', detail: 'Maintain therapy through an authorized transition.' },
      { icon: '📈', title: 'Trend', detail: 'Report repeats and near misses to QAPI.' },
    ],
    clinicalTip: 'A recall does not always mean turn it off now. Coordinate essential-device replacement before removal.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'RM-PS-003 §§ 4–7' },
      { kind: 'Care Indeed', text: 'OP-SL-004 §§ 3–5' },
      { kind: 'Federal', text: '21 CFR Part 7; Part 803' },
    ],
    sceneImage: img06,
    sceneAlt: 'A clinician and operations coordinator compare a device with a recall notice near a scanner, maintenance binder, tagged unit, and replacement.',
    hotspots: [
      {
        id: 'model-match', label: 'Exact model and device match', shortLabel: 'Match Model', x: 50, y: 34, signal: 'evidence',
        observed: 'A unit is compared with the notice.',
        why: 'Recall scope may depend on model, serial, lot, software, accessory, or date.',
        action: 'Copy identifiers exactly; treat uncertainty as unresolved and escalate.',
        notify: 'Risk or Operations recall owner.',
        document: 'Product, manufacturer, model, serial, lot, UDI, software, dates, and match.',
        sourceRefs: ['RM-PS-003 § 5.2', 'FDA recall notice'],
      },
      {
        id: 'recall-notice', label: 'Official recall or safety notice', shortLabel: 'Verify Notice', x: 63, y: 42, signal: 'escalate',
        observed: 'Operations reviews the recall notice.',
        why: 'The verified notice defines products, risk, urgency, and required action.',
        action: 'Preserve and verify it through approved FDA, manufacturer, DME, or agency sources.',
        notify: 'Risk promptly; immediately for current danger.',
        document: 'Source, received date, recall number, identifiers, instructions, and verification.',
        sourceRefs: ['RM-PS-003 § 5.1.3', '21 CFR Part 7'],
      },
      {
        id: 'quarantine', label: 'Quarantined affected equipment', shortLabel: 'Quarantine', x: 78, y: 35, signal: 'stop',
        observed: 'A tagged unit is separated from stock.',
        why: 'Segregation prevents use before authorized correction or disposition.',
        action: 'Secure the unit; never borrow parts, remove the tag, or release it.',
        notify: 'Operations and Risk if access or status changes.',
        document: 'Location, tag date, custodian, quantity, condition, and authorization.',
        sourceRefs: ['RM-PS-003 § 4.5', 'OP-SL-004 § 4.3.3'],
      },
      {
        id: 'scanner', label: 'Barcode and serial tracking', shortLabel: 'Track Unit', x: 19, y: 72, signal: 'evidence',
        observed: 'A scanner links the unit to inventory.',
        why: 'Reliable records identify affected units and patients without memory or unofficial PHI lists.',
        action: 'Use approved tracking and send mismatches to Operations.',
        notify: 'Supply coordinator or Operations.',
        document: 'Inventory ID, approved assignment link, scan date, and reconciliation.',
        sourceRefs: ['OP-SL-004 § 4.2.3', 'RM-PS-003 § 5.3.1'],
      },
      {
        id: 'maintenance-replacement', label: 'Maintenance record and replacement unit', shortLabel: 'Safe Replacement', x: 69, y: 78, signal: 'protect',
        observed: 'A maintenance record and replacement are available.',
        why: 'Care continuity and service history support safe closure.',
        action: 'Use an approved inspected replacement and device-specific transition plan.',
        notify: 'Clinical/DON and Operations/DME.',
        document: 'Replacement identity, service status, transition, teaching, response, and disposition.',
        sourceRefs: ['OP-SL-004 § 4.3', 'RM-PS-003 § 5.3'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Simulate',
    title: 'Integrated Home-Device Safety Simulation',
    subtitle: 'Observe → Classify → Decide → Defend across oxygen, pump, and lift risks',
    overview: [
      'Apply the complete field workflow to three device systems without claiming causation.',
      'Decide within role and orders, then defend the choice through safety, preservation, escalation, documentation, and source authority.',
    ],
    details: [
      'Oxygen: alarm plus severe breathing difficulty, confusion, or cyanosis requires 911 and only an ordered backup within competency. Preserve the system after stabilization.',
      'Pump: a stable patient with an error and stopped therapy still needs clinical escalation. Do not repair, reprogram, or repeatedly reset; preserve connected components.',
      'Lift: torn sling stitching before transfer is a near miss. Keep the patient safe, do not use the sling, tag and isolate it, and arrange an approved alternative.',
      'The field worker protects, escalates, preserves, and documents. The designated official decides root cause, vendor, manufacturer, FDA, recall, and QAPI pathways.',
      'Defensible notes state objective patient findings, exact display or damage, ordered therapy, actions, contacts, response, identifiers, evidence, and follow-up without blame.',
      'Completion shows annual knowledge only; it does not expand scope, authorize therapy changes, programming, or repair, validate device competency, or grant external filing authority.',
    ],
    keyActions: [
      { icon: '👁️', title: 'Observe', detail: 'State what is seen, heard, measured, displayed, or reported.' },
      { icon: '🧭', title: 'Classify', detail: 'Emergency, harm, near miss, malfunction, recall, or hazard.' },
      { icon: '✅', title: 'Decide', detail: 'Protect, transition, escalate, preserve, and document.' },
      { icon: '🛡️', title: 'Defend', detail: 'Connect the choice to safety, scope, policy, and evidence.' },
    ],
    clinicalTip: 'Patient first; stay within scope and orders; preserve safely; report without delay; document objective facts in the correct records.',
    sourceLabels: [
      { kind: 'Module', text: 'ACHC-ART-M12 integrated practice' },
      { kind: 'Care Indeed', text: 'RM-ER-002 · OP-SL-004 · RM-PS-003' },
      { kind: 'Federal', text: '21 CFR Part 803' },
    ],
    sceneImage: img07,
    sceneAlt: 'A clinician and caregiver review a patient setup with an oxygen concentrator, pump, lift and sling, secure phone, and equipment log.',
    hotspots: [
      {
        id: 'simulation-patient', label: 'Patient status before device action', shortLabel: 'Patient First', x: 48, y: 36, signal: 'protect',
        observed: 'The patient is safely positioned in bed.',
        why: 'Patient status determines emergency priority and whether support can stop safely.',
        action: 'Assess within role; call 911 for emergency findings before collecting evidence.',
        notify: 'Emergency services and supervisor/on-call.',
        document: 'Baseline, findings, symptoms, measurements, care, and response.',
        sourceRefs: ['RM-ER-002 § 5.1', 'CL-SD-020'],
      },
      {
        id: 'simulation-pump', label: 'Infusion pump interruption scenario', shortLabel: 'Pump Error', x: 15, y: 42, signal: 'escalate',
        observed: 'A pump represents an error-and-stop event.',
        why: 'Interrupted therapy may harm without immediate symptoms; components are evidence.',
        action: 'Follow the plan, do not repair or reprogram, escalate, and preserve the system.',
        notify: 'Supervisor/on-call and authorized DME/pharmacy.',
        document: 'Error, settings, interruption, components, patient, direction, and disposition.',
        sourceRefs: ['RM-ER-002', 'OP-SL-004'],
      },
      {
        id: 'simulation-oxygen', label: 'Oxygen concentrator emergency scenario', shortLabel: 'Oxygen Alarm', x: 35, y: 80, signal: 'protect',
        observed: 'A concentrator and tubing are near the patient.',
        why: 'Alarm with distress is an emergency; stability still needs escalation.',
        action: 'Call 911 and use only an ordered approved backup; never change flow independently.',
        notify: '911, on-call clinician, and DME as appropriate.',
        document: 'Alarm, setting, findings, backup, contacts, identifiers, and evidence.',
        sourceRefs: ['CL-SD-020', 'RM-ER-002'],
      },
      {
        id: 'simulation-lift', label: 'Lift and sling near-miss scenario', shortLabel: 'Torn Sling', x: 80, y: 43, signal: 'stop',
        observed: 'A lift and sling remain parked before transfer.',
        why: 'Torn stitching or incompatible parts can fail during transfer.',
        action: 'Do not use; keep the patient safe, use an approved alternative, tag, preserve, and report.',
        notify: 'Supervisor, Operations/DME, and Risk.',
        document: 'Damage, identifiers, planned transfer, alternative, custody, and contacts.',
        sourceRefs: ['OP-SL-004 § 4.3.3', 'RM-ER-002 § 4.1'],
      },
      {
        id: 'simulation-phone', label: 'Closed-loop escalation and handoff', shortLabel: 'Escalate', x: 80, y: 84, signal: 'escalate',
        observed: 'A secure phone supports live communication.',
        why: 'Structured handoff links care, replacement, evidence, and review.',
        action: 'Use configured contacts, state the need, read back direction, and continue until received.',
        notify: '911, supervisor, physician, Operations/DME, or Risk as needed.',
        document: 'Recipient, role, time, report, direction, read-back, and outcome.',
        sourceRefs: ['RM-ER-002 § 5.1', 'OP-SL-002'],
      },
      {
        id: 'simulation-log', label: 'Clinical, incident, and equipment records', shortLabel: 'Document', x: 63, y: 88, signal: 'evidence',
        observed: 'An equipment log supports contemporaneous records.',
        why: 'Clinical, incident, equipment, recall, and MDR records have different purposes.',
        action: 'Chart care; submit the separate incident form; route other records to authorized owners.',
        notify: 'Supervisor or Risk if destination is unclear.',
        document: 'Facts, patient impact, identity, notifications, custody, replacement, and follow-up.',
        sourceRefs: ['RM-ER-002 §§ 4.3, 6', 'OP-SL-004', 'RM-PS-003'],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0, category: 'Application',
    stem: 'Which situation meets Care Indeed’s internal device-safety reporting threshold?',
    options: [
      'Only a confirmed defect that caused death or permanent harm',
      'Only a malfunction involving equipment owned by the agency',
      'Actual or potential harm, a near miss, suspected malfunction, use-related problem, unsafe condition, or recall concern',
      'Only an event the manufacturer has already confirmed as reportable',
    ],
    correct: 2,
    rationale: 'Care Indeed requires prompt internal reporting of incidents, adverse events, near misses, and unsafe conditions. The internal threshold is broader than federal MDR. A worker reports the facts and uncertainty rather than waiting for proof, harm, ownership confirmation, or a manufacturer decision.',
    source: 'Care Indeed RM-ER-002 §§ 4.1 and 5.3; OP-SL-004 § 3.5',
  },
  {
    id: 1, category: 'Application',
    stem: 'Under the federal user-facility framework, which statement is accurate?',
    options: [
      'Every field worker files every malfunction with FDA within 24 hours',
      'A user facility reports a device-related death to FDA and the known manufacturer within 10 work days; a serious injury goes to the manufacturer, or FDA if the manufacturer is unknown',
      'A user facility reports all malfunctions to FDA within five calendar days',
      'Only device manufacturers may ever submit medical-device reports',
    ],
    correct: 1,
    rationale: 'User-facility death and serious-injury routes differ, but both have a 10-work-day outer limit after awareness. A malfunction alone is not a mandatory user-facility MDR, although it remains internally reportable and may be voluntarily reported. The authorized agency official—not each worker—handles the external decision and submission.',
    source: '21 CFR § 803.30; FDA Mandatory Reporting Requirements',
  },
  {
    id: 2, category: 'Scenario',
    stem: 'An oxygen concentrator alarms. The patient is severely short of breath, confused, and cyanotic. What is the best response?',
    options: [
      'Photograph the alarm and model plate before changing anything',
      'Increase the oxygen flow until the patient’s color improves',
      'Call 911, use only an approved backup at ordered settings if trained and available, notify the agency/on-call route, and preserve the concentrator after safety is established',
      'Leave immediately to obtain a replacement concentrator from the vendor',
    ],
    correct: 2,
    rationale: 'Patient safety comes before evidence. Severe respiratory distress requires emergency response. Ordered backup support may be used only under the patient plan, role, and training. Independently changing oxygen, leaving the patient, or delaying care for photographs is unsafe.',
    source: 'Care Indeed RM-ER-002 § 5.1; CL-SD-020',
  },
  {
    id: 3, category: 'Scenario',
    stem: 'A pump displays an error and stops, but the patient is currently stable. What should the field worker do?',
    options: [
      'Open the housing and inspect the internal components',
      'Reset and reprogram the pump from memory, then report only if it fails again',
      'Follow the care plan and role limits, notify the live clinical and authorized DME route, preserve the display/settings/tubing, and report the near miss',
      'Wait for the next visit because no harm has occurred',
    ],
    correct: 2,
    rationale: 'A no-harm interruption is still a safety signal and internal near miss. Unauthorized repair or reprogramming can create harm and erase evidence. The safe path is clinical escalation, continuity planning, preservation of the complete device system, and objective documentation.',
    source: 'Care Indeed RM-ER-002 §§ 4.1 and 5.4; OP-SL-004 § 4.3.3',
  },
  {
    id: 4, category: 'Scenario',
    stem: 'Before a planned transfer, a worker finds torn stitching in the patient-lift sling. What is the best action?',
    options: [
      'Complete one transfer carefully and report the tear afterward',
      'Reinforce the tear with tape and ask the caregiver to watch it',
      'Keep the patient safely positioned, do not use the sling, use only an approved alternative plan with trained assistance, tag/isolate and preserve it, and report the near miss',
      'Throw the sling away immediately so nobody can use it',
    ],
    correct: 2,
    rationale: 'The sling is a device accessory. Damage discovered before transfer is a reportable near miss. Prevent use, protect the patient, use only an approved alternative, preserve the item for investigation, and route it through Operations and Risk Management.',
    source: 'Care Indeed OP-SL-004 § 4.3.3; RM-ER-002 § 4.1',
  },
  {
    id: 5, category: 'Scenario',
    stem: 'A recall notice matches the serial number on an in-use oxygen concentrator, but no replacement is present. What should happen?',
    options: [
      'Unplug and remove it immediately, regardless of patient dependence',
      'Ignore the notice until the next scheduled Risk Manager database review',
      'Protect the patient and immediately contact the on-call/DON/Risk/DME route for recall-specific instructions and a safe transition, then document the response',
      'Ask the caregiver to choose whether the concentrator should remain in use',
    ],
    correct: 2,
    rationale: 'Recall actions are product-specific and may involve correction rather than immediate removal. An essential device must not be withdrawn without safe continuity unless an immediate hazard requires emergency action. Clinical and recall owners coordinate the transition and disposition.',
    source: 'Care Indeed RM-PS-003 § 5.3; FDA device recall guidance',
  },
  {
    id: 6, category: 'Scenario',
    stem: 'A supervisor asks for a photograph of an error display, but the worker has only a personal phone. What is the safest response?',
    options: [
      'Take the photo and delete it after sending it by personal text',
      'Take the photo because the patient is outside the frame',
      'Do not use the personal phone; record the exact display and identifiers, preserve the device, and use only an authorized secure photo workflow if approved',
      'Post a cropped image in a professional group to identify the alarm',
    ],
    correct: 2,
    rationale: 'A device-only image can still expose labels, home details, records, or account data and can break evidence custody. Use only an approved secured device and destination when authorized. Written factual capture and device preservation remain available when photography is not approved.',
    source: 'Care Indeed RM-ER-002 § 5.4.1; agency privacy/security requirements',
  },
  {
    id: 7, category: 'Documentation',
    stem: 'Which entry is the most objective and defensible after a pump event?',
    options: [
      'Caregiver error caused a dangerous pump failure',
      'Pump defective; patient fine; manager aware',
      '14:07—pump displayed “Occlusion”; displayed rate 75 mL/hr; patient denied new symptoms; on-call RN notified 14:12; device serial recorded; tubing left attached per RN direction',
      'Incident report completed; see risk file for all clinical details',
    ],
    correct: 2,
    rationale: 'The selected entry records time, exact display and setting, patient status, notification, identifier, and preservation direction without claiming defect, fault, or causation. “Patient fine” is vague, and the incident form does not replace the clinical record.',
    source: 'Care Indeed RM-ER-002 §§ 5.2 and Appendix A; CL-CD-001',
  },
  {
    id: 8, category: 'Documentation',
    stem: 'After a device event affects patient care, which documentation approach is correct?',
    options: [
      'Place only the confidential incident form in the patient chart',
      'Chart patient assessment, care, notifications, and response in the clinical record and complete the separate confidential incident/adverse-event form through Risk Management',
      'Complete only the clinical note because a second report duplicates information',
      'Wait until the investigation closes before documenting the event anywhere',
    ],
    correct: 1,
    rationale: 'The records have different purposes. The clinical chart communicates patient care and response. The separate confidential report supports risk investigation, equipment evidence, reporting analysis, trending, and corrective action. Neither replaces the other.',
    source: 'Care Indeed RM-ER-002 §§ 4.3 and 6',
  },
  {
    id: 9, category: 'Integrated judgment',
    stem: 'Which sequence best represents the field worker’s complete role in a suspected medical-device event?',
    options: [
      'File directly with FDA, then assess the patient and notify the agency',
      'Preserve the device exactly as found even when doing so delays emergency care',
      'Assess and protect the patient, stop or transition use safely within role, escalate internally, preserve the device system, document facts, and route external reporting to the designated official',
      'Determine root cause, repair the device, and notify the agency only if the repair fails',
    ],
    correct: 2,
    rationale: 'This sequence puts patient safety first, respects role and orders, protects evidence, closes the internal loop, and reserves investigation and external filing for authorized agency roles. Completion of this knowledge check does not validate hands-on device competency or external-reporting authority.',
    source: 'Care Indeed RM-ER-002; OP-SL-004; RM-PS-003; 21 CFR Part 803',
  },
];

const STYLES = `
.m12,.m12 *{box-sizing:border-box}
.m12{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
@keyframes m12-pop{0%{transform:scale(.97);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes m12-ping{75%,100%{transform:scale(1.72);opacity:0}}
@keyframes m12-slide{0%{transform:translateX(20px);opacity:0}100%{transform:translateX(0);opacity:1}}
.m12-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.m12-top{height:64px;background:#fff;border-bottom:1px solid #D8E0E8;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.m12-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.m12-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.m12-tabs::-webkit-scrollbar{display:none}
.m12-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;background:transparent;color:#596579;min-height:44px}
.m12-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.m12-tab.quiz-tab{border:1px solid #B54713;color:#9A3412;background:#fff}
.m12-tab.quiz-tab.active{background:#B54713;color:#fff;border-color:#B54713}
.m12-exit{flex-shrink:0;border-radius:10px;border:1px solid #B54713;background:#fff;color:#9A3412;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.m12 button:focus-visible,.m12 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
.m12-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.m12-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #D8E0E8;border-radius:16px 0 0 16px;padding:22px}
.m12-right{flex:1;min-width:0;background:#fff;border:1px solid #D8E0E8;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.m12-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.m12-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #D8E0E8;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.m12-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.m12-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.m12-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.m12-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.22);color:#fff;font-weight:800}
.m12-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:m12-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.55;pointer-events:none}
.m12-hotspot .tag{background:rgba(255,255,255,.97);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #D8E0E8;box-shadow:0 3px 10px rgba(0,0,0,.12);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.m12-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.55)}
.m12-dialog-layer{position:absolute;inset:0;z-index:30;background:rgba(9,63,58,.62);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:14px;animation:m12-pop .25s cubic-bezier(.16,1,.3,1)}
.m12-dialog{width:min(470px,100%);max-height:min(90%,640px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.28)}
.m12-bot{height:80px;background:#fff;border-top:1px solid #D8E0E8;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.m12-bot button.nav{border:0;background:transparent;color:#596579;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.m12-bot button.nav:disabled{opacity:.4;cursor:not-allowed}
.m12-bot button.next{background:#B54713;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(181,71,19,.28);min-height:44px}
.m12-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.m12-quiz-card{width:min(780px,100%);animation:m12-slide .3s cubic-bezier(.16,1,.3,1)}
.m12-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.m12-scene-complete{position:absolute;inset:0;z-index:20;background:rgba(9,63,58,.84);display:grid;place-items:center;padding:22px;animation:m12-pop .25s ease}
.m12-mobile-position{display:none}
@media (max-width:900px){
  .m12-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .m12-left,.m12-right{width:100%;max-width:none;border-radius:12px;border:1px solid #D8E0E8}
  .m12-right{min-height:360px}
  .m12-left{max-height:42vh}
  .m12-top{padding:0 10px;gap:8px}
  .m12-tab{padding:8px 10px;font-size:12px}
  .m12-bot{padding:0 12px;height:72px}
  .m12-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:520px){
  .m12-brand span.brand-text{display:none}
  .m12-exit{padding:8px 9px;font-size:11px}
  .m12-stage{border-radius:10px}
  .m12-bot{gap:4px;padding:0 6px}
  .m12-bot button.next{padding:10px 11px;font-size:11px}
  .m12-bot button.nav{font-size:11px;padding:0 4px}
  .m12-desktop-position{display:none}
  .m12-mobile-position{display:inline}
}
@media (prefers-reduced-motion:reduce){
  .m12-hotspot .ping,.m12-dialog-layer,.m12-quiz-card,.m12-scene-complete{animation:none!important}
  .m12-rm-transition{transition:none!important;animation:none!important}
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

function DeviceFeedbackDialog({ hotspot, onClose, onComplete, triggerRef }: {
  hotspot: Hotspot;
  onClose: () => void;
  onComplete: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const signal = SIGNAL[hotspot.signal];

  const closeAndReturn = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    const inertTargets = Array.from(document.querySelectorAll<HTMLElement>('.m12-top,.m12-bot,.m12-left'));
    inertTargets.forEach((el) => el.setAttribute('inert', ''));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      inertTargets.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = previousOverflow;
    };
  }, [hotspot.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAndReturn]);

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
    <div className="m12-dialog-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAndReturn(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="m12-dialog">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.98)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: signal.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.signal === 'stop' ? <XCircle size={19} aria-hidden /> : hotspot.signal === 'escalate' ? <AlertTriangle size={19} aria-hidden /> : hotspot.signal === 'protect' ? <ShieldCheck size={19} aria-hidden /> : <ClipboardCheck size={19} aria-hidden />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: signal.color }}>{signal.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close device feedback" onClick={closeAndReturn} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={18} color={CI.muted} aria-hidden />
          </button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Device-safety observation, significance, action, notification, documentation, and sources.</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observed} icon={<Eye size={14} aria-hidden />} />
          <FeedbackBlock label="Why it matters" body={hotspot.why} />
          <FeedbackBlock label="What the field worker should do" body={hotspot.action} accent icon={<ShieldCheck size={14} aria-hidden />} />
          {hotspot.notify && <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} aria-hidden />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} aria-hidden />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Sources">
            {hotspot.sourceRefs.map((ref) => <span key={ref} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase', padding: '5px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{ref}</span>)}
          </div>
          <button type="button" onClick={() => { onComplete(); window.requestAnimationFrame(() => triggerRef.current?.focus()); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ lesson, index, total }: { lesson: Lesson; index: number; total: number }) {
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>Lesson {index + 1} · {index + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{lesson.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeText, fontSize: 15, fontWeight: 700 }}>{lesson.subtitle}</p>
      <div style={{ margin: '0 0 14px' }}>
        {lesson.overview.map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex} style={{ margin: paragraphIndex === lesson.overview.length - 1 ? 0 : '0 0 8px', fontSize: 17, lineHeight: 1.65, color: '#4A4544' }}>{paragraph}</p>
        ))}
      </div>
      <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
        <summary style={{ padding: '12px 14px', fontWeight: 800, fontSize: 13, color: CI.teal, cursor: 'pointer', minHeight: 44 }}>View Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {lesson.details.map((paragraph, paragraphIndex) => <p key={paragraphIndex} style={{ margin: '0 0 12px', fontSize: 16, lineHeight: 1.68, color: '#4A4544' }}>{paragraph}</p>)}
        </div>
      </details>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {lesson.keyActions.map((action) => (
          <div key={action.title} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <CheckCircle2 size={18} color={CI.teal} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{action.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{action.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orange}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeText, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#4A4544', lineHeight: 1.55 }}>{lesson.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Lesson sources">
        {lesson.sourceLabels.map((source) => <span key={`${source.kind}-${source.text}`} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>{source.kind}: {source.text}</span>)}
      </div>
    </div>
  );
}

function RightPanel({ lesson, completed, setCompleted, onGoQuiz }: {
  lesson: Lesson;
  completed: string[];
  setCompleted: (ids: string[]) => void;
  onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = lesson.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const exactCompleted = lesson.hotspots.filter((hotspot) => completed.includes(hotspot.id)).length;
  const allDone = exactCompleted === lesson.hotspots.length;

  useEffect(() => {
    setActiveId(null);
    setShowComplete(false);
  }, [lesson.id]);

  const markComplete = (id: string) => {
    const next = Array.from(new Set([...completed.filter((value) => lesson.hotspots.some((hotspot) => hotspot.id === value)), id]));
    setCompleted(next);
    setActiveId(null);
    if (next.length === lesson.hotspots.length) setShowComplete(true);
  };

  return (
    <div className="m12-stage-wrap">
      <div className="m12-stage" role="region" aria-label={`${lesson.title} interactive scene`} aria-describedby={`m12-scene-description-${lesson.id}`}>
        <img className="scene" src={lesson.sceneImage} alt={lesson.sceneAlt} draggable={false} />
        <p id={`m12-scene-description-${lesson.id}`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{lesson.sceneAlt} Investigate each labeled object for device-safety guidance.</p>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(49%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.96)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeText }}>{lesson.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{lesson.title}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.97)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {exactCompleted} / {lesson.hotspots.length} observed
        </div>
        {lesson.hotspots.map((hotspot) => {
          const isDone = completed.includes(hotspot.id);
          const nextIncomplete = lesson.hotspots.find((candidate) => !completed.includes(candidate.id));
          const isGuided = !isDone && nextIncomplete?.id === hotspot.id;
          return (
            <button key={hotspot.id} type="button" className={`m12-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={isDone ? `${hotspot.label} — observed` : `Investigate ${hotspot.label}`}
              aria-describedby={`m12-progress-${lesson.id}`}
              onClick={(event) => { triggerRef.current = event.currentTarget; setActiveId(hotspot.id); }}>
              <span className="orb" style={{ background: isDone ? CI.teal : SIGNAL[hotspot.signal].color }}>
                {isGuided && <span className="ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 15 }} aria-hidden>?</span>}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
            </button>
          );
        })}
        <div id={`m12-progress-${lesson.id}`} className="m12-live" aria-live="polite">{exactCompleted} of {lesson.hotspots.length} device-safety observations complete.</div>
        <button type="button" aria-label="Reset current lesson observations" onClick={() => { setCompleted([]); setShowComplete(false); }}
          style={{ position: 'absolute', zIndex: 9, right: 10, bottom: 10, width: 44, height: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.97)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: CI.teal }}>
          <RotateCcw size={17} aria-hidden />
        </button>
        {allDone && showComplete && (
          <div className="m12-scene-complete" role="status">
            <div style={{ width: 'min(410px,100%)', padding: 24, borderRadius: 18, background: '#fff', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
              <CheckCircle2 size={42} color={CI.teal} aria-hidden />
              <div style={{ marginTop: 8, fontSize: 21, fontWeight: 800, color: CI.teal }}>Lesson observations complete</div>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: CI.muted }}>You examined every device-safety signal in this scene. Knowledge completion does not replace device-specific hands-on competency.</p>
              <button type="button" onClick={() => setShowComplete(false)} style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: `1px solid ${CI.teal}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Review scene</button>
              {onGoQuiz && lesson.id === LESSONS.length - 1 && <button type="button" onClick={onGoQuiz} style={{ minHeight: 44, marginLeft: 8, padding: '0 18px', borderRadius: 10, border: 0, background: CI.orangeAction, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Knowledge Check</button>}
            </div>
          </div>
        )}
        {active && <DeviceFeedbackDialog hotspot={active} onClose={() => setActiveId(null)} onComplete={() => markComplete(active.id)} triggerRef={triggerRef} />}
      </div>
    </div>
  );
}

type QuizState = {
  answers: (number | null)[];
  idx: number;
  finished: boolean;
  selected: number | null;
  submitted: boolean;
  attempts: number;
  bestScore: number;
  lastScore: number | null;
};

function QuizPage({ onBack, initial, onPersist }: { onBack: () => void; initial: QuizState; onPersist: (state: QuizState) => void }) {
  const [idx, setIdx] = useState(initial.idx);
  const [selected, setSelected] = useState<number | null>(initial.selected);
  const [submitted, setSubmitted] = useState(initial.submitted);
  const [answers, setAnswers] = useState<(number | null)[]>(initial.answers);
  const [finished, setFinished] = useState(initial.finished);
  const [attempts, setAttempts] = useState(initial.attempts);
  const [bestScore, setBestScore] = useState(initial.bestScore);
  const [lastScore, setLastScore] = useState<number | null>(initial.lastScore);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const question = QUIZ[idx];
  const isCorrect = selected === question.correct;
  const score = useMemo(() => answers.reduce<number>((sum, answer, questionIndex) => sum + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0), [answers]);
  const pct = Math.round((score / QUIZ.length) * 100);
  const resultPct = lastScore ?? pct;
  const passed = resultPct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted, attempts, bestScore, lastScore });
  }, [answers, idx, finished, selected, submitted, attempts, bestScore, lastScore, onPersist]);

  useEffect(() => {
    if (submitted) feedbackRef.current?.focus();
  }, [submitted]);

  const focusOption = (optionIndex: number) => {
    setSelected(optionIndex);
    window.requestAnimationFrame(() => optionRefs.current[optionIndex]?.focus());
  };

  const submitOrAdvance = () => {
    if (selected === null) return;
    if (!submitted) {
      const next = [...answers];
      next[idx] = selected;
      setAnswers(next);
      setSubmitted(true);
      return;
    }
    if (idx === QUIZ.length - 1) {
      const finalPct = Math.round((answers.reduce<number>((sum, answer, questionIndex) => sum + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0) / QUIZ.length) * 100);
      setAttempts((value) => value + 1);
      setBestScore((value) => Math.max(value, finalPct));
      setLastScore(finalPct);
      setFinished(true);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    const existing = answers[nextIdx];
    setSelected(existing);
    setSubmitted(existing !== null);
  };

  const retake = () => {
    setIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers(Array(QUIZ.length).fill(null));
    setFinished(false);
    setLastScore(null);
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (resultPct / 100) * circumference;
    return (
      <main className="m12-quiz-page" id="m12-panel" role="tabpanel" aria-labelledby="m12-tab-quiz">
        <div className="m12-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orangeAction} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="m12-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orangeText }}>{resultPct}%</div><div style={{ fontSize: 11, fontWeight: 800, color: CI.muted }}>{Math.round(resultPct / 10)}/10</div></div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Annual knowledge standard met' : 'Review and retake'}</div>
          <p style={{ fontSize: 15, color: CI.muted, lineHeight: 1.6, margin: '0 auto 10px', maxWidth: 560 }}>
            {passed ? 'You met the 80% knowledge threshold.' : 'An 80% score is required. Review the lessons and feedback before another attempt.'}
          </p>
          <p style={{ fontSize: 13, color: CI.muted, lineHeight: 1.55, margin: '0 auto 20px', maxWidth: 600 }}>Completion does not expand professional scope, authorize device programming or repair, validate device-specific competency, or authorize regulatory reporting on behalf of Care Indeed.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Patient first', color: CI.teal, tip: 'Assess · emergency response' },
              { label: 'Preserve', color: '#475569', tip: 'Device · settings · components' },
              { label: 'Report', color: CI.orangeAction, tip: 'Internal first · authorized external review' },
            ].map((item) => <div key={item.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, margin: '0 auto 8px' }} /><div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{item.label}</div><div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{item.tip}</div></div>)}
          </div>
          <div style={{ fontSize: 12, color: CI.muted, marginBottom: 18 }}>Attempts completed: {attempts} · Best score: {bestScore}%</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Back to Lessons</button>
            <button type="button" onClick={retake} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orangeAction, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="m12-quiz-page" id="m12-panel" role="tabpanel" aria-labelledby="m12-tab-quiz">
      <div className="m12-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, ${CI.tealDark} 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Compass size={18} aria-hidden /><span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span></div>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.22)', overflow: 'hidden' }}><div className="m12-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: '#FDBA8C', transition: 'width .3s ease' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase' }}><span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span></div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}><Sparkles size={13} aria-hidden /> {question.category}</div>
          <h2 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{question.stem}</h2>
          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(event) => {
              if (submitted) return;
              const max = question.options.length - 1;
              const current = selected ?? 0;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); focusOption((current + 1) % question.options.length); }
              else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); focusOption((current - 1 + question.options.length) % question.options.length); }
              else if (event.key === 'Home') { event.preventDefault(); focusOption(0); }
              else if (event.key === 'End') { event.preventDefault(); focusOption(max); }
              else if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); setSelected(current); }
            }}>
            {question.options.map((option, optionIndex) => {
              const checked = selected === optionIndex;
              let border: string = CI.border;
              let background: string = '#fff';
              let markerBackground: string = CI.slateSoft;
              let markerColor: string = CI.muted;
              if (submitted && optionIndex === question.correct) { border = CI.teal; background = CI.tealSoft; markerBackground = CI.teal; markerColor = '#fff'; }
              else if (submitted && checked && !isCorrect) { border = CI.red; background = CI.redSoft; markerBackground = CI.red; markerColor = '#fff'; }
              else if (checked) { border = CI.teal; background = '#F3FBFA'; markerBackground = CI.teal; markerColor = '#fff'; }
              return (
                <button key={optionIndex} ref={(element) => { optionRefs.current[optionIndex] = element; }} type="button" role="radio" aria-checked={checked} tabIndex={checked || (selected === null && optionIndex === 0) ? 0 : -1} disabled={submitted}
                  onClick={() => setSelected(optionIndex)} style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 48 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: markerBackground, color: markerColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[optionIndex]}</span>
                  <span style={{ fontWeight: 650, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{option}</span>
                  {submitted && optionIndex === question.correct && <CheckCircle2 size={19} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Correct option" />}
                  {submitted && checked && !isCorrect && <XCircle size={19} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Selected incorrect option" />}
                </button>
              );
            })}
          </div>
          {submitted && <div ref={feedbackRef} tabIndex={-1} role="status" aria-live="polite" style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : CI.orangeSoft, border: `1px solid ${isCorrect ? CI.tealMuted : '#E7A47D'}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeText, marginBottom: 6 }}>{isCorrect ? 'Correct judgment' : 'Recalibrate'}</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{question.rationale}</div>
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: CI.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Source: {question.source}</div>
          </div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 800, cursor: 'pointer' }}>Exit Check</button>
            <button type="button" onClick={submitOrAdvance} disabled={selected === null} style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? .55 : 1 }}>
              {submitted ? (idx === QUIZ.length - 1 ? 'See results' : 'Next question') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const STORAGE_KEY = 'achc-art-m12-progress-v1';

type Persisted = {
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quiz: QuizState;
};

const DEFAULT_QUIZ: QuizState = {
  answers: Array(QUIZ.length).fill(null),
  idx: 0,
  finished: false,
  selected: null,
  submitted: false,
  attempts: 0,
  bestScore: 0,
  lastScore: null,
};

function sanitizeProgress(value: unknown): Persisted | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Persisted>;
  const pageIndex = Number.isInteger(candidate.pageIndex) ? Math.min(Math.max(candidate.pageIndex as number, 0), LESSONS.length - 1) : 0;
  const mode = candidate.mode === 'quiz' ? 'quiz' : 'lessons';
  const completedByPage: Record<number, string[]> = {};
  if (candidate.completedByPage && typeof candidate.completedByPage === 'object') {
    LESSONS.forEach((lesson) => {
      const raw = (candidate.completedByPage as Record<number, unknown>)[lesson.id];
      if (Array.isArray(raw)) completedByPage[lesson.id] = Array.from(new Set(raw.filter((id): id is string => typeof id === 'string' && lesson.hotspots.some((hotspot) => hotspot.id === id))));
    });
  }
  const rawQuiz = candidate.quiz && typeof candidate.quiz === 'object' ? candidate.quiz as Partial<QuizState> : {};
  const answers = Array.isArray(rawQuiz.answers) && rawQuiz.answers.length === QUIZ.length
    ? rawQuiz.answers.map((answer) => Number.isInteger(answer) && (answer as number) >= 0 && (answer as number) <= 3 ? answer as number : null)
    : Array(QUIZ.length).fill(null);
  const idx = Number.isInteger(rawQuiz.idx) ? Math.min(Math.max(rawQuiz.idx as number, 0), QUIZ.length - 1) : 0;
  const selected = Number.isInteger(rawQuiz.selected) && (rawQuiz.selected as number) >= 0 && (rawQuiz.selected as number) <= 3 ? rawQuiz.selected as number : null;
  const attempts = Number.isInteger(rawQuiz.attempts) && (rawQuiz.attempts as number) >= 0 ? rawQuiz.attempts as number : 0;
  const bestScore = typeof rawQuiz.bestScore === 'number' && Number.isFinite(rawQuiz.bestScore) ? Math.min(Math.max(rawQuiz.bestScore, 0), 100) : 0;
  const lastScore = typeof rawQuiz.lastScore === 'number' && Number.isFinite(rawQuiz.lastScore) ? Math.min(Math.max(rawQuiz.lastScore, 0), 100) : null;
  return {
    pageIndex,
    mode,
    completedByPage,
    quiz: { answers, idx, selected, submitted: !!rawQuiz.submitted, finished: !!rawQuiz.finished, attempts, bestScore, lastScore },
  };
}

function loadProgress(): Persisted | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveProgress(data: Persisted) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

export default function ACHCARTM12() {
  const initial = useMemo(() => loadProgress(), []);
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial?.completedByPage ?? {});
  const [quiz, setQuiz] = useState<QuizState>(initial?.quiz ?? DEFAULT_QUIZ);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lesson = LESSONS[pageIndex];
  const completed = completedByPage[lesson.id] ?? [];

  const persistAll = useCallback((patch?: Partial<Persisted>) => {
    saveProgress({ pageIndex, mode, completedByPage, quiz, ...patch });
  }, [pageIndex, mode, completedByPage, quiz]);

  useEffect(() => { persistAll(); }, [persistAll]);

  const handleQuizPersist = useCallback((state: QuizState) => setQuiz(state), []);

  const activateTab = (tabIndex: number) => {
    if (tabIndex === LESSONS.length) setMode('quiz');
    else { setMode('lessons'); setPageIndex(tabIndex); }
    window.requestAnimationFrame(() => tabRefs.current[tabIndex]?.focus());
  };

  const activeTabIndex = mode === 'quiz' ? LESSONS.length : pageIndex;

  const onTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = LESSONS.length + 1;
    if (event.key === 'ArrowRight') { event.preventDefault(); activateTab((activeTabIndex + 1) % count); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); activateTab((activeTabIndex - 1 + count) % count); }
    else if (event.key === 'Home') { event.preventDefault(); activateTab(0); }
    else if (event.key === 'End') { event.preventDefault(); activateTab(count - 1); }
  };

  const handleSaveExit = () => {
    persistAll();
    window.history.back();
  };

  return (
    <div className="m12 m12-shell" data-m12-app>
      <style>{STYLES}</style>
      <header className="m12-top">
        <div className="m12-brand"><BrandMark size={28} /><span className="brand-text">Device Safety</span></div>
        <div className="m12-tabs" role="tablist" aria-label="Medical device safety lessons" onKeyDown={onTabsKeyDown}>
          {LESSONS.map((item, index) => (
            <button key={item.id} ref={(element) => { tabRefs.current[index] = element; }} id={`m12-tab-${item.id}`} type="button" role="tab" aria-selected={mode === 'lessons' && index === pageIndex} aria-controls="m12-panel" tabIndex={activeTabIndex === index ? 0 : -1}
              className={`m12-tab ${mode === 'lessons' && index === pageIndex ? 'active' : ''}`} onClick={() => { setMode('lessons'); setPageIndex(index); }}>{item.shortName}</button>
          ))}
          <button ref={(element) => { tabRefs.current[LESSONS.length] = element; }} id="m12-tab-quiz" type="button" role="tab" aria-selected={mode === 'quiz'} aria-controls="m12-panel" tabIndex={activeTabIndex === LESSONS.length ? 0 : -1}
            className={`m12-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`} onClick={() => setMode('quiz')}>Knowledge Check</button>
        </div>
        <button type="button" className="m12-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <QuizPage onBack={() => setMode('lessons')} initial={quiz} onPersist={handleQuizPersist} />
      ) : (
        <main className="m12-work" id="m12-panel" role="tabpanel" aria-labelledby={`m12-tab-${lesson.id}`}>
          <aside className="m12-left"><LeftPanel lesson={lesson} index={pageIndex} total={LESSONS.length} /></aside>
          <section className="m12-right" aria-label="Interactive device-safety scene">
            <RightPanel lesson={lesson} completed={completed} setCompleted={(ids) => setCompletedByPage((previous) => ({ ...previous, [lesson.id]: ids }))} onGoQuiz={() => setMode('quiz')} />
          </section>
        </main>
      )}

      <footer className="m12-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0} onClick={() => { if (mode === 'quiz') setMode('lessons'); else setPageIndex((index) => Math.max(0, index - 1)); }}><ChevronLeft size={16} aria-hidden /> Prev</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px', whiteSpace: 'nowrap' }}>
            <span className="m12-desktop-position">{mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${pageIndex + 1} of ${LESSONS.length} · ${lesson.shortName}`}</span>
            <span className="m12-mobile-position">{mode === 'quiz' ? 'Quiz · 80%' : `L${pageIndex + 1}/${LESSONS.length}`}</span>
          </span>
        </div>
        {mode === 'quiz' ? <button type="button" className="next" onClick={() => setMode('lessons')}>Lessons <ChevronRight size={16} aria-hidden /></button>
          : pageIndex === LESSONS.length - 1 ? <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} aria-hidden /></button>
          : <button type="button" className="next" onClick={() => setPageIndex((index) => Math.min(LESSONS.length - 1, index + 1))}>Next · {LESSONS[pageIndex + 1].shortName} <ChevronRight size={16} aria-hidden /></button>}
      </footer>
    </div>
  );
}
