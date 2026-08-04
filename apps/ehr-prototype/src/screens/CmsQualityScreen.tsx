import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileWarning,
  FlaskConical,
  Link2,
  Search,
  Send,
  Upload,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { OASIS_RECORDS } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, PatientAvatar, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './hqr.css'

/* ──────────────────────────────────────────────────────────────────────────
 * CMS quality reporting (HQR) — HHQRP completeness, HHVBP, submission files.
 * Synthetic design prototype. Anchors HQR-002.
 * ────────────────────────────────────────────────────────────────────────── */

type WorkStatus = 'on-track' | 'open' | 'closed' | 'rejected'
type WorkKind = 'completeness' | 'submission' | 'repair' | 'hhvbp' | 'hhcahps'
type StatusFilter = 'all' | WorkStatus
type DetailTab = 'overview' | 'cohort' | 'cms' | 'related'

type QualityWork = {
  id: string
  title: string
  kind: WorkKind
  cohort: string
  deadline: string
  owner: string
  cmsResponse: string
  status: WorkStatus
  completeness?: number
  detail: string
  patientId?: string
}

const WORK: QualityWork[] = [
  {
    id: 'hqr-1',
    title: 'OASIS completeness · eligible episodes',
    kind: 'completeness',
    cohort: 'August eligible episodes',
    deadline: 'Month-end',
    owner: 'OASIS coordinator',
    cmsResponse: '—',
    status: 'on-track',
    completeness: 96.2,
    detail:
      'Reconcile eligible episodes and assessments to CMS submission responses; surface missing, late, rejected, and unresolved records by deadline and owner (HQR-002).',
  },
  {
    id: 'hqr-2',
    title: 'Quality file batch · July',
    kind: 'submission',
    cohort: 'July export window',
    deadline: 'Submitted',
    owner: 'Quality desk',
    cmsResponse: 'Accepted',
    status: 'closed',
    completeness: 100,
    detail: 'Vendor file accepted by CMS (synthetic). Retained numerator/denominator snapshot on file.',
  },
  {
    id: 'hqr-3',
    title: 'Rejection repair · assessment',
    kind: 'repair',
    cohort: '1 assessment',
    deadline: '48h',
    owner: 'Clinical QA',
    cmsResponse: 'Rejected',
    status: 'rejected',
    completeness: 40,
    patientId: 'pt-elena',
    detail:
      'CMS rejection requires correction and resubmit. Repair queue owns the unresolved record until acceptance.',
  },
  {
    id: 'hqr-4',
    title: 'HHVBP measure pack · Q3 watch',
    kind: 'hhvbp',
    cohort: '12 measures monitored',
    deadline: 'Quarter close',
    owner: 'Quality desk',
    cmsResponse: '—',
    status: 'on-track',
    completeness: 88,
    detail: 'Expanded HHVBP monitoring posture — synthetic only; not a public-report certification.',
  },
  {
    id: 'hqr-5',
    title: 'HHCAHPS volume determination',
    kind: 'hhcahps',
    cohort: 'Agency volume threshold',
    deadline: 'On file',
    owner: 'Compliance',
    cmsResponse: 'Exempt*',
    status: 'closed',
    detail: 'Conditional HHCAHPS exemption determination retained (synthetic). Re-evaluate when volume changes.',
  },
]

const STATUS_META: Record<WorkStatus, { tone: StatusTone; label: string }> = {
  'on-track': { tone: 'good', label: 'On track' },
  open: { tone: 'progress', label: 'Open' },
  closed: { tone: 'neutral', label: 'Closed' },
  rejected: { tone: 'bad', label: 'Rejected' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'on-track', label: 'On track' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'cohort', label: 'Cohort / OASIS' },
  { key: 'cms', label: 'CMS response' },
  { key: 'related', label: 'Related' },
]

function submitDisabledReason(w: QualityWork): string | null {
  if (w.status === 'closed') return 'Already closed / accepted in this sample.'
  if (w.status === 'rejected') return 'Repair the rejected assessment before resubmit.'
  if (w.kind === 'hhcahps') return 'HHCAHPS determination is on file — not a file submission.'
  return null
}

