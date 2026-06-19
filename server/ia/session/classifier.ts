/**
 * Brad Session Classifier
 *
 * Rule-based classification of each user turn. Intentionally deterministic —
 * no LLM call required. The local model is reserved for the expensive step
 * (structured response generation). Classification must be fast and reliable.
 *
 * Returns a ClassificationResult that drives:
 *   - mode locking / transitions
 *   - urgency assignment
 *   - incident type detection
 *   - intent tagging
 *   - domain routing
 */

import type {
  BradMode,
  BradUrgency,
  BradSessionState,
  ClassificationResult,
  IncidentType,
  UserIntent,
  UserRole,
} from './types.js';

/* ── Life-safety / emergency keywords ─────────────────────────────── */

const LIFE_SAFETY_KEYWORDS = [
  'heart attack', 'cardiac arrest', 'chest pain', 'chest tightness', 'heart',
  'stroke', 'slurred speech', 'face drooping', 'arm weakness', 'sudden numbness',
  'not breathing', 'stopped breathing', 'difficulty breathing', "can't breathe",
  'unresponsive', 'unconscious', 'passed out', 'fainted', 'collapsed', 'not moving',
  'severe bleeding', 'bleeding heavily', 'major injury',
  'choking', 'airway', 'not responding',
  'overdose', 'od ', 'drug overdose', 'medication overdose',
  'seizure', 'convulsing', 'convulsion',
  'anaphylaxis', 'allergic reaction', 'epipen', 'swelling throat',
  'life threatening', 'life-threatening', 'emergency', 'call 911', '911',
  'dying', 'is dying', 'may die',
  // Clinician / field worker active danger (first-person threat with weapon/trap)
  'chasing me', 'chasing us', 'after me', 'has a knife', 'has a gun', 'has knife', 'has gun',
  'holding a knife', 'holding a gun', 'brandishing', 'waving a knife', 'waving a gun',
  'trapped', 'hiding', 'locked in', 'cannot leave', 'can\'t leave', 'not safe', 'unsafe',
  'blocking the door', 'blocking door', 'won\'t let me leave', 'cornered',
  'attacking me', 'attacking the nurse', 'attacking us', 'threatening me', 'threatening the nurse',
  'client has a knife', 'patient has a gun', 'family member blocking', 'caregiver attacking',
  'i am not safe', 'i\'m not safe', 'im not safe', 'we are not safe',
  'do not feel safe', 'dont feel safe', "don't feel safe", 'feel unsafe', 'not feel safe',
  'violent', 'trying to hurt me', 'coming at me', 'attacking me',
  'has a weapon', 'has weapon', 'weapon in', 'knife in the',
];

/* ── High urgency keywords (not immediately life-threatening) ─────── */

const HIGH_URGENCY_KEYWORDS = [
  'abuse', 'neglect', 'exploitation', 'mistreatment', 'hurt',
  'fall', 'fell', 'fallen', 'tripped', 'fell down',
  'injury', 'injured', 'wound', 'wound care',
  'medication error', 'med error', 'wrong med', 'wrong dose', 'wrong medication',
  'adverse event', 'incident', 'accident',
  'complaint', 'grievance',
  'infection outbreak', 'exposure',
  'data breach', 'breach', 'unauthorized access', 'hacked',
  'survey arrival', 'surveyor arrived', 'surveyor is here',
];

/* ── Incident type patterns ────────────────────────────────────────── */

