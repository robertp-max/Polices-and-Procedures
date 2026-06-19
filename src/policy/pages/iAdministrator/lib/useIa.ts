import { useCallback, useEffect, useRef, useState } from 'react';
import { iaClient, IaClientError, type BackendMode } from './iaClient';
import { runBradQuery, type BradResponse, type BradCitation } from '@/services/mockBradEngine';
import type { BradRuntimeSnapshot } from '@/services/bradAppContext';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { COMPLIANCE_ACTION_MAP, getComplianceActionDefinition } from './complianceActionMap';
import { resolveIaReference, warnUnresolvedIaReference } from './referenceResolver';
import {
  sanitizeReferencePreview,
  sanitizeSessionSummaryReferences,
  sanitizeStructuredResponseReferences,
} from './referenceSanitizer';
// import { isDemoCriticalTrigger } from './demoCriticalEmergency'; // retained for potential live critical triggers, currently unused in demo human-first path
import type {
  AvailableAction,
  Citation,
  DocumentType,
  EnforcementLevel,
  HealthResponse,
  IntentKind,
  RiskLevel,
  QueryRequest,
  ReferencePreview,
  StudioOutputType,
  StructuredResponse,
} from './responseTypes';
import type {
  ChatMessage,
  ChatPhase1Event,
  SessionSummary,
} from './sessionTypes';

/* ═══════════════════════════════════════════════════════════════
   Hooks for the iAdministrator page.

   - useIaHealth   : polls index + Ollama status
   - useIaQuery    : runs a compliance command, holds the result
   - useIaReference: loads a reference preview for the right panel
   ═══════════════════════════════════════════════════════════════ */

export interface HealthHookState {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  /** Classified backend availability. 'checking' while first request is in flight. */
  backendMode: BackendMode;
  refresh: () => void;
}

const BRAD_DEMO_MODE_ENABLED = (import.meta.env.VITE_BRAD_DEMO_MODE ?? 'true') !== 'false';
const DEMO_HEALTH: HealthResponse = {
  status: {
    ready: true,
    builtAt: '2026-04-29T00:00:00.000Z',
    embedModel: 'brad-demo-deterministic-index-v1',
    embedDim: 1536,
    docCount: 11,
    chunkCount: 148,
    corpusRoot: 'demo://brad-safe-corpus',
    missing: [],
  },
  ollama: {
    ok: true,
    models: ['brad-demo-safe-deterministic-v1'],
  },
};

/** Map IaClientError codes to BackendMode + user-facing messages. */
function classifyError(err: unknown): { mode: BackendMode; message: string } {
  if ((err as { name?: string })?.name === 'AbortError') {
    return { mode: 'checking', message: '' };
  }
  if (err instanceof IaClientError) {
    switch (err.code) {
      case 'static_deploy':
        return {
          mode: 'static_deploy',
          message: 'Intelligence backend not connected in this deployment.',
        };
      case 'method_mismatch':
        return {
          mode: 'method_mismatch',
          message: 'API route exists but rejected the request method (405).',
        };
    }
    if (err.status === 404) {
      return {
        mode: 'not_found',
        message: 'API backend not deployed on this host (404).',
      };
    }
    if (err.status >= 500) {
      return {
        mode: 'unreachable',
        message: `Server error: ${err.message}`,
      };
    }
  }
  // Network failure (fetch rejected — CORS, no connection, etc.)
  const msg = (err as Error)?.message ?? '';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
    return {
      mode: 'unreachable',
      message: 'Cannot reach local server. Is `npm run dev` running?',
    };
  }
  return { mode: 'unreachable', message: msg || 'Health check failed.' };
}

