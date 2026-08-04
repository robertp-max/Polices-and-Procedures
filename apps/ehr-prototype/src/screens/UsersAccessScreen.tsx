import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  FlaskConical,
  KeyRound,
  Link2,
  Search,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import { ACCESS_PRINCIPALS } from '../data/workspace'
import type { AccessAccountStatus, AccessPrincipal, AccessPrincipalKind } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './iam.css'

type StatusFilter = 'all' | AccessAccountStatus
type KindFilter = 'all' | AccessPrincipalKind
type DetailTab = 'overview' | 'scopes' | 'review'

const STATUS_META: Record<AccessAccountStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  disabled: { tone: 'neutral', label: 'Disabled' },
  'pending-invite': { tone: 'progress', label: 'Pending invite' },
  'review-due': { tone: 'warn', label: 'Review due' },
}

const KIND_META: Record<AccessPrincipalKind, string> = {
  workforce: 'Workforce',
  service: 'Service',
  contractor: 'Contractor',
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'review-due', label: 'Review due' },
  { key: 'pending-invite', label: 'Pending invite' },
  { key: 'disabled', label: 'Disabled' },
]

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All kinds' },
  { key: 'workforce', label: 'Workforce' },
  { key: 'service', label: 'Service' },
  { key: 'contractor', label: 'Contractor' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'scopes', label: 'Scopes' },
  { key: 'review', label: 'Review' },
]

function revokeBlocked(p: AccessPrincipal): string | null {
  if (p.status === 'disabled') return 'Already disabled in this sample.'
  if (p.kind === 'service' && p.status === 'active') {
    return 'Service account revoke requires dual owner approval in production design. Prototype does not demonstrate a maker/checker workflow.'
  }
  return null
}

