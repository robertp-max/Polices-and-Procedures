/**
 * ACHC-ART-M09 — Corporate Compliance, FWA & Non-Retaliation
 * Version: PASS-5 learner package
 * LVN-002 v5.3.5 visual/runtime parity with M09-specific accessibility,
 * persistence, assessment, attempt, and completion hardening.
 * Lessons: 7 | Hotspots: 34 | Knowledge Check: 10 | Pass: 80% | Max attempts: 3
 */
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, Phone, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lesson-01-compliance-duty.png';
import img02 from './assets/lesson-02-integrity.png';
import img03 from './assets/lesson-03-fwa-fca.png';
import img04 from './assets/lesson-04-referrals-conflicts.png';
import img05 from './assets/lesson-05-reporting-non-retaliation.png';
import img06 from './assets/lesson-06-investigations-response.png';
import img07 from './assets/lesson-07-compliance-practice.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#F26D33', orangeAction: '#C84F1D', orangeDark: '#A83D12', ink: '#2D3748',
  muted: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ComplianceKind = 'expected' | 'escalate' | 'prohibited' | 'guidance';
interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  x: number; y: number; mobileX?: number; mobileY?: number; kind: ComplianceKind;
  info: string; meaning: string; action: string; notify?: string; document: string; policyRefs: string[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface DetailSection { heading: string; paragraphs: string[]; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  overview: string[]; details: DetailSection[]; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[];
  sceneImage: string; sceneAlt: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; source: string; }
export type ReportingContacts = {
  complianceOfficer?: string;
  independentOrBypass?: string;
  anonymous?: string;
};

const STATUS: Record<ComplianceKind, { label: string; color: string; soft: string }> = {
  expected: { label: 'Expected practice', color: CI.teal, soft: CI.tealSoft },
  escalate: { label: 'Pause and report', color: CI.orangeAction, soft: '#FFF3EC' },
  prohibited: { label: 'Potential violation', color: CI.red, soft: '#FEF2F2' },
  guidance: { label: 'Compliance guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = {
  id: 'ACHC-ART-M09',
  title: 'Corporate Compliance, FWA & Non-Retaliation',
  pages: 7,
  quizCount: 10,
  passing: 80,
  maxAttempts: 3,
} as const;


const PAGES: PageData[] = [
  {
    id: 0,
    shortName: 'Duty',
    title: 'Compliance Is Everyone’s Work',
    subtitle: 'Follow the standard, ask early, and report what does not look right',
    overview: [
      'Corporate compliance is the way Care Indeed turns its commitment to lawful, ethical, patient-centered work into daily practice. It is not a department that operates after care is finished. It reaches the home visit, schedule, clinical record, claim-supporting facts, patient choice, privacy, safety, and every conversation in which a worker is asked to act for the agency.',
      'Your responsibility is practical: know the standards that apply to your role, remain within the current order and scope, ask before guessing, and promptly report a known or suspected problem. A report communicates facts for review; it is not an accusation or legal verdict. No supervisor, deadline, staffing shortage, or financial target can authorize a false record or unlawful act.'
    ],
    details: [
      {
        heading: 'Learning objectives',
        paragraphs: [
          'After completing this module, you should be able to explain your compliance duty; protect truthful records; recognize common FWA, false-claim, referral, gift, conflict, exclusion, and overpayment warning signs; choose a current approved or bypass reporting channel; distinguish anonymity from confidentiality; recognize possible retaliation; preserve authorized originals; and cooperate without self-investigating.'
        ]
      },
      {
        heading: 'How the program fits together',
        paragraphs: [
          'Care Indeed policy organizes the program around written standards and a Code of Conduct; accountable compliance leadership and Governing Body oversight; education; open reporting channels; risk assessment, auditing, and monitoring; consistent enforcement; and prompt investigation and corrective action. HHS-OIG uses the same seven-element structure as voluntary, nonbinding guidance. The agency policy—not the guidance by itself—creates the workforce duties taught here.',
          'These elements work as a system. A policy that no one can find is weak. A reporting channel without non-retaliation protection is unsafe. Training without monitoring cannot show whether practice improved. An investigation without corrective action leaves the underlying risk in place. Field workers contribute by asking questions, following approved workflows, and reporting facts from the point where care and documentation occur.'
        ]
      },
      {
        heading: 'Your field-worker boundary',
        paragraphs: [
          'You are not expected to interpret a federal safe harbor, decide whether a claim is legally false, classify a coworker as excluded, calculate an overpayment deadline, or determine discipline. Those decisions require authorized review by Compliance, Revenue Cycle, Human Resources, clinical leadership, or counsel. Your duty is to recognize a mismatch or pressure point and move it into the correct review channel.',
          'The same boundary protects patients. If a request conflicts with the plan of care, an order, your current competency, agency policy, or what you directly observed, pause the disputed action when safe. Protect the patient, contact the appropriate clinical supervisor for care direction, and use the compliance route for integrity concerns. Compliance reporting never replaces emergency response, mandated abuse reporting, privacy incident reporting, or immediate clinical escalation.'
        ]
      },
      {
        heading: 'Questions are preventive compliance',
        paragraphs: [
          'A concern does not need to be fully formed before you ask a question. Examples include a schedule that does not match the visit, a documentation field you cannot truthfully complete, a gift connected to referrals, a request to use another person’s login, or uncertainty about where to report a supervisor. Asking early may prevent an error from reaching the medical record or a payer.',
          'Use a current controlled policy or approved directory rather than an old printout, remembered phone number, or coworker’s informal rule. Use the approved reporting channels displayed in Lesson 5 or the current agency directory or host LMS. If one route is unavailable or may involve the subject of the concern, use the published independent or bypass route.'
        ]
      },
      {
        heading: 'The five-step field model',
        paragraphs: [
          'Use SEE → SAFE → SAVE → SAY → SUPPORT. SEE the mismatch, unusual benefit, request, pattern, or adverse action. SAFE means protect the patient and refuse to create a false act or record. SAVE means preserve the original authorized record or message without deleting, overwriting, backdating, or collecting records outside your access. SAY means report factual information promptly through an approved channel. SUPPORT means cooperate truthfully and protect appropriate privacy while authorized reviewers do their work.',
          'This sequence is deliberately neutral. You can report “the Tuesday visit appears completed in the handoff view, and the patient told me no one came” without saying “my coworker committed fraud.” Facts are more useful than labels and reduce the risk of rumor, confrontation, or accidental alteration of evidence.'
        ]
      }
    ],
    keyPoints: [
      { icon: '📘', title: 'Know the standard', detail: 'Use the current controlled policy and role-specific workflow.' },
      { icon: '🛡️', title: 'Stay in scope', detail: 'Patient safety and truthful action come before pressure or speed.' },
      { icon: '❓', title: 'Ask early', detail: 'A policy question can prevent a violation before it occurs.' },
      { icon: '📣', title: 'Report promptly', detail: 'Share facts through an approved channel; no legal finding required.' }
    ],
    clinicalTip: 'If an instruction conflicts with what you observed, the plan or order, your scope, or an approved policy, pause and ask. Position or urgency does not make a false action safe.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-CP-001; CO-CP-004; CO-CP-006; CO-CP-008' },
      { kind: 'Federal guidance', text: 'HHS-OIG GCPG (voluntary)' },
      { kind: 'Federal CoP', text: '42 CFR §484.100' }
    ],
    sceneImage: img01,
    sceneAlt: 'Field worker reviews a tablet with an older patient in a sunlit home; a nursing bag, phone, and clipboard are arranged on the table.',
    hotspots: [
      {
        id: 'policy', label: 'Current controlled policy', shortLabel: 'Policy', x: 49, y: 91, kind: 'guidance',
        info: 'A current agency document is available at the point of work.', meaning: 'Workers need the controlled version; an old printout or remembered rule may be incomplete or superseded.', action: 'Check the controlled source and ask Compliance or the appropriate supervisor when the requirement is unclear.',
        notify: 'Supervisor or Compliance when the question affects care, documentation, billing support, or reporting.', document: 'Record the operational question and direction received when it changes what you do.', policyRefs: ['CO-CP-001', 'CO-CP-004'],
      },
      {
        id: 'plan', label: 'Current plan and assigned service', shortLabel: 'Plan / Order', x: 52, y: 57, kind: 'expected',
        info: 'The tablet represents the current plan, order, and assigned visit information.', meaning: 'Compliance begins by providing only care that is ordered, medically appropriate, within role scope, and accurately recorded.', action: 'Confirm the assignment before care and pause when a request conflicts with the plan, scope, or observed facts.',
        notify: 'Clinical supervisor for care-direction conflicts; Compliance for integrity pressure or suspected misconduct.', document: 'Actual care, findings, variance, notifications, and instructions received.', policyRefs: ['CO-CP-004 §5.1', '42 CFR §484.60'],
      },
      {
        id: 'contact', label: 'Approved compliance contact', shortLabel: 'Report Route', x: 35, y: 86, kind: 'escalate',
        info: 'The secure agency phone represents a current reporting route.', meaning: 'A worker may ask a question or report a concern through an approved independent channel without needing supervisor permission.', action: 'Use the contact published in the current agency directory or LMS; do not rely on an unverified number.',
        notify: 'Compliance Officer or published independent or bypass route, especially when the supervisor may be involved.', document: 'Keep the date, channel, concise subject, and any confirmation or reference number—never PHI in a personal note.', policyRefs: ['CO-CP-006', 'OIG GCPG pp. 49–50, 66–67'],
      },
      {
        id: 'device', label: 'Approved agency device', shortLabel: 'Secure Device', x: 14, y: 69, kind: 'expected',
        info: 'The closed nursing bag and approved equipment represent agency-controlled tools and records.', meaning: 'Compliance information and patient information belong in authorized systems, not personal accounts or devices.', action: 'Use approved systems, minimum necessary access, and secure handling while preserving relevant original records.',
        notify: 'Privacy or Security contact for suspected exposure; Compliance for integrity concerns.', document: 'Use the approved incident or compliance workflow, not a personal copy of confidential information.', policyRefs: ['CO-CP-004 §§5.5, 5.8', 'CO-HP-001'],
      }
    ],
  },
  {
    id: 1,
    shortName: 'Integrity',
    title: 'The Truthful Record',
    subtitle: 'Document what happened—not what someone hoped, assumed, or wants billed',
    overview: [
      'The field record supports continuity of care, clinical decisions, payment, quality review, and legal accountability. Enter the actual encounter: what you observed, what service you personally provided, the patient’s response, the real visit time, teaching, communication, and any variance required by your role. A planned or medically necessary service is not the same as a service actually rendered.',
      'Never pre-chart care, convert a canceled visit into a completed visit, document another person’s work, copy a prior note as though it were today’s assessment, round time to improve a record, or add facts solely to support payment. When a genuine error occurs, use the approved correction or late-entry process and preserve the audit trail.'
    ],
    details: [
      {
        heading: 'Actual care, actual time, actual author',
        paragraphs: [
          'A truthful entry answers who did what, for which patient, when, where, under what order or plan, what was observed, how the patient responded, and who was notified. The exact required fields vary by discipline and workflow, but the integrity rule does not: never attest to an event you did not perform or directly verify within your authorized role.',
          'Record the actual start and end evidence or approved time elements. Do not extend time because a visit was scheduled longer, productivity is being measured, or someone says the payer “expects” a certain duration. If a visit ends early, is interrupted, or cannot occur, follow the missed-visit or variance workflow and document the facts.'
        ]
      },
      {
        heading: 'Copy-forward is not observation',
        paragraphs: [
          'Templates and approved carry-forward tools may help structure a record, but every carried fact must be reviewed and updated for the current encounter. Repeating yesterday’s wound description, symptoms, teaching response, or vital signs without current verification creates a misleading record. Near-identical notes across visits can also hide a meaningful change in condition.',
          'Do not assume that a software-generated sentence is accurate. If an AI-assisted, templated, or prefilled entry is used in an approved system, the responsible worker must validate the content before authentication. A signature is not a clerical click; it accepts responsibility for the accuracy and completeness of that entry.'
        ]
      },
      {
        heading: 'Corrections preserve history',
        paragraphs: [
          'An honest error is not corrected by making the original disappear. Use the approved amendment, correction, or late-entry function so a reviewer can see what changed, when, by whom, and why. Never delete, backdate, silently overwrite, or ask another worker to sign. Do not use a correction process to create observations that were never made.',
          'If the error may have affected care, billing, a required report, or another clinician’s decision, notify the appropriate supervisor and Compliance or Revenue Cycle as directed. Correcting the clinical record and reporting a possible claim impact are related but distinct actions; completing one does not automatically complete the other.'
        ]
      },
      {
        heading: 'Pressure is itself important information',
        paragraphs: [
          'A request to “finish the note now and fill in details later,” change a timestamp, reuse a signature, conceal a missed visit, or make the documentation fit a planned claim is a compliance warning sign. Do not argue about which statute applies. Decline the false step, preserve the original request within authorized systems, and report the facts promptly.',
          'Preservation does not mean photographing PHI on a personal phone, forwarding records to personal email, or accessing charts unrelated to your duties. Preserve what is already within your authorized access and tell Compliance where the original resides. The investigation team can issue a hold or collect additional records lawfully.'
        ]
      },
      {
        heading: 'Separate error from concealment',
        paragraphs: [
          'Not every late, incomplete, or incorrect entry is fraud. People make mistakes, systems fail, and clinical information changes. Prompt transparent correction and reporting allow the agency to address the impact. Risk rises when someone knowingly conceals an error, repeats a false pattern, pressures others to participate, deliberately avoids confirming accuracy, or allows unsupported information to reach a claim.',
          'Use objective language. “The note showed a completed 60-minute visit; the patient canceled before arrival; I was asked to sign the completed template” is useful. “Everyone in scheduling is stealing” is an unsupported conclusion. Facts let reviewers determine whether the issue is a training gap, workflow defect, waste, abuse, fraud, or another type of noncompliance.'
        ]
      }
    ],
    keyPoints: [
      { icon: '📝', title: 'Chart actual care', detail: 'Record only the encounter, time, observations, and services that occurred.' },
      { icon: '↩️', title: 'Correct transparently', detail: 'Use the approved audit-trailed correction or late-entry process.' },
      { icon: '✍️', title: 'Protect your signature', detail: 'Authenticate only an entry you reviewed and can truthfully support.' },
      { icon: '📣', title: 'Escalate pressure', detail: 'Preserve and report requests to falsify, backdate, or conceal.' }
    ],
    clinicalTip: 'A blank field is a problem to resolve. A made-up answer is a new and more serious problem.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-CP-004 §5.2; CO-FA-002; CO-AI-101' },
      { kind: 'Federal law', text: '31 USC §3729(b)' },
      { kind: 'Federal guidance', text: 'HHS-OIG GCPG pp. 16–18' }
    ],
    sceneImage: img02,
    sceneAlt: 'Field worker completes a visit note on a tablet at a dining table while the patient rests safely nearby; a schedule, watch, medication organizer, and nursing bag are visible.',
    hotspots: [
      {
        id: 'tablet', label: 'Contemporaneous visit entry', shortLabel: 'Today’s Note', x: 56, y: 52, kind: 'expected',
        info: 'The worker is documenting immediately after the actual encounter.', meaning: 'Timely individualized notes support care continuity and accurate claim review.', action: 'Enter only current observations, services, patient response, and required communication.',
        notify: 'Clinical supervisor for care variance; Compliance for pressure to misstate facts.', document: 'Actual encounter facts in the approved system.', policyRefs: ['CO-CP-004 §5.2', 'CO-FA-002'],
      },
      {
        id: 'schedule', label: 'Visit schedule and time evidence', shortLabel: 'Actual Time', x: 42, y: 71, kind: 'guidance',
        info: 'The neutral schedule and watch can be compared with the encounter.', meaning: 'Planned time does not replace actual time; a canceled or shortened visit must not be charted as completed.', action: 'Use the approved time workflow and record the real visit status.',
        notify: 'Scheduling or clinical supervisor for variance; Compliance if asked to inflate or conceal.', document: 'Actual time or missed-visit facts and notifications.', policyRefs: ['CO-CP-004 §5.2', 'CO-FA-002 §4'],
      },
      {
        id: 'organizer', label: 'Current encounter evidence', shortLabel: 'Verify Facts', x: 58, y: 77, kind: 'expected',
        info: 'The medication organizer represents a fact that must be verified in the current visit.', meaning: 'A prior note or prefilled field cannot substitute for today’s observation.', action: 'Verify before documenting; mark unknown when the workflow permits and escalate missing information.',
        notify: 'Appropriate clinician when the information affects safe care.', document: 'What was actually observed, what could not be verified, and action taken.', policyRefs: ['CO-CP-004 §5.2', 'CO-AI-101 §4.2'],
      },
      {
        id: 'watch', label: 'Authentication accountability', shortLabel: 'Your Signature', x: 31, y: 82, mobileX: 24, mobileY: 88, kind: 'prohibited',
        info: 'The worker’s own credentials and signature tie the entry to its author.', meaning: 'Sharing credentials, signing for another person, or authenticating a record known to be inaccurate undermines the audit trail.', action: 'Protect credentials and refuse to sign information you cannot truthfully attest.',
        notify: 'Supervisor, Privacy or Security, or Compliance depending on the event.', document: 'Credential incident or false-attestation request through the approved process.', policyRefs: ['CO-CP-004 §§5.2, 5.5'],
      },
      {
        id: 'bag', label: 'Approved correction path', shortLabel: 'Audit Trail', x: 86, y: 72, kind: 'escalate',
        info: 'The agency bag represents controlled tools and approved workflows.', meaning: 'An error must be corrected without erasing the original or creating a false historical entry.', action: 'Use the approved amendment or late-entry function and preserve the original audit trail.',
        notify: 'Supervisor and Compliance or Revenue Cycle when the error may affect care or payment.', document: 'Correction reason, date, author, notifications, and claim-impact route as required.', policyRefs: ['CO-CP-004 §5.2', 'CO-CP-007 §6.2'],
      }
    ],
  },
  {
    id: 2,
    shortName: 'FWA',
    title: 'FWA and False-Claim Red Flags',
    subtitle: 'Recognize the signal, protect the record, and report the facts',
    overview: [
      'Fraud, waste, and abuse are related but not interchangeable. Fraud generally involves intentional deception or a knowingly and willfully executed scheme. Waste is unnecessary cost from overuse, misuse, poor management, or deficient practice. Abuse involves practices inconsistent with sound fiscal, business, or medical practice that may cause improper payment, unnecessary cost, medically unnecessary service, or substandard care.',
      'A field worker does not make the legal classification. The practical job is to notice high-risk mismatches—services not rendered, duplicate entries, unsupported or copied documentation, falsified time or signatures, care outside an order, referral-linked benefits, excluded-person concerns, or suspected improper payment—and report the authorized facts promptly.'
    ],
    details: [
      {
        heading: 'The civil False Claims Act knowledge standard',
        paragraphs: [
          'Federal law can treat a claim as knowingly false when a person has actual knowledge, acts in deliberate ignorance, or acts in reckless disregard of truth or falsity; proof of a specific intent to defraud is not required for that civil knowledge standard. This does not mean every mistake is a False Claims Act case. It means an organization cannot safely avoid facts that call claim accuracy into question.',
          'Common health-care examples identified by HHS-OIG include a service not actually rendered, a service already represented by another claim, upcoding, or a claim unsupported by the medical record. Home-health examples include a canceled visit shown as complete, invented observations, a copied note presented as current, a service outside the plan, or a signature or time entry that does not reflect the actual encounter.'
        ]
      },
      {
        heading: 'Services actually rendered',
        paragraphs: [
          'A plan of care may authorize a visit, and the patient may clinically need it, but payment support still depends on what actually happened. If the patient canceled, was unavailable, refused, or the worker left early, do not create a completed-service record. Follow the missed-visit, refusal, safety, and physician or supervisor notification workflows that apply to the facts.',
          'If you see another visit displayed as completed and the patient says it did not occur, do not edit the other worker’s record or confront the person in the home. Record the patient statement only where your clinical workflow requires and permits it, preserve the source already available to you, and report the discrepancy for authorized review.'
        ]
      },
      {
        heading: 'Medical necessity and the plan of care',
        paragraphs: [
          'Field workers do not make billing determinations, but they must not invent medical necessity or deliver extra service solely to affect payment. Provide ordered, clinically appropriate, in-scope care. If the current condition suggests the plan needs review, contact the appropriate clinician rather than changing frequency, duration, diagnosis, or service on your own.',
          'Pressure to make the note support a more intensive service, a longer visit, a different diagnosis, or a favorable payment classification is a red flag. Keep clinical judgment and documentation centered on the patient’s actual condition. Preserve and report any instruction to select information because it improves reimbursement rather than because it is accurate.'
        ]
      },
      {
        heading: 'Error, pattern, and concealment',
        paragraphs: [
          'A single duplicate generated by a system or an honest missed field may be an error. Correct it promptly through the approved workflow. Repeated identical entries, deliberate avoidance of verification, concealment, or instructions to “make it match” raise the level of concern. You still report the facts rather than deciding whether the pattern is criminal, civil, administrative, or simply operational.',
          'Waste can matter even without intent. Unneeded supplies, repeated scheduling failures, avoidable duplicate work, or services outside an evidence-based plan may consume resources and increase cost. Report significant or recurring waste through the appropriate operational or compliance channel so the agency can assess cause and corrective action.'
        ]
      },
      {
        heading: 'Suspected overpayments',
        paragraphs: [
          'A notice or payment mismatch may suggest that Medicare or another payer paid more than the agency was entitled to receive. Field workers should promptly preserve and route the facts to Compliance or Revenue Cycle. Do not calculate a refund, call the payer on behalf of the agency, decide when an overpayment has been legally identified, or apply a federal deadline yourself.',
          'Current 42 CFR §401.305 states that a person has identified an overpayment when the person knowingly receives or retains it and includes specific reporting, return, and investigation-related provisions. Those rules belong to authorized agency reviewers. Your prompt escalation gives them time to investigate in good faith and take required action.'
        ]
      },
      {
        heading: 'Safety routes remain active',
        paragraphs: [
          'A compliance report does not replace patient-safety action. If a patient is in immediate danger, use emergency procedures. Suspected abuse, neglect, or exploitation follows the applicable mandated reporting and agency route. A privacy breach follows the privacy or security incident path. A change in condition follows clinical escalation. The same facts may require more than one route.',
          'Use SEE → SAFE → SAVE → SAY → SUPPORT: observe the mismatch; protect the patient and truthful record; preserve what you are authorized to access; report promptly; and cooperate without investigating independently. This is the field-worker contribution to fraud, waste, and abuse prevention.'
        ]
      }
    ],
    keyPoints: [
      { icon: '🔎', title: 'Notice the mismatch', detail: 'Compare the actual encounter, order, record, and available facts.' },
      { icon: '🛡️', title: 'Protect the patient', detail: 'Use the correct clinical, emergency, privacy, or abuse route too.' },
      { icon: '💾', title: 'Preserve evidence', detail: 'Keep originals within authorized systems; do not alter or over-collect.' },
      { icon: '📣', title: 'Report—do not diagnose', detail: 'Share facts promptly; authorized reviewers classify the issue.' }
    ],
    clinicalTip: 'Describe “what I saw and heard,” not “who is guilty.” A factual report is more useful than a legal label.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-FW-101; CO-FA-002; CO-CP-004' },
      { kind: 'Federal law', text: '31 USC §§3729–3730; 42 CFR §401.305' },
      { kind: 'Federal guidance', text: 'HHS-OIG GCPG pp. 16–19' }
    ],
    sceneImage: img03,
    sceneAlt: 'Field worker reconciles a tablet and notebook with a wall clock, blank supply packages, blood-pressure equipment, and the actual home-visit setting.',
    hotspots: [
      {
        id: 'clock', label: 'Actual visit timing', shortLabel: 'Visit Time', x: 86, y: 15, kind: 'escalate',
        info: 'The wall clock represents the time and presence evidence surrounding the visit.', meaning: 'A scheduled duration or queued claim cannot turn an absent, canceled, or shortened encounter into a completed service.', action: 'Record the actual status and use the approved missed-visit or variance workflow.',
        notify: 'Supervisor and Compliance when a completed record or claim conflicts with the facts.', document: 'Actual time or status, patient statement when appropriate, and notifications.', policyRefs: ['CO-CP-004 §5.2', 'CO-FA-002'],
      },
      {
        id: 'tablet', label: 'Claim-supporting visit record', shortLabel: 'Record Match', x: 49, y: 57, kind: 'guidance',
        info: 'The approved tablet can be compared with the service actually delivered.', meaning: 'Unsupported, duplicate, copied, or inaccurate information may create payment and patient-safety risk.', action: 'Do not change another author’s entry; preserve the source and report the mismatch.',
        notify: 'Compliance or the approved FWA route; clinical supervisor if care is affected.', document: 'What the approved view showed and the contradictory fact you directly learned.', policyRefs: ['CO-FW-101 §4', '31 USC §3729(b)'],
      },
      {
        id: 'notebook', label: 'Observed facts and individualized findings', shortLabel: 'Actual Facts', x: 38, y: 75, kind: 'expected',
        info: 'The notebook represents contemporaneous facts from this encounter, not copied conclusions.', meaning: 'Individualized documentation is the basis for care and truthful claim support.', action: 'Record what you personally observed or did; separate patient statements from your observations.',
        notify: 'Appropriate clinician for significant findings; Compliance for integrity pressure.', document: 'Who, what, when, where, care provided, response, and escalation.', policyRefs: ['CO-CP-004 §5.2', 'CO-FA-002'],
      },
      {
        id: 'equipment', label: 'Service actually delivered', shortLabel: 'Rendered Care', x: 56, y: 83, kind: 'expected',
        info: 'The blood-pressure equipment represents a service that can be supported by actual use and findings.', meaning: 'Medical necessity and an order do not support billing for care that was not delivered.', action: 'Document the service and response only when they occurred; follow the variance route otherwise.',
        notify: 'Clinical supervisor for omitted or changed care; Compliance for a false completion request.', document: 'Actual service, findings, response, and reason for any variance.', policyRefs: ['CO-FW-101 §4.1', 'OIG GCPG pp. 16–18'],
      },
      {
        id: 'supplies', label: 'Supply use and waste signal', shortLabel: 'Supply Use', x: 83, y: 80, kind: 'escalate',
        info: 'Plain excess supplies are separated from what was needed for the visit.', meaning: 'Repeated unnecessary ordering, unexplained loss, or unused excess may signal waste or a control problem; it is not automatically fraud.', action: 'Follow inventory rules and report a significant or recurring mismatch without removing records or accusing anyone.',
        notify: 'Supervisor, supply coordinator, or Compliance according to the pattern and policy.', document: 'Item, amount, location, observed mismatch, and action taken.', policyRefs: ['CO-FW-101 §4.2', 'CO-CP-004 §5.8'],
      }
    ],
  },
  {
    id: 3,
    shortName: 'Referrals',
    title: 'Referrals, Gifts and Conflicts',
    subtitle: 'Patient choice and clinical judgment are never for sale',
    overview: [
      'A conflict of interest can be actual, potential, or reasonably perceived. Personal relationships, outside work, investments, gifts, favors, vendor benefits, or referral arrangements can influence—or appear to influence—patient choice and business judgment. Disclose the connection and let authorized reviewers determine the response.',
      'Never offer, request, accept, or pass along anything of value in exchange for a referral, order, patient selection, or federal health care program business. Anything of value can include cash, gift cards, meals, free services, waived costs, favors, opportunities, or benefits to another person. Amount alone does not answer the legal question.'
    ],
    details: [
      {
        heading: 'Referral-linked value is the warning sign',
        paragraphs: [
          'The federal Anti-Kickback Statute is an intent-based criminal law concerning remuneration connected to referrals or other federal health care program business. Safe harbors contain technical conditions, and arrangements outside a safe harbor are evaluated on their facts and circumstances; they are not automatically lawful or unlawful based on one fact. Field workers should never attempt that analysis.',
          'Use a simpler rule: if a benefit is offered, requested, or received because of a referral, order, recommendation, or patient choice, decline participation and promptly escalate. Changing cash to a meal, a gift card to a “thank you,” or a payment to a family benefit does not remove the concern.'
        ]
      },
      {
        heading: 'Patient freedom of choice',
        paragraphs: [
          'Patients and representatives should receive truthful, noncoercive information and remain free to choose among available providers and services as applicable. Do not steer a patient because you, a relative, a physician, a facility, a vendor, or the agency receives a benefit. Do not disparage another provider or imply that care depends on selecting a favored source.',
          'If a patient asks for a recommendation, follow the agency’s approved choice and referral-information process. Disclose any known relationship that could affect impartiality. A patient’s consent to a recommendation does not legalize a financial arrangement behind it.'
        ]
      },
      {
        heading: 'Stark awareness without legal interpretation',
        paragraphs: [
          'The Physician Self-Referral Law, often called Stark, applies to certain physician referrals for designated health services, including home health services, when a financial relationship exists unless an exception is satisfied. It is separate from the Anti-Kickback Statute and uses different rules. Field workers are not responsible for deciding whether an exception applies.',
          'A useful warning sign is a physician, physician family member, or related entity appearing to have a financial interest connected to a referral or service. Preserve the information already available to you and report it. Do not question the patient about private finances, search contracts, or accuse the physician.'
        ]
      },
      {
        heading: 'Patient and family gifts',
        paragraphs: [
          'Gratitude at the end of a visit can be sincere and unrelated to referrals, yet gifts still require professional boundaries and current agency policy. If a patient or family offers money, a gift card, a valuable item, or repeated benefits, graciously pause or decline and ask the supervisor or Compliance before accepting. Never solicit a gift or allow a gift to change care.',
          'Do not use a dollar threshold to decide independently whether a gift is acceptable. Apply the current controlled gift policy and ask before acceptance. No internal threshold is a federal safe harbor, and no policy ever permits a quid pro quo, patient steering, exploitation, or referral-linked payment.'
        ]
      },
      {
        heading: 'Disclosure and documentation',
        paragraphs: [
          'Disclose outside employment, ownership, vendor relationships, family connections, or other interests that could affect agency work. Disclosure does not itself mean wrongdoing; it allows the agency to manage the conflict through recusal, reassignment, review, or another control.',
          'When reporting an offer, record the date, people involved, what was offered, the exact condition or words if remembered, how you responded, and where the original message or item remains. Do not keep the item as “evidence” unless directed. Do not photograph confidential documents or move property without authority.'
        ]
      }
    ],
    keyPoints: [
      { icon: '🧭', title: 'Protect choice', detail: 'Use truthful approved information; never steer for personal benefit.' },
      { icon: '✋', title: 'Decline quid pro quo', detail: 'Anything of value tied to referrals or orders is a red flag.' },
      { icon: '🔍', title: 'Disclose conflicts', detail: 'Report interests that could influence or appear to influence judgment.' },
      { icon: '📣', title: 'Escalate arrangements', detail: 'Do not interpret AKS safe harbors or Stark exceptions yourself.' }
    ],
    clinicalTip: 'A small dollar amount does not make a referral-linked benefit safe. Pause, decline participation, preserve the offer, and ask.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-FA-001; CO-CP-004 §§5.3–5.4' },
      { kind: 'Federal law', text: '42 USC §1320a-7b(b); §1395nn' },
      { kind: 'Federal guidance', text: 'OIG GCPG pp. 9–16' }
    ],
    sceneImage: img04,
    sceneAlt: 'At a home entry, a field worker respectfully declines a gift envelope from a family caregiver; a gift basket, blank referral materials, phone, and nursing bag are nearby.',
    hotspots: [
      {
        id: 'decline', label: 'Professional decline', shortLabel: 'Pause / Decline', x: 31, y: 37, kind: 'expected',
        info: 'The field worker uses a respectful open-palm gesture and does not take the envelope.', meaning: 'Pausing protects professional boundaries while the context and current policy are reviewed.', action: 'Thank the person, decline or hold acceptance, and explain that agency policy must be checked.',
        notify: 'Supervisor or Compliance, especially for cash, gift cards, valuable or repeated gifts, or any condition.', document: 'Offer, response, and direction received when required.', policyRefs: ['CO-CP-004 §5.4', 'CO-FA-001'],
      },
      {
        id: 'envelope', label: 'Offered item of value', shortLabel: 'Gift Offer', x: 50, y: 35, kind: 'escalate',
        info: 'A sealed envelope is being offered directly to the field worker.', meaning: 'Cash, a gift card, or another item may create a boundary or inducement concern; context matters.', action: 'Do not open or accept it to “see the value.” Decline and route the facts for review.',
        notify: 'Compliance immediately if linked to a referral, order, patient choice, or business.', document: 'Who offered it, words used, condition, date, and disposition.', policyRefs: ['CO-CP-004 §5.4', '42 USC §1320a-7b(b)'],
      },
      {
        id: 'basket', label: 'Gift basket and repeated benefits', shortLabel: 'Gift Pattern', x: 73, y: 77, mobileY: 65, kind: 'guidance',
        info: 'A visible gift basket may be ordinary gratitude or part of a repeated pattern.', meaning: 'Value, frequency, vulnerability, timing, and connection to care or referrals all matter; an internal threshold is not a federal safe harbor.', action: 'Do not estimate legality from price. Follow the current gift policy and ask before acceptance.',
        notify: 'Supervisor or Compliance for valuable, repeated, solicited, or conditional gifts.', document: 'Item and context without photographing the patient or home unnecessarily.', policyRefs: ['CO-CP-004 §5.4', 'OIG GCPG pp. 19–21'],
      },
      {
        id: 'referral', label: 'Referral material and patient choice', shortLabel: 'Patient Choice', x: 64, y: 87, kind: 'expected',
        info: 'Blank referral materials represent information that may influence patient selection.', meaning: 'Information must be truthful, approved, and free from personal or financial steering.', action: 'Use the approved choice process and disclose any relationship that could affect impartiality.',
        notify: 'Compliance for pressure, financial relationships, or a per-patient benefit.', document: 'The request, relationship, information provided, and escalation.', policyRefs: ['CO-FA-001', 'CO-CP-004 §5.3'],
      },
      {
        id: 'phone', label: 'Referral-linked message', shortLabel: 'Preserve Offer', x: 83, y: 87, kind: 'prohibited',
        info: 'The phone represents an original text, email, or call offering value for business.', meaning: 'A small or noncash benefit can still be a serious referral-integrity red flag.', action: 'Decline participation, preserve the original in the authorized system, and report it; do not negotiate another form of benefit.',
        notify: 'Compliance through the current approved route.', document: 'Exact offer, sender, date, condition, response, and source location.', policyRefs: ['42 USC §1320a-7b(b)', 'CO-FA-001'],
      }
    ],
  },
  {
    id: 4,
    shortName: 'Speak Up',
    title: 'Good-Faith Reporting and Non-Retaliation',
    subtitle: 'Use a safe channel, report facts, and recognize retaliation early',
    overview: [
      'Good-faith reporting means raising a concern sincerely, based on the reasonable information available to you at the time. The report does not have to be proven correct for Care Indeed’s non-retaliation policy to apply. A knowingly false or malicious accusation intended to harm someone is different from an honest report that an investigation ultimately does not substantiate.',
      'Use any current approved channel that fits the concern. You do not need permission from the supervisor, and you should bypass anyone who may be involved. Lesson 5 displays any verified channels supplied by the host. Otherwise, use the current agency directory or the reporting controls supplied by the host LMS.'
    ],
    details: [
      {
        heading: 'Choose a channel that can act',
        paragraphs: [
          'A supervisor may be an appropriate route for an ordinary question when that person is not involved. Compliance is appropriate for suspected FWA, false documentation, referral or exclusion concerns, retaliation, leadership interference, or uncertainty about another route. HR handles employment grievances and harassment through its policies, while privacy, safety, abuse, and clinical events retain their specialized reporting paths.',
          'If the supervisor, Compliance Officer, or senior leader appears involved, use the independent or bypass route published in the current agency directory. Do not send a compliance narrative to a group chat, social media, a patient, or an unauthorized personal account. Broad sharing can expose PHI, harm fairness, and interfere with review.'
        ]
      },
      {
        heading: 'Anonymous and confidential are not the same',
        paragraphs: [
          'Anonymous means the reporting mechanism does not require you to identify yourself, though surrounding facts may still reveal identity. Confidential means information is limited to people who need it for review and response. The agency should protect privacy to the extent feasible, but no one should promise absolute secrecy. Identity may become known or need disclosure for patient safety, due process, legal obligations, or a fair investigation.',
          'Share only the minimum necessary factual information through an authorized channel. Do not store your report on a personal device or keep PHI in private notes. If you report anonymously, save the reference method offered by the system so you can receive questions or status information without revealing identity where the process supports it.'
        ]
      },
      {
        heading: 'Build a useful factual report',
        paragraphs: [
          'State who, what, when, and where; what you personally saw, heard, received, or did; the exact words used when important; any immediate patient-safety action; where the original record or message resides; and which channel you used. Distinguish direct observation, patient statement, and inference. Include dates and identifiers only as permitted in the secure reporting system.',
          'Avoid legal conclusions, diagnoses of motive, speculation about coworkers, and unrelated history. Do not delay while collecting proof outside your role. A concise timely report can be expanded by authorized investigators. If new information arises, add it through the same approved channel rather than coordinating accounts with others.'
        ]
      },
      {
        heading: 'Recognize possible retaliation',
        paragraphs: [
          'Care Indeed policy prohibits retaliation for a good-faith report. Warning signs can include threats, intimidation, harassment, reduced hours, undesirable reassignment, isolation, unfair scrutiny, a report-influenced performance action, or pressure to withdraw or change a report. A legitimate management action supported by independent facts is not automatically retaliation, but the connection must be reviewed fairly.',
          'Retaliation is a separate concern. Report it promptly even if the original matter remains under review or is not substantiated. Preserve the schedule, message, performance document, or statement already available to you. Do not secretly record when law or policy does not authorize it, and do not publish the issue online.'
        ]
      },
      {
        heading: 'Agency protection and legal protections',
        paragraphs: [
          'The agency good-faith standard is the everyday operational rule. Separate laws may also protect particular disclosures or lawful acts. The False Claims Act contains an anti-retaliation provision for specified efforts connected to violations of that statute, and California Labor Code §1102.5 protects specified disclosures or refusals when its conditions are met. These laws are not identical, and this training does not promise legal coverage for every situation.',
          'You do not need to determine which statute applies before using the agency channel. Report the facts and any adverse action. You may also have rights to contact government or law-enforcement agencies; agency policy cannot require you to waive lawful external reporting. For personal legal advice, use your own counsel or an appropriate government resource rather than expecting the compliance investigator to represent you.'
        ]
      },
      {
        heading: 'Follow-up without self-investigation',
        paragraphs: [
          'Keep your contact information current if you identified yourself and respond honestly to authorized follow-up. Do not promise the subject, patient, or reporter a result. Personnel discipline, legal advice, and confidential investigative details may not be disclosed to you. Limited feedback does not mean the report was ignored.',
          'If a patient remains at risk, information changes, or retaliation continues, report the new facts promptly and use any required clinical or emergency path. Good-faith reporting is an active safety behavior, not a one-time form that prevents further escalation.'
        ]
      }
    ],
    keyPoints: [
      { icon: '🧾', title: 'Report facts', detail: 'Separate direct observation, statements, and inference.' },
      { icon: '🔒', title: 'Use a safe channel', detail: 'Choose the current approved route; bypass implicated leaders.' },
      { icon: '🕊️', title: 'Expect non-retaliation', detail: 'Good-faith protection does not depend on substantiation.' },
      { icon: '🚩', title: 'Report retaliation', detail: 'Preserve objective adverse changes and report them separately.' }
    ],
    clinicalTip: 'Anonymous does not mean guaranteed secrecy. Use the secure route, share minimum necessary facts, and never promise an outcome or absolute confidentiality.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-CP-005; CO-CP-006; HR-ER-003/004' },
      { kind: 'Federal law', text: '31 USC §3730(h)' },
      { kind: 'California law', text: 'Labor Code §1102.5' }
    ],
    sceneImage: img05,
    sceneAlt: 'Field worker makes a private phone report at a laptop in a closed office; a lock symbol, headphones, and closed notebook reinforce confidential handling.',
    hotspots: [
      {
        id: 'phone', label: 'Current approved reporting channel', shortLabel: 'Report Route', x: 66, y: 29, kind: 'escalate',
        info: 'The worker is using an agency-approved phone route in a private setting.', meaning: 'Workers may contact Compliance or an independent channel without supervisor permission.', action: 'Use the current directory or host-provided reporting control; do not use an unverified contact.',
        notify: 'Compliance Officer or published independent or bypass route based on the concern.', document: 'Date, channel, concise topic, and confirmation or reference if provided.', policyRefs: ['CO-CP-006', 'OIG GCPG pp. 49–50'],
      },
      {
        id: 'laptop', label: 'Secure factual report', shortLabel: 'Minimum Facts', x: 55, y: 64, kind: 'expected',
        info: 'The laptop represents an authorized system for a concise factual report.', meaning: 'A useful report separates observation from inference and protects confidential information.', action: 'Provide who, what, when, where, immediate action, source location, and the exact concern without broad sharing.',
        notify: 'Use the channel selected for the event; add specialized safety or privacy routes when required.', document: 'Facts in the authorized report, not a personal duplicate.', policyRefs: ['CO-CP-006', 'CO-HP-001'],
      },
      {
        id: 'door', label: 'Private reporting setting', shortLabel: 'Privacy', x: 12, y: 37, kind: 'guidance',
        info: 'The closed frosted door reduces casual disclosure during the report.', meaning: 'Compliance information and PHI should be limited to authorized people who need it.', action: 'Move to a private location and use an approved device; never report in front of a patient or uninvolved staff.',
        notify: 'Privacy or Security contact if information was exposed.', document: 'Any separate privacy incident through the proper route.', policyRefs: ['CO-CP-006', 'CO-HP-001'],
      },
      {
        id: 'lock', label: 'Anonymity and confidentiality limits', shortLabel: 'Know Limits', x: 8, y: 77, kind: 'guidance',
        info: 'The lock symbol represents privacy protections, not a promise of absolute secrecy.', meaning: 'Anonymous and confidential are different; identity may become known or require disclosure in some circumstances.', action: 'Use the secure channel and ask how follow-up works; share minimum necessary facts.',
        notify: 'Compliance if confidentiality or reporter protection appears compromised.', document: 'Objective disclosure or adverse event; never retain PHI privately.', policyRefs: ['CO-CP-005', 'OIG GCPG pp. 66–67'],
      },
      {
        id: 'notebook', label: 'Possible retaliation record', shortLabel: 'Retaliation', x: 78, y: 86, kind: 'prohibited',
        info: 'The closed notebook represents objective schedule, message, or action already available to the worker.', meaning: 'Threats, reduced shifts, reassignment, intimidation, or report-linked scrutiny may be a separate retaliation concern.', action: 'Preserve the original authorized evidence and report the adverse change promptly; do not post or secretly investigate.',
        notify: 'Compliance or the published bypass route; HR when the current policy directs.', document: 'Date, exact words or action, schedule or assignment change, witnesses, and report connection.', policyRefs: ['CO-CP-005', '31 USC §3730(h)', 'CA Labor Code §1102.5'],
      }
    ],
  },
  {
    id: 5,
    shortName: 'Response',
    title: 'After a Report: Fair Review and Corrective Action',
    subtitle: 'Cooperate truthfully, preserve originals, and let authorized reviewers investigate',
    overview: [
      'A report begins a fair fact-finding process; it does not prove misconduct. Compliance may triage immediate safety, preserve records, identify conflicts, interview witnesses, coordinate with clinical leadership, HR, Revenue Cycle, counsel, or the Governing Body, and determine whether corrective action is needed. Workforce members should cooperate honestly and avoid conduct that could distort the review.',
      'Do not conduct your own investigation, confront the subject, search unrelated records, coordinate stories, delete or rewrite evidence, or promise confidentiality or an outcome. Continue safe assigned work unless authorized leadership directs otherwise. If patient care or another required report is urgent, use that route immediately while Compliance review proceeds.'
    ],
    details: [
      {
        heading: 'Preserve, do not collect beyond authority',
        paragraphs: [
          'Keep original messages, records, schedules, or documents in their authorized location. Do not forward PHI to a personal account, screenshot unrelated charts, take home files, or ask coworkers for restricted information. Tell the investigator what exists and where. Authorized staff can issue a record hold, make a defensible copy, and maintain chain of custody.',
          'If you discover an error in your own entry, do not wait for an investigator to “fix it.” Follow the approved correction process, preserve the audit trail, and disclose the issue. Never change a record because you think it will make the investigation easier or the outcome better.'
        ]
      },
      {
        heading: 'Interview cooperation',
        paragraphs: [
          'Answer what you know, say when you do not remember, distinguish direct observation from what someone told you, and correct yourself if you realize an earlier statement was inaccurate. Do not guess, minimize, exaggerate, or use group language such as “we all knew” unless you can identify the basis.',
          'Maintain appropriate privacy after an interview. Do not compare questions with coworkers or tell the subject what others said. You may be instructed not to discuss confidential details, but lawful reporting rights remain governed by applicable policy and law. Ask the investigator to clarify any instruction you do not understand.'
        ]
      },
      {
        heading: 'Corrective action is broader than discipline',
        paragraphs: [
          'A review may find no violation, an isolated error, a training need, a broken workflow, inadequate supervision, a control weakness, waste, abuse, fraud, or another policy issue. Corrective action can include record correction, claim hold or refund work, patient protection, retraining, process redesign, added monitoring, policy revision, vendor action, or discipline supported by findings.',
          'Discipline should follow facts and agency policy, not rumor or the identity of the reporter. A reporter is not entitled to confidential personnel details. Limited outcome information protects privacy and fairness; it does not mean the agency did nothing.'
        ]
      },
      {
        heading: 'Exclusion and sanction awareness',
        paragraphs: [
          'HHS-OIG excludes some individuals and entities from federal health care programs, and federal program payment generally cannot be made for items or services furnished, ordered, or prescribed by an excluded party. Care Indeed assigns screening and verification to authorized HR and Compliance personnel. A field worker should not search personnel files or decide whether a name match is valid.',
          'If a coworker, contractor, vendor, or referral source says they may be excluded, or you receive credible information suggesting an exclusion or sanction, report it promptly and preserve the statement. Authorized staff will verify identity and status and determine any work restriction, payment review, disclosure, or employment action. Avoid confronting the person in front of a patient.'
        ]
      },
      {
        heading: 'Overpayment escalation belongs to a team',
        paragraphs: [
          'A claim or remittance concern may require Compliance, Revenue Cycle, clinical review, and counsel to determine whether an overpayment exists, when it was identified under current rules, how much is affected, and which reporting or return method applies. A field worker supplies the encounter facts and source location; the worker does not contact the payer or promise a refund.',
          'Current 42 CFR §401.305 includes a knowing-receipt-or-retention standard and investigation-related provisions. Authorized agency reviewers apply those requirements. Field workers promptly escalate the facts rather than calculating a legal identification date, repayment deadline, amount, or return method.'
        ]
      },
      {
        heading: 'Support the fix',
        paragraphs: [
          'If assigned retraining, a revised workflow, monitoring, or a corrective action step, complete it honestly and ask questions. Corrective action should address root cause, stop ongoing harm, and reduce recurrence. It is not permission to create retrospective facts or replace the original record.',
          'Report any attempt to interfere with the review, destroy evidence, pressure testimony, retaliate, or continue the disputed practice. Cooperation continues until the authorized team closes the issue, and new patient-safety facts always receive immediate escalation.'
        ]
      }
    ],
    keyPoints: [
      { icon: '🤝', title: 'Cooperate truthfully', detail: 'Answer what you know; separate memory, observation, and hearsay.' },
      { icon: '📦', title: 'Preserve originals', detail: 'Keep authorized evidence intact; do not over-collect or alter.' },
      { icon: '🧩', title: 'Support correction', detail: 'Retraining, redesign, monitoring, refund, and discipline may differ.' },
      { icon: '🚩', title: 'Report interference', detail: 'Escalate destruction, pressure, retaliation, or ongoing harm.' }
    ],
    clinicalTip: 'An investigation asks for facts, not loyalty. Tell the truth, preserve the original, protect privacy, and do not coordinate stories.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-CP-007; HR-ER-002; HR-TA-003' },
      { kind: 'Federal', text: 'HHS-OIG Exclusions Program' },
      { kind: 'Federal rule', text: '42 CFR §401.305' }
    ],
    sceneImage: img06,
    sceneAlt: 'Field worker and compliance officer review a laptop and paper records at a conference table with a sealed evidence envelope, checklist, calendar, folder, calculator, and badge.',
    hotspots: [
      {
        id: 'laptop', label: 'Authorized fact review', shortLabel: 'Fact Review', x: 50, y: 54, kind: 'guidance',
        info: 'Compliance and the worker review information in an authorized system.', meaning: 'A report starts fact-finding; it is not proof of guilt or a reason to alter the source.', action: 'Answer honestly, identify what you directly know, and correct uncertainty without guessing.',
        notify: 'Investigator promptly if you remember or discover material new facts.', document: 'Authorized interview or supplemental statement as directed.', policyRefs: ['CO-CP-007', 'OIG GCPG pp. 59–62'],
      },
      {
        id: 'envelope', label: 'Preserved original evidence', shortLabel: 'Preserve', x: 19, y: 88, mobileX: 32, mobileY: 84, kind: 'expected',
        info: 'A sealed evidence envelope represents an original preserved through an authorized process.', meaning: 'Integrity depends on keeping records intact and traceable.', action: 'Leave originals in authorized systems or custody; tell the investigator where they are.',
        notify: 'Compliance if evidence may be altered, deleted, or lost.', document: 'Source location and any authorized transfer or hold.', policyRefs: ['CO-CP-007 §6.2', 'CO-HP-007'],
      },
      {
        id: 'checklist', label: 'Fair investigation steps', shortLabel: 'Fair Process', x: 18, y: 75, mobileX: 18, mobileY: 65, kind: 'guidance',
        info: 'The blank checklist represents structured triage, conflicts review, interviews, and findings.', meaning: 'Consistent steps protect the reporter, subject, patient, and agency.', action: 'Cooperate; do not confront, coordinate stories, or promise a result.',
        notify: 'Compliance or bypass route for conflict, interference, or retaliation.', document: 'Any new fact or concern through the case channel.', policyRefs: ['CO-CP-007', 'CO-CP-005'],
      },
      {
        id: 'calendar', label: 'Prompt agency response', shortLabel: 'Timely Action', x: 51, y: 81, kind: 'escalate',
        info: 'The calendar represents timely triage, patient protection, and regulatory or payer analysis.', meaning: 'Deadlines vary by issue and must be determined by authorized reviewers using current rules.', action: 'Report promptly and supply dates; do not calculate or promise an external deadline.',
        notify: 'Compliance or Revenue Cycle for suspected payment; clinical leadership for patient risk.', document: 'Date received, date observed, source, and escalation time.', policyRefs: ['42 CFR §401.305', 'CO-FA-002'],
      },
      {
        id: 'folder', label: 'Exclusion and corrective-action file', shortLabel: 'Authorized Team', x: 88, y: 75, kind: 'prohibited',
        info: 'The closed folder and badge represent restricted personnel, screening, and corrective records.', meaning: 'HR and Compliance—not field workers—verify exclusion matches, determine restrictions, and apply discipline based on findings.', action: 'Report credible information without searching restricted files or announcing a conclusion.',
        notify: 'Compliance or HR promptly; use emergency or clinical supervision if immediate coverage is affected.', document: 'Statement or source you received, date, and report route.', policyRefs: ['HR-TA-003', 'OIG Exclusions Program'],
      }
    ],
  },
  {
    id: 6,
    shortName: 'Challenge',
    title: 'Field Compliance Challenge and Attestation',
    subtitle: 'Integrate truthful care, referral integrity, reporting, and non-retaliation',
    overview: [
      'A real compliance concern rarely arrives with a label. You may see a schedule mismatch, a prefilled note, excess supplies, a referral-linked benefit, and pressure from a supervisor in the same day. Use one dependable response: SEE the facts, SAFE the patient and record, SAVE authorized originals, SAY the concern through a current approved route, and SUPPORT fair review.',
      'Completion of this module confirms training participation and the Knowledge Check result only. It does not determine legal liability, certify that no concern exists, validate clinical competency, expand scope, create a signature or personnel-file artifact, or authorize independent practice. Use the current agency acknowledgment workflow outside this player when an attestation is required.'
    ],
    details: [
      {
        heading: 'Capstone: the mismatched visit',
        paragraphs: [
          'You arrive for an ordered visit. The patient is safe with a caregiver but says the previous visit was canceled. Your approved tablet shows the prior visit as completed. A supervisor messages, “Use the prior note so billing stays on time.” On the counter is a small envelope from a referral contact who earlier promised a gift for each family sent to the agency.',
          'First protect today’s patient. Provide only today’s ordered, in-scope, clinically appropriate care. Do not change the prior author’s record, copy the old note, accept the envelope, or investigate coworkers. Document today’s actual encounter and any patient statement only as permitted by the clinical workflow.'
        ]
      },
      {
        heading: 'Apply SEE → SAFE → SAVE',
        paragraphs: [
          'SEE the separate facts: prior service discrepancy, false-documentation pressure, referral-linked value, and any threat connected to reporting. SAFE the patient and truthful record: refuse the false entry and do not let the conflict interrupt necessary safe care. Use the clinical supervisor route if the patient’s plan or condition needs direction.',
          'SAVE the original supervisor message, approved visit view, and referral offer within their authorized locations. Do not forward PHI, take personal screenshots, open the envelope, edit another entry, or search unrelated charts. Note where the originals reside so Compliance can preserve them.'
        ]
      },
      {
        heading: 'Apply SAY → SUPPORT',
        paragraphs: [
          'SAY the concern promptly through the current independent reporting route because the supervisor may be involved. Separate observations: what the patient said, what the system showed, what the supervisor requested, and what the referral contact offered. If shifts or assignments change after the report, submit the new facts as a separate possible-retaliation concern.',
          'SUPPORT the review by answering honestly and maintaining appropriate privacy. Do not contact the coworker, referral source, patient, or payer to build a case. Continue authorized work unless directed otherwise and report any new patient risk, evidence destruction, pressure, or retaliation.'
        ]
      },
      {
        heading: 'Annual attestation meaning',
        paragraphs: [
          'The agency may require a separate acknowledgment that you received and understand its current Corporate Compliance Program and Code of Conduct. An acknowledgment is not a promise that you will never make a mistake. It is a commitment to follow the standards, ask questions, report concerns, cooperate, and correct errors transparently.',
          'Do not sign an acknowledgment you were not allowed to review or do not understand. Ask for clarification. The controlled acknowledgment process—not this standalone module—determines the official signature, date, retention, and personnel-file workflow.'
        ]
      },
      {
        heading: 'Your durable practice',
        paragraphs: [
          'Compliance succeeds when ordinary work remains truthful under pressure. Document what occurred. Protect patient choice. Decline referral-linked value. Use secure reporting. Expect non-retaliation. Preserve originals. Let qualified reviewers interpret law and determine corrective action.',
          'When uncertain, use this closing sentence: “I will protect the patient, not create or sign information I cannot support, preserve the authorized source, and contact the appropriate supervisor or Compliance route now.” That response keeps you useful without exceeding your role.'
        ]
      }
    ],
    keyPoints: [
      { icon: '👁️', title: 'SEE', detail: 'Name the mismatch, pressure, benefit, pattern, or adverse action.' },
      { icon: '🛡️', title: 'SAFE', detail: 'Protect the patient and refuse a false or unsafe act.' },
      { icon: '💾', title: 'SAVE', detail: 'Preserve originals within authorized access; never alter.' },
      { icon: '📣', title: 'SAY + SUPPORT', detail: 'Report promptly, cooperate truthfully, and avoid self-investigation.' }
    ],
    clinicalTip: 'When several concerns appear at once, separate the facts and routes. Patient safety, truthful documentation, compliance reporting, and retaliation reporting can all proceed together.',
    sourceLabels: [
      { kind: 'Care Indeed', text: 'CO-CP-001; CO-CP-004–008; CO-FA-001/002' },
      { kind: 'Federal', text: '31 USC §§3729–3730; HHS-OIG GCPG' },
      { kind: 'California', text: 'Labor Code §1102.5' }
    ],
    sceneImage: img07,
    sceneAlt: 'Field worker calls an approved independent reporting channel while comparing a tablet with the home setting; a wall clock, nursing bag, plain supplies, blood-pressure cuff, gift envelope, patient, and caregiver are visible.',
    hotspots: [
      {
        id: 'clock', label: 'SEE the visit mismatch', shortLabel: 'SEE', x: 22, y: 13, kind: 'escalate',
        info: 'The wall clock represents a prior visit time that does not match the patient’s account.', meaning: 'A mismatch is a reportable fact, not permission to edit another record or declare fraud.', action: 'Protect today’s care, preserve the approved view, and report the discrepancy.',
        notify: 'Compliance and the appropriate clinical supervisor if continuity of care is affected.', document: 'Patient statement as permitted, system status, dates, and report route.', policyRefs: ['CO-FW-101', 'CO-CP-004 §5.2'],
      },
      {
        id: 'tablet', label: 'SAFE the truthful record', shortLabel: 'SAFE', x: 63, y: 48, kind: 'expected',
        info: 'The tablet represents today’s note and a request to reuse prior text.', meaning: 'The worker must document today’s actual care and refuse unsupported copy-forward content.', action: 'Complete only the accurate current entry and use the correction or variance route as needed.',
        notify: 'Compliance for falsification pressure; clinical supervisor for care variance.', document: 'Actual encounter and the preserved request.', policyRefs: ['CO-CP-004 §5.2', 'CO-AI-101 §4.2'],
      },
      {
        id: 'supplies', label: 'SAVE authorized sources', shortLabel: 'SAVE', x: 42, y: 82, kind: 'guidance',
        info: 'The plain supply container represents possible waste and original inventory information.', meaning: 'Preservation means leaving records and items in authorized custody, not collecting private evidence.', action: 'Follow inventory control, note the location, and report a significant or recurring mismatch.',
        notify: 'Supervisor or supply coordinator, or Compliance based on the pattern.', document: 'Observed item, amount, context, and authorized source.', policyRefs: ['CO-CP-004 §5.8', 'CO-FW-101'],
      },
      {
        id: 'phone', label: 'SAY through an independent route', shortLabel: 'SAY', x: 42, y: 27, kind: 'escalate',
        info: 'The field worker contacts an approved route while remaining composed in the home.', meaning: 'When a supervisor may be involved, reporting cannot be restricted to that supervisor.', action: 'Use the current independent channel and present each concern as a separate fact.',
        notify: 'Compliance; use privacy, safety, abuse, HR, or clinical routes in parallel when applicable.', document: 'Channel, time, facts, and confirmation or reference.', policyRefs: ['CO-CP-006', 'CO-CP-005'],
      },
      {
        id: 'gift', label: 'SUPPORT review without taking the gift', shortLabel: 'SUPPORT', x: 86, y: 89, kind: 'prohibited',
        info: 'The sealed gift envelope represents a referral-linked offer that remains untouched.', meaning: 'Declining and preserving the offer protects patient choice and review; a small amount does not cure a quid pro quo.', action: 'Do not accept, negotiate, open, or dispose of it; follow Compliance direction.',
        notify: 'Compliance promptly and separately report any hours or assignment threat as possible retaliation.', document: 'Offer, condition, response, original location, and adverse action if any.', policyRefs: ['CO-FA-001', 'CO-CP-005', '42 USC §1320a-7b(b)'],
      }
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Which statement most accurately describes a good-faith compliance report under Care Indeed policy?',
    options: [
      'It is protected only if the investigation proves a violation occurred.',
      'It is a sincere report based on reasonable information available at the time, and protection does not depend on substantiation.',
      'It is protected only after the reporter gives a supervisor the chance to resolve it.',
      'It includes an allegation knowingly invented to harm a coworker.'
    ],
    correct: 1,
    rationale: 'Good faith is based on a sincere concern and the reasonable information available when reported. Care Indeed policy protects good-faith reporting even when a review does not substantiate the concern. Knowingly false or malicious allegations are different, and an independent reporting channel does not require supervisor permission.',
    source: 'CO-CP-005 §§4.1–4.4; CO-CP-006; OIG GCPG pp. 49–50, 66–67.'
  },
  {
    id: 2,
    stem: 'A field worker sees a pattern that could be fraud, waste, abuse, or an ordinary billing error. What is the worker’s correct role?',
    options: [
      'Decide which law was violated before making a report.',
      'Ask coworkers for records until enough proof exists.',
      'Preserve authorized facts, protect the patient and record, and report without making a legal finding.',
      'Wait for a payer denial because field workers do not participate in compliance.'
    ],
    correct: 2,
    rationale: 'Field workers recognize and report concerns; they do not run an investigation or make legal classifications. Waiting can allow harm or inaccurate information to continue, while seeking unrelated records can create privacy and evidence-integrity problems.',
    source: 'CO-FW-101 §§4.1–4.5; CO-CP-007; HHS-OIG GCPG.'
  },
  {
    id: 3,
    stem: 'A visit was canceled before the clinician arrived. A supervisor asks the clinician to sign a completed visit note because “the care plan allowed the visit and the claim is already queued.” What is the best response?',
    options: [
      'Sign, then add a late note after billing to explain the cancellation.',
      'Refuse to attest to care not rendered, document the actual canceled-visit facts through the approved workflow, preserve the request, and report the pressure promptly.',
      'Delete the queued record without notifying anyone.',
      'Ask a coworker to sign because the service was medically necessary.'
    ],
    correct: 1,
    rationale: 'A planned or medically necessary service is not a rendered service. The worker must not sign, delete another record, or substitute another signer. Truthful documentation, preservation of the request, and prompt escalation protect the patient, record, and claim process.',
    source: 'CO-CP-004 §5.2; CO-FA-002; OIG GCPG pp. 16–18.'
  },
  {
    id: 4,
    stem: 'A referral-source employee offers a field therapist a $20 gift card for every family referred to Care Indeed and says the amount is below the agency’s gift limit. What should the therapist do?',
    options: [
      'Accept because the amount is below the cited limit.',
      'Accept only after telling the patient the referral is optional.',
      'Decline participation, preserve the offer, and report it; an internal threshold is not a safe harbor for a referral-linked payment.',
      'Negotiate a noncash meal instead of a gift card.'
    ],
    correct: 2,
    rationale: 'Anything of value tied to referrals is a serious Anti-Kickback red flag regardless of amount. Field workers do not determine safe-harbor eligibility. No agency gift threshold legalizes a quid pro quo.',
    source: 'CO-FA-001; CO-CP-004 §5.4; 42 USC §1320a-7b(b); OIG GCPG pp. 9–13.'
  },
  {
    id: 5,
    stem: 'A worker’s direct supervisor appears to be directing copy-forward documentation and says all concerns must come to the supervisor first. Which route best matches Care Indeed policy?',
    options: [
      'Wait until the annual evaluation.',
      'Use an independent approved route such as the Compliance Officer or any anonymous channel published in the current directory; manager permission is not required.',
      'Post the concern in a team chat so witnesses can confirm it.',
      'Ask the patient to investigate.'
    ],
    correct: 1,
    rationale: 'Care Indeed policy describes multiple reporting mechanisms, including independent and anonymous options. Team chat and patient involvement can compromise privacy and fairness, while delay can increase risk. Use the current published contact rather than an unverified number.',
    source: 'CO-CP-006; OIG GCPG pp. 49–50.'
  },
  {
    id: 6,
    stem: 'Two days after a worker makes a good-faith report, the supervisor says, “People who go outside the team are not dependable,” removes two shifts, and assigns less favorable work. What is the best next step?',
    options: [
      'Wait for the original report to be substantiated before raising retaliation.',
      'Secretly record every coworker and post the evidence online.',
      'Preserve the statements and schedule changes objectively and promptly report possible retaliation through Compliance or the bypass route.',
      'Withdraw the original report to restore the schedule.'
    ],
    correct: 2,
    rationale: 'Reduced hours, reassignment, intimidation, or a report-influenced action may be retaliation under agency policy. Retaliation is a separate concern and should be reported promptly whether or not the original matter is substantiated.',
    source: 'CO-CP-005; 31 USC §3730(h); California Labor Code §1102.5.'
  },
  {
    id: 7,
    stem: 'A contractor tells a field worker, “I may still be excluded from Medicare, but the staffing company used a different version of my name, so it should be fine.” There is no immediate patient emergency. What should the field worker do?',
    options: [
      'Search restricted personnel records and make an employment decision.',
      'Ignore it because exclusion screening belongs only to HR.',
      'Promptly report the statement through an approved channel and let HR or Compliance verify status and take any needed restriction.',
      'Confront the contractor in front of the patient and demand proof.'
    ],
    correct: 2,
    rationale: 'Care Indeed assigns screening and verification to HR and Compliance but requires workforce awareness and reporting. A field worker should not inspect restricted files, adjudicate a name match, or create a public confrontation.',
    source: 'HR-TA-003 §§4.1–4.4, 10.3; CO-CP-001 §4.6; OIG Exclusions Program.'
  },
  {
    id: 8,
    stem: 'During an authorized review, a clinician discovers that yesterday’s note contains copied findings that were not observed. What is the most defensible action?',
    options: [
      'Overwrite the note so the incorrect text disappears.',
      'Delete the note and recreate it with yesterday’s date.',
      'Preserve the original, use the approved audit-trailed correction or late-entry process, and notify the supervisor or Compliance if billing or falsification risk is involved.',
      'Leave it unchanged and correct the facts verbally at a team meeting.'
    ],
    correct: 2,
    rationale: 'Corrections must preserve the original audit trail. Silent overwrite, deletion, backdating, or a verbal-only correction undermines record integrity and may conceal a care or billing concern.',
    source: 'CO-CP-004 §5.2; CO-CP-007 §6.2; approved audit-trailed correction workflow.'
  },
  {
    id: 9,
    stem: 'A field worker receives a payer-related notice in an authorized system suggesting the agency was paid for a visit the worker knows was canceled. What should the worker do first?',
    options: [
      'Calculate the federal repayment deadline and call the payer with a refund amount.',
      'Ignore it because only finance staff can recognize any concern.',
      'Promptly send the known facts through the approved Compliance or Revenue Cycle route and preserve the notice; authorized staff determine identification, amount, and process.',
      'Change the canceled visit to completed so the payment has support.'
    ],
    correct: 2,
    rationale: 'Field workers must promptly escalate suspected improper payments but do not quantify, legally identify, refund, or disclose on the agency’s behalf. Current regulatory analysis belongs to Compliance, Revenue Cycle, and counsel.',
    source: 'CO-FA-002; FN-BC-004 internal escalation; 42 CFR §401.305.'
  },
  {
    id: 10,
    stem: 'A supervisor asks a worker to copy a prior note into today’s record, a referral contact offers a small per-patient gift, and the supervisor hints that reporting either issue will reduce the worker’s hours. Which response is most complete?',
    options: [
      'Accept the gift, copy the note, and privately ask the supervisor to stop.',
      'Refuse the false entry and referral-linked gift, document only actual care, preserve the original messages, use an independent compliance channel, and separately report the hours threat as possible retaliation.',
      'Investigate the supervisor, referral contact, and billing records before telling anyone.',
      'Resign immediately and delete the messages to avoid involvement.'
    ],
    correct: 1,
    rationale: 'The complete response protects patient and record integrity, referral integrity, evidence, independent reporting, and non-retaliation without exceeding the worker’s role. Investigation, deletion, acceptance, or delay would add risk.',
    source: 'CO-CP-004–006; CO-FA-001/002; CO-FW-101; 31 USC §§3729–3730.'
  }
];

