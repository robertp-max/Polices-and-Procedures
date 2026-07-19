import { env } from './env.js';

/* ═══════════════════════════════════════════════════════════════
   Minimal structured logger. Avoids pulling a logging dependency
   just to print a few JSON lines. Redacts obvious secret fields.
   ═══════════════════════════════════════════════════════════════ */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;

const currentLevel = LEVELS[env.logLevel] ?? LEVELS.info;

const REDACT_KEYS = new Set([
  'authorization', 'cookie', 'set-cookie',
  'private_key', 'client_secret', 'token', 'id_token', 'refresh_token',
]);

function redact(obj: unknown): unknown {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '***redacted***' : redact(v);
  }
  return out;
}

function emit(level: Level, message: string, fields?: object) {
  if (LEVELS[level] < currentLevel) return;
  const line = {
    t: new Date().toISOString(),
    level,
    msg: message,
    ...(fields ? (redact(fields) as Record<string, unknown>) : {}),
  };
  console[level === 'debug' ? 'log' : level](JSON.stringify(line));
}

export const log = {
  debug: (m: string, f?: object) => emit('debug', m, f),
  info:  (m: string, f?: object) => emit('info',  m, f),
  warn:  (m: string, f?: object) => emit('warn',  m, f),
  error: (m: string, f?: object) => emit('error', m, f),
};
