/**
 * ACHC-ART-M04 — HIPAA Privacy, Security & Field Confidentiality
 * PASS-5 learner module | 7 lessons | 35 hotspots | 10-question Knowledge Check
 * Knowledge practice only; this module does not grant access or validate field competency.
 */
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  LockKeyhole,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';

import img01 from './assets/lesson-01-privacy-foundations.png';
import img02 from './assets/lesson-02-permitted-disclosures.png';
import img03 from './assets/lesson-03-field-security.png';
import img04 from './assets/lesson-04-privacy-rights.png';
import img05 from './assets/lesson-05-incident-response.png';
import img06 from './assets/lesson-06-sensitive-sharing.png';
import img07 from './assets/lesson-07-field-practice.png';

const CI = {
  teal: '#0F5B54',
  tealDark: '#0A3D39',
  tealSoft: '#EEF4F3',
  tealMuted: '#C8DFDC',
  orange: '#F26D33',
  orangeAction: '#C2410C',
  orangeSoft: '#FFF3EC',
  ink: '#2D3748',
  muted: '#64748B',
  border: '#E2E8F0',
  red: '#B91C1C',
  redSoft: '#FEF2F2',
  white: '#FFFFFF',
  bg: '#F8FAFC',
} as const;

type ActionKind = 'protect' | 'verify' | 'report' | 'stop';

interface DetailBlock {
  heading: string;
  body: string;
}

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface SourceLabel {
  kind: 'Federal' | 'California' | 'Care Indeed' | 'Recommended practice';
  text: string;
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  kind: ActionKind;
  observed: string;
  significance: string;
  action: string;
  notify?: string;
  document: string;
  sources: string[];
}

