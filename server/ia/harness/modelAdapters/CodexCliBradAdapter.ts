import { spawn, type StdioOptions } from 'node:child_process';
import type { BradModelAdapter, ModelChatArgs, ModelChatResult, BradConfig } from '../types.js';

const CODEX_BIN = process.env.BRAD_CODEX_BIN || 'codex';
const CODEX_REASONING_EFFORT = process.env.BRAD_CODEX_REASONING_EFFORT || 'xhigh';
const USE_SHELL = process.platform === 'win32';

function spawnCodex(args: string[], stdio: StdioOptions) {
  return spawn(CODEX_BIN, args, { stdio, shell: USE_SHELL });
}

/* Codex CLI Brad adapter (MVP, non-PHI).
   Uses the local Codex CLI subscription login server-side. This is a model call
   only; Brad still has no browser/search/web tools. */
export class CodexCliBradAdapter implements BradModelAdapter {
  readonly id = 'codex-cli-brad';
  readonly canReachInternet = false as const;
  constructor(private readonly cfg: BradConfig) {}

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    if (this.cfg.provider !== 'codex') {
      return { available: false, reason: `BRAD_PROVIDER='${this.cfg.provider}' (expected 'codex')` };
    }
    return new Promise((resolve) => {
      try {
        const p = spawnCodex(['login', 'status'], ['ignore', 'pipe', 'ignore']);
        let out = '';
        const t = setTimeout(() => { p.kill(); resolve({ available: false, reason: 'codex login status timed out' }); }, 8000);
        p.stdout?.on('data', (d) => { out += d.toString(); });
        p.on('error', () => { clearTimeout(t); resolve({ available: false, reason: 'codex CLI not found on PATH' }); });
        p.on('close', (code) => {
          clearTimeout(t);
          resolve(code === 0 && /Logged in/i.test(out)
            ? { available: true }
            : { available: false, reason: 'codex CLI is not logged in' });
        });
      } catch {
        resolve({ available: false, reason: 'failed to spawn codex CLI' });
      }
    });
  }

  async chat(args: ModelChatArgs): Promise<ModelChatResult> {
    const v = await this.validateAvailability();
    if (!v.available) throw new Error(`CodexCliBradAdapter unavailable (fail-closed): ${v.reason}`);

    const prompt = `${args.system}\n\n${args.user}`;
    const content = await new Promise<string>((resolve, reject) => {
      const p = spawnCodex([
        'exec',
        '--model', this.cfg.modelId,
        '-c', `model_reasoning_effort="${CODEX_REASONING_EFFORT}"`,
        '--sandbox', 'read-only',
        '--ask-for-approval', 'never',
        '--ephemeral',
        '--ignore-rules',
        '-',
      ], ['pipe', 'pipe', 'pipe']);
      let out = '', err = '';
      const t = setTimeout(() => { p.kill(); reject(new Error('codex CLI timed out')); }, 120_000);
      p.stdout?.on('data', (d) => { out += d.toString(); });
      p.stderr?.on('data', (d) => { err += d.toString(); });
      p.on('error', (e) => { clearTimeout(t); reject(e); });
      p.on('close', (code) => {
        clearTimeout(t);
        if (code === 0) resolve(out.trim());
        else reject(new Error(`codex CLI exit ${code}: ${err.slice(0, 200)}`));
      });
      p.stdin?.write(prompt);
      p.stdin?.end();
    });

    return { content, modelId: this.cfg.modelId, runtimeMode: 'cli-nonphi', synthetic: false };
  }
}
