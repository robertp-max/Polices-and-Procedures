/**
 * LVN-005 — Plan of Care: Working Under RN/Physician POC
 * Version: 5.0 | Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Track: LVN — Licensed Vocational Nurse
 * Regulatory: 42 CFR § 484.60 | CA B&P § 2860 | Agency policy CL-CP-001
 * Critical scope: LVN works UNDER existing RN/physician POC — never develops/modifies independently.
 */
import React, { useCallback, useMemo, useState } from 'react';

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

/** Balanced distribution A=3, B=3, C=2, D=2 */
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

function Badge({ kind, children }: { kind: string; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; fg: string; border: string }> = {
    federal: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
    california: { bg: '#F5F3FF', fg: '#6D28D9', border: '#DDD6FE' },
    agency: { bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
    guidance: { bg: '#ECFEFF', fg: '#0E7490', border: '#A5F3FC' },
    key: { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
    warning: { bg: '#FEF2F2', fg: '#B91C1C', border: '#FECACA' },
  };
  const s = styles[kind] || styles.key;
  const label =
    kind === 'federal'
      ? 'Federal'
      : kind === 'california'
        ? 'California law'
        : kind === 'agency'
          ? 'Agency policy'
          : kind === 'guidance'
            ? 'Professional guidance'
            : kind === 'warning'
              ? 'Warning'
              : 'Key point';
  return (
    <div
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        padding: '10px 12px',
        marginTop: 10,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </strong>
      {children}
    </div>
  );
}

function ProgressBar({ pageIndex, total, mode }: { pageIndex: number; total: number; mode: 'learn' | 'quiz' | 'results' }) {
  const pct =
    mode === 'results' ? 100 : mode === 'quiz' ? 92 : Math.round(((pageIndex + 1) / total) * 85);
  return (
    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.teal})`,
          transition: 'width 0.35s ease',
        }}
      />
    </div>
  );
}

/** Page 1 — Authority constellation */
function SceneAuthority({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const nodes = [
    { id: 'md', label: 'Physician', sub: 'Orders / certifies', cx: 200, cy: 70, r: 34, fill: THEME.physician },
    { id: 'rn', label: 'RN', sub: 'Interprets / supervises', cx: 200, cy: 175, r: 30, fill: THEME.rn },
    { id: 'lvn', label: 'LVN', sub: 'Implements only', cx: 200, cy: 280, r: 26, fill: THEME.lvn },
  ];
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="POC authority chain">
      <defs>
        <linearGradient id="authBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#authBg)" rx="16" />
      {[40, 90, 140, 220, 300, 350].map((x, i) => (
        <circle key={i} cx={x} cy={(i * 47) % 320 + 20} r={1.2} fill="#94A3B8" opacity={0.5}>
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <line x1="200" y1="104" x2="200" y2="145" stroke="#A5B4FC" strokeWidth="3" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;16" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1="200" y1="205" x2="200" y2="254" stroke="#FCD34D" strokeWidth="3" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;16" dur="1.2s" repeatCount="indefinite" />
      </line>
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 8} fill={n.fill} opacity={0.15}>
            <animate attributeName="r" values={`${n.r + 6};${n.r + 14};${n.r + 6}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.fill} />
          <text x={n.cx} y={n.cy - 2} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
            {n.label}
          </text>
          <text x={n.cx} y={n.cy + 12} textAnchor="middle" fill="#F8FAFC" fontSize="9" opacity={0.9}>
            {n.sub}
          </text>
        </g>
      ))}
      <text x="200" y="330" textAnchor="middle" fill="#C4B5FD" fontSize="11" fontWeight="600">
        Physician → RN → LVN (no reverse plan writing)
      </text>
      {/* hotspot targets */}
      <g
        style={{ cursor: 'pointer' }}
        onClick={() => onHotspot('authority-chain')}
        opacity={active === 'authority-chain' ? 1 : 0.85}
      >
        <circle cx="200" cy="136" r="16" fill={THEME.primary} stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="140" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('lvn-boundary')}>
        <circle cx="288" cy="280" r="16" fill={THEME.lvn} stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <text x="288" y="284" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 2 — CMS-485 blueprint */
