import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Eye, FileText, HeartHandshake, HelpCircle, Home, Info, LockKeyhole,
  MessageCircle, Phone, RefreshCcw, RotateCcw, Scale, ShieldAlert, ShieldCheck,
  Users, X,
} from 'lucide-react';

import img01 from './assets/lesson-01-ethical-principles.png';
import img02 from './assets/lesson-02-consent-and-choice.png';
import img03 from './assets/lesson-03-competing-duties.png';
import img04 from './assets/lesson-04-end-of-life-escalation.png';
import img05 from './assets/lesson-05-professional-boundaries.png';
import img06 from './assets/lesson-06-ethics-consultation.png';
import img07 from './assets/lesson-07-complex-simulation.png';

type Tone = 'respect' | 'protect' | 'consult' | 'stop';
type IconKey = 'heart' | 'shield' | 'scale' | 'talk' | 'people' | 'file' | 'phone' | 'lock' | 'eye';

type ActionCard = { icon: IconKey; title: string; detail: string };
type DetailSection = { heading: string; paragraphs: string[]; bullets?: string[] };
type Hotspot = {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  tone: Tone;
  observed: string;
  why: string;
  action: string;
  notify: string;
  document: string;
  sourceRefs: string[];
};
type PageData = {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: DetailSection[];
  actions: ActionCard[];
  tip: string;
  sourceLabels: string[];
  sceneImage: string;
  sceneAlt: string;
  process: string[];
  hotspots: Hotspot[];
};
type QuizKind = 'direct' | 'scenario' | 'documentation' | 'escalation' | 'integrative';
type QuizQuestion = {
  id: string;
  kind: QuizKind;
  stem: string;
  options: [string, string, string, string];
  correct: number;
  rationale: string;
  sourceRefs: string[];
};

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC', orange: '#F26D33',
  orangeDark: '#E05922', orangeSoft: '#FFF3ED', red: '#C53030', redSoft: '#FFF1F2',
  ink: '#2D3748', muted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC', white: '#FFFFFF',
};

const MODULE_META = {
  id: 'ACHC-ART-M10',
  title: 'Ethics, Professional Boundaries & Escalation',
  pages: 7,
  quizCount: 10,
  passing: 80,
};

