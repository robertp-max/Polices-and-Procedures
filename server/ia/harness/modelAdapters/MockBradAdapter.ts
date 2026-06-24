import type { BradModelAdapter, ModelChatArgs, ModelChatResult } from '../types.js';

/* Deterministic mock Brad adapter — answers from "approved internal sources"
   only. NO internet. Output is flagged synthetic so the UI never presents it as
   a live Gemini response. */
export class MockBradAdapter implements BradModelAdapter {
  readonly id = 'mock-brad';
  readonly canReachInternet = false as const;
  constructor(private readonly modelId: string) {}

  async chat(args: ModelChatArgs): Promise<ModelChatResult> {
    return {
      content:
        `[MVP Harness — Mock Data] Brad (internal, no internet) would answer "${args.user.slice(0, 160)}" ` +
        `from approved internal policies/workflows/events. Live model not invoked in mock mode.`,
      modelId: this.modelId,
      runtimeMode: 'mock',
      synthetic: true,
    };
  }
  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    return { available: true }; // mock is always available
  }
}
