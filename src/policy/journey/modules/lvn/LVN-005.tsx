import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, Info, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react';

const MODULE_META = {
  id: 'LVN-005',
  title: 'Plan of Care: Working Under RN/Physician POC',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.60',
  california: 'CA B&P § 2860 / § 2860.5',
  policy: 'CL-CP-001 (agency care-planning policy)',
  guidance: 'NCSBN Five Rights of Delegation (professional guidance)',
};

const THEME = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primarySoft: '#EDE9FE',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
  teal: '#0891B2',
  bg: '#F5F3FF',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  physician: '#3B82F6',
  rn: '#0891B2',
  lvn: '#F59E0B',
};

type Hotspot = { id: string; label: string; x: number; y: number; detail: string };
type PageDef = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  bullets: string[];
  callouts: { kind: 'federal' | 'california' | 'agency' | 'guidance' | 'key' | 'warning'; text: string }[];
  scenario?: { patient: string; context: string; body: string };
  decision?: { first: string; continue: string; stop: string; notify: string; document: string };
  hotspots: Hotspot[];
};
type QuizQ = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
};

const PAGES: PageDef[] = [
  {
    id: 'authority',
    title: 'The Plan of Care — Your Clinical Compass',
    subtitle: 'Why the POC governs every LVN action in the home',
    accent: THEME.primary,
    bullets: [
      'The Plan of Care is the physician-authorized directive for every service, visit, and intervention in the patient home.',
      'As an LVN, the POC is your clinical compass: it defines what you may do, when, and how — you do not operate outside it.',
      'Critical scope rule: the LVN does not create, modify, or independently re-write the Plan of Care. You IMPLEMENT authorized directives under RN direction.',
      'Every LVN task during a home visit must trace back to a specific POC directive. If it is not in the plan (or a valid order updating it), it is not authorized.',
      'Federal care-planning rules require services to be furnished in accordance with an individualized plan of care (42 CFR § 484.60).',
      'Clinical decisions flow Physician → RN → LVN. The LVN identifies, reports, documents, then implements the authorized response — never improvises a new plan.',
    ],
    callouts: [
      {
        kind: 'federal',
        text: 'Federal requirement (42 CFR § 484.60 / § 484.60(a)): home health services must be furnished in accordance with an individualized plan of care.',
      },
      {
        kind: 'key',
        text: 'The LVN works UNDER an existing RN/physician POC. Developing or independently modifying the POC is outside LVN role. Crossing that line is a practice and compliance violation.',
      },
    ],
    scenario: {
      patient: 'Mr. Abramov',
      context: '78yo, bilateral knee replacement, Day 8 post-discharge',
      body:
        'Mr. Abramov asks you to change his wound dressing from dry gauze (specified in the POC) to a hydrocolloid “like the hospital used.” Do not accommodate the request on your own. Continue the authorized protocol; document the request and wound findings; contact the supervising RN. Only after RN/physician evaluation and an authorized POC update may the dressing type change. This is the authority chain in action.',
    },
    decision: {
      first: 'Confirm what the current POC orders for this task.',
      continue: 'Perform only interventions already authorized in the POC (or valid verbal/written order).',
      stop: 'Do not change treatment type, frequency, or goals because a patient/family request “seems reasonable.”',
      notify: 'Supervising RN immediately when a change is requested or clinically suggested.',
      document: 'Request, assessment findings, notifications, instructions received, and what you implemented.',
    },
    hotspots: [
      {
        id: 'authority-chain',
        label: 'Authority Chain',
        x: 50,
        y: 38,
        detail:
          'POC authority is hierarchical: Physician (orders/certifies) → RN (interprets, assesses, supervises, coordinates modifications) → LVN (implements and reports). The LVN never independently modifies the plan.',
      },
      {
        id: 'lvn-boundary',
        label: 'LVN Boundary',
        x: 72,
        y: 72,
        detail:
          'Within scope under POC: vitals, meds as ordered, wound care per protocol, education per plan, specimens, data collection. Outside: comprehensive assessment, POC create/modify, OASIS completion, discharge decisions, independent clinical plan changes.',
      },
    ],
  },
  {
    id: 'cms485',
    title: 'The CMS-485: Home Health Master Blueprint',
    subtitle: 'Know the form you implement — you do not complete it',
    accent: THEME.info,
    bullets: [
      'The CMS-485 (Home Health Certification and Plan of Care) is the legal authorization vehicle for Medicare home health services.',
      'It is completed/coordinated by the RN with physician review and signature. The LVN does NOT complete the CMS-485.',
      'Section map to know: demographics & certification window; diagnoses/ICD-10; discipline orders & treatments; goals & rehab potential; medications & DME; physician signature/date.',
      'Orders for discipline & treatment are your playbook: frequency, wound protocols, med administration, vital parameters, activity/diet orders.',
      'LVN documentation quality feeds the accuracy of the 485 and supports timely physician review — but completing the form is RN/physician work.',
      'Request/review each patient’s current POC/485 before your first visit. Clarify unclear orders with the RN before arriving.',
    ],
    callouts: [
      {
        kind: 'federal',
        text: 'Federal requirement (42 CFR § 484.60(b)): the individualized plan of care must specify necessary services, frequency/duration, and measurable outcomes/goals.',
      },
      {
        kind: 'key',
        text: 'LVN role on the 485: supply accurate visit data (vitals trends, functional observations, med adherence, wound findings). Not form completion, diagnosis assignment, or independent order writing.',
      },
    ],
    hotspots: [
      {
        id: 'orders-block',
        label: 'Orders Block',
        x: 68,
        y: 48,
        detail:
          'Orders & services are the LVN playbook. Map every visit action to a listed order. If an order is unclear, stop and ask the RN before the visit — never guess physician intent.',
      },
      {
        id: 'lvn-data',
        label: 'LVN Data Role',
        x: 28,
        y: 70,
        detail:
          'You populate the clinical story through visit notes; the RN/physician complete certification paperwork. High-quality LVN data improves plan accuracy without expanding LVN authority.',
      },
    ],
  },
  {
    id: 'frequency',
    title: 'Visit Frequency & Scheduling Compliance',
    subtitle: 'Decode authorized frequency — never invent extra visits',
    accent: THEME.teal,
    bullets: [
      'Frequency notation: [Visits]W[Weeks]. Example: “SN 3W2, 2W2, 1W2” = skilled nursing 3×/week for 2 weeks, then 2×/week for 2 weeks, then 1×/week for 2 weeks (12 SN visits across that pattern).',
      'Know which phase of the order you are in each week. Exceeding authorized frequency without a new order is a compliance problem and may yield non-billable visits.',
      'Front-loading (more visits early, taper later) is common and reflects temporary, goal-directed home health services — not indefinite standing schedules.',
      'Agency policy (CL-CP-001) expects visits to be reasonably distributed across the week (e.g., M-W-F pattern for 3×/week), not clustered for clinician convenience unless clinically justified and documented.',
      'Missed visits: attempt make-up per agency policy/same-week expectations, document reason, and notify the RN when make-up is impossible.',
      'PRN / additional visits beyond frequency require physician authorization (typically coordinated by the RN) BEFORE you go. Urgency accelerates the chain; it does not erase authorization.',
    ],
    callouts: [
      {
        kind: 'agency',
        text: 'Agency policy (CL-CP-001 §3.4 area): distribute visits reasonably across the week; document missed visits and escalate per agency procedure. Exact make-up windows follow current agency policy.',
      },
      {
        kind: 'warning',
        text: 'Never perform a visit that is not authorized by the current POC or a valid verbal/written order. Unauthorized visits create compliance liability and practice-outside-plan risk under 42 CFR § 484.60.',
      },
    ],
    scenario: {
      patient: 'Mrs. Johnson',
      context: 'SN frequency: 2W4 (2 visits/week for 4 weeks); Week 2 Tuesday after Monday visit',
      body:
        'Patient calls feeling dizzy and wants a visit today. Your second authorized visit is Thursday. Do not self-authorize a PRN visit. Perform phone triage within scope/agency script, notify the RN of the clinical concern, and go only if a physician-authorized PRN/order pathway is completed. Urgency speeds the process — it does not bypass it.',
    },
    decision: {
      first: 'Verify the authorized frequency phase for this week.',
      continue: 'Complete only visits within authorized frequency (or authorized PRN).',
      stop: 'Do not add visits because the patient “needs one more.”',
      notify: 'RN for clinical concerns and for any PRN/order request.',
      document: 'Clinical concern, notifications, order received (if any), and visit or non-visit outcome.',
    },
    hotspots: [
      {
        id: 'decode',
        label: 'Notation Decode',
        x: 32,
        y: 30,
        detail:
          '“3W2” = 3 visits per week for 2 weeks. Always compute total authorized visits and current phase before scheduling or accepting add-ons.',
      },
      {
        id: 'prn-gate',
        label: 'PRN Gate',
        x: 74,
        y: 68,
        detail:
          'Extra visits need physician authorization coordinated through the RN before the visit. Document order content, time, physician, and read-back confirmation per agency policy.',
      },
    ],
  },
  {
    id: 'delegation',
    title: 'Delegation Chain & LVN Implementation',
    subtitle: 'Physician orders → RN direction → LVN execution',
    accent: THEME.accent,
    bullets: [
      'Every LVN action traces a chain: physician orders it; RN interprets, assesses appropriateness, and delegates; LVN implements exactly as directed and reports findings.',
      'California law (B&P § 2860): LVNs perform services requiring technical/manual skills under the direction of a physician or RN — not as independent planners.',
      'NCSBN Five Rights of Delegation (professional guidance): Right Task, Right Circumstance, Right Person, Right Supervision, Right Direction/Communication.',
      'Example: physician orders wet-to-dry RLE dressing 3×/week; RN confirms wound is appropriate for LVN-level care, provides protocol, and assigns you; you perform care per protocol and report changes.',
      'Accountability vs responsibility: the delegating RN retains accountability for the decision to delegate and overall outcome oversight; the LVN assumes responsibility for correct execution.',
      'If a task exceeds your competency, training, or safe patient condition, decline the delegation, state why, and escalate — “the RN told me” is not a legal shield.',
    ],
    callouts: [
      {
        kind: 'california',
        text: 'California law (B&P § 2860 / § 2860.5): LVN practice is directed by a physician or registered nurse. “Directed” means explicit authorization, not assumed permission.',
      },
      {
        kind: 'guidance',
        text: 'Professional guidance (NCSBN Five Rights): Task, Circumstance, Person, Supervision, Direction. Use them as a safety check before accepting delegated work.',
      },
      {
        kind: 'warning',
        text: 'Never accept a delegation you are not competent to perform. Patient safety and license protection supersede pressure to “just do it.”',
      },
    ],
    hotspots: [
      {
        id: 'five-rights',
        label: 'Five Rights',
        x: 50,
        y: 42,
        detail:
          'Right Task (LVN scope) · Right Circumstance (stable enough) · Right Person (documented competency) · Right Supervision (RN available/defined) · Right Direction (clear outcomes).',
      },
      {
        id: 'acct-vs-resp',
        label: 'Acct vs Resp',
        x: 78,
        y: 72,
        detail:
          'RN accountability = answerable for choosing to delegate. LVN responsibility = answerable for performing the delegated task correctly. Both exist at once.',
      },
    ],
  },
  {
    id: 'change-response',
    title: 'Responding to Patient Changes',
    subtitle: 'Recognize → assess within scope → intervene within authority → notify → document',
    accent: THEME.error,
    bullets: [
      'You are often the clinician in the home when vitals deviate, wounds worsen, new symptoms appear, falls occur, or med side effects emerge.',
      'RECOGNIZE: compare findings to prior visit data, POC parameters (e.g., notify thresholds), and normal vs abnormal clinical knowledge.',
      'ASSESS within scope: recheck vitals, pain, wound characteristics, adherence, safety environment — collect data the RN/physician need.',
      'INTERVENE only within authority: comfort, positioning, safety measures, ordered meds, ordered dressing. Do not invent new treatments.',
      'NOTIFY: contact supervising RN for urgent changes; follow agency escalation (DON/on-call) if RN unavailable. Stay with the patient when required by urgency/policy.',
      'DOCUMENT: findings, comparison, interventions, time/method of notification, RN instructions, actions taken, status at departure.',
    ],
    callouts: [
      {
        kind: 'agency',
        text: 'Agency policy (CL-CP-001 §5.1 area): for urgent condition changes, notify the RN before leaving the patient’s home when required by current agency procedure. Call from the home and document in real time.',
      },
      {
        kind: 'key',
        text: 'Condition change does not authorize the LVN to rewrite the POC. You stabilize within scope, escalate, and implement only newly authorized orders.',
      },
    ],
    scenario: {
      patient: 'Mrs. Park',
      context: '68yo diabetes; weekly wound care; wound enlarged with purulent drainage and low-grade fever',
      body:
        'Document detailed wound measurements/appearance (and photo if agency policy allows). Recheck vitals. Continue current dressing only as authorized. Call RN from the home with concise data (size change, drainage, cellulitis signs, temp). Remain as directed while RN contacts physician. Implement only new orders received (e.g., culture, antibiotics, RN reassess). Document the full chain.',
    },
    decision: {
      first: 'Recognize and recheck; compare to baseline/POC parameters.',
      continue: 'Within-scope comfort, safety, and ordered treatments.',
      stop: 'Do not start new meds/treatments or change goals on your own.',
      notify: 'RN before leaving for urgent findings (per agency policy); escalate if RN unavailable.',
      document: 'Data, urgency, notification, response, and patient status at leave.',
    },
    hotspots: [
      {
        id: 'protocol',
        label: 'Change Protocol',
        x: 50,
        y: 50,
        detail:
          'Receive/identify → Verify vs POC & prior data → Implement within-scope response → Notify RN → Document fully. Escalation is not optional when findings are urgent.',
      },
      {
        id: 'stay-notify',
        label: 'Notify in Home',
        x: 22,
        y: 78,
        detail:
          'Agency expectation for urgent change: notify before leaving. “I called after I left” is not acceptable for urgent findings under CL-CP-001 procedures.',
      },
    ],
  },
  {
    id: 'scope-boundaries',
    title: 'Scope Boundaries — The Bright Lines',
    subtitle: 'License scope AND patient-specific POC authorization must both be present',
    accent: '#8B5CF6',
    bullets: [
      'Two simultaneous gates: (1) California LVN license authorizes the skill; (2) this patient’s POC authorizes the task. Missing either gate = unauthorized.',
      'WITHIN (typical, when ordered): vital signs; medication administration as ordered; wound care per protocol; education topics in the POC; specimen collection; data for RN assessment; reinforce existing teaching; report changes; document visit findings.',
      'OUTSIDE (even if clinically tempting): initial comprehensive assessment; care plan creation/independent modification; OASIS completion; discharge decisions; HHA supervisory visits; independent triage that changes the care trajectory; POC changes without RN/MD order.',
      'GRAY ZONE → RN consult: teaching new topics not in POC; wound presentation outside protocol parameters; vitals beyond notify thresholds; family requests beyond orders; med questions beyond administration (interactions/alternatives).',
      'Most violations are well-intentioned improvisation. Teaching a new med topic without an education order still crosses the line — document need, notify RN, wait for authorized plan update.',
      'If uncertain: stop, call RN, document the consultation. “When in doubt, call out.”',
    ],
    callouts: [
      {
        kind: 'california',
        text: 'California law: LVN services are performed as directed by a physician or RN (B&P § 2860.5 framing). Direction is explicit, not implied.',
      },
      {
        kind: 'federal',
        text: 'Federal requirement: comprehensive assessment / OASIS-type assessment functions are RN (or authorized clinician) responsibilities under the CoPs (see 42 CFR § 484.55). LVNs contribute data; they do not complete these assessments.',
      },
      {
        kind: 'key',
        text: 'Licensed skill + POC order = authorized practice. Example: IV med skill does not authorize IV administration for a patient whose POC has no IV medication orders.',
      },
    ],
    hotspots: [
      {
        id: 'within',
        label: 'Within Scope',
        x: 28,
        y: 48,
        detail:
          'Implement ordered vitals, meds, wound protocols, education-per-plan, specimens, data collection, reporting, and documentation.',
      },
      {
        id: 'outside',
        label: 'Outside Scope',
        x: 72,
        y: 48,
        detail:
          'No independent POC creation/modification, no OASIS completion, no comprehensive initial assessment, no discharge decisions, no unsupervised plan changes.',
      },
    ],
  },
  {
    id: 'cert-cycle',
    title: '60-Day Certification Cycle & Module Summary',
    subtitle: 'LVN documentation fuels recert decisions — it does not replace RN/physician authority',
    accent: THEME.success,
    bullets: [
      'Home health commonly operates in 60-day certification periods requiring physician authorization/review for continued services (see 42 CFR § 484.60(c) framing).',
      'SOC / recert assessment and OASIS are RN functions. LVN visits may begin only after authorized SOC processes and per the current POC.',
      'Verbal orders obtained during care must be documented with date/time, physician, content, and read-back, and transmitted for signature per agency policy timelines (CL-CP-001 area).',
      'Physician face-to-face / encounter timing is a physician/qualified non-physician practitioner responsibility; if you learn it has not occurred, notify the RN rather than managing certification yourself.',
      'Days ~50–60 (illustrative window): if services continue, RN performs recert assessment. Your cumulative notes (vitals trends, wound trajectory, function, adherence) are critical evidence.',
      'Summary: authority chain, 485 structure, frequency notation, delegation rights, change protocol, dual-gate scope, and certification data role. When in doubt, return to the POC and your RN.',
    ],
    callouts: [
      {
        kind: 'federal',
        text: 'Federal framing (42 CFR § 484.60(c)): plan of care review/revision expectations support periodic physician involvement for continuing services. Exact operational calendars follow CoPs + agency policy.',
      },
      {
        kind: 'agency',
        text: 'Agency policy governs verbal-order transmission windows, escalation trees, and documentation templates. Follow current CL-CP-001 (and related policies), not memory of old deadlines.',
      },
      {
        kind: 'key',
        text: 'Quiz success validates knowledge only. Practical competency still requires observed demonstration, competency check-offs, and authorized sign-off under agency policy.',
      },
    ],
    decision: {
      first: 'Confirm you are working from the current signed/authorized POC for this episode.',
      continue: 'Deliver ordered visits; document goal progress accurately (neither over- nor under-state).',
      stop: 'Do not complete OASIS, decide discharge, or extend services without RN/physician process.',
      notify: 'RN for certification barriers, missing orders, or clinical plateaus needing plan review.',
      document: 'Objective trends that support recert, revision, or discharge decisions by authorized clinicians.',
    },
    hotspots: [
      {
        id: 'orbit',
        label: '60-Day Orbit',
        x: 50,
        y: 42,
        detail:
          'SOC → orders window → ongoing LVN implementation → recert window. LVN notes are the continuous clinical evidence base; RN/physician own certification paperwork and plan authority.',
      },
      {
        id: 'data-lifeblood',
        label: 'Doc Lifeblood',
        x: 70,
        y: 74,
        detail:
          'Incomplete LVN documentation can weaken recert support. Document accurately — overstating progress risks premature discharge; understating without clinical basis creates integrity risk.',
      },
    ],
  },
];

