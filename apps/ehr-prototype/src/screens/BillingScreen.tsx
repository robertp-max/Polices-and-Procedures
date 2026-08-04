import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3, Download,
  FlaskConical, RefreshCw, Send, ShieldCheck, Wallet,
} from 'lucide-react'
import type { Claim } from '../data/types'
import { claims } from '../data/clinical'
import { getPatient } from '../data/patients'
import { AUTHORIZATIONS, ROUTE_RELATED, WORK_QUEUE, type RelatedLink } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './bill.css'

const STATUS_LABEL: Record<Claim['status'], string> = {
  'claim-ready': 'Claim ready',
  holds: 'On hold',
  submitted: 'Submitted',
  paid: 'Paid',
  denied: 'Denied',
}

const STATUS_TONE: Record<Claim['status'], StatusTone> = {
  'claim-ready': 'good',
  holds: 'warn',
  submitted: 'progress',
  paid: 'good',
  denied: 'bad',
}

// Known hold reasons map to the workflow area that resolves them.
function holdResolution(hold: string, _patientId: string): { note: string; to: string } | null {
  const h = hold.toLowerCase()
  if (h.includes('signature') || h.includes('poc')) {
    return { note: 'Resolve in Orders', to: '/orders' }
  }
  if (h.includes('oasis')) {
    return { note: 'Resolve in OASIS', to: '/oasis' }
  }
  if (h.includes('auth') || h.includes('unit')) {
    return { note: 'Check authorizations', to: '/authorizations' }
  }
  return null
}

// Readiness reflects the claim's own hold reasons — a claim with an OASIS
// hold shows OASIS as pending, one with a signature hold shows orders pending.
function readinessChecklist(claim: Claim): { label: string; done: boolean }[] {
  const oasisHeld = claim.holds.some(h => h.toLowerCase().includes('oasis'))
  const ordersHeld = claim.holds.some(h => {
    const l = h.toLowerCase()
    return l.includes('signature') || l.includes('poc')
  })
  return [
    { label: 'Eligibility verified', done: true },
    { label: 'OASIS finalized', done: !oasisHeld },
    { label: 'Orders signed', done: !ordersHeld },
    { label: 'Visits documented', done: true },
  ]
}

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

/**
 * Patient-scoped Continue-in links for a claim.
 * Never fall back to Margaret's wq-3 (or any other patient's queue item).
 */
function relatedForClaim(patientId: string): RelatedLink[] {
  const forPatient = WORK_QUEUE.filter(w => w.patientId === patientId)
  const preferred =
    forPatient.find(w => w.domain === 'RCM')
    ?? forPatient[0]
  if (preferred?.related?.length) {
    return preferred.related
  }
  const routeLinks = ROUTE_RELATED['/billing'] ?? []
  const built: RelatedLink[] = [
    { to: `/patients/${patientId}`, label: 'Chart' },
    ...routeLinks,
  ]
  const seen = new Set<string>()
  return built.filter(link => {
    if (seen.has(link.to)) return false
    seen.add(link.to)
    return true
  })
}

