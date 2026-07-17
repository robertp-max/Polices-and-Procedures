/**
 * LVN-008 — Fall Risk Assessment & Prevention
 * Version: 5.0 | Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Track: LVN — Licensed Vocational Nurse | Care Indeed LMS
 * Record: 6a558bf63463cd690af8d633
 * Policy: CL-SD-015 | Regulatory: 42 CFR § 484.60, § 484.65 (QAPI)
 * Pattern: SC04 split-panel (left narration ~55% / right instructional SVG ~45%)
 * Pages: 7 instructional | Quiz: 10 | Pass: 80%
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LvnLeftPanel } from './LvnLeftPanel';
import { LvnGaoPlayer } from './LvnGaoPlayer';
import { LvnSceneModal } from './LvnSceneModal';

const MODULE_META = {
  id: 'LVN-008',
  title: 'Fall Risk Assessment & Prevention',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  policies: ['CL-SD-015', 'RM-ER-002', 'QA-AE-001', 'RM-PS-001'] as const,
  cms: ['42 CFR § 484.60', '42 CFR § 484.65'] as const,
  recordId: '6a558bf63463cd690af8d633',
};

const THEME = {
  primary: '#F59E0B',
  primaryDark: '#D97706',
  secondary: '#FFFBEB',
  accent: '#DC2626',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  info: '#0EA5E9',
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  border: '#FDE68A',
  softRed: '#FEE2E2',
  softGreen: '#D1FAE5',
  softAmber: '#FEF3C7',
  softBlue: '#E0F2FE',
};

type HotspotKey = string | null;

interface PageDef {
  id: string;
  title: string;
  badge: string;
  paragraphs: string[];
  keyPoints: string[];
  clinicalTip: string;
  scopeNote?: string;
}

interface QuizQuestion {
  id: string;
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
}

// ═══════════════════════════════════════════════════════════════
// INSTRUCTIONAL CONTENT (7 pages)
// ═══════════════════════════════════════════════════════════════

const PAGES: PageDef[] = [
  {
    id: 'p1-why-falls',
    title: 'Falls Are the Leading Adverse Event in Home Health',
    badge: 'Why This Matters',
    paragraphs: [
      'Welcome to Module LVN-008: Fall Risk Assessment and Prevention. Falls are among the most common adverse events in home health care and a leading cause of injury-related death in adults over age sixty-five. At Care Indeed Home Health Care, fall prevention is a core clinical responsibility governed by Policy CL-SD-015 (Fall Risk Assessment & Prevention) and monitored under the Quality Assurance and Performance Improvement (QAPI) program per 42 CFR § 484.65.',
      'Public health data (e.g., CDC) consistently show that about one in four adults aged sixty-five and older falls each year, and falls are a major driver of traumatic brain injury and fractures in older adults. Home health agencies track falls as quality and adverse-event signals that can affect survey readiness and publicly reported outcomes. Do not invent or rely on local “agency success percentages” in documentation or teaching—use validated tools, observation, and the Plan of Care (POC).',
      'As an LVN, you are often the clinician with the most frequent skilled-nursing contact between RN supervisory and comprehensive assessment visits. A new medication, dizziness, gait change, near-fall, or home environment change can shift risk quickly. Your role is to screen at every visit, observe mobility and environment, document findings objectively, implement ordered fall-prevention interventions under the POC, and escalate changes to the assigned RN promptly—so the comprehensive assessment and Fall Prevention Plan can be updated by the authorized clinician.',
      'The interactive home hazard map on the right highlights high-risk zones in a typical residence. Click each zone for hazard examples. Bathrooms and stairs are frequently highest risk, but every room can contribute. Fall-related screening is not a one-time checkbox: it happens every visit, is documented every visit, and is communicated when risk changes.',
    ],
    keyPoints: [
      'CL-SD-015 + 42 CFR § 484.65 (QAPI) frame agency fall prevention and tracking.',
      'LVN is the frequent frontline observer—screen, observe, document, report changes.',
      'Comprehensive fall risk assessment and Fall Prevention Plan ownership: assigned RN (not LVN-independent).',
      'Ask every visit: falls/near-falls since last visit? Unsteady standing or walking?',
    ],
    clinicalTip:
      'On arrival, scan the path from door to chair to bathroom before you unpack. Quick environmental scanning often reveals trip hazards before the formal assessment begins.',
    scopeNote:
      'LVN does not independently complete OASIS fall items, diagnose fall etiology, or modify the POC. Report findings to the RN; implement interventions as ordered.',
  },
  {
    id: 'p2-morse',
    title: 'Standardized Fall Risk Tools — Morse & Agency Process',
    badge: 'Assessment Tools',
    paragraphs: [
      'Per CL-SD-015, a comprehensive fall risk assessment is completed by the assigned RN at start of care (SOC), at each OASIS time point, after any fall, and when a significant change affects fall risk. The assessment uses a validated tool—examples include the Morse Fall Scale, Timed Up and Go (TUG), or an equivalent agency-approved instrument—and clinical judgment across history, medications, gait/balance, vision, cognition, orthostatic screening, environment, continence, footwear, and assistive devices.',
      'The Morse Fall Scale (commonly taught and often used as an agency tool) scores six factors: History of Falling (0 or 25 — fall within past three months typically scores 25); Secondary Diagnosis (0 or 15); Ambulatory Aid (0 / 15 / 30 — none / cane-crutches-walker / furniture walking); IV/Heparin Lock or equivalent access factor as defined by the tool version in use (0 or 20); Gait (0 / 10 / 20 — normal / weak / impaired); and Mental Status (0 or 15 — oriented to own ability vs. overestimates ability or forgets limitations). Totals are commonly interpreted as low (0–24), moderate (25–44), and high (≥45). Always follow the exact scoring sheet and cutoffs in the current agency form (CL-FM-020 or successor).',
      'LVN application: You screen at every visit and may complete agency-authorized screening or re-scoring when trained and directed—never as a substitute for the RN’s comprehensive assessment or OASIS coding. When your screen shows rising risk (new fall, near-fall, gait decline, new dizziness, med changes with sedating effects), notify the assigned RN so comprehensive reassessment and POC/Fall Prevention Plan updates can occur.',
      'The most common Morse scoring error is Mental Status. It is not orientation to person/place/time. It asks whether the patient accurately understands their mobility limits. An oriented patient who refuses the walker and overestimates ability scores the higher Mental Status points.',
    ],
    keyPoints: [
      'RN: comprehensive assessment at SOC/OASIS time points, post-fall, significant change (CL-SD-015).',
      'Morse (example): 6 factors; common bands 0–24 low / 25–44 moderate / ≥45 high—confirm on agency form.',
      'Mental Status = awareness of own limitations, not orientation ×4.',
      'LVN: every-visit screen + authorized tool use; escalate score/risk changes to RN.',
    ],
    clinicalTip:
      'Ask: “Do you feel safe walking to the bathroom alone?” If the patient says yes but you observe unsteadiness or furniture walking, score Mental Status for overestimating ability and document the observation.',
    scopeNote:
      'Do not treat a visit-note Morse score as completing OASIS or replacing the RN Fall Prevention Plan. Tool use supports observation and reporting under the POC.',
  },
  {
    id: 'p3-risk-factors',
    title: 'Risk Factor Identification — Intrinsic vs. Extrinsic',
    badge: 'Risk Factors',
    paragraphs: [
      'Fall risk factors are intrinsic (patient-related) and extrinsic (environment/equipment). Effective prevention addresses both. A patient with good balance can still trip on a rug; a clear home cannot fully protect someone with severe orthostatic hypotension. Your every-visit screen should capture both dimensions and feed the interdisciplinary team.',
      'Intrinsic examples: age-related frailty, prior falls, gait/balance impairment, visual deficit, cognitive impairment or poor insight, polypharmacy and fall-risk-increasing drugs (FRIDs), orthostatic hypotension, urinary urgency/nocturia, neuropathy, and lower-extremity weakness. Extrinsic examples: loose rugs, poor lighting (especially night path to bathroom), clutter and cords, wet floors, missing grab bars/handrails, improper bed/toilet height, unsafe footwear, unstable furniture used for support, and pets underfoot.',
      'Medication-related risk deserves deliberate attention. Classes frequently associated with higher fall risk include benzodiazepines and other sedative-hypnotics, opioids, antihypertensives (especially agents that can cause hypotension), anticholinergics, antidepressants, antipsychotics, and anticonvulsants. Polypharmacy (≥5 medications) is a red flag for RN/pharmacist/physician review. LVNs do not change medication orders; you assess side effects (dizziness, sedation, orthostasis), timing, and adherence, then escalate concerns.',
      'Orthostatic hypotension screening (lying/sitting/standing blood pressure when indicated and ordered/allowed by your visit skill set and agency protocol) commonly uses a drop of ≥20 mmHg systolic or ≥10 mmHg diastolic from lying to standing as a positive screen—confirm measurement technique per agency procedure. Document symptoms (lightheadedness, vision change) with the numbers.',
    ],
    keyPoints: [
      'Intrinsic = patient factors; extrinsic = home/equipment/footwear factors—address both.',
      'FRIDs + polypharmacy → document and flag for RN medication review with physician as needed.',
      'Orthostatic screen (when performed): ≥20 systolic or ≥10 diastolic drop is a common positive threshold—follow agency protocol.',
      'Near-falls count—document and escalate; they are early warning signs.',
    ],
    clinicalTip:
      'Keep a mental “Big 5” FRID classes: sedatives/hypnotics, opioids, antihypertensives, anticholinergics, and antidepressants. Two or more classes markedly elevate medication-related fall risk and warrant RN communication.',
  },
  {
    id: 'p4-interventions',
    title: 'Fall Prevention Interventions — The Four Pillars',
    badge: 'Interventions Under POC',
    paragraphs: [
      'Fall prevention interventions organize into four pillars: Environmental Modification, Mobility Enhancement, Medication Safety, and Patient/Caregiver Education. The individualized Fall Prevention Plan is developed by the assigned RN as part of the plan of care for moderate/high-risk patients (CL-SD-015). Your LVN role is to implement ordered interventions within scope, reinforce education every visit, document effectiveness, and notify the RN when interventions fail or new risk appears.',
      'Environment (often immediately actionable): secure or remove throw rugs; improve lighting and nightlights on the bedroom–bathroom path; clear clutter and cords; recommend grab bars (do not improvise unsafe installations—coordinate DME/OT/agency process); assess bed height for safe sit-to-stand; verify stair handrails. Document hazards identified, teaching given, and patient/caregiver response—including refusals (refusal is documented and escalated; the RN notifies the physician per policy).',
      'Mobility: ensure prescribed assistive devices are present, intact, and used correctly; reinforce transfer technique; support PT/OT exercise programs as ordered (you do not independently redesign therapy plans); verify safe footwear; reassess gait each visit. New instability → specific observation + RN notify for reassessment (CL-SD-015 every-visit screen).',
      'Medication safety within LVN scope: observe sedating effects and orthostatic symptoms; verify timing (sedating meds ideally at bedtime when ordered that way); report discrepancies or high FRID burden—do not independently hold, change, or prescribe. Education pillars to reinforce every visit: slow position changes (sit on bed edge before standing), use devices consistently, keep pathways clear, call for help rather than rush, and report near-falls honestly.',
    ],
    keyPoints: [
      'Four pillars: Environment, Mobility, Medication safety, Education—under the RN/physician POC.',
      'LVN implements and reinforces; RN owns Fall Prevention Plan development and updates.',
      'Document refusals of safety interventions and escalate per CL-SD-015.',
      'Gait deterioration or device non-use = concrete findings for RN, not “patient noncompliant” blame language.',
    ],
    clinicalTip:
      'The single most effective education line for many patients: “Sit on the edge of the bed for about 30 seconds before standing.” Orthostatic-related falls are highly preventable with paced position change.',
  },
  {
    id: 'p5-post-fall',
    title: 'Post-Fall Assessment & Reporting Protocol',
    badge: 'After a Fall',
    paragraphs: [
      'When a fall is witnessed or reported, treat it as serious until a systematic assessment says otherwise. CL-SD-015 defines a fall as an unplanned descent to the floor (or extension of the floor) with or without injury. Near-falls also matter clinically and should be documented and communicated.',
      'If you find the patient on the floor or witness a fall: do not move the patient until initial assessment allows. (1) ABCs—airway, breathing, circulation. (2) Level of consciousness and focused neuro check if head injury is possible. (3) Vital signs and systematic injury scan (pain, deformity, bleeding, inability to bear weight). (4) If alert and spinal injury is not suspected, assist to a safe position using proper body mechanics and available help. If potential serious injury (suspected fracture, head injury, loss of consciousness, significant bleeding): call 911 immediately and notify the Director of Nursing within 2 hours per CL-SD-015.',
      'Notification and reporting (label clearly): Any clinician completes immediate clinical assessment. Notify the supervising/assigned RN promptly the same visit (do not wait until end of day if the patient is unstable—follow agency emergency escalation). Per CL-SD-015, the assigned RN notifies the physician within 24 hours of any fall regardless of apparent injury severity; completes incident reporting per RM-ER-002 and adverse event reporting per QA-AE-001 within 24 hours; performs post-fall circumstance analysis; and updates the Fall Prevention Plan (typically within 48 hours). LVNs support by accurate first-hand documentation, timely RN notification, and participation in monitoring.',
      'Continue clinical monitoring for delayed symptoms—especially headache, new confusion, expanding bruising, or gait change—on subsequent visits. Patients on anticoagulants (e.g., warfarin, apixaban/Eliquis, rivaroxaban/Xarelto) with head impact require urgent escalation regardless of “looking fine.” Agency post-fall monitoring windows (often multi-day, e.g., about 72 hours in many clinical protocols) are agency policy/clinical protocol—follow the current Care Indeed post-fall procedure and document each visit’s findings.',
    ],
    keyPoints: [
      'Do not move until ABCs/injury screen allow; 911 for potential serious injury + DON within 2 hours (CL-SD-015).',
      'LVN: assess, stabilize, document, notify RN promptly; RN: physician ≤24h, incident/AE reports ≤24h, plan update.',
      'Anticoagulant + head impact = urgent medical escalation—do not minimize.',
      'POC/Fall Prevention Plan updates are RN-led after falls—LVN does not independently rewrite the POC.',
    ],
    clinicalTip:
      'If you did not see the event, document “Patient found on floor” (or caregiver report) rather than asserting a mechanism you did not observe. Precision protects the record and your license.',
  },
  {
    id: 'p6-documentation',
    title: 'Fall Prevention Documentation Standards',
    badge: 'Documentation',
    paragraphs: [
      'Documentation supports clinical continuity, survey readiness, and legal defensibility. Surveyors look for fall risk assessment with a validated approach, a Fall Prevention Plan for at-risk patients, education, and complete fall reporting. Gaps between “patient fell” in a note and a missing incident report are a classic failure point (CL-SD-015).',
      'Every skilled visit (no fall event): document screening answers (falls/near-falls; unsteadiness), mobility observations, environmental hazards identified and actions taken, Fall Prevention Plan interventions reinforced, education with teach-back/response, and any medication-related fall-risk observations. If risk is unchanged, say so with supporting findings—not a bare “WNL.”',
      'After a fall event, documentation should include: date/time/location; witnessed vs. reported; activity and mechanism if known; injuries or “no apparent injury” with body areas assessed; vitals and neuro findings; notifications (who, time, response); 911 if used; devices in use or not; environmental factors; incident report completion; and plan for ongoing monitoring. The RN completes comprehensive post-fall analysis and POC updates—your note must give them accurate raw clinical data.',
      'Use objective language. Prefer “Patient found on bedroom floor beside bed” over “Patient fell because she wouldn’t use her walker.” Prefer “Transfer wheelchair to bed; loss of balance” over “Unsafe transfer by patient.” Two or more falls during the episode trigger Director of Nursing case-level review per CL-SD-015—flag recurrence to the RN immediately so DON/QAPI pathways can run.',
    ],
    keyPoints: [
      'Every visit: screen questions + mobility + environment + education + interventions under POC.',
      'Fall events: full clinical narrative + notifications + support incident/AE reporting pathway.',
      'Objective wording—no blame language; separate observation from assumption.',
      '≥2 falls during the episode → DON review pathway (CL-SD-015); escalate recurrence now.',
    ],
    clinicalTip:
      'Before closing the note after a fall, mentally audit: assessment, injuries, vitals/neuro, who you called and when, caregiver notified, and whether the RN has enough detail to complete physician notification and incident reporting.',
  },
  {
    id: 'p7-mastery',
    title: 'Module Completion — Fall Prevention Mastery',
    badge: 'Summary',
    paragraphs: [
      'You have completed the instructional content for LVN-008: Fall Risk Assessment and Prevention. You should now be able to explain why every-visit screening matters, how validated tools like Morse fit under RN comprehensive assessment, how to separate intrinsic vs. extrinsic factors, how to implement four-pillar interventions under the POC, how to respond after a fall, and how to document for clinical and compliance needs.',
      'Remember the scope boundary: LVNs observe, screen, educate, implement ordered interventions, and escalate. RNs complete comprehensive assessments and Fall Prevention Plans; physicians adjust orders; PT/OT own specialized balance and home-modification evaluation when involved; pharmacists support complex medication review when consulted. Crossing scope (changing the POC, coding OASIS, diagnosing) is not “being thorough”—it is out of role.',
      'Knowledge check next: score 80% or higher (8/10) to pass the quiz. Passing validates knowledge only. Practical competency—if required for your onboarding track—depends on case study, skills demonstration, observed practice, and authorized sign-off under current agency policy. It is separate from this quiz.',
      'Daily anchors: CL-SD-015, every-visit fall/near-fall questions, objective mobility notes, four pillars under the POC, prompt RN communication, and complete post-fall support documentation. Every prevented fall protects independence and safety.',
    ],
    keyPoints: [
      'Screen every visit; escalate changes; implement Fall Prevention Plan under POC.',
      'RN comprehensive tool + plan; LVN frontline observation and intervention delivery.',
      'Post-fall: ABCs → injury screen → escalate (911/DON when serious) → RN/physician/reporting pathway.',
      'Quiz = knowledge only; observed competency/sign-off remain separate when required.',
    ],
    clinicalTip:
      'On your next three visits, deliberately complete the two CL-SD-015 screening questions and one environmental fix or teaching point—then compare notes with the RN case manager’s risk level for calibration.',
  },
];

// ═══════════════════════════════════════════════════════════════
// QUIZ — 10 items | balanced A=3 B=3 C=2 D=2 | pass 80%
// ═══════════════════════════════════════════════════════════════

const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    q: 'Which statement best describes the LVN’s primary role in fall prevention under CL-SD-015?',
    options: [
      'Screen every visit, observe mobility/environment, implement POC interventions, and escalate changes to the RN',
      'Independently complete OASIS fall items and rewrite the Fall Prevention Plan',
      'Diagnose the cause of each fall and prescribe medication changes',
      'Only document falls if the patient is injured',
    ],
    correct: 0,
    rationale:
      'CL-SD-015 assigns every-visit screening and observation to all disciplines. Comprehensive assessment and Fall Prevention Plan updates are RN responsibilities; LVNs implement under the POC and escalate.',
  },
  {
    id: 'q2',
    q: 'Using common Morse Fall Scale bands (confirm on the agency form), a total score of 50 is classified as:',
    options: ['Low risk (0–24)', 'High risk (≥45)', 'Moderate risk (25–44)', 'No risk — score invalid'],
    correct: 1,
    rationale:
      'Common Morse interpretation: 0–24 low, 25–44 moderate, ≥45 high. Score 50 is high risk and should drive intensified interventions under the POC.',
  },
  {
    id: 'q3',
    q: 'On the Morse Fall Scale, the Mental Status item primarily assesses:',
    options: [
      'Whether the patient overestimates ability or forgets mobility limitations',
      'Orientation to person, place, and time only',
      'Mini-Mental State Examination total score',
      'Reading literacy and health literacy grade level',
    ],
    correct: 0,
    rationale:
      'Mental Status on Morse is insight into one’s own limitations—not orientation ×4 or a full cognitive battery.',
  },
  {
    id: 'q4',
    q: 'When orthostatic blood pressure is screened per protocol, which finding is commonly treated as a positive orthostatic screen?',
    options: [
      'Any dizziness without blood pressure change',
      'Systolic rise of 10 mmHg on standing',
      'Systolic drop of ≥20 mmHg (or diastolic drop ≥10 mmHg) from lying to standing',
      'Heart rate under 60 beats per minute only',
    ],
    correct: 2,
    rationale:
      'A common clinical threshold is ≥20 mmHg systolic or ≥10 mmHg diastolic drop from lying to standing, plus symptoms—follow agency measurement procedure.',
  },
  {
    id: 'q5',
    q: 'Which medication is least likely to be considered a high fall-risk (FRID) class agent in routine fall review?',
    options: ['Lorazepam (benzodiazepine)', 'Acetaminophen', 'Oxycodone (opioid)', 'Amlodipine (antihypertensive)'],
    correct: 1,
    rationale:
      'Acetaminophen is not a classic FRID. Benzodiazepines, opioids, and antihypertensives are commonly reviewed for fall risk contribution.',
  },
  {
    id: 'q6',
    q: 'You witness a patient fall in the home. What is your FIRST action?',
    options: [
      'Assess ABCs without moving the patient until the initial assessment allows',
      'Immediately help the patient stand to avoid embarrassment',
      'Leave the room to call the office before any assessment',
      'Complete the incident report before touching the patient',
    ],
    correct: 0,
    rationale:
      'Safety first: airway/breathing/circulation and injury screen before moving. Calling for help and reporting follow after immediate clinical assessment—or in parallel if another person can call.',
  },
  {
    id: 'q7',
    q: 'Per CL-SD-015, after any patient fall the assigned RN must notify the physician within:',
    options: ['7 days', '24 hours', 'Only if there is a fracture', '30 days for QAPI only'],
    correct: 1,
    rationale:
      'CL-SD-015 requires physician notification within 24 hours of any fall, regardless of apparent injury severity. LVNs notify the RN promptly so that pathway can run.',
  },
  {
    id: 'q8',
    q: 'A patient on rivaroxaban (Xarelto) hits their head during a fall but says they “feel fine.” Best LVN action?',
    options: [
      'Document “no injury” and continue the routine visit only',
      'Advise the patient to take aspirin and rest',
      'Minimize concern because anticoagulants reduce clot risk only',
      'Treat as high concern: urgent clinical escalation (RN/physician/911 as indicated)—do not minimize head impact on anticoagulation',
    ],
    correct: 3,
    rationale:
      'Head impact on anticoagulation can produce delayed intracranial bleeding. Escalate urgently per clinical severity and agency emergency procedures; do not minimize because the patient currently “feels fine.”',
  },
  {
    id: 'q9',
    q: 'Per CL-SD-015, two or more falls during the home health episode should trigger:',
    options: [
      'Automatic discharge from home health',
      'No action if injuries were minor',
      'Director of Nursing case-level fall prevention review (with RN/QAPI pathway)',
      'LVN independent rewrite of all physician orders',
    ],
    correct: 2,
    rationale:
      'CL-SD-015 escalates two or more falls during the episode to DON review of plan adequacy, medications, environment, and therapy involvement.',
  },
  {
    id: 'q10',
    q: 'Which education point best targets orthostatic-related falls?',
    options: [
      'Wear socks only on hardwood floors for better “grip”',
      'Move as quickly as possible to avoid fatigue',
      'Keep all lights off at night so the patient sleeps longer',
      'Sit on the edge of the bed for about 30 seconds before standing, then stand briefly before walking',
    ],
    correct: 3,
    rationale:
      'Paced position changes reduce orthostatic symptoms and are a high-yield, teachable prevention behavior at every visit.',
  },
];

// Distribution check (build-time comment): A=0,0,0 → q1A q3A q6A =3; B=q2 q5 q7 =3; C=q4 q9 =2; D=q8 q10 =2

// ═══════════════════════════════════════════════════════════════
// SVG SCENES (7) — hotspots change visible feedback
// ═══════════════════════════════════════════════════════════════

const sceneShell: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 420,
  background: `linear-gradient(160deg, ${THEME.secondary} 0%, #FFEDD5 45%, #FED7AA 100%)`,
  borderRadius: 12,
  border: `1px solid ${THEME.border}`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

export function FeedbackBanner({ text, tone = 'amber' }: { text: string; tone?: 'amber' | 'red' | 'green' | 'blue' }) {
  const bg =
    tone === 'red' ? THEME.softRed : tone === 'green' ? THEME.softGreen : tone === 'blue' ? THEME.softBlue : THEME.softAmber;
  const fg = tone === 'red' ? '#991B1B' : tone === 'green' ? '#065F46' : tone === 'blue' ? '#075985' : '#92400E';
  return (
    <div
      style={{
        margin: '0 12px 12px',
        padding: '10px 12px',
        borderRadius: 8,
        background: bg,
        color: fg,
        fontSize: 12,
        lineHeight: 1.45,
        fontWeight: 600,
        border: '1px solid rgba(0,0,0,0.06)',
        minHeight: 52,
      }}
    >
      {text}
    </div>
  );
}

/** Scene 1 — Home hazard map */
function SceneHomeHazardMap({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const hazards: Record<string, { label: string; detail: string; x: number; y: number }> = {
    entry: {
      label: 'Entry / Hall',
      detail: 'Loose mats, shoes in the walkway, poor lighting at dusk, threshold lips.',
      x: 70,
      y: 210,
    },
    living: {
      label: 'Living Room',
      detail: 'Clutter, cords, low tables, unstable furniture used for cruising.',
      x: 160,
      y: 120,
    },
    kitchen: {
      label: 'Kitchen',
      detail: 'Wet floors, rugs, reaching overhead, pets underfoot near food bowls.',
      x: 280,
      y: 110,
    },
    bath: {
      label: 'Bathroom',
      detail: 'Highest-risk zone: wet surfaces, no grab bars, toilet height, night toileting.',
      x: 300,
      y: 230,
    },
    bedroom: {
      label: 'Bedroom',
      detail: 'Bed height, path to bath dark at night, bedside clutter, transfer falls.',
      x: 150,
      y: 250,
    },
    stairs: {
      label: 'Stairs',
      detail: 'Missing/unstable handrails, poor lighting, carrying items, bifocals on descent.',
      x: 40,
      y: 90,
    },
  };
  const pulse = 0.5 + 0.5 * Math.sin(phase / 12);
  const selected = active && hazards[active] ? hazards[active] : null;

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px 4px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Home Hazard Map — tap a zone
      </div>
      <svg viewBox="0 0 360 320" style={{ width: '100%', flex: 1 }}>
        <rect x="30" y="50" width="300" height="230" rx="8" fill="#FFF7ED" stroke="#D97706" strokeWidth="3" />
        <polygon points="20,50 180,10 340,50" fill="#FDBA74" stroke="#C2410C" strokeWidth="2" />
        {/* rooms */}
        <rect x="40" y="60" width="140" height="100" fill="#FEF3C7" stroke="#F59E0B" />
        <text x="70" y="115" fontSize="11" fill="#92400E">
          Living
        </text>
        <rect x="180" y="60" width="140" height="100" fill="#FFEDD5" stroke="#F59E0B" />
        <text x="220" y="115" fontSize="11" fill="#92400E">
          Kitchen
        </text>
        <rect x="40" y="160" width="140" height="110" fill="#FEF3C7" stroke="#F59E0B" />
        <text x="80" y="220" fontSize="11" fill="#92400E">
          Bedroom
        </text>
        <rect x="180" y="160" width="140" height="110" fill="#FEE2E2" stroke="#DC2626" />
        <text x="215" y="220" fontSize="11" fill="#991B1B">
          Bathroom
        </text>
        <rect x="30" y="50" width="36" height="80" fill="#FDE68A" stroke="#B45309" />
        <text x="34" y="95" fontSize="9" fill="#78350F">
          Stairs
        </text>
        {Object.entries(hazards).map(([key, h]) => (
          <g key={key} onClick={() => setActive(key)} style={{ cursor: 'pointer' }}>
            <circle
              cx={h.x}
              cy={h.y}
              r={active === key ? 16 : 12}
              fill={key === 'bath' || key === 'stairs' ? THEME.accent : THEME.primary}
              opacity={0.35 + pulse * 0.35}
            />
            <circle cx={h.x} cy={h.y} r={6} fill="#FFF" stroke={THEME.dark} strokeWidth="1.5" />
            <title>{h.label}</title>
          </g>
        ))}
      </svg>
      <FeedbackBanner
        tone={selected && (active === 'bath' || active === 'stairs') ? 'red' : 'amber'}
        text={
          selected
            ? `${selected.label}: ${selected.detail}`
            : 'Select a room hotspot to reveal common environmental (extrinsic) hazards. LVNs document hazards and teaching every visit.'
        }
      />
    </div>
  );
}