interface PageData {
  id: number;
  shortName: string;
  title: string;
  subtitle: string;
  overview: string[];
  details: DetailBlock[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  sourceLabels: SourceLabel[];
  sceneImage: string;
  sceneAlt: string;
  hotspots: Hotspot[];
}

type QuestionCategory =
  | 'Direct application'
  | 'Home-health scenario'
  | 'Documentation & escalation'
  | 'Integrated judgment';

interface QuizQuestion {
  id: number;
  category: QuestionCategory;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
  sources: string[];
}

const ACTION: Record<ActionKind, { label: string; color: string; soft: string }> = {
  protect: { label: 'Protect', color: CI.teal, soft: CI.tealSoft },
  verify: { label: 'Verify first', color: CI.orangeAction, soft: CI.orangeSoft },
  report: { label: 'Report', color: CI.orangeAction, soft: CI.orangeSoft },
  stop: { label: 'Stop', color: CI.red, soft: CI.redSoft },
};

const MODULE_META = {
  id: 'ACHC-ART-M04',
  title: 'HIPAA Privacy, Security & Field Confidentiality',
  pages: 7,
  quizCount: 10,
  passing: 80,
} as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Foundations',
    title: 'PHI, ePHI & Your Workforce Duty',
    subtitle: 'Recognize protected information before you use, view, carry, speak, photograph, or send it',
    overview: [
      'Privacy begins with recognition. Protected health information, or PHI, is individually identifiable health information held or transmitted by a HIPAA-regulated covered entity or business associate. It can be spoken, printed, handwritten, photographed, displayed, or stored electronically. Electronic PHI, or ePHI, is the same protected content in electronic form. A visit schedule that connects a person to home-health services can be PHI even when it contains no diagnosis.',
      'Care Indeed is the regulated organization; individual field workers are members of its workforce. Your duty is practical: access only the information needed for an assigned role, use it only for an authorized work purpose, protect it wherever the visit occurs, and report suspected exposure. Curiosity, convenience, friendship, or professional credentials do not create permission to open a record.',
      'Context matters. A blank form is not PHI; it becomes PHI when it identifies a patient or can reasonably be linked to one. Removing a name does not necessarily de-identify a story, photograph, address, unusual condition, or recognizable home. Formal de-identification is an organizational process, not a shortcut for conversation or social media.',
    ],
    details: [
      { heading: 'Covered entities, business associates, and workforce', body: 'HIPAA applies to covered health plans, clearinghouses, covered providers, and defined business associates. Care Indeed workforce members act under agency policies and access controls. In the field, do not assume a vendor, app, relative, contractor, or licensed colleague may receive PHI. The organization determines classification and authority; you verify the approved workflow.' },
      { heading: 'Identifiers are more than names', body: 'Names, detailed addresses, dates connected to a person, phone numbers, record or account numbers, full-face images, device identifiers, and many other data elements can identify a patient. A medication list, voice message, wound image, map pin, or distinctive home description may reveal identity through context. Treat information as protected when it links a person to health status, care, or payment and it has not been formally de-identified through an approved method.' },
      { heading: 'Access follows assignment and purpose', body: 'Use your unique credentials and open only assigned records needed for current work. Do not look up friends, family, public figures, former patients, or nearby residents. Do not share a login with a covering worker. If an assignment appears missing or you cannot see information you genuinely need, contact the supervisor or approved support channel. Never solve an access problem by borrowing credentials, exporting a file, or creating a personal copy.' },
    ],
    keyPoints: [
      { icon: '🔎', title: 'Recognize context', detail: 'Identity plus care, health, or payment information can be PHI.' },
      { icon: '🔐', title: 'Use unique access', detail: 'Open only assigned records for an authorized work purpose.' },
      { icon: '🗣️', title: 'Protect every form', detail: 'Spoken, visual, paper, photo, and electronic information all matter.' },
      { icon: '🚫', title: 'No curiosity access', detail: 'Credentials and familiarity never create a need to know.' },
    ],
    clinicalTip: 'Before opening or sharing information, ask: Is this my assigned patient, is this access needed now, and am I using an approved channel?',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §160.103; §164.502' },
      { kind: 'Care Indeed', text: 'CO-HP-001; CO-DG-101; IT-SC-002' },
    ],
    sceneImage: img01,
    sceneAlt: 'A home-health clinician and older adult patient speak privately at a dining table with a protected tablet, closed paper folder, face-down phone, identification badge, and zipped work bag.',
    hotspots: [
      { id: 'tablet', label: 'Agency tablet and electronic PHI', shortLabel: 'Agency Tablet', x: 52, y: 61, kind: 'protect', observed: 'The agency tablet contains a generic care screen and is positioned for the assigned visit.', significance: 'Information on an approved device is still ePHI. Device approval does not permit unrelated access or viewing by others.', action: 'Use unique credentials, open only the assigned record, orient the screen away from bystanders, and lock it whenever attention shifts.', notify: 'Contact the supervisor or approved support channel if needed access is missing or appears excessive.', document: 'Do not place routine security actions in the clinical note. Report and document only a suspected access or exposure event through the incident process.', sources: ['45 CFR §164.312', 'IT-SC-002', 'CO-DG-101'] },
      { id: 'paper', label: 'Closed paper visit folder', shortLabel: 'Paper Folder', x: 37, y: 82, kind: 'protect', observed: 'A closed folder holds only papers needed for the current visit.', significance: 'Paper PHI can be copied, photographed, misplaced, or read by household members as easily as an electronic screen.', action: 'Keep papers under direct control in an approved closed container and return them through the approved record or destruction workflow.', notify: 'Report missing, misdirected, or viewed papers to Privacy through the agency incident channel within one hour of discovery.', document: 'Record the documents involved, last known location, who may have seen them, discovery time, and protective steps taken.', sources: ['45 CFR §164.530(c)', 'CO-HP-001', 'CO-IR-101'] },
      { id: 'phone', label: 'Face-down personal phone', shortLabel: 'Personal Phone', x: 72, y: 78, kind: 'stop', observed: 'A personal phone is present but not being used for the visit.', significance: 'Personal cameras, messages, cloud backups, and notifications can create unauthorized copies or expose patient information.', action: 'Keep personal devices out of the care workflow. Use only agency-approved devices, applications, and communication channels for PHI.', notify: 'Ask a supervisor or Privacy before using any unfamiliar application or device with patient information.', document: 'If PHI entered a personal device or account, preserve facts and report the incident; do not silently delete evidence and assume the issue is closed.', sources: ['Care Indeed IT-UP-001', 'IT-UP-002', 'CO-IR-101'] },
      { id: 'badge', label: 'Workforce identification badge', shortLabel: 'Workforce Duty', x: 29, y: 52, kind: 'verify', observed: 'The clinician’s badge shows a workforce role, not blanket access to every patient record.', significance: 'Employment, licensure, or a clinical title does not establish an authorized purpose for every use or disclosure.', action: 'Verify the assignment, recipient, purpose, and approved workflow before using or discussing patient information.', notify: 'Escalate uncertainty about assignment or recipient authority before disclosure.', document: 'If access was inappropriate or attempted, report objective facts through the privacy incident workflow rather than investigating the person yourself.', sources: ['45 CFR §164.514(d)', 'IT-SC-002', 'CO-DG-101'] },
      { id: 'bag', label: 'Secured work bag', shortLabel: 'Secure Bag', x: 15, y: 72, kind: 'protect', observed: 'The work bag is zipped and remains within the clinician’s control.', significance: 'A bag may contain devices, notes, labels, or supplies that reveal a patient relationship when left open or unattended.', action: 'Carry only necessary information, close the bag between tasks, and never leave PHI visible or unattended in a home, public place, or vehicle.', notify: 'Report loss, theft, or suspected viewing immediately and no later than the agency’s one-hour requirement.', document: 'Identify the bag and contents, last secure location, discovery time, likely exposure, and actions taken without guessing whether a breach occurred.', sources: ['Care Indeed IT-UP-001', 'CO-HP-001', 'CO-IR-101 §4.1'] },
    ],
  },
  {
    id: 1,
    shortName: 'Use & Share',
    title: 'Permitted Uses, Minimum Necessary & Authorization',
    subtitle: 'A work purpose may permit a disclosure, but identity, authority, relevance, and channel still require verification',
    overview: [
      'HIPAA permits covered entities to use and disclose PHI for treatment, payment, and health care operations without obtaining a separate HIPAA authorization for every routine activity. That permission is not a blank check. The person, purpose, information, and method must fit the agency’s workflow. A worker should not invent a disclosure pathway when a request falls outside ordinary care coordination.',
      'The federal minimum-necessary standard generally requires reasonable efforts to limit PHI to what is needed for the purpose. It has important exceptions, including many disclosures to or requests by health care providers for treatment, disclosures to the individual, and uses or disclosures made under a valid authorization. Care Indeed may still apply role-based access and data-minimization controls that are stricter operational safeguards. Label those controls correctly: they are agency policy, not a claim that federal minimum necessary has no exceptions.',
      'Verification comes before disclosure. Confirm the requester’s identity, relationship or authority, purpose, and approved destination. An NPP acknowledgment documents receipt of the privacy notice; it is not consent to every disclosure and is not a substitute for a valid authorization when authorization is required.',
    ],
    details: [
      { heading: 'Treatment, payment, and operations', body: 'Treatment includes coordination and management of care among authorized providers. Payment includes activities needed to obtain reimbursement. Health care operations include defined organizational functions such as quality assessment, training, and certain administrative activities. Field workers use the agency’s approved process; they do not independently label a novel request “operations” to make it permissible. When the purpose or recipient is uncertain, pause and route the request to a supervisor or Privacy.' },
      { heading: 'Minimum necessary with correct boundaries', body: 'For uses and disclosures where minimum necessary applies, share only the information reasonably needed for the task. Do not send an entire record when a limited item will meet the approved purpose. Remember the federal exceptions: minimum necessary does not apply to disclosures to or requests by a provider for treatment, disclosures to the individual, or uses and disclosures under a valid authorization, among other listed exceptions. Agency role-based access can still limit what a worker may open or transmit.' },
      { heading: 'Authorization is specific, not assumed', body: 'When an authorization is required, the organization verifies that it is valid, specific, and not expired or revoked. A field worker should not interpret an unclear form, expand it to a different recipient, or promise release. Route the request and authorization through the approved records or Privacy process. A patient’s statement may guide ordinary involvement of family in care, but it does not turn a caregiver into an unrestricted recipient of the whole record.' },
    ],
    keyPoints: [
      { icon: '🧭', title: 'Classify purpose', detail: 'TPO is defined work, not a label for any convenient disclosure.' },
      { icon: '👤', title: 'Verify authority', detail: 'Confirm identity, relationship, purpose, and destination.' },
      { icon: '📎', title: 'Check content', detail: 'Verify the patient and attachment before sending.' },
      { icon: '⚖️', title: 'Apply the right rule', detail: 'Know federal exceptions and follow agency least-access controls.' },
    ],
    clinicalTip: 'Pause before the final click: right person, right purpose, right information, right channel, right patient.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §§164.502(b), 164.506, 164.508, 164.510' },
      { kind: 'Care Indeed', text: 'CO-HP-004; CO-DG-101; IT-UP-002' },
    ],
    sceneImage: img02,
    sceneAlt: 'A home-health clinician and patient review a protected tablet at a kitchen counter while a caregiver waits nearby; a sealed envelope, closed folder, and phone support a disclosure-verification exercise.',
    hotspots: [
      { id: 'patient', label: 'Patient direction and participation', shortLabel: 'Patient Choice', x: 56, y: 46, kind: 'verify', observed: 'The capable patient is present and can express who may participate in the conversation.', significance: 'The patient’s wishes matter, while a family relationship alone does not create unrestricted access to PHI.', action: 'Ask whether the patient wants the caregiver included and limit any discussion to information directly relevant to that involvement.', notify: 'Route disputes about representatives, capacity, restrictions, or sensitive information to the supervisor or Privacy.', document: 'Document the care communication and patient preference only when relevant to care; avoid copying unnecessary family details.', sources: ['45 CFR §164.510(b)', 'CO-HP-004'] },
      { id: 'caregiver', label: 'Caregiver awaiting permission', shortLabel: 'Caregiver', x: 82, y: 52, kind: 'verify', observed: 'A caregiver is nearby but has not automatically joined the clinical discussion.', significance: 'Presence in the home and a close relationship do not by themselves authorize access to the entire chart or every topic.', action: 'Give the patient an opportunity to agree or object, verify any representative authority when applicable, and share only relevant information.', notify: 'Contact Privacy when authority is unclear, the patient objects, or the request exceeds ordinary involvement in care.', document: 'Record the patient’s expressed preference and relevant teaching recipient without making legal conclusions about the caregiver.', sources: ['45 CFR §164.510(b)', 'CO-HP-004'] },
      { id: 'tablet', label: 'Treatment information on agency tablet', shortLabel: 'Treatment Use', x: 27, y: 58, kind: 'protect', observed: 'The tablet supports care coordination for the assigned patient.', significance: 'Treatment uses can be permitted without a separate authorization, but access still must be tied to assignment and an approved purpose.', action: 'Use the assigned record for care, protect the screen, and follow agency role-based access even where federal minimum necessary has a treatment exception.', notify: 'Escalate if the record, purpose, or recipient does not match the assignment.', document: 'Document the clinical communication in the designated record; do not create a second personal record.', sources: ['45 CFR §§164.506, 164.502(b)(2)', 'CO-DG-101'] },
      { id: 'envelope', label: 'Sealed authorization or disclosure packet', shortLabel: 'Authorization', x: 61, y: 82, kind: 'verify', observed: 'A sealed packet represents a request that may rely on a formal authorization.', significance: 'An unclear, expired, revoked, or mismatched authorization cannot be expanded by a field worker.', action: 'Keep the packet secure and route it through the approved Privacy or records process for validation and fulfillment.', notify: 'Notify Privacy or the designated records team; do not send records directly from the home.', document: 'Record receipt and routing through the approved workflow, without copying more PHI into ordinary messages.', sources: ['45 CFR §164.508', 'CO-HP-004'] },
      { id: 'phone', label: 'Approved communication channel', shortLabel: 'Right Channel', x: 86, y: 78, kind: 'protect', observed: 'A phone is available for an approved care-coordination call but is not yet active.', significance: 'The content may be permitted while the channel, recipient, or environment is unsafe.', action: 'Move to a private location, verify the recipient through the approved method, disclose only what the approved workflow supports, and avoid speakerphone unless privacy is controlled.', notify: 'Report a wrong recipient, overheard message, or unintended voicemail as a suspected incident.', document: 'Record clinically relevant coordination in the chart and incident facts separately when exposure is suspected.', sources: ['45 CFR §164.530(c)', 'Care Indeed IT-UP-002'] },
    ],
  },
  {
    id: 2,
    shortName: 'Field Security',
    title: 'Secure Information in the Field',
    subtitle: 'Homes, vehicles, devices, paper, and remote work create moving privacy boundaries',
    overview: [
      'A home visit has no controlled nurses’ station. Family members enter rooms, smart devices listen, windows and vehicles expose materials, and network conditions change. Security therefore travels with the worker. Apply reasonable physical, administrative, and technical safeguards at every transition: before arrival, inside the home, during documentation, and when leaving.',
      'Use agency-managed devices and approved applications. Protect unique credentials, use required multifactor authentication, lock the screen whenever it is not under direct control, and use agency-approved secure connectivity. Do not store PHI in personal email, consumer messaging, personal cloud drives, notes applications, removable media, or unapproved AI tools. Those shadow copies can persist after the visit and evade agency retention, access, and incident controls.',
      'Paper requires the same discipline. Carry only what the visit needs, keep it closed and controlled, and return it to approved storage or confidential destruction. A locked vehicle is not long-term records storage. Do not leave PHI visible, unattended, or exposed to heat, theft, passengers, service personnel, or a shared household.',
    ],
    details: [
      { heading: 'Before entering', body: 'Prepare the minimum work materials through approved systems. Confirm that the device is charged, updated, and connected through the required secure method. Close unrelated patient records. Place papers in an approved document sleeve or locked work container. Do not pre-load schedules into personal maps, screenshots, notes, or calendars. If parking or neighborhood conditions make equipment security uncertain, contact the supervisor for an approved alternative.' },
      { heading: 'Inside the home', body: 'Choose a position where only the patient and authorized participants can see or hear information. Face screens away from doorways and cameras, lower your voice, use a privacy filter when provided, and lock the device before stepping away. Ask before using speakerphone. Be alert to smart speakers, home cameras, visitors, maintenance workers, and open windows. The patient controls the home, but the agency workforce member remains responsible for reasonable safeguards.' },
      { heading: 'Messages and remote access', body: 'Use only the agency’s approved secure messaging, email, EHR, remote-access, and file-transfer tools. Verify recipients and attachments. Never forward work messages to a personal account or paste PHI into a consumer application for convenience. Treat unexpected login prompts, attachment warnings, password reset requests, and urgent requests for credentials as possible social engineering. Stop, avoid further interaction, and contact the approved IT channel.' },
    ],
    keyPoints: [
      { icon: '📱', title: 'Agency systems only', detail: 'No personal email, cloud, SMS, storage, or unapproved apps for PHI.' },
      { icon: '🔒', title: 'Lock every transition', detail: 'Screen, paper, bag, and vehicle transitions need a privacy sweep.' },
      { icon: '👀', title: 'Control sight and sound', detail: 'Position screens, voices, and calls away from bystanders.' },
      { icon: '🎣', title: 'Treat phish as incidents', detail: 'Stop interaction, preserve the message, and notify IT promptly.' },
    ],
    clinicalTip: 'A locked device can still be missing, and a secure channel can still reach the wrong recipient. Safeguards reduce risk; they never cancel reporting.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §§164.308, 164.310, 164.312' },
      { kind: 'Care Indeed', text: 'IT-SC-002; IT-SC-003; IT-UP-001; IT-UP-002' },
    ],
    sceneImage: img03,
    sceneAlt: 'A home-health worker performs an entryway security check, locking an agency tablet, securing a phone and paper notes in approved pouches, closing a work bag, and keeping records out of a visible parked car.',
    hotspots: [
      { id: 'tablet', label: 'Locked agency tablet', shortLabel: 'Lock Screen', x: 49, y: 52, kind: 'protect', observed: 'The worker is locking the tablet before moving between tasks and locations.', significance: 'A brief unattended moment can expose ePHI to household members, visitors, or theft.', action: 'Use the required screen lock, protect credentials, keep the device under direct control, and reconnect only through approved access methods.', notify: 'Report unusual prompts, suspected credential exposure, loss, theft, or unauthorized viewing to IT and Privacy through the agency channel.', document: 'Preserve the device state and record incident facts separately; never place passwords or unnecessary technical details in the clinical record.', sources: ['45 CFR §164.312', 'IT-SC-002', 'IT-UP-001'] },
      { id: 'phone', label: 'Approved phone in secure pouch', shortLabel: 'Secure Phone', x: 30, y: 67, kind: 'protect', observed: 'The work phone is being placed in a secured pouch rather than a pocket shared with personal items.', significance: 'Notifications, unlocked screens, voice assistants, and personal backups can expose ePHI.', action: 'Use only approved applications, keep notifications private, maintain the required lock, and never share the device or credential.', notify: 'Notify IT and Privacy immediately if the device or credential is lost, stolen, or used outside the approved workflow.', document: 'Record device type, time, last known location, and observed facts in the incident process, not speculative conclusions.', sources: ['IT-UP-001', 'CO-IR-101'] },
      { id: 'paper', label: 'Paper notes entering secured sleeve', shortLabel: 'Paper Control', x: 55, y: 84, kind: 'protect', observed: 'Visit papers are collected into a closed, approved document sleeve.', significance: 'Loose notes can remain on a table, fall in a vehicle, enter ordinary trash, or be photographed.', action: 'Count and collect every page, close the sleeve, maintain custody, and return or destroy records through the approved process.', notify: 'Report missing, misdirected, or viewed paper immediately and within one hour.', document: 'Identify the specific pages and information involved without recreating the full PHI in an ordinary incident message.', sources: ['45 CFR §164.530(c)', 'CO-HP-001', 'CO-IR-101'] },
      { id: 'bag', label: 'Closed work bag', shortLabel: 'Close the Bag', x: 80, y: 70, kind: 'protect', observed: 'The work bag is closed before the worker crosses the home threshold.', significance: 'An open bag can reveal labels, records, devices, or a patient relationship and makes loss harder to detect.', action: 'Carry only necessary materials, close each compartment, maintain physical control, and complete an item sweep before departure.', notify: 'Report a lost bag or missing contents without delaying to conduct an unauthorized investigation.', document: 'List what is known to be missing, the last secure point, and immediate protective steps.', sources: ['Care Indeed IT-UP-001', 'CO-HP-001'] },
      { id: 'vehicle', label: 'Vehicle without visible records', shortLabel: 'Vehicle Check', x: 10, y: 37, kind: 'verify', observed: 'A parked vehicle is visible, and no records or devices are left in view.', significance: 'Vehicles are exposed to theft, passengers, service workers, temperature, and public observation; locking the door does not make the vehicle permanent storage.', action: 'Follow the approved transport method, keep materials out of sight, minimize unattended time, and never leave PHI in a vehicle overnight.', notify: 'If the vehicle or work materials are stolen or disturbed, protect personal safety first, then notify agency leadership, IT, and Privacy through the incident channel.', document: 'Record vehicle location, items involved, discovery time, police report number only if one was obtained through authorized direction, and actions taken.', sources: ['Care Indeed IT-UP-001', 'CO-IR-101'] },
    ],
  },
  {
    id: 3,
    shortName: 'Privacy Rights',
    title: 'Patient Privacy Rights & Request Routing',
    subtitle: 'Listen, protect the request, and route it—do not promise, deny, delete, or rewrite',
    overview: [
      'The Notice of Privacy Practices explains how the agency may use and disclose PHI, its legal duties, the patient’s privacy rights, and how to complain. An acknowledgment records that the notice was offered or received; it does not surrender rights and is not a blanket authorization. If a patient refuses to sign an acknowledgment, follow the approved documentation process without threatening care or inventing a consequence.',
      'Patients may have rights to inspect or obtain copies of designated records, request an amendment, request certain restrictions, request confidential communications, receive an accounting of certain disclosures, obtain the NPP, and complain without retaliation. California law can provide additional access protections and timeframes. Field workers should not quote a deadline from memory or decide whether a request must be granted. Route it promptly through the agency’s verified records or Privacy process.',
      'A request for amendment is not a command to erase an original entry. Records must preserve integrity and an audit trail. A request for an accounting also is not a demand for a list of every access or routine disclosure. The Privacy or records team determines the applicable scope and response.',
    ],
    details: [
      { heading: 'Notice and confidential communication', body: 'Provide or explain the NPP only as assigned and use accessible communication support. If a patient asks the agency to contact them at a different address, number, or method, treat it as a confidential-communications request. Do not place the new preference in a personal contact list or promise that every system is already updated. Protect the request and send it through the approved workflow so operational systems can be changed consistently.' },
      { heading: 'Access and copies', body: 'A patient may ask to inspect or receive records in a requested form or format. California and federal requirements can interact. A field worker does not hand over the only field copy, export an EHR screen, photograph the chart, collect an unofficial fee, or promise same-day fulfillment. Confirm where the request should go, preserve the request, and route it promptly. Urgent clinical information needed for current care follows the clinical communication pathway, not an improvised records release.' },
      { heading: 'Amendment and record integrity', body: 'Listen respectfully when a patient believes a note is wrong. Do not argue, erase the entry, overwrite the author, or create a backdated correction. Explain that the agency has a formal amendment process and route the request. Continue to document current observations accurately. If you discover your own documentation error, follow the approved correction or late-entry method that retains the original and audit trail.' },
    ],
    keyPoints: [
      { icon: '📄', title: 'Explain the notice', detail: 'NPP acknowledgment is not blanket consent or authorization.' },
      { icon: '➡️', title: 'Route requests', detail: 'Use the verified Privacy or records workflow promptly.' },
      { icon: '🧾', title: 'Preserve originals', detail: 'Amendment never means secretly deleting or rewriting a note.' },
      { icon: '🛡️', title: 'No retaliation', detail: 'Receive privacy concerns respectfully and report them.' },
    ],
    clinicalTip: 'A safe field response is: “I will protect and route your request through the agency process; the Privacy or records team will explain the next step.”',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §§164.520, 164.522, 164.524, 164.526, 164.528' },
      { kind: 'California', text: 'Health & Safety Code §123110' },
      { kind: 'Care Indeed', text: 'CO-HP-006; CO-HP-101' },
    ],
    sceneImage: img04,
    sceneAlt: 'A home-health clinician helps an older adult patient review a generic privacy notice and choose a confidential communication method using a sealed envelope, blank request form, tablet, home phone, and mobile phone.',
    hotspots: [
      { id: 'npp', label: 'Notice of Privacy Practices packet', shortLabel: 'Privacy Notice', x: 56, y: 47, kind: 'protect', observed: 'The patient is reviewing a generic privacy notice without any real identifiers.', significance: 'The NPP explains agency practices and rights; acknowledgment of receipt is not authorization for every disclosure.', action: 'Provide or explain the current notice as assigned, use accessible support, and document an offered notice or refusal through the approved process.', notify: 'Route detailed privacy questions or complaints to Privacy rather than improvising legal advice.', document: 'Record NPP delivery or documented refusal in the designated workflow only.', sources: ['45 CFR §164.520', 'CO-HP-101'] },
      { id: 'access', label: 'Request for access or copies', shortLabel: 'Access Request', x: 46, y: 82, kind: 'report', observed: 'A blank request form represents the patient’s wish to inspect or receive records.', significance: 'Federal and California access rules can interact, and the field copy may not be the designated record set.', action: 'Protect the request and route it promptly through the verified records or Privacy process; do not export, photograph, or surrender records yourself.', notify: 'Notify the designated records team or Privacy using the approved channel.', document: 'Record receipt, requested contact method, and routing time without promising a deadline or outcome.', sources: ['45 CFR §164.524', 'CA HSC §123110', 'CO-HP-006'] },
      { id: 'amendment', label: 'Request to amend a record', shortLabel: 'Amendment', x: 84, y: 77, kind: 'report', observed: 'The patient identifies information they believe is inaccurate.', significance: 'The patient may request amendment, but the original record and audit trail must be preserved.', action: 'Listen, avoid arguing, do not delete or overwrite the note, and route the request through the formal amendment process.', notify: 'Send the request to Privacy or records and inform the clinical supervisor if current care could be affected.', document: 'Record the request and routing; continue accurate current documentation and use approved correction procedures for your own error.', sources: ['45 CFR §164.526', 'CO-HP-006'] },
      { id: 'communications', label: 'Confidential communication preference', shortLabel: 'Contact Choice', x: 16, y: 72, kind: 'verify', observed: 'The patient is selecting a safer address, phone, or communication method.', significance: 'A confidential-communication request must reach the systems and people who schedule, call, mail, or send information.', action: 'Confirm the patient’s requested method, avoid exposing it in a personal contact list, and route it through the approved update workflow.', notify: 'Notify Privacy or the designated registration/records function when the requested method cannot be implemented immediately.', document: 'Capture the exact preference, effective contact information, and routing according to policy.', sources: ['45 CFR §164.522(b)', 'CO-HP-006'] },
      { id: 'envelope', label: 'Sealed restriction or accounting request', shortLabel: 'Route & Track', x: 67, y: 84, kind: 'report', observed: 'A sealed envelope represents a restriction, accounting, or privacy complaint request.', significance: 'The scope and response require organizational review; an accounting does not include every use or disclosure.', action: 'Keep the request confidential, route it to Privacy, and never promise approval, completion, or a legal finding.', notify: 'Notify Privacy promptly; use the supervisor chain if the designated route is unavailable.', document: 'Record receipt, routing, and any immediate protection requested by the patient without adding speculation.', sources: ['45 CFR §§164.522, 164.528', 'CO-HP-006', 'CO-HP-101'] },
    ],
  },
  {
    id: 4,
    shortName: 'Incident Response',
    title: 'Recognize, Report & Preserve',
    subtitle: 'Treat uncertainty as reportable; Privacy and Security determine whether an incident is a breach',
    overview: [
      'A privacy incident is a suspected unauthorized access, use, or disclosure of PHI in any form. A security incident can include attempted or successful unauthorized access, credential compromise, phishing, malware, alteration, destruction, or interference with systems containing ePHI. A near miss may be stopped before confirmed exposure, but it still provides information the agency needs. Field workers report suspected events; they do not close the case themselves.',
      'A breach is a formal legal and organizational determination under the HIPAA Breach Notification Rule, not a label a worker applies at the scene. The Privacy Officer evaluates the information involved, the unauthorized person, whether information was acquired or viewed, mitigation, and regulatory exceptions. Encryption or a passcode may affect the assessment, but it never removes the worker’s duty to report a lost device or suspected exposure.',
      'Use the response sequence: Stop → Secure → Report → Preserve → Follow direction. Care Indeed’s supplied incident policy requires suspected or confirmed incidents to reach Privacy and IT within one hour of discovery. Act sooner whenever possible. Protect safety, stop additional exposure within your authority, report through the approved channel, preserve the original evidence, and follow authorized containment instructions.',
    ],
    details: [
      { heading: 'Stop and secure', body: 'Stop the action creating exposure. Lock the device, close the record, collect loose paper, disconnect only when the approved security procedure directs it, and move conversation to a private setting. Do not endanger yourself, seize another person’s device, or conduct a search. Do not use a suspected compromised account to send more PHI. If clinical care is interrupted, protect the patient and use the downtime or escalation process.' },
      { heading: 'Report facts within one hour', body: 'Use the verified agency incident channel to alert Privacy and IT as applicable. Report who discovered the event, what happened, when and where it occurred, the device, account, paper, recipient, or system involved, the categories of PHI that may be involved, and actions already taken. Do not wait for proof, for a recipient to reply, or for the end of the shift. Do not promise a patient that notification will or will not occur.' },
      { heading: 'Preserve evidence', body: 'Keep the original message, recipient address, attachment, envelope, device state, time stamps, or screenshot only when captured through an approved evidence process. Do not forward the event to coworkers, delete the sent message, alter logs, wipe a device, or recreate evidence in a personal account. Note objective facts contemporaneously. Privacy and IT will direct recall, recipient contact, remote lock or wipe, forensic review, and other mitigation.' },
    ],
    keyPoints: [
      { icon: '⛔', title: 'Stop exposure', detail: 'Secure only within your authority and protect patient safety.' },
      { icon: '📞', title: 'Report within one hour', detail: 'Do not wait for proof, reply, or end of shift.' },
      { icon: '🧩', title: 'Preserve evidence', detail: 'Keep original messages, addresses, times, and device state.' },
      { icon: '⚖️', title: 'Do not declare breach', detail: 'Privacy and Security own assessment and notification decisions.' },
    ],
    clinicalTip: 'Report the suspected event, not your legal conclusion: describe who, what, when, where, information involved, and actions taken.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §§164.400–164.414; §164.308(a)(6)' },
      { kind: 'Care Indeed', text: 'CO-IR-101; CO-HP-003; IT-UP-002' },
    ],
    sceneImage: img05,
    sceneAlt: 'A home-health worker calmly reports a suspected privacy incident by approved phone while preserving an open agency tablet, empty device sleeve, sealed misdirected envelope, suspicious message, and factual incident notes.',
    hotspots: [
      { id: 'phone', label: 'Immediate agency report', shortLabel: 'Report Now', x: 31, y: 28, kind: 'report', observed: 'The worker is calling the approved incident channel promptly after discovery.', significance: 'Delay can allow continued access, reduce mitigation options, and weaken evidence. The agency requires reporting within one hour.', action: 'State objective facts, remain available for instructions, and use an alternate supervisor route if the primary contact is unavailable.', notify: 'Alert Privacy and IT as the event requires, using the agency’s verified channel rather than an unverified number embedded in training.', document: 'Record discovery time, report time, person or function notified, and instructions received.', sources: ['CO-IR-101 §4.1', '45 CFR §164.308(a)(6)'] },
      { id: 'tablet', label: 'Preserved device and message state', shortLabel: 'Preserve Device', x: 50, y: 48, kind: 'protect', observed: 'The tablet remains available for authorized review with the original message state preserved.', significance: 'Deleting, forwarding, or altering the device can destroy evidence or spread PHI.', action: 'Stop further use, secure the screen, and follow IT direction. Do not self-wipe, reset, investigate, or keep testing the suspicious link.', notify: 'Notify IT and Privacy immediately, especially after credential entry, attachment opening, or unexpected access.', document: 'Capture factual device, account, message, and time information through the approved incident method.', sources: ['45 CFR §164.308(a)(6)', 'IT-UP-002', 'CO-IR-101'] },
      { id: 'sleeve', label: 'Empty device sleeve', shortLabel: 'Missing Device', x: 19, y: 64, kind: 'report', observed: 'An empty sleeve may signal that an agency device is missing.', significance: 'A lock or encryption may reduce risk but cannot be assumed to prevent viewing or eliminate reporting.', action: 'Check the immediate safe area without delaying, then report the device, last known location, safeguards, and time discovered.', notify: 'Notify IT and Privacy within one hour; follow authorized remote-lock or recovery instructions.', document: 'Record device description, last secure use, location, discovery, and steps taken without declaring a breach.', sources: ['Care Indeed IT-UP-001', 'CO-IR-101'] },
      { id: 'envelope', label: 'Misdirected sealed envelope', shortLabel: 'Wrong Recipient', x: 34, y: 79, kind: 'report', observed: 'A sealed envelope appears addressed or delivered to the wrong recipient.', significance: 'Even if it appears unopened, the organization must assess custody, contents, recipient, and mitigation.', action: 'Secure the envelope if lawfully in your control, avoid opening or redistributing it, and report the facts for Privacy direction.', notify: 'Notify Privacy through the incident route; do not contact the recipient independently unless directed.', document: 'Record the intended and actual destination, condition of the envelope, contents if known, dates, and custody actions.', sources: ['45 CFR §164.402', 'CO-IR-101'] },
      { id: 'notes', label: 'Objective incident notes', shortLabel: 'Facts Only', x: 63, y: 81, kind: 'verify', observed: 'The worker is noting facts without copying the full clinical narrative.', significance: 'Incident review needs accurate facts while unnecessary duplication can create another disclosure.', action: 'Record who, what, when, where, systems or recipients, information categories, and actions taken. Separate facts from assumptions.', notify: 'Send the report only through the approved restricted incident workflow.', document: 'Do not write “breach confirmed,” assign blame, promise notification, or distribute the report to the general care team.', sources: ['CO-IR-101', '45 CFR §164.530(f)'] },
    ],
  },
  {
    id: 5,
    shortName: 'Sensitive Sharing',
    title: 'Photos, Family, Interpreters & Sensitive Information',
    subtitle: 'Relationship and convenience do not replace patient choice, approved tools, or Privacy review',
    overview: [
      'Home health naturally involves family, caregivers, interpreters, photographs, and intimate information. Each can support safe care, but each can also widen exposure. Start with the patient: identify who is present, ask who may participate when appropriate, and limit conversation to what is directly relevant. If capacity, personal-representative authority, abuse concerns, or conflicting instructions make the situation uncertain, pause and seek guidance.',
      'Never use a personal phone, camera, gallery, recorder, or social account for patient information. Do not post a “nameless” story, recognizable home, unusual diagnosis, schedule, or image. Removing the patient’s name does not necessarily de-identify the content, and privacy settings do not convert social media into a clinical channel. Clinical photography, when permitted at all, requires a specifically approved, role-authorized capture workflow. This module does not grant that authority.',
      'Qualified interpreter services support accurate communication and confidentiality. Do not default to a child or relative for convenience. Sensitive categories—such as substance use disorder, mental health, HIV, genetic, reproductive, minor-consent, or abuse-related information—may have additional federal or California protections. Field workers should not decide whether an unusual legal, police, media, or sensitive-record request is valid. Protect it and route it to Privacy or Compliance.',
    ],
    details: [
      { heading: 'Family and caregiver involvement', body: 'When the capable patient is present, ask whether the patient agrees to the person’s participation or provide an opportunity to object. Share only information directly relevant to that person’s involvement in care or payment. Do not use relationship labels as proof of unrestricted authority. When the patient is not present or cannot agree, the applicable professional-judgment and representative rules require careful organizational guidance; contact the supervisor or Privacy rather than improvising.' },
      { heading: 'Interpreters and accessibility', body: 'Use the agency’s qualified interpreter or accessible-communication process. Confirm that the interpreter channel is approved and that participants can communicate privately. A patient may sometimes choose an adult family member, but the worker should not pressure that choice or use a minor except in a genuine emergency under the applicable procedure. Speak to the patient, use short clear segments, and document the interpreter service and relevant teaching outcome.' },
      { heading: 'Photography, audio, and social media', body: 'A clinical purpose does not authorize a personal-device photo. Verify that the care plan, role, agency policy, approved device, consent or authorization requirements, and record workflow all permit capture before taking any image. If the approved pathway is not confirmed, do not capture. Never copy a clinical image into a personal gallery, text it, post it, use it for teaching, or feed it to an unapproved tool. Report accidental capture or posting immediately and preserve facts.' },
    ],
    keyPoints: [
      { icon: '🙋', title: 'Ask the patient', detail: 'Verify who may participate and what is relevant.' },
      { icon: '🌐', title: 'Use qualified support', detail: 'Follow the approved interpreter and accessibility process.' },
      { icon: '📵', title: 'No personal capture', detail: 'Personal phones, galleries, recorders, and social media are off limits.' },
      { icon: '🛑', title: 'Route unusual requests', detail: 'Sensitive, legal, police, and media requests go to Privacy.' },
    ],
    clinicalTip: 'If a photo, family, interpreter, or sensitive-data request does not fit a verified workflow, protect the information and pause before disclosure.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §§164.508, 164.510(b)' },
      { kind: 'California', text: 'CMIA, Civil Code §§56–56.37' },
      { kind: 'Care Indeed', text: 'CO-HP-004; CO-HP-101; IT-UP-003' },
    ],
    sceneImage: img06,
    sceneAlt: 'A patient, home-health clinician, caregiver, and qualified interpreter on an agency tablet discuss care privately; a personal phone is face-down, an approved device pouch is closed, and a sensitive-record folder remains sealed.',
    hotspots: [
      { id: 'patient', label: 'Patient agreement before family discussion', shortLabel: 'Ask Patient', x: 22, y: 48, kind: 'verify', observed: 'The clinician is asking the patient whether the caregiver may join the discussion.', significance: 'A family connection alone does not create blanket access, and the patient may limit topics or participants.', action: 'Confirm the patient’s preference, share only directly relevant information, and revisit consent when the topic or participants change.', notify: 'Escalate conflicting wishes, capacity questions, representative disputes, or safety concerns to the supervisor or Privacy.', document: 'Record the patient’s relevant participation preference and caregiver teaching outcome without unnecessary personal detail.', sources: ['45 CFR §164.510(b)', 'CO-HP-004'] },
      { id: 'interpreter', label: 'Qualified interpreter on agency tablet', shortLabel: 'Interpreter', x: 65, y: 48, kind: 'protect', observed: 'A qualified interpreter participates through an agency-approved platform.', significance: 'Accurate, confidential interpretation supports meaningful communication and reduces reliance on unverified bystanders.', action: 'Confirm the approved service, protect the screen and audio, speak directly to the patient, and use clear segments with teach-back.', notify: 'Contact the supervisor when interpreter access fails or the patient requests an accommodation not available at the visit.', document: 'Record the interpreter service or identifier permitted by policy, language or accommodation, and relevant communication outcome.', sources: ['45 CFR §164.530(c)', 'CO-HP-004', 'Recommended practice'] },
      { id: 'caregiver', label: 'Caregiver awaiting a defined role', shortLabel: 'Relevant Only', x: 81, y: 44, kind: 'verify', observed: 'The caregiver is present but does not hold or view the patient’s record.', significance: 'Participation can be appropriate while access remains limited to information relevant to the caregiver’s role.', action: 'Clarify the patient’s preference and the caregiver’s task, then disclose only what supports that task through the approved conversation.', notify: 'Route requests for the full record, conflicting instructions, or claimed legal authority to Privacy or records.', document: 'Document relevant teaching and the patient’s expressed preference, not a blanket authorization.', sources: ['45 CFR §164.510(b)', 'CO-HP-004'] },
      { id: 'personal-phone', label: 'Unused personal phone', shortLabel: 'No Personal Photo', x: 21, y: 74, kind: 'stop', observed: 'A personal phone rests face-down and is not used for photography, recording, or messaging.', significance: 'Personal storage, backups, notifications, and social applications can create uncontrolled PHI copies.', action: 'Do not capture or transmit PHI on a personal device. Use only a specifically approved, role-authorized agency workflow when clinical capture is permitted.', notify: 'Report accidental capture, upload, text, or posting immediately; do not engage publicly or delete evidence before direction.', document: 'Preserve the relevant device, account, time, audience, and content facts through the restricted incident process.', sources: ['Care Indeed IT-UP-001', 'IT-UP-003', 'CO-IR-101'] },
      { id: 'folder', label: 'Sealed sensitive-information folder', shortLabel: 'Sensitive Data', x: 79, y: 82, kind: 'report', observed: 'A closed folder represents information that may receive additional legal protections.', significance: 'Substance-use, mental-health, HIV, genetic, reproductive, minor-consent, and abuse-related information can require specialized review.', action: 'Keep the information closed and disclose nothing in response to an unusual request until Privacy or Compliance confirms the pathway.', notify: 'Route sensitive, legal, police, subpoena, court, media, or unfamiliar government requests to Privacy or Compliance.', document: 'Record receipt and routing without copying sensitive details into unsecured messages or making a legal determination.', sources: ['CMIA', '42 CFR Part 2', 'CO-HP-101'] },
    ],
  },
  {
    id: 6,
    shortName: 'Field Practice',
    title: 'Privacy Decisions at the Door',
    subtitle: 'Observe → classify → protect or verify → report and preserve when something goes wrong',
    overview: [
      'The final privacy sweep begins before the visit ends. Look at the room, the people, the technology, and every item you brought. Confirm that the clinical conversation includes only authorized participants. Lock screens, collect papers, close the work bag, clear temporary notes through the approved process, and ensure no PHI remains visible or stored in an unapproved place. Privacy is completed at each transition, not postponed until the office.',
      'Use a five-part decision frame. First, observe what information, person, device, or request is present. Second, classify the work purpose and whether the pathway is clearly approved. Third, protect the patient by controlling sight, sound, custody, and access. Fourth, verify identity, authority, relevance, and channel before disclosure. Fifth, when exposure or uncertainty remains, report facts and preserve evidence. Do not investigate beyond your role or promise the outcome.',
      'One safe action does not cancel another risk. A locked tablet may still be missing. A caregiver authorized for medication teaching may not be authorized for unrelated sensitive information. A message sent through an approved encrypted system may still reach the wrong recipient. The standard is disciplined judgment at every step: protect, verify, report, and document only what belongs in the appropriate record.',
    ],
    details: [
      { heading: 'Integrated case: the room', body: 'You finish teaching while a caregiver enters, a smart speaker is active, and the tablet faces the doorway. Pause the conversation. Ask the patient who may participate, reposition and lock the screen, mute or move away from listening devices when feasible, and continue only when privacy is reasonably controlled. If the caregiver requests unrelated records, route the request. Document the teaching outcome, not a running description of household privacy controls.' },
      { heading: 'Integrated case: the materials', body: 'During the exit sweep you find one loose note and cannot locate the agency phone. Secure the note, check the immediate safe area without delaying, and report the missing device within one hour. Provide the last known location, device safeguards, information potentially accessible, and actions taken. Do not assume the lock makes reporting unnecessary. Do not ask the family to search private areas or accuse anyone.' },
      { heading: 'Integrated case: the message', body: 'A supervisor asks for an update while you are walking to the vehicle. Move to a private setting and use the approved channel. Verify the recipient and patient before sending. If autocomplete selects the wrong person, stop further disclosure, preserve the message, and report it even if the system shows encryption or the recipient says it was deleted. Privacy determines the assessment and any recipient contact.' },
    ],
    keyPoints: [
      { icon: '👁️', title: 'Observe', detail: 'Scan people, devices, papers, sound, screens, and requests.' },
      { icon: '🧭', title: 'Classify', detail: 'Identify purpose, authority, relevance, and approved pathway.' },
      { icon: '🛡️', title: 'Protect & verify', detail: 'Control access before using or disclosing information.' },
      { icon: '📣', title: 'Report & preserve', detail: 'Escalate suspected incidents within one hour; facts only.' },
    ],
    clinicalTip: 'Before crossing the threshold, stop for ten seconds: screen locked, paper counted, bag closed, conversation ended, no PHI left behind.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR Parts 160 and 164' },
      { kind: 'California', text: 'CMIA; Health & Safety Code §123110' },
      { kind: 'Care Indeed', text: 'CO-HP series; CO-IR-101; IT security/use policies' },
    ],
    sceneImage: img07,
    sceneAlt: 'A home-health worker completes an end-of-visit privacy sweep by locking a tablet, securing paper in a document pouch, closing the work bag, checking a smart speaker, confirming caregiver participation, and keeping records out of a parked car.',
    hotspots: [
      { id: 'speaker', label: 'Smart speaker and ambient privacy', shortLabel: 'Listening Device', x: 61, y: 85, kind: 'verify', observed: 'A smart speaker or home listening device is near the care conversation.', significance: 'Home technology can capture or transmit sound beyond the people visibly present.', action: 'Pause sensitive discussion, ask the patient about the device, and mute it or move to a more private area when feasible and appropriate.', notify: 'Escalate if necessary care cannot be discussed privately or a recording is suspected.', document: 'Document clinically relevant communication barriers; report suspected recording or disclosure through the incident route.', sources: ['45 CFR §164.530(c)', 'Recommended practice'] },
      { id: 'tablet', label: 'Tablet locked before departure', shortLabel: 'Final Lock', x: 34, y: 47, kind: 'protect', observed: 'The worker is locking the agency tablet at the end of documentation.', significance: 'The last moments of a visit are vulnerable to shoulder surfing, forgotten screens, and hurried transitions.', action: 'Save through the approved system, close the patient record, lock the screen, and maintain direct custody through transport.', notify: 'Report a missing device, unexpected access, or unsaved clinical information through the appropriate IT, privacy, and clinical pathways.', document: 'Use the clinical record for care content and the incident system for exposure facts; never store PHI in personal notes.', sources: ['45 CFR §164.312', 'IT-UP-001', 'IT-SC-002'] },
      { id: 'paper', label: 'Loose paper entering document pouch', shortLabel: 'Count Paper', x: 25, y: 69, kind: 'protect', observed: 'The worker locates and secures a loose visit note during the exit sweep.', significance: 'A single page can reveal identity, services, diagnosis, medications, or contact information.', action: 'Collect every page, place it in the approved closed pouch, and return or destroy it through the approved process.', notify: 'If a page cannot be located or may have been viewed, report within one hour.', document: 'Identify the page, last known location, likely viewers, search limited to the immediate safe area, and actions taken.', sources: ['CO-HP-001', 'CO-IR-101'] },
      { id: 'caregiver', label: 'Caregiver requesting an update', shortLabel: 'Verify Again', x: 75, y: 62, kind: 'verify', observed: 'A caregiver asks for information as the visit concludes.', significance: 'Permission can be topic-specific; authorization for medication teaching does not automatically include unrelated sensitive information.', action: 'Confirm the patient’s current preference and the caregiver’s relevant role before speaking. Route record requests or disputed authority.', notify: 'Contact the supervisor or Privacy when patient wishes, representative claims, or sensitive topics conflict.', document: 'Record relevant education and patient preference, not an unnecessary transcript of the household conversation.', sources: ['45 CFR §164.510(b)', 'CO-HP-004'] },
      { id: 'bag', label: 'Zipped bag and clean vehicle transition', shortLabel: 'Exit Sweep', x: 15, y: 78, kind: 'protect', observed: 'The bag is zipped and the parked vehicle contains no visible records.', significance: 'The threshold combines risks from the home, public view, transport, and divided attention.', action: 'Confirm devices and papers, close each compartment, keep materials out of sight, and proceed under the approved transport method.', notify: 'Report any missing item, theft, or suspected viewing immediately; do not wait for the next visit.', document: 'Record objective loss or exposure facts and report time. Do not declare that safeguards prove no breach occurred.', sources: ['IT-UP-001', 'CO-IR-101'] },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    category: 'Direct application',
    stem: 'Which item is protected health information in the agency’s home-health workflow?',
    options: [
      'A blank visit form with no patient information',
      'A public brochure describing home-health services',
      'A schedule that links a named person and home address to a skilled nursing visit',
      'A formally de-identified aggregate count with no re-identification key available to the user',
    ],
    correct: 2,
    rationale: 'A schedule that identifies a person as receiving health care is individually identifiable health information and can be PHI. PHI is not limited to diagnoses or full medical records, and it can exist in paper, verbal, visual, or electronic form.',
    sources: ['45 CFR §160.103', 'CO-HP-001'],
  },
  {
    id: 1,
    category: 'Direct application',
    stem: 'Which statement correctly describes the HIPAA minimum-necessary standard and Care Indeed access controls?',
    options: [
      'Federal minimum necessary applies without exception to every treatment disclosure',
      'A valid authorization always requires the worker to disclose the entire record',
      'Federal minimum necessary has listed exceptions, while Care Indeed may still use stricter role-based and least-access controls',
      'Minimum necessary permits curiosity access as long as no information is shared',
    ],
    correct: 2,
    rationale: '45 CFR §164.502(b)(2) lists exceptions, including many treatment disclosures and requests, disclosures to the individual, and uses or disclosures under a valid authorization. Agency role-based access can remain stricter and must still be followed.',
    sources: ['45 CFR §164.502(b)', 'CO-DG-101', 'IT-SC-002'],
  },
  {
    id: 2,
    category: 'Home-health scenario',
    stem: 'A capable patient’s adult daughter enters the room and asks to hear medication instructions. What is the best field response?',
    options: [
      'Share the full chart because an adult child is automatically authorized',
      'Refuse all discussion because family involvement always requires a written authorization',
      'Ask the patient whether the daughter may participate and share only information directly relevant to that role',
      'Ask the daughter to sign the Notice of Privacy Practices acknowledgment',
    ],
    correct: 2,
    rationale: 'Family relationship alone is not blanket access. When the patient is present and capable, obtain agreement or provide an opportunity to object, then limit discussion to information directly relevant to the person’s involvement.',
    sources: ['45 CFR §164.510(b)', 'CO-HP-004'],
  },
  {
    id: 3,
    category: 'Home-health scenario',
    stem: 'A clinician believes a wound photograph would help the care team, but the approved agency capture pathway has not been confirmed. What should the clinician do?',
    options: [
      'Use a personal phone and delete the image after texting it to the supervisor',
      'Take the image without identifiers because removing the name guarantees de-identification',
      'Do not capture it; protect the patient and verify the role-authorized agency workflow before any photograph is taken',
      'Ask the caregiver to take the image and upload it to a shared consumer drive',
    ],
    correct: 2,
    rationale: 'A clinical purpose does not authorize personal-device capture. Photography requires a verified, role-authorized agency device and record workflow plus any applicable permission requirements. This training does not grant capture authority.',
    sources: ['Care Indeed IT-UP-001', 'CO-HP-004', 'CO-DG-101'],
  },
  {
    id: 4,
    category: 'Home-health scenario',
    stem: 'An agency tablet is missing after a vehicle transition. The worker remembers that it had a passcode. What is the priority action?',
    options: [
      'Wait until the end of the shift because the passcode proves no disclosure occurred',
      'Report immediately and no later than one hour with the device and last-known-location facts, then follow IT and Privacy direction',
      'Use a personal tracking application to wipe it and report only if recovery fails',
      'Ask the patient’s family to search the neighborhood before contacting the agency',
    ],
    correct: 1,
    rationale: 'A passcode or encryption may affect organizational risk assessment, but it does not cancel the duty to report loss or theft. Prompt reporting gives authorized teams the best chance to contain and assess the event.',
    sources: ['CO-IR-101 §4.1', 'Care Indeed IT-UP-001'],
  },
  {
    id: 5,
    category: 'Home-health scenario',
    stem: 'A field worker must send an approved clinical update from the patient’s home. Which approach is safest?',
    options: [
      'Use the agency-approved secure channel, move to a private setting, and verify the recipient, patient, and attachment before sending',
      'Send from personal email because it is faster and delete the sent item afterward',
      'Use ordinary SMS if the message contains initials instead of a name',
      'Copy the update into a personal notes application and send it later from home',
    ],
    correct: 0,
    rationale: 'Approved technology does not replace recipient and environment checks. Care Indeed policy requires approved channels and prohibits personal email, ordinary consumer messaging, and shadow copies for PHI.',
    sources: ['Care Indeed IT-UP-002', 'CO-DG-101', '45 CFR §164.530(c)'],
  },
  {
    id: 6,
    category: 'Home-health scenario',
    stem: 'A patient says a prior visit note is wrong and asks the field worker to delete it immediately. What should the worker do?',
    options: [
      'Delete the note so the patient’s access right is honored',
      'Overwrite the author’s entry but leave no indication that it changed',
      'Explain the formal amendment route, preserve the original and audit trail, and send the request through the approved process',
      'Tell the patient that health records can never be amended',
    ],
    correct: 2,
    rationale: 'Patients may request amendment, but a request is not permission to erase or secretly rewrite an original record. The agency reviews the request through its formal process while record integrity is preserved.',
    sources: ['45 CFR §164.526', 'CO-HP-006'],
  },
  {
    id: 7,
    category: 'Documentation & escalation',
    stem: 'An encrypted agency email containing PHI was sent to the wrong recipient. What belongs in the initial incident report?',
    options: [
      'A conclusion that a federal breach definitely occurred and a promise that the patient will be notified',
      'Objective facts: sender and recipients, time, information involved, attachment, safeguards, and actions already taken',
      'A copy of the entire patient chart distributed to the care team for context',
      'Only a note that the message was encrypted, because no further review is required',
    ],
    correct: 1,
    rationale: 'Report facts and preserve evidence. Encryption can affect assessment but does not eliminate reporting. Privacy and Security—not the field worker—determine breach status, mitigation, and notifications.',
    sources: ['45 CFR §164.402', 'CO-IR-101', 'IT-UP-002'],
  },
  {
    id: 8,
    category: 'Documentation & escalation',
    stem: 'A worker notices that a coworker may have opened a neighbor’s record without an assignment. What is the appropriate response?',
    options: [
      'Open the same record to see whether the concern is valid',
      'Confront the coworker and inspect their device',
      'Report the observed facts through the privacy or compliance channel without conducting an independent investigation',
      'Wait until a patient complains because access alone can never be an incident',
    ],
    correct: 2,
    rationale: 'Possible curiosity access is a suspected privacy and security event. Preserve what you directly observed and report it. Do not create another unauthorized access or investigate another workforce member yourself.',
    sources: ['IT-SC-002', 'CO-IR-101', 'CO-HP-001'],
  },
  {
    id: 9,
    category: 'Integrated judgment',
    stem: 'During a visit, a caregiver can see the tablet, a smart speaker is active, and the worker has just entered credentials after clicking a suspicious message. What is the best complete response?',
    options: [
      'Finish documentation, delete the message, and change the password tomorrow',
      'Ask the caregiver not to look and continue because the worker used an agency tablet',
      'Stop further exposure, lock and secure the device, move the conversation, immediately notify IT and Privacy, preserve the message and facts, and follow containment instructions',
      'Contact every patient whose record might be accessible before informing the agency',
    ],
    correct: 2,
    rationale: 'The situation combines visual exposure, ambient privacy, and possible credential compromise. Protect the environment and patient, report promptly, preserve evidence, and follow authorized directions. Do not delete evidence, investigate, or make external notifications independently.',
    sources: ['45 CFR §§164.308(a)(6), 164.530(c)', 'CO-IR-101', 'IT-UP-002'],
  },
];

