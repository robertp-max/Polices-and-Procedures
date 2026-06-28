import { type ScenarioMapping, type ScenarioCategory } from '../scenarioClassifier.js';
import { routeCriticalIncident, type IncidentTrack } from './criticalIncidentRouter.js';
import { detectIncidentProfile, composeIncidentAnswer, type IncidentProfileId } from './bradIncidentProfiles.js';
import type { BradReference, BradReferenceType } from '../harness/types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad internal responder — the REAL answer path.
   ----------------------------------------------------------------------------
   Deterministic, pure, NO internet. Brad answers internal Care Indeed
   compliance/operations questions from approved internal sources only
   (policies, procedures, workflows, forms, regulatory events, help articles),
   surfaced through the critical-incident router + scenario playbooks.

   Urgent messages (tracks 1–7 + privacy/security) ALWAYS get immediate,
   safety-first guidance — never the generic "not enough internal context"
   fallback. Lack of perfect citation retrieval never blocks urgent guidance.

   This composer NEVER emits MVP / mock / harness / stub / placeholder /
   "would answer" / "live model" / "as an AI" test wording, and NEVER reaches
   the internet. Public, non-PHI research is a SEPARATE capability
   (BradRuntime.research → audited Brad→Nolan relay) that this path never calls.

   Voice: calm, direct, practical — a competent human compliance assistant.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Shown verbatim only when there is NO urgent signal AND no grounded topic. */
export const INSUFFICIENT_CONTEXT_FALLBACK =
  'I don’t have enough internal policy context to answer safely. Please escalate this to your supervisor or the Compliance Officer now.';

export interface InternalAnswer {
  text: string;
  /** true when grounded internal guidance was produced; false → fallback used. */
  matched: boolean;
  /** Structured references the UI renders as clickable document links. */
  references: BradReference[];
  /** Broad critical-incident track the message routed to. */
  track: IncidentTrack;
  /** Diagnostics for internal logging ONLY — never surfaced in chat. */
  diagnostics: {
    category: ScenarioCategory;
    confidence: ScenarioMapping['confidence'];
    lifeSafety: boolean;
    urgent: boolean;
    matchedSignals: string[];
    source: 'classifier' | 'router' | 'none';
    path: 'incident-profile' | 'scenario-playbook' | 'internal-topic' | 'fallback';
    incidentProfile?: IncidentProfileId | null;
  };
}

/* ─── Human framing per scenario category ──────────────────────────────────
   Each lead opens with the most important action first, and names 911 for the
   life-safety categories. Categories without a custom lead use the summary. */
const CATEGORY_LEAD: Partial<Record<ScenarioCategory, string>> = {
  ABUSE_NEGLECT:
    'A caregiver seeing possible abuse is an urgent, mandatory-reporting situation. Make sure the patient is safe — call 911 if anyone is in immediate danger — then report it right away. This is report-first, not investigate-first.',
  SENTINEL_EVENT_CRITICAL:
    'Get everyone safe first and call 911 if anyone could still be in danger. This is the highest-severity situation we handle — preserve the scene, escalate immediately, and don’t draw conclusions yet.',
  PATIENT_SAFETY_EMERGENCY:
    'Treat this as a life-safety emergency — call 911 now if the patient is unresponsive, not breathing, or showing serious red flags. You cannot pronounce death; EMS and the physician come before paperwork.',
  CLINICIAN_SAFETY:
    'Get yourself to safety first — if there’s an active threat, a weapon, or anyone is hurt, call 911 now. Don’t continue the visit, and don’t try to handle the person yourself until you’re cleared.',
  ADVERSE_EVENT:
    'Make sure the patient is safe first, then treat this as a reportable event — notify the right people and document the facts now. Don’t conceal or delay it.',
  PRIVACY_BREACH:
    'Contain it first — stop the disclosure and secure the device or channel. Loop in the Privacy/Compliance Officer right away, and don’t delete or alter anything.',
  CYBERSECURITY_INCIDENT:
    'Isolate the affected systems now (disconnect from the network — don’t power off) and assume PHI is exposed until proven otherwise. Notify Information Security immediately and preserve the logs.',
  COMPLAINT:
    'Take the concern seriously and stay calm — don’t argue or admit fault. Acknowledge it, escalate it, and if any legal action is mentioned, preserve everything.',
  EMERGENCY_OPERATIONAL:
    'Activate the emergency plan and put patient triage and safety first. Document command decisions and patient contact attempts as they happen.',
  COMPLIANCE_VIOLATION:
    'Route this to the Compliance Officer through a privileged channel and preserve all documentation. Don’t discuss the details in open channels or confront anyone.',
  BILLING_RISK:
    'Pause the impacted billing, preserve the supporting documentation, and respond within the audit deadline.',
  REGULATORY_INQUIRY:
    'Switch into survey-readiness mode: use a single point of contact and don’t hand over documents ad hoc.',
};

