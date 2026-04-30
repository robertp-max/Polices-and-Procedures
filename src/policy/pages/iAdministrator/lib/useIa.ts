import { useCallback, useEffect, useRef, useState } from 'react';
import { iaClient, IaClientError, type BackendMode } from './iaClient';
import { runBradQuery, type BradResponse, type BradCitation } from '@/services/mockBradEngine';
import type { BradRuntimeSnapshot } from '@/services/bradAppContext';
import { isDemoCriticalTrigger } from './demoCriticalEmergency';
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
          message: 'Demo intelligence mode is active for this deployment.',
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
  if (id.startsWith('WF-') || id.includes('.')) return 'workflow';
  if (id.includes('-FM-') || id.startsWith('FM-') || id.startsWith('CE-FRM-')) return 'form';
  if (id.startsWith('APP-')) return 'appendix';
  return 'policy';
}

function demoReferenceTitle(id: string): string {
  return id === 'EN-WF-101' ? 'Policy Execution, Workflow Enforcement & Evidence Traceability' :
    id === 'CL-DC-101' ? 'Clinical Documentation Integrity & Authenticity' :
    id === 'CL-OA-101' ? 'OASIS Data Accuracy, Validation & Submission Integrity' :
    id === 'CL-CC-101' ? 'Care Coordination & SDOH Management' :
    id === 'QA-VBP-101' ? 'HHVBP Performance & Outcomes Management' :
    id === 'WF-EMER-001' ? 'Emergency Incident Orchestration Workflow' :
    id === 'WF-CSE-001' ? 'Critical Safety Event Workflow' :
    id === 'CE-FRM-101' ? 'Incident Report - Critical Event' :
    id === 'CE-FRM-102' ? 'Emergency Response Documentation' :
    id === 'CE-FRM-103' ? 'Environmental Safety Risk Assessment' :
    `${id} Reference Summary`;
}

