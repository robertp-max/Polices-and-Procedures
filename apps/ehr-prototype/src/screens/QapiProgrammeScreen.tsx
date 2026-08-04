import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  FlaskConical,
  Link2,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react'
import { QAPI_PIPS } from '../data/workspace'
import type { QapiPip } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './qapi.css'

/* ──────────────────────────────────────────────────────────────────────────
 * QAPI programme (QAP) — PIPs, RCA, CAP, effectiveness return.
 * Synthetic design prototype. No closure on task completion alone.
 * ────────────────────────────────────────────────────────────────────────── */

type StatusFilter = 'all' | QapiPip['status']
type DetailTab = 'overview' | 'measures' | 'effectiveness' | 'related'

const STATUS_META: Record<QapiPip['status'], { tone: StatusTone; label: string }> = {
  active: { tone: 'progress', label: 'Active' },
  'effectiveness-due': { tone: 'warn', label: 'Effectiveness due' },
  sustained: { tone: 'good', label: 'Sustained' },
  closed: { tone: 'neutral', label: 'Closed' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'effectiveness-due', label: 'Effectiveness due' },
  { key: 'sustained', label: 'Sustained' },
  { key: 'closed', label: 'Closed' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'measures', label: 'Measures' },
  { key: 'effectiveness', label: 'Effectiveness' },
  { key: 'related', label: 'Related' },
]

/** Synthetic measure snapshots per PIP — visual only. */
const PIP_MEASURES: Record<
  string,
  { label: string; baseline: string; current: string; target: string; pct: number }[]
> = {
  'pip-1': [
    { label: 'Hospitalization rate · HF', baseline: '22.4%', current: '19.1%', target: '≤16%', pct: 45 },
    { label: 'After-hours contact ≤2h', baseline: '61%', current: '78%', target: '≥90%', pct: 58 },
  ],
  'pip-2': [
    { label: 'Fall events · SOC week', baseline: '6 events', current: '3 events', target: '≤2', pct: 70 },
    { label: 'Home safety kit completion', baseline: '40%', current: '88%', target: '100%', pct: 88 },
  ],
  'pip-3': [
    { label: 'Missed-visit rate', baseline: '4.1%', current: '1.9%', target: '≤2%', pct: 100 },
    { label: 'Call-tree drill pass', baseline: '0', current: '2 drills', target: 'Quarterly', pct: 100 },
  ],
}

function closeDisabledReason(pip: QapiPip): string | null {
  if (pip.status === 'sustained' || pip.status === 'closed') {
    return 'Already sustained/closed in this sample.'
  }
  if (pip.status === 'active') {
    return 'Effectiveness return not yet due — cannot close on task completion alone.'
  }
  if (pip.status === 'effectiveness-due') {
    return 'Return evidence required before sustained closure.'
  }
  return null
}

/** Prefer status=active; fall back to first PIP if none are active. */
function findActivePipId(): string | null {
  const active = QAPI_PIPS.find(p => p.status === 'active')
  return active?.id ?? QAPI_PIPS[0]?.id ?? null
}

type CheckTone = 'good' | 'warn' | 'neutral'

function EffectivenessIcon({ tone }: { tone: CheckTone }) {
  if (tone === 'good') {
    return <CheckCircle2 size={15} strokeWidth={2} aria-hidden className="qapi-check-icon is-good" />
  }
  if (tone === 'warn') {
    return <AlertCircle size={15} strokeWidth={2} aria-hidden className="qapi-check-icon is-warn" />
  }
  return <Circle size={15} strokeWidth={2} aria-hidden className="qapi-check-icon is-neutral" />
}

