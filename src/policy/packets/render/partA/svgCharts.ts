/**
 * Part A — print-safe inline-SVG chart library.
 *
 * Universal, dependency-free chart primitives for the executive-narrative front
 * matter. Every chart is:
 *   - self-contained inline SVG (no scripts, no external fonts/CSS/images) so it
 *     survives the print/CSP path;
 *   - directly labeled (the number is the truth; the geometry is support);
 *   - honest about UNKNOWN — missing values render as a hatched "no data" mark,
 *     never as zero;
 *   - brand-styled (teal/orange + RAG status colors), colorblind-aware (status is
 *     encoded by label + hatch, not color alone).
 *
 * Chart variety is intentional (see the Part A spec): heatmap, slope, bullet,
 * donut, gauge, line, funnel, dot-matrix, lollipop, stat strip. Bars are a
 * deliberate minority.
 */
import { escapeHtml } from '../chrome';

export type RagStatus = 'met' | 'near' | 'below' | 'unknown';

const COLORS = {
  teal: '#007c7a',
  tealDark: '#043f3f',
  orange: '#e87722',
  met: '#0f7b34',
  near: '#b8860b',
  below: '#b91c1c',
  unknown: '#9aa3a3',
  grid: '#e9eeee',
  ink: '#374151',
  muted: '#697272',
} as const;

function ragColor(status: RagStatus): string {
  return status === 'met' ? COLORS.met
    : status === 'near' ? COLORS.near
      : status === 'below' ? COLORS.below
        : COLORS.unknown;
}

/** Format a number for a data label — compact, never scientific. */
function fmt(value: number | null, unit = ''): string {
  if (value === null || !Number.isFinite(value)) return 'UNKNOWN';
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return unit ? `${text}${unit.startsWith('%') || unit.startsWith(' ') ? unit : ` ${unit}`}` : text;
}

/** Hatch pattern for UNKNOWN regions, unique per chart to avoid id collisions. */
function hatchDef(id: string): string {
  return `<defs><pattern id="${escapeHtml(id)}" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#f1f4f4"/><line x1="0" y1="0" x2="0" y2="6" stroke="${COLORS.unknown}" stroke-width="1.4"/></pattern></defs>`;
}

function figure(chartId: string, title: string, svg: string, caption: string): string {
  return `<figure class="pa-chart" data-chart="${escapeHtml(chartId)}">
    <figcaption class="pa-chart-title">${escapeHtml(title)}</figcaption>
    ${svg}
    <figcaption class="pa-chart-cap">${escapeHtml(caption)}</figcaption>
  </figure>`;
}

/* ─────────────────────────── RAG heatmap (scorecard) ─────────────────────────── */
export interface HeatCell { label: string; status: RagStatus; valueText: string; }

export function renderRagHeatmap(chartId: string, title: string, caption: string, cells: readonly HeatCell[]): string {
  const cols = 4;
  const cw = 156;
  const ch = 52;
  const gap = 8;
  const rows = Math.ceil(cells.length / cols);
  const w = cols * cw + (cols - 1) * gap;
  const h = rows * ch + (rows - 1) * gap;
  const squares = cells.map((cell, i) => {
    const x = (i % cols) * (cw + gap);
    const y = Math.floor(i / cols) * (ch + gap);
    const fill = cell.status === 'unknown' ? `url(#${chartId}-h)` : ragColor(cell.status);
    const textFill = cell.status === 'unknown' ? COLORS.muted : '#ffffff';
    return `<g>
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="4" fill="${fill}" stroke="${cell.status === 'unknown' ? COLORS.unknown : 'none'}"/>
      <text x="${x + 10}" y="${y + 20}" font-size="9.5" font-weight="700" fill="${textFill}">${escapeHtml(truncate(cell.label, 26))}</text>
      <text x="${x + 10}" y="${y + 38}" font-size="12" font-weight="700" fill="${textFill}">${escapeHtml(cell.valueText)}</text>
    </g>`;
  }).join('');
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">${hatchDef(`${chartId}-h`)}${squares}</svg>`;
  return figure(chartId, title, svg, caption) + ragLegend();
}

function ragLegend(): string {
  const item = (c: string, t: string) => `<span class="pa-key"><i style="background:${c}"></i>${t}</span>`;
  return `<div class="pa-legend">${item(COLORS.met, 'Met / exceeded')}${item(COLORS.near, 'Near goal')}${item(COLORS.below, 'Below target')}${item(COLORS.unknown, 'Unverified')}</div>`;
}