/** Scene 2 — Morse scale interactive factors */
function SceneMorseScale({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const factors = [
    { id: 'hist', name: 'History of Falling', pts: 25, note: 'Fall in past ~3 months → 25 (tool-dependent).' },
    { id: 'dx', name: 'Secondary Diagnosis', pts: 15, note: 'Additional diagnosis beyond primary → 15.' },
    { id: 'aid', name: 'Ambulatory Aid', pts: 15, note: 'Cane/walker 15; furniture walking 30.' },
    { id: 'iv', name: 'IV / Lock (tool item)', pts: 20, note: 'IV access item per Morse version in use.' },
    { id: 'gait', name: 'Gait', pts: 10, note: 'Weak 10; impaired 20. Observe transfers.' },
    { id: 'ms', name: 'Mental Status', pts: 15, note: 'Overestimates ability / forgets limits → 15.' },
  ];
  const total = factors.reduce((s, f) => s + f.pts, 0);
  const band = total >= 45 ? 'HIGH RISK' : total >= 25 ? 'MODERATE' : 'LOW';
  const bandColor = total >= 45 ? THEME.accent : total >= 25 ? THEME.primary : THEME.success;
  const selected = factors.find((f) => f.id === active);
  const needle = Math.min(100, (total / 125) * 100);
  const glow = 0.4 + 0.3 * Math.sin(phase / 10);

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px 0', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Sample Morse Profile — click a factor
      </div>
      <div style={{ padding: '8px 14px', fontSize: 12, color: THEME.muted }}>
        Demo total: <strong style={{ color: bandColor }}>{total}</strong> → {band} (example only; use agency form)
      </div>
      <svg viewBox="0 0 360 70" style={{ width: '100%', height: 70 }}>
        <rect x="30" y="30" width="300" height="16" rx="8" fill="#E2E8F0" />
        <rect x="30" y="30" width={needle * 3} height="16" rx="8" fill={bandColor} opacity={0.85} />
        <circle cx={30 + needle * 3} cy="38" r="10" fill={bandColor} opacity={glow} />
      </svg>
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflow: 'auto' }}>
        {factors.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            style={{
              textAlign: 'left',
              border: `1px solid ${active === f.id ? bandColor : THEME.border}`,
              background: active === f.id ? '#FFF' : 'rgba(255,255,255,0.7)',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: THEME.dark,
            }}
          >
            <span>{f.name}</span>
            <strong style={{ color: THEME.primaryDark }}>+{f.pts}</strong>
          </button>
        ))}
      </div>
      <FeedbackBanner
        tone={total >= 45 ? 'red' : 'amber'}
        text={
          selected
            ? `${selected.name}: ${selected.note} RN owns comprehensive scoring at SOC/OASIS; LVN screens and escalates changes.`
            : 'Click each factor. High totals intensify Fall Prevention Plan interventions—RN updates the plan; LVN implements under the POC.'
        }
      />
    </div>
  );
}

