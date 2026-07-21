/**
 * ACHC-ART-M06 — Communication Barriers, Health Literacy & Accessible Communication
 * PASS 5 learner module · version 1.0.0
 * Seven scenes + Knowledge Check | 34 hotspots | 10 questions | 80% pass
 * Training does not expand professional scope or validate hands-on competency.
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-barriers.png';
import img02 from './assets/lesson-02-language-access.png';
import img03 from './assets/lesson-03-accessible-communication.png';
import img04 from './assets/lesson-04-health-literacy.png';
import img05 from './assets/lesson-05-emotional-cognitive.png';
import img06 from './assets/lesson-06-closed-loop.png';
import img07 from './assets/lesson-07-integrated-scenario.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeDark: '#A83D12', actionOrange: '#B94716', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'observe' | 'access' | 'adapt' | 'escalate';
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
  narration: string[]; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string;
  sceneAlt: string; sceneNote: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  observe: { label: 'Observe', color: CI.teal, soft: CI.tealSoft },
  access: { label: 'Access', color: '#356A8A', soft: '#EEF6FA' },
  adapt: { label: 'Adapt', color: CI.orangeDark, soft: '#FFF3EC' },
  escalate: { label: 'Escalate', color: '#B42318', soft: '#FEF2F2' },
};

const MODULE_META = {
  id: 'ACHC-ART-M06',
  title: 'Communication Barriers, Health Literacy & Accessible Communication',
  pages: 7,
  quizCount: 10,
  passing: 80,
} as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Barriers',
    title: 'See the Whole Communication Loop',
    subtitle: 'Observe the person, message, channel, and environment before assuming “noncompliance.”',
    narration: [
      'Communication in home health is a safety loop, not a one-way speech. A sender forms a message; language and format shape it; a channel and the home environment carry it; the patient receives and interprets it; feedback shows whether shared meaning was reached. A nod, silence, polite smile, or “yes” may acknowledge the speaker without proving that the message was heard, seen, understood, remembered, or usable. Effective field communication therefore ends with respectful verification, not with the last word spoken.',
      'Start with what you can observe. Physical barriers include pain, fatigue, breathlessness, distance, positioning, or difficulty holding materials. Language barriers arise when the message is not in the person’s preferred language or dialect. Sensory barriers may involve hearing, vision, speech, or combined needs. Cognitive barriers may affect memory, attention, or processing. Emotional barriers may include anxiety, grief, fear, or anger. Perceptual barriers arise when people interpret the same words differently. Environmental barriers include television noise, poor lighting, glare, interruptions, weak connectivity, and lack of privacy.',
      'Health-literacy barriers are often created by the information or the system rather than by the patient. Dense forms, unexplained abbreviations, confusing numbers, unfamiliar equipment, too many steps, or an unclear next action can make a capable person struggle. Use a universal-precautions approach: make communication easier for everyone instead of trying to identify who has “low literacy.” Education level, accent, age, disability, clothing, eye contact, or a caregiver’s presence cannot tell you whether a person understands health information.',
      'Multiple barriers often overlap. A patient may prefer Spanish, use hearing aids, feel exhausted after hospitalization, and receive a dense English medication sheet while a television is playing. Solving only one problem does not make the encounter accessible. A qualified interpreter addresses language access, but the worker may still need to reduce noise, improve lighting, slow the pace, use an accessible format, and confirm understanding. Reassess throughout the visit because pain, fatigue, emotion, technology, and attention can change.',
      'Use a respectful barrier scan before important communication. Ask, “What language do you prefer for health information?” and “What helps you communicate best?” Ask permission before moving a chair, turning off a television, closing a door, or adjusting lighting. Position yourself so faces and materials are visible without crowding the patient. Keep essential communication private. Do not touch hearing aids, glasses, communication devices, or mobility equipment without permission.',
      'When a barrier prevents safe communication, pause the affected non-emergent task. Protect the patient within the current plan, order, and your role; obtain approved assistance; notify the responsible clinician or supervisor; and document objectively. In an emergency, do not withhold immediate protective action while communication access is being arranged. Use emergency procedures, bring in qualified help as quickly as possible, and confirm or supplement critical information when effective access is available.',
      'Consider a mini-case: Mr. Reed looks worried while the television is loud, sunlight shadows the worker’s face, and an English medication sheet is covered in abbreviations. The safe first response is not to label him confused or noncompliant. Ask permission to reduce noise, reposition for a clear line of sight, confirm his preferred language and communication method, replace jargon with an authorized plain-language explanation, and use teach-back or show-me for the task. If understanding remains unsafe, stop and escalate.',
      'Documentation should describe the observed barrier and its effect, the patient’s stated preference, the accommodation attempted, the patient’s response, any unresolved risk, and who was notified. Write “television noise and poor face lighting interfered with conversation; patient requested a quieter room and visible face” rather than “patient hard to communicate with.” Specific facts allow the next worker to reproduce what helped and avoid repeating a failed approach.'
    ],
    keyPoints: [
      { icon: '⏸️', title: 'Pause and scan', detail: 'Observe the person, message, task, channel, and surroundings.' },
      { icon: '💬', title: 'Ask, do not assume', detail: 'Confirm preferred language, method, format, pace, and support.' },
      { icon: '🏠', title: 'Remove what you can', detail: 'Reduce noise, glare, interruption, distance, and clutter with permission.' },
      { icon: '✅', title: 'Verify shared meaning', detail: 'Use feedback, teach-back, or show-me suited to the task.' }
    ],
    clinicalTip: 'Fix the room before blaming the person. Environmental changes help, but they never replace required language assistance or disability access.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CL-SD-017 §§4.1, 4.5–4.6' },
      { kind: 'Federal', text: '42 CFR §484.50(a), (f)' },
      { kind: 'Practice', text: 'AHRQ Health Literacy Universal Precautions' }
    ],
    sceneImage: img01,
    sceneAlt: 'A home-health clinician and older patient converse in a living room with a television, bright window, dense paperwork, hearing-aid case, and tablet that may affect communication.',
    sceneNote: 'Barrier scan: person · message · channel · environment · feedback',
    hotspots: [
      {
        id: 'tv-noise', label: 'Background television', shortLabel: 'Noise', x: 8, y: 23, zone: 'observe',
        info: 'The television competes with speech and divides attention during an important conversation.',
        meaning: 'Background noise can reduce access for anyone and may be especially disruptive for a person using hearing technology, processing slowly, or feeling fatigued.',
        action: 'Ask permission to lower or turn off the television. Move to a quieter area when that is safe and acceptable.',
        notify: 'Notify the responsible clinician or supervisor if effective communication still cannot be achieved for required care.',
        document: 'Record the observed interference, the patient’s preference, the change made, response, and any unresolved need.',
        policyRefs: ['CL-SD-017 §4.1', '42 CFR §484.50(f)'],
      },
      {
        id: 'window-light', label: 'Window light and face visibility', shortLabel: 'Lighting', x: 66, y: 12, zone: 'adapt',
        info: 'Strong light behind a speaker can shadow the face or create glare on printed and electronic materials.',
        meaning: 'Clear face visibility may support speechreading, expression, and attention; glare may reduce access for low-vision patients.',
        action: 'Reposition people or materials with permission so faces are evenly lit and glare is reduced.',
        notify: 'Request additional accessible support if lighting changes alone are not effective.',
        document: 'Document a lighting accommodation only when it affected care, teaching, or follow-up.',
        policyRefs: ['42 CFR §484.50(f)', '45 CFR §92.202'],
      },
      {
        id: 'dense-paper', label: 'Dense medication paperwork', shortLabel: 'Dense Form', x: 34, y: 84, zone: 'adapt',
        info: 'The sheet is crowded with small fields and unfamiliar terms.',
        meaning: 'Complex information can create a system-level health-literacy barrier even when the patient reads well.',
        action: 'Lead with the authorized action, use familiar words, offer the appropriate language and accessible format, and chunk the explanation.',
        notify: 'Tell the clinician or supervisor when suitable materials are unavailable or content is outside your role to teach.',
        document: 'Record the material and method used, actual patient response, re-teaching, and follow-up need.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', 'AHRQ Universal Precautions'],
      },
      {
        id: 'hearing-case', label: 'Hearing-aid case', shortLabel: 'Ask Preference', x: 88, y: 76, zone: 'access',
        info: 'A hearing-aid case is visible beside the patient.',
        meaning: 'A device is a cue to ask what helps; it does not prove that the device works, that it is being used, or that it meets the current communication need.',
        action: 'Ask the patient’s preferred method and whether noise reduction, face visibility, captioning, an assistive device, or another aid is effective.',
        notify: 'Escalate through the agency when an auxiliary aid or service is needed.',
        document: 'Record the stated preference and effective accommodation, not assumptions about hearing ability.',
        policyRefs: ['45 CFR §92.202', '42 CFR §484.50(f)'],
      },
      {
        id: 'tablet-channel', label: 'Communication tablet', shortLabel: 'Channel', x: 72, y: 86, zone: 'observe',
        info: 'The tablet may support interpretation, accessible material, video, or secure team communication.',
        meaning: 'Technology is useful only when the patient can see, hear, operate, and understand it and when privacy and connection quality are adequate.',
        action: 'Check positioning, audio, visual quality, privacy, and patient response. Change modality when the tool is ineffective.',
        notify: 'Report access or connectivity failure and obtain an approved alternative before critical non-emergent communication continues.',
        document: 'Record modality, effectiveness, failure, alternative used, and escalation.',
        policyRefs: ['45 CFR §§92.201(f)–(g), 92.202', 'OP-SL-005'],
      },
    ],
  },
  {
    id: 1,
    shortName: 'Language Access',
    title: 'Use Qualified Language Access',
    subtitle: 'Plan approved assistance before critical communication begins.',
    narration: [
      'Limited English proficiency, or LEP, describes a person whose primary language for communication is not English and whose ability to read, write, speak, or understand English is limited for the interaction. Do not infer language from a name, accent, appearance, neighborhood, or family member. Confirm and document the person’s preferred spoken or signed language and, when relevant, dialect. A patient may converse socially in English yet need qualified language assistance for medication teaching, consent, rights, discharge information, or a change in condition.',
      'An interpreter handles live spoken or signed communication. A translator produces written content. A bilingual employee is not automatically a qualified interpreter or qualified bilingual staff member. Qualification includes demonstrated proficiency, accuracy, impartiality, appropriate role knowledge, and the ability to use specialized terms when needed. Use the agency-approved service and workflow. Never ask a patient to bring, locate, or pay for an interpreter as the price of receiving care.',
      'When the need is known, arrange access before the visit. Test the approved in-person, telephone, or video connection and have the encounter details ready without displaying unnecessary PHI. Introduce the interpreter and explain the role. Speak directly to the patient in first person: “How are you feeling?” rather than “Ask her how she feels.” Use short, complete segments, pause for interpretation, avoid side conversations, allow questions, and watch whether the communication appears effective.',
      'A family member or friend may remain as the patient’s chosen support person, but trust and bilingual ability do not make that person the routine interpreter. Current 45 CFR §92.201 permits reliance on an accompanying adult only under narrow safeguards, including a specific private request, the adult’s agreement, documentation, appropriateness, and qualified-interpreter involvement described by the rule. A minor child may be used only temporarily during an imminent-threat emergency while a qualified interpreter is being obtained, followed by qualified confirmation or supplementation.',
      'Care Indeed policy OP-PA-003 contains broader wording about requested family, friend, or minor interpretation. This module teaches the narrower current federal safeguard and directs field workers to the approved agency escalation path; do not independently decide that the broader wording authorizes an exception. The policy owner must reconcile the documents. In the field, the safe default is the qualified service. Document the offer, the patient’s request or refusal, the approved decision, and the method actually used.',
      'Consumer translation apps and general-purpose AI are not substitutes for qualified interpretation or translation of consent, patient rights, medication instructions, discharge teaching, or other critical content. Under §92.201, machine-translated critical or accuracy-dependent text requires qualified human review when the rule applies. A personal device also raises privacy and security risks. Use only approved agency tools and workflows, and never paste PHI into an unapproved application.',
      'If video interpretation freezes or audio becomes unclear during non-emergent critical communication, pause that portion of the visit. Check the connection once, then contact the agency for an effective approved alternative such as telephone or another qualified modality. Do not continue in English, ask for nods, recruit whoever is nearby, or obtain a signature through guesswork. Continue only care that can be performed safely within the current plan and role while access is restored.',
      'Emergency care requires a different timing judgment. Protect life and safety immediately, call emergency services when indicated, use the best temporary communication available while a qualified interpreter is being obtained, and have qualified personnel confirm or supplement critical information as soon as available. The emergency exception is narrow; it does not turn an avoidable scheduling problem into permission for routine ad hoc interpretation.',
      'Document the preferred language, interpreter name or identifier as agency policy permits, modality, date and time, major content communicated, patient response, any refusal or access failure, escalation, alternative, and follow-up. Privacy permission and interpreter qualification are separate questions. Agency-arranged interpreters may receive information needed for treatment without a separate HIPAA authorization under applicable arrangements, but that does not make every bilingual person qualified.'
    ],
    keyPoints: [
      { icon: '🌐', title: 'Confirm preference', detail: 'Ask and use the documented language and dialect; never infer.' },
      { icon: '🎧', title: 'Arrange approved access', detail: 'Use a qualified in-person, phone, or video service at no patient charge.' },
      { icon: '🗣️', title: 'Speak to the patient', detail: 'Use first person, short segments, pauses, and direct eye line.' },
      { icon: '📝', title: 'Record the encounter', detail: 'Capture service, identifier, modality, response, failure, and follow-up.' }
    ],
    clinicalTip: 'A relative may be a valued support person. That does not make the relative the interpreter.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'OP-PA-003 §§2–3' },
      { kind: 'Federal', text: '45 CFR §92.201' },
      { kind: 'Federal', text: '42 CFR §484.50(a), (f)' },
      { kind: 'Guidance', text: 'HHS OCR language access' }
    ],
    sceneImage: img02,
    sceneAlt: 'A clinician speaks directly with an older Spanish-speaking patient while an adult daughter supports the visit and a qualified remote interpreter is connected on a tablet.',
    sceneNote: 'Confirm → connect → speak directly → verify → document',
    hotspots: [
      {
        id: 'patient-language', label: 'Patient’s preferred language', shortLabel: 'Preference', x: 14, y: 40, zone: 'observe',
        info: 'The patient is the source for his preferred language and communication needs.',
        meaning: 'Language must be asked and documented; ethnicity, accent, or a caregiver’s language is not a substitute.',
        action: 'Confirm preferred language and dialect directly, then compare with the current record.',
        notify: 'Report any discrepancy so the care team and future visits can be updated.',
        document: 'Preferred language, how it was confirmed, and any update requested.',
        policyRefs: ['OP-PA-003 §2.2', '45 CFR §92.201'],
      },
      {
        id: 'support-person', label: 'Adult family support person', shortLabel: 'Support ≠ Interpreter', x: 46, y: 39, zone: 'access',
        info: 'The adult daughter is present as support and is listening while the clinician addresses the patient.',
        meaning: 'A support person does not automatically become a qualified interpreter or legal representative.',
        action: 'Ask the patient how the support person should participate, preserve privacy, and use the qualified service for interpretation.',
        notify: 'Escalate any request to use an accompanying adult through the approved workflow; do not decide the exception alone.',
        document: 'Patient preference for support-person participation and the qualified interpretation method used.',
        policyRefs: ['45 CFR §92.201(e)', 'OP-PA-003 §2.4'],
      },
      {
        id: 'interpreter-screen', label: 'Qualified remote interpreter', shortLabel: 'Qualified Access', x: 45, y: 70, zone: 'access',
        info: 'An approved remote interpreter is connected on the tablet.',
        meaning: 'The service must be qualified and technically effective; mere connection is not enough.',
        action: 'Introduce everyone, verify audio and image quality, speak directly to the patient, and pause for complete interpretation.',
        notify: 'Contact the agency when the modality is unavailable or ineffective and obtain an approved alternative.',
        document: 'Service or identifier, modality, time, effectiveness, and relevant communication outcome.',
        policyRefs: ['45 CFR §92.201(b), (f)–(g)', 'OP-PA-003 §2.3'],
      },
      {
        id: 'headset', label: 'Audio interpretation headset', shortLabel: 'Backup Channel', x: 12, y: 86, zone: 'adapt',
        info: 'The headset represents an approved audio option when video is unnecessary or fails.',
        meaning: 'A different qualified modality may restore meaningful access when the first one is unreliable.',
        action: 'Follow the agency workflow to switch to approved audio interpretation and confirm all parties can hear.',
        notify: 'Report repeated technology failure or delay that affects care.',
        document: 'Initial failure, alternative modality, time restored, and any information that required confirmation.',
        policyRefs: ['45 CFR §92.201(g)', 'OP-WF-11'],
      },
      {
        id: 'critical-folder', label: 'Critical form and teaching folder', shortLabel: 'Critical Content', x: 74, y: 79, zone: 'escalate',
        info: 'The folder may contain rights, consent, or accuracy-dependent clinical information.',
        meaning: 'Critical information must not be delivered or signed through guesswork, an unqualified person, or an unreviewed consumer translation.',
        action: 'Pause non-emergent critical communication until a qualified interpreter and appropriate-language material are available.',
        notify: 'Notify the responsible clinician or supervisor and identify who will provide the approved material or service.',
        document: 'Content paused, reason, access arranged, patient response, and follow-up owner.',
        policyRefs: ['45 CFR §92.201', '42 CFR §484.50'],
      },
    ],
  },
  {
    id: 2,
    shortName: 'Accessibility',
    title: 'Match the Aid to the Person and Task',
    subtitle: 'Effective communication is individualized; no single aid works for every person or conversation.',
    narration: [
      'Disability access is distinct from language access, although a person may need both. Ask the patient or companion what communication method is normally effective and what is needed for this task. Consider the nature, length, complexity, and context. Writing a brief arrival time may be effective for one person, while a complex medication discussion may require a qualified sign-language interpreter, captioning, assistive listening, an accessible electronic document, a qualified reader, or another auxiliary aid or service.',
      'Communicate directly with the patient, even when an interpreter, reader, family member, or device is present. Do not shift the conversation to a hearing or sighted companion. A companion with a disability may also need effective communication when the companion is an appropriate person involved in the patient’s care. Ask before assuming that one accommodation covers everyone present.',
      'For a Deaf or hard-of-hearing person, get attention respectfully, keep your face visible, provide even lighting, and reduce background noise. Speak clearly at a natural pace without shouting or exaggerating mouth movements. Ask whether the person prefers ASL or another sign language, captions, an assistive listening system, writing, speechreading support, or another method. Not all Deaf people use ASL, speechread, or use written English in the same way.',
      'Video remote interpreting must be usable in the actual home. The image must be clear and large enough, the interpreter and patient must see relevant facial expression and signing, audio must be intelligible, the camera must be positioned correctly, and the connection must be stable. If glare, freezing, poor framing, or weak connectivity makes VRI ineffective, change to an effective approved modality rather than documenting that a tablet was merely offered.',
      'For a blind or low-vision person, ask which format is preferred: accessible electronic text, large print, audio, Braille, or a qualified reader. Identify yourself and describe relevant actions. Ask before moving glasses, magnifiers, phones, mobility aids, documents, or personal items. High contrast and larger text may help some people but are not universal solutions. Give information directly to the patient rather than only to a sighted companion.',
      'For a person with a speech disability, allow time and do not pretend to understand. Ask the person how to clarify a missed message and whether it is acceptable to ask yes-or-no questions, repeat your understanding, or offer choices. Do not finish sentences without permission. Keep an augmentative and alternative communication device, communication board, writing tool, or speech-generating device within reach and charged when possible.',
      'A yes-or-no response can be useful when the patient chooses it and it is reliable for that person; the legacy rule “never use yes/no” is too absolute. The goal is an effective method, not a preferred technique of the worker. For a high-stakes decision, confirm that the method is adequate for the complexity and context, obtain the appropriate qualified service, and preserve the patient’s own voice.',
      'In the scene, a hearing aid, interpreter tablet, magnifier, high-contrast schedule, and pill organizer are visible. None is automatically the answer. Ask what works, match the aid to the task, test whether communication is effective, and change what fails. Document the patient’s stated preference, aid or service provided, how effectiveness was checked, and any unresolved access need or escalation.',
      'Field workers do not independently decide that providing an aid would be an undue burden or fundamentally alter services. Route concerns through the agency’s designated process while continuing safe, accessible care within role. Never charge the patient for required auxiliary aids or language assistance, and never make a patient’s family responsible for supplying access.'
    ],
    keyPoints: [
      { icon: '🙋', title: 'Ask the preference', detail: 'The person is the best starting source for what works.' },
      { icon: '👤', title: 'Communicate directly', detail: 'Address the patient, not the companion, device, or interpreter.' },
      { icon: '🧩', title: 'Match aid to task', detail: 'Consider complexity, duration, context, and normal communication method.' },
      { icon: '🔄', title: 'Change what fails', detail: 'An available aid is not enough when it is ineffective.' }
    ],
    clinicalTip: '“We provided a tablet” is not the same as effective communication. Check whether the patient can actually use the communication provided.',
    sourceLabels: [
      { kind: 'Federal', text: '45 CFR §92.202' },
      { kind: 'Federal', text: '42 CFR §484.50(f)' },
      { kind: 'Guidance', text: 'DOJ ADA Effective Communication' },
      { kind: 'Care Indeed', text: 'CL-PR-001' }
    ],
    sceneImage: img03,
    sceneAlt: 'An older patient wearing a hearing aid speaks with a clinician while a qualified sign-language interpreter appears on a well-positioned tablet and accessible visual materials rest nearby.',
    sceneNote: 'Preference + task complexity determine the effective aid',
    hotspots: [
      {
        id: 'face-line', label: 'Visible face and direct communication', shortLabel: 'Directly to Patient', x: 52, y: 36, zone: 'adapt',
        info: 'The clinician’s face is visible and she is speaking to the patient rather than to the interpreter.',
        meaning: 'Direct communication preserves dignity and allows the patient to combine facial cues with the chosen aid.',
        action: 'Maintain a clear line of sight, natural speech, and direct first-person communication.',
        notify: 'Obtain additional assistance if the current method remains ineffective.',
        document: 'Record the preferred method and outcome rather than generic statements about hearing.',
        policyRefs: ['45 CFR §92.202', 'DOJ Effective Communication'],
      },
      {
        id: 'hearing-device', label: 'Patient hearing aid', shortLabel: 'Ask If Effective', x: 21, y: 26, zone: 'observe',
        info: 'The patient wears a hearing aid during the conversation.',
        meaning: 'A hearing aid may help but can be affected by noise, battery condition, fit, or the complexity of the message.',
        action: 'Ask whether it is helping and what additional method the patient prefers; never adjust personal equipment without permission.',
        notify: 'Route requests for auxiliary aids or service changes through the agency.',
        document: 'Patient-stated preference and effective accommodation.',
        policyRefs: ['42 CFR §484.50(f)', '45 CFR §92.202'],
      },
      {
        id: 'vri-asl', label: 'Sign-language interpreter tablet', shortLabel: 'VRI Quality', x: 86, y: 62, zone: 'access',
        info: 'The tablet is positioned so the patient can see the interpreter while remaining engaged with the clinician.',
        meaning: 'Qualified VRI must provide clear image, adequate framing, usable audio, and real-time communication.',
        action: 'Confirm the requested sign language, interpreter qualification, visibility, framing, audio, and connection.',
        notify: 'Switch modalities and report the failure if VRI is not effective.',
        document: 'Interpreter identifier, modality, effectiveness, failure, and alternative.',
        policyRefs: ['45 CFR §92.202', '45 CFR §92.201(f)'],
      },
      {
        id: 'magnifier', label: 'Magnifier and low-vision support', shortLabel: 'Vision Preference', x: 32, y: 83, zone: 'access',
        info: 'A magnifier is available near the patient’s materials.',
        meaning: 'Magnification helps some patients but does not replace asking for a preferred format.',
        action: 'Ask whether large print, accessible electronic text, audio, Braille, qualified reading, or another format is effective.',
        notify: 'Request the chosen accessible format through the responsible team member.',
        document: 'Requested format, interim support, effectiveness, and follow-up.',
        policyRefs: ['45 CFR §92.202', '42 CFR §484.50(f)'],
      },
      {
        id: 'visual-calendar', label: 'High-contrast visual schedule', shortLabel: 'Visual Aid', x: 63, y: 77, zone: 'adapt',
        info: 'The schedule uses shapes and contrast to support the spoken message.',
        meaning: 'Visuals should reinforce the same authorized content and must not rely on color alone.',
        action: 'Confirm the visual is accurate, accessible, and understood; pair it with the chosen language and method.',
        notify: 'Escalate if suitable materials are missing or require clinical revision.',
        document: 'Material used and the patient’s actual response.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', '42 CFR §484.50(f)'],
      },
      {
        id: 'pill-organizer', label: 'Hands-on demonstration item', shortLabel: 'Show-Me', x: 80, y: 87, zone: 'adapt',
        info: 'The pill organizer can support a return demonstration when the teaching is authorized.',
        meaning: 'Show-me checks whether a physical routine is usable; it does not replace an interpreter or informed consent.',
        action: 'Use the item only within role and the current plan, then ask the patient to demonstrate the assigned step.',
        notify: 'Report an incomplete demonstration or safety concern to the responsible clinician.',
        document: 'Task, method, exact response, re-teaching, and escalation.',
        policyRefs: ['CL-SD-017 §§4.3–4.6'],
      },
    ],
  },
  {
    id: 3,
    shortName: 'Health Literacy',
    title: 'Make the Message Usable',
    subtitle: 'Plain language and teach-back reveal whether the explanation worked.',
    narration: [
      'Personal health literacy is the degree to which people can find, understand, and use information and services to inform health decisions and actions. Organizational health literacy is how well an organization enables people to do that. The second definition matters in the field: a confusing form, rushed explanation, hard-to-use portal, or unclear number can create the barrier. Do not diagnose “low literacy” from schooling, appearance, age, language, or a single incomplete answer.',
      'Use health-literacy universal precautions. Make information easier for everyone because any person can struggle when ill, tired, anxious, medicated, grieving, or facing a new routine. Start with the action the patient needs to take. Use familiar, concrete words and active voice. Present one idea at a time. Define unavoidable clinical terms. State who does what, when, how much, and what to do if a problem occurs.',
      'Do not impose an unsupported universal reading-grade target as though it guarantees understanding. Readability formulas cannot judge clinical accuracy, cultural fit, language quality, visual accessibility, or whether the next action is clear. Follow approved material standards, then test usability with the individual. Keep print organized, use informative headings, adequate white space and contrast, and accessible electronic structure when requested.',
      'Numbers deserve special attention. “Twice daily” may be interpreted differently; state the ordered times or spacing when authorized. Show units clearly. Explain only the numbers needed for the task. Ask the patient to point to, state, or demonstrate the plan. Never invent a simplified dose, change the schedule, or create an unauthorized regimen. If the order or material is confusing, stop and contact the responsible clinician.',
      'Visual aids can clarify sequence, location, quantity, or warning signs. They must match the authorized plan, remain accurate, and not depend on color alone. Avoid childish imagery or dense infographics. A visual does not solve a language-access need unless the full communication is effective in the patient’s preferred language and method. Use the same message across spoken, written, visual, and demonstrated formats.',
      'Chunk and check: provide a small amount, check understanding, then continue. Teach-back asks the patient or caregiver to explain the essential information in their own words. Show-me asks the person to demonstrate a physical task. Frame both as a check of your explanation: “I want to be sure I explained this clearly. Please show me how you will do this at home.” Avoid “Do you understand?” because a yes response gives little evidence.',
      'If the response is incomplete, take responsibility for re-explaining. Use different words, a smaller chunk, a clear example, the approved visual, or a demonstration; then check again. Do not repeat the same words more loudly, demand verbatim recall, shame the patient, or write that the patient “failed.” An incomplete teach-back does not prove incapacity, noncompliance, or inability to learn. It identifies a communication problem that needs a safer response.',
      'Respect role boundaries. Clinicians teach within discipline, orders, and the plan of care. Aides and other workers reinforce assigned information and report questions or unsafe responses; they do not redesign medication schedules, diagnose cognition, or independently resolve clinical questions. Teach-back does not replace a qualified interpreter, informed consent, capacity evaluation, or hands-on competency validation.',
      'Document the specific topic, approved method, patient or caregiver’s actual words or demonstration, any missing step, re-teaching method, repeat response, materials provided, remaining need, and follow-up. “Patient verbalized understanding” is not enough. A defensible note might say the patient omitted the second step, received a shorter explanation with an approved picture sequence, then accurately demonstrated both steps on repeat show-me.'
    ],
    keyPoints: [
      { icon: '🎯', title: 'Lead with the action', detail: 'Make the essential next step easy to find.' },
      { icon: '🧾', title: 'Use common words', detail: 'Replace jargon and define unavoidable clinical terms.' },
      { icon: '🧱', title: 'Chunk and show', detail: 'Give small units supported by accurate visuals or demonstration.' },
      { icon: '🔁', title: 'Teach back and re-teach', detail: 'Check, adapt, and check again without shame.' }
    ],
    clinicalTip: '“Do you understand?” measures willingness to say yes. Teach-back shows what the explanation enabled the person to say or do.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CL-SD-017 §§4.1–4.6' },
      { kind: 'Federal', text: '42 CFR §484.60(d)(5), (e)' },
      { kind: 'Practice', text: 'AHRQ Teach-Back Tool 5' },
      { kind: 'Federal', text: '42 CFR §484.50(f)' }
    ],
    sceneImage: img04,
    sceneAlt: 'An older patient demonstrates a medication step to a clinician at a kitchen table using a pill organizer and simple picture schedule while a caregiver observes.',
    sceneNote: 'Plain language: action first · one idea · concrete words · verify',
    hotspots: [
      {
        id: 'patient-showme', label: 'Patient return demonstration', shortLabel: 'Show-Me', x: 53, y: 56, zone: 'observe',
        info: 'The patient uses her own hands and words to demonstrate the next step.',
        meaning: 'A return demonstration provides specific evidence about whether the explanation and task are usable.',
        action: 'Observe without interrupting, compare with the authorized plan, then reinforce or re-teach within role.',
        notify: 'Report an unsafe or persistently incomplete demonstration to the responsible clinician.',
        document: 'What the patient did or said, any missing step, re-teaching, and repeat result.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', 'AHRQ Teach-Back'],
      },
      {
        id: 'organizer', label: 'Medication organizer', shortLabel: 'Authorized Task', x: 46, y: 73, zone: 'adapt',
        info: 'The organizer makes sequence and quantity visible for the assigned routine.',
        meaning: 'A tool supports learning only when it reflects the current order and plan; it never authorizes a worker to change the regimen.',
        action: 'Verify the approved plan before teaching or reinforcing, then use the organizer for an authorized demonstration.',
        notify: 'Stop and contact the clinician if the organizer, labels, or patient report conflicts with the current plan.',
        document: 'Plan verified, method used, discrepancy if any, notification, and instructions.',
        policyRefs: ['CL-SD-017', '42 CFR §484.60'],
      },
      {
        id: 'picture-plan', label: 'Picture-based schedule', shortLabel: 'Usable Visual', x: 60, y: 80, zone: 'adapt',
        info: 'The visual breaks the routine into a short sequence using symbols and contrast.',
        meaning: 'A visual should support—not replace—the accurate message and should not depend only on color.',
        action: 'Check accuracy, explain the symbols in the preferred language and method, and ask the patient to use it during teach-back.',
        notify: 'Request a corrected or accessible version when the visual is inaccurate or unusable.',
        document: 'Material used, accessibility need, patient response, and replacement requested.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', '42 CFR §484.50(f)'],
      },
      {
        id: 'reading-glasses', label: 'Reading glasses and print access', shortLabel: 'Format', x: 27, y: 85, zone: 'access',
        info: 'Reading glasses are near the teaching materials.',
        meaning: 'The presence of glasses does not tell you which print or electronic format is effective.',
        action: 'Ask the patient’s preferred format and ensure the material is readable, well lit, and available in the appropriate language.',
        notify: 'Route accessible-format needs to the responsible team member.',
        document: 'Requested format, interim method, and follow-up.',
        policyRefs: ['42 CFR §484.50(f)', '45 CFR §92.202'],
      },
      {
        id: 'teaching-tablet', label: 'Agency teaching tablet', shortLabel: 'Secure Tool', x: 74, y: 87, zone: 'access',
        info: 'The agency tablet can display approved accessible material or document teaching.',
        meaning: 'A device must use approved content and channels; consumer tools do not replace qualified review or secure documentation.',
        action: 'Use approved applications, protect PHI, enlarge or enable accessibility features as requested, and verify usability.',
        notify: 'Report missing approved material or technology failure.',
        document: 'Approved tool or material, accessibility feature, patient response, and escalation.',
        policyRefs: ['OP-SL-005', 'CL-CD-001'],
      },
    ],
  },
  {
    id: 4,
    shortName: 'Emotion & Cognition',
    title: 'Slow Down Without Labeling the Person',
    subtitle: 'Adapt to emotion or cognition, recognize change, and escalate safety concerns within role.',
    narration: [
      'Anxiety, grief, fear, anger, pain, fatigue, and unfamiliar routines can reduce attention and recall. These responses do not by themselves prove cognitive impairment, incapacity, or refusal. Describe what you observe and ask what would help: “You seem upset. Would you like a pause?” Use a calm voice, respectful space, one idea at a time, and enough silence for the person to respond.',
      'A patient with a known cognitive impairment still deserves direct communication and participation. Follow established plan-of-care strategies such as consistent phrasing, short steps, cueing, demonstration, familiar routines, and approved caregiver support. Do not speak over the patient or automatically transfer decisions to the caregiver. Verify any representative authority through the agency workflow; being a spouse, child, or daily helper does not automatically create legal authority.',
      'Decision-making capacity is specific to the decision and may fluctuate. General field workers do not diagnose cognitive disorders or determine legal capacity. An incomplete teach-back, a diagnosis of dementia, unusual eye contact, or a caregiver’s opinion is not enough to declare incapacity. Protect the patient’s voice, report objective concerns, and obtain the appropriate clinician or authorized decision-making process.',
      'Distinguish a known pattern from an acute change. A normally alert patient who suddenly cannot state where they are, follow a familiar task, stay awake, or communicate as usual may have an urgent clinical problem. Do not treat sudden confusion as low health literacy or simply repeat teaching. Stop the task, protect the patient, assess only within role, notify the appropriate clinician or supervisor promptly, and activate emergency response when there is an imminent threat.',
      'Grief may look like tears, silence, distraction, or a request to stop. Acknowledge the emotion without diagnosing: “I am sorry this is hard. Would you like a moment, or should we continue another time?” If the patient remains oriented and chooses to continue, shorten the session and verify key information. If the person chooses to pause, follow the plan for rescheduling or clinician notification. Teach-back must never become pressure to perform while distressed.',
      'During conflict, lower stimulation and keep posture nonthreatening. Let one person speak at a time, restate the shared safety goal, and set boundaries: “I want to hear everyone, and I need to speak directly with the patient.” Protect privacy; ask who the patient wants present. Do not argue, promise an outcome, arbitrate a legal dispute, or independently resolve family disagreement about clinical decisions.',
      'If behavior escalates to threats, violence, weapons, blocked exits, or another unsafe condition, prioritize personal and patient safety. Leave when needed, call 911 for an immediate threat, and use the agency’s safety and escalation procedures. A communication course does not require a worker to remain in danger. Do not document loaded labels such as “crazy,” “difficult,” or “aggressive” without specific observed words and behavior.',
      'A defensible note records the patient’s exact or near-exact words when relevant, observable behavior, known baseline and change, accommodation offered, patient choice, effect on care, person notified, time, response, and follow-up. “Patient tearful, stated ‘I need a minute,’ accepted a quiet pause, then chose to continue one topic” is more useful than “emotionally unstable.” For sudden change, document the safety action and notification without assigning a diagnosis.'
    ],
    keyPoints: [
      { icon: '👀', title: 'Notice the change', detail: 'Separate established needs from new or worsening findings.' },
      { icon: '🌿', title: 'Regulate the setting', detail: 'Slow down, reduce stimulation, and offer a pause.' },
      { icon: '🤝', title: 'Support, do not diagnose', detail: 'Use approved strategies while preserving patient participation.' },
      { icon: '🚨', title: 'Escalate safety changes', detail: 'New confusion or threat requires prompt notification.' }
    ],
    clinicalTip: 'Grief is not incapacity. Sudden confusion is not automatically low health literacy. Respond to observed facts and change from baseline.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CL-SD-017 §§4.1, 4.6' },
      { kind: 'Care Indeed', text: 'CL-CP-005 §§4.3–4.4' },
      { kind: 'Care Indeed', text: 'GV-PM-004 §§4.5, 6.1.2' },
      { kind: 'Care Indeed', text: 'CL-PR-001' }
    ],
    sceneImage: img05,
    sceneAlt: 'A clinician sits calmly with a grieving older patient holding a family photograph while an adult caregiver stands nearby; a tissue box, simple reminder card, and phone are visible.',
    sceneNote: 'Observe emotion · preserve voice · recognize change · protect safety',
    hotspots: [
      {
        id: 'family-photo', label: 'Patient holding family photograph', shortLabel: 'Acknowledge', x: 38, y: 64, zone: 'observe',
        info: 'The patient looks down at a family photograph and appears sad.',
        meaning: 'Observable grief may affect attention, but it does not prove incapacity or cognitive decline.',
        action: 'Acknowledge the emotion, ask whether the patient wants a pause, and follow the patient’s choice when safe.',
        notify: 'Notify the clinician if distress prevents required care, persists, or raises a safety concern.',
        document: 'Observed behavior, patient’s words and choice, effect on care, and follow-up.',
        policyRefs: ['CL-PR-001', 'CL-SD-017 §4.6'],
      },
      {
        id: 'tissue-pause', label: 'Tissue box and quiet pause', shortLabel: 'Pause', x: 7, y: 80, zone: 'adapt',
        info: 'The quiet space allows the patient time without pressure.',
        meaning: 'A pause can reduce overload and preserve dignity; it should not be used to avoid an urgent safety response.',
        action: 'Offer time, reduce stimulation, and resume only if the patient chooses and communication is effective.',
        notify: 'Follow the care-team plan if the session must be shortened or rescheduled.',
        document: 'Pause offered, patient choice, what was completed, and next step.',
        policyRefs: ['CL-SD-017 §4.6', 'CL-PR-001'],
      },
      {
        id: 'one-step-card', label: 'One-step reminder card', shortLabel: 'One Step', x: 34, y: 82, zone: 'adapt',
        info: 'A simple card presents one idea rather than a stack of instructions.',
        meaning: 'Short, consistent cues may support attention or a known cognitive strategy without infantilizing the person.',
        action: 'Use only approved, accurate content and ask the patient whether the support helps.',
        notify: 'Report when the established strategy no longer works or a change from baseline is observed.',
        document: 'Support used, actual response, baseline comparison, and notification.',
        policyRefs: ['CL-SD-017 §§4.1, 4.6', 'CL-CP-005 §4.4'],
      },
      {
        id: 'safety-phone', label: 'Agency and emergency phone', shortLabel: 'Escalate', x: 44, y: 89, zone: 'escalate',
        info: 'The phone provides the approved path for a sudden change or immediate threat.',
        meaning: 'New disorientation, reduced responsiveness, or an unsafe home interaction may require urgent escalation rather than more teaching.',
        action: 'Stop, protect the patient, contact the responsible clinician or supervisor, and call 911 for an immediate threat.',
        notify: 'Use the current escalation tree; do not rely only on a personal message or caregiver judgment.',
        document: 'Objective change, time, protective action, calls, instructions, disposition, and follow-up.',
        policyRefs: ['CL-CP-005 §4.4', 'GV-PM-004 §§4.5, 6.1.2'],
      },
    ],
  },
  {
    id: 5,
    shortName: 'Close the Loop',
    title: 'Close the Loop—and Write What Happened',
    subtitle: 'A message is not complete until the receiver confirms it and the record shows the response.',
    narration: [
      'Patient teach-back and team check-back are related but different. Teach-back asks a patient or caregiver to explain or demonstrate the health information needed at home. A team check-back closes a safety communication loop: the sender reports the concern and requested action, the receiver repeats or clearly acknowledges the essential message and intended response, and the sender verifies accuracy or corrects a mismatch.',
      'Use objective facts. State who the patient is using approved identifiers, what you observed, how it differs from baseline, the immediate patient impact, what you did within the current plan and role, and what response you need. Avoid diagnoses you are not authorized to make. A structure such as SBAR may be useful as recommended practice, but do not label it a federal mandate or an agency requirement unless the current policy specifically adopts it.',
      'Closed-loop communication is more than “message sent.” Choose the responsible person and approved channel. Obtain acknowledgment when the issue affects safety, orders, scheduling, or follow-up. Repeat back instructions that are easy to mishear, especially names, numbers, timing, medication-related information, and escalation thresholds. If the receiver does not respond within the urgency of the situation, move to the next step in the agency escalation tree.',
      'Use only approved secure systems such as the agency EHR, agency phone, or approved messaging workflow. Do not place PHI in personal text, personal email, social media, a consumer translation app, or an unapproved note service. A parked vehicle may be a practical documentation location only when privacy is protected, devices are secure, and the worker is not driving. Never document or conduct a video call while the vehicle is moving.',
      'Document communication barriers with specifics. Include the patient’s preferred language and method, accommodation or interpreter service, interpreter identifier and modality when appropriate, topic and authorized teaching method, exact teach-back or return-demonstration response, re-teaching, remaining risk, person notified, time, channel, receiver response or instructions, and planned follow-up. Record only the PHI needed for care.',
      'Replace vague or stigmatizing language. “Patient understood” does not show how understanding was checked. “Language barrier” does not show the preferred language or service used. “Noncompliant” may hide a communication failure, cost problem, side effect, refusal, or unavailable support. Describe the behavior and context: what was offered, what the patient said or did, what risk was explained within role, and what the patient chose.',
      'Consider an aide who observes that a patient cannot describe an established medication schedule. The aide does not create a simpler regimen or independently re-teach content beyond the assignment. The aide reports the exact response through an approved channel, obtains acknowledgment and instructions from the responsible clinician, reinforces only what is authorized, protects the patient, and documents the communication according to role and agency policy.',
      'Save & Exit in this module stores learning progress, but training completion is not a clinical record. In actual practice, document patient care in the approved clinical system. If local storage or the clinical system fails, follow the current downtime and escalation workflow rather than assuming data was saved. Do not manufacture a personnel-file entry, evidence claim, signature, or certificate from this standalone training player.'
    ],
    keyPoints: [
      { icon: '📌', title: 'State observable facts', detail: 'Report what occurred, why it matters, and the requested action.' },
      { icon: '🔂', title: 'Confirm the receiver', detail: 'Obtain acknowledgment and correct any read-back mismatch.' },
      { icon: '🔒', title: 'Use approved channels', detail: 'Keep PHI in secure agency systems and never communicate while driving.' },
      { icon: '✍️', title: 'Document specifics', detail: 'Record access, response, notification, instructions, and follow-up.' }
    ],
    clinicalTip: '“Message sent” is not closed-loop communication. Confirm that the responsible person received and understood the concern.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CL-CD-001 §§4, 6.1' },
      { kind: 'Care Indeed', text: 'GV-PM-004 §§4, 6' },
      { kind: 'Care Indeed', text: 'OP-SL-005 §§3–4' },
      { kind: 'Practice', text: 'AHRQ TeamSTEPPS Check-Back' }
    ],
    sceneImage: img06,
    sceneAlt: 'A clinician in a securely parked car conducts a closed-loop call with a supervising nurse while an agency tablet, blank note form, checklist, clock, and closed nursing bag are visible.',
    sceneNote: 'State → acknowledge/read back → verify → document',
    hotspots: [
      {
        id: 'supervisor-call', label: 'Supervising clinician call', shortLabel: 'Check-Back', x: 78, y: 35, zone: 'escalate',
        info: 'The supervising clinician is connected through an approved agency device while the vehicle is parked.',
        meaning: 'A safety message needs a responsible receiver, not merely a sent notification.',
        action: 'State observable facts, urgency, action taken, and request; obtain acknowledgment or read-back and verify accuracy.',
        notify: 'Move through the current escalation tree when the responsible person is unavailable.',
        document: 'Recipient, time, channel, information reported, acknowledgment, instructions, and escalation.',
        policyRefs: ['GV-PM-004 §§4, 6', 'AHRQ Check-Back'],
      },
      {
        id: 'ehr-tablet', label: 'Approved clinical documentation tablet', shortLabel: 'Secure EHR', x: 60, y: 66, zone: 'access',
        info: 'The agency tablet displays a structured note without visible patient data.',
        meaning: 'Patient information belongs in approved secure systems with only necessary detail.',
        action: 'Document promptly in the approved EHR or follow downtime procedures when unavailable.',
        notify: 'Report system failure or inability to complete required documentation.',
        document: 'Use objective, attributable, timely entries; never backfill an unverified event.',
        policyRefs: ['CL-CD-001', 'OP-SL-005'],
      },
      {
        id: 'objective-checklist', label: 'Objective documentation checklist', shortLabel: 'Specifics', x: 84, y: 83, zone: 'adapt',
        info: 'The checklist prompts barrier, accommodation, response, notification, and follow-up.',
        meaning: 'Specific facts allow the next worker to reproduce effective communication and track unresolved needs.',
        action: 'Replace “understood,” “noncompliant,” or “language barrier” with observable response and action.',
        notify: 'Escalate unresolved access or safety needs and identify the follow-up owner.',
        document: 'Preference; service or aid; topic; exact response; re-teaching; notification; instructions; plan.',
        policyRefs: ['CL-CD-001 §§4.1–4.8, 6.1', 'CL-SD-017 §4.3'],
      },
      {
        id: 'closed-bag', label: 'Closed nursing bag and parked vehicle', shortLabel: 'Privacy & Safety', x: 19, y: 88, zone: 'observe',
        info: 'The nursing bag is closed, and the vehicle is stationary in a residential area.',
        meaning: 'Field communication must protect privacy and must never distract from driving.',
        action: 'Park safely, secure materials, prevent screens or papers from public view, and end documentation before driving.',
        notify: 'Report any privacy incident through the agency process.',
        document: 'Record a privacy or security incident promptly without exposing additional PHI.',
        policyRefs: ['OP-SL-005', 'CL-CD-001'],
      },
    ],
  },
  {
    id: 6,
    shortName: 'Integration',
    title: 'Integrate the Visit Under Pressure',
    subtitle: 'Observe, classify, decide, and defend a safe response when several barriers occur together.',
    narration: [
      'The final scene combines barriers. Mr. Tran has identified Vietnamese as his preferred language, uses hearing aids, appears fatigued, and asks for reduced noise and visible faces. His spouse is a trusted support person but not the assigned interpreter. The remote interpreter is connected. A picture schedule and pill organizer support an authorized medication routine. The safe response must address language, sensory access, health literacy, emotion, environment, privacy, role, and team follow-up together.',
      'Begin with protection and preference. Confirm the correct patient using approved identifiers, reduce background noise with permission, position faces and the interpreter screen for clear access, and ask Mr. Tran what method is working. Speak directly to him. Keep his spouse involved only as he wishes and within privacy and representative boundaries. Do not let the support person’s convenience override his communication or decision-making role.',
      'If the video interpreter freezes during non-emergent critical teaching, pause that content and obtain another approved qualified modality. Do not default to the spouse, gestures, louder English, or a consumer app. Continue only what can be performed safely within the current plan and role. If an emergency develops, protect the patient immediately while qualified access is being obtained and confirm critical information afterward.',
      'Adapt the message as well as the channel. Present the authorized action first, use short complete segments for interpretation, define necessary terms, and use the accurate picture sequence without relying on color alone. Ask Mr. Tran to explain or demonstrate the routine with the organizer. If he omits a step, re-explain differently through the qualified interpreter and check again. Do not interpret fatigue or an incomplete response as incapacity.',
      'Close the team loop for anything unresolved. Report the exact communication access need, response, and risk through an approved channel. Obtain acknowledgment and identify who will provide updated material, arrange future interpretation, clarify an order, or follow up on a clinical concern. If you are an aide or another worker whose assignment is reinforcement, do not expand the teaching or change the regimen; report and follow instructions.',
      'Document the preferred language and method, interpreter service and identifier, hearing or visual accommodation, environmental changes, authorized teaching topic, teach-back or show-me response, re-teaching, remaining issue, notification, receiver response, and follow-up owner. Avoid unnecessary PHI and labels. The record should allow the next worker to know exactly what worked and what still needs action.',
      'Use the training memory aid: Protect → Ask → Access → Adapt → Verify → Notify → Document. It is not a policy title and it does not replace clinical judgment or emergency procedures. It reminds you that communication safety is layered. Solving one barrier does not solve the visit, and finishing this module does not expand professional scope, qualify you as an interpreter, validate field competency, or authorize independent practice.'
    ],
    keyPoints: [
      { icon: '🛡️', title: 'Protect and pause', detail: 'Do not improvise through an unsafe communication gap.' },
      { icon: '🌐', title: 'Access and adapt', detail: 'Combine qualified service with environmental and message changes.' },
      { icon: '✅', title: 'Verify and close', detail: 'Use teach-back plus team acknowledgment or read-back.' },
      { icon: '📝', title: 'Document and follow', detail: 'Record the response and give unresolved needs an owner.' }
    ],
    clinicalTip: 'A qualified interpreter does not eliminate hearing, environmental, emotional, or health-literacy needs. Layer the response.',
    sourceLabels: [
      { kind: 'Federal', text: '42 CFR §484.50(f)' },
      { kind: 'Federal', text: '45 CFR §§92.201–92.202' },
      { kind: 'Care Indeed', text: 'OP-PA-003; CL-SD-017' },
      { kind: 'Care Indeed', text: 'CL-CD-001; GV-PM-004' }
    ],
    sceneImage: img07,
    sceneAlt: 'An older Vietnamese-speaking patient uses a pill organizer during teach-back while a clinician communicates directly, a spouse supports him, and a qualified interpreter is connected on a tablet.',
    sceneNote: 'Protect → Ask → Access → Adapt → Verify → Notify → Document',
    hotspots: [
      {
        id: 'remote-interpreter', label: 'Qualified remote interpreter', shortLabel: 'Access', x: 15, y: 76, zone: 'access',
        info: 'A qualified interpreter is visible on the tablet but remains secondary to the patient-clinician relationship.',
        meaning: 'Language access enables direct patient participation and must remain technically effective.',
        action: 'Confirm connection and qualification, speak directly to the patient, and switch modalities if the service fails.',
        notify: 'Contact the agency immediately for an approved alternative when critical communication is interrupted.',
        document: 'Identifier, modality, effectiveness, any failure, alternative, and communication outcome.',
        policyRefs: ['45 CFR §92.201', 'OP-PA-003'],
      },
      {
        id: 'hearing-access', label: 'Hearing aid and fatigued patient', shortLabel: 'Layer Needs', x: 39, y: 29, zone: 'observe',
        info: 'The patient uses a hearing aid and appears fatigued during an evening visit.',
        meaning: 'Interpreter access does not automatically solve hearing, attention, or fatigue-related barriers.',
        action: 'Ask what helps, reduce noise, keep faces visible, slow the pace, and offer a pause.',
        notify: 'Report new or worsening changes from baseline or inability to communicate safely.',
        document: 'Patient-stated preference, observable response, adjustments, and unresolved concern.',
        policyRefs: ['45 CFR §92.202', 'CL-SD-017 §4.6'],
      },
      {
        id: 'picture-sequence', label: 'Accessible picture schedule', shortLabel: 'Adapt', x: 68, y: 61, zone: 'adapt',
        info: 'The clinician uses a short picture sequence to support the interpreted explanation.',
        meaning: 'The visual adds health-literacy support but must match the current authorized plan and accessible format.',
        action: 'Explain one segment at a time through the qualified interpreter and confirm symbols and sequence are understood.',
        notify: 'Request corrected or appropriate-language material if the current version is not usable.',
        document: 'Material, language and format, patient response, and replacement or follow-up.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', '42 CFR §484.50(f)'],
      },
      {
        id: 'patient-organizer', label: 'Patient teach-back with organizer', shortLabel: 'Verify', x: 45, y: 67, zone: 'adapt',
        info: 'The patient demonstrates the routine while the clinician observes and the interpreter supports communication.',
        meaning: 'Show-me verifies the explanation and tool; it does not test intelligence or replace clinical assessment.',
        action: 'Compare the demonstration with the authorized plan, re-teach differently if incomplete, and check again.',
        notify: 'Escalate an unsafe response or discrepancy to the responsible clinician.',
        document: 'Exact demonstration, missing step, re-teaching, repeat result, and notification.',
        policyRefs: ['CL-SD-017 §§4.3–4.6', 'AHRQ Teach-Back'],
      },
      {
        id: 'secure-followup', label: 'Secure phone and follow-up owner', shortLabel: 'Notify & Document', x: 76, y: 84, zone: 'escalate',
        info: 'The secure phone represents closing the loop on any unresolved access or care need.',
        meaning: 'A safe visit ends with an acknowledged handoff and a clear owner for follow-up.',
        action: 'Report observable facts through the approved channel, confirm receipt and instructions, and identify next action.',
        notify: 'Use the responsible clinician, supervisor, on-call path, or emergency services according to urgency.',
        document: 'Recipient, time, channel, acknowledgment, instructions, follow-up owner, and patient status.',
        policyRefs: ['GV-PM-004', 'CL-CD-001', 'OP-SL-005'],
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'Which statement correctly distinguishes language access, disability access, and health literacy?',
    options: [
      'They are three names for the same communication problem',
      'Language access addresses a person’s preferred language; disability access provides effective aids or services; health literacy concerns finding, understanding, and using information—and the needs may overlap',
      'Disability access applies only to written material',
      'Health literacy can be determined from education level or appearance',
    ],
    correct: 1,
    rationale: 'These are distinct but overlapping needs. Meaningful access for an individual with LEP is addressed in 45 CFR §92.201 and Care Indeed OP-PA-003; effective disability communication is addressed in 45 CFR §92.202 and 42 CFR §484.50(f); CL-SD-017 and AHRQ support understandable, individualized education. Appearance or education level is not an assessment of understanding.',
  },
  {
    id: 1,
    stem: 'Which prompt best uses teach-back after an authorized home-care instruction?',
    options: [
      'Do you understand everything?',
      'Repeat exactly what I just said',
      'I want to be sure I explained this clearly. Please show me how you will do this at home',
      'Your caregiver understands, so we are finished, correct?',
    ],
    correct: 2,
    rationale: 'Teach-back asks the patient to explain or demonstrate the essential information in their own words or actions and treats an incomplete response as a signal to improve the explanation. It is not a memory test. Care Indeed CL-SD-017 §§4.3–4.6 and AHRQ Teach-Back Tool 5 support this non-shaming approach.',
  },
  {
    id: 2,
    stem: 'Elena’s preferred language is Spanish. Her bilingual adult niece offers to interpret a non-emergent, accuracy-critical instruction. What is the safest response?',
    options: [
      'Use the niece because she is an adult and Elena trusts her',
      'Connect an agency-approved qualified interpreter, speak directly to Elena, and allow the niece to remain as support if Elena wants',
      'Use a consumer translation app for the full instruction',
      'Continue in English and ask Elena to nod after every sentence',
    ],
    correct: 1,
    rationale: 'The qualified service is the safe default. Under 45 CFR §92.201, reliance on an accompanying adult is limited by narrow safeguards; family trust or bilingual ability alone is insufficient. OP-PA-003 requires language access, but its broader family-interpreter wording should be escalated rather than independently applied. The patient must not be required to supply or pay for the interpreter.',
  },
  {
    id: 3,
    stem: 'A patient identifies as Deaf and requests ASL for a complex care discussion. The patient’s son begins answering every question. What should the field worker do?',
    options: [
      'Address the son because he can hear',
      'Write a few keywords and continue regardless of the patient’s response',
      'Communicate directly with the patient and obtain a qualified sign-language interpreter, keeping the son involved only as the patient wishes',
      'Speak louder and exaggerate lip movements',
    ],
    correct: 2,
    rationale: 'Effective communication must be individualized to the patient and the complexity of the interaction. A companion does not replace an effective auxiliary aid or service. Communicate directly with the patient and provide the qualified interpreter requested. See 45 CFR §92.202, 42 CFR §484.50(f), and DOJ ADA Effective Communication guidance.',
  },
  {
    id: 4,
    stem: 'A patient with low vision requests electronic information compatible with a screen reader. What is the best response?',
    options: [
      'Give the standard small-print handout to the caregiver',
      'Enlarge the handout without asking whether large print works',
      'Arrange the requested accessible electronic format, communicate directly with the patient, and verify that the information is usable',
      'Omit the information because the patient cannot use the standard handout',
    ],
    correct: 2,
    rationale: 'The format must be effective for the individual. Transferring communication to a companion or choosing an arbitrary format is insufficient. The worker should arrange the requested accessible electronic material and verify usability. See 45 CFR §92.202 and 42 CFR §484.50(f).',
  },
  {
    id: 5,
    stem: 'After an explanation, a patient nods but cannot demonstrate the assigned step. What should the worker do next?',
    options: [
      'Document “patient verbalized understanding”',
      'Repeat the same words more loudly',
      'Re-explain using smaller segments or a different approved method, then ask the patient to show or explain again',
      'Mark the patient noncompliant',
    ],
    correct: 2,
    rationale: 'A nod does not prove understanding. CL-SD-017 §4.6 requires the education approach to be modified when learning is not demonstrated, and AHRQ recommends re-teaching differently before repeating teach-back. Document the actual response, re-teaching, and repeat result rather than a vague conclusion.',
  },
  {
    id: 6,
    stem: 'A patient who is normally alert becomes suddenly disoriented and cannot follow a familiar task. What is the safest response?',
    options: [
      'Finish the teaching before notifying anyone',
      'Treat the behavior as low health literacy',
      'Stop, protect the patient, promptly notify the appropriate clinician or supervisor, and activate emergency response if there is an imminent threat',
      'Document “patient difficult” and leave without notification',
    ],
    correct: 2,
    rationale: 'A sudden change from baseline may signal an urgent clinical or safety problem. A general field worker should not diagnose the cause. Protect, escalate, and document observable findings under Care Indeed CL-CP-005 §4.4 and GV-PM-004 §§4.5 and 6.1.2; use emergency procedures when warranted.',
  },
  {
    id: 7,
    stem: 'Which entry best documents a communication accommodation?',
    options: [
      'Language barrier. Patient understood.',
      'Spanish patient; daughter translated. No problems.',
      'Preferred language Spanish. Agency video interpreter ID 4821 used. Assigned instruction delivered in short segments. Patient omitted step two on first teach-back; instruction rephrased with the approved visual and both steps accurately explained on repeat. RN notified in the EHR at 14:20 about the need for Spanish large-print material; RN acknowledged.',
      'Patient appears uneducated and confused.',
    ],
    correct: 2,
    rationale: 'The complete entry records preference, qualified service and identifier, method, actual response, re-teaching, notification, and acknowledgment without stigmatizing labels. See OP-PA-003 §3.4, CL-SD-017 §4.3, and CL-CD-001 §§4 and 6.1.',
  },
  {
    id: 8,
    stem: 'An aide observes that a patient cannot describe the established medication schedule. The aide is not authorized to change or independently re-teach the regimen. What should the aide do?',
    options: [
      'Create a simpler medication schedule',
      'Text the nurse from a personal phone and assume the message was received',
      'Report the exact observation through an approved channel, obtain acknowledgment and instructions from the responsible clinician, remain within scope, and document the communication',
      'Wait until the next annual assessment',
    ],
    correct: 2,
    rationale: 'The aide reports rather than modifying the regimen, uses an approved secure channel, confirms receipt and instructions, and documents the follow-up. This aligns with GV-PM-004 §§4.2–4.5, OP-SL-005 §§3.3–3.4, CL-CP-005 §4.3, and AHRQ Check-Back recommended practice.',
  },
  {
    id: 9,
    stem: 'During a non-emergent visit, Elena’s interpreter video freezes. The television is loud, her niece begins answering, Elena cannot hear the worker clearly, and the only handout is dense English text. What is the best sequence?',
    options: [
      'Ask the niece to translate, speak louder, obtain a signature, and document that Elena agreed',
      'Pause the critical instruction, reduce noise, communicate directly with Elena, obtain another effective qualified interpreter modality, adapt the message and material, use teach-back, notify the team of unresolved needs, and document',
      'Cancel all home-health services until an in-person interpreter is available',
      'Continue with gestures and a consumer translation app because several methods are better than one',
    ],
    correct: 1,
    rationale: 'Multiple barriers require layered action. Qualified language access, effective hearing support, environmental adjustment, plain language, teach-back, team check-back, and objective documentation address different parts of the problem. See 42 CFR §484.50(f), 45 CFR §§92.201–92.202, OP-PA-003, CL-SD-017, CL-CD-001, and GV-PM-004.',
  },
];

const STYLES = `
.achcm06,.achcm06 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm06-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm06-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm06-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm06-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.achcm06-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.achcm06-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.achcm06-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm06-tabs::-webkit-scrollbar{display:none}
.achcm06-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm06-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm06-tab.quiz-tab{border:1px solid #A83D12;color:#A83D12}
.achcm06-tab.quiz-tab.active{background:#B94716;color:#fff;border-color:#B94716}
.achcm06-exit{flex-shrink:0;border-radius:10px;border:1px solid #A83D12;background:#fff;color:#A83D12;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm06-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm06-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.achcm06-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm06-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center;container-type:size}
.achcm06-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm06-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm06-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm06-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm06-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.achcm06-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:achcm06-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm06-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.achcm06-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.achcm06-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.achcm06-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm06-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm06-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.achcm06-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.achcm06-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm06-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm06-bot button.next{background:#B94716;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(185,71,22,.28);min-height:44px}
.achcm06 button:focus-visible,.achcm06 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
.achcm06-complete-overlay{position:absolute;inset:0;z-index:25;background:rgba(15,91,84,.82);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px;animation:achcm06-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm06-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm06-quiz-card{width:min(760px,100%);animation:achcm06-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .achcm06-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm06-left,.achcm06-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm06-right{min-height:360px}
  .achcm06-left{max-height:42vh;flex:0 0 auto}
  .achcm06-top{padding:0 10px;gap:8px}
  .achcm06-tab{padding:8px 10px;font-size:12px}
  .achcm06-bot{padding:0 12px;height:72px}
  .achcm06-hotspot .tag{font-size:11px;max-width:96px;white-space:normal;text-align:center;padding:4px 6px}
  .achcm06-bot>div{min-width:0;max-width:48%}
  .achcm06-bot>div span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
}
@media (max-width:420px){
  .achcm06-brand span.brand-text{display:none}
  .achcm06-exit{padding:8px 10px;font-size:11px}
  .achcm06-stage{border-radius:10px}
  .achcm06-bot{gap:5px;padding:0 6px}
  .achcm06-bot button.next{padding:10px 11px;font-size:11px;letter-spacing:.04em}
  .achcm06-bot button.nav{font-size:11px;letter-spacing:.04em;padding:0 4px}
  .achcm06-bot>div{max-width:38%}
}
@media (max-height:650px) and (min-width:901px){
  .achcm06-work{padding:8px}
  .achcm06-left{padding:16px}
  .achcm06-bot{height:64px}
}
@media (prefers-reduced-motion:reduce){
  .achcm06-hotspot .ping,.achcm06-drawer-bg,.achcm06-quiz-card,.achcm06-path-step{animation:none!important}
  .achcm06-quiz-card{animation:none!important}
  .achcm06-rm-transition,.achcm06-complete-overlay{transition:none!important;animation:none!important}
}
.achcm06-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.achcm06-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.achcm06-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.achcm06-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.achcm06-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.achcm06-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.achcm06-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.achcm06-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.achcm06-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.achcm06-process-node ul{margin:0;padding-left:14px}
.achcm06-process-node li{margin:0}
.achcm06-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.achcm06-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.achcm06-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.achcm06-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
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
  const zoneIcon = hotspot.zone === 'escalate'
    ? <AlertTriangle size={18} />
    : hotspot.zone === 'access'
      ? <Compass size={18} />
      : hotspot.zone === 'adapt'
        ? <Sparkles size={18} />
        : <Eye size={18} />;
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
    <div className="achcm06-drawer-bg" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm06-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.96)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: z.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {zoneIcon}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{z.label} practice</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={() => { onClose(); triggerRef.current?.focus(); }} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Clinical feedback</p>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedbackBlock label="What you observed" body={hotspot.info} />
          <FeedbackBlock label="What it means" body={hotspot.meaning} />
          <FeedbackBlock label="Safe field action" body={hotspot.action} accent />
          {hotspot.notify && <FeedbackBlock label="Who must be notified" body={hotspot.notify} icon={<Phone size={14} />} />}
          <FeedbackBlock label="What must be documented" body={hotspot.document} icon={<FileText size={14} />} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotspot.policyRefs.map((r) => (
              <span key={r} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
            ))}
          </div>
          <button type="button" onClick={onComplete} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.actionOrange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > 1;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>Lesson {pageIndex + 1} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 700 }}>{page.subtitle}</p>
      <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Field Actions</div>
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

function RightPanel({ page, completed, setCompleted, onContinue }: {
  page: PageData;
  completed: string[];
  setCompleted: (ids: string[]) => void;
  onContinue: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const completionActionRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const active = page.hotspots.find((h) => h.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && page.hotspots.every((h) => completed.includes(h.id));
  const showCompletion = done && !active && !completionDismissed;
  const titleId = `achcm06-scene-title-${page.id}`;
  const descId = `achcm06-scene-desc-${page.id}`;

  useEffect(() => {
    setActiveId(null);
    setCompletionDismissed(false);
  }, [page.id]);

  useEffect(() => {
    if (!showCompletion) return;
    const timer = window.setTimeout(() => completionActionRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [showCompletion]);

  return (
    <div className="achcm06-stage-wrap">
      <div className="achcm06-stage" role="region" aria-labelledby={titleId} aria-describedby={descId}>
        <img className="scene" src={page.sceneImage} alt={page.sceneAlt} draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeDark }}>{page.shortName}</div>
          <div id={titleId} style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title}</div>
        </div>
        <p id={descId} className="achcm06-sr-only">{page.sceneNote}</p>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>

        {page.hotspots.map((hs) => {
          const isDone = completed.includes(hs.id);
          const color = ZONE[hs.zone].color;
          const nextIncomplete = page.hotspots.find((h) => !completed.includes(h.id));
          const isGuided = !isDone && nextIncomplete?.id === hs.id;
          return (
            <button
              key={hs.id}
              type="button"
              className={`achcm06-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`achcm06-progress-${page.id}`}
              tabIndex={showCompletion ? -1 : 0}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveId(hs.id);
              }}
            >
              <span className="orb" style={{ background: isDone ? CI.teal : color }}>
                {isGuided && !isDone && <span className="ping" aria-hidden="true" />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <span style={{ fontSize: 15 }} aria-hidden="true">?</span>}
              </span>
              <span className="tag">{hs.shortLabel}</span>
              {isDone && <span className="achcm06-sr-only">Completed</span>}
            </button>
          );
        })}

        <div id={`achcm06-progress-${page.id}`} className="achcm06-live" aria-live="polite" role="status">
          {completed.length} of {page.hotspots.length} hotspots observed
        </div>

        <button
          ref={resetRef}
          type="button"
          aria-label="Reset lesson hotspot progress"
          tabIndex={showCompletion ? -1 : 0}
          onClick={() => {
            setCompleted([]);
            setCompletionDismissed(false);
          }}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.96)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <RotateCcw size={13} /> Reset
        </button>

        {showCompletion && (
          <div className="achcm06-complete-overlay achcm06-rm-transition">
            <div role="status" aria-live="polite" style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 410, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={32} color={CI.teal} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: CI.teal, margin: '0 0 6px' }}>Lesson scene complete</h2>
              <p style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, margin: '0 0 14px' }}>
                You reviewed every communication cue. This is knowledge practice only; it does not expand scope, qualify you as an interpreter, or validate field competency.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  ref={completionActionRef}
                  type="button"
                  onClick={onContinue}
                  style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.actionOrange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  {page.id === PAGES.length - 1 ? 'Go to Knowledge Check' : 'Continue to next lesson'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCompletionDismissed(true);
                    window.requestAnimationFrame(() => resetRef.current?.focus());
                  }}
                  style={{ width: '100%', minHeight: 44, border: `1px solid ${CI.border}`, borderRadius: 12, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                >
                  Review this scene
                </button>
              </div>
            </div>
          </div>
        )}

        {active && (
          <ClinicalFeedbackOverlay
            hotspot={active}
            onClose={() => setActiveId(null)}
            onComplete={() => {
              const nextCompleted = completed.includes(active.id) ? completed : [...completed, active.id];
              const willShowCompletion = page.hotspots.every((hotspot) => nextCompleted.includes(hotspot.id)) && !completionDismissed;
              if (nextCompleted !== completed) setCompleted(nextCompleted);
              setActiveId(null);
              if (!willShowCompletion) window.requestAnimationFrame(() => triggerRef.current?.focus());
            }}
            triggerRef={triggerRef}
          />
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
  initialAttempts,
  onPersist,
  onResult,
}: {
  onBack: () => void;
  initialAnswers?: (number | null)[];
  initialIdx?: number;
  initialFinished?: boolean;
  initialSelected?: number | null;
  initialSubmitted?: boolean;
  initialAttempts?: number;
  onPersist: (state: {
    answers: (number | null)[];
    idx: number;
    finished: boolean;
    selected: number | null;
    submitted: boolean;
    attempts: number;
  }) => void;
  onResult: (result: { score: number; percent: number; passed: boolean; attempt: number; completedAt: string }) => void;
}) {
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const [selected, setSelected] = useState<number | null>(() => {
    if (initialSelected !== undefined) return initialSelected;
    if (initialAnswers && initialAnswers[initialIdx ?? 0] != null) return initialAnswers[initialIdx ?? 0];
    return null;
  });
  const [submitted, setSubmitted] = useState<boolean>(() => {
    if (initialSubmitted !== undefined) return Boolean(initialSubmitted);
    return Boolean(initialAnswers && initialAnswers[initialIdx ?? 0] != null);
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => initialAnswers ?? Array(QUIZ.length).fill(null),
  );
  const [finished, setFinished] = useState(Boolean(initialFinished));
  const [attempts, setAttempts] = useState(initialAttempts ?? 0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const q = QUIZ[idx];
  const isCorrect = selected === q.correct;
  const score = useMemo(
    () => answers.reduce<number>((total, answer, questionIndex) => total + (answer === QUIZ[questionIndex].correct ? 1 : 0), 0),
    [answers],
  );
  const pct = Math.round((score / QUIZ.length) * 100);
  const passed = pct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted, attempts });
  }, [answers, attempts, finished, idx, onPersist, selected, submitted]);

  useEffect(() => {
    if (submitted && !finished) {
      window.requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  }, [finished, submitted]);

  useEffect(() => {
    if (finished) window.requestAnimationFrame(() => resultRef.current?.focus());
  }, [finished]);

  const focusOption = (optionIndex: number) => {
    setSelected(optionIndex);
    window.requestAnimationFrame(() => optionRefs.current[optionIndex]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const nextAnswers = [...answers];
      nextAnswers[idx] = selected;
      setAnswers(nextAnswers);
      setSubmitted(true);
      return;
    }
    if (idx >= QUIZ.length - 1) {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      setFinished(true);
      onResult({
        score,
        percent: pct,
        passed,
        attempt: nextAttempt,
        completedAt: new Date().toISOString(),
      });
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelected(answers[nextIdx] ?? null);
    setSubmitted(answers[nextIdx] != null);
    window.requestAnimationFrame(() => optionRefs.current[answers[nextIdx] ?? 0]?.focus());
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <div className="achcm06-quiz-page">
        <div className="achcm06-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: passed ? CI.teal : '#B42318', marginBottom: 8 }}>
            {passed ? 'Knowledge Check Passed' : 'Attempt Not Passed'}
          </div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={passed ? CI.teal : '#B42318'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="achcm06-rm-transition"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : '#B42318' }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length} · Attempt {attempts}</div>
              </div>
            </div>
          </div>
          <h1 ref={resultRef} tabIndex={-1} style={{ fontSize: 22, fontWeight: 800, color: CI.teal, margin: '0 0 6px' }}>
            {passed ? 'Knowledge Check passed' : 'Review and try again'}
          </h1>
          <p role="status" aria-live="polite" style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, margin: '0 auto 22px', maxWidth: 520 }}>
            {passed
              ? 'Your module result has been saved. Completion does not expand professional scope, validate hands-on competency, qualify you as an interpreter, or authorize independent practice.'
              : 'A score of 80% is required. This attempt has not been reported as completion. Review the lesson details and answer rationales, then retake the Knowledge Check.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Observe', color: CI.teal, tip: 'Facts, preference, barriers' },
              { label: 'Access', color: '#356A8A', tip: 'Qualified aid or service' },
              { label: 'Adapt', color: CI.orangeDark, tip: 'Environment and message' },
              { label: 'Escalate', color: '#B42318', tip: 'Safety and follow-up' },
            ].map((item) => (
              <div key={item.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{item.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{item.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Back to Lessons
            </button>
            <button
              type="button"
              onClick={() => {
                setIdx(0);
                setSelected(null);
                setSubmitted(false);
                setAnswers(Array(QUIZ.length).fill(null));
                setFinished(false);
                window.requestAnimationFrame(() => optionRefs.current[0]?.focus());
              }}
              style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.actionOrange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Retake Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achcm06-quiz-page">
      <div className="achcm06-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="achcm06-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: 'linear-gradient(90deg,#F26D33,#FFB088)', transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .9 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Question {idx + 1}
          </div>
          <h1 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h1>

          <div
            role="radiogroup"
            aria-label={`Answer choices for question ${idx + 1}`}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(event) => {
              if (submitted) return;
              const max = q.options.length - 1;
              const current = selected ?? 0;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault();
                focusOption((current + 1) % q.options.length);
              } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                event.preventDefault();
                focusOption((current - 1 + q.options.length) % q.options.length);
              } else if (event.key === 'Home') {
                event.preventDefault();
                focusOption(0);
              } else if (event.key === 'End') {
                event.preventDefault();
                focusOption(max);
              }
            }}
          >
            {q.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              let border: string = CI.border;
              let background: string = '#fff';
              let letterBackground: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && optionIndex === q.correct) {
                border = CI.teal;
                background = CI.tealSoft;
                letterBackground = CI.teal;
                letterColor = '#fff';
              } else if (submitted && isSelected && !isCorrect) {
                border = '#B42318';
                background = '#FEF2F2';
                letterBackground = '#B42318';
                letterColor = '#fff';
              } else if (isSelected) {
                border = CI.teal;
                background = '#F3FBFA';
                letterBackground = CI.teal;
                letterColor = '#fff';
              }
              return (
                <button
                  key={optionIndex}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  ref={(element) => { optionRefs.current[optionIndex] = element; }}
                  tabIndex={isSelected || (selected === null && optionIndex === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setSelected(optionIndex)}
                  style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all .15s', minHeight: 48 }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBackground, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[optionIndex]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{option}</span>
                  {submitted && optionIndex === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && isSelected && !isCorrect && <XCircle size={18} color="#B42318" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#D9916F'}` }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Back to Lessons
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.actionOrange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}
            >
              {submitted ? (idx >= QUIZ.length - 1 ? 'See results' : 'Next question') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'achc-art-m06-progress-v1';

type ModuleMode = 'lessons' | 'quiz';

export type ACHCARTM06Result = {
  moduleId: typeof MODULE_META.id;
  score: number;
  percent: number;
  passed: boolean;
  attempt: number;
  completedAt: string;
};

export type ACHCARTM06Progress = {
  schemaVersion: 1;
  pageIndex: number;
  mode: ModuleMode;
  completedByPage: Record<number, string[]>;
  quizAnswers: (number | null)[];
  quizIdx: number;
  quizFinished: boolean;
  quizSelected: number | null;
  quizSubmitted: boolean;
  quizAttempts: number;
  lastResult: ACHCARTM06Result | null;
};

export type ACHCARTM06Props = {
  onProgress?: (progress: ACHCARTM06Progress) => void;
  onComplete?: (result: ACHCARTM06Result) => void;
  onExit?: (progress: ACHCARTM06Progress) => void;
};

const freshProgress = (): ACHCARTM06Progress => ({
  schemaVersion: 1,
  pageIndex: 0,
  mode: 'lessons',
  completedByPage: {},
  quizAnswers: Array(QUIZ.length).fill(null),
  quizIdx: 0,
  quizFinished: false,
  quizSelected: null,
  quizSubmitted: false,
  quizAttempts: 0,
  lastResult: null,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function normalizeProgress(value: unknown): ACHCARTM06Progress {
  const fallback = freshProgress();
  if (!isRecord(value)) return fallback;

  const rawPage = Number.isInteger(value.pageIndex) ? Number(value.pageIndex) : 0;
  const pageIndex = Math.min(PAGES.length - 1, Math.max(0, rawPage));
  const mode: ModuleMode = value.mode === 'quiz' ? 'quiz' : 'lessons';
  const completedByPage: Record<number, string[]> = {};

  if (isRecord(value.completedByPage)) {
    const rawCompletedByPage = value.completedByPage;
    PAGES.forEach((page) => {
      const rawCompleted = rawCompletedByPage[String(page.id)];
      if (!Array.isArray(rawCompleted)) return;
      const validIds = new Set(page.hotspots.map((hotspot) => hotspot.id));
      completedByPage[page.id] = [...new Set(
        rawCompleted.filter((item): item is string => typeof item === 'string' && validIds.has(item)),
      )];
    });
  }

  const rawAnswers = Array.isArray(value.quizAnswers) ? value.quizAnswers : [];
  const quizAnswers = Array.from({ length: QUIZ.length }, (_, index) => {
    const answer = rawAnswers[index];
    return Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) <= 3 ? Number(answer) : null;
  });
  const rawQuizIdx = Number.isInteger(value.quizIdx) ? Number(value.quizIdx) : 0;
  const quizIdx = Math.min(QUIZ.length - 1, Math.max(0, rawQuizIdx));
  const rawSelected = value.quizSelected;
  const quizSelected = Number.isInteger(rawSelected) && Number(rawSelected) >= 0 && Number(rawSelected) <= 3
    ? Number(rawSelected)
    : null;
  const quizSubmitted = Boolean(value.quizSubmitted) && quizSelected !== null;
  const quizFinished = Boolean(value.quizFinished) && quizAnswers.every((answer) => answer !== null);
  const quizAttempts = Number.isInteger(value.quizAttempts)
    ? Math.min(999, Math.max(0, Number(value.quizAttempts)))
    : 0;

  let lastResult: ACHCARTM06Result | null = null;
  if (isRecord(value.lastResult)) {
    const score = Number(value.lastResult.score);
    const percent = Number(value.lastResult.percent);
    const attempt = Number(value.lastResult.attempt);
    const completedAt = value.lastResult.completedAt;
    if (
      Number.isInteger(score) && score >= 0 && score <= QUIZ.length
      && Number.isFinite(percent) && percent >= 0 && percent <= 100
      && Number.isInteger(attempt) && attempt >= 1
      && typeof completedAt === 'string'
    ) {
      lastResult = {
        moduleId: MODULE_META.id,
        score,
        percent,
        passed: percent >= MODULE_META.passing,
        attempt,
        completedAt,
      };
    }
  }

  return {
    schemaVersion: 1,
    pageIndex,
    mode,
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished,
    quizSelected,
    quizSubmitted,
    quizAttempts,
    lastResult,
  };
}

function loadProgress(): ACHCARTM06Progress {
  if (typeof window === 'undefined') return freshProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : freshProgress();
  } catch {
    return freshProgress();
  }
}

function saveProgress(data: ACHCARTM06Progress): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Static approved Care Indeed mark (non-interactive and non-animated). */
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none' }} />
  );
}

