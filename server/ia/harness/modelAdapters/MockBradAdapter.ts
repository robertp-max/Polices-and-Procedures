import type { BradModelAdapter, ModelChatArgs, ModelChatResult } from '../types.js';
import { composeInternalBradAnswer } from '../../brad/bradInternalResponder.js';

/* Deterministic Brad adapter — answers internal compliance/operations questions
   from approved internal sources (policies, procedures, workflows, forms,
   regulatory events, help articles) via the server-side scenario classifier +
   playbooks. NO internet, no live model call.

   The chat bubble NEVER shows test-harness wording (MVP / mock / stub /
   "would answer" / "live model not invoked"). Any diagnostics about the
   deterministic path are logged internally only (BRAD_DEBUG), never returned in
   `content`. `synthetic:true` is retained as internal metadata (the answer is
   composed, not from a live model); the UI does not render it as user text. */
export class MockBradAdapter implements BradModelAdapter {
  readonly id = 'mock-brad';
  readonly canReachInternet = false as const;
  constructor(private readonly modelId: string) {}

  async chat(args: ModelChatArgs): Promise<ModelChatResult> {
    const composed = composeInternalBradAnswer(args.user);

    if (process.env.BRAD_DEBUG === 'true' || process.env.BRAD_DEBUG === '1') {
      // Internal diagnostics only — never user-facing.
      console.debug('[brad:internal-responder]', { requestId: args.requestId, ...composed.diagnostics });
    }

    return {
      content: composed.text,
      modelId: this.modelId,
      runtimeMode: 'mock',
      synthetic: true,
      references: composed.references,
      track: composed.track,
    };
  }

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    return { available: true }; // deterministic internal responder is always available
  }
}
