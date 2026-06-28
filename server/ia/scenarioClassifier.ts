/* ═══════════════════════════════════════════════════════════════
   Scenario Normalization Layer
   ---------------------------------------------------------------
   Brad is a COMPLIANCE INTELLIGENCE system, not a search engine.
   When the corpus has no literal match for a user scenario (e.g.
   "clinician arrived and found her patient murdered"), Brad must
   still return an actionable, compliance-aligned response.

   This module:
     1. Classifies free-form input into one of a fixed taxonomy of
        high-stakes scenarios.
     2. Maps each scenario to a deterministic "playbook" — the
        immediate actions, required workflows, compliance notes,
        and suggested studio generators a trained administrator
        would reach for.
     3. Returns a strongly-typed ScenarioMapping that the responder
        can attach to every StructuredResponse, regardless of
        whether retrieval returned passages.

   Design rules:
     - Pure function. No I/O, no LLM. Deterministic.
     - Never hallucinate specifics — only name workflow domains
       and playbook actions that are guaranteed to exist in the
       agency's process library.
     - Overlapping triggers are allowed; the highest-priority
       category wins, and secondary ones become `relatedCategories`.
     - "GENERAL_QUERY" is the default fallback — it still returns a
       playbook (the standard retrieval path), it just doesn't
       override corpus behavior.
   ═══════════════════════════════════════════════════════════════ */

import type { ActionType, RiskLevel, StudioOutputType } from './types.js';

/* ─────────────────────────────────────────────────────────────
   Taxonomy
   ───────────────────────────────────────────────────────────── */

export type ScenarioCategory =
  | 'SENTINEL_EVENT_CRITICAL'
  | 'PATIENT_SAFETY_EMERGENCY'
  | 'CLINICIAN_SAFETY'
  | 'ADVERSE_EVENT'
  | 'ABUSE_NEGLECT'
  | 'PRIVACY_BREACH'
  | 'CYBERSECURITY_INCIDENT'
  | 'COMPLIANCE_VIOLATION'
  | 'BILLING_RISK'
  | 'REGULATORY_INQUIRY'
  | 'EMERGENCY_OPERATIONAL'
  | 'COMPLAINT'
  | 'GENERAL_QUERY';

export type PlaybookDomain =
  | 'Governance'
  | 'QAPI'
  | 'Clinical'
  | 'Risk'
  | 'Compliance'
  | 'IT/Security'
  | 'Operations'
  | 'Finance';

export interface ScenarioPlaybookWorkflow {
  /** Template / event id slug — matches workflow library IDs where available. */
  id: string;
  label: string;
  regulatoryDriver?: string;
}

/**
 * Policy / control reference Brad surfaces under "Related Policies /
 * Controls". Prefer a concrete agency policy ID (e.g. "RM-INC-001");
 * when exact IDs are not yet registered, set `isDomainFallback: true`
 * so the UI renders it under a "Related Domains" bucket.
 */
export interface ScenarioPolicyReference {
  id: string;
  name: string;
  domain?: PlaybookDomain | string;
  isDomainFallback?: boolean;
}

export interface ScenarioMapping {
  category: ScenarioCategory;
  label: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  riskLevel: RiskLevel;
  /** Raise an EMERGENCY banner in the UI and prepend 911 guidance. */
  lifeSafetyFlag: boolean;
  /** Classifier confidence. */
  confidence: 'high' | 'medium' | 'low';
  /** Raw phrases from the input that triggered this classification. */
  matchedTriggers: string[];
  /** Other categories the input also matches (ordered by priority). */
  relatedCategories: ScenarioCategory[];
  /** One-line summary — safe to show even before corpus retrieval. */
  summary: string;
  /** Statement for the "directAnswer" slot when no corpus match. */
  headline: string;
  /** Corpus-match / fallback note. Set by the responder (not the playbook). */
  matchNote?: string;
  /** Step-by-step actions, ordered by execution sequence. */
  immediateActions: string[];
  /** Workflow library references the administrator should launch. */
  requiredWorkflows: ScenarioPlaybookWorkflow[];
  /** Policy / control references with concrete IDs (or domain fallbacks). */
  relatedPolicies: ScenarioPolicyReference[];
  /** Follow-up questions Brad needs answered before proceeding. */
  missingInformation: string[];
  /** Surveyor / audit-defensibility notes. */
  complianceNotes: string[];
  /** Workflow domains this scenario crosses. */
  domains: PlaybookDomain[];
  /** Studio generators to auto-suggest as AvailableActions. */
  suggestedGenerators: Array<{
    type: ActionType;
    studioOutputType: StudioOutputType | null;
    label: string;
  }>;
  /** When true, responder must NOT return `noAnswerFound: true`. */
  suppressNoAnswer: boolean;
}

/* ─────────────────────────────────────────────────────────────
   Trigger patterns (rule-based, ordered by priority).
   The FIRST category that matches becomes the primary; subsequent
   matches populate `relatedCategories`.
   ───────────────────────────────────────────────────────────── */

interface ScenarioRule {
  category: ScenarioCategory;
  /** Higher wins when multiple rules match. */
  priority: number;
  patterns: RegExp[];
  /** Additional phrases captured for `matchedTriggers`. */
  captureWords?: RegExp;
}

