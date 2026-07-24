// Premium, data-driven 2026 Governing Body QAPI packet workspace (§4).
// Renders entirely from the normalized fixture + selectors — no hard-coded
// Q1/Q2/Q3/Q4 constants in JSX. Three-part composition: year/packet navigator
// (left), one focused packet section (center), Board action rail (right), with
// a persistent GB workflow rail and a persistent SYNTHETIC UAT watermark.

import { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, ChevronRight,
  FileWarning, Gavel, Landmark, Lock, ShieldAlert, ShieldCheck,
  TrendingDown, TrendingUp,
} from 'lucide-react';
import { QAPI_2026 } from './data/qapi2026.normalized';
import type { QapiQuarter, QualityMetricSeries, QuarterKey } from './model/qapi2026.types';
import {
  buildGbAnnualArc, buildGbQuarterPacket, type GbDecisionMatter, type GbQuarterPacket,
} from './selectors/qapi2026Selectors';
import AttendanceQuorumPanel from './components/AttendanceQuorumPanel';
import InfectionOversight from './components/InfectionOversight';
import FinanceResourcePanel from './components/FinanceResourcePanel';
import GbDecisionComposer from './components/GbDecisionComposer';

const QUARTERS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];
type PacketKey = QuarterKey | 'annual' | 'directives' | 'dataquality';
type SectionKey =
  | 'brief' | 'signals' | 'attendance' | 'pips' | 'adverse' | 'infection'
  | 'complaints' | 'caps' | 'finance' | 'decisions' | 'signoffs';

const SECTIONS: Array<{ id: SectionKey; label: string }> = [
  { id: 'brief', label: 'Chair brief & control' },
  { id: 'signals', label: 'Quality signals' },
  { id: 'attendance', label: 'Attendance & quorum' },
  { id: 'pips', label: 'PIP lifecycle' },
  { id: 'adverse', label: 'Adverse events & RCA' },
  { id: 'infection', label: 'Infection oversight' },
  { id: 'complaints', label: 'Complaints' },
  { id: 'caps', label: 'CAP & directives' },
  { id: 'finance', label: 'Finance & resources' },
  { id: 'decisions', label: 'Decision docket' },
  { id: 'signoffs', label: 'Sign-offs & minutes' },
];

const WORKFLOW = ['Prepare', 'Read', 'Disclose', 'Convene', 'Deliberate', 'Decide', 'Record', 'Assign', 'Return'];

function SyntheticWatermark() {
  return <div className="q26-synthetic" role="note" aria-label="Synthetic data notice"><ShieldAlert size={13} aria-hidden="true" /> SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION</div>;
}

function MiniTrend({ metric }: { metric: QualityMetricSeries }) {
  const rates = metric.points.map((p) => p.rate);
  const max = Math.max(...rates, 1); const min = Math.min(...rates, 0);
  const coords = rates.map((r, i) => `${(i / Math.max(1, rates.length - 1)) * 100},${28 - ((r - min) / Math.max(1, max - min)) * 24}`).join(' ');
  return <svg className={`q26-spark ${metric.status}`} viewBox="0 0 100 30" role="img" aria-label={`${metric.indicator} trend`}><polyline points={coords} /></svg>;
}

function WorkflowRail({ activeStep }: { activeStep: number }) {
  return (
    <ol className="q26-workflow" aria-label="Governing Body workflow">
      {WORKFLOW.map((step, i) => (
        <li key={step} className={i === activeStep ? 'active' : i < activeStep ? 'done' : ''} aria-current={i === activeStep ? 'step' : undefined}>
          <span>{i + 1}</span>{step}
        </li>
      ))}
    </ol>
  );
}

