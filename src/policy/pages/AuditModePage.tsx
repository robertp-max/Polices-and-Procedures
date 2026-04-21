import { useMemo, useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertOctagon, Download, FileJson,
  ChevronRight, ClipboardList, Lock, Scale, Clock, FileSearch,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, DOMAIN_PALETTE, formatEventDate,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useEnforcementBatch } from '@/policy/enforcement/useEnforcement';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { computeRiskScore, summarizeAgencyRisk, type RiskScore } from '@/policy/audit/riskScoring';
import { buildAuditBundle, bundleToMarkdown, downloadBlob } from '@/policy/audit/exportReport';
import { BlockerPanel } from '@/policy/components/regulatory/BlockerPanel';
import type { EnforcementRiskLevel } from '@/policy/enforcement/types';

/* ═══════════════════════════════════════════════════════════════
   Audit Mode — Surveyor View
   ----------------------------------------------------------------
   Read-only by design. Optimized for a surveyor who needs to:
     - see agency risk at a glance
     - spot immediate jeopardy
     - drill into any single event's enforcement, timeline, and
       audit trail
     - export a packet
   ═══════════════════════════════════════════════════════════════ */

const RISK_BAND_STYLE: Record<EnforcementRiskLevel, { label: string; color: string; bg: string; border: string }> = {
  'immediate-jeopardy': { label: 'IMMEDIATE JEOPARDY', color: '#FCA5A5', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.55)' },
  'high':               { label: 'HIGH',               color: '#F87171', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  'medium':             { label: 'MEDIUM',             color: '#FCD34D', bg: 'rgba(255,193,7,0.12)', border: 'rgba(255,193,7,0.35)' },
  'low':                { label: 'LOW',                color: '#34D399', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)' },
};

type Filter = 'all' | 'immediate-jeopardy' | 'high' | 'overdue' | 'missing-evidence' | 'approval-gap' | 'locked';

export function AuditModePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [activeId, setActiveId] = useState<string | null>(null);

  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const allEvents: RegulatoryEvent[] = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents],
    [generatedEvents, triggeredEvents],
  );

  const batch = useEnforcementBatch(allEvents);
  const risks: Record<string, RiskScore> = useMemo(() => {
    const out: Record<string, RiskScore> = {};
    for (const ev of allEvents) {
      const r = batch.byEventId[ev.id];
      if (r) out[ev.id] = computeRiskScore(ev, r);
    }
    return out;
  }, [allEvents, batch]);

  const summary = useMemo(() => summarizeAgencyRisk(Object.values(risks)), [risks]);

  const auditLog = useEnforcementStore(s => s.auditLog);

  /* ── Filtered roll ── */
  const filtered = useMemo(() => {
    return allEvents.filter(ev => {
      const report = batch.byEventId[ev.id]; if (!report) return false;
      const risk = risks[ev.id]; if (!risk) return false;
      switch (filter) {
        case 'all': return true;
        case 'immediate-jeopardy': return risk.band === 'immediate-jeopardy';
        case 'high': return risk.band === 'high' || risk.band === 'immediate-jeopardy';
        case 'overdue': return report.timelineIssues.some(t => t.kind === 'overdue');
        case 'missing-evidence': return report.blockers.some(b => b.kind === 'form' || b.kind === 'evidence');
        case 'approval-gap': return report.approvalGaps.length > 0;
        case 'locked': return report.isLocked;
      }
    }).sort((a, b) => {
      const ra = risks[a.id]?.score ?? 0;
      const rb = risks[b.id]?.score ?? 0;
      return rb - ra;
    });
  }, [allEvents, batch, risks, filter]);

  const activeEvent = activeId ? allEvents.find(e => e.id === activeId) : (filtered[0] ?? null);

  /* ── Export ── */
  const handleExport = (fmt: 'json' | 'md') => {
    const bundle = buildAuditBundle({
      summary,
      events: allEvents,
      reports: batch.byEventId,
      risks,
      logsByEvent: Object.fromEntries(allEvents.map(e => [e.id, auditLog.filter(l => l.eventId === e.id)])),
    });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (fmt === 'json') {
      downloadBlob(`audit-packet-${stamp}.json`, JSON.stringify(bundle, null, 2), 'application/json');
    } else {
      downloadBlob(`audit-packet-${stamp}.md`, bundleToMarkdown(bundle), 'text/markdown');
    }
  };

  return (
    <div className="min-h-screen w-full text-white bg-[#0B0B14]">
      {/* ─── Top bar ────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
        style={{ background: 'rgba(11,11,20,0.95)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.30)' }}>
            <Scale size={17} className="text-[#C4B5FD]" />
          </div>
          <div>
            <h1 className="text-[16px] font-outfit font-bold tracking-tight">Audit Mode</h1>
            <p className="text-[10px] font-roboto text-white/50 mt-0.5">
              Surveyor view · read-only · cryptographic audit trail · CMS survey-ready export
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('md')}
            className="flex items-center gap-1.5 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 hover:bg-[#FFC107]/15 px-2.5 py-1 text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em]"
          >
            <Download size={11} /> Export Packet
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.03] hover:bg-white/[0.07] px-2.5 py-1 text-[10px] font-montserrat font-bold text-white/80 uppercase tracking-[0.14em]"
          >
            <FileJson size={11} /> Export JSON
          </button>
        </div>
      </div>

      {/* ─── Agency summary row ─────────────────────── */}
      <div className="px-6 py-4 grid grid-cols-12 gap-3">
        <AgencyRiskCard band={summary.overall} score={summary.score} />
        <KPIStat label="Immediate Jeopardy" value={summary.counts['immediate-jeopardy']} tone="red" icon={<AlertOctagon size={14} />} onClick={() => setFilter('immediate-jeopardy')} />
        <KPIStat label="High Risk"           value={summary.counts.high}                tone="red"    icon={<ShieldAlert size={14} />} onClick={() => setFilter('high')} />
        <KPIStat label="Medium"              value={summary.counts.medium}              tone="amber"  icon={<Clock size={14} />} />
        <KPIStat label="Low / Stable"        value={summary.counts.low}                 tone="green"  icon={<ShieldCheck size={14} />} />
        <TopDriversCard drivers={summary.topDrivers} />
      </div>

      {/* ─── Filters ─────────────────────────────── */}
      <div className="px-6 pb-3 flex flex-wrap items-center gap-2">
        {(['all', 'immediate-jeopardy', 'high', 'overdue', 'missing-evidence', 'approval-gap', 'locked'] as Filter[]).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className="rounded-md border px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] transition"
            style={{
              background: filter === f ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: filter === f ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)',
              color: filter === f ? '#DDD6FE' : 'rgba(255,255,255,0.7)',
            }}
          >
            {f.replace(/-/g, ' ')}
            <span className="ml-1.5 text-white/40">({
              f === 'all' ? allEvents.length
              : f === 'immediate-jeopardy' ? summary.counts['immediate-jeopardy']
              : f === 'high' ? summary.counts['high'] + summary.counts['immediate-jeopardy']
              : f === 'overdue' ? Object.values(batch.byEventId).filter(r => r.timelineIssues.some(t => t.kind === 'overdue')).length
              : f === 'missing-evidence' ? Object.values(batch.byEventId).filter(r => r.blockers.some(b => b.kind === 'form' || b.kind === 'evidence')).length
              : f === 'approval-gap' ? Object.values(batch.byEventId).filter(r => r.approvalGaps.length > 0).length
              : Object.values(batch.byEventId).filter(r => r.isLocked).length
            })</span>
          </button>
        ))}
      </div>

      {/* ─── Main grid: event list + drill-down ── */}
      <div className="px-6 pb-6 grid grid-cols-12 gap-4">
        <section className="col-span-5">
          <div className="rounded-lg border overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="px-3 py-2 border-b text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em]"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              Events — sorted by risk ({filtered.length})
            </div>
            <ul className="max-h-[75vh] overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-8 text-center text-[11px] text-white/40 font-roboto">
                  No events match this filter.
                </li>
              )}
              {filtered.map(ev => {
                const risk = risks[ev.id];
                const report = batch.byEventId[ev.id];
                return (
                  <li key={ev.id}>
                    <button
                      onClick={() => setActiveId(ev.id)}
                      className="w-full text-left px-3 py-2 border-b flex items-start gap-3 transition"
                      style={{
                        borderColor: 'rgba(255,255,255,0.05)',
                        background: activeId === ev.id ? 'rgba(167,139,250,0.08)' : 'transparent',
                      }}
                    >
                      <RiskDot band={risk?.band ?? 'low'} score={risk?.score ?? 0} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[9px] font-montserrat font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                            style={{ color: DOMAIN_PALETTE[ev.domain].color, background: DOMAIN_PALETTE[ev.domain].soft, border: `1px solid ${DOMAIN_PALETTE[ev.domain].border}` }}
                          >
                            {DOMAIN_PALETTE[ev.domain].label}
                          </span>
                          {report?.isLocked && <Lock size={10} className="text-[#C4B5FD]" />}
                        </div>
                        <div className="text-[11.5px] font-roboto font-semibold text-white/90 truncate">
                          {ev.title}
                        </div>
                        <div className="text-[9.5px] font-roboto text-white/45 mt-0.5 flex items-center gap-2">
                          <CalendarIcon size={10} /> {formatEventDate(ev.date)}
                          <span>·</span>
                          <span>{ev.owner}</span>
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-white/30 mt-1.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="col-span-7">
          {activeEvent ? (
            <EventDrillDown
              event={activeEvent}
              report={batch.byEventId[activeEvent.id]}
              risk={risks[activeEvent.id]}
              auditLog={auditLog.filter(l => l.eventId === activeEvent.id)}
            />
          ) : (
            <div className="rounded-lg border p-8 text-center text-white/40 text-[11px] font-roboto"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
              Select an event to inspect.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ═══════════════ Sub-components ═══════════════ */

function AgencyRiskCard({ band, score }: { band: EnforcementRiskLevel; score: number }) {
  const s = RISK_BAND_STYLE[band];
  return (
    <div
      className="col-span-4 rounded-lg border p-3 flex items-center gap-3"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${s.border}` }}>
        <Scale size={18} style={{ color: s.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: s.color }}>
          Agency Risk
        </div>
        <div className="text-[18px] font-outfit font-bold">{s.label}</div>
        <div className="text-[11px] font-roboto text-white/60 mt-0.5">
          Weighted score: <span className="font-semibold text-white">{score}/100</span>
        </div>
      </div>
    </div>
  );
}

function KPIStat({ label, value, tone, icon, onClick }: {
  label: string; value: number; tone: 'red' | 'amber' | 'green'; icon: React.ReactNode; onClick?: () => void;
}) {
  const palette = {
    red:   { color: '#F87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    amber: { color: '#FCD34D', bg: 'rgba(255,193,7,0.08)', border: 'rgba(255,193,7,0.25)' },
    green: { color: '#34D399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  }[tone];
  return (
    <button
      onClick={onClick}
      className="col-span-2 rounded-lg border p-3 text-left transition hover:brightness-110 disabled:cursor-default"
      style={{ background: palette.bg, borderColor: palette.border }}
    >
      <div className="flex items-center gap-1.5 mb-0.5" style={{ color: palette.color }}>
        {icon}
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-[22px] font-outfit font-bold text-white">{value}</div>
    </button>
  );
}

function TopDriversCard({ drivers }: { drivers: Array<{ label: string; count: number }> }) {
  return (
    <div className="col-span-2 rounded-lg border p-3"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-1.5 mb-1 text-white/60">
        <FileSearch size={12} />
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">Top Drivers</span>
      </div>
      {drivers.length === 0 ? (
        <div className="text-[10px] text-white/40 font-roboto">(none)</div>
      ) : (
        <ul className="space-y-0.5">
          {drivers.map(d => (
            <li key={d.label} className="flex items-start gap-2 text-[9.5px] font-roboto">
              <span className="w-3 text-right text-white/50">{d.count}</span>
              <span className="flex-1 text-white/75">{d.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RiskDot({ band, score }: { band: EnforcementRiskLevel; score: number }) {
  const s = RISK_BAND_STYLE[band];
  return (
    <div className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center mt-0.5"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="text-[10px] font-montserrat font-bold" style={{ color: s.color }}>{score}</span>
    </div>
  );
}

/* ─── Event drill-down ────────────────────────────── */

function EventDrillDown({ event, report, risk, auditLog }: {
  event: RegulatoryEvent;
  report?: ReturnType<typeof useEnforcementBatch>['byEventId'][string];
  risk?: RiskScore;
  auditLog: ReturnType<typeof useEnforcementStore.getState>['auditLog'];
}) {
  const dom = DOMAIN_PALETTE[event.domain];

  if (!report || !risk) {
    return <div className="rounded-lg border p-6 text-center text-white/40"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
      Enforcement data unavailable for this event.
    </div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="rounded-lg border p-3"
        style={{ background: dom.soft, borderColor: dom.border }}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${dom.border}` }}>
            <ClipboardList size={18} style={{ color: dom.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: dom.color }}>
                {dom.label}{event.category ? ` · ${event.category}` : ''}
              </span>
              {report.isLocked && (
                <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded flex items-center gap-1"
                  style={{ background: 'rgba(167,139,250,0.14)', color: '#C4B5FD' }}>
                  <Lock size={9} /> LOCKED
                </span>
              )}
            </div>
            <h2 className="text-[14px] font-outfit font-bold">{event.title}</h2>
            <div className="text-[10px] font-roboto text-white/60 mt-1 flex items-center gap-3 flex-wrap">
              <span>{formatEventDate(event.date)}</span>
              <span>·</span>
              <span>{event.owner} ({event.ownerRole})</span>
              {event.regulatoryDriver && (<><span>·</span><span>{event.regulatoryDriver}</span></>)}
              {event.complianceFlags?.citation && (<><span>·</span><span className="text-[#C4B5FD]">{event.complianceFlags.citation}</span></>)}
            </div>
          </div>
        </div>
      </div>

      {/* Risk breakdown */}
      <div className="rounded-lg border p-3"
        style={{ background: RISK_BAND_STYLE[risk.band].bg, borderColor: RISK_BAND_STYLE[risk.band].border }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]"
            style={{ color: RISK_BAND_STYLE[risk.band].color }}>
            Risk {RISK_BAND_STYLE[risk.band].label} · Score {risk.score}/100
          </span>
        </div>
        <p className="text-[11px] font-roboto text-white/80 mb-2">{risk.rationale}</p>
        <ul className="space-y-0.5">
          {risk.drivers.map(d => (
            <li key={d.id} className="flex items-start gap-2 text-[10px] font-roboto">
              <span className="w-7 text-right font-semibold" style={{ color: d.weight < 0 ? '#34D399' : '#F87171' }}>
                {d.weight > 0 ? '+' : ''}{d.weight}
              </span>
              <span className="text-white/75 flex-1">{d.label}{d.detail ? <span className="text-white/45"> · {d.detail}</span> : null}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Blocker panel (reuses enforcement UI) */}
      <div className="rounded-lg border p-3"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-2">
          Enforcement Report
        </div>
        <BlockerPanel report={report} />
      </div>

      {/* Evidence / workflow quick views */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-2">
            Workflow
          </div>
          <ul className="space-y-1">
            {event.processFlow.map(s => (
              <li key={s.id} className="text-[10px] font-roboto flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: s.status === 'complete' ? '#10B981' : s.status === 'in-progress' ? '#FBBF24' : 'rgba(255,255,255,0.25)' }} />
                <span className="flex-1 text-white/75">
                  {s.label}
                  <span className="text-white/40"> · due {s.dueOffsetDays >= 0 ? '+' : ''}{s.dueOffsetDays}d</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-3"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-2">
            Required Forms
          </div>
          <ul className="space-y-1">
            {event.requiredForms.map(f => (
              <li key={f.id} className="text-[10px] font-roboto flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: f.status === 'complete' ? '#10B981' : f.status === 'pending' ? 'rgba(255,255,255,0.25)' : '#EF4444' }} />
                <span className="flex-1 text-white/75">
                  {f.label}
                  {f.formId && <span className="text-white/40"> · {f.formId}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Audit trail */}
      <div className="rounded-lg border p-3"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-2">
          Audit Trail — {auditLog.length} entr{auditLog.length === 1 ? 'y' : 'ies'}
        </div>
        {auditLog.length === 0 ? (
          <div className="text-[10px] font-roboto text-white/40">No logged activity on this event yet.</div>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {auditLog.slice(0, 50).map(a => (
              <li key={a.id} className="grid grid-cols-[110px_1fr] gap-2 text-[10px] font-roboto">
                <span className="text-white/45">{new Date(a.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <div className="min-w-0">
                  <div className="text-white/80">
                    <span className="font-semibold">{a.action}</span>
                    {a.targetKind && <span className="text-white/50"> · {a.targetKind}{a.targetId ? `:${a.targetId}` : ''}</span>}
                  </div>
                  <div className="text-white/45">
                    {a.actor}{a.actorRole ? ` (${a.actorRole})` : ''}
                    {a.reason && <span className="text-white/60"> · {a.reason}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
