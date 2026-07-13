/**
 * Part A — Executive Narrative (universal, all archetypes).
 *
 * A render-time front matter that leads every packet: a story-driven executive
 * briefing synthesized ENTIRELY from the finished packet model (Part B). It is
 * extractive, never generative-of-fact — every number and chart datapoint comes
 * from values already in the model; UNKNOWN stays UNKNOWN (narrated, not filled).
 *
 * Works for any archetype: analytical packets (with a KPI dashboard) get the full
 * scorecard + domain charts; non-analytical packets degrade to a module-status
 * overview + decisions + how-to-read. Charts render only when their data exists.
 */
import type { PacketModel, PacketRenderingProfile } from '@/policy/packets/contracts';
import type { KpiDashboardCard, KpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import type { KpiSupplementalChartData } from '@/policy/packets/render/charts/kpiDashboardCharts';

import { escapeHtml, renderNarrativePage } from '../chrome';
import {
  renderBulletChart,
  renderDonut,
  renderFunnel,
  renderGauge,
  renderLineChart,
  renderLollipop,
  renderRagHeatmap,
  renderSlopeChart,
  renderStatStrip,
  type BulletRow,
  type HeatCell,
  type LollipopRow,
  type RagStatus,
  type SlopeSeries,
} from './svgCharts';
import {
  resolveKpiDashboardModel,
  resolveSupplementalCharts,
} from '../modules/kpiDashboard';

const UNKNOWN = 'UNKNOWN — NOT RECOVERED';

interface PartAContext {
  model: PacketModel;
  profile: PacketRenderingProfile;
  dashboard: KpiDashboardModel | null;
  supplemental: readonly KpiSupplementalChartData[];
}

/** Public entry — returns the concatenated Part A page sections + Part B divider. */
export function renderPartAPages(model: PacketModel, profile: PacketRenderingProfile): string {
  const kpiModule = model.modules.find((m) => resolveKpiDashboardModel(m.payload) !== null);
  const ctx: PartAContext = {
    model,
    profile,
    dashboard: kpiModule ? resolveKpiDashboardModel(kpiModule.payload) : null,
    supplemental: kpiModule ? resolveSupplementalCharts(kpiModule.payload) : [],
  };

  const pages: string[] = [];
  let n = 1;
  const total = ctx.dashboard ? 5 : 3;
  const page = (title: string, body: string, opts: { isCover?: boolean; eyebrow?: string } = {}) =>
    renderNarrativePage({ model, profile, title, eyebrow: opts.eyebrow, isCover: opts.isCover, bodyHtml: body, pageNumber: n++, totalPages: total });

  pages.push(page(coverTitle(model), coverBody(ctx), { isCover: true, eyebrow: 'Care Indeed Home Health Care, Inc.' }));
  pages.push(page('Quarter at a Glance', glanceBody(ctx)));
  if (ctx.dashboard) {
    pages.push(page('Performance vs Targets', performanceBody(ctx)));
    pages.push(page('Domain Analysis', domainBody(ctx)));
  }
  pages.push(page('Decisions & Data Confidence', decisionsBody(ctx)));
  pages.push(dividerPage(ctx, n++, total));
  return pages.join('\n');
}

/* ─────────────────────────── scorecard synthesis ─────────────────────────── */
interface Scored { card: KpiDashboardCard; status: RagStatus; value: number | null; }

function scoreCards(dashboard: KpiDashboardModel | null): Scored[] {
  if (!dashboard) return [];
  return dashboard.cards.map((card) => ({ card, status: ragOf(card), value: card.currentValue.value }));
}

function ragOf(card: KpiDashboardCard): RagStatus {
  if (card.currentValue.value === null || /unknown|not recovered/i.test(card.validationStatus)) return 'unknown';
  const s = String(card.status).toLowerCase();
  if (/(^|_)met|pass|exceed|on[-_ ]?track|within/.test(s) && !/not/.test(s)) return 'met';
  if (/not[_ ]?met|below|missed|fail|breach|off[-_ ]?track/.test(s)) return 'below';
  if (/approach|near|watch|warn|caution|trending/.test(s)) return 'near';
  return 'near';
}

function counts(scored: readonly Scored[]) {
  return {
    total: scored.length,
    met: scored.filter((s) => s.status === 'met').length,
    near: scored.filter((s) => s.status === 'near').length,
    below: scored.filter((s) => s.status === 'below').length,
    unknown: scored.filter((s) => s.status === 'unknown').length,
    recovered: scored.filter((s) => s.value !== null).length,
  };
}

/* ─────────────────────────── cover page ─────────────────────────── */
function coverTitle(model: PacketModel): string {
  return `${humanize(model.identity.archetypeId)} Packet`;
}

function coverBody(ctx: PartAContext): string {
  const period = periodLabel(ctx.model);
  const scored = scoreCards(ctx.dashboard);
  const c = counts(scored);
  const stats = ctx.dashboard
    ? renderStatStrip([
      { label: 'Indicators met / exceeded', value: `${c.met}/${c.total}`, tone: 'met' },
      { label: 'Near goal', value: String(c.near), tone: 'near' },
      { label: 'Below target', value: String(c.below), tone: c.below > 0 ? 'below' : 'met' },
      { label: 'Unverified this cycle', value: String(c.unknown), tone: c.unknown > 0 ? 'unknown' : 'met', sub: c.unknown > 0 ? 'flagged for source follow-up' : 'full recovery' },
    ])
    : renderStatStrip(moduleStatStrip(ctx.model));
  return `
    <p class="pa-sub">${escapeHtml(period)} · Part A · Executive Briefing &nbsp;|&nbsp; Part B · Evidence Appendices</p>
    ${verdictBlock(ctx, c)}
    ${stats}
    <p class="pa-attribution">Narrative synthesized from Part B evidence — every figure and chart is extractive and traceable to a labeled appendix section; no values were generated. UNKNOWN indicators are shown honestly and never treated as zero.</p>
  `;
}

function verdictBlock(ctx: PartAContext, c: ReturnType<typeof counts>): string {
  const period = periodLabel(ctx.model);
  const mover = biggestMover(ctx.dashboard);
  if (!ctx.dashboard) {
    const modules = ctx.model.modules.filter((m) => m.status !== 'not_applicable');
    const complete = modules.filter((m) => m.status === 'complete').length;
    return `<div class="pa-verdict"><p>This ${escapeHtml(humanize(ctx.model.identity.archetypeId))} packet for ${escapeHtml(period)} assembles ${modules.length} sections (${complete} complete). The evidence appendices (Part B) carry the authoritative record; the Committee is asked to review and act on the decisions summarized herein.</p></div>`;
  }
  const moverText = mover
    ? ` Largest movement: ${escapeHtml(mover.label)} (${escapeHtml(mover.prior)} → ${escapeHtml(mover.current)}).`
    : '';
  const unknownText = c.unknown > 0
    ? ` ${c.unknown} indicator(s) were not recovered from this cycle's source and are flagged for follow-up — not treated as zero.`
    : ' All indicators were recovered from source.';
  return `<div class="pa-verdict"><p>For ${escapeHtml(period)}, ${c.met} of ${c.total} quality indicators met or exceeded target, ${c.near} are near goal, and ${c.below} are below target.${moverText}${unknownText} The Governing Body is asked to ratify this report and act on the decisions in the "Decisions" section; every figure traces to the Part B appendices.</p></div>`;
}

/* ─────────────────────────── at a glance ─────────────────────────── */
function glanceBody(ctx: PartAContext): string {
  if (ctx.dashboard) {
    const scored = scoreCards(ctx.dashboard);
    const cells: HeatCell[] = scored.map((s) => ({
      label: shortLabel(s.card.title),
      status: s.status,
      valueText: s.card.currentValue.value === null ? 'UNKNOWN' : s.card.currentValue.display,
    }));
    const slope = slopeSeries(ctx.dashboard);
    const heatmap = renderRagHeatmap('pa-scorecard', 'Indicator scorecard', 'Every KPI at a glance — status by color, exact value labeled. Source: Appendix — KPI Dashboard.', cells);
    const slopeChart = slope.length > 0
      ? renderSlopeChart('pa-slope', 'Prior → current movement', 'Direction of change vs the prior period, for indicators with a recovered prior. Source: Appendix — KPI Dashboard (Prior vs Current).', slope)
      : `<p class="pa-domain"><em>No comparable prior period was recovered this cycle, so quarter-over-quarter movement is not shown.</em></p>`;
    return `${heatmap}${slopeChart}`;
  }
  const cells: HeatCell[] = ctx.model.modules
    .filter((m) => m.status !== 'not_applicable')
    .map((m) => ({ label: shortLabel(m.title), status: moduleStatus(m.status), valueText: humanize(m.status) }));
  return renderRagHeatmap('pa-modules', 'Packet section status', 'Completion status of each packet section. Source: Part B appendices.', cells);
}

/* ─────────────────────────── performance vs targets ─────────────────────────── */
function performanceBody(ctx: PartAContext): string {
  const dashboard = ctx.dashboard!;
  const scored = scoreCards(dashboard);
  const c = counts(scored);
  const bulletRows: BulletRow[] = scored
    .filter((s) => s.card.target.value !== null)
    .slice(0, 10)
    .map((s) => ({
      label: shortLabel(s.card.title),
      value: s.value,
      target: s.card.target.value,
      unit: unitText(s.card.currentValue.unit),
      status: s.status,
    }));
  const bullet = bulletRows.length > 0
    ? renderBulletChart('pa-bullet', 'Indicators vs target', 'Bar = current value, orange tick = target. Hatched = unverified. Source: Appendix — KPI Dashboard.', bulletRows)
    : '';
  const pct = c.total > 0 ? Math.round((c.recovered / c.total) * 100) : null;
  const gauge = renderGauge('pa-coverage', 'Evidence coverage', 'Share of indicators recovered from this cycle\'s source. Source: derived from Part B validation flags.', pct, `${c.recovered} of ${c.total} recovered`);
  return `<div class="pa-split"><div>${bullet}</div><div>${gauge}</div></div>`;
}

/* ─────────────────────────── domain analysis (varied charts) ─────────────────────────── */
function domainBody(ctx: PartAContext): string {
  const blocks: string[] = [];
  const adverse = findChart(ctx.supplemental, 'adverse-events-by-category');
  if (adverse && hasAnyValue(adverse)) {
    blocks.push(domain('Adverse Events', 'Incident mix for the period; open RCAs are noted in the appendix. Triggers indicate review thresholds, not conclusions.',
      renderDonut('pa-adverse', 'Adverse events by category', `${adverse.caption} Source: Appendix — Findings / Incident Log.`, adverse.sourceData.map((r) => ({ label: r.label, value: r.value })), adverse.valueLabel)));
  }
  const infection = findChart(ctx.supplemental, 'infection-trends-classification');
  if (infection && hasAnyValue(infection)) {
    const points = infection.sourceData.map((r) => ({ label: shortLabel(r.label), value: r.value }));
    blocks.push(domain('Infection Control', 'Infection classification counts for the period. Values are recovered from the infection log; unverified categories are shown as gaps.',
      renderLineChart('pa-infection', 'Infection classification', `${infection.caption} Source: Appendix — Infection Log.`, points, null, '')));
  }
  const docs = findChart(ctx.supplemental, 'documentation-deficiencies-by-type');
  if (docs && hasAnyValue(docs)) {
    const rows: LollipopRow[] = docs.sourceData.map((r) => ({ label: shortLabel(r.label), value: r.value }));
    blocks.push(domain('Documentation & Chart Audit', 'Documentation deficiencies by type from the chart audit. Higher counts flag review priorities.',
      renderLollipop('pa-docs', 'Documentation deficiencies by type', `${docs.caption} Source: Appendix — Chart Audit.`, rows)));
  }
  const pip = findChart(ctx.supplemental, 'pip-cap-status-by-stage');
  if (pip && hasAnyValue(pip)) {
    const stages = pip.sourceData
      .filter((r) => r.value !== null && Number.isFinite(r.value))
      .map((r) => ({ label: shortLabel(r.label), value: r.value as number }));
    if (stages.length > 0) {
      blocks.push(domain('Workflow Triggers & PIP/CAPA', 'Trigger pipeline by decision state. Triggers are review thresholds — they are NOT determinations, discipline, or conclusions.',
        renderFunnel('pa-pip', 'Trigger / PIP pipeline by stage', `${pip.caption} Source: Appendix — Trigger Register.`, stages)));
    }
  }
  if (blocks.length === 0) {
    return `<p class="pa-domain"><em>Domain-level detail was not recovered from this cycle's source. See Part B appendices for the full evidence record.</em></p>`;
  }
  return blocks.join('\n');
}

function domain(title: string, prose: string, chart: string): string {
  return `<div class="pa-domain"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(prose)}</p>${chart}</div>`;
}

/* ─────────────────────────── decisions + data confidence ─────────────────────────── */
function decisionsBody(ctx: PartAContext): string {
  const period = periodLabel(ctx.model);
  const scored = scoreCards(ctx.dashboard);
  const c = counts(scored);
  const items: string[] = [];
  items.push(`<li><b>Ratify the ${escapeHtml(period)} ${escapeHtml(humanize(ctx.model.identity.archetypeId))} report.</b> Basis: ${ctx.dashboard ? `${c.met}/${c.total} indicators met, ${c.below} below target` : `${ctx.model.modules.filter((m) => m.status !== 'not_applicable').length} sections assembled`} (see Part B). Action: QAPI Committee / Governing Body.</li>`);
  if (ctx.dashboard && c.below > 0) {
    const belowNames = scored.filter((s) => s.status === 'below').slice(0, 4).map((s) => shortLabel(s.card.title)).join(', ');
    items.push(`<li><b>Address below-target indicators.</b> ${escapeHtml(belowNames)}${c.below > 4 ? ', …' : ''} — review corrective actions in Appendix — Findings & Determinations. Action: DON / QAPI Chair.</li>`);
  }
  const hasTriggers = ctx.supplemental.some((s) => s.kind === 'pip-cap-status-by-stage' && hasAnyValue(s));
  if (hasTriggers) {
    items.push(`<li><b>Review workflow triggers.</b> Triggers are review thresholds, not determinations — see Appendix — Trigger Register before any action. Action: QAPI Committee.</li>`);
  }
  if (ctx.dashboard && c.unknown > 0) {
    items.push(`<li><b>Approve source follow-up for unverified indicators.</b> ${c.unknown} indicator(s) not recovered this cycle. Action: QA Coordinator to reconcile source for next period.</li>`);
  }

  const pct = c.total > 0 ? Math.round((c.recovered / c.total) * 100) : null;
  const gauge = ctx.dashboard
    ? renderGauge('pa-coverage2', 'Evidence coverage this cycle', 'Recovered vs unverified indicators. Unverified are flagged, never zero-filled. Source: Part B validation flags.', pct, `${c.recovered} of ${c.total} recovered`)
    : '';
  const unknownNames = scored.filter((s) => s.status === 'unknown').slice(0, 6).map((s) => shortLabel(s.card.title));
  const confidenceProse = ctx.dashboard
    ? (c.unknown > 0
      ? `<p class="pa-domain">${c.unknown} of ${c.total} indicators were not recovered from this cycle's source (${escapeHtml(unknownNames.join(', '))}${c.unknown > unknownNames.length ? ', …' : ''}) and are reported as ${UNKNOWN}. This reflects source completeness for the period, not a performance result; they are flagged for reconciliation next cycle.</p>`
      : `<p class="pa-domain">All ${c.total} indicators were recovered from source this cycle. No values were estimated or imputed.</p>`)
    : `<p class="pa-domain">This packet is assembled from ${ctx.model.modules.filter((m) => m.status !== 'not_applicable').length} evidence sections; see Part B for the authoritative record.</p>`;

  return `
    <div class="pa-domain"><h3>Decisions Requested</h3><ul class="pa-decisions">${items.join('')}</ul></div>
    <div class="pa-domain"><h3>Data Confidence &amp; Gaps</h3>${confidenceProse}${gauge}</div>
    <div class="pa-domain"><h3>How to Read This Packet</h3><p>Part A summarizes and interprets. <b>Part B — the appendices that follow — is the authoritative evidence record.</b> Every figure and chart above traces to a labeled appendix section.</p></div>
  `;
}

/* ─────────────────────────── Part B divider ─────────────────────────── */
function dividerPage(ctx: PartAContext, pageNumber: number, totalPages: number): string {
  const body = `
    <div class="pa-divider-eyebrow">Part B</div>
    <div class="pa-divider-title">Evidence Appendices</div>
    <p class="pa-divider-sub">The authoritative, survey-defensible record for ${escapeHtml(periodLabel(ctx.model))}: source validation, KPI dashboard, findings, trends, workflow triggers, determinations, decisions, approvals, and attachments. Every figure in Part A traces here.</p>
  `;
  return renderNarrativePage({
    model: ctx.model,
    profile: ctx.profile,
    title: '',
    isCover: false,
    bodyHtml: `<div class="pa-divider">${body}</div>`,
    pageNumber,
    totalPages,
  }).replace('class="pg pg-partA"', 'class="pg pg-partA pa-divider"');
}

/* ─────────────────────────── helpers ─────────────────────────── */
function slopeSeries(dashboard: KpiDashboardModel): SlopeSeries[] {
  return dashboard.cards
    .filter((card) => card.priorValue.value !== null && card.currentValue.value !== null)
    .slice(0, 8)
    .map((card) => ({
      label: shortLabel(card.title),
      prior: card.priorValue.value,
      current: card.currentValue.value,
      unit: unitText(card.currentValue.unit),
    }));
}

function biggestMover(dashboard: KpiDashboardModel | null): { label: string; prior: string; current: string } | null {
  if (!dashboard) return null;
  const movers = dashboard.cards
    .filter((c) => c.priorValue.value !== null && c.currentValue.value !== null)
    .map((c) => ({ card: c, delta: Math.abs((c.currentValue.value as number) - (c.priorValue.value as number)) }))
    .sort((a, b) => b.delta - a.delta);
  const top = movers[0];
  return top ? { label: shortLabel(top.card.title), prior: top.card.priorValue.display, current: top.card.currentValue.display } : null;
}

function moduleStatStrip(model: PacketModel) {
  const modules = model.modules.filter((m) => m.status !== 'not_applicable');
  return [
    { label: 'Sections', value: String(modules.length) },
    { label: 'Complete', value: String(modules.filter((m) => m.status === 'complete').length), tone: 'met' as RagStatus },
    { label: 'In progress', value: String(modules.filter((m) => m.status === 'in_progress').length), tone: 'near' as RagStatus },
    { label: 'Blocked', value: String(modules.filter((m) => m.status === 'blocked').length), tone: 'below' as RagStatus },
  ];
}

function moduleStatus(status: string): RagStatus {
  if (status === 'complete') return 'met';
  if (status === 'in_progress') return 'near';
  if (status === 'blocked' || status === 'stale') return 'below';
  return 'unknown';
}

function findChart(supplemental: readonly KpiSupplementalChartData[], kind: string): KpiSupplementalChartData | undefined {
  return supplemental.find((s) => s.kind === kind);
}

function hasAnyValue(chart: KpiSupplementalChartData): boolean {
  return chart.sourceData.some((r) => r.value !== null && Number.isFinite(r.value));
}

function unitText(unit: unknown): string {
  const u = String(unit ?? '').toLowerCase();
  if (u.includes('percent') || u === '%') return '%';
  if (u.includes('per_100') || u.includes('per 100')) return ' per 100';
  if (u.includes('per_1000') || u.includes('per 1000')) return '/1k';
  if (u.includes('count') || u.includes('number') || u.includes('integer')) return '';
  return '';
}

function periodLabel(model: PacketModel): string {
  const start = model.identity.reportingPeriodStart;
  const end = model.identity.reportingPeriodEnd;
  if (start && end) {
    const q = quarterOf(start);
    return q ? q : `${start} → ${end}`;
  }
  return 'Reporting period';
}

function quarterOf(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return null;
  const year = m[1];
  const month = Number(m[2]);
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `Q${quarter} ${year}`;
}

function humanize(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function shortLabel(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}
