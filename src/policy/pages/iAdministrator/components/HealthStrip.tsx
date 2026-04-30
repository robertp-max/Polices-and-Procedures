import { AlertCircle, CheckCircle2, Database, RefreshCw, Cpu, WifiOff, Server } from 'lucide-react';
import type { HealthResponse } from '../lib/responseTypes';
import type { BackendMode } from '../lib/iaClient';

/* ═══════════════════════════════════════════════════════════════
   HealthStrip — top-of-page status ribbon.

   BackendMode matrix:
     available       → normal corpus + inference pills
     index_not_built → corpus warn, inference may be ok
     static_deploy   → both pills show "local runtime only"
                        Rebuild button is disabled with tooltip
     not_found       → API backend not deployed
     method_mismatch → route/method issue on backend
     unreachable     → can't connect to local server
     checking        → loading state
   ═══════════════════════════════════════════════════════════════ */

export interface HealthStripProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  backendMode: BackendMode;
  isLight: boolean;
  onRebuild?: () => void;
}

const BACKEND_MODE_MESSAGES: Record<BackendMode, string | null> = {
  available: null,
  index_not_built: null,
  static_deploy: 'Local preview guidance is active for Brad while the live backend is unavailable on this host.',
  not_found: 'API backend not found (404) — the server is not deployed on this host.',
  method_mismatch: 'API route rejected the request method (405) — likely a server-side routing issue.',
  unreachable: 'Cannot reach local server — make sure `npm run dev` is running on port 8787.',
  checking: null,
};

export function HealthStrip({
  health, loading, error, backendMode, isLight, onRebuild,
}: HealthStripProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const ok = isLight ? '#047857' : '#6EE7B7';
  const warn = isLight ? '#B45309' : '#FCD34D';
  const bad = isLight ? '#B91C1C' : '#FCA5A5';
  const mono = "'JetBrains Mono', monospace";

  const indexReady = Boolean(health?.status.ready);
  const ollamaUp = Boolean(health?.ollama.ok);

  // Static-deploy or no backend: show a dedicated banner instead of misleading pills
  const isOffline = backendMode === 'static_deploy'
    || backendMode === 'not_found'
    || backendMode === 'unreachable'
    || backendMode === 'method_mismatch';

  const statusMsg = BACKEND_MODE_MESSAGES[backendMode];

  if (isOffline) {
    const Icon = backendMode === 'static_deploy' ? Server : WifiOff;
    const modeLabel: Record<BackendMode, string> = {
      static_deploy: 'Brad Preview Guidance Active',
      not_found: 'Backend Not Deployed',
      method_mismatch: 'API Route Error (405)',
      unreachable: 'Local Server Unreachable',
      available: '',
      index_not_built: '',
      checking: '',
    };
    return (
      <div
        className="w-full flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl"
        style={{
          background: isLight ? '#FAFAFA' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isLight ? '#D9F99D66' : '#86EFAC44'}`,
          color: text,
        }}
      >
        <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: backendMode === 'static_deploy' ? ok : warn, fontFamily: mono }}>
          <Icon size={12} strokeWidth={2} />
          <span className="uppercase tracking-[0.18em]">Brad Intelligence Engine</span>
          <AlertCircle size={12} strokeWidth={2} style={{ color: backendMode === 'static_deploy' ? ok : warn }} />
          <span className="font-semibold">{modeLabel[backendMode] ?? 'Unavailable'}</span>
        </span>
        {statusMsg && (
          <span
            className="text-[10px] flex-1 min-w-0 truncate"
            style={{ color: muted, fontFamily: mono }}
            title={statusMsg}
          >
            {statusMsg}
          </span>
        )}
        <div className="flex-1" />
        {/* Rebuild disabled with explanation */}
        <span
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md opacity-40 cursor-not-allowed select-none"
          style={{
            color: muted,
            background: 'transparent',
            border: `1px solid ${border}`,
            fontFamily: mono,
          }}
          title={
            backendMode === 'static_deploy'
              ? 'Rebuild requires the local server runtime. This app is deployed as a static site with no backend. Run `npm run ia:index` locally.'
              : 'Backend unavailable — cannot rebuild index.'
          }
        >
          <RefreshCw size={11} strokeWidth={2} />
          Rebuild
        </span>
      </div>
    );
  }

  // Normal render (backend available or checking)
  return (
    <div
      className="w-full flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl"
      style={{
        background: isLight ? '#FAFAFA' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      <Pill
        icon={<Database size={12} strokeWidth={2} />}
        label="Brad Internal Corpus"
        value={
          loading
            ? 'checking'
            : error && !indexReady
              ? 'not built — run ia:index'
              : indexReady
                ? `${health?.status.docCount} documents / ${health?.status.chunkCount} knowledge chunks`
                : 'not built'
        }
        warnLevel={error && !indexReady ? 'warn' : indexReady ? 'ok' : 'warn'}
        okColor={ok} warnColor={warn} badColor={bad}
        muted={muted}
      />
      <Pill
        icon={<Cpu size={12} strokeWidth={2} />}
        label="Brad Inference Engine"
        value={
          loading
            ? 'checking'
            : ollamaUp
              ? (health?.ollama.models?.[0] ?? 'ready')
              : 'start Ollama to enable'
        }
        warnLevel={loading ? 'warn' : ollamaUp ? 'ok' : 'warn'}
        okColor={ok} warnColor={warn} badColor={bad}
        muted={muted}
      />
      {health?.status.embedModel && (
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: muted, fontFamily: mono }}
        >
          embed: {health.status.embedModel}
        </span>
      )}
      {health?.status.builtAt && (
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: muted, fontFamily: mono }}
        >
          built: {new Date(health.status.builtAt).toLocaleString()}
        </span>
      )}
      <div className="flex-1" />
      {onRebuild && (
        <button
          type="button"
          onClick={onRebuild}
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md transition-colors"
          style={{
            color: muted,
            background: 'transparent',
            border: `1px solid ${border}`,
            fontFamily: mono,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = text; }}
          onMouseLeave={e => { e.currentTarget.style.color = muted; }}
        >
          <RefreshCw size={11} strokeWidth={2} />
          Rebuild
        </button>
      )}
    </div>
  );
}

function Pill({
  icon, label, value, warnLevel,
  okColor, warnColor, badColor, muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warnLevel: 'ok' | 'warn' | 'bad';
  okColor: string;
  warnColor: string;
  badColor: string;
  muted: string;
}) {
  const color = warnLevel === 'ok' ? okColor : warnLevel === 'warn' ? warnColor : badColor;
  const Dot = warnLevel === 'ok' ? CheckCircle2 : AlertCircle;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}>
      {icon}
      <span className="uppercase tracking-[0.18em]">{label}</span>
      <Dot size={12} strokeWidth={2} style={{ color }} />
      <span style={{ color }}>{value}</span>
    </span>
  );
}
