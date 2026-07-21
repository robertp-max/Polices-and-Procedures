/**
 * ACHC-ART-M03 — Handling Complaints & Grievances
 * Production candidate aligned to the LVN-002 v5.3.5 interaction shell.
 * 7 lessons | 35 hotspots | 10-question final | 80% pass | 3 attempts
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-classify.png';
import img02 from './assets/lesson-02-listen.png';
import img03 from './assets/lesson-03-route.png';
import img04 from './assets/lesson-04-boundaries.png';
import img05 from './assets/lesson-05-rights.png';
import img06 from './assets/lesson-06-resolve.png';
import img07 from './assets/lesson-07-scenarios.png';

type HotspotTone = 'guide' | 'action' | 'urgent';

interface SourceChip {
  kind: 'Federal' | 'California' | 'Accreditation' | 'Care Indeed policy' | 'Practice';
  text: string;
}

interface KeyAction {
  icon: string;
  title: string;
  detail: string;
}

interface DetailSection {
  heading: string;
  paragraphs: string[];
  checklist?: string[];
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  tone: HotspotTone;
  observation: string;
  why: string;
  safeAction: string;
  notify?: string;
  document: string;
  sourceRefs: string[];
}

interface Lesson {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: DetailSection[];
  keyActions: KeyAction[];
  clinicalTip: string;
  sourceChips: SourceChip[];
  sceneImage: string;
  sceneAlt: string;
  scenePrompt: string;
  hotspots: Hotspot[];
}

interface QuizQuestion {
  id: number;
  lessonId: number;
  objective: string;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
}

interface QuizAttemptRecord {
  attempt: number;
  score: number;
  completedAt: string;
}

const MODULE_META = {
  id: 'ACHC-ART-M03',
  title: 'Handling Complaints & Grievances',
  audience: 'Care Indeed direct-care and field-worker employees',
  frequency: 'On hire and annually',
  lessonCount: 7,
  hotspotCount: 35,
  quizCount: 10,
  passingPercent: 80,
  maxAttempts: 3,
  estimatedMinutes: '45–60',
} as const;

const LESSONS: Lesson[] = [
  {
    id: 0,
    shortName: 'Recognize',
    title: 'Recognize the Concern and the Correct Path',
    subtitle: 'Treat every expression of dissatisfaction as information that must be heard and routed',
    overview: [
      'A complaint can begin with a formal letter, but it often begins with an ordinary sentence: “No one called me,” “This is not what I expected,” or “I do not feel respected.” Care Indeed policy defines a complaint broadly as any expression of dissatisfaction from a patient, family member, caregiver, or representative about care or services. Do not wait for the person to use a legal word or complete a form before you respond.',
      'Your first job is recognition, not final classification. Receive the concern, protect immediate safety, preserve the person’s own words, and notify through the approved path. Management decides whether the matter was resolved at the first contact or requires a formal grievance investigation. A concern that also suggests abuse, neglect, exploitation, privacy risk, discrimination, or immediate danger follows the specialized reporting path at the same time; the complaint process never replaces those duties.',
    ],
    details: [
      {
        heading: 'Five labels, five practical meanings',
        paragraphs: [
          'A service concern is a useful conversational label for a question or dissatisfaction about scheduling, communication, supplies, billing, staff conduct, or care. It is not a reason to keep the matter informal or off the record. Use complaint as the broad intake term for an expression of dissatisfaction. A grievance is a concern placed into the agency’s formal review and resolution process under the current controlled workflow. The designated grievance lead—not the receiving field worker—makes the final classification.',
          'An allegation is an unverified statement that something happened. Calling it an allegation protects neutrality: it does not mean the statement is false, and it does not mean the field worker has decided it is true. Record who said what and what you directly observed. An abuse, neglect, exploitation, injury-of-unknown-source, or property-misappropriation concern is different because federal rules require immediate reporting to the agency and other appropriate authorities under state law. Route that concern immediately under the mandatory-reporting policy while the complaint is also preserved.',
        ],
        checklist: [
          'Complaint: any dissatisfaction—spoken, written, digital, or communicated by a representative.',
          'Grievance: formal agency classification requiring investigation and resolution.',
          'Allegation: an unverified report; preserve it without deciding credibility.',
          'Safety or abuse signal: protect the patient and activate the specialized reporting path immediately.',
        ],
      },
      {
        heading: 'Do not filter by tone, format, or source',
        paragraphs: [
          'A calm patient can raise a serious issue, and an angry caller can raise a valid one. The person may speak indirectly, use another language, communicate through an auxiliary aid, or ask a family member to speak. Federal home-health rules protect complaints from the patient, representative, caregivers, and family. Care Indeed policy also accepts concerns from these sources. Do not require a signature, perfect chronology, or proof before forwarding the report.',
          'A patient may identify several issues at once. For example, a missed visit can be a service complaint; the resulting medication or wound-care gap can create a clinical safety concern; and a dismissive response can raise a patient-rights concern. Route each active risk instead of forcing the report into one category. If you are unsure what label applies, say “I am reporting the concern so the appropriate leader can review it.”',
        ],
      },
      {
        heading: 'Mini-case: “Maybe I should not complain”',
        paragraphs: [
          'A patient says a visit was late and then adds, “Please forget I said anything. I do not want my services cut.” This is both a service concern and a fear-of-retaliation signal. A safe response is: “You have the right to raise concerns without retaliation. I will share this through the agency’s complaint process so it can be addressed.” Do not promise that no one will know who reported; information may need to be shared with authorized reviewers to investigate fairly.',
          'Document the patient’s words about the late visit and fear of losing services, the date and time, who was present, any care impact you directly observed, what you did to protect current needs, and whom you notified. Do not write that the scheduler “ignored” the patient unless you personally observed that act and can describe it factually.',
        ],
      },
      {
        heading: 'Universal field-worker decision rule',
        paragraphs: [
          'Use the same five-step rule regardless of discipline: listen; check for immediate danger or urgent care needs; preserve facts and the person’s requested outcome; notify the appropriate supervisor or on-call path without avoidable delay; and document in the approved complaint workflow. Continue only care that remains safe, ordered, and within your role. If the concern makes the planned visit unsafe or clinically inappropriate, stop and obtain direction.',
        ],
      },
    ],
    keyActions: [
      { icon: '👂', title: 'Hear the signal', detail: 'Any dissatisfaction can activate the process; no special wording is required.' },
      { icon: '🧭', title: 'Route, do not classify alone', detail: 'Management makes the final complaint/grievance classification.' },
      { icon: '🛡️', title: 'Separate urgent duties', detail: 'Safety, abuse, privacy, or discrimination paths run in parallel.' },
      { icon: '📝', title: 'Preserve exact facts', detail: 'Record the speaker’s words and your direct observations.' },
    ],
    clinicalTip: 'When you are unsure whether a comment “counts,” report it. Under-reporting closes the door on both resolution and trend learning.',
    sourceChips: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(3), (e)' },
      { kind: 'Care Indeed policy', text: 'Complaint/grievance workflow — use current controlled version' },
      { kind: 'Care Indeed policy', text: 'CL-PR-001; CL-PR-006' },
    ],
    sceneImage: img01,
    sceneAlt: 'A home-health field worker listens at a dining table while an older patient raises a concern; a second worker remains in the background, and a closed rights folder, blank notepad, phone, and medication organizer are separated on the table.',
    scenePrompt: 'Recognize → protect → preserve → route',
    hotspots: [
      {
        id: 'patient-voice', label: 'Patient’s own words', shortLabel: 'Patient voice', x: 69, y: 45, tone: 'action',
        observation: 'The patient is describing dissatisfaction directly, without using the words complaint or grievance.',
        why: 'The right to complain does not depend on a form, a legal label, or a particular emotional tone.',
        safeAction: 'Listen without interruption, reflect the main concern, and ask what outcome the patient is seeking.',
        notify: 'Route the concern through the supervisor or designated complaint process; use urgent escalation if safety is affected.',
        document: 'Date, time, speaker, exact concern in neutral language, requested outcome, immediate safety check, and routing action.',
        sourceRefs: ['Current controlled complaint/grievance workflow', '42 CFR § 484.50(c)(3)'],
      },
      {
        id: 'care-impact', label: 'Care impact or safety signal', shortLabel: 'Parallel risk', x: 87, y: 86, tone: 'urgent',
        observation: 'The medication organizer represents the possibility that a scheduling, communication, or service concern may also affect current care.',
        why: 'A complaint handoff never replaces immediate clinical, safety, abuse, privacy, or compliance action when a parallel risk is present.',
        safeAction: 'Check the patient’s current needs within your role, continue only safe ordered care, and activate the applicable parallel route without waiting for grievance review.',
        notify: 'Contact the appropriate clinician, supervisor, on-call pathway, emergency service, or specialized reporting channel based on the risk.',
        document: 'Patient report, direct findings, current care impact, protective action, each notification, and instructions received.',
        sourceRefs: ['42 CFR § 484.50(e)', 'Current controlled complaint/grievance workflow'],
      },
      {
        id: 'rights-folder', label: 'Rights and complaint information', shortLabel: 'Rights packet', x: 18, y: 84, tone: 'guide',
        observation: 'The closed packet represents the current admission rights and complaint-contact information.',
        why: 'Patients must receive understandable, accessible rights information and agency administrator contact information for complaints.',
        safeAction: 'Offer the current agency-approved packet or help obtain an accessible copy; never substitute an old number from memory.',
        notify: 'Tell the office if the packet is missing, outdated, unreadable, or not available in the needed format or language.',
        document: 'What information or accessible format was provided and any follow-up requested.',
        sourceRefs: ['42 CFR § 484.50(a), (f)', 'CL-PR-001', 'OP-PA-003'],
      },
      {
        id: 'fact-note', label: 'Contemporaneous fact note', shortLabel: 'Facts now', x: 50, y: 84, tone: 'action',
        observation: 'A blank notepad and pen represent the need to preserve facts while they are fresh.',
        why: 'Delay increases memory error and can erase the difference between what was said, what was observed, and what was inferred.',
        safeAction: 'Use the approved secure workflow as soon as possible. Separate direct quotations, observations, and actions taken.',
        notify: 'Forward the report to the role named by current policy; do not leave the only copy in a personal notebook.',
        document: 'Concrete dates, times, people present, direct quotes when important, observed care impact, and notifications.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'CL-CD-001'],
      },
      {
        id: 'parallel-path', label: 'Urgent parallel reporting', shortLabel: 'Safety split', x: 69, y: 86, tone: 'urgent',
        observation: 'The phone represents a separate rapid path if the concern includes danger, abuse, neglect, exploitation, or another urgent event.',
        why: 'A grievance log does not replace emergency action or mandatory reporting. Waiting for routine review may expose the patient to further harm.',
        safeAction: 'Protect immediate safety within your role, call emergency services for immediate danger, and activate the agency’s mandatory-reporting or incident pathway.',
        notify: 'Notify the appropriate supervisor, clinician, or on-call leader immediately and make required external reports under the applicable policy and law.',
        document: 'Objective trigger, safety measures, each person or authority contacted, time, instructions received, and patient disposition.',
        sourceRefs: ['42 CFR § 484.50(e)(2)', 'CL-PR-006', 'RM-ER-002'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Resolve',
    title: 'Understand Investigation, Follow-Up, and QAPI',
    subtitle: 'Know what happens after handoff so you can set honest expectations and support improvement',
    overview: [
      'Once a concern is handed off, authorized leaders log and classify it, assign an investigator, preserve records, review relevant care and operational information, interview people fairly, determine findings, communicate a resolution, and track corrective action. The field worker may be asked for a factual statement or records, but should not coordinate witness accounts or attempt a private parallel investigation.',
      'Detailed ownership, acknowledgment, investigation, response, and follow-up timing must come from the current controlled Care Indeed workflow. The field worker’s durable rule is to document at receipt, route without avoidable delay through the current approved path, respond honestly to authorized follow-up, and report any new risk or retaliation immediately. Complaint patterns then feed QAPI so the agency can improve systems, not merely close individual files.',
    ],
    details: [
      {
        heading: 'A fair investigation lifecycle',
        paragraphs: [
          'The designated grievance lead or authorized reviewer examines relevant clinical and operational records, interviews involved people separately, and obtains clinical, privacy, compliance, safety, or other specialist input when the issue requires it. The reviewer documents findings under the current approved process. A finding describes whether available evidence supports the allegation; it is not a judgment of the complainant’s worth or right to speak.',
          'Field workers must preserve requested records, answer from personal knowledge, identify uncertainty, and avoid discussing interviews with other witnesses. If you later remember a material fact, send a dated addendum through the investigator. Never delete messages, rewrite a visit note to look better, ask a coworker to “match” your memory, or retaliate against the patient or reporter.',
        ],
        checklist: [
          'Cooperate with the authorized investigator and preserve relevant records.',
          'State what you saw, heard, did, and documented; distinguish memory from record review.',
          'Do not coordinate accounts or contact the complainant outside assigned duties.',
          'Report new safety facts, evidence loss, pressure, or retaliation immediately.',
        ],
      },
      {
        heading: 'Ownership and timing come from the controlled workflow',
        paragraphs: [
          'Do not memorize a management deadline, named owner, or routing address from training content that may become outdated. Use the current approved complaint workflow to identify the designated grievance lead, acknowledgment and follow-up expectations, escalation sequence, and record location. If a patient asks when the agency will respond, explain the next handoff you can complete and obtain an authorized answer rather than guessing.',
          'Federal 42 CFR § 484.50(e) requires the home-health agency to investigate covered complaints, document the complaint and its resolution, take action to prevent further potential violations including retaliation during the investigation, and immediately report recognized mistreatment or abuse findings through required paths. Field workers support those duties through immediate receipt, safety action, accurate preservation, and prompt approved routing.',
        ],
      },
      {
        heading: 'Resolution, dissatisfaction, and further review',
        paragraphs: [
          'Resolution may include staff coaching or corrective action, process improvement, additional training, service modification through authorized channels, a formal apology, or a documented unsubstantiated finding. Privacy and employment rules may limit details the agency can share about personnel action. Do not tell the patient that “nothing happened” simply because disciplinary details are not disclosed.',
          'If the complainant remains dissatisfied, route the request for further review through the current approved workflow and provide the current controlled rights packet containing outside reporting options. Do not invent an internal review tier, make internal completion a condition for outside contact, name an outdated destination, or predict what any reviewing entity will decide.',
        ],
      },
      {
        heading: 'From one complaint to system improvement',
        paragraphs: [
          'The agency aggregates complaint and grievance information for trend review and QAPI according to the current controlled process. QAPI can connect a complaint about late supplies to delivery data, missed-visit reports, patient-satisfaction feedback, and adverse events. A repeated “small” concern may reveal a larger access, staffing, communication, or process failure.',
          'Corrective action should have an owner, due date, measure, and follow-up. Training alone is not always enough; the system may need a workflow change, staffing control, vendor correction, or better patient information. Field workers support learning by reporting near misses and recurring concerns consistently, not by minimizing them to protect a score.',
        ],
      },
    ],
    keyActions: [
      { icon: '🔍', title: 'Cooperate fairly', detail: 'Give facts and records; do not coordinate accounts or alter notes.' },
      { icon: '🏷️', title: 'Use the controlled workflow', detail: 'Current ownership and timing come from the approved process—not memory.' },
      { icon: '↗️', title: 'Support escalation rights', detail: 'Use current external information; do not invent gates or outcomes.' },
      { icon: '📈', title: 'Feed QAPI', detail: 'Patterns drive corrective action and measured system improvement.' },
    ],
    clinicalTip: 'An “unsubstantiated” finding does not mean the patient was wrong to report. It means the available evidence did not establish the allegation under the review process.',
    sourceChips: [
      { kind: 'Care Indeed policy', text: 'Complaint/grievance workflow — current controlled version' },
      { kind: 'Federal', text: '42 CFR § 484.50(e)' },
      { kind: 'Care Indeed policy', text: 'QA-SM-003; QA-PG-001' },
    ],
    sceneImage: img06,
    sceneAlt: 'In an agency conference room, three authorized staff review blank grievance materials beside a closed file, locked cabinet, laptop with abstract bars, and a whiteboard with unlabeled process and trend symbols.',
    scenePrompt: 'Intake → fair review → response → improvement',
    hotspots: [
      {
        id: 'assigned-investigator', label: 'Neutral assigned investigator', shortLabel: 'Assigned review', x: 58, y: 58, tone: 'action',
        observation: 'An assigned reviewer, rather than the field worker who received the concern, manages the formal investigation.',
        why: 'Role separation supports consistent evidence review and reduces conflict of interest or witness contamination.',
        safeAction: 'Cooperate honestly, identify the limits of your knowledge, and direct new evidence to the investigator.',
        notify: 'Report pressure to change an account, evidence loss, or retaliation to Compliance or the next authorized leader.',
        document: 'Requested statement or addendum, source records, date provided, and any new risk identified.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'Authorized investigation workflow'],
      },
      {
        id: 'sealed-file', label: 'Preserved grievance file', shortLabel: 'Preserve record', x: 28, y: 80, tone: 'guide',
        observation: 'The sealed folder represents the controlled record of intake, evidence, findings, response, and closure.',
        why: 'A complete record demonstrates that the concern existed, was investigated, was resolved, and triggered protective action when needed.',
        safeAction: 'Provide requested records without alteration and keep investigation materials within approved access controls.',
        document: 'Chain of transfer and any correction or late-added information according to policy.',
        sourceRefs: ['42 CFR § 484.50(e)(1)(ii)', 'Current controlled complaint/grievance record'],
      },
      {
        id: 'timeline', label: 'Policy-governed timeline', shortLabel: 'Policy timeline', x: 64, y: 19, tone: 'guide',
        observation: 'The abstract timeline represents Care Indeed’s management milestones for acknowledgment, investigation, response, and status updates.',
        why: 'Clear ownership and tracking reduce silent delays, but the detailed dates come from current agency policy.',
        safeAction: 'Field workers route promptly and use the current controlled workflow; do not quote a deadline or owner from memory.',
        notify: 'Use the current escalation path if a complaint appears stalled or retaliation risk is not controlled.',
        document: 'Your own receipt and handoff times; management maintains investigation milestones.',
        sourceRefs: ['Current controlled complaint/grievance workflow', '42 CFR § 484.50(e)'],
      },
      {
        id: 'corrective-plan', label: 'Corrective action and follow-through', shortLabel: 'Corrective action', x: 58, y: 71, tone: 'action',
        observation: 'A checklist represents specific corrective work assigned after findings.',
        why: 'Closing a file without preventing recurrence does not protect patients or improve service.',
        safeAction: 'Complete any assigned retraining or process change, ask questions, and use the revised workflow consistently.',
        notify: 'Report if the correction cannot be implemented or creates a new safety or scope issue.',
        document: 'Completion evidence and observed effectiveness as required by the corrective plan.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'QA-PG-001'],
      },
      {
        id: 'trend-review', label: 'Complaint trend and QAPI link', shortLabel: 'QAPI trend', x: 88, y: 18, tone: 'guide',
        observation: 'Unlabeled trend cards represent aggregation across categories and time rather than disclosure of individual cases.',
        why: 'Repeated minor complaints may reveal a systemic reliability, access, staffing, or communication problem.',
        safeAction: 'Report concerns consistently and participate in assigned improvement without blaming complainants.',
        document: 'QAPI leaders retain aggregate measures, actions, owners, and follow-up results.',
        sourceRefs: ['Current controlled complaint/grievance workflow', '42 CFR § 484.65'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Practice',
    title: 'Integrate Judgment in Complex Field Scenarios',
    subtitle: 'Protect first, listen fully, route every active pathway, and leave a defensible record',
    overview: [
      'Real complaints rarely arrive in tidy categories. A delayed supply may affect safe care. A harsh staff interaction may also suggest discrimination. A missed visit may create both clinical risk and a service grievance. The safe field response is not to choose one label and ignore the rest; it is to separate the active pathways and complete each one.',
      'Use the P-R-O-T-E-C-T sequence: Pause and listen; Recognize immediate danger and specialized report triggers; Observe and preserve facts; Tell the appropriate supervisor or on-call leader; Enable complaint rights and access; Continue only safe ordered care; Track what you did in the approved record. This sequence supports every field role without expanding scope or authorizing investigation.',
    ],
    details: [
      {
        heading: 'Scenario 1: missed visit, billing concern, and medication uncertainty',
        paragraphs: [
          'The patient and her son report a recurring missed visit, question a billing envelope, and say the patient is uncertain whether today’s medication teaching occurred. Treat the scheduling and billing concerns as complaints and the medication uncertainty as a current clinical risk. Assess within your role, protect against immediate harm, and contact the supervising clinician or on-call path. Do not change medication instructions, promise a refund, or promise a staffing outcome.',
          'Document each person’s words, the medication organizer and documents you directly observed without drawing conclusions, current clinical findings, immediate actions, reported dates, each notification, and the authorized continuity plan. The complaint, clinical, and billing handoffs may all be required.',
        ],
      },
      {
        heading: 'Scenario 2: allegation against a staff member',
        paragraphs: [
          'A patient says a worker used insulting language and took cash from a table. Ensure immediate safety, receive the patient’s words, and avoid confronting the named worker. Possible verbal abuse and property misappropriation trigger immediate agency and appropriate external reporting under the mandatory-reporting path, in parallel with the grievance. Do not search the home, count other property, call coworkers for background, or decide whether the allegation is believable.',
          'If cash, a receipt, video, or message is offered, preserve it according to direction without copying to a personal device. Document the reported allegation as reported, what you directly observed, current safety, notifications and times, and instructions. Avoid words such as theft confirmed unless an authorized investigation establishes that finding.',
        ],
      },
      {
        heading: 'Scenario 3: complaint about your own care',
        paragraphs: [
          'A caregiver says you failed to explain a procedure and asks that you never return. Do not argue your chart or ask the patient to defend you. Check whether current care is still consented to and safe, listen to the requested outcome, notify your supervisor, and document the concern neutrally. If the patient refuses the rest of the visit, follow the refusal and clinical notification process. Do not promise reassignment; an authorized leader decides staffing.',
          'Your later statement should distinguish what you remember independently, what the record shows, and what you learned after the complaint. Do not add a defensive late entry disguised as contemporaneous documentation. A factual addendum must follow documentation policy.',
        ],
      },
      {
        heading: 'Defensible documentation self-check',
        paragraphs: [
          'Before closing your field role in the event, ask: Can a reviewer tell who raised the concern and what they said? Is it clear what I observed versus what others reported? Did I record immediate safety and care impact? Are every notification and instruction time-stamped? Did I avoid conclusions, blame, and promises? Did I use the designated secure workflow? Did I document access support and the requested outcome? Did I route each parallel risk?',
          'Training completion does not authorize you to investigate, modify the plan of care, make legal conclusions, or perform tasks outside your role. When details differ by discipline, use the universal safe behavior: protect the patient, remain within the current plan/order and scope, stop when needed, notify the appropriate supervisor or clinician, and document objectively.',
        ],
        checklist: [
          'Complaint path completed.',
          'Immediate clinical or safety path completed.',
          'Mandatory, privacy, compliance, or discrimination path completed when triggered.',
          'Accessible communication and non-retaliation rights protected.',
          'Objective, secure, time-stamped record completed.',
        ],
      },
    ],
    keyActions: [
      { icon: '⏸️', title: 'Pause and protect', detail: 'Check immediate danger and current care needs before routine intake.' },
      { icon: '🛤️', title: 'Run parallel paths', detail: 'Complaint review never replaces clinical, safety, or mandatory reporting.' },
      { icon: '📣', title: 'Escalate until accepted', detail: 'Use on-call and next-level routes for time-sensitive handoffs.' },
      { icon: '🧾', title: 'Defend with facts', detail: 'Attribute reports, time-stamp actions, and avoid conclusions.' },
    ],
    clinicalTip: 'One event may require several reports. Completing the complaint form does not close an active clinical, abuse, privacy, or immediate-safety obligation.',
    sourceChips: [
      { kind: 'Federal', text: '42 CFR § 484.50(c), (e), (f)' },
      { kind: 'Care Indeed policy', text: 'Current complaint and mandatory-reporting workflows' },
      { kind: 'Care Indeed policy', text: 'Current documentation, after-hours, and incident workflows' },
    ],
    sceneImage: img07,
    sceneAlt: 'During an apartment home visit, an older patient in a wheelchair speaks while her son holds a sealed envelope and gestures toward a blank wall calendar; the field worker listens with a closed notebook, and a phone, medication organizer, clock, and zipped agency bag remain visible.',
    scenePrompt: 'P-R-O-T-E-C-T: parallel paths, one defensible record',
    hotspots: [
      {
        id: 'medication-safety', label: 'Immediate medication and continuity safety', shortLabel: 'Safety first', x: 88, y: 88, tone: 'urgent',
        observation: 'The medication organizer represents possible current care impact when a reported visit or medication-teaching encounter may have been missed.',
        why: 'A scheduling complaint can also create a clinical continuity risk that cannot wait for routine grievance review.',
        safeAction: 'Assess within your role and current orders, protect against immediate harm, and contact the clinician or emergency services as the situation requires; do not change medication instructions.',
        notify: 'Contact the supervising clinician or on-call pathway and the complaint route in parallel.',
        document: 'The report, organizer directly observed, clinical findings, immediate actions, each notification, and the authorized continuity plan.',
        sourceRefs: ['Current complaint and after-hours workflows', '42 CFR § 484.50(e)'],
      },
      {
        id: 'patient-goal', label: 'Patient’s requested outcome', shortLabel: 'Desired outcome', x: 47, y: 50, tone: 'action',
        observation: 'The patient is identifying both a problem and what they need next.',
        why: 'Requested resolution guides follow-up but does not authorize the field worker to promise it.',
        safeAction: 'Ask what would help, repeat it back, and explain the next action you can take.',
        document: 'Patient’s own words, desired outcome, and any limits explained.',
        sourceRefs: ['Current controlled complaint/grievance workflow'],
      },
      {
        id: 'worker-pause', label: 'Care paused for safe listening', shortLabel: 'Pause care', x: 24, y: 41, tone: 'guide',
        observation: 'The worker pauses nonessential activity to hear the concern and assess whether care can safely continue.',
        why: 'Continuing distracted care may miss a safety signal or disregard the patient’s consent.',
        safeAction: 'Clarify current consent and needs, continue only safe ordered care within role, or stop and obtain direction.',
        notify: 'Notify the appropriate clinician if care is refused, held, incomplete, or changed by authorized direction.',
        document: 'Care completed or held, reason, patient response, education, and notification.',
        sourceRefs: ['CL-PR-001', 'CL-CD-001'],
      },
      {
        id: 'wheelchair-access', label: 'Access and environmental barrier', shortLabel: 'Access barrier', x: 35, y: 72, tone: 'guide',
        observation: 'The wheelchair and narrow path may affect service access and the person’s ability to reach supplies or leave safely.',
        why: 'Environmental and disability access factors can compound a service concern and require accommodation.',
        safeAction: 'Ask what barrier the patient experiences, keep pathways safe within role, and request appropriate accommodation or service review.',
        notify: 'Escalate unresolved access or safety barriers to the supervisor and appropriate clinical or operations lead.',
        document: 'Barrier observed or reported, accommodation requested, immediate mitigation, and follow-up owner.',
        sourceRefs: ['42 CFR § 484.50(f)', 'OP-PA-003'],
      },
      {
        id: 'service-calendar', label: 'Reported schedule pattern', shortLabel: 'Schedule facts', x: 84, y: 29, tone: 'action',
        observation: 'The blank wall calendar represents reported visit dates that may help the authorized reviewer reconstruct a service pattern.',
        why: 'Reported dates support complaint review and QAPI trend analysis but do not, by themselves, establish why a visit was missed.',
        safeAction: 'Ask for the dates the patient remembers, attribute them to the speaker, and avoid filling gaps with assumptions.',
        notify: 'Route the scheduling concern through the current complaint and operations paths while any care risk follows the clinical path.',
        document: 'Reported dates, speaker, requested outcome, current care impact, contacts, and the authorized follow-up plan.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'CL-CD-001', '42 CFR § 484.65'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Boundaries',
    title: 'Receive and Preserve Facts—Do Not Investigate',
    subtitle: 'Stay helpful without questioning witnesses, assigning blame, or promising a result',
    overview: [
      'Field workers are often first to hear a concern, but they are not the assigned investigator simply because they were present. Your role is to receive enough information to recognize the issue, address immediate care or safety needs, preserve what was offered, and transfer the matter. Formal investigators review records, interview people separately, assess credibility, determine findings, and authorize corrective action.',
      'Good intentions can damage a fair review. Repeated questioning may change a person’s memory; group conversations can contaminate accounts; moving an item can destroy context; and promises can create false expectations. Neutral boundaries protect the patient, the reporting person, involved staff, and the integrity of the agency response.',
    ],
    details: [
      {
        heading: 'Information gathering versus investigation',
        paragraphs: [
          'You may ask intake questions needed for safety and routing: “What happened?” “When did it happen?” “Is anyone in immediate danger?” “Is there care you need right now?” and “How would you like to be contacted?” Stop when you can describe the concern and current risk. Do not test the story, demand proof, ask the same question in different ways, confront the person named, or interview household members one by one.',
          'If the complainant begins showing messages, objects, photographs, or paperwork, do not seize, edit, forward, or copy them on a personal device. Preserve the item where safe, note what was offered, and ask the authorized reviewer how to transfer it securely. For suspected abuse or criminal conduct, follow the mandatory-reporting and evidence-preservation instructions; do not conduct a home search.',
        ],
        checklist: [
          'Ask only what is needed to protect safety and make an accurate handoff.',
          'Do not confront the person accused or announce the allegation to coworkers.',
          'Do not move, discard, annotate, or photograph possible evidence on a personal device.',
          'Do not decide “substantiated” or “unsubstantiated.”',
        ],
      },
      {
        heading: 'Promises you can and cannot make',
        paragraphs: [
          'You can promise your own action: “I will send this report through the approved process before I end my shift.” You can explain rights: “You may raise this concern without retaliation.” You cannot promise a specific finding, discipline, refund, staff change, replacement visit, confidentiality outcome, or completion date unless an authorized policy and leader support that statement.',
          'Do not promise total secrecy or anonymity. The agency limits information to people who need it, but a fair investigation may require disclosure of relevant facts, and outside authorities may need information. A safe explanation is: “The agency will protect the information as much as possible and share it only for review, safety, or legal requirements. I cannot promise that no one will learn who reported.”',
        ],
      },
      {
        heading: 'Care continues within the current plan',
        paragraphs: [
          'A complaint does not automatically stop care, change the plan, remove a worker, or authorize a new service. Continue safe, consented, ordered care within your current role unless the concern creates a safety conflict or an authorized clinician changes the plan. If the patient refuses the rest of the visit, honor the refusal, explain any immediate risk within your role, notify the appropriate clinician, and document the refusal separately from the complaint intake.',
          'Do not pressure the patient to continue care in exchange for complaint follow-up. Do not threaten discharge, reduce attention, avoid the home, or change your tone because the patient complained. If you are personally named in the concern, stay calm, protect current needs, notify your supervisor, and avoid creating your own defense statement in the patient’s presence.',
        ],
      },
      {
        heading: 'Mini-case: the sealed supply box',
        paragraphs: [
          'A family member says supplies arrived late and the box contains the wrong items. The box is still sealed. You can check immediate patient needs within your role and current orders, record that the box was sealed when you saw it, and notify the supervisor or supply process. Do not open the box solely to prove the complaint, photograph shipping labels on a personal phone, accuse the vendor, or promise reimbursement.',
          'If needed supplies are unavailable for ordered care, stop and obtain clinical direction. Document the item needed, effect on the visit, care held or modified only under authorized direction, the family’s words, the sealed-box observation, notifications, and the plan communicated by the authorized leader.',
        ],
      },
    ],
    keyActions: [
      { icon: '🧩', title: 'Clarify only essentials', detail: 'Ask enough for safety, routing, and requested follow-up.' },
      { icon: '🛑', title: 'Do not investigate', detail: 'No witness interviews, confrontations, searches, or credibility findings.' },
      { icon: '📦', title: 'Preserve context', detail: 'Leave possible evidence undisturbed and seek secure transfer direction.' },
      { icon: '✅', title: 'Promise only your action', detail: 'State what you will report—not the outcome someone else must decide.' },
    ],
    clinicalTip: 'Neutrality is active protection. “I will preserve what you told me and route it for review” is more useful than defending, agreeing, or predicting.',
    sourceChips: [
      { kind: 'Care Indeed policy', text: 'Complaint/grievance workflow — current controlled version' },
      { kind: 'Federal', text: '42 CFR § 484.50(e)' },
      { kind: 'Care Indeed policy', text: 'CL-PR-001; CL-CD-001' },
    ],
    sceneImage: img04,
    sceneAlt: 'At a home entry, an older patient hands a sealed complaint envelope to a field worker while a household member remains in the sitting room; a closed folder, blank notepad, and phone are separated on a nearby table.',
    scenePrompt: 'Receive facts—not witnesses, findings, or promises',
    hotspots: [
      {
        id: 'initial-account', label: 'Initial account', shortLabel: 'Essential facts', x: 38, y: 42, tone: 'action',
        observation: 'The patient is providing an initial account while the worker receives it without debating or cross-examining.',
        why: 'The intake account helps identify safety and routing needs, but it is not a completed investigation.',
        safeAction: 'Ask what happened, when, current impact, and requested follow-up; avoid repeated or leading questions.',
        notify: 'Transfer the account to the designated leader or investigator.',
        document: 'Attribute statements to the speaker and separate them from your observations.',
        sourceRefs: ['Current controlled complaint/grievance workflow', '42 CFR § 484.50(e)'],
      },
      {
        id: 'supervisor-call', label: 'Supervisor handoff', shortLabel: 'Handoff', x: 82, y: 87, tone: 'action',
        observation: 'The phone represents the approved handoff to a supervisor or designated grievance route rather than a private settlement at the door.',
        why: 'Authorized leaders classify, assign, and investigate formal grievances.',
        safeAction: 'Give a concise, factual handoff, state any immediate care impact first, and read back next steps.',
        notify: 'Use on-call escalation when time-sensitive and the usual supervisor is unavailable.',
        document: 'Person reached, time, facts shared, instructions, and responsibility for next contact.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'Current approved after-hours route'],
      },
      {
        id: 'sealed-envelope', label: 'Original written complaint', shortLabel: 'Preserve original', x: 55, y: 53, tone: 'guide',
        observation: 'The sealed envelope is original material offered by the patient for the agency’s complaint process.',
        why: 'Writing on, opening beyond authorization, copying through a personal device, or losing the original can compromise privacy and the review record.',
        safeAction: 'Receive and transfer it through the approved secure route, preserve its condition, and do not alter or annotate it.',
        notify: 'Ask the designated grievance lead how the original should be logged and transferred when the approved process is unclear.',
        document: 'Who provided it, date and time, visible sealed condition, secure transfer, recipient, and any immediate care issue reported.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'CL-CD-001'],
      },
      {
        id: 'fact-note', label: 'Chronology without reconstruction', shortLabel: 'Known timeline', x: 68, y: 84, tone: 'guide',
        observation: 'The blank notepad represents a contemporaneous intake chronology—not an investigator’s reconstructed narrative.',
        why: 'Guessing or filling gaps can turn an honest intake note into an unreliable narrative.',
        safeAction: 'Record dates as exact, approximate, or unknown; let the investigator compare official records.',
        document: 'Use qualifiers such as “patient estimated” or “caregiver reported” when timing is uncertain.',
        sourceRefs: ['CL-CD-001', 'Current controlled complaint/grievance record'],
      },
      {
        id: 'closed-folder', label: 'Need-to-know confidentiality', shortLabel: 'Limit sharing', x: 47, y: 87, tone: 'guide',
        observation: 'The closed folder represents restricted complaint information.',
        why: 'Casual discussion can harm privacy, fairness, and trust and may alert people before evidence is preserved.',
        safeAction: 'Share only through approved channels with people who need the information for care, safety, review, or law.',
        notify: 'Report any unauthorized disclosure through the privacy/compliance pathway.',
        document: 'Do not create unnecessary duplicate allegation records; note authorized disclosures as required.',
        sourceRefs: ['CO-HP-001', 'Current controlled complaint/grievance workflow'],
      },
    ],
  },
  {
    id: 4,
    shortName: 'Rights',
    title: 'Protect Hotline Rights, Access, Confidentiality, and Non-Retaliation',
    subtitle: 'Make the complaint path usable—not merely available on paper',
    overview: [
      'Patients have the right to complain to the agency and to be advised of the state toll-free home-health hotline. They also have the right to be free from discrimination or reprisal for voicing grievances to the agency or an outside entity. The current controlled rights packet is the source for agency and outside reporting contact information; staff should provide that current material instead of reciting a destination or number from memory.',
      'A right is meaningful only if the person can use it. Federal rules require plain-language, timely information that is accessible to people with disabilities and to people with limited English proficiency, including auxiliary aids and language services at no cost. Protect privacy, involve the person the patient chooses when allowed, and never make internal reporting a condition for contacting an outside entity.',
    ],
    details: [
      {
        heading: 'External choices do not require agency permission',
        paragraphs: [
          'A patient may use the agency process or the outside reporting options listed in the current controlled rights packet. Do not block, discourage, delay, or demand that the patient finish the internal process first. Do not present an agency preference as a legal prerequisite or threaten consequences for outside reporting.',
          'Provide the current patient-rights or welcome packet and offer help locating the correct entry. If information appears outdated or inconsistent, contact the office for the controlled version. Do not choose an external forum for the patient or give legal advice. You may document that information was provided and that the patient requested help, without recording how you think the external agency will decide.',
        ],
      },
      {
        heading: 'Accessibility and language access',
        paragraphs: [
          'Ask what communication method works best. Options may include qualified oral interpretation, translated written material, large print, screen-reader compatible digital information, reading information aloud with consent, communication boards, captioning, or other auxiliary aids. Provide services through the approved agency process at no cost to the individual. Speak directly to the patient, not only to the interpreter or companion.',
          'Teach-back checks access without testing the patient: “To make sure I explained it clearly, how would you contact the agency if you wanted follow-up?” Do not document “patient understood” solely because the person nodded or signed receipt. Record the language or format, interpreter identifier or approved service when applicable, essential information explained, and teach-back result.',
        ],
        checklist: [
          'Ask the patient’s preferred language and communication method.',
          'Use approved qualified language services for complex or sensitive content.',
          'Offer auxiliary aids and accessible formats without charge.',
          'Use teach-back and correct misunderstandings without blame.',
        ],
      },
      {
        heading: 'Confidentiality has practical limits',
        paragraphs: [
          'Hold the conversation in a private area when possible and confirm whom the patient wants involved. Limit information to authorized care, safety, investigation, compliance, or legal needs. Do not discuss the complaint in hallways, group texts, social media, or with coworkers who are merely curious. If a household member asks what the patient said privately, follow consent and representative rules rather than assuming family access.',
          'Never guarantee anonymity. The investigator may need to validate facts with involved people, and an external report may have its own disclosure rules. Explain the limit honestly while emphasizing that retaliation is prohibited. A confidentiality request should be recorded and forwarded so the investigator can plan the least-disclosing fair process.',
        ],
      },
      {
        heading: 'Recognize retaliation and subtle reprisal',
        paragraphs: [
          'Retaliation includes obvious threats, but it can also appear as avoidable service reduction, delayed calls, hostile treatment, pressure to withdraw, or discharge talk linked to the complaint. Report suspected reprisal immediately. Do not alter care frequency, assignments, or access on your own. Legitimate changes must follow the authorized clinical and operational process and must not be punishment for exercising rights.',
          'If a patient says, “After I complained, nobody returns my calls,” treat that as a new concern and possible retaliation signal. Preserve the statement, current service impact, and any objective scheduling information you can see within your role; route it for independent review.',
        ],
      },
    ],
    keyActions: [
      { icon: '☎️', title: 'Use current contacts', detail: 'Provide the controlled rights packet; do not rely on memory.' },
      { icon: '🌐', title: 'Remove access barriers', detail: 'Qualified language help and auxiliary aids are provided at no cost.' },
      { icon: '🔐', title: 'Protect, do not overpromise', detail: 'Limit sharing but explain that anonymity cannot be guaranteed.' },
      { icon: '🛡️', title: 'Watch for reprisal', detail: 'Report threats, hostility, pressure, or complaint-linked service changes.' },
    ],
    clinicalTip: 'Never turn “try the agency first” into a gate. The patient keeps the right to contact outside entities and needs the current approved information to do so.',
    sourceChips: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(9), (11)–(12), (f)' },
      { kind: 'Care Indeed policy', text: 'CL-PR-001; OP-PA-003' },
    ],
    sceneImage: img05,
    sceneAlt: 'An older patient with a hearing aid reviews a closed rights booklet and a blank large-print card with a field worker; a landline phone, hearing-aid case, generic video-language tablet, and closed door support accessible and private communication.',
    scenePrompt: 'Current information • usable access • no retaliation',
    hotspots: [
      {
        id: 'current-packet', label: 'Current rights and contact packet', shortLabel: 'Current packet', x: 53, y: 62, tone: 'action',
        observation: 'The packet represents the agency-controlled source for complaint and external contact information.',
        why: 'Contact details and hours can change; an outdated number can obstruct a protected right.',
        safeAction: 'Provide the current approved packet and obtain a replacement or accessible version when needed.',
        notify: 'Tell the office or document owner if information is missing, inconsistent, or outdated.',
        document: 'Version or packet provided, format/language, explanation, and requested follow-up.',
        sourceRefs: ['42 CFR § 484.50(a), (c)(9)', 'CL-PR-001'],
      },
      {
        id: 'language-service', label: 'Qualified language service', shortLabel: 'Interpreter', x: 39, y: 84, tone: 'guide',
        observation: 'A remote qualified language professional supports communication without replacing the patient’s voice.',
        why: 'Complaint rights must be understandable to people with limited English proficiency, with language services at no cost.',
        safeAction: 'Use the approved qualified service, speak to the patient directly, pause for complete interpretation, and use teach-back.',
        notify: 'Escalate any inability to obtain timely language access rather than continuing a complex complaint discussion through guesses.',
        document: 'Language, service or interpreter identifier as allowed, information conveyed, and teach-back result.',
        sourceRefs: ['42 CFR § 484.50(f)(2)', 'OP-PA-003'],
      },
      {
        id: 'auxiliary-aid', label: 'Auxiliary aid and large print', shortLabel: 'Accessible format', x: 28, y: 85, tone: 'guide',
        observation: 'The large-format material and hearing support represent accessible communication options.',
        why: 'A standard print handout is not effective access for every person with a disability.',
        safeAction: 'Ask the preferred method and arrange the approved aid or accessible format at no cost.',
        notify: 'Contact the supervisor or access coordinator if the needed aid is not immediately available.',
        document: 'Accommodation requested, offered, used, and whether communication was effective.',
        sourceRefs: ['42 CFR § 484.50(f)(1)', 'OP-PA-003'],
      },
      {
        id: 'outside-call', label: 'Outside complaint choice', shortLabel: 'Outside option', x: 18, y: 82, tone: 'action',
        observation: 'The phone represents the patient’s option to contact the state hotline or another listed outside entity.',
        why: 'The patient may voice grievances to the agency or an outside entity without discrimination or reprisal.',
        safeAction: 'Provide current contact information and reasonable communication help; do not require internal resolution first.',
        document: 'Information and assistance provided if relevant; do not speculate about the outside outcome.',
        sourceRefs: ['42 CFR § 484.50(c)(9), (11)', 'Current controlled patient-rights packet'],
      },
      {
        id: 'privacy-door', label: 'Confidential follow-up', shortLabel: 'Need to know', x: 80, y: 30, tone: 'guide',
        observation: 'The closed door represents a private conversation and the patient’s safe-contact and confidentiality preferences.',
        why: 'Complaint review may require limited disclosure, but casual or broad sharing is not acceptable.',
        safeAction: 'Confirm safe contact preferences and explain that information is limited to authorized review, safety, and legal needs; do not guarantee anonymity.',
        notify: 'Tell the investigator about requested confidentiality and any unsafe contact method.',
        document: 'Safe contact method, confidentiality request, limits explained, and authorized handoff.',
        sourceRefs: ['CO-HP-001', 'Current controlled complaint/grievance workflow'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Listen',
    title: 'Receive Concerns with Dignity and De-escalate',
    subtitle: 'Calm the interaction without minimizing the message or surrendering professional boundaries',
    overview: [
      'A complaint conversation is often a test of whether the patient feels safe enough to speak. Your posture, pace, word choice, and attention can either widen or close that channel. Start with dignity: stop nonessential activity, face the speaker, protect privacy, and acknowledge the concern. Validation means recognizing the person’s experience; it does not mean admitting fault or agreeing with every conclusion.',
      'De-escalation is not a script for making the person quiet. It is a safety and communication method that lowers stimulation, identifies the core concern, and creates a next step. Speak calmly, use short sentences, offer realistic choices, and check understanding. If behavior creates immediate danger, prioritize distance, exit, and emergency support according to the safety plan.',
    ],
    details: [
      {
        heading: 'Use the L-A-S-T response',
        paragraphs: [
          'Listen without preparing a rebuttal. Acknowledge both the issue and the emotion: “I hear that two missed calls left you unsure what would happen.” Seek the essential facts with open, non-leading questions: “What happened next?” or “What would you like the agency to understand?” Then transition: explain the concrete routing step you can take now. This keeps the patient informed without promising a result you do not control.',
          'Avoid phrases such as “That is not my department,” “No one else has complained,” “You must have misunderstood,” or “I am sure there is a good reason.” These responses defend the organization before the facts are reviewed. Also avoid over-apologizing in a way that assigns fault. A safe phrase is: “I am sorry this experience has been frustrating. I will make sure the concern reaches the appropriate person for review.”',
        ],
        checklist: [
          'Listen: give uninterrupted space when it is safe to do so.',
          'Acknowledge: name the concern and emotion without deciding blame.',
          'Seek: ask only enough to understand the issue, impact, and requested outcome.',
          'Transition: state the next routing and safety step you can actually complete.',
        ],
      },
      {
        heading: 'Control the environment, not the person',
        paragraphs: [
          'Reduce noise, move away from bystanders when the patient agrees, sit at eye level when safe, and avoid blocking the exit. Ask one question at a time. A glass of water, a pause, or a chance to write may help. If a caregiver repeatedly interrupts, say, “I want to make sure I hear the patient first, then I will ask for your perspective.” Do not touch an upset person to calm them, crowd them, use threats, or make care contingent on changing their tone.',
          'Watch for communication barriers that can look like anger or confusion: hearing loss, pain, breathlessness, cognitive change, limited English proficiency, low health literacy, or fear. Offer approved auxiliary aids or qualified interpretation. A child or unqualified family interpreter should not be the default for a complex or sensitive grievance. The person may choose support, but the agency remains responsible for effective communication.',
        ],
      },
      {
        heading: 'When emotion becomes a safety issue',
        paragraphs: [
          'A raised voice alone does not erase complaint rights. Use the least restrictive response: calm tone, respectful limit setting, space, and a clear next step. If someone threatens harm, displays a weapon, blocks your exit, or creates another immediate danger, end nonessential discussion, move to safety, and follow the field-safety and emergency process. Call 911 for immediate danger. Notify the agency after you are safe; do not remain in a hazardous setting to complete complaint intake.',
          'Document observable behavior rather than labels. Write “paced between the table and doorway, shouted, and blocked the doorway for approximately one minute,” not “was crazy and violent.” Record your safety actions and words used. Do not retaliate later by withholding ordinary courtesy, delaying visits, or changing care outside an authorized plan.',
        ],
      },
      {
        heading: 'Mini-case: the rushed visit',
        paragraphs: [
          'A patient says, “Every worker rushes me, and now you are doing it too.” You feel the visit has been appropriate. A defensive answer turns the encounter into a debate. Instead, pause and say, “I want to understand what feels rushed today.” Ask for an example and the requested change, then explain what parts of care are scheduled and what can be adjusted through the supervisor. Continue safe ordered care only with the patient’s consent.',
        ],
      },
    ],
    keyActions: [
      { icon: '🤝', title: 'Acknowledge', detail: 'Recognize experience and emotion without assigning fault.' },
      { icon: '🗣️', title: 'Ask neutrally', detail: 'Use open questions; do not cross-examine or lead.' },
      { icon: '🌿', title: 'Lower stimulation', detail: 'Protect privacy, reduce noise, slow your pace, and offer access aids.' },
      { icon: '🚪', title: 'Keep safety first', detail: 'Set limits, leave danger, and use emergency support when needed.' },
    ],
    clinicalTip: '“I hear the concern, and I can take the next reporting step” is both compassionate and defensible. It validates without promising an outcome.',
    sourceChips: [
      { kind: 'Federal', text: '42 CFR § 484.50(c), (f)' },
      { kind: 'Care Indeed policy', text: 'CL-PR-001; OP-PA-003' },
      { kind: 'Practice', text: 'Trauma-informed de-escalation' },
    ],
    sceneImage: img02,
    sceneAlt: 'In a living room, a field worker sits at eye level and listens to an upset older patient while a caregiver sits nearby; water, tissues, a clock, and a closed binder are visible.',
    scenePrompt: 'Listen → acknowledge → seek → transition',
    hotspots: [
      {
        id: 'open-posture', label: 'Calm, open posture', shortLabel: 'Open posture', x: 36, y: 64, tone: 'guide',
        observation: 'The worker sits at eye level with uncrossed arms and enough personal space.',
        why: 'Nonverbal behavior can communicate respect and reduce perceived threat before any formal response begins.',
        safeAction: 'Pause nonessential tasks, face the speaker, keep a clear exit, and use a calm, even pace.',
        document: 'Only record communication behavior when relevant to the concern, safety, or accommodation provided.',
        sourceRefs: ['CL-PR-001', 'Recommended de-escalation practice'],
      },
      {
        id: 'patient-emotion', label: 'Emotion and underlying message', shortLabel: 'Hear emotion', x: 60, y: 47, tone: 'action',
        observation: 'The patient appears distressed and is using the conversation to describe an unmet expectation.',
        why: 'Emotion is information, not proof of unreliability. Dismissing tone can suppress a valid safety or quality signal.',
        safeAction: 'Name the concern and emotion in neutral words, then ask what happened and what resolution the patient hopes for.',
        notify: 'Escalate immediately if distress reflects acute clinical change, self-harm risk, abuse, or immediate danger.',
        document: 'Patient’s words, observable signs, relevant clinical assessment within scope, and actions taken.',
        sourceRefs: ['42 CFR § 484.50(c)(3)', 'Current controlled complaint/grievance workflow'],
      },
      {
        id: 'caregiver-turn', label: 'Caregiver participation', shortLabel: 'Take turns', x: 82, y: 49, tone: 'guide',
        observation: 'A caregiver is present and may have a different account or may interrupt the patient.',
        why: 'Both sources may matter, but the patient’s voice and privacy should not disappear in a group discussion.',
        safeAction: 'Confirm who the patient wants involved, hear one person at a time, and offer a private conversation when appropriate.',
        notify: 'Seek supervisor guidance when conflict, consent, or representative authority prevents effective communication.',
        document: 'Who participated, patient preference, materially different accounts, and any private follow-up arranged.',
        sourceRefs: ['42 CFR § 484.50(b), (e)', 'CL-PR-001'],
      },
      {
        id: 'comfort-tools', label: 'Pause and lower stimulation', shortLabel: 'Lower stress', x: 29, y: 86, tone: 'guide',
        observation: 'Water and tissues offer a pause without forcing the discussion to end.',
        why: 'Small environmental adjustments can restore the person’s ability to communicate and choose next steps.',
        safeAction: 'Offer a brief pause, quieter space, writing option, or communication aid; do not touch the person without consent.',
        document: 'Accommodation offered and whether it enabled communication when relevant.',
        sourceRefs: ['42 CFR § 484.50(f)', 'OP-PA-003'],
      },
      {
        id: 'safe-exit', label: 'Safe exit and firm limits', shortLabel: 'Safety limit', x: 67, y: 18, tone: 'urgent',
        observation: 'The doorway represents the need to maintain a safe route if behavior escalates.',
        why: 'Complaint rights remain, but no worker must stay in immediate danger to complete the conversation.',
        safeAction: 'State a respectful limit, end the encounter if danger continues, move to safety, and call 911 for immediate threats.',
        notify: 'Contact the supervisor or on-call leader as soon as safe and activate the field-safety/incident pathway.',
        document: 'Specific observed behavior, limit stated, exit and emergency actions, notifications, and impact on scheduled care.',
        sourceRefs: ['RM-SS field-safety policies', 'RM-ER-002', '42 CFR § 484.50(c)(11)'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Record',
    title: 'Document, Notify, and Route Without Delay',
    subtitle: 'Create a reliable handoff during the visit, after the visit, and after hours',
    overview: [
      'A respectful conversation is not complete until the concern reaches the people authorized to act. The receiving field worker documents key facts at the time of receipt and sends the matter through the current approved complaint route to the designated grievance lead. Use the approved form, secure system, and supervisor or on-call path; do not rely on memory, a personal text, or the next routine meeting.',
      'The routing priority depends on risk, not inconvenience. Immediate danger, acute clinical needs, abuse or neglect indicators, privacy incidents, and other urgent events require parallel escalation now. A routine service concern still needs prompt, same-workflow handoff. After hours, the on-call pathway exists so safety and time-sensitive issues do not wait for the office to reopen.',
    ],
    details: [
      {
        heading: 'Capture the minimum reliable record',
        paragraphs: [
          'At receipt, preserve the complainant’s name and contact information when offered, the patient involved, date and time, nature of the concern, and requested resolution. Add the location, people present, direct quotations when the wording matters, and any immediate effect on care or safety. Identify which facts you directly observed and which were reported by someone else. If the person declines contact information or requests confidentiality, record the request and still route the concern.',
          'Do not copy allegations into multiple systems “just in case.” Use the designated complaint workflow and follow clinical documentation policy for any entry needed to support current care. Secure records immediately. Never photograph complaint documents on a personal phone, leave a note in the vehicle, or send patient details through unapproved messaging.',
        ],
        checklist: [
          'Who reported, how they can be contacted if offered, and their relationship as stated.',
          'What happened, when, where, and who was present.',
          'What was directly observed versus reported by another person.',
          'What outcome was requested and what immediate actions were taken.',
          'Who was notified, at what time, by which approved method, and what direction was received.',
        ],
      },
      {
        heading: 'Use objective, attribution-based language',
        paragraphs: [
          'Write “Patient stated, ‘The aide left before the bath was finished’” rather than “Aide abandoned patient.” Write “sealed box was on the kitchen table; patient stated it arrived three days late” rather than “supplier repeatedly failed.” Attribution preserves the source of each fact. Avoid diagnoses of motive, character judgments, sarcasm, copied assumptions, or words such as always and never unless they are part of a direct quotation.',
          'Correct mistakes according to the approved documentation policy; do not erase, backdate, or quietly alter an entry. If new information arrives, add a clearly dated follow-up. Preserve original messages or written complaints in the approved record. Do not coach the complainant to change wording or destroy informal notes before the secure record is made.',
        ],
      },
      {
        heading: 'Match the route to urgency',
        paragraphs: [
          'For immediate threat to life or safety, call 911 first when appropriate, then notify the agency. For acute clinical change, follow the discipline-specific clinical escalation path and the on-call process. For suspected abuse, neglect, exploitation, mistreatment, injury of unknown source, or misappropriation, make immediate agency and required external reports under the mandatory-reporting policy. For privacy or compliance allegations, notify the designated privacy or compliance channel in addition to complaint intake.',
          'For a nonurgent service concern, complete the complaint handoff without avoidable delay using the supervisor or designated intake process. “Nonurgent” does not mean optional. If the primary supervisor does not respond and the matter is time-sensitive, move to the on-call or next-level escalation path. Record each attempt; do not simply leave a voicemail and assume ownership transferred.',
        ],
      },
      {
        heading: 'After-hours mini-case',
        paragraphs: [
          'At 7:30 p.m., a caregiver reports that the afternoon visit never occurred and medication teaching was expected. First assess the current clinical need within your role. If missing the visit creates an urgent risk, contact the on-call clinician immediately and call emergency services if necessary. Preserve the complaint details and contact the on-call supervisor through the approved route. Do not promise a replacement visit until an authorized scheduler or clinician confirms it.',
          'Your documentation should show the reported missed visit, the patient’s present condition and immediate needs you assessed within scope, advice or care provided under current orders, the on-call contact time, instructions received, and the caregiver’s requested follow-up. This record supports both continuity of care and complaint investigation.',
        ],
      },
    ],
    keyActions: [
      { icon: '⏱️', title: 'Record at receipt', detail: 'Preserve facts while fresh; do not wait for the next staff meeting.' },
      { icon: '🔒', title: 'Use secure channels', detail: 'No personal texts, photos, notebooks, or exposed records.' },
      { icon: '📞', title: 'Use on-call routing', detail: 'Time-sensitive concerns continue after office hours.' },
      { icon: '🔁', title: 'Close the handoff', detail: 'Document delivery, direction received, and any next action.' },
    ],
    clinicalTip: 'A voicemail is an attempt, not proof of a completed urgent handoff. Escalate according to policy until the time-sensitive concern reaches an accountable person.',
    sourceChips: [
      { kind: 'Care Indeed policy', text: 'Complaint/grievance workflow — current controlled version' },
      { kind: 'Care Indeed policy', text: 'Current documentation and after-hours workflows' },
      { kind: 'Federal', text: '42 CFR § 484.50(e)' },
    ],
    sceneImage: img03,
    sceneAlt: 'During an evening home visit, a field worker uses an approved phone near the entry while the patient remains visible; a wall clock, blank temporary note, closed folder, and zipped agency bag are separated in the scene.',
    scenePrompt: 'Facts → urgency → secure route → confirmed handoff',
    hotspots: [
      {
        id: 'secure-phone', label: 'Approved secure documentation', shortLabel: 'Secure record', x: 46, y: 51, tone: 'action',
        observation: 'The agency-approved phone or secure mobile workflow represents timely complaint and incident routing.',
        why: 'A secure, time-stamped record preserves the concern and limits unnecessary disclosure.',
        safeAction: 'Enter the report promptly in the approved system and lock the screen whenever it is unattended.',
        notify: 'Send or assign the entry to the policy-designated leader and confirm urgent receipt.',
        document: 'Required intake facts, source attribution, actions, notifications, and status of the handoff.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'CL-CD-001', 'CO-HP-001'],
      },
      {
        id: 'patient-check', label: 'Current patient safety check', shortLabel: 'Check now', x: 88, y: 50, tone: 'urgent',
        observation: 'The patient remains visible while the worker determines whether the reported service concern also created a current clinical or safety need.',
        why: 'After-hours status changes the routing method, not the need to protect the patient or hear the complaint.',
        safeAction: 'Assess within your role, address immediate danger first, and state the current need before giving the complaint handoff.',
        notify: 'Use the current on-call or next-level sequence until a time-sensitive concern reaches an accountable person.',
        document: 'Current status, care impact, call attempts, people reached, read-back, instructions, and disposition.',
        sourceRefs: ['Current approved after-hours route', '42 CFR § 484.50(e)'],
      },
      {
        id: 'clock', label: 'Time of receipt and action', shortLabel: 'Time stamp', x: 84, y: 15, tone: 'guide',
        observation: 'The clock highlights when the concern was received and when each action occurred.',
        why: 'A reliable chronology supports care continuity, policy monitoring, and a fair investigation.',
        safeAction: 'Record actual times; never estimate a convenient time or backdate the report.',
        document: 'Receipt time, safety check, notification attempts, acceptance of handoff, and later follow-up.',
        sourceRefs: ['Current controlled complaint/grievance workflow', 'CL-CD-001'],
      },
      {
        id: 'paper-transfer', label: 'Temporary notes transferred securely', shortLabel: 'Transfer notes', x: 47, y: 85, tone: 'guide',
        observation: 'A temporary blank note is being used only to support immediate, accurate transfer.',
        why: 'Loose notes can expose private information or become an incomplete shadow record.',
        safeAction: 'Transfer necessary facts into the approved system promptly, then handle the temporary note according to privacy and record policy.',
        notify: 'Report any lost or exposed note through the privacy incident channel.',
        document: 'The approved system remains the authoritative record; document any privacy incident separately.',
        sourceRefs: ['CO-HP-001', 'CL-CD-001'],
      },
      {
        id: 'agency-bag', label: 'No records left unsecured', shortLabel: 'Secure materials', x: 13, y: 83, tone: 'guide',
        observation: 'The closed agency bag represents physical control of work materials in the home and during travel.',
        why: 'Complaint information may contain sensitive clinical, personnel, and allegation details.',
        safeAction: 'Close and retain all materials; never leave complaint records in plain view, an unlocked vehicle, or with unrelated household members.',
        notify: 'Immediately report loss, theft, or unauthorized access under the privacy/security process.',
        document: 'Incident facts and mitigation steps if information is exposed; do not duplicate unrelated allegation detail.',
        sourceRefs: ['CO-HP-001', 'Care Indeed field confidentiality practice'],
      },
    ],
  },
];

// Keep rendering order stable even if content blocks are edited independently.
LESSONS.sort((a, b) => a.id - b.id);

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    lessonId: 0,
    objective: 'Recognize a complaint signal',
    stem: 'During a visit, a patient says, “No one called me about yesterday’s schedule change, but I do not want to make a big complaint.” What is the best field-worker response?',
    options: [
      'Treat it as casual conversation because the patient rejected the word complaint',
      'Listen, check for care impact, preserve the concern and desired follow-up, and route it through the approved process',
      'Ask the patient to submit the concern in writing before it can be reported',
      'Resolve the scheduling issue personally and omit documentation if the patient calms down',
    ],
    correct: 1,
    rationale: 'A complaint signal does not require special wording or a form. The field worker listens, checks safety and care impact, records facts, and routes the concern; the authorized workflow determines final classification. (Current controlled complaint/grievance workflow; 42 CFR § 484.50(c)(3), (e).)',
  },
  {
    id: 2,
    lessonId: 0,
    objective: 'Separate complaint and mandatory-reporting paths',
    stem: 'A caregiver reports that an agency worker struck the patient. The patient is currently in the room and appears frightened. What should happen first?',
    options: [
      'Complete only a routine grievance form and wait for the investigator to decide whether safety action is needed',
      'Confront the named worker by phone so both accounts can be recorded together',
      'Protect immediate safety, call emergency services if danger is present, and activate immediate agency and required external reporting while preserving the complaint',
      'Ask the caregiver to obtain photographs and witness statements before anyone is notified',
    ],
    correct: 2,
    rationale: 'Possible abuse triggers immediate safety and mandatory-reporting duties under 42 CFR § 484.50(e)(2), agency policy, and applicable state law. The grievance path runs in parallel; it never replaces urgent protection or required reports.',
  },
  {
    id: 3,
    lessonId: 1,
    objective: 'Use dignity-preserving de-escalation',
    stem: 'An upset patient says, “Every worker rushes me.” Which response best demonstrates acknowledgment without admitting fault or becoming defensive?',
    options: [
      '“That cannot be right; everyone here has the same visit length.”',
      '“Please lower your voice before we discuss this.”',
      '“I am sure the office has a reasonable explanation.”',
      '“I hear that you have felt rushed. What happened today, and what would you like the agency to understand?”',
    ],
    correct: 3,
    rationale: 'The response acknowledges the experience, invites neutral facts, and asks about the desired outcome. It does not decide blame, minimize the concern, or make calmness a condition of being heard. (42 CFR § 484.50(c)(3), (f).)',
  },
  {
    id: 4,
    lessonId: 2,
    objective: 'Route an after-hours concern by risk',
    stem: 'At 7:30 p.m., a caregiver reports that an expected visit did not occur and the patient may have an urgent medication-teaching need. The usual supervisor does not answer. What is the best next step?',
    options: [
      'Assess the current need within role, use the on-call/next-level pathway, call emergency services if immediate danger exists, and document each handoff attempt',
      'Leave one voicemail and wait until the office opens because complaints are administrative',
      'Promise a replacement visit tonight so the caregiver feels reassured',
      'Tell the caregiver to decide whether the clinical need can wait',
    ],
    correct: 0,
    rationale: 'A service concern may also create a clinical continuity risk. Use the current after-hours clinical and complaint routes in parallel, escalate until a time-sensitive handoff is accepted, and avoid promising an action that only an authorized scheduler or clinician can confirm. (Current controlled after-hours workflow; 42 CFR § 484.50(e).)',
  },
  {
    id: 5,
    lessonId: 2,
    objective: 'Document objectively',
    stem: 'Which entry is the most objective and defensible?',
    options: [
      '“The supplier was negligent and again failed this difficult family.”',
      '“Patient stated, ‘The tubing did not arrive.’ One sealed delivery box observed on kitchen table; contents not opened. On-call RN notified at 19:42.”',
      '“There was probably a delivery problem, but the patient tends to exaggerate.”',
      '“Late supplies caused harm,” even though no assessment or injury information is recorded',
    ],
    correct: 1,
    rationale: 'The best entry attributes the report, records a direct observation without changing the item, and time-stamps notification. It avoids motive, credibility judgments, and unsupported causation. (CL-CD-001; current controlled complaint/grievance workflow.)',
  },
  {
    id: 6,
    lessonId: 3,
    objective: 'Maintain field-worker investigation boundaries',
    stem: 'A family member says a sealed supply box contains the wrong item and asks you to open it, photograph every label on your personal phone, and prove the vendor’s error. What should you do?',
    options: [
      'Agree because evidence gathering is part of every field worker’s complaint role',
      'Refuse to discuss the concern at all because only management may hear complaints',
      'Open the box but do not take photographs',
      'Check immediate care needs, note the box’s visible condition, preserve it, route the concern, and obtain authorized direction for secure evidence handling',
    ],
    correct: 3,
    rationale: 'The field worker receives and preserves facts but does not investigate, alter possible evidence, or use a personal device. Immediate supply-related care needs still require clinical escalation. (CL-CD-001; current controlled complaint/grievance workflow.)',
  },
  {
    id: 7,
    lessonId: 4,
    objective: 'Protect external complaint and access rights',
    stem: 'A patient with low vision asks for help contacting an outside complaint entity. Which response is best?',
    options: [
      'Require the patient to finish the internal grievance process before providing outside contact information',
      'Provide the current approved rights packet in an accessible format, offer reasonable communication help, and do not discourage outside contact',
      'Recite a hotline number from memory and ask the patient to write it down',
      'Tell the representative to search the internet because staff cannot assist with outside complaints',
    ],
    correct: 1,
    rationale: 'The patient must be advised of external complaint options and receive information in an accessible manner. Use the controlled current packet rather than an old number from memory, and do not turn internal review into a gate. (42 CFR § 484.50(c)(9), (11), (12), (f).)',
  },
  {
    id: 8,
    lessonId: 4,
    objective: 'Explain confidentiality honestly',
    stem: 'A patient asks, “Can you promise no one will ever know I complained?” What is the best answer?',
    options: [
      '“Yes. Complaint information is always completely anonymous.”',
      '“No. Everyone on the care team will receive the full report.”',
      '“The agency limits information to authorized care, safety, review, and legal needs, but I cannot guarantee anonymity. I will record your confidentiality and safe-contact preferences.”',
      '“Only written complaints can be confidential.”',
    ],
    correct: 2,
    rationale: 'Need-to-know confidentiality is required, but a fair investigation or legal report may require limited disclosure. Promise careful handling and your own actions—not total anonymity. (CO-HP-001; 42 CFR § 484.50(e)(1)(iii).)',
  },
  {
    id: 9,
    lessonId: 5,
    objective: 'Use current ownership and response expectations',
    stem: 'A patient asks exactly who will investigate and on what date the agency will issue a final response. The field worker is not certain which controlled workflow version is current. What is the best answer?',
    options: [
      'Name the person and deadline remembered from last year’s training',
      'Promise a same-day outcome so the patient feels heard',
      'Explain the immediate handoff you will complete, route through the current approved workflow, and obtain an authorized answer rather than guessing',
      'Tell the patient that response ownership and timing are confidential',
    ],
    correct: 2,
    rationale: 'Field workers act immediately on receipt and use the current approved route. Management ownership and response expectations come from the controlled workflow; do not invent, promise, or repeat a possibly outdated name or date. (Current controlled complaint/grievance workflow.)',
  },
  {
    id: 10,
    lessonId: 6,
    objective: 'Connect individual concerns to improvement',
    stem: 'Why must apparently minor complaints be documented consistently even when the immediate issue is resolved?',
    options: [
      'So the agency can count complaints without reviewing them',
      'So field workers can compare which patient complains most often',
      'Because every complaint must automatically result in staff discipline',
      'Because aggregate trends can reveal recurring service, access, communication, staffing, or safety problems that QAPI can address',
    ],
    correct: 3,
    rationale: 'Consistent intake lets the agency detect patterns, connect complaint information to QAPI, assign corrective action, and measure whether systems improve without blaming reporters. (CMS State Operations Manual, Appendix B, G486/G488; 42 CFR § 484.65.)',
  },
];

const CI = {
  teal: '#0F5B54',
  tealDark: '#0A3D39',
  tealSoft: '#EEF4F3',
  tealMuted: '#C8DFDC',
  orange: '#9A3412',
  orangeDark: '#7C2D12',
  orangeSoft: '#FFF3EC',
  ink: '#2D3748',
  muted: '#526176',
  border: '#E2E8F0',
  red: '#D92D20',
  redSoft: '#FEF2F2',
  white: '#FFFFFF',
  bg: '#F8FAFC',
} as const;

const TONE: Record<HotspotTone, { label: string; color: string; soft: string }> = {
  guide: { label: 'Guidance', color: CI.teal, soft: CI.tealSoft },
  action: { label: 'Action', color: CI.orange, soft: CI.orangeSoft },
  urgent: { label: 'Urgent safety', color: CI.red, soft: CI.redSoft },
};

const STORAGE_KEY = 'achc-art-m03-progress-v1';
const STATE_VERSION = 1;

type Mode = 'lessons' | 'quiz';

interface PersistedState {
  version: number;
  pageIndex: number;
  mode: Mode;
  visitedLessons: number[];
  completedByLesson: Record<number, string[]>;
  quizAnswers: (number | null)[];
  quizIndex: number;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizFinished: boolean;
  attemptHistory: QuizAttemptRecord[];
}

const freshState = (): PersistedState => ({
  version: STATE_VERSION,
  pageIndex: 0,
  mode: 'lessons',
  visitedLessons: [0],
  completedByLesson: {},
  quizAnswers: Array(QUIZ.length).fill(null),
  quizIndex: 0,
  quizSelected: null,
  quizSubmitted: false,
  quizFinished: false,
  attemptHistory: [],
});

function loadState(): PersistedState {
  const fallback = freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== STATE_VERSION) return fallback;
    return {
      ...fallback,
      ...parsed,
      pageIndex: Math.min(Math.max(Number(parsed.pageIndex) || 0, 0), LESSONS.length - 1),
      mode: parsed.mode === 'quiz' ? 'quiz' : 'lessons',
      visitedLessons: Array.isArray(parsed.visitedLessons) ? parsed.visitedLessons.filter((n) => Number.isInteger(n) && n >= 0 && n < LESSONS.length) : [0],
      completedByLesson: parsed.completedByLesson && typeof parsed.completedByLesson === 'object' ? parsed.completedByLesson : {},
      quizAnswers: Array.isArray(parsed.quizAnswers) && parsed.quizAnswers.length === QUIZ.length ? parsed.quizAnswers : fallback.quizAnswers,
      quizIndex: Math.min(Math.max(Number(parsed.quizIndex) || 0, 0), QUIZ.length - 1),
      attemptHistory: Array.isArray(parsed.attemptHistory) ? parsed.attemptHistory.slice(0, MODULE_META.maxAttempts) : [],
    };
  } catch {
    return fallback;
  }
}

function saveState(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Learning remains usable when storage is unavailable (private mode/quota).
  }
}

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

const STYLES = `
.m03,.m03 *{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
.m03 button:focus-visible,.m03 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
@keyframes m03-pop{0%{transform:scale(.97);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes m03-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes m03-slide{0%{transform:translateX(22px);opacity:0}100%{transform:translateX(0);opacity:1}}
.m03-shell{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748}
.m03-top{height:64px;flex:0 0 64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px}
.m03-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;flex-shrink:0}
.m03-tabs{display:flex;align-items:center;justify-content:center;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.m03-tabs::-webkit-scrollbar{display:none}
.m03-tab{border:0;border-radius:999px;padding:8px 13px;font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.m03-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.m03-tab.quiz{border:1px solid #9A3412;color:#7C2D12}
.m03-tab.quiz.active{background:#9A3412;color:#fff;border-color:#9A3412}
.m03-exit{flex-shrink:0;min-height:44px;border-radius:10px;border:1px solid #9A3412;background:#fff;color:#7C2D12;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.m03-work{flex:1;min-height:0;display:flex;padding:16px}
.m03-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px;scrollbar-gutter:stable}
.m03-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.m03-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.m03-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.m03-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.m03-scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.m03-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.m03-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.2);color:#fff;font-weight:800}
.m03-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:m03-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.m03-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 8px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.1);white-space:nowrap;letter-spacing:.01em;max-width:142px;line-height:1.2}
.m03-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.5)}
.m03-modal-bg{position:absolute;inset:0;z-index:30;background:rgba(15,61,57,.62);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:m03-pop .25s cubic-bezier(.16,1,.3,1)}
.m03-modal{width:min(480px,100%);max-height:min(90%,650px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.25)}
.m03-bot{height:80px;flex:0 0 80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;gap:12px}
.m03-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.m03-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.m03-bot button.next{background:#9A3412;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.m03-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center;align-items:flex-start}
.m03-quiz-card{width:min(780px,100%);animation:m03-slide .35s cubic-bezier(.16,1,.3,1)}
.m03-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.m03-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (max-width:1000px){
  .m03-tab{padding:8px 10px;font-size:12px}
  .m03-brand{max-width:150px}
}
@media (max-width:900px){
  .m03-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .m03-left,.m03-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .m03-left{flex:0 0 auto}
  .m03-left{min-width:0;max-height:46vh}
  .m03-right{min-height:380px}
  .m03-top{padding:0 10px;gap:8px}
  .m03-tabs{justify-content:flex-start}
  .m03-bot{padding:0 12px;height:72px;flex-basis:72px}
  .m03-hotspot .tag{max-width:112px}
}
@media (max-width:520px){
  .m03-brand .brand-text{display:none}
  .m03-exit{padding:8px 10px;font-size:11px}
  .m03-bot{gap:5px;padding:0 6px}
  .m03-bot .status{font-size:10px!important;padding:7px!important}
  .m03-bot button.next{padding:10px 12px}
  .m03-right{min-height:330px;padding:6px}
  .m03-hotspot .tag{max-width:92px;white-space:normal;text-align:center;padding:3px 5px}
}
@media (prefers-reduced-motion:reduce){
  .m03-hotspot .ping,.m03-modal-bg,.m03-quiz-card{animation:none!important}
  .m03-transition{transition:none!important}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function HotspotDialog({ hotspot, close, complete, triggerRef }: {
  hotspot: Hotspot;
  close: () => void;
  complete: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const tone = TONE[hotspot.tone];

  const restoreAndClose = useCallback(() => {
    close();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [close, triggerRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    const onDocumentKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreAndClose();
      }
    };
    document.addEventListener('keydown', onDocumentKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onDocumentKey);
    };
  }, [hotspot.id, restoreAndClose]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const trapFocus = (event: KeyboardEvent) => {
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
    root.addEventListener('keydown', trapFocus);
    return () => root.removeEventListener('keydown', trapFocus);
  }, []);

  return (
    <div className="m03-modal-bg" onMouseDown={(event) => event.target === event.currentTarget && restoreAndClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="m03-modal">
        <div style={{ position: 'sticky', top: 0, zIndex: 1, padding: 16, borderBottom: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.98)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: tone.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.tone === 'urgent' ? <AlertTriangle size={19} /> : hotspot.tone === 'action' ? <CheckCircle2 size={19} /> : <ShieldCheck size={19} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: tone.color }}>{tone.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close feedback" onClick={restoreAndClose} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={18} color={CI.muted} />
          </button>
        </div>
        <p id={descriptionId} className="m03-sr">Focused field response feedback for this observed scene detail.</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observation} icon={<Eye size={14} />} />
          <FeedbackBlock label="Why it matters" body={hotspot.why} />
          <FeedbackBlock label="Safe action" body={hotspot.safeAction} accent />
          {hotspot.notify && <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <div aria-label="Sources" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.sourceRefs.map((source) => (
              <span key={source} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.03em', padding: '5px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{source}</span>
            ))}
          </div>
          <button type="button" onClick={() => { complete(); restoreAndClose(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Mark observed
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonPanel({ lesson, index }: { lesson: (typeof LESSONS)[number]; index: number }) {
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>
        Lesson {index + 1} · {index + 1} of {LESSONS.length}
      </div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{lesson.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 650 }}>{lesson.subtitle}</p>
      {lesson.overview.map((paragraph) => (
        <p key={paragraph} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>
      ))}
      <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
        <summary style={{ padding: '12px 14px', fontWeight: 750, fontSize: 13, color: CI.teal, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>
          View Full Lesson Details
        </summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {lesson.details.map((section) => (
            <section key={section.heading} style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.4, color: CI.teal }}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>
              ))}
              {section.checklist && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 22, color: '#524C4B' }}>
                  {section.checklist.map((item) => <li key={item} style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 5 }}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </details>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {lesson.keyActions.map((action) => (
          <div key={action.title} style={{ minWidth: 0, background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden="true">{action.icon}</span>
            <div>
              <div style={{ fontWeight: 750, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{action.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{action.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orange}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{lesson.clinicalTip}</div>
      </div>
      <div aria-label="Lesson sources" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {lesson.sourceChips.map((source) => (
          <span key={`${source.kind}-${source.text}`} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 750, letterSpacing: '.02em' }}>
            {source.kind}: {source.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScenePanel({ lesson, completed, setCompleted, goQuiz }: {
  lesson: (typeof LESSONS)[number];
  completed: string[];
  setCompleted: (ids: string[]) => void;
  goQuiz: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = lesson.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const nextIncomplete = lesson.hotspots.find((hotspot) => !completed.includes(hotspot.id));
  const allObserved = completed.length === lesson.hotspots.length;

  useEffect(() => setActiveId(null), [lesson.id]);

  return (
    <div className="m03-stage-wrap">
      <div className="m03-stage" role="region" aria-label={`${lesson.title} interactive scene`}>
        <img className="m03-scene" src={lesson.sceneImage} alt={lesson.sceneAlt} draggable={false} />
        <div id={`scene-prompt-${lesson.id}`} role="note" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(48%,310px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.95)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeDark }}>{lesson.shortName}</div>
          <div style={{ fontSize: 12, lineHeight: 1.35, fontWeight: 800, color: CI.teal }}>{lesson.scenePrompt}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.95)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {lesson.hotspots.length} observed
        </div>
        {lesson.hotspots.map((hotspot) => {
          const isDone = completed.includes(hotspot.id);
          const isGuided = !isDone && nextIncomplete?.id === hotspot.id;
          const tone = TONE[hotspot.tone];
          return (
            <button
              key={hotspot.id}
              type="button"
              className="m03-hotspot"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={isDone ? `${hotspot.label}, observed` : `Explore ${hotspot.label}`}
              aria-describedby={`scene-prompt-${lesson.id} progress-${lesson.id}`}
              onClick={(event) => { triggerRef.current = event.currentTarget; setActiveId(hotspot.id); }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : tone.color }}>
                {isGuided && <span className="ping" aria-hidden="true" />}
                {isDone ? <Check size={17} strokeWidth={3} aria-hidden="true" /> : <span aria-hidden="true">?</span>}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
              {isDone && <span className="m03-sr">Completed</span>}
            </button>
          );
        })}
        <div id={`progress-${lesson.id}`} className="m03-live" aria-live="polite">{completed.length} of {lesson.hotspots.length} observations completed.</div>
        {allObserved && (
          <div role="status" style={{ position: 'absolute', left: 14, right: 14, bottom: 14, zIndex: 20, background: 'rgba(255,255,255,.97)', border: `2px solid ${CI.tealMuted}`, borderRadius: 14, padding: 14, textAlign: 'center', boxShadow: '0 10px 26px rgba(15,91,84,.18)' }}>
            <CheckCircle2 size={22} color={CI.teal} style={{ margin: '0 auto 5px' }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: CI.teal, textTransform: 'uppercase', letterSpacing: '.08em' }}>Scene observations complete</div>
            <div style={{ fontSize: 12, color: CI.muted, marginTop: 3 }}>Continue to the next lesson. Completion does not authorize investigation or expand role scope.</div>
            {lesson.id === LESSONS.length - 1 && (
              <button type="button" onClick={goQuiz} style={{ minHeight: 44, marginTop: 10, width: '100%', border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Go to Knowledge Check</button>
            )}
          </div>
        )}
        {active && (
          <HotspotDialog
            hotspot={active}
            close={() => setActiveId(null)}
            complete={() => !completed.includes(active.id) && setCompleted([...completed, active.id])}
            triggerRef={triggerRef}
          />
        )}
      </div>
    </div>
  );
}

interface QuizPageProps {
  answers: (number | null)[];
  index: number;
  selected: number | null;
  submitted: boolean;
  finished: boolean;
  attempts: QuizAttemptRecord[];
  setQuiz: (patch: Partial<Pick<PersistedState, 'quizAnswers' | 'quizIndex' | 'quizSelected' | 'quizSubmitted' | 'quizFinished' | 'attemptHistory'>>) => void;
  reviewLesson: (lessonId: number) => void;
}

function QuizPage({ answers, index, selected, submitted, finished, attempts, setQuiz, reviewLesson }: QuizPageProps) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const question = QUIZ[index];
  const score = useMemo(() => answers.reduce<number>((total, answer, questionIndex) => total + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0), [answers]);
  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = percent >= MODULE_META.passingPercent;
  const attemptsUsed = attempts.length;
  const attemptsRemaining = MODULE_META.maxAttempts - attemptsUsed;
  const locked = finished && !passed && attemptsUsed >= MODULE_META.maxAttempts;
  const missed = QUIZ.filter((item, questionIndex) => answers[questionIndex] !== item.correct);
  const isCorrect = selected === question.correct;
  const letters = ['A', 'B', 'C', 'D'];

  const selectAndFocus = (option: number) => {
    setQuiz({ quizSelected: option });
    window.requestAnimationFrame(() => optionRefs.current[option]?.focus());
  };

  const nextAction = () => {
    if (selected === null) return;
    if (!submitted) {
      const nextAnswers = [...answers];
      nextAnswers[index] = selected;
      setQuiz({ quizAnswers: nextAnswers, quizSubmitted: true });
      return;
    }
    if (index < QUIZ.length - 1) {
      const nextIndex = index + 1;
      setQuiz({ quizIndex: nextIndex, quizSelected: answers[nextIndex], quizSubmitted: answers[nextIndex] !== null });
      return;
    }
    if (!finished) {
      const currentScore = answers.reduce<number>((total, answer, questionIndex) => total + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0);
      const record: QuizAttemptRecord = {
        attempt: attempts.length + 1,
        score: Math.round((currentScore / QUIZ.length) * 100),
        completedAt: new Date().toISOString(),
      };
      setQuiz({ quizFinished: true, attemptHistory: [...attempts, record] });
    }
  };

  const startRetake = () => {
    if (attemptsRemaining <= 0 || passed) return;
    setQuiz({
      quizAnswers: Array(QUIZ.length).fill(null),
      quizIndex: 0,
      quizSelected: null,
      quizSubmitted: false,
      quizFinished: false,
    });
  };

  if (finished) {
    return (
      <main className="m03-quiz-page">
        <div className="m03-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 30 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal }}>Knowledge Check Result</div>
            <div role="status" aria-live="polite" style={{ width: 142, height: 142, borderRadius: '50%', margin: '14px auto', display: 'grid', placeItems: 'center', background: passed ? CI.tealSoft : CI.orangeSoft, border: `10px solid ${passed ? CI.teal : CI.orange}` }}>
              <div><div style={{ fontSize: 30, fontWeight: 850, color: passed ? CI.teal : CI.orangeDark }}>{percent}%</div><div style={{ fontSize: 12, fontWeight: 750, color: CI.muted }}>{score}/{QUIZ.length}</div></div>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 24, color: CI.ink }}>{passed ? 'Passed' : locked ? 'Maximum attempts reached' : 'Remediation required'}</h1>
            <p style={{ maxWidth: 590, margin: '0 auto 18px', fontSize: 15, lineHeight: 1.6, color: CI.muted }}>
              {passed
                ? 'You met the 80% knowledge threshold. This completion documents knowledge only; practical competency, role authorization, and current policy requirements remain separate.'
                : locked
                  ? 'You did not meet the 80% threshold within three attempts. Review the topics below and contact the assigned supervisor or training administrator for the next remediation step.'
                  : `Review the missed objectives below before trying again. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remain.`}
            </p>
          </div>

          {!passed && (
            <section aria-labelledby="remediation-title" style={{ background: CI.bg, border: `1px solid ${CI.border}`, borderRadius: 16, padding: 16, marginTop: 16 }}>
              <h2 id="remediation-title" style={{ margin: '0 0 10px', fontSize: 18, color: CI.teal }}>Targeted remediation</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {missed.map((item) => (
                  <div key={item.id} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, textTransform: 'uppercase', letterSpacing: '.06em' }}>Lesson {item.lessonId + 1} · {item.objective}</div>
                    <p style={{ margin: '6px 0', fontSize: 14, lineHeight: 1.55, color: CI.ink }}>{item.rationale}</p>
                    <button type="button" onClick={() => reviewLesson(item.lessonId)} style={{ minHeight: 44, border: `1px solid ${CI.tealMuted}`, borderRadius: 10, background: CI.tealSoft, color: CI.teal, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}>Review Lesson {item.lessonId + 1}</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
            <button type="button" onClick={() => reviewLesson(0)} style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Back to Lessons</button>
            {!passed && !locked && (
              <button type="button" onClick={startRetake} style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={16} /> Start Attempt {attemptsUsed + 1}
              </button>
            )}
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: CI.muted, textAlign: 'center' }}>
            Attempts recorded: {attempts.map((attempt) => `#${attempt.attempt} ${attempt.score}%`).join(' · ')}
          </div>
        </div>
      </main>
    );
  }

  const progress = ((index + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  return (
    <main className="m03-quiz-page">
      <div className="m03-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg,${CI.teal},${CI.tealDark})`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} /><span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Final Knowledge Check</span></div>
            <span style={{ fontSize: 12, fontWeight: 750 }}>Attempt {attemptsUsed + 1} of {MODULE_META.maxAttempts} · {index + 1}/{QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="m03-transition" style={{ height: '100%', width: `${Math.max(progress, 5)}%`, borderRadius: 999, background: `linear-gradient(90deg,${CI.orange},#FFB088)`, transition: 'width .3s ease' }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 750, letterSpacing: '.06em', opacity: .92 }}>Observe → Classify → Decide → Defend</div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}><Sparkles size={13} /> Scenario {index + 1}</div>
          <h1 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{question.stem}</h1>
          <div
            role="radiogroup"
            aria-label="Answer choices"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(event) => {
              if (submitted) return;
              const current = selected ?? 0;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); selectAndFocus(Math.min(question.options.length - 1, current + 1)); }
              if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); selectAndFocus(Math.max(0, current - 1)); }
              if (event.key === 'Home') { event.preventDefault(); selectAndFocus(0); }
              if (event.key === 'End') { event.preventDefault(); selectAndFocus(question.options.length - 1); }
            }}
          >
            {question.options.map((option, optionIndex) => {
              const active = selected === optionIndex;
              const correctOption = submitted && optionIndex === question.correct;
              const incorrectSelection = submitted && active && !isCorrect;
              const border = correctOption ? CI.teal : incorrectSelection ? CI.red : active ? CI.teal : CI.border;
              const background = correctOption ? CI.tealSoft : incorrectSelection ? CI.redSoft : active ? '#F3FBFA' : '#fff';
              const badge = correctOption ? CI.teal : incorrectSelection ? CI.red : active ? CI.teal : CI.bg;
              return (
                <button
                  key={option}
                  ref={(element) => { optionRefs.current[optionIndex] = element; }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active || (selected === null && optionIndex === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setQuiz({ quizSelected: optionIndex })}
                  style={{ minHeight: 52, padding: 14, borderRadius: 14, border: `2px solid ${border}`, background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: badge, color: active || correctOption || incorrectSelection ? '#fff' : CI.muted, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[optionIndex]}</span>
                  <span style={{ fontWeight: 650, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 2 }}>{option}</span>
                  {correctOption && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {incorrectSelection && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div role="status" style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : CI.orangeSoft, border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>{isCorrect ? 'Correct judgment' : 'Review the rule'}</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{question.rationale}</div>
            </div>
          )}
          <button type="button" onClick={nextAction} disabled={selected === null} style={{ width: '100%', minHeight: 48, marginTop: 18, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.09em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? .5 : 1 }}>
            {submitted ? (index === QUIZ.length - 1 ? 'Finish attempt' : 'Next scenario') : 'Submit answer'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ACHCARTM03() {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const stateRef = useRef(state);
  const lesson = LESSONS[state.pageIndex];
  const completed = state.completedByLesson[lesson.id] ?? [];

  const patchState = useCallback((patch: Partial<PersistedState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    stateRef.current = state;
    saveState(state);
  }, [state]);

  const openLesson = (index: number) => {
    const bounded = Math.min(Math.max(index, 0), LESSONS.length - 1);
    setState((current) => ({
      ...current,
      mode: 'lessons',
      pageIndex: bounded,
      visitedLessons: current.visitedLessons.includes(bounded) ? current.visitedLessons : [...current.visitedLessons, bounded],
    }));
  };

  const handleSaveExit = () => {
    saveState(stateRef.current);
    window.history.back();
  };

  const setQuiz = (patch: Partial<Pick<PersistedState, 'quizAnswers' | 'quizIndex' | 'quizSelected' | 'quizSubmitted' | 'quizFinished' | 'attemptHistory'>>) => {
    patchState(patch);
  };

  return (
    <div className="m03 m03-shell">
      <style>{STYLES}</style>
      <header className="m03-top">
        <div className="m03-brand"><BrandMark /><span className="brand-text">Complaints &amp; Grievances</span></div>
        <div className="m03-tabs" role="tablist" aria-label="Module lessons">
          {LESSONS.map((item, index) => (
            <button key={item.id} type="button" role="tab" aria-selected={state.mode === 'lessons' && state.pageIndex === index} className={`m03-tab ${state.mode === 'lessons' && state.pageIndex === index ? 'active' : ''}`} onClick={() => openLesson(index)}>
              {item.shortName}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={state.mode === 'quiz'} className={`m03-tab quiz ${state.mode === 'quiz' ? 'active' : ''}`} onClick={() => patchState({ mode: 'quiz' })}>Knowledge Check</button>
        </div>
        <button type="button" className="m03-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {state.mode === 'quiz' ? (
        <QuizPage
          answers={state.quizAnswers}
          index={state.quizIndex}
          selected={state.quizSelected}
          submitted={state.quizSubmitted}
          finished={state.quizFinished}
          attempts={state.attemptHistory}
          setQuiz={setQuiz}
          reviewLesson={openLesson}
        />
      ) : (
        <main className="m03-work">
          <aside className="m03-left" aria-label="Lesson instruction"><LessonPanel lesson={lesson} index={state.pageIndex} /></aside>
          <section className="m03-right" aria-label="Interactive practice">
            <ScenePanel
              lesson={lesson}
              completed={completed}
              setCompleted={(ids) => setState((current) => ({ ...current, completedByLesson: { ...current.completedByLesson, [lesson.id]: ids } }))}
              goQuiz={() => patchState({ mode: 'quiz' })}
            />
          </section>
        </main>
      )}

      <footer className="m03-bot">
        <button type="button" className="nav" disabled={state.mode === 'lessons' && state.pageIndex === 0} onClick={() => state.mode === 'quiz' ? openLesson(state.pageIndex) : openLesson(state.pageIndex - 1)}>
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="status" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          {state.mode === 'quiz' ? `Knowledge Check · 10 items · 80% pass · ${MODULE_META.maxAttempts} attempts` : `Lesson ${state.pageIndex + 1} of ${LESSONS.length} · ${lesson.shortName}`}
        </div>
        {state.mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => openLesson(state.pageIndex)}>Lessons <ChevronRight size={16} /></button>
        ) : state.pageIndex === LESSONS.length - 1 ? (
          <button type="button" className="next" onClick={() => patchState({ mode: 'quiz' })}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => openLesson(state.pageIndex + 1)}>Next · {LESSONS[state.pageIndex + 1].shortName} <ChevronRight size={16} /></button>
        )}
      </footer>
    </div>
  );
}