function SceneCms485({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const blocks = [
    { id: 'demo', label: 'Demographics\n& cert window', x: 30, y: 50, c: THEME.info },
    { id: 'dx', label: 'Diagnoses\nICD-10', x: 210, y: 50, c: THEME.error },
    { id: 'lim', label: 'Functional\nlimitations', x: 30, y: 140, c: THEME.accent },
    { id: 'ord', label: 'Orders &\nservices ★', x: 210, y: 140, c: THEME.success },
    { id: 'goal', label: 'Goals &\nrehab potential', x: 30, y: 230, c: '#8B5CF6' },
    { id: 'dme', label: 'Meds &\nDME', x: 210, y: 230, c: THEME.teal },
  ];
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="CMS-485 blueprint sections">
      <rect width="400" height="360" fill="#0B1F33" rx="16" />
      <g opacity={0.2} stroke="#3B82F6">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 36} y1={0} x2={i * 36} y2={360} strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} strokeWidth="1" />
        ))}
      </g>
      <text x="200" y="28" textAnchor="middle" fill="#93C5FD" fontSize="13" fontWeight="700">
        CMS-485 Exploded Blueprint
      </text>
      {blocks.map((b) => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width="160" height="70" rx="10" fill={b.c} opacity={0.9} />
          {b.label.split('\n').map((line, i) => (
            <text key={i} x={b.x + 80} y={b.y + 30 + i * 16} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">
              {line}
            </text>
          ))}
        </g>
      ))}
      <text x="200" y="330" textAnchor="middle" fill="#BFDBFE" fontSize="11">
        LVN implements orders — RN/MD complete the form
      </text>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('orders-block')}>
        <circle cx={210 + 140} cy={140 + 20} r="15" fill="#fff" stroke={THEME.success} strokeWidth="3" opacity={active === 'orders-block' ? 1 : 0.9}>
          <animate attributeName="r" values="13;17;13" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <text x={210 + 140} y={140 + 24} textAnchor="middle" fill={THEME.success} fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('lvn-data')}>
        <circle cx="90" cy="280" r="15" fill="#fff" stroke={THEME.info} strokeWidth="3">
          <animate attributeName="r" values="13;17;13" dur="2.7s" repeatCount="indefinite" />
        </circle>
        <text x="90" y="284" textAnchor="middle" fill={THEME.info} fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 3 — Visit frequency calendar */
