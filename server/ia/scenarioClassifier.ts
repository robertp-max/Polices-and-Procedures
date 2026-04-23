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
      /\b(sentinel event|never event|wrong[- ]patient|wrong[- ]site|unexpected death)\b/i,
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
      /\b(overdose|unresponsive patient|unconscious patient)\b/i,
      /\bcall[- ]?911\b/i,
      /\b(fire (in|at) (the )?home|active (shooter|fire|bleeding))\b/i,
      /\bsevere bleeding|hemorrhag(e|ing)\b/i,
    ],
    captureWords: /\b(911|cardiac arrest|unresponsive|overdose|fire|shooter|hemorrhag\w*|anaphyla\w*)\b/gi,
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
    ],
    captureWords: /\b(assaulted|threatened|stalked|robbed|weapon|gun|knife|hostile|unsafe)\b/gi,
  },
  {
    category: 'ABUSE_NEGLECT',
    priority: 85,
    patterns: [
      /\b(elder abuse|patient abuse|neglect(ed)?|exploitation|financial exploitation)\b/i,
      /\b(abandon(ed|ment))\b/i,
      /\b(bruise|injury)[^.]{0,40}\b(unexplained|suspicious|inconsistent)\b/i,
      /\b(aps|adult protective services)\b/i,
      /\b(mandated report|mandatory report)\b/i,
    ],
    captureWords: /\b(abuse|neglect|exploitation|abandon\w*|APS)\b/gi,
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
    ],
    captureWords: /\b(med error|fall|adverse|near miss|pressure ulcer|hospitalization)\b/gi,
  },
  {
    category: 'PRIVACY_BREACH',
    priority: 75,
    patterns: [
      /\b(hipaa|phi|privacy) (breach|incident|violation|disclosure)\b/i,
      /\b(unauthorized (access|disclosure))\b/i,
      /\b(lost|stolen) (laptop|phone|device|usb|thumb ?drive|paperwork|chart)\b/i,
      /\b(mis[- ]?directed|wrong[- ]?recipient) (fax|email|letter)\b/i,
      /\b(faxed? to (the )?wrong)\b/i,
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
    ],
    captureWords: /\b(disaster|evacuat\w*|outage|pandemic|outbreak|hurricane|wildfire)\b/gi,
  },
  {
    category: 'COMPLAINT',
    priority: 40,
    patterns: [
      /\b(patient (complaint|grievance)|family complaint|ombudsman)\b/i,
      /\b(complaint (filed|received|investigation))\b/i,
    ],
    captureWords: /\b(complaint|grievance|ombudsman)\b/gi,
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
    summary: 'Active life-threatening clinical event. Execute emergency response before any compliance step.',
    headline: 'LIFE-SAFETY EMERGENCY — stabilize the patient first. Compliance actions follow once the scene is secure.',
    immediateActions: [
      'Call 911 immediately; stay on line until EMS arrives.',
      'Initiate CPR / basic life support per clinician scope.',
      'Secure the scene and document vitals and interventions contemporaneously.',
      'Notify Director of Nursing and physician of record.',
      'After stabilization, open Incident Report within 24 hours.',
      'If outcome is death or major permanent harm, escalate to Sentinel Event RCA workflow.',
    ],
    requiredWorkflows: [
      { id: 'WF-EMERGENCY-RESPONSE', label: 'Emergency Response Protocol' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'TPL-RM-TRIGGER-RCA', label: 'RCA (if adverse outcome)' },
      { id: 'WF-QAPI-TRIGGER', label: 'QAPI Trigger Review' },
    ],
    complianceNotes: [
      'CoP §484.60 — plan of care must address emergency contacts.',
      'Document EMS transport and receiving facility.',
      'Update patient\'s responsible-party contacts immediately.',
    ],
    domains: ['Clinical', 'Risk', 'QAPI'],
    relatedPolicies: [
      { id: 'CL-EM-001',   name: 'Emergency Response Procedure', domain: 'Clinical' },
      { id: 'CL-POC-001',  name: 'Plan of Care — Emergency Contacts', domain: 'Clinical' },
      { id: 'RM-INC-001',  name: 'Incident Reporting', domain: 'Risk' },
      { id: 'QA-QAPI-001', name: 'QAPI Escalation Trigger', domain: 'QAPI' },
    ],
    missingInformation: [
      'Is the patient currently stable?',
      'Has EMS been dispatched and given an ETA?',
      'Has the physician of record been notified?',
      'Which receiving facility will take transport?',
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
    riskLevel: 'high',
    lifeSafetyFlag: true,
    summary: 'Field clinician is in danger or was exposed to a threatening environment. Pull the clinician to safety; then document and re-assess home visit safety.',
    headline: 'CLINICIAN SAFETY — protect staff first, then document. Suspend further visits to this location until a safety re-evaluation is complete.',
    immediateActions: [
      'Call 911 if there is an active threat; otherwise have the clinician leave the scene immediately.',
      'Confirm clinician is in a safe location; provide post-event support.',
      'Suspend all future visits to that address pending safety re-evaluation.',
      'Notify the Administrator, Director of Nursing, and Risk Manager within 1 hour.',
      'Open a Workforce Safety Incident Report within 24 hours.',
      'If bodily harm occurred, initiate OSHA 300 log entry and workers\' comp intake.',
      'Re-score the Home Environment Safety Assessment before resuming care.',
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
      'Review the Home Environment Safety Assessment before the next visit.',
    ],
    domains: ['Risk', 'Operations', 'QAPI'],
    relatedPolicies: [
      { id: 'HR-WS-001',  name: 'Workforce Safety / Workplace Violence', domain: 'Operations' },
      { id: 'OP-HV-001',  name: 'Home Visit Safety Assessment', domain: 'Operations' },
      { id: 'RM-INC-001', name: 'Incident Reporting', domain: 'Risk' },
      { id: 'OSHA-300',   name: 'OSHA 300 Log Procedure', domain: 'Operations' },
    ],
    missingInformation: [
      'Is the clinician in a safe location right now?',
      'Was law enforcement called?',
      'Did the clinician sustain any physical injury?',
      'Is the address flagged in the scheduling system for follow-up visits?',
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
    summary: 'Non-life-threatening adverse event or near-miss. Document, review, and feed into QAPI trend analysis.',
    headline: 'ADVERSE EVENT — open an incident report within 24 hours and route to QAPI for trend review.',
    immediateActions: [
      'Ensure patient is stable and physician of record has been notified.',
      'Open Incident Report in the operational system within 24 hours.',
      'Preserve all clinical documentation relating to the event.',
      'Attach event to the next QAPI Committee agenda.',
      'Determine if RCA is warranted (serious injury triggers RCA).',
      'Notify family per Adverse Event Disclosure policy.',
    ],
    requiredWorkflows: [
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'WF-ADVERSE-EVENT-REVIEW', label: 'Adverse Event Review' },
      { id: 'TPL-QA-MONTHLY-QAPI', label: 'QAPI Committee Review', regulatoryDriver: 'CoP §484.65' },
    ],
    complianceNotes: [
      'CoP §484.65(d) — QAPI must act on adverse events and trends.',
      'Falls with injury and medication errors are standard surveyor focus areas.',
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
      'Was the patient injured (severity level)?',
      'Has the physician of record been notified?',
      'Was an Incident Report opened in the operational system?',
      'Does the event meet the agency threshold for RCA?',
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
      'If patient is in immediate danger, call 911.',
      'Do NOT interrogate the patient or accused party — this is not an investigation.',
      'Notify Adult Protective Services (APS) within the state-mandated window.',
      'Notify law enforcement if statute requires (varies by state and victim type).',
      'Notify Administrator and Compliance Officer within 1 hour.',
      'Document observations objectively — no conclusions or opinions.',
      'Open Incident Report within 24 hours.',
      'Attach to QAPI agenda for trend review and policy reinforcement.',
    ],
    requiredWorkflows: [
      { id: 'WF-APS-REPORT', label: 'Adult Protective Services Report' },
      { id: 'WF-INCIDENT-REPORT', label: 'Incident Report (24-hr intake)' },
      { id: 'WF-MANDATORY-REPORTER-LOG', label: 'Mandatory Reporter Log' },
      { id: 'WF-QAPI-TRIGGER', label: 'QAPI Trigger Review' },
    ],
    complianceNotes: [
      'Mandatory reporting is state-specific; most states require reporting within 24–72 hours.',
      'CoP §484.50(c) — patient rights include freedom from abuse, neglect, exploitation.',
      'Never document opinions about guilt — only observations.',
    ],
    domains: ['Risk', 'Compliance', 'Clinical'],
    relatedPolicies: [
      { id: 'CO-ABN-001',  name: 'Abuse, Neglect & Exploitation Response', domain: 'Compliance' },
      { id: 'CO-MR-001',   name: 'Mandatory Reporter Duties', domain: 'Compliance' },
      { id: 'CL-PR-001',   name: 'Patient Rights', domain: 'Clinical' },
      { id: 'RM-INC-001',  name: 'Incident Reporting', domain: 'Risk' },
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
    summary: 'Potential unauthorized disclosure or loss of PHI. Investigate, perform risk assessment, and notify per HIPAA Breach Notification Rule.',
    headline: 'PRIVACY INCIDENT — begin HIPAA risk assessment within 24 hours. Notifications, if required, must go out within 60 days.',
    immediateActions: [
      'Contain the incident — secure devices, revoke access, or recover disclosed records.',
      'Open HIPAA Incident Report and notify the Privacy Officer immediately.',
      'Conduct a formal Risk Assessment (4-factor HHS test) within 24 hours.',
      'Document the scope of PHI involved and recipients.',
      'If > 500 individuals, prepare HHS and media notification (60-day window).',
      'Notify affected individuals within 60 days if risk assessment concludes breach.',
      'Update access logs and change credentials for any compromised account.',
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
    ],
    domains: ['IT/Security', 'Compliance', 'Risk'],
    relatedPolicies: [
      { id: 'IT-HIPAA-001',  name: 'HIPAA Privacy & Security Policy', domain: 'IT/Security' },
      { id: 'IT-BREACH-001', name: 'Breach Notification Procedure', domain: 'IT/Security' },
      { id: 'IT-RISK-001',   name: 'HIPAA 4-Factor Risk Assessment', domain: 'IT/Security' },
      { id: 'CO-PRIV-001',   name: 'Privacy Officer Playbook', domain: 'Compliance' },
    ],
    missingInformation: [
      'What PHI elements were disclosed or exposed?',
      'How many individuals are affected?',
      'Was the disclosure to an internal or external party?',
      'Has the disclosure been recovered / contained?',
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
    summary: 'Disaster or operational disruption. Activate the Emergency Preparedness plan and document all command decisions.',
    headline: 'OPERATIONAL EMERGENCY — activate Emergency Preparedness plan. Incident Commander assumes decision authority.',
    immediateActions: [
      'Activate the Emergency Preparedness Plan; appoint Incident Commander.',
      'Triage patients by acuity and shelter / evacuation need.',
      'Execute communication plan — staff, patients, physicians, regulators.',
      'Coordinate with local emergency management and community partners.',
      'Document all command decisions in the Incident Command Log.',
      'After action: complete After-Action Report within 30 days and update EP plan.',
    ],
    requiredWorkflows: [
      { id: 'TPL-OP-ANNUAL-EP', label: 'EP Exercise / Activation Workflow', regulatoryDriver: 'CoP §484.102' },
      { id: 'WF-INCIDENT-COMMAND-LOG', label: 'Incident Command Log' },
      { id: 'WF-AFTER-ACTION-REPORT', label: 'After-Action Report (30-day)' },
      { id: 'TPL-OP-BIENNIAL-EP-REVIEW', label: 'EP Plan Post-Event Update' },
    ],
    complianceNotes: [
      'CoP §484.102 — full EP plan activation, communication, training evidence.',
      'Track patient-level outcomes during the event for QAPI review.',
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
      'What is the scope of the operational disruption (patients affected)?',
      'Are any high-acuity patients in immediate risk?',
      'Has the Incident Command been activated and leaders assigned?',
      'Have downstream partners (hospitals, EMS, pharmacy) been notified?',
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
    summary: 'Patient or family complaint. Log, acknowledge in writing, and resolve per the grievance timeline.',
    headline: 'COMPLAINT — acknowledge within 5 business days and close per the agency\'s grievance timeline.',
    immediateActions: [
      'Log complaint in the grievance register within 1 business day.',
      'Acknowledge receipt in writing within 5 business days.',
      'Assign investigator (not the clinician named in the complaint).',
      'Interview staff and review documentation.',
      'Respond in writing with findings and corrective action within 30 days.',
      'Attach summary to next QAPI agenda.',
    ],
    requiredWorkflows: [
      { id: 'WF-GRIEVANCE-INTAKE', label: 'Grievance / Complaint Intake' },
      { id: 'WF-GRIEVANCE-INVESTIGATION', label: 'Grievance Investigation' },
      { id: 'TPL-QA-MONTHLY-QAPI', label: 'QAPI Complaint Trend Review' },
    ],
    complianceNotes: [
      'CoP §484.50(c)(5) — grievance process required; timely written response.',
      'Track response timelines — surveyors review the grievance log.',
    ],
    domains: ['Clinical', 'QAPI', 'Compliance'],
    relatedPolicies: [
      { id: 'CL-GRV-001',  name: 'Patient Grievance & Complaint Policy', domain: 'Clinical' },
      { id: 'CL-PR-001',   name: 'Patient Rights', domain: 'Clinical' },
      { id: 'QA-QAPI-001', name: 'QAPI Trend Review', domain: 'QAPI' },
    ],
    missingInformation: [
      'Is the complaint alleging abuse, neglect, or serious harm (escalate if yes)?',
      'Is the complainant the patient, family, or external party?',
      'Has the complaint been logged in the grievance register?',
      'Is the clinician named in the complaint currently assigned to the patient?',
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