const INCIDENT_PATTERNS: Array<{ type: IncidentType; keywords: string[] }> = [
  {
    type: 'suspected_heart_attack',
    keywords: [
      'heart attack', 'cardiac', 'chest pain', 'chest tightness', 'heart',
      'cardiac arrest', 'mi ', 'myocardial',
    ],
  },
  {
    type: 'stroke',
    keywords: ['stroke', 'slurred speech', 'face drooping', 'arm weakness', 'sudden weakness'],
  },
  {
    type: 'respiratory_emergency',
    keywords: [
      'not breathing', 'stopped breathing', 'difficulty breathing', "can't breathe",
      'shortness of breath', 'short of breath', 'choking', 'airway',
    ],
  },
  {
    type: 'fall_with_injury',
    keywords: ['fall', 'fell', 'fallen', 'tripped', 'fell down', 'tripped and fell'],
  },
  {
    type: 'medication_error',
    keywords: ['medication error', 'med error', 'wrong med', 'wrong dose', 'wrong medication', 'missed dose'],
  },
  {
    type: 'abuse_allegation',
    keywords: ['abuse', 'neglect', 'exploitation', 'mistreatment', 'self-harm', 'harm'],
  },
  {
    type: 'data_breach',
    keywords: ['data breach', 'breach', 'unauthorized access', 'hacked', 'ransomware', 'phi exposed'],
  },
  {
    type: 'survey_event',
    keywords: ['surveyor', 'survey arrival', 'cms inspection', 'cms surveyor', 'inspector here'],
  },
  {
    type: 'infection_control',
    keywords: ['infection', 'outbreak', 'covid', 'flu outbreak', 'contamination', 'ppe'],
  },
  {
    type: 'documentation_deficiency',
    keywords: ['missing documentation', 'documentation missing', 'chart incomplete', 'unsigned order'],
  },
];

/* ── Fuzzy symptom cluster scoring ────────────────────────────────────
 * Handles messy real-world inputs that exact matching misses.
 * Examples:
 *   "client looks off clutching chest"      → cardiac (score 3)
 *   "patient dizzy sweating breathing weird" → cardiac (score 4)
 *   "caregiver panicking chest pain maybe"  → cardiac (score 3)
 *   "patient confused sudden drop on floor" → fall/stroke (score 3)
 * ─────────────────────────────────────────────────────────────────── */

interface WeightedCluster {
  keywords: string[];
  weight: number;
}

interface FuzzyIncidentDef {
  type: IncidentType;
  lifeSafety: boolean;          // does this trigger life safety flag?
  clusters: WeightedCluster[];
  threshold: number;
}

