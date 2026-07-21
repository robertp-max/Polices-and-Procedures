/**
 * ACHC-ART-M01 — Cultural Awareness & Cultural Humility
 * Version: 1.0.0 — PASS-5 production candidate
 * Pages: 7 scenes + Knowledge Check | Hotspots: 34 | Quiz: 10 | Pass: 80%
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Compass,
  Eye, FileText, Phone, RotateCcw, ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-self-awareness.png';
import img02 from './assets/lesson-02-beliefs-values-preferences.png';
import img03 from './assets/lesson-03-equitable-access.png';
import img04 from './assets/lesson-04-interpreter-teach-back.png';
import img05 from './assets/lesson-05-whole-person-household.png';
import img06 from './assets/lesson-06-respect-reporting.png';
import img07 from './assets/lesson-07-integrated-practice.png';

const CI = {
  teal: '#0F5B54', tealDark: '#0A423D', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeDark: '#A63D10', orangeButton: '#A94312',
  ink: '#2D3748', muted: '#5B687A', border: '#D8E0E8',
  red: '#B42318', redSoft: '#FEF2F2', white: '#FFFFFF', bg: '#F8FAFC',
} as const;

type PracticeTone = 'respectful' | 'pause' | 'harmful' | 'guidance';
type AuthorityKind =
  | 'Federal requirement'
  | 'Care Indeed policy'
  | 'Recommended practice'
  | 'Accessibility standard';

interface SourceRef { kind: AuthorityKind; text: string; }
interface Hotspot {
  id: string; label: string; shortLabel: string; x: number; y: number; tone: PracticeTone;
  observed: string; whyItMatters: string; safeAction: string; notify?: string;
  document: string; sourceRefs: SourceRef[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface DetailBlock { heading: string; paragraphs: string[]; bullets?: string[]; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  overview: string[]; details: DetailBlock[];
  keyPoints: [KeyPoint, KeyPoint, KeyPoint, KeyPoint];
  clinicalTip: string; sourceLabels: SourceRef[];
  sceneImage: string; sceneAlt: string; processSteps: string[]; hotspots: Hotspot[];
}
interface QuizQuestion {
  id: number; stem: string; options: [string, string, string, string];
  correct: number; rationale: string; sourceRefs: SourceRef[];
}

const TONE: Record<PracticeTone, { label: string; color: string; soft: string; icon: 'check' | 'alert' | 'stop' }> = {
  respectful: { label: 'Respectful action', color: CI.teal, soft: CI.tealSoft, icon: 'check' },
  pause: { label: 'Pause and inquire', color: CI.orangeDark, soft: '#FFF4ED', icon: 'alert' },
  harmful: { label: 'Stop and report', color: CI.red, soft: CI.redSoft, icon: 'stop' },
  guidance: { label: 'Field guidance', color: CI.tealDark, soft: '#F1F5F9', icon: 'check' },
};

const MODULE_META = {
  id: 'ACHC-ART-M01', title: 'Cultural Awareness & Cultural Humility',
  pages: 7, quizCount: 10, passing: 80,
} as const;

const agency = (text: string): SourceRef => ({ kind: 'Care Indeed policy', text });
const federal = (text: string): SourceRef => ({ kind: 'Federal requirement', text });
const practice = (text: string): SourceRef => ({ kind: 'Recommended practice', text });
const access = (text: string): SourceRef => ({ kind: 'Accessibility standard', text });

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Self-Awareness',
    title: 'Begin With Yourself: Culture, Humility & Bias',
    subtitle: 'Notice the assumption before it becomes an action',
    overview: [
      "A home visit begins at a threshold. The patient is inviting an employee into private space, routines, relationships, and decisions that already existed before the visit. Cultural humility starts by recognizing that power difference and entering as a respectful professional guest. Your clinical or operational role gives you responsibilities, but it does not make you the expert on what an individual patient values, how the patient wants to communicate, or who the patient wants involved.",
      "Culture is broader than race, ethnicity, or nationality. It may include language, faith, disability experience, gender, age, family and community relationships, economic conditions, migration history, work, neighborhood, education, health experiences, and personal identity. These influences can matter, but none of them predicts a particular person’s belief or behavior. The safe source is the patient, not a list of group traits.",
      "Cultural humility is an ongoing practice of self-reflection, respectful inquiry, attention to power, and willingness to repair mistakes. It is not a claim that one course makes a worker competent in every culture. In the field, humility becomes observable behavior: pause, separate facts from interpretation, ask a relevant neutral question, listen, confirm what you heard, and adapt within the current plan, order, role, and safety requirements.",
    ],
    details: [
      {
        heading: 'Awareness, competence, and humility are related—but different',
        paragraphs: [
          "Cultural awareness means recognizing that lived experience and social context can shape a care encounter. Cultural competence means having practical skills and organizational systems for respectful, accessible service. Cultural humility adds something essential: you continue learning, examine how your assumptions affect decisions, and invite the patient to correct you. The goal is not perfect knowledge about another group. The goal is a reliable way to work safely when you do not know.",
          "A memorized cultural rule can feel efficient, yet it easily becomes a stereotype. Statements such as “older adults dislike technology,” “this culture avoids eye contact,” or “that family always makes decisions together” replace assessment with prediction. Even when a pattern has been described in a population, it does not establish the preference, capacity, literacy, or intent of the person in front of you.",
        ],
      },
      {
        heading: 'Separate observation from inference',
        paragraphs: [
          "An observation is something you directly saw, heard, measured, or were told. An inference is the meaning you assign to it. “The patient looked toward the floor and paused before answering” is an observation. “The patient was evasive and disrespectful” is an interpretation. Interpretations may be wrong, and culturally loaded interpretations can affect pain response, adherence labels, education effort, scheduling, escalation, or whether a concern is taken seriously.",
          "Use a brief internal checkpoint: What did I actually observe? What story did my mind add? What else could explain this? What relevant question can I ask? A patient may look away because of glare, hearing effort, fatigue, anxiety, trauma, respect, pain, distraction, or personal habit. You do not need to identify the cultural explanation. You need to create enough safety and access for the patient to tell you what matters.",
        ],
        bullets: [
          'Describe behavior before assigning meaning.',
          'Ask only what is relevant to care, access, safety, and the patient’s stated preferences.',
          'Do not use identity, clothing, accent, home décor, or family composition as proof of a belief.',
          'Reassess your first conclusion when new information appears.',
        ],
      },
      {
        heading: 'Implicit associations and respectful repair',
        paragraphs: [
          "Implicit associations are quick mental links that can operate without deliberate intent. Having a quick association does not by itself define your character; acting on it without checking can harm service. Bias can appear as speaking more slowly but not more clearly, directing questions to a younger relative, assuming a patient cannot learn, spending less time with interpretation, treating a strong accent as low understanding, or documenting a refusal as “noncompliance” without the patient’s reason.",
          "When you make a mistake, repair it briefly and return attention to the patient. Try: “I may have made an assumption. Let me ask what works best for you,” or “Thank you for correcting me. How would you like me to address you?” Do not ask the patient to reassure you, explain an entire community, or manage your embarrassment. A concise correction, changed behavior, and accurate documentation are stronger than a long defense of your intent.",
        ],
      },
      {
        heading: 'Field sequence at the doorway',
        paragraphs: [
          "Before entering, confirm identity and introduce yourself in the manner required for your role. Ask permission to enter. Ask the patient’s preferred name and pronunciation when uncertain. Notice environmental or communication factors without treating them as cultural clues. If you need to move an object, adjust the room, include another person, or begin a procedure, explain why and ask. Patient dignity is protected through ordinary, repeated choices—not through ceremonial language.",
          "Document culture-related information only when it is relevant to care, access, patient preference, safety, or coordination. Record the patient’s own words when useful and avoid broad labels. If no barrier, request, refusal, or care-plan issue occurred, do not create a speculative cultural profile. The record should help the next worker provide individualized care, not preserve your theory about the patient.",
        ],
      },
    ],
    keyPoints: [
      { icon: '⏸️', title: 'Pause the story', detail: 'Notice the conclusion you reached before the patient answered.' },
      { icon: '👁️', title: 'Separate fact', detail: 'Describe what occurred before assigning meaning or motive.' },
      { icon: '💬', title: 'Ask the individual', detail: 'Use a relevant, neutral, open question instead of a group rule.' },
      { icon: '↩️', title: 'Repair respectfully', detail: 'Correct the mistake briefly, change course, and return focus to the patient.' },
    ],
    clinicalTip: 'Curiosity is respectful only when it serves care. The patient is not responsible for teaching you about an entire culture.',
    sourceLabels: [
      agency('OP-PA-004 — Cultural Competency in Service Delivery'),
      agency('CL-PR-001 — Patient Rights & Responsibilities'),
      practice('HHS National CLAS Standard 1'),
    ],
    sceneImage: img01,
    sceneAlt: 'A home-health field worker waits at an open doorway while an older patient welcomes her into his sunlit home; a tablet, nursing bag, shoe rack, cane, and family photographs are visible.',
    processSteps: ['Notice', 'Pause', 'Ask', 'Reflect'],
    hotspots: [
      {
        id: 'threshold', label: 'Permission at the threshold', shortLabel: 'Ask to Enter',
        x: 43, y: 72, tone: 'respectful',
        observed: 'The worker remains at the open doorway while the patient controls entry into the home.',
        whyItMatters: 'The home is the patient’s private space. Routine permission supports dignity and makes the power relationship visible.',
        safeAction: 'Introduce yourself, verify identity as required, explain the visit purpose, and ask permission before entering.',
        notify: 'Notify the agency if entry is refused or an access issue prevents the assigned visit; do not force entry.',
        document: 'Document only when refusal, access, delay, or another care issue affects the visit, using the patient’s words and objective facts.',
        sourceRefs: [federal('42 CFR § 484.50(c)(1)'), agency('CL-PR-001')],
      },
      {
        id: 'tablet', label: 'Observation before interpretation', shortLabel: 'Facts First',
        x: 28, y: 66, tone: 'pause',
        observed: 'The tablet is ready for the visit, but no cultural conclusion has been entered before the conversation.',
        whyItMatters: 'Premature labels can follow the patient through the record and influence later care.',
        safeAction: 'Record patient-specific facts, disclosed preferences, access needs, and actions—not a theory about a group.',
        notify: 'Ask the appropriate supervisor or clinician when a newly disclosed preference may affect the plan or assigned service.',
        document: 'Use specific, observation-based language and quote the patient when the exact words matter.',
        sourceRefs: [agency('CL-CD-001 — Clinical Documentation Standards'), agency('OP-PA-004')],
      },
      {
        id: 'patient-voice', label: 'Patient voice and communication comfort', shortLabel: 'Patient Voice',
        x: 76, y: 45, tone: 'respectful',
        observed: 'The patient is speaking from inside his home and may use eye contact, gesture, pace, or posture in an individual way.',
        whyItMatters: 'Body language alone does not establish understanding, respect, consent, or a cultural preference.',
        safeAction: 'Address the patient directly and ask what communication approach works best today.',
        document: 'Record a communication need or preference only when it is relevant to the visit or ongoing care.',
        sourceRefs: [practice('HHS National CLAS Standard 1'), agency('OP-PA-004')],
      },
      {
        id: 'shoe-rack', label: 'Household cue without assumption', shortLabel: 'Do Not Guess',
        x: 9, y: 73, tone: 'pause',
        observed: 'Several pairs of shoes are organized beside the doorway.',
        whyItMatters: 'An object may reflect habit, safety, weather, cleanliness, culture, or nothing relevant to care. It is not proof of a rule.',
        safeAction: 'If footwear matters to the visit, ask what the household prefers and explain any safety or infection-prevention limit.',
        document: 'Document only a relevant request, safety issue, agreed accommodation, or unresolved barrier.',
        sourceRefs: [agency('OP-PA-004'), agency('OP-PA-005 — Patient Property & Belongings')],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Preferences',
    title: 'Let the Patient Lead: Beliefs, Values, Family & Care Planning',
    subtitle: 'Learn what matters, then fit care safely around it',
    overview: [
      "The most reliable way to understand a patient’s preferences is to ask the patient. Respectful assessment does not require a worker to explore every aspect of identity. It focuses on information that may affect communication, participation, safety, scheduling, education, treatment, personal care, or the patient’s goals. Questions should be neutral, optional, and connected to a clear care purpose.",
      "A family member can be important without automatically becoming the decision-maker, interpreter, legal representative, or recipient of private information. A capable patient remains the primary participant unless the patient chooses otherwise or valid authority establishes a different arrangement. Ask how the patient wants each person involved instead of assigning a role based on age, gender, relationship, or who speaks first.",
      "Preferences belong in care when they are documented and incorporated through the proper plan and workflow. Field workers follow the current plan, orders, assignment, and role. When a newly disclosed practice may affect medication, nutrition, wound care, scheduling, safety, consent, or another treatment issue, preserve respect, pause as needed, and notify the appropriate supervisor or clinician. Do not independently redesign care.",
    ],
    details: [
      {
        heading: 'Ask questions that leave room for an individual answer',
        paragraphs: [
          "Useful prompts include: “What is most important to you during today’s visit?” “What language do you prefer for health information?” “Are there food practices, fasting periods, or restrictions we should consider?” “Are there religious or spiritual practices that affect the timing or manner of care?” “Who would you like included in discussion or decisions?” and “Is there anything about personal care that would help you feel more comfortable?”",
          "A respectful question does not promise that every request can be fulfilled. It creates accurate information for planning. Explain why you are asking, especially when the question is sensitive. A patient may decline to discuss a topic. Do not pressure for personal history that is unrelated to care, and do not document sensitive details merely because they are interesting.",
        ],
      },
      {
        heading: 'Family presence, support, and authority are not the same',
        paragraphs: [
          "Family structures vary, but variation never tells you who has legal authority. The patient may want a spouse to listen, an adult child to take notes, a friend to help with transportation, a faith leader to visit, or no one else involved. Ask the patient directly when possible. Presence in the room is not blanket permission to disclose all information, answer for the patient, interpret, consent, or change the plan.",
          "If the patient appears unable to participate or someone claims decision-making authority, follow the agency process for verifying the representative. A general annual-training module does not authorize a field worker to determine capacity or resolve legal status. Protect the patient, use the verified record, and contact the appropriate clinician or supervisor when authority is unclear.",
        ],
        bullets: [
          'Ask the patient whom they want present and what help they want from that person.',
          'Continue directing questions to the capable patient.',
          'Use a qualified interpreter when language assistance is needed; family support is a separate role.',
          'Escalate unclear consent, representative, or privacy authority instead of guessing.',
        ],
      },
      {
        heading: 'Traditional, complementary, and home practices',
        paragraphs: [
          "A patient may use teas, supplements, topical products, fasting, massage, prayer, traditional healers, or other personal practices. Do not ridicule the practice, call it superstition, approve it automatically, confiscate it, or recommend it outside your role. Ask what the product or practice is, how it is used, how often it is used, and what the patient hopes it will do. Listen for information relevant to the assigned service.",
          "When the practice could affect an order, medication, nutrition, wound, device, symptom, or safety risk, stay within the current plan. Protect the patient from immediate harm within role, pause a non-emergent action when necessary, and notify the appropriate clinician. Respect means the patient receives understandable information and a genuine choice; it does not mean the worker independently declares the practice safe or unsafe.",
        ],
      },
      {
        heading: 'Plan fit, refusal, and objective documentation',
        paragraphs: [
          "At start of care, authorized clinicians assess factors that affect care and integrate applicable preferences into the plan. Every assigned worker reviews the current record and follows documented accommodations. New information should move through the appropriate update process. Do not create side arrangements that conflict with orders, competency, infection prevention, privacy, or the patient’s authorized plan.",
          "A patient may refuse a visit, procedure, medication, recommendation, or family involvement. Do not coerce, shame, bargain, threaten service, or label the patient “difficult.” Explain consequences only within your role and in a language and manner the patient can understand. Honor the refusal, protect immediate safety, notify according to the applicable workflow, and document the offered care, the patient’s stated reason, education, notification, instructions, and outcome.",
        ],
      },
    ],
    keyPoints: [
      { icon: '🎯', title: 'Elicit preferences', detail: 'Ask relevant questions that allow the patient to define what matters.' },
      { icon: '🗣️', title: 'Preserve the voice', detail: 'Include family in the way the capable patient requests.' },
      { icon: '📋', title: 'Follow the plan', detail: 'Apply documented preferences within current orders, assignment, and role.' },
      { icon: '📞', title: 'Escalate conflict', detail: 'Do not independently redesign treatment or resolve legal authority.' },
    ],
    clinicalTip: '“Who would you like involved, and how?” is safer than assuming the person who speaks first is the decision-maker.',
    sourceLabels: [
      agency('OP-PA-004 — Cultural Competency in Service Delivery'),
      agency('CL-PR-001 — Patient Rights & Responsibilities'),
      federal('42 CFR § 484.50(c)(4)'),
    ],
    sceneImage: img02,
    sceneAlt: 'A field worker listens while an older patient leads a care-planning discussion at her dining table with an adult son present; a care folder, tablet, meal, pill organizer, notebook, and calendar are visible.',
    processSteps: ['Ask', 'Confirm', 'Integrate', 'Document'],
    hotspots: [
      {
        id: 'patient-leads', label: 'Patient leads the discussion', shortLabel: 'Patient Leads',
        x: 53, y: 37, tone: 'respectful',
        observed: 'The patient speaks while both the worker and support person listen.',
        whyItMatters: 'A capable patient remains the primary participant even when a family member is helpful.',
        safeAction: 'Ask what matters today and how the patient wants the support person involved.',
        document: 'Record a relevant preference or participation request in patient-specific language.',
        sourceRefs: [federal('42 CFR § 484.50(c)(4)'), agency('CL-PR-001')],
      },
      {
        id: 'support-person', label: 'Chosen family support', shortLabel: 'Family Role',
        x: 83, y: 45, tone: 'pause',
        observed: 'An adult son is present and listening, but his authority has not been assumed.',
        whyItMatters: 'Support, interpretation, consent, representation, and permission to receive information are different functions.',
        safeAction: 'Confirm the patient’s requested role for the family member and use verified authority for decisions or disclosures.',
        notify: 'Contact the supervisor or appropriate clinician if authority, consent, or privacy status is unclear.',
        document: 'Document the patient’s participation preference and any verified representative status used.',
        sourceRefs: [agency('CL-PR-001'), federal('42 CFR § 484.50(b)')],
      },
      {
        id: 'care-folder', label: 'Current care plan', shortLabel: 'Current Plan',
        x: 14, y: 76, tone: 'guidance',
        observed: 'The closed folder represents the current authorized plan and documented preferences.',
        whyItMatters: 'A newly disclosed preference does not authorize a field worker to revise an order or plan independently.',
        safeAction: 'Follow the current plan when safe and route new information through the proper update process.',
        notify: 'Notify the appropriate clinician when the preference affects ordered care or requires plan review.',
        document: 'Record the new information, action taken, notification, and instructions received.',
        sourceRefs: [agency('OP-PA-004'), agency('CL-CD-001')],
      },
      {
        id: 'meal', label: 'Food practice and daily routine', shortLabel: 'Ask, Don’t Assume',
        x: 53, y: 61, tone: 'pause',
        observed: 'A meal is present during the discussion, but its meaning and relevance are unknown.',
        whyItMatters: 'Food choices may reflect preference, resources, routine, culture, medical advice, or convenience. The image does not answer the question.',
        safeAction: 'Ask only what is relevant to nutrition, medication timing, fasting, or the plan; avoid judging the food by appearance.',
        notify: 'Notify the appropriate clinician when a disclosed practice may conflict with ordered nutrition or medication care.',
        document: 'Record the patient’s statement, relevant education, decision, and escalation—not a cultural generalization.',
        sourceRefs: [agency('OP-PA-004')],
      },
      {
        id: 'pill-organizer', label: 'Product or medication practice', shortLabel: 'Clarify Use',
        x: 34, y: 84, tone: 'guidance',
        observed: 'A pill organizer is visible; the worker does not know who fills it or what other products the patient uses.',
        whyItMatters: 'Assuming medication management or approving a home product can create safety and scope risk.',
        safeAction: 'Ask neutral questions, follow the assigned task and current orders, and escalate clinically relevant discrepancies.',
        notify: 'Notify the supervising clinician of medication, supplement, or traditional-product concerns within the applicable workflow.',
        document: 'Record the reported product or practice, observed discrepancy, patient response, notification, and follow-up.',
        sourceRefs: [agency('OP-PA-004'), agency('CL-CD-001')],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Equitable Access',
    title: 'Equity in Practice: CLAS, Access & Communication Needs',
    subtitle: 'Equal treatment is not meaningful access when barriers differ',
    overview: [
      "Giving every patient the same information is not equitable when some patients cannot understand, hear, see, read, process, or use it. Meaningful access means the patient receives timely information in a language and format that supports real participation. The appropriate response may include qualified interpretation, written translation, plain language, large print, audio, electronic text, captioning, sign-language interpretation, communication devices, adapted pacing, reduced noise, visual demonstration, or another suitable aid.",
      "The National CLAS Standards provide a recommended organizational blueprint for effective, understandable, respectful care that responds to cultural health beliefs, languages, health literacy, and communication needs. CLAS is not a list of legal cultural facts, and it should not be labeled as an independent federal mandate in every detail. Binding home-health patient-rights rules separately require understandable, accessible, timely information and no-cost language services and auxiliary aids in the circumstances described by the regulation.",
      "Barriers overlap. A patient may use conversational English yet need an interpreter for consent or complex education. A patient with low vision may also have limited health literacy. Anxiety, cognitive change, hearing loss, background noise, technology failure, or an inaccessible handout may combine. The safe response is to identify the actual barrier, arrange the appropriate access method, confirm understanding, and report when access fails.",
    ],
    details: [
      {
        heading: 'Equality, equity, and individualized access',
        paragraphs: [
          "Equality means distributing the same English handout to everyone. Equity means the patient receives information in a usable language, reading level, medium, and communication method. Equity does not lower the standard of care. It supplies the access needed to reach the same meaningful opportunity to understand, participate, ask questions, and make choices.",
          "Avoid equating language, literacy, disability, education, or accent with intelligence. Do not speak to a companion instead of a capable patient because communication takes longer. Do not skip education, shorten a visit, or document “patient understood” because an access method was inconvenient. Time pressure is an operational issue to escalate, not permission to reduce the patient’s rights.",
        ],
      },
      {
        heading: 'Identify the communication need accurately',
        paragraphs: [
          "Review the documented preferred spoken and written language before the visit and confirm it with the patient. Ask about preferred communication methods rather than selecting one based on appearance. A Deaf patient may or may not use American Sign Language. A blind patient may prefer audio, electronic text, large print, or another method rather than Braille. A person using a walker does not necessarily have a communication disability.",
          "For complex communication, consider the nature, length, context, and importance of the information. Medication changes, rights, consent, symptom escalation, and a new care plan demand more reliable access than a simple greeting. When you are unsure which aid or service is appropriate, use the agency workflow and contact the designated supervisor rather than improvising.",
        ],
        bullets: [
          'Confirm preferred spoken and written language.',
          'Ask the patient’s usual effective communication method.',
          'Match the aid to the complexity and context of the discussion.',
          'Protect privacy when using remote technology or support people.',
          'Do not ask the patient to pay for required language services or auxiliary aids.',
        ],
      },
      {
        heading: 'Prepare before the visit',
        paragraphs: [
          "Pre-visit preparation prevents access from becoming an afterthought. Review the record, arrange a qualified interpreter or auxiliary aid, select appropriate materials, charge and test devices, confirm connectivity, and know the backup method. If a translated document is required, use approved current material. Do not rely on an unreviewed machine translation for critical, technical, rights-related, or complex content.",
          "Arrange the environment when possible: reduce television noise, improve lighting, position yourself so the patient can see your face, keep the aid within reach, and allow processing time. These changes should support—not replace—the qualified service or aid required for the encounter.",
        ],
      },
      {
        heading: 'When access fails',
        paragraphs: [
          "A frozen video feed, inaudible telephone interpreter, missing translation, broken hearing device, or inaccessible document can make communication unreliable. Do not pretend the service occurred. Pause non-emergent complex education or consent, protect immediate safety, reconnect or use the approved backup, and notify according to agency workflow. Emergencies may require temporary communication measures while qualified help is being obtained, but the exception does not become the routine plan.",
          "Document the access method actually used, any failure, corrective action, patient response, and follow-up. An access failure may be a service, safety, compliance, or patient-rights concern. Reporting it allows the agency to correct the system rather than leaving the next worker to encounter the same barrier.",
        ],
      },
    ],
    keyPoints: [
      { icon: '🔎', title: 'Identify the barrier', detail: 'Confirm language, format, sensory, literacy, and environmental needs.' },
      { icon: '🗓️', title: 'Arrange access early', detail: 'Prepare the qualified service, aid, materials, technology, and backup.' },
      { icon: '🧩', title: 'Match the format', detail: 'Use a method suitable for the person and the complexity of the message.' },
      { icon: '🚩', title: 'Escalate failure', detail: 'Do not substitute incomplete communication for meaningful access.' },
    ],
    clinicalTip: 'Conversational English does not prove that a patient can understand complex health information, rights, or consent.',
    sourceLabels: [
      federal('42 CFR § 484.50(a)(1)(i), (f)'),
      agency('OP-PA-003 — Interpreter & Language Access Services'),
      practice('HHS National CLAS Standards 1 and 5–8'),
    ],
    sceneImage: img03,
    sceneAlt: 'A home-health field worker and an older patient with low vision compare accessible materials at a table; a large-print sheet, tablet, magnifier, telephone, glasses, walker, and small-print page are visible.',
    processSteps: ['Identify', 'Arrange', 'Adapt', 'Confirm'],
    hotspots: [
      {
        id: 'patient-format', label: 'Patient-selected communication format', shortLabel: 'Ask Preference',
        x: 69, y: 38, tone: 'respectful',
        observed: 'The patient actively indicates which material is usable.',
        whyItMatters: 'The person’s usual method and the communication context guide effective access; disability does not dictate one universal format.',
        safeAction: 'Ask what works, consider the complexity of the message, and arrange the suitable aid or service.',
        document: 'Record the communication need, aid or service used, patient response, and unresolved barrier.',
        sourceRefs: [federal('42 CFR § 484.50(f)(1)'), access('ADA effective-communication principles')],
      },
      {
        id: 'large-print', label: 'Large-print material', shortLabel: 'Usable Format',
        x: 53, y: 58, tone: 'guidance',
        observed: 'A large-format page with strong visual spacing is being reviewed together.',
        whyItMatters: 'Providing information is not enough if the patient cannot perceive or use it.',
        safeAction: 'Use approved accessible material and explain it in plain language; do not assume large print alone solves every barrier.',
        document: 'Identify the material and format used and how understanding was confirmed.',
        sourceRefs: [federal('42 CFR § 484.50(f)'), practice('HHS National CLAS Standard 8')],
      },
      {
        id: 'magnifier', label: 'Auxiliary aid', shortLabel: 'Auxiliary Aid',
        x: 50, y: 80, tone: 'respectful',
        observed: 'A magnifier is available as one possible aid.',
        whyItMatters: 'Auxiliary aids support equitable participation and must fit the individual and the communication task.',
        safeAction: 'Offer the appropriate aid through the agency process and keep the patient—not the device—at the center of communication.',
        notify: 'Report when the requested or necessary aid is unavailable or ineffective.',
        document: 'Record the aid offered, accepted or declined, effectiveness, and escalation.',
        sourceRefs: [federal('42 CFR § 484.50(f)(1)')],
      },
      {
        id: 'walker', label: 'Disability without communication assumption', shortLabel: 'Do Not Conflate',
        x: 91, y: 67, tone: 'pause',
        observed: 'A walker supports mobility; it does not identify the patient’s preferred communication method or cognitive ability.',
        whyItMatters: 'Mobility, sensory access, cognition, literacy, and language are distinct factors that may or may not overlap.',
        safeAction: 'Assess the actual need and speak directly to the patient.',
        document: 'Record functional or access information relevant to the assigned service, not assumptions based on equipment.',
        sourceRefs: [agency('OP-PA-004'), access('ADA effective-communication principles')],
      },
      {
        id: 'phone-backup', label: 'Remote access backup', shortLabel: 'Backup Ready',
        x: 9, y: 75, tone: 'guidance',
        observed: 'A telephone is available if another remote method fails.',
        whyItMatters: 'A prepared backup reduces pressure to use an unqualified person or skip complex communication.',
        safeAction: 'Know the approved backup method before the visit and verify audio privacy and quality.',
        notify: 'Report repeated technology or service failure through the appropriate agency route.',
        document: 'Record the modality actually used, service identifier when available, failure, and correction.',
        sourceRefs: [agency('OP-PA-003'), federal('45 CFR § 92.201, where applicable')],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Language Access',
    title: 'Make Meaning Accurate: Qualified Interpreters & Teach-Back',
    subtitle: 'Speak to the patient, protect meaning, and verify understanding',
    overview: [
      "A qualified interpreter protects accuracy, privacy, and the patient’s independent decision-making. The interpreter is not a family spokesperson, decision-maker, witness, or substitute clinician. The field worker remains responsible for the encounter: arrange the service, introduce roles, speak directly to the patient, use clear language, pause for interpretation, respond to questions, and confirm understanding.",
      "Current federal rules for covered entities restrict reliance on unqualified adults, children, and unqualified staff. A minor may be used only as a temporary measure during an imminent emergency while a qualified interpreter is being found, followed by qualified confirmation or supplementation. The adult-companion exception is also narrow and includes conditions that field workers should not improvise. Use the qualified-interpreter workflow and contact the supervisor if an exception is proposed.",
      "Teach-back is not a test of the patient. It checks whether the information was explained in an understandable way. Ask the patient, through the interpreter, to describe the instruction in their own words or demonstrate the next step. If the response is incomplete, reteach differently and repeat. Document the actual response rather than writing only “verbalized understanding.”",
    ],
    details: [
      {
        heading: 'Before and at the start of the encounter',
        paragraphs: [
          "Confirm the preferred language and interpreter need before the visit. Arrange the qualified in-person, audio, or video service; verify the device, battery, signal, privacy, and backup method. Do not ask the patient to locate an interpreter or pay for required assistance. If the record and the patient’s stated preference differ, clarify respectfully and update the appropriate team member.",
          "Greet and identify the patient first. Introduce the interpreter and explain the role. Record the interpreter’s name or identifier and modality when available. Position the device so communication is clear and private. Address the patient in first person: “How are you feeling?” rather than telling the interpreter, “Ask him how he feels.” Maintain attention toward the patient.",
        ],
      },
      {
        heading: 'During the interpreted conversation',
        paragraphs: [
          "Use short, complete statements and one concept at a time. Avoid unexplained abbreviations, slang, idioms, jokes, side conversations, or requests that the interpreter “summarize.” Pause so the full message can be interpreted. Allow the patient to finish, ask questions, and correct information. The interpreter should transmit meaning accurately and impartially, not answer for the patient or decide what information matters.",
          "If connection quality prevents reliable communication, say so, stop the non-emergent complex discussion, reconnect, or use the approved backup. Do not proceed with consent, rights information, medication teaching, or other important communication merely because nodding appears agreeable. Nodding can reflect politeness, uncertainty, partial understanding, or a wish to continue; it is not a reliable comprehension check.",
        ],
      },
      {
        heading: 'Family, friends, minors, and bilingual staff',
        paragraphs: [
          "A bilingual family member may remain as support if the patient wants, but support does not automatically make the person the interpreter. Do not default to relatives because they are convenient. They may omit sensitive information, change tone, answer for the patient, lack clinical vocabulary, or have their own interests. Never rely on a minor for routine clinical communication.",
          "A staff member who speaks a language socially is not necessarily a qualified interpreter or qualified bilingual worker. Use staff only when the agency has designated and verified the role and competence. When a patient declines offered language assistance, respect the refusal, document the offer and response, and use the safe escalation path if meaningful understanding remains uncertain. The patient’s refusal does not authorize the worker to invent a substitute.",
        ],
      },
      {
        heading: 'Teach-back and defensible documentation',
        paragraphs: [
          "Frame teach-back as your responsibility: “I want to make sure I explained this clearly. Please show me how you will use the organizer tomorrow,” or “Please tell me in your own words when you will call the agency.” Through the interpreter, listen to the patient’s answer. Correct only the missing or inaccurate part, use a different explanation or visual method, and check again.",
          "Document the language used; interpreter name or ID; in-person, audio, or video modality; topics communicated; translated or accessible materials supplied; the patient’s teach-back or demonstration; any refusal or technology failure; reteaching; notification; and follow-up. A note such as “family translated, patient understood” is not enough to show accurate access or understanding.",
        ],
      },
    ],
    keyPoints: [
      { icon: '🎧', title: 'Arrange qualified help', detail: 'Prepare the service, privacy, technology, and backup before complex communication.' },
      { icon: '👤', title: 'Address the patient', detail: 'Speak in first person and keep the patient—not the interpreter—at the center.' },
      { icon: '🔁', title: 'Use teach-back', detail: 'Check your explanation by hearing or seeing what the patient understood.' },
      { icon: '📝', title: 'Record access', detail: 'Document language, interpreter, modality, teaching, response, and follow-up.' },
    ],
    clinicalTip: 'A child who “translates all the time” is still not the routine interpreter. Pause and connect the qualified service.',
    sourceLabels: [
      agency('OP-PA-003 — Interpreter & Language Access Services'),
      federal('42 CFR § 484.50(f)(2)'),
      federal('45 CFR § 92.201, where applicable'),
      agency('CL-SD-017 — Patient Education & Self-Management'),
    ],
    sceneImage: img04,
    sceneAlt: 'A field worker speaks directly with an older patient during a home visit while a qualified interpreter appears on a tablet; a family supporter sits nearby and the patient uses a pill organizer and pictorial schedule for teach-back.',
    processSteps: ['Connect', 'Speak Directly', 'Teach-Back', 'Record'],
    hotspots: [
      {
        id: 'interpreter', label: 'Qualified video interpreter', shortLabel: 'Qualified Help',
        x: 38, y: 65, tone: 'respectful',
        observed: 'A professional interpreter is connected by video and positioned between worker and patient.',
        whyItMatters: 'Qualified interpretation supports accuracy, privacy, and independent decision-making.',
        safeAction: 'Introduce the interpreter, confirm audio and video quality, and record the interpreter ID and modality when available.',
        notify: 'Use the approved backup and report the issue if connection quality prevents meaningful access.',
        document: 'Language, interpreter name or ID, modality, connection issue, correction, and topics communicated.',
        sourceRefs: [agency('OP-PA-003'), federal('45 CFR § 92.201(b)–(c), where applicable')],
      },
      {
        id: 'direct', label: 'Direct patient communication', shortLabel: 'Speak to Patient',
        x: 67, y: 44, tone: 'respectful',
        observed: 'The worker faces and addresses the patient while the interpreter transmits the exchange.',
        whyItMatters: 'The patient remains the participant and decision-maker; the interpreter does not replace the relationship.',
        safeAction: 'Use first person, short complete statements, plain language, and pauses.',
        document: 'Record relevant patient questions and responses, not a conversation with the interpreter as though the patient were absent.',
        sourceRefs: [practice('HHS National CLAS Standards 5–8'), agency('OP-PA-003')],
      },
      {
        id: 'family', label: 'Family support is not interpretation', shortLabel: 'Separate Roles',
        x: 91, y: 49, tone: 'pause',
        observed: 'An adult family member is present as support but is not interpreting.',
        whyItMatters: 'Presence or bilingual ability does not automatically establish interpreter qualification, authority, or permission to answer.',
        safeAction: 'Ask the patient how the family member should participate and continue using the qualified interpreter.',
        notify: 'Contact the supervisor if an adult-companion exception is requested; do not decide the legal conditions independently.',
        document: 'Patient preference for family involvement and the qualified language service used.',
        sourceRefs: [federal('45 CFR § 92.201(e), where applicable'), agency('CL-PR-001')],
      },
      {
        id: 'teachback', label: 'Teach-back demonstration', shortLabel: 'Teach-Back',
        x: 58, y: 76, tone: 'guidance',
        observed: 'The patient points to a pictorial schedule and organizes medication as a demonstration.',
        whyItMatters: 'Demonstration shows what the patient understood and reveals what the worker should reteach.',
        safeAction: 'Ask the patient to explain or demonstrate in their own way; reteach differently if needed and check again.',
        notify: 'Notify the appropriate clinician when the patient cannot safely demonstrate a critical instruction after reteaching.',
        document: 'The exact teach-back response, gaps, reteaching method, second response, and follow-up.',
        sourceRefs: [agency('CL-SD-017'), practice('AHRQ Teach-Back Method')],
      },
      {
        id: 'backup-phone', label: 'Backup language-access method', shortLabel: 'Backup',
        x: 43, y: 38, tone: 'guidance',
        observed: 'A telephone remains available if the video connection becomes unusable.',
        whyItMatters: 'A backup prevents pressure to substitute a child, unqualified adult, or incomplete communication.',
        safeAction: 'Switch through the approved workflow when video quality fails; keep the patient informed.',
        notify: 'Report recurring vendor, device, or connectivity failures.',
        document: 'Failure time, backup modality, interpreter identifier, delay, and care impact.',
        sourceRefs: [agency('OP-PA-003'), federal('42 CFR § 484.50(f)(2)')],
      },
    ],
  },
  {
    id: 4,
    shortName: 'Whole Person',
    title: 'Respect in the Home: Identity, Ability & Household Life',
    subtitle: 'Ask what matters without turning identity into a prediction',
    overview: [
      "Religious or spiritual practice, gender, disability, age, household routine, and personal identity may affect how a patient experiences care. They do not provide a script. Two people who use the same language, follow the same faith, share a diagnosis, or live in the same household may want entirely different things. The field worker’s task is to ask the individual, accommodate when feasible, protect safety and role boundaries, and update the care team.",
      "Accommodation is collaborative. A prayer pause, preferred form of address, privacy request, same-gender caregiver preference, communication aid, entry custom, meal schedule, or family-participation request may be workable. A worker may acknowledge and route the request without promising a staffing or clinical outcome. If a preference conflicts with an order, time-sensitive risk, PPE, infection prevention, or another safety standard, explain the concern respectfully and escalate.",
      "Disability is not merely a cultural trait, and age is not proof of cognition, literacy, technology skill, family role, or decision-making ability. Ask the patient’s preferred method and assess the actual barrier. Speak to the patient unless valid authority or the patient’s requested participation says otherwise. Do not make a companion the default voice because communication takes more time.",
    ],
    details: [
      {
        heading: 'Religious and spiritual practices',
        paragraphs: [
          "Ask whether prayer, fasting, sacred items, modesty, treatment timing, or end-of-life practices affect the assigned visit. Do not initiate prayer, impose your beliefs, debate theology, or assume a visible item has a particular meaning. If the patient requests a brief pause and it is clinically safe, respect it. If timing affects medication, nutrition, wound care, or another order, do not create a new schedule independently.",
          "Clarify what the patient wants, provide role-appropriate information in an understandable way, and notify the appropriate clinician. A patient may ultimately accept, modify, or refuse care. Preserve choice without hiding risk or using pressure. Record the patient’s request and decision rather than labeling the religion as the problem.",
        ],
      },
      {
        heading: 'Gender, name, privacy, and caregiver preference',
        paragraphs: [
          "Use the patient’s stated name and respectful form of address. If you make a mistake, correct it briefly and continue. Ask before exposing the body, moving clothing, opening a private area, or inviting another person into personal care. Explain the procedure and preserve privacy as the home environment allows.",
          "A patient may request a same-gender worker for personal care. Acknowledge the request and send it to scheduling or the supervisor. Explain that the agency will consider the request when feasible; do not promise reassignment before it is confirmed, ridicule the preference, retaliate, or delay urgent safety care. Document what was requested and the action taken when relevant to coordination.",
        ],
      },
      {
        heading: 'Disability and effective communication',
        paragraphs: [
          "Ask the patient which communication method works best. Do not assume all Deaf or hard-of-hearing people use sign language, all blind people use Braille, all people with speech differences lack understanding, or all disabled patients want relatives to speak for them. The appropriate aid depends on the person and the nature, length, complexity, and context of the exchange.",
          "Give the patient time to use the method. Position yourself for visibility, reduce background noise, keep devices accessible, and confirm understanding. These environmental steps may support—but do not replace—a qualified interpreter or auxiliary aid required for the encounter.",
        ],
      },
      {
        heading: 'Age, household practice, and safe limits',
        paragraphs: [
          "Generational labels are not assessments. Avoid claims that older adults resist technology, younger adults understand apps, or a particular age group communicates in one way. Ask about experience and preference. A patient may be highly skilled with one device and unfamiliar with another. Demonstrate without patronizing, allow practice, and use teach-back.",
          "Treat the home and property with respect. Ask before moving furniture, photographs, religious items, mobility equipment, food, or personal belongings. When an entry custom conflicts with required footwear, PPE, bag technique, or infection prevention, explain the safety reason and look for a respectful compliant option. If the conflict cannot be resolved within role, stop as needed and call the appropriate supervisor.",
        ],
        bullets: [
          'Ask what the individual wants; do not infer from identity or objects.',
          'Accommodate when feasible and within the current plan and safety rules.',
          'Route scheduling and care-plan requests without promising an outcome.',
          'Document the request, explanation, decision, notification, and result.',
        ],
      },
    ],
    keyPoints: [
      { icon: '❓', title: 'Ask the person', detail: 'Identity categories never replace an individual preference check.' },
      { icon: '🤝', title: 'Accommodate', detail: 'Honor feasible requests within current care, safety, and role limits.' },
      { icon: '🛡️', title: 'Protect boundaries', detail: 'Do not override an order, PPE rule, privacy duty, or assigned role.' },
      { icon: '🔗', title: 'Update the team', detail: 'Route new preferences and unresolved conflicts through the right workflow.' },
    ],
    clinicalTip: 'Acknowledge a preference without promising an outcome: “I hear the request. I will send it to scheduling and document what you asked.”',
    sourceLabels: [
      agency('OP-PA-004 — Cultural Competency in Service Delivery'),
      agency('CL-PR-001 — Patient Rights & Responsibilities'),
      federal('42 CFR § 484.50(c), (f)'),
      access('ADA effective-communication principles'),
    ],
    sceneImage: img05,
    sceneAlt: 'A field worker listens to an older patient in her home while a chosen support person sits nearby; a household schedule, communication aid, privacy screen, shoe rack, closed care case, and quiet reflection area are visible.',
    processSteps: ['Ask', 'Accommodate', 'Protect', 'Update'],
    hotspots: [
      {
        id: 'schedule', label: 'Household and spiritual schedule', shortLabel: 'Ask Timing',
        x: 46, y: 18, tone: 'pause',
        observed: 'A household calendar shows time blocks, but the reason for them is not visible.',
        whyItMatters: 'A schedule may reflect prayer, meals, sleep, work, caregiving, appointments, or preference. Do not guess.',
        safeAction: 'Ask whether timing affects the visit and route any care-plan or scheduling change through the proper workflow.',
        notify: 'Notify scheduling or the appropriate clinician when the request affects assigned timing or ordered care.',
        document: 'Patient’s stated timing preference, reason if the patient chooses to share it, action, and confirmed plan.',
        sourceRefs: [agency('OP-PA-004')],
      },
      {
        id: 'hearing-aid', label: 'Preferred communication aid', shortLabel: 'Communication Aid',
        x: 43, y: 55, tone: 'respectful',
        observed: 'A personal hearing amplifier is available on the side table.',
        whyItMatters: 'The patient—not age or appearance—identifies whether the aid is useful.',
        safeAction: 'Ask permission and how the patient prefers to use the aid; assess whether additional assistance is required.',
        notify: 'Report when the necessary communication method is unavailable or ineffective.',
        document: 'Method used, effectiveness, patient response, and escalation.',
        sourceRefs: [federal('42 CFR § 484.50(f)(1)'), access('ADA effective-communication principles')],
      },
      {
        id: 'privacy-screen', label: 'Privacy and caregiver preference', shortLabel: 'Protect Privacy',
        x: 78, y: 40, tone: 'respectful',
        observed: 'A privacy screen separates the personal-care area from the sitting room.',
        whyItMatters: 'Privacy, modesty, and caregiver-gender preferences should be asked and protected without assuming the reason.',
        safeAction: 'Explain care, ask permission, preserve privacy, and route a staffing preference without guaranteeing a match.',
        notify: 'Notify scheduling or the supervisor about the preference and any immediate barrier to assigned care.',
        document: 'Request, explanation, action, and confirmed follow-up.',
        sourceRefs: [agency('OP-PA-004'), agency('CL-PR-001')],
      },
      {
        id: 'shoe-custom', label: 'Entry custom and safety limit', shortLabel: 'Respect + Safety',
        x: 6, y: 69, tone: 'guidance',
        observed: 'A shoe area suggests a possible household preference, but no request has yet been stated.',
        whyItMatters: 'Household practice deserves respect, while required protective footwear or infection-prevention steps cannot be silently waived.',
        safeAction: 'Ask the preference, explain the safety requirement, and use a compliant option such as approved covers when applicable.',
        notify: 'Contact the supervisor if the preference and safety requirement cannot be reconciled.',
        document: 'Relevant request, safety explanation, accommodation, unresolved barrier, and instruction.',
        sourceRefs: [agency('OP-PA-004'), agency('OP-PA-005')],
      },
      {
        id: 'support-choice', label: 'Patient-selected support person', shortLabel: 'Chosen Support',
        x: 88, y: 48, tone: 'respectful',
        observed: 'A support person sits behind the patient rather than taking over the conversation.',
        whyItMatters: 'The patient can choose support while retaining voice and privacy.',
        safeAction: 'Confirm how the patient wants the person involved and continue addressing the patient directly.',
        document: 'Participation preference and any relevant consent or verified authority used.',
        sourceRefs: [agency('CL-PR-001'), federal('42 CFR § 484.50(b)–(c)')],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Respect & Report',
    title: 'Protect Dignity: Discrimination, Boundaries & Reporting',
    subtitle: 'Restore access, preserve facts, and report—do not investigate',
    overview: [
      "Discomfort, impatience, or unfamiliarity never permits a worker to reduce, rush, delay, or deny service because of a patient’s race, color, national origin, disability, age, gender, sexual orientation, gender identity, religion, language, or another protected characteristic. Discrimination can be explicit, such as refusing an assignment because of identity, or behavioral, such as repeatedly skipping interpretation because it takes longer.",
      "The field worker’s responsibility is to protect immediate patient safety and access within role, preserve objective facts, and report through the appropriate chain. Do not confront everyone involved, collect statements, decide whether a legal violation occurred, promise a result, or conduct a personal investigation. Those functions belong to designated agency leaders. Your timely factual report allows the agency to protect the patient and evaluate the concern.",
      "Non-retaliation means a concern, grievance, request for access, or good-faith report must not lead to worse service, hostility, scheduling punishment, reduced communication, threat, or another adverse response. Continue respectful care within the current plan and assignment. If immediate continuity is at risk, contact the supervisor so service can be protected.",
    ],
    details: [
      {
        heading: 'Recognize behavior without making a legal finding',
        paragraphs: [
          "Examples that require attention include mocking a name or accent; refusing to arrange language access; directing all questions to a capable companion because the patient has a disability; shortening education because interpretation is inconvenient; using slurs or demeaning language; refusing service solely because of identity; or treating a patient worse after a grievance. Describe the action and context rather than writing a conclusion such as “employee is racist.”",
          "A true safety, scope, geographic, or operational concern can also affect an assignment. Report the objective reason and let the authorized process evaluate it. Do not use culture or identity as shorthand for a safety concern, and do not dismiss an actual threat merely because the lesson emphasizes respect.",
        ],
      },
      {
        heading: 'Protect, report, and preserve role boundaries',
        paragraphs: [
          "First address immediate needs within your role. If education was skipped, connect the appropriate qualified service or notify the person who can ensure access. If the patient is unsafe, follow the applicable emergency or clinical escalation process. If the incident involves abuse, neglect, exploitation, or another mandatory report, use the separate required reporting workflow immediately; this module does not replace it.",
          "Report through the supervisor, Director of Nursing, Operations Director, compliance channel, or grievance route appropriate to the event. If a leader is involved in the concern, use an alternate reporting path. Do not delay because the patient has not complained. A worker may identify conduct that the patient felt unable to challenge.",
        ],
      },
      {
        heading: 'Write an objective, usable report',
        paragraphs: [
          "Record date, time, location, people present, what you directly saw or heard, exact words when materially relevant, immediate patient impact, action taken, access restored, notifications, instructions, and follow-up. Separate the clinical record from an incident or grievance report according to agency policy. Do not paste accusatory language into the clinical note or omit a care fact merely because an incident report exists.",
          "Avoid “patient difficult,” “cultural barrier,” “staff was discriminatory,” or “family caused trouble” without observable detail. A stronger statement is: “At 14:10, employee stated, ‘I will not wait for an interpreter,’ ended medication teaching, and left the printed English sheet. Patient stated in Spanish that she did not understand. Supervisor notified at 14:18; qualified interpreter connected at 14:31; teaching completed and teach-back documented.”",
        ],
      },
      {
        heading: 'Receive concerns and prevent retaliation',
        paragraphs: [
          "When a patient or representative raises a concern, listen without arguing or minimizing. Explain how to contact the agency and access the grievance process. Preserve confidentiality and forward the concern promptly. Do not promise that it will be substantiated, that a particular person will be disciplined, or that a specific outcome will occur.",
          "After reporting, continue ordinary respectful care and watch for service disruption. Do not discuss the allegation with uninvolved coworkers, pressure the patient to withdraw it, change your attitude, or punish the person for using rights. Document service-related follow-up and use the designated channel for investigation information.",
        ],
      },
    ],
    keyPoints: [
      { icon: '🚫', title: 'Recognize conduct', detail: 'Describe the behavior and patient impact without making the final finding.' },
      { icon: '🛡️', title: 'Protect service', detail: 'Restore immediate safety and access within your assigned role.' },
      { icon: '📣', title: 'Report, don’t investigate', detail: 'Use the right chain promptly and preserve objective facts.' },
      { icon: '⚖️', title: 'Prevent retaliation', detail: 'A concern or grievance must not reduce or worsen care.' },
    ],
    clinicalTip: 'Exact words can matter. Quote a material statement accurately, then document the patient impact and your action.',
    sourceLabels: [
      agency('CL-PR-001 — Patient Rights & Responsibilities'),
      agency('HR-ER-004 — Anti-Harassment & Non-Discrimination'),
      federal('42 CFR § 484.50(c)(11), (e)'),
    ],
    sceneImage: img06,
    sceneAlt: 'A home-health field worker sits in a fully parked car outside a patient’s home, making a confidential supervisor call while reviewing a blank notebook, tablet schedule, contact card, and closed nursing bag.',
    processSteps: ['Protect', 'Report', 'Preserve Facts', 'Follow Up'],
    hotspots: [
      {
        id: 'supervisor-call', label: 'Prompt supervisor notification', shortLabel: 'Report Promptly',
        x: 39, y: 32, tone: 'guidance',
        observed: 'The worker makes a confidential call after the visit while safely parked.',
        whyItMatters: 'Prompt reporting allows the agency to protect service and assign the investigation to the proper role.',
        safeAction: 'Report what you directly observed or heard, the patient impact, immediate action, and any continuing risk.',
        notify: 'Use the supervisor, DON, Operations, compliance, or alternate channel appropriate to the concern.',
        document: 'Notification time, recipient, factual summary, instructions, and follow-up.',
        sourceRefs: [agency('CL-PR-001'), agency('HR-ER-004')],
      },
      {
        id: 'objective-note', label: 'Objective contemporaneous notes', shortLabel: 'Preserve Facts',
        x: 55, y: 65, tone: 'respectful',
        observed: 'A blank lined notebook is available to capture direct facts without exposed patient information.',
        whyItMatters: 'A factual record is more defensible and useful than a character judgment or cultural conclusion.',
        safeAction: 'Record who, what, when, where, exact material words, patient impact, and action. Follow privacy and record-location rules.',
        document: 'Keep the clinical note and incident or grievance report aligned but in their proper systems.',
        sourceRefs: [agency('CL-CD-001')],
      },
      {
        id: 'service-schedule', label: 'Continuity and non-retaliation', shortLabel: 'Protect Service',
        x: 38, y: 85, tone: 'respectful',
        observed: 'A schedule is visible while the worker confirms that assigned service will continue.',
        whyItMatters: 'Reporting or grieving must not trigger reduced, delayed, or hostile care.',
        safeAction: 'Continue assigned respectful care and raise any actual continuity gap immediately.',
        notify: 'Notify scheduling or the supervisor if the patient’s next service or access arrangement is at risk.',
        document: 'Confirmed service plan, access support, unresolved gap, and escalation.',
        sourceRefs: [federal('42 CFR § 484.50(c)(11), (e)'), agency('CL-PR-001')],
      },
      {
        id: 'contact-card', label: 'Alternate reporting route', shortLabel: 'Know the Route',
        x: 62, y: 87, tone: 'guidance',
        observed: 'A contact card represents the maintained agency reporting directory.',
        whyItMatters: 'A worker needs an alternate path when the usual supervisor is unavailable or involved.',
        safeAction: 'Use current agency contacts; do not rely on obsolete numbers copied from old training material.',
        notify: 'Escalate to the next authorized channel when the first channel cannot safely receive the report.',
        document: 'Each attempted contact, successful handoff, and urgent action.',
        sourceRefs: [agency('HR-ER-004'), agency('CL-PR-001')],
      },
      {
        id: 'parked-safety', label: 'Safe private reporting location', shortLabel: 'Park First',
        x: 78, y: 85, tone: 'guidance',
        observed: 'The vehicle is fully parked before the worker uses the phone or tablet.',
        whyItMatters: 'Urgency does not justify distracted driving or public disclosure of patient information.',
        safeAction: 'Stop in a safe location, protect privacy, and then report through the required urgent route.',
        document: 'Record the report and response; do not include irrelevant vehicle details unless they affected timing or safety.',
        sourceRefs: [agency('RM-SS-003; CO-HP-001; IT-UP-001')],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Integrated Practice',
    title: 'Field Practice: Observe → Inquire → Protect → Document',
    subtitle: 'Combine humility, access, patient choice, and safe escalation',
    overview: [
      "Integrated practice rarely presents one barrier at a time. Imagine a patient whose preferred language is not English. An adult daughter answers most questions. The patient is fasting, shows the worker a traditional product, and hesitates when ordered wound care is explained. The video-interpreter connection initially fails. None of these facts establishes refusal, incapacity, family authority, nonadherence, or a cultural rule.",
      "Work the sequence. Restore qualified language access. Address the patient directly and ask how the daughter should participate. Ask neutral questions about the fast and product. Explain the assigned care within role and use teach-back. If hesitation becomes refusal, honor the decision, protect immediate safety, and notify the appropriate clinician. Do not change the order, approve the product, or pressure the patient.",
      "Close the loop with documentation and handoff. The record should show language and interpreter details, the patient’s own words, desired family involvement, observed facts, education, teach-back, refusal if any, notification, instructions received, and follow-up. The goal is not to prove that the worker knew a culture. The goal is to show respectful, accessible, safe, patient-specific decision-making.",
    ],
    details: [
      {
        heading: 'Decision 1 — Restore accurate access',
        paragraphs: [
          "A failed video connection is an access problem, not permission to let the daughter translate by default. Tell the patient what happened, pause non-emergent complex communication, reconnect, or use the approved qualified audio or in-person backup. Address urgent safety needs with the safest available temporary communication while qualified help is being obtained, following the applicable emergency workflow.",
          "Once connected, introduce the interpreter and verify quality. Speak directly to the patient. Ask the patient how the daughter should be involved. The answer may be “please let her listen,” “she may take notes,” “I want to speak privately first,” or another preference. Do not turn support into authority.",
        ],
      },
      {
        heading: 'Decision 2 — Explore the practice without endorsing or condemning',
        paragraphs: [
          "Ask what the fast means for timing, what the product is, where it is used, and what the patient hopes it will do. Stay curious and specific. Do not say that the practice is safe, dangerous, irrational, or medically effective unless an authorized clinician has evaluated it and the statement is within your role.",
          "Compare the disclosed information to the current assignment and immediate observable risk. Keep supplies closed until the patient understands and agrees. If the practice could affect medication, nutrition, wound care, or infection prevention, contact the appropriate clinician. Provide only the information and action authorized for your role.",
        ],
      },
      {
        heading: 'Decision 3 — Clarify hesitation, teach back, and respect refusal',
        paragraphs: [
          "Hesitation is information, not consent or refusal. Ask, through the interpreter, what concerns the patient. Explain the purpose, expected steps, and relevant consequences within role and in plain language. Ask the patient to describe the plan or show what will happen next. If the explanation was unclear, reteach differently.",
          "If the patient refuses after meaningful communication, stop the non-emergent intervention. Do not bargain, threaten discharge, ask the daughter to persuade the patient, or document “cultural noncompliance.” Protect immediate safety, notify according to policy, follow authorized instructions, and leave the patient with the appropriate contact or follow-up plan.",
        ],
      },
      {
        heading: 'Decision 4 — Defend the record and annual practice',
        paragraphs: [
          "A defensible note might state: preferred language confirmed; qualified interpreter identifier and modality; daughter present at patient request for note-taking only; patient reported fasting until a stated time and using a sealed topical product; worker explained ordered care; patient taught back the purpose but expressed concern about product interaction; care paused; supervising clinician notified; instructions and follow-up recorded. It does not need a theory about the patient’s culture.",
          "Carry these principles into every visit: culture never substitutes for individual assessment; respect never authorizes unsafe or out-of-role action; patient choice does not require employee agreement; access is part of care; family role must be clarified; workers report facts while designated leaders investigate; and documentation should allow the next person to understand the patient’s needs and the team’s response.",
        ],
        bullets: [
          'Pause the first assumption.',
          'Observe and inquire before classifying the issue.',
          'Protect the patient within the current plan, order, role, and safety requirements.',
          'Notify the right person when access, refusal, conflict, or rights are at issue.',
          'Document the patient’s words, facts, assistance, action, notification, and outcome.',
        ],
      },
    ],
    keyPoints: [
      { icon: '👁️', title: 'Observe facts', detail: 'Do not convert identity, objects, or hesitation into a conclusion.' },
      { icon: '❔', title: 'Classify the need', detail: 'Separate language access, family role, preference, refusal, and safety.' },
      { icon: '🧭', title: 'Choose safe action', detail: 'Stay within plan, order, assignment, competency, and role.' },
      { icon: '📝', title: 'Defend the decision', detail: 'Notify and document enough for safe follow-through.' },
    ],
    clinicalTip: 'When several issues appear at once, solve access first. You cannot reliably clarify preference, teach, or confirm refusal without meaningful communication.',
    sourceLabels: [
      agency('OP-PA-003 and OP-PA-004'),
      agency('CL-PR-001 and CL-SD-017'),
      federal('42 CFR § 484.50'),
      federal('45 CFR § 92.201, where applicable'),
    ],
    sceneImage: img07,
    sceneAlt: 'A field worker and an older patient hold a patient-centered discussion at a kitchen table with a daughter supporting, a qualified interpreter on a device, and closed care supplies, a sealed home product, a pictorial instruction card, and a care folder visible.',
    processSteps: ['Observe', 'Inquire', 'Protect', 'Notify', 'Document'],
    hotspots: [
      {
        id: 'access-first', label: 'Restore qualified language access', shortLabel: 'Access First',
        x: 69, y: 74, tone: 'respectful',
        observed: 'A qualified interpreter is available on a device after the initial connection problem.',
        whyItMatters: 'Accurate access is needed before complex education, family-role clarification, or an informed refusal can be understood.',
        safeAction: 'Verify quality, speak directly to the patient, and use the approved backup if the connection fails again.',
        notify: 'Report repeated service or device failure and any care delay.',
        document: 'Language, interpreter identifier, modality, failure, backup, and care impact.',
        sourceRefs: [agency('OP-PA-003'), federal('42 CFR § 484.50(f)(2)')],
      },
      {
        id: 'patient-center', label: 'Patient voice before family answers', shortLabel: 'Patient Center',
        x: 51, y: 35, tone: 'respectful',
        observed: 'The patient sits directly across from the worker while the daughter is positioned as support.',
        whyItMatters: 'Family presence does not transfer voice, consent, or decision authority from a capable patient.',
        safeAction: 'Ask the patient how the daughter should participate and direct questions to the patient.',
        notify: 'Escalate unclear representative, consent, or privacy authority.',
        document: 'The patient’s requested family role and verified authority used, if any.',
        sourceRefs: [agency('CL-PR-001'), federal('42 CFR § 484.50(b)–(c)')],
      },
      {
        id: 'home-product', label: 'Sealed personal health product', shortLabel: 'Clarify Product',
        x: 35, y: 79, tone: 'pause',
        observed: 'A sealed unlabeled home product sits beside closed clinical supplies.',
        whyItMatters: 'The object does not reveal its contents, meaning, safety, or relationship to the ordered care.',
        safeAction: 'Ask what it is and how it is used; do not apply, remove, approve, or condemn it; keep assigned care within the current order.',
        notify: 'Notify the appropriate clinician if it may affect the wound, medication, infection prevention, nutrition, or another risk.',
        document: 'Patient report, observed container, education, decision, notification, and instruction.',
        sourceRefs: [agency('OP-PA-004'), agency('CL-CD-001')],
      },
      {
        id: 'teachback-card', label: 'Teach-back and hesitation', shortLabel: 'Clarify Meaning',
        x: 66, y: 86, tone: 'guidance',
        observed: 'A pictorial instruction card supports the patient in explaining the proposed care.',
        whyItMatters: 'Teach-back can distinguish unclear explanation, concern, preference, and refusal without treating nodding as consent.',
        safeAction: 'Ask the patient to explain the next step; reteach; if refusal persists, stop non-emergent care and follow the escalation workflow.',
        notify: 'Notify the supervising clinician of refusal, unresolved concern, or inability to demonstrate a critical instruction.',
        document: 'Actual teach-back, concern, refusal if any, care held or provided, notification, and follow-up.',
        sourceRefs: [agency('CL-SD-017'), agency('CL-PR-001')],
      },
      {
        id: 'supervisor-followup', label: 'Closed-loop clinical follow-up', shortLabel: 'Close the Loop',
        x: 20, y: 76, tone: 'guidance',
        observed: 'The worker’s phone is ready for supervisor or clinician follow-up after the patient discussion.',
        whyItMatters: 'Respectful inquiry does not replace timely escalation when a practice or refusal affects ordered care.',
        safeAction: 'Report the patient’s words and relevant facts, receive authorized direction, confirm the follow-up plan, and communicate it accessibly.',
        notify: 'Use the appropriate clinician or supervisor for the issue and escalate urgent risk through the applicable emergency process.',
        document: 'Who was notified, time, information given, instructions, patient response, and next step.',
        sourceRefs: [agency('OP-PA-004'), agency('CL-CD-001')],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Which statement best describes cultural humility in home-health practice?',
    options: [
      'Learning a reliable list of behaviors for every cultural group',
      'Engaging in ongoing self-reflection, recognizing limits, and learning from the individual patient',
      'Avoiding discussion of culture so every patient receives identical care',
      'Referring every cultural question to a social worker',
    ],
    correct: 1,
    rationale: 'Cultural humility is an ongoing practice of self-reflection, individualized inquiry, attention to power, and willingness to correct assumptions. It does not claim mastery of a group. Care Indeed OP-PA-004 requires respect for each patient’s values and practices; HHS CLAS Standard 1 supports effective, understandable, respectful care.',
    sourceRefs: [agency('OP-PA-004'), practice('HHS National CLAS Standard 1')],
  },
  {
    id: 2,
    stem: 'A patient’s language, dietary practice, religious preference, and desired family involvement are documented in the current plan. What should the assigned field worker do?',
    options: [
      'Ignore the preferences unless each one appears in a physician order',
      'Follow only the preferences the worker personally considers important',
      'Ask the family to reinterpret the preferences at every visit',
      'Apply the documented preferences within the current plan, assignment, role, and safety requirements, and report any new conflict',
    ],
    correct: 3,
    rationale: 'The worker follows documented preferences through the authorized plan and role. A new conflict is reported through the proper workflow; it does not authorize an independent care-plan or order change. This is Care Indeed policy under OP-PA-004 and patient participation is protected by 42 CFR § 484.50(c)(4).',
    sourceRefs: [agency('OP-PA-004'), federal('42 CFR § 484.50(c)(4)')],
  },
  {
    id: 3,
    stem: 'During medication education, an adult grandson begins interpreting for a patient who has difficulty understanding English. The patient did not request this arrangement, and there is no emergency. What is the best response?',
    options: [
      'Continue because an adult relative is always an acceptable interpreter',
      'Ask the grandson to sign a confidentiality statement and continue',
      'Pause the complex education, connect the qualified interpreter service, and speak directly to the patient',
      'Give the English handout and ask the grandson to explain it later',
    ],
    correct: 2,
    rationale: 'Use the qualified-interpreter workflow. Current 45 CFR § 92.201 restricts reliance on an unqualified accompanying adult, and OP-PA-003 provides for qualified language services. A field worker should not improvise an exception.',
    sourceRefs: [agency('OP-PA-003'), federal('45 CFR § 92.201(e), where applicable')],
  },
  {
    id: 4,
    stem: 'A patient says a religious fast will affect when an ordered medication is taken. What is the safest culturally humble response?',
    options: [
      'Ask about the practice, avoid changing the medication plan independently, notify the appropriate clinician, and document the discussion and patient decision',
      'Tell the patient that medical instructions always override religious practice',
      'Recommend a new medication schedule that appears compatible with fasting',
      'Record “noncompliant due to religion” and end the discussion',
    ],
    correct: 0,
    rationale: 'Respect the preference and gather relevant facts without independently changing an order. Protect the patient, use understandable communication, notify the authorized clinician, and document the patient’s words and decision. OP-PA-004 supports respectful accommodation; CL-PR-001 protects participation and refusal.',
    sourceRefs: [agency('OP-PA-004'), agency('CL-PR-001')],
  },
  {
    id: 5,
    stem: 'A patient requests a same-gender worker for future personal-care visits. The current worker cannot confirm scheduling availability. What should the worker do?',
    options: [
      'Tell the patient the request cannot be considered',
      'Acknowledge the preference, notify scheduling or the supervisor, avoid promising a result, and document the request and action when relevant',
      'Promise that every future visit will meet the request',
      'Ignore the request unless the patient files a grievance',
    ],
    correct: 1,
    rationale: 'Acknowledge and route the request for feasible accommodation without guaranteeing a staffing result or delaying urgent safety care. OP-PA-004 supports individualized preferences and reasonable accommodation through agency workflow.',
    sourceRefs: [agency('OP-PA-004')],
  },
  {
    id: 6,
    stem: 'A capable patient asks for an adult daughter to remain during the visit but says, “Please ask me the questions; she can help if I ask.” What is the best approach?',
    options: [
      'Direct all questions to the daughter because the patient authorized her presence',
      'Ask the daughter to answer first and let the patient correct her',
      'Speak directly to the patient and involve the daughter only in the way the patient requested',
      'Require the daughter to leave because family involvement compromises care',
    ],
    correct: 2,
    rationale: 'Family support and patient voice can coexist. Presence does not transfer decision-making authority from a capable patient. Address the patient and honor the requested support role under CL-PR-001 and 42 CFR § 484.50(c)(4).',
    sourceRefs: [agency('CL-PR-001'), federal('42 CFR § 484.50(c)(4)')],
  },
  {
    id: 7,
    stem: 'A hard-of-hearing patient says face-to-face speech, reduced background noise, and written key points work best. The visit includes complex new instructions. What is the best response?',
    options: [
      'Speak much louder while looking at the chart',
      'Ask a hearing family member to handle the discussion',
      'Use written notes only, regardless of complexity',
      'Use the patient’s requested methods, assess whether additional auxiliary aids are needed, and confirm understanding',
    ],
    correct: 3,
    rationale: 'The effective method depends on the individual and the nature, length, complexity, and context of communication. Use the patient’s preferred methods, arrange any necessary additional aid, and confirm understanding. See 42 CFR § 484.50(f) and ADA effective-communication principles.',
    sourceRefs: [federal('42 CFR § 484.50(f)(1)'), access('ADA effective communication')],
  },
  {
    id: 8,
    stem: 'Which note best documents culturally and linguistically appropriate education?',
    options: [
      'Cultural needs addressed; patient understood.',
      'Education provided in Vietnamese through video interpreter ID V4831; reviewed wound-warning signs using illustrated material; patient taught back spreading redness, increased drainage, and fever; dressing-disposal teaching will be reinforced next visit.',
      'Daughter translated. Teaching complete.',
      'Patient difficult to teach because of cultural barrier.',
    ],
    correct: 1,
    rationale: 'The best note identifies language, interpreter, modality, content, method, actual teach-back, and follow-up using objective language. OP-PA-003 supports interpreter documentation, CL-SD-017 supports teach-back detail, and CL-CD-001 requires patient-specific facts.',
    sourceRefs: [agency('OP-PA-003'), agency('CL-SD-017'), agency('CL-CD-001')],
  },
  {
    id: 9,
    stem: 'A worker observes another employee refuse language access and leave after saying, “I do not work with people who cannot speak English.” What is the best response?',
    options: [
      'Protect immediate patient access within role, report the objective facts promptly through the appropriate chain, and document without conducting an independent investigation',
      'Wait to see whether the patient files a complaint',
      'Confront the employee publicly and decide whether discrimination occurred',
      'Avoid documenting the statement because it may harm the coworker',
    ],
    correct: 0,
    rationale: 'Protect service, report facts promptly, and let designated leadership investigate. Patient rights include access, freedom from discrimination or reprisal, and complaint protections under 42 CFR § 484.50; Care Indeed CL-PR-001 and HR-ER-004 provide reporting expectations.',
    sourceRefs: [federal('42 CFR § 484.50(c)(11), (e)'), agency('CL-PR-001'), agency('HR-ER-004')],
  },
  {
    id: 10,
    stem: 'A patient with limited English proficiency is accompanied by a daughter who answers every question. The patient shows a traditional product, hesitates about ordered wound care, and nods without explaining the instructions back. What is the best integrated response?',
    options: [
      'Accept the daughter’s answers, remove the traditional product, and complete wound care',
      'Finish quickly because nodding indicates consent and understanding',
      'Arrange qualified interpretation, address the patient, clarify family involvement and the product, use teach-back, honor refusal if it persists, notify appropriately, and document the response',
      'Cancel all services until the family agrees not to use traditional practices',
    ],
    correct: 2,
    rationale: 'The integrated response restores access, preserves patient voice, asks rather than assumes, keeps care within role and order, uses teach-back, respects refusal, escalates clinical conflict, and documents objective facts. It combines OP-PA-003, OP-PA-004, CL-PR-001, CL-SD-017, and 42 CFR § 484.50.',
    sourceRefs: [
      agency('OP-PA-003'), agency('OP-PA-004'), agency('CL-PR-001'),
      agency('CL-SD-017'), federal('42 CFR § 484.50'),
    ],
  },
];

const STYLES = [
  ".achcartm01,.achcartm01 *{box-sizing:border-box}",
  ".achcartm01{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2D3748}",
  ".achcartm01-shell{position:fixed;inset:0;z-index:40;background:#F8FAFC;display:grid;grid-template-rows:64px minmax(0,1fr) 80px;overflow:hidden}",
  ".achcartm01-top{height:64px;background:#fff;border-bottom:1px solid #D8E0E8;display:flex;align-items:center;gap:16px;padding:0 20px;min-width:0}",
  ".achcartm01-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;white-space:nowrap;flex:0 0 auto}",
  ".achcartm01-tabs{display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:thin;min-width:0;flex:1;padding:5px 2px}",
  ".achcartm01-tab{min-height:44px;border:1px solid transparent;border-radius:999px;padding:0 12px;background:transparent;color:#5B687A;font-size:11px;font-weight:800;white-space:nowrap;cursor:pointer}",
  ".achcartm01-tab:hover{background:#EEF4F3;color:#0F5B54}",
  ".achcartm01-tab.active{background:#0F5B54;color:#fff;border-color:#0F5B54}",
  ".achcartm01-tab.quiz-tab{border-color:#A63D10;color:#A63D10;background:#fff}",
  ".achcartm01-tab.quiz-tab.active{background:#A94312;border-color:#A94312;color:#fff}",
  ".achcartm01-exit{min-height:44px;padding:0 14px;border-radius:12px;border:2px solid #A63D10;background:#fff;color:#A63D10;font-size:12px;font-weight:800;cursor:pointer;flex:0 0 auto}",
  ".achcartm01-work{display:flex;min-height:0;padding:16px;overflow:hidden}",
  ".achcartm01-left{width:42%;min-width:280px;max-width:520px;background:#fff;border:1px solid #D8E0E8;border-right:0;border-radius:16px 0 0 16px;padding:22px;overflow-y:auto;overscroll-behavior:contain}",
  ".achcartm01-right{flex:1;min-width:0;min-height:0;background:#fff;border:1px solid #D8E0E8;border-radius:0 16px 16px 0;padding:12px;overflow:hidden}",
  ".achcartm01-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}",
  ".achcartm01-stage{position:relative;width:min(100cqw,calc(100cqh * 16 / 13));aspect-ratio:16/13;max-width:100%;max-height:100%;overflow:hidden;border-radius:14px;background:#dce6e4;box-shadow:0 16px 40px rgba(15,91,84,.12)}",
  ".achcartm01-stage .scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
  ".achcartm01-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);border:0;background:transparent;padding:0;cursor:pointer;min-width:48px;min-height:48px}",
  ".achcartm01-hotspot .orb{position:relative;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;border:3px solid rgba(255,255,255,.94);box-shadow:0 4px 14px rgba(0,0,0,.22)}",
  ".achcartm01-hotspot .tag{position:absolute;top:51px;left:50%;transform:translateX(-50%);white-space:nowrap;max-width:126px;overflow:hidden;text-overflow:ellipsis;padding:4px 8px;border-radius:7px;background:rgba(255,255,255,.96);border:1px solid #D8E0E8;color:#0A423D;font-size:11px;font-weight:800;box-shadow:0 3px 10px rgba(0,0,0,.12)}",
  ".achcartm01-hotspot.done .tag{border-color:#0F5B54;background:#EEF4F3}",
  ".achcartm01-hotspot .ping{position:absolute;inset:-6px;border-radius:50%;border:3px solid #F26D33;animation:achcartm01-ping 1.1s ease-out 2}",
  "@keyframes achcartm01-ping{0%{transform:scale(.72);opacity:.95}100%{transform:scale(1.45);opacity:0}}",
  ".achcartm01-process{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:7;display:flex;gap:5px;max-width:68%;padding:6px;border-radius:999px;background:rgba(255,255,255,.94);border:1px solid #D8E0E8;pointer-events:none}",
  ".achcartm01-process span{font-size:11px;font-weight:800;color:#0A423D;white-space:nowrap;padding:4px 7px;border-radius:999px;background:#EEF4F3}",
  ".achcartm01-process span+span:before{content:'›';color:#A63D10;margin-right:7px}",
  ".achcartm01-drawer-bg{position:fixed;inset:0;z-index:100;background:rgba(15,23,42,.42);display:flex;justify-content:flex-end}",
  ".achcartm01-drawer{width:min(480px,100%);height:100%;overflow-y:auto;background:#fff;box-shadow:-18px 0 50px rgba(0,0,0,.2)}",
  ".achcartm01-bot{height:80px;background:#fff;border-top:1px solid #D8E0E8;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:0 24px}",
  ".achcartm01-bot .nav,.achcartm01-bot .next{min-height:44px;border-radius:12px;padding:0 16px;display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;cursor:pointer}",
  ".achcartm01-bot .nav{justify-self:start;border:1px solid #D8E0E8;background:#fff;color:#0A423D}",
  ".achcartm01-bot .next{justify-self:end;border:0;background:#A94312;color:#fff}",
  ".achcartm01-bot button:disabled{opacity:.45;cursor:not-allowed}",
  ".achcartm01-quiz-page{height:100%;min-height:0;overflow-y:auto;padding:24px;display:grid;place-items:center;background:#F8FAFC}",
  ".achcartm01-quiz-card{width:min(760px,100%)}",
  ".achcartm01 button:focus-visible,.achcartm01 summary:focus-visible{outline:3px solid #0B69C7;outline-offset:3px}",
  ".achcartm01-live,.achcartm01-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}",
  ".achcartm01-complete{position:absolute;left:12px;bottom:62px;z-index:20;width:min(360px,calc(100% - 24px));background:#fff;border:2px solid #0F5B54;border-radius:14px;padding:14px;box-shadow:0 14px 34px rgba(15,91,84,.22)}",
  "@media (max-width:900px){.achcartm01-shell{grid-template-rows:64px minmax(0,1fr) 72px}.achcartm01-work{display:block;overflow-y:auto;padding:10px}.achcartm01-left{width:100%;max-width:none;min-width:0;max-height:42vh;border-right:1px solid #D8E0E8;border-radius:14px 14px 0 0}.achcartm01-right{min-height:360px;height:min(66vh,620px);border-top:0;border-radius:0 0 14px 14px}.achcartm01-bot{height:72px;padding:0 12px}.achcartm01-process{max-width:84%;overflow:hidden}}",
  "@media (max-width:620px){.achcartm01-top{gap:8px;padding:0 8px}.achcartm01-brand .brand-text{display:none}.achcartm01-tab{padding:0 10px}.achcartm01-exit{padding:0 9px;font-size:11px}.achcartm01-left{padding:18px}.achcartm01-bot{grid-template-columns:auto 1fr auto}.achcartm01-bot .nav,.achcartm01-bot .next{padding:0 10px}.achcartm01-footer-label{font-size:10px!important;padding:7px!important}.achcartm01-process{display:none}}",
  "@media (max-width:420px){.achcartm01-right{min-height:320px;height:55vh}.achcartm01-stage{border-radius:10px}.achcartm01-hotspot .tag{max-width:88px}}",
  "@media (prefers-reduced-motion:reduce){.achcartm01 *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}",
].join('');

function SourceChips({ refs }: { refs: SourceRef[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {refs.map((ref) => (
        <span
          key={ref.kind + ':' + ref.text}
          style={{
            fontSize: 11, fontWeight: 800, lineHeight: 1.3, padding: '5px 8px',
            borderRadius: 7, background: '#FAFBFC', border: '1px solid ' + CI.border,
            color: CI.muted,
          }}
        >
          {ref.kind}: {ref.text}
        </span>
      ))}
    </div>
  );
}

function FeedbackBlock({
  label, body, accent = false, icon,
}: {
  label: string; body: string; accent?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      border: '1px solid ' + (accent ? CI.tealMuted : CI.border),
      background: accent ? CI.tealSoft : CI.bg,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800,
        letterSpacing: '.08em', textTransform: 'uppercase',
        color: accent ? CI.tealDark : CI.muted, marginBottom: 6,
      }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function ToneIcon({ tone }: { tone: PracticeTone }) {
  const spec = TONE[tone];
  if (spec.icon === 'stop') return <XCircle size={18} />;
  if (spec.icon === 'alert') return <AlertTriangle size={18} />;
  return <CheckCircle2 size={18} />;
}

function FieldFeedbackDialog({
  hotspot, onClose, onComplete, triggerRef,
}: {
  hotspot: Hotspot; onClose: () => void; onComplete: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const spec = TONE[hotspot.tone];
  const closeAndReturn = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [hotspot.id]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [closeAndReturn]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      )).filter((node) => !node.hasAttribute('disabled'));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    root.addEventListener('keydown', trap);
    return () => root.removeEventListener('keydown', trap);
  }, []);

  return (
    <div className="achcartm01-drawer-bg" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeAndReturn();
    }}>
      <div
        ref={dialogRef} role="dialog" aria-modal="true"
        aria-labelledby={titleId} aria-describedby={descId}
        className="achcartm01-drawer"
      >
        <div style={{
          padding: 16, borderBottom: '1px solid ' + CI.border, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 10,
          position: 'sticky', top: 0, background: 'rgba(255,255,255,.97)', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: spec.color,
              color: '#fff', display: 'grid', placeItems: 'center',
            }}>
              <ToneIcon tone={hotspot.tone} />
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 800, color: CI.tealDark }}>
                {hotspot.label}
              </h2>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
                textTransform: 'uppercase', color: spec.color,
              }}>
                {spec.label}
              </div>
            </div>
          </div>
          <button
            ref={closeRef} type="button" aria-label="Close feedback" onClick={closeAndReturn}
            style={{
              width: 44, height: 44, minWidth: 44, borderRadius: '50%',
              border: '1px solid ' + CI.border, background: CI.bg, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <X size={18} color={CI.muted} />
          </button>
        </div>
        <p id={descId} className="achcartm01-sr-only">
          Field-practice feedback with observation, significance, safe action, notification,
          documentation, and sources.
        </p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observed} />
          <FeedbackBlock label="Why it matters" body={hotspot.whyItMatters} />
          <FeedbackBlock label="Safe field action" body={hotspot.safeAction} accent />
          {hotspot.notify ? (
            <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} />} />
          ) : null}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <SourceChips refs={hotspot.sourceRefs} />
          <button
            type="button"
            onClick={() => {
              onComplete();
              window.requestAnimationFrame(() => triggerRef.current?.focus());
            }}
            style={{
              width: '100%', minHeight: 46, border: 0, borderRadius: 10,
              background: CI.orangeButton, color: '#fff', fontWeight: 800, fontSize: 12,
              letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Mark observed
          </button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  return (
    <div>
      <div style={{
        display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em',
        textTransform: 'uppercase', color: CI.tealDark, background: CI.tealSoft,
        border: '1px solid ' + CI.tealMuted, borderRadius: 999,
        padding: '4px 10px', marginBottom: 14,
      }}>
        LESSON {pageIndex + 1} · {pageIndex + 1} OF {total}
      </div>
      <h1 style={{
        margin: '0 0 6px', fontSize: 24, fontWeight: 800,
        lineHeight: 1.25, color: '#1F1C1B',
      }}>
        {page.title}
      </h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 700 }}>
        {page.subtitle}
      </p>
      {page.overview.map((paragraph) => (
        <p key={paragraph} style={{
          margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#4D4947',
        }}>
          {paragraph}
        </p>
      ))}
      <details style={{
        border: '1px solid ' + CI.border, borderRadius: 12,
        background: '#FAFBF8', marginBottom: 16,
      }}>
        <summary style={{
          minHeight: 44, padding: '12px 14px', fontWeight: 800,
          fontSize: 14, color: CI.tealDark, cursor: 'pointer',
        }}>
          View Full Lesson Details
        </summary>
        <div style={{ padding: 14, borderTop: '1px solid ' + CI.border, background: '#fff' }}>
          {page.details.map((block) => (
            <section key={block.heading} style={{ marginBottom: 18 }}>
              <h2 style={{
                margin: '0 0 8px', fontSize: 17, lineHeight: 1.35, color: CI.tealDark,
              }}>
                {block.heading}
              </h2>
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{
                  margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#4D4947',
                }}>
                  {paragraph}
                </p>
              ))}
              {block.bullets ? (
                <ul style={{ margin: '6px 0 0', paddingLeft: 22 }}>
                  {block.bullets.map((bullet) => (
                    <li key={bullet} style={{
                      marginBottom: 7, fontSize: 16, lineHeight: 1.55, color: '#4D4947',
                    }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </details>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '.1em',
        textTransform: 'uppercase', color: CI.muted, marginBottom: 10,
      }}>
        Key Field Actions
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
        gap: 10, marginBottom: 16,
      }}>
        {page.keyPoints.map((point) => (
          <div key={point.title} style={{
            background: '#fff', border: '1px solid ' + CI.border,
            borderRadius: 12, padding: 12, display: 'flex', gap: 10,
          }}>
            <span style={{ fontSize: 18 }} aria-hidden="true">{point.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>
                {point.title}
              </div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>
                {point.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        padding: 14, borderRadius: 12, background: '#FFF9F5',
        border: '1px solid ' + CI.border, borderLeft: '4px solid ' + CI.orangeDark,
        marginBottom: 14,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: CI.orangeDark,
          letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Field Practice Tip
        </div>
        <div style={{ fontSize: 15, color: '#4D4947', lineHeight: 1.55 }}>
          {page.clinicalTip}
        </div>
      </div>
      <SourceChips refs={page.sourceLabels} />
    </div>
  );
}

function RightPanel({
  page, completed, setCompleted, onGoQuiz,
}: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void;
  onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dismissedComplete, setDismissedComplete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = page.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const done = page.hotspots.every((hotspot) => completed.includes(hotspot.id));
  const nextIncomplete = page.hotspots.find((hotspot) => !completed.includes(hotspot.id));

  useEffect(() => {
    setActiveId(null);
    setDismissedComplete(false);
  }, [page.id]);

  return (
    <div className="achcartm01-stage-wrap">
      <div className="achcartm01-stage" role="region" aria-label={page.title + ' interactive scene'}>
        <img className="scene" src={page.sceneImage} alt={page.sceneAlt} draggable={false} />
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 8,
          maxWidth: 'min(50%,320px)', padding: '8px 10px', borderRadius: 12,
          background: 'rgba(255,255,255,.95)', border: '1px solid ' + CI.border,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.1em',
            textTransform: 'uppercase', color: CI.orangeDark,
          }}>
            {page.shortName}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.tealDark }}>
            {page.title.split(':')[0]}
          </div>
        </div>
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 8,
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          borderRadius: 999, background: 'rgba(255,255,255,.95)',
          border: '1px solid ' + CI.border, fontSize: 11, fontWeight: 800,
          color: CI.tealDark, pointerEvents: 'none',
        }}>
          <Eye size={14} aria-hidden="true" /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hotspot) => {
          const isDone = completed.includes(hotspot.id);
          const isGuided = !isDone && nextIncomplete?.id === hotspot.id;
          const spec = TONE[hotspot.tone];
          return (
            <button
              key={hotspot.id}
              type="button"
              className={'achcartm01-hotspot ' + (isDone ? 'done' : '')}
              style={{ left: hotspot.x + '%', top: hotspot.y + '%' }}
              aria-label={isDone ? hotspot.label + ' — observed' : 'Investigate ' + hotspot.label}
              aria-describedby={'achcartm01-progress-' + page.id}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveId(hotspot.id);
              }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : spec.color }}>
                {isGuided ? <span className="ping" aria-hidden="true" /> : null}
                {isDone ? (
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span style={{ fontSize: 15 }} aria-hidden="true">?</span>
                )}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
            </button>
          );
        })}
        <div
          id={'achcartm01-progress-' + page.id}
          className="achcartm01-live"
          aria-live="polite"
        >
          {completed.length} of {page.hotspots.length} observations complete
        </div>
        <div className="achcartm01-process" role="note" aria-label="Lesson decision process">
          {page.processSteps.map((step) => <span key={step}>{step}</span>)}
        </div>
        <button
          type="button"
          aria-label="Reset lesson observations"
          onClick={() => {
            setCompleted([]);
            setDismissedComplete(false);
          }}
          style={{
            position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44,
            padding: '0 12px', borderRadius: 999, border: '1px solid ' + CI.border,
            background: 'rgba(255,255,255,.96)', color: CI.tealDark, fontSize: 11,
            fontWeight: 800, cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', gap: 5,
          }}
        >
          <RotateCcw size={13} aria-hidden="true" /> Reset
        </button>
        {done && !active && !dismissedComplete ? (
          <div className="achcartm01-complete" role="status">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: CI.tealSoft,
                display: 'grid', placeItems: 'center', flex: '0 0 auto',
              }}>
                <ShieldCheck size={24} color={CI.teal} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: CI.tealDark }}>
                  Scene complete
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: CI.muted, marginTop: 3 }}>
                  Knowledge practice only. Role authorization and field competency remain separate.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setDismissedComplete(true)}
                style={{
                  minHeight: 44, padding: '0 14px', borderRadius: 10,
                  border: '1px solid ' + CI.border, background: '#fff',
                  color: CI.tealDark, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              {onGoQuiz && page.id === PAGES.length - 1 ? (
                <button
                  type="button"
                  onClick={onGoQuiz}
                  style={{
                    flex: 1, minHeight: 44, border: 0, borderRadius: 10,
                    background: CI.orangeButton, color: '#fff',
                    fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  Knowledge Check
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        {active ? (
          <FieldFeedbackDialog
            hotspot={active}
            onClose={() => setActiveId(null)}
            onComplete={() => {
              setCompleted(Array.from(new Set([...completed, active.id])));
              setActiveId(null);
            }}
            triggerRef={triggerRef}
          />
        ) : null}
      </div>
    </div>
  );
}

interface QuizState {
  answers: (number | null)[];
  idx: number;
  finished: boolean;
  selected: number | null;
  submitted: boolean;
}

function QuizPage({
  onBack, initialState, attempts, bestScore, onPersist, onFinish,
}: {
  onBack: () => void;
  initialState: QuizState;
  attempts: number;
  bestScore?: number;
  onPersist: (state: QuizState) => void;
  onFinish: (score: number, percent: number, passed: boolean) => void;
}) {
  const [idx, setIdx] = useState(initialState.idx);
  const [selected, setSelected] = useState<number | null>(initialState.selected);
  const [submitted, setSubmitted] = useState(initialState.submitted);
  const [answers, setAnswers] = useState<(number | null)[]>(initialState.answers);
  const [finished, setFinished] = useState(initialState.finished);
  const [resultRecorded, setResultRecorded] = useState(initialState.finished);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rationaleRef = useRef<HTMLDivElement>(null);
  const question = QUIZ[idx];
  const score = useMemo(
    () => answers.reduce<number>(
      (total, answer, questionIndex) =>
        total + (answer === QUIZ[questionIndex].correct ? 1 : 0),
      0,
    ),
    [answers],
  );
  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = percent >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted });
  }, [answers, idx, finished, selected, submitted, onPersist]);

  useEffect(() => {
    if (submitted && !finished) rationaleRef.current?.focus();
  }, [submitted, finished, idx]);

  const focusOption = (optionIndex: number) => {
    setSelected(optionIndex);
    window.requestAnimationFrame(() => optionRefs.current[optionIndex]?.focus());
  };

  const advance = () => {
    if (selected === null) return;
    if (!submitted) {
      const nextAnswers = [...answers];
      nextAnswers[idx] = selected;
      setAnswers(nextAnswers);
      setSubmitted(true);
      return;
    }
    if (idx === QUIZ.length - 1) {
      setFinished(true);
      if (!resultRecorded) {
        onFinish(score, percent, passed);
        setResultRecorded(true);
      }
      return;
    }
    const nextIndex = idx + 1;
    setIdx(nextIndex);
    const existing = answers[nextIndex];
    setSelected(existing ?? null);
    setSubmitted(existing !== null && existing !== undefined);
    if (existing === null || existing === undefined) {
      window.requestAnimationFrame(() => optionRefs.current[0]?.focus());
    }
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <div className="achcartm01-quiz-page">
        <div className="achcartm01-quiz-card" style={{
          background: '#fff', borderRadius: 24, border: '1px solid ' + CI.border,
          boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.16em',
            textTransform: 'uppercase', color: CI.tealDark,
          }}>
            Knowledge Check Complete
          </div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg
              width="140" height="140" viewBox="0 0 120 120"
              style={{ transform: 'rotate(-90deg)' }} aria-hidden="true"
            >
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle
                cx="60" cy="60" r="45" fill="none"
                stroke={passed ? CI.teal : CI.orangeDark}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  color: passed ? CI.teal : CI.orangeDark,
                }}>
                  {percent}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: CI.muted }}>
                  {score}/{QUIZ.length}
                </div>
              </div>
            </div>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, color: CI.tealDark }}>
            {passed ? 'Passing knowledge review' : 'More review is needed'}
          </h2>
          <p style={{
            fontSize: 15, color: CI.muted, lineHeight: 1.6,
            maxWidth: 560, margin: '0 auto 18px',
          }}>
            Completion confirms annual knowledge review only. It does not expand professional scope,
            validate field competency, authorize a procedure, or clear independent practice.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            gap: 10, marginBottom: 18,
          }}>
            {[
              ['Pause & notice', 'Separate fact from assumption'],
              ['Ask & adapt', 'Center the patient and arrange access'],
              ['Report & document', 'Escalate and preserve objective facts'],
            ].map(([label, tip]) => (
              <div key={label} style={{
                padding: 14, borderRadius: 14, background: CI.bg,
                border: '1px solid ' + CI.border,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: CI.teal, margin: '0 auto 8px',
                }} />
                <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{tip}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: CI.muted, marginBottom: 18 }}>
            Attempts completed: {attempts}
            {bestScore !== undefined ? ' · Best score: ' + bestScore + '%' : ''}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{
              minHeight: 44, padding: '0 20px', borderRadius: 12,
              border: '1px solid ' + CI.border, background: '#fff',
              color: CI.tealDark, fontWeight: 800, cursor: 'pointer',
            }}>
              Back to Lessons
            </button>
            <button type="button" onClick={() => {
              setIdx(0);
              setSelected(null);
              setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null));
              setFinished(false);
              setResultRecorded(false);
              window.requestAnimationFrame(() => optionRefs.current[0]?.focus());
            }} style={{
              minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0,
              background: CI.orangeButton, color: '#fff', fontWeight: 800, cursor: 'pointer',
            }}>
              Retake Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selected === question.correct;
  return (
    <div className="achcartm01-quiz-page">
      <div className="achcartm01-quiz-card" style={{
        background: '#fff', borderRadius: 24, border: '1px solid ' + CI.border,
        boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 22px',
          background: 'linear-gradient(135deg,' + CI.teal + ' 0%,' + CI.tealDark + ' 100%)',
          color: '#fff',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} aria-hidden="true" />
              <span style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '.14em',
                textTransform: 'uppercase',
              }}>
                Field Practice Check
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{
            height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: Math.max(progress, 6) + '%',
              background: '#FFB088', borderRadius: 999, transition: 'width .25s ease',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 10,
            fontSize: 11, fontWeight: 800, letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderRadius: 999, background: CI.tealSoft, color: CI.tealDark,
            fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            <Sparkles size={13} aria-hidden="true" /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 20, lineHeight: 1.45 }}>
            {question.stem}
          </h2>
          <div
            role="radiogroup"
            aria-label="Answer choices"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(event) => {
              if (submitted) return;
              const max = question.options.length - 1;
              const current = selected ?? 0;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault();
                focusOption((current + 1) % question.options.length);
              } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                event.preventDefault();
                focusOption((current - 1 + question.options.length) % question.options.length);
              } else if (event.key === 'Home') {
                event.preventDefault(); focusOption(0);
              } else if (event.key === 'End') {
                event.preventDefault(); focusOption(max);
              } else if (event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                if (selected !== null) advance();
              }
            }}
          >
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              let border: string = CI.border;
              let background: string = '#fff';
              let letterBackground: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && optionIndex === question.correct) {
                border = CI.teal;
                background = CI.tealSoft;
                letterBackground = CI.teal;
                letterColor = '#fff';
              } else if (submitted && isSelected && !isCorrect) {
                border = CI.red;
                background = CI.redSoft;
                letterBackground = CI.red;
                letterColor = '#fff';
              } else if (isSelected) {
                border = CI.teal;
                background = '#F3FBFA';
                letterBackground = CI.teal;
                letterColor = '#fff';
              }
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  ref={(element) => { optionRefs.current[optionIndex] = element; }}
                  tabIndex={isSelected || (selected === null && optionIndex === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setSelected(optionIndex)}
                  style={{
                    padding: 14, borderRadius: 14, border: '2px solid ' + border,
                    background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                    display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 48,
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: letterBackground, color: letterColor,
                    display: 'grid', placeItems: 'center', fontWeight: 800,
                    fontSize: 12, flexShrink: 0,
                  }}>
                    {letters[optionIndex]}
                  </span>
                  <span style={{
                    fontWeight: 600, color: CI.ink, fontSize: 16,
                    lineHeight: 1.5, paddingTop: 3,
                  }}>
                    {option}
                  </span>
                  {submitted && optionIndex === question.correct ? (
                    <CheckCircle2
                      size={18} color={CI.teal}
                      style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true"
                    />
                  ) : null}
                  {submitted && isSelected && !isCorrect ? (
                    <XCircle
                      size={18} color={CI.red}
                      style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {submitted ? (
            <div
              ref={rationaleRef}
              tabIndex={-1}
              role="status"
              style={{
                marginTop: 14, padding: 14, borderRadius: 14,
                background: isCorrect ? CI.tealSoft : '#FFF4ED',
                border: '1px solid ' + (isCorrect ? CI.tealMuted : '#E7A77C'),
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: isCorrect ? CI.tealDark : CI.orangeDark, marginBottom: 6,
              }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6 }}>{question.rationale}</div>
              <div style={{ marginTop: 10 }}><SourceChips refs={question.sourceRefs} /></div>
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{
              minHeight: 44, padding: '0 16px', borderRadius: 12,
              border: '1px solid ' + CI.border, background: '#fff',
              color: CI.tealDark, fontWeight: 800, cursor: 'pointer',
            }}>
              Exit
            </button>
            <button
              type="button"
              onClick={advance}
              disabled={selected === null}
              style={{
                flex: 1, minHeight: 48, border: 0, borderRadius: 12,
                background: CI.orangeButton, color: '#fff', fontWeight: 800,
                fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: selected === null ? 'not-allowed' : 'pointer',
                opacity: selected === null ? 0.5 : 1,
              }}
            >
              {submitted
                ? idx === QUIZ.length - 1 ? 'See results' : 'Next scenario'
                : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'achc-art-m01-progress-v1';

export interface ACHCARTM01Progress {
  version: 1;
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers: (number | null)[];
  quizIdx: number;
  quizFinished: boolean;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizAttempts: number;
  lastScore?: number;
  bestScore?: number;
}

export interface ACHCARTM01Props {
  onSaveExit?: (progress: ACHCARTM01Progress) => void;
  onPassed?: (result: { moduleId: string; score: number; attempts: number }) => void;
}

function emptyProgress(): ACHCARTM01Progress {
  return {
    version: 1,
    pageIndex: 0,
    mode: 'lessons',
    completedByPage: {},
    quizAnswers: Array(QUIZ.length).fill(null),
    quizIdx: 0,
    quizFinished: false,
    quizSelected: null,
    quizSubmitted: false,
    quizAttempts: 0,
  };
}

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number) {
  return Number.isInteger(value)
    ? Math.max(minimum, Math.min(maximum, value as number))
    : fallback;
}

function sanitizeProgress(value: unknown): ACHCARTM01Progress {
  const fallback = emptyProgress();
  if (!value || typeof value !== 'object') return fallback;
  const input = value as Record<string, unknown>;
  const completedByPage: Record<number, string[]> = {};
  const rawCompleted =
    input.completedByPage && typeof input.completedByPage === 'object'
      ? input.completedByPage as Record<string, unknown>
      : {};
  PAGES.forEach((page) => {
    const allowed = new Set(page.hotspots.map((hotspot) => hotspot.id));
    const rawIds: unknown[] = Array.isArray(rawCompleted[String(page.id)])
      ? rawCompleted[String(page.id)] as unknown[]
      : [];
    completedByPage[page.id] = Array.from(
      new Set(rawIds.filter((id): id is string => typeof id === 'string' && allowed.has(id))),
    );
  });
  const rawAnswers = Array.isArray(input.quizAnswers) ? input.quizAnswers : [];
  const quizAnswers = Array.from({ length: QUIZ.length }, (_, index) => {
    const answer = rawAnswers[index];
    return Number.isInteger(answer) && (answer as number) >= 0 && (answer as number) <= 3
      ? answer as number
      : null;
  });
  const quizIdx = clampInteger(input.quizIdx, 0, QUIZ.length - 1, 0);
  const selected =
    Number.isInteger(input.quizSelected)
    && (input.quizSelected as number) >= 0
    && (input.quizSelected as number) <= 3
      ? input.quizSelected as number
      : null;
  const lastScore =
    Number.isFinite(input.lastScore) && (input.lastScore as number) >= 0
      ? Math.min(100, Math.round(input.lastScore as number))
      : undefined;
  const bestScore =
    Number.isFinite(input.bestScore) && (input.bestScore as number) >= 0
      ? Math.min(100, Math.round(input.bestScore as number))
      : undefined;
  return {
    version: 1,
    pageIndex: clampInteger(input.pageIndex, 0, PAGES.length - 1, 0),
    mode: input.mode === 'quiz' ? 'quiz' : 'lessons',
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished: input.quizFinished === true,
    quizSelected: selected,
    quizSubmitted: input.quizSubmitted === true && selected !== null,
    quizAttempts: clampInteger(input.quizAttempts, 0, Number.MAX_SAFE_INTEGER, 0),
    ...(lastScore === undefined ? {} : { lastScore }),
    ...(bestScore === undefined ? {} : { bestScore }),
  };
}

function loadProgress(): ACHCARTM01Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress: ACHCARTM01Progress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

export default function ACHCARTM01({ onSaveExit, onPassed }: ACHCARTM01Props = {}) {
  const [initial] = useState(loadProgress);
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial.mode);
  const [pageIndex, setPageIndex] = useState(initial.pageIndex);
  const [completedByPage, setCompletedByPage] =
    useState<Record<number, string[]>>(initial.completedByPage);
  const [quizState, setQuizState] = useState<QuizState>({
    answers: initial.quizAnswers,
    idx: initial.quizIdx,
    finished: initial.quizFinished,
    selected: initial.quizSelected,
    submitted: initial.quizSubmitted,
  });
  const [quizAttempts, setQuizAttempts] = useState(initial.quizAttempts);
  const [lastScore, setLastScore] = useState(initial.lastScore);
  const [bestScore, setBestScore] = useState(initial.bestScore);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ids = useId().replace(/:/g, '');
  const page = PAGES[pageIndex];
  const completed = completedByPage[page.id] ?? [];

  const snapshot = useCallback(
    (patch: Partial<ACHCARTM01Progress> = {}): ACHCARTM01Progress => ({
      version: 1,
      pageIndex,
      mode,
      completedByPage,
      quizAnswers: quizState.answers,
      quizIdx: quizState.idx,
      quizFinished: quizState.finished,
      quizSelected: quizState.selected,
      quizSubmitted: quizState.submitted,
      quizAttempts,
      ...(lastScore === undefined ? {} : { lastScore }),
      ...(bestScore === undefined ? {} : { bestScore }),
      ...patch,
    }),
    [bestScore, completedByPage, lastScore, mode, pageIndex, quizAttempts, quizState],
  );

  useEffect(() => {
    saveProgress(snapshot());
  }, [snapshot]);

  const selectTab = (tabIndex: number) => {
    if (tabIndex === PAGES.length) setMode('quiz');
    else {
      setMode('lessons');
      setPageIndex(tabIndex);
    }
  };

  const selectedTabIndex = mode === 'quiz' ? PAGES.length : pageIndex;
  const handleTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = PAGES.length + 1;
    let next = selectedTabIndex;
    if (event.key === 'ArrowRight') next = (selectedTabIndex + 1) % count;
    else if (event.key === 'ArrowLeft') next = (selectedTabIndex - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    selectTab(next);
    window.requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  const handleSaveExit = () => {
    const progress = snapshot();
    saveProgress(progress);
    if (onSaveExit) onSaveExit(progress);
    else if (typeof window !== 'undefined') window.history.back();
  };

  const handleQuizFinish = (score: number, percent: number, passed: boolean) => {
    const nextAttempts = quizAttempts + 1;
    const nextBest = Math.max(bestScore ?? 0, percent);
    setQuizAttempts(nextAttempts);
    setLastScore(percent);
    setBestScore(nextBest);
    saveProgress(snapshot({
      mode: 'quiz',
      quizFinished: true,
      quizAttempts: nextAttempts,
      lastScore: percent,
      bestScore: nextBest,
    }));
    if (passed) {
      onPassed?.({ moduleId: MODULE_META.id, score, attempts: nextAttempts });
    }
  };

  return (
    <div className="achcartm01 achcartm01-shell">
      <style>{STYLES}</style>
      <header className="achcartm01-top">
        <div className="achcartm01-brand">
          <BrandMark size={28} />
          <span className="brand-text">Cultural Humility</span>
        </div>
        <div
          className="achcartm01-tabs"
          role="tablist"
          aria-label="Module lessons"
          onKeyDown={handleTabsKeyDown}
        >
          {PAGES.map((lesson, index) => {
            const selectedTab = mode === 'lessons' && index === pageIndex;
            return (
              <button
                key={lesson.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={ids + '-tab-' + index}
                type="button"
                role="tab"
                aria-selected={selectedTab}
                aria-controls={ids + '-lesson-panel'}
                tabIndex={selectedTab ? 0 : -1}
                className={'achcartm01-tab ' + (selectedTab ? 'active' : '')}
                onClick={() => selectTab(index)}
              >
                {lesson.shortName}
              </button>
            );
          })}
          <button
            ref={(element) => { tabRefs.current[PAGES.length] = element; }}
            id={ids + '-tab-quiz'}
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            aria-controls={ids + '-quiz-panel'}
            tabIndex={mode === 'quiz' ? 0 : -1}
            className={'achcartm01-tab quiz-tab ' + (mode === 'quiz' ? 'active' : '')}
            onClick={() => selectTab(PAGES.length)}
          >
            Knowledge Check
          </button>
        </div>
        <button type="button" className="achcartm01-exit" onClick={handleSaveExit}>
          Save &amp; Exit
        </button>
      </header>

      {mode === 'quiz' ? (
        <div
          id={ids + '-quiz-panel'}
          role="tabpanel"
          aria-labelledby={ids + '-tab-quiz'}
          style={{ minHeight: 0, overflow: 'hidden' }}
        >
          <QuizPage
            onBack={() => setMode('lessons')}
            initialState={quizState}
            attempts={quizAttempts}
            bestScore={bestScore}
            onPersist={setQuizState}
            onFinish={handleQuizFinish}
          />
        </div>
      ) : (
        <div
          id={ids + '-lesson-panel'}
          role="tabpanel"
          aria-labelledby={ids + '-tab-' + pageIndex}
          className="achcartm01-work"
        >
          <aside className="achcartm01-left">
            <LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} />
          </aside>
          <section className="achcartm01-right" aria-label="Interactive lesson scene">
            <RightPanel
              page={page}
              completed={completed}
              setCompleted={(idsForPage) =>
                setCompletedByPage((previous) => ({ ...previous, [page.id]: idsForPage }))
              }
              onGoQuiz={() => setMode('quiz')}
            />
          </section>
        </div>
      )}

      <footer className="achcartm01-bot">
        <button
          type="button"
          className="nav"
          disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((index) => Math.max(0, index - 1));
          }}
        >
          <ChevronLeft size={16} aria-hidden="true" /> Prev
        </button>
        <span className="achcartm01-footer-label" style={{
          fontSize: 12, fontWeight: 800, letterSpacing: '.08em',
          textTransform: 'uppercase', color: CI.tealDark, background: CI.tealSoft,
          border: '1px solid ' + CI.tealMuted, borderRadius: 8,
          padding: '8px 12px', textAlign: 'center',
        }}>
          {mode === 'quiz'
            ? 'Knowledge Check · 10 items · 80% pass'
            : 'Lesson ' + (pageIndex + 1) + ' of ' + PAGES.length + ' · ' + page.shortName}
        </span>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>
            Back to Lessons <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>
            Knowledge Check <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="next"
            onClick={() => setPageIndex((index) => Math.min(PAGES.length - 1, index + 1))}
          >
            Next · {PAGES[pageIndex + 1].shortName}{' '}
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </footer>
    </div>
  );
}