const QUIZ: QuizQ[] = [
  {
    id: 'q1',
    question: 'What is the LVN’s role regarding the Plan of Care?',
    options: [
      'Implement POC directives as delegated under RN supervision, and document findings',
      'Create the POC based on patient assessment findings',
      'Modify the POC independently when the patient condition changes',
      'Approve the POC after the physician signs it',
    ],
    correct: 0,
    rationale:
      'The LVN implements the existing RN/physician POC — does not create, modify, or approve it. Every action must trace to an authorized directive under RN direction.',
  },
  {
    id: 'q2',
    question: 'What does visit frequency notation “SN 3W2, 2W2, 1W2” mean?',
    options: [
      'Skilled nursing for 3 patients in 2 weeks, then 2 patients, then 1 patient',
      'Skilled nursing 3 visits/week for 2 weeks, then 2/week for 2 weeks, then 1/week for 2 weeks (12 visits in that pattern)',
      'Skilled nursing 3 hours twice weekly for 2 months',
      'Skilled nursing every 3 weeks for 2 certification periods',
    ],
    correct: 1,
    rationale:
      '“3W2” means 3 visits per week for 2 weeks. Front-loaded patterns taper as goals progress. Total in this pattern: (3×2)+(2×2)+(1×2) = 12 visits.',
  },
  {
    id: 'q3',
    question:
      'A patient asks you to change wound dressing type from what the POC orders because “the hospital used something better.” What do you do first?',
    options: [
      'Decline the independent change, continue the authorized protocol, document the request, and notify the RN',
      'Change the dressing if you believe it is clinically appropriate',
      'Tell the patient to call the physician themselves and leave the issue undocumented',
      'Change the dressing and note the reason after the visit',
    ],
    correct: 0,
    rationale:
      'LVNs do not independently modify the POC. Continue authorized care, document, and escalate to the RN who coordinates any physician order/plan update.',
  },
  {
    id: 'q4',
    question: 'Which list correctly states the NCSBN Five Rights of Delegation (professional guidance)?',
    options: [
      'Right Patient, Right Drug, Right Dose, Right Route, Right Time',
      'Right Assessment, Right Plan, Right Implementation, Right Evaluation, Right Documentation',
      'Right Task, Right Circumstance, Right Person, Right Supervision, Right Direction',
      'Right License, Right Training, Right Chart, Right Outcome, Right Billing',
    ],
    correct: 2,
    rationale:
      'Five Rights: Task (scope), Circumstance (appropriate conditions), Person (competent LVN), Supervision (RN oversight), Direction (clear instructions/outcomes).',
  },
  {
    id: 'q5',
    question:
      'Per agency care-planning policy (CL-CP-001 area), when should you notify the RN of an urgent patient condition change found during a visit?',
    options: [
      'Within 24 hours of the visit',
      'At the end of your shift',
      'At the next interdisciplinary team meeting',
      'Before leaving the patient’s home (call from the home and document)',
    ],
    correct: 3,
    rationale:
      'Agency policy expects urgent RN notification before leaving the home. Stay with the patient as needed, call from the home, and document notification and response.',
  },
  {
    id: 'q6',
    question: 'Which activity is outside LVN scope in home health even if you have strong clinical instincts?',
    options: [
      'Completing the initial comprehensive assessment and OASIS',
      'Administering medications as ordered in the POC',
      'Performing wound care per an established protocol',
      'Collecting specimens as ordered',
    ],
    correct: 0,
    rationale:
      'Initial comprehensive assessment/OASIS is an RN (authorized clinician) function under the CoPs. LVNs contribute data; they do not complete these assessments or independently develop the POC.',
  },
  {
    id: 'q7',
    question: 'How long is a standard home health certification period referenced in federal care-planning practice?',
    options: [
      '30 days',
      '60 days',
      '90 days',
      '120 days',
    ],
    correct: 1,
    rationale:
      'Home health commonly uses 60-day certification periods with physician involvement for continuing authorization (42 CFR § 484.60(c) framing).',
  },
  {
    id: 'q8',
    question:
      'Your patient needs a visit beyond the authorized weekly frequency (PRN). What is the correct sequence?',
    options: [
      'Perform the visit now — patient need always comes first',
      'Skip any clinical response and tell the patient only to go to the ER',
      'Notify the RN so a physician verbal/written order can be obtained BEFORE you perform the extra visit',
      'Perform the visit and notify the RN afterward so billing can catch up',
    ],
    correct: 2,
    rationale:
      'Extra visits require authorization before they occur. Urgency accelerates RN/physician contact; it does not authorize the LVN to invent visits outside the POC.',
  },
  {
    id: 'q9',
    question: 'In the delegation chain, how do accountability and responsibility differ?',
    options: [
      'They are identical terms for documentation',
      'The delegating RN retains accountability for the decision to delegate; the LVN assumes responsibility for proper execution',
      'The LVN is accountable for the plan; the RN is only responsible for staffing',
      'Accountability means billing accuracy; responsibility means arrival on time',
    ],
    correct: 1,
    rationale:
      'RN accountability covers the decision to delegate and oversight of appropriateness. LVN responsibility covers performing the delegated task correctly within scope and orders.',
  },
  {
    id: 'q10',
    question: 'How does LVN documentation contribute to the 60-day recertification process?',
    options: [
      'It does not — recertification is only an office clerical task',
      'The LVN completes the recertification OASIS independently',
      'LVN notes are used only for payroll and not for clinical decisions',
      'Cumulative LVN visit data (vitals trends, wound trajectory, function, adherence) supports the RN’s recertification assessment and physician plan decisions',
    ],
    correct: 3,
    rationale:
      'LVN documentation is clinical evidence for recert/revision/discharge decisions made by authorized clinicians. Incomplete notes can undermine safe continuity of services.',
  },
];

