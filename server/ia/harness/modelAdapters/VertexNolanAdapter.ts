import type { NolanModelAdapter, NolanResearchRequest, NolanResearchResponse, NolanConfig } from '../types.js';

/* Vertex Nolan adapter (public web grounding) — FAIL CLOSED until configured.
   Real Google Search grounding + allowlisted retrieval is deferred to the cloud
   phase. canReachInternet:true reflects intended capability, but research()
   throws unless availability is verified — never silently degrades. */
export class VertexNolanAdapter implements NolanModelAdapter {
  readonly id = 'vertex-nolan';
  readonly canReachInternet = true;
  constructor(private readonly cfg: NolanConfig) {}

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (!this.cfg.webGroundingEnabled) return { available: false, reason: 'NOLAN_WEB_GROUNDING_ENABLED!=="true"' };
    if (!this.cfg.vertexProjectId) return { available: false, reason: 'NOLAN_VERTEX_PROJECT_ID not set' };
    if (!this.cfg.vertexLocation) return { available: false, reason: 'NOLAN_VERTEX_LOCATION not set' };
    return { available: false, reason: `Vertex Nolan grounding not wired in MVP (model "${this.cfg.modelId}")` };
  }

  async research(_req: NolanResearchRequest): Promise<NolanResearchResponse> {
    const v = await this.validateAvailability();
    if (!v.available) throw new Error(`VertexNolanAdapter unavailable (fail-closed): ${v.reason}`);
    throw new Error('VertexNolanAdapter: live grounding not implemented in MVP (deferred to cloud phase).');
  }
}
