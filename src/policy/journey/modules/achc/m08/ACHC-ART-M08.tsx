/**
 * ACHC-ART-M08 — Patient Rights & Responsibilities
 * Pass 5 learner module | On hire and annually | All applicable field workers
 * Pages: 7 scenes + Knowledge Check | Hotspots: 35 | Quiz: 10 | Pass: 80%
 * Knowledge training only: completion does not expand scope, validate competency,
 * authorize independent practice, create a certificate, or make a personnel-file entry.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-rights-notice.png';
import img02 from './assets/lesson-02-dignity-respect.png';
import img03 from './assets/lesson-03-informed-participation.png';
import img04 from './assets/lesson-04-consent-refusal.png';
import img05 from './assets/lesson-05-complaints.png';
import img06 from './assets/lesson-06-transfer-responsibilities.png';
import img07 from './assets/lesson-07-rights-at-door.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeDark: '#B94716', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'protected' | 'support' | 'violation' | 'guidance';
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
  overview: string[]; details: string[]; keyPoints: KeyPoint[]; clinicalTip: string;
  imageAlt: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }
type QuizProgressState = {
  answers: (number | null)[];
  idx: number;
  finished: boolean;
  selected: number | null;
  submitted: boolean;
  attempts: number;
  lastScore: number | null;
};

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  protected: { label: 'Right protected', color: CI.teal, soft: CI.tealSoft },
  support: { label: 'Clarify and support', color: CI.orangeDark, soft: '#FFF3EC' },
  violation: { label: 'Rights violation', color: CI.red, soft: '#FEF2F2' },
  guidance: { label: 'Field guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'ACHC-ART-M08', title: 'Patient Rights & Responsibilities', pages: 7, quizCount: 10, passing: 80 };

const NEW_PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Notice',
    title: 'Rights Begin Before Care',
    subtitle: 'Notice, access, understanding, and representative participation',
    overview: [
      "Patient rights are not paperwork completed after care begins. The patient and legal representative, if any, receive the written rights-and-responsibilities notice during the initial evaluation visit and before care is furnished. The notice includes the agency's transfer and discharge policies, the administrator's complaint contact, and an OASIS privacy notice when OASIS information will be collected.",
      "The information must be offered in a language and manner the patient understands. A signature acknowledges receipt; it does not surrender a right, prove agreement with every decision, or replace consent for care. Questions, a request for another format, or inability to sign must never be treated as refusal of services."
    ],
    details: [
      "At the initial evaluation and before the first service, the agency provides the patient and legal representative written rights, responsibilities, and transfer/discharge policies and obtains acknowledgment of receipt. When OASIS data will be collected, it also provides the OASIS privacy notice. The materials identify the administrator's complaint contact and the applicable State home-health hotline.",
      "Accessible communication is part of the right. Identify the preferred language and any vision, hearing, speech, cognitive, literacy, or motor-access need. Arrange qualified interpretation, large print, accessible electronic material, audio support, or another appropriate aid at no cost. A chosen relative may support the conversation, but do not delegate important rights or consent information to a minor child or unqualified interpreter.",
      "Use plain language and pause often. Explain how to exercise a right, where to ask questions, and whom to contact. Teach-back is useful: ask the patient to explain in their own words how they would raise a concern or request another copy. Teach-back checks the clarity of the explanation; it is not a test of intelligence and should never be documented as patient failure.",
      "Representatives require careful verification. A court-appointed guardian, healthcare agent, legal representative, and patient-selected representative may have different authority. Family presence alone does not transfer decision-making power. Confirm the person's role in the approved record and continue speaking directly to the patient to the greatest extent possible. Field workers do not decide capacity or invent representative authority at the door.",
      "If the patient selects a representative to receive rights information, the HHA must provide that representative the written notice within four business days of the initial evaluation visit. The worker should capture the selection through the approved workflow and notify the responsible admission or supervisory team. Do not promise that any family member automatically receives the full clinical record or controls care.",
      "An acknowledgment signature proves delivery, not waiver. If a physical limitation prevents signing, follow the agency's approved alternative-acknowledgment process. Record the date, the version or packet used, the recipient, the language and format, the interpreter or aid used, questions raised, and how receipt was acknowledged. Never backdate a signature or sign for a patient.",
      "If you learn that the notice is missing, unreadable, outdated, not understood, or lacks the current location-specific complaint contacts, do not reconstruct legal language or a hotline number from memory. Protect today's care, notify intake or the supervising clinician, and arrange the current approved packet. Contact information can change, so the current approved materials and the patient's service location govern which operational contacts are provided."
    ],
    keyPoints: [
      { icon: '📄', title: 'Verify delivery', detail: 'Rights and transfer/discharge information arrive before care.' },
      { icon: '🗣️', title: 'Make it accessible', detail: 'Use qualified language services and needed auxiliary aids.' },
      { icon: '👤', title: 'Center the patient', detail: 'Verify representative role; never presume family authority.' },
      { icon: '✍️', title: 'Document receipt', detail: 'Record format, language, assistance, questions, and acknowledgment.' }
    ],
    clinicalTip: 'A signature proves delivery—not surrender of rights.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(a), (f)' },
      { kind: 'California', text: '22 CCR § 74743(a), (g)' },
      { kind: 'Care Indeed', text: 'CL-PR-001 v1.0 (2025-07-10); OP-PA-003' }
    ],
    imageAlt: 'A home-health nurse reviews a rights folder with an older patient and his chosen supporter; an interpreter device, tablet, and acknowledgment clipboard are on the table.',
    sceneImage: img01,
    hotspots: [
      {
        id: 'rights-packet', label: 'Current rights and transfer/discharge notice', shortLabel: 'Rights Notice', x: 42, y: 62, zone: 'protected',
        info: 'A current rights folder is being reviewed before care starts.',
        meaning: 'The patient must receive understandable written rights and the agency transfer/discharge policies during the initial evaluation and before services are furnished.',
        action: 'Use the approved current packet, explain how to exercise rights, and invite questions before beginning care.',
        notify: 'Admission clinician or supervisor if the notice is missing, outdated, or not understood.',
        document: 'Date, recipient, packet/version, explanation, questions, and acknowledgment method.',
        policyRefs: ['42 CFR § 484.50(a)(1)-(2)', '22 CCR § 74743(a)', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'language-access', label: 'Language and accessibility support', shortLabel: 'Language & Access', x: 78, y: 72, zone: 'support',
        info: 'A tablet and speaker device are available for qualified interpretation and accessible communication.',
        meaning: "Language services and auxiliary aids must match the patient's identified need and be provided without charging the patient.",
        action: 'Pause, arrange the qualified service or aid, address the patient directly, and confirm understanding.',
        notify: 'Supervisor or language-access coordinator when the requested support is not immediately available.',
        document: 'Preferred language, accessibility need, service or aid used, and teach-back result.',
        policyRefs: ['42 CFR § 484.50(f)', 'OP-PA-003']
      },
      {
        id: 'acknowledgment', label: 'Acknowledgment of receipt', shortLabel: 'Receipt', x: 66, y: 88, zone: 'guidance',
        info: 'The clipboard is ready for acknowledgment after the information is explained.',
        meaning: 'Acknowledgment confirms delivery. It does not waive rights, replace consent, or prove agreement with all care decisions.',
        action: 'Follow the approved alternative process if the patient cannot sign; never sign on the patient\'s behalf.',
        notify: 'Admission clinician if acknowledgment cannot be completed through the standard method.',
        document: 'How receipt was acknowledged and any reason an alternative method was used.',
        policyRefs: ['42 CFR § 484.50(a)(2)', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'representative', label: 'Verified representative participation', shortLabel: 'Representative', x: 84, y: 42, zone: 'support',
        info: 'The patient chose a supporter to join the discussion while remaining the center of the conversation.',
        meaning: 'Family presence does not itself establish legal authority. The representative role must be verified and the patient remains involved as much as possible.',
        action: 'Ask the patient how the supporter should participate and verify the documented role before sharing or accepting decisions.',
        notify: 'Supervisor when authority is unclear, disputed, or inconsistent with the record.',
        document: 'Who was present, the verified role, the patient\'s preference, and any escalation.',
        policyRefs: ['42 CFR § 484.50(a)(4), (b)', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'contact-sheet', label: 'Administrator and State HHA complaint contacts', shortLabel: 'Help & Hotline', x: 44, y: 84, zone: 'guidance',
        info: 'The communication phone beside the rights materials represents access to current agency and outside complaint contacts.',
        meaning: 'The patient may need agency and outside complaint contacts. California complaint contacts are location-specific and can change.',
        action: 'Provide the current approved contact sheet for the patient\'s service location; do not rely on a memorized number.',
        notify: 'Administrator or supervisor if the contact sheet is absent or appears outdated.',
        document: 'Which current contact information was provided and when.',
        policyRefs: ['42 CFR § 484.50(a)(1)(ii), (c)(9)', '22 CCR § 74743(g)']
      }
    ]
  },
  {
    id: 1,
    shortName: 'Respect',
    title: 'Respect in the Patient’s Home',
    subtitle: 'Dignity, identity, privacy, property, and freedom from harm',
    overview: [
      "Home health care occurs in the patient's private living space. A scheduled visit authorizes neither entry without permission nor unrestricted access to the home. Announce yourself, display the required identification, explain your role and the visit, and ask before entering, touching the patient, moving belongings, opening storage, or involving another household member.",
      "Patients have the right to respectful, nondiscriminatory care; confidential records; and freedom from abuse, neglect, exploitation, injury of unknown source, and property misappropriation. Ordinary courtesy, privacy habits, and prompt reporting are how those rights become real during a field visit."
    ],
    details: [
      "Respect begins at the threshold. Knock or announce yourself even when the visit is expected. Confirm identity using the approved process, show your agency identification, state your name and function, and wait for permission to enter. If entry is refused, do not force the door, argue, or ask a neighbor to let you in. Assess known immediate risk within role, notify the appropriate team, and document the facts.",
      "Ask how the patient wants to be addressed and use that name and form of address. Avoid pet names, infantilizing language, jokes about age or disability, and assumptions based on race, religion, sex, national origin, disability, sexual orientation, gender identity, family structure, diagnosis, or payer. Individual preferences matter more than stereotypes. When you make a mistake, correct it simply and respectfully.",
      "Permission is task-specific. Explain before touching the patient, positioning a limb, moving a chair, opening a refrigerator for ordered supplies, or involving a caregiver. A prior visit or general consent form does not justify every later action. Watch for verbal refusal, pulling away, hesitation, facial distress, or a request to pause. Stop and clarify rather than interpreting silence as permission.",
      "Protect privacy in a home that may contain relatives, visitors, contractors, or neighbors. Ask the patient who may remain for the conversation. Close a door or curtain when appropriate, lower your voice, position screens away from others, lock the device when stepping away, and keep papers under your control. Do not discuss the patient's condition with someone merely because that person is in the room.",
      "Respect for property means no borrowing, searching, photographing, moving, using, or removing belongings without a care need and permission. Keep supplies separate from valuables. If an item must move for safety, explain and ask where to place it. Disclose accidental damage, prevent further harm, report it, and document facts. Never conceal or privately replace damage.",
      "Freedom from abuse covers verbal, mental, sexual, and physical abuse; neglect; exploitation; injuries of unknown source; and misappropriation of property. Warning signs can appear through observation, a direct disclosure, unexplained injury, fearful behavior, missing necessities, or a property concern. A field worker does not need proof before following a mandated or agency reporting duty.",
      "When harm is suspected, address immediate safety and call emergency help for an immediate threat. Make required agency and external reports, preserve exact words and objective observations, and cooperate with authorized investigators. Do not confront the suspected perpetrator, interview neighbors, promise secrecy, decide credibility, or disturb possible evidence."
    ],
    keyPoints: [
      { icon: '🚪', title: 'Ask permission', detail: 'Entry, touch, belongings, and participation require respect.' },
      { icon: '🔒', title: 'Protect privacy', detail: 'Control conversations, screens, documents, and who is present.' },
      { icon: '🏠', title: 'Preserve property', detail: 'Do not borrow, search, move, or remove without permission.' },
      { icon: '🛡️', title: 'Report harm', detail: 'Protect, report, and document—never investigate alone.' }
    ],
    clinicalTip: 'In home health, courtesy is not cosmetic—it is how rights become real.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(1)-(3), (6), (e)(2)' },
      { kind: 'California', text: '22 CCR § 74743(b), (d)' },
      { kind: 'Care Indeed', text: 'CL-PR-001 v1.0 (2025-07-10); CL-PR-006; OP-PA-005' }
    ],
    imageAlt: 'A clinician wearing identification listens at eye level to a seated patient while her supporter waits nearby; a closed privacy folder, keepsake, handbag, and phone remain visible.',
    sceneImage: img02,
    hotspots: [
      {
        id: 'entry-id', label: 'Permission to enter and staff identity', shortLabel: 'Entry & ID', x: 70, y: 48, zone: 'protected',
        info: 'The clinician\'s identification is visible and the visit begins with a respectful introduction.',
        meaning: 'The patient has the right to know who is providing care and to control entry into the home.',
        action: 'Announce yourself, show identification, explain the visit, and wait for permission before entering or starting.',
        notify: 'Scheduling or the supervisor if entry is refused or identity cannot be verified.',
        document: 'Arrival, identity verification, permission or refusal, safety assessment, and notification.',
        policyRefs: ['CL-PR-001 v1.0 (2025-07-10)', '42 CFR § 484.50(c)(1)']
      },
      {
        id: 'chosen-address', label: 'Patient identity and chosen form of address', shortLabel: 'Chosen Address', x: 26, y: 44, zone: 'protected',
        info: 'The clinician speaks directly to the patient at eye level rather than speaking around her.',
        meaning: 'Dignity includes respectful language, individualized identity, preferences, and freedom from discrimination.',
        action: 'Ask how the patient wishes to be addressed and correct mistakes without defensiveness.',
        notify: 'Supervisor if discriminatory conduct or repeated disrespect is observed or reported.',
        document: 'Relevant communication preference and any reported rights concern.',
        policyRefs: ['42 CFR § 484.50(c)(1)', '22 CCR § 74743(b)', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'privacy-folder', label: 'Privacy during care and conversation', shortLabel: 'Private Care', x: 66, y: 80, zone: 'support',
        info: 'The clinical folder is closed while a household visitor is present.',
        meaning: 'Presence in the home does not automatically authorize access to confidential information.',
        action: 'Ask whom the patient permits to participate; secure the folder and position screens away from others.',
        notify: 'Privacy Officer or supervisor for an actual or suspected unauthorized disclosure.',
        document: 'Privacy preference, authorized participants, safeguard used, and any incident reported.',
        policyRefs: ['42 CFR § 484.50(c)(6)', 'CO-HP-001', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'property', label: 'Personal property and belongings', shortLabel: 'Property', x: 86, y: 69, zone: 'protected',
        info: 'The patient\'s keepsake, handbag, and phone remain under her control.',
        meaning: 'Workers may not borrow, search, remove, or use patient property for convenience.',
        action: 'Ask before moving an item; disclose and report any accidental damage or allegation promptly.',
        notify: 'Supervisor for damage, missing property, or an allegation of misappropriation.',
        document: 'Item, condition, exact circumstances, patient statement, action, and notification.',
        policyRefs: ['42 CFR § 484.50(c)(2)', 'OP-PA-005']
      },
      {
        id: 'mistreatment', label: 'Possible abuse, neglect, or exploitation', shortLabel: 'Report Harm', x: 42, y: 25, zone: 'violation',
        info: 'The scene reminds the worker to notice fear, injury, missing necessities, or a disclosure of mistreatment.',
        meaning: 'Reasonable suspicion can trigger immediate agency and legal reporting duties; proof is not the field worker\'s job.',
        action: 'Protect immediate safety, make required reports, preserve exact words and objective findings, and do not investigate.',
        notify: 'Emergency services for immediate danger; DON and required authority under the worker\'s reporting duty.',
        document: 'Objective findings, verbatim statement, immediate safety action, reports, and disposition.',
        policyRefs: ['42 CFR § 484.50(e)(2)', 'Cal. Welf. & Inst. Code § 15630 (when applicable)', 'CL-PR-006']
      }
    ]
  },
  {
    id: 2,
    shortName: 'Participation',
    title: 'Informed Participation in Care',
    subtitle: 'Plan, people, frequency, outcomes, changes, and charges',
    overview: [
      "Participation is more than receiving instructions. The patient has the right to be informed about and participate in assessment, care planning, visit frequency, the disciplines providing care, expected outcomes, patient-identified goals, anticipated risks and benefits, treatment factors, and changes in care.",
      "Field workers explain the authorized service in plain language, invite questions, verify understanding, and route requested changes. They do not independently revise orders, guess about coverage, or dismiss a missed service as someone else's problem."
    ],
    details: [
      "At every visit, introduce your role, identify the scheduled service, and explain what you plan to do before beginning. Connect the activity to the current plan of care and the patient's own goals. Describe material risks, benefits, and alternatives within your role and training. If the question exceeds your authority, say so honestly and connect the patient with the person who can answer.",
      "Patients participate in the plan throughout the episode, not only at admission. Invite preferences and goals; listen for changes in what matters to the patient; and communicate requests for revision to the authorized clinician. Participation does not guarantee every requested service or a preferred individual worker, but requests must be received respectfully and evaluated through the care-planning process.",
      "The patient is informed about which disciplines will provide care and how often they are expected to visit. An unexplained change in nursing, therapy, aide, or social-work frequency deserves prompt attention. Verify the current authorized plan, explain only confirmed information, notify the responsible clinician, and document the discrepancy. Never independently restore, add, or cancel a service.",
      "Patients have the right to receive the services in the plan of care. A missed or shortened visit, repeated lateness, or omitted task can be a rights, scheduling, and clinical concern. Address safety and continuity, route the issue, and document what was and was not provided. Do not dismiss it as only an office matter.",
      "Use understandable education and teach-back. Avoid unexplained clinical abbreviations or payer jargon. Ask the patient to describe the plan in their own words or show how they will follow a safety step. If teach-back reveals confusion, revise the explanation, use another format or language support, and repeat. Document what was taught, the method, the response, and follow-up needs.",
      "Financial information is part of informed participation. Before care starts, patients receive oral and written information about expected payment from known federal programs, limitations or non-covered services, and charges they may have to pay. Relevant changes must be communicated as soon as possible and before the next home-health visit. Formal notices may be required before anticipated non-covered care or reduction or termination of ongoing care.",
      "Do not promise coverage, quote an unverified price, or pressure a patient while a material charge is unclear. Pause disputed non-urgent activity when appropriate and contact billing and clinical leadership so the patient can decide after accurate information. Document the question and verified response without making a coverage determination."
    ],
    keyPoints: [
      { icon: '💬', title: 'Explain the service', detail: 'Describe what, why, who, frequency, goals, risks, and outcomes.' },
      { icon: '🎯', title: 'Invite participation', detail: 'Ask about goals, preferences, questions, and requested changes.' },
      { icon: '🔁', title: 'Verify understanding', detail: 'Use plain language, access supports, and teach-back.' },
      { icon: '📞', title: 'Route changes', detail: 'Never alter the plan or speculate about coverage independently.' }
    ],
    clinicalTip: 'Participation means the plan is discussed with the patient—not merely displayed to the patient.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(4)-(5), (7)-(8), (12)' },
      { kind: 'California', text: '22 CCR § 74743(c), (e)-(f)' },
      { kind: 'Care Indeed', text: 'CL-PR-001 v1.0 (2025-07-10); CL-CP-001; FN-BC-003' }
    ],
    imageAlt: 'A patient points to an abstract care-plan tablet while a clinician and supporter listen; a calendar, charge envelope, service folder, and phone are arranged separately on the table.',
    sceneImage: img03,
    hotspots: [
      {
        id: 'care-plan', label: 'Participation in the plan of care', shortLabel: 'Care Plan', x: 52, y: 58, zone: 'protected',
        info: 'The patient points to the care-plan display while the clinician listens.',
        meaning: 'Patients participate in establishing and revising the plan and receive information needed for meaningful decisions.',
        action: 'Review the authorized service, invite goals and preferences, and route requested revisions.',
        notify: 'Responsible clinician when the patient requests a change or the plan appears inconsistent.',
        document: 'Request, information provided, teach-back, notification, and response.',
        policyRefs: ['42 CFR § 484.50(c)(4)', '22 CCR § 74743(c)', 'CL-CP-001']
      },
      {
        id: 'visit-calendar', label: 'Disciplines and visit frequency', shortLabel: 'Visits', x: 18, y: 78, zone: 'support',
        info: 'The visit calendar shows who is expected and how often.',
        meaning: 'Patients are informed of disciplines, planned visit frequency, and changes in care.',
        action: 'Verify the current plan and report any unexplained schedule or discipline change.',
        notify: 'Case manager or supervisor for a variance, missed visit, or unexplained change.',
        document: 'Expected and actual service, patient concern, notification, and continuity action.',
        policyRefs: ['42 CFR § 484.50(c)(4)(iv)-(v), (viii)', 'CL-PR-001 v1.0 (2025-07-10)']
      },
      {
        id: 'service-folder', label: 'Services and expected outcomes', shortLabel: 'Services', x: 70, y: 80, zone: 'protected',
        info: 'A separate service folder supports discussion of goals, expected outcomes, risks, and benefits.',
        meaning: 'The patient should understand the services in the plan and how they connect to patient-identified goals.',
        action: 'Use plain language, explain within role, and ask the patient to describe the plan in their own words.',
        notify: 'Responsible clinician for unanswered clinical questions or goals not reflected in the plan.',
        document: 'Topics explained, goals discussed, teach-back, and follow-up requested.',
        policyRefs: ['42 CFR § 484.50(c)(4)(vi)-(vii), (c)(5), (c)(12)']
      },
      {
        id: 'charge-envelope', label: 'Charges and coverage changes', shortLabel: 'Charges', x: 46, y: 84, zone: 'support',
        info: 'A separate envelope represents financial information that must be accurate and timely.',
        meaning: 'Patients receive advance information about expected payment, non-covered care, and patient charges, including relevant changes.',
        action: 'Do not guess. Route the question and preserve the patient\'s opportunity to decide after verified information.',
        notify: 'Billing and the responsible clinical lead before disputed non-urgent service when appropriate.',
        document: 'Question, service at issue, verified response, notice provided, and patient decision.',
        policyRefs: ['42 CFR § 484.50(c)(7)-(8)', '22 CCR § 74743(e)-(f)', 'FN-BC-003']
      },
      {
        id: 'change-phone', label: 'Care-change escalation', shortLabel: 'Route Care', x: 88, y: 76, zone: 'guidance',
        info: 'The phone is ready for real-time clarification from the authorized team.',
        meaning: 'Field-worker judgment supports care but does not independently rewrite orders, frequencies, or payer decisions.',
        action: 'Continue only authorized care that remains safe, then notify the appropriate clinician or department.',
        notify: 'Case manager, supervisor, billing, or on-call lead based on the question and urgency.',
        document: 'Objective issue, time of contact, person reached, instructions, and final action.',
        policyRefs: ['CL-CP-001', 'CL-CD-001', '42 CFR § 484.50(c)(4)']
      }
    ]
  },
  {
    id: 3,
    shortName: 'Choice',
    title: 'Consent, Refusal, and Decision Support',
    subtitle: 'Honor choices without abandoning safety',
    overview: [
      "Consent is ongoing, specific, understandable, and voluntary. A patient may refuse an assessment, visit, medication, procedure, or other service and may withdraw consent after care has begun. Stop the refused action; do not use force, pressure, shame, threats, or repeated badgering.",
      "Respecting refusal does not mean abandoning the patient. Clarify what is declined, address immediate safety within role, provide neutral information about known consequences, notify the proper clinician, and document. Advance-directive, POLST/DNR, capacity, and representative conflicts require escalation—not field-worker legal interpretation."
    ],
    details: [
      "Before care, explain the proposed action in understandable language and within your professional role: what will happen, why it is proposed, the expected benefit, meaningful risks, reasonable alternatives when applicable, and what may happen if the patient declines. Make room for questions. If the patient needs language or disability access support, arrange it before relying on consent.",
      "A signed form is not blanket permission. Consent can change with the task or new information. A clear no, request to wait, pulling away, guarding, or pause gesture requires you to stop and clarify. Do not ask a caregiver to restrain, distract, or pressure the patient so care can continue.",
      "Use a consistent refusal response. Stop or do not begin the action. Confirm exactly what the patient is refusing. Assess immediate safety within role. Explain likely consequences neutrally and within your knowledge. Offer time for questions or a permissible alternative without bargaining. Notify the appropriate clinician or supervisor based on urgency. Document the refusal, education, notifications, instructions, and outcome.",
      "A refusal may be limited. A patient might decline a dressing change today while accepting vital signs and education, or refuse one medication while accepting the rest of the visit. Clarify the boundaries of the choice. Do not label the entire patient 'non-compliant,' cancel unrelated care, or treat refusal as a waiver of privacy, dignity, complaint, or future participation rights.",
      "Do not confuse diagnosis or disagreement with lack of capacity. Dementia, psychiatric illness, disability, communication difficulty, age, or a choice that staff would not make does not automatically eliminate decision-making rights. Continue speaking to the patient and use communication supports. Field workers do not independently adjudicate capacity or resolve competing claims of authority.",
      "Advance directives express future wishes or name a healthcare agent. A POLST or out-of-hospital DNR is a medical order. A DNR addresses resuscitation after cardiac or respiratory arrest; it does not automatically mean no treatment, no comfort measures, no hospital transfer, or no emergency call. The agency documents whether an advance directive exists and does not condition care on whether the patient has one.",
      "Follow the current plan, verified orders, and role-specific emergency procedure. Do not validate a photocopy, accept a family interpretation, draft legal documents, or change an order. Immediately escalate a missing, unclear, apparently revoked, or inconsistent document. In an emergency, do not lose response time conducting bedside legal analysis."
    ],
    keyPoints: [
      { icon: '✋', title: 'Pause immediately', detail: 'Stop or do not begin the refused action.' },
      { icon: '💡', title: 'Inform, never coerce', detail: 'Explain known consequences and check understanding neutrally.' },
      { icon: '📞', title: 'Escalate conflict', detail: 'Report safety, capacity, representative, or directive uncertainty.' },
      { icon: '📝', title: 'Document precisely', detail: 'Capture the exact refusal, education, contacts, and outcome.' }
    ],
    clinicalTip: 'Respecting refusal means stopping the task—not stopping support.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(4); 42 CFR § 489.102' },
      { kind: 'California', text: 'EMSA, DNR and POLST Forms (accessed 2026-07-20)' },
      { kind: 'Care Indeed', text: 'CL-PR-002; CL-PR-003' }
    ],
    imageAlt: 'An older patient calmly raises a hand to pause a blood-pressure check; the nurse stops at eye level while a spouse, directive folder, phone, contact card, and unused cuff remain visible.',
    sceneImage: img04,
    hotspots: [
      {
        id: 'pause-gesture', label: 'Patient pauses or refuses care', shortLabel: 'Refusal', x: 46, y: 43, zone: 'protected',
        info: 'The patient gives a clear pause signal before a routine blood-pressure check.',
        meaning: 'Consent may be withdrawn before or during care; an order does not authorize force or coercion.',
        action: 'Stop, clarify what is refused, assess immediate safety, provide neutral education, and remain supportive.',
        notify: 'Appropriate clinician or supervisor according to urgency and agency procedure.',
        document: 'Specific refusal, patient\'s voluntarily stated reason, education, notifications, and disposition.',
        policyRefs: ['42 CFR § 484.50(c)(4)', 'CL-PR-003']
      },
      {
        id: 'bp-cuff', label: 'Ordered care does not override refusal', shortLabel: 'Ordered Care', x: 82, y: 85, zone: 'guidance',
        info: 'The blood-pressure cuff remains unused after the patient asks to pause.',
        meaning: 'A field worker may explain an ordered service but may not use the order to override a capable patient\'s current refusal.',
        action: 'Do not improvise, substitute, or continue by force; route alternatives to the authorized clinician.',
        notify: 'Supervising clinician when the refusal affects the plan or creates clinical risk.',
        document: 'Ordered service, portion declined or accepted, and care actually provided.',
        policyRefs: ['42 CFR § 484.50(c)(4)', 'CL-PR-003']
      },
      {
        id: 'directive-folder', label: 'Advance directive or healthcare agent record', shortLabel: 'Advance Directive', x: 36, y: 87, zone: 'support',
        info: 'A separate folder represents documented wishes or a designated healthcare agent.',
        meaning: 'Advance directives support future decision-making, but field workers do not draft, interpret, or independently rule on validity.',
        action: 'Verify status in the approved record, keep the patient involved when possible, and escalate discrepancies.',
        notify: 'Supervisor or authorized clinician for a missing, conflicting, or apparently changed directive.',
        document: 'Document reviewed or reported, source, discrepancy, contact, and instruction received.',
        policyRefs: ['42 CFR § 489.102', 'CL-PR-002']
      },
      {
        id: 'dnr-polst', label: 'POLST or DNR uncertainty', shortLabel: 'POLST / DNR', x: 62, y: 84, zone: 'support',
        info: 'The emergency contact card and directive materials require verification through the approved record.',
        meaning: 'A DNR concerns resuscitation; it is not a universal instruction to withhold all treatment or help.',
        action: 'Follow verified orders and role-specific emergency protocol; communicate available documents without making a legal ruling.',
        notify: 'Emergency responders and on-call leadership immediately when status is unclear during an emergency.',
        document: 'Patient condition, record status, document presented, emergency actions, contacts, and instructions.',
        policyRefs: ['California EMSA, DNR and POLST Forms (accessed 2026-07-20)', 'CL-PR-002']
      },
      {
        id: 'decision-support', label: 'Representative and decision-support boundary', shortLabel: 'Decision Support', x: 16, y: 50, zone: 'guidance',
        info: 'The spouse is available to support the conversation without speaking over the patient.',
        meaning: 'Supporters can assist, but diagnosis, age, or family status does not automatically remove the patient\'s authority.',
        action: 'Address the patient directly, verify any representative role, and seek help when capacity or authority is disputed.',
        notify: 'Supervisor or authorized clinician for capacity or representative conflict.',
        document: 'Who participated, verified role, patient communication, concern, and escalation.',
        policyRefs: ['42 CFR § 484.50(b), (c)(4)', 'CL-PR-001 v1.0 (2025-07-10)']
      }
    ]
  },
  {
    id: 4,
    shortName: 'Complaints',
    title: 'Complaints Without Retaliation',
    subtitle: 'Support the right, preserve facts, and route promptly',
    overview: [
      "A patient may complain about care furnished, care not furnished, inconsistent or inappropriate care, mistreatment, neglect, abuse, or lack of respect for person or property. The patient may use the agency process or contact an outside entity and must not be forced to complete one route before using another.",
      "The field worker's role is focused: listen, acknowledge, protect immediate safety, provide current contacts, preserve facts, route promptly, and prevent retaliation. Detailed intake, investigation, milestone, and resolution workflows belong in M03—not in this rights-framework module."
    ],
    details: [
      "Complaints may come from the patient, legal representative, patient-selected representative, caregiver, or family member. They may be spoken, written, signed, anonymous, emotional, calm, detailed, or incomplete. Do not make access to the complaint process depend on a particular form, perfect terminology, English fluency, or the worker's agreement with the concern.",
      "Listen without interruption and thank the person. Acknowledge the experience without deciding fault: 'I hear your concern about the missed visit, and I will route it now.' Avoid defensiveness, excuses, accusations, or promises that the agency will agree, discipline someone, refund a charge, or deliver a requested result.",
      "Patients may complain internally or externally. Do not tell them that the agency process must be exhausted before contacting the State, a payer, an accreditation body, or another permitted entity. Provide the current applicable contact information in an accessible format. Because California HHA complaint contacts are district-specific, use the patient's approved admission packet or current directory—not a memorized statewide number.",
      "Non-retaliation is immediate. A complaint must not trigger hostility, avoidance, reduced service, delay, a more restrictive approach, threat of discharge, or pressure to withdraw the concern. The agency must take steps to prevent further potential violations while a complaint is reviewed. Continue the authorized plan unless an approved clinical or safety decision changes it.",
      "Protect immediate safety first. If the complaint identifies present danger, suspected abuse, neglect, exploitation, or a serious clinical omission, activate the relevant emergency or reporting process in addition to complaint routing. Do not wait for a routine grievance review when urgent protection is required.",
      "Record who raised the concern, what was said, when and where it reportedly occurred, what you observed, immediate safety actions, contacts provided, and where it was routed. Quote only words you heard. Do not investigate or use labels such as difficult, unreliable, manipulative, or non-compliant.",
      "Response and resolution milestones belong to the current approved complaint workflow and the detailed M03 training. Do not promise a deadline, investigation result, or remedy unless the authorized grievance lead has confirmed it. If the patient asks when they will hear back, connect them with the administrator or designated grievance lead rather than inventing a date."
    ],
    keyPoints: [
      { icon: '👂', title: 'Receive respectfully', detail: 'Listen, thank, acknowledge, and avoid defensiveness.' },
      { icon: '🛡️', title: 'Protect immediately', detail: 'Address danger and prevent retaliation or further harm.' },
      { icon: '📨', title: 'Route, don’t investigate', detail: 'Use the current internal or outside contact pathway.' },
      { icon: '📝', title: 'Preserve facts', detail: 'Record exact words, observations, actions, and routing.' }
    ],
    clinicalTip: 'You do not need to agree with a complaint to protect the right to make it.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(c)(3), (9), (11), (e)' },
      { kind: 'California', text: '22 CCR § 74743(b), (g)' },
      { kind: 'Care Indeed', text: 'OP-PA-001; CL-PR-001 v1.0 (2025-07-10)' }
    ],
    imageAlt: 'A patient calmly raises a concern while a clinician listens; a phone, administrator contact card, State contact sheet, factual-notes clipboard, and unchanged visit calendar are visible.',
    sceneImage: img05,
    hotspots: [
      {
        id: 'listen', label: 'Patient voices a concern', shortLabel: 'Listen', x: 25, y: 45, zone: 'protected',
        info: 'The patient is speaking while the clinician listens without interrupting or arguing.',
        meaning: 'The right to complain does not depend on the worker agreeing with the concern.',
        action: 'Thank the patient, acknowledge the concern, clarify only what is needed for safe routing, and avoid assigning blame.',
        notify: 'Designated complaint lead or supervisor promptly under current policy.',
        document: 'Person reporting, exact concern, date/time, direct observations, and routing.',
        policyRefs: ['42 CFR § 484.50(c)(3), (e)', 'OP-PA-001']
      },
      {
        id: 'administrator-contact', label: 'Agency administrator complaint contact', shortLabel: 'Agency', x: 24, y: 90, zone: 'guidance',
        info: 'The agency contact card provides a direct path for questions or complaints.',
        meaning: 'Patients receive the administrator\'s contact information and may use the agency complaint process.',
        action: 'Provide the current contact and notify the designated agency lead; do not promise an outcome.',
        notify: 'Administrator, DON, or designated grievance lead according to current workflow.',
        document: 'Contact information provided, notification time, person reached, and next instruction.',
        policyRefs: ['42 CFR § 484.50(a)(1)(ii)', 'CL-PR-001 v1.0 (2025-07-10)', 'OP-PA-001']
      },
      {
        id: 'state-contact', label: 'Outside State HHA complaint option', shortLabel: 'State', x: 39, y: 90, zone: 'protected',
        info: 'A separate current sheet represents the applicable State HHA complaint contact.',
        meaning: 'The patient may contact an outside entity without first completing the agency process.',
        action: 'Respect the choice and provide current location-specific information in an accessible format.',
        notify: 'Supervisor if current outside contact information cannot be located.',
        document: 'Outside contact information provided and any access support arranged.',
        policyRefs: ['42 CFR § 484.50(c)(9), (11)', '22 CCR § 74743(g)']
      },
      {
        id: 'fact-note', label: 'Objective complaint documentation', shortLabel: 'Facts', x: 52, y: 86, zone: 'guidance',
        info: 'The closed clipboard is ready for contemporaneous factual documentation.',
        meaning: 'Defensible notes separate what the patient said, what the worker observed, and what action occurred.',
        action: 'Record exact words and observable facts; do not diagnose motive, decide credibility, or investigate.',
        notify: 'Complaint lead and any urgent safety/reporting channel indicated by the facts.',
        document: 'Who, what, when, where, verbatim statement, observation, safety action, contacts, and disposition.',
        policyRefs: ['42 CFR § 484.50(e)(1)(ii)', 'OP-PA-001', 'CL-CD-001']
      },
      {
        id: 'no-retaliation', label: 'Services continue without retaliation', shortLabel: 'No Retaliation', x: 73, y: 78, zone: 'violation',
        info: 'The visit calendar remains in place after the patient raises a concern.',
        meaning: 'Hostility, reduced care, delay, discrimination, or discharge threats because of a complaint violate patient rights.',
        action: 'Continue authorized care, protect the patient from further violation, and report any retaliatory conduct.',
        notify: 'Administrator, DON, or Compliance Officer for actual or threatened retaliation.',
        document: 'Conduct observed or reported, effect on care, protective action, notification, and response.',
        policyRefs: ['42 CFR § 484.50(c)(11), (e)(1)(iii)', 'OP-PA-001']
      }
    ]
  },
  {
    id: 5,
    shortName: 'Transition',
    title: 'Transfer, Discharge, and Shared Responsibilities',
    subtitle: 'Responsibilities support care; they do not erase rights',
    overview: [
      "The rights notice includes transfer and discharge policies. A field worker does not threaten, promise, negotiate, or independently initiate discharge. Federal home-health rules limit transfer or discharge to defined grounds and require added safeguards when behavior in the home seriously impairs safe care delivery.",
      "Patient responsibilities promote collaboration: accurate information, notice of changes or missed visits, questions, participation, mutually agreed financial obligations, and respectful interaction. They are not waivers. A refusal, complaint, missed appointment, or billing dispute does not cancel dignity, privacy, complaint, or non-retaliation rights."
    ],
    details: [
      "Federal rules permit transfer or discharge when the agency and practitioner agree needs can no longer be met and arrange safe transfer; payment ends; goals are achieved and HHA care is no longer needed; the patient refuses or chooses transfer/discharge; qualifying behavior seriously impairs care after safeguards; the patient dies; or the agency closes.",
      "Those grounds are not field-worker shortcuts. A patient who asks many questions, refuses one visit, files a complaint, requests an interpreter, has a disability, disputes a bill, or prefers a different schedule is not automatically eligible for discharge. Protected characteristics and exercise of rights may never be disguised as a transition decision.",
      "For discharge for cause based on behavior, the authorized agency process includes notice to the patient and representative, the ordering practitioner and subsequent practitioner when applicable, efforts to resolve the problem, information about other providers, and documentation of the problem and resolution efforts. A field worker reports facts and safety concerns; leadership determines whether the formal criteria and safeguards are met.",
      "If the home creates an immediate danger—such as a threatening person, accessible weapon, uncontrolled aggressive animal, heavy smoke near oxygen, or blocked emergency exit—protect yourself and the patient. Leave when necessary, call emergency help when indicated, notify leadership, and document observable facts. A safety pause is not the same as an instant discharge, and the worker should not use abandonment language.",
      "Patients receive accurate financial information and appropriate advance notice of relevant changes, anticipated non-covered care, reduction, or termination. Questions outside the field worker's role go to authorized billing or clinical personnel. Do not use an unexpected charge, loss of coverage, or disputed balance as leverage to obtain consent. Do not promise coverage or announce termination.",
      "Care Indeed asks patients, as able, to provide accurate health and medication information; report changes and other services; keep appointments or give notice; ask questions; cooperate with the agreed plan; meet agreed financial obligations; and treat staff respectfully. Explain how these actions support safety and help identify barriers.",
      "A responsibility concern begins support and care-team review, not punishment. If transportation, cognition, language, housing, caregiver strain, fear, or cost makes participation difficult, identify the barrier and arrange the right discipline or resource. Document specific behavior and its effect, not a judgmental label. During any authorized transition, support safe handoff, patient education, provider contacts, and transfer of relevant information under privacy rules."
    ],
    keyPoints: [
      { icon: '⚖️', title: 'Know the grounds', detail: 'Transfer and discharge occur only through defined agency authority.' },
      { icon: '🚫', title: 'Never threaten', detail: 'Questions, refusal, or complaints do not justify instant discharge.' },
      { icon: '🤝', title: 'Support responsibility', detail: 'Address barriers without treating expectations as waived rights.' },
      { icon: '📦', title: 'Protect transition', detail: 'Report facts and support an authorized, safe handoff.' }
    ],
    clinicalTip: 'A responsibility concern starts a care-team conversation—not an instant loss of rights.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(a)(1)(i), (c)(7)-(8), (d)' },
      { kind: 'California', text: '22 CCR § 74743(e)-(f)' },
      { kind: 'Care Indeed', text: 'CL-PR-001 v1.0 (2025-07-10); CL-CP-006; CL-CP-007' }
    ],
    imageAlt: 'A patient, therapist, and supporter review a transition folder; a payment information card, supply tote, pet gate, cane, and clear walkway support a safe planning discussion.',
    sceneImage: img06,
    hotspots: [
      {
        id: 'transition-folder', label: 'Authorized transfer or discharge process', shortLabel: 'Transfer Policy', x: 50, y: 60, zone: 'guidance',
        info: 'The transition folder is reviewed collaboratively rather than presented as a threat.',
        meaning: 'Only authorized agency leadership applies the permitted grounds, notices, and safeguards.',
        action: 'Answer within role, avoid promises or threats, and route questions to the responsible clinician or administrator.',
        notify: 'Case manager, DON, or administrator for a proposed or disputed transition.',
        document: 'Information provided, patient questions, authorized notice, contacts, and plan.',
        policyRefs: ['42 CFR § 484.50(a)(1)(i), (d)', 'CL-CP-006', 'CL-CP-007']
      },
      {
        id: 'safe-walkway', label: 'Objective home-safety concern', shortLabel: 'Safety Concern', x: 20, y: 48, zone: 'support',
        info: 'The clear walkway and pet gate show practical steps that support safe care delivery.',
        meaning: 'A hazard calls for protection, problem-solving, escalation, and documentation—not an unauthorized discharge threat.',
        action: 'Pause when unsafe, propose reasonable controls, leave if necessary, and follow the safety escalation path.',
        notify: 'Supervisor immediately for a serious threat; emergency services for immediate danger.',
        document: 'Specific hazard, requested control, patient/caregiver response, action, and notification.',
        policyRefs: ['42 CFR § 484.50(d)(5)', 'RM-PS-001']
      },
      {
        id: 'payment-change', label: 'Payment or coverage change', shortLabel: 'Payment', x: 44, y: 78, zone: 'support',
        info: 'A payment information card represents information that may affect the patient\'s choice.',
        meaning: 'Financial changes require accurate communication and may require formal notice before the next visit or service change.',
        action: 'Do not guess or pressure; route the question and preserve informed decision-making.',
        notify: 'Billing and the responsible clinical lead.',
        document: 'Question, notice available, verified explanation, patient decision, and follow-up.',
        policyRefs: ['42 CFR § 484.50(c)(7)-(8)', '22 CCR § 74743(e)-(f)', 'FN-BC-003']
      },
      {
        id: 'responsibility-card', label: 'Collaborative patient responsibilities', shortLabel: 'Shared Duties', x: 63, y: 82, zone: 'guidance',
        info: 'The reminder card represents appointments, accurate information, condition changes, and respectful communication.',
        meaning: 'Responsibilities support safe care but do not erase protected rights or authorize retaliation.',
        action: 'Explain the safety reason, identify barriers, offer support, and route concerns without punishment.',
        notify: 'Care team when a barrier affects safety, continuity, or the plan.',
        document: 'Specific responsibility concern, barrier, education, support offered, and team response.',
        policyRefs: ['CL-PR-001 v1.0 (2025-07-10)', '42 CFR § 484.50(c)(11)']
      },
      {
        id: 'safe-handoff', label: 'Safe transition and continuity', shortLabel: 'Handoff', x: 82, y: 80, zone: 'protected',
        info: 'The supply tote and planned exit path support an orderly, safe transition.',
        meaning: 'When transfer is authorized, the agency coordinates continuity rather than abandoning the patient.',
        action: 'Follow the authorized handoff plan, provide assigned education, protect privacy, and report unresolved risk.',
        notify: 'Case manager or receiving-provider liaison for missing information or unsafe transition conditions.',
        document: 'Education, referrals, information transferred, patient understanding, and unresolved needs.',
        policyRefs: ['42 CFR § 484.50(d)(1), (5)', 'CL-CP-007']
      }
    ]
  },
  {
    id: 6,
    shortName: 'Practice',
    title: 'Rights at the Door',
    subtitle: 'Observe, classify, decide, and defend the safe response',
    overview: [
      "Elena Ortiz prefers Spanish and has selected her daughter Rosa to receive agency information. A qualified video interpreter is available. At today's visit, another family member says to skip the interpreter and start care. Elena signals that she wants to speak first. The visit calendar shows a new frequency, an unfamiliar charge notice is on the table, and Elena refuses today's non-emergency treatment until both changes are explained.",
      "Elena also reports that a prior worker opened a drawer and moved personal items without permission. She asks how to complain directly to the State. The family member says the agency will probably discharge her for being uncooperative. Your job is to slow the situation down, protect access and choice, avoid unsupported promises, notify the right people, and create a factual record."
    ],
    details: [
      "Start with communication access. Use the qualified interpreter, address Elena directly, and ask how she wants Rosa involved. Do not substitute the impatient family member merely because it is faster. Confirm whether Rosa is a patient-selected representative, legal representative, or supporter and use only the authority documented for that role.",
      "Next clarify the unexplained care and financial changes. Verify the current authorized plan and explain only what the record confirms. Do not promise that a payer will cover the service, quote an unverified charge, or independently restore the old frequency. Contact the responsible clinical and billing teams so Elena can receive accurate information before deciding.",
      "Elena's refusal is specific and current. Pause the non-emergency treatment. Confirm what she is declining, explain known consequences neutrally, assess immediate safety within your role, and continue only the portions she accepts and that remain authorized and safe. Refusal does not make Elena difficult, waive her other rights, or transfer decision-making power to her family.",
      "Receive the property complaint without defending the prior worker or searching the drawer. Ask only what is needed for safety and routing. Preserve Elena's words and your observations, provide the current State HHA contact, and notify the agency. She need not complete the internal process first.",
      "Reject the discharge threat without making a counter-promise. Explain that questions, a refusal, an interpreter request, and a complaint do not by themselves authorize retaliation or instant discharge. If a real safety or service-delivery problem exists, it is documented and reviewed through the authorized process with applicable safeguards. Do not promise that discharge could never occur under any lawful ground.",
      "Document the language service; people present and verified roles; proposed service and refusal; education; schedule and charge questions; Elena's exact words; contacts; notifications; instructions; care delivered or held; and disposition. Do not speculate about capacity, motive, credibility, abuse, coverage, fault, or future discharge.",
      "Use the field sequence: Observe the access, plan, property, complaint, and safety signals. Classify each as a protected right, collaborative responsibility, immediate danger, or escalation issue. Decide to respect, pause or protect, clarify, notify, and document. Defend the action with the exact facts and source. Annual knowledge training supports this judgment but does not expand professional scope or replace role-specific competency."
    ],
    keyPoints: [
      { icon: '👁️', title: 'Observe', detail: 'Notice access, plan, property, complaint, and safety signals.' },
      { icon: '🧭', title: 'Classify', detail: 'Right, responsibility, immediate danger, or escalation issue.' },
      { icon: '✅', title: 'Decide', detail: 'Respect, pause or protect, clarify, notify, and document.' },
      { icon: '🛡️', title: 'Defend', detail: 'Tie the action to exact facts, policy, and authority.' }
    ],
    clinicalTip: 'When several rights appear at once, slow down: access first, immediate safety second, choice third, and documentation throughout.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR § 484.50(a)-(f)' },
      { kind: 'California', text: '22 CCR § 74743' },
      { kind: 'Care Indeed', text: 'CL-PR-001 v1.0 (2025-07-10); CL-PR-003/-006; OP-PA-001/-003/-005' }
    ],
    imageAlt: 'At an open doorway, Elena pauses a nurse while her daughter stands nearby; an interpreter tablet, changed calendar, charge envelope, keepsake by a drawer, and complaint phone are visible.',
    sceneImage: img07,
    hotspots: [
      {
        id: 'interpreter', label: 'Elena requests qualified language support', shortLabel: 'Interpreter', x: 79, y: 70, zone: 'protected',
        info: 'Elena points to the video-interpreter tablet while a family member wants to skip it.',
        meaning: 'Speed or family preference does not replace Elena\'s right to understandable, no-cost communication support.',
        action: 'Use the qualified interpreter, address Elena directly, and confirm how she wants Rosa involved.',
        notify: 'Language-access coordinator or supervisor if qualified support fails or is delayed.',
        document: 'Preferred language, service used, participants and verified roles, and understanding.',
        policyRefs: ['42 CFR § 484.50(f)', 'OP-PA-003']
      },
      {
        id: 'changed-plan', label: 'Unexplained schedule and charge change', shortLabel: 'Changes', x: 68, y: 82, zone: 'support',
        info: 'The calendar and sealed envelope show changes Elena says were never explained.',
        meaning: 'The patient must receive accurate information about care changes and financial responsibility before making an informed choice.',
        action: 'Verify only confirmed facts, contact clinical and billing teams, and avoid coverage promises.',
        notify: 'Case manager and billing lead before disputed non-urgent care when appropriate.',
        document: 'Old and new information presented, patient question, contacts, verified response, and decision.',
        policyRefs: ['42 CFR § 484.50(c)(4), (7)-(8)', '22 CCR § 74743(c), (e)-(f)']
      },
      {
        id: 'specific-refusal', label: 'Elena refuses today’s non-emergency treatment', shortLabel: 'Honor Refusal', x: 56, y: 42, zone: 'protected',
        info: 'Elena raises her palm and asks to speak before treatment begins.',
        meaning: 'The refusal is a protected choice; it does not authorize coercion, abandonment, or cancellation of unrelated rights.',
        action: 'Pause, clarify the scope of refusal, explain neutrally, address immediate safety, notify, and remain supportive.',
        notify: 'Responsible clinician based on the clinical significance and urgency.',
        document: 'Proposed service, specific refusal, education, accepted care, notifications, and outcome.',
        policyRefs: ['42 CFR § 484.50(c)(4)', 'CL-PR-003']
      },
      {
        id: 'property-complaint', label: 'Property concern and outside complaint request', shortLabel: 'Complaint', x: 88, y: 87, zone: 'violation',
        info: 'Elena reports that a prior worker opened a drawer and moved her keepsake without permission.',
        meaning: 'The concern implicates respect for property and the right to complain internally or externally without obstruction.',
        action: 'Listen, preserve exact words, provide the current State contact, route promptly, and do not investigate the prior worker.',
        notify: 'Complaint lead and supervisor; urgent reporting channel if new facts indicate abuse or exploitation.',
        document: 'Verbatim concern, object and location, direct observations, contacts provided, routing, and protective action.',
        policyRefs: ['42 CFR § 484.50(c)(2)-(3), (9), (e)', '22 CCR § 74743(g)', 'OP-PA-005']
      },
      {
        id: 'discharge-threat', label: 'Threat of discharge for exercising rights', shortLabel: 'No Retaliation', x: 82, y: 30, zone: 'violation',
        info: 'A family member predicts discharge because Elena is asking questions, refusing, and complaining.',
        meaning: 'Those actions do not by themselves authorize retaliation or immediate discharge.',
        action: 'Correct the threat calmly, continue safe authorized care, and route any actual safety or service concern through the formal process.',
        notify: 'Administrator, DON, or Compliance Officer for threatened or actual retaliation.',
        document: 'Exact statement, Elena\'s response, clarification provided, effect on care, notification, and disposition.',
        policyRefs: ['42 CFR § 484.50(c)(11), (d), (e)(1)(iii)', 'OP-PA-001']
      }
    ]
  }
];

const NEW_QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'During the initial evaluation, when must the HHA provide the patient and legal representative the written rights-and-responsibilities notice and transfer/discharge policies?',
    options: ['Within 30 calendar days after the first claim, if verbal information was provided at admission', 'During the initial evaluation visit and before care is furnished', 'Only after the patient or representative specifically requests a printed copy during a later visit', 'At recertification, unless the agency changes the plan earlier'],
    correct: 1,
    rationale: 'The notice is provided during the initial evaluation and before care begins; receipt is acknowledged and the information must be understandable and accessible. Sources: 42 CFR § 484.50(a)(1)-(2); 22 CCR § 74743(a).'
  },
  {
    id: 1,
    stem: 'Which statement most accurately describes patient responsibilities?',
    options: ['They replace selected rights whenever a patient misses visits or withholds information the team needs', 'They require acceptance of every ordered service before privacy and complaint protections apply', 'They support safe collaboration but do not waive protected patient rights', 'They permit immediate discharge whenever the agency documents a responsibility concern'],
    correct: 2,
    rationale: 'Care Indeed communicates collaborative responsibilities, but exercising a right may not trigger discrimination or reprisal. A responsibility concern starts support and care-team review, not automatic loss of rights. Sources: CL-PR-001 v1.0 (effective 2025-07-10); 42 CFR § 484.50(c)(11).'
  },
  {
    id: 2,
    stem: 'A worker wants to move a religious keepsake and open a bedside drawer to create room for supplies. What should the worker do?',
    options: ['Ask permission and use another workspace if permission is not given', 'Move both without discussion because keeping a clinical workspace clear always takes priority inside the home', 'Ask a family member for permission after the patient has left the room for another task', 'Photograph and inventory the items first, then move them without discussing the change with the patient'],
    correct: 0,
    rationale: 'The patient\'s person, home, and property must be treated with respect. A care task does not create unrestricted authority to search or rearrange belongings. Sources: 42 CFR § 484.50(c)(1)-(2); OP-PA-005.'
  },
  {
    id: 3,
    stem: 'A patient learns during a visit that nursing frequency changed, but no one explained the change. What is the best field response?',
    options: ['Tell the patient it is an office issue that does not require care-team follow-up', 'Continue the visit without discussion because authorized plan changes never require patient explanation', 'Independently restore the prior frequency', 'Acknowledge, verify the authorized plan, notify the clinician, and document the concern'],
    correct: 3,
    rationale: 'Patients are informed about disciplines, frequency, expected outcomes, and care changes and may participate in plan revision. The worker must receive the concern but may not independently rewrite the plan. Sources: 42 CFR § 484.50(c)(4); 22 CCR § 74743(c).'
  },
  {
    id: 4,
    stem: 'A patient with decision-making capacity refuses an ordered dressing change after an understandable explanation. What is the best action?',
    options: ['Perform the dressing change because a practitioner order overrides a current refusal when the task is important', 'Ask family members to persuade or physically assist the patient so the ordered task can be completed', 'Honor the refusal, address immediate risk, notify the clinician, and document', 'End the visit and all future services immediately without education, notification, or documentation'],
    correct: 2,
    rationale: 'The patient may consent to or refuse care before and during treatment. Refusal is honored without coercion while safety assessment, support, notification, and documentation continue. Sources: 42 CFR § 484.50(c)(4); CL-PR-003.'
  },
  {
    id: 5,
    stem: 'A patient becomes unresponsive. A relative produces an unclear DNR photocopy, the record has no verified status, and family members disagree. What should the field worker do?',
    options: ['Treat the unclear photocopy as a verified order and withhold all emergency response while the family discusses it', 'Follow verified orders and the emergency protocol; communicate the document and escalate the conflict', 'Ask the family to vote while delaying action until every person agrees on what the document means', 'Ignore every DNR or POLST document because portable medical orders cannot apply during home care'],
    correct: 1,
    rationale: 'Advance-directive and medical-order conflicts require immediate escalation, not bedside legal interpretation. Follow current verified orders and emergency protocol while communicating the available document. Sources: 42 CFR § 489.102; California EMSA, DNR and POLST Forms (accessed 2026-07-20); CL-PR-002.'
  },
  {
    id: 6,
    stem: 'A patient says, “I want to complain directly to the State, not to your office.” What is the best response?',
    options: ['Require the patient to finish the internal investigation and wait for a written decision before calling outside', 'Ask the patient to wait until discharge so the full record can be assembled before any outside contact', 'Refuse future visits until the patient withdraws the outside complaint and completes the agency process', 'Provide the applicable State contact, route the concern, and prevent retaliation'],
    correct: 3,
    rationale: 'Patients may complain to the HHA or an outside entity without discrimination or reprisal. Use the current location-specific State contact rather than a memorized number. Sources: 42 CFR § 484.50(c)(3), (9), (11), (e); 22 CCR § 74743(g).'
  },
  {
    id: 7,
    stem: 'A worker sees an unexplained injury and hears the patient say, “My caregiver grabbed me last night.” What is the most defensible response?',
    options: ['Protect now, report as required, and document objective findings and exact words', 'Interview neighbors, inspect the home for proof, and confront the caregiver before making any report', 'Wait until the next scheduled visit and gather more evidence before notifying the agency or an outside authority', 'Promise the patient complete secrecy, then decide later whether the statement is credible enough to report'],
    correct: 0,
    rationale: 'Possible abuse, neglect, injury of unknown source, or exploitation requires prompt protection and reporting under applicable law and policy. The worker preserves evidence and facts rather than investigating. Sources: 42 CFR § 484.50(e)(2); CL-PR-006.'
  },
  {
    id: 8,
    stem: 'A household member is verbally hostile, but there is no immediate physical danger. May the visiting worker tell the patient that services are terminated?',
    options: ['Yes; any hostile statement permits the visiting worker to end the case immediately without further agency review', 'Yes; if the worker documents non-compliance and tells the patient which other agencies might accept the case', 'No; report facts because only the authorized agency process may discharge after safeguards', 'No; an HHA can never discharge for behavior, even when conduct seriously prevents safe care delivery'],
    correct: 2,
    rationale: 'Behavior that seriously impairs care may be considered only through the defined agency discharge-for-cause process with notice, resolution efforts, provider contacts, and documentation. A field worker cannot announce discharge. Source: 42 CFR § 484.50(d)(5).'
  },
  {
    id: 9,
    stem: 'A patient needs language assistance, receives an unexplained charge and schedule change, refuses today’s non-emergency service, and asks how to complain. Which response best protects the patient’s rights?',
    options: ['Use a minor child to interpret, continue the service, and say the clinical and billing teams can explain later', 'Use qualified language help, explain verified facts, honor refusal, route the complaint, and document', 'Cancel every future visit because refusal shows the patient will not cooperate with the authorized plan of care', 'Ask the family to persuade the patient, resolve the charge among themselves, and omit the complaint from visit documentation'],
    correct: 1,
    rationale: 'The response integrates accessible communication, participation, financial notice, refusal, complaint access, non-retaliation, escalation, and objective documentation. Sources: 42 CFR § 484.50(a), (c)(4), (c)(7), (c)(11)-(12), (f).'
  }
];

const PAGES = NEW_PAGES;
const QUIZ = NEW_QUIZ;

const STYLES = `
.achcm08,.achcm08 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm08-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm08-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm08-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm08-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40;overflow:hidden}
.achcm08-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.achcm08-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.achcm08-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm08-tabs::-webkit-scrollbar{display:none}
.achcm08-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm08-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm08-tab.quiz-tab{border:1px solid #B94716;color:#B94716}
.achcm08-tab.quiz-tab.active{background:#B94716;color:#fff;border-color:#B94716}
.achcm08 button:focus-visible,.achcm08 summary:focus-visible{outline:3px solid #F26D33;outline-offset:3px}
.achcm08-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94716;background:#fff;color:#B94716;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm08-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm08-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.achcm08-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm08-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.achcm08-stage{position:relative;width:min(100cqw,calc(100cqh * 16 / 13));height:min(100cqh,calc(100cqw * 13 / 16));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm08-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm08-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm08-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm08-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.achcm08-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:achcm08-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm08-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.achcm08-hotspot[data-hotspot-id="bp-cuff"] .tag,.achcm08-hotspot[data-hotspot-id="safe-handoff"] .tag{transform:translateY(-82px)}
.achcm08-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.achcm08-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.achcm08-mobile-index{display:none}
.achcm08-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm08-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm08-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.achcm08-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.achcm08-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm08-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm08-bot button.next{background:#B94716;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(185,71,22,.28);min-height:44px}
.achcm08-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm08-quiz-card{width:min(760px,100%);animation:achcm08-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .achcm08-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm08-left,.achcm08-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm08-right{flex:0 0 auto;min-height:0;height:calc((100vw - 48px) * 13 / 16 + 120px)}
  .achcm08-left{max-height:42vh}
  .achcm08-stage-wrap{container-type:normal;display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:8px}
  .achcm08-stage{width:100%;height:auto;max-width:100%;max-height:none;aspect-ratio:16/13;flex:0 0 auto}
  .achcm08-hotspot .tag{display:none}
  .achcm08-mobile-index{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:5px;flex:0 0 auto}
  .achcm08-mobile-index span{min-height:24px;padding:4px 6px;border-radius:7px;background:#EEF4F3;border:1px solid #C8DFDC;color:#0F5B54;font-size:11px;font-weight:800;line-height:1.25;text-align:center}
  .achcm08-mobile-index span.done{background:#0F5B54;color:#fff}
  .achcm08-reset{width:44px;padding:0!important;font-size:0!important;justify-content:center}
  .achcm08-top{padding:0 10px;gap:8px}
  .achcm08-tab{padding:8px 10px;font-size:12px}
  .achcm08-bot{padding:0 12px;height:72px}
  .achcm08-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:420px){
  .achcm08-brand span.brand-text{display:none}
  .achcm08-exit{padding:8px 10px;font-size:11px}
  .achcm08-stage{border-radius:10px}
  .achcm08-bot{gap:4px;padding:0 6px}
  .achcm08-bot button.nav{font-size:11px;padding:0 4px}
  .achcm08-bot button.next{font-size:11px;padding:10px 9px}
  .achcm08-quiz-page{padding:10px}
}
@media (prefers-reduced-motion:reduce){
  .achcm08-hotspot .ping,.achcm08-drawer-bg,.achcm08-quiz-card{animation:none!important}
  .achcm08-quiz-card{animation:none!important}
  .achcm08-rm-transition,.achcm08-complete-overlay{transition:none!important;animation:none!important}
}
.achcm08-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.achcm08-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
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
    <div className="achcm08-drawer-bg" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm08-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.96)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: z.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.zone === 'violation' ? <XCircle size={18} /> : hotspot.zone === 'support' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{z.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={() => { onClose(); triggerRef.current?.focus(); }} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Patient-rights scene feedback</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.info} />
          <FeedbackBlock label="What it means" body={hotspot.meaning} />
          <FeedbackBlock label="Safe field-worker action" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who must be notified" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What must be documented" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.policyRefs.map((r) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
            ))}
          </div>
          <button type="button" onClick={() => { onComplete(); triggerRef.current?.focus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orangeDark, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>Lesson {pageIndex + 1} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      {page.overview.map((paragraph, i) => (
        <p key={i} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>
      ))}
      <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
        <summary style={{ padding: '12px 14px', minHeight: 44, fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {page.details.map((paragraph, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
        </div>
      </details>
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

function NewRightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void; onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(true);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const completeDialogRef = useRef<HTMLDivElement>(null);
  const completeReviewRef = useRef<HTMLButtonElement>(null);
  const completeTitleId = useId();
  const completeDescriptionId = useId();
  const active = page.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;

  useEffect(() => {
    setActiveId(null);
    setShowComplete(true);
  }, [page.id]);

  useEffect(() => {
    if (done) setShowComplete(true);
  }, [done]);

  useEffect(() => {
    if (!done || !showComplete || activeId) return;
    const timer = window.setTimeout(() => completeReviewRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [done, showComplete, activeId]);

  const dismissComplete = () => {
    setShowComplete(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const resetComplete = () => {
    setCompleted([]);
    setShowComplete(false);
    window.requestAnimationFrame(() => resetButtonRef.current?.focus());
  };

  const trapCompleteFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismissComplete();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = completeDialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
    if (!nodes?.length) return;
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

  const nextIncomplete = page.hotspots.find((hotspot) => !completed.includes(hotspot.id));

  return (
    <div className="achcm08-stage-wrap">
      <div
        className="achcm08-stage"
        role="region"
        aria-label={page.title + ' interactive scene'}
      >
        <img className="scene" src={page.sceneImage} alt={page.imageAlt} draggable={false} />

        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: '1px solid ' + CI.border, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeDark }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: '1px solid ' + CI.border, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>

        {page.hotspots.map((hotspot, hotspotIndex) => {
          const isDone = completed.includes(hotspot.id);
          const isGuided = !isDone && nextIncomplete?.id === hotspot.id;
          const zone = ZONE[hotspot.zone];
          return (
            <button
              key={hotspot.id}
              type="button"
              data-hotspot-id={hotspot.id}
              className={'achcm08-hotspot ' + (hotspot.y >= 80 ? 'low ' : '') + (hotspot.x >= 75 ? 'edge-right ' : hotspot.x <= 25 ? 'edge-left ' : '') + (isDone ? 'done ' : '') + (isGuided ? 'guided' : '')}
              style={{ left: hotspot.x + '%', top: hotspot.y + '%' }}
              aria-label={isDone ? hotspot.label + ' — observed' : 'Explore ' + hotspot.label}
              aria-describedby={'achcm08-progress-' + page.id}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveId(hotspot.id);
              }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : zone.color }}>
                {isGuided && <span className="ping" aria-hidden="true" />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <span aria-hidden="true">{hotspotIndex + 1}</span>}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
              {isDone && <span className="achcm08-sr-only">Observed</span>}
            </button>
          );
        })}

        <div id={'achcm08-progress-' + page.id} className="achcm08-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} patient-rights points observed
        </div>

        <button
          ref={resetButtonRef}
          type="button"
          className="achcm08-reset"
          aria-label="Reset lesson observations"
          onClick={() => {
            setCompleted([]);
            setShowComplete(false);
          }}
          style={{ position: 'absolute', right: page.id === 6 ? 'auto' : 10, left: page.id === 6 ? 10 : 'auto', bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: '1px solid ' + CI.border, background: 'rgba(255,255,255,.96)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <RotateCcw size={13} /> Reset
        </button>

        {done && showComplete && !activeId && (
          <div className="achcm08-complete-overlay" style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'achcm08-pop .3s cubic-bezier(.16,1,.3,1)' }}>
            <div ref={completeDialogRef} role="dialog" aria-modal="true" aria-labelledby={completeTitleId} aria-describedby={completeDescriptionId} onKeyDown={trapCompleteFocus} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', textAlign: 'center', border: '4px solid ' + CI.tealSoft }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div id={completeTitleId} style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div id={completeDescriptionId} style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>
                You explored every rights point in this scene. Knowledge practice does not expand scope, validate practical competency, or authorize independent practice.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button ref={completeReviewRef} type="button" onClick={dismissComplete} style={{ flex: 1, minWidth: 130, minHeight: 44, borderRadius: 12, border: '1px solid ' + CI.border, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Review scene</button>
                <button type="button" onClick={resetComplete} style={{ flex: 1, minWidth: 130, minHeight: 44, borderRadius: 12, border: '1px solid ' + CI.orange, background: '#fff', color: CI.orangeDark, fontWeight: 800, cursor: 'pointer' }}>Reset observations</button>
                {onGoQuiz && page.id === PAGES.length - 1 && (
                  <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orangeDark, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
                )}
              </div>
            </div>
          </div>
        )}

        {active && (
          <ClinicalFeedbackOverlay
            hotspot={active}
            onClose={() => setActiveId(null)}
            onComplete={() => {
              if (!completed.includes(active.id)) setCompleted([...completed, active.id]);
              setActiveId(null);
            }}
            triggerRef={triggerRef}
          />
        )}
      </div>
      <div className="achcm08-mobile-index" aria-hidden="true">
        {page.hotspots.map((hotspot, hotspotIndex) => (
          <span key={hotspot.id} className={completed.includes(hotspot.id) ? 'done' : ''}>
            {completed.includes(hotspot.id) ? '✓' : hotspotIndex + 1} {hotspot.shortLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

const RightPanel = NewRightPanel;

/** Dedicated single-panel Knowledge Check — progressive field cards + rights result */
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
  initialLastScore?: number | null;
  onPersist: (state: QuizProgressState) => void;
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
  const [lastScore, setLastScore] = useState<number | null>(initialLastScore ?? null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLDivElement>(null);
  const pendingQuestionFocusRef = useRef(false);
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

  useEffect(() => {
    if (finished) resultHeadingRef.current?.focus();
  }, [finished]);

  useEffect(() => {
    if (!pendingQuestionFocusRef.current || finished) return;
    pendingQuestionFocusRef.current = false;
    if (submitted) actionButtonRef.current?.focus();
    else optionRefs.current[0]?.focus();
  }, [idx, submitted, finished]);

  const pushProgress = (patch: Partial<QuizProgressState>) => {
    onPersist({ answers, idx, finished, selected, submitted, attempts, lastScore, ...patch });
  };

  const chooseOption = (i: number) => {
    setSelected(i);
    pushProgress({ selected: i });
  };

  const focusOption = (i: number) => {
    chooseOption(i);
    window.requestAnimationFrame(() => optionRefs.current[i]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const next = [...answers];
      next[idx] = selected;
      setAnswers(next);
      setSubmitted(true);
      pushProgress({ answers: next, submitted: true });
      return;
    }
    if (idx >= QUIZ.length - 1) {
      const nextAttempts = attempts + 1;
      setFinished(true);
      setAttempts(nextAttempts);
      setLastScore(pct);
      pushProgress({ finished: true, attempts: nextAttempts, lastScore: pct });
      return;
    }
    const nextIdx = idx + 1;
    const nextSelected = answers[nextIdx] != null ? answers[nextIdx] : null;
    const nextSubmitted = answers[nextIdx] != null;
    setIdx(nextIdx);
    setSelected(nextSelected);
    setSubmitted(nextSubmitted);
    pushProgress({ idx: nextIdx, selected: nextSelected, submitted: nextSubmitted });
    pendingQuestionFocusRef.current = true;
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <div className="achcm08-quiz-page">
        <div className="achcm08-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: passed ? CI.teal : CI.orangeDark, marginBottom: 8 }}>{passed ? 'Knowledge Check Passed' : 'Attempt Complete · 80% Required'}</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="achcm08-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div ref={resultHeadingRef} tabIndex={-1} style={{ fontSize: 22, fontWeight: 800, color: passed ? CI.teal : CI.orangeDark, marginBottom: 6 }}>{passed ? 'Knowledge requirement passed' : 'Not passed yet'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            {passed ? 'You met the 80% knowledge threshold.' : 'Review the feedback and retake when ready.'} Practical competency, role authorization, and independent-practice clearance remain separate. Attempt {attempts}; recorded score {lastScore ?? pct}%.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Respect', color: CI.teal, tip: 'Center dignity and choice' },
              { label: 'Protect', color: CI.orange, tip: 'Pause, clarify, and support' },
              { label: 'Escalate', color: CI.red, tip: 'Report violations and danger' },
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
              const blankAnswers = Array(QUIZ.length).fill(null);
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(blankAnswers); setFinished(false);
              pushProgress({ answers: blankAnswers, idx: 0, finished: false, selected: null, submitted: false });
              pendingQuestionFocusRef.current = true;
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orangeDark, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achcm08-quiz-page">
      <div className="achcm08-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="achcm08-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
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
              // Space uses the focused button's native click behavior to select; submission remains explicit.
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
                  onClick={() => chooseOption(i)}
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
            <button ref={actionButtonRef} type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orangeDark, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'achc-art-m08-progress-v1';

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
  quizLastScore?: number | null;
};

function loadProgress(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const candidate = JSON.parse(raw) as Partial<Persisted>;
    const pageIndex = Number.isInteger(candidate.pageIndex)
      ? Math.min(PAGES.length - 1, Math.max(0, Number(candidate.pageIndex)))
      : 0;
    const mode = candidate.mode === 'quiz' ? 'quiz' : 'lessons';
    const completedByPage: Record<number, string[]> = {};
    if (candidate.completedByPage && typeof candidate.completedByPage === 'object') {
      PAGES.forEach((page) => {
        const rawIds = candidate.completedByPage?.[page.id];
        if (Array.isArray(rawIds)) {
          const allowed = new Set(page.hotspots.map((hotspot) => hotspot.id));
          completedByPage[page.id] = [...new Set(rawIds.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
        }
      });
    }
    const rawAnswers = Array.isArray(candidate.quizAnswers) ? candidate.quizAnswers : [];
    const quizAnswers = Array.from({ length: QUIZ.length }, (_, index) => {
      const value = rawAnswers[index];
      return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 3 ? Number(value) : null;
    });
    const quizIdx = Number.isInteger(candidate.quizIdx)
      ? Math.min(QUIZ.length - 1, Math.max(0, Number(candidate.quizIdx)))
      : 0;
    const quizSelected = candidate.quizSelected === null || candidate.quizSelected === undefined
      ? null
      : Number.isInteger(candidate.quizSelected) && Number(candidate.quizSelected) >= 0 && Number(candidate.quizSelected) <= 3
        ? Number(candidate.quizSelected)
        : null;
    const quizAttempts = Number.isInteger(candidate.quizAttempts) ? Math.max(0, Number(candidate.quizAttempts)) : 0;
    const quizLastScore = candidate.quizLastScore === null || candidate.quizLastScore === undefined
      ? null
      : Number.isFinite(candidate.quizLastScore)
        ? Math.min(100, Math.max(0, Number(candidate.quizLastScore)))
        : null;
    return {
      pageIndex,
      mode,
      completedByPage,
      quizAnswers,
      quizIdx,
      quizFinished: Boolean(candidate.quizFinished),
      quizSelected,
      quizSubmitted: Boolean(candidate.quizSubmitted) && quizSelected !== null,
      quizAttempts,
      quizLastScore,
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

export default function ACHCARTM08() {
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
  const [quizLastScore, setQuizLastScore] = useState<number | null>(initial?.quizLastScore ?? null);
  const quizProgressRef = useRef<QuizProgressState>({
    answers: quizAnswers,
    idx: quizIdx,
    finished: quizFinished,
    selected: quizSelected,
    submitted: quizSubmitted,
    attempts: quizAttempts,
    lastScore: quizLastScore,
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const page = PAGES[Math.min(pageIndex, PAGES.length - 1)];
  const completed = completedByPage[page.id] ?? [];

  const persistAll = (patch?: Partial<Persisted>) => {
    const liveQuiz = quizProgressRef.current;
    saveProgress({
      pageIndex,
      mode,
      completedByPage,
      quizAnswers: liveQuiz.answers,
      quizIdx: liveQuiz.idx,
      quizFinished: liveQuiz.finished,
      quizSelected: liveQuiz.selected,
      quizSubmitted: liveQuiz.submitted,
      quizAttempts: liveQuiz.attempts,
      quizLastScore: liveQuiz.lastScore,
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

  const handleQuizPersist = useCallback((state: QuizProgressState) => {
    quizProgressRef.current = state;
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
    setQuizAttempts(state.attempts);
    setQuizLastScore(state.lastScore);
  }, []);

  const moveTab = (current: number, key: string) => {
    const count = PAGES.length + 1;
    let next = current;
    if (key === 'ArrowRight') next = (current + 1) % count;
    else if (key === 'ArrowLeft') next = (current - 1 + count) % count;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = count - 1;
    else return;
    if (next === PAGES.length) setMode('quiz');
    else { setMode('lessons'); setPageIndex(next); }
    window.requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  return (
    <div className="achcm08 achcm08-shell">
      <style>{STYLES}</style>
      <header className="achcm08-top">
        <div className="achcm08-brand">
          <BrandMark size={28} />
          <span className="brand-text">Patient Rights</span>
        </div>
        <div className="achcm08-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              id={'achcm08-tab-' + i} aria-controls="achcm08-lesson-panel"
              ref={(element) => { tabRefs.current[i] = element; }}
              tabIndex={mode === 'lessons' && i === pageIndex ? 0 : -1}
              className={`achcm08-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onKeyDown={(event) => moveTab(i, event.key)}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              {p.shortName}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={mode === 'quiz'}
            id="achcm08-tab-quiz" aria-controls="achcm08-quiz-panel"
            ref={(element) => { tabRefs.current[PAGES.length] = element; }}
            tabIndex={mode === 'quiz' ? 0 : -1}
            className={`achcm08-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onKeyDown={(event) => moveTab(PAGES.length, event.key)}
            onClick={() => setMode('quiz')}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="achcm08-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      <main style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {mode === 'quiz' ? (
          <div id="achcm08-quiz-panel" role="tabpanel" aria-labelledby="achcm08-tab-quiz" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
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
          </div>
        ) : (
          <div id="achcm08-lesson-panel" role="tabpanel" aria-labelledby={'achcm08-tab-' + pageIndex} className="achcm08-work">
            <aside className="achcm08-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
            <section className="achcm08-right">
              <RightPanel page={page} completed={completed}
                setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
                onGoQuiz={() => setMode('quiz')} />
            </section>
          </div>
        )}
      </main>

      <footer className="achcm08-bot">
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
