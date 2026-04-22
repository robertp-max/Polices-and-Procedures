/**
 * Session Manager — Orchestrates the session lifecycle per chat turn.
 *
 * Each call to `processTurn()`:
 *   1. Loads or creates session state
 *   2. Classifies the user message
 *   3. Updates session state (mode, urgency, incident type, etc.)
 *   4. Builds enhanced retrieval query
 *   5. Builds session context block for prompt injection
 *   6. Records user turn in timeline
 */

import { randomUUID } from 'node:crypto';
import type { BradSessionState, BradMode, ClassificationResult, SessionSummary } from './types.js';
import { sessionStore, createSessionState, appendMessage, addTimelineEvent } from './store.js';
import { classify, buildRetrievalQuery } from './classifier.js';
import type { StructuredResponse } from '../types.js';

export interface TurnContext {
  sessionState: BradSessionState;
  classification: ClassificationResult;
  /** Enhanced query for conversation-aware retrieval. */
  retrievalQuery: string;
  /** Domain hints for retrieval filtering. */
  domainHints: string[];
  /** Context block injected into the LLM prompt (before corpus). */
  sessionContextBlock: string;
  isNewSession: boolean;
}

/* ── Mode labels (UI display) ─────────────────────────────────────── */

const MODE_LABELS: Record<BradMode, string> = {
  general: 'General',
  emergency_response: '🚨 Emergency Response',
  clinical_protocol: 'Clinical Protocol',
  policy_interpretation: 'Policy Interpretation',
  action_plan: 'Action Plan',
  form_completion: 'Form Completion',
  incident_reporting: 'Incident Reporting',
  qapi_followup: 'QAPI Follow-Up',
  survey_readiness: 'Survey Readiness',
  compliance_investigation: 'Compliance Investigation',
  context_assist: 'Context Assist',
};

/* ── Case title generator ─────────────────────────────────────────── */

function generateCaseTitle(classification: ClassificationResult, input: string): string {
  if (classification.incidentType) {
    const titles: Record<string, string> = {
      suspected_heart_attack: 'Cardiac Emergency — Patient Safety Response',
      stroke: 'Stroke Emergency — Patient Safety Response',
      respiratory_emergency: 'Respiratory Emergency — Patient Safety Response',
      fall_with_injury: 'Fall with Injury — Incident Response',
      medication_error: 'Medication Error — Incident Investigation',
      abuse_allegation: 'Abuse/Neglect Allegation — Mandatory Reporting',
      data_breach: 'Data Breach — HIPAA Incident Response',
      survey_event: 'CMS Survey Event — Readiness Response',
      infection_control: 'Infection Control — Protocol Activation',
      documentation_deficiency: 'Documentation Deficiency — Corrective Action',
      other: 'Compliance Incident — Investigation',
    };
    return titles[classification.incidentType] ?? 'Active Case';
  }
  // Truncate input for title
  return input.length > 60 ? input.slice(0, 57) + '…' : input;
}

/* ── Compact case summary (rolling) ─────────────────────────────────── */

function buildCaseSummary(state: BradSessionState, latestInput: string): string {
  const parts: string[] = [];
  if (state.detectedIncidentType) {
    parts.push(`Incident: ${state.detectedIncidentType.replace(/_/g, ' ')}`);
  }
  if (state.immediateActions.length > 0) {
    parts.push(`Actions taken: ${state.immediateActions.slice(0, 2).join('; ')}`);
  }
  if (state.recentMessages.length > 0) {
    const last = state.recentMessages.slice(-2);
    const recap = last.map(m => `${m.role === 'user' ? 'User' : 'Brad'}: ${m.content.slice(0, 100)}`).join(' | ');
    parts.push(recap);
  }
  return parts.join('. ').slice(0, 400);
}

/* ── Session context block (injected into prompt) ──────────────────── */

function buildSessionContextBlock(
  state: BradSessionState,
  classification: ClassificationResult,
): string {
  if (state.mode === 'general' && !state.detectedIncidentType) return '';

  const lines: string[] = [
    '─── BRAD SESSION CONTEXT (do not cite as corpus) ───',
    `Active Mode: ${MODE_LABELS[state.mode] ?? state.mode}`,
    `Urgency: ${state.urgency.toUpperCase()}`,
  ];

  if (state.caseTitle) lines.push(`Case: ${state.caseTitle}`);
  if (state.detectedIncidentType) {
    lines.push(`Incident Type: ${state.detectedIncidentType.replace(/_/g, ' ')}`);
  }
  if (state.caseSummary) lines.push(`Context: ${state.caseSummary}`);
  if (state.lifeSafetyFlag) {
    lines.push('⚠ LIFE SAFETY FLAG ACTIVE — lead directAnswer with immediate emergency action');
  }
  if (state.immediateActions.length > 0) {
    lines.push(`Prior Actions Recommended: ${state.immediateActions.slice(0, 3).join('; ')}`);
  }
  if (state.recentMessages.length > 0) {
    const last = state.recentMessages.slice(-3);
    lines.push('Recent exchange:');
    last.forEach(m => lines.push(`  ${m.role === 'user' ? 'User' : 'Brad'}: ${m.content.slice(0, 150)}`));
  }
  lines.push('─── END SESSION CONTEXT ───');
  lines.push('INSTRUCTION: Continue the active case. Do not re-interpret from scratch. Follow-up questions should be answered in the context of the case above.');
  if (state.lifeSafetyFlag) {
    lines.push('EMERGENCY RULE: directAnswer MUST begin with emergency action (call 911, stay with patient). Do not bury this under policy explanation.');
  }

  return lines.join('\n');
}

