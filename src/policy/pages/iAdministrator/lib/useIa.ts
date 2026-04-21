import { useCallback, useEffect, useRef, useState } from 'react';
import { iaClient } from './iaClient';
import type {
  HealthResponse,
  IntentKind,
  QueryRequest,
  ReferencePreview,
  StructuredResponse,
} from './responseTypes';

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
  refresh: () => void;
}

export function useIaHealth(pollMs = 30_000): HealthHookState {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const h = await iaClient.health(signal);
      setHealth(h);
      setError(null);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setError((err as Error)?.message ?? 'health check failed');
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

  return { health, loading, error, refresh: () => fetchOnce() };
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