const PAGES: PageData[] = [
  {
    id: 1,
    shortName: 'Principles',
    title: 'Ethical Principles at the Doorway',
    subtitle: 'Use principles to recognize tension—then use policy, role, and escalation to act safely.',
    overview: [
      `Home-health ethics begins before a task begins. You enter another person's home, work close to private family life, and may see choices that differ from your own. Ethical practice protects the patient's voice while keeping care safe, truthful, fair, and within your assigned role.`,
      `Six familiar principles—autonomy, beneficence, nonmaleficence, justice, fidelity, and veracity—help you name what is at stake. They do not give a field worker authority to override a patient, change an order, exceed scope, or settle a legal dispute.`,
      `When principles pull in different directions, slow the moment down: observe facts, protect immediate safety, respect choice, consult the correct person, and document the closed loop.`,
    ],
    details: [
      {
        heading: 'Six principles in field language',
        paragraphs: [
          `Autonomy means supporting an informed, voluntary choice. The patient may accept, decline, ask questions, change a preference, or request another discussion. A choice that worries you is not automatically proof that the patient lacks capacity. Your role is to notice, communicate, and escalate concerns—not to erase the patient's voice.`,
          `Beneficence means promoting the patient's welfare through authorized care. Nonmaleficence means avoiding preventable harm, including harm caused by coercion, unsafe improvisation, or delay. These principles work together: wanting a good outcome never justifies forcing care, hiding risk, or performing an unapproved task.`,
          `Justice means fair, nondiscriminatory treatment and access. Fidelity means keeping professional commitments, following through, and promptly arranging help when you cannot safely complete a commitment. Veracity means truthfulness in conversation and documentation—including admitting uncertainty instead of pretending to know.`,
        ],
        bullets: [
          `Ask: What choice has the patient expressed, and was it heard without pressure?`,
          `Ask: What benefit and harm are reasonably foreseeable within this visit?`,
          `Ask: Am I treating this person as fairly as I would another patient?`,
          `Ask: What did I promise, what can I actually deliver, and what needs escalation?`,
          `Ask: Is every statement and chart entry factual, complete, and honest?`,
        ],
      },
      {
        heading: 'When good principles conflict',
        paragraphs: [
          `A patient may choose an option that carries risk. Autonomy supports the choice; beneficence may make you want a different outcome. The safe response is not to pick one principle and overrule the other. Explain only what is within your role, avoid pressure, check immediate safety, notify the supervising clinician, and document the patient's words and the response.`,
          `Fairness also requires individual assessment. Do not infer capacity from advanced age, disability, diagnosis, accent, religion, family disagreement, or a choice you would not make. Request an interpreter or accommodation when needed. Report concrete observations that may affect understanding—such as sudden confusion or inability to repeat essential information—without writing a legal or medical conclusion.`,
        ],
      },
    ],
    actions: [
      { icon: 'heart', title: 'Respect the voice', detail: 'Start with the patient’s expressed choice and preferred communication.' },
      { icon: 'shield', title: 'Protect safety', detail: 'Stop coercive or unsafe action and address immediate danger within role.' },
      { icon: 'phone', title: 'Consult early', detail: 'Use the supervisor or clinical chain before a conflict hardens.' },
      { icon: 'file', title: 'Record facts', detail: 'Chart words, observations, actions, notifications, and response.' },
    ],
    tip: `Principles are a compass, not a license. If the safe action depends on capacity, legal authority, a disputed order, or another profession's judgment, protect the moment and escalate.`,
    sourceLabels: ['RECOMMENDED ETHICS FRAMEWORK', 'CO-CP-004 §5.1', 'CL-PR-001 §4.1', '42 CFR 484.50(c)'],
    sceneImage: img01,
    sceneAlt: 'A home-health worker listens at eye level while an older adult points to a care preference and a family caregiver observes.',
    process: ['Observe', 'Name the tension', 'Protect', 'Consult', 'Document'],
    hotspots: [
      { id: 'autonomy', label: 'Autonomy: the patient indicates a personal care preference', shortLabel: 'Autonomy', x: 66, y: 58, tone: 'respect', observed: 'The patient is directing attention to a care preference while the worker listens.', why: 'An informed patient remains central to decisions. Disagreement alone is not incapacity.', action: 'Acknowledge the choice, clarify without pressure, and stay within the current plan and role.', notify: 'Notify the supervising clinician if the choice changes ordered care or creates a safety concern.', document: 'Record the patient’s words, relevant education, safety status, notification, and response.', sourceRefs: ['42 CFR 484.50(c)(4)', 'CL-PR-001 §§4.1.4–4.1.5'] },
      { id: 'beneficence', label: 'Beneficence: the care plan is used to promote the patient’s welfare', shortLabel: 'Benefit', x: 44, y: 75, tone: 'protect', observed: 'A care-plan folder is present as the shared guide for beneficial, authorized care.', why: 'Good intentions must be connected to ordered, patient-centered services—not personal preference.', action: 'Provide the authorized service that supports agreed goals; escalate when the plan no longer fits.', notify: 'Contact the supervising clinician for deterioration, refusal, or a needed plan clarification.', document: 'Link the action to the ordered goal and record the patient’s response.', sourceRefs: ['CO-CP-004 §5.1', 'CL-PR-001 §4.1.4'] },
      { id: 'nonmaleficence', label: 'Nonmaleficence: supplies remain closed until consent and safety are clear', shortLabel: 'Avoid Harm', x: 18, y: 77, tone: 'protect', observed: 'The clinical bag remains closed while preferences are discussed.', why: 'Pausing prevents harm from rushing, coercion, or an action that no longer matches consent.', action: 'Do not begin or continue a disputed, refused, unsafe, or out-of-scope task.', notify: 'Escalate urgent risk immediately; use emergency services under the verified protocol when indicated.', document: 'Record what was paused, why, immediate safety actions, and instructions received.', sourceRefs: ['CL-PR-004 §6.2.1', 'CO-CP-004 §5.1'] },
      { id: 'justice', label: 'Justice: the family is included without displacing the patient', shortLabel: 'Justice', x: 84, y: 50, tone: 'respect', observed: 'A caregiver is included in a respectful conversation while the patient remains central.', why: 'Fair care avoids discrimination and provides communication support without silencing the patient.', action: 'Use accessible communication, qualified support, and individualized assessment.', notify: 'Report discriminatory treatment, missing access support, or unresolved participation barriers.', document: 'Record the accommodation offered and the patient’s communication preference.', sourceRefs: ['42 CFR 484.50(c)(11) and (f)', 'CL-PR-001 §4.1.8'] },
      { id: 'fidelity', label: 'Fidelity: the worker follows through on professional commitments', shortLabel: 'Fidelity', x: 29, y: 46, tone: 'consult', observed: 'The worker is positioned for attentive follow-through rather than a hurried transaction.', why: 'Professional trust depends on keeping commitments or arranging a safe handoff when circumstances change.', action: 'State what you can do, avoid promises outside your authority, and close the communication loop.', notify: 'Re-escalate if the responsible person does not respond and the concern remains unresolved.', document: 'Record the person contacted, time, request, directions, and ownership of the next step.', sourceRefs: ['GV-PM-004 §§4.5, 4.7', 'CO-CP-004 §5.1'] },
      { id: 'veracity', label: 'Veracity: the tablet and record must reflect what actually occurred', shortLabel: 'Veracity', x: 48, y: 88, tone: 'respect', observed: 'A blank tablet is ready for contemporaneous, factual documentation.', why: 'Truthful records protect the patient, the care team, and the integrity of the agency.', action: 'Document actual observations and actions; disclose uncertainty and correct errors through policy.', notify: 'Report suspected falsification or pressure to alter a record through Compliance channels.', document: 'Use objective language, direct quotations when relevant, and accurate times.', sourceRefs: ['CO-CP-004 §5.2', 'RM-ER-002 §5.2'] },
    ],
  },
  {
    id: 2,
    shortName: 'Choice',
    title: 'Consent, Refusal & Decision Support',
    subtitle: 'Stop at active refusal, preserve the patient’s voice, and escalate questions of authority.',
    overview: [
      `Consent is not a signature that lasts forever regardless of circumstances. During a home visit, the patient may ask questions, withdraw permission, refuse part of care, or request more time. An active “stop” requires an immediate pause.`,
      `A family member's confidence does not automatically establish legal authority. A risky decision, diagnosis, disability, or older age does not automatically establish incapacity. Field workers report observations and use the verified clinical chain; they do not declare incapacity or select a surrogate.`,
      `Decision support means explaining within role, using accessible communication, checking understanding when appropriate, protecting immediate safety, and documenting the closed loop without coercion.`,
    ],
    details: [
      {
        heading: 'What informed choice requires',
        paragraphs: [
          `Before an authorized service, the patient should receive understandable information appropriate to the worker's role: what is planned, why it is being offered, material risks or burdens the patient needs to know, reasonable alternatives within the care plan, and what may happen if the service is declined. Use plain language and the agency's qualified interpreter or accessibility workflow when needed.`,
          `Teach-back can reveal misunderstanding, but it is not a test the patient must pass to keep rights. Ask the patient to explain the plan in their own words, then clarify gaps respectfully. Never use a child, unapproved family interpreter, or an impatient “yes” as a shortcut when the verified language-access process is required.`,
        ],
      },
      {
        heading: 'Refusal is an action signal',
        paragraphs: [
          `If the patient says “stop,” pulls away, moves away, or otherwise clearly refuses, stop the procedure immediately. Do not restrain, threaten discharge, argue, recruit family pressure, or quietly continue. Acknowledge the choice, identify any immediate danger within your competence, explain likely consequences only within your role, and notify the supervising clinician.`,
          `A patient may refuse one service and accept another. Do not turn a partial refusal into a threat that all care will end. The authorized clinical team decides whether the plan must change, whether additional assessment is needed, and how continuity will be protected.`,
        ],
        bullets: ['Stop the refused action.', 'Acknowledge and clarify without pressure.', 'Protect immediate safety within role.', 'Notify the supervising clinician.', 'Document facts, education, directions, and response.'],
      },
      {
        heading: 'Capacity concern versus disagreement',
        paragraphs: [
          `Capacity is decision-specific and is not inferred from age, diagnosis, appearance, accent, disability, family conflict, or an “unwise” decision. Sudden confusion, fluctuating alertness, inability to communicate a stable choice, or inability to grasp essential information may be important observations. Report those observations exactly. Do not write “incapable,” choose a representative, or let the loudest relative take control.`,
          `Verify representative authority through the agency record and the RN/DON or other authorized leader. California rules distinguish patient-designated surrogates, agents, conservators or guardians, and other selection processes. Those are not field-worker determinations. When documents conflict or authority is unclear, maintain respectful care within the verified plan and escalate.`,
        ],
      },
    ],
    actions: [
      { icon: 'shield', title: 'Stop on refusal', detail: 'Pause the action immediately; never coerce, restrain, or recruit family pressure.' },
      { icon: 'talk', title: 'Clarify safely', detail: 'Use plain language, access supports, and teach-back without turning it into a test.' },
      { icon: 'people', title: 'Verify authority', detail: 'Use the record and authorized chain; do not assume family status equals authority.' },
      { icon: 'file', title: 'Close the loop', detail: 'Record the choice, facts, notification, directions, follow-up owner, and response.' },
    ],
    tip: `The first safe response to active refusal is “stop,” not “decide capacity.” Protect the moment, then bring the right decision-maker into the loop.`,
    sourceLabels: ['42 CFR 484.50(b), (c)(4)', 'CL-PR-001 §§4.1.4–4.1.5', 'CL-PR-003', 'CA PROB §§4711–4712'],
    sceneImage: img02,
    sceneAlt: 'An older adult raises a hand to decline medication while a home-health worker pauses and a family representative listens.',
    process: ['Pause', 'Protect', 'Clarify', 'Notify', 'Document'],
    hotspots: [
      { id: 'refusal', label: 'Active refusal: the patient raises a clear stop signal', shortLabel: 'Refusal', x: 52, y: 45, tone: 'stop', observed: 'The patient raises a hand and is not consenting to continue.', why: 'Consent can be withdrawn during care. Family pressure does not erase an active refusal.', action: 'Stop the action, keep the patient safe, and respond without coercion or restraint.', notify: 'Notify the supervising clinician promptly; use the emergency protocol for immediate danger.', document: 'Quote the refusal, describe what stopped, safety findings, notification, directions, and response.', sourceRefs: ['42 CFR 484.50(c)(4)', 'CL-PR-004 §6.2.1'] },
      { id: 'medication', label: 'Medication organizer: ordered care is not permission to override refusal', shortLabel: 'Ordered Care', x: 40, y: 82, tone: 'protect', observed: 'The medication organizer remains closed after the patient declines.', why: 'An order guides authorized care but does not remove the patient’s right to consent or refuse.', action: 'Do not administer or assist with a refused action; address immediate risk within role.', notify: 'Report the refusal and relevant clinical risk to the supervising clinician.', document: 'Record the ordered task, refusal, education, current status, and directions received.', sourceRefs: ['CL-PR-001 §4.1.5', 'CL-PR-003'] },
      { id: 'representative', label: 'Representative claim: family presence does not prove decision authority', shortLabel: 'Authority', x: 79, y: 54, tone: 'consult', observed: 'A family member is present and engaged in the discussion.', why: 'Relationship alone does not let a field worker decide who may override or exercise patient rights.', action: 'Keep the patient central and verify representative authority through the record and authorized team.', notify: 'Escalate disputed or unclear authority to the RN/DON or designated clinical leader.', document: 'Record the claim of authority, documents referenced, people contacted, and verified direction.', sourceRefs: ['42 CFR 484.50(b)', 'CA Probate Code §§4711–4712'] },
      { id: 'capacity', label: 'Capacity concern: report observations without making the determination', shortLabel: 'Capacity', x: 61, y: 65, tone: 'consult', observed: 'The patient is conversing and expressing a choice while the worker observes understanding.', why: 'Capacity is decision-specific and cannot be inferred from age, diagnosis, or disagreement.', action: 'Use accessible communication and report concrete signs of confusion or impaired understanding.', notify: 'Request clinical assessment through the supervising clinician when observations raise concern.', document: 'Describe alertness, exact responses, communication supports, and changes from baseline—no legal label.', sourceRefs: ['CL-PR-003', '42 CFR 484.50(b)'] },
      { id: 'record', label: 'Consent record: documentation preserves the choice and the escalation trail', shortLabel: 'Record', x: 69, y: 83, tone: 'respect', observed: 'A care folder and phone support verification and closed-loop notification.', why: 'A defensible record separates what the patient said from what others requested and what the team directed.', action: 'Confirm the next-step owner and document only facts within your knowledge.', notify: 'Re-escalate through the alternate chain if risk remains and the first contact is unavailable.', document: 'Include times, names/roles, request, read-back direction, patient response, and follow-up plan.', sourceRefs: ['GV-PM-004 §§4.5, 4.7', 'RM-ER-002 §5.2'] },
    ],
  },
  {
    id: 3,
    shortName: 'Duties',
    title: 'Confidentiality & Competing Duties',
    subtitle: 'Private by default; use only verified emergency, safety, and reporting pathways.',
    overview: [
      `Confidentiality shows respect for the patient and protects trust. In a home, privacy can be difficult: relatives may listen from a doorway, phones may display notifications, paper may be left on a table, and a concerned person may ask for “just a quick update.”`,
      `The default is to protect patient information and use approved channels. Safety duties do not create a broad permission for a field worker to warn anyone they choose or disclose a full record. Immediate danger and suspected abuse follow specific emergency and reporting paths.`,
      `When duties compete, protect the person first, share only what the authorized recipient needs, make required reports without waiting for proof, notify internally without replacing an external duty, and never investigate or confront on your own.`,
    ],
    details: [
      {
        heading: 'Confidentiality in a real home',
        paragraphs: [
          `Before discussing care, notice who is present and whether the patient wants that person involved. Move to a more private area when practical, lower your voice, position the screen away from others, and return paper to the secure bag. Use only agency-approved devices, messaging, and record systems. A familiar relative is not automatically authorized to receive details.`,
          `Do not photograph a patient, record a home, send clinical details in a personal text, or open a record out of curiosity. If an accidental disclosure occurs, contain it when safe, preserve evidence, and report it promptly through the privacy or Compliance route. Do not delete messages, alter records, or ask others to keep the event secret.`,
        ],
      },
      {
        heading: 'Immediate danger is a safety event',
        paragraphs: [
          `If there is an immediate threat of violence or a medical emergency, get to safety, call 911 or activate the agency's verified emergency protocol as indicated, and provide only information needed by people able to respond. Do not wait for routine chain-of-command approval before protecting life or leaving an unsafe scene.`,
          `The HIPAA serious-and-imminent-threat provision is not a general field-worker exception. It depends on applicable law, ethical standards, and professional judgment. Field workers should use verified emergency and leadership channels rather than independently deciding to alert neighbors, employers, unrelated family, or the public.`,
        ],
      },
      {
        heading: 'Suspected abuse, neglect, or exploitation',
        paragraphs: [
          `A report is triggered by the applicable law and policy standard—not by completing your own proof. Listen without leading questions. Preserve immediate safety. Do not confront the alleged perpetrator, search belongings, demand bank statements, interview witnesses, or promise a particular outcome. Those actions can increase danger and damage evidence.`,
          `Care Indeed requires all workers to report concerns internally without delay. California external duties depend on the reporter's role, the person affected, the setting, and the circumstances. When your role is a mandated reporter, make the required external report immediately or as soon as practicable through the verified channel; internal notice does not replace it. If uncertain, protect the patient and contact the DON or on-call leader immediately without using uncertainty as a reason to delay a duty that applies.`,
        ],
        bullets: [
          `Immediate danger: leave or protect as needed, call 911 under the verified protocol, then notify clinical leadership.`,
          `Reasonable suspicion: activate the verified mandatory-report pathway; do not wait for certainty.`,
          `Internal report: notify DON/clinical leadership without delay, but do not substitute it for a required external report.`,
          `Documentation: patient-care facts in the clinical note; protected external and incident reports in their designated systems.`,
        ],
      },
    ],
    actions: [
      { icon: 'lock', title: 'Protect privacy', detail: 'Confirm who may participate and secure screens, paper, photos, and conversation.' },
      { icon: 'shield', title: 'Act on danger', detail: 'Leave unsafe conditions and activate emergency response without waiting.' },
      { icon: 'phone', title: 'Report correctly', detail: 'Use required external and internal paths; one never replaces the other.' },
      { icon: 'file', title: 'Do not investigate', detail: 'Preserve facts and evidence; avoid confrontation, searches, or conclusions.' },
    ],
    tip: `“Minimum necessary” is a discipline: use the correct recipient, approved channel, and only the information needed for that person to act.`,
    sourceLabels: ['CO-CP-004 §5.5', 'CL-PR-006', 'CA WIC §15630', 'CA PEN §11166', '45 CFR 164.512(j)'],
    sceneImage: img03,
    sceneAlt: 'A home-health worker holds a private conversation with an older adult while a concerned relative waits at a respectful distance in the doorway.',
    process: ['Private by default', 'Protect danger', 'Report', 'Minimum necessary', 'Document'],
    hotspots: [
      { id: 'private-space', label: 'Private space: the worker positions the conversation away from others', shortLabel: 'Private Space', x: 35, y: 50, tone: 'protect', observed: 'The worker and patient are seated together while a relative remains at a distance.', why: 'The patient controls participation unless law or verified authority provides another basis.', action: 'Ask the patient who may be included and move or reposition for privacy when practical.', notify: 'Consult the Privacy Officer or clinical leader when authorization or representative status is unclear.', document: 'Record the communication preference or authorized participant only when relevant to care.', sourceRefs: ['CO-CP-004 §5.5', 'CL-PR-001 §4.1.6'] },
      { id: 'device', label: 'Secure device: screens and messages stay within approved channels', shortLabel: 'Secure Device', x: 54, y: 78, tone: 'protect', observed: 'A tablet and phone are positioned on the table in the worker’s control.', why: 'Personal texting, exposed screens, and casual photos can disclose information beyond assigned duties.', action: 'Lock devices, use the approved system, and never photograph or record without verified authorization and workflow.', notify: 'Report a suspected privacy incident promptly; preserve the message or evidence rather than deleting it.', document: 'Follow the privacy-incident process; chart patient-care facts separately when applicable.', sourceRefs: ['CO-CP-004 §5.5', 'IT-UP-003 §§4.1–4.4'] },
      { id: 'family-request', label: 'Family request: concern does not automatically authorize disclosure', shortLabel: 'Family Request', x: 61, y: 27, tone: 'consult', observed: 'A relative waits in the doorway and may want an update.', why: 'Family involvement can help care, but relationship alone does not prove authority to receive information.', action: 'Ask the patient, verify authorization or representative status, and share only through the approved route.', notify: 'Escalate conflict or uncertain authority to the supervising clinician or Privacy contact.', document: 'Record verified participation, material request, and disposition without unnecessary family detail.', sourceRefs: ['42 CFR 484.50(b)', 'CO-CP-004 §5.5'] },
      { id: 'exit', label: 'Safety path: a clear exit supports immediate protection', shortLabel: 'Safety Path', x: 79, y: 30, tone: 'stop', observed: 'The doorway remains clear if the visit becomes unsafe.', why: 'No worker must remain in an environment with an immediate threat while trying to settle a confidentiality question.', action: 'Exit when needed, call 911 for imminent violence or emergency under protocol, then notify leadership.', notify: 'Use the on-call clinical/DON chain after immediate response; re-escalate unresolved risk.', document: 'Record observable threat, time of exit/call, people notified, and patient status known to you.', sourceRefs: ['RM-ER-002 §5.1', 'CL-PR-004 §6.2.3'] },
      { id: 'reporting', label: 'Reporting phone: suspicion activates verified reporting—not investigation', shortLabel: 'Report Route', x: 42, y: 83, tone: 'consult', observed: 'The phone can connect the worker to required emergency, external, and internal reporting routes.', why: 'Reasonable suspicion can require action before proof; internal notification cannot replace a statutory report.', action: 'Protect safety, make the report required for your role and circumstances, and do not confront or investigate.', notify: 'Notify DON/clinical leadership without delay; use alternate Compliance/Governing Body route if implicated.', document: 'Separate objective clinical facts from protected reporting and incident records.', sourceRefs: ['CL-PR-006 §§4.2–4.7, 6.2, 6.5', 'CA WIC §15630', 'CA Penal Code §11166'] },
    ],
  },
  {
    id: 4,
    shortName: 'End-of-Life',
    title: 'Advance Directives & End-of-Life Conflict',
    subtitle: 'Stabilize, follow verified orders within role, and escalate—never adjudicate at the bedside.',
    overview: [
      `Advance directives and portable medical orders help communicate a patient's choices, but they are not interchangeable. An advance directive may name an agent or express future preferences. A POLST or DNR is a medical order addressing specified treatment. Neither should be casually interpreted from memory.`,
      `In the home, a document may be missing, outdated, disputed, or misunderstood. Family members may disagree loudly. The field worker's job is not to decide validity, select the winning relative, revoke an order, or infer that one instruction limits unrelated routine care.`,
      `Protect immediate safety, locate and communicate known documents, follow the agency's current emergency and verified-order protocol within role, contact the required clinical chain, and document the facts and directions.`,
    ],
    details: [
      {
        heading: 'Know the categories without interpreting them',
        paragraphs: [
          `An advance directive is a recognized instruction about future health-care decisions, often including a health-care agent. A POLST is a portable set of medical orders for a seriously ill or frail person. A DNR addresses resuscitation; it does not mean “do not treat,” “do not call for help,” or “stop all routine care.” The current order and agency protocol determine authorized action.`,
          `California law permits qualifying physicians, nurse practitioners, and physician assistants to sign POLST under applicable requirements. A field worker must not reject a form solely because it lacks a physician signature, pronounce a document invalid, or decide which of several forms controls. Present the document and observed facts to the authorized clinical chain.`,
        ],
      },
      {
        heading: 'Family conflict does not change your role',
        paragraphs: [
          `A family member may genuinely believe that a different choice is best. Listen respectfully, keep the patient central when the patient can participate, and avoid arguing about law or morality. Do not let volume, relationship, or access to the home substitute for verified authority. Do not promise that leadership will agree with either side.`,
          `If the patient, family, current wishes, record, and order appear inconsistent, contact the on-call clinician or DON immediately. The authorized team can involve the ordering practitioner, Administrator, legal counsel, Compliance, or a leadership-arranged ethics resource. The module does not invent a standing ethics committee or response deadline.`,
        ],
      },
      {
        heading: 'Crisis sequence',
        paragraphs: [
          `First stabilize the scene: recognize immediate deterioration or danger, provide only care within role, and activate the verified emergency protocol. Second, locate and communicate known documents and current orders without editing, hiding, or interpreting them. Third, notify the required clinical leader and use read-back to confirm direction. Fourth, re-escalate if the situation remains unresolved or the first contact is unavailable.`,
          `Do not delay an indicated emergency response while debating a document. Do not use a blanket rule that a DNR always means call 911 or never call 911. Follow the agency's current protocol and verified orders for the actual situation.`,
        ],
        bullets: ['Stabilize immediate safety.', 'Follow verified order/protocol within role.', 'Notify the clinical chain.', 'Escalate unresolved conflict.', 'Document facts and directions.'],
      },
    ],
    actions: [
      { icon: 'shield', title: 'Stabilize first', detail: 'Recognize immediate danger and act through the verified emergency protocol.' },
      { icon: 'file', title: 'Present documents', detail: 'Locate and communicate known orders; do not edit, hide, or interpret validity.' },
      { icon: 'phone', title: 'Escalate conflict', detail: 'Call the on-call clinician or DON and re-escalate unresolved risk.' },
      { icon: 'heart', title: 'Protect dignity', detail: 'Keep the patient central and avoid a bedside legal or moral argument.' },
    ],
    tip: `A DNR addresses resuscitation. It is not shorthand for “no care,” and it does not make a field worker the interpreter of every end-of-life decision.`,
    sourceLabels: ['42 CFR 489.100–489.102', 'CL-PR-002', 'CA PROB §4780', 'GV-PM-004'],
    sceneImage: img04,
    sceneAlt: 'An awake older adult rests in a home bed while two family members disagree and a home-health worker prepares to call the clinical chain.',
    process: ['Stabilize', 'Verify', 'Notify', 'Escalate', 'Document'],
    hotspots: [
      { id: 'patient-voice', label: 'Patient voice: the awake patient remains central to the discussion', shortLabel: 'Patient Voice', x: 58, y: 47, tone: 'respect', observed: 'The patient is awake, engaged, and looking toward the worker and family.', why: 'End-of-life language must not erase the patient’s current participation when the patient can express a choice.', action: 'Address the patient directly, use accessible communication, and avoid family-only decision talk.', notify: 'Report any conflict between current wishes, documents, and requested action to the clinical chain.', document: 'Record the patient’s exact words and observable ability to participate—no capacity conclusion.', sourceRefs: ['42 CFR 484.50(c)(4)', 'CL-PR-001 §4.1.11'] },
      { id: 'directive', label: 'Advance-directive folder: communicate the document without interpreting it', shortLabel: 'Directive', x: 54, y: 83, tone: 'consult', observed: 'A folder near the bed may contain an advance directive or portable order.', why: 'Different documents serve different purposes; a field worker cannot decide validity or priority.', action: 'Locate and present the known document to the authorized clinician or responder.', notify: 'Contact the on-call clinician/DON for missing, conflicting, multiple, or disputed documents.', document: 'Record document type/location as known, people notified, and directions received.', sourceRefs: ['42 CFR 489.100–489.102', 'CL-PR-002'] },
      { id: 'family-conflict', label: 'Family disagreement: the loudest request does not become an order', shortLabel: 'Family Conflict', x: 31, y: 43, tone: 'consult', observed: 'Two family members show disagreement about the patient’s care.', why: 'Relationship and urgency do not let the field worker select legal authority or change a medical order.', action: 'De-escalate, keep everyone safe, avoid legal debate, and follow only verified direction within role.', notify: 'Escalate immediately to on-call clinical leadership; use alternate leadership when implicated or unavailable.', document: 'Quote material requests, describe behavior factually, and record the closed-loop direction.', sourceRefs: ['42 CFR 484.50(b)', 'CA Probate Code §§4711–4712'] },
      { id: 'phone', label: 'Escalation phone: use the chain before making a disputed decision', shortLabel: 'Call Chain', x: 80, y: 72, tone: 'protect', observed: 'The worker has a phone ready to reach the on-call clinical chain.', why: 'Authorized clinicians and leadership reconcile clinical orders, patient wishes, and legal questions.', action: 'Use concise situation-background-concern-request communication and read back instructions.', notify: 'Re-escalate urgent unresolved matters to DON/Administrator per current agency protocol.', document: 'Record who was reached, time, information provided, direction read back, and next-step owner.', sourceRefs: ['GV-PM-004 §§4.5, 6.3', 'CL-PR-002'] },
      { id: 'emergency', label: 'Emergency readiness: do not delay indicated response for a bedside debate', shortLabel: 'Emergency', x: 75, y: 56, tone: 'stop', observed: 'The patient-care area contains basic supplies while the worker monitors current status.', why: 'A disputed document does not justify delaying immediate safety actions under verified protocol.', action: 'Provide only care within role, activate emergency response as indicated, and present known orders.', notify: 'Notify the clinical lead after immediate response; coordinate with EMS or practitioner as directed.', document: 'Record condition observed, emergency action, document communicated, and instructions/outcome.', sourceRefs: ['RM-ER-002 §5.1', 'CL-PR-002'] },
    ],
  },
  {
    id: 5,
    shortName: 'Boundaries',
    title: 'Professional Boundaries in the Home',
    subtitle: 'Keep the relationship centered on the patient’s care—not money, secrecy, access, or personal benefit.',
    overview: [
      `Warmth and trust are strengths in home health, but the home setting can blur roles. A patient may offer a gift, request private errands, share financial access, ask for side work, invite personal social-media contact, or want the worker to endorse a product or provider.`,
      `A boundary protects both people. It prevents the care relationship from shifting toward personal benefit, debt, secrecy, dependency, divided loyalty, or exploitation. A respectful decline is not rejection of the patient; it is protection of professional trust.`,
      `When the rule is uncertain, pause rather than improvise. Disclose the offer or pre-existing relationship, leave money and property secure, obtain supervisor or Compliance direction, use alternate reporting if someone in the chain is involved, and document through the proper record.`,
    ],
    details: [
      {
        heading: 'A practical boundary test',
        paragraphs: [
          `Ask four questions. Is the request part of the authorized plan and my assigned role? Is the primary benefit for the patient rather than for me? Does it involve money, property, secrecy, exclusivity, personal access, or an obligation outside care? Does current policy clearly permit it? A “no,” “maybe,” or “I do not want anyone to know” means pause and consult.`,
        ],
      },
      {
        heading: 'Gifts, money, and property',
        paragraphs: [
          `Care Indeed's Code prohibits accepting or offering gifts, meals, entertainment, or gratuities that exceed $25 per occurrence or $50 annually from a patient, vendor, referral source, or competitor. Patient Property policy also treats gifts over $25 as significant and allows only small tokens with supervisory notification. Because the policies overlap, never treat “under $25” as automatic permission. Pause or decline and obtain supervisor direction before accepting any token.`,
          `Decline cash, gift cards over the limit, loans, checks, ATM cards, PINs, account passwords, beneficiary requests, access to valuables, and personal custody of money. Do not borrow, use, remove, or damage property. If damage occurs, disclose and report it. Report allegations of theft or intentional damage immediately to Operations and Compliance as policy directs.`,
        ],
      },
      {
        heading: 'Dual roles, personal contact, and social media',
        paragraphs: [
          `A patient may ask for private side work, transportation, a house key, childcare, shopping outside the plan, or a relationship after services. The current corpus does not provide one complete rule for every dual relationship, so the field worker should disclose and seek review instead of deciding alone. Romantic or sexual conduct, financial involvement, and exploitative personal relationships are never compatible with safe patient care and require immediate escalation.`,
          `Never accept a current patient's friend or follow request on a personal account. Politely explain the agency rule, decline, and report the contact to the Clinical Manager. Do not move clinical communication into direct messages, personal text, or private email. Do not photograph or post a patient, home, story, celebration, or “anonymous” detail outside the verified authorization and agency process.`,
        ],
      },
      {
        heading: 'Marketing and referral pressure',
        paragraphs: [
          `Do not recommend unnecessary services, misrepresent agency capability, or offer or accept anything of value for a referral. A vendor's meal, referral-source gift, discount, or “thank-you” may create a conflict even if it is described as customary. Field workers recognize and report; they do not interpret complex legal safe harbors.`,
        ],
      },
    ],
    actions: [
      { icon: 'heart', title: 'Decline kindly', detail: 'Thank the patient, state the professional limit, and avoid shame or argument.' },
      { icon: 'lock', title: 'Leave assets secure', detail: 'Do not take money, keys, passwords, checks, valuables, or account access.' },
      { icon: 'phone', title: 'Disclose early', detail: 'Report gifts, conflicts, contact requests, and side-work proposals.' },
      { icon: 'scale', title: 'Avoid divided loyalty', detail: 'Do not sell, steer, solicit, endorse, or accept value for referrals.' },
    ],
    tip: `Secrecy is a boundary alarm. If a request depends on “do not tell the agency,” stop and disclose it through the verified chain.`,
    sourceLabels: ['CO-CP-004 §§5.3–5.4, 5.9', 'OP-PA-005 §§2.2–2.5', 'IT-UP-003 §6.1.3', 'CL-PR-006'],
    sceneImage: img05,
    sceneAlt: 'An older adult offers a sealed gift envelope while a home-health worker politely declines and a relative holds a care folder nearby.',
    process: ['In the plan?', 'Who benefits?', 'Money or secrecy?', 'Policy permits?', 'Disclose'],
    hotspots: [
      { id: 'gift', label: 'Gift envelope: gratitude does not remove the conflict', shortLabel: 'Gift Offer', x: 35, y: 50, tone: 'stop', observed: 'The patient offers a sealed envelope and the worker raises a polite declining hand.', why: 'A gift can create obligation or personal benefit. Under-$25 items are not automatically permitted.', action: 'Pause or decline, thank the patient, and obtain supervisor direction; decline gifts above policy limits.', notify: 'Notify the supervisor; report improper inducement or referral value to Compliance immediately.', document: 'Record the offer and disposition in the designated policy record, not unnecessary clinical detail.', sourceRefs: ['CO-CP-004 §5.4', 'OP-PA-005 §2.4'] },
      { id: 'money', label: 'Financial papers: never take control of patient accounts or credentials', shortLabel: 'Financial Access', x: 71, y: 62, tone: 'stop', observed: 'Financial papers are near the family member while the worker remains separate from them.', why: 'Checks, PINs, passwords, loans, and beneficiary requests create exploitation and conflict risks.', action: 'Decline account access, leave documents and funds secure, and do not investigate transactions.', notify: 'Report suspected exploitation through the verified mandatory-report and internal paths.', document: 'Quote the request, describe observations, and document reporting without declaring guilt.', sourceRefs: ['CL-PR-006', 'CL-PR-001 §4.1.13'] },
      { id: 'key', label: 'House key: personal access or favors require authorization and review', shortLabel: 'Dual Role', x: 24, y: 81, tone: 'consult', observed: 'A house key is visible on the table during the boundary discussion.', why: 'Unapproved access or side work can blur duty, create liability, and deepen dependency.', action: 'Do not accept the key or private task; disclose any pre-existing or proposed dual relationship.', notify: 'Ask the supervisor/Compliance for written direction before any role outside the plan.', document: 'Record the request and disposition in the appropriate operational or Compliance record.', sourceRefs: ['CO-CP-004 §5.3', 'OP-PA-005 §2.2'] },
      { id: 'social', label: 'Personal phone: current-patient social connections are prohibited', shortLabel: 'Social Media', x: 43, y: 73, tone: 'protect', observed: 'A personal phone sits face down rather than being used for patient contact or photos.', why: 'Personal accounts and direct messages blur roles and can expose patient information.', action: 'Decline friend/follow requests, explain the rule, and keep communication in approved channels.', notify: 'Report current-patient social contact to the Clinical Manager; report PHI exposure to Privacy/Compliance.', document: 'Use the social-media incident process when required; preserve evidence without reposting.', sourceRefs: ['IT-UP-003 §§4.1–4.4, 6.1.3', 'CO-CP-004 §5.9'] },
      { id: 'bag', label: 'Clinical bag: professional tools stay tied to assigned care', shortLabel: 'Role Boundary', x: 12, y: 62, tone: 'respect', observed: 'The zipped clinical bag represents the worker’s authorized role and agency purpose.', why: 'Professional access must not be used to sell, solicit, steer referrals, or gain personal advantage.', action: 'Use agency resources only for assigned work and decline marketing or referral inducements.', notify: 'Report a kickback solicitation or undisclosed conflict to Compliance immediately.', document: 'Preserve relevant facts and communications through the Compliance route.', sourceRefs: ['CO-CP-004 §§5.3–5.4, 5.8', 'OP-PA-005'] },
    ],
  },
  {
    id: 6,
    shortName: 'Consult',
    title: 'Moral Distress & Ethics Consultation',
    subtitle: 'Respect beliefs, refuse unsafe action, protect continuity, and ask for help before conflict becomes abandonment.',
    overview: [
      `Moral distress occurs when a worker believes the right action is blocked, unclear, or in conflict with personal values. Cultural and religious differences can intensify that feeling, especially when a patient refuses care or requests an alternative the worker believes is unsafe.`,
      `Distress is a signal to consult—not permission to impose beliefs, shame a patient, delay care, refuse at the bedside without a safe handoff, or perform an unsafe or out-of-scope act. Respect and safety must remain together.`,
      `Use early disclosure, accessible communication, feasible alternatives, supervisor and clinical consultation, Compliance or leadership resources when indicated, and objective documentation. No field worker is expected to settle the legal or medical ethics question alone.`,
    ],
    details: [
      {
        heading: 'Respect without stereotyping',
        paragraphs: [
          `Ask what matters to this patient rather than treating a cultural or religious group as a script. A practice may affect visit timing, touch, food, medication, modesty, gender preference, prayer, fasting, family participation, or end-of-life choices. Listen, use qualified language support, and clarify what accommodation the patient is requesting.`,
          `Reasonable accommodation does not require an unsafe, unlawful, unapproved, or out-of-scope action. Explain the limit plainly and without judgment, offer feasible alternatives within the plan, and bring the supervising clinician into the discussion. Avoid statements such as “your belief is irrational” or “we do not do that here.”`,
        ],
      },
      {
        heading: 'Personal values and continuity',
        paragraphs: [
          `If a foreseeable assignment conflicts with a worker's sincerely held value, raise it before the next affected care action whenever possible. The supervisor can evaluate coverage, lawful accommodation, and continuity. Do not wait until the patient is exposed, announce a moral judgment, or simply leave without a handoff.`,
        ],
      },
      {
        heading: 'Consultation without an invented committee',
        paragraphs: [
          `The supplied current policy corpus does not confirm a standing ethics committee, membership list, hotline, or response deadline. Use the verified operational chain: supervising clinician or manager, DON/clinical leadership, Administrator, Compliance, and legal or leadership-arranged ethics consultation when needed. If a supervisor or leader is the subject of the concern, use the alternate Compliance or Governing Body route.`,
          `Communicate in a closed loop. State the situation, relevant background, your concrete concern, and the decision or support needed. Repeat back instructions. Confirm who owns follow-up and when. If risk worsens or no response comes, re-escalate instead of assuming silence means approval.`,
        ],
      },
      {
        heading: 'Objective documentation across records',
        paragraphs: [
          `A clinical note records patient-care facts: exact statements when material, observable status, care offered or stopped, education, response, people notified, instructions, and next plan. Avoid labels such as irrational, manipulative, abusive, difficult, or noncompliant unless quoting a source and clinically necessary. Do not diagnose motives, capacity, guilt, or legal validity.`,
          `An incident report is a separate risk-management record and is not placed in the clinical chart. A mandated report uses the protected external and internal workflow. A Compliance report may have its own confidential record. Complete each required record, but do not copy a protected investigation or incident form into the clinical note.`,
        ],
      },
    ],
    actions: [
      { icon: 'heart', title: 'Respect beliefs', detail: 'Ask the individual; do not stereotype, ridicule, or impose your own view.' },
      { icon: 'shield', title: 'Hold safety limits', detail: 'Decline unsafe, unapproved, or out-of-scope action without abandoning care.' },
      { icon: 'phone', title: 'Consult early', detail: 'Use the verified chain and an alternate route when the first contact is implicated.' },
      { icon: 'file', title: 'Write neutrally', detail: 'Separate observations, quotes, actions, directions, and response from conclusions.' },
    ],
    tip: `“I am uncomfortable” identifies a need for consultation. It does not decide what the patient must do or what care the worker may abandon.`,
    sourceLabels: ['OP-PA-004 §§2.1–2.4', 'CO-CP-004 §5.1', 'GV-PM-004 §§4.5, 4.7', 'RM-ER-002'],
    sceneImage: img06,
    sceneAlt: 'A patient and family member engage in a quiet spiritual practice while a home-health worker respectfully steps aside and calls a supervisor.',
    process: ['Pause', 'Respect', 'Protect continuity', 'Consult', 'Document'],
    hotspots: [
      { id: 'practice', label: 'Spiritual practice: ask the individual rather than assuming meaning', shortLabel: 'Patient Belief', x: 37, y: 59, tone: 'respect', observed: 'The patient and family member are engaged in a quiet spiritual practice.', why: 'Cultural and religious practices deserve respect and individualized inquiry, not stereotypes.', action: 'Ask what the practice means for today’s care and offer feasible accommodation.', notify: 'Contact the supervising clinician when the request changes timing, treatment, or safety.', document: 'Record the patient’s stated preference and accommodation—not a generalized cultural label.', sourceRefs: ['OP-PA-004 §§2.1–2.4', '42 CFR 484.50(f)'] },
      { id: 'unsafe-request', label: 'Closed medication box: respect does not authorize an unsafe alternative', shortLabel: 'Unsafe Request', x: 25, y: 82, tone: 'stop', observed: 'A closed medication box remains untouched while the request is clarified.', why: 'An unsafe, unapproved, or out-of-scope action can harm the patient even when requested sincerely.', action: 'Decline the unsafe action, explain the limit, and offer only authorized alternatives.', notify: 'Notify the supervising clinician promptly and use emergency response for immediate danger.', document: 'Record the request, limit explained, alternatives, safety status, and directions.', sourceRefs: ['CO-CP-004 §5.1', 'CL-PR-001 §4.1.4'] },
      { id: 'moral-distress', label: 'Worker pause: moral distress is a cue to seek support', shortLabel: 'Moral Distress', x: 78, y: 39, tone: 'consult', observed: 'The worker steps back respectfully rather than interrupting or acting impulsively.', why: 'Distress can narrow judgment; early consultation protects both the patient and worker.', action: 'Name the concrete conflict privately and continue immediate safe support within role.', notify: 'Raise foreseeable conflict with the supervisor before the next affected action when possible.', document: 'Use a workforce or operational channel for personal conflict; chart only relevant patient-care facts.', sourceRefs: ['OP-PA-004 §2.4', 'GV-PM-004 §4.7'] },
      { id: 'consult-call', label: 'Consultation call: use a verified chain and closed-loop request', shortLabel: 'Consult', x: 76, y: 25, tone: 'protect', observed: 'The worker is calling while maintaining respectful distance and line of sight.', why: 'Clinical, legal, and ethics questions belong to authorized leadership and consultation resources.', action: 'Use situation-background-concern-request language and read back the direction.', notify: 'Escalate to DON/Administrator/Compliance or alternate Governing Body route when needed.', document: 'Record person/time, request, directions, next-step owner, and re-escalation if unresolved.', sourceRefs: ['GV-PM-004 §§4.5, 6.3', 'CO-CP-004 §6'] },
      { id: 'care-plan', label: 'Care-plan folder: alternatives must remain authorized', shortLabel: 'Authorized Plan', x: 57, y: 86, tone: 'protect', observed: 'A care-plan folder is available while the worker seeks direction.', why: 'Accommodation should fit current orders, role scope, and patient goals rather than improvisation.', action: 'Offer feasible choices within the plan and wait for authorized changes.', notify: 'Request plan clarification or modification through the supervising clinician.', document: 'Record the authorized alternative and patient response once direction is received.', sourceRefs: ['CL-PR-001 §4.1.4', 'CO-CP-004 §5.1'] },
      { id: 'objective-note', label: 'Blank record: document the event without judging the belief', shortLabel: 'Objective Note', x: 59, y: 77, tone: 'respect', observed: 'The record is ready for factual documentation after consultation.', why: 'Judgmental labels can distort care and obscure the actual decision trail.', action: 'Use quotes, observations, times, actions, directions, and outcomes.', notify: 'Complete separate incident, Compliance, or mandated-report records when their criteria apply.', document: 'Keep clinical, risk, and protected reporting records in their designated locations.', sourceRefs: ['RM-ER-002 §§4.3, 5.2', 'CL-PR-006 §6.5'] },
    ],
  },
  {
    id: 7,
    shortName: 'Simulation',
    title: 'Complex Ethics Simulation & Debrief',
    subtitle: 'Integrate respect, protection, reporting, consultation, boundaries, and objective documentation.',
    overview: [
      `Complex cases rarely arrive with one clean issue. A patient may refuse care while family pressure rises, a document is misunderstood, a boundary is crossed, and a possible exploitation concern appears. The safest worker does not solve every dispute; the worker controls the next safe steps.`,
      `In this simulation, Ms. Rivera is alert and conversational. She refuses scheduled wound care during a religious fast. Her daughter says, “Do it anyway,” and offers a $30 gift card for staying longer. Privately, Ms. Rivera says a nephew took her debit card and she is afraid to ask for it back. A POLST is visible, but she is not in arrest.`,
      `Work the sequence: observe, classify, stabilize, escalate, and document. Each action protects the patient without turning the field worker into the investigator, capacity evaluator, surrogate selector, order interpreter, or ethics adjudicator.`,
    ],
    details: [
      {
        heading: 'Decision 1: honor the active refusal',
        paragraphs: [
          `Ms. Rivera's refusal is clear. Stop the wound-care action and do not let the daughter authorize it in the patient's place. Ask whether Ms. Rivera will share what concerns her and whether there is an immediate safety issue. Explain relevant consequences only within role and without using fear or threatening discharge.`,
        ],
      },
      {
        heading: 'Decision 2: do not manufacture incapacity or authority',
        paragraphs: [
          `The daughter argues that Ms. Rivera “does not understand.” The worker reports the exact words and observable communication. The worker does not label Ms. Rivera incapable, let the daughter override her, or select a surrogate. A request the family dislikes is not itself evidence of incapacity.`,
        ],
      },
      {
        heading: 'Decision 3: keep the POLST in its lane',
        paragraphs: [
          `The visible POLST does not decide whether routine wound care occurs today. It communicates specified medical orders and should be available if relevant to an emergency. Do not interpret it as a blanket instruction, decide that the family revoked it, or delay emergency response while debating it.`,
        ],
      },
      {
        heading: 'Decision 4: decline the boundary crossing',
        paragraphs: [
          `The $30 gift card exceeds the $25 per-occurrence Code threshold. Thank the daughter and decline it. Even a smaller token would require supervisory direction rather than automatic acceptance. Do not stay off the clock, conceal the offer, or convert the value into patient supplies on your own.`,
        ],
      },
      {
        heading: 'Decision 5: respond to possible exploitation',
        paragraphs: [
          `Ms. Rivera's statement about the debit card and fear may create reasonable suspicion of financial exploitation. Listen and protect privacy. Do not ask to inspect her bank account, confront the nephew, call other relatives for proof, or promise that money will be returned.`,
          `Activate the verified external reporting path required for your statutory role and the universal internal pathway without delay. If immediate danger exists, use emergency response first. Confirm follow-up ownership and avoid disclosing the report to a person who may be involved.`,
        ],
      },
      {
        heading: 'Debrief: one defensible record trail',
        paragraphs: [
          `The clinical note records the refused wound care, Ms. Rivera's exact words when material, current wound or safety observations within the worker's role, education, authorized alternatives, people notified, instructions, and response. It does not place the incident form or mandated-report form in the chart.`,
        ],
        bullets: ['Respect the refusal.', 'Protect immediate safety.', 'Verify—do not assume—authority.', 'Decline the gift.', 'Report possible exploitation.', 'Document in the correct records.', 'Re-escalate unresolved risk.'],
      },
    ],
    actions: [
      { icon: 'eye', title: 'Observe facts', detail: 'Hear exact words, note current status, and separate evidence from conclusions.' },
      { icon: 'scale', title: 'Classify the issue', detail: 'Refusal, safety, authority, boundary, reporting, and order questions follow different paths.' },
      { icon: 'shield', title: 'Stabilize', detail: 'Stop refused or unsafe action and protect patient and worker before debate.' },
      { icon: 'phone', title: 'Escalate & close', detail: 'Use required routes, confirm ownership, document, and re-escalate if unresolved.' },
    ],
    tip: `You do not need the final legal or ethics answer to take the next correct field action. Stabilize, respect, report, consult, and document.`,
    sourceLabels: ['42 CFR 484.50', 'CO-CP-004', 'CL-PR-001/002/003/006', 'RM-ER-002', 'OP-PA-004/005'],
    sceneImage: img07,
    sceneAlt: 'An older adult states a choice while two family members disagree and a home-health worker remains at eye level with a phone ready for escalation.',
    process: ['Observe', 'Classify', 'Stabilize', 'Escalate', 'Document'],
    hotspots: [
      { id: 'choice', label: 'Expressed choice: Ms. Rivera remains the starting point', shortLabel: 'Choice', x: 48, y: 52, tone: 'respect', observed: 'The patient is alert, conversational, and indicating a care preference.', why: 'A clear refusal stops the action; family disagreement does not itself establish incapacity.', action: 'Stop, acknowledge, check immediate safety, offer authorized alternatives, and avoid coercion.', notify: 'Notify the supervising clinician about the refusal and any clinical risk or change.', document: 'Quote the refusal, record observations, education, alternatives, notification, and response.', sourceRefs: ['42 CFR 484.50(c)(4)', 'CL-PR-001 §4.1.5'] },
      { id: 'family', label: 'Family pressure: do not let force or volume choose authority', shortLabel: 'Family Pressure', x: 27, y: 48, tone: 'consult', observed: 'Family members disagree around the patient and press for a different action.', why: 'The field worker cannot select a surrogate, decide capacity, or let pressure override consent.', action: 'De-escalate, keep the patient central, and follow only verified direction within role.', notify: 'Escalate authority or capacity concerns to RN/DON; use alternate route when implicated.', document: 'Record exact material statements, behavior, people contacted, and direction.', sourceRefs: ['42 CFR 484.50(b)', 'CA Probate Code §§4711–4712'] },
      { id: 'documents', label: 'Directive folder: a POLST does not decide unrelated routine care', shortLabel: 'Documents', x: 34, y: 82, tone: 'protect', observed: 'A document folder is visible near routine care supplies.', why: 'Advance directives and portable orders have defined purposes; a worker must not generalize or revise them.', action: 'Present known documents, follow verified protocol/order within role, and do not adjudicate validity.', notify: 'Contact on-call clinical leadership for conflict; activate emergency response as indicated.', document: 'Record the document communicated, current event, instructions, and outcome.', sourceRefs: ['42 CFR 489.100–489.102', 'CL-PR-002'] },
      { id: 'boundary', label: 'Phone and bag: decline gifts, secrecy, and personal arrangements', shortLabel: 'Boundary', x: 78, y: 80, tone: 'stop', observed: 'Professional tools remain separate from any gift or personal arrangement.', why: 'A $30 gift card exceeds policy limits; secrecy or value tied to care raises further concern.', action: 'Decline, explain the boundary, preserve continuity, and do not repurpose the value.', notify: 'Notify the supervisor and Compliance when the offer is improper or linked to action.', document: 'Use the designated boundary/Compliance record and chart only relevant care facts.', sourceRefs: ['CO-CP-004 §§5.3–5.4', 'OP-PA-005 §2.4'] },
      { id: 'report', label: 'Escalation phone: report exploitation suspicion without investigating', shortLabel: 'Report & Close', x: 70, y: 69, tone: 'consult', observed: 'The worker is ready to communicate the refusal, conflict, and exploitation concern.', why: 'Required external reporting and internal notice protect the patient; investigation is not the worker’s job.', action: 'Use applicable external and internal paths, share minimum necessary facts, and close the loop.', notify: 'Notify DON/clinical leadership; use Compliance/Governing Body alternate route if implicated.', document: 'Separate clinical facts, incident information, and protected report; confirm next-step owner.', sourceRefs: ['CL-PR-006 §§4.2–4.7, 6.2, 6.5', 'GV-PM-004'] },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'q1', kind: 'direct',
    stem: 'Which principle most directly means truthful communication and accurate documentation?',
    options: ['Justice', 'Veracity', 'Fidelity', 'Beneficence'], correct: 1,
    rationale: 'Veracity is truthfulness. In practice it supports accurate communication and objective records; it does not permit disclosure outside authorized channels.',
    sourceRefs: ['RECOMMENDED ETHICS FRAMEWORK', 'CO-CP-004 §5.2', 'RM-ER-002 §5.2'],
  },
  {
    id: 'q2', kind: 'direct',
    stem: 'Which action is outside a field worker’s role during a disputed consent or capacity situation?',
    options: ['Protect immediate safety within role.', 'Report observable facts through the clinical chain.', 'Follow verified instructions that are within role.', 'Personally declare the patient incapable and choose a surrogate.'], correct: 3,
    rationale: 'Field workers do not adjudicate capacity or select legal decision-makers. They preserve safety and choice, report observations, verify through the record, and escalate uncertainty.',
    sourceRefs: ['42 CFR 484.50(b)', 'CL-PR-003', 'CA Probate Code §§4711–4712'],
  },
  {
    id: 'q3', kind: 'scenario',
    stem: 'During a dressing change, the patient says, “Stop; I do not consent,” while the daughter says, “Keep going.” What is the best first response?',
    options: ['Stop, acknowledge the refusal, address immediate safety within role, notify the supervising clinician, and document.', 'Continue because the daughter is family.', 'Hold the patient’s arm still to finish quickly.', 'Tell the patient that all agency services are immediately terminated.'], correct: 0,
    rationale: 'The patient may refuse during care. Active refusal means stop; it does not authorize coercion, restraint, or an unverified family override.',
    sourceRefs: ['42 CFR 484.50(c)(4)', 'CL-PR-001 §4.1.5', 'CL-PR-004 §6.2.1'],
  },
  {
    id: 'q4', kind: 'scenario',
    stem: 'A patient offers a sealed $30 gift card “just for you.” What is the safest policy-aligned response?',
    options: ['Accept it because it is not cash.', 'Accept it and share it with the team.', 'Politely decline it and notify the supervisor through the agency process.', 'Use it for patient supplies without telling anyone.'], correct: 2,
    rationale: 'Thirty dollars exceeds the $25 per-occurrence Code threshold. Personal repurposing does not remove the conflict; disclose the offer and follow the agency process.',
    sourceRefs: ['CO-CP-004 §5.4', 'OP-PA-005 §2.4'],
  },
  {
    id: 'q5', kind: 'scenario',
    stem: 'A current patient sends the worker a social-media friend request. What should the worker do?',
    options: ['Accept but never discuss care.', 'Politely decline, explain the agency rule, and report it to the Clinical Manager.', 'Ignore it and take no other action.', 'Accept through a private second account.'], correct: 1,
    rationale: 'Care Indeed policy prohibits personal social-media connections with current patients and directs the worker to decline and report the contact.',
    sourceRefs: ['IT-UP-003 §§4.4, 6.1.3', 'CO-CP-004 §5.9'],
  },
  {
    id: 'q6', kind: 'scenario',
    stem: 'In an apparent crisis, a POLST/DNR is present and family members demand an action that appears inconsistent with it. What should the field worker do?',
    options: ['Decide that the family has revoked the order.', 'Debate the document’s legality with the family.', 'Ignore the document because it is only for hospitals.', 'Use the current emergency and verified-order protocol within role, activate the required escalation, and do not interpret or change the order.'], correct: 3,
    rationale: 'Disputed orders and current wishes are clinical and legal questions for the authorized chain. The field worker protects immediate safety, communicates the document, and follows verified direction.',
    sourceRefs: ['42 CFR 489.102', 'CL-PR-002', 'RM-ER-002 §5.1'],
  },
  {
    id: 'q7', kind: 'scenario',
    stem: 'An older patient says a nephew takes the patient’s pension card and the patient appears afraid. The worker has no proof. What is the best response?',
    options: ['Protect immediate safety, activate required external and internal reporting paths, document facts, and do not investigate or confront.', 'Question the nephew until the account is confirmed.', 'Inspect bank statements before deciding.', 'Wait until the next visit for more evidence.'], correct: 0,
    rationale: 'Reasonable suspicion may activate reporting before proof. Internal notice does not replace an external report required for the worker’s role and circumstances; the worker does not investigate.',
    sourceRefs: ['CL-PR-006 §§4.2–4.7, 6.2, 6.5', 'CA WIC §15630'],
  },
  {
    id: 'q8', kind: 'documentation',
    stem: 'Which entry is objective documentation?',
    options: ['Patient was irrational and manipulative.', 'Patient was noncompliant as usual.', '10:14 — Patient stated, “Stop; I do not want the dressing changed today.” Procedure stopped; RN Lee notified at 10:18; no active bleeding observed.', 'Daughter is clearly abusive.'], correct: 2,
    rationale: 'The correct entry records exact words, observations, times, action, and notification without diagnosing capacity, motive, or guilt.',
    sourceRefs: ['RM-ER-002 §5.2', 'CL-PR-006 §6.5'],
  },
  {
    id: 'q9', kind: 'escalation',
    stem: 'After a reportable safety incident, which documentation approach is correct?',
    options: ['Put the completed incident-report form in the patient’s clinical chart.', 'Chart patient-care facts and response in the clinical record and complete the separate incident report; make urgent notifications within the earlier required timeframe.', 'Only text a coworker so the record stays private.', 'Omit clinical facts once an incident form exists.'], correct: 1,
    rationale: 'Clinical and risk records serve different purposes. The clinical chart contains patient-care facts; the incident report stays in the designated risk system and does not replace urgent notification.',
    sourceRefs: ['RM-ER-002 §§4.3, 5.1–5.2', 'GV-PM-004'],
  },
  {
    id: 'q10', kind: 'integrative',
    stem: 'A patient refuses a scheduled bath for a religious observance and requests an unsafe, out-of-scope alternative. What is the best integrated response?',
    options: ['Force the bath because hygiene is beneficial.', 'Agree to the unsafe request to show cultural respect.', 'End the visit and refuse all future care without notice.', 'Respect the refusal, decline unsafe action, offer feasible authorized alternatives, notify the supervisor, preserve continuity, and document objectively.'], correct: 3,
    rationale: 'Patient choice and cultural respect coexist with safety and role limits. The worker neither forces care nor abandons the patient; the worker consults and protects continuity.',
    sourceRefs: ['42 CFR 484.50(c)(4), (11), (f)', 'OP-PA-004 §§2.1–2.4', 'CO-CP-004 §5.1'],
  },
];

const STYLES = `
.m10-shell,.m10-shell *{box-sizing:border-box}
.m10-shell{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:${CI.bg};color:${CI.ink};font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
.m10-top{height:64px;min-height:64px;display:flex;align-items:center;gap:16px;padding:0 20px;background:#fff;border-bottom:1px solid ${CI.border}}
.m10-brand{display:flex;align-items:center;gap:8px;color:${CI.teal};font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;flex-shrink:0}
.m10-tabs{display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:thin;flex:1;padding:4px 2px}
.m10-tab{border:1px solid transparent;background:transparent;color:${CI.muted};border-radius:999px;min-height:44px;padding:0 13px;font-size:11px;font-weight:800;letter-spacing:.04em;white-space:nowrap;cursor:pointer}
.m10-tab[aria-selected="true"]{background:${CI.teal};color:#fff;border-color:${CI.teal}}
.m10-tab.quiz{border-color:${CI.orange};color:${CI.orangeDark};background:#fff}
.m10-tab.quiz[aria-selected="true"]{background:${CI.orange};color:#fff}
.m10-exit{flex-shrink:0;border-radius:10px;border:1px solid ${CI.orange};background:#fff;color:${CI.orangeDark};padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.m10-main{flex:1;min-height:0;padding:16px;display:flex;overflow:hidden}
.m10-panels{display:flex;flex:1;min-width:0;min-height:0;gap:0}
.m10-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid ${CI.border};border-radius:16px 0 0 16px;padding:22px;scrollbar-width:thin}
.m10-right{flex:1;min-width:0;min-height:0;overflow:auto;background:${CI.tealSoft};border:1px solid ${CI.border};border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex;align-items:center;justify-content:center}
.m10-stage{position:relative;width:min(100%,calc((100vh - 194px) * 16 / 13));aspect-ratio:16/13;max-height:100%;overflow:hidden;border-radius:14px;background:#d7e3e1;box-shadow:0 12px 36px rgba(15,91,84,.13)}
.m10-stage>img{width:100%;height:100%;object-fit:cover;display:block}
.m10-stage-label{position:absolute;top:10px;left:10px;z-index:7;max-width:42%;padding:7px 10px;border-radius:10px;background:rgba(255,255,255,.94);border:1px solid ${CI.border};box-shadow:0 4px 12px rgba(0,0,0,.08)}
.m10-counter{position:absolute;top:10px;right:10px;z-index:7;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid ${CI.border};font-size:11px;font-weight:800;color:${CI.teal}}
.m10-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.m10-orb{position:relative;width:48px;height:48px;display:grid;place-items:center;border-radius:50%;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.22);color:#fff}
.m10-tag{background:rgba(255,255,255,.97);padding:5px 8px;border-radius:8px;font-size:11px;font-weight:800;color:${CI.teal};border:1px solid ${CI.border};box-shadow:0 3px 10px rgba(0,0,0,.1);white-space:nowrap;line-height:1.2;max-width:132px}
.m10-ping{position:absolute;inset:0;border-radius:50%;background:${CI.orange};opacity:.5;animation:m10-ping 1.2s cubic-bezier(0,0,.2,1) 2;pointer-events:none}
@keyframes m10-ping{0%{transform:scale(.9);opacity:.55}100%{transform:scale(1.65);opacity:0}}
.m10-process{position:absolute;left:10px;bottom:10px;z-index:6;max-width:70%;display:flex;align-items:center;gap:4px;flex-wrap:wrap;pointer-events:none}
.m10-process span{padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.94);border:1px solid ${CI.tealMuted};font-size:11px;font-weight:800;color:${CI.teal};box-shadow:0 3px 10px rgba(0,0,0,.08)}
.m10-process b{color:${CI.orange};font-size:12px}
.m10-reset{position:absolute;right:10px;bottom:10px;z-index:24;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid ${CI.border};background:rgba(255,255,255,.96);color:${CI.teal};font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.m10-complete{position:absolute;inset:0;z-index:20;background:rgba(15,91,84,.7);backdrop-filter:blur(3px);display:grid;place-items:center;padding:18px}
.m10-complete-card{background:#fff;border-radius:16px;border:4px solid ${CI.tealSoft};max-width:390px;padding:24px;text-align:center;box-shadow:0 16px 50px rgba(0,0,0,.2)}
.m10-dialog-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.72);backdrop-filter:blur(3px);display:grid;place-items:center;padding:14px}
.m10-dialog{width:min(460px,96%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 20px 65px rgba(0,0,0,.25)}
.m10-dialog-head{position:sticky;top:0;z-index:2;background:#fff;border-bottom:1px solid ${CI.border};padding:12px 12px 12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.m10-dialog-head h2{font-size:18px;line-height:1.3;margin:0;color:${CI.teal}}
.m10-icon-button{width:44px;height:44px;min-width:44px;border:1px solid ${CI.border};border-radius:10px;background:#fff;color:${CI.teal};display:grid;place-items:center;cursor:pointer}
.m10-dialog-body{padding:16px}
.m10-feedback{padding:12px 0;border-bottom:1px solid #edf2f7}
.m10-feedback:last-of-type{border-bottom:0}
.m10-feedback-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${CI.muted};margin-bottom:5px}
.m10-feedback p{margin:0;font-size:15.5px;line-height:1.55;color:${CI.ink}}
.m10-sources{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.m10-source{font-size:11px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;padding:4px 8px;border-radius:6px;background:${CI.tealSoft};color:${CI.teal};border:1px solid ${CI.tealMuted}}
.m10-primary{min-height:44px;border:0;border-radius:10px;background:${CI.orange};color:#fff;padding:0 16px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.m10-secondary{min-height:44px;border:1px solid ${CI.border};border-radius:10px;background:#fff;color:${CI.teal};padding:0 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.m10-bottom{height:80px;min-height:80px;background:#fff;border-top:1px solid ${CI.border};display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 24px;gap:12px}
.m10-bottom .prev{justify-self:start}.m10-bottom .next{justify-self:end}.m10-status{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${CI.teal};background:${CI.tealSoft};border:1px solid ${CI.tealMuted};border-radius:8px;padding:8px 12px;text-align:center}
.m10-eyebrow{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${CI.teal};background:${CI.tealSoft};border:1px solid ${CI.tealMuted};border-radius:999px;padding:4px 10px;margin-bottom:14px}
.m10-left h1{font-size:24px;line-height:1.25;margin:0 0 6px;color:#1f1c1b}
.m10-subtitle{font-size:14px;line-height:1.45;color:${CI.orangeDark};font-weight:800;margin:0 0 16px}
.m10-overview p{font-size:17px;line-height:1.65;margin:0 0 13px;color:${CI.ink}}
.m10-details{border:1px solid ${CI.border};border-radius:12px;background:${CI.bg};margin:16px 0;overflow:hidden}
.m10-details summary{min-height:44px;padding:12px 14px;cursor:pointer;font-size:13px;font-weight:800;color:${CI.teal};display:flex;align-items:center;gap:8px}
.m10-details-body{padding:0 14px 16px}.m10-details-body h2{font-size:17px;color:${CI.teal};margin:20px 0 8px}.m10-details-body p,.m10-details-body li{font-size:16px;line-height:1.65}.m10-details-body p{margin:0 0 12px}.m10-details-body ul{padding-left:22px;margin:8px 0 16px}
.m10-section-label{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${CI.muted};margin:18px 0 10px}
.m10-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.m10-action{border:1px solid ${CI.border};border-radius:12px;background:#fff;padding:11px}.m10-action svg{color:${CI.orange};margin-bottom:5px}.m10-action strong{display:block;font-size:13px;color:${CI.teal};margin-bottom:4px}.m10-action span{display:block;font-size:14px;line-height:1.45;color:${CI.ink}}
.m10-tip{margin:16px 0 0;border-left:4px solid ${CI.orange};border-radius:8px;background:${CI.orangeSoft};padding:12px 14px}.m10-tip b{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${CI.orangeDark};margin-bottom:5px}.m10-tip p{font-size:15px;line-height:1.55;margin:0}
.m10-quiz-wrap{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;justify-content:center;align-items:flex-start;background:${CI.bg}}
.m10-quiz-card{width:min(760px,100%);background:#fff;border:1px solid ${CI.border};border-radius:24px;overflow:hidden;box-shadow:0 14px 45px rgba(15,91,84,.12)}
.m10-quiz-head{padding:22px 24px;background:linear-gradient(135deg,${CI.teal},#16776d);color:#fff}.m10-quiz-head h1{font-size:22px;margin:6px 0}.m10-quiz-body{padding:24px}.m10-progress-track{height:8px;border-radius:999px;background:${CI.tealSoft};overflow:hidden;margin-top:14px}.m10-progress-bar{height:100%;background:linear-gradient(90deg,${CI.orange},#ffb088)}
.m10-question-label{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${CI.teal};margin-bottom:10px}.m10-question{font-size:20px;line-height:1.45;margin:0 0 18px;color:${CI.ink}}
.m10-options{display:grid;gap:10px}.m10-option{position:relative;display:grid;grid-template-columns:30px 1fr;align-items:center;gap:10px;border:2px solid ${CI.border};border-radius:12px;padding:12px;min-height:52px;cursor:pointer;background:#fff}.m10-option input{position:absolute;opacity:0;pointer-events:none}.m10-option.selected{border-color:${CI.teal};background:${CI.tealSoft}}.m10-option.correct{border-color:${CI.teal};background:${CI.tealSoft}}.m10-option.incorrect{border-color:${CI.red};background:${CI.redSoft}}.m10-letter{width:28px;height:28px;border-radius:8px;background:${CI.bg};display:grid;place-items:center;font-size:12px;font-weight:800}.m10-option span:last-child{font-size:16px;line-height:1.45}.m10-rationale{margin-top:16px;padding:14px;border-radius:12px;background:${CI.orangeSoft};border:1px solid #fed7c5}.m10-rationale b{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${CI.orangeDark}}.m10-rationale p{font-size:15px;line-height:1.55;margin:6px 0 0}
.m10-quiz-actions{display:flex;gap:10px;margin-top:18px}.m10-result{text-align:center;padding:8px 0}.m10-score{width:118px;height:118px;border-radius:50%;border:10px solid ${CI.tealSoft};display:grid;place-items:center;margin:0 auto 16px}.m10-score strong{font-size:28px;color:${CI.teal}}.m10-result h2{font-size:24px;color:${CI.teal};margin:0 0 8px}.m10-result p{font-size:16px;line-height:1.55;max-width:600px;margin:0 auto 14px}
.m10-save-toast{position:fixed;right:18px;top:76px;z-index:80;max-width:min(420px,calc(100vw - 36px));padding:11px 14px;border-radius:10px;background:#fff;color:${CI.teal};border:1px solid ${CI.tealMuted};box-shadow:0 10px 30px rgba(15,91,84,.18);font-size:13px;font-weight:800}
.m10-note{margin:12px 0;padding:11px 13px;border-radius:10px;background:${CI.tealSoft};border:1px solid ${CI.tealMuted};font-size:14px;line-height:1.5;color:${CI.ink}}
.m10-secondary:disabled,.m10-primary:disabled{opacity:.48;cursor:not-allowed}
.m10-icon-button:focus-visible{outline:3px solid #111;outline-offset:3px}
.m10-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.m10-tab:focus-visible,.m10-exit:focus-visible,.m10-primary:focus-visible,.m10-secondary:focus-visible,.m10-reset:focus-visible,.m10-hotspot:focus-visible .m10-orb,.m10-option:focus-within,.m10-details summary:focus-visible,.m10-left h1:focus-visible,.m10-question:focus-visible,.m10-quiz-head h1:focus-visible{outline:3px solid #111;outline-offset:3px}
@media(max-width:900px){.m10-shell{overflow:auto}.m10-top{position:sticky;top:0;z-index:40;padding:0 10px;gap:8px}.m10-main{overflow:visible;padding:10px}.m10-panels{flex-direction:column;gap:10px}.m10-left{width:100%;max-width:none;max-height:42vh;border-radius:14px}.m10-right{border:1px solid ${CI.border};border-radius:14px;min-height:360px;overflow:visible}.m10-stage{width:min(100%,720px);max-height:none}.m10-bottom{position:sticky;bottom:0;z-index:40;height:72px;min-height:72px;padding:0 10px}.m10-status{font-size:10px;padding:7px}.m10-quiz-wrap{overflow:visible}}
@media(max-width:560px){.m10-top{gap:5px}.m10-exit{padding:7px 9px;font-size:10px}.m10-tab{padding:0 10px}.m10-left{padding:18px}.m10-actions{grid-template-columns:1fr}.m10-stage-label{max-width:58%}.m10-tag{max-width:102px;white-space:normal;text-align:center}.m10-process{display:none}.m10-bottom{grid-template-columns:auto 1fr auto}.m10-status{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.m10-primary,.m10-secondary{padding:0 11px}.m10-quiz-body{padding:18px}.m10-quiz-head{padding:18px}}
@media(max-width:420px){.m10-brand span{display:none}.m10-exit span{display:none}.m10-stage{border-radius:10px}.m10-left h1{font-size:23px}.m10-counter{top:6px;right:6px}.m10-stage-label{top:6px;left:6px}}
@media(prefers-reduced-motion:reduce){.m10-ping{animation:none!important;display:none}.m10-progress-bar{transition:none!important}}
`;

const ACTION_ICONS: Record<IconKey, React.ComponentType<{ size?: number }>> = {
  heart: HeartHandshake, shield: ShieldCheck, scale: Scale, talk: MessageCircle,
  people: Users, file: FileText, phone: Phone, lock: LockKeyhole, eye: Eye,
};

const TONES: Record<Tone, { label: string; color: string; soft: string; Icon: React.ComponentType<{ size?: number }> }> = {
  respect: { label: 'Respect', color: CI.teal, soft: CI.tealSoft, Icon: HeartHandshake },
  protect: { label: 'Protect', color: '#19766c', soft: CI.tealSoft, Icon: ShieldCheck },
  consult: { label: 'Consult', color: CI.orangeDark, soft: CI.orangeSoft, Icon: HelpCircle },
  stop: { label: 'Stop / escalate', color: CI.red, soft: CI.redSoft, Icon: ShieldAlert },
};

const STORAGE_KEY = 'achc-art-m10-progress-v1';
type Mode = 'lesson' | 'quiz';
type Persisted = {
  schema: 1;
  pageIndex: number;
  mode: Mode;
  completedByPage: Record<number, string[]>;
  quizAnswers: Array<number | null>;
  quizIdx: number;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizFinished: boolean;
  attempts: number;
  lastScore: number | null;
  passed: boolean;
  completionReported: boolean;
};

const EMPTY_PROGRESS: Persisted = {
  schema: 1, pageIndex: 0, mode: 'lesson', completedByPage: {},
  quizAnswers: Array(QUIZ.length).fill(null), quizIdx: 0, quizSelected: null,
  quizSubmitted: false, quizFinished: false, attempts: 0, lastScore: null,
  passed: false, completionReported: false,
};

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value as number)) : fallback;
}

