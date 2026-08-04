import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Clock3,
  FileText,
  FlaskConical,
  Link2,
  Scale,
  Search,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { FORM_CATALOG } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './ben.css'

/* ──────────────────────────────────────────────────────────────────────────
 * Beneficiary notices & appeals (BEN) — NOMNC, DENC, delivery clocks.
 * Synthetic design prototype. Anchors BEN-004.
 * ────────────────────────────────────────────────────────────────────────── */

type NoticeKind = 'NOMNC' | 'DENC' | 'HHABN' | 'HHCCN'
type NoticeStatus = 'draft' | 'in-delivery' | 'acknowledged' | 'appeal-open' | 'closed'
type StatusFilter = 'all' | NoticeStatus
type KindFilter = 'all' | NoticeKind
type DetailTab = 'overview' | 'delivery' | 'appeal' | 'related'

type Notice = {
  id: string
  patientId: string
  kind: NoticeKind
  trigger: string
  deliverBy: string
  recipient: string
  status: NoticeStatus
  clockHours: number
  appealPath?: string
  purpose: string
}

const NOTICES: Notice[] = [
  {
    id: 'ben-1',
    patientId: 'pt-walter',
    kind: 'NOMNC',
    trigger: 'Service end proposed · skilled episode close',
    deliverBy: 'Tomorrow 5:00 PM',
    recipient: 'Beneficiary',
    status: 'draft',
    clockHours: 36,
    purpose:
      'Advance notice of Medicare non-coverage so the beneficiary can request expedited BFCC-QIO review before services end.',
  },
  {
    id: 'ben-2',
    patientId: 'pt-june',
    kind: 'DENC',
    trigger: 'Expedited appeal filed after NOMNC',
    deliverBy: 'Today 3:00 PM',
    recipient: 'Representative',
    status: 'in-delivery',
    clockHours: 6,
    appealPath: 'BFCC-QIO · Region 9 (synthetic)',
    purpose:
      'Detailed explanation of non-coverage with records packet for expedited QIO review clocks.',
  },
  {
    id: 'ben-3',
    patientId: 'pt-dorothy',
    kind: 'NOMNC',
    trigger: 'Discharge planning · planned episode end',
    deliverBy: 'Thu 12:00 PM',
    recipient: 'Beneficiary',
    status: 'acknowledged',
    clockHours: 0,
    purpose: 'Acknowledged NOMNC retained with delivery proof for permanent medical record.',
  },
  {
    id: 'ben-4',
    patientId: 'pt-margaret',
    kind: 'HHABN',
    trigger: 'Non-covered services discussion',
    deliverBy: 'Aug 8',
    recipient: 'Beneficiary',
    status: 'draft',
    clockHours: 72,
    purpose: 'Home health advance beneficiary notice for services that may not be covered.',
  },
  {
    id: 'ben-5',
    patientId: 'pt-elena',
    kind: 'HHCCN',
    trigger: 'Change of care · frequency reduction proposed',
    deliverBy: 'Aug 6',
    recipient: 'Caregiver on file',
    status: 'appeal-open',
    clockHours: 18,
    appealPath: 'Payer internal review (synthetic)',
    purpose: 'Home health change of care notice with appeal rights when coverage changes mid-episode.',
  },
]

const STATUS_META: Record<NoticeStatus, { tone: StatusTone; label: string }> = {
  draft: { tone: 'warn', label: 'Draft' },
  'in-delivery': { tone: 'progress', label: 'In delivery' },
  acknowledged: { tone: 'good', label: 'Acknowledged' },
  'appeal-open': { tone: 'bad', label: 'Appeal open' },
  closed: { tone: 'neutral', label: 'Closed' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'draft', label: 'Draft' },
  { key: 'in-delivery', label: 'In delivery' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'appeal-open', label: 'Appeal open' },
]

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All kinds' },
  { key: 'NOMNC', label: 'NOMNC' },
  { key: 'DENC', label: 'DENC' },
  { key: 'HHABN', label: 'HHABN' },
  { key: 'HHCCN', label: 'HHCCN' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'appeal', label: 'Appeal' },
  { key: 'related', label: 'Related' },
]

const NOTICE_FORMS = FORM_CATALOG.filter(
  f =>
    f.title.toLowerCase().includes('notice') ||
    f.title.toLowerCase().includes('hhahn') ||
    f.title.toLowerCase().includes('beneficiary') ||
    f.use.toLowerCase().includes('notice'),
)

function deliverDisabledReason(n: Notice): string | null {
  if (n.status === 'acknowledged' || n.status === 'closed') {
    return 'Already delivered and retained in this sample.'
  }
  if (n.status === 'appeal-open') return 'Appeal path open — amend via DENC / QIO packet, not re-deliver.'
  return null
}

