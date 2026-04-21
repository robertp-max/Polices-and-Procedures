import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Minimal Ollama HTTP client. No SDK dependency — Ollama's HTTP API
   is small and stable. Keeping this in one place makes it easy to
   swap the backend later (vLLM, LM Studio, remote OpenAI-compatible
   gateway) without touching retrieval or response-generation code.
   ═══════════════════════════════════════════════════════════════ */

export interface OllamaConfig {
  baseUrl: string;   // e.g., http://127.0.0.1:11434
  chatModel: string; // e.g., llama3.1:8b-instruct-q4_K_M
  embedModel: string; // e.g., nomic-embed-text
  timeoutMs: number;
}

export class OllamaClient {
  constructor(private readonly cfg: OllamaConfig) {}

  /** Generate a single (non-streaming) chat response. */
  async chat(args: {
    system: string;
    user: string;
    temperature?: number;
    format?: 'json' | 'text';
    stop?: string[];
  }): Promise<{ content: string; model: string; totalMs: number }> {
    const body = {
      model: this.cfg.chatModel,
      stream: false,
      options: {
        temperature: args.temperature ?? 0.2,
        num_ctx: 8192,
        ...(args.stop ? { stop: args.stop } : {}),
      },
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user },
      ],
      ...(args.format === 'json' ? { format: 'json' } : {}),
    };

    const t0 = Date.now();
    const data = await this.request<{ message?: { content?: string } }>(
      '/api/chat',
      body,
    );
    return {
      content: data.message?.content ?? '',
      model: this.cfg.chatModel,
      totalMs: Date.now() - t0,
    };
  }

  /** Generate a single embedding vector. */
  async embed(text: string): Promise<number[]> {
    const data = await this.request<{ embedding?: number[]; embeddings?: number[][] }>(
      '/api/embeddings',
      { model: this.cfg.embedModel, prompt: text },
    );
    const v = data.embedding ?? (data.embeddings && data.embeddings[0]);
    if (!Array.isArray(v) || v.length === 0) {
      throw new Error('ollama.embeddings returned empty vector');
    }
    return v;
  }

  /** Batch helper — serial to keep load predictable on a single model. */
  async embedBatch(
    texts: string[],
    onProgress?: (done: number, total: number) => void,
  ): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      out.push(await this.embed(texts[i]));
      if (onProgress) onProgress(i + 1, texts.length);
    }
    return out;
  }

  async ping(): Promise<{ ok: boolean; models?: string[]; error?: string }> {
    try {
      const data = await this.request<{ models?: Array<{ name: string }> }>(
        '/api/tags',
        undefined,
        'GET',
      );
      return {
        ok: true,
        models: (data.models ?? []).map(m => m.name),
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  private async request<T>(
    pathname: string,
    body?: unknown,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<T> {
    const url = `${this.cfg.baseUrl.replace(/\/$/, '')}${pathname}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        signal: controller.signal,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `ollama ${method} ${pathname} ${res.status}: ${text.slice(0, 300)}`,
        );
      }
      return (await res.json()) as T;
    } catch (err) {
      log.warn('ollama.request.failed', {
        path: pathname,
        message: (err as Error)?.message,
      });
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