const RULES: ScenarioRule[] = [
  {
    category: 'SENTINEL_EVENT_CRITICAL',
    priority: 100,
    patterns: [
      /\b(murder(ed)?|homicide|killed|shot dead)\b/i,
      /\b(patient|client|pt\.?)[^.]{0,60}\b(dead|deceased|expired|died|death)\b/i,
      /\bfound[^.]{0,40}\b(dead|deceased|unresponsive|not breathing)\b/i,
      /\b(sentinel event|never event|wrong[- ]site|wrong[- ]patient\s+(procedure|surgery|treatment|medication|med|dose|blood)|unexpected death)\b/i,
      /\b(major permanent (loss of (function|limb)|disability))\b/i,
      /\b(suicide|attempted suicide|self[- ]harm(?!\s+warning))\b/i,
    ],
    captureWords: /\b(murder(?:ed)?|homicide|died|dead|deceased|unresponsive|suicide|sentinel|unexpected death)\b/gi,
  },
  {
    category: 'PATIENT_SAFETY_EMERGENCY',
    priority: 95,
    patterns: [
      /\b(cardiac arrest|not breathing|respiratory arrest|stroke in progress|anaphylax|choking|seizure in progress)\b/i,
      /\b(overdose|unresponsive patient|unconscious patient|unresponsive)\b/i,
      /\bcall[- ]?911\b/i,
      /\b(fire (in|at) (the )?home|active (shooter|fire|bleeding))\b/i,
      /\bsevere bleeding|hemorrhag(e|ing)\b/i,
      /\b((fell|fall|patient).* (head|hit head|struck head)| (hit|struck|head strike).* head |head (strike|hit|injur)|loss of consciousness|on (blood thinner|anticoagulant)|shortness of breath|chest pain|major change in condition|weakness|confusion after fall)\b/i,
      /\b(refus(es|ed|ing) (911|ems|ambulance|hospital|transport|evac)|declin(es|ed) (emergency|help)|"I don'?t want to go")\b/i,
    ],
    captureWords: /\b(911|cardiac arrest|unresponsive|overdose|fire|shooter|hemorrhag\w*|anaphyla\w*|head.*(hit|strike)|anticoag|blood thinner|refus.*(911|ems|evac)|declin.*(help|transport))\b/gi,
  },
  {
    category: 'CLINICIAN_SAFETY',
    priority: 90,
    patterns: [
      /\b(clinician|nurse|aide|therapist|staff)\b[^.]{0,80}\b(assaulted|threatened|stalked|robbed|attacked|abducted|held (at (gun|knife)point)?)\b/i,
      /\b(weapon|gun|knife|firearm)\b[^.]{0,50}\b(in (the )?home|pointed|brandish)\b/i,
      /\b(hostile|aggressive) (patient|family|environment)\b/i,
      /\bdog (bite|attack)\b/i,
      /\b(unsafe (home|environment|situation))\b/i,
      /\b(car|vehicle|auto|driving|en route|on the way)\b[^.]{0,60}\b(accident|crash|collision|wreck|incident)\b/i,
      /\b(needle[- ]?stick|needle[- ]?injur|blood ?exposure|body fluid exposure|BBP|sharps? exposure)\b/i,
      /\b(impaired|drunk|high|under (the )?influence|smells? of (alcohol|weed|marijuana)|slurring|acting odd)\b/i,
      /\b(blocks?|blocking|block.*(entry|clinician|home|door)|won't let|refus(es|ed) (entry|admit|me in)|standing in (the )?door|aggressive (family|at door))\b/i,
      // First-person field worker active danger (chasing/trapped/weapon immediate)
      /\b(client|patient|family member|caregiver|son|daughter|husband|wife)\b[^.]{0,80}\b(chasing|following|attacking|threatening|blocking|trapped|cornered)\b/i,
      /\b(chasing|following|attacking|threatening|blocking|trapped|cornered)\b[^.]{0,80}\b(me|us|nurse|clinician|aide|therapist|staff)\b/i,
      /\b(has|holding|carrying|brandishing|waving)\b[^.]{0,40}\b(knife|gun|weapon|firearm|blade)\b/i,
      /\b(knife|gun|weapon|firearm|blade)\b[^.]{0,80}\b(chasing|threatening|attacking|pointed|holding|has)\b/i,
      /\b(i am|i'm|im|we are|we're)\b[^.]{0,80}\b(not safe|unsafe|scared|trapped|hiding|locked in|cannot leave|can't leave)\b/i,
      /\b(i |im |i'm |we )(do not feel|dont feel|don't feel|feel )?(safe|unsafe)\b/i,
      /\bdo not feel safe\b/i,
      /\b(i cannot|i can't|can't get out|cannot get out|won't let me out)\b/i,
      /\b(my client|the client|patient|family)\b[^.]{0,60}\b(chasing|chase|after me|has a (knife|gun|weapon))\b/i,
      /\b(trying to hurt|attacking|coming at|threatening)\b[^.]{0,40}\b(me|us|the (nurse|clinician|aide|therapist))\b/i,
    ],
    captureWords: /\b(assaulted|threatened|stalked|robbed|weapon|gun|knife|hostile|unsafe|accident|crash|needle|stick|exposure|impaired|drunk|blocks?|refus.*entry|chasing|trapped|not safe|has a knife|has a gun)\b/gi,
  },
  {
    category: 'ABUSE_NEGLECT',
    priority: 85,
    patterns: [
      /\b(elder|patient|child|sexual|physical|verbal|emotional|financial)\s+abuse\b/i,
      // Verb / noun forms: abuse, abused, abuses, abusing, abuser, abusive.
      /\babus(e|ed|es|ing|er|ive)\b/i,
      // Neglect: neglect, neglected, neglecting, neglectful, neglects.
      /\bneglect(s|ed|ing|ful)?\b/i,
      /\b(exploit(s|ed|ing|ation)?|financial exploitation)\b/i,
      /\b(abandon(ed|ment|ing|s)?)\b/i,
      /\b(mistreat(s|ed|ment|ing)?|maltreat\w*)\b/i,
      /\b(bruise|injury|mark|welt)[^.]{0,40}\b(unexplained|suspicious|inconsistent)\b/i,
      /\b(aps|adult protective services)\b/i,
      /\b(mandated report|mandatory report(ing)?)\b/i,
    ],
    captureWords: /\b(abus\w*|neglect\w*|exploit\w*|abandon\w*|mistreat\w*|APS)\b/gi,
  },
  {
    category: 'ADVERSE_EVENT',
    priority: 70,
    patterns: [
      /\b(medication (error|mistake)|wrong (dose|medication)|med error)\b/i,
      /\bpatient fall(s| with injury)?\b/i,
      /\b(adverse event|adverse drug|near miss|incident report)\b/i,
      /\b(pressure (ulcer|injury)|hospital[- ]?acquired)\b/i,
      /\b(unplanned (hospitalization|admission|re-?admission))\b/i,
      /\bproperty damage\b/i,
      /\b(broke|broken|cracked|smashed|damaged|spilled on|ruined|knocked over)\b[^.]{0,15}\b(lamp|tv|television|furniture|window|dish|dishes|vase|chair|table|glasses|phone|device|belonging|property|item|wall|floor|carpet|door|picture|frame)\b/i,
      /\blost (item|property|belonging) during visit\b/i,
      /\b(missing (med|medication|pill|count is short|meds? short))\b/i,
    ],
    captureWords: /\b(med error|fall|adverse|near miss|pressure ulcer|hospitalization|property damage|broke|missing med)\b/gi,
  },
  {
    category: 'PRIVACY_BREACH',
    priority: 75,
    patterns: [
      /\b(hipaa|phi|privacy) (breach|incident|violation|disclosure)\b/i,
      /\b(unauthorized (access|disclosure))\b/i,
      /\b(lost|stolen) (laptop|phone|device|usb|thumb ?drive|paperwork|chart)\b/i,
      /\b(mis[- ]?directed|wrong[- ]?recipient) (fax|email|letter|number)\b/i,
      /\b(faxed? to (the )?wrong)\b/i,
      /\b(text|texted|sms|text message).* (phi|wrong number|schedule|patient info)\b/i,
      /\b(wrong number).* (phi|text|schedule)\b/i,
    ],
    captureWords: /\b(HIPAA|PHI|breach|unauthorized|stolen|lost)\b/gi,
  },
  {
    category: 'CYBERSECURITY_INCIDENT',
    priority: 75,
    patterns: [
      /\b(ransomware|malware|virus|phishing|credential theft)\b/i,
      /\b(data breach|cyber (attack|incident)|account compromise)\b/i,
      /\b(locked out|system (outage|down|compromised))[^.]{0,60}\b(ehr|email|network|server)\b/i,
    ],
    captureWords: /\b(ransomware|malware|phishing|cyber\w*|breach)\b/gi,
  },
  {
    category: 'COMPLIANCE_VIOLATION',
    priority: 65,
    patterns: [
      /\b(kickback|anti[- ]?kickback|stark law|self[- ]?referral)\b/i,
      /\b(exclusion list|oig (leie|exclusion)|sam\.gov exclusion)\b/i,
      /\b(false claims? act|fca|qui tam|whistleblower)\b/i,
      /\b(excluded (provider|employee|vendor))\b/i,
    ],
    captureWords: /\b(kickback|stark|oig|fca|false claim|exclusion)\b/gi,
  },
  {
    category: 'BILLING_RISK',
    priority: 60,
    patterns: [
      /\b(upcoding|unbundling|duplicate claim|overpayment)\b/i,
      /\b(rac (audit|review)|mac (audit|review)|medicare audit|recoupment)\b/i,
      /\b(additional documentation request|adr)\b/i,
      /\b(billing (error|fraud|irregularit))\b/i,
    ],
    captureWords: /\b(upcoding|unbundling|duplicate claim|overpayment|RAC|MAC|ADR|recoupment)\b/gi,
  },
  {
    category: 'REGULATORY_INQUIRY',
    priority: 55,
    patterns: [
      /\b(surveyor|cms (visit|survey|inquiry)|state survey|complaint investigation)\b/i,
      /\b(subpoena|civil investigative demand|cid|government request)\b/i,
      /\b(recertif(ication|y) survey|unannounced survey)\b/i,
    ],
    captureWords: /\b(surveyor|CMS|state survey|subpoena|recertification)\b/gi,
  },
  {
    category: 'EMERGENCY_OPERATIONAL',
    priority: 50,
    patterns: [
      /\b(disaster|power outage|flood|hurricane|wildfire|earthquake|tornado)\b/i,
      /\b(evacuat(e|ion)|shelter[- ]in[- ]place|continuity of operations|cop activat)\b/i,
      /\b(pandemic|outbreak|mass casualty)\b/i,
      /\b(ehr|emr|system|electronic).* (outage|down|offline|not working|unavailable|downtime)\b/i,
      /\b(patient refuses evacuation|refus.*(evac|leave|shelter)|won'?t leave during (fire|flood|disaster))\b/i,
    ],
    captureWords: /\b(disaster|evacuat\w*|outage|pandemic|outbreak|hurricane|wildfire|ehr.*(down|outage)|downtime|refus.*evac)\b/gi,
  },
  {
    category: 'COMPLAINT',
    priority: 40,
    patterns: [
      /\b(patient (complaint|grievance)|family complaint|ombudsman)\b/i,
      /\b(complaint (filed|received|investigation))\b/i,
      /\b(sue|lawsuit|lawyer|attorney|legal action|threaten.*sue|getting a lawyer|filing suit|state complaint|suing)\b/i,
      /\b(caregiver|family).* (can no longer|cannot|no longer).* (care|safely care|provide care)\b/i,
      /\b(overwhelmed|can'?t (handle|care)|no longer safe)\b/i,
    ],
    captureWords: /\b(complaint|grievance|ombudsman|sue|lawsuit|lawyer|attorney|legal|suit|suing|caregiver.*care|overwhelm)\b/gi,
  },
];

/* ─────────────────────────────────────────────────────────────
   Playbooks — deterministic response templates per category.
   Keep labels in plain English; actions as short imperative verbs.
   ───────────────────────────────────────────────────────────── */

const PLAYBOOKS: Record<ScenarioCategory, Omit<ScenarioMapping, 'confidence' | 'matchedTriggers' | 'relatedCategories' | 'category'>> = {
  SENTINEL_EVENT_CRITICAL: {
    label: 'Sentinel Event — Critical',
    severity: 'critical',
    riskLevel: 'critical',
    lifeSafetyFlag: true,
    summary: 'Unexpected death or major permanent harm. Requires immediate escalation, scene preservation, and a structured root-cause analysis within 45 days.',
    headline: 'SENTINEL EVENT — highest-severity classification. Follow the scripted escalation sequence below before any further corpus research.',
    immediateActions: [
      'Call 911 if not already on scene with law enforcement / EMS.',
      'Ensure the clinician is physically safe; remove from the scene if any active danger.',
      'Do NOT disturb the scene — preserve evidence and document the clinician\'s arrival state.',
      'Notify the Administrator and Director of Nursing immediately (verbal + written).',
      'Notify the Risk Manager and Compliance Officer; open the Incident Report within 24 hours.',
      'Initiate family notification per the agency\'s Adverse Event Disclosure policy (DON/Administrator only).',
      'Preserve clinical documentation — lock the chart; copy EMR access logs; capture the clinician\'s contemporaneous notes.',
      'Notify legal counsel and the professional liability carrier within 24 hours.',
      'File state and accrediting-body notifications per reporting timelines (agency-dependent).',
      'Launch Sentinel Event RCA workflow; target closure ≤ 45 days.',
    ],
    requiredWorkflows: [
      { id: 'TPL-RM-TRIGGER-RCA', label: 'Sentinel Event Root Cause Analysis (45-day)', regulatoryDriver: 'CoP §484.65(d)(2); TJC Sentinel Events' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'WF-ADVERSE-EVENT-REVIEW', label: 'Adverse Event Review & Disclosure' },
      { id: 'WF-QAPI-TRIGGER', label: 'QAPI Trigger — Priority Review', regulatoryDriver: 'CoP §484.65' },
      { id: 'WF-EMERGENCY-RESPONSE', label: 'Emergency Response Protocol — Clinician Support' },
      { id: 'WF-LAW-ENFORCEMENT-LIAISON', label: 'Law Enforcement Liaison Packet' },
    ],
    complianceNotes: [
      'CoP §484.65(d)(2) — QAPI must address adverse events that cause serious injury or death.',
      'TJC Sentinel Event Policy — thorough and credible RCA within 45 days.',
      'State reporting laws vary; confirm your state\'s sentinel-event notification timeline.',
      'HIPAA §164.502 — disclosures to law enforcement are permitted but must be documented.',
      'Do not draft conclusions until RCA is complete; contemporaneous notes only.',
    ],
    domains: ['Risk', 'Clinical', 'QAPI', 'Compliance', 'Governance'],
    relatedPolicies: [
      { id: 'RM-INC-001', name: 'Incident Reporting', domain: 'Risk' },
      { id: 'RM-AE-001',  name: 'Adverse Event Response', domain: 'Risk' },
      { id: 'RM-SE-001',  name: 'Sentinel Event / RCA Protocol', domain: 'Risk' },
      { id: 'QA-QAPI-001', name: 'QAPI Escalation Trigger', domain: 'QAPI' },
      { id: 'CL-EM-001',  name: 'Emergency Response Procedure', domain: 'Clinical' },
      { id: 'CO-DISC-001', name: 'Adverse Event Disclosure Policy', domain: 'Compliance' },
    ],
    missingInformation: [
      'Has 911 / law enforcement been contacted already?',
      'Is the clinician physically safe and out of the scene?',
      'Has the Administrator and DON been notified verbally?',
      'Have family / responsible party contacts been captured?',
      'Has the clinical chart been locked and access logs preserved?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate sentinel-event action plan' },
      { type: 'generate_governing_body_brief', studioOutputType: 'governing_body_brief', label: 'Generate Governing Body emergency brief' },
      { type: 'generate_qapi_digest', studioOutputType: 'qapi_digest', label: 'Generate QAPI priority digest' },
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate post-event audit checklist' },
    ],
    suppressNoAnswer: true,
  },

  PATIENT_SAFETY_EMERGENCY: {
    label: 'Patient Safety Emergency',
    severity: 'critical',
    riskLevel: 'critical',
    lifeSafetyFlag: true,
    summary: 'Active life-threatening event (unresponsive, not breathing, head strike + red flags, serious symptoms, or patient refusing needed 911). Lead with 911. You cannot pronounce death.',
    headline: 'LIFE-SAFETY EMERGENCY — Call 911 first if symptoms indicate. For unresponsive: call 911 immediately. For fall with head strike/loss of consciousness/severe pain/bleeding/anticoagulant/confusion/weakness/SOB/chest pain/major change: call 911. Then notify supervisor. Even if patient refuses 911, urge and document the refusal + your actions.',
    immediateActions: [
      'First, do this now: If unresponsive/not breathing: call 911 now. Stay on line. For fall or symptoms with red flags (head hit, LOC, severe pain, bleeding, on blood thinners, confusion, weakness, chest pain, SOB, major condition change): call 911. Initiate BLS/CPR only within your scope. Do not move patient if serious injury suspected unless immediate danger. If patient refuses 911/transport: clearly explain risks, urge them to reconsider, do not argue or force, notify supervisor/physician immediately.',
      'Then notify: Clinical Manager / DON / supervisor at once (call, note exact time and instructions). Notify physician of record. For death outcome: do NOT pronounce; EMS/law enforcement does.',
      'Document in real time: start a real-time note now. Exact time of discovery/fall/call. Location. Objective facts observed (do not speculate). Patient/family exact words in quotation marks. Vitals if taken, injury signs, actions taken (or deferred and why), who was notified + exact time of each notification + instructions received, care provided or deferred + reason, evidence preserved, 911/EMS arrival time, transport destination or refusal details. If EHR down use approved paper downtime process with timestamps/signatures.',
      'Do not: promise outcomes; argue with patient/family; continue unsafe care; transport unless agency policy + supervisor directs; alter/delete records; text PHI; say or imply you can pronounce death.',
      'After immediate safety: open Incident Report within 24h. Update POC contacts. If death or major harm: escalate to sentinel RCA. Preserve chart, access logs.',
    ],
    requiredWorkflows: [
      { id: 'WF-EMERGENCY-RESPONSE', label: 'Emergency Response Protocol' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'TPL-RM-TRIGGER-RCA', label: 'RCA (if adverse outcome)' },
      { id: 'WF-QAPI-TRIGGER', label: 'QAPI Trigger Review' },
    ],
    complianceNotes: [
      'CoP §484.60 — plan of care must address emergency contacts.',
      'Document EMS transport and receiving facility or refusal details fully.',
      'Real-time documentation is critical: write as it happens. Use exact patient/family statements in quotes. Do not rely on later recall.',
      'Unresponsive: 911 first always. Brad never replaces EMS or physician.',
    ],
    domains: ['Clinical', 'Risk', 'QAPI'],
    relatedPolicies: [
      { id: 'CL-EM-001',   name: 'Emergency Response Procedure', domain: 'Clinical' },
      { id: 'CL-POC-001',  name: 'Plan of Care — Emergency Contacts', domain: 'Clinical' },
      { id: 'RM-INC-001',  name: 'Incident Reporting', domain: 'Risk' },
      { id: 'QA-QAPI-001', name: 'QAPI Escalation Trigger', domain: 'QAPI' },
    ],
    missingInformation: [
      'Is 911/EMS already called or on scene? ETA?',
      'What exact symptoms/red flags are present (head strike? LOC? anticoagulants?)?',
      'Has patient refused 911/transport? Exact words used?',
      'Has supervisor/DON and physician been notified (who, times)?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate emergency action plan' },
      { type: 'generate_qapi_digest', studioOutputType: 'qapi_digest', label: 'Generate QAPI trigger digest' },
    ],
    suppressNoAnswer: true,
  },

  CLINICIAN_SAFETY: {
    label: 'Clinician Safety Event',
    severity: 'critical',
    riskLevel: 'critical',
    lifeSafetyFlag: true,
    summary: 'Field clinician in danger or exposed to threat/accident/injury/impaired colleague/unsafe entry. Get to safety first. Do not continue visits until cleared.',
    headline: 'EMERGENCY  Call 911 immediately. Get out of the house now if you can do so safely. If you cannot leave, lock yourself in a room, create distance, stay quiet, and remain on the line with 911. Do not continue the visit. After you are safe, notify your supervisor/DON/Administrator and complete the incident report. Are you safe and out of the home right now?',
    immediateActions: [
      'First, do this now: If anyone is injured, traffic unsafe, active threat/weapon, or you cannot safely leave, call 911. Otherwise leave the scene/home immediately and get to a safe location. For car accident on way to visit: pull over safely, check yourself, do not continue driving to patient until cleared.',
      'Then notify: Supervisor / Clinical Manager / Administrator and Risk right away (call + note time). For staff impaired: do not let them drive or see patients; notify supervisor immediately and remove from duty.',
      'Document in real time: start a real-time note now with exact time, location, what happened (objective facts only), who was involved (use roles/initials), any injury or exposure details, exact words said by patient/family/staff if relevant, 911 called? (time), supervisor notified (time + who + instructions received), affected visits/patients, actions taken. For needle stick/exposure: document time of exposure, first aid done, source patient if known.',
      'Do not: continue the visit or route alone if unsafe; transport patients yourself unless policy + supervisor explicitly directs; argue or investigate; text PHI; admit fault or speculate in notes or with family.',
      'After immediate safety: open incident report / workforce safety report, re-evaluate home safety before next visit, follow exposure protocol (medical eval) for needle/BBP, OSHA/workers comp if injury. For car accident: document missed/delayed visits and patient notifications.',
    ],
    requiredWorkflows: [
      { id: 'WF-WORKFORCE-SAFETY-INCIDENT', label: 'Workforce Safety Incident Report' },
      { id: 'WF-HOME-SAFETY-REASSESSMENT', label: 'Home Environment Safety Re-assessment' },
      { id: 'WF-OSHA-300-LOG', label: 'OSHA 300 Log Entry (if applicable)' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'WF-QAPI-TRIGGER', label: 'QAPI Trigger Review' },
    ],
    complianceNotes: [
      'OSHA 29 CFR §1904 — record work-related injuries within 7 days.',
      'Field-visit safety protocols are a CoP §484.65 QAPI concern when patterns emerge.',
      'Start real-time documentation as events unfold — do not rely on memory later. Use exact quotes for statements. Preserve all evidence.',
      'For exposure: immediate first aid, supervisor, medical evaluation per protocol, do not conceal.',
    ],
    domains: ['Risk', 'Operations', 'QAPI'],
    relatedPolicies: [
      { id: 'HR-WS-001',  name: 'Workforce Safety / Workplace Violence', domain: 'Operations' },
      { id: 'OP-HV-001',  name: 'Home Visit Safety Assessment', domain: 'Operations' },
      { id: 'RM-INC-001', name: 'Incident Reporting', domain: 'Risk' },
      { id: 'OSHA-300',   name: 'OSHA 300 Log Procedure', domain: 'Operations' },
    ],
    missingInformation: [
      'Are you (or the clinician) in a safe location right now?',
      'Was 911 or law enforcement needed/called? Time?',
      'Was there injury, exposure (needle/BBP), or vehicle damage?',
      'Has supervisor been notified? Who and when?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate clinician-safety action plan' },
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate home-safety re-assessment checklist' },
    ],
    suppressNoAnswer: true,
  },

  ADVERSE_EVENT: {
    label: 'Adverse / Near-Miss Event',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'Non-life-threatening adverse (fall w/o red flags, med error, property damage, missing meds). Still treat seriously: assess, notify, document real-time, incident report, QAPI.',
    headline: 'ADVERSE EVENT — ensure patient safe, notify supervisor/physician, document facts immediately, open incident report. For med error or property damage: do not conceal. Feed to QAPI.',
    immediateActions: [
      'First, do this now: Confirm patient is stable and safe. For med error: assess patient immediately for harm. For property damage: secure area, do not alter scene. For missing meds: verify count with patient/caregiver present if safe. Notify supervisor/Clinical Manager at once.',
      'Then notify: Supervisor/Clinical Manager immediately (call + time note). Physician of record as required for med error or change in condition. Family when appropriate per disclosure policy.',
      'Document in real time: start real-time note with exact time of discovery/event, location, objective observations (no blame/speculation), patient/family/staff exact words in "quotes", actions taken or deferred + reason, vital facts, who notified + time + instructions, care provided. Use approved paper downtime if EHR down. Preserve evidence (pill bottles, broken item photos if policy allows, notes).',
      'Do not: conceal or delay reporting med error or damage; alter/delete records; promise outcomes; argue; continue if unsafe; speculate in record.',
      'After immediate: open Incident Report within 24h. Route to QAPI. For med error: follow med error protocol (no concealment). For property: follow incident + possible grievance path. Determine RCA threshold.',
    ],
    requiredWorkflows: [
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'WF-ADVERSE-EVENT-REVIEW', label: 'Adverse Event Review' },
      { id: 'TPL-QA-MONTHLY-QAPI', label: 'QAPI Committee Review', regulatoryDriver: 'CoP §484.65' },
    ],
    complianceNotes: [
      'CoP §484.65(d) — QAPI must act on adverse events and trends.',
      'Falls with injury and medication errors are standard surveyor focus areas.',
      'Document objective facts + exact statements. Real-time note now beats memory later. Do not admit fault or assign blame in records.',
    ],
    domains: ['Risk', 'QAPI', 'Clinical'],
    relatedPolicies: [
      { id: 'RM-INC-001',  name: 'Incident Reporting', domain: 'Risk' },
      { id: 'RM-AE-001',   name: 'Adverse Event Response', domain: 'Risk' },
      { id: 'QA-QAPI-001', name: 'QAPI Escalation Trigger', domain: 'QAPI' },
      { id: 'CL-MED-001',  name: 'Medication Administration & Reconciliation', domain: 'Clinical' },
      { id: 'CL-FALL-001', name: 'Fall Prevention & Response', domain: 'Clinical' },
    ],
    missingInformation: [
      'Was the patient injured or harmed (severity)?',
      'Has physician/supervisor been notified (who, time)?',
      'Is this med error, fall, property damage, or missing meds?',
      'Was Incident Report opened? Any family/patient statements captured exactly?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate adverse-event action plan' },
      { type: 'generate_qapi_digest', studioOutputType: 'qapi_digest', label: 'Generate QAPI adverse-event digest' },
    ],
    suppressNoAnswer: true,
  },

  ABUSE_NEGLECT: {
    label: 'Suspected Abuse / Neglect / Exploitation',
    severity: 'critical',
    riskLevel: 'critical',
    lifeSafetyFlag: true,
    summary: 'Suspected abuse, neglect, or exploitation. Mandated reporting laws apply — report within jurisdictional timelines.',
    headline: 'SUSPECTED ABUSE / NEGLECT — mandated reporting applies. Do not investigate; report first, then document.',
    immediateActions: [
      'If the patient is in immediate danger, call 911 first, then make sure the patient is safe.',
      'Notify your supervisor, the Administrator/DON, and the Compliance Officer immediately (within 1 hour).',
      'Do NOT interrogate the patient or the accused party — this is not your investigation to run.',
      'Notify Adult Protective Services (APS) within the state-mandated reporting window.',
      'Notify law enforcement if your state statute requires it (varies by state and victim type).',
      'Document your observations objectively — facts and direct quotes only, no conclusions or opinions about fault.',
      'Preserve any related evidence; do not rearrange or clean up the scene.',
      'Open an Incident Report within 24 hours and complete the Abuse / Neglect / Exploitation reporting workflow.',
      'Bring it to QAPI for trend review and corrective action.',
    ],
    requiredWorkflows: [
      { id: 'CL-WF-22', label: 'Abuse / Neglect / Exploitation Reporting' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident / Adverse Event Report (24-hr intake)' },
      { id: 'WF-GRIEVANCE-INTAKE', label: 'Complaint / Grievance Intake' },
    ],
    complianceNotes: [
      'Mandatory reporting is state-specific; most states require reporting within 24–72 hours.',
      'CoP §484.50(c) — patient rights include freedom from abuse, neglect, and exploitation.',
      'Never document opinions about guilt — only objective observations.',
      'Escalate through the abuse/neglect/exploitation and grievance/adverse-event process; treat external reporting timelines as hard deadlines.',
    ],
    domains: ['Risk', 'Compliance', 'Clinical'],
    relatedPolicies: [
      { id: 'CL-PR-001', name: 'Patient Rights & Responsibilities', domain: 'Clinical' },
      { id: 'CL-PR-006', name: 'Abuse, Neglect & Exploitation Reporting', domain: 'Clinical' },
      { id: 'CL-MR-001',  name: 'Mandatory Reporting', domain: 'Clinical', isDomainFallback: true },
      { id: 'OP-PA-001', name: 'Patient Complaint & Grievance Resolution', domain: 'Operations' },
      { id: 'RM-INC-001', name: 'Incident / Adverse Event Reporting', domain: 'Risk' },
      { id: 'QA-QAPI-001', name: 'QAPI / Corrective Action', domain: 'QAPI' },
      { id: 'CL-DOC-001', name: 'Documentation Requirements', domain: 'Clinical', isDomainFallback: true },
    ],
    missingInformation: [
      'Is the patient in immediate physical danger?',
      'Has APS been contacted and a case number issued?',
      'Does the jurisdiction require law-enforcement notification?',
      'Is the accused party a household member, caregiver, or agency staff?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate abuse / neglect response plan' },
      { type: 'generate_governing_body_brief', studioOutputType: 'governing_body_brief', label: 'Generate Governing Body alert brief' },
    ],
    suppressNoAnswer: true,
  },

  PRIVACY_BREACH: {
    label: 'HIPAA / Privacy Breach',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'Potential unauthorized disclosure or loss of PHI (e.g. texted to wrong number). Contain, report to Privacy/Compliance, preserve facts, risk assess, do not delete evidence.',
    headline: 'PRIVACY INCIDENT — contain first. Notify Privacy Officer / Compliance immediately. Do not delete or alter anything. Begin real-time documentation of exactly what was sent, to whom, when, and steps taken.',
    immediateActions: [
      'First, do this now: Stop the disclosure if ongoing (e.g. recall message if possible, but do not delete sent items). Secure the device/channel. Do not send more. Do not try to "fix" by deleting evidence.',
      'Then notify: Privacy Officer / Compliance Officer / Administrator right now (call + time). Open HIPAA incident ticket.',
      'Document in real time: start note with exact time of incident/discovery, what PHI was involved (describe without re-sending full), how disclosed (e.g. "texted schedule with names and meds to wrong number"), recipient (if known), who was told, actions to contain, exact timeline. Preserve screenshots/logs if safe. Note: do not alter or delete records or messages.',
      'Do not: delete/alter the sent message or any logs; continue using compromised channel; speculate; contact recipient yourself if it risks more exposure; text additional PHI.',
      'After contain/report: Privacy/Compliance will lead 4-factor risk assessment within 24h, notifications per HIPAA timelines (60 days individuals if breach), breach log, possible HHS/media if large. Continue parallel incident report.',
    ],
    requiredWorkflows: [
      { id: 'WF-HIPAA-INCIDENT', label: 'HIPAA Incident Investigation' },
      { id: 'WF-HIPAA-RISK-ASSESSMENT', label: 'HIPAA 4-Factor Risk Assessment' },
      { id: 'WF-BREACH-NOTIFICATION', label: 'Breach Notification Workflow' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
    ],
    complianceNotes: [
      'HIPAA §164.404–408 — notification timelines (individual 60 days, HHS for < 500 annually, media if ≥ 500 in a state).',
      'Document the 4-factor risk assessment even if you conclude no breach occurred.',
      'State breach-notification laws may add tighter timelines.',
      'Real-time facts only. Preserve all evidence. Do not admit liability.',
    ],
    domains: ['IT/Security', 'Compliance', 'Risk'],
    relatedPolicies: [
      { id: 'IT-HIPAA-001',  name: 'HIPAA Privacy & Security Policy', domain: 'IT/Security' },
      { id: 'IT-BREACH-001', name: 'Breach Notification Procedure', domain: 'IT/Security' },
      { id: 'IT-RISK-001',   name: 'HIPAA 4-Factor Risk Assessment', domain: 'IT/Security' },
      { id: 'CO-PRIV-001',   name: 'Privacy Officer Playbook', domain: 'Compliance' },
    ],
    missingInformation: [
      'Exactly what PHI was disclosed (elements, not full content)?',
      'How (text, email, verbal, lost device)? To whom (wrong number/person)?',
      'Has it been contained? Any recovery attempted?',
      'Has Privacy Officer been notified (who, time)?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate breach response plan' },
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate HIPAA breach audit checklist' },
    ],
    suppressNoAnswer: true,
  },

  CYBERSECURITY_INCIDENT: {
    label: 'Cybersecurity Incident',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'Ransomware, malware, phishing, or account compromise. Isolate, assess PHI exposure, and treat as presumed HIPAA incident.',
    headline: 'CYBERSECURITY INCIDENT — isolate affected systems and assume PHI exposure until the forensic assessment rules it out.',
    immediateActions: [
      'Disconnect affected systems from the network — do not shut down (preserve volatile evidence).',
      'Notify the Information Security Officer and Administrator within 1 hour.',
      'Engage the IR retainer / incident response partner if contracted.',
      'Preserve logs — pull SIEM, firewall, endpoint, and email logs.',
      'Treat as a presumed HIPAA incident until risk assessment concludes otherwise.',
      'Notify cyber-insurance carrier before engaging forensics.',
      'Coordinate with law enforcement (FBI / Secret Service) for ransomware.',
    ],
    requiredWorkflows: [
      { id: 'WF-CYBER-INCIDENT-RESPONSE', label: 'Cybersecurity Incident Response' },
      { id: 'WF-HIPAA-RISK-ASSESSMENT', label: 'HIPAA 4-Factor Risk Assessment' },
      { id: 'TPL-IT-QUARTERLY-VULN', label: 'Follow-up Vulnerability Scan', regulatoryDriver: 'HIPAA §164.308' },
      { id: 'WF-BREACH-NOTIFICATION', label: 'Breach Notification (if applicable)' },
    ],
    complianceNotes: [
      'HIPAA §164.308(a)(6) — security incident procedures.',
      'OCR treats ransomware on ePHI systems as a presumptive breach.',
      'Document the full timeline from detection to containment to eradication.',
    ],
    domains: ['IT/Security', 'Compliance', 'Risk'],
    relatedPolicies: [
      { id: 'IT-IR-001',    name: 'Cybersecurity Incident Response Plan', domain: 'IT/Security' },
      { id: 'IT-HIPAA-001', name: 'HIPAA Privacy & Security Policy', domain: 'IT/Security' },
      { id: 'IT-BC-001',    name: 'Business Continuity & Disaster Recovery', domain: 'IT/Security' },
      { id: 'CO-PRIV-001',  name: 'Privacy Officer Playbook', domain: 'Compliance' },
    ],
    missingInformation: [
      'Which systems are affected and are they isolated?',
      'Is ePHI or PII confirmed or suspected on the affected systems?',
      'Has the cyber-insurance carrier been notified?',
      'Is this a ransomware event and has a ransom note been received?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate cyber incident action plan' },
      { type: 'generate_governing_body_brief', studioOutputType: 'governing_body_brief', label: 'Generate Governing Body incident brief' },
    ],
    suppressNoAnswer: true,
  },

  COMPLIANCE_VIOLATION: {
    label: 'Compliance / Fraud Concern',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'Potential kickback, exclusion, or false-claims concern. Route to Compliance Officer under privileged investigation process.',
    headline: 'COMPLIANCE CONCERN — do not discuss details in non-privileged channels. Route to Compliance Officer immediately.',
    immediateActions: [
      'Route the concern to the Compliance Officer in writing (privileged channel).',
      'Preserve all related documentation; disable deletion / destruction.',
      'Do not retaliate against any reporter — document non-retaliation attestation.',
      'Open Compliance Investigation file under attorney-client privilege where applicable.',
      'If exclusion is suspected, run immediate OIG LEIE + SAM.gov check against the named party.',
      'If False Claims Act exposure, engage external counsel before self-disclosure.',
    ],
    requiredWorkflows: [
      { id: 'WF-COMPLIANCE-INVESTIGATION', label: 'Compliance Investigation' },
      { id: 'WF-OIG-SAM-VERIFICATION', label: 'OIG LEIE + SAM.gov Verification' },
      { id: 'TPL-CO-MONTHLY-REPORT', label: 'Compliance Committee Reporting' },
      { id: 'WF-GOVERNING-BODY-BRIEF', label: 'Governing Body Brief (if material)' },
    ],
    complianceNotes: [
      '42 CFR §1001 — providers must screen all employees / vendors monthly against OIG LEIE.',
      'False Claims Act — treble damages + per-claim penalties; self-disclosure may reduce exposure.',
      'Anti-Kickback Statute — criminal liability risk; consult counsel before action.',
    ],
    domains: ['Compliance', 'Governance', 'Finance'],
    relatedPolicies: [
      { id: 'CO-COMP-001', name: 'Compliance Program Charter', domain: 'Compliance' },
      { id: 'CO-FCA-001',  name: 'False Claims Act / Deficit Reduction Act Policy', domain: 'Compliance' },
      { id: 'CO-AKS-001',  name: 'Anti-Kickback Statute & Stark Compliance', domain: 'Compliance' },
      { id: 'HR-OIG-001',  name: 'OIG LEIE / SAM.gov Screening', domain: 'Compliance' },
    ],
    missingInformation: [
      'Is the concern internal, from a contractor, or from a government entity?',
      'Is the reporter identified or anonymous?',
      'Is there an ongoing billing / claims relationship with the named party?',
      'Has external counsel been engaged?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate compliance investigation plan' },
      { type: 'generate_governing_body_brief', studioOutputType: 'governing_body_brief', label: 'Generate Governing Body brief' },
    ],
    suppressNoAnswer: true,
  },

  BILLING_RISK: {
    label: 'Billing / Revenue Integrity Risk',
    severity: 'moderate',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'Potential overpayment, audit, or billing irregularity. Suspend related billing, document, and respond within MAC / RAC timelines.',
    headline: 'BILLING RISK — suspend impacted claims, preserve documentation, and respond within the MAC / RAC deadline.',
    immediateActions: [
      'Suspend outbound billing on the impacted claim population.',
      'Acknowledge any ADR / audit letter within the stated deadline.',
      'Pull all clinical documentation supporting the claims; archive.',
      'Engage Revenue Cycle Director and Compliance Officer.',
      'If overpayment is confirmed, initiate 60-day self-report to the MAC (42 CFR §401.305).',
      'Log audit into the Compliance Audit Tracker; report quarterly to Governing Body.',
    ],
    requiredWorkflows: [
      { id: 'WF-BILLING-AUDIT-RESPONSE', label: 'Billing Audit Response (ADR / RAC / MAC)' },
      { id: 'WF-OVERPAYMENT-SELFREPORT', label: '60-Day Overpayment Self-Report' },
      { id: 'TPL-FN-WEEKLY-CLAIMS', label: 'Claims Cycle Review' },
      { id: 'TPL-CO-MONTHLY-REPORT', label: 'Compliance Report' },
    ],
    complianceNotes: [
      '42 CFR §401.305 — overpayments must be reported / returned within 60 days.',
      'False Claims Act exposure attaches if overpayment is known and not returned.',
      'ADRs must be answered within the MAC\'s stated window (typically 30–45 days).',
    ],
    domains: ['Finance', 'Compliance'],
    relatedPolicies: [
      { id: 'FN-BILL-001', name: 'Claims & Billing Integrity', domain: 'Finance' },
      { id: 'FN-OPR-001',  name: '60-Day Overpayment Return', domain: 'Finance' },
      { id: 'CO-AUD-001',  name: 'External Audit Response', domain: 'Compliance' },
      { id: 'FN-DOC-001',  name: 'Clinical Documentation Integrity', domain: 'Finance' },
    ],
    missingInformation: [
      'What is the ADR / audit letter deadline?',
      'What MAC / RAC / ZPIC issued the request?',
      'What claim population and service dates are in scope?',
      'Has billing on the impacted population been suspended?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate billing audit response plan' },
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate claim-integrity audit checklist' },
    ],
    suppressNoAnswer: true,
  },

  REGULATORY_INQUIRY: {
    label: 'Regulatory Inquiry / Survey',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: false,
    summary: 'CMS / State survey, subpoena, or complaint investigation. Activate Survey Readiness Mode and single-point-of-contact policy.',
    headline: 'REGULATORY INQUIRY — activate Survey Readiness mode. Single point of contact; do not provide documents ad-hoc.',
    immediateActions: [
      'Designate Administrator or Compliance Officer as the single point of contact.',
      'Acknowledge the request in writing within 24 hours.',
      'Activate Pre-Survey Audit checklist; confirm core documentation readiness.',
      'Convene the Survey Response Team (Admin, DON, Compliance, QAPI).',
      'Do not volunteer documents outside the scope of the request.',
      'If subpoena, engage external counsel before responding.',
      'Prepare surveyor entrance-conference packet and staff briefing.',
    ],
    requiredWorkflows: [
      { id: 'WF-SURVEY-READINESS', label: 'Survey Readiness Activation' },
      { id: 'WF-PRE-SURVEY-AUDIT', label: 'Pre-Survey Audit' },
      { id: 'WF-SUBPOENA-RESPONSE', label: 'Subpoena / CID Response (if applicable)' },
      { id: 'TPL-GV-QUARTERLY-GB', label: 'Governing Body Notification' },
    ],
    complianceNotes: [
      'CoP §488 — survey protocol; CMS expects entrance / exit conferences.',
      'Document chain-of-custody for any document turned over.',
      'Do not correct records in flight — annotate, do not alter.',
    ],
    domains: ['Compliance', 'Governance', 'QAPI'],
    relatedPolicies: [
      { id: 'CO-SURV-001',  name: 'Survey Readiness Protocol', domain: 'Compliance' },
      { id: 'CO-SUBP-001',  name: 'Subpoena / CID Response', domain: 'Compliance' },
      { id: 'GV-DOC-001',   name: 'Regulatory Document Chain-of-Custody', domain: 'Governance' },
      { id: 'QA-QAPI-001',  name: 'QAPI Program Documentation', domain: 'QAPI' },
    ],
    missingInformation: [
      'What agency / regulator issued the request?',
      'What is the acknowledgment deadline?',
      'Is the scope a survey, complaint investigation, or subpoena?',
      'Has the surveyor entrance-conference time been scheduled?',
    ],
    suggestedGenerators: [
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate pre-survey audit' },
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate survey response plan' },
      { type: 'generate_governing_body_brief', studioOutputType: 'governing_body_brief', label: 'Generate Governing Body survey brief' },
    ],
    suppressNoAnswer: true,
  },

  EMERGENCY_OPERATIONAL: {
    label: 'Operational Emergency / Disaster',
    severity: 'high',
    riskLevel: 'high',
    lifeSafetyFlag: true,
    summary: 'Disaster (wildfire, quake, flood, outage, evac) or EHR downtime. Activate EP plan, triage patients first, document command decisions and contact attempts in real time. For patient refuse evac: document refusal + risks explained.',
    headline: 'OPERATIONAL EMERGENCY / DISASTER or EHR DOWNTIME — activate plan. Patient triage and safety first. For wildfire/flood/evac: contact patients, document status/refusals. For EHR down: use approved paper downtime docs with times/signatures, enter later per policy.',
    immediateActions: [
      'First, do this now: Activate Emergency Preparedness Plan / Incident Command. Triage patients by acuity/evac need. For EHR outage: switch to approved paper downtime forms immediately; timestamp and sign everything. For evac order: start contact attempts per priority list.',
      'Then notify: Supervisor/Incident Commander, Administrator. Local emergency mgmt if required. For patient who refuses evac: notify supervisor, explain risks clearly to patient, document exact words + that risks were explained, do not abandon care without direction.',
      'Document in real time: Incident Command Log with every decision/time. Patient contact attempt log (who, time, method, outcome, status). For refusals: time, exact patient statement in quotes, risks explained, instructions to patient, follow-up plan. For EHR downtime: every entry time, signature, later cross-ref when entered in EHR. All command decisions.',
      'Do not: leave high-acuity without plan; argue with refusing patient; skip paper process during downtime; delete logs; promise transport you cannot deliver.',
      'After: complete After-Action Report (30d), update EP plan, QAPI review of patient outcomes and refusals, restore EHR data entry per downtime policy.',
    ],
    requiredWorkflows: [
      { id: 'TPL-OP-ANNUAL-EP', label: 'EP Exercise / Activation Workflow', regulatoryDriver: 'CoP §484.102' },
      { id: 'WF-INCIDENT-COMMAND-LOG', label: 'Incident Command Log' },
      { id: 'WF-AFTER-ACTION-REPORT', label: 'After-Action Report (30-day)' },
      { id: 'TPL-OP-BIENNIAL-EP-REVIEW', label: 'EP Plan Post-Event Update' },
    ],
    complianceNotes: [
      'CoP §484.102 — full EP plan activation, communication, training evidence.',
      'Track patient-level outcomes during the event for QAPI review. Document all refusals thoroughly.',
      'Real-time logs + contact attempts are survey-critical. Use paper downtime exactly as policy requires.',
      'Retain AAR for 3 years minimum.',
    ],
    domains: ['Operations', 'Risk', 'Clinical', 'QAPI'],
    relatedPolicies: [
      { id: 'OP-EP-001',   name: 'Emergency Preparedness Plan', domain: 'Operations' },
      { id: 'OP-CONT-001', name: 'Continuity of Operations Plan (COOP)', domain: 'Operations' },
      { id: 'OP-IC-001',   name: 'Incident Command Structure', domain: 'Operations' },
      { id: 'OP-AAR-001',  name: 'After-Action Review Policy', domain: 'Operations' },
    ],
    missingInformation: [
      'Scope (how many patients, evac vs outage)?',
      'High-acuity patients at risk? Their status?',
      'Has Incident Command activated? Any patient refusing evac (exact words)?',
      'Using paper downtime? All entries timed/signed?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate emergency response plan' },
      { type: 'generate_audit_checklist', studioOutputType: 'audit_checklist', label: 'Generate EP activation checklist' },
    ],
    suppressNoAnswer: true,
  },

  COMPLAINT: {
    label: 'Patient / Family Complaint',
    severity: 'moderate',
    riskLevel: 'moderate',
    lifeSafetyFlag: false,
    summary: 'Patient/family complaint or grievance, including legal threat ("sue", "lawyer", "lawsuit"). Treat legal mentions seriously: do not argue, escalate to Admin + legal, preserve records, continue grievance workflow in parallel.',
    headline: 'COMPLAINT / LEGAL THREAT — take seriously. If family says sue, lawyer, attorney, lawsuit, or legal action: acknowledge concern, do not defend/argue/discuss fault. Escalate to Administrator and legal counsel immediately. Preserve all records (litigation hold if indicated). Run grievance/incident process alongside.',
    immediateActions: [
      'First, do this now: Acknowledge the concern calmly ("I hear you are very upset and I will escalate this right away"). Do not argue, explain away, or admit anything. If legal words used, stop the conversation politely and escalate.',
      'Then notify: Administrator and supervisor immediately (verbal + note time). If "sue/lawsuit/attorney/legal" mentioned: notify legal counsel too. Continue grievance intake workflow.',
      'Document in real time: exact time/date, exact words used by family/patient (in "quotes"), who was present, what you said in response (minimal, non-committal), who you notified + times + instructions received, any other facts. Do not alter, delete, or recreate any records.',
      'Do not: debate liability or fault; promise resolution or money; argue with complainant; delete or change documentation; discuss with unauthorized parties.',
      'After immediate: log in grievance register per timeline (1 day), acknowledge in writing (5 bus days), investigate (independent), respond in writing (30 days). For legal threat: Admin/legal will initiate preservation/lit hold as needed. Attach to QAPI. Keep parallel incident report if safety event underlies.',
    ],
    requiredWorkflows: [
      { id: 'WF-GRIEVANCE-INTAKE', label: 'Grievance / Complaint Intake' },
      { id: 'WF-GRIEVANCE-INVESTIGATION', label: 'Grievance Investigation' },
      { id: 'TPL-QA-MONTHLY-QAPI', label: 'QAPI Complaint Trend Review' },
    ],
    complianceNotes: [
      'CoP §484.50(c)(5) — grievance process required; timely written response.',
      'Track response timelines — surveyors review the grievance log.',
      'Legal threat = record preservation priority. Do not debate. Let legal counsel guide communication after escalation.',
    ],
    domains: ['Clinical', 'QAPI', 'Compliance'],
    relatedPolicies: [
      { id: 'CL-GRV-001',  name: 'Patient Grievance & Complaint Policy', domain: 'Clinical' },
      { id: 'CL-PR-001',   name: 'Patient Rights', domain: 'Clinical' },
      { id: 'QA-QAPI-001', name: 'QAPI Trend Review', domain: 'QAPI' },
    ],
    missingInformation: [
      'Is this a plain complaint or does it mention sue/lawyer/lawsuit/legal action/state complaint (exact words)?',
      'Has Admin/supervisor/legal been notified (who, times)?',
      'Has grievance been logged? Is safety event or allegation of harm involved (escalate)?',
    ],
    suggestedGenerators: [
      { type: 'generate_action_plan', studioOutputType: 'action_plan', label: 'Generate complaint resolution plan' },
      { type: 'generate_qapi_digest', studioOutputType: 'qapi_digest', label: 'Generate QAPI complaint digest' },
    ],
    suppressNoAnswer: true,
  },

  GENERAL_QUERY: {
    label: 'General Policy Query',
    severity: 'low',
    riskLevel: 'low',
    lifeSafetyFlag: false,
    summary: 'No critical-scenario triggers detected. Standard corpus-backed answer path.',
    headline: '',
    immediateActions: [],
    requiredWorkflows: [],
    relatedPolicies: [],
    missingInformation: [],
    complianceNotes: [],
    domains: [],
    suggestedGenerators: [],
    suppressNoAnswer: false,
  },
};