function sanitizeProgress(value: unknown): Persisted {
  if (!value || typeof value !== 'object' || (value as { schema?: unknown }).schema !== 1) return EMPTY_PROGRESS;
  const raw = value as Partial<Persisted>;
  const completedByPage: Record<number, string[]> = {};
  PAGES.forEach((page, index) => {
    const allowed = new Set(page.hotspots.map((h) => h.id));
    const source = raw.completedByPage?.[index];
    completedByPage[index] = Array.isArray(source)
      ? Array.from(new Set(source.filter((id): id is string => typeof id === 'string' && allowed.has(id))))
      : [];
  });
  const answers = Array.isArray(raw.quizAnswers) && raw.quizAnswers.length === QUIZ.length
    ? raw.quizAnswers.map((a) => Number.isInteger(a) && (a as number) >= 0 && (a as number) < 4 ? a as number : null)
    : Array(QUIZ.length).fill(null);
  const quizIdx = clampInt(raw.quizIdx, 0, QUIZ.length - 1, 0);
  const selected = Number.isInteger(raw.quizSelected) && (raw.quizSelected as number) >= 0 && (raw.quizSelected as number) < 4 ? raw.quizSelected as number : null;
  const finished = Boolean(raw.quizFinished) && answers.every((a) => a !== null);
  const score = answers.reduce<number>((sum, answer, i) => sum + (answer === QUIZ[i].correct ? 1 : 0), 0);
  const passed = finished && score >= Math.ceil(QUIZ.length * MODULE_META.passing / 100);
  const attempts = clampInt(raw.attempts, 0, 999, 0);
  return {
    schema: 1,
    pageIndex: clampInt(raw.pageIndex, 0, PAGES.length - 1, 0),
    mode: raw.mode === 'quiz' ? 'quiz' : 'lesson',
    completedByPage,
    quizAnswers: answers,
    quizIdx,
    quizSelected: finished ? null : selected,
    quizSubmitted: !finished && Boolean(raw.quizSubmitted) && selected !== null && answers[quizIdx] === selected,
    quizFinished: finished,
    attempts: finished ? Math.max(1, attempts) : attempts,
    lastScore: finished ? score : (Number.isInteger(raw.lastScore) ? clampInt(raw.lastScore, 0, QUIZ.length, score) : null),
    passed,
    completionReported: passed && Boolean(raw.completionReported),
  };
}