const CI_THEME = {
  primary: '#007970',
  deep: '#004142',
  orange: '#C74601',
  bg: '#FAFBF8',
  lightTeal: '#E5FEFF',
  border: '#E5E4E3',
  ink: '#1F1C1B',
  muted: '#747470',
  white: '#FFFFFF',
};

// ==========================================
// GAO-001 PARITY MODAL
// ==========================================
export function Lvn005SceneModal({
  isOpen,
  onClose,
  title,
  info,
  triggerRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  info: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const trap = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          closeBtnRef.current?.focus();
        }
      };
      window.addEventListener('keydown', trap);
      return () => window.removeEventListener('keydown', trap);
    } else {
      if (triggerRef?.current) triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, pointerEvents: 'auto'
    }}>
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(31, 28, 27, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'modalFadeIn 0.2s ease-out'
        }}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'relative',
          background: '#FFFFFF',
          width: '90%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{
          padding: '24px',
          background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)',
          borderBottom: '1px solid #E5E4E3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <h3 id="modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1F1C1B', lineHeight: 1.4 }}>
            {title}
          </h3>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close details"
            style={{
              background: 'none', border: 'none', padding: '4px', margin: '-4px',
              cursor: 'pointer', color: '#747470', borderRadius: '4px'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '24px', fontSize: '15px', lineHeight: 1.6, color: '#524C4B' }}>
          {info}
        </div>
      </div>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