/** Decide which document family a representative reference ID belongs to. */
function refType(id: string): BradReferenceType {
  const u = id.toUpperCase();
  if (/-FM-|-FRM-|-FORM/.test(u)) return 'form';
  if (/-WF-|^WF-|^TPL-|RCA|WORKFLOW|REVIEW|RESPONSE|INTAKE|INVESTIGATION|NOTIFICATION|ASSESSMENT|AUDIT|VERIFICATION|LOG|REPORT$/.test(u)) return 'workflow';
  if (/^KB-|^BRAD-|HELP|HOW-/.test(u)) return 'help';
  if (/^EVT-|-EVT-|EVENT/.test(u)) return 'event';
  return 'policy';
}

/** Build structured, de-duplicated references from a playbook. */
function extractReferences(m: ScenarioMapping): BradReference[] {
  const refs: BradReference[] = [];
  for (const p of m.relatedPolicies) {
    refs.push({ type: refType(p.id), id: p.id, title: p.name, family: p.name });
  }
  for (const w of m.requiredWorkflows) {
    refs.push({ type: 'workflow', id: w.id, title: w.label, family: w.label });
  }
  const seen = new Set<string>();
  const out: BradReference[] = [];
  for (const r of refs) {
    const key = `${r.type}:${r.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out.slice(0, 8);
}

/** Title-case-ish cleanup so a bare action reads as a full sentence. */
function asSentence(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Plain-text reference line (the chat UI also renders these as clickable links). */
function renderReferenceLine(refs: BradReference[]): string {
  if (!refs.length) return '';
  const items = refs.map((r) => `${r.title} (${r.id})`);
  return `Related internal references: ${items.join('; ')}.`;
}

/** Compose a calm, human answer for an urgent/high-stakes route from its playbook. */
function renderScenarioAnswer(m: ScenarioMapping, refs: BradReference[], routerOnly: boolean): string {
  const lead = CATEGORY_LEAD[m.category] ?? m.summary;
  const steps = m.immediateActions.map((a) => `• ${asSentence(a)}`);
  const refLine = renderReferenceLine(refs);

  const blocks: string[] = [lead.trim()];
  if (steps.length) blocks.push('', 'What to do now:', steps.join('\n'));
  if (m.missingInformation.length) {
    blocks.push('', `To tailor this, it helps to know: ${asSentence(m.missingInformation[0])}`);
  }
  if (refLine) {
    blocks.push('', routerOnly && refs.length
      ? `${refLine} (I’ve attached the closest internal references available.)`
      : refLine);
  }
  if (m.lifeSafetyFlag) {
    blocks.push('', 'If anyone could be harmed right now, call 911 first — everything else comes after that.');
  }
  return blocks.join('\n');
}

/* ─── Internal-topic mini-knowledge for common non-urgent questions ─────────
   Grounded process guidance for routine internal questions that carry no
   immediate danger. Anything outside this set → professional fallback. */
interface InternalTopic {
  test: RegExp;
  answer: string;
  references?: BradReference[];
}
const INTERNAL_TOPICS: InternalTopic[] = [
  {
    test: /\b(patient'?s? rights|residents? rights|client'?s? rights|rights and responsibilities|bill of rights)\b/i,
    answer:
      'Patient Rights covers what every patient is entitled to: to be treated with dignity and respect, to be free from abuse, neglect, and exploitation, to take part in their plan of care, to voice grievances without fear of retaliation, and to have their privacy protected. Give each patient the rights notice at admission, document that they received it, and route any rights concern through the grievance process. If you ever suspect a right is being violated, report it right away rather than investigating it yourself.',
    references: [
      { type: 'policy', id: 'CL-PR-001', title: 'Patient Rights & Responsibilities', family: 'Patient Rights' },
      { type: 'policy', id: 'CL-PR-006', title: 'Abuse, Neglect & Exploitation Reporting', family: 'Patient Rights' },
    ],
  },
  {
    test: /\b(qapi|quality (assurance|improvement)|performance improvement|\bpip\b)\b/i,
    answer:
      'For QAPI, run the standing review on cadence: confirm the agenda, review prior action items, walk the quality indicators, flag any trends or gaps, assign follow-up owners with due dates, and capture decisions in the minutes. After the meeting, route the minutes for approval/signature and file the evidence. Adverse events, complaints, and incidents all feed the QAPI trend review and corrective-action loop.',
    references: [
      { type: 'policy', id: 'QA-QAPI-001', title: 'QAPI / Corrective Action', family: 'QAPI / Corrective Action' },
    ],
  },
  {
    test: /\b(onboard\w*|new hire|orientation|credential\w*|competenc\w*|required training|training (is )?required|training for (new )?(aide|staff|hire)|in[- ]?service)\b/i,
    answer:
      'For onboarding and required training, work the new-hire checklist end to end: collect and verify credentials and licenses, complete orientation and competency sign-offs, run the required background and health screenings, and confirm each step is recorded before the employee carries an independent assignment. Aides have specific orientation, competency-evaluation, and annual in-service requirements — keep anything incomplete on the open-items list until it’s closed.',
  },
  {
    test: /\b(forms? library|find the forms?|which forms?|what forms?|forms? (do i|for|i need|needed)|admission (forms?|packet|paperwork)|intake (forms?|packet))\b/i,
    answer:
      'The Forms Library holds every approved form, grouped by domain (clinical, governance, HR, compliance, and so on) with the policy each form supports. Use the correct current version, fill in the required fields, and route it for the signatures the form calls for. For admission specifically, use the admission/intake packet — consent, patient rights acknowledgment, plan of care, and the assessment forms — and confirm each required form is completed and signed.',
  },
  {
    test: /\b(keep records|record retention|retain records|how long.*records|records.*how long|retention (period|policy)|destroy records)\b/i,
    answer:
      'Record retention is set by policy and by federal/state rules — clinical and billing records are retained for the required minimum (commonly several years, longer for minors or where state law requires), and emergency-preparedness after-action records have their own retention window. Don’t destroy any record outside the approved retention schedule, and never discard anything that may be subject to an audit, investigation, or legal hold. When in doubt on a specific record type, confirm with Compliance before disposal.',
    references: [
      { type: 'policy', id: 'CL-DOC-001', title: 'Documentation Requirements', family: 'Documentation Requirements' },
    ],
  },
  {
    test: /\b(document\w*|charting|chart a|chart my|chart (a |my |the )?visit|my notes?|note after|write.*note|late entry|correction|addendum|timeframe.*note|finish my note|finish my notes|verbal order|physician signature|signature on|sign off|fix a chart|charting mistake|forgot to chart)\b/i,
    answer:
      'For documentation, write in real time wherever possible: record objective facts, exact times, and direct quotes — not conclusions or opinions. Complete notes within the required timeframe, and never alter or delete an existing entry; make a dated, signed correction or addendum instead. Verbal/telephone orders must be documented when received and authenticated (physician-signed) within the required window. If a system is down, use the approved paper downtime process with timestamps and signatures, then back-enter per policy.',
    references: [
      { type: 'policy', id: 'CL-DOC-001', title: 'Documentation Requirements', family: 'Documentation Requirements' },
    ],
  },
  {
    test: /\b(emergency (plan|preparedness)|ep plan|disaster plan|continuity of operations|coop|emergency plan reviewed)\b/i,
    answer:
      'The Emergency Preparedness plan is reviewed and updated at least annually (and after any real activation or exercise), with training and exercises documented. It covers an all-hazards risk assessment, patient triage by acuity, communication and contact procedures, and continuity of operations. After any event or drill, complete the after-action review and feed lessons learned back into the plan.',
  },
  {
    test: /\b(time off|pto|vacation|sick (leave|day|time)|request.*off|day off|call (out|in) sick|leave request)\b/i,
    answer:
      'Time-off and leave requests go through your supervisor/scheduler per the HR policy — submit the request in advance through the normal channel, and for unplanned sick calls, notify your supervisor as early as possible so visits can be reassigned and no patient is missed. Your supervisor or HR can confirm accrual balances and approval.',
  },
  {
    test: /\b(scheduling|schedule (question|change|conflict)|who (do i|to) (call|contact).*(schedul|visit)|reschedul\w*|visit assignment)\b/i,
    answer:
      'For scheduling questions — assignments, changes, conflicts, or coverage — contact your scheduler or supervisor through the normal channel. If a visit can’t be covered or a patient might be missed, escalate to your supervisor right away so coverage can be arranged; never leave a needed visit unaddressed.',
  },
];

function matchInternalTopic(userText: string): InternalTopic | null {
  for (const t of INTERNAL_TOPICS) {
    if (t.test.test(userText)) return t;
  }
  return null;
}

/**
 * Compose Brad's answer for an internal question. Deterministic, no internet.
 * Urgent tracks → scripted, safety-first playbook guidance with attached
 * references. Routine topics → grounded process guidance. Anything else →
 * professional escalation fallback.
 */
export function composeInternalBradAnswer(userText: string): InternalAnswer {
  const route = routeCriticalIncident(userText);
  const baseDiag = {
    category: route.category,
    confidence: route.mapping.confidence,
    lifeSafety: route.lifeSafety,
    urgent: route.urgent,
    matchedSignals: route.matchedSignals,
    source: route.source,
  };

  // Urgent OR any high-stakes playbook (suppressNoAnswer) → real guidance, never fallback.
  if (route.urgent || (route.mapping.suppressNoAnswer && route.mapping.category !== 'GENERAL_QUERY')) {
    const refs = extractReferences(route.mapping);
    // Situation-specific, trauma-informed writer for urgent routes — composes only
    // the procedures relevant to THIS situation (no generic playbook contamination).
    const profile = route.urgent ? detectIncidentProfile(userText, route) : null;
    if (profile) {
      return {
        text: composeIncidentAnswer(profile, userText),
        matched: true,
        references: refs,
        track: route.track,
        diagnostics: { ...baseDiag, path: 'incident-profile', incidentProfile: profile },
      };
    }
    return {
      text: renderScenarioAnswer(route.mapping, refs, route.source === 'router'),
      matched: true,
      references: refs,
      track: route.track,
      diagnostics: { ...baseDiag, path: 'scenario-playbook', incidentProfile: null },
    };
  }

  // Routine internal topic.
  const topic = matchInternalTopic(userText);
  if (topic) {
    return {
      text: topic.answer,
      matched: true,
      references: topic.references ?? [],
      track: 'GENERAL',
      diagnostics: { ...baseDiag, path: 'internal-topic' },
    };
  }

  // No urgent signal and no grounded topic → professional escalation fallback.
  return {
    text: INSUFFICIENT_CONTEXT_FALLBACK,
    matched: false,
    references: [],
    track: 'GENERAL',
    diagnostics: { ...baseDiag, path: 'fallback' },
  };
}