function SceneFrequency({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeks = [
    [1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
  ];
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="Visit frequency calendar">
      <rect width="400" height="360" fill="#F5F3FF" rx="16" />
      <text x="200" y="28" textAnchor="middle" fill={THEME.primaryDark} fontSize="13" fontWeight="700">
        Frequency Decoder — SN 3W2, 2W2, 1W2
      </text>
      {days.map((d, i) => (
        <text key={d + i} x={70 + i * 42} y="56" textAnchor="middle" fill={THEME.muted} fontSize="11" fontWeight="600">
          {d}
        </text>
      ))}
      {weeks.map((row, wi) => (
        <g key={wi}>
          <text x="28" y={88 + wi * 40} fill={THEME.muted} fontSize="10">
            W{wi + 1}
          </text>
          {row.map((on, di) => (
            <rect
              key={di}
              x={52 + di * 42}
              y={70 + wi * 40}
              width="34"
              height="30"
              rx="6"
              fill={on ? (wi < 2 ? THEME.teal : wi < 4 ? THEME.info : THEME.accent) : '#E2E8F0'}
              opacity={on ? 0.95 : 0.6}
            />
          ))}
        </g>
      ))}
      <rect x="40" y="310" width="12" height="12" rx="3" fill={THEME.teal} />
      <text x="58" y="320" fill={THEME.text} fontSize="10">
        3×/wk
      </text>
      <rect x="110" y="310" width="12" height="12" rx="3" fill={THEME.info} />
      <text x="128" y="320" fill={THEME.text} fontSize="10">
        2×/wk
      </text>
      <rect x="180" y="310" width="12" height="12" rx="3" fill={THEME.accent} />
      <text x="198" y="320" fill={THEME.text} fontSize="10">
        1×/wk
      </text>
      <text x="280" y="320" fill={THEME.muted} fontSize="10">
        Spread visits — no clustering
      </text>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('decode')}>
        <circle cx="120" cy="110" r="16" fill={THEME.primary} stroke="#fff" strokeWidth="2" opacity={active === 'decode' ? 1 : 0.9}>
          <animate attributeName="opacity" values="0.65;1;0.65" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="120" y="114" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('prn-gate')}>
        <circle cx="320" cy="250" r="16" fill={THEME.error} stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="0.65;1;0.65" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <text x="320" y="254" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 4 — Delegation waterfall */
function SceneDelegation({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const cols = [
    { label: 'RN', color: THEME.rn, tasks: ['Assess', 'Plan', 'Supervise', 'OASIS'] },
    { label: 'LVN', color: THEME.lvn, tasks: ['Vitals', 'Wound protocol', 'Meds ordered', 'Educate/plan', 'Data'], highlight: true },
    { label: 'PT', color: THEME.info, tasks: ['Mobility', 'Gait', 'Exercise'] },
    { label: 'HHA', color: THEME.success, tasks: ['Personal care', 'Support'] },
  ];
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="Delegation waterfall">
      <rect width="400" height="360" fill="#0F172A" rx="16" />
      <rect x="40" y="24" width="320" height="44" rx="12" fill={THEME.physician} />
      <text x="200" y="52" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
        Physician POC Directive
      </text>
      {cols.map((c, i) => {
        const x = 28 + i * 92;
        return (
          <g key={c.label}>
            <path d={`M${x + 36},68 L${x + 36},100`} stroke={c.color} strokeWidth="3" />
            <rect
              x={x}
              y={100}
              width="80"
              height={c.highlight ? 200 : 160}
              rx="10"
              fill={c.color}
              opacity={c.highlight ? 1 : 0.85}
              stroke={c.highlight ? '#fff' : 'none'}
              strokeWidth={c.highlight ? 2 : 0}
            />
            <text x={x + 40} y="122" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
              {c.label}
            </text>
            {c.tasks.map((t, ti) => (
              <text key={t} x={x + 40} y={148 + ti * 18} textAnchor="middle" fill="#F8FAFC" fontSize="9">
                {t}
              </text>
            ))}
          </g>
        );
      })}
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('five-rights')}>
        <circle cx="200" cy="150" r="16" fill={THEME.primary} stroke="#fff" strokeWidth="2" opacity={active === 'five-rights' ? 1 : 0.9}>
          <animate attributeName="r" values="14;18;14" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="154" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('acct-vs-resp')}>
        <circle cx="312" cy="300" r="16" fill={THEME.lvn} stroke="#fff" strokeWidth="2">
          <animate attributeName="r" values="14;18;14" dur="2.9s" repeatCount="indefinite" />
        </circle>
        <text x="312" y="304" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 5 — Change alert radar */
function SceneChange({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const items = [
    { label: 'New order', a: -90, c: THEME.info },
    { label: 'Dose change', a: -18, c: THEME.error },
    { label: 'Frequency', a: 54, c: THEME.accent },
    { label: 'Goal revise', a: 126, c: THEME.success },
    { label: 'DC plan', a: 198, c: '#8B5CF6' },
  ];
  const cx = 200;
  const cy = 170;
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="Change response radar">
      <rect width="400" height="360" fill="#1E1B4B" rx="16" />
      {[40, 70, 100, 130].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="2">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx={cx} cy={cy} r="28" fill={THEME.error} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        ALERT
      </text>
      {items.map((it) => {
        const rad = (it.a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 110;
        const y = cy + Math.sin(rad) * 110;
        return (
          <g key={it.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={it.c} strokeWidth="2" opacity={0.5} />
            <circle cx={x} cy={y} r="22" fill={it.c} />
            <text x={x} y={y + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">
              {it.label}
            </text>
          </g>
        );
      })}
      <text x="200" y="320" textAnchor="middle" fill="#E9D5FF" fontSize="11">
        Receive → Verify → Implement (scope) → Notify → Document
      </text>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('protocol')}>
        <circle cx="200" cy="170" r="18" fill="#fff" stroke={THEME.error} strokeWidth="3" opacity={active === 'protocol' ? 1 : 0.95}>
          <animate attributeName="r" values="16;20;16" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="174" textAnchor="middle" fill={THEME.error} fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('stay-notify')}>
        <circle cx="70" cy="300" r="16" fill={THEME.info} stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="70" y="304" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 6 — Scope force field */
function SceneScope({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const within = ['Vitals', 'Meds ordered', 'Wound protocol', 'Educate/plan', 'Specimens', 'Data to RN'];
  const outside = ['Create POC', 'Modify POC', 'OASIS complete', 'Discharge decide', 'Indep. plan', 'HHA supervise'];
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="LVN scope boundaries">
      <defs>
        <linearGradient id="scopeSplit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="49%" stopColor="#ECFDF5" />
          <stop offset="51%" stopColor="#FEF2F2" />
          <stop offset="100%" stopColor="#FEF2F2" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#scopeSplit)" rx="16" />
      <rect x="196" y="20" width="8" height="320" rx="4" fill={THEME.primary}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="100" y="40" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="700">
        WITHIN LVN + POC
      </text>
      <text x="300" y="40" textAnchor="middle" fill="#B91C1C" fontSize="12" fontWeight="700">
        OUTSIDE LVN ROLE
      </text>
      {within.map((t, i) => (
        <g key={t}>
          <rect x="24" y={58 + i * 40} width="150" height="30" rx="8" fill="#10B981" opacity={0.9} />
          <text x="99" y={78 + i * 40} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
            {t}
          </text>
        </g>
      ))}
      {outside.map((t, i) => (
        <g key={t}>
          <rect x="226" y={58 + i * 40} width="150" height="30" rx="8" fill="#EF4444" opacity={0.9} />
          <text x="301" y={78 + i * 40} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
            {t}
          </text>
        </g>
      ))}
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('within')}>
        <circle cx="100" cy="310" r="16" fill="#047857" stroke="#fff" strokeWidth="2" opacity={active === 'within' ? 1 : 0.9}>
          <animate attributeName="r" values="14;18;14" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <text x="100" y="314" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('outside')}>
        <circle cx="300" cy="310" r="16" fill="#B91C1C" stroke="#fff" strokeWidth="2">
          <animate attributeName="r" values="14;18;14" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <text x="300" y="314" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

/** Page 7 — 60-day certification orbit */
function SceneCert({ active, onHotspot }: { active: string | null; onHotspot: (id: string) => void }) {
  const milestones = [
    { label: 'SOC', day: 'D1', angle: -90, c: THEME.success },
    { label: 'Orders', day: 'D1–2', angle: -30, c: THEME.accent },
    { label: 'F2F', day: '~D30', angle: 40, c: '#8B5CF6' },
    { label: 'Recert', day: 'D50–60', angle: 120, c: THEME.error },
  ];
  const cx = 200;
  const cy = 175;
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" role="img" aria-label="60-day certification orbit">
      <rect width="400" height="360" fill="#0B1026" rx="16" />
      <ellipse cx={cx} cy={cy} rx="150" ry="95" fill="none" stroke="rgba(124,58,237,0.45)" strokeWidth="2" strokeDasharray="6 4" />
      <ellipse cx={cx} cy={cy} rx="100" ry="62" fill="none" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="36" fill={THEME.info} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
        Physician
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#DBEAFE" fontSize="9">
        Order
      </text>
      {milestones.map((m) => {
        const rad = (m.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 150;
        const y = cy + Math.sin(rad) * 95;
        return (
          <g key={m.label}>
            <circle cx={x} cy={y} r="20" fill={m.c} />
            <text x={x} y={y - 2} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
              {m.label}
            </text>
            <text x={x} y={y + 10} textAnchor="middle" fill="#F8FAFC" fontSize="8">
              {m.day}
            </text>
          </g>
        );
      })}
      <text x="200" y="300" textAnchor="middle" fill="#C4B5FD" fontSize="11" fontWeight="600">
        LVN arc: continuous implementation + documentation
      </text>
      <text x="200" y="320" textAnchor="middle" fill="#94A3B8" fontSize="10">
        60-day certification cycle
      </text>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('orbit')}>
        <circle cx="200" cy="80" r="16" fill="#8B5CF6" stroke="#fff" strokeWidth="2" opacity={active === 'orbit' ? 1 : 0.9}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="84" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          1
        </text>
      </g>
      <g style={{ cursor: 'pointer' }} onClick={() => onHotspot('data-lifeblood')}>
        <circle cx="300" cy="280" r="16" fill={THEME.lvn} stroke="#fff" strokeWidth="2">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.7s" repeatCount="indefinite" />
        </circle>
        <text x="300" y="284" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
          2
        </text>
      </g>
    </svg>
  );
}

const SCENES = [SceneAuthority, SceneCms485, SceneFrequency, SceneDelegation, SceneChange, SceneScope, SceneCert];

function HotspotPanel({ page, activeId }: { page: PageDef; activeId: string | null }) {
  const hs = page.hotspots.find((h) => h.id === activeId) || page.hotspots[0];
  return (
    <div
      style={{
        marginTop: 10,
        background: 'rgba(15,23,42,0.92)',
        color: '#F8FAFC',
        borderRadius: 12,
        padding: '12px 14px',
        border: `1px solid ${page.accent}`,
        minHeight: 88,
      }}
    >
      <div style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        Hotspot · {hs.label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6 }}>{hs.detail}</div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
        Tap numbered markers on the scene ({page.hotspots.map((h) => h.label).join(' · ')})
      </div>
    </div>
  );
}

function LeftPanel({ page }: { page: PageDef }) {
  return (
    <div style={{ padding: '4px 4px 24px' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={chipStyle(THEME.primarySoft, THEME.primaryDark)}>{MODULE_META.cms}</span>
        <span style={chipStyle('#F5F3FF', THEME.primary)}>{MODULE_META.california}</span>
        <span style={chipStyle('#FFF7ED', '#C2410C')}>{MODULE_META.policy}</span>
      </div>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, color: THEME.text, lineHeight: 1.25 }}>{page.title}</h2>
      <p style={{ margin: '0 0 14px', color: THEME.muted, fontSize: 14 }}>{page.subtitle}</p>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {page.bullets.map((b) => (
          <li key={b.slice(0, 48)} style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.5, color: THEME.text }}>
            {b}
          </li>
        ))}
      </ul>
      {page.callouts.map((c, i) => (
        <Badge key={i} kind={c.kind}>
          {c.text}
        </Badge>
      ))}
      {page.scenario && (
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: 14,
            background: '#FAFAFF',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: page.accent, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Scenario · {page.scenario.patient}
          </div>
          <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4 }}>{page.scenario.context}</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8, color: THEME.text }}>{page.scenario.body}</div>
        </div>
      )}
      {page.decision && (
        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 6,
            background: '#0F172A',
            color: '#E2E8F0',
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase' }}>Employee decision frame</div>
          {(
            [
              ['First', page.decision.first],
              ['May continue', page.decision.continue],
              ['Must stop', page.decision.stop],
              ['Notify', page.decision.notify],
              ['Document', page.decision.document],
            ] as const
          ).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12.5, lineHeight: 1.4 }}>
              <strong style={{ color: '#FDE68A' }}>{k}:</strong> {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function chipStyle(bg: string, fg: string): React.CSSProperties {
  return {
    background: bg,
    color: fg,
    borderRadius: 99,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
  };
}

function QuizView({
  answers,
  setAnswers,
  submitted,
  score,
  onSubmit,
  onRetry,
  onReview,
  reviewMode,
}: {
  answers: Record<number, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  submitted: boolean;
  score: number;
  onSubmit: () => void;
  onRetry: () => void;
  onReview: () => void;
  reviewMode: boolean;
}) {
  const passed = score >= MODULE_META.passing;
  const letters = ['A', 'B', 'C', 'D'] as const;
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 8px 40px' }}>
      <h2 style={{ margin: '0 0 8px', color: THEME.text }}>Knowledge Check — {MODULE_META.title}</h2>
      <p style={{ color: THEME.muted, fontSize: 14, marginTop: 0 }}>
        10 application questions · 80% to pass · This quiz validates <strong>knowledge only</strong>. Observed demonstration and
        authorized sign-off remain separate under agency policy.
      </p>
      {QUIZ.map((q, qi) => {
        const selected = answers[qi];
        return (
          <div
            key={q.id}
            style={{
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: THEME.text, marginBottom: 10 }}>
              {qi + 1}. {q.question}
            </div>
            {q.options.map((opt, oi) => {
              const isSel = selected === oi;
              const isCorrect = submitted && oi === q.correct;
              const isWrong = submitted && isSel && oi !== q.correct;
              let border = isSel ? THEME.primary : THEME.border;
              let bg = isSel ? THEME.primarySoft : '#FAFAFA';
              if (isCorrect) {
                border = THEME.success;
                bg = '#ECFDF5';
              }
              if (isWrong) {
                border = THEME.error;
                bg = '#FEF2F2';
              }
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    if (!submitted) setAnswers((prev) => ({ ...prev, [qi]: oi }));
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    marginBottom: 6,
                    borderRadius: 8,
                    border: `1px solid ${border}`,
                    background: bg,
                    cursor: submitted ? 'default' : 'pointer',
                    fontSize: 13,
                    color: THEME.text,
                    fontWeight: isSel ? 600 : 400,
                  }}
                >
                  <strong>{letters[oi]}.</strong> {opt}
                </button>
              );
            })}
            {submitted && (
              <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.45, color: THEME.muted }}>
                <strong style={{ color: THEME.text }}>Rationale:</strong> {q.rationale}
              </div>
            )}
          </div>
        );
      })}
      {!submitted ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={Object.keys(answers).length < QUIZ.length}
          style={primaryBtnStyle(Object.keys(answers).length < QUIZ.length)}
        >
          Submit quiz ({Object.keys(answers).length}/{QUIZ.length})
        </button>
      ) : (
        <div
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: 12,
            background: passed ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${passed ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: passed ? '#047857' : '#B91C1C' }}>
            Score: {score}% — {passed ? 'PASSED' : 'NOT PASSED'}
          </div>
          <p style={{ fontSize: 13, color: THEME.text, lineHeight: 1.5 }}>
            {passed
              ? 'Knowledge check passed. This does not alone establish practical clinical competency; complete any required skills demonstration and authorized sign-off per agency policy.'
              : 'Score below 80%. Review hotspot feedback and page content, then retry the quiz.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={onReview} style={secondaryBtnStyle}>
              {reviewMode ? 'Review answers' : 'Review answers'}
            </button>
            <button type="button" onClick={onRetry} style={primaryBtnStyle(false)}>
              Retry quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? '#C4B5FD' : THEME.primary,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '12px 18px',
  fontWeight: 700,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const secondaryBtnStyle: React.CSSProperties = {
  background: THEME.surface,
  color: THEME.primaryDark,
  border: `1px solid ${THEME.primary}`,
  borderRadius: 10,
  padding: '12px 18px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

export default function LVN005PlanOfCare() {
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'results'>('learn');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(PAGES[0].hotspots[0].id);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const page = PAGES[pageIndex];
  const Scene = SCENES[pageIndex];

  const onHotspot = useCallback((id: string) => {
    setActiveHotspot(id);
  }, []);

  const goNext = () => {
    if (pageIndex < PAGES.length - 1) {
      const next = pageIndex + 1;
      setPageIndex(next);
      setActiveHotspot(PAGES[next].hotspots[0].id);
    } else {
      setMode('quiz');
    }
  };

  const goPrev = () => {
    if (mode === 'quiz' || mode === 'results') {
      setMode('learn');
      setPageIndex(PAGES.length - 1);
      setActiveHotspot(PAGES[PAGES.length - 1].hotspots[0].id);
      return;
    }
    if (pageIndex > 0) {
      const prev = pageIndex - 1;
      setPageIndex(prev);
      setActiveHotspot(PAGES[prev].hotspots[0].id);
    }
  };

  const onSubmit = () => {
    let correct = 0;
    QUIZ.forEach((q, i) => {
      if (answers[i] === q.correct) correct += 1;
    });
    const pct = Math.round((correct / QUIZ.length) * 100);
    setScore(pct);
    setSubmitted(true);
    setReviewMode(true);
    setMode('results');
  };

  const onRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setReviewMode(false);
    setMode('quiz');
  };

  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0];
    QUIZ.forEach((q) => {
      counts[q.correct] += 1;
    });
    return counts;
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: 'Inter, system-ui, Segoe UI, Roboto, sans-serif',
      }}
      data-module-id={MODULE_META.id}
      data-version={MODULE_META.version}
      data-quiz-dist={`A${dist[0]}-B${dist[1]}-C${dist[2]}-D${dist[3]}`}
    >
      <header
        style={{
          background: THEME.surface,
          borderBottom: `1px solid ${THEME.border}`,
          padding: '12px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 600 }}>
              {MODULE_META.id} · {MODULE_META.track} · v{MODULE_META.version}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{MODULE_META.title}</div>
          </div>
          <div style={{ fontSize: 12, color: THEME.muted, textAlign: 'right' }}>
            {mode === 'learn' ? `Page ${pageIndex + 1} of ${PAGES.length}` : mode === 'quiz' ? 'Quiz' : 'Results'} · Pass {MODULE_META.passing}%
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{MODULE_META.status}</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <ProgressBar pageIndex={pageIndex} total={PAGES.length} mode={mode === 'results' ? 'results' : mode} />
        </div>
      </header>

      {mode === 'learn' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.95fr)',
            gap: 16,
            padding: 16,
            maxWidth: 1280,
            margin: '0 auto',
          }}
        >
          <main
            style={{
              background: THEME.surface,
              borderRadius: 16,
              border: `1px solid ${THEME.border}`,
              padding: 16,
              minHeight: 520,
            }}
          >
            <LeftPanel page={page} />
          </main>
          <aside
            style={{
              background: THEME.surface,
              borderRadius: 16,
              border: `1px solid ${THEME.border}`,
              padding: 12,
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.muted, marginBottom: 8, textTransform: 'uppercase' }}>
              Instructional scene
            </div>
            <div style={{ flex: 1, minHeight: 360 }}>
              <Scene active={activeHotspot} onHotspot={onHotspot} />
            </div>
            <HotspotPanel page={page} activeId={activeHotspot} />
          </aside>
        </div>
      ) : (
        <QuizView
          answers={answers}
          setAnswers={setAnswers}
          submitted={submitted}
          score={score}
          onSubmit={onSubmit}
          onRetry={onRetry}
          onReview={() => setReviewMode(true)}
          reviewMode={reviewMode}
        />
      )}

      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'rgba(255,255,255,0.96)',
          borderTop: `1px solid ${THEME.border}`,
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button type="button" onClick={goPrev} disabled={mode === 'learn' && pageIndex === 0} style={secondaryBtnStyle}>
          ← Back
        </button>
        <div style={{ fontSize: 12, color: THEME.muted, alignSelf: 'center', textAlign: 'center' }}>
          Critical rule: LVN works <strong>under</strong> the RN/physician POC — never develops or modifies the POC independently.
        </div>
        {mode === 'learn' ? (
          <button type="button" onClick={goNext} style={primaryBtnStyle(false)}>
            {pageIndex < PAGES.length - 1 ? 'Next page →' : 'Start quiz →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('learn');
              setPageIndex(0);
              setActiveHotspot(PAGES[0].hotspots[0].id);
            }}
            style={secondaryBtnStyle}
          >
            Return to learning
          </button>
        )}
      </footer>
    </div>
  );
}