const FUZZY_INCIDENTS: FuzzyIncidentDef[] = [
  {
    type: 'suspected_heart_attack',
    lifeSafety: true,
    threshold: 3,
    clusters: [
      { keywords: ['chest pain', 'chest pressure', 'chest tightness', 'clutching chest', 'grabbing chest', 'squeezing chest'], weight: 3 },
      { keywords: ['left arm', 'arm pain', 'arm numb', 'jaw pain', 'jaw tight'], weight: 2 },
      { keywords: ['shortness of breath', 'breathing weird', 'breathing hard', 'can\'t breathe', 'short of breath', 'dyspnea'], weight: 2 },
      { keywords: ['sweating', 'diaphoretic', 'sweaty', 'cold sweat', 'clammy'], weight: 1 },
      { keywords: ['dizzy', 'dizziness', 'lightheaded', 'light headed'], weight: 1 },
      { keywords: ['nausea', 'nauseous', 'vomiting', 'sick to stomach'], weight: 1 },
      { keywords: ['pale', 'gray', 'grey', 'ashen', 'looks off', 'looks bad'], weight: 1 },
      { keywords: ['heart', 'cardiac', 'heart attack', 'mi ', 'myocardial'], weight: 4 },
    ],
  },
  {
    type: 'stroke',
    lifeSafety: true,
    threshold: 3,
    clusters: [
      { keywords: ['slurred speech', 'slurring', 'can\'t speak', 'speech changed', 'talking weird'], weight: 3 },
      { keywords: ['face drooping', 'face droop', 'facial droop', 'droopy face', 'face numb'], weight: 3 },
      { keywords: ['arm weakness', 'arm numb', 'one side weak', 'sudden weakness', 'body weak'], weight: 3 },
      { keywords: ['confusion', 'confused', 'disoriented', 'sudden confusion'], weight: 2 },
      { keywords: ['vision', 'can\'t see', 'blurry vision', 'double vision', 'eye'], weight: 2 },
      { keywords: ['severe headache', 'worst headache', 'sudden headache'], weight: 2 },
      { keywords: ['stroke', 'tia', 'brain attack'], weight: 4 },
    ],
  },
  {
    type: 'respiratory_emergency',
    lifeSafety: true,
    threshold: 3,
    clusters: [
      { keywords: ['not breathing', 'stopped breathing', 'no breath', 'can\'t breathe', 'unable to breathe'], weight: 4 },
      { keywords: ['choking', 'choked', 'airway', 'blocked airway', 'food stuck'], weight: 3 },
      { keywords: ['breathing difficulty', 'difficulty breathing', 'breathing weird', 'breathing shallow', 'labored breathing'], weight: 2 },
      { keywords: ['blue lips', 'turning blue', 'cyanotic', 'oxygen low'], weight: 3 },
      { keywords: ['shortness of breath', 'short of breath', 'dyspnea', 'can\'t catch breath'], weight: 2 },
    ],
  },
  {
    type: 'fall_with_injury',
    lifeSafety: false,
    threshold: 2,
    clusters: [
      { keywords: ['fell', 'fall', 'fallen', 'dropped', 'on the floor', 'found on floor', 'sudden drop'], weight: 3 },
      { keywords: ['tripped', 'slipped', 'lost balance'], weight: 2 },
      { keywords: ['injury', 'injured', 'hurt', 'bleeding', 'bruise', 'wound', 'pain after'], weight: 1 },
      { keywords: ['head injury', 'hit head', 'head trauma', 'concussion'], weight: 2 },
    ],
  },
  {
    type: 'medication_error',
    lifeSafety: false,
    threshold: 2,
    clusters: [
      { keywords: ['wrong medication', 'wrong med', 'wrong drug', 'wrong pill'], weight: 3 },
      { keywords: ['wrong dose', 'too much medication', 'double dose', 'overdose', 'too many pills'], weight: 3 },
      { keywords: ['medication error', 'med error', 'mistake with medication'], weight: 4 },
      { keywords: ['missed dose', 'skipped dose', 'didn\'t get medication', 'didn\'t give medication'], weight: 2 },
    ],
  },
  {
    type: 'abuse_allegation',
    lifeSafety: false,
    threshold: 2,
    clusters: [
      { keywords: ['abuse', 'abused', 'hitting', 'hitting patient', 'struck', 'kicked'], weight: 4 },
      { keywords: ['neglect', 'neglected', 'not caring for', 'ignoring patient'], weight: 3 },
      { keywords: ['exploitation', 'taking money', 'stealing', 'financial abuse'], weight: 3 },
      { keywords: ['inappropriate', 'sexual', 'harassment'], weight: 3 },
    ],
  },
];

/**
 * Fuzzy incident scoring — handles messy/informal language.
 * Returns the best-matching incident type and whether life safety applies,
 * or null if no incident meets threshold.
 */
export function fuzzyClassifyIncident(
  input: string,
): { type: IncidentType; lifeSafety: boolean; score: number } | null {
  const lower = input.toLowerCase();
  let bestMatch: { type: IncidentType; lifeSafety: boolean; score: number } | null = null;
  let bestScore = 0;

  for (const incident of FUZZY_INCIDENTS) {
    let score = 0;
    for (const cluster of incident.clusters) {
      if (cluster.keywords.some(k => lower.includes(k))) {
        score += cluster.weight;
      }
    }
    if (score >= incident.threshold && score > bestScore) {
      bestScore = score;
      bestMatch = { type: incident.type, lifeSafety: incident.lifeSafety, score };
    }
  }

  return bestMatch;
}

/* ── Intent patterns ───────────────────────────────────────────────── */