const STYLES = `
.achcm09,.achcm09 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes achcm09-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes achcm09-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes achcm09-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.achcm09-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.achcm09-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.achcm09-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.achcm09-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.achcm09-tabs::-webkit-scrollbar{display:none}
.achcm09-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.achcm09-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.achcm09-tab.quiz-tab{border:1px solid #A83D12;color:#A83D12}
.achcm09-tab.quiz-tab.active{background:#C84F1D;color:#fff;border-color:#C84F1D}
.achcm09-exit{flex-shrink:0;border-radius:10px;border:1px solid #A83D12;background:#fff;color:#A83D12;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.achcm09-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.achcm09-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.achcm09-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.achcm09-stage-wrap{width:100%;height:100%;min-height:0;display:flex;flex-direction:column;gap:8px}
.achcm09-stage-toolbar{display:flex;justify-content:flex-end;align-items:center;min-height:44px;flex:0 0 auto}
.achcm09-stage-summary{display:none;font-size:12px;font-weight:800;color:#0F5B54;letter-spacing:.04em}
.achcm09-stage-holder{width:100%;flex:1;min-height:0;display:grid;place-items:center;container-type:size}
.achcm09-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.achcm09-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.achcm09-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.achcm09-hotspot{position:absolute;left:var(--achcm09-x);top:var(--achcm09-y);z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.achcm09-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.achcm09-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#F26D33;animation:achcm09-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.achcm09-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.achcm09-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.achcm09-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.achcm09-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:achcm09-pop .3s cubic-bezier(.16,1,.3,1)}
.achcm09-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.achcm09-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.achcm09-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.achcm09-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.achcm09-bot button.next{background:#C84F1D;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(168,61,18,.24);min-height:44px}
.achcm09-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.achcm09-quiz-card{width:min(760px,100%);animation:achcm09-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .achcm09-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .achcm09-left,.achcm09-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .achcm09-right{min-height:360px}
  .achcm09-left{max-height:42vh}
  .achcm09-top{padding:0 10px;gap:8px}
  .achcm09-tab{padding:8px 10px;font-size:12px}
  .achcm09-bot{padding:0 12px;height:72px}
  .achcm09-stage-toolbar{justify-content:space-between}
  .achcm09-stage-summary{display:block}
  .achcm09-scene-badge,.achcm09-progress-badge,.achcm09-hotspot .tag{display:none!important}
  .achcm09-hotspot{left:clamp(30px,var(--achcm09-mobile-x),calc(100% - 30px));top:clamp(30px,var(--achcm09-mobile-y),calc(100% - 30px))}
  .achcm09-hotspot .orb{width:44px;height:44px;min-width:44px;min-height:44px}
  .achcm09-gate-node{display:none!important}
}
@media (max-width:420px){
  .achcm09-brand span.brand-text{display:none}
  .achcm09-exit{padding:8px 10px;font-size:11px}
  .achcm09-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .achcm09-hotspot .ping,.achcm09-drawer-bg,.achcm09-quiz-card,.achcm09-path-step{animation:none!important}
  .achcm09-quiz-card{animation:none!important}
  .achcm09-rm-transition,.achcm09-complete-overlay,.achcm09-option{transition:none!important;animation:none!important}
}
.achcm09-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.achcm09-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.achcm09-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.achcm09-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.achcm09-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.achcm09-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.achcm09-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.achcm09-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.achcm09-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.achcm09-process-node ul{margin:0;padding-left:14px}
.achcm09-process-node li{margin:0}
.achcm09-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.achcm09-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.achcm09-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.achcm09-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.achcm09 button:focus-visible,.achcm09 summary:focus-visible{outline:3px solid #0F5B54;outline-offset:3px}
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
  const status = STATUS[hotspot.kind];
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
    <div className="achcm09-drawer-bg" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="achcm09-drawer">
        <div style={{ padding: 16, borderBottom: `1px solid ${CI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: 'rgba(255,255,255,.96)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: status.color, color: '#fff', display: 'grid', placeItems: 'center' }}>
              {hotspot.kind === 'prohibited' ? <XCircle size={18} /> : hotspot.kind === 'escalate' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 id={titleId} style={{ margin: 0, fontSize: 15, fontWeight: 800, color: CI.teal }}>{hotspot.label}</h2>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: CI.muted }}>{status.label}</div>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={() => { onClose(); triggerRef.current?.focus(); }} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} color={CI.muted} /></button>
        </div>
        <p id={descId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Compliance guidance for this scene detail</p>
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
          <button type="button" onClick={() => { onComplete(); triggerRef.current?.focus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Mark observed</button>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({ page, pageIndex, total, reportingContacts }: { page: PageData; pageIndex: number; total: number; reportingContacts?: ReportingContacts }) {
  const reportingChannels: { label: string; value: string }[] = [];
  if (reportingContacts?.complianceOfficer) reportingChannels.push({ label: 'Compliance Officer', value: reportingContacts.complianceOfficer });
  if (reportingContacts?.independentOrBypass) reportingChannels.push({ label: 'Independent / bypass route', value: reportingContacts.independentOrBypass });
  if (reportingContacts?.anonymous) reportingChannels.push({ label: 'Anonymous option', value: reportingContacts.anonymous });
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>Lesson {pageIndex + 1} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orangeDark, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      {page.overview.map((paragraph, i) => (
        <p key={i} style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>
      ))}
      {page.details.length > 0 && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.details.map((section) => (
              <section key={section.heading} style={{ marginBottom: 16 }}>
                <h2 style={{ margin: '0 0 8px', color: CI.teal, fontSize: 16 }}>{section.heading}</h2>
                {section.paragraphs.map((paragraph, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
              </section>
            ))}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Compliance Actions</div>
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
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Field Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      {page.id === 4 && (
        <div role="note" aria-label="Current approved reporting channels" style={{ padding: 14, borderRadius: 12, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: CI.teal, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Current approved reporting channels</div>
          {reportingChannels.length ? (
            <dl style={{ margin: 0 }}>
              {reportingChannels.map((channel) => (
                <div key={channel.label} style={{ marginBottom: 8 }}>
                  <dt style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{channel.label}</dt>
                  <dd style={{ margin: '2px 0 0', fontSize: 14, color: CI.ink, overflowWrap: 'anywhere' }}>{channel.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: CI.ink, lineHeight: 1.5 }}>Use the verified contacts in the current agency directory or the reporting controls provided by the host LMS. This player does not display an unverified contact.</p>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {page.sourceLabels.map((s) => (
          <span key={s.kind + s.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.kind}: {s.text}</span>
        ))}
      </div>
    </div>
  );
}

function SceneCompletionOverlay({ isLast, onReview, onGoQuiz }: {
  isLast: boolean; onReview: () => void; onGoQuiz?: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => { reviewRef.current?.focus(); }, []);
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onReview(); return; }
      if (e.key !== 'Tab') return;
      const nodes = root.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [onReview]);
  return (
    <div className="achcm09-complete-overlay achcm09-rm-transition" style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'achcm09-pop .3s cubic-bezier(.16,1,.3,1)' }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 390, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
        <h2 id={titleId} style={{ fontSize: 18, fontWeight: 800, color: CI.teal, margin: '0 0 6px' }}>Scene complete</h2>
        <p style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, margin: '0 0 14px' }}>You reviewed every decision point in this scene. This is knowledge practice; job-specific competency validation remains separate.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button ref={reviewRef} type="button" onClick={onReview} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, cursor: 'pointer' }}>Review scene</button>
          {isLast && onGoQuiz && <button type="button" onClick={onGoQuiz} style={{ minHeight: 44, padding: '0 16px', border: 0, borderRadius: 12, background: CI.orangeAction, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Go to Knowledge Check</button>}
        </div>
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void; onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const active = page.hotspots.find((h) => h.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;
  useEffect(() => { setActiveId(null); setCompletionOpen(false); }, [page.id]);
  useEffect(() => { if (done && !activeId) setCompletionOpen(true); }, [done, activeId]);
  return (
    <div className="achcm09-stage-wrap">
      <div className="achcm09-stage-toolbar">
        <div className="achcm09-stage-summary" aria-hidden="true">{page.shortName} · {completed.length}/{page.hotspots.length} reviewed · tap each numbered point</div>
        <button ref={resetRef} type="button" aria-label="Reset lesson progress" onClick={() => setCompleted([])}
          style={{ minHeight: 44, padding: '0 14px', borderRadius: 999, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset lesson
        </button>
      </div>
      <div className="achcm09-stage-holder">
      <div className="achcm09-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={page.sceneAlt} draggable={false} />
        <div className="achcm09-scene-badge" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orangeDark }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div className="achcm09-progress-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hs, hi) => {
          const isDone = completed.includes(hs.id);
          const color = STATUS[hs.kind].color;
          const nextIncomplete = page.hotspots.find((h) => !completed.includes(h.id));
          const isGuided = !isDone && nextIncomplete?.id === hs.id;
          return (
            <button key={hs.id} type="button" className={`achcm09-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''} ${hs.y > 78 ? 'edge-bottom' : ''}`}
              style={{ '--achcm09-x': `${hs.x}%`, '--achcm09-y': `${hs.y}%`, '--achcm09-mobile-x': `${hs.mobileX ?? hs.x}%`, '--achcm09-mobile-y': `${hs.mobileY ?? hs.y}%` } as React.CSSProperties}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`achcm09-progress-${page.id}`}
              onClick={(e) => { triggerRef.current = e.currentTarget; setActiveId(hs.id); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerRef.current = e.currentTarget;
                  setActiveId(hs.id);
                }
              }}>
              <div className="orb" style={{ background: isDone ? CI.teal : color }}>
                {isGuided && !isDone && <span className="ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 14 }} aria-hidden>{hi + 1}</span>}
              </div>
              <span className="tag">{hs.shortLabel}</span>
              {isDone && <span className="achcm09-sr-only">Completed</span>}
            </button>
          );
        })}
        <div id={`achcm09-progress-${page.id}`} className="achcm09-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} nodes observed
        </div>
        {page.id === PAGES.length - 1 && (
          <div className="achcm09-gate-node" role="note" aria-label="Five-step field response">
            {['SEE', 'SAFE', 'SAVE', 'SAY', 'SUPPORT'].map((step) => <span key={step} className="achcm09-gate-chip">{step}</span>)}
          </div>
        )}
        {completionOpen && !activeId && <SceneCompletionOverlay isLast={page.id === PAGES.length - 1} onReview={() => {
          setCompletionOpen(false);
          window.requestAnimationFrame(() => (triggerRef.current ?? resetRef.current)?.focus());
        }} onGoQuiz={onGoQuiz} />}
        {active && (
          <ClinicalFeedbackOverlay hotspot={active} onClose={() => setActiveId(null)}
            onComplete={() => { if (!completed.includes(active.id)) setCompleted([...completed, active.id]); setActiveId(null); }}
            triggerRef={triggerRef} />
        )}
      </div>
      </div>
    </div>
  );
}

type QuizPersistState = {
  answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean;
  attempts: number; lastScore: number; bestScore: number; passed: boolean;
};

/** Dedicated single-panel Knowledge Check — progressive field cards + compliance result */
function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  initialAttempts,
  initialLastScore,
  initialBestScore,
  initialPassed,
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
  initialBestScore?: number;
  initialPassed?: boolean;
  onPersist: (state: QuizPersistState) => void;
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
  const [attempts, setAttempts] = useState(initialAttempts ?? 0);
  const [lastScore, setLastScore] = useState(initialLastScore ?? 0);
  const [bestScore, setBestScore] = useState(initialBestScore ?? 0);
  const [passedOverall, setPassedOverall] = useState(!!initialPassed);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const q = QUIZ[idx];
  const isCorrect = selected === q.correct;
  const score = useMemo(
    () => answers.reduce<number>((n, a, i) => n + (a === QUIZ[i].correct ? 1 : 0), 0),
    [answers],
  );
  const pct = Math.round((score / QUIZ.length) * 100);
  const passed = finished ? lastScore >= MODULE_META.passing : pct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted, attempts, lastScore, bestScore, passed: passedOverall });
    // intentionally omit onPersist identity to avoid re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, finished, selected, submitted, attempts, lastScore, bestScore, passedOverall]);

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
      const completedPct = Math.round((score / QUIZ.length) * 100);
      const nextAttempts = Math.min(MODULE_META.maxAttempts, attempts + 1);
      setAttempts(nextAttempts);
      setLastScore(completedPct);
      setBestScore(Math.max(bestScore, completedPct));
      if (completedPct >= MODULE_META.passing) setPassedOverall(true);
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
    const finalPct = lastScore;
    const finalScore = Math.round((finalPct / 100) * QUIZ.length);
    const offset = circumference - (finalPct / 100) * circumference;
    const canRetake = !passedOverall && attempts < MODULE_META.maxAttempts;
    return (
      <div className="achcm09-quiz-page">
        <div className="achcm09-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: passed ? CI.teal : CI.orangeDark, marginBottom: 8 }}>{passed ? 'Knowledge Check Passed' : 'Knowledge Check Not Passed'}</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="achcm09-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orangeDark }}>{finalPct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{finalScore}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: passed ? CI.teal : CI.orangeDark, marginBottom: 6 }}>{passed ? 'Required score achieved' : canRetake ? 'Review and try again' : 'Attempt limit reached'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            {passed
              ? `Passed on attempt ${attempts} of ${MODULE_META.maxAttempts}. Best score: ${bestScore}%. Knowledge completion does not replace job-specific competency validation.`
              : canRetake
                ? `A score of ${MODULE_META.passing}% is required. Review the lessons and use one of your ${MODULE_META.maxAttempts - attempts} remaining attempts.`
                : `You used all ${MODULE_META.maxAttempts} attempts. Follow your agency's current training-support process before another attempt is authorized.`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'SEE', color: CI.teal, tip: 'Notice the concern' },
              { label: 'SAY', color: CI.orange, tip: 'Report through a current channel' },
              { label: 'SUPPORT', color: CI.red, tip: 'No retaliation; no interference' },
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
            {canRetake && <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Start attempt {attempts + 1}</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achcm09-quiz-page">
      <div className="achcm09-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Compliance Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>Attempt {Math.min(attempts + 1, MODULE_META.maxAttempts)} of {MODULE_META.maxAttempts} · {idx + 1}/{QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="achcm09-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
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
                <button key={i} type="button" role="radio" aria-checked={on} className="achcm09-option"
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
            <div role="status" aria-live="polite" style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
              <div style={{ fontSize: 11, lineHeight: 1.45, color: CI.muted, marginTop: 8 }}><strong>Source:</strong> {q.source}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orangeAction, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'achc-art-m09-progress-v1';

export type Persisted = {
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
  quizBestScore?: number;
  quizPassed?: boolean;
};

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function validatedQuizScore(value: unknown) {
  const step = 100 / QUIZ.length;
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100 && value % step === 0 ? value : 0;
}

function sanitizeProgress(value: unknown): Persisted | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const rawCompleted = input.completedByPage && typeof input.completedByPage === 'object' && !Array.isArray(input.completedByPage)
    ? input.completedByPage as Record<string, unknown>
    : {};
  const completedByPage: Record<number, string[]> = {};
  PAGES.forEach((page) => {
    const allowed = new Set(page.hotspots.map((hotspot) => hotspot.id));
    const raw = rawCompleted[String(page.id)];
    completedByPage[page.id] = Array.isArray(raw)
      ? Array.from(new Set(raw.filter((id): id is string => typeof id === 'string' && allowed.has(id))))
      : [];
  });
  const rawAnswers = Array.isArray(input.quizAnswers) ? input.quizAnswers : [];
  const quizAnswers = Array.from({ length: QUIZ.length }, (_, i) => {
    const answer = rawAnswers[i];
    return typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < QUIZ[i].options.length ? answer : null;
  });
  const quizIdx = clampInt(input.quizIdx, 0, QUIZ.length - 1, 0);
  const attempts = clampInt(input.quizAttempts, 0, MODULE_META.maxAttempts, 0);
  const answersComplete = quizAnswers.every((answer) => answer !== null);
  const calculatedScore = answersComplete
    ? Math.round((quizAnswers.reduce<number>((total, answer, i) => total + (answer === QUIZ[i].correct ? 1 : 0), 0) / QUIZ.length) * 100)
    : 0;
  const verifiableFinishedAttempt = input.quizFinished === true && answersComplete && attempts > 0;
  const exhaustedRecovery = attempts >= MODULE_META.maxAttempts && !verifiableFinishedAttempt;
  const quizFinished = verifiableFinishedAttempt || exhaustedRecovery;
  const rawBestScore = validatedQuizScore(input.quizBestScore);
  const rawLastScore = validatedQuizScore(input.quizLastScore);
  const historicalBestScore = attempts > 0 && rawBestScore < MODULE_META.passing ? rawBestScore : 0;
  const historicalLastScore = attempts > 0 && rawLastScore <= historicalBestScore ? rawLastScore : 0;
  const quizLastScore = verifiableFinishedAttempt ? calculatedScore : historicalLastScore;
  const quizPassed = verifiableFinishedAttempt && quizLastScore >= MODULE_META.passing;
  const quizBestScore = quizPassed ? quizLastScore : Math.max(quizLastScore, historicalBestScore);
  const rawSelected = input.quizSelected;
  const validRawSelected = typeof rawSelected === 'number' && Number.isInteger(rawSelected) && rawSelected >= 0 && rawSelected < QUIZ[quizIdx].options.length ? rawSelected : null;
  const selected = quizFinished ? null : (quizAnswers[quizIdx] ?? validRawSelected);
  const submitted = !quizFinished && quizAnswers[quizIdx] !== null;
  return {
    pageIndex: clampInt(input.pageIndex, 0, PAGES.length - 1, 0),
    mode: input.mode === 'quiz' ? 'quiz' : 'lessons',
    completedByPage,
    quizAnswers,
    quizIdx,
    quizFinished,
    quizSelected: selected,
    quizSubmitted: submitted,
    quizAttempts: attempts,
    quizLastScore,
    quizBestScore,
    quizPassed,
  };
}

function loadProgress(): Persisted | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeProgress(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function saveProgress(data: Persisted) {
  try {
    if (typeof window === 'undefined') return;
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

export type ACHCARTM09Props = {
  onSaveExit?: (progress: Persisted) => void;
  reportingContacts?: ReportingContacts;
};

export default function ACHCARTM09({ onSaveExit, reportingContacts }: ACHCARTM09Props = {}) {
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
  const [quizBestScore, setQuizBestScore] = useState(initial?.quizBestScore ?? 0);
  const [quizPassed, setQuizPassed] = useState(!!initial?.quizPassed);
  const page = PAGES[Math.min(pageIndex, PAGES.length - 1)];
  const completed = completedByPage[page.id] ?? [];

  const persistAll = (patch?: Partial<Persisted>) => {
    const progress: Persisted = {
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
      quizBestScore,
      quizPassed,
      ...patch,
    };
    saveProgress(progress);
    return progress;
  };

  useEffect(() => {
    persistAll();
  }, [pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizFinished, quizSelected, quizSubmitted, quizAttempts, quizLastScore, quizBestScore, quizPassed]);

  const handleSaveExit = () => {
    const progress = persistAll();
    if (onSaveExit) onSaveExit(progress);
    else if (window.history.length > 1) window.history.back();
  };

  const handleQuizPersist = useCallback((state: QuizPersistState) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
    setQuizAttempts(state.attempts);
    setQuizLastScore(state.lastScore);
    setQuizBestScore(state.bestScore);
    setQuizPassed(state.passed);
  }, []);

  const activateTab = (index: number) => {
    if (index === PAGES.length) setMode('quiz');
    else { setMode('lessons'); setPageIndex(index); }
  };
  const handleTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = PAGES.length;
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    activateTab(next);
    window.requestAnimationFrame(() => document.getElementById(`achcm09-tab-${next}`)?.focus());
  };

  return (
    <div className="achcm09 achcm09-shell">
      <style>{STYLES}</style>
      <header className="achcm09-top">
        <div className="achcm09-brand">
          <BrandMark size={28} />
          <span className="brand-text">Compliance &amp; Integrity</span>
        </div>
        <div className="achcm09-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} id={`achcm09-tab-${i}`} type="button" role="tab" aria-controls="achcm09-panel" aria-selected={mode === 'lessons' && i === pageIndex}
              tabIndex={mode === 'lessons' && i === pageIndex ? 0 : -1}
              className={`achcm09-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onKeyDown={(event) => handleTabKey(event, i)}
              onClick={() => activateTab(i)}>
              {p.shortName}
            </button>
          ))}
          <button id={`achcm09-tab-${PAGES.length}`} type="button" role="tab" aria-controls="achcm09-panel" aria-selected={mode === 'quiz'} tabIndex={mode === 'quiz' ? 0 : -1}
            className={`achcm09-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onKeyDown={(event) => handleTabKey(event, PAGES.length)}
            onClick={() => activateTab(PAGES.length)}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="achcm09-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      <main style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <div id="achcm09-panel" role="tabpanel" aria-labelledby={`achcm09-tab-${mode === 'quiz' ? PAGES.length : pageIndex}`} style={{ flex: 1, minHeight: 0, display: 'flex' }}>
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
          initialBestScore={quizBestScore}
          initialPassed={quizPassed}
          onPersist={handleQuizPersist}
        />
      ) : (
        <div className="achcm09-work">
          <aside className="achcm09-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} reportingContacts={reportingContacts} /></aside>
          <section className="achcm09-right">
            <RightPanel page={page} completed={completed}
              setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
              onGoQuiz={() => setMode('quiz')} />
          </section>
        </div>
      )}
      </div>
      </main>

      <footer className="achcm09-bot">
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
