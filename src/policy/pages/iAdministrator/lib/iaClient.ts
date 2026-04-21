import type {
  HealthResponse,
  IntentKind,
  QueryRequest,
  ReferencePreview,
  StructuredResponse,
} from './responseTypes';

/* ═══════════════════════════════════════════════════════════════
   iAdministrator — thin HTTP client for /api/ia/*.

   Lives on the frontend. The backend mediates ALL model access; the
   frontend never calls Ollama directly, never sees model paths, and
   never browses the filesystem.
   ═══════════════════════════════════════════════════════════════ */

const BASE = '/api/ia';

export interface ApiErrorShape {
  code: string;
  message: string;
}

export class IaClientError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let code = 'http_error';
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
      }
    } catch {
      try { message = (await res.text()).slice(0, 240) || message; } catch { /* noop */ }
    }
    throw new IaClientError(res.status, code, message);
  }
  return (await res.json()) as T;
}

/** Phase-1 SSE payload (retrieval metadata) from the server. */
export interface Phase1Event {
  intent: string;
  chunkCount: number;
  embeddingsReady: boolean;
  topDocId: string | null;
  topDocIds: string[];
}

export const iaClient = {
  async health(signal?: AbortSignal): Promise<HealthResponse> {
    const res = await fetch(`${BASE}/health`, { signal });
    return json<HealthResponse>(res);
  },

  async query(req: QueryRequest, signal?: AbortSignal): Promise<StructuredResponse> {
    const res = await fetch(`${BASE}/query`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
    return json<StructuredResponse>(res);
  },

  /**
   * Streaming SSE query. Calls `onPhase1` within ~200ms of retrieval,
   * then `onComplete` when the LLM finishes. This drives the perceived
   * < 6 second response: the right panel loads immediately from phase1.
   */
  async queryStream(
    req: QueryRequest,
    callbacks: {
      onPhase1?: (event: Phase1Event) => void;
      onComplete: (response: StructuredResponse) => void;
      onError: (message: string) => void;
    },
    signal?: AbortSignal,
  ): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${BASE}/query`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'text/event-stream',
        },
        body: JSON.stringify(req),
        signal,
      });
    } catch (err) {
      callbacks.onError((err as Error)?.message ?? 'Network error');
      return;
    }

    if (!res.ok || !res.body) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        errMsg = body?.error?.message ?? errMsg;
      } catch { /* noop */ }
      callbacks.onError(errMsg);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let curEvent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            curEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              if (curEvent === 'phase1') {
                callbacks.onPhase1?.(parsed as Phase1Event);
              } else if (curEvent === 'complete') {
                callbacks.onComplete(parsed as StructuredResponse);
              } else if (curEvent === 'error') {
                callbacks.onError((parsed as { message?: string }).message ?? 'Stream error');
              }
            } catch { /* malformed data chunk — skip */ }
            curEvent = '';
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') {
        callbacks.onError((err as Error)?.message ?? 'Stream read error');
      }
    }
  },

  async getReference(id: string, signal?: AbortSignal): Promise<ReferencePreview> {
    const res = await fetch(`${BASE}/references/${encodeURIComponent(id)}`, { signal });
    return json<ReferencePreview>(res);
  },

  async rebuildIndex(signal?: AbortSignal): Promise<HealthResponse> {
    const res = await fetch(`${BASE}/index/rebuild`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
    });
    return json<HealthResponse>(res);
  },
};

/** Map a studio tab id to the backend intent kind. */
export const STUDIO_INTENTS: Record<string, IntentKind> = {
  answer: 'question',
  audit: 'pre_survey_audit',
  action: 'action_plan',
  brief: 'governing_body_brief',
  qapi: 'qapi_digest',
  knowledge: 'knowledge_article',
};
