import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  FlaskConical,
  KeyRound,
  Link2,
  Search,
  ShieldAlert,
  Wallet,
} from 'lucide-react'
import { claims } from '../data/clinical'
import { getPatient } from '../data/patients'
import { AUTHORIZATIONS } from '../data/workspace'
import type { AuthzRecord } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './authz.css'

/* ──────────────────────────────────────────────────────────────────────────
 * Authorizations (RCM) — payer units, windows, utilization ledger.
 * Synthetic design prototype. Anchors SCH-004 · RCM-003.
 * ────────────────────────────────────────────────────────────────────────── */

type StatusFilter = 'all' | AuthzRecord['status']
type DetailTab = 'overview' | 'utilization' | 'claims' | 'related'

const STATUS_META: Record<AuthzRecord['status'], { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  expiring: { tone: 'warn', label: 'Expiring' },
  exhausted: { tone: 'bad', label: 'Exhausted' },
  pending: { tone: 'progress', label: 'Pending' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'exhausted', label: 'Exhausted' },
  { key: 'pending', label: 'Pending' },
]

/** Sample utilization ledger rows keyed by authz id — synthetic only. */
const UTILIZATION: Record<string, { when: string; service: string; units: string; actor: string }[]> = {
  'authz-1': [
    { when: 'Jul 28', service: 'PT evaluation', units: '−1 visit', actor: 'Marcus Webb, PT' },
    { when: 'Jul 30', service: 'PT treatment', units: '−1 visit', actor: 'Marcus Webb, PT' },
    { when: 'Aug 1', service: 'PT treatment', units: '−1 visit', actor: 'Marcus Webb, PT' },
  ],
  'authz-2': [
    { when: 'Jul 29', service: 'SOC period open', units: 'PDGM · no unit cap', actor: 'System (synthetic)' },
    { when: 'Jul 30', service: 'SN visit', units: 'Period utilization', actor: 'Taylor Brooks, RN' },
  ],
  'authz-3': [
    { when: 'Jul 12', service: 'SN visit', units: '−1 visit', actor: 'Dana Whitfield, RN' },
    { when: 'Jul 18', service: 'SN visit', units: '−1 visit', actor: 'Dana Whitfield, RN' },
    { when: 'Aug 2', service: 'Units exhausted', units: '0 remaining', actor: 'Utilization job' },
  ],
}

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'utilization', label: 'Utilization' },
  { key: 'claims', label: 'Claims' },
  { key: 'related', label: 'Related' },
]

function requestDisabledReason(auth: AuthzRecord): string | null {
  if (auth.status === 'pending') return 'A reauthorization request is already pending in this sample.'
  if (auth.status === 'active' && auth.remaining === 'Open') {
    return 'Medicare PDGM period is open — unit reauth not applicable in sample.'
  }
  return null
}