function buildDemoRelatedReferenceBody(ids: string[]): string {
  const refs = ids.map(id => ({ id, title: demoReferenceTitle(id), type: demoReferenceTypeFromId(id) }));
  const policies = refs.filter(ref => ref.type === 'policy');
  const workflows = refs.filter(ref => ref.type === 'workflow');
  const forms = refs.filter(ref => ref.type === 'form');
  const lines: string[] = ['Related Policy / Workflow / Form References', ''];

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

function toDemoReferencePreview(id: string): ReferencePreview {
  const type = demoReferenceTypeFromId(id);
  const title = demoReferenceTitle(id);
  const linkedIds = ['EN-WF-101', 'WF-EMER-001', 'CE-FRM-101'];

  return {
    id,
    type,
    title,
    domain: 'Compliance',
    subdomain: 'Operational Guidance',
    accessTier: 'internal',
    regulatoryTags: ['Policy Guidance', 'Operational Review', 'Reference Summary'],
    sections: [
      {
        id: `${id}-s1`,
        title: 'Reference Guidance',
        level: 1,
        body: [
          'This reference summarizes the governing policy, workflow, or form associated with the current compliance question.',
          'Use it to confirm operational requirements, supporting artifacts, and linked records before closing the task.',
          'Cross-reference the cited document with current workflow evidence and approval status.',
        ].join(' '),
      },
      {
        id: `${id}-s2`,
        title: 'Related Policy / Workflow / Form References',
        level: 1,
        body: buildDemoRelatedReferenceBody(linkedIds),
      },
    ],
    linkedIds,
    sourcePath: `demo://${id}`,
    version: '1.0',
    effectiveDate: '2026-04-29',
    nextReviewDate: '2027-04-29',
    description: 'Reference summary surfaced for Brad compliance guidance.',
  };
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
  const citations = (brad.citations ?? []).map(toCitation);
  const policyIds = citations.map(c => c.policyId);
  const primaryPolicy = citations[0]?.policyId ?? null;
  const answer = renderAnswerForIntent(intent, brad);
  const isEmergency = answer.includes('Call 911 immediately') || answer.includes('cardiac emergency');

  return {
    id: `mock-${Date.now()}`,
    responseType: 'compliance_answer',
    directAnswer: answer,
    operationalRequirement: brad.actionPlan?.actions[0] ?? 'Review governing requirements and close documentation gaps.',
    requiredArtifacts: policyIds,
    complianceRisk: intent === 'pre_survey_audit'
      ? 'Multiple documentation deficiencies could trigger survey citations if not remediated promptly.'
      : 'Compliance readiness depends on documented execution and evidence retention.',
    riskLevel: isEmergency ? 'critical' : deriveRiskLevel(intent),
    confidence: 'high',
    systemConfidenceScore: 92,
    governingPolicyId: primaryPolicy,
    enforcementLevel: isEmergency ? 'condition_level' : deriveEnforcement(intent),
    complianceImpact: 'Supports survey readiness decisions with policy-linked operational guidance.',
    surveyFocus: [
      'Evidence completeness and traceability',
      'Policy-to-practice alignment',
      'Oversight documentation and corrective follow-through',
    ],
    commonFailurePoints: [
      'Missing signatures or approval records',
      'Incomplete corrective action logs',
      'Outdated policy-linked forms',
    ],
    requirementsSnapshot: citations.map(c => ({
      label: c.title,
      status: 'required',
      sourcePolicyId: c.policyId,
      sourceSection: c.section,
    })),
    citations,
    linkedReferences: citations.map(c => ({
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
    availableActions: toAvailableActions(citations),
    studioOutputType: studioOutputFromIntent(intent),
    noAnswerFound: false,
    noAnswerReason: '',
    meta: {
      intent,
      retrievedChunkIds: citations.map(c => c.id),
      model: 'mock-brad-engine-v1',
      elapsedMs,
    },
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
        const structured = toMockStructuredResponse(req, mock, elapsedMs);
        setResponse(structured);
        setPhase1TopDocId(structured.governingPolicyId);
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
          setResponse(r);
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

    if (BRAD_DEMO_MODE_ENABLED) {
      setReference(toDemoReferencePreview(id));
      setLoading(false);
      return;
    }

    try {
      const r = await iaClient.getReference(id, ctrl.signal);
      if (!ctrl.signal.aborted) setReference(r);
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
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setRetrieving(true);
    setError(null);
    setPhase1Mode(undefined);

    const currentThreadId = threadId;

    if (BRAD_DEMO_MODE_ENABLED) {
      const startedAt = new Date().toISOString();
      const normalized = input.trim().toLowerCase();
      const emergency = isDemoCriticalTrigger(input)
        || (normalized.includes('heart attack') && (normalized.includes('gun') || normalized.includes('firearm')))
        || (normalized.includes('cardiac arrest') && (normalized.includes('gun') || normalized.includes('firearm')));

      window.setTimeout(async () => {
        if (ctrl.signal.aborted) return;
        setRetrieving(false);
        setPhase1Mode(emergency ? 'emergency_response' : 'general');

        const mock = await runBradQuery(input.trim(), { runtime, currentUserRole: 'iAdministrator' });
        if (ctrl.signal.aborted) return;

        const structured = toMockStructuredResponse(
          { input: input.trim(), intent: 'question' },
          mock,
          420,
        );

        const syntheticThreadId = currentThreadId ?? `demo-${genId()}`;
        const now = new Date().toISOString();
        const sessionSummary: SessionSummary = {
          threadId: syntheticThreadId,
          mode: emergency ? 'emergency_response' : 'general',
          urgency: emergency ? 'critical' : 'moderate',
          caseStatus: 'active',
          caseTitle: emergency ? 'Critical Safety Emergency' : 'Compliance Guidance Session',
          caseSummary: emergency
            ? 'Firearm and cardiac emergency scenario in home setting.'
            : 'Deterministic demo compliance conversation.',
          detectedIncidentType: emergency ? 'suspected_heart_attack' : null,
          lifeSafetyFlag: emergency,
          escalationRequired: emergency,
          formsRequired: true,
          qapiTriggerPossible: emergency,
          immediateActions: emergency
            ? ['Call 911 immediately', 'Do not enter unsafe scene', 'Notify DON after EMS activation']
            : ['Confirm policy requirements', 'Document execution evidence', 'Escalate unresolved gaps'],
          pendingTasks: emergency
            ? ['Complete CE-FRM-101', 'Complete CE-FRM-102', 'Log incident event trail']
            : ['Validate workflow linkage', 'Confirm required forms are complete'],
          activePolicies: emergency ? ['ERP-002', 'WS-001', 'IR-004'] : ['EN-WF-101', 'CL-DC-101'],
          activeForms: emergency ? ['CE-FRM-101', 'CE-FRM-102'] : ['EN-FM-002'],
          messageCount: messages.length + 2,
          createdAt: session?.createdAt ?? startedAt,
          updatedAt: now,
        };

        const bradMsg: ChatMessage = {
          id: genId(),
          role: 'brad',
          content: structured.directAnswer,
          timestamp: now,
          structuredResponse: structured,
        };

        if (!threadId) setThreadId(syntheticThreadId);
        setSession(sessionSummary);
        setMessages(prev => [...prev, bradMsg]);
        setLoading(false);
        setRetrieving(false);
        setPhase1Mode(undefined);
      }, 320);

      return;
    }

    iaClient.chatStream(
      { threadId: currentThreadId ?? undefined, input: input.trim() },
      {
        onPhase1: (p1: ChatPhase1Event) => {
          setRetrieving(false);
          setPhase1Mode(p1.mode);
          // Update session urgency/mode immediately from phase1
          setSession(prev => prev ? {
            ...prev,
            mode: p1.mode as SessionSummary['mode'],
            urgency: p1.urgency as SessionSummary['urgency'],
            lifeSafetyFlag: p1.lifeSafetyFlag,
            detectedIncidentType: p1.incidentType as SessionSummary['detectedIncidentType'] ?? prev.detectedIncidentType,
          } : null);
        },
        onComplete: (result) => {
          if (!threadId) setThreadId(result.threadId);
          setSession(result.sessionSummary);
          setMessages(prev => [...prev, result.message]);
          setLoading(false);
          setRetrieving(false);
          setPhase1Mode(undefined);
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
  }, [loading, messages.length, runtime, session?.createdAt, threadId]);

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
  }, [threadId]);

  const updateSession = useCallback((patch: Partial<SessionSummary>) => {
    setSession(prev => prev ? { ...prev, ...patch } : null);
  }, []);

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