/* ─────────────────────────── Slope chart (prior → current) ─────────────────────────── */
export interface SlopeSeries { label: string; prior: number | null; current: number | null; unit?: string; }

export function renderSlopeChart(chartId: string, title: string, caption: string, series: readonly SlopeSeries[]): string {
  const w = 560;
  const h = 30 + series.length * 26 + 24;
  const xL = 150;
  const xR = 470;
  const all = series.flatMap((s) => [s.prior, s.current]).filter((v): v is number => v !== null && Number.isFinite(v));
  const max = all.length ? Math.max(...all) : 1;
  const min = all.length ? Math.min(...all, 0) : 0;
  const span = max - min || 1;
  const yTop = 30;
  const yBot = h - 30;
  const yFor = (v: number) => yBot - ((v - min) / span) * (yBot - yTop);
  const rows = series.map((s, i) => {
    const color = i % 2 === 0 ? COLORS.teal : COLORS.orange;
    const pKnown = s.prior !== null && Number.isFinite(s.prior);
    const cKnown = s.current !== null && Number.isFinite(s.current);
    const py = pKnown ? yFor(s.prior as number) : yTop + i * 8;
    const cy = cKnown ? yFor(s.current as number) : yTop + i * 8;
    const line = pKnown && cKnown
      ? `<line x1="${xL}" y1="${py}" x2="${xR}" y2="${cy}" stroke="${color}" stroke-width="2"/>`
      : `<line x1="${xL}" y1="${py}" x2="${xR}" y2="${cy}" stroke="${COLORS.unknown}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
    const pDot = pKnown ? `<circle cx="${xL}" cy="${py}" r="3.5" fill="${color}"/>` : '';
    const cDot = cKnown ? `<circle cx="${xR}" cy="${cy}" r="3.5" fill="${color}"/>` : '';
    return `${line}${pDot}${cDot}
      <text x="8" y="${cy + 3}" font-size="9.5" fill="${COLORS.ink}">${escapeHtml(truncate(s.label, 30))}</text>
      <text x="${xL - 6}" y="${py + 3}" font-size="9" text-anchor="end" fill="${COLORS.muted}">${escapeHtml(fmt(s.prior, s.unit))}</text>
      <text x="${xR + 6}" y="${cy + 3}" font-size="9" fill="${COLORS.muted}">${escapeHtml(fmt(s.current, s.unit))}</text>`;
  }).join('');
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">
    <text x="${xL}" y="18" font-size="9" font-weight="700" text-anchor="middle" fill="${COLORS.muted}">PRIOR</text>
    <text x="${xR}" y="18" font-size="9" font-weight="700" text-anchor="middle" fill="${COLORS.muted}">CURRENT</text>
    <line x1="${xL}" y1="${yTop - 4}" x2="${xL}" y2="${yBot + 4}" stroke="${COLORS.grid}"/>
    <line x1="${xR}" y1="${yTop - 4}" x2="${xR}" y2="${yBot + 4}" stroke="${COLORS.grid}"/>
    ${rows}
  </svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Bullet chart (value vs target) ─────────────────────────── */
export interface BulletRow { label: string; value: number | null; target: number | null; unit?: string; status: RagStatus; }

export function renderBulletChart(chartId: string, title: string, caption: string, rows: readonly BulletRow[]): string {
  const w = 560;
  const rowH = 34;
  const h = rows.length * rowH + 10;
  const xL = 180;
  const barW = 320;
  const known = rows.flatMap((r) => [r.value, r.target]).filter((v): v is number => v !== null && Number.isFinite(v));
  const max = known.length ? Math.max(...known) * 1.1 : 1;
  const body = rows.map((r, i) => {
    const y = i * rowH + 6;
    const vKnown = r.value !== null && Number.isFinite(r.value);
    const vW = vKnown ? Math.max(2, ((r.value as number) / max) * barW) : barW;
    const bar = vKnown
      ? `<rect x="${xL}" y="${y + 6}" width="${vW}" height="12" rx="2" fill="${ragColor(r.status)}"/>`
      : `<rect x="${xL}" y="${y + 6}" width="${barW}" height="12" rx="2" fill="url(#${chartId}-h)" stroke="${COLORS.unknown}"/>`;
    const tick = r.target !== null && Number.isFinite(r.target)
      ? `<line x1="${xL + (r.target / max) * barW}" y1="${y + 2}" x2="${xL + (r.target / max) * barW}" y2="${y + 24}" stroke="${COLORS.orange}" stroke-width="2"/>`
      : '';
    return `<g>
      <text x="8" y="${y + 16}" font-size="9.5" fill="${COLORS.ink}">${escapeHtml(truncate(r.label, 30))}</text>
      <rect x="${xL}" y="${y + 6}" width="${barW}" height="12" rx="2" fill="#f1f4f4"/>
      ${bar}${tick}
      <text x="${xL + barW + 8}" y="${y + 16}" font-size="9" fill="${COLORS.muted}">${escapeHtml(fmt(r.value, r.unit))}${r.target !== null ? ` / tgt ${escapeHtml(fmt(r.target, r.unit))}` : ''}</text>
    </g>`;
  }).join('');
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">${hatchDef(`${chartId}-h`)}${body}</svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Donut (part-to-whole) ─────────────────────────── */
export interface DonutSlice { label: string; value: number | null; }

export function renderDonut(chartId: string, title: string, caption: string, slices: readonly DonutSlice[], unit = ''): string {
  const known = slices.filter((s) => s.value !== null && Number.isFinite(s.value)) as { label: string; value: number }[];
  const total = known.reduce((sum, s) => sum + s.value, 0);
  const cx = 90;
  const cy = 90;
  const r = 70;
  const inner = 42;
  const palette = [COLORS.teal, COLORS.orange, '#0f7b34', '#4b7bec', '#b8860b', '#7a5195'];
  let angle = -Math.PI / 2;
  const arcs = total > 0 ? known.map((s, i) => {
    const frac = s.value / total;
    const end = angle + frac * Math.PI * 2;
    const path = donutArc(cx, cy, r, inner, angle, end);
    angle = end;
    return `<path d="${path}" fill="${palette[i % palette.length]}"/>`;
  }).join('') : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${chartId}-h)" stroke="${COLORS.unknown}"/><circle cx="${cx}" cy="${cy}" r="${inner}" fill="#fff"/>`;
  const centerText = total > 0
    ? `<text x="${cx}" y="${cy - 2}" font-size="18" font-weight="700" text-anchor="middle" fill="${COLORS.tealDark}">${fmt(total)}</text><text x="${cx}" y="${cy + 14}" font-size="8" text-anchor="middle" fill="${COLORS.muted}">TOTAL</text>`
    : `<text x="${cx}" y="${cy + 3}" font-size="10" font-weight="700" text-anchor="middle" fill="${COLORS.muted}">UNKNOWN</text>`;
  const legend = slices.map((s) => {
    const c = (s.value !== null && total > 0) ? palette[known.findIndex((k) => k.label === s.label) % palette.length] : COLORS.unknown;
    const pct = (s.value !== null && total > 0) ? ` (${Math.round((s.value / total) * 100)}%)` : '';
    return `<div class="pa-donut-key"><i style="background:${c}"></i><span>${escapeHtml(truncate(s.label, 34))}</span><b>${escapeHtml(fmt(s.value, unit))}${pct}</b></div>`;
  }).join('');
  const svg = `<div class="pa-donut-wrap"><svg class="pa-svg" viewBox="0 0 180 180" width="180" role="img" aria-label="${escapeHtml(title)}">${hatchDef(`${chartId}-h`)}${arcs}${centerText}</svg><div class="pa-donut-legend">${legend}</div></div>`;
  return figure(chartId, title, svg, caption);
}

function donutArc(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(start);
  const y1 = cy + rOuter * Math.sin(start);
  const x2 = cx + rOuter * Math.cos(end);
  const y2 = cy + rOuter * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end);
  const y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start);
  const y4 = cy + rInner * Math.sin(start);
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

/* ─────────────────────────── Gauge (single %) ─────────────────────────── */
export function renderGauge(chartId: string, title: string, caption: string, pct: number | null, centerLabel: string): string {
  const cx = 100;
  const cy = 100;
  const r = 74;
  const known = pct !== null && Number.isFinite(pct);
  const clamped = known ? Math.max(0, Math.min(100, pct)) : 0;
  const end = Math.PI + (clamped / 100) * Math.PI;
  const track = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const value = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)}`;
  const color = clamped >= 80 ? COLORS.met : clamped >= 50 ? COLORS.near : COLORS.below;
  const svg = `<svg class="pa-svg" viewBox="0 0 200 130" width="220" role="img" aria-label="${escapeHtml(title)}">
    <path d="${track}" fill="none" stroke="#eef2f2" stroke-width="16" stroke-linecap="round"/>
    ${known ? `<path d="${value}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/>` : ''}
    <text x="${cx}" y="${cy - 6}" font-size="26" font-weight="700" text-anchor="middle" fill="${COLORS.tealDark}">${known ? `${Math.round(clamped)}%` : '—'}</text>
    <text x="${cx}" y="${cy + 14}" font-size="9" text-anchor="middle" fill="${COLORS.muted}">${escapeHtml(centerLabel)}</text>
  </svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Line (trend + target) ─────────────────────────── */