// ==========================================
// SCENES (Claymorphic, Full-Bleed, Interactive objects)
// ==========================================
function SvgObj({ id, x, y, r, label, sub, color, active, onClick }: any) {
  const isAct = active === id;
  return (
    <g 
      id={`hs-${id}`}
      role="button" 
      tabIndex={0} 
      onClick={() => onClick(id)}
      onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onClick(id); } }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <circle cx={x} cy={y} r={r+6} fill={color} opacity={isAct ? 0.2 : 0} style={{ transition: 'opacity 0.2s' }} />
      <circle cx={x} cy={y} r={r} fill={color} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
      <circle cx={x-r/3} cy={y-r/3} r={r/2} fill="#ffffff" opacity="0.15" />
      
      <text x={x} y={y} textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="700" style={{ pointerEvents: 'none' }}>{label}</text>
      {sub && <text x={x} y={y+16} textAnchor="middle" fill="#FFFFFF" opacity="0.9" fontSize="12" style={{ pointerEvents: 'none' }}>{sub}</text>}
      
      <circle cx={x} cy={y} r={r+2} fill="none" stroke={isAct ? '#1F1C1B' : 'transparent'} strokeWidth="3" />
    </g>
  );
}

function Scene1({ active, onHotspot }: any) {
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CI_THEME.deep} />
        </marker>
      </defs>
      <circle cx="800" cy="0" r="300" fill={CI_THEME.lightTeal} opacity="0.4" />
      <circle cx="0" cy="600" r="250" fill={CI_THEME.orange} opacity="0.05" />

      <line x1="400" y1="180" x2="400" y2="250" stroke={CI_THEME.deep} strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="8 4" />
      <line x1="400" y1="350" x2="400" y2="420" stroke={CI_THEME.deep} strokeWidth="4" markerEnd="url(#arrow)" strokeDasharray="8 4" />

      <SvgObj id="authority-chain" x={400} y={130} r={50} label="Physician" sub="Orders" color={CI_THEME.deep} active={active} onClick={onHotspot} />
      <SvgObj id="authority-chain" x={400} y={300} r={50} label="RN" sub="Supervises" color={CI_THEME.primary} active={active} onClick={onHotspot} />
      <SvgObj id="lvn-boundary" x={400} y={470} r={50} label="LVN" sub="Implements" color={CI_THEME.orange} active={active} onClick={onHotspot} />

      <text x="400" y="560" textAnchor="middle" fill={CI_THEME.muted} fontSize="14" fontWeight="600">The LVN implements authorized directives — never independently modifies</text>
    </svg>
  );
}