export default function ACHCARTM06({
  onProgress,
  onComplete,
  onExit,
}: ACHCARTM06Props = {}) {
  const initial = useMemo(loadProgress, []);
  const [mode, setMode] = useState<ModuleMode>(initial.mode);
  const [pageIndex, setPageIndex] = useState(initial.pageIndex);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial.completedByPage);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial.quizAnswers);
  const [quizIdx, setQuizIdx] = useState(initial.quizIdx);
  const [quizFinished, setQuizFinished] = useState(initial.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial.quizSelected);
  const [quizSubmitted, setQuizSubmitted] = useState(initial.quizSubmitted);
  const [quizAttempts, setQuizAttempts] = useState(initial.quizAttempts);
  const [lastResult, setLastResult] = useState<ACHCARTM06Result | null>(initial.lastResult);
  const [storageError, setStorageError] = useState('');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const page = PAGES[pageIndex];
  const completed = completedByPage[page.id] ?? [];
  const activeTabIndex = mode === 'quiz' ? PAGES.length : pageIndex;

  const snapshot = useCallback((patch?: Partial<ACHCARTM06Progress>): ACHCARTM06Progress => ({
    schemaVersion: 1,
    pageIndex,
    mode,
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished,
    quizSelected,
    quizSubmitted,
    quizAttempts,
    lastResult,
    ...patch,
  }), [
    completedByPage,
    lastResult,
    mode,
    pageIndex,
    quizAnswers,
    quizAttempts,
    quizFinished,
    quizIdx,
    quizSelected,
    quizSubmitted,
  ]);

  const persistAll = useCallback((patch?: Partial<ACHCARTM06Progress>) => {
    const next = snapshot(patch);
    const saved = saveProgress(next);
    setStorageError(saved ? '' : 'Progress could not be saved in this browser. Keep this module open and contact support before exiting.');
    if (saved) onProgress?.(next);
    return { saved, progress: next };
  }, [onProgress, snapshot]);

  useEffect(() => {
    persistAll();
  }, [persistAll]);

  useEffect(() => {
    tabRefs.current[activeTabIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTabIndex]);

  const activateTab = (targetIndex: number) => {
    if (targetIndex === PAGES.length) {
      setMode('quiz');
      return;
    }
    setMode('lessons');
    setPageIndex(targetIndex);
  };

  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = PAGES.length + 1;
    let target: number | null = null;
    if (event.key === 'ArrowRight') target = (index + 1) % count;
    else if (event.key === 'ArrowLeft') target = (index - 1 + count) % count;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    if (target === null) return;
    event.preventDefault();
    activateTab(target);
    window.requestAnimationFrame(() => tabRefs.current[target!]?.focus());
  };

  const handleSaveExit = () => {
    const { saved, progress } = persistAll();
    if (!saved) return;
    onExit?.(progress);
    window.dispatchEvent(new CustomEvent('achc-art-m06:exit', { detail: progress }));
    if (!onExit && window.history.length > 1) window.history.back();
  };

  const handleQuizPersist = useCallback((state: {
    answers: (number | null)[];
    idx: number;
    finished: boolean;
    selected: number | null;
    submitted: boolean;
    attempts: number;
  }) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
    setQuizAttempts(state.attempts);
  }, []);

  const handleResult = useCallback((result: Omit<ACHCARTM06Result, 'moduleId'>) => {
    const completeResult: ACHCARTM06Result = { moduleId: MODULE_META.id, ...result };
    setLastResult(completeResult);
    window.dispatchEvent(new CustomEvent('achc-art-m06:result', { detail: completeResult }));
    if (completeResult.passed) onComplete?.(completeResult);
  }, [onComplete]);

  return (
    <div className="achcm06 achcm06-shell">
      <style>{STYLES}</style>
      <header className="achcm06-top">
        <div className="achcm06-brand" aria-label="Care Indeed annual training">
          <BrandMark size={28} />
          <span className="brand-text">ACHC · Communication</span>
        </div>
        <div className="achcm06-tabs" role="tablist" aria-label="Module lessons and Knowledge Check">
          {PAGES.map((lesson, index) => {
            const active = mode === 'lessons' && index === pageIndex;
            return (
              <button
                key={lesson.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`achcm06-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`achcm06-panel-${index}`}
                tabIndex={active ? 0 : -1}
                className={`achcm06-tab ${active ? 'active' : ''}`}
                onClick={() => activateTab(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                {lesson.shortName}
              </button>
            );
          })}
          <button
            ref={(element) => { tabRefs.current[PAGES.length] = element; }}
            id="achcm06-tab-quiz"
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            aria-controls="achcm06-panel-quiz"
            tabIndex={mode === 'quiz' ? 0 : -1}
            className={`achcm06-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => activateTab(PAGES.length)}
            onKeyDown={(event) => handleTabKey(event, PAGES.length)}
          >
            Knowledge Check
          </button>
        </div>
        <button type="button" className="achcm06-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      <div className="achcm06-live" role="status" aria-live="assertive">{storageError}</div>

      {mode === 'quiz' ? (
        <main
          id="achcm06-panel-quiz"
          role="tabpanel"
          aria-labelledby="achcm06-tab-quiz"
          style={{ flex: 1, minHeight: 0, display: 'flex' }}
        >
          <QuizPage
            onBack={() => setMode('lessons')}
            initialAnswers={quizAnswers}
            initialIdx={quizIdx}
            initialFinished={quizFinished}
            initialSelected={quizSelected}
            initialSubmitted={quizSubmitted}
            initialAttempts={quizAttempts}
            onPersist={handleQuizPersist}
            onResult={handleResult}
          />
        </main>
      ) : (
        <main
          id={`achcm06-panel-${pageIndex}`}
          role="tabpanel"
          aria-labelledby={`achcm06-tab-${pageIndex}`}
          className="achcm06-work"
        >
          <aside className="achcm06-left">
            <LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} />
          </aside>
          <section className="achcm06-right" aria-label={`${page.title} practice`}>
            <RightPanel
              page={page}
              completed={completed}
              setCompleted={(ids) => setCompletedByPage((previous) => ({ ...previous, [page.id]: ids }))}
              onContinue={() => {
                if (pageIndex === PAGES.length - 1) setMode('quiz');
                else setPageIndex((index) => Math.min(PAGES.length - 1, index + 1));
              }}
            />
          </section>
        </main>
      )}

      <footer className="achcm06-bot">
        <button
          type="button"
          className="nav"
          disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((index) => Math.max(0, index - 1));
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
            {mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${pageIndex + 1} of ${PAGES.length} · ${page.shortName}`}
          </span>
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => setPageIndex((index) => Math.min(PAGES.length - 1, index + 1))}>
            Next · {PAGES[pageIndex + 1]?.shortName} <ChevronRight size={16} />
          </button>
        )}
      </footer>
    </div>
  );
}