const INTENT_PATTERNS: Array<{ intent: UserIntent; keywords: string[] }> = [
  {
    intent: 'ask_protocol',
    keywords: [
      'what is the protocol', 'what protocol', 'protocol', 'procedure',
      'steps', 'what do i do', 'what should i do', 'how do i', 'what now',
      'what are the steps', 'walk me through',
    ],
  },
  {
    intent: 'ask_next_step',
    keywords: [
      'next step', 'what next', 'what do i do next', 'after that', 'then what',
      'what follows', 'what comes next', 'continue', 'and then',
    ],
  },
  {
    intent: 'ask_documentation',
    keywords: [
      'document', 'chart', 'record', 'write up', 'log', 'note', 'documentation',
      'what do i chart', 'what do i document', 'what do i write', 'what to chart',
      'incident report', 'what to record',
    ],
  },
  {
    intent: 'ask_notification_chain',
    keywords: [
      'notify', 'notification', 'who to call', 'who do i notify', 'who to notify',
      'who do i tell', 'who to tell', 'contact', 'report to', 'escalate to',
      'notification chain', 'who is responsible',
    ],
  },
  {
    intent: 'ask_form',
    keywords: [
      'form', 'which form', 'what form', 'fill out', 'complete the form',
      'what form do i use', 'which form do i', 'paperwork', 'fill in',
    ],
  },
  {
    intent: 'ask_policy_basis',
    keywords: [
      'policy', 'policies', 'regulation', 'rule', '42 cfr', 'cms requires',
      'required by', 'policy say', 'what does policy', 'policy basis',
      'governing policy', 'regulatory basis',
    ],
  },
  {
    intent: 'ask_qapi',
    keywords: [
      'qapi', 'quality review', 'adverse event', 'performance improvement',
      'committee', 'report to committee', 'qapi trigger', 'quality improvement',
    ],
  },
  {
    intent: 'ask_summary',
    keywords: [
      'summary', 'status', 'where are we', 'what happened so far', 'recap',
      'review', 'overview', 'catch me up',
    ],
  },
  {
    intent: 'report_incident',
    keywords: [
      'just happened', 'just occurred', 'just called', 'reporting', 'i need to report',
      'reporting that', 'there was a', 'a patient', 'clinician called',
    ],
  },
  {
    intent: 'context_assist_request',
    keywords: [
      'help me', 'guide me', 'show me how', 'walk me through', 'what should i click',
      'where do i', 'how to', 'step by step', 'onboarding', 'getting started',
    ],
  },
];

/* ── Role detection patterns ───────────────────────────────────────── */

const ROLE_PATTERNS: Array<{ role: UserRole; keywords: string[] }> = [
  { role: 'field_clinician', keywords: ['clinician', 'nurse', 'pt', 'ot', 'therapist', 'caregiver', 'aide', 'rn', 'lpn'] },
  { role: 'director_of_nursing', keywords: ['don', 'director of nursing', 'nursing director'] },
  { role: 'administrator', keywords: ['administrator', 'admin', 'ceo', 'executive', 'owner'] },
  { role: 'clinical_manager', keywords: ['clinical manager', 'case manager', 'supervisor', 'manager'] },
  { role: 'hr', keywords: ['hr', 'human resources', 'onboarding', 'new hire', 'hiring'] },
  { role: 'billing', keywords: ['billing', 'claims', 'finance', 'revenue cycle'] },
  { role: 'compliance', keywords: ['compliance', 'compliance officer', 'audit', 'surveyor'] },
];

/* ── Topic shift indicators ─────────────────────────────────────────── */

const TOPIC_SHIFT_PHRASES = [
  'new question', 'different question', 'new topic', 'change subject',
  'forget that', 'start over', 'new case', 'different issue', 'unrelated',
  'different patient', 'move on',
];

/* ── Domain routing ─────────────────────────────────────────────────── */

const DOMAIN_EMERGENCY_ROUTING: Partial<Record<IncidentType, string[]>> = {
  suspected_heart_attack: ['CL', 'RM', 'OP'],
  stroke: ['CL', 'RM', 'OP'],
  respiratory_emergency: ['CL', 'RM', 'OP'],
  fall_with_injury: ['CL', 'RM', 'OP', 'QA'],
  medication_error: ['CL', 'RM', 'CO', 'QA'],
  abuse_allegation: ['CO', 'RM', 'HR', 'GV'],
  data_breach: ['IT', 'CO', 'GV', 'RM'],
  survey_event: ['GV', 'QA', 'CO', 'CL'],
  infection_control: ['CL', 'EN', 'QA'],
  documentation_deficiency: ['CL', 'CO', 'QA'],
};

/* ── Mode transitions ───────────────────────────────────────────────── */

