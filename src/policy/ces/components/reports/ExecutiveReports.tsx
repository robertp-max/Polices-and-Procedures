/* ═══════════════════════════════════════════════════════════════
   ExecutiveReports — sprint-over-sprint compliance trends.
   Pure SVG charts (no external chart lib).
   ═══════════════════════════════════════════════════════════════ */

import { useComplianceExecution } from '@/policy/compliance-execution';
import type { SprintTrendPoint } from '../../types';
import { PageHeader, SurfaceCard } from '@/policy/components/ui';

export function ExecutiveReports() {
  const snap = useComplianceExecution();
  const SPRINT_TRENDS = snap.sprintTrends;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CES REPORTS"
        title="Executive Reports"
        description="Sprint-over-sprint compliance trends and regulatory KPIs. All figures from live execution snapshots."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">Compliance Completion Rate (%)</div>
          <BarChart data={SPRINT_TRENDS} pick={p => p.completionRatePct} unit="%" target={85} color="var(--v3-teal)" />
        </SurfaceCard>

        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">On-Time Completion (%)</div>
          <BarChart data={SPRINT_TRENDS} pick={p => p.onTimeRatePct} unit="%" target={80} color="var(--v3-teal)" />
        </SurfaceCard>

        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">Audit Readiness Score (0–100)</div>
          <LineChart data={SPRINT_TRENDS} pick={p => p.auditReadinessScore} target={85} color="#7AE2A8" />
        </SurfaceCard>

        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">Signature SLA Compliance (%)</div>
          <LineChart data={SPRINT_TRENDS} pick={p => p.signatureSlaPct} target={90} color="#FFA059" />
        </SurfaceCard>

        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">Blocked Resolution Time (hours)</div>
          <BarChart data={SPRINT_TRENDS} pick={p => p.blockedResolutionHours} unit="h" inverted color="#FF8A8A" />
        </SurfaceCard>

        <SurfaceCard padding="md">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--v3-text-tertiary)]">Carry-Over Units Across Sprints</div>
          <BarChart data={SPRINT_TRENDS} pick={p => p.carryOverCount} unit="" inverted color="#F4C95D" />
        </SurfaceCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   BarChart — sprint number on X, metric on Y
   ───────────────────────────────────────────────────────── */
function BarChart({
  data, pick, unit, color, target, inverted,
}: {
  data: readonly SprintTrendPoint[];
  pick: (p: SprintTrendPoint) => number;
  unit: string;
  color: string;
  target?: number;
  inverted?: boolean;
}) {
  const values = data.map(pick);
  const max    = Math.max(...values, target ?? 0) * 1.15;
  const last   = values[values.length - 1];
  const prev   = values[values.length - 2];
  const delta  = last - prev;
  const good   = inverted ? delta < 0 : delta > 0;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[28px] font-bold" style={{ color }}>{last}{unit}</span>
        <span className="text-[11px] font-semibold" style={{ color: good ? '#7AE2A8' : 'var(--v3-orange)' }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(0)}{unit} vs prior
        </span>
      </div>
      <svg viewBox="0 0 320 140" className="w-full h-32">
        {target !== undefined && (
          <line
            x1="0" x2="320"
            y1={140 - (target / max) * 130}
            y2={140 - (target / max) * 130}
            stroke="#7AE2A8" strokeDasharray="4 4" strokeWidth="1"
          />
        )}
        {data.map((p, i) => {
          const v   = pick(p);
          const h   = (v / max) * 130;
          const w   = 320 / data.length - 8;
          const x   = i * (320 / data.length) + 4;
          const y   = 140 - h;
          return (
            <g key={p.sprintNumber}>
              <rect x={x} y={y} width={w} height={h} fill={color} rx="2" />
              <text x={x + w/2} y={138} textAnchor="middle" fontSize="9" fill="var(--v3-text-tertiary)">
                S{p.sprintNumber}
              </text>
              <text x={x + w/2} y={y - 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--v3-text-primary)">
                {v}
              </text>
            </g>
          );
        })}
      </svg>
      {target !== undefined && (
        <div className="text-[10px] mt-2 font-semibold" style={{ color: '#7AE2A8' }}>
          ── Target: {target}{unit}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LineChart — for score-style metrics
   ───────────────────────────────────────────────────────── */
function LineChart({
  data, pick, color, target,
}: {
  data: readonly SprintTrendPoint[];
  pick: (p: SprintTrendPoint) => number;
  color: string;
  target?: number;
}) {
  const max  = Math.max(...data.map(pick), target ?? 0) * 1.10;
  const min  = Math.min(...data.map(pick)) * 0.85;
  const last = pick(data[data.length - 1]);
  const prev = pick(data[data.length - 2]);
  const delta = last - prev;

  const norm = (v: number) => 140 - ((v - min) / (max - min)) * 130;
  const stepX = 320 / (data.length - 1);

  const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${norm(pick(p))}`).join(' ');

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[28px] font-bold" style={{ color }}>{last}</span>
        <span className="text-[11px] font-semibold" style={{ color: delta >= 0 ? '#7AE2A8' : 'var(--v3-orange)' }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(0)} vs prior
        </span>
      </div>
      <svg viewBox="0 0 320 150" className="w-full h-32">
        {target !== undefined && (
          <line
            x1="0" x2="320" y1={norm(target)} y2={norm(target)}
            stroke="#7AE2A8" strokeDasharray="4 4" strokeWidth="1"
          />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
        {data.map((p, i) => (
          <g key={p.sprintNumber}>
            <circle cx={i * stepX} cy={norm(pick(p))} r="3.5" fill={color} />
            <text x={i * stepX} y={148} textAnchor="middle" fontSize="9" fill="var(--v3-text-tertiary)">
              S{p.sprintNumber}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