const STYLES = `
.achcm04,.achcm04 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm04-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm04-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm04-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm04-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.achcm04-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.achcm04-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;flex-shrink:0}
.achcm04-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm04-tabs::-webkit-scrollbar{display:none}
.achcm04-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm04-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm04-tab.quiz-tab{border:1px solid #C2410C;color:#C2410C}
.achcm04-tab.quiz-tab.active{background:#C2410C;color:#fff;border-color:#C2410C}
.achcm04-tab:focus-visible,.achcm04-exit:focus-visible,.achcm04 button:focus-visible,.achcm04 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
.achcm04-exit{flex-shrink:0;border-radius:10px;border:1px solid #C2410C;background:#fff;color:#C2410C;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm04-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm04-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.achcm04-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm04-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.achcm04-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm04-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm04-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm04-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm04-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.22);color:#fff;font-weight:800}
.achcm04-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#C2410C;animation:achcm04-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm04-hotspot .tag{background:rgba(255,255,255,.97);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.12);white-space:nowrap;letter-spacing:.02em;max-width:150px;line-height:1.2;overflow:hidden;text-overflow:ellipsis}
.achcm04-hotspot:focus-visible{outline:none}
.achcm04-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.5)}
.achcm04-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.56);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm04-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm04-drawer{width:min(470px,100%);max-height:min(90%,640px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.24)}
.achcm04-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:grid;grid-template-columns:minmax(80px,1fr) auto minmax(80px,1fr);align-items:center;padding:0 24px;flex-shrink:0;gap:12px}
.achcm04-bot button.nav{justify-self:start;border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm04-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm04-bot button.next{justify-self:end;background:#C2410C;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(194,65,12,.28);min-height:44px}
.achcm04-lesson-badge{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0F5B54;background:#EEF4F3;border:1px solid #C8DFDC;border-radius:8px;padding:8px 12px;display:block;max-width:48vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.achcm04-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm04-quiz-card{width:min(780px,100%);animation:achcm04-slide .35s cubic-bezier(.16,1,.3,1)}
.achcm04-sr-only,.achcm04-live{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (max-width:900px){
  .achcm04-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm04-left,.achcm04-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm04-right{min-height:380px}
  .achcm04-left{max-height:42vh}
  .achcm04-top{padding:0 10px;gap:8px}
  .achcm04-tab{padding:8px 10px;font-size:12px}
  .achcm04-bot{padding:0 12px;height:72px}
  .achcm04-hotspot .tag{font-size:11px;max-width:112px}
}
@media (max-width:600px){
  .achcm04-bot{grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;padding:0 8px}
  .achcm04-bot button.nav,.achcm04-bot button.next{width:44px;min-width:44px;padding:0;justify-content:center;border-radius:10px}
  .achcm04-bot .nav-copy,.achcm04-bot .next-copy{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .achcm04-lesson-badge{max-width:100%;font-size:11px;padding:8px}
  .achcm04-quiz-page{padding:10px}
}
@media (max-width:420px){
  .achcm04-brand span.brand-text{display:none}
  .achcm04-exit{padding:8px 10px;font-size:11px}
  .achcm04-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .achcm04-hotspot .ping,.achcm04-drawer-bg,.achcm04-quiz-card{animation:none!important}
  .achcm04-rm-transition{transition:none!important;animation:none!important}
}
`;

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function HotspotDialog({ hotspot, onClose, onComplete, triggerRef }: {
  hotspot: Hotspot;
  onClose: () => void;
  onComplete: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const action = ACTION[hotspot.kind];

  const closeAndReturn = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [hotspot.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
      }
    };
    document.addEventListener('keydown', onKey);
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = priorOverflow;
    };
  }, [closeAndReturn]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((node) => !node.hasAttribute('disabled'));
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
    <div className="achcm04-drawer-bg" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAndReturn(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm04-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.97)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 10, background: action.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.kind === 'stop' ? <XCircle size={18} /> : hotspot.kind === 'report' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: action.color }}>{action.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close dialog" onClick={closeAndReturn} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} className="achcm04-sr-only">Field confidentiality feedback with observation, significance, safe action, reporting, documentation, and sources.</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.observed} />
          <FeedbackBlock label="Why it matters" body={hotspot.significance} />
          <FeedbackBlock label="Safe field action" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who to notify" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What to document" body={hotspot.document} icon={<FileText size={14} />} />
          <div aria-label="Sources" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.sources.map((source) => <span key={source} style={{ fontSize: 11, fontWeight: 800, padding: '5px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{source}</span>)}
          </div>
          <button type="button" onClick={() => { onComplete(); window.requestAnimationFrame(() => triggerRef.current?.focus()); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
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
      <p style={{ margin: '0 0 16px', color: CI.orangeAction, fontSize: 15, fontWeight: 650 }}>{page.subtitle}</p>
      {page.overview.map((paragraph, index) => <p key={index} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
      <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
        <summary style={{ padding: '12px 14px', minHeight: 44, fontWeight: 750, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {page.details.map((detail) => (
            <section key={detail.heading} style={{ marginBottom: 16 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.4, color: CI.teal }}>{detail.heading}</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.68, color: '#524C4B' }}>{detail.body}</p>
            </section>
          ))}
        </div>
      </details>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((point) => (
          <div key={point.title} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden="true">{point.icon}</span>
            <div>
              <div style={{ fontWeight: 750, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{point.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{point.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeAction}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeAction, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div aria-label="Lesson sources" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {page.sourceLabels.map((source) => <span key={`${source.kind}-${source.text}`} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 750 }}>{source.kind}: {source.text}</span>)}
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData;
  completed: string[];
  setCompleted: (ids: string[]) => void;
  onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const completionRef = useRef<HTMLButtonElement>(null);
  const active = page.hotspots.find((hotspot) => hotspot.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;

  useEffect(() => {
    setActiveId(null);
    setCompletionVisible(false);
  }, [page.id]);

  useEffect(() => {
    if (done && !activeId) {
      setCompletionVisible(true);
      window.requestAnimationFrame(() => completionRef.current?.focus());
    }
  }, [done, activeId]);

  return (
    <div className="achcm04-stage-wrap">
      <div className="achcm04-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={page.sceneAlt} draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(52%, 330px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.95)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeAction }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.95)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }}>
          <Eye size={14} aria-hidden="true" /> {completed.length} / {page.hotspots.length} observed
        </div>
        <div id={`achcm04-progress-${page.id}`} className="achcm04-live" aria-live="polite">{completed.length} of {page.hotspots.length} observations complete.</div>
        {page.hotspots.map((hotspot, index) => {
          const isDone = completed.includes(hotspot.id);
          const nextIncomplete = page.hotspots.find((candidate) => !completed.includes(candidate.id));
          const guided = !isDone && nextIncomplete?.id === hotspot.id;
          const action = ACTION[hotspot.kind];
          return (
            <button
              key={hotspot.id}
              type="button"
              className={`achcm04-hotspot ${isDone ? 'done' : ''} ${guided ? 'guided' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={isDone ? `${hotspot.label}, observed` : `Investigate ${hotspot.label}`}
              aria-describedby={`achcm04-progress-${page.id}`}
              onClick={(event) => { triggerRef.current = event.currentTarget; setActiveId(hotspot.id); setCompletionVisible(false); }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : action.color }}>
                {guided && <span className="ping" />}
                {isDone ? <Check size={20} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}
              </span>
              <span className="tag">{hotspot.shortLabel}</span>
            </button>
          );
        })}
        <button type="button" aria-label="Reset this lesson's observations" onClick={() => { setCompleted([]); setCompletionVisible(false); }} style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.96)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}><RotateCcw size={13} aria-hidden="true" /> Reset</button>
        {done && completionVisible && !activeId && (
          <div role="status" aria-live="polite" style={{ position: 'absolute', left: '50%', bottom: 64, transform: 'translateX(-50%)', zIndex: 24, background: '#fff', borderRadius: 16, padding: 18, width: 'min(390px,88%)', textAlign: 'center', border: `3px solid ${CI.tealSoft}`, boxShadow: '0 18px 42px rgba(15,91,84,.24)' }}>
            <ShieldCheck size={30} color={CI.teal} aria-hidden="true" />
            <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, margin: '4px 0' }}>Scene Complete</div>
            <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 12 }}>Scenario practice complete. Knowledge practice only; field authorization and competency remain separate.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button ref={completionRef} type="button" onClick={() => setCompletionVisible(false)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 10, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Review scene</button>
              {onGoQuiz && page.id === PAGES.length - 1 && <button type="button" onClick={onGoQuiz} style={{ minHeight: 44, padding: '0 14px', borderRadius: 10, border: 0, background: CI.orangeAction, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Knowledge Check</button>}
            </div>
          </div>
        )}
        {active && <HotspotDialog hotspot={active} onClose={() => setActiveId(null)} onComplete={() => { if (!completed.includes(active.id)) setCompleted([...completed, active.id]); setActiveId(null); }} triggerRef={triggerRef} />}
      </div>
    </div>
  );
}

interface QuizPersistState {
  answers: (number | null)[];
  index: number;
  finished: boolean;
  selected: number | null;
  submitted: boolean;
  attemptCount: number;
  lastScore: number | null;
  bestScore: number | null;
}

function QuizPage({ onBack, initial, onPersist }: { onBack: () => void; initial: QuizPersistState; onPersist: (state: QuizPersistState) => void }) {
  const [index, setIndex] = useState(initial.index);
  const [selected, setSelected] = useState<number | null>(initial.selected);
  const [submitted, setSubmitted] = useState(initial.submitted);
  const [answers, setAnswers] = useState<(number | null)[]>(initial.answers);
  const [finished, setFinished] = useState(initial.finished);
  const [attemptCount, setAttemptCount] = useState(initial.attemptCount);
  const [lastScore, setLastScore] = useState<number | null>(initial.lastScore);
  const [bestScore, setBestScore] = useState<number | null>(initial.bestScore);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const question = QUIZ[index];
  const score = useMemo(() => answers.reduce<number>((total, answer, answerIndex) => total + (answer === QUIZ[answerIndex].correct ? 1 : 0), 0), [answers]);
  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = percent >= MODULE_META.passing;
  const isCorrect = selected === question.correct;
  const progress = ((index + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, index, finished, selected, submitted, attemptCount, lastScore, bestScore });
  }, [answers, index, finished, selected, submitted, attemptCount, lastScore, bestScore, onPersist]);

  const focusOption = (next: number) => {
    setSelected(next);
    window.requestAnimationFrame(() => optionRefs.current[next]?.focus());
  };

  const advance = () => {
    if (selected === null) return;
    if (!submitted) {
      const nextAnswers = [...answers];
      nextAnswers[index] = selected;
      setAnswers(nextAnswers);
      setSubmitted(true);
      return;
    }
    if (index === QUIZ.length - 1) {
      const finalScore = answers.reduce<number>((total, answer, answerIndex) => total + (answer === QUIZ[answerIndex].correct ? 1 : 0), 0);
      setFinished(true);
      setAttemptCount((count) => count + 1);
      setLastScore(finalScore);
      setBestScore((prior) => prior === null ? finalScore : Math.max(prior, finalScore));
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected(answers[nextIndex]);
    setSubmitted(answers[nextIndex] !== null);
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <main className="achcm04-quiz-page">
        <div role="tabpanel" id="achcm04-panel-quiz" aria-labelledby="achcm04-tab-quiz" style={{ display: 'contents' }}>
        <div className="achcm04-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orangeAction} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="achcm04-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><div><div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orangeAction }}>{percent}%</div><div style={{ fontSize: 11, fontWeight: 750, color: CI.muted }}>{score}/{QUIZ.length}</div></div></div>
          </div>
          <h1 style={{ fontSize: 22, color: CI.teal, margin: '0 0 6px' }}>{passed ? 'Passing score achieved' : 'Review and retake'}</h1>
          <p style={{ fontSize: 15, color: CI.muted, lineHeight: 1.6, margin: '0 auto 18px', maxWidth: 560 }}>Knowledge Check Complete. This records knowledge practice only and does not authorize access, expand role scope, validate field competency, or create an independent personnel-file record.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 22 }}>
            {[{ label: 'Protect', tip: 'Secure information and the environment' }, { label: 'Verify', tip: 'Confirm identity, authority, and channel' }, { label: 'Report', tip: 'Escalate facts; do not self-adjudicate' }].map((item) => <div key={item.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}><div style={{ fontSize: 12, fontWeight: 800, color: CI.teal }}>{item.label}</div><div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{item.tip}</div></div>)}
          </div>
          <p style={{ fontSize: 12, color: CI.muted }}>Attempt {attemptCount} · Best score {bestScore ?? score}/10</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Back to Lessons</button>
            <button type="button" onClick={() => { setIndex(0); setSelected(null); setSubmitted(false); setAnswers(Array(QUIZ.length).fill(null)); setFinished(false); }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orangeAction, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="achcm04-quiz-page">
      <div role="tabpanel" id="achcm04-panel-quiz" aria-labelledby="achcm04-tab-quiz" style={{ display: 'contents' }}>
      <div className="achcm04-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg,${CI.teal},${CI.tealDark})`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LockKeyhole size={18} aria-hidden="true" /><span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span></div><span style={{ fontSize: 12, fontWeight: 750 }}>{index + 1} / {QUIZ.length}</span></div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}><div className="achcm04-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: '#FDBA8C', transition: 'width .35s ease' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 750, letterSpacing: '.06em', textTransform: 'uppercase' }}><span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span></div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, marginBottom: 12 }}><Sparkles size={13} aria-hidden="true" /> {question.category}</div>
          <h1 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{question.stem}</h1>
          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} onKeyDown={(event) => {
            if (submitted) return;
            const maximum = question.options.length - 1;
            const current = selected ?? 0;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); focusOption(current >= maximum ? 0 : current + 1); }
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); focusOption(current <= 0 ? maximum : current - 1); }
            else if (event.key === 'Home') { event.preventDefault(); focusOption(0); }
            else if (event.key === 'End') { event.preventDefault(); focusOption(maximum); }
            else if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); if (selected === null) focusOption(current); }
          }}>
            {question.options.map((option, optionIndex) => {
              const chosen = selected === optionIndex;
              let border: string = CI.border;
              let background: string = '#fff';
              let letterBackground: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && optionIndex === question.correct) { border = CI.teal; background = CI.tealSoft; letterBackground = CI.teal; letterColor = '#fff'; }
              else if (submitted && chosen && !isCorrect) { border = CI.red; background = CI.redSoft; letterBackground = CI.red; letterColor = '#fff'; }
              else if (chosen) { border = CI.teal; background = '#F3FBFA'; letterBackground = CI.teal; letterColor = '#fff'; }
              return <button key={option} ref={(node) => { optionRefs.current[optionIndex] = node; }} type="button" role="radio" aria-checked={chosen} tabIndex={chosen || (selected === null && optionIndex === 0) ? 0 : -1} disabled={submitted} onClick={() => setSelected(optionIndex)} style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 48 }}><span style={{ width: 28, height: 28, borderRadius: 8, background: letterBackground, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[optionIndex]}</span><span style={{ fontWeight: 650, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{option}</span>{submitted && optionIndex === question.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Correct answer" />}{submitted && chosen && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} aria-label="Selected answer is incorrect" />}</button>;
            })}
          </div>
          {submitted && <div aria-live="polite" style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : CI.orangeSoft, border: `1px solid ${isCorrect ? CI.tealMuted : '#FDBA8C'}` }}><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeAction, marginBottom: 6 }}>{isCorrect ? 'Correct judgment' : 'Recalibrate'}</div><div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{question.rationale}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>{question.sources.map((source) => <span key={source} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: '#fff', color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{source}</span>)}</div></div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}><button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 750, cursor: 'pointer' }}>Exit</button><button type="button" onClick={advance} disabled={selected === null} style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? .5 : 1 }}>{submitted ? (index === QUIZ.length - 1 ? 'See privacy results' : 'Next scenario') : 'Lock in answer'}</button></div>
        </div>
      </div>
      </div>
    </main>
  );
}

const STORAGE_KEY = 'achc-art-m04-progress-v1';

interface Persisted {
  schemaVersion: 1;
  moduleId: typeof MODULE_META.id;
  lessonIndex: number;
  mode: 'lessons' | 'quiz';
  completedByLesson: Record<number, string[]>;
  quizAnswers: (number | null)[];
  quizIndex: number;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizFinished: boolean;
  attemptCount: number;
  lastScore: number | null;
  bestScore: number | null;
}

const EMPTY_PROGRESS: Persisted = {
  schemaVersion: 1,
  moduleId: MODULE_META.id,
  lessonIndex: 0,
  mode: 'lessons',
  completedByLesson: {},
  quizAnswers: Array(10).fill(null),
  quizIndex: 0,
  quizSelected: null,
  quizSubmitted: false,
  quizFinished: false,
  attemptCount: 0,
  lastScore: null,
  bestScore: null,
};

function sanitizeProgress(value: unknown): Persisted {
  if (!value || typeof value !== 'object') return { ...EMPTY_PROGRESS };
  const candidate = value as Partial<Persisted>;
  if (candidate.schemaVersion !== 1 || candidate.moduleId !== MODULE_META.id) return { ...EMPTY_PROGRESS };
  const lessonIndex = Number.isInteger(candidate.lessonIndex) ? Math.max(0, Math.min(PAGES.length - 1, candidate.lessonIndex as number)) : 0;
  const quizIndex = Number.isInteger(candidate.quizIndex) ? Math.max(0, Math.min(QUIZ.length - 1, candidate.quizIndex as number)) : 0;
  const answers = Array.from({ length: QUIZ.length }, (_, index) => {
    const answer = candidate.quizAnswers?.[index];
    return Number.isInteger(answer) && (answer as number) >= 0 && (answer as number) <= 3 ? answer as number : null;
  });
  const completedByLesson: Record<number, string[]> = {};
  for (const page of PAGES) {
    const valid = new Set(page.hotspots.map((hotspot) => hotspot.id));
    const supplied = candidate.completedByLesson?.[page.id];
    completedByLesson[page.id] = Array.isArray(supplied) ? Array.from(new Set(supplied.filter((id): id is string => typeof id === 'string' && valid.has(id)))) : [];
  }
  const selected = candidate.quizSelected;
  return {
    schemaVersion: 1,
    moduleId: MODULE_META.id,
    lessonIndex,
    mode: candidate.mode === 'quiz' ? 'quiz' : 'lessons',
    completedByLesson,
    quizAnswers: answers,
    quizIndex,
    quizSelected: Number.isInteger(selected) && (selected as number) >= 0 && (selected as number) <= 3 ? selected as number : null,
    quizSubmitted: Boolean(candidate.quizSubmitted),
    quizFinished: Boolean(candidate.quizFinished),
    attemptCount: Number.isInteger(candidate.attemptCount) && (candidate.attemptCount as number) >= 0 ? candidate.attemptCount as number : 0,
    lastScore: Number.isInteger(candidate.lastScore) && (candidate.lastScore as number) >= 0 && (candidate.lastScore as number) <= 10 ? candidate.lastScore as number : null,
    bestScore: Number.isInteger(candidate.bestScore) && (candidate.bestScore as number) >= 0 && (candidate.bestScore as number) <= 10 ? candidate.bestScore as number : null,
  };
}

function loadProgress(): Persisted {
  if (typeof window === 'undefined') return { ...EMPTY_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function saveProgress(progress: Persisted) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable in private mode or under quota pressure.
  }
}

export default function ACHCARTM04() {
  const initial = useMemo(loadProgress, []);
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial.mode);
  const [lessonIndex, setLessonIndex] = useState(initial.lessonIndex);
  const [completedByLesson, setCompletedByLesson] = useState<Record<number, string[]>>(initial.completedByLesson);
  const [quizState, setQuizState] = useState<QuizPersistState>({
    answers: initial.quizAnswers,
    index: initial.quizIndex,
    finished: initial.quizFinished,
    selected: initial.quizSelected,
    submitted: initial.quizSubmitted,
    attemptCount: initial.attemptCount,
    lastScore: initial.lastScore,
    bestScore: initial.bestScore,
  });
  const [saveMessage, setSaveMessage] = useState('');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const page = PAGES[lessonIndex];
  const completed = completedByLesson[page.id] ?? [];

  const currentProgress = useCallback((): Persisted => ({
    schemaVersion: 1,
    moduleId: MODULE_META.id,
    lessonIndex,
    mode,
    completedByLesson,
    quizAnswers: quizState.answers,
    quizIndex: quizState.index,
    quizSelected: quizState.selected,
    quizSubmitted: quizState.submitted,
    quizFinished: quizState.finished,
    attemptCount: quizState.attemptCount,
    lastScore: quizState.lastScore,
    bestScore: quizState.bestScore,
  }), [lessonIndex, mode, completedByLesson, quizState]);

  useEffect(() => {
    saveProgress(currentProgress());
  }, [currentProgress]);

  const chooseTab = (nextIndex: number) => {
    if (nextIndex === PAGES.length) setMode('quiz');
    else { setMode('lessons'); setLessonIndex(nextIndex); }
    window.requestAnimationFrame(() => { tabRefs.current[nextIndex]?.focus(); tabRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
  };

  const onTabKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    const last = PAGES.length;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = currentIndex >= last ? 0 : currentIndex + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = currentIndex <= 0 ? last : currentIndex - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next !== null) { event.preventDefault(); chooseTab(next); }
  };

  const handleSaveExit = () => {
    saveProgress(currentProgress());
    setSaveMessage('Progress saved.');
    if (window.history.length > 1) window.history.back();
  };

  return (
    <div className="achcm04 achcm04-shell">
      <style>{STYLES}</style>
      <header className="achcm04-top">
        <div className="achcm04-brand" aria-label={`${MODULE_META.id}, ${MODULE_META.title}`}><BrandMark /><span className="brand-text">HIPAA Field Privacy</span></div>
        <div className="achcm04-tabs" role="tablist" aria-label="Module lessons">
          {PAGES.map((tab, index) => <button key={tab.id} ref={(node) => { tabRefs.current[index] = node; }} id={`achcm04-tab-${index}`} type="button" role="tab" aria-selected={mode === 'lessons' && index === lessonIndex} aria-controls={`achcm04-panel-${index}`} tabIndex={mode === 'lessons' && index === lessonIndex ? 0 : -1} className={`achcm04-tab ${mode === 'lessons' && index === lessonIndex ? 'active' : ''}`} onKeyDown={(event) => onTabKeyDown(event, index)} onClick={() => { setMode('lessons'); setLessonIndex(index); }}>{tab.shortName}</button>)}
          <button ref={(node) => { tabRefs.current[PAGES.length] = node; }} id="achcm04-tab-quiz" type="button" role="tab" aria-selected={mode === 'quiz'} aria-controls="achcm04-panel-quiz" tabIndex={mode === 'quiz' ? 0 : -1} className={`achcm04-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`} onKeyDown={(event) => onTabKeyDown(event, PAGES.length)} onClick={() => setMode('quiz')}>Knowledge Check</button>
        </div>
        <button type="button" className="achcm04-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
        <span className="achcm04-live" aria-live="polite">{saveMessage}</span>
      </header>

      {mode === 'quiz' ? <QuizPage onBack={() => setMode('lessons')} initial={quizState} onPersist={setQuizState} /> : (
        <main className="achcm04-work">
          <div role="tabpanel" id={`achcm04-panel-${lessonIndex}`} aria-labelledby={`achcm04-tab-${lessonIndex}`} style={{ display: 'contents' }}>
            <aside className="achcm04-left"><LeftPanel page={page} pageIndex={lessonIndex} total={PAGES.length} /></aside>
            <section className="achcm04-right"><RightPanel page={page} completed={completed} setCompleted={(ids) => setCompletedByLesson((prior) => ({ ...prior, [page.id]: ids }))} onGoQuiz={() => setMode('quiz')} /></section>
          </div>
        </main>
      )}

      <footer className="achcm04-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && lessonIndex === 0} aria-label={mode === 'quiz' ? 'Back to lessons' : 'Previous lesson'} onClick={() => { if (mode === 'quiz') setMode('lessons'); else setLessonIndex((index) => Math.max(0, index - 1)); }}><ChevronLeft size={16} aria-hidden="true" /><span className="nav-copy">Prev</span></button>
        <span className="achcm04-lesson-badge">{mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${lessonIndex + 1} of ${PAGES.length} · ${page.shortName}`}</span>
        {mode === 'quiz' ? <button type="button" className="next" aria-label="Back to lessons" onClick={() => setMode('lessons')}><span className="next-copy">Back to Lessons</span><ChevronRight size={16} aria-hidden="true" /></button> : lessonIndex === PAGES.length - 1 ? <button type="button" className="next" aria-label="Open Knowledge Check" onClick={() => setMode('quiz')}><span className="next-copy">Knowledge Check</span><ChevronRight size={16} aria-hidden="true" /></button> : <button type="button" className="next" aria-label={`Next lesson, ${PAGES[lessonIndex + 1].shortName}`} onClick={() => setLessonIndex((index) => Math.min(PAGES.length - 1, index + 1))}><span className="next-copy">Next · {PAGES[lessonIndex + 1].shortName}</span><ChevronRight size={16} aria-hidden="true" /></button>}
      </footer>
    </div>
  );
}