export function useIaHealth(pollMs = 30_000): HealthHookState {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendMode, setBackendMode] = useState<BackendMode>('checking');

  // Once we confirm static_deploy, stop polling — it won't change.
  const staticDeploy = useRef(false);

  const fetchOnce = useCallback(async (signal?: AbortSignal) => {
    if (BRAD_DEMO_MODE_ENABLED) {
      setHealth(DEMO_HEALTH);
      setError(null);
      setBackendMode('static_deploy');
      setLoading(false);
      return;
    }
    if (staticDeploy.current) return;
    setLoading(true);
    try {
      const h = await iaClient.health(signal);
      setHealth(h);
      setError(null);
      setBackendMode(h.status.ready ? 'available' : 'index_not_built');
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      const classified = classifyError(err);
      setError(classified.message || null);
      setBackendMode(classified.mode);
      if (classified.mode === 'static_deploy') {
        staticDeploy.current = true; // stop future polls
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchOnce(ctrl.signal);
    if (BRAD_DEMO_MODE_ENABLED) {
      return () => ctrl.abort();
    }
    const iv = window.setInterval(() => fetchOnce(), pollMs);
    return () => {
      ctrl.abort();
      window.clearInterval(iv);
    };
  }, [fetchOnce, pollMs]);

  return {
    health: BRAD_DEMO_MODE_ENABLED ? DEMO_HEALTH : health,
    loading: BRAD_DEMO_MODE_ENABLED ? false : loading,
    error: BRAD_DEMO_MODE_ENABLED ? null : error,
    backendMode: BRAD_DEMO_MODE_ENABLED ? 'static_deploy' : backendMode,
    refresh: () => fetchOnce(),
  };
}

export interface QueryHookState {
  response: StructuredResponse | null;
  loading: boolean;
  /** True while retrieval is running but before the LLM responds. */
  retrieving: boolean;
  error: string | null;
  submit: (req: QueryRequest) => Promise<void>;
  reset: () => void;
  lastInput: string;
  lastIntent: IntentKind | null;
  /** Top doc ID received during phase1 — used to pre-load the right panel. */
  phase1TopDocId: string | null;
}

function isBackendUnavailable(mode: BackendMode): boolean {
  return mode === 'static_deploy'
    || mode === 'not_found'
    || mode === 'unreachable'
    || mode === 'method_mismatch';
}

function studioOutputFromIntent(intent: IntentKind | undefined): StudioOutputType | null {
  switch (intent) {
    case 'pre_survey_audit':
      return 'audit_checklist';
    case 'action_plan':
      return 'action_plan';
    case 'governing_body_brief':
      return 'governing_body_brief';
    case 'qapi_digest':
      return 'qapi_digest';
    case 'knowledge_article':
      return 'knowledge_article';
    default:
      return 'summary';
  }
}

function toCitation(c: BradCitation, idx: number): Citation {
  return {
    id: `mock-citation-${idx + 1}`,
    policyId: c.policyId,
    title: c.title,
    section: c.section,
    excerpt: c.excerpt,
    relevance: idx === 0 ? 'primary' : 'secondary',
  };
}

function toAvailableActions(citations: Citation[]): AvailableAction[] {
  const primary = citations[0];
  if (!primary) return [];
  const resolved = resolveIaReference({
    id: primary.policyId,
    title: primary.title,
    source: 'useIa.toAvailableActions',
  });
  if (!resolved.resolved || resolved.resolvedType === 'event') {
    warnUnresolvedIaReference(resolved);
    return [];
  }
  const primaryType = demoReferenceTypeFromId(primary.policyId);
  const openType: AvailableAction['type'] =
    primaryType === 'workflow' ? 'open_workflow' :
    primaryType === 'form' ? 'open_form' :
    primaryType === 'appendix' ? 'open_appendix' :
    'open_policy';

  return [
    {
      id: 'mock-open-primary',
      type: openType,
      label: `Open ${primary.policyId}`,
      targetId: primary.policyId,
      targetType: primaryType,
      studioOutputType: null,
      priority: 'primary',
    },
    {
      id: 'mock-generate-action-plan',
      type: 'generate_action_plan',
      label: 'Generate Action Plan',
      targetId: primary.policyId,
      targetType: 'policy',
      studioOutputType: 'action_plan',
      priority: 'secondary',
    },
    {
      id: 'mock-generate-qapi-digest',
      type: 'generate_qapi_digest',
      label: 'Generate QAPI Digest',
      targetId: primary.policyId,
      targetType: 'policy',
      studioOutputType: 'qapi_digest',
      priority: 'secondary',
    },
  ];
}

function demoReferenceTypeFromId(id: string): DocumentType {
  const resolved = resolveIaReference({ id, source: 'useIa.demoReferenceTypeFromId' });
  if (resolved.resolved) {
    if (resolved.resolvedType === 'workflow') return 'workflow';
    if (resolved.resolvedType === 'form') return 'form';
    if (resolved.resolvedType === 'appendix') return 'appendix';
    return 'policy';
  }
  warnUnresolvedIaReference(resolved);
  return 'policy';
}

function demoReferenceTitle(id: string): string {
  const resolved = resolveIaReference({ id, source: 'useIa.demoReferenceTitle' });
  if (resolved.resolved) return resolved.title;
  warnUnresolvedIaReference(resolved);
  return `${id} Reference Summary`;
}

function buildDemoRelatedReferenceBody(ids: string[]): string {
  const refs = ids.flatMap(id => {
    const resolved = resolveIaReference({ id, source: 'useIa.buildDemoRelatedReferenceBody' });
    if (!resolved.resolved || resolved.resolvedType === 'event') {
      warnUnresolvedIaReference(resolved);
      return [];
    }
    return [{
      id: resolved.id,
      title: resolved.title,
      type: demoReferenceTypeFromId(resolved.id),
    }];
  });
  const policies = refs.filter(ref => ref.type === 'policy');
  const workflows = refs.filter(ref => ref.type === 'workflow');
  const forms = refs.filter(ref => ref.type === 'form');
  const lines: string[] = ['Related Policy / Workflow / Form References', ''];
  if (refs.length === 0) {
    return 'No linked references available.';
  }

  if (policies.length > 0) {
    lines.push('Policies:');
    for (const policy of policies) lines.push(`${policy.id} - ${policy.title}`);
    lines.push('');
  }
  if (workflows.length > 0) {
    lines.push('Workflows:');
    for (const workflow of workflows) lines.push(`${workflow.id} - ${workflow.title}`);
    lines.push('');
  }
  if (forms.length > 0) {
    lines.push('Forms:');
    for (const form of forms) lines.push(`${form.id} - ${form.title}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const normalized = id.trim().toUpperCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function scenarioLinkedReferenceIds(id: string): string[] {
  for (const definition of Object.values(COMPLIANCE_ACTION_MAP)) {
    const candidates = [
      ...definition.relatedPolicyIds,
      ...definition.relatedFormIds,
      ...definition.relatedWorkflowIds,
    ].map(item => item.toUpperCase());
    if (!candidates.includes(id)) continue;
    const resolvedDefinition = getComplianceActionDefinition(definition.id);
    return [
      ...resolvedDefinition.relatedPolicies.map(item => item.id),
      ...resolvedDefinition.relatedWorkflows.map(item => item.id),
      ...resolvedDefinition.relatedForms.map(item => item.id),
    ];
  }
  return [];
}

function graphLinkedReferenceIds(id: string): string[] {
  const workflow = WORKFLOWS[id];
  if (workflow) {
    return [
      ...workflow.policyRefs,
      id,
      ...workflow.requiredForms,
    ];
  }

  const workflowIds = [
    ...(WORKFLOW_GRAPH.byPolicy[id] ?? []),
    ...(WORKFLOW_GRAPH.byForm[id] ?? []),
  ];
  const linked: string[] = [...workflowIds];
  for (const workflowId of workflowIds) {
    const linkedWorkflow = WORKFLOWS[workflowId];
    if (!linkedWorkflow) continue;
    linked.push(...linkedWorkflow.policyRefs, ...linkedWorkflow.requiredForms);
  }
  return linked;
}

function buildDemoLinkedReferenceIds(id: string): string[] {
  const resolved = resolveIaReference({ id, source: 'useIa.buildDemoLinkedReferenceIds' });
  if (!resolved.resolved) {
    warnUnresolvedIaReference(resolved);
    return [];
  }
  return uniqueIds([
    ...scenarioLinkedReferenceIds(resolved.id),
    ...graphLinkedReferenceIds(resolved.id),
  ])
    .filter(candidate => candidate !== resolved.id)
    .filter((candidate) => {
      const candidateResolution = resolveIaReference({
        id: candidate,
        source: 'useIa.buildDemoLinkedReferenceIds.candidate',
      });
      if (candidateResolution.resolved && candidateResolution.resolvedType !== 'event') return true;
      warnUnresolvedIaReference(candidateResolution);
      return false;
    })
    .slice(0, 12);
}

function toDemoReferencePreview(id: string): ReferencePreview {
  const resolved = resolveIaReference({ id, source: 'useIa.toDemoReferencePreview' });
  if (!resolved.resolved || resolved.resolvedType === 'event') {
    warnUnresolvedIaReference(resolved);
  }
  const resolvedId = resolved.resolved ? resolved.id : id;
  const type = demoReferenceTypeFromId(resolvedId);
  const title = resolved.resolved ? resolved.title : demoReferenceTitle(resolvedId);
  const linkedIds = buildDemoLinkedReferenceIds(resolvedId);

  const preview: ReferencePreview = {
    id: resolvedId,
    type,
    title,
    domain: 'Compliance',
    subdomain: 'Operational Guidance',
    accessTier: 'internal',
    regulatoryTags: ['Policy Guidance', 'Operational Review', 'Reference Summary'],
    sections: [
      {
        id: `${resolvedId}-s1`,
        title: 'Reference Guidance',
        level: 1,
        body: [
          'This reference summarizes the governing policy, workflow, or form associated with the current compliance question.',
          'Use it to confirm operational requirements, supporting artifacts, and linked records before closing the task.',
          'Cross-reference the cited document with current workflow evidence and approval status.',
        ].join(' '),
      },
      {
        id: `${resolvedId}-s2`,
        title: 'Related Policy / Workflow / Form References',
        level: 1,
        body: buildDemoRelatedReferenceBody(linkedIds),
      },
    ],
    linkedIds,
    sourcePath: `demo://${resolvedId}`,
    version: '1.0',
    effectiveDate: '2026-04-29',
    nextReviewDate: '2027-04-29',
    description: 'Reference summary surfaced for Brad compliance guidance.',
  };
  return sanitizeReferencePreview(preview, 'useIa.toDemoReferencePreview') ?? preview;
}

function renderAnswerForIntent(intent: IntentKind | undefined, brad: BradResponse): string {
  if (intent === 'qapi_digest' && brad.qapi) {
    return [
      `Requirement: ${brad.qapi.requirement}`,
      `Scope: ${brad.qapi.scope}`,
      'Key Components:',
      ...brad.qapi.keyComponents.map(item => `- ${item}`),
    ].join('\n');
  }
  if (intent === 'action_plan' && brad.actionPlan) {
    return [
      'Action Plan:',
      ...brad.actionPlan.actions.map(item => `- ${item}`),
    ].join('\n');
  }
  if (intent === 'governing_body_brief' && brad.governingBody) {
    return [
      brad.governingBody.summary,
      'Oversight Items:',
      ...brad.governingBody.oversightItems.map(item => `- ${item}`),
    ].join('\n');
  }
  return brad.answer;
}

function deriveRiskLevel(intent: IntentKind | undefined): RiskLevel {
  if (intent === 'pre_survey_audit' || intent === 'governing_body_brief') return 'high';
  if (intent === 'action_plan' || intent === 'qapi_digest') return 'moderate';
  return 'low';
}

function deriveEnforcement(intent: IntentKind | undefined): EnforcementLevel {
  if (intent === 'pre_survey_audit' || intent === 'qapi_digest') return 'condition_level';
  return 'standard_level';
}

function toMockStructuredResponse(req: QueryRequest, brad: BradResponse, elapsedMs: number): StructuredResponse {
  const intent = req.intent ?? 'question';
  const rawAnswer = renderAnswerForIntent(intent, brad);
  const inputLower = (req.input || '').toLowerCase();

  const isEmergency = rawAnswer.includes('Call 911 immediately') || rawAnswer.includes('cardiac emergency');
  const isHumanSupport = isEmergency ||
    /i'm sorry that happened|that is serious|step away|notify your supervisor|do you feel safe|are you safe right now/i.test(rawAnswer);

  const explicitDocRequest = /(which form|what form|open the|start the|incident note|document this|create the report|what document|help.*document|start report)/.test(inputLower);

  const useCitations = (isHumanSupport && !explicitDocRequest) ? [] : (brad.citations ?? []).map(toCitation);
  const policyIds = useCitations.map(c => c.policyId);
  const primaryPolicy = useCitations[0]?.policyId ?? null;

  // Never show hard-coded High Confidence 92% on human safety / staff distress responses in preview.
  // Use modest "Preview guidance — verify with supervisor" behavior.
  const confidenceLevel: 'high' | 'medium' | 'low' = isHumanSupport ? 'medium' : 'high';
  const score = isHumanSupport ? 65 : 92;

  return sanitizeStructuredResponseReferences({
    id: `mock-${Date.now()}`,
    responseType: 'compliance_answer',
    directAnswer: rawAnswer,
    operationalRequirement: (isHumanSupport && !explicitDocRequest)
      ? 'Focus on your immediate safety and supervisor notification first. Documentation only when you are clear.'
      : (brad.actionPlan?.actions[0] ?? 'Review governing requirements and close documentation gaps.'),
    requiredArtifacts: (isHumanSupport && !explicitDocRequest) ? [] : policyIds,
    complianceRisk: intent === 'pre_survey_audit'
      ? 'Multiple documentation deficiencies could trigger survey citations if not remediated promptly.'
      : (isHumanSupport ? 'Field staff safety and objective facts take priority over routine compliance lookup.' : 'Compliance readiness depends on documented execution and evidence retention.'),
    riskLevel: isEmergency ? 'critical' : (isHumanSupport ? 'high' : deriveRiskLevel(intent)),
    confidence: confidenceLevel,
    systemConfidenceScore: score,
    governingPolicyId: primaryPolicy,
    enforcementLevel: isEmergency ? 'condition_level' : deriveEnforcement(intent),
    complianceImpact: isHumanSupport
      ? 'Immediate safety and objective documentation protect the clinician and support proper incident handling.'
      : 'Supports survey readiness decisions with policy-linked operational guidance.',
    surveyFocus: isHumanSupport
      ? ['Immediate safety of field staff', 'Objective real-time documentation only', 'Timely supervisor / DON notification']
      : [
          'Evidence completeness and traceability',
          'Policy-to-practice alignment',
          'Oversight documentation and corrective follow-through',
        ],
    commonFailurePoints: isHumanSupport
      ? ['Delay notifying supervisor while still in the home', 'Continuing the visit when unsafe', 'Speculating or arguing instead of objective facts']
      : [
          'Missing signatures or approval records',
          'Incomplete corrective action logs',
          'Outdated policy-linked forms',
        ],
    requirementsSnapshot: useCitations.map(c => ({
      label: c.title,
      status: 'required',
      sourcePolicyId: c.policyId,
      sourceSection: c.section,
    })),
    citations: useCitations,
    linkedReferences: useCitations.map(c => ({
      id: c.policyId,
      type: demoReferenceTypeFromId(c.policyId),
      title: c.title,
      intent: 'required_for_review',
      required: true,
      description: c.excerpt,
      policyId: c.policyId,
      section: c.section,
      accessTier: 'internal',
      domain: 'Compliance',
      subdomain: 'Operational Guidance',
      previewMode: demoReferenceTypeFromId(c.policyId) === 'form'
        ? 'form'
        : demoReferenceTypeFromId(c.policyId) === 'workflow'
          ? 'workflow'
          : 'document',
    })),
    availableActions: (isHumanSupport && !explicitDocRequest) ? [] : toAvailableActions(useCitations),
    studioOutputType: studioOutputFromIntent(intent),
    noAnswerFound: false,
    noAnswerReason: '',
    meta: {
      intent,
      retrievedChunkIds: useCitations.map(c => c.id),
      model: 'mock-brad-engine-v1',
      elapsedMs,
    },
  }, 'useIa.toMockStructuredResponse');
}

/**
 * PLAN B FINAL HARD OVERRIDE - runs at the very last moment before display.
 * This ensures even if the engine or toMock returns app-data spam for distress cases,
 * the visible UI gets the human supervisor response.
 * Called right before setResponse and before appending brad message in chat.
 */
function applyBradHumanFirstOverride(currentInput: string, currentResponse: StructuredResponse): StructuredResponse {
  const combined = `${currentInput} ${currentResponse.directAnswer || ''}`.toLowerCase();

  const isDistress = 
    /groped|sexually harassed|inappropriate touching|grabbed me|touched my chest/.test(combined) ||
    /accus.*(theft|steal|stole)|says I stole|theft accusation/.test(combined) ||
    /i do not feel safe|not safe in the home|family.*blocking|patient is violent|hostile/.test(combined) ||
    /client is chasing|chasing me.*(knife|gun|weapon)|has a (knife|gun)|trapped.*(knife|client)|i am trapped/.test(combined) ||
    /lost my client|cannot find my client|i lost my client/.test(combined) ||
    // Discovered deceased / fatality / unresponsive
    /(client|clients|patient|patients) (is|are|was|were) dead|found (client|patient)(s)? dead|arrived and (client|clients|patient|patients) (is|are|was|were) dead|unresponsive|not breathing|no pulse|deceased|death in home|found on floor not breathing|possible death|died during visit/.test(combined);

  if (!isDistress) return currentResponse;

  let humanText = '';
  const isKnifeThreat = /chasing.*(knife|gun)|has a (knife|gun)|trapped.*(knife|client)/.test(combined);
  const isFatality = /(client|clients|patient|patients) (is|are|was|were) dead|found (client|patient)(s)? dead|arrived and (client|clients|patient|patients) (is|are|was|were) dead|unresponsive|not breathing|no pulse|deceased|death in home|found on floor not breathing|possible death|died during visit/.test(combined);

  if (isFatality) {
    humanText = "EMERGENCY — Call 911 immediately. Do not touch or move the clients unless 911 instructs you to. Step back and make sure the scene is safe. If there may be danger in the home, leave immediately and call 911 from a safe place. Notify your supervisor/DON/Administrator right away after calling 911. Stay available for emergency responders and document only objective facts after you are safe. Are you safe right now, and have you called 911?";
  } else if (isKnifeThreat) {
    humanText = "EMERGENCY — Call 911 immediately. Get out of the house now if you can do so safely. If you cannot leave, lock yourself in a room, create distance, stay quiet, and stay on the line with 911. Do not continue the visit. After you are safe, notify your supervisor/DON/Administrator. Are you safe and out of the home right now?";
  } else if (/groped|sexually harassed|inappropriate touching/.test(combined)) {
    humanText = "I'm sorry that happened. Are you safe right now? Step away from the client and end the visit if you feel unsafe. If there is any immediate threat or you cannot leave safely, call 911. Once safe, notify your supervisor/DON/Administrator. I can help you document it after you're safe. Do you feel safe right now?";
  } else if (/accus.*(theft|steal|stole)|says I stole/.test(combined)) {
    humanText = "That's serious, and you shouldn't handle it alone. Are you safe continuing the visit right now? Do not argue with the client or try to resolve the accusation by yourself. Step away if it's escalating, notify your supervisor/DON/Administrator, and document only objective facts. Do you feel safe continuing the visit?";
  } else if (/lost my client|cannot find my client/.test(combined)) {
    humanText = "I've got you. First, make sure the client is not in immediate danger. Check the last known location, call the client if safe to do so, and notify your supervisor/DON/Administrator right now. If the client may be unsafe, missing from a visit location, confused, injured, or at risk, escalate immediately and call 911 if there is urgent danger. Where was the client last seen?";
  } else {
    humanText = "I hear you — this sounds like a high-stress field situation. Are you safe right now? Step back if needed and contact your supervisor immediately. Once you're clear, we can document the facts objectively. Are you in a safe place?";
  }

  const isEmergency = humanText.startsWith('EMERGENCY');

  // Force clean response - no spam, no 92%, no auto docs
  return {
    ...currentResponse,
    directAnswer: humanText,
    riskLevel: isEmergency ? 'critical' : 'high',
    confidence: 'medium',
    systemConfidenceScore: 60,
    linkedReferences: [],
    citations: [],
    availableActions: [],
    requiredArtifacts: [],
    governingPolicyId: null,
    meta: {
      ...(currentResponse.meta as any || {}),
      humanFirstOverride: true,
      bradHumanLayer: 'active',
    } as any,
  };
}

export function useIaQuery(backendMode: BackendMode = 'checking', runtime?: BradRuntimeSnapshot): QueryHookState {
  const [response, setResponse] = useState<StructuredResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState('');
  const [lastIntent, setLastIntent] = useState<IntentKind | null>(null);
  const [phase1TopDocId, setPhase1TopDocId] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  const submit = useCallback(async (req: QueryRequest) => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;

    setLoading(true);
    setRetrieving(true);
    setError(null);
    setPhase1TopDocId(null);
    setLastInput(req.input);
    setLastIntent(req.intent ?? null);

    if (BRAD_DEMO_MODE_ENABLED || isBackendUnavailable(backendMode)) {
      const retrievalTimer = window.setTimeout(() => {
        if (!ctrl.signal.aborted) setRetrieving(false);
      }, 250);

      const startedAt = Date.now();
      try {
        const [mock] = await Promise.all([
          runBradQuery(req.input, { runtime, currentUserRole: 'iAdministrator' }),
          new Promise(resolve => window.setTimeout(resolve, 420)),
        ]);
        if (ctrl.signal.aborted) return;
        const elapsedMs = Math.max(Date.now() - startedAt, 420);
        let structured = toMockStructuredResponse(req, mock, elapsedMs);
        // PLAN B HARD OVERRIDE - final layer before display
        structured = applyBradHumanFirstOverride(req.input, structured);
        structured = sanitizeStructuredResponseReferences(structured, 'useIaQuery.mock.final');
        const isHumanOverride = (structured.meta as any)?.humanFirstOverride === true || (structured.meta as any)?.bradHumanLayer === 'active' || /^EMERGENCY — Call 911/i.test(structured.directAnswer || '');
        setResponse(structured);
        setPhase1TopDocId(isHumanOverride ? null : structured.governingPolicyId);
        setLoading(false);
        setRetrieving(false);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setError((err as Error)?.message ?? 'Mock Brad engine failed.');
        setResponse(null);
        setLoading(false);
        setRetrieving(false);
      } finally {
        window.clearTimeout(retrievalTimer);
      }
      return;
    }

    await iaClient.queryStream(
      req,
      {
        onPhase1: (event) => {
          if (ctrl.signal.aborted) return;
          setRetrieving(false);
          if (event.topDocId) setPhase1TopDocId(event.topDocId);
        },
        onComplete: (r) => {
          if (ctrl.signal.aborted) return;
          // PLAN B HARD OVERRIDE for live backend path too
          const overridden = sanitizeStructuredResponseReferences(
            applyBradHumanFirstOverride(req.input, r),
            'useIaQuery.live.final',
          );
          setResponse(overridden);
          setLoading(false);
          setRetrieving(false);
        },
        onError: (msg) => {
          if (ctrl.signal.aborted) return;
          setError(msg);
          setResponse(null);
          setLoading(false);
          setRetrieving(false);
        },
      },
      ctrl.signal,
    );
  }, [backendMode, runtime]);

  const reset = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    setResponse(null);
    setError(null);
    setLastInput('');
    setLastIntent(null);
    setPhase1TopDocId(null);
    setRetrieving(false);
  }, []);

  useEffect(() => () => inflight.current?.abort(), []);

  return { response, loading, retrieving, error, submit, reset, lastInput, lastIntent, phase1TopDocId };
}