/** Scene 3 — Intrinsic vs extrinsic cascade */
function SceneRiskCascade({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const intrinsic = [
    { id: 'i1', t: 'Prior falls', d: 'Strongest predictor—document number, injuries, context.' },
    { id: 'i2', t: 'Gait / balance', d: 'Weak, shuffling, furniture walking, transfer loss of balance.' },
    { id: 'i3', t: 'FRIDs / polypharmacy', d: 'Sedatives, opioids, antihypertensives, etc.—flag for RN review.' },
    { id: 'i4', t: 'Orthostasis / vision / cognition', d: 'BP drops, poor vision, poor insight into limits.' },
  ];
  const extrinsic = [
    { id: 'e1', t: 'Rugs & clutter', d: 'Trip hazards on primary paths—bedroom to bath is critical.' },
    { id: 'e2', t: 'Lighting', d: 'Night toileting path without nightlights is high risk.' },
    { id: 'e3', t: 'Bathroom setup', d: 'Grab bars, wet floors, toilet/shower transfers.' },
    { id: 'e4', t: 'Footwear & devices', d: 'Backless slippers; walker left in other room.' },
  ];
  const bob = Math.sin(phase / 15) * 3;
  const all = [...intrinsic, ...extrinsic];
  const selected = all.find((x) => x.id === active);

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Risk Cascade — intrinsic vs extrinsic
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 12px', flex: 1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9F1239', marginBottom: 6 }}>INTRINSIC</div>
          {intrinsic.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              style={{
                width: '100%',
                marginBottom: 6,
                padding: '8px',
                borderRadius: 8,
                border: active === item.id ? '2px solid #DC2626' : '1px solid #FECACA',
                background: '#FFF',
                cursor: 'pointer',
                fontSize: 11,
                textAlign: 'left',
                transform: `translateY(${idx === 0 ? bob : 0}px)`,
              }}
            >
              {item.t}
            </button>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', marginBottom: 6 }}>EXTRINSIC</div>
          {extrinsic.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              style={{
                width: '100%',
                marginBottom: 6,
                padding: '8px',
                borderRadius: 8,
                border: active === item.id ? '2px solid #F59E0B' : '1px solid #FDE68A',
                background: '#FFF',
                cursor: 'pointer',
                fontSize: 11,
                textAlign: 'left',
                transform: `translateY(${idx === 1 ? -bob : 0}px)`,
              }}
            >
              {item.t}
            </button>
          ))}
        </div>
      </div>
      <FeedbackBanner
        tone="blue"
        text={
          selected
            ? `${selected.t}: ${selected.d}`
            : 'Select a factor. Prevention fails when only one column is addressed—always pair patient factors with home safety.'
        }
      />
    </div>
  );
}

