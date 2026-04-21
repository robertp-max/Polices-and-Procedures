import { AlertCircle, CheckCircle2, Database, RefreshCw, Cpu } from 'lucide-react';
import type { HealthResponse } from '../lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   HealthStrip — top-of-page status ribbon for the compliance
   intelligence engine. Shows:
     - index readiness + corpus scale
     - Ollama reachability + loaded models

   Any missing piece is surfaced so the operator knows they need to
   run `npm run ia:index` or start Ollama.
   ═══════════════════════════════════════════════════════════════ */

export interface HealthStripProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  isLight: boolean;
  onRebuild?: () => void;
}

export function HealthStrip({ health, loading, error, isLight, onRebuild }: HealthStripProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const ok = isLight ? '#047857' : '#6EE7B7';
  const warn = isLight ? '#B45309' : '#FCD34D';
  const bad = isLight ? '#B91C1C' : '#FCA5A5';

  const indexReady = Boolean(health?.status.ready);
  const ollamaUp = Boolean(health?.ollama.ok);

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
            : error
              ? 'error'
              : indexReady
                ? `${health?.status.docCount} documents / ${health?.status.chunkCount} knowledge chunks`
                : 'not built'
        }
        warnLevel={error ? 'bad' : indexReady ? 'ok' : 'warn'}
        okColor={ok} warnColor={warn} badColor={bad}
        muted={muted}
      />
      <Pill
        icon={<Cpu size={12} strokeWidth={2} />}
        label="Brad Inference Engine"
        value={loading ? 'checking' : ollamaUp ? (health?.ollama.models?.[0] ?? 'ready') : 'unreachable'}
        warnLevel={ollamaUp ? 'ok' : 'bad'}
        okColor={ok} warnColor={warn} badColor={bad}
        muted={muted}
      />
      {health?.status.embedModel && (
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          embed: {health.status.embedModel}
        </span>
      )}
      {health?.status.builtAt && (
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
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
            fontFamily: "'JetBrains Mono', monospace",
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