function Scene2({ active, onHotspot }: any) {
  const blocks = [
    { id: 'demo', label: 'Demographics', x: 200, y: 150, c: '#E5E4E3', tc: '#1F1C1B' },
    { id: 'dx', label: 'Diagnoses', x: 420, y: 150, c: '#E5E4E3', tc: '#1F1C1B' },
    { id: 'orders-block', label: 'Orders & Services', x: 200, y: 280, c: CI_THEME.primary, tc: '#FFFFFF' },
    { id: 'goal', label: 'Goals', x: 420, y: 280, c: '#E5E4E3', tc: '#1F1C1B' },
    { id: 'lvn-data', label: 'LVN Data Role', x: 310, y: 410, c: CI_THEME.orange, tc: '#FFFFFF' },
  ];

  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <rect x="150" y="60" width="500" height="480" fill="#FFFFFF" rx="20" style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.05))' }} />
      <text x="400" y="100" textAnchor="middle" fill={CI_THEME.deep} fontSize="20" fontWeight="800">CMS-485 Blueprint</text>
      
      {blocks.map(b => (
        <g 
          key={b.id} id={`hs-${b.id}`} role="button" tabIndex={0} 
          onClick={() => onHotspot(b.id)}
          onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onHotspot(b.id); } }}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <rect x={b.x} y={b.y} width="180" height="80" rx="12" fill={b.c} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
          <rect x={b.x} y={b.y} width="180" height="80" rx="12" fill="none" stroke={active === b.id ? '#1F1C1B' : 'transparent'} strokeWidth="3" />
          <text x={b.x + 90} y={b.y + 45} textAnchor="middle" fill={b.tc} fontSize="16" fontWeight="700" style={{ pointerEvents: 'none' }}>{b.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Scene3({ active, onHotspot }: any) {
  const days = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <text x="400" y="80" textAnchor="middle" fill={CI_THEME.deep} fontSize="24" fontWeight="800">Frequency Decoder: 3W2, 2W2, 1W2</text>
      
      <g transform="translate(100, 120)">
        {days.map((d, i) => (
          <text key={d} x={i*85 + 42} y="30" textAnchor="middle" fill={CI_THEME.muted} fontSize="14" fontWeight="700">{d}</text>
        ))}
        
        <g id="hs-decode" role="button" tabIndex={0} onClick={() => onHotspot('decode')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('decode'); }} style={{ cursor: 'pointer', outline: 'none' }}>
          <rect x={0} y={40} width={600} height={100} fill={CI_THEME.lightTeal} rx="12" stroke={active==='decode'?CI_THEME.ink:'transparent'} strokeWidth="2" />
          <text x="-40" y="75" fill={CI_THEME.deep} fontSize="16" fontWeight="700">W1</text>
          <text x="-40" y="125" fill={CI_THEME.deep} fontSize="16" fontWeight="700">W2</text>
          {[0, 2, 4].map(col => <rect key={`w1-${col}`} x={col*85+10} y={50} width="65" height="35" rx="8" fill={CI_THEME.primary} />)}
          {[0, 2, 4].map(col => <rect key={`w2-${col}`} x={col*85+10} y={95} width="65" height="35" rx="8" fill={CI_THEME.primary} />)}
        </g>

        <g id="hs-prn-gate" role="button" tabIndex={0} onClick={() => onHotspot('prn-gate')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('prn-gate'); }} style={{ cursor: 'pointer', outline: 'none' }} transform="translate(0, 300)">
          <rect x={0} y={0} width={600} height={80} fill={CI_THEME.orange} rx="12" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} stroke={active==='prn-gate'?CI_THEME.ink:'transparent'} strokeWidth="2" />
          <text x="300" y="45" textAnchor="middle" fill="#FFF" fontSize="18" fontWeight="700" style={{ pointerEvents: 'none' }}>PRN Gate: RN / MD Authorization Required</text>
        </g>
      </g>
    </svg>
  );
}