function determineModeTransition(
  current: BradMode,
  urgency: BradUrgency,
  intent: UserIntent,
  incidentType: IncidentType | null,
  lifeSafety: boolean,
  isTopicShift: boolean,
): BradMode {
  // Life safety always locks to emergency_response
  if (lifeSafety) return 'emergency_response';

  // Emergency mode is sticky — only exits on explicit topic shift or manual reset
  if (current === 'emergency_response' && !isTopicShift) {
    // After emergency, documentation requests shift to incident_reporting
    if (intent === 'ask_documentation' || intent === 'ask_form') return 'incident_reporting';
    // After emergency, QAPI questions
    if (intent === 'ask_qapi') return 'qapi_followup';
    // Otherwise stay in emergency_response
    return 'emergency_response';
  }

  if (isTopicShift) return 'general';

  // High urgency incident detection
  if (incidentType && urgency === 'high') {
    if (intent === 'ask_documentation' || intent === 'ask_form') return 'incident_reporting';
    return 'clinical_protocol';
  }

  // Intent-based mode routing
  switch (intent) {
    case 'ask_protocol':
      return current === 'general' ? 'clinical_protocol' : current;
    case 'ask_documentation':
      if (current === 'emergency_response') return 'incident_reporting';
      return 'incident_reporting';
    case 'ask_qapi':
      return 'qapi_followup';
    case 'ask_policy_basis':
      return 'policy_interpretation';
    case 'ask_form':
      return 'form_completion';
    case 'context_assist_request':
      return 'context_assist';
    default:
      return current === 'general' ? 'general' : current;
  }
}

/* ── Main classifier ────────────────────────────────────────────────── */

function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

export function classify(
  input: string,
  currentState: BradSessionState | null,
): ClassificationResult {
  const lower = input.toLowerCase();

  // Life-safety detection — exact keywords first (fastest)
  let lifeSafetyFlag = matchesKeywords(lower, LIFE_SAFETY_KEYWORDS);

  // High urgency detection
  const isHighUrgency = matchesKeywords(lower, HIGH_URGENCY_KEYWORDS);

  // Incident type detection — exact patterns first
  let incidentType: IncidentType | null = null;
  for (const p of INCIDENT_PATTERNS) {
    if (matchesKeywords(lower, p.keywords)) {
      incidentType = p.type;
      break;
    }
  }

  // ── Fuzzy scoring fallback ────────────────────────────────────
  // Handles messy real-world language like:
  //   "client looks off clutching chest"
  //   "patient dizzy sweating breathing weird"
  //   "caregiver panicking chest pain maybe"
  if (!incidentType || !lifeSafetyFlag) {
    const fuzzy = fuzzyClassifyIncident(input);
    if (fuzzy) {
      if (!incidentType) incidentType = fuzzy.type;
      if (fuzzy.lifeSafety && !lifeSafetyFlag) {
        lifeSafetyFlag = true;
      }
    }
  }

  // Preserve existing incident type if not changing topic
  if (!incidentType && currentState?.detectedIncidentType) {
    incidentType = currentState.detectedIncidentType;
  }

  // Urgency assignment
  let urgency: BradUrgency = 'low';
  if (lifeSafetyFlag) urgency = 'critical';
  else if (isHighUrgency) urgency = 'high';
  else if (currentState?.urgency === 'critical') urgency = 'high'; // decay from critical
  else if (currentState?.urgency === 'high') urgency = 'moderate';
  else if (currentState?.urgency) urgency = currentState.urgency;

  // Intent detection
  let intent: UserIntent = 'general_question';
  let intentScore = 0;
  for (const p of INTENT_PATTERNS) {
    const score = p.keywords.filter(k => lower.includes(k)).length;
    if (score > intentScore) {
      intentScore = score;
      intent = p.intent;
    }
  }
  // If literally just a very short message like "what now?" or "ok"
  if (lower.trim().split(' ').length <= 3 && currentState?.mode !== 'general') {
    if (matchesKeywords(lower, ['ok', 'got it', 'okay', 'understood'])) intent = 'ask_next_step';
    if (matchesKeywords(lower, ['what now', 'next', 'and then'])) intent = 'ask_next_step';
  }

  // Role detection (from current message)
  let detectedRole: UserRole | null = null;
  for (const p of ROLE_PATTERNS) {
    if (matchesKeywords(lower, p.keywords)) {
      detectedRole = p.role;
      break;
    }
  }

  // Topic shift detection
  const isTopicShift = matchesKeywords(lower, TOPIC_SHIFT_PHRASES);

  // Continuation: same session and no explicit shift
  const isContinuation = !isTopicShift && currentState !== null && currentState.mode !== 'general';

  // Mode transition
  const currentMode: BradMode = currentState?.mode ?? 'general';
  const mode = determineModeTransition(
    currentMode,
    urgency,
    intent,
    incidentType,
    lifeSafetyFlag,
    isTopicShift,
  );

  // Domain routing
  const detectedDomains = (incidentType && DOMAIN_EMERGENCY_ROUTING[incidentType])
    ?? currentState?.activeDomains
    ?? [];

  // QAPI trigger
  const qapiTriggerPossible = !!(
    incidentType === 'medication_error' ||
    incidentType === 'fall_with_injury' ||
    incidentType === 'suspected_heart_attack' ||
    incidentType === 'stroke' ||
    incidentType === 'abuse_allegation' ||
    intent === 'ask_qapi' ||
    matchesKeywords(lower, ['adverse event', 'incident report', 'reportable'])
  );

  const escalationRequired = lifeSafetyFlag ||
    incidentType === 'abuse_allegation' ||
    incidentType === 'data_breach' ||
    urgency === 'critical';

  return {
    mode,
    urgency,
    incidentType,
    intent,
    isContinuation,
    isTopicShift,
    lifeSafetyFlag,
    escalationRequired,
    qapiTriggerPossible,
    detectedDomains: Array.isArray(detectedDomains) ? detectedDomains : [],
    detectedRole,
    confidence: intentScore > 0 ? Math.min(0.9, 0.5 + intentScore * 0.15) : 0.4,
  };
}