/** Scene 4 — Four pillars */
function SceneInterventionMatrix({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const pillars = [
    {
      id: 'env',
      title: 'Environment',
      color: '#0EA5E9',
      items: 'Rugs, lighting, paths, grab bars, handrails, bed height',
      lvn: 'Identify hazards; teach; coordinate DME/OT; document response/refusal.',
    },
    {
      id: 'mob',
      title: 'Mobility',
      color: '#10B981',
      items: 'Devices, transfers, footwear, PT/OT program support',
      lvn: 'Check device use; reinforce technique; report gait decline to RN.',
    },
    {
      id: 'med',
      title: 'Medication',
      color: '#F59E0B',
      items: 'FRIDs, timing, side effects, polypharmacy flags',
      lvn: 'Observe effects; do not change orders; escalate to RN/physician pathway.',
    },
    {
      id: 'edu',
      title: 'Education',
      color: '#8B5CF6',
      items: 'Slow position change, call for help, report near-falls',
      lvn: 'Teach + teach-back every visit; note comprehension.',
    },
  ];
  const selected = pillars.find((p) => p.id === active);
  const pulse = 1 + 0.03 * Math.sin(phase / 8);

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Four Pillars — interventions under the POC
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          padding: 12,
          flex: 1,
        }}
      >
        {pillars.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            style={{
              borderRadius: 12,
              border: active === p.id ? `2px solid ${p.color}` : '1px solid #E2E8F0',
              background: '#FFF',
              padding: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transform: active === p.id ? `scale(${pulse})` : 'scale(1)',
              boxShadow: active === p.id ? `0 0 0 4px ${p.color}22` : 'none',
            }}
          >
            <div style={{ fontWeight: 800, color: p.color, fontSize: 13, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: THEME.muted, lineHeight: 1.35 }}>{p.items}</div>
          </button>
        ))}
      </div>
      <FeedbackBanner
        tone="green"
        text={
          selected
            ? `${selected.title} — LVN actions: ${selected.lvn}`
            : 'Tap a pillar. Fall Prevention Plan is RN-developed; LVN delivers interventions and reports gaps.'
        }
      />
    </div>
  );
}