function loadProgress(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgress(progress: Persisted): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

type Commit = (
  update: Partial<Persisted> | ((current: Persisted) => Persisted),
) => Persisted;

function SourceChips({ refs }: { refs: string[] }) {
  return (
    <div className="m10-sources" aria-label="Source references">
      {refs.map((ref) => <span className="m10-source" key={ref}>{ref}</span>)}
    </div>
  );
}

function FeedbackBlock({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <section className="m10-feedback">
      <div className="m10-feedback-label"><Icon size={16} aria-hidden="true" />{label}</div>
      <p>{children}</p>
    </section>
  );
}

function HotspotDialog({
  hotspot,
  onClose,
  onMark,
}: {
  hotspot: Hotspot;
  onClose: () => void;
  onMark: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tone = TONES[hotspot.tone];

  useEffect(() => {
    closeRef.current?.focus();
  }, [hotspot.id]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
    ) ?? []).filter((element) => !element.hasAttribute('hidden'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="m10-dialog-bg"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="m10-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`m10-dialog-${hotspot.id}`}
        aria-describedby={`m10-dialog-desc-${hotspot.id}`}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        style={{ borderTop: `6px solid ${tone.color}` }}
      >
        <div className="m10-dialog-head">
          <h2 id={`m10-dialog-${hotspot.id}`}>{hotspot.shortLabel}</h2>
          <button ref={closeRef} className="m10-icon-button" type="button" onClick={onClose} aria-label="Close observation">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="m10-dialog-body">
          <p id={`m10-dialog-desc-${hotspot.id}`} className="m10-live">
            Review the observation, safe response, escalation path, documentation, and sources.
          </p>
          <div className="m10-source" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: tone.soft, color: tone.color }}>
            <tone.Icon size={15} aria-hidden="true" />{tone.label}
          </div>
          <FeedbackBlock label="What you observe" Icon={Eye}>{hotspot.observed}</FeedbackBlock>
          <FeedbackBlock label="Why it matters" Icon={Scale}>{hotspot.why}</FeedbackBlock>
          <FeedbackBlock label="Safe field action" Icon={ShieldCheck}>{hotspot.action}</FeedbackBlock>
          <FeedbackBlock label="Notify / escalate" Icon={Phone}>{hotspot.notify}</FeedbackBlock>
          <FeedbackBlock label="Document" Icon={FileText}>{hotspot.document}</FeedbackBlock>
          <SourceChips refs={hotspot.sourceRefs} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button className="m10-secondary" type="button" onClick={onClose}>Close</button>
            <button className="m10-primary" type="button" onClick={onMark}>
              <Check size={17} aria-hidden="true" />Mark observed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page }: { page: PageData }) {
  return (
    <section className="m10-left" aria-labelledby={`m10-title-${page.id}`}>
      <span className="m10-eyebrow">Lesson {page.id} of {MODULE_META.pages}</span>
      <h1 id={`m10-title-${page.id}`} tabIndex={-1}>{page.title}</h1>
      <p className="m10-subtitle">{page.subtitle}</p>
      <div className="m10-overview">{page.overview.map((text) => <p key={text}>{text}</p>)}</div>

      <details className="m10-details">
        <summary><Info size={18} aria-hidden="true" />Detailed guidance and mini-case</summary>
        <div className="m10-details-body">
          {page.details.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
              {section.bullets && <ul>{section.bullets.map((text) => <li key={text}>{text}</li>)}</ul>}
            </section>
          ))}
        </div>
      </details>

      <div className="m10-section-label">Field actions</div>
      <div className="m10-actions">
        {page.actions.map((action) => {
          const Icon = ACTION_ICONS[action.icon];
          return (
            <div className="m10-action" key={action.title}>
              <Icon size={21} aria-hidden="true" />
              <strong>{action.title}</strong>
              <span>{action.detail}</span>
            </div>
          );
        })}
      </div>

      <div className="m10-tip">
        <b>Field reminder</b>
        <p>{page.tip}</p>
      </div>
      <SourceChips refs={page.sourceLabels} />
    </section>
  );
}