export default function QapiProgrammeScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(QAPI_PIPS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [draftPipDrawer, setDraftPipDrawer] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return QAPI_PIPS.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (!q) return true
      const hay = [p.id, p.title, p.owner, p.baseline, p.countermeasure, p.returnDate, p.status]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(p => p.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = QAPI_PIPS.find(p => p.id === selectedId) ?? null
  const activeCount = QAPI_PIPS.filter(p => p.status === 'active').length
  const dueCount = QAPI_PIPS.filter(p => p.status === 'effectiveness-due').length
  const sustainedCount = QAPI_PIPS.filter(p => p.status === 'sustained' || p.status === 'closed').length

  const selectPip = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const openActivePip = () => {
    const id = findActivePipId()
    if (!id) return
    // Clear status filter so the active PIP is visible in the list, then select it.
    setStatusFilter('all')
    setQuery('')
    selectPip(id)
  }

  const closeBlock = selected ? closeDisabledReason(selected) : null

  // Effectiveness checklist tones: green only when sustained/closed; warn/neutral until then.
  const isSustained = selected?.status === 'sustained' || selected?.status === 'closed'
  const effectivenessItems: { label: string; tone: CheckTone }[] = selected
    ? [
        {
          label: `Return date scheduled · ${selected.returnDate}`,
          tone: isSustained ? 'good' : selected.returnDate && selected.returnDate !== 'Closed' ? 'neutral' : 'neutral',
        },
        {
          label: `Countermeasure documented · ${selected.countermeasure}`,
          tone: isSustained ? 'good' : 'neutral',
        },
        {
          label:
            selected.status === 'sustained'
              ? `Status · ${STATUS_META[selected.status].label} · proof on file (sample)`
              : selected.status === 'effectiveness-due'
                ? `Status · ${STATUS_META[selected.status].label} · return evidence due (not sustained)`
                : `Status · ${STATUS_META[selected.status].label} · not sustained yet`,
          tone: isSustained ? 'good' : selected.status === 'effectiveness-due' ? 'warn' : 'neutral',
        },
      ]
    : []

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain QAP · QAPI programme</div>
          <h1 className="screen-title">QAPI programme</h1>
          <div className="screen-sub">
            PIPs, RCA, CAP, and effectiveness return — no closure on task completion alone.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/quality')}>
            Quality desk
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/legal-evidence')}>
            Incident packages
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setDraftPipDrawer(true)}>
            Draft new PIP
          </button>
          <button type="button" className="btn btn-primary" onClick={openActivePip}>
            <Target size={15} strokeWidth={2} aria-hidden />
            Open active PIP
          </button>
        </div>
      </div>

      <div className="qapi-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no PIP is opened, closed, or marked effective. Production requires
          authorized QAP requirements and evidence-backed effectiveness.
        </span>
      </div>

      <RelatedNav route="/qapi" />

      <div className="qapi-stats">
        <StatCard
          icon={<Activity size={16} strokeWidth={1.75} aria-hidden />}
          kicker="PIPs in sample"
          value={QAPI_PIPS.length}
          sub="Agency-controlled improvement set"
          accent="teal"
        />
        <StatCard
          icon={<TrendingUp size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active"
          value={activeCount}
          sub="Countermeasures in flight"
          accent="teal"
        />
        <StatCard
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Effectiveness due"
          value={dueCount}
          sub="Return evidence needed"
          accent="warn"
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Sustained / closed"
          value={sustainedCount}
          sub="With proof in sample"
          accent="good"
        />
      </div>

      <div className="qapi-workspace">
        <section className="card qapi-registry" aria-label="PIP registry">
          <div className="qapi-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title qapi-card-title">Performance improvement projects</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="qapi-toolbar">
            <label className="qapi-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search PIPs</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search PIP, owner, or countermeasure"
              />
            </label>
            <div className="qapi-filter-block">
              <span className="qapi-filter-label" id="qapi-status-filters">Status</span>
              <div className="qapi-filters" role="toolbar" aria-labelledby="qapi-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'qapi-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Target size={26} strokeWidth={1.5} />}
              title="No PIPs match"
              sub="Clear filters or search. All PIPs are synthetic."
            />
          ) : (
            <div className="qapi-list" role="listbox" aria-label="PIP list">
              {filtered.map(pip => {
                const meta = STATUS_META[pip.status]
                const isSelected = pip.id === selectedId
                const measures = PIP_MEASURES[pip.id] ?? []
                const progress = measures[0]?.pct ?? 0
                return (
                  <button
                    key={pip.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'qapi-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectPip(pip.id)}
                  >
                    <span
                      className={
                        'qapi-row-icon' +
                        (pip.status === 'effectiveness-due' ? ' is-warn' : pip.status === 'sustained' ? ' is-good' : '')
                      }
                      aria-hidden
                    >
                      <Target size={16} strokeWidth={1.75} />
                    </span>
                    <span className="qapi-row-main">
                      <span className="qapi-row-top">
                        <span className="qapi-id">{pip.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="qapi-title">{pip.title}</span>
                      <span className="qapi-meta">
                        <span>Owner · {pip.owner}</span>
                        <span className="qapi-dot" aria-hidden />
                        <span>Baseline · {pip.baseline}</span>
                        <span className="qapi-dot" aria-hidden />
                        <span>Return · {pip.returnDate}</span>
                      </span>
                    </span>
                    <span className="qapi-row-meter">
                      <span className="qapi-meter-label">{progress}%</span>
                      <ProgressBar
                        pct={progress}
                        color={
                          pip.status === 'sustained'
                            ? 'var(--status-good)'
                            : pip.status === 'effectiveness-due'
                              ? 'var(--status-warn)'
                              : 'var(--teal-400)'
                        }
                        label={`${pip.id} progress ${progress} percent`}
                      />
                    </span>
                    <ArrowRight className="qapi-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="qapi-inspector" aria-label="PIP inspector">
          {selected ? (
            <div className="card qapi-inspector-card">
              <div className="qapi-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title qapi-card-title">{selected.id}</h2>
                  <p className="qapi-inspector-title">{selected.title}</p>
                </div>
                <div className="qapi-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                </div>
              </div>

              <div className="qapi-tabs" role="tablist" aria-label="PIP detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'qapi-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="qapi-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="qapi-panel">
                    {selected.status === 'effectiveness-due' ? (
                      <div className="qapi-callout is-warn" role="status">
                        <ClipboardList size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Effectiveness return due</strong>
                          <span>
                            Return date {selected.returnDate}. Closure requires measure evidence — not task
                            checkboxes alone.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="qapi-drawer-grid">
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Accountable lead</span>
                      </div>
                      <div>
                        <span className="card-kicker">Baseline</span>
                        <strong>{selected.baseline}</strong>
                        <span>Problem magnitude</span>
                      </div>
                      <div>
                        <span className="card-kicker">Countermeasure</span>
                        <strong>{selected.countermeasure}</strong>
                        <span>Change under test</span>
                      </div>
                      <div>
                        <span className="card-kicker">Return</span>
                        <strong>{selected.returnDate}</strong>
                        <span>Effectiveness check</span>
                      </div>
                    </div>
                    <p className="qapi-drawer-copy">
                      QAPI links signals → investigation → corrective action → effectiveness. This prototype
                      does not write RCA, CAP, or governing-body minutes.
                    </p>
                  </div>
                ) : null}

                {detailTab === 'measures' ? (
                  <div className="qapi-panel">
                    <p className="qapi-drawer-copy">
                      Measure snapshots are synthetic and must reconcile to Quality / CMS quality desks in
                      production.
                    </p>
                    <ul className="qapi-measure-list">
                      {(PIP_MEASURES[selected.id] ?? []).map(m => (
                        <li key={m.label}>
                          <div className="qapi-measure-head">
                            <strong>{m.label}</strong>
                            <span>{m.pct}%</span>
                          </div>
                          <ProgressBar pct={m.pct} color="var(--teal-400)" label={`${m.label} ${m.pct}%`} />
                          <span className="qapi-measure-meta">
                            Baseline {m.baseline} · Current {m.current} · Target {m.target}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'effectiveness' ? (
                  <div className="qapi-panel">
                    <p className="qapi-drawer-copy">
                      Effectiveness requires a planned return, numerator/denominator, and decision to sustain,
                      adapt, or abandon — never “done because tasks finished.” Green checkmarks appear only
                      after sustained proof.
                    </p>
                    <ul className="qapi-check-list">
                      {effectivenessItems.map(item => (
                        <li key={item.label}>
                          <EffectivenessIcon tone={item.tone} />
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="qapi-panel">
                    <div className="qapi-related-actions">
                      {selected.related.map(r => (
                        <button
                          key={r.to + r.label}
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(r.to)}
                        >
                          <Link2 size={13} strokeWidth={2} aria-hidden />
                          {r.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/competency')}
                      >
                        Competency
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="qapi-inspector-foot">
                <div className="qapi-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/quality')}
                    title="Navigate only"
                  >
                    Quality desk
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!closeBlock}
                    title={closeBlock ?? 'Visual only · no PIP is closed'}
                  >
                    Mark sustained
                  </button>
                </div>
                <p className="qapi-drawer-footnote">
                  {closeBlock
                    ? `Close disabled · ${closeBlock}`
                    : 'Sustain / close controls are visual only. No QAPI record is written.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card qapi-inspector-empty">
              <EmptyState
                icon={<Target size={26} strokeWidth={1.5} />}
                title="Select a PIP"
                sub="Inspect measures, effectiveness, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={draftPipDrawer}
        onClose={() => setDraftPipDrawer(false)}
        title="Draft new PIP"
        sub="Visual only · nothing is created or filed"
      >
        <div className="qapi-panel">
          <p className="qapi-drawer-copy">
            Drafting a PIP in production requires problem statement, baseline measure, owner, and planned
            effectiveness return. This drawer is layout only — it does not open or create a PIP record.
          </p>
          <div className="qapi-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDraftPipDrawer(false)}>
              Close
            </button>
            <button type="button" className="btn btn-primary" disabled title="Visual only · no PIP is created">
              Create PIP
            </button>
          </div>
          <p className="qapi-drawer-footnote">Create is disabled. No durable write occurs in this prototype.</p>
        </div>
      </Drawer>
    </div>
  )
}
