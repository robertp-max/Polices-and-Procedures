import type { HarnessConfig, NolanModelAdapter, NolanResearchRequest, NolanResearchResponse } from './types.js';
import { MockNolanAdapter } from './modelAdapters/MockNolanAdapter.js';
import { VertexNolanAdapter } from './modelAdapters/VertexNolanAdapter.js';
import { scanWebContent } from './WebContentSafetyGuard.js';
import { isExcludedDomain, isCitationComplete } from './PublicResearchPolicy.js';
import { agentAuditLog, sha16 } from './AgentAuditLogger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Nolan Runtime — public research only.
   ----------------------------------------------------------------------------
   NO internal-system access: this module imports NO CES/Drive/Salesforce/eCign/
   vector-store/session modules — only its public-web adapter + public policy.
   Nolan is PASSIVE: it is invoked by the relay and cannot initiate a Brad call.
   Output is post-scanned for injection and stripped of excluded-domain sources.
   ═══════════════════════════════════════════════════════════════════════════ */

export class NolanRuntime {
  private readonly adapter: NolanModelAdapter | null;
  constructor(private readonly cfg: HarnessConfig, private readonly relayKey: symbol) {
    const mode = cfg.nolan.runtimeMode;
    this.adapter =
      mode === 'mock' ? new MockNolanAdapter(cfg.nolan.modelId)
      : mode === 'vertex-public-web' ? new VertexNolanAdapter(cfg.nolan)
      : null; // disabled
  }

  isEnabled(): boolean { return this.adapter !== null; }

  /** Invoked ONLY by the relay (capability-gated). Nolan cannot initiate contact with Brad. */
  async research(req: NolanResearchRequest, key: symbol): Promise<NolanResearchResponse> {
    if (key !== this.relayKey) throw new Error('NolanRuntime.research is relay-only; route via BradNolanRelay.');
    if (!this.adapter) throw new Error('Nolan is disabled (NOLAN_RUNTIME_MODE=disabled).');
    const avail = await this.adapter.validateAvailability();
    if (!avail.available) throw new Error(`Nolan adapter unavailable (fail-closed): ${avail.reason}`);

    const raw = await this.adapter.research(req);

    // Drop any excluded-domain sources (defense even if an adapter returns them).
    const sources = raw.sources.filter(s => !isExcludedDomain(s.url, req.excludedDomains));
    const safety = scanWebContent(raw.answer, sources);
    const response: NolanResearchResponse = {
      ...raw,
      sources,
      warnings: [...raw.warnings, ...(safety.promptInjectionDetected ? ['web-prompt-injection-quarantined'] : []),
        ...(safety.unsafeSourceCount > 0 ? [`${safety.unsafeSourceCount} low-trust source(s)`] : [])],
      safetyScan: {
        promptInjectionDetected: safety.promptInjectionDetected,
        unsafeSourceCount: safety.unsafeSourceCount,
      },
    };

    // Nolan log — PHI-free by construction; redaction enforced in the logger.
    agentAuditLog.logNolan({
      requestId: req.requestId,
      sanitizedQueryHash: sha16(req.sanitizedQuestion),
      sanitizedQuery: req.sanitizedQuestion,
      modelId: this.cfg.nolan.modelId,
      promptVersion: this.cfg.nolan.promptVersion,
      searchQueries: response.webSearchQueries,
      sourceUrls: response.sources.map(s => s.url),
      sourceHashes: response.sources.map(s => s.contentHash ?? ''),
      responseHash: sha16(response.answer),
      safetyWarnings: response.warnings,
    });

    return response;
  }

  citationComplete(res: NolanResearchResponse): boolean { return isCitationComplete(res); }
}