/* ── Retrieval query builder ─────────────────────────────────────────── */

/**
 * Build an enhanced retrieval string that combines the current user message
 * with the session case context. This prevents re-retrieval from scratch on
 * follow-up questions like "what is the protocol?"
 */
export function buildRetrievalQuery(
  userInput: string,
  state: BradSessionState,
  classification: ClassificationResult,
): string {
  const parts: string[] = [];

  // Always include the raw user message
  parts.push(userInput);

  // Inject incident-type context expansion
  if (classification.incidentType) {
    const expansions: Partial<Record<IncidentType, string>> = {
      suspected_heart_attack:
        'cardiac emergency patient safety emergency response escalation incident reporting 911 documentation',
      stroke:
        'stroke emergency neurological patient safety incident escalation notification documentation',
      respiratory_emergency:
        'respiratory emergency breathing difficulty airway emergency response documentation',
      fall_with_injury:
        'fall injury incident reporting escalation documentation adverse event',
      medication_error:
        'medication error incident reporting adverse event notification corrective action',
      abuse_allegation:
        'abuse allegation reporting mandatory reporter investigation documentation escalation',
      data_breach:
        'data breach hipaa notification incident response 72 hours security',
      survey_event:
        'survey readiness CMS surveyor deficiency response preparation',
      infection_control:
        'infection control outbreak protocol ppe isolation documentation',
      documentation_deficiency:
        'documentation deficiency corrective action required artifacts',
    };
    const exp = expansions[classification.incidentType];
    if (exp) parts.push(exp);
  }

  // Inject case summary context for follow-up questions
  if (state.caseSummary && classification.isContinuation) {
    parts.push(state.caseSummary.slice(0, 200));
  }

  // Mode-specific context
  const modeContext: Partial<Record<typeof state.mode, string>> = {
    emergency_response: 'emergency protocol escalation notification physician clinical manager administrator',
    incident_reporting: 'incident report documentation adverse event notification QAPI required artifacts notification chain',
    qapi_followup: 'QAPI quality review adverse event committee oversight performance improvement',
    survey_readiness: 'survey readiness CMS deficiency corrective action plan of correction',
    form_completion: 'form required fields completion documentation',
  };
  const mCtx = modeContext[state.mode];
  if (mCtx) parts.push(mCtx);

  return parts.join(' ').slice(0, 800); // cap retrieval query length
}