export interface ReferenceHookState {
  reference: ReferencePreview | null;
  loading: boolean;
  error: string | null;
  load: (id: string) => Promise<void>;
  clear: () => void;
}

export function useIaReference(): ReferenceHookState {
  const [reference, setReference] = useState<ReferencePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  const load = useCallback(async (id: string) => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;

    setLoading(true);
    setError(null);
    const resolved = resolveIaReference({ id, source: 'useIaReference.load' });
    if (!resolved.resolved || resolved.resolvedType === 'event') {
      warnUnresolvedIaReference(resolved);
      setReference(null);
      setError('Reference is not available in the current app registry.');
      setLoading(false);
      inflight.current = null;
      return;
    }

    if (BRAD_DEMO_MODE_ENABLED) {
      setReference(toDemoReferencePreview(resolved.id));
      setLoading(false);
      return;
    }

    try {
      const r = await iaClient.getReference(resolved.id, ctrl.signal);
      if (!ctrl.signal.aborted) setReference(sanitizeReferencePreview(r, 'useIaReference.load.response'));
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setError((err as Error)?.message ?? 'reference load failed');
      setReference(null);
    } finally {
      if (inflight.current === ctrl) {
        inflight.current = null;
        setLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    setReference(null);
    setError(null);
  }, []);

  useEffect(() => () => inflight.current?.abort(), []);

  return { reference, loading, error, load, clear };
}

/* ═══════════════════════════════════════════════════════════════
   useChatThread — stateful two-way chat per thread.
   Maintains full message history locally and session summary
   from the backend per-turn response.
   ═══════════════════════════════════════════════════════════════ */

export interface ChatThreadState {
  threadId: string | null;
  messages: ChatMessage[];
  session: SessionSummary | null;
  loading: boolean;
  retrieving: boolean;
  phase1Mode: string | undefined;
  error: string | null;
  submit: (input: string) => void;
  newThread: () => void;
  updateSession: (patch: Partial<SessionSummary>) => void;
}

/** Generates a simple UUID without crypto module dependency in browser */
function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useChatThread(runtime?: BradRuntimeSnapshot): ChatThreadState {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [phase1Mode, setPhase1Mode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<AbortController | null>(null);

  const DEMO_STORAGE_KEY = 'brad-demo-chat';

  // Persist / hydrate chat history for preview mode (survives refresh, tab switch, route change)
  const saveDemoChat = useCallback((tid: string | null, msgs: ChatMessage[], sess: SessionSummary | null) => {
    if (!BRAD_DEMO_MODE_ENABLED) return;
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
        threadId: tid,
        messages: msgs,
        session: sess,
        savedAt: Date.now(),
      }));
    } catch { /* ignore quota / private mode */ }
  }, []);

  // Load last active chat on mount for preview
  useEffect(() => {
    if (!BRAD_DEMO_MODE_ENABLED) return;
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.threadId && Array.isArray(saved.messages)) {
          setThreadId(saved.threadId);
          setMessages(saved.messages);
          setSession(saved.session || null);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const submit = useCallback((input: string) => {
    if (!input.trim() || loading) return;

    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    setRetrieving(true);
    setError(null);
    setPhase1Mode(undefined);

    const currentThreadId = threadId;

    if (BRAD_DEMO_MODE_ENABLED) {
      const startedAt = new Date().toISOString();

      // Multi-turn continuation for active human safety case (do not restart app-data search)
      const lastBrad = [...messages].reverse().find(m => m.role === 'brad');
      const lastAnswer = lastBrad?.content || '';
      const isActiveHumanCase = /i'm sorry that happened|that is serious|step away|notify your supervisor|do you feel safe|EMERGENCY  Call 911/i.test(lastAnswer);
      const isContinuation = /^(yes|yeah|yep|im safe|i'm safe|i got out|got out|what next|now what|start report|yes start|document|ok)$/i.test(input.trim());

      window.setTimeout(async () => {
        if (ctrl.signal.aborted) return;
        setRetrieving(false);
        setPhase1Mode(isActiveHumanCase ? 'emergency_response' : 'general');

        let mock: BradResponse;
        if (isActiveHumanCase && isContinuation) {
          // Continue the same case with human supervisor tone. Only one next step + focused ask.
          if (/ (safe|got out)/i.test(input)) {
            mock = { answer: "Good. Do not re-enter the home. Notify your supervisor/DON/Administrator now. Document the facts (time, location, what was said or done, who was present, witnesses). I can help with the incident note when you are ready. Do you want to start the incident report now?", citations: [] };
          } else if (/yes|start|document/i.test(input)) {
            mock = { answer: "Understood. The most relevant next step is the workforce safety or incident report for this event. Open it only when you are in a safe location and have a few quiet minutes. Would you like the exact form reference or step-by-step fields to capture?", citations: [] };
          } else {
            mock = { answer: "Understood. Stay safe, notify your supervisor if you have not already, and document only the objective facts once you are clear. Is there anything else you need right now before we close the immediate safety steps?", citations: [] };
          }
        } else {
          mock = await runBradQuery(input.trim(), { runtime, currentUserRole: 'iAdministrator' });
        }
        if (ctrl.signal.aborted) return;

        let structured = toMockStructuredResponse(
          { input: input.trim(), intent: 'question' },
          mock,
          420,
        );
        // PLAN B HARD OVERRIDE for chat path - ensures visible UI always gets human-first for distress
        structured = applyBradHumanFirstOverride(input.trim(), structured);
        structured = sanitizeStructuredResponseReferences(structured, 'useChatThread.mock.final');

        const syntheticThreadId = currentThreadId ?? `demo-${genId()}`;
        const now = new Date().toISOString();
        const sessionSummary: SessionSummary = sanitizeSessionSummaryReferences({
          threadId: syntheticThreadId,
          mode: isActiveHumanCase ? 'emergency_response' : (isEmergencyish(input) ? 'emergency_response' : 'general'),
          urgency: isActiveHumanCase ? 'critical' : 'moderate',
          caseStatus: 'active',
          caseTitle: isActiveHumanCase ? 'Staff Safety / Field Incident' : 'Compliance Guidance Session',
          caseSummary: isActiveHumanCase ? 'Active field staff safety case — human supervisor guidance in progress.' : 'Deterministic demo compliance conversation.',
          detectedIncidentType: isActiveHumanCase ? 'other' : null,
          lifeSafetyFlag: isActiveHumanCase,
          escalationRequired: isActiveHumanCase,
          formsRequired: false, // only when user explicitly asks
          qapiTriggerPossible: false,
          immediateActions: isActiveHumanCase ? ['Ensure personal safety', 'Notify supervisor', 'Objective facts only'] : ['Confirm policy requirements'],
          pendingTasks: [],
          activePolicies: [],
          activeForms: [],
          messageCount: nextMessages.length + 1,
          createdAt: session?.createdAt ?? startedAt,
          updatedAt: now,
        });

        const bradMsg: ChatMessage = {
          id: genId(),
          role: 'brad',
          content: structured.directAnswer,
          timestamp: now,
          structuredResponse: structured,
        };

        const finalMessages = [...nextMessages, bradMsg];
        if (!threadId) setThreadId(syntheticThreadId);
        setSession(sessionSummary);
        setMessages(finalMessages);
        setLoading(false);
        setRetrieving(false);
        setPhase1Mode(undefined);

        // Persist so history + active case survive refresh / navigation
        saveDemoChat(syntheticThreadId, finalMessages, sessionSummary);
      }, 320);

      return;
    }

    iaClient.chatStream(
      { threadId: currentThreadId ?? undefined, input: input.trim() },
      {
        onPhase1: (p1: ChatPhase1Event) => {
          setRetrieving(false);
          setPhase1Mode(p1.mode);
          setSession(prev => prev ? {
            ...prev,
            mode: p1.mode as SessionSummary['mode'],
            urgency: p1.urgency as SessionSummary['urgency'],
            lifeSafetyFlag: p1.lifeSafetyFlag,
            detectedIncidentType: p1.incidentType as SessionSummary['detectedIncidentType'] ?? prev.detectedIncidentType,
          } : null);
        },
        onComplete: (result) => {
          const safeMessage: ChatMessage = result.message.structuredResponse
            ? {
                ...result.message,
                structuredResponse: sanitizeStructuredResponseReferences(
                  result.message.structuredResponse,
                  'useChatThread.live.message',
                ),
              }
            : result.message;
          const safeSession = sanitizeSessionSummaryReferences(result.sessionSummary);
          const finalMessages = [...nextMessages, safeMessage];
          if (!threadId) setThreadId(result.threadId);
          setSession(safeSession);
          setMessages(finalMessages);
          setLoading(false);
          setRetrieving(false);
          setPhase1Mode(undefined);
          // For live backend, the server session already persists; we still mirror locally for UI
          saveDemoChat(result.threadId, finalMessages, safeSession);
        },
        onError: (msg) => {
          if (ctrl.signal.aborted) return;
          setError(msg);
          setLoading(false);
          setRetrieving(false);
        },
      },
      ctrl.signal,
    );
  }, [loading, messages, runtime, session?.createdAt, threadId, saveDemoChat]);

  const newThread = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    if (threadId) {
      iaClient.closeSession(threadId).catch(() => {});
    }
    setThreadId(null);
    setMessages([]);
    setSession(null);
    setLoading(false);
    setRetrieving(false);
    setError(null);
    setPhase1Mode(undefined);
    if (BRAD_DEMO_MODE_ENABLED) {
      try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch {}
    }
  }, [threadId]);

  const updateSession = useCallback((patch: Partial<SessionSummary>) => {
    setSession(prev => {
      const next = prev ? { ...prev, ...patch } : null;
      if (next && BRAD_DEMO_MODE_ENABLED) saveDemoChat(next.threadId, messages, next);
      return next;
    });
  }, [messages, saveDemoChat]);

  useEffect(() => () => { inflight.current?.abort(); }, []);

  return {
    threadId,
    messages,
    session,
    loading,
    retrieving,
    phase1Mode,
    error,
    submit,
    newThread,
    updateSession,
  };
}

function isEmergencyish(input: string): boolean {
  const n = input.toLowerCase();
  return /knife|gun|weapon|chasing|trapped|not safe|911/.test(n);
}
