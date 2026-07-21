/**
 * LVN-007 — Wound Care
 * v5.4.2-PASS5 | Observe→Identify→Decide→Document→Feedback→Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-007/lesson-01-wound-scope.png';
import img02 from './assets/lvn-007/lesson-02-classify.png';
import img03 from './assets/lvn-007/lesson-03-measure.png';
import img04 from './assets/lvn-007/lesson-04-dressing.png';
import img05 from './assets/lvn-007/lesson-05-infection.png';
import img06 from './assets/lvn-007/lesson-06-escalate.png';
import img07 from './assets/lvn-007/lesson-07-practice.png';


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

const MODULE_META = { id: 'LVN-007', title: 'Wound Care', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'De-identified LVN wound-care scene with a non-graphic simulated wound, lifted clean dressing, and visible tissue-layer teaching anchors.',
  'Four de-identified synthetic wound pattern pads show observation boundaries for pressure, venous, arterial, and neuropathic findings.',
  'De-identified wound model measured with a plain ruler and sterile applicator for size, depth, drainage, and granulation anchors.',
  'Unlabeled ordered wound-dressing supplies arranged on a sterile tray with hydrogel, foam, alginate or hydrofiber, and a blank order reference.',
  'Four de-identified wound-model snapshots show baseline, early change, stalled drainage and periwound concern, and improving granulation.',
  'De-identified wound model shows location, measurement, wound bed, drainage, and subtle periwound infection-change cues for RN notification.',
  'De-identified wound-care workflow shows assessment, objective measurement, ordered dressing application, and blank documentation tools.',
] as const;

const PAGES: PageData[] = [
{ id: 0, shortName: 'Wound Scope', title: 'Wound Anatomy & LVN Scope Boundaries', subtitle: 'Assess · Measure · Document · Report — within CA B&P § 2859', narration: ['Welcome to Module LVN-007: Wound Care within LVN Scope. This module defines what you can and cannot do when caring for patients with wounds in home health under California Business and Professions Code § 2859 and federal plan-of-care requirements at 42 CFR § 484.60. Agency wound-care clinical standards are operationalized in policy CL-SD-011.','As a Licensed Vocational Nurse, you are a critical member of the wound care team. Your role centers on assessment observations, measurement, documentation, and timely reporting. You perform wound care procedures as delegated by the RN case manager or physician and only as ordered on the established Plan of Care. You do not independently change wound care orders, perform sharp debridement, diagnose, prescribe, complete OASIS, or develop or modify the Plan of Care.','Pressure-injury staging systems (for example NPIAP stages) are clinical classification tools. Know what tissue findings mean so you can describe them accurately. Formal stage assignment, when required by agency policy or the comprehensive assessment process, is completed by the RN or other authorized clinician. Your job is precise description of what you see, consistent measurements, and immediate escalation when findings change or fall outside ordered care.'], keyPoints: [{ icon: '👁️', title: 'Core LVN role', detail: 'Observe, measure, document, report, and apply ordered wound care under RN/physician direction.' },{ icon: '🚫', title: 'Outside independent scope', detail: 'No independent order changes, sharp debridement, POC/OASIS completion, diagnosis, or prescribing.' },{ icon: '📜', title: 'Regulatory anchors', detail: 'Federal CoP plan of care: 42 CFR § 484.60. CA practice: B&P § 2859. Agency: CL-SD-011.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img01, hotspots: [{ id: 'epidermis', label: 'Epidermis', shortLabel: 'Epidermis', ariaLabel: 'Investigate Epidermis', x: 50, y: 18, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-0', observe: 'Outermost layer. Assess color, temperature, moisture, and turgor of intact skin and wound margins.', identifyChoices: [
          { id: 'i1', label: 'Epidermis: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Outermost layer. Assess color, temperature, moisture, and turgor of intact skin and wound margins.', meaning: 'Epidermis under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'dermis', label: 'Dermis', shortLabel: 'Dermis', ariaLabel: 'Investigate Dermis', x: 50, y: 32, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-1', observe: 'Vessels, nerves, appendages. Note capillary refill, sensation, and partial-thickness tissue loss when present.', identifyChoices: [
          { id: 'i1', label: 'Dermis: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Vessels, nerves, appendages. Note capillary refill, sensation, and partial-thickness tissue loss when present.', meaning: 'Dermis under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'subcut', label: 'Subcutis', shortLabel: 'Subcutis', ariaLabel: 'Investigate Subcutis', x: 50, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-2', observe: 'Adipose tissue. Measure depth; check for undermining/tunneling with sterile technique per order and policy.', identifyChoices: [
          { id: 'i1', label: 'Subcutis: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Adipose tissue. Measure depth; check for undermining/tunneling with sterile technique per order and policy.', meaning: 'Subcutis under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'fascia', label: 'Fascia', shortLabel: 'Fascia', ariaLabel: 'Investigate Fascia', x: 50, y: 64, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-1', observe: 'Exposed fascia is a major change. Cover protectively per protocol, stop further probing, notify RN promptly.', identifyChoices: [
          { id: 'i1', label: 'Fascia: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Exposed fascia is a major change. Cover protectively per protocol, stop further probing, notify RN promptly.', meaning: 'Fascia under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 1, shortName: 'Classify', title: 'Wound Classification & Assessment', subtitle: 'Recognize patterns; escalate etiology-specific needs', narration: ['Home health patients commonly present with four wound pattern groups, each with distinct etiologies, presentations, and treatment pathways. Recognizing these patterns helps you escalate appropriately so the right ordered interventions reach the patient at the right time. Pattern recognition is observation—not independent diagnosis.','Pressure injuries occur over bony prominences such as the sacrum, heels, ischial tuberosities, and greater trochanters. Classification systems describe Stage 1 non-blanchable erythema on intact skin; Stage 2 partial-thickness loss with exposed dermis; Stage 3 full-thickness loss with visible subcutaneous fat; Stage 4 full-thickness loss with exposed fascia, muscle, tendon, ligament, cartilage, or bone; unstageable wounds obscured by slough or eschar; and deep tissue pressure injury as persistent non-blanchable deep red, maroon, or purple discoloration. Describe what you observe; formal staging for the comprehensive assessment and POC updates is an RN/authorized clinician responsibility under agency policy.','The Braden Scale is a commonly used pressure-injury risk screening tool. Lower scores indicate higher risk. Follow agency policy for which scores trigger preventive interventions and RN notification—do not invent universal cutoffs beyond what your agency adopts.'], keyPoints: [{ icon: '🦴', title: 'Pressure pattern', detail: 'Bony prominences; describe tissue depth findings; RN/authorized clinician formal staging per policy.' },{ icon: '💧', title: 'Venous / arterial', detail: 'Venous: irregular, exudative, staining. Arterial: punched-out, pale, painful. Escalate vascular needs.' },{ icon: '🦶', title: 'Neuropathic', detail: 'Plantar, callused borders, may be painless—inspect carefully; coordinate glucose/A1C with the care team.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img02, hotspots: [{ id: 'pressure', label: 'Pressure', shortLabel: 'Pressure', ariaLabel: 'Investigate Pressure', x: 50, y: 22, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0', observe: 'Over bony prominences. Document non-blanchable color change, depth of tissue loss, and risk-tool findings per agency policy.', identifyChoices: [
          { id: 'i1', label: 'Pressure: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Over bony prominences. Document non-blanchable color change, depth of tissue loss, and risk-tool findings per agency policy.', meaning: 'Pressure under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'venous', label: 'Venous', shortLabel: 'Venous', ariaLabel: 'Investigate Venous', x: 78, y: 48, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-1', observe: 'Irregular borders, exudate, staining. Compression only with authorized order and adequate arterial status confirmed via RN pathway.', identifyChoices: [
          { id: 'i1', label: 'Venous: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Irregular borders, exudate, staining. Compression only with authorized order and adequate arterial status confirmed via RN pathway.', meaning: 'Venous under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'arterial', label: 'Arterial', shortLabel: 'Arterial', ariaLabel: 'Investigate Arterial', x: 50, y: 74, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'Punched-out, pale/necrotic, painful. Escalate for vascular assessment—do not independently order ABI or alter perfusion-related care.', identifyChoices: [
          { id: 'i1', label: 'Arterial: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Punched-out, pale/necrotic, painful. Escalate for vascular assessment—do not independently order ABI or alter perfusion-related care.', meaning: 'Arterial under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'diabetic', label: 'Neuropathic', shortLabel: 'Neuropathic', ariaLabel: 'Investigate Neuropathic', x: 22, y: 48, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'Plantar surfaces, callus, may be painless. Inspect fully; monofilament and care plan updates per orders/RN direction.', identifyChoices: [
          { id: 'i1', label: 'Neuropathic: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Plantar surfaces, callus, may be painless. Inspect fully; monofilament and care plan updates per orders/RN direction.', meaning: 'Neuropathic under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 2, shortName: 'Measure', title: 'Wound Measurement & BWAT Scoring', subtitle: 'Clock method, tissue percentages, consistent technique', narration: ['Precise wound measurement is the foundation of treatment-effectiveness tracking. Without accurate, consistent measurements, the care team cannot determine whether a wound is healing, stalled, or deteriorating. Your measurements feed RN and physician decisions—they do not authorize you to modify the Plan of Care yourself.','The Bates-Jensen Wound Assessment Tool (BWAT) is a widely used structured wound evaluation framework. It scores multiple dimensions (commonly thirteen) on a 1-to-5 scale where 1 represents healthier tissue findings and 5 represents more impaired findings for that dimension. Use the interactive panel to explore dimensions conceptually. Follow agency forms and competency requirements for which tool and scoring process you use in production documentation.','For linear measurements, the common clock method orients the body with 12 o’clock toward the head: length from 12 to 6, width from 3 to 9, regardless of wound location on the body. Depth is measured by gently inserting a sterile cotton-tipped applicator perpendicular to the deepest point of the bed, marking the surface level, then measuring tip to mark. Undermining is measured under intact edges and reported by clock position and centimeters (for example, “undermining 2.0 cm from 3 o’clock to 5 o’clock”).'], keyPoints: [{ icon: '🕐', title: 'Clock method', detail: 'Length 12→6 (head–toe), width 3→9, depth at deepest point with sterile probe technique.' },{ icon: '📊', title: 'BWAT-style scoring', detail: 'Lower dimension scores generally healthier; use agency-approved tool and form fields.' },{ icon: '🎨', title: 'Tissue percentages', detail: 'Estimate granulation / slough / eschar / epithelium so the team sees the clinical story.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img03, hotspots: [{ id: 'size', label: 'Objective size', shortLabel: 'L × W × D', ariaLabel: 'Investigate objective wound measurements', x: 18, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-0', observe: 'Measure in centimeters with the same method: length 12 to 6, width 3 to 9, and depth at the deepest point; record undermining or tunneling separately by clock position.', identifyChoices: [
          { id: 'i1', label: 'These are objective serial measurements for comparison; they describe the wound without independently assigning a diagnosis or pressure-injury stage', correct: true, rationale: 'Correct. Consistent measurements support trend review while formal diagnosis/staging remains with the authorized clinician pathway.' },
          { id: 'i2', label: 'A larger measurement automatically proves infection and authorizes the LVN to restage the wound', correct: false, rationale: 'A size change is reportable objective data, not independent authority to diagnose infection or assign a stage.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Repeat an unexpected value once using the same technique, compare with the prior note, continue only safe ordered care, and report a meaningful increase to the RN', correct: true, rationale: 'Correct. Verification and comparison provide defensible data without changing the dressing protocol.' },
          { id: 'd2', label: 'Select a new dressing frequency from the measurement result without contacting the RN', correct: false, rationale: 'Measurements inform review but do not authorize an independent frequency or treatment change.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Chart L × W × D in cm, orientation and technique, undermining/tunneling by clock and depth, comparison with prior values, and RN notification for significant change', correct: true, rationale: 'Correct. Exact values and comparison make the wound trajectory reproducible and actionable.' },
          { id: 'doc2', label: 'Chart “wound larger” without dimensions, method, comparison, or notification details', correct: false, rationale: 'A qualitative statement alone is not an objective wound measurement record.' }
        ], feedback: { observed: 'Length, width, and depth are measured in centimeters with consistent orientation; undermining and tunneling are reported separately by clock position.', meaning: 'Objective serial measurements allow the RN/provider to evaluate trajectory; they do not authorize independent staging, diagnosis, or treatment change.', action: 'Verify unexpected results, compare them with the prior visit, and perform only safe ordered wound care while escalating a meaningful change.', notify: 'Notify the supervising RN for an unexpected increase, new depth, undermining/tunneling, exposed structure, bleeding, or other concerning change.', document: 'Record exact L × W × D, method, clock-position findings, tissue visibility, comparison, patient tolerance, and RN notification/direction when indicated.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'depth', label: 'Depth', shortLabel: 'Depth', ariaLabel: 'Investigate Depth', x: 50, y: 22, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-1', observe: 'Deepest vertical depth with sterile applicator; report undermining/tunneling separately by clock position.', identifyChoices: [
          { id: 'i1', label: 'Depth: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Deepest vertical depth with sterile applicator; report undermining/tunneling separately by clock position.', meaning: 'Depth under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'exudate', label: 'Exudate', shortLabel: 'Exudate', ariaLabel: 'Investigate Exudate', x: 82, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'Type and amount (serous, serosanguineous, purulent; scant to copious) after cleansing when policy requires.', identifyChoices: [
          { id: 'i1', label: 'Exudate: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Type and amount (serous, serosanguineous, purulent; scant to copious) after cleansing when policy requires.', meaning: 'Exudate under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'granulation', label: 'Granulation', shortLabel: 'Granulation', ariaLabel: 'Investigate Granulation', x: 30, y: 70, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'Healthy granulation is typically beefy red. Track percent change visit to visit.', identifyChoices: [
          { id: 'i1', label: 'Granulation: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Healthy granulation is typically beefy red. Track percent change visit to visit.', meaning: 'Granulation under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 3, shortName: 'Dressing', title: 'Dressing Selection & Application', subtitle: 'Moisture balance principles — apply only what is ordered', narration: ['Dressing strategy follows a moisture-management principle: maintain a moist wound healing environment without macerating periwound skin. Wounds that are too dry heal poorly; wounds that are too wet macerate and may enlarge. Understanding the principle helps you evaluate whether the ordered dressing is performing as intended.','Dry or desiccated beds are often managed with moisture-donating products such as hydrogels (sheets, amorphous gels, or impregnated gauze), covered with a secondary dressing when ordered. Moderate exudate wounds commonly use foam dressings that absorb excess fluid while cushioning and insulating. Heavy exudate wounds may use alginates or hydrofiber dressings that gel as they absorb fluid and fill dead space; these generally require a secondary cover dressing when ordered.','CRITICAL LVN SCOPE: You apply dressings per the physician or authorized clinician wound-care order on the Plan of Care—not by independent product substitution. If you observe excessive strike-through, maceration, desiccation, or frequent saturation that suggests the current product is mismatched, document objective findings and notify the RN case manager so the order can be reviewed. You may use standard nursing measures within policy and orders (for example, ordered skin protectant on periwound skin) to prevent maceration.'], keyPoints: [{ icon: '💧', title: 'Dry bed', detail: 'Moisture-donating options (e.g., hydrogel class) when ordered—not self-selected.' },{ icon: '🧽', title: 'Moderate exudate', detail: 'Foam-class dressings often ordered for balance of absorption and moisture retention.' },{ icon: '🌿', title: 'Heavy exudate', detail: 'Alginate/hydrofiber classes absorb heavily; secondary dressing per order.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img04, hotspots: [{ id: 'root', label: 'Order & supplies', shortLabel: 'Order & supplies', ariaLabel: 'Investigate wound order and supplies', x: 50, y: 18, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0', observe: 'Before setup, compare the current Plan of Care order with the available cleanser, primary dressing, secondary cover, skin protectant, change frequency, and ordered quantity.', identifyChoices: [
          { id: 'i1', label: 'The exact ordered products and frequency govern today’s dressing change; a missing or mismatched supply requires clarification, not independent substitution', correct: true, rationale: 'Correct. CL-SD-011 and CL-CP-001 require care to follow the authorized wound order and Plan of Care.' },
          { id: 'i2', label: 'Any product in the same general dressing class may be substituted by the LVN without an order', correct: false, rationale: 'A class similarity does not authorize an independent product or protocol change.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Verify the order and lot/packaging integrity, use only the ordered supplies, and contact the RN before care if a required item or instruction does not match', correct: true, rationale: 'Correct. Verification and escalation prevent an unauthorized dressing substitution.' },
          { id: 'd2', label: 'Choose a different primary dressing based on the drainage seen today and update the protocol afterward', correct: false, rationale: 'The LVN may report drainage change but may not independently select a new protocol.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Record the ordered cleanser and dressings actually applied, quantity, frequency/order verification, wound response, and any supply mismatch with RN notification and direction', correct: true, rationale: 'Correct. The record links care performed to the current order and documents resolution of discrepancies.' },
          { id: 'doc2', label: 'Record only “dressing changed per protocol” without naming the ordered supplies or discrepancy', correct: false, rationale: 'That entry does not show what was applied or whether the current order was followed.' }
        ], feedback: { observed: 'The wound order specifies the cleanser, primary and secondary dressings, periwound product, frequency, and supplies authorized for the visit.', meaning: 'The LVN must match supplies and technique to the current authorized Plan of Care rather than choose a dressing independently.', action: 'Verify and apply the ordered products. If supplies are absent, damaged, or inconsistent with the order, pause the affected step and obtain RN direction.', notify: 'Notify the supervising RN before substitution or when an order/supply mismatch prevents ordered care; follow missed-care escalation if unresolved.', document: 'Record order verification, products and quantities used, dressing tolerance, mismatch or omitted step, RN name/time, direction, and follow-through.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'hydrogel', label: 'Hydrogel class', shortLabel: 'Hydrogel class', ariaLabel: 'Investigate Hydrogel class', x: 18, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1', observe: 'Donates moisture to dry beds when ordered. Cover with secondary dressing as ordered.', identifyChoices: [
          { id: 'i1', label: 'Hydrogel class: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Donates moisture to dry beds when ordered. Cover with secondary dressing as ordered.', meaning: 'Hydrogel class under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'foam', label: 'Foam class', shortLabel: 'Foam class', ariaLabel: 'Investigate Foam class', x: 50, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-2', observe: 'Absorbs moderate exudate, cushions, insulates—use only the ordered product and frequency.', identifyChoices: [
          { id: 'i1', label: 'Foam class: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Absorbs moderate exudate, cushions, insulates—use only the ordered product and frequency.', meaning: 'Foam class under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'alginate', label: 'Alginate/HF', shortLabel: 'Alginate/HF', ariaLabel: 'Investigate Alginate/HF', x: 82, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-2', observe: 'High absorption for heavy exudate when ordered; usually needs secondary cover dressing.', identifyChoices: [
          { id: 'i1', label: 'Alginate/HF: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'High absorption for heavy exudate when ordered; usually needs secondary cover dressing.', meaning: 'Alginate/HF under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 4, shortName: 'Infection', title: 'Healing Progression & Stall Recognition', subtitle: 'Track trajectory; escalate stalls and deterioration', narration: ['Wound healing generally progresses through overlapping phases: inflammatory, proliferative, and remodeling. Exact day ranges vary by patient, comorbidities, perfusion, infection, and nutrition. Your role is to track trajectory with consistent measurements and recognize when a wound diverges from expected improvement under the current ordered plan.','Many clinical teaching frameworks highlight a two-week review point: if there is no measurable improvement after a reasonable trial of the ordered regimen, treat the situation as a potential stall requiring RN notification and likely Plan of Care review. Do not wait indefinitely “hoping” for change, and do not independently redesign therapy. Specific percent-reduction targets used in research or specialty guidance inform the care team; they are not LVN authority to change orders without RN/physician involvement.','Expected improvement patterns include decreasing dimensions, increasing granulation percentage, decreasing slough/necrotic tissue, decreasing exudate, improving periwound skin, and often decreasing wound-related pain. Document trends visit over visit with the same measurement method.'], keyPoints: [{ icon: '📈', title: 'Track trends', detail: 'Same method each visit: size, tissue %, exudate, periwound, pain, photos per policy.' },{ icon: '⚠️', title: 'Stall signal', detail: 'No measurable improvement after a reasonable ordered trial → document + notify RN (do not self-revise POC).' },{ icon: '🚨', title: 'Deterioration', detail: 'Deeper structures, infection signs, rapid enlargement → stop unsafe steps, protect, escalate now.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img05, hotspots: [{ id: 'w0', label: 'Baseline', shortLabel: 'Baseline', ariaLabel: 'Investigate Baseline', x: 12, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-0', observe: 'Initial measurements, tissue description, photo (if policy/consent allow), and ordered plan confirmed.', identifyChoices: [
          { id: 'i1', label: 'Baseline: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Initial measurements, tissue description, photo (if policy/consent allow), and ordered plan confirmed.', meaning: 'Baseline under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'w1', label: 'Early', shortLabel: 'Early', ariaLabel: 'Investigate Early', x: 32, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-1', observe: 'Monitor inflammation and infection signs; reinforce offloading/nutrition teaching per plan.', identifyChoices: [
          { id: 'i1', label: 'Early: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Monitor inflammation and infection signs; reinforce offloading/nutrition teaching per plan.', meaning: 'Early under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'w2', label: 'Drainage change', shortLabel: 'Drainage change', ariaLabel: 'Investigate drainage and periwound change', x: 52, y: 48, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-2', observe: 'At the ordered dressing change, the foam is saturated sooner than expected; drainage is now moderate yellow, the wound is 3.2 × 2.1 × 0.3 cm versus 2.8 × 1.9 × 0.2 cm, and periwound erythema extends 1.5 cm with new warmth.', identifyChoices: [
          { id: 'i1', label: 'This is an objective wound/drainage/periwound change requiring prompt RN review; describe findings without independently diagnosing infection or assigning a new stage', correct: true, rationale: 'Correct. Increased dimensions, changed drainage, warmth, and measurable erythema are reportable changes; they do not authorize an LVN diagnosis or stage change.' },
          { id: 'i2', label: 'Diagnose wound infection, independently restage the wound, and select a stronger dressing protocol', correct: false, rationale: 'Diagnosis, formal restaging, and protocol changes require the RN/provider pathway and an authorized order.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Protect the wound and perform only care that remains safe and ordered; promptly notify the RN before any dressing substitution and follow the direction received', correct: true, rationale: 'Correct. The LVN protects the site, stays within the current order, and escalates the changed findings rather than independently switching products.' },
          { id: 'd2', label: 'Replace the ordered foam with alginate now because drainage increased', correct: false, rationale: 'Even when another dressing class appears suitable, the LVN does not independently change the ordered product or protocol.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Chart L × W × D and comparison, wound-bed tissue, drainage amount/color, 1.5 cm erythema and warmth, ordered supplies used, patient response, RN name/time, report, and direction', correct: true, rationale: 'Correct. This creates an objective, traceable wound-change and notification record.' },
          { id: 'doc2', label: 'Chart “possible infection; dressing changed” without measurements, supply details, or the RN communication', correct: false, rationale: 'That wording is diagnostic, non-specific, and omits the objective findings and notification trail.' }
        ], feedback: { observed: 'Earlier foam saturation, moderate yellow drainage, increased L × W × D, and 1.5 cm warm periwound erythema compared with the prior visit.', meaning: 'The wound trajectory has changed and may require RN/provider review; the LVN reports objective findings without independently diagnosing infection or restaging.', action: 'Protect the wound and continue only safe ordered steps. Do not substitute a dressing or alter frequency without an authorized order.', notify: 'Promptly notify the supervising RN during the visit; use the urgent or emergency pathway for systemic instability or rapidly worsening findings.', document: 'Record measurements and comparison, wound-bed tissue, drainage, odor after cleansing if assessed, periwound extent/warmth, pain, ordered supplies applied, response, RN notification time, report, direction, and follow-through.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'w3', label: 'Progress', shortLabel: 'Progress', ariaLabel: 'Investigate Progress', x: 72, y: 48, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-0', observe: 'Granulation increase and size reduction support continuing ordered plan with ongoing monitoring.', identifyChoices: [
          { id: 'i1', label: 'Progress: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Granulation increase and size reduction support continuing ordered plan with ongoing monitoring.', meaning: 'Progress under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 5, shortName: 'Escalate', title: 'Documentation & RN Co-Signature', subtitle: 'Eight field groups that survive survey scrutiny', narration: ['Wound documentation is among the most scrutinized areas in home health surveys. CMS surveyors look for complete, consistent, clinically accurate records that allow a reader who never saw the patient to understand wound status and the care provided. Your note must stand alone as objective clinical data.','Required content commonly includes: precise location (anatomical landmark language, not “left leg”); dimensions L × W × D with undermining/tunneling by clock position; bed description with tissue percentages; periwound condition (color, temperature, moisture, maceration, induration, erythema extent); drainage type/amount/color; odor after cleansing; pain (0–10, timing, character, response to interventions); and clinical photographs when agency policy and consent allow, with consistent scale/lighting/angle.','LVN wound documentation is reviewed and co-signed by the RN within the timeframe specified by current agency policy. Do not invent a universal co-signature clock for all agencies; follow Care Indeed policy CL-SD-011 and related documentation standards. Co-signature does not transfer your duty to write accurate contemporaneous notes.'], keyPoints: [{ icon: '📍', title: 'Location & size', detail: 'Landmark language + L × W × D + undermining/tunneling by clock position.' },{ icon: '🧪', title: 'Bed · drainage · periwound', detail: 'Tissue %, exudate character, surrounding skin findings with measurable extent when possible.' },{ icon: '✍️', title: 'RN co-signature', detail: 'Per agency policy timeframe—not a substitute for accurate LVN contemporaneous charting.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img06, hotspots: [{ id: 'loc', label: 'Location', shortLabel: 'Location', ariaLabel: 'Investigate Location', x: 20, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-0', observe: 'Anatomical landmark language (e.g., left medial malleolus, 3 cm superior to ankle joint).', identifyChoices: [
          { id: 'i1', label: 'Location: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Anatomical landmark language (e.g., left medial malleolus, 3 cm superior to ankle joint).', meaning: 'Location under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'dim', label: 'Dimensions', shortLabel: 'Dimensions', ariaLabel: 'Investigate Dimensions', x: 50, y: 22, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-1', observe: 'L × W × D cm; undermining/tunneling by clock position.', identifyChoices: [
          { id: 'i1', label: 'Dimensions: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'L × W × D cm; undermining/tunneling by clock position.', meaning: 'Dimensions under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'bed', label: 'Bed', shortLabel: 'Bed', ariaLabel: 'Investigate Bed', x: 80, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-2', observe: 'Approximate % granulation, slough, eschar, epithelium.', identifyChoices: [
          { id: 'i1', label: 'Bed: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Approximate % granulation, slough, eschar, epithelium.', meaning: 'Bed under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'peri', label: 'Periwound', shortLabel: 'Periwound', ariaLabel: 'Investigate Periwound', x: 20, y: 58, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-1', observe: 'Color, temp, maceration, induration, erythema extent.', identifyChoices: [
          { id: 'i1', label: 'Periwound: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Color, temp, maceration, induration, erythema extent.', meaning: 'Periwound under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] },
{ id: 6, shortName: 'Practice', title: 'Decision Framework & Knowledge Check Prep', subtitle: 'First · continue · stop · notify · document — then prove knowledge', narration: ['You have completed the instructional sequence for LVN-007: wound anatomy and scope, classification patterns, measurement and structured scoring concepts, dressing-class principles under orders, healing trajectory and stall recognition, and documentation with RN co-signature requirements.','Use this decision frame on every wound visit: (1) What does the Plan of Care order today? (2) Do findings match the last note and expected trajectory? (3) May I continue ordered care safely? (4) Must I stop a step because of new exposure, bleeding, severe pain, or environmental risk? (5) Whom do I notify (RN case manager, physician pathway, emergency services per agency protocol)? (6) What objective data, notifications, and patient responses must I document?','Knowledge alone is not practical competency. Passing the quiz in this module validates knowledge of LVN wound-care scope and standards. Observed demonstration, skills check-off per agency policy, and authorized sign-off remain separate requirements before independent wound-care performance is considered validated in practice.'], keyPoints: [{ icon: '🧭', title: 'Decision frame', detail: 'Orders → findings → continue/stop → notify → document.' },{ icon: '🎓', title: 'Quiz = knowledge', detail: '80% pass validates knowledge only—not field competency alone.' },{ icon: '✅', title: 'Practical sign-off', detail: 'Observed demo and authorized competency sign-off remain separate.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Federal', text: '42 CFR § 484.115(e)' }], sceneImage: img07, hotspots: [{ id: 'assess', label: 'Assess', shortLabel: 'Assess', ariaLabel: 'Investigate Assess', x: 18, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-0', observe: 'Observe tissue, periwound, pain, and systemic signs within LVN assessment scope.', identifyChoices: [
          { id: 'i1', label: 'Assess: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Observe tissue, periwound, pain, and systemic signs within LVN assessment scope.', meaning: 'Assess under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'measure', label: 'Measure', shortLabel: 'Measure', ariaLabel: 'Investigate Measure', x: 38, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-1', observe: 'Consistent L × W × D and tissue percentages using approved technique.', identifyChoices: [
          { id: 'i1', label: 'Measure: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Consistent L × W × D and tissue percentages using approved technique.', meaning: 'Measure under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'dress', label: 'Apply ordered', shortLabel: 'Apply ordered', ariaLabel: 'Investigate Apply ordered', x: 62, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-2', observe: 'Perform ordered wound care only—no independent product swaps.', identifyChoices: [
          { id: 'i1', label: 'Apply ordered: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Perform ordered wound care only—no independent product swaps.', meaning: 'Apply ordered under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } },{ id: 'document', label: 'Document', shortLabel: 'Document', ariaLabel: 'Investigate Document', x: 82, y: 40, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-0', observe: 'Complete objective fields; RN co-signature per agency policy.', identifyChoices: [
          { id: 'i1', label: 'Document: ordered ongoing wound observation/classification within validated competency — not independent comprehensive/OASIS wound assessment', correct: true, rationale: 'Correct scope boundary.' },
          { id: 'i2', label: 'LVN independently stages, selects new treatment, and changes the POC', correct: false, rationale: 'Those actions exceed LVN authority without proper authorization.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform ordered wound care as written; report infection/change findings to RN; do not independently select a new protocol or modify the POC', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'd2', label: 'Change dressing type based on personal preference', correct: false, rationale: 'Treatment changes require orders.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document measurements/findings as ordered, dressing used, patient response, and RN notification for changes', correct: true, rationale: 'Correct — this matches the required clinical action.' },
          { id: 'doc2', label: 'Document “wound care done” only', correct: false, rationale: 'Insufficient wound documentation.' }
        ], feedback: { observed: 'Complete objective fields; RN co-signature per agency policy.', meaning: 'Document under CL-SD-011.', action: 'Perform ordered wound care only; report changes to RN; do not independently change protocols.', notify: 'Supervising RN for unexpected findings.', document: 'Record objective findings, actions taken, patient response, and RN notifications with times.', policyRefs: ['CL-SD-011', 'CL-CP-001'] } }] }
];

const QUIZ: QuizQuestion[] = [
{ id: 1, stem: 'Under California LVN practice boundaries (B&P § 2859) as applied in home health wound care, which task is WITHIN LVN scope when ordered/authorized?', options: ['Measuring wound dimensions and documenting objective findings','Performing sharp debridement of necrotic tissue with instruments','Independently ordering a new primary dressing product line','Changing a physician wound-care order without RN/physician involvement'], correct: 0, rationale: 'LVNs measure, observe, document, report, and perform ordered wound care. Sharp debridement, independent supply ordering as a medical order, and independent order changes are outside independent LVN scope.' },
{ id: 2, stem: 'Which description matches full-thickness tissue loss with visible subcutaneous fat (commonly taught as Stage 3 pressure injury tissue depth)?', options: ['Epidermis only with intact skin and non-blanchable erythema','Partial-thickness loss limited to dermis','Full-thickness loss exposing subcutaneous fat (not bone/tendon/muscle)','Full-thickness loss with exposed muscle, tendon, or bone'], correct: 2, rationale: 'Stage 3-depth findings involve full-thickness loss to subcutaneous tissue without exposed fascia/muscle/tendon/bone (Stage 4). LVNs describe tissue observed; formal staging for the comprehensive assessment follows RN/authorized clinician and agency policy.' },
{ id: 3, stem: 'On a BWAT-style 1–5 dimension scale used in this module, a score of 1 in a dimension generally indicates:', options: ['Best / healthiest tissue findings for that dimension','Worst possible impairment for that dimension','Moderate impairment only','That the LVN should independently change the dressing order'], correct: 0, rationale: 'Lower BWAT dimension scores (toward 1) reflect healthier findings; higher scores (toward 5) reflect more impairment. Tool scores inform the team—they do not authorize independent order changes.' },
{ id: 4, stem: 'Which wound pattern typically presents on the plantar surface with callused borders and may be relatively painless due to neuropathy?', options: ['Venous stasis ulcer of the gaiter area','Classic arterial ulcer of the distal toes only','Diabetic / neuropathic ulcer pattern','Stage 2 pressure injury over the sacrum'], correct: 2, rationale: 'Diabetic/neuropathic ulcers commonly occur on plantar weight-bearing surfaces with callus and may lack pain due to sensory loss—making careful inspection essential.' },
{ id: 5, stem: 'Using the head-to-toe clock method taught in this module, how should the LVN measure wound length?', options: ['Horizontally across the widest point regardless of body orientation','From 12 o’clock to 6 o’clock (head-to-toe orientation)','Diagonally across the longest visible axis only','In any consistent direction chosen anew each visit'], correct: 1, rationale: 'Standard clock orientation uses length from 12 (head) to 6 (toe) and width from 3 to 9 so serial measurements are comparable.' },
{ id: 6, stem: 'A wound shows no measurable improvement after a reasonable trial of the ordered regimen (commonly reviewed around two weeks). What should the LVN do FIRST?', options: ['Independently change the dressing product class','Document objective findings and notify the RN case manager','Discontinue wound-care visits without notice','Apply an alternate cleanser not on the order to “try something new”'], correct: 1, rationale: 'Potential stalls require accurate documentation and RN notification for comprehensive review/possible POC change. The LVN does not independently redesign therapy or stop ordered services unilaterally.' },
{ id: 7, stem: 'Which dressing class is generally most appropriate for a heavily exudating wound when ordered on the Plan of Care?', options: ['Transparent film alone as the primary absorptive layer','Hydrogel sheet intended mainly to donate moisture','Alginate or hydrofiber absorptive dressing (with secondary cover as ordered)','Dry gauze only with no absorptive capacity plan'], correct: 2, rationale: 'Alginate/hydrofiber classes are designed for high exudate absorption when ordered. Films and hydrogels suit different moisture needs; dry gauze alone is often a poor moist-healing choice for heavy drainage.' },
{ id: 8, stem: 'Which action is NOT part of LVN periwound assessment/observation within scope?', options: ['Noting color changes such as erythema or maceration','Comparing local temperature to surrounding skin','Checking for induration or edema near the wound','Independently prescribing a new topical barrier cream order'], correct: 3, rationale: 'LVNs observe and document periwound findings and may apply ordered/protectant measures per policy. Prescribing or independently creating medication/treatment orders is outside LVN scope.' },
{ id: 9, stem: 'During a dressing change the LVN newly discovers exposed tendon that was not previously documented. What is the correct action?', options: ['Cover briefly with saline gauze and finish the visit without notification','Protectively cover the wound, stop further aggressive probing, and notify the RN immediately','Apply a silver dressing product not on the order and recheck next week','Document as “Stage 3” independently and continue the prior protocol unchanged'], correct: 1, rationale: 'New exposure of deeper structures is a major change requiring protective covering and prompt RN/authorized clinician notification. Do not independently restage, substitute products, or continue as if nothing changed.' },
{ id: 10, stem: 'Wound-care documentation must typically include all of the following EXCEPT:', options: ['Wound dimensions (L × W × D) and undermining/tunneling when present','Wound-bed description and drainage characteristics','Patient pain level and response to care','Independent medical diagnosis code assignment by the LVN for billing'], correct: 3, rationale: 'Dimensions, bed/drainage, pain, and related clinical fields are expected. Independent ICD coding/diagnosis assignment is not an LVN wound-note function.' }
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
@keyframes lvn002-node-orbit{to{transform:rotate(360deg)}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;font-size:24px;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:18px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:19.5px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:18px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;isolation:isolate;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .orb::before{content:"";position:absolute;inset:-9px;z-index:-1;border-radius:50%;background:radial-gradient(circle at 50% 2px,#F26D33 0 3px,rgba(242,109,51,.7) 3px,transparent 5px),conic-gradient(from 0deg,transparent 0 78%,rgba(242,109,51,.04) 78%,rgba(242,109,51,.1) 86%,rgba(242,109,51,.24) 94%,rgba(242,109,51,.48) 100%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));filter:drop-shadow(0 0 3px rgba(242,109,51,.36));animation:lvn002-node-orbit 2.8s linear infinite;pointer-events:none}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:16.5px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:18px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:18px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:18px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:15px;max-width:92px;white-space:normal;text-align:center;line-height:1.15}
  .lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}
  .lvn002-tabs{scrollbar-width:thin}.lvn002-tabs::-webkit-scrollbar{display:block;height:4px}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:16.5px}
  .lvn002-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-hotspot .orb::before,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:16.5px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:16.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:16.5px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:18px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:16.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:16.5px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:24px;overscroll-behavior:contain}
  .lvn002-modal-card{width:min(1120px,100%);max-height:min(90dvh,960px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:24px;border:1px solid #E2E8F0;box-shadow:0 24px 72px rgba(0,0,0,.28)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:13.5px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:15px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:16.5px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:13.5px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:13.5px!important}.lvn002-scene-title>div:last-child{font-size:15px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:13.5px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:12px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:12px;align-items:center}.lvn002-modal-card{border-radius:20px;max-height:calc(100dvh - 24px)}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 24, borderRadius: 24, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 12 }}>{icon}{label}</div>
      <div style={{ fontSize: 31, lineHeight: 1.6, color: CI.ink }}>{body}</div>
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

  const pick = (
    choice: ScenarioChoice,
    setSelected: (id: string) => void,
    setLocked: (v: boolean) => void,
    locked: boolean,
    next: ScenarioStage,
  ) => {
    if (locked) return;
    setSelected(choice.id);
    setRationale(choice.rationale);
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
      <div role="radiogroup" aria-label={`${stage} choices`} style={{ display: 'grid', gap: 16 }}>
        {choices.map((choice, index) => {
          const selected = selectedId === choice.id;
          const wrong = selected && !choice.correct;
          const right = selected && choice.correct;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={selected} tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onPick(choice)} onKeyDown={(event) => moveFocus(event, index)} disabled={locked && !selected}
              style={{ textAlign: 'left', minHeight: 96, padding: '20px 24px', borderRadius: 20, cursor: locked && !selected ? 'default' : 'pointer', border: `2px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`, background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff', fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1 }}>
              {choice.label}
            </button>
          );
        })}
        {rationale && <div role="status" aria-live="polite" style={{ fontSize: 28, lineHeight: 1.5, color: CI.muted, padding: '16px 20px', borderRadius: 16, background: CI.bg }}>{rationale}</div>}
      </div>
    );
  };

  const fb = hotspot.feedback;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lvn-scenario-title" ref={dialogRef} className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '24px 28px', borderBottom: `1px solid ${CI.border}`, borderTop: `6px solid ${zoneColor}` }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>
              {stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}
            </div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 34, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close scenario"
            onClick={closeAndRestore}
            style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            <X size={30} />
          </button>
        </div>

        <div style={{ padding: 28, display: 'grid', gap: 24 }}>
          {stage === 'observe' && (
            <>
              <p style={{ margin: 0, fontSize: 31, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p>
              <button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 72, border: 0, borderRadius: 20, background: CI.teal, color: '#fff', fontWeight: 800, fontSize: 26, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Continue to Identify
              </button>
            </>
          )}

          {stage === 'identify' && (
            <>
              <div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>
              {renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (c) =>
                pick(c, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'),
              )}
            </>
          )}

          {stage === 'decide' && (
            <>
              <div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>
              {renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (c) =>
                pick(c, setSelectedDecideId, setDecideLocked, decideLocked, 'document'),
              )}
            </>
          )}

          {stage === 'document' && (
            <>
              <div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>
              {renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (c) =>
                pick(c, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'),
              )}
            </>
          )}

          {stage === 'feedback' && (
            <>
              <h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 36, color: CI.teal }}>Clinical feedback</h3>
              <FeedbackBlock label="What you observed" body={fb.observed} icon={<Eye size={28} />} />
              <FeedbackBlock label="What it means" body={fb.meaning} icon={<AlertCircle size={28} />} />
              <FeedbackBlock label="What the LVN should do" body={fb.action} icon={<CheckCircle2 size={28} />} />
              <FeedbackBlock label="Who must be notified" body={fb.notify} icon={<MessageSquare size={28} />} />
              <FeedbackBlock label="What must be documented" body={fb.document} icon={<FileText size={28} />} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {fb.policyRefs.map((r) => (
                  <span key={r} style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 12, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { onComplete(); restoreTriggerFocus(); }}
                style={{ width: '100%', minHeight: 72, border: 0, borderRadius: 20, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Complete hotspot
              </button>
            </>
          )}
        </div>
      </div>
    </div>, document.body,
  );
}


function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > 1;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 22.5, fontWeight: 600 }}>{page.subtitle}</p>
      <p style={{ margin: '0 0 12px', fontSize: 25.5, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 19.5, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 24, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, index) => (
          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 27 }} aria-hidden>{kp.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 19.5, color: '#1F1C1B', marginBottom: 2 }}>{kp.title}</div>
              <div style={{ fontSize: 21, color: CI.muted, lineHeight: 1.45 }}>{kp.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 16.5, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 22.5, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[...page.sourceLabels, { kind: 'Agency Policy', text: 'CL-SD-011' }, { kind: 'Agency Policy', text: 'CL-CP-001' }].map((source) => (
          <span key={source.kind + source.text} style={{ fontSize: 16.5, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{source.kind}: {source.text}</span>
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
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 19.5, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 16.5, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
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
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 22.5 }} aria-hidden>?</span>}
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
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 16.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'lvn002-pop .3s cubic-bezier(.16,1,.3,1)' }} className="lvn002-rm-transition">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 27, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 19.5, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario Practice Complete. Knowledge practice only — Practical Competency Remains Separate.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
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
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="lvn002-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 42, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 33, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Knowledge Check Complete' : 'Keep sharpening judgment'}</div>
          <div style={{ fontSize: 21, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
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
                <div style={{ fontSize: 18, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 16.5, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
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
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="lvn002-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 16.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 16.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 30, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h2>

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
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{letters[i]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 24, lineHeight: 1.5, paddingTop: 3 }}>{opt}</span>
                  {submitted && i === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && on && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 23.25, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 19.5, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'lvn-007-progress-v5414';

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

export default function LVN007() {
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
            alt="Care Indeed Home Health Care"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
          />
          <span className="brand-text">LVN-007 — Wound Care</span>
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
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
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