export default function CmsQualityScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(WORK[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [runOpen, setRunOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WORK.filter(w => {
      if (statusFilter !== 'all' && w.status !== statusFilter) return false
      if (!q) return true
      const patient = w.patientId ? getPatient(w.patientId) : undefined
      const hay = [
        w.id,
        w.title,
        w.cohort,
        w.owner,
        w.cmsResponse,
        w.kind,
        patient ? `${patient.firstName} ${patient.lastName}` : '',
      ]
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
    if (!selectedId || !filtered.some(w => w.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = WORK.find(w => w.id === selectedId) ?? null
  const rejectedCount = WORK.filter(w => w.status === 'rejected').length
  const onTrack = WORK.filter(w => w.status === 'on-track').length
  const completenessRow = WORK.find(w => w.kind === 'completeness')
  const oasisInProgress = OASIS_RECORDS.filter(o => o.status === 'in-progress' || o.status === 'due-soon').length

  const selectWork = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const submitBlock = selected ? submitDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain HQR · CMS quality reporting</div>
          <h1 className="screen-title">CMS quality reporting</h1>
          <div className="screen-sub">
            HHQRP completeness, submission files, HHVBP monitoring, and conditional HHCAHPS posture.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/oasis')}>
            OASIS workspace
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/data-exports')}>
            <Upload size={15} strokeWidth={2} aria-hidden />
            Data exports
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setRunOpen(true)}>
            <BarChart3 size={15} strokeWidth={2} aria-hidden />
            Run completeness
          </button>
        </div>
      </div>

      <div className="hqr-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no CMS file is generated, submitted, or certified. Production requires
          authorized HQR requirements and retained reconciliation evidence.
        </span>
      </div>

      <RelatedNav route="/cms-quality" />

      <div className="hqr-stats">
        <StatCard
          icon={<BarChart3 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Assessment completeness"
          value={completenessRow?.completeness != null ? `${completenessRow.completeness}%` : '—'}
          sub="Threshold watch · sample numerator"
          accent="teal"
        />
        <StatCard
          icon={<FileWarning size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Rejected files"
          value={rejectedCount}
          sub="Repair queue"
          accent={rejectedCount > 0 ? 'bad' : 'good'}
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="On-track work"
          value={onTrack}
          sub="Completeness / HHVBP packs"
          accent="good"
        />
        <StatCard
          icon={<Send size={16} strokeWidth={1.75} aria-hidden />}
          kicker="OASIS open"
          value={oasisInProgress}
          sub="In-progress or due-soon assessments"
          accent="warn"
        />
      </div>

      <div className="hqr-workspace">
        <section className="card hqr-registry" aria-label="Quality work registry">
          <div className="hqr-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title hqr-card-title">Measures & submissions</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="hqr-toolbar">
            <label className="hqr-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search CMS quality work</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search measure, owner, cohort, or response"
              />
            </label>
            <div className="hqr-filter-block">
              <span className="hqr-filter-label" id="hqr-status-filters">Status</span>
              <div className="hqr-filters" role="toolbar" aria-labelledby="hqr-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'hqr-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<BarChart3 size={26} strokeWidth={1.5} />}
              title="No rows match"
              sub="Clear filters or search. All rows are synthetic."
            />
          ) : (
            <div className="hqr-list" role="listbox" aria-label="Quality work list">
              {filtered.map(w => {
                const meta = STATUS_META[w.status]
                const isSelected = w.id === selectedId
                return (
                  <button
                    key={w.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'hqr-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectWork(w.id)}
                  >
                    <span
                      className={'hqr-row-icon' + (w.status === 'rejected' ? ' is-bad' : '')}
                      aria-hidden
                    >
                      {w.status === 'rejected' ? (
                        <FileWarning size={16} strokeWidth={1.75} />
                      ) : (
                        <BarChart3 size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="hqr-row-main">
                      <span className="hqr-row-top">
                        <span className="hqr-id">{w.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{w.kind}</span>
                      </span>
                      <span className="hqr-title">{w.title}</span>
                      <span className="hqr-meta">
                        <span>{w.cohort}</span>
                        <span className="hqr-dot" aria-hidden />
                        <span>Due · {w.deadline}</span>
                        <span className="hqr-dot" aria-hidden />
                        <span>{w.owner}</span>
                      </span>
                    </span>
                    {w.completeness != null ? (
                      <span className="hqr-row-meter">
                        <span className="hqr-meter-label">{w.completeness}%</span>
                        <ProgressBar
                          pct={w.completeness}
                          color={w.status === 'rejected' ? 'var(--status-bad)' : 'var(--teal-400)'}
                          label={`${w.id} ${w.completeness} percent`}
                        />
                      </span>
                    ) : null}
                    <ArrowRight className="hqr-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="hqr-inspector" aria-label="Quality work inspector">
          {selected ? (
            <div className="card hqr-inspector-card">
              <div className="hqr-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title hqr-card-title">{selected.id}</h2>
                  <p className="hqr-inspector-title">{selected.title}</p>
                </div>
                <div className="hqr-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                </div>
              </div>

              <div className="hqr-tabs" role="tablist" aria-label="Quality detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'hqr-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="hqr-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="hqr-panel">
                    {selected.patientId ? (() => {
                      const p = getPatient(selected.patientId!)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          className="hqr-drawer-patient"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <span>
                            <strong>
                              {p.firstName} {p.lastName}
                            </strong>
                            <span>MRN {p.mrn} · open chart</span>
                          </span>
                          <ArrowRight size={14} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })() : null}
                    <p className="hqr-drawer-copy">{selected.detail}</p>
                    <div className="hqr-drawer-grid">
                      <div>
                        <span className="card-kicker">Cohort</span>
                        <strong>{selected.cohort}</strong>
                        <span>Reporting population</span>
                      </div>
                      <div>
                        <span className="card-kicker">Deadline</span>
                        <strong>{selected.deadline}</strong>
                        <span>Owner · {selected.owner}</span>
                      </div>
                      <div>
                        <span className="card-kicker">CMS response</span>
                        <strong>{selected.cmsResponse}</strong>
                        <span>Synthetic / sample only</span>
                      </div>
                      <div>
                        <span className="card-kicker">Completeness</span>
                        <strong>
                          {selected.completeness != null ? `${selected.completeness}%` : 'N/A'}
                        </strong>
                        <span>Not a production threshold cert</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'cohort' ? (
                  <div className="hqr-panel">
                    <p className="hqr-drawer-copy">
                      Linked OASIS records from the shared workspace feed completeness and export readiness.
                    </p>
                    <ul className="hqr-oasis-list">
                      {OASIS_RECORDS.map(o => {
                        const p = getPatient(o.patientId)
                        return (
                          <li key={o.id}>
                            <span className="hqr-oasis-main">
                              <strong>
                                {o.type} · {o.id}
                              </strong>
                              <span>
                                {p ? `${p.firstName} ${p.lastName}` : o.patientId} · {o.window} ·{' '}
                                {o.completion}%
                              </span>
                            </span>
                            <StatusChip
                              tone={
                                o.status === 'exported'
                                  ? 'good'
                                  : o.status === 'due-soon'
                                    ? 'warn'
                                    : 'progress'
                              }
                            >
                              {o.status}
                            </StatusChip>
                          </li>
                        )
                      })}
                    </ul>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/oasis')}>
                      Open OASIS workspace
                      <ArrowRight size={13} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                ) : null}

                {detailTab === 'cms' ? (
                  <div className="hqr-panel">
                    {selected.status === 'rejected' ? (
                      <div className="hqr-callout is-bad" role="status">
                        <FileWarning size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>CMS rejection</strong>
                          <span>
                            Response: {selected.cmsResponse}. Repair within {selected.deadline} before
                            resubmission.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="hqr-drawer-copy">
                        CMS response: <strong>{selected.cmsResponse}</strong>. Production retains response
                        payloads with patient- and aggregate-level reconciliation.
                      </p>
                    )}
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="hqr-panel">
                    <div className="hqr-related-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/oasis')}>
                        <Link2 size={13} strokeWidth={2} aria-hidden />
                        OASIS
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/data-exports')}
                      >
                        Data exports
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/qapi')}>
                        QAPI
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/quality')}
                      >
                        Quality desk
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="hqr-inspector-foot">
                <div className="hqr-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/data-exports')}
                    title="Navigate only"
                  >
                    Export prep
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!submitBlock}
                    title={submitBlock ?? 'Visual only · no CMS file is submitted'}
                  >
                    Submit to CMS
                  </button>
                </div>
                <p className="hqr-drawer-footnote">
                  {submitBlock
                    ? `Submit disabled · ${submitBlock}`
                    : 'Submit / completeness run controls are visual only. No CMS transaction occurs.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card hqr-inspector-empty">
              <EmptyState
                icon={<BarChart3 size={26} strokeWidth={1.5} />}
                title="Select a work item"
                sub="Inspect cohort, CMS response, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={runOpen}
        onClose={() => setRunOpen(false)}
        title="Run completeness"
        sub="Review-only · no calculation is persisted"
      >
        <div className="hqr-panel">
          <p className="hqr-drawer-copy">
            Completeness runs reconcile eligible episodes to assessments and CMS responses. This prototype
            does not write snapshots or exception queues.
          </p>
          <div className="hqr-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRunOpen(false)}>
              Close
            </button>
            <button type="button" className="btn btn-primary" disabled title="Visual only · no run is executed">
              Execute run
            </button>
          </div>
          <p className="hqr-drawer-footnote">Execute is disabled. No durable write occurs in this prototype.</p>
        </div>
      </Drawer>
    </div>
  )
}