export interface LinePoint { label: string; value: number | null; }

export function renderLineChart(chartId: string, title: string, caption: string, points: readonly LinePoint[], target: number | null, unit = ''): string {
  const w = 560;
  const h = 200;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const known = points.map((p) => p.value).filter((v): v is number => v !== null && Number.isFinite(v));
  const withTarget = target !== null && Number.isFinite(target) ? [...known, target] : known;
  const max = withTarget.length ? Math.max(...withTarget) * 1.15 : 1;
  const min = 0;
  const span = max - min || 1;
  const xFor = (i: number) => padL + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (w - padL - padR));
  const yFor = (v: number) => (h - padB) - ((v - min) / span) * (h - padT - padB);
  const segs: string[] = [];
  let prevKnown: { x: number; y: number } | null = null;
  const dots: string[] = [];
  points.forEach((p, i) => {
    const x = xFor(i);
    if (p.value !== null && Number.isFinite(p.value)) {
      const y = yFor(p.value);
      if (prevKnown) segs.push(`<line x1="${prevKnown.x}" y1="${prevKnown.y}" x2="${x}" y2="${y}" stroke="${COLORS.teal}" stroke-width="2"/>`);
      dots.push(`<circle cx="${x}" cy="${y}" r="3.2" fill="${COLORS.teal}"/><text x="${x}" y="${y - 7}" font-size="8.5" text-anchor="middle" fill="${COLORS.muted}">${escapeHtml(fmt(p.value, unit))}</text>`);
      prevKnown = { x, y };
    } else {
      dots.push(`<circle cx="${x}" cy="${h - padB}" r="3" fill="none" stroke="${COLORS.unknown}" stroke-dasharray="2 2"/>`);
      prevKnown = null;
    }
  });
  const xLabels = points.map((p, i) => `<text x="${xFor(i)}" y="${h - padB + 14}" font-size="8" text-anchor="middle" fill="${COLORS.muted}">${escapeHtml(truncate(p.label, 10))}</text>`).join('');
  const targetLine = (target !== null && Number.isFinite(target))
    ? `<line x1="${padL}" y1="${yFor(target)}" x2="${w - padR}" y2="${yFor(target)}" stroke="${COLORS.orange}" stroke-width="1.5" stroke-dasharray="5 3"/><text x="${w - padR}" y="${yFor(target) - 4}" font-size="8" text-anchor="end" fill="${COLORS.orange}">target ${escapeHtml(fmt(target, unit))}</text>`
    : '';
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">
    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="${COLORS.grid}"/>
    <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="${COLORS.grid}"/>
    ${targetLine}${segs.join('')}${dots.join('')}${xLabels}
  </svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Funnel (triggers → outcomes) ─────────────────────────── */
