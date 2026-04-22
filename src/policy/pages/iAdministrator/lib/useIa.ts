import { useCallback, useEffect, useRef, useState } from 'react';
import { iaClient, IaClientError, type BackendMode } from './iaClient';
import type {
  HealthResponse,
  IntentKind,
  QueryRequest,
  ReferencePreview,
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
          message: 'Local runtime only — start `npm run dev` to use Brad.',
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
    const iv = window.setInterval(() => fetchOnce(), pollMs);
    return () => {
      ctrl.abort();
      window.clearInterval(iv);
    };
  }, [fetchOnce, pollMs]);

  return { health, loading, error, backendMode, refresh: () => fetchOnce() };
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

export function useIaQuery(): QueryHookState {
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
  }, []);

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

export function useChatThread(): ChatThreadState {
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
  }, [loading, threadId]);

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
