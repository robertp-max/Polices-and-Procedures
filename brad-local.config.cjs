/* ─────────────────────────────────────────────────────────────────────────────
   Brad LOCAL always-on runtime (pm2).
   ----------------------------------------------------------------------------
   Runs the combined Care Indeed app (UI + /api/brad) on this laptop with Brad's
   brain = the local authenticated Claude CLI (cli-nonphi, model sonnet). A
   Cloudflare quick-tunnel exposes it to a public URL so remote users can chat
   and THIS laptop answers. MVP only — all data is synthetic; PHI gate is OFF
   (BRAD_SYNTHETIC_DATA_ONLY=true). Production PHI later = Vertex AI.

   Start:   pm2 start brad-local.config.cjs   &&  pm2 save
   Status:  pm2 status   |   pm2 logs brad-tunnel   (shows the public URL)
   Stop:    pm2 stop brad-local.config.cjs
   ───────────────────────────────────────────────────────────────────────────── */

const ROOT = 'C:\\AI\\Git\\training\\HomeHealth\\Policies_and_Procedures_V2_GCPMerge';
const PORT = '8080';

module.exports = {
  apps: [
    {
      name: 'brad-server',
      cwd: ROOT,
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'server/index.ts',
      interpreter: 'node',
      autorestart: true,
      max_restarts: 30,
      env: {
        NODE_ENV: 'production',
        PORT,
        // Brad brain = local Claude CLI (real answers, no BAA → synthetic data only)
        BRAD_RUNTIME_MODE: 'cli-nonphi',
        BRAD_PROVIDER: 'claude',
        BRAD_MODEL_ID: 'sonnet',
        BRAD_PHI_ENABLED: 'false',
        // MVP: all training data is fake → do NOT block "PHI"-looking prompts.
        BRAD_SYNTHETIC_DATA_ONLY: 'true',
        BRAD_CLAUDE_BIN: 'C:\\Users\\razer\\AppData\\Roaming\\npm\\claude.cmd',
        // Same-origin (UI + API served together) — allow the tunnel origin.
        ALLOWED_ORIGIN: '*',
      },
    },
    {
      name: 'brad-tunnel',
      script: 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
      args: `tunnel --url http://localhost:${PORT}`,
      interpreter: 'none',
      autorestart: true,
      max_restarts: 30,
    },
  ],
};