export default function UsersAccessScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(ACCESS_PRINCIPALS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ACCESS_PRINCIPALS.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (kindFilter !== 'all' && p.kind !== kindFilter) return false
      if (!q) return true
      const hay = [p.id, p.name, p.role, p.owner, p.review, ...p.scopes, ...p.reqIds]
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
    if (!selectedId || !filtered.some(p => p.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = ACCESS_PRINCIPALS.find(p => p.id === selectedId) ?? null
  const activeCount = ACCESS_PRINCIPALS.filter(p => p.status === 'active').length
  const reviewDue = ACCESS_PRINCIPALS.filter(p => p.status === 'review-due').length
  const breakGlass = ACCESS_PRINCIPALS.filter(p => p.breakGlass).length
  const pending = ACCESS_PRINCIPALS.filter(p => p.status === 'pending-invite').length
  const revokeBlock = selected ? revokeBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain IAM · users & access</div>
          <h1 className="screen-title">Users & access</h1>
          <div className="screen-sub">
            Workforce identity, least privilege, break-glass, and access review — synthetic directory.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/security')}>
            Security
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/org-master')}>
            Org master
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no invite is sent"
          >
            <UserPlus size={15} strokeWidth={2} aria-hidden />
            Invite user
          </button>
        </div>
      </div>

      <div className="iam-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no directory write, privilege grant, or break-glass elevation
          is recorded. Production requires authorized IAM requirements and dual-control for privileged roles. This prototype does not demonstrate a maker/checker workflow — revoke / invite look like single approve.
        </span>
      </div>

      <RelatedNav route="/users-access" />

      <div className="iam-stats">
        <StatCard
          icon={<Users size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active principals"
          value={activeCount}
          sub={`${ACCESS_PRINCIPALS.length} in sample register`}
          accent="teal"
        />
        <StatCard
          icon={<KeyRound size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Access reviews due"
          value={reviewDue}
          sub="Quarterly cadence sample"
          accent={reviewDue === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Break-glass (30d)"
          value={breakGlass}
          sub="Reviewed when present"
          accent="orange"
        />
        <StatCard
          icon={<UserPlus size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending invites"
          value={pending}
          sub="MFA not yet established"
          accent={pending === 0 ? 'good' : 'warn'}
        />
      </div>

      <div className="iam-workspace">
        <section className="card" aria-label="Access principal directory">
          <div className="iam-card-head">
            <div>
              <div className="card-kicker">Directory</div>
              <h2 className="card-title iam-card-title">Principals</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="iam-toolbar">
            <label className="iam-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search users</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search name, role, scope, or requirement"
              />
            </label>
            <div>
              <span className="iam-filter-label" id="iam-status-filters">Status</span>
              <div className="iam-filters" role="toolbar" aria-labelledby="iam-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'iam-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="iam-filter-label" id="iam-kind-filters">Kind</span>
              <div className="iam-filters" role="toolbar" aria-labelledby="iam-kind-filters">
                {KIND_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'iam-filter' + (kindFilter === f.key ? ' is-active' : '')}
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
              icon={<Users size={26} strokeWidth={1.5} />}
              title="No principals match"
              sub="Clear filters or search. Directory is synthetic."
            />
          ) : (
            <div className="iam-list" role="listbox" aria-label="Principal list">
              {filtered.map(p => {
                const meta = STATUS_META[p.status]
                const isSelected = p.id === selectedId
                const iconClass =
                  p.status === 'disabled'
                    ? ' is-bad'
                    : p.status === 'review-due' || p.mfa === 'off'
                      ? ' is-warn'
                      : ''
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'iam-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(p.id)}
                  >
                    <span className={'iam-row-icon' + iconClass} aria-hidden>
                      {p.kind === 'service' ? (
                        <Bot size={16} strokeWidth={1.75} />
                      ) : (
                        <Users size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="iam-row-main">
                      <span className="iam-row-top">
                        <span className="iam-id">{p.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{KIND_META[p.kind]}</span>
                        {p.mfa === 'off' ? <span className="chip chip-warn">MFA off</span> : null}
                      </span>
                      <span className="iam-title">{p.name}</span>
                      <span className="iam-meta">
                        {p.role} · last access {p.lastAccess}
                      </span>
                      <span className="iam-meta">Review · {p.review}</span>
                    </span>
                    <ArrowRight className="iam-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="iam-inspector" aria-label="Principal inspector">
          {selected ? (
            <div className="card iam-inspector-card">
              <div className="iam-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title iam-card-title">{selected.id}</h2>
                  <p className="iam-inspector-title">{selected.name}</p>
                </div>
                <div className="iam-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone="neutral">{KIND_META[selected.kind]}</StatusChip>
                  <StatusChip
                    tone={
                      selected.mfa === 'on' ? 'good' : selected.mfa === 'off' ? 'warn' : 'neutral'
                    }
                  >
                    MFA {selected.mfa === 'n/a' ? 'N/A' : selected.mfa}
                  </StatusChip>
                </div>
              </div>

              <div className="iam-tabs" role="tablist" aria-label="Principal detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'iam-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="iam-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="iam-panel">
                    {selected.breakGlass ? (
                      <div className="iam-callout" role="status">
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Break-glass history</strong>
                          <span>{selected.breakGlass}</span>
                        </div>
                      </div>
                    ) : null}
                    {selected.status === 'review-due' ? (
                      <div className="iam-callout" role="status">
                        <KeyRound size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Access review due</strong>
                          <span>
                            Owner {selected.owner} must recertify scopes. No silent auto-renew in
                            production design.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {selected.status === 'disabled' ? (
                      <div className="iam-callout is-bad" role="status">
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Account disabled</strong>
                          <span>Same-day revoke target · sample only.</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="iam-grid">
                      <div>
                        <span className="card-kicker">Role</span>
                        <strong>{selected.role}</strong>
                        <span>{KIND_META[selected.kind]}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Last access {selected.lastAccess}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Review</span>
                        <strong>{selected.review}</strong>
                        <span>Prototype labels</span>
                      </div>
                      <div>
                        <span className="card-kicker">MFA</span>
                        <strong>{selected.mfa === 'n/a' ? 'Not applicable' : selected.mfa}</strong>
                        <span>Service accounts use key rotation</span>
                      </div>
                    </div>
                    <div className="iam-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="iam-related-actions">
                        {selected.related.map(r => (
                          <button
                            key={r.to + r.label}
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(r.to)}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="iam-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="iam-req-link"
                              onClick={() => navigate('/requirements')}
                            >
                              {id}
                            </button>
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'scopes' ? (
                  <div className="iam-panel">
                    <p className="iam-copy">
                      Scopes are declarative samples. Production enforces least privilege with audit
                      on every grant.
                    </p>
                    <ul className="iam-scope-list">
                      {selected.scopes.map(s => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'review' ? (
                  <div className="iam-panel">
                    <p className="iam-copy">
                      Access review does not auto-approve. Certify, reduce, or revoke — visual only here.
                    </p>
                    <div className="iam-grid">
                      <div>
                        <span className="card-kicker">Cadence</span>
                        <strong>Quarterly workforce · annual service</strong>
                        <span>Sample policy</span>
                      </div>
                      <div>
                        <span className="card-kicker">Current state</span>
                        <strong>{selected.review}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      title="Visual only · no break-glass log is opened"
                    >
                      Break-glass log
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="iam-inspector-foot">
                <div className="iam-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no break-glass elevation"
                  >
                    <ShieldAlert size={14} strokeWidth={2} aria-hidden />
                    Break-glass
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!revokeBlock}
                    title={revokeBlock ?? 'Visual only · single-button revoke is not maker/checker · no revoke is written'}
                  >
                    Revoke access
                  </button>
                </div>
                <p className="iam-footnote">
                  {revokeBlock
                    ? `Revoke disabled · ${revokeBlock} No directory write occurs. Prototype does not demonstrate a maker/checker workflow.`
                    : 'Invite / revoke / break-glass look like single-person actions. Prototype does not demonstrate a maker/checker workflow — no second approver is captured and no access change is recorded.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card iam-inspector-empty">
              <EmptyState
                icon={<Users size={26} strokeWidth={1.5} />}
                title="Select a principal"
                sub="Inspect scopes, MFA, and access review state."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