/* ── Main entry point ─────────────────────────────────────────────── */

export function processTurn(
  threadId: string,
  userInput: string,
): TurnContext {
  const existing = sessionStore.load(threadId);
  const isNewSession = !existing;
  const state: BradSessionState = existing ?? createSessionState(threadId);

  // Classify the current message
  const classification = classify(userInput, existing);

  // Update session state
  const previousMode = state.mode;
  state.mode = classification.mode;
  state.urgency = classification.urgency;

  if (classification.incidentType && !state.detectedIncidentType) {
    state.detectedIncidentType = classification.incidentType;
    addTimelineEvent(state, 'system', 'incident_detected',
      `Incident detected: ${classification.incidentType.replace(/_/g, ' ')}`);
  }

  if (classification.lifeSafetyFlag && !state.lifeSafetyFlag) {
    state.lifeSafetyFlag = true;
    addTimelineEvent(state, 'system', 'life_safety_flagged',
      'Life-threatening emergency detected. Emergency mode activated.');
  }

  if (classification.escalationRequired) {
    state.escalationRequired = true;
  }
  if (classification.qapiTriggerPossible) {
    state.qapiTriggerPossible = true;
  }
  if (classification.detectedRole && state.userRole === 'unknown') {
    state.userRole = classification.detectedRole;
  }

  // Domain routing
  if (classification.detectedDomains.length > 0) {
    const merged = Array.from(new Set([...state.activeDomains, ...classification.detectedDomains]));
    state.activeDomains = merged.slice(0, 6);
  }

  // Generate case title on first meaningful turn
  if (!state.caseTitle && (classification.incidentType || classification.urgency !== 'low')) {
    state.caseTitle = generateCaseTitle(classification, userInput);
    addTimelineEvent(state, 'system', 'case_opened', `Case opened: ${state.caseTitle}`);
  }

  // Record mode change in timeline
  if (previousMode !== state.mode) {
    addTimelineEvent(state, 'system', 'mode_change',
      `Mode changed: ${previousMode} → ${state.mode}`);
  }

  state.lastUserIntent = classification.intent;

  // Build case summary
  state.caseSummary = buildCaseSummary(state, userInput);

  // Record user turn
  appendMessage(state, {
    role: 'user',
    content: userInput.slice(0, 400),
    mode: state.mode,
    urgency: state.urgency,
  });
  addTimelineEvent(state, 'user', 'user_message', userInput.slice(0, 200));

  // Build retrieval query
  const retrievalQuery = buildRetrievalQuery(userInput, state, classification);

  // Build session context for prompt
  const sessionContextBlock = buildSessionContextBlock(state, classification);

  // Persist state
  sessionStore.save(state);

  return {
    sessionState: state,
    classification,
    retrievalQuery,
    domainHints: state.activeDomains,
    sessionContextBlock,
    isNewSession,
  };
}

/* ── Post-response update ─────────────────────────────────────────── */

export function recordAssistantTurn(
  threadId: string,
  response: StructuredResponse,
): void {
  const state = sessionStore.load(threadId);
  if (!state) return;

  // Extract immediate actions from response
  if (response.requirementsSnapshot?.length > 0) {
    const required = response.requirementsSnapshot
      .filter(r => r.status === 'required')
      .slice(0, 3)
      .map(r => r.label);
    if (required.length > 0) {
      state.immediateActions = Array.from(new Set([...state.immediateActions, ...required])).slice(0, 5);
    }
  }

  // Extract pending tasks from operational gaps
  if ((response.operationalGaps?.length ?? 0) > 0) {
    const tasks = (response.operationalGaps ?? [])
      .slice(0, 3)
      .map(g => g.nextAction.slice(0, 120));
    const merged = Array.from(new Set([...state.pendingTasks, ...tasks]));
    state.pendingTasks = merged.slice(0, 8);
  }

  // Extract active policies from citations
  if (response.citations?.length > 0) {
    const policyIds = response.citations.map(c => c.policyId).filter(Boolean);
    state.activePolicies = Array.from(new Set([...state.activePolicies, ...policyIds])).slice(0, 10);
  }
  if (response.requiredArtifacts?.length > 0) {
    state.activeForms = Array.from(new Set([...state.activeForms, ...response.requiredArtifacts])).slice(0, 8);
    state.formsRequired = true;
  }

  // Record Brad turn in message history
  appendMessage(state, {
    role: 'assistant',
    content: response.directAnswer.slice(0, 400),
    mode: state.mode,
    urgency: state.urgency,
  });
  addTimelineEvent(state, 'brad', 'brad_response',
    response.directAnswer.slice(0, 150),
    { riskLevel: response.riskLevel, confidence: response.confidence });

  sessionStore.save(state);
}

/* ── Summary extractor ────────────────────────────────────────────── */

export function toSessionSummary(state: BradSessionState): SessionSummary {
  return {
    threadId: state.threadId,
    mode: state.mode,
    urgency: state.urgency,
    caseStatus: state.caseStatus ?? 'active',
    caseTitle: state.caseTitle,
    caseSummary: state.caseSummary,
    detectedIncidentType: state.detectedIncidentType,
    lifeSafetyFlag: state.lifeSafetyFlag,
    escalationRequired: state.escalationRequired,
    formsRequired: state.formsRequired,
    qapiTriggerPossible: state.qapiTriggerPossible,
    immediateActions: state.immediateActions,
    pendingTasks: state.pendingTasks,
    activePolicies: state.activePolicies,
    activeForms: state.activeForms,
    messageCount: state.messageCount,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  };
}