function RightPanel({
  page,
  completed,
  onChangeCompleted,
  onContinue,
}: {
  page: PageData;
  completed: string[];
  onChangeCompleted: (ids: string[]) => void;
  onContinue: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const completionRef = useRef<HTMLDivElement>(null);
  const pendingCompletionFocus = useRef(false);
  const activeHotspot = useMemo(() => page.hotspots.find((hotspot) => hotspot.id === activeId) ?? null, [activeId, page]);
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const allComplete = completed.length === page.hotspots.length;
  const nextIncomplete = page.hotspots.find((hotspot) => !completedSet.has(hotspot.id))?.id;

  useEffect(() => {
    setActiveId(null);
  }, [page.id]);

  useEffect(() => {
    if (allComplete && pendingCompletionFocus.current) {
      pendingCompletionFocus.current = false;
      completionRef.current?.focus();
    }
  }, [allComplete]);

  function closeDialog() {
    const prior = activeId;
    setActiveId(null);
    window.requestAnimationFrame(() => {
      if (prior) triggerRefs.current[prior]?.focus();
    });
  }

  function markObserved(hotspot: Hotspot) {
    const next = completedSet.has(hotspot.id) ? completed : [...completed, hotspot.id];
    const finishesPage = next.length === page.hotspots.length;
    pendingCompletionFocus.current = finishesPage;
    onChangeCompleted(next);
    setActiveId(null);
    window.requestAnimationFrame(() => {
      if (!finishesPage) triggerRefs.current[hotspot.id]?.focus();
    });
  }

  function resetObservations() {
    setActiveId(null);
    onChangeCompleted([]);
    window.requestAnimationFrame(() => triggerRefs.current[page.hotspots[0]?.id]?.focus());
  }

  return (
    <section className="m10-right" aria-label={`Interactive scene for lesson ${page.id}`}>
      <div className="m10-stage">
        <img src={page.sceneImage} alt={page.sceneAlt} />
        <div className="m10-stage-label">
          <strong style={{ display: 'block', color: CI.teal, fontSize: 12 }}>FIELD SCENE {page.id}</strong>
          <span style={{ display: 'block', color: CI.ink, fontSize: 11, lineHeight: 1.35, marginTop: 2 }}>Select every marker to examine the safest response.</span>
        </div>
        <div className="m10-counter" aria-live="polite">
          <CheckCircle2 size={15} aria-hidden="true" />{completed.length} / {page.hotspots.length} observed
        </div>

        {page.hotspots.map((hotspot) => {
          const done = completedSet.has(hotspot.id);
          const tone = TONES[hotspot.tone];
          return (
            <button
              type="button"
              className="m10-hotspot"
              key={hotspot.id}
              ref={(element) => { triggerRefs.current[hotspot.id] = element; }}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => setActiveId(hotspot.id)}
              aria-label={`${done ? 'Reviewed' : 'Open'}: ${hotspot.label}`}
              aria-pressed={done}
              disabled={allComplete}
            >
              <span className="m10-orb" style={{ background: done ? CI.teal : tone.color }}>
                {!done && hotspot.id === nextIncomplete && <span className="m10-ping" aria-hidden="true" />}
                {done ? <Check size={22} aria-hidden="true" /> : <tone.Icon size={22} aria-hidden="true" />}
              </span>
              <span className="m10-tag">{hotspot.shortLabel}</span>
            </button>
          );
        })}

        <div className="m10-process" aria-hidden="true">
          {page.process.map((step, index) => (
            <React.Fragment key={step}>
              <span>{step}</span>{index < page.process.length - 1 && <b>›</b>}
            </React.Fragment>
          ))}
        </div>

        <button className="m10-reset" type="button" onClick={resetObservations} aria-label={`Reset observations for lesson ${page.id}`}>
          <RotateCcw size={15} aria-hidden="true" />Reset
        </button>

        {allComplete && (
          <div className="m10-complete" role="status">
            <div className="m10-complete-card" ref={completionRef} tabIndex={-1}>
              <CheckCircle2 size={42} color={CI.teal} aria-hidden="true" />
              <h2 style={{ color: CI.teal, margin: '8px 0 6px' }}>Scene reviewed</h2>
              <p style={{ lineHeight: 1.5, margin: '0 0 16px' }}>You examined all {page.hotspots.length} decision points. Continue when you are ready.</p>
              <button className="m10-primary" type="button" onClick={onContinue}>
                {page.id === PAGES.length ? 'Go to quiz' : 'Continue'}<ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {activeHotspot && (
          <HotspotDialog
            hotspot={activeHotspot}
            onClose={closeDialog}
            onMark={() => markObserved(activeHotspot)}
          />
        )}
      </div>
    </section>
  );
}

function QuizPage({
  progress,
  commit,
  onReviewLessons,
}: {
  progress: Persisted;
  commit: Commit;
  onReviewLessons: () => void;
}) {
  const question = QUIZ[progress.quizIdx];
  const feedbackRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const pendingQuestionFocus = useRef(false);
  const optionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const passMark = Math.ceil(QUIZ.length * MODULE_META.passing / 100);

  useEffect(() => {
    if (progress.quizFinished) {
      resultRef.current?.focus();
    } else if (pendingQuestionFocus.current) {
      pendingQuestionFocus.current = false;
      questionRef.current?.focus();
    }
  }, [progress.quizFinished, progress.quizIdx]);

  function choose(index: number) {
    if (progress.quizSubmitted) return;
    commit({ quizSelected: index });
  }

  function handleOptionKey(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (progress.quizSubmitted) return;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % 4;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + 3) % 4;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 3;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    window.requestAnimationFrame(() => optionRefs.current[next!]?.focus());
  }

  function submitAnswer() {
    if (progress.quizSelected === null) return;
    const answers = [...progress.quizAnswers];
    answers[progress.quizIdx] = progress.quizSelected;
    commit({ quizAnswers: answers, quizSubmitted: true });
    window.requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function moveQuestion(direction: -1 | 1) {
    const nextIndex = progress.quizIdx + direction;
    if (nextIndex < 0 || nextIndex >= QUIZ.length) return;
    const savedAnswer = progress.quizAnswers[nextIndex];
    pendingQuestionFocus.current = true;
    commit({
      quizIdx: nextIndex,
      quizSelected: savedAnswer,
      quizSubmitted: savedAnswer !== null,
    });
  }

  function finishAttempt() {
    if (!progress.quizSubmitted || progress.quizAnswers.some((answer) => answer === null)) return;
    const score = progress.quizAnswers.reduce<number>(
      (sum, answer, index) => sum + (answer === QUIZ[index].correct ? 1 : 0),
      0,
    );
    commit((current) => ({
      ...current,
      quizFinished: true,
      quizSelected: null,
      quizSubmitted: false,
      attempts: current.attempts + 1,
      lastScore: score,
      passed: score >= passMark,
    }));
  }

  function retake() {
    pendingQuestionFocus.current = true;
    commit((current) => ({
      ...current,
      quizAnswers: Array(QUIZ.length).fill(null),
      quizIdx: 0,
      quizSelected: null,
      quizSubmitted: false,
      quizFinished: false,
      lastScore: null,
      passed: false,
    }));
  }

  if (progress.quizFinished) {
    const score = progress.lastScore ?? 0;
    const percent = Math.round(score / QUIZ.length * 100);
    return (
      <main className="m10-quiz-wrap" role="tabpanel" id="m10-panel-quiz" aria-labelledby="m10-tab-quiz">
        <article className="m10-quiz-card">
          <div className="m10-quiz-head">
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em' }}>KNOWLEDGE CHECK · ATTEMPT {progress.attempts}</span>
            <h1 id="m10-quiz-heading" tabIndex={-1}>{MODULE_META.title}</h1>
            <div>Passing score: {MODULE_META.passing}% ({passMark} of {QUIZ.length})</div>
          </div>
          <div className="m10-quiz-body">
            <div className="m10-result" ref={resultRef} tabIndex={-1} aria-live="polite">
              <div className="m10-score" style={{ borderColor: progress.passed ? CI.tealMuted : '#FED7D7' }}>
                <strong>{percent}%</strong>
              </div>
              <h2>{progress.passed ? 'Knowledge check passed' : 'Attempt complete—not yet passed'}</h2>
              <p>
                You answered {score} of {QUIZ.length} correctly. {progress.passed
                  ? 'Your result is saved. This module does not issue a certificate or expand role, scope, or competency.'
                  : `Review the lessons and try again. You need at least ${passMark} correct answers to pass.`}
              </p>
              <div className="m10-note">
                Apply the field model: stabilize immediate risk, respect the patient’s voice, report through required routes, consult the verified chain, and document the closed loop.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button className="m10-secondary" type="button" onClick={onReviewLessons}>
                  <ArrowLeft size={17} aria-hidden="true" />Review lessons
                </button>
                {!progress.passed && (
                  <button className="m10-primary" type="button" onClick={retake}>
                    <RefreshCcw size={17} aria-hidden="true" />Retake quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>
    );
  }

  const selected = progress.quizSelected;
  const submitted = progress.quizSubmitted;
  const isCorrect = submitted && selected === question.correct;
  const activeTabStop = selected ?? 0;

  return (
    <main className="m10-quiz-wrap" role="tabpanel" id="m10-panel-quiz" aria-labelledby="m10-tab-quiz">
      <article className="m10-quiz-card">
        <div className="m10-quiz-head">
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em' }}>KNOWLEDGE CHECK · ATTEMPT {progress.attempts + 1}</span>
          <h1 id="m10-quiz-heading" tabIndex={-1}>{MODULE_META.title}</h1>
          <div>Passing score: {MODULE_META.passing}% ({passMark} of {QUIZ.length})</div>
          <div className="m10-progress-track" aria-hidden="true">
            <div className="m10-progress-bar" style={{ width: `${(progress.quizIdx + 1) / QUIZ.length * 100}%` }} />
          </div>
        </div>
        <div className="m10-quiz-body">
          <div className="m10-question-label">Question {progress.quizIdx + 1} of {QUIZ.length} · {question.kind}</div>
          <h2 className="m10-question" id={`m10-question-${question.id}`} tabIndex={-1} ref={questionRef}>{question.stem}</h2>
          <div className="m10-options" role="radiogroup" aria-labelledby={`m10-question-${question.id}`}>
            {question.options.map((option, index) => {
              const checked = selected === index;
              const className = [
                'm10-option',
                checked ? 'selected' : '',
                submitted && index === question.correct ? 'correct' : '',
                submitted && checked && index !== question.correct ? 'incorrect' : '',
              ].filter(Boolean).join(' ');
              return (
                <label className={className} key={option}>
                  <input
                    ref={(element) => { optionRefs.current[index] = element; }}
                    type="radio"
                    name={question.id}
                    value={index}
                    checked={checked}
                    disabled={submitted}
                    tabIndex={submitted ? -1 : (activeTabStop === index ? 0 : -1)}
                    onChange={() => choose(index)}
                    onKeyDown={(event) => handleOptionKey(event, index)}
                  />
                  <span className="m10-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {submitted && (
            <div className="m10-rationale" ref={feedbackRef} tabIndex={-1} role="status" aria-live="polite">
              <b>{isCorrect ? 'Correct' : 'Not correct'} · rationale</b>
              <p>{question.rationale}</p>
              <SourceChips refs={question.sourceRefs} />
            </div>
          )}

          <div className="m10-quiz-actions">
            <button className="m10-secondary" type="button" disabled={progress.quizIdx === 0} onClick={() => moveQuestion(-1)}>
              <ChevronLeft size={17} aria-hidden="true" />Previous
            </button>
            <div style={{ flex: 1 }} />
            {!submitted ? (
              <button className="m10-primary" type="button" disabled={selected === null} onClick={submitAnswer}>
                Check answer<Check size={17} aria-hidden="true" />
              </button>
            ) : progress.quizIdx < QUIZ.length - 1 ? (
              <button className="m10-primary" type="button" onClick={() => moveQuestion(1)}>
                Next question<ChevronRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <button className="m10-primary" type="button" onClick={finishAttempt}>
                Finish attempt<CheckCircle2 size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="m10-brand" aria-label="Care Indeed training">
      <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={28} height={28} style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
      <span>Care Indeed Learning</span>
    </div>
  );
}

export type HostAcknowledgement = void | boolean | Promise<void | boolean>;

export type ACHCARTM10Props = {
  onSaveExit?: (snapshot: Persisted) => HostAcknowledgement;
  onComplete?: (result: { moduleId: string; score: number; attempts: number }) => HostAcknowledgement;
};

function isPromiseAcknowledgement(value: HostAcknowledgement): value is Promise<void | boolean> {
  return Boolean(value) && typeof (value as Promise<void | boolean>).then === 'function';
}

export default function ACHCARTM10({ onSaveExit, onComplete }: ACHCARTM10Props) {
  const [progress, setProgress] = useState<Persisted>(() => loadProgress());
  const [saveStatus, setSaveStatus] = useState('');
  const progressRef = useRef<Persisted>(progress);
  const mountedRef = useRef(true);
  const completionDispatchRef = useRef(false);
  const pendingNavigationFocus = useRef(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const page = PAGES[progress.pageIndex];
  const pageCompleted = progress.completedByPage[progress.pageIndex] ?? [];

  const commit: Commit = (update) => {
    const current = progressRef.current;
    const candidate = typeof update === 'function' ? update(current) : { ...current, ...update };
    const next = sanitizeProgress(candidate);
    progressRef.current = next;
    if (mountedRef.current) setProgress(next);
    const saved = writeProgress(next);
    if (!saved && mountedRef.current) setSaveStatus('Progress is active in this session, but browser storage is unavailable.');
    return next;
  };

  useEffect(() => {
    mountedRef.current = true;
    const saveBeforeExit = () => { writeProgress(progressRef.current); };
    window.addEventListener('beforeunload', saveBeforeExit);
    return () => {
      mountedRef.current = false;
      writeProgress(progressRef.current);
      window.removeEventListener('beforeunload', saveBeforeExit);
    };
  }, []);

  useEffect(() => {
    if (!saveStatus) return;
    const timer = window.setTimeout(() => setSaveStatus(''), 6000);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    if (!pendingNavigationFocus.current) return;
    pendingNavigationFocus.current = false;
    window.requestAnimationFrame(() => {
      const target = progress.mode === 'lesson'
        ? document.getElementById(`m10-title-${PAGES[progress.pageIndex].id}`)
        : document.getElementById('m10-quiz-heading');
      target?.focus();
    });
  }, [progress.mode, progress.pageIndex]);

  useEffect(() => {
    if (
      !progress.quizFinished || !progress.passed || progress.completionReported ||
      progressRef.current.completionReported || completionDispatchRef.current || !onComplete
    ) return;
    completionDispatchRef.current = true;
    const confirmed = () => {
      commit({ completionReported: true });
    };
    const notConfirmed = () => {
      commit({ completionReported: false });
      completionDispatchRef.current = false;
      if (mountedRef.current) setSaveStatus('Your passing score is saved locally. Host completion reporting was not confirmed.');
    };
    try {
      const acknowledgement = onComplete({
        moduleId: MODULE_META.id,
        score: progress.lastScore ?? 0,
        attempts: progress.attempts,
      });
      if (isPromiseAcknowledgement(acknowledgement)) {
        void acknowledgement.then((value) => {
          if (value === false) notConfirmed();
          else confirmed();
        }, notConfirmed);
      } else if (acknowledgement === false) {
        notConfirmed();
      } else {
        confirmed();
      }
    } catch {
      notConfirmed();
    }
  }, [progress.quizFinished, progress.passed, progress.completionReported, progress.lastScore, progress.attempts, onComplete]);

  function goLesson(index: number, focusContent = false) {
    pendingNavigationFocus.current = focusContent;
    commit({ mode: 'lesson', pageIndex: Math.max(0, Math.min(PAGES.length - 1, index)) });
  }

  function goQuiz(focusContent = false) {
    pendingNavigationFocus.current = focusContent;
    commit({ mode: 'quiz' });
  }

  function continueFromLesson() {
    if (progress.pageIndex < PAGES.length - 1) goLesson(progress.pageIndex + 1, true);
    else goQuiz(true);
  }

  function saveAndExit() {
    const snapshot = progressRef.current;
    const saved = writeProgress(snapshot);
    if (!saved) {
      setSaveStatus('Browser storage is unavailable; keep this window open and contact your training administrator.');
      return;
    }
    if (onSaveExit) {
      const accepted = (value: void | boolean) => {
        if (!mountedRef.current) return;
        setSaveStatus(value === false
          ? 'Progress saved locally, but the host return action was not confirmed. You may close this module.'
          : 'Progress saved. The host accepted the return action.');
      };
      const rejected = () => {
        if (mountedRef.current) setSaveStatus('Progress saved locally, but the host return action was not confirmed. You may close this module.');
      };
      try {
        const acknowledgement = onSaveExit(snapshot);
        if (isPromiseAcknowledgement(acknowledgement)) {
          setSaveStatus('Progress saved. Waiting for host acknowledgement…');
          void acknowledgement.then(accepted, rejected);
        } else {
          accepted(acknowledgement);
        }
      } catch {
        rejected();
      }
    } else {
      setSaveStatus('Progress saved. You may safely close this module.');
    }
  }

  function activateTab(index: number) {
    if (index === PAGES.length) goQuiz();
    else goLesson(index);
  }

  function handleTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    const count = PAGES.length + 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + count - 1) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next === null) return;
    event.preventDefault();
    activateTab(next);
    window.requestAnimationFrame(() => tabRefs.current[next!]?.focus());
  }

  const activeTabIndex = progress.mode === 'quiz' ? PAGES.length : progress.pageIndex;
  const footerStatus = progress.mode === 'quiz'
    ? (progress.quizFinished
      ? `${progress.passed ? 'Passed' : 'Not yet passed'} · ${progress.lastScore ?? 0}/${QUIZ.length} · ${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'}`
      : `Question ${progress.quizIdx + 1} of ${QUIZ.length} · Attempt ${progress.attempts + 1}`)
    : `${pageCompleted.length} of ${page.hotspots.length} observations reviewed`;

  return (
    <div className="m10-shell">
      <style>{STYLES}</style>
      <header className="m10-top">
        <BrandMark />
        <nav className="m10-tabs" role="tablist" aria-label="Module lessons">
          {PAGES.map((lesson, index) => (
            <button
              className="m10-tab"
              type="button"
              role="tab"
              id={`m10-tab-lesson-${index}`}
              aria-controls="m10-panel-lesson"
              aria-selected={activeTabIndex === index}
              tabIndex={activeTabIndex === index ? 0 : -1}
              ref={(element) => { tabRefs.current[index] = element; }}
              onClick={() => goLesson(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
              key={lesson.id}
            >
              {lesson.id}. {lesson.shortName}
            </button>
          ))}
          <button
            className="m10-tab quiz"
            type="button"
            role="tab"
            id="m10-tab-quiz"
            aria-controls="m10-panel-quiz"
            aria-selected={activeTabIndex === PAGES.length}
            tabIndex={activeTabIndex === PAGES.length ? 0 : -1}
            ref={(element) => { tabRefs.current[PAGES.length] = element; }}
            onClick={() => goQuiz()}
            onKeyDown={(event) => handleTabKey(event, PAGES.length)}
          >
            Quiz
          </button>
        </nav>
        <button className="m10-exit" type="button" onClick={saveAndExit} aria-label="Save and exit">
          <Home size={16} aria-hidden="true" /><span>Save &amp; Exit</span>
        </button>
      </header>

      {progress.mode === 'lesson' ? (
        <main className="m10-main" role="tabpanel" id="m10-panel-lesson" aria-labelledby={`m10-tab-lesson-${progress.pageIndex}`}>
          <div className="m10-panels">
            <LeftPanel page={page} />
            <RightPanel
              page={page}
              completed={pageCompleted}
              onChangeCompleted={(ids) => commit({
                completedByPage: { ...progressRef.current.completedByPage, [progress.pageIndex]: ids },
              })}
              onContinue={continueFromLesson}
            />
          </div>
        </main>
      ) : (
        <QuizPage progress={progress} commit={commit} onReviewLessons={() => goLesson(PAGES.length - 1, true)} />
      )}

      <footer className="m10-bottom">
        {progress.mode === 'lesson' ? (
          <button className="m10-secondary prev" type="button" disabled={progress.pageIndex === 0} onClick={() => goLesson(progress.pageIndex - 1, true)}>
            <ChevronLeft size={17} aria-hidden="true" />Previous
          </button>
        ) : (
          <button className="m10-secondary prev" type="button" onClick={() => goLesson(PAGES.length - 1, true)}>
            <ChevronLeft size={17} aria-hidden="true" />Lessons
          </button>
        )}
        <div className="m10-status" aria-live="polite">{footerStatus}</div>
        {progress.mode === 'lesson' ? (
          <button className="m10-primary next" type="button" onClick={continueFromLesson}>
            {progress.pageIndex === PAGES.length - 1 ? 'Quiz' : 'Next'}<ChevronRight size={17} aria-hidden="true" />
          </button>
        ) : <span aria-hidden="true" />}
      </footer>

      {saveStatus && <div className="m10-save-toast" role="status" aria-live="polite">{saveStatus}</div>}
      <div className="m10-live" aria-live="polite">
        {progress.mode === 'lesson' ? `Lesson ${page.id}: ${page.title}` : `Knowledge check, question ${progress.quizIdx + 1}`}
      </div>
    </div>
  );
}
