/**
 * LVN-006 — Medication
 * v5.5.0-PASS5 | Observe→Identify→Decide→Document→Feedback→Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-006/lesson-01-med-safety.png';
import img02 from './assets/lvn-006/lesson-02-seven-rights.png';
import img03 from './assets/lvn-006/lesson-03-reconcile.png';
import img04 from './assets/lvn-006/lesson-04-high-alert.png';
import img05 from './assets/lvn-006/lesson-05-teach-back.png';
import img06 from './assets/lvn-006/lesson-06-hold-notify.png';
import img07 from './assets/lvn-006/lesson-07-practice.png';


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

const MODULE_META = { id: 'LVN-006', title: 'Medication', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'LVN reviews de-identified medication bottles, a pill organizer, and blank active-order materials in a solo home medication-safety check.',
  'De-identified LVN compares a medication bottle with a blank MAR or active order, dose tools, and two patient-identifier cues.',
  'LVN compares a blank medication list with home bottles and flags a de-identified reconciliation discrepancy during a skilled visit.',
  'High-alert medication verification scene with generic anticoagulant, insulin, controlled-medication, and cardiac safety props.',
  'Patient demonstrates medication understanding to an LVN using a pill organizer, generic bottle, and icon-only teaching materials.',
  'LVN holds a medication, contacts the supervising RN, and prepares documentation after identifying a near-miss risk.',
  'LVN responds to a suspected medication error by securing medication, assessing the patient, notifying the RN, and documenting.',
] as const;

const PAGES: PageData[] = [
{ id: 0, shortName: 'Med Safety', title: 'Why medication safety is a top clinical priority in home health', subtitle: 'Why medication safety is a top clinical priority in home health', narration: ['Medication errors are among the most common types of medical error in healthcare, and home health carries unique risks that make medication safety especially challenging. You are alone in the patient\'s home. There is no pharmacy double-check at the bedside. There is no second nurse to verify a dose calculation. The patient\'s medication supply is managed by the patient and caregivers, not a hospital pharmacy. In this environment, your knowledge and discipline are the primary barriers between a medication error and patient harm.','Federal Conditions of Participation require that drugs and treatments be administered only as ordered by the physician (or allowed practitioner) under 42 CFR § 484.60(a)(2). Agency policy CL-SD-012 (Medication Administration Safety) and CL-SD-013 (Medication Reconciliation) operationalize how Care Indeed expects LVNs to administer, reconcile, educate, and respond when something goes wrong.','Medication-related harm in home health can be harder to detect and reverse than in a hospital: discovery may be delayed because monitoring is intermittent; emergency response is not on-site; patients may not recognize adverse drug effects; and the next skilled visit may be days away. Prevention—not late rescue—is the reliable strategy.'], keyPoints: [{ icon: "🏠", title: "Solo medication environment", detail: "No bedside pharmacist or second nurse: bottle/MAR/order discipline is the safety barrier." }, { icon: "✅", title: "Seven Rights every time", detail: "Verify patient, medication, dose, route, time, documentation, and reason." }, { icon: "⏱️", title: "Three verification moments", detail: "Repeat all Seven Rights when retrieving, preparing, and administering every medication." }, { icon: "🛑", title: "Hold, notify, document", detail: "Stop on a mismatch; notify the RN and record the finding and direction." }], clinicalTip: "In a solo medication environment, compare the patient, bottle, MAR, and active order before touching the dose.", sourceLabels: [{ kind: "Federal", text: "42 CFR § 484.60(a)(2)" }, { kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img01, hotspots: [{ id: 'p1-solo', label: 'Solo environment', shortLabel: 'Solo environ…', ariaLabel: 'Investigate Solo environment', x: 22, y: 30, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-0', observe: 'You are often the only clinician present. Build habits that replace hospital double-checks: slow verification, written comparison, and early RN escalation.', identifyChoices: [{ id: "identify-correct", label: "Solo environment is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", correct: true, rationale: "Correct. Solo environment is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree." }, { id: "identify-unsafe", label: "Solo environment can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", correct: true, rationale: "Correct. Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", correct: true, rationale: "Correct. Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "You are often the only clinician present. Build habits that replace hospital double-checks: slow verification, written comparison, and early RN escalation.", meaning: "Solo environment is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", action: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", notify: "Notify the supervising RN for a mismatch, unclear order, failed right, adverse finding, error, or near-miss.", document: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p1-federal', label: '42 CFR § 484.60(a)(2)', shortLabel: '42 CFR § 484…', ariaLabel: 'Investigate 42 CFR § 484.60(a)(2)', x: 55, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-1', observe: 'Federal CoP expectation: drugs and treatments are administered as ordered. Do not invent doses, routes, or frequencies.', identifyChoices: [{ id: "identify-correct", label: "42 CFR § 484.60(a)(2) is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", correct: true, rationale: "Correct. 42 CFR § 484.60(a)(2) is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree." }, { id: "identify-unsafe", label: "42 CFR § 484.60(a)(2) can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", correct: true, rationale: "Correct. Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", correct: true, rationale: "Correct. Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Federal CoP expectation: drugs and treatments are administered as ordered. Do not invent doses, routes, or frequencies.", meaning: "42 CFR § 484.60(a)(2) is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", action: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", notify: "Notify the supervising RN for a mismatch, unclear order, failed right, adverse finding, error, or near-miss.", document: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p1-policy', label: 'CL-SD-012 / 013', shortLabel: 'CL-SD-012 / …', ariaLabel: 'Investigate CL-SD-012 / 013', x: 78, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-2', observe: 'Agency policies define administration safety steps, reconciliation every skilled visit, high-alert handling, education, and error response.', identifyChoices: [{ id: "identify-correct", label: "CL-SD-012 / 013 is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", correct: true, rationale: "Correct. CL-SD-012 / 013 is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree." }, { id: "identify-unsafe", label: "CL-SD-012 / 013 can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", correct: true, rationale: "Correct. Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", correct: true, rationale: "Correct. Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Agency policies define administration safety steps, reconciliation every skilled visit, high-alert handling, education, and error response.", meaning: "CL-SD-012 / 013 is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", action: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", notify: "Notify the supervising RN for a mismatch, unclear order, failed right, adverse finding, error, or near-miss.", document: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p1-knowledge', label: 'Quiz = knowledge', shortLabel: 'Quiz = knowl…', ariaLabel: 'Investigate Quiz = knowledge', x: 68, y: 74, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-3', observe: 'Passing this knowledge check does not alone prove practical medication competency. Skills check-off and RN oversight still apply.', identifyChoices: [{ id: "identify-correct", label: "Quiz = knowledge is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", correct: true, rationale: "Correct. Quiz = knowledge is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree." }, { id: "identify-unsafe", label: "Quiz = knowledge can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", correct: true, rationale: "Correct. Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", correct: true, rationale: "Correct. Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Passing this knowledge check does not alone prove practical medication competency. Skills check-off and RN oversight still apply.", meaning: "Quiz = knowledge is a medication-safety checkpoint in a solo home where the bottle, MAR, order, and Seven Rights must agree.", action: "Compare identifiers, bottle, MAR, and active order; apply all Seven Rights at retrieve, prepare, and administer; hold any unverified dose.", notify: "Notify the supervising RN for a mismatch, unclear order, failed right, adverse finding, error, or near-miss.", document: "Record sources compared, finding, medication/dose, hold or action, RN contact and direction, and patient response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } }] },
{ id: 1, shortName: 'Seven Rights', title: 'The Seven Rights of Medication Administration', subtitle: 'Seven Rights × three verification moments = every administration', narration: ['The Seven Rights are not a checklist you run once. They are a cognitive discipline applied at three separate moments during every medication administration: when you retrieve the medication, when you prepare the dose, and at the point of administration. Three checks, seven rights each check, every time—for all medications, not only high-alert drugs.','Right Patient: verify identity with two identifiers (full name and date of birth). In home health, “I already know this patient” is not a substitute for disciplined verification—especially with cognitive impairment, shared households, or look-alike family members. Right Drug: compare the label to the MAR/order; resolve brand vs generic names; pause on look-alike/sound-alike pairs (for example metFORMIN vs metroNIDAZOLE). If any doubt remains, do not administer—contact the RN or pharmacist pathway per agency process.','Right Dose: match the ordered dose exactly. Recheck calculations for liquids and insulin. If a dose seems unusually high or low for the drug, stop and verify with the RN (and pharmacy/physician as directed) before giving. Right Route: PO, SL, topical, SQ, IM, inhalation, ophthalmic, and others each have technique rules; do not change route without an order. Right Time: administer per schedule and agency timing window (commonly within a 30-minute window of scheduled time where agency policy specifies one); document actual time given. Some drugs have critical timing relative to food or other meds—follow the order and drug-specific instructions. Right Documentation: document immediately after administration (medication, dose, route, actual time, site if injection, response, refusals). Never pre-document or batch-document hours later. Right Reason: confirm the ordered indication is appropriate for this patient and situation; an unclear reason requires a hold and RN clarification before administration.'], keyPoints: [{ icon: "1️⃣", title: "Right patient and medication", detail: "Use two identifiers and compare the bottle with the MAR or active order." }, { icon: "2️⃣", title: "Right dose and route", detail: "Match the exact ordered dose and route; never alter either without verification." }, { icon: "3️⃣", title: "Right time and documentation", detail: "Follow the schedule and document the actual administration immediately afterward." }, { icon: "7️⃣", title: "Right reason completes Seven", detail: "Confirm the ordered indication; unresolved doubt requires a hold and RN notification." }], clinicalTip: "Say the Seven Rights: patient, medication, dose, route, time, documentation, and reason—at retrieve, prepare, and administer.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img02, hotspots: [{ id: 'p2-patient', label: 'Right Patient', shortLabel: 'Right Patient', ariaLabel: 'Investigate Right Patient', x: 18, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0', observe: 'Two identifiers (name + DOB). Verify even for familiar patients; use caregiver/medical ID when cognition is impaired.', identifyChoices: [{ id: "identify-correct", label: "Right Patient is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", correct: true, rationale: "Correct. Right Patient is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments." }, { id: "identify-unsafe", label: "Right Patient can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", correct: true, rationale: "Correct. Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", correct: true, rationale: "Correct. Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Two identifiers (name + DOB). Verify even for familiar patients; use caregiver/medical ID when cognition is impaired.", meaning: "Right Patient is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", action: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", notify: "Notify the RN before administration when any of the Seven Rights cannot be verified.", document: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p2-drug', label: 'Right Drug', shortLabel: 'Right Drug', ariaLabel: 'Investigate Right Drug', x: 38, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-1', observe: 'Label vs MAR/order. Resolve brand/generic and look-alike names before pouring or drawing.', identifyChoices: [{ id: "identify-correct", label: "Right Drug is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", correct: true, rationale: "Correct. Right Drug is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments." }, { id: "identify-unsafe", label: "Right Drug can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", correct: true, rationale: "Correct. Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", correct: true, rationale: "Correct. Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Label vs MAR/order. Resolve brand/generic and look-alike names before pouring or drawing.", meaning: "Right Drug is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", action: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", notify: "Notify the RN before administration when any of the Seven Rights cannot be verified.", document: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p2-dose', label: 'Right Dose', shortLabel: 'Right Dose', ariaLabel: 'Investigate Right Dose', x: 58, y: 35, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'Exact ordered dose; recheck calculations. Unusual doses → stop and verify with RN/pharmacy pathway.', identifyChoices: [{ id: "identify-correct", label: "Right Dose is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", correct: true, rationale: "Correct. Right Dose is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments." }, { id: "identify-unsafe", label: "Right Dose can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", correct: true, rationale: "Correct. Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", correct: true, rationale: "Correct. Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Exact ordered dose; recheck calculations. Unusual doses → stop and verify with RN/pharmacy pathway.", meaning: "Right Dose is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", action: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", notify: "Notify the RN before administration when any of the Seven Rights cannot be verified.", document: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p2-route-time', label: 'Route · Time · Doc', shortLabel: 'Route · Time…', ariaLabel: 'Investigate Route · Time · Doc', x: 80, y: 60, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-3', observe: 'Route only as ordered; time per schedule/agency window; document immediately after giving—never before.', identifyChoices: [{ id: "identify-correct", label: "Route · Time · Doc is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", correct: true, rationale: "Correct. Route · Time · Doc is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments." }, { id: "identify-unsafe", label: "Route · Time · Doc can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", correct: true, rationale: "Correct. Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", correct: true, rationale: "Correct. Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Route only as ordered; time per schedule/agency window; document immediately after giving—never before.", meaning: "Route · Time · Doc is one of the Seven Rights—patient, medication, dose, route, time, documentation, and reason—repeated at three verification moments.", action: "Compare two identifiers, bottle, MAR, and order when retrieving, preparing, and administering; hold if any right fails.", notify: "Notify the RN before administration when any of the Seven Rights cannot be verified.", document: "Document medication, dose, route, actual time, reason, response, refusal/hold, comparison, and RN communication.", policyRefs: ["CL-SD-012", "CL-SD-013"] } }] },
{ id: 2, shortName: 'Reconcile', title: 'Medication Reconciliation Protocol', subtitle: 'Every skilled visit: POC list vs what is actually in the home', narration: ['Medication reconciliation is a systematic comparison of the patient\'s current Plan of Care (POC) medication list against medications actually present and used in the home. Per agency policy CL-SD-013, reconciliation is required at every skilled nursing visit—not only at Start of Care or Discharge. This is not a casual glance at bottles; it is a structured audit that catches discrepancies before they become adverse events.','Process: (1) Obtain the current POC/EHR medication list—drug, dose, route, frequency, prescriber, indication when available. (2) Physically audit the home: kitchen, bathroom, bedroom, purses, nightstands—patients store medications everywhere. Note label name/strength, expiration, quantity remaining, and storage conditions (for example refrigeration for insulin). (3) Side-by-side comparison: flag POC meds missing from home, home meds not on POC (including other providers and OTC/supplements), dose mismatches, expired products, and duplicate therapies. (4) Document every discrepancy with specifics. (5) Notify the RN of all discrepancies—do not independently decide which ones “matter.”','Watch for clinically important interaction patterns the patient may not recognize: anticoagulant + NSAID/aspirin/supplements with bleeding risk; oral hypoglycemics with poor intake; ACE inhibitor + potassium supplements. Your job is to find, document, and escalate—not to independently redesign the regimen.'], keyPoints: [{ icon: "📋", title: "Every skilled visit", detail: "Complete medication reconciliation at every skilled nursing visit under CL-SD-013." }, { icon: "🔎", title: "Compare every source", detail: "Compare the POC/EHR list or MAR, active orders, bottles, and reported use." }, { icon: "⚠️", title: "Name every discrepancy", detail: "Capture missing, extra, duplicate, expired, wrong-dose, OTC, supplement, and storage findings." }, { icon: "📞", title: "Resolve through the RN", detail: "Hold affected administration, notify the RN, and document direction." }], clinicalTip: "Reconcile at every skilled visit; “meds reviewed” is not enough when bottles, orders, or actual use differ.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img03, hotspots: [{ id: 'p3-poc', label: 'POC list', shortLabel: 'POC list', ariaLabel: 'Investigate POC list', x: 20, y: 32, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-0', observe: 'Start from the current EHR/POC medication list—your reference standard for comparison.', identifyChoices: [{ id: "identify-correct", label: "POC list is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", correct: true, rationale: "Correct. POC list is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use." }, { id: "identify-unsafe", label: "POC list can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", correct: true, rationale: "Correct. Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", correct: true, rationale: "Correct. Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Start from the current EHR/POC medication list—your reference standard for comparison.", meaning: "POC list is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", action: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", notify: "Notify the RN during the visit about every discrepancy; escalate symptoms or high-alert risk urgently.", document: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", policyRefs: ["CL-SD-013", "CL-SD-012", "RM-PS-005"] } },{ id: 'p3-audit', label: 'Home audit', shortLabel: 'Home audit', ariaLabel: 'Investigate Home audit', x: 48, y: 52, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-1', observe: 'Inspect all storage locations. Note name, strength, expiration, quantity, and storage conditions.', identifyChoices: [{ id: "identify-correct", label: "Home audit is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", correct: true, rationale: "Correct. Home audit is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use." }, { id: "identify-unsafe", label: "Home audit can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", correct: true, rationale: "Correct. Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", correct: true, rationale: "Correct. Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Inspect all storage locations. Note name, strength, expiration, quantity, and storage conditions.", meaning: "Home audit is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", action: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", notify: "Notify the RN during the visit about every discrepancy; escalate symptoms or high-alert risk urgently.", document: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", policyRefs: ["CL-SD-013", "CL-SD-012", "RM-PS-005"] } },{ id: 'p3-flag', label: 'Discrepancies', shortLabel: 'Discrepancies', ariaLabel: 'Investigate Discrepancies', x: 75, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'Missing, extra, wrong dose, expired, duplicates, OTC/supplements not on list—document each with specifics.', identifyChoices: [{ id: "identify-correct", label: "Discrepancies is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", correct: true, rationale: "Correct. Discrepancies is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use." }, { id: "identify-unsafe", label: "Discrepancies can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", correct: true, rationale: "Correct. Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", correct: true, rationale: "Correct. Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Missing, extra, wrong dose, expired, duplicates, OTC/supplements not on list—document each with specifics.", meaning: "Discrepancies is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", action: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", notify: "Notify the RN during the visit about every discrepancy; escalate symptoms or high-alert risk urgently.", document: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", policyRefs: ["CL-SD-013", "CL-SD-012", "RM-PS-005"] } },{ id: 'p3-rn', label: 'Notify RN', shortLabel: 'Notify RN', ariaLabel: 'Investigate Notify RN', x: 70, y: 72, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-3', observe: 'Report all discrepancies to the supervising RN. Do not triage “minor” findings into silence.', identifyChoices: [{ id: "identify-correct", label: "Notify RN is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", correct: true, rationale: "Correct. Notify RN is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use." }, { id: "identify-unsafe", label: "Notify RN can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", correct: true, rationale: "Correct. Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", correct: true, rationale: "Correct. Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Report all discrepancies to the supervising RN. Do not triage “minor” findings into silence.", meaning: "Notify RN is part of reconciliation required at every skilled visit, comparing MAR/POC and active orders with bottles and actual use.", action: "Complete the side-by-side comparison, identify the discrepancy, hold affected administration, and obtain RN direction.", notify: "Notify the RN during the visit about every discrepancy; escalate symptoms or high-alert risk urgently.", document: "Record bottle label, MAR/order, actual use, discrepancy, assessment, hold, RN direction, teaching, and status.", policyRefs: ["CL-SD-013", "CL-SD-012", "RM-PS-005"] } }] },
{ id: 3, shortName: 'High Alert', title: 'High-Alert Medications', subtitle: 'Heightened harm potential — zero casual handling', narration: ['High-alert medications are drugs that carry a heightened risk of significant patient harm when used in error. The Institute for Safe Medication Practices (ISMP) maintains widely used high-alert lists—professional guidance that informs agency practice. In home health, five categories account for many serious medication-related events: anticoagulants, insulin, opioids, cardiac glycosides (digoxin), and oral hypoglycemics such as metformin.','Per agency policy CL-SD-012 high-alert expectations: verify against the EHR/order, verify against the medication label, and re-verify at the point of administration. Any uncertainty means do not administer—contact the RN immediately. There is no “I will ask later” for high-alert drugs. Independent double-nurse check is often unavailable in the home; your disciplined triple verification and early escalation replace institutional second checks.','Anticoagulants (warfarin and others): assess for bleeding signs each visit; reconcile for NSAIDs, aspirin, antibiotics, and supplements; educate on consistent vitamin K intake when relevant; report new meds from other providers. Therapeutic INR targets are indication-specific and set by the ordering practitioner—use the ordered parameters and available lab results; do not invent a universal INR “rule.” Insulin: check glucose before administration when ordered/appropriate; read the full label (type/concentration); use insulin-specific syringes/devices; rotate sites; hold and notify per ordered parameters when glucose is below hold thresholds (commonly <70 mg/dL when ordered as such). Opioids: assess pain, respiratory rate, sedation, and bowel function; confirm naloxone availability when prescribed; count controlled substances per CL-SD-012 controlled-substance procedures and report count discrepancies immediately.'], keyPoints: [{ icon: "⚠️", title: "High-alert harm potential", detail: "Anticoagulants, insulin, opioids, digoxin, and hypoglycemics require heightened vigilance." }, { icon: "🔁", title: "Order–label–patient verification", detail: "Verify the active order, bottle or device label, and point of administration." }, { icon: "🧭", title: "Use ordered parameters", detail: "Assess drug-specific findings and follow patient-specific hold parameters." }, { icon: "🛑", title: "Uncertainty is a hard stop", detail: "Hold, notify the RN immediately, and document the failed check." }], clinicalTip: "For high-alert medication, familiarity never replaces order–label–point-of-administration verification.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img04, hotspots: [{ id: 'p4-warfarin', label: 'Anticoagulants', shortLabel: 'Anticoagulants', ariaLabel: 'Investigate Anticoagulants', x: 18, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0', observe: 'Bleeding assessment, interaction recon (NSAIDs/OTC), educate consistency, escalate new meds—use ordered INR targets.', identifyChoices: [{ id: "identify-correct", label: "Anticoagulants is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", correct: true, rationale: "Correct. Anticoagulants is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification." }, { id: "identify-unsafe", label: "Anticoagulants can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", correct: true, rationale: "Correct. Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", correct: true, rationale: "Correct. Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Bleeding assessment, interaction recon (NSAIDs/OTC), educate consistency, escalate new meds—use ordered INR targets.", meaning: "Anticoagulants is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", action: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", notify: "Notify the RN immediately for failed verification, a hold parameter, adverse symptoms, or count discrepancy.", document: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p4-insulin', label: 'Insulin', shortLabel: 'Insulin', ariaLabel: 'Investigate Insulin', x: 40, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1', observe: 'Confirm type/concentration, glucose before dose when indicated, correct device, hold per ordered low-glucose parameters.', identifyChoices: [{ id: "identify-correct", label: "Insulin is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", correct: true, rationale: "Correct. Insulin is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification." }, { id: "identify-unsafe", label: "Insulin can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", correct: true, rationale: "Correct. Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", correct: true, rationale: "Correct. Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Confirm type/concentration, glucose before dose when indicated, correct device, hold per ordered low-glucose parameters.", meaning: "Insulin is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", action: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", notify: "Notify the RN immediately for failed verification, a hold parameter, adverse symptoms, or count discrepancy.", document: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p4-opioids', label: 'Opioids', shortLabel: 'Opioids', ariaLabel: 'Investigate Opioids', x: 62, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-2', observe: 'Pain, RR, sedation, bowels; naloxone if prescribed; controlled-count per policy; report count discrepancies now.', identifyChoices: [{ id: "identify-correct", label: "Opioids is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", correct: true, rationale: "Correct. Opioids is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification." }, { id: "identify-unsafe", label: "Opioids can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", correct: true, rationale: "Correct. Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", correct: true, rationale: "Correct. Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Pain, RR, sedation, bowels; naloxone if prescribed; controlled-count per policy; report count discrepancies now.", meaning: "Opioids is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", action: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", notify: "Notify the RN immediately for failed verification, a hold parameter, adverse symptoms, or count discrepancy.", document: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p4-digoxin', label: 'Digoxin / OHAs', shortLabel: 'Digoxin / OHAs', ariaLabel: 'Investigate Digoxin / OHAs', x: 82, y: 62, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-3', observe: 'Digoxin: full 60-sec apical pulse; hold/notify per order. Oral hypoglycemics: food, glucose monitoring, serious-illness red flags.', identifyChoices: [{ id: "identify-correct", label: "Digoxin / OHAs is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", correct: true, rationale: "Correct. Digoxin / OHAs is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification." }, { id: "identify-unsafe", label: "Digoxin / OHAs can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", correct: true, rationale: "Correct. Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", correct: true, rationale: "Correct. Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Digoxin: full 60-sec apical pulse; hold/notify per order. Oral hypoglycemics: food, glucose monitoring, serious-illness red flags.", meaning: "Digoxin / OHAs is a high-alert checkpoint requiring drug-specific assessment and order–label–point-of-administration verification.", action: "Apply ordered parameters, compare the MAR/order with the bottle or device, and hold immediately if a check fails.", notify: "Notify the RN immediately for failed verification, a hold parameter, adverse symptoms, or count discrepancy.", document: "Document assessment, parameters, verification, medication/dose/route/time, administration or hold, direction, and response.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } }] },
{ id: 4, shortName: 'Teach-Back', title: 'Patient Education & Teach-Back', subtitle: 'Confirm understanding — do not accept a polite “yes”', narration: ['Medication education is not merely telling patients about their drugs—it is verifying understanding. Teach-back is the gold-standard method for confirming comprehension and is required by agency policy CL-SD-012 for medication-related education. Many errors between visits occur because the patient did not understand purpose, side effects, technique, or how to remember the regimen.','Teach-back is not asking “Do you understand?” (patients usually say yes). Teach-back is asking the patient to explain or demonstrate in their own words or actions: “Tell me how you take your warfarin,” or “Show me how you prepare your insulin.” Chunk complex regimens: teach 2–3 medications, teach-back, then continue—spread education across visits when needed.','Four education domains: (1) Purpose—why this drug for this patient, in plain language. (2) Side effects—focus on actionable warning signs that require calling the clinician (for example bleeding signs on anticoagulants). (3) Technique—with/without food, injection site rotation, inhaler steps; have the patient demonstrate. (4) Adherence—pill organizers, alarms, routine linking, caregiver help, refill planning; identify barriers such as cost, side effects, cognition, or regimen complexity.'], keyPoints: [{ icon: "🗣️", title: "Teach-back, not yes/no", detail: "Ask the patient or caregiver to explain or demonstrate medication use." }, { icon: "🎯", title: "Teach medication purpose", detail: "Connect the right reason to the patient’s condition in plain language." }, { icon: "⚠️", title: "Make warnings actionable", detail: "Teach which effects require a call, urgent assessment, or emergency response." }, { icon: "📝", title: "Document learning evidence", detail: "Record topic, method, teach-back response, gaps, remediation, and notification." }], clinicalTip: "Teach-back succeeds only when the patient or caregiver accurately explains or demonstrates the medication plan.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img05, hotspots: [{ id: 'p5-purpose', label: 'Purpose', shortLabel: 'Purpose', ariaLabel: 'Investigate Purpose', x: 22, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-0', observe: 'Plain-language “why.” Teach-back: “Tell me what this medication does for you.”', identifyChoices: [{ id: "identify-correct", label: "Purpose is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", correct: true, rationale: "Correct. Purpose is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding." }, { id: "identify-unsafe", label: "Purpose can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", correct: true, rationale: "Correct. Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", correct: true, rationale: "Correct. Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Plain-language “why.” Teach-back: “Tell me what this medication does for you.”", meaning: "Purpose is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", action: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", notify: "Notify the RN when misunderstanding, unsafe technique, symptoms, barriers, or order conflicts threaten safe use.", document: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p5-side', label: 'Side effects', shortLabel: 'Side effects', ariaLabel: 'Investigate Side effects', x: 48, y: 28, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-1', observe: 'Actionable warning signs and when to call—not a dump of every rare effect.', identifyChoices: [{ id: "identify-correct", label: "Side effects is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", correct: true, rationale: "Correct. Side effects is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding." }, { id: "identify-unsafe", label: "Side effects can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", correct: true, rationale: "Correct. Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", correct: true, rationale: "Correct. Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Actionable warning signs and when to call—not a dump of every rare effect.", meaning: "Side effects is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", action: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", notify: "Notify the RN when misunderstanding, unsafe technique, symptoms, barriers, or order conflicts threaten safe use.", document: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p5-tech', label: 'Technique', shortLabel: 'Technique', ariaLabel: 'Investigate Technique', x: 72, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-2', observe: 'Show-me verification for injections, inhalers, eye drops, and special oral instructions.', identifyChoices: [{ id: "identify-correct", label: "Technique is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", correct: true, rationale: "Correct. Technique is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding." }, { id: "identify-unsafe", label: "Technique can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", correct: true, rationale: "Correct. Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", correct: true, rationale: "Correct. Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Show-me verification for injections, inhalers, eye drops, and special oral instructions.", meaning: "Technique is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", action: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", notify: "Notify the RN when misunderstanding, unsafe technique, symptoms, barriers, or order conflicts threaten safe use.", document: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", policyRefs: ["CL-SD-012", "CL-SD-013"] } },{ id: 'p5-adhere', label: 'Adherence', shortLabel: 'Adherence', ariaLabel: 'Investigate Adherence', x: 55, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-3', observe: 'Memory aids, caregiver support, barriers (cost, side effects, cognition). Plan realistic routines.', identifyChoices: [{ id: "identify-correct", label: "Adherence is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", correct: true, rationale: "Correct. Adherence is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding." }, { id: "identify-unsafe", label: "Adherence can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", correct: true, rationale: "Correct. Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", correct: true, rationale: "Correct. Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Memory aids, caregiver support, barriers (cost, side effects, cognition). Plan realistic routines.", meaning: "Adherence is a medication teach-back domain requiring the patient or caregiver to explain or demonstrate understanding.", action: "Teach patient-specific information in plain language, request explanation or demonstration, correct gaps, and repeat teach-back.", notify: "Notify the RN when misunderstanding, unsafe technique, symptoms, barriers, or order conflicts threaten safe use.", document: "Document medication/topic, learner, method, exact teach-back, gap, remediation, RN contact, and outcome.", policyRefs: ["CL-SD-012", "CL-SD-013"] } }] },
{ id: 5, shortName: 'Hold Notify', title: 'Medication Error Prevention & Classification', subtitle: 'Knowledge, performance, and system vulnerabilities', narration: ['Medication errors rarely have a single cause. Safety science describes layered defenses (often called the Swiss cheese model): when holes align, an error reaches the patient. Understanding error types helps you build personal safeguards and report system weaknesses.','Type A — Knowledge-based: you do not know something you should (unfamiliar drug, dose range, interaction, technique). Prevention: look up unfamiliar drugs before administration; ask RN/pharmacy when knowledge is incomplete. Type B — Performance-based: you know the right action but fail to execute it (skipped verification under time pressure, misread label 10 mg vs 100 mg, similar bottles). Prevention: slow down, use adequate lighting, eliminate distractions during preparation; if interrupted, start over. Type C — System-based: look-alike packaging, unclear orders, communication failures between providers, rushed schedules. Prevention: report vulnerabilities and near-misses through the QA pathway so leadership can fix systems.','A near-miss is an error caught before it reaches the patient (wrong bottle noticed, calculation corrected, interaction recognized in time). Near-misses should be reported—not ignored. Reporting is a safety practice, not a request for punishment. Agency policy expects transparent reporting so vulnerabilities can be fixed before harm occurs.'], keyPoints: [{ icon: "🧠", title: "Knowledge risk", detail: "Look up unfamiliar medication, dose, interaction, or technique before administration." }, { icon: "⏸️", title: "Performance risk", detail: "After interruption, restart preparation and Seven Rights verification." }, { icon: "🧩", title: "System risk", detail: "Escalate unclear orders, look-alike bottles, handoff failures, and unsafe conditions." }, { icon: "🛡️", title: "Report every near-miss", detail: "Hold, notify, document, and report a caught error under RM-PS-005." }], clinicalTip: "A near-miss is a safety catch only when it is held, communicated, documented, and reported.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img06, hotspots: [{ id: 'p6-typea', label: 'Type A', shortLabel: 'Type A', ariaLabel: 'Investigate Type A', x: 22, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-0', observe: 'Knowledge gaps. Never administer an unfamiliar medication without a drug reference and clarification path.', identifyChoices: [{ id: "identify-correct", label: "Type A is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", correct: true, rationale: "Correct. Type A is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event." }, { id: "identify-unsafe", label: "Type A can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", correct: true, rationale: "Correct. Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", correct: true, rationale: "Correct. Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Knowledge gaps. Never administer an unfamiliar medication without a drug reference and clarification path.", meaning: "Type A is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", action: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", notify: "Notify the RN promptly; use chain of command and emergency response if exposure or harm is possible.", document: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p6-typeb', label: 'Type B', shortLabel: 'Type B', ariaLabel: 'Investigate Type B', x: 50, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-1', observe: 'Performance slips under pressure. Interruptions → restart preparation from the beginning.', identifyChoices: [{ id: "identify-correct", label: "Type B is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", correct: true, rationale: "Correct. Type B is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event." }, { id: "identify-unsafe", label: "Type B can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", correct: true, rationale: "Correct. Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", correct: true, rationale: "Correct. Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Performance slips under pressure. Interruptions → restart preparation from the beginning.", meaning: "Type B is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", action: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", notify: "Notify the RN promptly; use chain of command and emergency response if exposure or harm is possible.", document: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p6-typec', label: 'Type C', shortLabel: 'Type C', ariaLabel: 'Investigate Type C', x: 78, y: 42, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-2', observe: 'System traps: look-alikes, unclear orders, handoff failures. Report so the system can improve.', identifyChoices: [{ id: "identify-correct", label: "Type C is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", correct: true, rationale: "Correct. Type C is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event." }, { id: "identify-unsafe", label: "Type C can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", correct: true, rationale: "Correct. Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", correct: true, rationale: "Correct. Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "System traps: look-alikes, unclear orders, handoff failures. Report so the system can improve.", meaning: "Type C is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", action: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", notify: "Notify the RN promptly; use chain of command and emergency response if exposure or harm is possible.", document: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } },{ id: 'p6-near', label: 'Near-miss', shortLabel: 'Near-miss', ariaLabel: 'Investigate Near-miss', x: 55, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-3', observe: 'Caught before patient impact → report through QA as a positive safety catch, not something to hide.', identifyChoices: [{ id: "identify-correct", label: "Near-miss is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", correct: true, rationale: "Correct. Near-miss is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event." }, { id: "identify-unsafe", label: "Near-miss can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", correct: true, rationale: "Correct. Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", correct: true, rationale: "Correct. Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Caught before patient impact → report through QA as a positive safety catch, not something to hide.", meaning: "Near-miss is an error-prevention signal requiring hold-notify-document and RM-PS-005 reporting for a near-miss or event.", action: "Hold and secure the medication, compare bottle/MAR/order, restart checks when appropriate, notify, document, and report.", notify: "Notify the RN promptly; use chain of command and emergency response if exposure or harm is possible.", document: "Record medication and hazard, exposure assessment, hold, RN direction, corrective action, and QA report completion.", policyRefs: ["CL-SD-012", "CL-SD-013", "RM-PS-005"] } }] },
{ id: 6, shortName: 'Practice', title: 'Error Response & Module Summary', subtitle: 'STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT', narration: ['Despite strong prevention, medication errors or suspected errors can still occur. When they do, response must be immediate, systematic, and transparent. Agency policy CL-SD-012 error-response expectations apply whether or not harm is obvious. “No harm” events still require full protocol because they reveal process vulnerabilities.','Sequence: (1) STOP — cease medication administration; secure remaining medications; do not “fix” the error with unsolicited extra doses. (2) ASSESS — vital signs and symptoms related to the specific error; clarify what was given versus what was ordered (drug, dose, route, time). (3) NOTIFY — supervising RN immediately; physician per RN direction or directly if RN unavailable per agency escalation; pharmacy for drug-specific guidance when appropriate. Provide patient identity, what was given vs ordered, vitals, and symptoms. (4) INTERVENE — within LVN scope and only per RN/physician direction (monitoring, positioning, ordered antidotes if competent and ordered—for example naloxone when ordered and available). Do not leave the patient until directed regarding monitoring level. (5) DOCUMENT — visit note narrative plus formal incident/QA entry. (6) REPORT — submit the QA incident report same day per agency policy; participate honestly in root-cause review. RCA aims to improve systems, not to replace accountability for concealment.','Never conceal a medication error. Concealment is typically a terminable offense under agency HR policy and can convert a clinical event into a trust and legal crisis. Late reporting is always better than no reporting.'], keyPoints: [{ icon: "🛑", title: "STOP and secure", detail: "Cease administration and secure medication; do not improvise a corrective dose." }, { icon: "🩺", title: "ASSESS the patient", detail: "Obtain relevant vitals, symptoms, and exact medication given versus ordered." }, { icon: "📞", title: "NOTIFY and intervene", detail: "Contact the RN immediately and follow practitioner, pharmacy, or emergency direction." }, { icon: "📝", title: "DOCUMENT and REPORT", detail: "Chart objective facts and complete the same-day incident/QA report." }], clinicalTip: "After an error: stop, assess, notify, intervene as directed, document, and report.", sourceLabels: [{ kind: "Agency Policy", text: "CL-SD-012" }, { kind: "Agency Policy", text: "CL-SD-013" }, { kind: "Agency Policy", text: "RM-PS-005" }], sceneImage: img07, hotspots: [{ id: 'p7-stop', label: 'STOP', shortLabel: 'STOP', ariaLabel: 'Investigate STOP', x: 16, y: 45, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-0', observe: 'First action always: stop administration and secure remaining medications.', identifyChoices: [{ id: "identify-correct", label: "STOP is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", correct: true, rationale: "Correct. STOP is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT." }, { id: "identify-unsafe", label: "STOP can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", correct: true, rationale: "Correct. Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", correct: true, rationale: "Correct. Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "First action always: stop administration and secure remaining medications.", meaning: "STOP is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", action: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", notify: "Notify the RN immediately; follow practitioner/pharmacy direction and call emergency services for emergent findings.", document: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", policyRefs: ["CL-SD-012", "RM-PS-005"] } },{ id: 'p7-assess', label: 'ASSESS', shortLabel: 'ASSESS', ariaLabel: 'Investigate ASSESS', x: 34, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-1', observe: 'Vitals, symptoms, and exact given-vs-ordered reconstruction.', identifyChoices: [{ id: "identify-correct", label: "ASSESS is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", correct: true, rationale: "Correct. ASSESS is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT." }, { id: "identify-unsafe", label: "ASSESS can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", correct: true, rationale: "Correct. Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", correct: true, rationale: "Correct. Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Vitals, symptoms, and exact given-vs-ordered reconstruction.", meaning: "ASSESS is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", action: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", notify: "Notify the RN immediately; follow practitioner/pharmacy direction and call emergency services for emergent findings.", document: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", policyRefs: ["CL-SD-012", "RM-PS-005"] } },{ id: 'p7-notify', label: 'NOTIFY', shortLabel: 'NOTIFY', ariaLabel: 'Investigate NOTIFY', x: 52, y: 45, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-2', observe: 'RN immediately; physician/pharmacy per agency escalation and clinical need.', identifyChoices: [{ id: "identify-correct", label: "NOTIFY is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", correct: true, rationale: "Correct. NOTIFY is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT." }, { id: "identify-unsafe", label: "NOTIFY can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", correct: true, rationale: "Correct. Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", correct: true, rationale: "Correct. Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "RN immediately; physician/pharmacy per agency escalation and clinical need.", meaning: "NOTIFY is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", action: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", notify: "Notify the RN immediately; follow practitioner/pharmacy direction and call emergency services for emergent findings.", document: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", policyRefs: ["CL-SD-012", "RM-PS-005"] } },{ id: 'p7-doc', label: 'DOC / REPORT', shortLabel: 'DOC / REPORT', ariaLabel: 'Investigate DOC / REPORT', x: 78, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-3', observe: 'Visit narrative + incident/QA report same day. Honest RCA participation. Never conceal.', identifyChoices: [{ id: "identify-correct", label: "DOC / REPORT is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", correct: true, rationale: "Correct. DOC / REPORT is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT." }, { id: "identify-unsafe", label: "DOC / REPORT can be accepted without the medication-specific verification or safety pathway.", correct: false, rationale: "Unsafe. Use the applicable bottle/MAR/order, reconciliation, high-alert, teach-back, hold-notify-document, or error-response safeguard." }],
        decideChoices: [{ id: "decide-correct", label: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", correct: true, rationale: "Correct. Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention." }, { id: "decide-unsafe", label: "Proceed with the medication and ask about the mismatch or safety concern after the visit.", correct: false, rationale: "Unsafe. An unresolved medication concern requires a hold and timely RN notification." }],
        documentChoices: [{ id: "document-correct", label: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", correct: true, rationale: "Correct. Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report." }, { id: "document-unsafe", label: "Chart only “medications reviewed” or “given as ordered” without comparison, assessment, notification, or response.", correct: false, rationale: "Insufficient. Preserve patient-specific facts, actions, communication, and outcome." }], feedback: { observed: "Visit narrative + incident/QA report same day. Honest RCA participation. Never conceal.", meaning: "DOC / REPORT is a required step in STOP → ASSESS → NOTIFY → INTERVENE → DOCUMENT → REPORT.", action: "Stop, secure medication, assess ordered versus given and patient status, notify immediately, and follow directed intervention.", notify: "Notify the RN immediately; follow practitioner/pharmacy direction and call emergency services for emergent findings.", document: "Document ordered versus given details, assessments, contacts, directions, interventions, response, and QA report.", policyRefs: ["CL-SD-012", "RM-PS-005"] } }] }
];

const QUIZ: QuizQuestion[] = [
{ id: 1, stem: 'Which option correctly names the Seven Rights and their three verification moments?', options: ['Patient, medication, dose, route, time, documentation, and reason—verified when retrieving, preparing, and administering','Patient, medication, dose, route, time, allergy, and signature—verified once after administration','Patient, medication, dose, route, time, documentation, and reason—verified only for high-alert medications','Patient, medication, dose, route, time, documentation, and reason—verified when documenting after the visit'], correct: 0, rationale: 'The Seven Rights are patient, medication, dose, route, time, documentation, and reason. Verify all seven when retrieving, preparing, and administering every medication; high-alert safeguards add to, not replace, these checks.' },
{ id: 2, stem: 'What is the teach-back method, and why is it required for medication education?', options: ['Asking “Do you understand?” so the patient can confirm with yes/no','Having the patient explain or demonstrate in their own words/actions to verify actual comprehension','Repeating the same monologue every visit until the patient memorizes it','Handing written materials and obtaining a signature that materials were received'], correct: 1, rationale: 'Teach-back requires explanation or demonstration. Yes/no questions and signatures alone do not prove comprehension. Agency policy CL-SD-012 expects teach-back for medication-related education.' },
{ id: 3, stem: 'During reconciliation you find OTC ibuprofen in the home of a patient on warfarin; ibuprofen is not on the POC. What is the correct LVN action?', options: ['Document the finding and notify the RN immediately because of bleeding-risk interaction potential','Tell the patient to permanently stop ibuprofen on your own authority','Ignore OTC products because only prescription drugs count in reconciliation','Add ibuprofen to the POC medication list yourself without RN/physician involvement'], correct: 0, rationale: 'NSAID + anticoagulant is a significant bleeding-risk pattern. Document and notify the RN. The LVN does not independently discontinue therapies or edit the POC medication list; order changes require the proper practitioner pathway.' },
{ id: 4, stem: 'Before administering digoxin, what assessment is expected, and what should you do if the hold parameter is met?', options: ['Check blood pressure only; hold if systolic is under 100 and give the dose later without notice','Take apical pulse for a full 60 seconds; hold if below the ordered parameter (commonly <60 BPM when so ordered) and notify RN/physician before giving','Check respiratory rate only; hold if under 12 and document without notification','Check capillary blood glucose; hold if under 70 and crush the digoxin into food'], correct: 1, rationale: 'Digoxin requires a full 60-second apical pulse. Hold and notify per ordered parameters (commonly <60 BPM when ordered). Do not invent substitute assessments or silent holds.' },
{ id: 5, stem: 'What is the first step in the medication error response protocol?', options: ['Document the event in the visit note before doing anything else','Notify the supervising RN before securing medications','Assess vital signs while continuing other medication administrations','STOP all medication administration and secure remaining medications'], correct: 3, rationale: 'STOP is first: cease administration and secure remaining medications. ASSESS, NOTIFY, INTERVENE, DOCUMENT, and REPORT follow in sequence.' },
{ id: 6, stem: 'Per agency medication reconciliation expectations referenced in this module, reconciliation must be performed:', options: ['Only at Start of Care and Discharge','At every skilled nursing visit','Once per calendar month regardless of visit frequency','Only when the patient volunteers that a medication changed'], correct: 1, rationale: 'CL-SD-013 requires medication reconciliation at every skilled nursing visit so discrepancies between the POC list and home use are caught between visits—not only at admission or discharge.' },
{ id: 7, stem: 'What makes home health medication administration uniquely high-risk compared with many hospital settings?', options: ['Home health patients always take fewer medications than inpatients','Home health always has better bedside barcode verification than hospitals','You are often alone—no second nurse check, no bedside pharmacy verification, delayed discovery, and delayed on-site emergency response','Home health patients are uniformly lower acuity and need less vigilance'], correct: 2, rationale: 'Solo practice, patient-managed supply, intermittent monitoring, and delayed emergency resources increase reliance on personal verification discipline and early escalation.' },
{ id: 8, stem: 'A near-miss medication event (caught before reaching the patient) should be:', options: ['Reported through the agency QA/incident pathway as a safety catch so vulnerabilities can be fixed','Ignored because no harm occurred and reporting would only create paperwork','Mentioned informally to a coworker but never entered into any system','Reported only if a supervisor specifically asks about it weeks later'], correct: 0, rationale: 'Near-miss reporting is a core safety practice. Events caught early reveal system and process holes before patients are harmed. Silence removes the chance to improve.' },
{ id: 9, stem: 'You are interrupted while preparing a medication. What is the correct action?', options: ['Continue from memory at the exact step where you stopped','Ask the patient to remind you which tablets you already counted','Start the entire preparation and verification process over from the beginning','Administer whatever is already poured to avoid “wasting” time'], correct: 2, rationale: 'Interruptions drive performance errors. Restarting preparation and Seven Rights verification is safer than reconstructing incomplete steps from memory.' },
{ id: 10, stem: 'Which three questions best open reconciliation discussions at visits (in addition to the physical medication audit)?', options: ['“Are you taking your medications? Do they work? Do you have enough?” only','“Do you need refills? Are you having side effects? Can you afford your medications?” only','“Did you take every dose today? What time? Did you miss any?” only','“Have any medications changed? Have you seen other doctors? Have you started any OTC medications or supplements?”'], correct: 3, rationale: 'Change of meds, other prescribers, and new OTC/supplements commonly introduce unlisted therapies and interactions. They complement—not replace—the physical home audit. Other questions may be useful clinically but are not the primary reconciliation triad taught here.' }
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
  .lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}
  .lvn002-tabs{scrollbar-width:thin}.lvn002-tabs::-webkit-scrollbar{display:block;height:4px}
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


const STORAGE_KEY = 'lvn-006-progress-v5414';

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

/** Static approved Care Indeed mark (non-interactive, non-animated) */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt="Care Indeed"
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN006() {
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
          <BrandMark size={32} />
          <span className="brand-text">LVN-006 — Medication</span>
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