function Scene4({ active, onHotspot }: any) {
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <text x="400" y="100" textAnchor="middle" fill={CI_THEME.deep} fontSize="24" fontWeight="800">Delegation & Accountability</text>
      
      <g id="hs-five-rights" role="button" tabIndex={0} onClick={() => onHotspot('five-rights')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('five-rights'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="200" y="150" width="400" height="80" rx="16" fill={CI_THEME.lightTeal} stroke={active==='five-rights'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="400" y="195" textAnchor="middle" fill={CI_THEME.deep} fontSize="18" fontWeight="700" style={{ pointerEvents: 'none' }}>NCSBN Five Rights of Delegation</text>
      </g>

      <g id="hs-acct-vs-resp" role="button" tabIndex={0} onClick={() => onHotspot('acct-vs-resp')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('acct-vs-resp'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="150" y="280" width="230" height="150" rx="16" fill={CI_THEME.primary} style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }} stroke={active==='acct-vs-resp'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="265" y="340" textAnchor="middle" fill="#FFF" fontSize="20" fontWeight="700" style={{ pointerEvents: 'none' }}>RN</text>
        <text x="265" y="370" textAnchor="middle" fill="#FFF" fontSize="16" opacity="0.9" style={{ pointerEvents: 'none' }}>Accountability</text>
        
        <rect x="420" y="280" width="230" height="150" rx="16" fill={CI_THEME.orange} style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }} stroke={active==='acct-vs-resp'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="535" y="340" textAnchor="middle" fill="#FFF" fontSize="20" fontWeight="700" style={{ pointerEvents: 'none' }}>LVN</text>
        <text x="535" y="370" textAnchor="middle" fill="#FFF" fontSize="16" opacity="0.9" style={{ pointerEvents: 'none' }}>Responsibility</text>
      </g>
    </svg>
  );
}

function Scene5({ active, onHotspot }: any) {
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <text x="400" y="80" textAnchor="middle" fill={CI_THEME.deep} fontSize="24" fontWeight="800">Change Response Protocol</text>

      <g id="hs-protocol" role="button" tabIndex={0} onClick={() => onHotspot('protocol')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('protocol'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="100" y="140" width="600" height="120" rx="16" fill={CI_THEME.primary} stroke={active==='protocol'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="400" y="190" textAnchor="middle" fill="#FFF" fontSize="20" fontWeight="700" style={{ pointerEvents: 'none' }}>Recognize → Assess → Intervene</text>
        <text x="400" y="220" textAnchor="middle" fill="#FFF" fontSize="14" opacity="0.9" style={{ pointerEvents: 'none' }}>(Within strict POC parameters)</text>
      </g>

      <g id="hs-stay-notify" role="button" tabIndex={0} onClick={() => onHotspot('stay-notify')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('stay-notify'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="250" y="320" width="300" height="120" rx="16" fill={CI_THEME.orange} stroke={active==='stay-notify'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="400" y="370" textAnchor="middle" fill="#FFF" fontSize="20" fontWeight="700" style={{ pointerEvents: 'none' }}>Stay & Notify</text>
        <text x="400" y="400" textAnchor="middle" fill="#FFF" fontSize="14" opacity="0.9" style={{ pointerEvents: 'none' }}>Call RN from the home</text>
      </g>
    </svg>
  );
}

function Scene6({ active, onHotspot }: any) {
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <text x="400" y="80" textAnchor="middle" fill={CI_THEME.deep} fontSize="24" fontWeight="800">Scope Boundaries</text>

      <g id="hs-within" role="button" tabIndex={0} onClick={() => onHotspot('within')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('within'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="100" y="150" width="280" height="300" rx="20" fill={CI_THEME.primary} style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} stroke={active==='within'?CI_THEME.ink:'transparent'} strokeWidth="3" />
        <circle cx="240" cy="220" r="30" fill="#FFF" opacity="0.2" />
        <path d="M225 220 L235 230 L255 210" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="240" y="290" textAnchor="middle" fill="#FFF" fontSize="22" fontWeight="700" style={{ pointerEvents: 'none' }}>Within Scope</text>
        <text x="240" y="320" textAnchor="middle" fill="#FFF" fontSize="14" opacity="0.9" style={{ pointerEvents: 'none' }}>Ordered meds & treatments</text>
      </g>

      <g id="hs-outside" role="button" tabIndex={0} onClick={() => onHotspot('outside')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('outside'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="420" y="150" width="280" height="300" rx="20" fill={CI_THEME.orange} style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} stroke={active==='outside'?CI_THEME.ink:'transparent'} strokeWidth="3" />
        <circle cx="560" cy="220" r="30" fill="#FFF" opacity="0.2" />
        <path d="M545 205 L575 235 M575 205 L545 235" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="560" y="290" textAnchor="middle" fill="#FFF" fontSize="22" fontWeight="700" style={{ pointerEvents: 'none' }}>Outside Scope</text>
        <text x="560" y="320" textAnchor="middle" fill="#FFF" fontSize="14" opacity="0.9" style={{ pointerEvents: 'none' }}>Initial OASIS & Plan Create</text>
      </g>
    </svg>
  );
}

function Scene7({ active, onHotspot }: any) {
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ background: CI_THEME.bg }}>
      <text x="400" y="100" textAnchor="middle" fill={CI_THEME.deep} fontSize="24" fontWeight="800">60-Day Certification Orbit</text>

      <line x1="100" y1="300" x2="700" y2="300" stroke={CI_THEME.border} strokeWidth="8" strokeLinecap="round" />
      
      <g id="hs-orbit" role="button" tabIndex={0} onClick={() => onHotspot('orbit')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('orbit'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <rect x="250" y="260" width="300" height="80" rx="40" fill={CI_THEME.primary} stroke={active==='orbit'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="400" y="306" textAnchor="middle" fill="#FFF" fontSize="18" fontWeight="700" style={{ pointerEvents: 'none' }}>Day 1 — 60: LVN Implementation</text>
      </g>

      <g id="hs-data-lifeblood" role="button" tabIndex={0} onClick={() => onHotspot('data-lifeblood')} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') onHotspot('data-lifeblood'); }} style={{ cursor: 'pointer', outline: 'none' }}>
        <circle cx="650" cy="300" r="40" fill={CI_THEME.orange} stroke={active==='data-lifeblood'?CI_THEME.ink:'transparent'} strokeWidth="2" />
        <text x="650" y="280" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="700" style={{ pointerEvents: 'none' }}>Day 55-60</text>
        <text x="650" y="315" textAnchor="middle" fill="#FFF" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>Recert</text>
      </g>
    </svg>
  );
}

// ==========================================
// NEW LEFT PANEL COMPONENT
// ==========================================
function Lvn005LeftPanel({ page, pageNumber, totalPages, onNext, onPrev, isLast }: any) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [pageNumber]);

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: CI_THEME.primary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
        Lesson {pageNumber} of {totalPages}
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 800, color: CI_THEME.deep, lineHeight: 1.2 }}>
        {page.title}
      </h1>
      <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 500, color: CI_THEME.muted, lineHeight: 1.4 }}>
        {page.subtitle}
      </h2>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: `1px solid ${CI_THEME.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '17px', color: CI_THEME.ink, lineHeight: 1.6, fontWeight: 600 }}>
          {page.bullets[0]}
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => setExpanded(!expanded)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', background: CI_THEME.lightTeal, border: 'none', borderRadius: '12px', color: CI_THEME.deep, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
        >
          View Full Lesson Details
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expanded && (
          <div style={{ padding: '20px 8px', color: CI_THEME.ink, fontSize: '16px', lineHeight: 1.6, animation: 'fadeIn 0.2s' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {page.bullets.slice(1).map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {page.callouts && page.callouts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {page.callouts.map((c: any, i: number) => {
            const isWarn = c.kind === 'warning';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: isWarn ? '#FEF2F2' : '#F9FAFB', border: `1px solid ${isWarn ? '#FECACA' : CI_THEME.border}`, borderRadius: '12px' }}>
                <div style={{ color: isWarn ? CI_THEME.orange : CI_THEME.primary, marginTop: '2px' }}>
                  {isWarn ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: isWarn ? CI_THEME.orange : CI_THEME.muted, marginBottom: '4px' }}>
                    {c.kind}
                  </div>
                  <div style={{ fontSize: '14px', color: CI_THEME.ink, lineHeight: 1.5 }}>
                    {c.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', gap: '16px' }}>
        <button 
          onClick={onPrev} disabled={pageNumber === 1}
          style={{ padding: '16px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#FFFFFF', border: `1px solid ${CI_THEME.border}`, borderRadius: '12px', color: pageNumber === 1 ? '#D1D5DB' : CI_THEME.deep, fontWeight: 700, cursor: pageNumber === 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={20} style={{ marginRight: '8px' }} /> Previous
        </button>
        <button 
          onClick={onNext}
          style={{ padding: '16px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: CI_THEME.primary, border: 'none', borderRadius: '12px', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 121, 112, 0.2)' }}
        >
          {isLast ? 'Start Quiz' : 'Next Lesson'} <ChevronRight size={20} style={{ marginLeft: '8px' }} />
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function LVN005PlanOfCare() {
  const [pageIndex, setPageIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const page = PAGES[pageIndex];

  const handleNext = () => {
    setActiveHotspot(null);
    if (pageIndex < PAGES.length - 1) setPageIndex(pageIndex + 1);
    else setQuizMode(true);
  };
  const handlePrev = () => {
    setActiveHotspot(null);
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const getScene = () => {
    const props = { active: activeHotspot, onHotspot: (id: string) => {
      setActiveHotspot(prev => prev === id ? null : id);
    }};
    switch (pageIndex) {
      case 0: return <Scene1 {...props} />;
      case 1: return <Scene2 {...props} />;
      case 2: return <Scene3 {...props} />;
      case 3: return <Scene4 {...props} />;
      case 4: return <Scene5 {...props} />;
      case 5: return <Scene6 {...props} />;
      case 6: return <Scene7 {...props} />;
      default: return null;
    }
  };

  if (quizMode) {
    const score = Math.round((Object.keys(answers).filter(k => QUIZ[parseInt(k.replace('q','')) - 1]?.correct === answers[k]).length / QUIZ.length) * 100);
    const isPassed = score >= MODULE_META.passing;
    const answeredCount = Object.keys(answers).length;

    if (submitted) {
      return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: CI_THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '24px 32px', background: CI_THEME.primary, color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{MODULE_META.id} · Knowledge Assessment Results</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Scope boundaries validation only</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 24, background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 8 }}>
              {score}%
            </div>
          </header>
          <main style={{ flex: 1, padding: 32, maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <div style={{ background: isPassed ? CI_THEME.lightTeal : '#FEF2F2', border: `2px solid ${isPassed ? CI_THEME.primary : '#EF4444'}`, borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{isPassed ? '✓' : '↻'}</div>
              <h2 style={{ margin: '0 0 12px', color: isPassed ? CI_THEME.primary : '#991B1B', fontWeight: 800, fontSize: 22 }}>
                {isPassed ? 'Knowledge Check Passed' : 'Review & Retry'}
              </h2>
            </div>
            {QUIZ.map((q, i) => {
              const ua = answers[`q${i+1}`];
              const ok = ua === q.correct;
              return (
                <div key={q.id} style={{ background: '#FFF', border: '1px solid #E5E4E3', borderRadius: 16, padding: 20, marginBottom: 16, borderColor: ok ? CI_THEME.primary : '#EF4444' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{i + 1}. {q.question}</div>
                  <div style={{ fontSize: 13, color: ok ? CI_THEME.primary : '#991B1B', fontWeight: 600 }}>Your answer: {q.options[ua]}</div>
                  {!ok && <div style={{ fontSize: 13, color: CI_THEME.primary, marginTop: 4, fontWeight: 600 }}>Correct: {q.options[q.correct]}</div>}
                  <div style={{ fontSize: 13, marginTop: 12, padding: 12, background: CI_THEME.bg, borderRadius: 8, borderLeft: `3px solid ${CI_THEME.orange}` }}>
                    <strong>Rationale:</strong> {q.rationale}
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {!isPassed && (
                <button onClick={() => { setSubmitted(false); setAnswers({}); }} style={{ padding: '14px 28px', background: CI_THEME.orange, color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Retry Quiz</button>
              )}
              <button onClick={() => { setQuizMode(false); setPageIndex(0); setSubmitted(false); setAnswers({}); }} style={{ padding: '14px 28px', background: isPassed ? CI_THEME.primary : '#FFF', color: isPassed ? '#FFF' : CI_THEME.ink, border: isPassed ? 'none' : '1px solid #E5E4E3', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                {isPassed ? 'Review Module Again' : 'Restart Module'}
              </button>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: CI_THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '24px 32px', background: CI_THEME.primary, color: '#FFF' }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{MODULE_META.id} — Knowledge Assessment</div>
        </header>
        <main style={{ flex: 1, padding: 32, maxWidth: 800, margin: '0 auto', width: '100%' }}>
          {QUIZ.map((q, i) => {
            const ua = answers[`q${i+1}`];
            return (
              <div key={q.id} style={{ background: '#FFF', border: '1px solid #E5E4E3', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{i + 1}. {q.question}</div>
                {q.options.map((opt, oi) => {
                  const isChosen = ua === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswers(p => ({ ...p, [`q${i+1}`]: oi }))}
                      style={{
                        display: 'flex', width: '100%', textAlign: 'left', gap: 12, padding: '12px 16px', marginBottom: 8,
                        borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${isChosen ? CI_THEME.primary : '#E5E4E3'}`,
                        background: isChosen ? CI_THEME.lightTeal : '#FFF',
                        color: isChosen ? CI_THEME.primary : CI_THEME.ink,
                        fontWeight: isChosen ? 600 : 400
                      }}
                    >
                      <span style={{ minWidth: 22, height: 22, borderRadius: 6, background: isChosen ? CI_THEME.primary : CI_THEME.bg, color: isChosen ? '#FFF' : CI_THEME.muted, border: `1px solid ${isChosen ? CI_THEME.primary : '#E5E4E3'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
          <button
            disabled={answeredCount < QUIZ.length}
            onClick={() => setSubmitted(true)}
            style={{ width: '100%', padding: 16, background: answeredCount === QUIZ.length ? CI_THEME.orange : '#E5E4E3', color: answeredCount === QUIZ.length ? '#FFF' : '#A0A0A0', border: 'none', borderRadius: 8, fontWeight: 700, cursor: answeredCount === QUIZ.length ? 'pointer' : 'not-allowed', marginTop: 16 }}
          >
            Submit Assessment ({answeredCount}/{QUIZ.length})
          </button>
        </main>
      </div>
    );
  }

  const activeSpotData = activeHotspot ? page.hotspots.find((h: any) => h.id === activeHotspot) : null;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#FFFFFF' }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: '400px', flexShrink: 0, borderRight: `1px solid ${CI_THEME.border}`, background: CI_THEME.bg, zIndex: 10 }}>
        <Lvn005LeftPanel 
          page={page} 
          pageNumber={pageIndex + 1} 
          totalPages={PAGES.length}
          onNext={handleNext}
          onPrev={handlePrev}
          isLast={pageIndex === PAGES.length - 1}
        />
      </div>

      {/* RIGHT PANEL (FULL BLEED SCENE) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: CI_THEME.bg }}>
        {getScene()}
      </div>

      <Lvn005SceneModal
        isOpen={activeHotspot !== null}
        onClose={() => setActiveHotspot(null)}
        title={activeSpotData?.label || ''}
        info={activeSpotData?.detail || ''}
        triggerRef={activeHotspot ? { current: document.getElementById('hs-' + activeHotspot) } : undefined}
      />
    </div>
  );
}