export default function AuthorizationsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(AUTHORIZATIONS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [requestOpen, setRequestOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AUTHORIZATIONS.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!q) return true
      const patient = getPatient(a.patientId)
      const hay = [
        a.id,
        a.payer,
        a.units,
        a.remaining,
        a.status,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
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
    if (!selectedId || !filtered.some(a => a.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = AUTHORIZATIONS.find(a => a.id === selectedId) ?? null
  const activeCount = AUTHORIZATIONS.filter(a => a.status === 'active').length
  const expiringCount = AUTHORIZATIONS.filter(a => a.status === 'expiring').length
  const exhaustedCount = AUTHORIZATIONS.filter(a => a.status === 'exhausted').length
  const pendingCount = AUTHORIZATIONS.filter(a => a.status === 'pending').length

  const selectAuth = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const requestBlock = selected ? requestDisabledReason(selected) : null
  const linkedClaims = selected
    ? claims.filter(c => c.patientId === selected.patientId)
    : []

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain RCM · authorizations</div>
          <h1 className="screen-title">Authorizations</h1>
          <div className="screen-sub">
            Payer units, service windows, and utilization — clinical necessity stays separate from
            payment authorization (SCH-004 · RCM-003).
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/billing')}>
            <Wallet size={15} strokeWidth={2} aria-hidden />
            Billing & claims
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/work-queue')}>
            <ClipboardList size={15} strokeWidth={2} aria-hidden />
            Work queue
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setRequestOpen(true)}>
            <KeyRound size={15} strokeWidth={2} aria-hidden />
            Request authorization
          </button>
        </div>
      </div>

      <div className="authz-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no payer portal call, unit decrement, or claim hold is written.
          Production requires authorized RCM requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/authorizations" />

      <div className="authz-stats">
        <StatCard
          icon={<KeyRound size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Registry sample"
          value={AUTHORIZATIONS.length}
          sub="Synthetic authorizations for layout evaluation"
          accent="teal"
        />
        <StatCard
          icon={<BadgeCheck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active"
          value={activeCount}
          sub="Open periods or unit balances"
          accent="good"
        />
        <StatCard
          icon={<CalendarClock size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Expiring / near limit"
          value={expiringCount}
          sub="Renewal or utilization attention"
          accent="warn"
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Exhausted / pending"
          value={exhaustedCount + pendingCount}
          sub={`${exhaustedCount} exhausted · ${pendingCount} pending reauth`}
          accent={exhaustedCount > 0 ? 'bad' : 'orange'}
        />
      </div>

      <div className="authz-workspace">
        <section className="card authz-registry" aria-label="Authorization registry">
          <div className="authz-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title authz-card-title">Payer authorizations</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="authz-toolbar">
            <label className="authz-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search authorizations</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, payer, units, or id"
              />
            </label>
            <div className="authz-filter-block">
              <span className="authz-filter-label" id="authz-status-filters">Status</span>
              <div className="authz-filters" role="toolbar" aria-labelledby="authz-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'authz-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<KeyRound size={26} strokeWidth={1.5} />}
              title="No authorizations match"
              sub="Clear filters or search. All rows on this page are synthetic."
            />
          ) : (
            <div className="authz-list" role="listbox" aria-label="Authorization list">
              {filtered.map(auth => {
                const patient = getPatient(auth.patientId)
                const meta = STATUS_META[auth.status]
                const isSelected = auth.id === selectedId
                return (
                  <button
                    key={auth.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'authz-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectAuth(auth.id)}
                  >
                    <span
                      className={
                        'authz-row-icon' +
                        (auth.status === 'exhausted' ? ' is-bad' : auth.status === 'expiring' ? ' is-warn' : '')
                      }
                      aria-hidden
                    >
                      {auth.status === 'exhausted' || auth.status === 'expiring' ? (
                        <AlertTriangle size={16} strokeWidth={1.75} />
                      ) : (
                        <KeyRound size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="authz-row-main">
                      <span className="authz-row-top">
                        <span className="authz-id">{auth.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{auth.payer}</span>
                      </span>
                      <span className="authz-title">{auth.units}</span>
                      <span className="authz-meta">
                        {patient ? (
                          <span className="authz-who">
                            <PatientAvatar
                              first={patient.firstName}
                              last={patient.lastName}
                              tone={patient.photoTone}
                              size="sm"
                            />
                            <span className="authz-who-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </span>
                        ) : (
                          <span className="authz-who-name-soft">Unknown patient</span>
                        )}
                        <span className="authz-dot" aria-hidden />
                        <span>Remaining · {auth.remaining}</span>
                      </span>
                    </span>
                    <ArrowRight className="authz-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="authz-inspector" aria-label="Authorization inspector">
          {selected ? (
            <div className="card authz-inspector-card">
              <div className="authz-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title authz-card-title">{selected.id}</h2>
                  <p className="authz-inspector-title">{selected.units}</p>
                </div>
                <div className="authz-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                </div>
              </div>

              <div className="authz-tabs" role="tablist" aria-label="Authorization detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'authz-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="authz-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="authz-panel">
                    {(() => {
                      const p = getPatient(selected.patientId)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          className="authz-drawer-patient"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <span>
                            <strong className="authz-who-name">
                              {p.firstName} {p.lastName}
                            </strong>
                            <span>
                              MRN {p.mrn} · {p.payer} · open chart
                            </span>
                          </span>
                          <ArrowRight size={14} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })()}

                    {selected.status === 'exhausted' ? (
                      <div className="authz-callout is-bad" role="status">
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Units exhausted</strong>
                          <span>
                            Scheduling and claim release may place configurable holds until reauthorization
                            lands. Clinical necessity is not decided here.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {selected.status === 'expiring' ? (
                      <div className="authz-callout is-warn" role="status">
                        <CalendarClock size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Near exhaustion / window end</strong>
                          <span>
                            Remaining balance is {selected.remaining}. Production warns before unit
                            exhaustion and expiry per SCH-004.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="authz-drawer-grid">
                      <div>
                        <span className="card-kicker">Payer</span>
                        <strong>{selected.payer}</strong>
                        <span>Coverage authority (sample)</span>
                      </div>
                      <div>
                        <span className="card-kicker">Authorized units</span>
                        <strong>{selected.units}</strong>
                        <span>Service / time window</span>
                      </div>
                      <div>
                        <span className="card-kicker">Remaining</span>
                        <strong>{selected.remaining}</strong>
                        <span>Ledger balance · synthetic</span>
                      </div>
                      <div>
                        <span className="card-kicker">Status</span>
                        <strong>{STATUS_META[selected.status].label}</strong>
                        <span>Prototype labels only</span>
                      </div>
                    </div>

                    <p className="authz-drawer-copy">
                      Authorization ledger must match scheduled, completed, canceled, billed, and adjusted
                      services. This screen never invents clinical judgment or silently releases claims.
                    </p>
                  </div>
                ) : null}

                {detailTab === 'utilization' ? (
                  <div className="authz-panel">
                    <p className="authz-drawer-copy">
                      Decrement trail is append-only in production. Rows below are visual samples only.
                    </p>
                    <ul className="authz-util-list">
                      {(UTILIZATION[selected.id] ?? []).map((row, i) => (
                        <li key={`${row.when}-${i}`}>
                          <span className="authz-util-when">{row.when}</span>
                          <span className="authz-util-main">
                            <strong>{row.service}</strong>
                            <span>
                              {row.actor} · {row.units}
                            </span>
                          </span>
                        </li>
                      ))}
                      {(UTILIZATION[selected.id] ?? []).length === 0 ? (
                        <li className="authz-util-empty">No utilization samples for this authorization.</li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'claims' ? (
                  <div className="authz-panel">
                    <p className="authz-drawer-copy">
                      Linked synthetic claims for this patient. Claim readiness remains separate from
                      clinical completion (RCM-003).
                    </p>
                    {linkedClaims.length === 0 ? (
                      <EmptyState
                        icon={<Wallet size={22} strokeWidth={1.5} />}
                        title="No claims in sample"
                        sub="Open Billing for the full claim set."
                      />
                    ) : (
                      <ul className="authz-claim-list">
                        {linkedClaims.map(c => (
                          <li key={c.id}>
                            <span className="authz-claim-main">
                              <strong>
                                {c.id} · {c.type}
                              </strong>
                              <span>
                                {c.period} · ${c.amount.toLocaleString('en-US')}
                                {c.holds.length > 0 ? ` · ${c.holds.length} hold(s)` : ''}
                              </span>
                            </span>
                            <StatusChip
                              tone={
                                c.status === 'holds'
                                  ? 'warn'
                                  : c.status === 'paid'
                                    ? 'good'
                                    : c.status === 'submitted'
                                      ? 'progress'
                                      : 'neutral'
                              }
                            >
                              {c.status}
                            </StatusChip>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/billing')}>
                      Open billing workspace
                      <ArrowRight size={13} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="authz-panel">
                    <p className="authz-drawer-copy">Continue related work without losing authorization context.</p>
                    <div className="authz-related-actions">
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
                        onClick={() => navigate('/schedule')}
                      >
                        Schedule
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/work-queue')}
                      >
                        Work queue
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="authz-inspector-foot">
                <div className="authz-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/schedule')}
                    title="Navigate only · no schedule write"
                  >
                    View schedule impact
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!requestBlock}
                    title={requestBlock ?? 'Visual only · no reauth is submitted'}
                    onClick={() => setRequestOpen(true)}
                  >
                    Request reauth
                  </button>
                </div>
                <p className="authz-drawer-footnote">
                  {requestBlock
                    ? `Reauth disabled · ${requestBlock} No durable write occurs in this prototype.`
                    : 'Request / hold / decrement controls are visual only. No payer transaction is sent.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card authz-inspector-empty">
              <EmptyState
                icon={<KeyRound size={26} strokeWidth={1.5} />}
                title="Select an authorization"
                sub="Choose a row to inspect utilization, claims, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Request authorization"
        sub="Review-only · nothing is submitted to a payer"
      >
        <div className="authz-panel">
          <p className="authz-drawer-copy">
            Production reauth packages clinical facts, ordered services, and prior utilization. This
            drawer is a layout prototype only — no 278, portal, or fax is generated.
          </p>
          <ul className="authz-check-list">
            <li>
              <BadgeCheck size={15} strokeWidth={2} aria-hidden />
              <span>Service units and window from the selected authorization</span>
            </li>
            <li>
              <BadgeCheck size={15} strokeWidth={2} aria-hidden />
              <span>Clinical necessity remains on the chart / orders path</span>
            </li>
            <li>
              <BadgeCheck size={15} strokeWidth={2} aria-hidden />
              <span>Claim holds stay explainable and versioned (RCM-003)</span>
            </li>
          </ul>
          <div className="authz-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRequestOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled
              title="Visual only · no authorization is requested"
            >
              Submit request
            </button>
          </div>
          <p className="authz-drawer-footnote">Submit is disabled in this prototype. No durable write occurs.</p>
        </div>
      </Drawer>
    </div>
  )
}
