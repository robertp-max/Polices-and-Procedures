import type { BradModelAdapter, ModelChatArgs, ModelChatResult, BradConfig } from '../types.js';
import { OllamaClient } from '../../ollama.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Ollama Brad adapter — the OPEN-SOURCE inference engine (non-PHI, local).
   ----------------------------------------------------------------------------
   Runs Brad on a locally-hosted open-source model served by Ollama
   (llama.cpp/gguf under the hood). This is a real model call — NOT a mock and
   NOT a SaaS. Brad still has no browser/search/web tools: Ollama is reached
   over loopback HTTP only, so canReachInternet stays false.

   Fail-closed contract (BradModelAdapter): validateAvailability() throws no
   fabricated success — if Ollama is unreachable or the configured chat model is
   not pulled, it reports unavailable with a concrete reason, and chat() throws
   rather than returning canned/mock text. The runtime NEVER silently downgrades
   an OSS answer to mock output.
   ═══════════════════════════════════════════════════════════════════════════ */
export class OllamaBradAdapter implements BradModelAdapter {
  readonly id = 'ollama-brad';
  readonly canReachInternet = false as const;
  private readonly client: OllamaClient;

  constructor(private readonly cfg: BradConfig) {
    this.client = new OllamaClient({
      baseUrl: cfg.ollamaBaseUrl,
      chatModel: cfg.ollamaChatModel,
      embedModel: cfg.ollamaChatModel, // chat-only path; embeddings unused here
      timeoutMs: cfg.ollamaTimeoutMs,
    });
  }

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (this.cfg.provider !== 'ollama') {
      return { available: false, reason: `BRAD_PROVIDER='${this.cfg.provider}' (expected 'ollama')` };
    }
    const ping = await this.client.ping();
    if (!ping.ok) {
      return { available: false, reason: `Ollama unreachable at ${this.cfg.ollamaBaseUrl}: ${ping.error ?? 'no response'}` };
    }
    const models = ping.models ?? [];
    const want = this.cfg.ollamaChatModel;
    // Ollama reports tags like "qwen3:8b"; accept an exact match or a bare-name
    // match (want without the ":tag") so "llama3.1" matches "llama3.1:8b-...".
    const bare = want.split(':')[0];
    const has = models.some((m) => m === want || m.split(':')[0] === bare);
    if (!has) {
      return {
        available: false,
        reason: `Ollama chat model '${want}' is not pulled (available: ${models.join(', ') || 'none'}). Run: ollama pull ${want}`,
      };
    }
    return { available: true };
  }

  async chat(args: ModelChatArgs): Promise<ModelChatResult> {
    // Fail-closed: never call the model (or fabricate) when the engine is not ready.
    const v = await this.validateAvailability();
    if (!v.available) throw new Error(`OllamaBradAdapter unavailable (fail-closed): ${v.reason}`);

    const out = await this.client.chat({
      system: args.system,
      user: args.user,
      temperature: 0.2,
      format: 'text',
    });
    if (!out.content.trim()) {
      throw new Error('OllamaBradAdapter: model returned an empty response (fail-closed)');
    }
    return {
      content: out.content,
      modelId: out.model,          // the real gguf tag that produced this answer
      runtimeMode: 'oss-nonphi',
      synthetic: false,            // real model output — never presented as mock
    };
  }
}
