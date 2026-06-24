import type { BradModelAdapter, ModelChatArgs, ModelChatResult, BradConfig } from '../types.js';

/* Vertex Brad adapter — FAIL CLOSED. Validates project/location/model before any
   call; if unavailable it throws (never silently downgrades to another model).
   Real Vertex SDK wiring is deferred to the cloud-deployment phase; until the
   project/region/model are configured AND availability is confirmed, this stays
   unavailable. NO internet/web tools (canReachInternet:false) regardless of mode. */
export class VertexBradAdapter implements BradModelAdapter {
  readonly id = 'vertex-brad';
  readonly canReachInternet = false as const;
  constructor(private readonly cfg: BradConfig) {}

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (!this.cfg.vertexProjectId) return { available: false, reason: 'BRAD_VERTEX_PROJECT_ID not set' };
    if (!this.cfg.vertexLocation) return { available: false, reason: 'BRAD_VERTEX_LOCATION not set' };
    if (!this.cfg.modelId) return { available: false, reason: 'BRAD_MODEL_ID not set' };
    // Live Vertex model-availability check is not wired in the MVP → fail closed.
    return { available: false, reason: `Vertex model "${this.cfg.modelId}" availability not verified in ${this.cfg.vertexProjectId}/${this.cfg.vertexLocation}` };
  }

  async chat(_args: ModelChatArgs): Promise<ModelChatResult> {
    const v = await this.validateAvailability();
    if (!v.available) throw new Error(`VertexBradAdapter unavailable (fail-closed): ${v.reason}`);
    throw new Error('VertexBradAdapter: live Vertex call not implemented in MVP (deferred to cloud phase).');
  }
}