export interface FunnelStage { label: string; value: number; }

export function renderFunnel(chartId: string, title: string, caption: string, stages: readonly FunnelStage[]): string {
  const w = 460;
  const stageH = 40;
  const gap = 6;
  const h = stages.length * (stageH + gap) + 6;
  const max = Math.max(1, ...stages.map((s) => s.value));
  const palette = [COLORS.teal, '#1f8f8c', '#3aa39d', '#e29a5a', COLORS.orange];
  const body = stages.map((s, i) => {
    const bw = Math.max(60, (s.value / max) * w);
    const x = (w - bw) / 2;
    const y = i * (stageH + gap) + 3;
    return `<g>
      <rect x="${x}" y="${y}" width="${bw}" height="${stageH}" rx="3" fill="${palette[i % palette.length]}"/>
      <text x="${w / 2}" y="${y + 17}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${escapeHtml(truncate(s.label, 40))}</text>
      <text x="${w / 2}" y="${y + 32}" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">${fmt(s.value)}</text>
    </g>`;
  }).join('');
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">${body}</svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Dot matrix (present of total) ─────────────────────────── */
export function renderDotMatrix(chartId: string, title: string, caption: string, present: number | null, total: number | null, label: string): string {
  const t = total !== null && Number.isFinite(total) ? Math.max(0, Math.round(total)) : 0;
  const p = present !== null && Number.isFinite(present) ? Math.max(0, Math.round(present)) : 0;
  const perRow = 10;
  const cell = 22;
  const rows = Math.max(1, Math.ceil(t / perRow));
  const w = Math.min(perRow, Math.max(1, t)) * cell + 4;
  const h = rows * cell + 26;
  const dots = t > 0 ? Array.from({ length: t }, (_, i) => {
    const x = (i % perRow) * cell + 10;
    const y = Math.floor(i / perRow) * cell + 10;
    const filled = i < p;
    return `<circle cx="${x}" cy="${y}" r="7" fill="${filled ? COLORS.teal : '#fff'}" stroke="${filled ? COLORS.teal : COLORS.unknown}" stroke-width="1.5"/>`;
  }).join('') : `<text x="10" y="20" font-size="10" fill="${COLORS.muted}">UNKNOWN — not recovered</text>`;
  const svg = `<svg class="pa-svg" viewBox="0 0 ${Math.max(w, 120)} ${h}" width="${Math.max(w, 120)}" role="img" aria-label="${escapeHtml(title)}">${dots}<text x="4" y="${h - 6}" font-size="10" font-weight="700" fill="${COLORS.tealDark}">${t > 0 ? `${p} of ${t} ${escapeHtml(label)}` : escapeHtml(label)}</text></svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Lollipop (ranked, not a bar) ─────────────────────────── */
export interface LollipopRow { label: string; value: number | null; unit?: string; }

export function renderLollipop(chartId: string, title: string, caption: string, rows: readonly LollipopRow[], unit = ''): string {
  const w = 560;
  const rowH = 26;
  const h = rows.length * rowH + 8;
  const xL = 200;
  const track = w - xL - 60;
  const known = rows.map((r) => r.value).filter((v): v is number => v !== null && Number.isFinite(v));
  const max = known.length ? Math.max(...known) * 1.1 : 1;
  const body = rows.map((r, i) => {
    const y = i * rowH + 16;
    const vKnown = r.value !== null && Number.isFinite(r.value);
    const len = vKnown ? ((r.value as number) / max) * track : 0;
    const stem = vKnown
      ? `<line x1="${xL}" y1="${y}" x2="${xL + len}" y2="${y}" stroke="${COLORS.teal}" stroke-width="2"/><circle cx="${xL + len}" cy="${y}" r="5" fill="${COLORS.orange}"/>`
      : `<line x1="${xL}" y1="${y}" x2="${xL + 30}" y2="${y}" stroke="${COLORS.unknown}" stroke-width="1.4" stroke-dasharray="3 3"/><circle cx="${xL + 30}" cy="${y}" r="4" fill="none" stroke="${COLORS.unknown}"/>`;
    return `<g>
      <text x="8" y="${y + 3}" font-size="9.5" fill="${COLORS.ink}">${escapeHtml(truncate(r.label, 34))}</text>
      ${stem}
      <text x="${vKnown ? xL + len + 10 : xL + 40}" y="${y + 3}" font-size="9" fill="${COLORS.muted}">${escapeHtml(fmt(r.value, r.unit ?? unit))}</text>
    </g>`;
  }).join('');
  const svg = `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)}">${body}</svg>`;
  return figure(chartId, title, svg, caption);
}

/* ─────────────────────────── Stat strip (fallback / headline metrics) ─────────────────────────── */
export interface StatCard { label: string; value: string; sub?: string; tone?: RagStatus; }

export function renderStatStrip(cards: readonly StatCard[]): string {
  const items = cards.map((c) => {
    const color = c.tone ? ragColor(c.tone) : COLORS.teal;
    return `<div class="pa-stat"><div class="pa-stat-v" style="color:${color}">${escapeHtml(c.value)}</div><div class="pa-stat-l">${escapeHtml(c.label)}</div>${c.sub ? `<div class="pa-stat-s">${escapeHtml(c.sub)}</div>` : ''}</div>`;
  }).join('');
  return `<div class="pa-stat-strip">${items}</div>`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