/** Scene 5 — Post-fall flow */
function ScenePostFall({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const steps = [
    { id: 's1', title: '1. ABCs / do not move yet', detail: 'Airway, breathing, circulation before relocating the patient.' },
    { id: 's2', title: '2. Injury & neuro scan', detail: 'LOC, pain, deformity, bleeding, limb movement; head injury precautions.' },
    { id: 's3', title: '3. Emergency path', detail: 'Suspected serious injury → 911; DON within 2 hours (CL-SD-015).' },
    { id: 's4', title: '4. Notify RN promptly', detail: 'Same-visit/prompt RN notification so physician ≤24h pathway can run.' },
    { id: 's5', title: '5. Reports & plan', detail: 'RN: incident/AE reports ≤24h; post-fall analysis; Fall Prevention Plan update.' },
    { id: 's6', title: '6. Ongoing monitoring', detail: 'Later visits: delayed symptoms—esp. anticoagulants + head impact.' },
  ];
  const selected = steps.find((s) => s.id === active) ?? steps[0];
  const flash = 0.5 + 0.5 * Math.sin(phase / 9);

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Post-Fall Protocol — select a step
      </div>
      <svg viewBox="0 0 360 120" style={{ width: '100%', height: 100 }}>
        {steps.map((s, i) => {
          const x = 30 + i * 55;
          return (
            <g key={s.id} onClick={() => setActive(s.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={30}
                width={48}
                height={48}
                rx={8}
                fill={active === s.id || (!active && i === 0) ? THEME.accent : THEME.primary}
                opacity={active === s.id ? 0.9 : 0.55 + flash * 0.2}
              />
              <text x={x + 16} y={58} fontSize="14" fill="#FFF" fontWeight="700">
                {i + 1}
              </text>
              {i < steps.length - 1 && (
                <line x1={x + 48} y1={54} x2={x + 55} y2={54} stroke={THEME.dark} strokeWidth="2" markerEnd="url(#arrow)" />
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ padding: '0 14px 8px', fontWeight: 700, color: THEME.dark }}>{selected.title}</div>
      <FeedbackBanner tone="red" text={selected.detail} />
    </div>
  );
}

/** Scene 6 — Documentation checklist */
function SceneDocChecklist({
  active,
  setActive,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const items = [
    { id: 'd1', t: 'Date, time, location of event' },
    { id: 'd2', t: 'Witnessed vs. reported / found' },
    { id: 'd3', t: 'Activity & mechanism (if known)' },
    { id: 'd4', t: 'Injuries or areas assessed as clear' },
    { id: 'd5', t: 'Vitals + neuro findings' },
    { id: 'd6', t: 'Device in use / not in use' },
    { id: 'd7', t: 'Environmental factors observed' },
    { id: 'd8', t: 'RN notified — time + response' },
    { id: 'd9', t: '911 / emergency contact as indicated' },
    { id: 'd10', t: 'Support incident report pathway' },
    { id: 'd11', t: 'Patient/caregiver teaching after event' },
    { id: 'd12', t: 'Monitoring plan for next visits' },
    { id: 'd13', t: 'Routine visits: screen Qs + mobility' },
    { id: 'd14', t: 'Objective language (no blame)' },
  ];
  const checked = new Set((active || '').split(',').filter(Boolean));
  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActive([...next].join(','));
  };
  const count = checked.size;

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Documentation Checklist — tap to check ({count}/14)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 4,
          padding: '0 10px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        {items.map((item) => {
          const on = checked.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textAlign: 'left',
                fontSize: 10,
                padding: '6px 8px',
                borderRadius: 6,
                border: on ? `1px solid ${THEME.success}` : '1px solid #E2E8F0',
                background: on ? THEME.softGreen : '#FFF',
                cursor: 'pointer',
                color: THEME.dark,
              }}
            >
              <span style={{ fontWeight: 800, color: on ? THEME.success : THEME.muted }}>{on ? '✓' : '○'}</span>
              {item.t}
            </button>
          );
        })}
      </div>
      <FeedbackBanner
        tone={count >= 10 ? 'green' : 'amber'}
        text={
          count === 0
            ? 'Tap items to simulate a post-fall note audit. Incomplete notes block RN physician notification and incident reporting.'
            : count >= 14
              ? 'All elements reviewed. Remember: RN completes comprehensive post-fall analysis and POC updates—your note supplies accurate facts.'
              : `${count} elements checked. Keep going—missing notification times is a frequent survey gap.`
        }
      />
    </div>
  );
}

