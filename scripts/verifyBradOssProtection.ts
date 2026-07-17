/* ─────────────────────────────────────────────────────────────────────────
   Brad OSS runtime + safety-contract protection gate  (verify:brad-protection)
   ---------------------------------------------------------------------------
   Locks the canonical open-source (Ollama) inference contract and the
   safety-before-inference doctrine. CI-safe: uses a DEAD Ollama base URL so it
   needs no running model server — it proves the *contract* (provider selection,
   no-internet guarantee, fail-closed init, no silent fallback, and safety
   routing bypassing the model), not live generation (that is covered by the
   live smoke test).

   Run: npm run verify:brad-protection
   ───────────────────────────────────────────────────────────────────────── */

// Configure the OSS engine with an intentionally unreachable endpoint BEFORE
// importing the runtime/config (they read process.env).
process.env.BRAD_RUNTIME_MODE = 'oss-nonphi';
process.env.BRAD_PROVIDER = 'ollama';
process.env.OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b-instruct-q4_K_M';
process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:1'; // dead on purpose → fail-closed
process.env.OLLAMA_TIMEOUT_MS = '3000';
process.env.BRAD_SYNTHETIC_DATA_ONLY = 'true'; // avoid PHI-gate noise for benign prompts

const { readHarnessConfig } = await import('../server/ia/harness/config.js');
const { BradRuntime } = await import('../server/ia/harness/BradRuntime.js');
const { routeCriticalIncident } = await import('../server/ia/brad/criticalIncidentRouter.js');
const { OllamaBradAdapter } = await import('../server/ia/harness/modelAdapters/OllamaBradAdapter.js');

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const add = (name: string, ok: boolean, detail?: string) => checks.push({ name, ok, detail });

const cfg = readHarnessConfig();

// 1) Configuration explicitly selects the OSS engine.
add('provider coerces to ollama', cfg.brad.provider === 'ollama', `provider=${cfg.brad.provider}`);
add('runtime mode is oss-nonphi', cfg.brad.runtimeMode === 'oss-nonphi', `mode=${cfg.brad.runtimeMode}`);
add('ollama config populated (baseUrl + chatModel + timeout)',
  !!cfg.brad.ollamaBaseUrl && !!cfg.brad.ollamaChatModel && cfg.brad.ollamaTimeoutMs > 0,
  `${cfg.brad.ollamaBaseUrl} / ${cfg.brad.ollamaChatModel} / ${cfg.brad.ollamaTimeoutMs}ms`);
add('modelId reflects the OSS chat model (visible in diagnostics)',
  cfg.brad.modelId === cfg.brad.ollamaChatModel, `modelId=${cfg.brad.modelId}`);
// Unknown provider still fails safe to mock (default preserved).
add('unknown provider falls back to mock (fail-safe default)',
  readHarnessConfig({ ...process.env, BRAD_PROVIDER: 'skynet' } as NodeJS.ProcessEnv).brad.provider === 'mock');

const rt = new BradRuntime();

// 2) Brad never reaches the internet (type-level guarantee holds at runtime).
add('canReachInternet is false', rt.canReachInternet === false);

// 3) Diagnostics expose provider + model; unreachable engine fails closed.
const desc = await rt.describe();
add('diagnostics expose provider=ollama', desc.provider === 'ollama', `provider=${desc.provider}`);
add('diagnostics expose the OSS model id', desc.modelId === cfg.brad.ollamaChatModel, `modelId=${desc.modelId}`);
add('unreachable engine → fail-closed badge (no silent live claim)',
  desc.badge === 'Configuration Error — Fail Closed', `badge=${desc.badge}`);

// 4) Adapter-level fail-closed: wrong provider + unreachable both refuse.
const adapter = new OllamaBradAdapter(cfg.brad);
add('adapter declares canReachInternet=false', adapter.canReachInternet === false);
const availDead = await adapter.validateAvailability();
add('adapter reports unavailable when engine is unreachable (fail-closed)',
  availDead.available === false && /unreachable/i.test(availDead.reason ?? ''), availDead.reason);
let chatThrew = false;
try { await adapter.chat({ system: 's', user: 'hello', requestId: 'x' }); }
catch { chatThrew = true; }
add('adapter.chat throws (never fabricates) when engine is down', chatThrew);

// 5) Safety routing PRECEDES inference — critical incident bypasses the model.
add('router flags "help my client got shot" as urgent',
  routeCriticalIncident('help my client got shot').urgent === true);
const tSafe = Date.now();
const urgent = await rt.answer('help my client got shot', 'protection', 'user');
const urgentMs = Date.now() - tSafe;
add('urgent answer returns deterministic safety guidance (911 + track), engine bypassed',
  /911/.test(urgent.text) && !!urgent.track && !urgent.blocked, `track=${urgent.track} ms=${urgentMs}`);
add('urgent answer is fast (model was not called)', urgentMs < 1500, `${urgentMs}ms`);

// 6) NO SILENT FALLBACK: a NORMAL prompt with the engine down must error out,
//    never return mock/canned/SaaS content.
let normalFailedClosed = false; let normalText = '';
try { const r = await rt.answer('what is a home health plan of care?', 'protection', 'user'); normalText = r.text; }
catch { normalFailedClosed = true; }
add('normal prompt fails closed when engine down (no silent mock/canned answer)',
  normalFailedClosed, normalFailedClosed ? 'threw (fail-closed)' : `returned: ${normalText.slice(0, 60)}`);

// ── Report ──────────────────────────────────────────────────────────────────
console.log('Brad OSS Runtime + Safety Contract Verifier');
console.log('===========================================');
let fails = 0;
for (const c of checks) {
  if (c.ok) console.log(`PASS  ${c.name}`);
  else { fails++; console.error(`FAIL  ${c.name}${c.detail ? ` :: ${c.detail}` : ''}`); }
}
console.log('---');
console.log(`${checks.length} checks, ${fails} failed`);
if (fails === 0) { console.log('verify:brad-protection PASS'); process.exit(0); }
console.error('verify:brad-protection FAIL'); process.exit(1);