export default function BillingScreen() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [recheckedAt, setRecheckedAt] = useState<string | null>(null)

  const selected = selectedId ? claims.find(c => c.id === selectedId) ?? null : null

  useEffect(() => { setRecheckedAt(null) }, [selectedId])

  const claimReady = claims.filter(c => c.status === 'claim-ready')
  const onHold = claims.filter(c => c.status === 'holds')
  const submitted = claims.filter(c => c.status === 'submitted')
  const paid = claims.filter(c => c.status === 'paid')
  const sum = (list: Claim[]) => list.reduce((total, c) => total + c.amount, 0)

  // Claims with open holds surface first so billers see blockers up front.
  const sortedClaims = claims
    .slice()
    .sort((a, b) => (b.holds.length > 0 ? 1 : 0) - (a.holds.length > 0 ? 1 : 0))

  function openDrawer(claim: Claim) {
    setSelectedId(claim.id)
  }

  function goToPatient(e: MouseEvent, patientId: string) {
    e.stopPropagation()
    navigate(`/patients/${patientId}`)
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Billing</h1>
          <div className="screen-sub">PDGM · August cycle</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/authorizations')}>Authorizations</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/beneficiary-notices')}>Notices</button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled
            title="Visual only · nothing is submitted"
          >
            <Download size={15} strokeWidth={2} aria-hidden />
            Export 837
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled
            title="Visual only · nothing is submitted"
          >
            <ShieldCheck size={15} strokeWidth={2} aria-hidden />
            Run claim check
          </button>
        </div>
      </div>

      <div className="bill-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · Export 837 and claim check are visual only — nothing is
          submitted to a payer or clearinghouse. Claims stay review-only in this prototype.
        </span>
      </div>

      <RelatedNav route="/billing" />

      <div className="bill-stats">
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} />}
          kicker="Claim-ready"
          value={claimReady.length}
          sub={`${money(sum(claimReady))} ready to submit`}
          accent="good"
        />
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} />}
          kicker="On hold"
          value={onHold.length}
          sub={`${money(sum(onHold))} blocked by holds`}
          accent="warn"
        />
        <StatCard
          icon={<Send size={16} strokeWidth={1.75} />}
          kicker="Submitted"
          value={submitted.length}
          sub={`${money(sum(submitted))} awaiting payer`}
          accent="teal"
        />
        <StatCard
          icon={<Wallet size={16} strokeWidth={1.75} />}
          kicker="Paid MTD"
          value={money(sum(paid))}
          sub={`${paid.length} claim paid this cycle`}
          accent="orange"
        />
      </div>

      <section className="card bill-table-card" aria-label="Claims">
        <div className="bill-table-head">
          <div>
            <div className="card-kicker">Revenue cycle</div>
            <h2 className="card-title" style={{ fontSize: 17 }}>Claims</h2>
          </div>
          <span className="chip chip-neutral">{claims.length} in cycle</span>
        </div>
        <div className="bill-table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Period</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Holds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedClaims.map(claim => {
                const p = getPatient(claim.patientId)!
                return (
                  <tr
                    key={claim.id}
                    className="is-clickable"
                    tabIndex={0}
                    role="button"
                    aria-label={`Open claim detail for ${p.firstName} ${p.lastName}, ${claim.period}`}
                    onClick={() => openDrawer(claim)}
                    onKeyDown={e => {
                      if (e.target !== e.currentTarget) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openDrawer(claim)
                      }
                    }}
                  >
                    <td>
                      <button type="button" className="bill-patient" onClick={e => goToPatient(e, p.id)}>
                        <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} size="sm" />
                        <span className="bill-patient-name">{p.firstName} {p.lastName}</span>
                      </button>
                    </td>
                    <td>{claim.period}</td>
                    <td>
                      <span className={'chip ' + (claim.type === 'Final' ? 'chip-teal' : 'chip-neutral')}>
                        {claim.type}
                      </span>
                    </td>
                    <td className="bill-amount">{money(claim.amount)}</td>
                    <td>
                      {claim.holds.length === 0 ? (
                        <span className="bill-dash">—</span>
                      ) : (
                        <div className="bill-holds">
                          {claim.holds.map(h => (
                            <span key={h} className="chip chip-warn">{h}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusChip tone={STATUS_TONE[claim.status]}>{STATUS_LABEL[claim.status]}</StatusChip>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="card bill-note">
        <ShieldCheck size={17} strokeWidth={1.75} aria-hidden />
        <p>
          Claims are assembled automatically from documentation — nothing is submitted without biller
          review. Export 837 and Run claim check are visual only in this prototype.
        </p>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? (() => {
          const p = getPatient(selected.patientId)!
          return `${p.firstName} ${p.lastName}`
        })() : ''}
        sub={selected ? `${selected.period} · ${selected.type}` : undefined}
      >
        {selected ? (() => {
          const related = relatedForClaim(selected.patientId)
          const relatedTos = new Set(related.map(r => r.to))
          const hasAuth = !!AUTHORIZATIONS.find(a => a.patientId === selected.patientId)
          return (
            <div className="bill-drawer">
              <div className="bill-drawer-summary">
                <div className="bill-drawer-fact">
                  <div className="bill-drawer-fact-label">Amount</div>
                  <div className="bill-drawer-fact-value bill-amount">{money(selected.amount)}</div>
                </div>
                <div className="bill-drawer-fact">
                  <div className="bill-drawer-fact-label">Type</div>
                  <div className="bill-drawer-fact-value">
                    <span className={'chip ' + (selected.type === 'Final' ? 'chip-teal' : 'chip-neutral')}>
                      {selected.type}
                    </span>
                  </div>
                </div>
                <div className="bill-drawer-fact">
                  <div className="bill-drawer-fact-label">Status</div>
                  <div className="bill-drawer-fact-value">
                    <StatusChip tone={STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</StatusChip>
                  </div>
                </div>
              </div>

              {selected.holds.length > 0 ? (
                <div className="bill-drawer-section">
                  <div className="card-kicker">Holds</div>
                  <ul className="bill-checklist">
                    {selected.holds.map(hold => {
                      const res = holdResolution(hold, selected.patientId)
                      return (
                        <li key={hold} className="bill-checklist-item is-pending">
                          <AlertTriangle size={15} strokeWidth={2} aria-hidden />
                          <span className="bill-checklist-label">{hold}</span>
                          {res ? (
                            <button
                              type="button"
                              className="btn-inline bill-hold-link"
                              onClick={() => { setSelectedId(null); navigate(res.to) }}
                            >
                              {res.note}
                              <ArrowRight size={12} strokeWidth={2.25} aria-hidden />
                            </button>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}

              <div className="bill-drawer-section">
                <div className="card-kicker">Readiness checklist</div>
                <ul className="bill-checklist">
                  {readinessChecklist(selected).map(item => (
                    <li key={item.label} className={'bill-checklist-item ' + (item.done ? 'is-done' : 'is-pending')}>
                      {item.done
                        ? <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                        : <Clock3 size={15} strokeWidth={2} aria-hidden />}
                      <span className="bill-checklist-label">{item.label}</span>
                      {!item.done ? <span className="chip chip-warn">Pending</span> : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bill-drawer-section">
                <div className="card-kicker">Continue in</div>
                <div className="bill-related-actions">
                  {!relatedTos.has('/authorizations') ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(null); navigate('/authorizations') }}>Authorizations</button>
                  ) : null}
                  {!relatedTos.has('/oasis') ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(null); navigate('/oasis') }}>OASIS</button>
                  ) : null}
                  {!relatedTos.has('/beneficiary-notices') ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(null); navigate('/beneficiary-notices') }}>Beneficiary notices</button>
                  ) : null}
                  {!relatedTos.has('/orders') ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(null); navigate('/orders') }}>Orders</button>
                  ) : null}
                  {related.map(r => (
                    <button
                      key={r.to + r.label}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSelectedId(null); navigate(r.to) }}
                    >
                      {r.label}
                    </button>
                  ))}
                  {hasAuth && !relatedTos.has('/authorizations') ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(null); navigate('/authorizations') }}>Auth units</button>
                  ) : null}
                </div>
              </div>

              <hr className="divider" />

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setRecheckedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}
              >
                <RefreshCw size={14} strokeWidth={2} aria-hidden />
                Recheck readiness
              </button>
              {recheckedAt ? (
                <div className="bill-recheck-note">Readiness rechecked at {recheckedAt} · no change</div>
              ) : null}
              <p className="bill-drawer-footnote">
                Export 837 / claim check / submit are visual only · nothing is submitted in this prototype.
              </p>
            </div>
          )
        })() : null}
      </Drawer>
    </div>
  )
}
