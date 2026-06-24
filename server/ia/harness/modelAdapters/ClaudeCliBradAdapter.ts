import { spawn } from 'node:child_process';
import type { BradModelAdapter, ModelChatArgs, ModelChatResult, BradConfig } from '../types.js';

/* Claude CLI Brad adapter (MVP, non-PHI).
   Runs the local `claude` CLI (`--model <id> --print`) server-side as Brad's
   model until the Vertex agent is configured. This is the model-inference call
   only — Brad still has NO web/search/browser tools (canReachInternet:false).

   PHI BOUNDARY: this path reaches the Anthropic API, which has no BAA here, so it
   is for `cli-nonphi` (PHI-disabled) ONLY. `BradRuntime` blocks PHI prompts in
   this mode; PHI mode must use the in-perimeter Vertex adapter. Fails closed if
   the `claude` CLI is absent or BRAD_PROVIDER!=='claude'. */
export class ClaudeCliBradAdapter implements BradModelAdapter {
  readonly id = 'claude-cli-brad';
  readonly canReachInternet = false as const; // no web-browse/search tools; model call only
  constructor(private readonly cfg: BradConfig) {}

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (this.cfg.provider !== 'claude') {
      return { available: false, reason: `BRAD_PROVIDER='${this.cfg.provider}' (expected 'claude')` };
    }
    return new Promise((resolve) => {
      try {
        const p = spawn('claude', ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] });
        const t = setTimeout(() => { p.kill(); resolve({ available: false, reason: 'claude CLI --version timed out' }); }, 8000);
        p.on('error', () => { clearTimeout(t); resolve({ available: false, reason: 'claude CLI not found on PATH' }); });
        p.on('close', (code) => { clearTimeout(t); resolve(code === 0 ? { available: true } : { available: false, reason: `claude --version exit ${code}` }); });
      } catch {
        resolve({ available: false, reason: 'failed to spawn claude CLI' });
      }
    });
  }

  async chat(args: ModelChatArgs): Promise<ModelChatResult> {
    const v = await this.validateAvailability();
    if (!v.available) throw new Error(`ClaudeCliBradAdapter unavailable (fail-closed): ${v.reason}`);

    const prompt = `${args.system}\n\n${args.user}`;
    const content = await new Promise<string>((resolve, reject) => {
      const p = spawn('claude', ['--model', this.cfg.modelId, '--print'], { stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '', err = '';
      const t = setTimeout(() => { p.kill(); reject(new Error('claude CLI timed out')); }, 120_000);
      p.stdout.on('data', (d) => { out += d.toString(); });
      p.stderr.on('data', (d) => { err += d.toString(); });
      p.on('error', (e) => { clearTimeout(t); reject(e); });
      p.on('close', (code) => {
        clearTimeout(t);
        if (code === 0) resolve(out.trim());
        else reject(new Error(`claude CLI exit ${code}: ${err.slice(0, 200)}`));
      });
      p.stdin.write(prompt);
      p.stdin.end();
    });

    return { content, modelId: this.cfg.modelId, runtimeMode: 'cli-nonphi', synthetic: false };
  }
}