/* ─────────────────────────────────────────────────────────────
   Public API.
   ───────────────────────────────────────────────────────────── */

/**
 * Classify a free-form input into a compliance scenario + playbook.
 * Always returns a ScenarioMapping (GENERAL_QUERY fallback when nothing matches).
 */
export function classifyScenario(input: string): ScenarioMapping {
  const text = (input ?? '').trim();
  if (!text) return toMapping('GENERAL_QUERY', [], [], 'low');

  const hits: Array<{ rule: ScenarioRule; triggers: string[] }> = [];
  for (const rule of RULES) {
    const triggers: string[] = [];
    for (const p of rule.patterns) {
      const m = text.match(p);
      if (m) triggers.push(m[0].trim());
    }
    if (triggers.length > 0) hits.push({ rule, triggers });
  }

  if (hits.length === 0) {
    return toMapping('GENERAL_QUERY', [], [], 'low');
  }

  hits.sort((a, b) => b.rule.priority - a.rule.priority);
  const primary = hits[0];
  const related = hits
    .slice(1)
    .map(h => h.rule.category)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  // Confidence: multiple patterns for the same category = high; single = medium.
  const confidence: ScenarioMapping['confidence'] =
    primary.triggers.length >= 2 ? 'high' : 'medium';

  // Capture additional phrases if a captureWords regex is declared.
  const extra: string[] = [];
  if (primary.rule.captureWords) {
    const matches = text.match(primary.rule.captureWords);
    if (matches) extra.push(...matches.map(s => s.toLowerCase()));
  }
  const matchedTriggers = Array.from(
    new Set([...primary.triggers.map(t => t.toLowerCase()), ...extra]),
  ).slice(0, 8);

  return toMapping(primary.rule.category, matchedTriggers, related, confidence);
}

/** Narrow convenience — returns a mapping for an already-known category. */
export function getPlaybook(category: ScenarioCategory): ScenarioMapping {
  return toMapping(category, [], [], 'high');
}

function toMapping(
  category: ScenarioCategory,
  matchedTriggers: string[],
  relatedCategories: ScenarioCategory[],
  confidence: ScenarioMapping['confidence'],
): ScenarioMapping {
  const pb = PLAYBOOKS[category];
  return {
    category,
    confidence,
    matchedTriggers,
    relatedCategories,
    ...pb,
  };
}

/** Does this scenario require the responder to bypass "no answer found"? */
export function isHighStakesScenario(m: ScenarioMapping): boolean {
  return m.category !== 'GENERAL_QUERY' && m.suppressNoAnswer;
}