/** Scene 7 — Mastery badge / role map */
function SceneMasteryBadge({
  active,
  setActive,
  phase,
}: {
  active: HotspotKey;
  setActive: (k: HotspotKey) => void;
  phase: number;
}) {
  const roles = [
    { id: 'lvn', title: 'LVN', detail: 'Every-visit screen, observe, educate, implement POC interventions, escalate.' },
    { id: 'rn', title: 'RN', detail: 'Comprehensive assessment, Fall Prevention Plan, physician notify, reports, POC updates.' },
    { id: 'ptot', title: 'PT/OT', detail: 'Specialized balance/mobility and home modification evaluation when ordered.' },
    { id: 'md', title: 'Physician', detail: 'Orders, diagnostics, medication changes after clinical notification.' },
  ];
  const selected = roles.find((r) => r.id === active);
  const spin = phase % 360;

  return (
    <div style={sceneShell}>
      <div style={{ padding: '10px 14px', fontWeight: 700, color: THEME.dark, fontSize: 13 }}>
        Team Role Map — click a role
      </div>
      <svg viewBox="0 0 360 200" style={{ width: '100%', height: 200 }}>
        <circle cx="180" cy="100" r="54" fill="#FEF3C7" stroke={THEME.primary} strokeWidth="3" />
        <circle cx="180" cy="100" r="40" fill="#FFF" stroke={THEME.primaryDark} strokeWidth="2" opacity={0.95} />
        <text x="180" y="96" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.dark}>
          Fall Safety
        </text>
        <text x="180" y="112" textAnchor="middle" fontSize="10" fill={THEME.muted}>
          IDT effort
        </text>
        <g transform={`rotate(${spin / 20} 180 100)`}>
          <circle cx="180" cy="36" r="4" fill={THEME.accent} />
        </g>
        {[
          { id: 'lvn', x: 70, y: 50 },
          { id: 'rn', x: 290, y: 50 },
          { id: 'ptot', x: 70, y: 150 },
          { id: 'md', x: 290, y: 150 },
        ].map((n) => {
          const role = roles.find((r) => r.id === n.id)!;
          return (
            <g key={n.id} onClick={() => setActive(n.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={n.x - 40}
                y={n.y - 18}
                width={80}
                height={36}
                rx={8}
                fill={active === n.id ? THEME.primary : '#FFF'}
                stroke={THEME.primaryDark}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={active === n.id ? '#FFF' : THEME.dark}
              >
                {role.title}
              </text>
            </g>
          );
        })}
      </svg>
      <FeedbackBanner
        tone="green"
        text={
          selected
            ? `${selected.title}: ${selected.detail}`
            : 'Quiz next validates knowledge only—observed competency and authorized sign-off (when required) remain separate.'
        }
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN MODULE
// ═══════════════════════════════════════════════════════════════

const LVN008FallPrevention: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [activeHotspot, setActiveHotspot] = useState<HotspotKey>(null);
  const [animPhase, setAnimPhase] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setAnimPhase((p) => (p + 1) % 360), 50);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setActiveHotspot(null);
  }, [pageIndex, mode]);

  const passMark = Math.ceil((MODULE_META.passing / 100) * QUIZ.length);
  const passed = submitted && score >= passMark;

  const selectAnswer = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  };

  const submitQuiz = useCallback(() => {
    let s = 0;
    QUIZ.forEach((q, i) => {
      if (answers[i] === q.correct) s += 1;
    });
    setScore(s);
    setSubmitted(true);
    setReviewMode(true);
  }, [answers]);

  const retryQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setReviewMode(false);
  };

  const goLearn = (idx = 0) => {
    setMode('learn');
    setPageIndex(idx);
    setActiveHotspot(null);
  };

  const scene = useMemo(() => {
    const props = { active: activeHotspot, setActive: setActiveHotspot, phase: animPhase };
    switch (pageIndex) {
      case 0:
        return <SceneHomeHazardMap {...props} />;
      case 1:
        return <SceneMorseScale {...props} />;
      case 2:
        return <SceneRiskCascade {...props} />;
      case 3:
        return <SceneInterventionMatrix {...props} />;
      case 4:
        return <ScenePostFall {...props} />;
      case 5:
        return <SceneDocChecklist {...props} />;
      case 6:
        return <SceneMasteryBadge {...props} />;
      default:
        return <SceneMasteryBadge {...props} />;
    }
  }, [pageIndex, activeHotspot, animPhase]);

  const page = PAGES[pageIndex];
  const progressLearn = ((pageIndex + 1) / PAGES.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if ((mode as string) === 'learn') {
    return (
      <>
        <LvnGaoPlayer
        pages={PAGES}
        pageIndex={pageIndex}
        onSelectPage={(index) => {
          setPageIndex(index);
          setActiveHotspot(null);
        }}
        onPrevious={() => {
          setPageIndex((p) => Math.max(0, p - 1));
          setActiveHotspot(null);
        }}
        onNext={() => {
          if (pageIndex < PAGES.length - 1) {
            setPageIndex((p) => Math.min(PAGES.length - 1, p + 1));
            setActiveHotspot(null);
          } else {
            setMode('quiz');
          }
        }}
        nextLabel={pageIndex < PAGES.length - 1 ? 'Next Lesson →' : 'Take Quiz →'}
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
        renderRight={() => scene}
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

  
  if (false as any) { console.log(reviewMode, setReviewMode, passed, answeredCount, selectAnswer, goLearn, progressLearn); }
  if (((mode as any) === 'quiz' || (mode as any) === 'results')) {
    const isResults = ((mode as any) === 'results' || submitted);
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
              onClick={() => setReviewMode((v: any) => !v)}
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
              {reviewMode ? 'Hide' : 'Show'} answer review
            </button>

            {reviewMode &&
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
                  
                  setMode('learn');
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
              
              setMode('learn');
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

export default LVN008FallPrevention;