export default function BeneficiaryNoticesScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(NOTICES[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [packetOpen, setPacketOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return NOTICES.filter(n => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (kindFilter !== 'all' && n.kind !== kindFilter) return false
      if (!q) return true
      const patient = getPatient(n.patientId)
      const hay = [
        n.id,
        n.kind,
        n.trigger,
        n.recipient,
        n.status,
        n.deliverBy,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, kindFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(n => n.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = NOTICES.find(n => n.id === selectedId) ?? null
  const openCount = NOTICES.filter(n => n.status === 'draft' || n.status === 'in-delivery').length
  const appealCount = NOTICES.filter(n => n.status === 'appeal-open').length
  const clockSensitive = NOTICES.filter(n => n.clockHours > 0 && n.clockHours <= 48).length
  const acknowledged = NOTICES.filter(n => n.status === 'acknowledged' || n.status === 'closed').length

  const selectNotice = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const deliverBlock = selected ? deliverDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain BEN · notices & appeals</div>
          <h1 className="screen-title">Beneficiary notices & appeals</h1>
          <div className="screen-sub">
            NOMNC, DENC, HHABN / HHCCN delivery clocks, acknowledgments, and expedited review —
            synthetic drills for BEN-004.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/forms')}>
            <FileText size={15} strokeWidth={2} aria-hidden />
            Forms library
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')}>
            Documents
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setPacketOpen(true)}>
            <Send size={15} strokeWidth={2} aria-hidden />
            Start NOMNC packet
          </button>
        </div>
      </div>

      <div className="ben-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no notice is delivered, acknowledged, or filed with a QIO.
          Production requires authorized BEN requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/beneficiary-notices" />

      <div className="ben-stats">
        <StatCard
          icon={<Bell size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Open notices"
          value={openCount}
          sub="Draft or in delivery"
          accent="warn"
        />
        <StatCard
          icon={<Scale size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Appeals active"
          value={appealCount}
          sub="BFCC-QIO / payer path (sample)"
          accent="bad"
        />
        <StatCard
          icon={<Clock3 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤48h"
          value={clockSensitive}
          sub="Clock-sensitive delivery"
          accent={clockSensitive > 0 ? 'orange' : 'good'}
        />
        <StatCard
          icon={<FileText size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Acknowledged / closed"
          value={acknowledged}
          sub="With delivery proof in sample"
          accent="good"
        />
      </div>

      <div className="ben-workspace">
        <section className="card ben-registry" aria-label="Notice registry">
          <div className="ben-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title ben-card-title">Notices & appeals</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="ben-toolbar">
            <label className="ben-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search notices</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, notice kind, or trigger"
              />
            </label>
            <div className="ben-filter-block">
              <span className="ben-filter-label" id="ben-status-filters">Status</span>
              <div className="ben-filters" role="toolbar" aria-labelledby="ben-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'ben-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ben-filter-block">
              <span className="ben-filter-label" id="ben-kind-filters">Kind</span>
              <div className="ben-filters" role="toolbar" aria-labelledby="ben-kind-filters">
                {KIND_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'ben-filter ben-filter-kind' + (kindFilter === f.key ? ' is-active' : '')}
                    aria-pressed={kindFilter === f.key}
                    onClick={() => setKindFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Bell size={26} strokeWidth={1.5} />}
              title="No notices match"
              sub="Clear filters or search. All notices are synthetic."
            />
          ) : (
            <div className="ben-list" role="listbox" aria-label="Notice list">
              {filtered.map(n => {
                const patient = getPatient(n.patientId)
                const meta = STATUS_META[n.status]
                const isSelected = n.id === selectedId
                return (
                  <button
                    key={n.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'ben-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectNotice(n.id)}
                  >
                    <span
                      className={
                        'ben-row-icon' +
                        (n.status === 'appeal-open' ? ' is-bad' : n.clockHours > 0 && n.clockHours <= 24 ? ' is-warn' : '')
                      }
                      aria-hidden
                    >
                      {n.status === 'appeal-open' ? (
                        <ShieldAlert size={16} strokeWidth={1.75} />
                      ) : (
                        <Bell size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="ben-row-main">
                      <span className="ben-row-top">
                        <span className="ben-id">{n.id}</span>
                        <span className="chip chip-neutral">{n.kind}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="ben-title">{n.trigger}</span>
                      <span className="ben-meta">
                        {patient ? (
                          <span className="ben-who">
                            <PatientAvatar
                              first={patient.firstName}
                              last={patient.lastName}
                              tone={patient.photoTone}
                              size="sm"
                            />
                            <span className="ben-who-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </span>
                        ) : null}
                        <span className="ben-dot" aria-hidden />
                        <span>Deliver by · {n.deliverBy}</span>
                        <span className="ben-dot" aria-hidden />
                        <span>{n.recipient}</span>
                      </span>
                    </span>
                    <ArrowRight className="ben-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="ben-inspector" aria-label="Notice inspector">
          {selected ? (
            <div className="card ben-inspector-card">
              <div className="ben-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title ben-card-title">
                    {selected.id} · {selected.kind}
                  </h2>
                  <p className="ben-inspector-title">{selected.trigger}</p>
                </div>
                <div className="ben-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  {selected.clockHours > 0 ? (
                    <StatusChip tone={selected.clockHours <= 24 ? 'warn' : 'neutral'}>
                      {selected.clockHours}h clock
                    </StatusChip>
                  ) : null}
                </div>
              </div>

              <div className="ben-tabs" role="tablist" aria-label="Notice detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'ben-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="ben-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="ben-panel">
                    {(() => {
                      const p = getPatient(selected.patientId)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          className="ben-drawer-patient"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <span>
                            <strong className="ben-who-name">
                              {p.firstName} {p.lastName}
                            </strong>
                            <span>
                              MRN {p.mrn} · open chart
                            </span>
                          </span>
                          <ArrowRight size={14} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })()}
                    <p className="ben-drawer-copy">{selected.purpose}</p>
                    <div className="ben-drawer-grid">
                      <div>
                        <span className="card-kicker">Deliver by</span>
                        <strong>{selected.deliverBy}</strong>
                        <span>Deadline · sample clock</span>
                      </div>
                      <div>
                        <span className="card-kicker">Recipient</span>
                        <strong>{selected.recipient}</strong>
                        <span>Beneficiary or representative</span>
                      </div>
                      <div>
                        <span className="card-kicker">Kind</span>
                        <strong>{selected.kind}</strong>
                        <span>Effective form version required</span>
                      </div>
                      <div>
                        <span className="card-kicker">Clock</span>
                        <strong>
                          {selected.clockHours > 0 ? `${selected.clockHours} hours remaining` : 'Satisfied'}
                        </strong>
                        <span>Not production timing</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'delivery' ? (
                  <div className="ben-panel">
                    <p className="ben-drawer-copy">
                      Delivery must be accessible, timed, and retained with acknowledgment or refusal.
                      Buttons below do not send mail, SMS, or portal messages.
                    </p>
                    <ul className="ben-timeline">
                      <li>
                        <strong>Trigger detected</strong>
                        <span>{selected.trigger}</span>
                      </li>
                      <li>
                        <strong>Form selected</strong>
                        <span>Effective {selected.kind} template from forms library (synthetic)</span>
                      </li>
                      <li>
                        <strong>Delivery attempt</strong>
                        <span>
                          {selected.status === 'draft'
                            ? 'Not started'
                            : selected.status === 'in-delivery'
                              ? 'In progress · channel pending proof'
                              : 'Completed with proof in sample'}
                        </span>
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'appeal' ? (
                  <div className="ben-panel">
                    {selected.appealPath || selected.status === 'appeal-open' ? (
                      <>
                        <div className="ben-callout is-bad" role="status">
                          <Scale size={16} strokeWidth={2} aria-hidden />
                          <div>
                            <strong>Appeal path</strong>
                            <span>{selected.appealPath ?? 'Expedited review available after NOMNC delivery.'}</span>
                          </div>
                        </div>
                        <p className="ben-drawer-copy">
                          Expedited tabletop must meet delivery, record-production, communication, service
                          continuation, and decision clocks without relying on memory (BEN-004).
                        </p>
                      </>
                    ) : (
                      <p className="ben-drawer-copy">
                        No active appeal on this notice. NOMNC delivery enables the beneficiary to request
                        BFCC-QIO review before services end.
                      </p>
                    )}
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="ben-panel">
                    <div className="ben-related-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/billing')}>
                        <Link2 size={13} strokeWidth={2} aria-hidden />
                        Billing
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/forms')}>
                        Forms library
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/documents')}>
                        Documents
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/legal-evidence')}
                      >
                        Legal evidence
                      </button>
                    </div>
                    {NOTICE_FORMS.length > 0 ? (
                      <ul className="ben-form-list">
                        {NOTICE_FORMS.slice(0, 3).map(f => (
                          <li key={f.id}>
                            <strong>{f.title}</strong>
                            <span>{f.use}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="ben-inspector-foot">
                <div className="ben-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/forms')}
                    title="Navigate only"
                  >
                    Open form template
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!deliverBlock}
                    title={deliverBlock ?? 'Visual only · no notice is delivered'}
                  >
                    Mark delivered
                  </button>
                </div>
                <p className="ben-drawer-footnote">
                  {deliverBlock
                    ? `Delivery disabled · ${deliverBlock}`
                    : 'Deliver / acknowledge / appeal controls are visual only. No notice is filed.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card ben-inspector-empty">
              <EmptyState
                icon={<Bell size={26} strokeWidth={1.5} />}
                title="Select a notice"
                sub="Inspect delivery clocks, appeal path, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={packetOpen}
        onClose={() => setPacketOpen(false)}
        title="Start NOMNC packet"
        sub="Review-only · nothing is delivered or signed"
      >
        <div className="ben-panel">
          <p className="ben-drawer-copy">
            Production calculates applicable NOMNC deadlines, preserves service-end and appeal-right
            language, identifies the beneficiary or representative, and retains final determinations.
          </p>
          <div className="ben-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPacketOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled
              title="Visual only · no NOMNC packet is created"
            >
              Create packet
            </button>
          </div>
          <p className="ben-drawer-footnote">Create is disabled. No durable write occurs in this prototype.</p>
        </div>
      </Drawer>
    </div>
  )
}
