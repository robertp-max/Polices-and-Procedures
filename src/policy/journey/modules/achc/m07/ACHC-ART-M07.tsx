/**
 * ACHC-ART-M07 — Workplace & Patient Safety / OSHA
 * Pass 5 learner module; LVN-002 v5.3.5 is the visual/runtime source of truth.
 * Pages: 7 scenes + Knowledge Check | Hotspots: 33 | Quiz: 10 | Pass: 80%
 * This knowledge module does not expand scope or replace practical competency validation.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-iipp-foundations.png';
import img02 from './assets/lesson-02-hazard-scan.png';
import img03 from './assets/lesson-03-personal-security.png';
import img04 from './assets/lesson-04-ergonomics-falls.png';
import img05 from './assets/lesson-05-hazard-communication.png';
import img06 from './assets/lesson-06-reporting-driving.png';
import img07 from './assets/lesson-07-integrated-simulation.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#C2410C', orangeDark: '#9A3412', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#B91C1C',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'authorized' | 'conditional' | 'prohibited' | 'neutral';
interface Hotspot {
  id: string;
  label: string;       // full name (aria + panel)
  shortLabel: string;  // visible chip (≥11px, concise)
  x: number; y: number; zone: ZoneKind;
  info: string; meaning: string; action: string; notify?: string; document: string; policyRefs: string[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  narration: string[]; overviewCount: number; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; sceneAlt: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  authorized: { label: 'Safe action', color: CI.teal, soft: CI.tealSoft },
  conditional: { label: 'Pause and control', color: CI.orange, soft: '#FFF3EC' },
  prohibited: { label: 'Stop or exit', color: CI.red, soft: '#FEF2F2' },
  neutral: { label: 'Guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'ACHC-ART-M07', title: 'Workplace & Patient Safety / OSHA', pages: 7, quizCount: 10, passing: 80 };

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'IIPP Foundations',
    title: 'Safety Is a System: Your IIPP Role',
    subtitle: 'Know who prevents, who reports, and who corrects',
    narration: [
      'Workplace safety in California home health is not a personal checklist carried by one careful worker. It is a shared system. Cal/OSHA requires the employer to establish, implement, and maintain an effective written Injury and Illness Prevention Program, or IIPP. The program identifies responsibility, communication, hazard evaluation, incident investigation, correction, training, and employee access. Your everyday observations make that system real in homes the agency does not control.',
      'Your role is active but bounded: follow safe work practices, use controls and equipment as trained, report hazards and near misses, ask when instructions are unclear, and stop an affected task when a condition cannot be controlled safely. The employer remains responsible for the program, training, investigation, and timely correction. Reporting a problem is participation in prevention—not an admission that you caused it.',
      'The IIPP must name the person or job role with authority and responsibility for implementation. It must also give employees a way to communicate safety concerns in language they understand and without fear of reprisal. Use the current agency reporting route in your employee resources. This module intentionally does not invent a telephone number, duress phrase, or on-call sequence; those operational details must come from the approved plan available to you.',
      'Worker rights support participation. Employees may raise safety concerns to the employer or government and exercise protected safety rights without retaliation. California Labor Code section 6310 protects good-faith reporting of unsafe conditions, work-related injury, or illness. Protection from retaliation does not eliminate the duty to report accurately. State what you directly observed, distinguish fact from what someone told you, and avoid blame or speculation.',
      'Employees also have a right and procedure to access the IIPP. Access means a real opportunity to examine and receive the applicable program. Knowing the written plan helps you identify who owns correction, how to report, what follow-up to expect, and which procedures apply to your assignment. If you cannot locate the current program or reporting route, ask the designated safety leader or supervisor before a non-routine hazard occurs.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '🛡️', title: 'Know the program', detail: 'Use the current IIPP, safety lead, and approved reporting route.' },
      { icon: '👁️', title: 'Report conditions', detail: 'Describe hazards, near misses, and changes without blame.' },
      { icon: '⏸️', title: 'Pause unsafe work', detail: 'Stop the affected task when the condition is not safely controlled.' },
      { icon: '🔁', title: 'Support correction', detail: 'Share facts and participate in training, review, and follow-up.' },
    ],
    clinicalTip: 'A near miss is useful safety information. Report what almost happened while the system still has time to prevent harm.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR § 3203' },
      { kind: 'Worker rights', text: 'Labor Code § 6310' },
      { kind: 'Care Indeed policy', text: 'RM-OS-101; RM-ER-002' },
    ],
    sceneImage: img01,
    sceneAlt: 'Home-health clinician pauses at an apartment entrance while an older adult waits safely inside; a curled rug, crossing cord, cleaning bottle, and overloaded outlet are visible.',
    hotspots: [
      {
        id: 'pause', label: 'Pre-entry safety pause', shortLabel: 'Pause & Scan', x: 31, y: 41, zone: 'authorized',
        info: 'The worker pauses at entry and sees the patient, exit, path, chemical, and electrical setup.',
        meaning: 'Each home is a changing workplace; entry scanning finds hazards before exposure.',
        action: 'Compare current conditions with known risks. Control, pause, or seek direction before the task.',
        notify: 'Report any new hazard that affects the visit or exceeds your authority.',
        document: 'Record the condition, location, affected task, control, notification, and outcome.',
        policyRefs: ['8 CCR § 3203(a)(4)', 'RM-OS-101'],
      },
      {
        id: 'near-miss', label: 'Near-miss walking hazards', shortLabel: 'Near Miss', x: 48, y: 88, zone: 'conditional',
        info: 'A curled rug and power cord cross the entry path, exposing everyone who uses it.',
        meaning: 'A near miss reveals a correctable weakness before injury occurs.',
        action: 'Do not step over the hazards. Use only an authorized temporary control, preserve egress, and escalate for correction.',
        notify: 'Report the condition and alert the clinical supervisor if care or mobility is affected.',
        document: 'Describe locations, exposure, temporary control, notification, and the visit decision.',
        policyRefs: ['8 CCR § 3203(a)(3)-(6)', 'RM-PS-001'],
      },
      {
        id: 'new-chemical', label: 'New chemical training trigger', shortLabel: 'New Chemical', x: 89, y: 55, zone: 'conditional',
        info: 'A cleaning spray is present, but appearance alone cannot establish its identity or safe use.',
        meaning: 'New chemical hazards require evaluation and instruction before occupational use.',
        action: 'Do not use it until identity, label, SDS, controls, and task instruction are verified.',
        notify: 'Report any new, unlabeled, damaged, or unfamiliar product.',
        document: 'Record the container, location, affected task, action withheld, and direction.',
        policyRefs: ['8 CCR § 3203(a)(7)', '8 CCR § 5194(h)'],
      },
      {
        id: 'correction', label: 'System-level electrical correction', shortLabel: 'Correct System', x: 89, y: 78, zone: 'prohibited',
        info: 'Crowded plugs and crossing cords create electrical and trip hazards.',
        meaning: 'Durable correction must address the condition, not rely on reminders.',
        action: 'Keep people away, stop the affected task, and escalate. Never rewire or improvise repairs.',
        notify: 'Notify the agency; call 911 for fire, smoke, arcing, or immediate danger.',
        document: 'Describe visible conditions, protections, notifications, and the visit decision without diagnosing a defect.',
        policyRefs: ['8 CCR § 3203(a)(6)', 'RM-PS-001'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Hazard Scan',
    title: 'Scan, Control, Escalate',
    subtitle: 'A safe visit starts before the first task',
    narration: [
      'Use the same scan at four points: while approaching the home, at the threshold, before each task, and whenever conditions change. Look for access and egress, lighting, floors, stairs, pets, people, smoke or odors, utilities, heat or cold, electrical conditions, chemicals, equipment, available space, and patient-specific safety needs. A condition that was safe last week may be unsafe today.',
      'Classify the finding before acting. A manageable hazard can be controlled safely within your authority and with the household’s agreement. A task-stopping hazard prevents one activity until a safe plan is restored. An imminent hazard presents an immediate threat of serious harm and requires exposed people to move away, emergency help when indicated, and prompt agency notification. Do not use schedule pressure as a fourth category.',
      'The hierarchy of controls helps select stronger solutions. In preferred order, eliminate the hazard, substitute a safer option, use an engineering control, use an administrative or work-practice control, and use personal protective equipment. PPE can be important, but it sits lower because the hazard remains and protection depends on correct selection and use. A glove does not make an unknown chemical known; sturdy shoes do not make a blocked exit acceptable.',
      'Stop-work is task-specific unless the entire environment is unsafe. You may be able to complete a seated education task in a clear area while a transfer remains on hold. Conversely, smoke near oxygen, active violence, fire, exposed live electricity, or an exit that cannot be maintained may make the whole scene unsafe. Reach safety first, call 911 for an immediate emergency, then notify the agency without delay.',
      'Close the loop by documenting the condition, risk decision, control, teaching, response, notification, and plan for the next visit. Avoid labels such as “noncompliant” or “hoarder.” Observable language—“three boxes reduced the hallway width and blocked the door from opening fully”—supports a defensible correction plan.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '🔎', title: 'Scan repeatedly', detail: 'Approach, entry, before the task, and after any change.' },
      { icon: '🧱', title: 'Choose strong controls', detail: 'Prefer removal, substitution, or barriers when feasible.' },
      { icon: '⛔', title: 'Stop by severity', detail: 'Pause the task or leave when effective control is not available.' },
      { icon: '📣', title: 'Teach and escalate', detail: 'Explain the risk respectfully and route durable corrections.' },
    ],
    clinicalTip: 'The safest control changes the condition. A reminder to “be careful” may help, but it is rarely the strongest long-term solution.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR § 3203(a)(4)-(6)' },
      { kind: 'Recommended practice', text: 'NIOSH Hierarchy of Controls' },
      { kind: 'Care Indeed policy', text: 'RM-PS-001; RM-SS-001' },
    ],
    sceneImage: img02,
    sceneAlt: 'Therapist and older adult examine a kitchen and hallway with a wet floor, unstable step stool, boxes narrowing the path, and a loose handrail.',
    hotspots: [
      {
        id: 'wet-floor', label: 'Wet floor at the sink', shortLabel: 'Wet Floor', x: 16, y: 82, zone: 'conditional',
        info: 'Water extends from the sink into the walking path; the therapist remains on dry flooring.',
        meaning: 'The wet surface exposes both patient and worker to a fall.',
        action: 'Keep people away. Control the source only when safe and authorized; otherwise relocate and escalate.',
        notify: 'Notify the household and agency when the source or safe route remains uncontrolled.',
        document: 'Record location, observed source, protection, cleanup or restriction, and follow-up.',
        policyRefs: ['8 CCR § 3203(a)(6)', 'RM-PS-001'],
      },
      {
        id: 'stool', label: 'Unstable step stool', shortLabel: 'Step Stool', x: 10, y: 58, zone: 'prohibited',
        info: 'A folding stool beside the wet area is not approved access equipment.',
        meaning: 'Climbing it would add another fall hazard.',
        action: 'Do not climb. Use approved equipment or help, or delay the affected task.',
        notify: 'Report any setup that prevents safe completion.',
        document: 'Record the task, missing safe access, withheld action, notification, and plan.',
        policyRefs: ['8 CCR § 3203', 'RM-OS-101'],
      },
      {
        id: 'egress', label: 'Boxes narrowing the only route', shortLabel: 'Egress', x: 57, y: 48, zone: 'prohibited',
        info: 'Boxes narrow the hallway and may obstruct rapid exit or mobility equipment.',
        meaning: 'Blocked egress increases routine and emergency risk.',
        action: 'Ask for a clear route. Move only authorized items; otherwise hold the task and escalate.',
        notify: 'Report any obstruction that affects care or remains unresolved.',
        document: 'Describe the functional obstruction, response, notification, and visit decision without judgment.',
        policyRefs: ['8 CCR § 3203(a)(6)', 'RM-SS-001'],
      },
      {
        id: 'handrail', label: 'Loose hallway handrail', shortLabel: 'Loose Rail', x: 49, y: 57, zone: 'conditional',
        info: 'The rail appears separated at one mounting point; do not load-test it.',
        meaning: 'A failing support can cause a patient or worker fall.',
        action: 'Do not rely on it. Use a safe route or defer the related mobility task.',
        notify: 'Notify the household and clinical supervisor and route the repair concern.',
        document: 'Describe visible separation, affected task, teaching, notification, and restriction.',
        policyRefs: ['RM-PS-001', 'CL-SD-015'],
      },
      {
        id: 'alternate', label: 'Clear alternate work area', shortLabel: 'Safe Alternative', x: 80, y: 31, zone: 'authorized',
        info: 'A dry open area may support care that does not require the unsafe route.',
        meaning: 'A safe alternative can preserve care while one task remains stopped.',
        action: 'Confirm the alternative is within the plan and role, and keep egress clear.',
        notify: 'Report changes to planned care or any required task not completed.',
        document: 'Separate care completed from care held, including reason, response, and follow-up.',
        policyRefs: ['RM-PS-001', 'Agency escalation protocol'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Personal Security',
    title: 'Plan the Exit Before the Visit',
    subtitle: 'You do not have to stay in danger to finish care',
    narration: [
      'California’s healthcare workplace-violence standard, 8 CCR section 3342, expressly covers home health care and home-based hospice. It requires a written workplace violence prevention plan within the IIPP, hazard identification, corrective measures, incident response, employee participation, reporting without retaliation, and training for the risks workers are reasonably expected to encounter.',
      'For covered home-health operations, teach section 3342 as the controlling California framework. The general SB 553 statute in Labor Code section 6401.9 exempts healthcare operations covered by section 3342 and employers that comply with it. Care Indeed may use plan language that resembles SB 553, but an internal structure must not be presented as the legal basis when section 3342 applies.',
      'Review known risk information before travel and follow the current check-in or high-risk-visit plan. Conditions that may require a plan include prior threats, weapons, substance use, uncooperative cohabitants, isolated location, poor lighting, lack of an effective escape route, or a loose animal. Risk information supports controls; it must not become a stereotype about a diagnosis, neighborhood, culture, housing type, or family.',
      'If a weapon is present, do not touch, move, photograph, or debate it. A secured case may be a risk factor for future planning; an accessible weapon, threat, blocked exit, or handling during conflict may be an imminent danger. Leave when safe, call 911 or law enforcement for an immediate threat, and notify the agency. Do not return until the agency has evaluated and communicated a safe plan.',
      'Report threats and incidents even without physical injury. Preserve exact words when relevant, describe behavior and location, state how you exited or obtained help, and identify witnesses or evidence without collecting it unsafely. Section 3342 also requires interactive questions and answers with a person knowledgeable about the employer’s plan. This self-study must be paired with that agency-supported opportunity; a quiz alone is not a substitute.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '📍', title: 'Plan before arrival', detail: 'Review risks, check-in steps, parking, communication, and exit.' },
      { icon: '🐕', title: 'Require real controls', detail: 'Stay outside until an aggressive or loose animal is secured.' },
      { icon: '🚪', title: 'Protect the exit', detail: 'Maintain distance and never let urgency trap you inside.' },
      { icon: '☎️', title: 'Exit and report', detail: 'Call 911 for immediate danger; report threats even without injury.' },
    ],
    clinicalTip: 'De-escalation is a tool for creating time and distance. It is never a requirement to remain where you reasonably fear physical harm.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR § 3342' },
      { kind: 'Legal boundary', text: 'Labor Code § 6401.9(b)(2)' },
      { kind: 'Care Indeed policy', text: 'RM-SS-001; RM-SS-002; RM-ER-002' },
    ],
    sceneImage: img03,
    sceneAlt: 'Home-health social worker remains outside a doorway near a clear walkway and parked car while an upset caregiver, a loose barking dog, and a hard equipment case are visible inside.',
    hotspots: [
      {
        id: 'dog', label: 'Loose dog at the threshold', shortLabel: 'Loose Dog', x: 88, y: 75, zone: 'prohibited',
        info: 'A loose dog is focused on the worker, who remains outside and out of reach.',
        meaning: 'An uncontrolled animal can attack, distract, or block escape.',
        action: 'Stay outside or leave until the animal is secured away from care and egress areas.',
        notify: 'Contact the agency when control is refused or the risk is new.',
        document: 'Record behavior, location, requested control, response, visit disposition, and notification.',
        policyRefs: ['8 CCR § 3342(d)(6)(E)', 'RM-SS-001'],
      },
      {
        id: 'caregiver', label: 'Escalating caregiver behavior', shortLabel: 'Escalation Cue', x: 89, y: 38, zone: 'conditional',
        info: 'The caregiver gestures sharply while the worker maintains distance; motive cannot be inferred.',
        meaning: 'Escalation calls for space, protected egress, and a withdrawal decision.',
        action: 'Use brief respectful language, avoid argument, and leave if behavior continues or harm is feared.',
        notify: 'Call 911 for an immediate threat; otherwise contact the agency when safe.',
        document: 'Record observable actions and relevant exact words, not stigmatizing labels.',
        policyRefs: ['8 CCR § 3342(c)', 'RM-SS-001'],
      },
      {
        id: 'case', label: 'Possible weapon-related cue', shortLabel: 'Weapon Cue', x: 82, y: 61, zone: 'conditional',
        info: 'A hard equipment case is visible, but it does not prove an immediate weapon threat.',
        meaning: 'Context determines whether the observation needs planning or immediate exit.',
        action: 'Do not inspect it. Leave and call law enforcement if a weapon becomes accessible or threatening.',
        notify: 'Report the observation so the agency can evaluate controls before another visit.',
        document: 'Separate what was seen from assumptions; record location, behavior, action, and notification.',
        policyRefs: ['8 CCR § 3342(c)(9)(B)', 'RM-SS-001'],
      },
      {
        id: 'exit-route', label: 'Clear exit and vehicle route', shortLabel: 'Exit Route', x: 30, y: 47, zone: 'authorized',
        info: 'The walkway and vehicle remain visible and unobstructed behind the worker.',
        meaning: 'Exit planning reduces delay when conditions escalate.',
        action: 'Keep the route open, maintain distance, carry keys and communication, and leave early.',
        notify: 'Share access concerns and report any attempt to prevent departure.',
        document: 'Record blocked access, departure interference, and changes needed before another visit.',
        policyRefs: ['8 CCR § 3342(c)(9)', 'RM-SS-001'],
      },
      {
        id: 'phone', label: 'Check-in and emergency communication', shortLabel: 'Check-In', x: 59, y: 61, zone: 'authorized',
        info: 'The phone stays accessible without distracting the worker or drawing her closer to danger.',
        meaning: 'Communication works only with the current check-in and escalation plan.',
        action: 'Follow that plan; in immediate danger, reach safety and call 911 when safe.',
        notify: 'Use the verified agency contact—never an invented code or number.',
        document: 'Record failed check-in, emergency contact, agency notification, time, and outcome.',
        policyRefs: ['8 CCR § 3342(c)(4)-(7)', 'Agency WVPP'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Ergonomics & Falls',
    title: 'Move Safely: People, Equipment, Environment',
    subtitle: 'If the setup is wrong, the transfer is not ready',
    narration: [
      'Patient movement is a system, not a test of strength. Safe performance depends on the current plan, the patient’s present ability, the worker’s role and validated competency, enough trained help, the correct device, adequate space, stable equipment, and a clear destination. If one part is missing, the worker does not compensate by pulling harder or asking an untrained family member to improvise.',
      'Before movement, compare the patient with the expected condition. New weakness, dizziness, pain, shortness of breath, confusion, inability to follow directions, or a recent fall may change the risk. Keep the patient in a safe position, stop the affected activity, and obtain role-appropriate clinical direction. This module does not teach a transfer maneuver or certify practical skill.',
      'Ergonomics means fitting the task to human capability. Stronger controls include reducing manual handling, using an appropriate mechanical or transfer aid, changing height or position, dividing the task, and obtaining trained assistance. “Lift with your legs” is not a complete prevention program. Twisting, reaching, sudden load shifts, narrow spaces, fatigue, and repeated force can still injure the worker.',
      'Falls prevention includes the patient and worker. Watch rugs, cords, wet floors, stairs, thresholds, pets, low seating, poor lighting, clutter, footwear, oxygen tubing, and assistive-device placement. Teach one specific change at a time and use teach-back. Respect the home: ask permission before moving property and document refusal without judgment.',
      'Report discomfort early. Pain, tingling, numbness, swelling, weakness, or loss of function after a task may be a work-related injury even if the worker can finish the shift. Stop aggravating activity, obtain evaluation under the current procedure, notify the agency without delay, and use the worker-incident process. Do not wait for a lost workday.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '🧭', title: 'Match the current plan', detail: 'Confirm role, competency, patient ability, equipment, and help.' },
      { icon: '🦽', title: 'Prepare the system', detail: 'Clear the path, stabilize equipment, manage tubing, and position aids.' },
      { icon: '🛑', title: 'Do not improvise', detail: 'Missing device, training, help, or assessment means pause and escalate.' },
      { icon: '🩺', title: 'Report symptoms early', detail: 'Stop aggravating activity and report strain without waiting.' },
    ],
    clinicalTip: 'A transfer is ready only when the patient, plan, people, equipment, and environment all agree.',
    sourceLabels: [
      { kind: 'Care Indeed policy', text: 'RM-OS-101 §4.9; RM-PS-001' },
      { kind: 'Patient safety', text: 'CL-SD-015' },
      { kind: 'Recommended practice', text: 'OSHA/NIOSH safe patient handling' },
    ],
    sceneImage: img04,
    sceneAlt: 'Physical therapist prepares an older adult for a transfer beside a bed, gait belt, walker, wheelchair, clutter basket, and unsuitable footwear.',
    hotspots: [
      {
        id: 'patient-status', label: 'Patient’s current ability', shortLabel: 'Current Ability', x: 57, y: 43, zone: 'conditional',
        info: 'Strength, balance, symptoms, and ability to follow the plan must be confirmed before movement.',
        meaning: 'A familiar patient may change between visits.',
        action: 'Keep the patient seated, assess within role, and pause if current ability differs from the plan.',
        notify: 'Report any new symptom or change that affects safe movement.',
        document: 'Record findings, baseline comparison, task held, notification, instructions, and response.',
        policyRefs: ['CL-SD-015', 'Agency plan-of-care policy'],
      },
      {
        id: 'worker-stance', label: 'Worker positioning and workload', shortLabel: 'Ergonomics', x: 37, y: 53, zone: 'authorized',
        info: 'The therapist prepares close to the patient with a stable, untwisted stance.',
        meaning: 'Positioning helps but cannot replace equipment, space, help, or assessment.',
        action: 'Use authorized aids and stop if force, twisting, reaching, or load shifts remain excessive.',
        notify: 'Report staffing, equipment, or layout barriers.',
        document: 'Record barriers, requested help or equipment, task change, and worker symptoms.',
        policyRefs: ['RM-OS-101 §4.9', 'NIOSH ergonomics guidance'],
      },
      {
        id: 'walker', label: 'Walker and destination setup', shortLabel: 'Walker Setup', x: 45, y: 69, zone: 'authorized',
        info: 'The walker must match the plan and avoid creating a reach or trip hazard.',
        meaning: 'An assistive device works only when appropriate, serviceable, and correctly placed.',
        action: 'Inspect and position it as trained; never substitute unfamiliar equipment.',
        notify: 'Report missing, damaged, or inappropriate equipment before movement.',
        document: 'Record equipment, defect or mismatch, action, and revised direction.',
        policyRefs: ['RM-PS-001', 'CL-SD-015'],
      },
      {
        id: 'wheelchair', label: 'Wheelchair preparation', shortLabel: 'Wheelchair', x: 11, y: 69, zone: 'conditional',
        info: 'Wheelchair brakes, footrests, position, and route must match training and the current plan.',
        meaning: 'An unstable destination can cause both patient and worker falls.',
        action: 'Prepare it only as trained; stop if stability or configuration is uncertain.',
        notify: 'Report device mismatch or defect through the appropriate route.',
        document: 'Describe condition, preparation, task decision, and notifications.',
        policyRefs: ['RM-OS-101', 'Equipment safety procedure'],
      },
      {
        id: 'path-footwear', label: 'Clutter and unsuitable footwear', shortLabel: 'Path & Footwear', x: 72, y: 80, zone: 'prohibited',
        info: 'A basket narrows the route, and the patient’s socks show no non-slip surface.',
        meaning: 'Path and footwear hazards combine during movement.',
        action: 'With permission, clear the route and address footwear; otherwise hold the movement.',
        notify: 'Report refusal or the absence of a safe alternative.',
        document: 'Record the hazard, teaching, response, task status, and follow-up.',
        policyRefs: ['CL-SD-015', 'RM-PS-001'],
      },
    ],
  },
  {
    id: 4,
    shortName: 'Hazard Communication',
    title: 'Read the Label Before You Reach',
    subtitle: 'Unknown chemical, unknown risk—stop before use',
    narration: [
      'California’s Hazard Communication Standard requires a written program that explains labels, safety data sheets, and employee information and training for hazardous chemicals. In field work, the agency must still make required hazard information immediately obtainable. A familiar bottle, color, smell, or caregiver assurance is not a reliable product identity.',
      'A shipped-container label uses six core elements: product identifier, signal word, hazard statement, pictogram, precautionary statement, and the responsible party’s name, address, and telephone number. A pictogram communicates a hazard class, but it does not tell the complete story or authorize a cleanup. Read the full label and follow the agency task procedure.',
      'The SDS has 16 standardized sections. For field decisions, remember key starting points: Section 1 identifies the product and supplier; Section 2 describes hazards; Section 4 gives first-aid measures; Section 6 covers accidental release; Section 7 covers handling and storage; Section 8 addresses exposure controls and PPE; Section 10 covers stability and reactivity; and Section 16 gives revision information. The SDS supports—not replaces—emergency procedures.',
      'Never mix products unless the approved procedure and product information specifically direct it. Incompatible chemicals can release toxic gas, create heat, or cause fire. Do not sniff an unknown product, test it on a surface, or assume gloves solve the risk. PPE must match the chemical, route of exposure, concentration, and task; more PPE is not automatically correct PPE.',
      'For a spill or exposure, protect people first and follow the current emergency and exposure procedure. Move away from fumes, use emergency eyewash or water only as directed by the product information and agency plan, call 911 or poison-control resources when indicated, and notify the agency immediately. Detailed bloodborne-pathogen and occupational-exposure response is taught in M11; medical-device reporting belongs in M12.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '🏷️', title: 'Verify the label', detail: 'Identity and six label elements come before occupational use.' },
      { icon: '📄', title: 'Know SDS sections', detail: 'Use product-specific hazard, first-aid, spill, storage, and PPE information.' },
      { icon: '🚫', title: 'Do not guess or mix', detail: 'Unknown or incompatible chemicals require a stop and escalation.' },
      { icon: '🧤', title: 'Match the control', detail: 'Select PPE and work practices from verified information and procedure.' },
    ],
    clinicalTip: 'If you cannot identify the product and immediately obtain its hazard information, do not use it.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR § 5194' },
      { kind: 'Federal reference', text: '29 CFR § 1910.1200' },
      { kind: 'Care Indeed policy', text: 'RM-OS-101 §4.7' },
    ],
    sceneImage: img05,
    sceneAlt: 'Home-health nurse examines a utility-room chemical area containing an original labeled container, an unlabeled spray bottle, adjacent products, gloves, a small spill, and a tablet representing SDS access.',
    hotspots: [
      {
        id: 'label', label: 'Original product label', shortLabel: 'Label Elements', x: 15, y: 57, zone: 'authorized',
        info: 'The original container retains its hazard-label panel; image text is intentionally unreadable.',
        meaning: 'The label connects product identity with hazards, precautions, and supplier information.',
        action: 'Read the full label and match the product to the task and procedure before use.',
        notify: 'Ask the supervisor about any damaged, unfamiliar, or inconsistent label.',
        document: 'Record the product identifier and specific label problem.',
        policyRefs: ['8 CCR § 5194(f)(1)', 'RM-OS-101'],
      },
      {
        id: 'unlabeled', label: 'Unlabeled secondary spray bottle', shortLabel: 'Unlabeled Bottle', x: 46, y: 57, zone: 'prohibited',
        info: 'A secondary bottle has no reliable product identity or hazard information.',
        meaning: 'Appearance, odor, or memory cannot establish safe controls.',
        action: 'Do not use, sniff, open, mix, or guess-label it; secure and report it as directed.',
        notify: 'Notify the supervisor before the chemical task continues.',
        document: 'Describe container, location, attributed claim, affected task, and disposition.',
        policyRefs: ['8 CCR § 5194(f)(6)-(10)', 'RM-OS-101 §4.7'],
      },
      {
        id: 'sds', label: 'Immediate SDS access', shortLabel: 'SDS Access', x: 36, y: 66, zone: 'authorized',
        info: 'The tablet represents electronic SDS access without a practical barrier.',
        meaning: 'Required information must be immediately available during work and emergencies.',
        action: 'Open the current SDS when needed; use the approved backup if access fails.',
        notify: 'Report access barriers and do not continue on guesswork.',
        document: 'Record the failure, product, task, backup, notification, and decision.',
        policyRefs: ['8 CCR § 5194(g)(8)-(9)'],
      },
      {
        id: 'spill-ppe', label: 'Small spill and PPE station', shortLabel: 'Spill & PPE', x: 27, y: 78, zone: 'conditional',
        info: 'A spill is near gloves, but glove availability does not prove compatibility or adequate protection.',
        meaning: 'Spill response depends on identity, exposure, conditions, training, and the SDS.',
        action: 'Keep people away; use SDS Sections 6 and 8 and clean only when authorized and controlled.',
        notify: 'Use emergency help for symptoms, fire, fumes, or significant release; otherwise report promptly.',
        document: 'Record product, observed amount, location, exposure, controls, notifications, and disposition.',
        policyRefs: ['8 CCR § 5194(g)', 'SDS Sections 6 and 8'],
      },
      {
        id: 'incompatible', label: 'Products stored together', shortLabel: 'Compatibility', x: 28, y: 46, zone: 'conditional',
        info: 'Nearby products cannot be judged compatible by color or container.',
        meaning: 'Compatibility comes from verified handling, storage, and reactivity information.',
        action: 'Do not mix or rearrange unknown products; follow guidance and escalate damage, leaks, or incompatibility.',
        notify: 'Report storage conditions that affect occupational safety or care.',
        document: 'Identify only verified products and record location, condition, task impact, restriction, and follow-up.',
        policyRefs: ['SDS Sections 7 and 10', '8 CCR § 5194'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Report & Drive',
    title: 'Report Fast, Drive Safe, Document in the Right Place',
    subtitle: 'Urgent care first; immediate internal report next',
    narration: [
      'After a worker injury, illness, near miss, violent incident, unsafe condition, or vehicle event, protect life and prevent further harm first. Move out of traffic or danger when possible, call 911 for an emergency, obtain first aid or medical evaluation under the current procedure, and stop activity that could worsen an injury. Then notify the agency without delay.',
      'Internal reporting and regulatory reporting are different. Every worker reports through the agency process promptly, even when the event seems minor or no shift is missed. An authorized agency representative determines recordkeeping and whether Cal/OSHA must be contacted. Under 8 CCR section 342, the employer—not each field worker—is responsible for immediate reporting of covered work-connected death or serious injury or illness, with “immediately” defined by the regulation.',
      'Keep documentation streams separate. The patient clinical record contains patient status, care provided or held, patient response, clinical notifications, and changes affecting the plan. The worker-incident system contains the employee event, worker symptoms, vehicle or workplace facts, witnesses, and occupational follow-up. If both patient and worker were affected, each record receives only the information appropriate to its purpose. Do not reference the confidential incident report in the patient chart unless current policy specifically directs it.',
      'Driving is part of the field workplace. Before moving, wear the seat belt, secure the clinical bag and loose supplies, set navigation, and assess weather, fatigue, visibility, tires, and vehicle condition. California law restricts holding and operating a handheld device while driving and permits only limited mounted interaction. Current agency policy may be stricter; follow the stricter assignment rule.',
      'When a call, message, address change, or navigation problem needs more than permitted safe interaction, park legally before responding. After a collision, use the current agency sequence for emergency care, scene safety, law-enforcement or insurance exchange, agency notification, and documentation. Never photograph while exposed to traffic, argue about fault, post the event online, or continue driving if the vehicle or worker is unsafe.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '🚑', title: 'Protect and obtain care', detail: 'Reach safety, use 911 when needed, and stop aggravating activity.' },
      { icon: '📞', title: 'Report without delay', detail: 'Internal reporting starts promptly; designated leaders handle regulators.' },
      { icon: '🗂️', title: 'Use the right record', detail: 'Separate patient-care facts from confidential worker-incident facts.' },
      { icon: '🚗', title: 'Park before interacting', detail: 'Secure the vehicle before calls, messages, or detailed navigation.' },
    ],
    clinicalTip: 'A “small” event may become a serious injury later. Prompt reporting protects the worker and gives the agency a chance to correct the hazard.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR § 342' },
      { kind: 'California law', text: 'Vehicle Code § 23123.5; Labor Code § 6310' },
      { kind: 'Care Indeed policy', text: 'RM-ER-002; RM-SS-003; RM-OS-101' },
    ],
    sceneImage: img06,
    sceneAlt: 'Home-health aide sits in a legally parked car after a rainy near miss, checking her wrist and using a mounted device; a secured clinical bag, first-aid kit, wet driveway, scooter, and branch are visible.',
    hotspots: [
      {
        id: 'parked-device', label: 'Parked before device use', shortLabel: 'Park First', x: 69, y: 54, zone: 'authorized',
        info: 'The vehicle is parked before the worker handles a report or device message.',
        meaning: 'A mount does not make complex interaction safe while driving.',
        action: 'Set navigation before travel; park legally before reading, typing, calling, or documenting.',
        notify: 'After parking, report route, fatigue, weather, vehicle, or assignment concerns.',
        document: 'Record the change or event in the correct system and time sequence.',
        policyRefs: ['Vehicle Code § 23123.5', 'RM-SS-003'],
      },
      {
        id: 'worker-symptom', label: 'Worker wrist symptom', shortLabel: 'Report Symptoms', x: 46, y: 60, zone: 'conditional',
        info: 'The worker has wrist pain after a near miss; no visible wound does not rule out injury.',
        meaning: 'Symptoms may progress, so delay can postpone care and correction.',
        action: 'Stop aggravating activity, obtain evaluation as directed, and notify the agency without delay.',
        notify: 'Use emergency services for severe symptoms; otherwise use the worker-injury route promptly.',
        document: 'Record onset, body area, event, facts, care, notifications, and functional change without self-diagnosis.',
        policyRefs: ['RM-ER-002', 'RM-OS-101 §4.8'],
      },
      {
        id: 'first-aid', label: 'First-aid and emergency readiness', shortLabel: 'Immediate Care', x: 86, y: 75, zone: 'authorized',
        info: 'A first-aid kit supports trained minor care but does not replace evaluation.',
        meaning: 'Severity, symptoms, and procedure determine the immediate response.',
        action: 'Use first aid only as trained, call 911 when indicated, and follow current direction.',
        notify: 'After emergency needs, notify the agency through the approved sequence.',
        document: 'Record care, direction, emergency response, disposition, and work or driving restrictions.',
        policyRefs: ['RM-ER-002', 'Agency emergency procedure'],
      },
      {
        id: 'field-hazards', label: 'Rain, obstruction, and secured supplies', shortLabel: 'Field Conditions', x: 14, y: 70, zone: 'conditional',
        info: 'Rain, limited sight lines, and a curbside branch change road and walking conditions; supplies are secured.',
        meaning: 'Weather and loose objects can worsen visibility, stopping distance, and injury.',
        action: 'Reassess, secure supplies, choose a safer approach, and delay when conditions remain uncontrolled.',
        notify: 'Report weather, route, vehicle, or access conditions that make travel unsafe.',
        document: 'Record the specific condition and decision, not a vague label.',
        policyRefs: ['OSHA Home Healthcare', 'RM-SS-003'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Integrated Simulation',
    title: 'Stop the Cascade',
    subtitle: 'One safe decision can prevent the next event',
    narration: [
      'This scene combines patient and worker hazards. The patient is awake on the floor after a low-level fall. Broken glass and spilled water are nearby, oxygen tubing crosses part of the path, a rolling table is unstable, a space heater sits close to fabric, and the cane is out of reach. The safest response is not to collect the most hazards—it is to prioritize the highest consequence and prevent the next event.',
      'Start with immediate status and scene safety. If the patient has severe symptoms, altered responsiveness, suspected serious injury, fire, uncontrolled electricity, or another emergency, call 911 and follow the emergency plan. Do not move the patient solely to make the scene look orderly. Keep the patient comfortable and protected within your role while obtaining clinical direction.',
      'Do not perform an unplanned floor lift. The patient’s condition, current plan, available equipment, worker competency, space, and trained help must support any movement. A concerned caregiver is not automatically trained assistance. Explain the pause respectfully: “I want to keep both of us safe. I’m contacting the clinical supervisor now for the right response.”',
      'Separate the reports. The patient record describes the patient’s position and condition, assessment within role, care or movement held, emergency or clinical notifications, instructions, and outcome. A worker cut, strain, slip, or exposure goes through the worker-incident process. A hazardous environment or near miss may also require safety reporting. One event can generate more than one record without copying confidential details between them.',
      'Use the module pathway: observe; protect patient and self; stop the affected task; move to safety; use 911 for immediate danger; notify through the current agency chain; document objective facts in the correct records; and support reassessment. This knowledge practice does not validate transfer, emergency, chemical-cleanup, or de-escalation competency.',
    ],
    overviewCount: 2,
    keyPoints: [
      { icon: '1️⃣', title: 'Protect first', detail: 'Check immediate patient status and keep people away from hazards.' },
      { icon: '2️⃣', title: 'Stop the cascade', detail: 'Do not add an unsafe lift, cleanup, or reach to the original event.' },
      { icon: '3️⃣', title: 'Escalate by severity', detail: 'Use 911 for emergencies and the current agency chain without delay.' },
      { icon: '4️⃣', title: 'Separate the records', detail: 'Patient care, worker injury, and safety follow-up have distinct purposes.' },
    ],
    clinicalTip: 'Safety is not a one-time doorway check. Every new person, symptom, object, request, or event can change the decision.',
    sourceLabels: [
      { kind: 'California requirement', text: '8 CCR §§ 3203, 3342, 5194' },
      { kind: 'Care Indeed policy', text: 'RM-SS-001; RM-PS-001; RM-ER-002; RM-OS-101' },
      { kind: 'Patient safety', text: 'CL-SD-015' },
    ],
    sceneImage: img07,
    sceneAlt: 'Older adult sits awake on the floor beside a sofa while an occupational therapist calls for help; spilled water, broken glass, oxygen tubing, rolling table, heater, blanket, and cane are visible.',
    hotspots: [
      {
        id: 'patient', label: 'Patient on the floor', shortLabel: 'Patient First', x: 27, y: 56, zone: 'conditional',
        info: 'The patient is awake on the floor, but the scene cannot establish injury or safe movement.',
        meaning: 'Status and emergency signs come before cleanup or an unplanned lift.',
        action: 'Stay when safe, assess within role, provide comfort, call 911 for emergency signs, and seek clinical direction.',
        notify: 'Notify emergency services when indicated and the clinical supervisor without delay.',
        document: 'Record position, findings, statements, actions, notifications, instructions, and outcome.',
        policyRefs: ['CL-SD-015', 'RM-ER-002'],
      },
      {
        id: 'glass-water', label: 'Water and broken glass', shortLabel: 'Sharp & Slip', x: 45, y: 78, zone: 'prohibited',
        info: 'Water and glass block part of the room and could cut or trip a rushing worker.',
        meaning: 'Scene safety is part of patient safety.',
        action: 'Use a clear route, isolate the area, and clean only when authorized, equipped, and controlled.',
        notify: 'Report any injury or exposure and the unresolved hazard immediately.',
        document: 'Record location, access control, worker contact or symptoms, and notification.',
        policyRefs: ['8 CCR § 3203', 'RM-OS-101'],
      },
      {
        id: 'oxygen-tubing', label: 'Oxygen tubing across the path', shortLabel: 'Tubing Path', x: 58, y: 78, zone: 'conditional',
        info: 'Oxygen tubing crosses the path, but the scene does not prove it caused the event.',
        meaning: 'Tubing is both a trip risk and prescribed equipment.',
        action: 'Prevent more trips, avoid pulling or disconnecting it, and seek direction before repositioning.',
        notify: 'Report the fall and path concern; use emergency help for breathing or equipment danger.',
        document: 'Record tubing location and condition, patient status, control, and instructions.',
        policyRefs: ['RM-PS-001', 'Patient equipment procedure'],
      },
      {
        id: 'rolling-table', label: 'Unstable rolling table', shortLabel: 'Not a Support', x: 86, y: 49, zone: 'prohibited',
        info: 'The rolling table could move if used for support or lifting.',
        meaning: 'Household furniture cannot replace a prescribed device or handling plan.',
        action: 'Do not use it; keep the patient safe and wait for authorized movement and equipment.',
        notify: 'Tell the clinical supervisor what support and equipment are available.',
        document: 'Record why movement was held, equipment, direction, and response.',
        policyRefs: ['RM-OS-101 §4.9', 'CL-SD-015'],
      },
      {
        id: 'heater', label: 'Space heater near fabric', shortLabel: 'Fire Risk', x: 95, y: 78, zone: 'prohibited',
        info: 'A portable heater is close to fabric while oxygen equipment is present.',
        meaning: 'Heat, combustibles, and oxygen can create a severe fire hazard.',
        action: 'Keep people away and stop activity; for smoke, flame, overheating, or immediate danger, leave and call 911.',
        notify: 'Notify the agency and household; obtain emergency help for any active fire condition.',
        document: 'Describe heater, fabric, oxygen context, signs, restriction, notifications, and disposition.',
        policyRefs: ['RM-PS-001', 'Agency oxygen/fire safety policy'],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'A recurring home hazard cannot be controlled reliably by reminders alone. Which plan best follows the hierarchy of controls?',
    options: [
      'Tell each worker to be more careful and sign a reminder',
      'Add thicker gloves even though hands are not the route of exposure',
      'Remove or isolate the hazard when feasible, then add work-practice controls and PPE as needed',
      'Wait for an injury before changing the setup',
    ],
    correct: 2,
    rationale: 'The hierarchy prefers elimination, substitution, and engineering controls before administrative controls and PPE when feasible. California’s IIPP also requires timely correction based on hazard severity. If the worker cannot implement the control, the affected task should stop and the condition should be escalated. Sources: NIOSH Hierarchy of Controls; 8 CCR § 3203(a)(6).',
  },
  {
    id: 1,
    stem: 'Which set lists the core elements expected on a shipped hazardous-chemical label?',
    options: [
      'Product color, expiration date, room location, price, barcode, and owner name',
      'Product identifier, signal word, hazard statements, pictograms, precautionary statements, and responsible-party contact information',
      'SDS section number, employee signature, physician order, lot count, storage shelf, and disposal date',
      'Only a skull pictogram and the word danger',
    ],
    correct: 1,
    rationale: 'Cal/OSHA requires the product identifier, signal word, hazard statements, pictograms, precautionary statements, and manufacturer, importer, or other responsible-party name, address, and telephone number. A label supports recognition but does not replace the SDS or agency procedure. Source: 8 CCR § 5194(f).',
  },
  {
    id: 2,
    stem: 'In a patient’s kitchen, a clear liquid is stored in an unlabeled sports-drink bottle. The caregiver says it is the cleaner normally used for the visit. What is the best next action?',
    options: [
      'Smell the liquid and use it if the odor seems familiar',
      'Wear two pairs of gloves and test a small amount',
      'Do not use it; follow the approved secure-and-report process and obtain verified identity, label, SDS, and direction',
      'Write “cleaner” on the bottle and continue',
    ],
    correct: 2,
    rationale: 'An unknown product in an inappropriate, unlabeled container cannot be used safely on guesswork. PPE does not identify a chemical, and a worker should not create an unverified label. Sources: 8 CCR § 5194; Care Indeed RM-OS-101 §4.7.',
  },
  {
    id: 3,
    stem: 'During a visit, a caregiver stands between the worker and the only exit, angrily reaches toward a visible handgun, and says, “You are not leaving.” What should the worker do?',
    options: [
      'Touch the weapon only long enough to move it out of reach',
      'Finish the essential care quickly and report after leaving',
      'Create distance and leave when safely possible, call 911 or law enforcement, then notify the agency',
      'Ask the patient to sign a refusal form before the worker exits',
    ],
    correct: 2,
    rationale: 'A blocked exit, weapon handling, and a direct threat constitute an imminent violence hazard. The worker should not touch the weapon or remain to finish care. California’s healthcare violence standard covers home health and requires emergency-response procedures. Sources: 8 CCR § 3342; Care Indeed RM-SS-001 and RM-ER-002.',
  },
  {
    id: 4,
    stem: 'A large dog is loose at the front door, growling and lunging at the worker’s bag. The patient calls out that the dog is friendly. What is the safest response?',
    options: [
      'Let the dog inspect the bag while the worker stands still',
      'Remain outside or leave until the animal is effectively secured away from the route and care area',
      'Ask the patient to hold the collar during care',
      'Enter because animal behavior is not covered by workplace-violence prevention',
    ],
    correct: 1,
    rationale: 'A threatening loose animal is a field-safety hazard. Remaining outside and requiring an effective control avoids exposure; testing or physically managing the dog does not. California’s healthcare violence rule includes animal attack as an incident category. Sources: 8 CCR § 3342; Care Indeed RM-SS-001.',
  },
  {
    id: 5,
    stem: 'A patient who usually transfers with one trained helper says both legs feel unusually weak. The prescribed transfer device is not in the home. The caregiver asks the field worker to “just pull” the patient into the wheelchair. What is the best response?',
    options: [
      'Use a manual lift because the patient has transferred before',
      'Ask the untrained caregiver to provide the missing force',
      'Keep the patient safe, do not perform the transfer, and contact the appropriate clinical supervisor for direction',
      'Search for a different technique online and try it once',
    ],
    correct: 2,
    rationale: 'The patient’s current ability no longer matches the plan and a required control is missing. Personal strength or an untrained helper does not replace assessment, equipment, or validated competency. Sources: Care Indeed RM-OS-101 §4.9; OSHA/NIOSH safe patient-handling guidance.',
  },
  {
    id: 6,
    stem: 'While driving to a visit, the worker’s phone repeatedly displays messages that the visit address has changed. What should the worker do?',
    options: [
      'Hold the phone below the window and type the new address',
      'Read each message at stop signs',
      'Ask the patient to keep calling until navigation updates',
      'Continue to a safe legal parking place, secure the vehicle, and then review or respond',
    ],
    correct: 3,
    rationale: 'A mounted device does not make detailed interaction safe. California restricts holding and operating a handheld device while driving, and agency policy may be stricter than the law’s limited mounted single-swipe or tap allowance. Sources: Vehicle Code § 23123.5; Care Indeed RM-SS-003.',
  },
  {
    id: 7,
    stem: 'A worker trips on a patient’s exterior step after the visit and develops ankle swelling. The patient was not involved or harmed. Which response is most accurate?',
    options: [
      'Wait until the next shift to see whether work is missed',
      'Place the complete worker injury narrative in the patient chart',
      'Obtain needed care, notify the agency without delay, and use the worker-incident process; do not add it to the patient chart when patient care was unaffected',
      'Report only if a clinician confirms a fracture',
    ],
    correct: 2,
    rationale: 'Immediate needs come first, followed by prompt internal reporting; the worker should not wait for diagnostic certainty or lost work. With no patient-care impact, the event does not belong in the patient clinical record. Sources: Care Indeed RM-ER-002 and RM-OS-101 §4.8.',
  },
  {
    id: 8,
    stem: 'A patient’s knees buckle during a planned transfer. The patient returns safely to the chair, while the worker reports new shoulder pain. Which documentation approach is best?',
    options: [
      'Write everything only in the patient note so there is one record',
      'Document patient status, care, and clinical notifications in the patient record, and separately report the worker injury through the confidential incident process',
      'Document only the worker pain because the patient did not fall',
      'Do not document either event until the cause is determined',
    ],
    correct: 1,
    rationale: 'The patient record supports patient status, care, and clinical communication. The worker injury belongs in the separate incident process. Both the near fall and worker symptom require prompt escalation, but confidential occupational details should not be copied into the patient chart. Source: Care Indeed RM-ER-002.',
  },
  {
    id: 9,
    stem: 'At one visit, a hostile dog is unsecured, boxes narrow the only exit, chemical fumes are present, and the caregiver demands an unplanned manual transfer. Which response best applies the module’s safety pathway?',
    options: [
      'Wear PPE, complete the transfer quickly, and document all hazards afterward',
      'Move household property and permanently end services without agency direction',
      'Protect patient and self, leave or move to safety, call emergency help when indicated, notify the agency, and document objective facts for coordinated follow-up',
      'Ask the caregiver to accept responsibility in writing while care continues',
    ],
    correct: 2,
    rationale: 'Multiple uncontrolled hazards defeat the planned visit. PPE and hurried care do not control violence, egress, chemical, and handling risks; unilateral home modification or discharge is outside the worker’s authority. Sources: 8 CCR §§ 3203, 3342, and 5194; Care Indeed RM-SS-001, RM-PS-001, and RM-ER-002.',
  },
];

const STYLES = `
.achcm07,.achcm07 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm07-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm07-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm07-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm07-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.achcm07-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.achcm07-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.achcm07-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm07-tabs::-webkit-scrollbar{display:none}
.achcm07-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm07-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm07-tab.quiz-tab{border:1px solid #C2410C;color:#C2410C}
.achcm07-tab.quiz-tab.active{background:#C2410C;color:#fff;border-color:#C2410C}
.achcm07-exit{flex-shrink:0;border-radius:10px;border:1px solid #C2410C;background:#fff;color:#C2410C;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm07-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm07-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.achcm07-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm07-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.achcm07-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm07-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm07-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm07-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm07-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.achcm07-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:achcm07-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm07-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.achcm07-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.achcm07-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.achcm07-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm07-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm07-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.achcm07-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.achcm07-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm07-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm07-bot button.next{background:#C2410C;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(194,65,12,.28);min-height:44px}
.achcm07-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm07-quiz-card{width:min(760px,100%);animation:achcm07-slide .35s cubic-bezier(.16,1,.3,1)}
.achcm07-lesson-tabpanel{flex:1;min-height:0;display:flex}
.achcm07-quiz-main{flex:1;min-height:0;display:flex}
@media (max-width:900px){
  .achcm07-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm07-left,.achcm07-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm07-right{min-height:360px}
  .achcm07-left{max-height:42vh}
  .achcm07-top{padding:0 10px;gap:8px}
  .achcm07-tab{padding:8px 10px;font-size:12px}
  .achcm07-bot{padding:0 12px;height:72px}
  .achcm07-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:420px){
  .achcm07-brand span.brand-text{display:none}
  .achcm07-exit{padding:8px 10px;font-size:11px}
  .achcm07-stage{border-radius:10px}
  .achcm07-hotspot .tag{width:90px;max-width:90px;white-space:normal;text-align:center}
  .achcm07-hotspot.edge-right .tag{transform:translateX(-42px)}
  .achcm07-reset{width:44px!important;padding:0!important;font-size:0!important;justify-content:center}
}
@media (prefers-reduced-motion:reduce){
  .achcm07-hotspot .ping,.achcm07-drawer-bg,.achcm07-quiz-card,.achcm07-path-step{animation:none!important}
  .achcm07-quiz-card{animation:none!important}
  .achcm07-rm-transition,.achcm07-complete-overlay{transition:none!important;animation:none!important}
}
.achcm07-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.achcm07-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.achcm07-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.achcm07-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.achcm07-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.achcm07-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.achcm07-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.achcm07-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.achcm07-process-node ul{margin:0;padding-left:14px}
.achcm07-process-node li{margin:0}
.achcm07-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.achcm07-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.achcm07-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.achcm07-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.achcm07 button:focus-visible,.achcm07 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const z = ZONE[hotspot.zone];
  useEffect(() => { const t = window.setTimeout(() => closeRef.current?.focus(), 20); return () => window.clearTimeout(t); }, [hotspot.id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); triggerRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, triggerRef]);
  useEffect(() => {
    const root = dialogRef.current; if (!root) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', trap); return () => root.removeEventListener('keydown', trap);
  }, []);
  return (
    <div className="achcm07-drawer-bg" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm07-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.96)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: z.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.zone === 'prohibited' ? <XCircle size={18} /> : hotspot.zone === 'conditional' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{z.label} practice</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={() => { onClose(); triggerRef.current?.focus(); }} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Safety observation and response feedback</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.info} />
          <FeedbackBlock label="What it means" body={hotspot.meaning} />
          <FeedbackBlock label="What the field worker should do" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who must be notified" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What must be documented" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.policyRefs.map((r) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
            ))}
          </div>
          <button type="button" onClick={() => { onComplete(); triggerRef.current?.focus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > page.overviewCount;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      {page.narration.slice(0, page.overviewCount).map((p, i) => (
        <p key={i} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>
      ))}
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(page.overviewCount).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp) => (
          <div key={kp.title} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
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
  return (
    <div className="achcm07-stage-wrap">
      <div className="achcm07-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={page.sceneAlt} draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
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
            <button key={hs.id} type="button" className={`achcm07-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''} ${hs.x >= 84 ? 'edge-right' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`achcm07-progress-${page.id}`}
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
              {isDone && <span className="achcm07-sr-only">Completed</span>}
            </button>
          );
        })}
        <div id={`achcm07-progress-${page.id}`} className="achcm07-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} nodes observed
        </div>
        <button type="button" className="achcm07-reset" aria-label="Reset lesson progress" onClick={() => setCompleted([])}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'achcm07-pop .3s cubic-bezier(.16,1,.3,1)' }} className="achcm07-rm-transition" role="status" aria-live="polite">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Lesson observations complete. This is knowledge and scenario practice; practical competency and agency-specific direction remain separate.</div>
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

/** Dedicated single-panel Knowledge Check — progressive field cards + safety result */
function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  initialAttempts,
  initialLastScore,
  onPersist,
}: {
  onBack: () => void;
  initialAnswers?: (number | null)[];
  initialIdx?: number;
  initialFinished?: boolean;
  initialSelected?: number | null;
  initialSubmitted?: boolean;
  initialAttempts?: number;
  initialLastScore?: number;
  onPersist: (state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean; attempts: number; lastScore: number }) => void;
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
  const [attempts, setAttempts] = useState(Math.max(0, initialAttempts ?? 0));
  const [lastScore, setLastScore] = useState(Math.max(0, initialLastScore ?? 0));
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
    onPersist({ answers, idx, finished, selected, submitted, attempts, lastScore });
    // intentionally omit onPersist identity to avoid re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, finished, selected, submitted, attempts, lastScore]);

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
      setAttempts((value) => value + 1);
      setLastScore(score);
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
      <main className="achcm07-quiz-main">
        <div id="m07-quiz-panel" role="tabpanel" aria-labelledby="m07-tab-quiz" className="achcm07-quiz-page">
          <div className="achcm07-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="achcm07-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Passing score achieved' : 'Review and retake'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            {passed ? 'You met the 80% knowledge threshold.' : 'A score of 80% is required.'} Attempt {attempts}. This result is knowledge practice only; practical competency, interactive WVPP questions, and agency clearance remain separate.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Observe', color: CI.teal, tip: 'Name the condition and who is exposed' },
              { label: 'Protect', color: CI.orange, tip: 'Control, pause, or move to safety' },
              { label: 'Escalate', color: CI.red, tip: '911 when needed · notify · document' },
            ].map((z) => (
              <div key={z.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Lessons</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="achcm07-quiz-main">
      <div id="m07-quiz-panel" role="tabpanel" aria-labelledby="m07-tab-quiz" className="achcm07-quiz-page">
        <div className="achcm07-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="achcm07-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
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
              else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                const focused = optionRefs.current.findIndex((node) => node === document.activeElement);
                focusOption(focused >= 0 ? focused : cur);
              }
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
              {submitted ? (idx >= QUIZ.length - 1 ? 'See safety results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}


const STORAGE_KEY = 'achc-art-m07-progress-v1';

type Persisted = {
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers?: (number | null)[];
  quizIdx?: number;
  quizFinished?: boolean;
  quizSelected?: number | null;
  quizSubmitted?: boolean;
  quizAttempts?: number;
  quizLastScore?: number;
};

function loadProgress(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const parsed = value as Record<string, unknown>;
    const pageIndex = typeof parsed.pageIndex === 'number' && Number.isFinite(parsed.pageIndex)
      ? Math.max(0, Math.min(PAGES.length - 1, Math.trunc(parsed.pageIndex))) : 0;
    const mode = parsed.mode === 'quiz' ? 'quiz' : 'lessons';
    const rawCompleted = parsed.completedByPage && typeof parsed.completedByPage === 'object' && !Array.isArray(parsed.completedByPage)
      ? parsed.completedByPage as Record<string, unknown> : {};
    const completedByPage: Record<number, string[]> = {};
    PAGES.forEach((page) => {
      const allowed = new Set(page.hotspots.map((hotspot) => hotspot.id));
      const candidate = rawCompleted[String(page.id)];
      completedByPage[page.id] = Array.isArray(candidate)
        ? Array.from(new Set(candidate.filter((id): id is string => typeof id === 'string' && allowed.has(id))))
        : [];
    });
    const rawAnswers = Array.isArray(parsed.quizAnswers) ? parsed.quizAnswers : [];
    const quizAnswers = QUIZ.map((question, index) => {
      const answer = rawAnswers[index];
      return typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < question.options.length ? answer : null;
    });
    const quizIdx = typeof parsed.quizIdx === 'number' && Number.isFinite(parsed.quizIdx)
      ? Math.max(0, Math.min(QUIZ.length - 1, Math.trunc(parsed.quizIdx))) : 0;
    const selected = parsed.quizSelected;
    const quizSelected = typeof selected === 'number' && Number.isInteger(selected) && selected >= 0 && selected < QUIZ[quizIdx].options.length ? selected : null;
    const quizAttempts = typeof parsed.quizAttempts === 'number' && Number.isFinite(parsed.quizAttempts)
      ? Math.max(0, Math.trunc(parsed.quizAttempts)) : 0;
    const quizLastScore = typeof parsed.quizLastScore === 'number' && Number.isFinite(parsed.quizLastScore)
      ? Math.max(0, Math.min(QUIZ.length, Math.trunc(parsed.quizLastScore))) : 0;
    return {
      pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizSelected, quizAttempts, quizLastScore,
      quizFinished: parsed.quizFinished === true,
      quizSubmitted: parsed.quizSubmitted === true,
    };
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
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

export default function ACHCARTM07() {
  const initial = loadProgress();
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial?.completedByPage ?? {});
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial?.quizAnswers ?? Array(QUIZ.length).fill(null));
  const [quizIdx, setQuizIdx] = useState(initial?.quizIdx ?? 0);
  const [quizFinished, setQuizFinished] = useState(!!initial?.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial?.quizSelected ?? null);
  const [quizSubmitted, setQuizSubmitted] = useState(!!initial?.quizSubmitted);
  const [quizAttempts, setQuizAttempts] = useState(initial?.quizAttempts ?? 0);
  const [quizLastScore, setQuizLastScore] = useState(initial?.quizLastScore ?? 0);
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
      quizAttempts,
      quizLastScore,
      ...patch,
    });
  };

  useEffect(() => {
    persistAll();
  }, [pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizFinished, quizSelected, quizSubmitted, quizAttempts, quizLastScore]);

  const handleSaveExit = () => {
    persistAll();
    window.history.back();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = mode === 'quiz' ? PAGES.length : pageIndex;
    let target = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (current + 1) % (PAGES.length + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (current - 1 + PAGES.length + 1) % (PAGES.length + 1);
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = PAGES.length;
    else return;
    event.preventDefault();
    if (target === PAGES.length) setMode('quiz');
    else { setMode('lessons'); setPageIndex(target); }
    window.requestAnimationFrame(() => document.getElementById(target === PAGES.length ? 'm07-tab-quiz' : `m07-tab-${target}`)?.focus());
  };

  const handleQuizPersist = useCallback((state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean; attempts: number; lastScore: number }) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
    setQuizAttempts(state.attempts);
    setQuizLastScore(state.lastScore);
  }, []);

  return (
    <div className="achcm07 achcm07-shell">
      <style>{STYLES}</style>
      <header className="achcm07-top">
        <div className="achcm07-brand">
          <BrandMark size={28} />
          <span className="brand-text">M07 Safety</span>
        </div>
        <div className="achcm07-tabs" role="tablist" aria-label="Lessons" onKeyDown={handleTabKeyDown}>
          {PAGES.map((p, i) => (
            <button key={p.id} id={`m07-tab-${i}`} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              aria-controls="m07-lesson-panel" tabIndex={mode === 'lessons' && i === pageIndex ? 0 : -1}
              className={`achcm07-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              {p.shortName}
            </button>
          ))}
          <button id="m07-tab-quiz" type="button" role="tab" aria-selected={mode === 'quiz'} aria-controls="m07-quiz-panel" tabIndex={mode === 'quiz' ? 0 : -1}
            className={`achcm07-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="achcm07-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <QuizPage
          onBack={() => setMode('lessons')}
          initialAnswers={quizAnswers}
          initialIdx={quizIdx}
          initialFinished={quizFinished}
          initialSelected={quizSelected}
          initialSubmitted={quizSubmitted}
          initialAttempts={quizAttempts}
          initialLastScore={quizLastScore}
          onPersist={handleQuizPersist}
        />
      ) : (
        <main className="achcm07-lesson-tabpanel">
          <div id="m07-lesson-panel" role="tabpanel" aria-labelledby={`m07-tab-${pageIndex}`} className="achcm07-work">
            <aside className="achcm07-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
            <section className="achcm07-right">
              <RightPanel page={page} completed={completed}
                setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
                onGoQuiz={() => setMode('quiz')} />
            </section>
          </div>
        </main>
      )}

      <footer className="achcm07-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((i) => Math.max(0, i - 1));
          }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
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
