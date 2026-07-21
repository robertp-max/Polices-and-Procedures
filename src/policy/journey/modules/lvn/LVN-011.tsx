/**
 * LVN-011 — Patient Identification
 * v5.4.1-PASS5 | Observe→Identify→Decide→Document→Feedback→Complete
 * Agency policy: OP-PA-002. A mismatch is always a hard stop.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-011/lesson-01-first-check.png';
import img02 from './assets/lvn-011/lesson-02-home-challenges.png';
import img03 from './assets/lvn-011/lesson-03-protocol.png';
import img04 from './assets/lvn-011/lesson-04-mismatch-stop.png';
import img05 from './assets/lvn-011/lesson-05-notify.png';
import img06 from './assets/lvn-011/lesson-06-document.png';
import img07 from './assets/lvn-011/lesson-07-practice.png';


const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#B94718', orangeDark: '#A94018', ink: '#2D3748',
  muted: '#64748B', slate: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'authorized' | 'conditional' | 'prohibited' | 'neutral';
type ScenarioStage = 'observe' | 'identify' | 'decide' | 'document' | 'feedback' | 'complete';

interface ScenarioChoice {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

interface ClinicalFeedbackData {
  observed: string;
  meaning: string;
  action: string;
  notify: string;
  document: string;
  policyRefs: string[];
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  ariaLabel?: string;
  x: number;
  y: number;
  zone: ZoneKind;
  leftAnchorId?: string;
  observe: string;
  identifyChoices: ScenarioChoice[];
  decideChoices: ScenarioChoice[];
  documentChoices: ScenarioChoice[];
  feedback: ClinicalFeedbackData;
  /** @deprecated legacy fields retained for transition */
  info?: string;
  meaning?: string;
  action?: string;
  notify?: string;
  document?: string;
  policyRefs?: string[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  narration: string[]; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  authorized: { label: 'Authorized', color: CI.teal, soft: CI.tealSoft },
  conditional: { label: 'Conditional', color: CI.orange, soft: '#FFF3EC' },
  prohibited: { label: 'Prohibited', color: CI.red, soft: '#FEF2F2' },
  neutral: { label: 'Guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'LVN-011', title: 'Patient Identification', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'LVN pauses at the correct doorway and compares the visible address with the assigned visit schedule before entering or beginning care.',
  'Patient states full name and date of birth while the LVN compares both identifiers with the approved patient record.',
  'Two household members receive care in one home while patient-specific records, orders, and supplies remain clearly separated.',
  'LVN compares patient-stated identifiers with approved schedule, order, and chart sources before selecting the correct record.',
  'Identification mismatch triggers a visible hard stop with medications and clinical supplies held away from the patient.',
  'LVN gives an immediate SBAR identification-mismatch report to the supervising RN while all care remains on hold.',
  'Patient-specific visit note records identifiers, source, match result, held care, RN notification, direction, and resolution.',
] as const;

const PAGES: PageData[] = [
{ id: 0, shortName: 'First Check', title: 'Patient Identification — The First Safety Check', subtitle: 'Two identifiers, every intervention, every time', narration: ['Welcome to Module LVN-011: Patient Identification and Verification. Patient identification errors remain among the most preventable adverse events in healthcare, yet they continue to cause harm across every care setting. In home health, risk is amplified by the solo nature of the work. There is no second nurse to double-check your patient, no wristband scanner at the bedside, and no centralized unit board tracking who is in which bed.','When you knock on a door, you must independently verify that you are at the correct home, treating the correct patient, with the correct orders, before any clinical intervention. Care Indeed Policy OP-PA-002 (Patient Identification & Verification) requires a minimum of two patient identifiers before any clinical intervention. This is agency policy implementing a widely recognized safety standard; CMS CoP 42 CFR § 484.60 requires that care be furnished in accordance with the plan of care and coordinated to protect quality and safety.','Professional guidance (e.g., Joint Commission National Patient Safety Goal 01.01.01 where applicable to accredited settings) also emphasizes at least two patient identifiers when providing care, treatment, or services. In home health, acceptable identifiers commonly include full legal name, date of birth, medical record number, and home address. Agency policy OP-PA-002 defines which combinations are approved for Care Indeed visits.'], keyPoints: [{ icon: '①', title: 'Two identifiers minimum', detail: 'Agency policy OP-PA-002 requires at least two approved patient identifiers before any clinical intervention.' },{ icon: '②', title: 'Open-ended verification', detail: 'Ask the patient to state name and DOB — do not feed the answer (“Are you Mary Smith?”).' },{ icon: '③', title: 'Solo practice risk', detail: 'Home health has no wristband scanner or second nurse. You are the sole identity verifier.' },{ icon: '④', title: 'Scope boundary', detail: 'If identity cannot be confirmed, stop care, notify RN/supervisor, and document — do not improvise.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img01, hotspots: [{ id: "doorway-pause", label: "Doorway pause", shortLabel: "Doorway pause", ariaLabel: "Investigate Doorway pause", x: 28, y: 39, zone: "neutral" as ZoneKind, leftAnchorId: "kp-0-0", observe: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", identifyChoices: [
        { id: "doorway-pause-identify-correct", label: "Location is only the first safety layer; the person still must state two approved identifiers.", correct: true, rationale: "Correct. Location is only the first safety layer; the person still must state two approved identifiers." },
        { id: "doorway-pause-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "doorway-pause-decide-correct", label: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", correct: true, rationale: "Correct. Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies." },
        { id: "doorway-pause-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "doorway-pause-document-correct", label: "Record both identifiers used, the approved source compared, and the exact match result before care.", correct: true, rationale: "Correct. Record both identifiers used, the approved source compared, and the exact match result before care." },
        { id: "doorway-pause-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", meaning: "Location is only the first safety layer; the person still must state two approved identifiers.", action: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", notify: "No routine notice after an exact two-identifier match; immediately notify the supervising RN for any mismatch, source conflict, or inability to verify.", document: "Record both identifiers used, the approved source compared, and the exact match result before care.", policyRefs: ["OP-PA-002"] } },{ id: "address-first-layer", label: "Address first layer", shortLabel: "Address first layer", ariaLabel: "Investigate Address first layer", x: 51, y: 62, zone: "conditional" as ZoneKind, leftAnchorId: "kp-0-1", observe: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", identifyChoices: [
        { id: "address-first-layer-identify-correct", label: "Location is only the first safety layer; the person still must state two approved identifiers.", correct: true, rationale: "Correct. Location is only the first safety layer; the person still must state two approved identifiers." },
        { id: "address-first-layer-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "address-first-layer-decide-correct", label: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", correct: true, rationale: "Correct. Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies." },
        { id: "address-first-layer-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "address-first-layer-document-correct", label: "Record both identifiers used, the approved source compared, and the exact match result before care.", correct: true, rationale: "Correct. Record both identifiers used, the approved source compared, and the exact match result before care." },
        { id: "address-first-layer-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", meaning: "Location is only the first safety layer; the person still must state two approved identifiers.", action: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", notify: "No routine notice after an exact two-identifier match; immediately notify the supervising RN for any mismatch, source conflict, or inability to verify.", document: "Record both identifiers used, the approved source compared, and the exact match result before care.", policyRefs: ["OP-PA-002"] } },{ id: "care-held-before-id", label: "Care held before ID", shortLabel: "Care held before ID", ariaLabel: "Investigate Care held before ID", x: 76, y: 48, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-0-2", observe: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", identifyChoices: [
        { id: "care-held-before-id-identify-correct", label: "Location is only the first safety layer; the person still must state two approved identifiers.", correct: true, rationale: "Correct. Location is only the first safety layer; the person still must state two approved identifiers." },
        { id: "care-held-before-id-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "care-held-before-id-decide-correct", label: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", correct: true, rationale: "Correct. Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies." },
        { id: "care-held-before-id-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "care-held-before-id-document-correct", label: "Record both identifiers used, the approved source compared, and the exact match result before care.", correct: true, rationale: "Correct. Record both identifiers used, the approved source compared, and the exact match result before care." },
        { id: "care-held-before-id-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The LVN pauses at the assigned doorway with supplies closed and compares the visible address with the visit schedule.", meaning: "Location is only the first safety layer; the person still must state two approved identifiers.", action: "Keep care on hold, ask the patient to state two identifiers, and compare both with the approved record before opening supplies.", notify: "No routine notice after an exact two-identifier match; immediately notify the supervising RN for any mismatch, source conflict, or inability to verify.", document: "Record both identifiers used, the approved source compared, and the exact match result before care.", policyRefs: ["OP-PA-002"] } }] },
{ id: 1, shortName: 'Home Challenges', title: 'Home Health–Specific ID Challenges', subtitle: 'Address, cognition, language, and multi-patient homes', narration: ['Home health presents identification challenges that do not exist in institutional settings. Hospitals use wristbands and electronic scanners; home health does not. You are the sole verifier of identity at the point of care.','Challenge 1 — Address verification: Before entering, confirm the physical address matches the schedule and chart. GPS errors, similar street numbers, apartment complex confusion, and unreported moves can send you to the wrong door. Address verification is the first layer, not a substitute for patient-level identification.','Challenge 2 — Cognitive impairment: Dementia, delirium, aphasia, or other conditions may prevent a patient from stating name and DOB. Use approved alternatives: caregiver present in the home, photograph in the chart (when available), medical record number on intake paperwork, or a combination. Never skip identification because the patient cannot respond verbally.'], keyPoints: [{ icon: '🏠', title: 'Address first layer', detail: 'Match house/apartment number and street before entry; still verify the person inside.' },{ icon: '🧠', title: 'Cognitive barriers', detail: 'Caregiver + photo + MRN (as available) — never skip ID because speech is impaired.' },{ icon: '🗣️', title: 'Open-ended only', detail: 'Patient states name/DOB; avoid yes/no leading questions.' },{ icon: '👥', title: 'One person = one ID', detail: 'Shared address never means shared identity or shared orders.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img02, hotspots: [{ id: "patient-states-two", label: "Patient states two IDs", shortLabel: "Patient states two IDs", ariaLabel: "Investigate Patient states two IDs", x: 31, y: 40, zone: "authorized" as ZoneKind, leftAnchorId: "kp-1-0", observe: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", identifyChoices: [
        { id: "patient-states-two-identify-correct", label: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", correct: true, rationale: "Correct. Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person." },
        { id: "patient-states-two-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "patient-states-two-decide-correct", label: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", correct: true, rationale: "Correct. Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care." },
        { id: "patient-states-two-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "patient-states-two-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "patient-states-two-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", meaning: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", action: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "no-leading-questions", label: "No leading questions", shortLabel: "No leading questions", ariaLabel: "Investigate No leading questions", x: 58, y: 54, zone: "conditional" as ZoneKind, leftAnchorId: "kp-1-1", observe: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", identifyChoices: [
        { id: "no-leading-questions-identify-correct", label: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", correct: true, rationale: "Correct. Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person." },
        { id: "no-leading-questions-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "no-leading-questions-decide-correct", label: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", correct: true, rationale: "Correct. Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care." },
        { id: "no-leading-questions-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "no-leading-questions-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "no-leading-questions-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", meaning: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", action: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "household-member-risk", label: "Household-member risk", shortLabel: "Household-member risk", ariaLabel: "Investigate Household-member risk", x: 78, y: 70, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-1-2", observe: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", identifyChoices: [
        { id: "household-member-risk-identify-correct", label: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", correct: true, rationale: "Correct. Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person." },
        { id: "household-member-risk-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "household-member-risk-decide-correct", label: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", correct: true, rationale: "Correct. Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care." },
        { id: "household-member-risk-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "household-member-risk-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "household-member-risk-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The patient states full name and date of birth in response to open-ended requests while another household member is nearby.", meaning: "Patient-generated answers reduce confirmation bias; a shared address, surname, caregiver, or home does not identify the scheduled person.", action: "Independently compare both patient-stated identifiers with the same approved record; separate each household member's chart, orders, medications, and care.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] },
{ id: 2, shortName: 'Protocol', title: 'The Verification Protocol — Step by Step', subtitle: 'Five-step home visit sequence (agency protocol)', narration: ['Care Indeed’s patient identification protocol follows a standardized five-step sequence for every home visit: (1) address verification, (2) patient identification with two identifiers, (3) order verification, (4) allergy confirmation, and (5) clinical intervention. This sequence is agency protocol under OP-PA-002 — apply it consistently.','Step 1 — Address verification (before exiting the vehicle): Confirm the address on the schedule matches the location. Note house number, street, apartment, and identifying features. If you cannot visually confirm, verify with the person at the door before proceeding into care.','Step 2 — Patient identification (at the door or immediately on entry): Ask the patient to state full name and date of birth. Match both against the schedule, physician orders, and chart. Both must match. If either does not, stop and investigate — do not begin care.'], keyPoints: [{ icon: '1', title: 'Address', detail: 'Curbside/entry match to schedule before clinical engagement.' },{ icon: '2', title: 'Two identifiers', detail: 'Open-ended name + DOB (or approved alternatives) matched to chart.' },{ icon: '3', title: 'Orders', detail: 'Orders and visit type match this identified patient.' },{ icon: '4→5', title: 'Allergies → care', detail: 'Allergy check precedes meds/products; then proceed with planned care.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img03, hotspots: [{ id: "approved-source-compare", label: "Approved-source comparison", shortLabel: "Approved-source comparison", ariaLabel: "Investigate Approved-source comparison", x: 27, y: 50, zone: "authorized" as ZoneKind, leftAnchorId: "kp-2-0", observe: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", identifyChoices: [
        { id: "approved-source-compare-identify-correct", label: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", correct: true, rationale: "Correct. Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity." },
        { id: "approved-source-compare-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "approved-source-compare-decide-correct", label: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", correct: true, rationale: "Correct. Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict." },
        { id: "approved-source-compare-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "approved-source-compare-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "approved-source-compare-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", meaning: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", action: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "same-record-match", label: "Same-record match", shortLabel: "Same-record match", ariaLabel: "Investigate Same-record match", x: 52, y: 67, zone: "conditional" as ZoneKind, leftAnchorId: "kp-2-1", observe: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", identifyChoices: [
        { id: "same-record-match-identify-correct", label: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", correct: true, rationale: "Correct. Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity." },
        { id: "same-record-match-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "same-record-match-decide-correct", label: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", correct: true, rationale: "Correct. Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict." },
        { id: "same-record-match-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "same-record-match-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "same-record-match-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", meaning: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", action: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "orders-follow-patient", label: "Orders follow patient", shortLabel: "Orders follow patient", ariaLabel: "Investigate Orders follow patient", x: 76, y: 42, zone: "authorized" as ZoneKind, leftAnchorId: "kp-2-2", observe: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", identifyChoices: [
        { id: "orders-follow-patient-identify-correct", label: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", correct: true, rationale: "Correct. Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity." },
        { id: "orders-follow-patient-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "orders-follow-patient-decide-correct", label: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", correct: true, rationale: "Correct. Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict." },
        { id: "orders-follow-patient-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "orders-follow-patient-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "orders-follow-patient-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "Both patient-stated identifiers are compared with one agency-approved schedule, EHR, or order source.", meaning: "Verification is a person-to-record comparison; memory, a mailbox, a neighbor, or fields split across records cannot establish identity.", action: "Confirm both identifiers match one authorized patient record and that the visit and orders belong to that patient; stop for any conflict.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] },
{ id: 3, shortName: 'Mismatch Stop', title: 'High-Risk Scenarios for ID Errors', subtitle: 'When vigilance must increase', narration: ['Certain scenarios elevate identification error risk. Recognizing them helps you slow down and apply full safeguards.','First visits: You have never met the patient; you have no visual memory; cognitive status is unknown until assessed. Use the full five-step protocol with zero shortcuts.','Coverage/substitute visits: Covering clinicians lack baseline familiarity. Extra vigilance is required precisely because context is missing.'], keyPoints: [{ icon: '🆕', title: 'New / coverage visits', detail: 'No familiarity credit — full protocol every time.' },{ icon: '💊', title: 'Meds & specimens', detail: 'Right patient first; label specimens immediately with two IDs.' },{ icon: '⚠️', title: 'Near-miss value', detail: 'Report near-misses per agency process to protect the next patient.' },{ icon: '🔗', title: 'Cascade risk', detail: 'Wrong address → wrong person → wrong orders → wrong med is a preventable chain.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img04, hotspots: [{ id: "separate-household-patients", label: "Separate household patients", shortLabel: "Separate household patients", ariaLabel: "Investigate Separate household patients", x: 25, y: 42, zone: "conditional" as ZoneKind, leftAnchorId: "kp-3-0", observe: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", identifyChoices: [
        { id: "separate-household-patients-identify-correct", label: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", correct: true, rationale: "Correct. One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop." },
        { id: "separate-household-patients-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "separate-household-patients-decide-correct", label: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", correct: true, rationale: "Correct. Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution." },
        { id: "separate-household-patients-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "separate-household-patients-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "separate-household-patients-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", meaning: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", action: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "mismatch-hard-stop", label: "Mismatch hard stop", shortLabel: "Mismatch hard stop", ariaLabel: "Investigate Mismatch hard stop", x: 52, y: 57, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-3-1", observe: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", identifyChoices: [
        { id: "mismatch-hard-stop-identify-correct", label: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", correct: true, rationale: "Correct. One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop." },
        { id: "mismatch-hard-stop-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "mismatch-hard-stop-decide-correct", label: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", correct: true, rationale: "Correct. Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution." },
        { id: "mismatch-hard-stop-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "mismatch-hard-stop-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "mismatch-hard-stop-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", meaning: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", action: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "no-partial-match", label: "No partial-match care", shortLabel: "No partial-match care", ariaLabel: "Investigate No partial-match care", x: 77, y: 70, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-3-2", observe: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", identifyChoices: [
        { id: "no-partial-match-identify-correct", label: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", correct: true, rationale: "Correct. One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop." },
        { id: "no-partial-match-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "no-partial-match-decide-correct", label: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", correct: true, rationale: "Correct. Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution." },
        { id: "no-partial-match-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "no-partial-match-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "no-partial-match-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "A household member's name or date of birth conflicts with the approved patient record even though the address or one field matches.", meaning: "One conflicting or missing identifier is a mismatch and activates the OP-PA-002 hard stop.", action: "Stop all clinical activity, secure medications and supplies, and never proceed through the mismatch or accept family reassurance as resolution.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] },
{ id: 4, shortName: 'Notify', title: 'When Identification Fails — Escalation', subtitle: 'Stop · Notify · Document (SBAR)', narration: ['When you encounter a patient identification discrepancy, stop all clinical activities and escalate. A discrepancy is any situation where stated identifiers do not match the schedule, orders, or chart — name mismatch, DOB mismatch, address discrepancy, or inability to identify the patient by approved methods.','Use SBAR to structure the report. Situation: you have an identification discrepancy. Background: what the patient stated, what documentation shows, and what you observed at the address. Assessment: your judgment on whether this looks like a documentation error, scheduling error, patient confusion, or other safety concern. Recommendation: what should happen next (chart correction, reschedule, supervisory verification, hold visit).','Report immediately to the RN case manager or clinical supervisor per agency chain of command. Do not attempt to “solve” identity by guesswork. Do not provide clinical care until identity is positively confirmed. If the discrepancy cannot be resolved, you do not provide care. Delaying a visit is safer than treating the wrong patient.'], keyPoints: [{ icon: '🛑', title: 'STOP first', detail: 'No meds, no wound care, no specimens until identity is confirmed.' },{ icon: '📡', title: 'SBAR notify', detail: 'Structured report to RN/supervisor — not informal hallway guessing.' },{ icon: '📝', title: 'Document always', detail: 'Even resolved discrepancies belong in the record and often in incident systems.' },{ icon: '🛡️', title: 'Delay > wrong care', detail: 'An unfinished visit is safer than a confident error.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img05, hotspots: [{ id: "stop-all-care", label: "Stop all care", shortLabel: "Stop all care", ariaLabel: "Investigate Stop all care", x: 28, y: 40, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-4-0", observe: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", identifyChoices: [
        { id: "stop-all-care-identify-correct", label: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", correct: true, rationale: "Correct. RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care." },
        { id: "stop-all-care-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "stop-all-care-decide-correct", label: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", correct: true, rationale: "Correct. Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification." },
        { id: "stop-all-care-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "stop-all-care-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "stop-all-care-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", meaning: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", action: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "notify-supervising-rn", label: "Notify supervising RN", shortLabel: "Notify supervising RN", ariaLabel: "Investigate Notify supervising RN", x: 54, y: 58, zone: "conditional" as ZoneKind, leftAnchorId: "kp-4-1", observe: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", identifyChoices: [
        { id: "notify-supervising-rn-identify-correct", label: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", correct: true, rationale: "Correct. RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care." },
        { id: "notify-supervising-rn-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "notify-supervising-rn-decide-correct", label: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", correct: true, rationale: "Correct. Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification." },
        { id: "notify-supervising-rn-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "notify-supervising-rn-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "notify-supervising-rn-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", meaning: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", action: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "resolution-before-care", label: "Resolution before care", shortLabel: "Resolution before care", ariaLabel: "Investigate Resolution before care", x: 78, y: 44, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-4-2", observe: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", identifyChoices: [
        { id: "resolution-before-care-identify-correct", label: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", correct: true, rationale: "Correct. RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care." },
        { id: "resolution-before-care-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "resolution-before-care-decide-correct", label: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", correct: true, rationale: "Correct. Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification." },
        { id: "resolution-before-care-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "resolution-before-care-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "resolution-before-care-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The mismatch is defined exactly and all interventions remain held while the LVN prepares an immediate structured report.", meaning: "RN contact directs the agency resolution pathway but does not by itself positively identify the patient or clear care.", action: "Notify the supervising RN immediately with stated and source values, discrepancy, held activities, and safety status; resume only after approved positive verification.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] },
{ id: 5, shortName: 'Document', title: 'Technology and Tools for Patient ID', subtitle: 'EHR supports verification — it does not replace it', narration: ['Care Indeed’s EHR includes tools that support identification; technology supplements but never replaces the manual two-identifier protocol.','Electronic schedule: displays full name, DOB, address, and phone for each visit. Review before departure. Resolve schedule-versus-record discrepancies before you drive.','Patient photograph (when available): often captured at admission and updated periodically. Compare the person at the door to the chart photo as an adjunct identifier — still complete verbal/alternative two-identifier verification.'], keyPoints: [{ icon: '📱', title: 'Pre-visit review', detail: 'Name, DOB, address, phone on the schedule — resolve conflicts before travel.' },{ icon: '🖼️', title: 'Photo adjunct', detail: 'Photo supports identity; it is not a free pass to skip verbal/alternative IDs.' },{ icon: '✅', title: 'EHR checkpoints', detail: 'Use required ID confirmations intentionally — never auto-bypass.' },{ icon: '🧑‍⚕️', title: 'Human remains primary', detail: 'Technology fails, batteries die, photos age — protocol still stands.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img06, hotspots: [{ id: "ehr-patient-selection", label: "EHR patient selection", shortLabel: "EHR patient selection", ariaLabel: "Investigate EHR patient selection", x: 28, y: 45, zone: "authorized" as ZoneKind, leftAnchorId: "kp-5-0", observe: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", identifyChoices: [
        { id: "ehr-patient-selection-identify-correct", label: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", correct: true, rationale: "Correct. Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement." },
        { id: "ehr-patient-selection-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "ehr-patient-selection-decide-correct", label: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", correct: true, rationale: "Correct. Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held." },
        { id: "ehr-patient-selection-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "ehr-patient-selection-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "ehr-patient-selection-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", meaning: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", action: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "photo-adjunct-only", label: "Photo adjunct only", shortLabel: "Photo adjunct only", ariaLabel: "Investigate Photo adjunct only", x: 54, y: 68, zone: "conditional" as ZoneKind, leftAnchorId: "kp-5-1", observe: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", identifyChoices: [
        { id: "photo-adjunct-only-identify-correct", label: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", correct: true, rationale: "Correct. Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement." },
        { id: "photo-adjunct-only-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "photo-adjunct-only-decide-correct", label: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", correct: true, rationale: "Correct. Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held." },
        { id: "photo-adjunct-only-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "photo-adjunct-only-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "photo-adjunct-only-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", meaning: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", action: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "downtime-hold", label: "Downtime hold", shortLabel: "Downtime hold", ariaLabel: "Investigate Downtime hold", x: 77, y: 51, zone: "prohibited" as ZoneKind, leftAnchorId: "kp-5-2", observe: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", identifyChoices: [
        { id: "downtime-hold-identify-correct", label: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", correct: true, rationale: "Correct. Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement." },
        { id: "downtime-hold-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "downtime-hold-decide-correct", label: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", correct: true, rationale: "Correct. Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held." },
        { id: "downtime-hold-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "downtime-hold-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "downtime-hold-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The EHR, schedule, orders, or authorized chart photo is available as a comparison tool, but technology or appearance alone cannot identify the patient.", meaning: "Approved technology supports the check; a photo is only an adjunct and downtime never lowers the two-identifier requirement.", action: "Use two identifiers to select the exact record; if an approved source is unavailable or conflicts, follow downtime and RN escalation while care remains held.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] },
{ id: 6, shortName: 'Practice', title: 'Documentation, Competency, and Mastery', subtitle: 'Record the check · prove the practice · know the limits of a quiz', narration: ['Identification documentation is part of every visit note. Record that two-identifier verification was performed before care. EHR templates commonly include an identification confirmation field — complete it every visit with the identifiers used and any challenges.','When identification is difficult (cognitive impairment, language barrier, new patient), document the challenge, alternative methods used (caregiver verification, photo, MRN), and the resolution. This demonstrates OP-PA-002 compliance and provides survey evidence that the protocol was followed.','Incident reporting: wrong-patient near-misses and actual wrong-patient events must be reported through the agency incident system within the timeframe required by current agency policy (commonly within 24 hours at Care Indeed — always follow the policy in force). A near-miss is an error caught before clinical intervention; an actual event is any intervention on the wrong patient. Both feed QAPI.'], keyPoints: [{ icon: '📋', title: 'Every note', detail: 'Document two identifiers used and any ID challenges/resolution.' },{ icon: '⏱️', title: 'Near-miss reporting', detail: 'Report per agency policy timeframe — near-misses protect future patients.' },{ icon: '👀', title: 'Observation competency', detail: 'Practical skill is signed off by observation, not by quiz score alone.' },{ icon: '🎯', title: 'Knowledge check next', detail: '80% required on 10 application questions; retry and review available.' }], clinicalTip: 'Never proceed through a mismatch: hold care, notify the supervising RN, and document the exact response.', sourceLabels: [{ kind: 'Agency Policy', text: 'OP-PA-002' }], sceneImage: img07, hotspots: [{ id: "exact-id-record", label: "Exact ID record", shortLabel: "Exact ID record", ariaLabel: "Investigate Exact ID record", x: 28, y: 43, zone: "authorized" as ZoneKind, leftAnchorId: "kp-6-0", observe: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", identifyChoices: [
        { id: "exact-id-record-identify-correct", label: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", correct: true, rationale: "Correct. Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held." },
        { id: "exact-id-record-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "exact-id-record-decide-correct", label: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", correct: true, rationale: "Correct. Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required." },
        { id: "exact-id-record-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "exact-id-record-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "exact-id-record-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", meaning: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", action: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "mismatch-notification-record", label: "Mismatch notification record", shortLabel: "Mismatch notification record", ariaLabel: "Investigate Mismatch notification record", x: 53, y: 69, zone: "conditional" as ZoneKind, leftAnchorId: "kp-6-1", observe: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", identifyChoices: [
        { id: "mismatch-notification-record-identify-correct", label: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", correct: true, rationale: "Correct. Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held." },
        { id: "mismatch-notification-record-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "mismatch-notification-record-decide-correct", label: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", correct: true, rationale: "Correct. Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required." },
        { id: "mismatch-notification-record-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "mismatch-notification-record-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "mismatch-notification-record-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", meaning: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", action: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } },{ id: "resolution-and-near-miss", label: "Resolution and near-miss", shortLabel: "Resolution and near-miss", ariaLabel: "Investigate Resolution and near-miss", x: 77, y: 50, zone: "conditional" as ZoneKind, leftAnchorId: "kp-6-2", observe: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", identifyChoices: [
        { id: "resolution-and-near-miss-identify-correct", label: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", correct: true, rationale: "Correct. Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held." },
        { id: "resolution-and-near-miss-identify-unsafe", label: "Identity may be assumed from familiarity, location, a household explanation, or a partial match.", correct: false, rationale: "Unsafe. OP-PA-002 requires two approved identifiers; location, familiarity, or one matching field is insufficient." }
        ], decideChoices: [
        { id: "resolution-and-near-miss-decide-correct", label: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", correct: true, rationale: "Correct. Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required." },
        { id: "resolution-and-near-miss-decide-unsafe", label: "Proceed with the intervention while the identity question is resolved later.", correct: false, rationale: "Never proceed through a mismatch or incomplete verification. Stop and escalate before any intervention." }
        ], documentChoices: [
        { id: "resolution-and-near-miss-document-correct", label: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", correct: true, rationale: "Correct. Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response." },
        { id: "resolution-and-near-miss-document-unsafe", label: "Chart only “patient known to nurse” or “ID checked.”", correct: false, rationale: "Vague wording does not establish the identifiers, source, result, hard stop, communication, or resolution." }
        ], feedback: { observed: "The visit record is ready to capture the exact identity check, any hard stop, RN communication, and final disposition.", meaning: "Specific documentation lets a reviewer reconstruct whether verification occurred before care and whether a mismatch remained safely held.", action: "Chart identifiers, source, result, held care, notification and direction, resolution or no-care disposition, patient response, and incident reference when required.", notify: "Notify the supervising RN or clinical supervisor immediately through the agency chain of command; use emergency services separately when an urgent condition requires it.", document: "Record the two identifiers used, approved source compared, exact match or mismatch, care held, RN name and role, notification time and method, facts reported, direction received, resolution or disposition, and patient response.", policyRefs: ["OP-PA-002"] } }] }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Before any clinical intervention on a home visit, how many patient identifiers does Care Indeed policy OP-PA-002 require at minimum?',
    options: [
      'Two approved patient identifiers',
      'One identifier if you know the patient well',
      'Three identifiers including room number',
      'Four identifiers including diagnosis code'
    ],
    correct: 0,
    rationale: 'OP-PA-002 requires a minimum of two patient identifiers before any clinical intervention. Familiarity is not an exception. Room number is not a home-health identifier.',
  },
  {
    id: 2,
    stem: 'You arrive for a visit. Which identification technique best reduces wrong-patient risk with a potentially suggestible patient?',
    options: [
      'Ask “Are you Maria Lopez?” and accept a yes',
      'Ask “What is your full name?” and “What is your date of birth?” then match the chart',
      'Skip verbal ID because the address matches your GPS',
      'Ask only the caregiver and never address the patient'
    ],
    correct: 1,
    rationale: 'Open-ended identification (patient states name and DOB) is preferred. Leading yes/no questions, address-only checks, or caregiver-only approaches (when the patient can participate) increase error risk.',
  },
  {
    id: 3,
    stem: 'According to Care Indeed’s five-step home-visit ID protocol, what is the FIRST step?',
    options: [
      'Address verification against the schedule',
      'Allergy confirmation',
      'Medication preparation',
      'Documenting the visit note'
    ],
    correct: 0,
    rationale: 'Address verification occurs first (typically before or at entry). Patient two-identifier check, order verification, allergy confirmation, and intervention follow in sequence.',
  },
  {
    id: 4,
    stem: 'Which of the following is NOT an acceptable patient identifier in home health under the standards taught in this module?',
    options: [
      'Full legal name',
      'Date of birth',
      'Room number',
      'Medical record number'
    ],
    correct: 2,
    rationale: 'Home health does not use institutional room numbers as patient identifiers. Full legal name, DOB, MRN, and home address are examples of acceptable identifiers when used per agency policy.',
  },
  {
    id: 5,
    stem: 'A patient with advanced dementia cannot state their name or DOB. What should you do?',
    options: [
      'Skip identification and proceed because the address is correct',
      'Assume identity from the mailbox name alone',
      'Provide care first and identify later if time allows',
      'Use approved alternatives such as caregiver verification plus chart photo and/or MRN, still meeting two-identifier expectations'
    ],
    correct: 3,
    rationale: 'Cognitive impairment never authorizes skipping ID. Use approved alternative methods (caregiver, photo, MRN, etc.) to achieve two-identifier verification per policy.',
  },
  {
    id: 6,
    stem: 'You collect a blood specimen in the home. What must the specimen label include at minimum regarding identity?',
    options: [
      'At least two patient identifiers, verified at collection before leaving the home',
      'Patient first name only',
      'Physician name only',
      'Diagnosis code only'
    ],
    correct: 0,
    rationale: 'Specimens must be labeled at the point of collection with at least two patient identifiers and verified against the patient’s identification before the specimen leaves the home.',
  },
  {
    id: 7,
    stem: 'You discover the patient’s stated DOB does not match the chart. Which structured communication tool should you use when escalating?',
    options: [
      'SOAP only',
      'ADPIE only',
      'SBAR (Situation, Background, Assessment, Recommendation)',
      'A head-to-toe physical assessment checklist'
    ],
    correct: 2,
    rationale: 'SBAR structures escalation of identification discrepancies: state the mismatch, background facts, your assessment of risk/type of error, and recommended next steps while care is held.',
  },
  {
    id: 8,
    stem: 'You realize the person at the door may not be the scheduled patient. What is your FIRST action?',
    options: [
      'Give the scheduled medications anyway to avoid a missed visit',
      'Stop all clinical activities until identity is positively confirmed',
      'Leave immediately without notifying anyone',
      'Ask the neighbor to confirm the patient’s identity and proceed'
    ],
    correct: 1,
    rationale: 'Stop clinical activity first. Then investigate with approved identifiers, notify the RN/supervisor if unresolved, and document. Do not treat on uncertainty.',
  },
  {
    id: 9,
    stem: 'You care for both spouses in the same home on the same day. Which practice is required?',
    options: [
      'One identification at the door covers both patients for the whole visit',
      'Identify only the spouse who answers the door',
      'Use the shared address as the sole identifier for both',
      'Independently identify each patient before each patient’s clinical interventions'
    ],
    correct: 3,
    rationale: 'Shared address never equals shared identity. Each patient requires independent identification; keep orders, meds, and documentation patient-specific.',
  },
  {
    id: 10,
    stem: 'You almost hung another patient’s medication list but caught the name mismatch before administering anything. What must you do?',
    options: [
      'Ignore it because no harm occurred',
      'Report the near-miss through the agency incident process within the timeframe required by current agency policy',
      'Report only if a medication was actually given',
      'Discuss it verbally with a coworker and leave it out of any system'
    ],
    correct: 1,
    rationale: 'Near-misses must be reported per agency policy (Care Indeed commonly expects prompt reporting such as within 24 hours — follow the policy in force). Near-miss reporting fuels QAPI and prevents future harm. Quiz success here validates knowledge only, not observed competency.',
  }
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:10px;max-width:92px;white-space:normal;text-align:center;line-height:1.15}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:11px}
  .lvn002-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(560px,100%);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:11px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}
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
  hotspot: Hotspot; onClose: () => void; onComplete: () => void; triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const feedbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<ScenarioStage>('observe');
  const [selectedIdentifyId, setSelectedIdentifyId] = useState<string | null>(null);
  const [selectedDecideId, setSelectedDecideId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [identifyLocked, setIdentifyLocked] = useState(false);
  const [decideLocked, setDecideLocked] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);

  const zoneColor = hotspot.zone === 'authorized' ? CI.teal : hotspot.zone === 'conditional' ? CI.orange : hotspot.zone === 'prohibited' ? CI.red : CI.slate;
  const restoreTriggerFocus = useCallback(() => window.requestAnimationFrame(() => triggerRef.current?.focus()), [triggerRef]);
  const closeAndRestore = useCallback(() => { onClose(); restoreTriggerFocus(); }, [onClose, restoreTriggerFocus]);

  useEffect(() => {
    closeRef.current?.focus();
  }, [hotspot.id]);

  useEffect(() => {
    if (stage === 'identify' || stage === 'decide' || stage === 'document') {
      dialogRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    } else if (stage === 'feedback') {
      feedbackHeadingRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.lvn002-shell');
    const scrollNodes = Array.from(document.querySelectorAll<HTMLElement>('.lvn002-work,.lvn002-left,.lvn002-quiz-page'));
    const prior = scrollNodes.map((node) => ({ node, overflow: node.style.overflow, touchAction: node.style.touchAction }));
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    if (shell) { shell.inert = true; shell.setAttribute('aria-hidden', 'true'); }
    for (const { node } of prior) { node.style.overflow = 'hidden'; node.style.touchAction = 'none'; }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const blockBackgroundScroll = (event: Event) => {
      if (!dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    const blockBackgroundKeys = (event: KeyboardEvent) => {
      if (['PageUp', 'PageDown', 'Home', 'End', ' ', 'ArrowUp', 'ArrowDown'].includes(event.key) && !dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    document.addEventListener('wheel', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('keydown', blockBackgroundKeys, true);
    return () => {
      if (shell) { shell.inert = false; shell.removeAttribute('aria-hidden'); }
      for (const item of prior) { item.node.style.overflow = item.overflow; item.node.style.touchAction = item.touchAction; }
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener('wheel', blockBackgroundScroll, true);
      document.removeEventListener('touchmove', blockBackgroundScroll, true);
      document.removeEventListener('keydown', blockBackgroundKeys, true);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeAndRestore(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [closeAndRestore, stage]);

  const pick = (choice: ScenarioChoice, setSelected: (id: string) => void, setLocked: (value: boolean) => void, locked: boolean, next: ScenarioStage) => {
    if (locked) return;
    setSelected(choice.id); setRationale(choice.rationale);
    if (choice.correct) {
      setLocked(true);
      window.setTimeout(() => { setRationale(null); setStage(next); }, 650);
    }
  };

  const renderChoices = (choices: ScenarioChoice[], selectedId: string | null, locked: boolean, onPick: (choice: ScenarioChoice) => void) => {
    const activeIndex = Math.max(0, choices.findIndex((choice) => choice.id === selectedId));
    const moveFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + choices.length) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else if (event.key === ' ') { event.preventDefault(); onPick(choices[index]); return; }
      else return;
      event.preventDefault();
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    };
    return (
      <div role="radiogroup" aria-label={`${stage} choices`} style={{ display: 'grid', gap: 8 }}>
        {choices.map((choice, index) => {
          const selected = selectedId === choice.id;
          const wrong = selected && !choice.correct;
          const right = selected && choice.correct;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={selected} tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onPick(choice)} onKeyDown={(event) => moveFocus(event, index)} disabled={locked && !selected}
              style={{ textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer', border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`, background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1 }}>
              {choice.label}
            </button>
          );
        })}
        {rationale && <div role="status" aria-live="polite" style={{ fontSize: 14, lineHeight: 1.5, color: CI.muted, padding: '8px 10px', borderRadius: 8, background: CI.bg }}>{rationale}</div>}
      </div>
    );
  };

  const feedback = hotspot.feedback;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lvn-scenario-title" ref={dialogRef} className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>{stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}</div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2></div>
          <button ref={closeRef} type="button" aria-label="Close scenario" onClick={closeAndRestore} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          {stage === 'observe' && <><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p><button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.teal, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Continue to Identify</button></>}
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the LVN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
        </div>
      </div>
    </div>, document.body,
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > 1;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, index) => (
          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden>{kp.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{kp.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{kp.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {page.sourceLabels.map((s) => (
          <span key={s.kind + s.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.kind}: {s.text}</span>
        ))}
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void; onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = page.hotspots.find((h) => h.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;
  useEffect(() => { setActiveId(null); }, [page.id]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      page.hotspots.forEach((hotspot) => {
        if (!hotspot.leftAnchorId || !document.getElementById(hotspot.leftAnchorId)) {
          throw new Error(`[${MODULE_META.id}] Missing left anchor: ${hotspot.leftAnchorId ?? '(unset)'}`);
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page]);
  return (
    <div className="lvn002-stage-wrap">
      <div className="lvn002-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={SCENE_ALT[page.id]} draggable={false} />
        <div className="lvn002-scene-title" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hs) => {
          const isDone = completed.includes(hs.id);
          const color = ZONE[hs.zone].color;
          const nextIncomplete = page.hotspots.find((h) => !completed.includes(h.id));
          const isGuided = !isDone && nextIncomplete?.id === hs.id;
          return (
            <button key={hs.id} type="button" className={`lvn002-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`lvn002-progress-${page.id}`}
              onClick={(e) => { triggerRef.current = e.currentTarget; setActiveId(hs.id); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerRef.current = e.currentTarget;
                  setActiveId(hs.id);
                }
              }}>
              <div className="orb" style={{ background: isDone ? CI.teal : (hs.zone === 'neutral' ? CI.orange : color) }}>
                {isGuided && !isDone && <span className="ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 15 }} aria-hidden>?</span>}
              </div>
              <span className="tag">{hs.shortLabel}</span>
              {isDone && <span className="lvn002-sr-only">Completed</span>}
            </button>
          );
        })}
        <div id={`lvn002-progress-${page.id}`} className="lvn002-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} nodes observed
        </div>
        <button type="button" aria-label="Reset lesson progress" onClick={() => setCompleted([])}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'lvn002-pop .3s cubic-bezier(.16,1,.3,1)' }} className="lvn002-rm-transition">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario Practice Complete. Knowledge practice only — Practical Competency Remains Separate.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
              )}
            </div>
          </div>
        )}
        {active && (
          <ClinicalFeedbackOverlay hotspot={active} onClose={() => setActiveId(null)}
            onComplete={() => { if (!completed.includes(active.id)) setCompleted([...completed, active.id]); setActiveId(null); }}
            triggerRef={triggerRef} />
        )}
      </div>
    </div>
  );
}

/** Dedicated single-panel Knowledge Check — progressive field cards + scope compass result */
function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  onPersist,
}: {
  onBack: () => void;
  initialAnswers?: (number | null)[];
  initialIdx?: number;
  initialFinished?: boolean;
  initialSelected?: number | null;
  initialSubmitted?: boolean;
  onPersist: (state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => void;
}) {
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const [selected, setSelected] = useState<number | null>(() => {
    if (initialSelected !== undefined) return initialSelected;
    if (initialAnswers && initialAnswers[initialIdx ?? 0] != null) return initialAnswers[initialIdx ?? 0];
    return null;
  });
  const [submitted, setSubmitted] = useState<boolean>(() => {
    if (initialSubmitted !== undefined) return !!initialSubmitted;
    return !!(initialAnswers && initialAnswers[initialIdx ?? 0] != null);
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => initialAnswers ?? Array(QUIZ.length).fill(null),
  );
  const [finished, setFinished] = useState(!!initialFinished);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const q = QUIZ[idx];
  const isCorrect = selected === q.correct;
  const score = useMemo(
    () => answers.reduce<number>((n, a, i) => n + (a === QUIZ[i].correct ? 1 : 0), 0),
    [answers],
  );
  const pct = Math.round((score / QUIZ.length) * 100);
  const passed = pct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted });
    // intentionally omit onPersist identity to avoid re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, finished, selected, submitted]);

  const focusOption = (i: number) => {
    setSelected(i);
    window.requestAnimationFrame(() => optionRefs.current[i]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const next = [...answers];
      next[idx] = selected;
      setAnswers(next);
      setSubmitted(true);
      return;
    }
    if (idx >= QUIZ.length - 1) {
      setFinished(true);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelected(answers[nextIdx] != null ? answers[nextIdx] : null);
    setSubmitted(answers[nextIdx] != null);
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <div className="lvn002-quiz-page">
        <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="lvn002-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Knowledge Check Complete' : 'Keep sharpening judgment'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            Scenario Practice Complete. Practical Competency Remains Separate.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Authorized', color: CI.teal, tip: 'Order + competency + expected' },
              { label: 'Conditional', color: CI.orange, tip: 'RN oversight required' },
              { label: 'Prohibited', color: CI.red, tip: 'Hard stop · escalate' },
            ].map((z) => (
              <div key={z.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lvn002-quiz-page">
      <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="lvn002-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h2>

          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(e) => {
              if (submitted) return;
              const max = q.options.length - 1;
              const cur = selected ?? 0;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusOption(Math.min(max, cur + 1)); }
              else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusOption(Math.max(0, cur - 1)); }
              else if (e.key === 'Home') { e.preventDefault(); focusOption(0); }
              else if (e.key === 'End') { e.preventDefault(); focusOption(max); }
              else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (selected !== null) submit(); }
            }}>
            {q.options.map((opt, i) => {
              const on = selected === i;
              let border: string = CI.border;
              let bg: string = '#fff';
              let letterBg: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && i === q.correct) { border = CI.teal; bg = CI.tealSoft; letterBg = CI.teal; letterColor = '#fff'; }
              else if (submitted && on && !isCorrect) { border = CI.red; bg = '#FEF2F2'; letterBg = CI.red; letterColor = '#fff'; }
              else if (on) { border = CI.teal; bg = '#F3FBFA'; letterBg = CI.teal; letterColor = '#fff'; }
              return (
                <button key={i} type="button" role="radio" aria-checked={on}
                  ref={(el) => { optionRefs.current[i] = el; }}
                  tabIndex={on || (selected === null && i === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background: bg, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all .15s', minHeight: 48 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[i]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{opt}</span>
                  {submitted && i === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && on && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'lvn-011-progress-v5415';

type Persisted = {
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers?: (number | null)[];
  quizIdx?: number;
  quizFinished?: boolean;
  quizSelected?: number | null;
  quizSubmitted?: boolean;
};

function loadProgress(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function saveProgress(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

export default function LVN011() {
  const initial = loadProgress();
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial?.completedByPage ?? {});
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial?.quizAnswers ?? Array(QUIZ.length).fill(null));
  const [quizIdx, setQuizIdx] = useState(initial?.quizIdx ?? 0);
  const [quizFinished, setQuizFinished] = useState(!!initial?.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial?.quizSelected ?? null);
  const [quizSubmitted, setQuizSubmitted] = useState(!!initial?.quizSubmitted);
  const page = PAGES[Math.min(pageIndex, PAGES.length - 1)];
  const completed = completedByPage[page.id] ?? [];

  const persistAll = (patch?: Partial<Persisted>) => {
    saveProgress({
      pageIndex,
      mode,
      completedByPage,
      quizAnswers,
      quizIdx,
      quizFinished,
      quizSelected,
      quizSubmitted,
      ...patch,
    });
  };

  useEffect(() => {
    persistAll();
  }, [pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizFinished, quizSelected, quizSubmitted]);

  const handleSaveExit = () => {
    persistAll();
    window.history.back();
  };

  const handleQuizPersist = useCallback((state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
  }, []);

  return (
    <div className="lvn002 lvn002-shell">
      <style>{STYLES}</style>
      <header className="lvn002-top">
        <div className="lvn002-brand">
          <img
            src="/assets/navigation/logo-careindeed-orange.png"
            alt="Care Indeed"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
          />
          <span className="brand-text">LVN-011 — Patient ID</span>
        </div>
        <div className="lvn002-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              className={`lvn002-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              {p.shortName}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={mode === 'quiz'}
            className={`lvn002-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="lvn002-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <QuizPage
          onBack={() => setMode('lessons')}
          initialAnswers={quizAnswers}
          initialIdx={quizIdx}
          initialFinished={quizFinished}
          initialSelected={quizSelected}
          initialSubmitted={quizSubmitted}
          onPersist={handleQuizPersist}
        />
      ) : (
        <div className="lvn002-work">
          <aside className="lvn002-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
          <section className="lvn002-right">
            <RightPanel page={page} completed={completed}
              setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
              onGoQuiz={() => setMode('quiz')} />
          </section>
        </div>
      )}

      <footer className="lvn002-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((i) => Math.max(0, i - 1));
          }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="lvn002-footer-status" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
            {mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${pageIndex + 1} of ${PAGES.length} · ${page.shortName}`}
          </span>
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => setPageIndex((i) => Math.min(PAGES.length - 1, i + 1))}>Next · {PAGES[pageIndex + 1]?.shortName} <ChevronRight size={16} /></button>
        )}
      </footer>
    </div>
  );
}