function YearNavigator({ active, onSelect }: { active: PacketKey; onSelect: (k: PacketKey) => void }) {
  const arc = buildGbAnnualArc();
  return (
    <nav className="q26-nav" aria-label="2026 QAPI packets">
      <button className={active === 'annual' ? 'active' : ''} onClick={() => onSelect('annual')}>
        <span className="q26-nav-kicker">2026</span><strong>Annual Arc</strong>
        <small>{arc.normalizedQuarters.length}/4 quarters normalized</small>
      </button>
      {QUARTERS.map((q) => {
        const packet = buildGbQuarterPacket(q);
        const quarter = packet.quarter;
        return (
          <button key={q} className={active === q ? 'active' : ''} onClick={() => onSelect(q)} disabled={false}>
            <span className="q26-nav-kicker">{q} · {quarter.period.start.slice(5)}–{quarter.period.end.slice(5)}</span>
            <strong>{q} packet {quarter.normalizationStatus === 'pending' && <em className="q26-pending">pending</em>}</strong>
            {quarter.normalizationStatus === 'normalized'
              ? <small>{quarter.meeting?.meetingDate} · {packet.decisionsRequested.length} decisions · {packet.readiness.readyToConvene ? 'ready' : 'hold'}</small>
              : <small>source present · normalization pending</small>}
          </button>
        );
      })}
      <button className={active === 'directives' ? 'active' : ''} onClick={() => onSelect('directives')}><span className="q26-nav-kicker">FOLLOW-UP</span><strong>Open Board directives</strong><small>{arc.carryForwardRisk.length} carry-forward items</small></button>
      <button className={`q26-nav-dq ${active === 'dataquality' ? 'active' : ''}`} onClick={() => onSelect('dataquality')}><span className="q26-nav-kicker">INTEGRITY</span><strong>Data quality</strong><small>{QAPI_2026.validationFindings.length} findings</small></button>
    </nav>
  );
}

function BoardActionRail({ packet, onOpenComposer }: { packet: GbQuarterPacket; onOpenComposer: (matter?: GbDecisionMatter) => void }) {
  const top = packet.decisionsRequested[0];
  const criticalSignals = packet.materialSignals.filter((s) => s.status === 'critical' || s.aggregateMasksSubgroup);
  return (
    <aside className="q26-action-rail" aria-label="Board action">
      <span className="q26-rail-kicker">BOARD ACTION</span>
      <dl>
        <div><dt>What changed</dt><dd>{criticalSignals.length ? `${criticalSignals.length} material quality signal(s) require attention.` : 'No new critical signal this quarter.'}</dd></div>
        <div><dt>Why the Board cares</dt><dd>{top ? top.whyItMatters : 'Oversight duty: ensure QAPI has scope, resources, and evidence of improvement.'}</dd></div>
        <div><dt>Decision requested</dt><dd>{top ? top.decisionRequested : 'Accept the quarter report and monitor.'}</dd></div>
        <div><dt>Evidence missing</dt><dd>{top?.missingEvidence.length ? top.missingEvidence.join('; ') : 'None flagged.'}</dd></div>
        <div><dt>Return to the Board</dt><dd>{packet.openPips[0]?.returnDate ?? 'Next quarterly review'}</dd></div>
      </dl>
      <button className="q26-primary" onClick={() => onOpenComposer(top)}>{top ? 'Open decision composer' : 'Draft a Board decision'} <ArrowRight size={15} /></button>
    </aside>
  );
}

// ---- Packet sections -------------------------------------------------------

function SectionBrief({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.meeting) return <PendingSection quarter={q} />;
  return (
    <div className="q26-section">
      <div className="q26-card-grid">
        <article className="q26-card"><span>REPORTING PERIOD</span><strong>{q.period.start} → {q.period.end}</strong><small>{q.meeting.workflow}</small></article>
        <article className="q26-card"><span>MEETING</span><strong>{q.meeting.meetingDate}</strong><small>Agenda ≥ {q.meeting.agendaDeadline} · packet ≥ {q.meeting.gbPackageDeadline}</small></article>
        <article className="q26-card"><span>CENSUS</span><strong>{q.population?.activeAtStart ?? '—'} → {q.population?.activeAtClose ?? '—'}</strong><small>{q.population?.note}</small></article>
        <article className="q26-card"><span>MINUTES</span><strong>Due {q.meeting.minutesDue}</strong><small>Owner: {q.meeting.minutesOwner}</small></article>
      </div>
      <div className="q26-readiness">
        <h3>Packet readiness</h3>
        <ul>{packet.readiness.gates.map((g) => <li key={g.id} className={g.ok ? 'ok' : 'no'}>{g.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}<div><strong>{g.label}</strong><small>{g.detail}</small></div></li>)}</ul>
        <p className={packet.readiness.readyToConvene ? 'q26-proceed ok' : 'q26-proceed hold'}>{packet.readiness.readyToConvene ? 'Valid to proceed' : 'Hold — resolve the gate(s) above before convening'}</p>
      </div>
    </div>
  );
}

function SectionSignals({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.metrics.length) return <PendingSection quarter={q} />;
  return (
    <div className="q26-section">
      <div className="q26-kpi-grid">
        {q.metrics.map((m) => {
          const last = m.points[m.points.length - 1];
          return (
            <article key={m.metricId} className={`q26-kpi ${m.status}`}>
              <header><span>{m.indicator}</span>{m.aggregateMasksSubgroup && <em className="q26-mask" title="Favorable aggregate masks a worsening subgroup"><AlertTriangle size={12} /> masks subgroup</em>}</header>
              <div className="q26-kpi-main"><strong>{last?.rate}%</strong><MiniTrend metric={m} />{m.direction === 'lower_is_better' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}</div>
              <footer><span>Target {m.target}</span><i className={m.status}>{m.status}{m.pipTrigger ? ' · PIP' : ''}</i></footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SectionPips({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.pips.length) return <PendingSection quarter={q} note="No PIP records normalized for this quarter." />;
  return (
    <div className="q26-section q26-list">
      {q.pips.map((p) => (
        <article key={p.pipId + p.triggerId} className="q26-lifecycle">
          <header><span>{p.pipId}</span><strong>{p.title}</strong>{!p.closureEligible && <i className="q26-hold">Closure not eligible</i>}</header>
          <dl>
            <div><dt>Baseline</dt><dd>{p.baseline}</dd></div>
            <div><dt>Objective</dt><dd>{p.approvedObjective}</dd></div>
            <div><dt>Sustainability criterion</dt><dd>{p.sustainabilityCriterion}</dd></div>
            <div><dt>Current evidence</dt><dd>{p.currentQuarterEvidence}</dd></div>
            <div><dt>Return date</dt><dd>{p.returnDate}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function SectionAdverse({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.adverseEvents.length) return <PendingSection quarter={q} note="No adverse events normalized for this quarter." />;
  return (
    <div className="q26-section q26-list">
      {q.adverseEvents.map((ae) => (
        <article key={ae.eventId} className="q26-record">
          <header><span>{ae.eventId}</span><strong>{ae.caseLabel}</strong><i className={`q26-sev ${ae.severity.toLowerCase()}`}>{ae.severity}</i></header>
          <p>{ae.rcaRequired ? `RCA ${ae.rcaId ?? ''}: ${ae.rcaFindings ?? ''}` : 'No RCA required.'}</p>
          <footer><span>Root cause: {ae.systemicRootCause ?? '—'}</span>{ae.personnelMatterSeparated && <span className="q26-restricted"><Lock size={12} /> personnel matter → executive session</span>}</footer>
        </article>
      ))}
      <p className="q26-deident-note"><ShieldCheck size={13} /> De-identified case labels shown. Patient-level detail is restricted to executive-session / tabletop exhibits.</p>
    </div>
  );
}

function SectionComplaints({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.complaints.length) return <PendingSection quarter={q} note="No complaint records normalized for this quarter." />;
  return (
    <div className="q26-section q26-list">
      {q.complaints.map((c) => (
        <article key={c.complaintId} className="q26-record">
          <header><span>{c.complaintId}</span><strong>{c.category}</strong>{c.escalatedToGb && <i className="q26-hold">Escalated to GB</i>}</header>
          <footer><span>{c.complaintDate}</span><span>{c.within5Days === false ? 'Not resolved within 5 days' : c.within5Days ? 'Within 5 days' : 'Resolution pending'}</span><span>{c.status}</span></footer>
        </article>
      ))}
    </div>
  );
}

function SectionCaps({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.caps.length) return <PendingSection quarter={q} note="No CAP records normalized for this quarter." />;
  return (
    <div className="q26-section">
      <table className="q26-table">
        <caption className="q26-sr">Corrective action plans and Board directives for {q.key}</caption>
        <thead><tr><th>CAP</th><th>Source</th><th>Directive</th><th>Owner</th><th>Due</th><th>Status</th><th>Effective?</th></tr></thead>
        <tbody>{q.caps.map((c) => <tr key={c.capId}><td>{c.capId}</td><td>{c.sourceTrigger}</td><td>{c.description}</td><td>{c.ownerClinId}</td><td>{c.dueDate}</td><td>{c.status}</td><td>{c.effectivenessDemonstrated ? 'Yes' : 'Not demonstrated'}</td></tr>)}</tbody>
      </table>
      <p className="q26-deident-note"><AlertTriangle size={13} /> "Activity completed" is not "effective correction demonstrated." Closure requires effectiveness evidence and a return review.</p>
    </div>
  );
}

function SectionDecisions({
  packet, composerOpen, composerPrefill, onOpenComposer, onCloseComposer,
}: {
  packet: GbQuarterPacket;
  composerOpen: boolean;
  composerPrefill: GbDecisionMatter | undefined;
  onOpenComposer: (matter?: GbDecisionMatter) => void;
  onCloseComposer: () => void;
}) {
  return (
    <div className="q26-section q26-list">
      {!packet.decisionsRequested.length && !composerOpen && <p className="q26-empty">No matters require a Board decision this quarter.</p>}
      {packet.decisionsRequested.map((m) => (
        <article key={m.matterId} className={`q26-decision ${m.kind}`}>
          <header><Gavel size={16} /><span>{m.matterId}</span><strong>{m.title}</strong></header>
          <p><b>Why it matters:</b> {m.whyItMatters}</p>
          <p><b>Decision requested:</b> {m.decisionRequested}</p>
          {m.missingEvidence.length > 0 && <p className="q26-missing"><FileWarning size={13} /> Missing: {m.missingEvidence.join('; ')}</p>}
          <button className="qd-secondary" onClick={() => onOpenComposer(m)}>Draft decision for this matter</button>
        </article>
      ))}
      {!composerOpen && (
        <button className="qd-secondary" onClick={() => onOpenComposer()}>+ Draft a new Board decision</button>
      )}
      {composerOpen && (
        <>
          <GbDecisionComposer
            quarter={packet.quarter.key}
            prefillSubject={composerPrefill?.title}
            prefillMatterId={composerPrefill?.matterId}
          />
          <button className="qd-secondary" onClick={onCloseComposer}>Close composer</button>
        </>
      )}
    </div>
  );
}

function SectionSignoffs({ packet }: { packet: GbQuarterPacket }) {
  const q = packet.quarter;
  if (!q.sourceSignoffs.length) return <PendingSection quarter={q} note="No sign-off records normalized for this quarter." />;
  return (
    <div className="q26-section q26-list">
      {q.sourceSignoffs.map((s) => <article key={s.signoffId} className="q26-record"><header><span>{s.signoffId}</span><strong>{s.role}</strong><i className={s.status === 'Signed' ? 'q26-ok' : 'q26-hold'}>{s.status}</i></header><footer><span>Signer {s.signerClinId}</span><span>{s.date}</span></footer></article>)}
      {q.meeting && <p className="q26-deident-note"><CalendarDays size={13} /> Minutes due {q.meeting.minutesDue} · owner {q.meeting.minutesOwner}.</p>}
    </div>
  );
}

function PendingSection({ quarter, note }: { quarter: QapiQuarter; note?: string }) {
  return <div className="q26-section"><div className="q26-pending-card"><FileWarning size={26} /><h3>{quarter.key} normalization pending</h3><p>{note ?? 'This quarter exists in the source fixture but has not been normalized into the packet workspace yet. No fabricated figures are shown.'}</p></div></div>;
}

function AnnualArcView({ onSelect }: { onSelect: (k: PacketKey) => void }) {
  const arc = buildGbAnnualArc();
  return (
    <div className="q26-section">
      <div className="q26-card-grid">
        <article className="q26-card"><span>NORMALIZED</span><strong>{arc.normalizedQuarters.join(', ') || '—'}</strong><small>Packet-ready quarters</small></article>
        <article className="q26-card"><span>PENDING</span><strong>{arc.pendingQuarters.join(', ') || '—'}</strong><small>Source present; normalization pending</small></article>
        <article className="q26-card"><span>CENSUS ARC</span><strong>2026</strong><small>{arc.censusArc}</small></article>
        <article className="q26-card"><span>ANNUAL REPORT</span><strong>{arc.annualReportApproved === null ? 'Pending' : arc.annualReportApproved ? 'Approved' : 'Not approved'}</strong><small>Approval + evidence status</small></article>
      </div>
      <div className="q26-readiness">
        <h3>Carry-forward risk (open beyond the quarter)</h3>
        {arc.carryForwardRisk.length
          ? <ul>{arc.carryForwardRisk.map((r) => <li key={r} className="no"><AlertTriangle size={15} /><div><strong>{r}</strong></div></li>)}</ul>
          : <p className="q26-empty">No open carry-forward items.</p>}
        <p className="q26-proceed hold">Zero open PIPs must never be read as zero remaining risk while CAPs, complaints, or personnel matters remain open.</p>
      </div>
      <div className="q26-nav-inline">{QUARTERS.map((q) => <button key={q} onClick={() => onSelect(q)}>{q} packet <ChevronRight size={14} /></button>)}</div>
    </div>
  );
}

function OpenDirectivesView() {
  const arc = buildGbAnnualArc();
  const openPips = QUARTERS.flatMap((q) => buildGbQuarterPacket(q).openPips.map((p) => ({ q, p })));
  return (
    <div className="q26-section q26-list">
      <h3 className="q26-section-title">Open Board directives &amp; follow-up</h3>
      {openPips.map(({ q, p }) => <article key={q + p.pipId} className="q26-record"><header><span>{q} · {p.pipId}</span><strong>{p.title}</strong><i className="q26-hold">return {p.returnDate}</i></header><footer><span>{p.currentQuarterEvidence}</span></footer></article>)}
      {arc.carryForwardRisk.map((r) => <article key={r} className="q26-record"><header><strong>{r}</strong></header></article>)}
      {!openPips.length && !arc.carryForwardRisk.length && <p className="q26-empty">No open directives.</p>}
    </div>
  );
}

function DataQualityView() {
  return (
    <div className="q26-section q26-list">
      <h3 className="q26-section-title">Data quality &amp; source integrity</h3>
      {QAPI_2026.validationFindings.map((f) => (
        <article key={f.findingId} className={`q26-dq ${f.severity}`}>
          <header><span>{f.findingId}</span><strong>{f.title}</strong><i>{f.severity}</i></header>
          <p>{f.detail}</p>
          <p className="q26-dq-values"><b>Recovered values:</b> {f.originalValues.join(' · ')}</p>
          <p><b>Impact:</b> {f.impact}</p>
          <p className="q26-dq-decision"><b>Reviewer decision required:</b> {f.requiredReviewerDecision}</p>
        </article>
      ))}
      {QAPI_2026.syntheticSupplements.map((s, i) => (
        <article key={i} className="q26-dq warning">
          <header><span>UAT SUPPLEMENT</span><strong>Synthetic supplement</strong><i>review required</i></header>
          <p>{s.supplementReason}</p>
          <p className="q26-dq-values">approvedForProduction: false · authoredFor: {s.authoredFor}</p>
        </article>
      ))}
    </div>
  );
}

export default function Qapi2026BoardWorkspace() {
  const [active, setActive] = useState<PacketKey>('Q2');
  const [section, setSection] = useState<SectionKey>('brief');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState<GbDecisionMatter | undefined>(undefined);

  const packet = useMemo(() => (QUARTERS.includes(active as QuarterKey) ? buildGbQuarterPacket(active as QuarterKey) : null), [active]);
  const activeStep = packet ? (packet.readiness.readyToConvene ? 4 : 0) : 0;

  function openComposer(matter?: GbDecisionMatter) {
    setComposerPrefill(matter);
    setComposerOpen(true);
    setSection('decisions');
  }
  function closeComposer() {
    setComposerOpen(false);
    setComposerPrefill(undefined);
  }

  return (
    <div className="q26-workspace">
      <div className="q26-topline">
        <div className="q26-title"><Landmark size={18} /><div><span>QAPI OVERSIGHT · 2026 BOARD PACKETS · 42 CFR 484.65</span><strong>{QAPI_2026.agency.agencyName}</strong></div></div>
        <SyntheticWatermark />
      </div>
      {packet && <WorkflowRail activeStep={activeStep} />}

      <div className="q26-layout">
        <YearNavigator active={active} onSelect={(k) => { setActive(k); setSection('brief'); closeComposer(); }} />

        <main className="q26-center">
          {packet && (
            <>
              <header className="q26-center-head">
                <div><span>{active} PACKET</span><h2>{SECTIONS.find((s) => s.id === section)?.label}</h2></div>
                {packet.quarter.normalizationStatus === 'pending' && <i className="q26-pending">normalization pending</i>}
              </header>
              <nav className="q26-section-tabs" aria-label="Packet sections">
                {SECTIONS.map((s) => <button key={s.id} className={section === s.id ? 'active' : ''} onClick={() => setSection(s.id)} aria-current={section === s.id ? 'true' : undefined}>{s.label}</button>)}
              </nav>
              {section === 'brief' && <SectionBrief packet={packet} />}
              {section === 'signals' && <SectionSignals packet={packet} />}
              {section === 'attendance' && <AttendanceQuorumPanel quarter={packet.quarter.key} />}
              {section === 'pips' && <SectionPips packet={packet} />}
              {section === 'adverse' && <SectionAdverse packet={packet} />}
              {section === 'infection' && <InfectionOversight quarter={packet.quarter.key} />}
              {section === 'complaints' && <SectionComplaints packet={packet} />}
              {section === 'caps' && <SectionCaps packet={packet} />}
              {section === 'finance' && <FinanceResourcePanel quarter={packet.quarter.key} />}
              {section === 'decisions' && (
                <SectionDecisions
                  packet={packet}
                  composerOpen={composerOpen}
                  composerPrefill={composerPrefill}
                  onOpenComposer={openComposer}
                  onCloseComposer={closeComposer}
                />
              )}
              {section === 'signoffs' && <SectionSignoffs packet={packet} />}
            </>
          )}
          {active === 'annual' && <><header className="q26-center-head"><div><span>2026</span><h2>Annual arc</h2></div></header><AnnualArcView onSelect={setActive} /></>}
          {active === 'directives' && <><header className="q26-center-head"><div><span>FOLLOW-UP</span><h2>Open Board directives</h2></div></header><OpenDirectivesView /></>}
          {active === 'dataquality' && <><header className="q26-center-head"><div><span>INTEGRITY</span><h2>Data quality</h2></div></header><DataQualityView /></>}
        </main>

        {packet ? <BoardActionRail packet={packet} onOpenComposer={openComposer} /> : <aside className="q26-action-rail"><span className="q26-rail-kicker">BOARD ACTION</span><p className="q26-empty">Select a normalized quarter packet to see the requested Board action.</p></aside>}
      </div>
    </div>
  );
}
