import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3, Download,
  RefreshCw, Send, ShieldCheck, Wallet,
} from 'lucide-react'
import type { Claim } from '../data/types'
import { claims } from '../data/clinical'
import { getPatient } from '../data/patients'
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
function holdResolution(hold: string, patientId: string): { note: string; to: string } | null {
  const h = hold.toLowerCase()
  if (h.includes('signature') || h.includes('poc')) {
    return { note: 'Resolve in Orders', to: '/orders' }
  }
  if (h.includes('oasis')) {
    return { note: 'Resolve in Assessments', to: `/patients/${patientId}/assessments` }
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
          <button className="btn btn-secondary">
            <Download size={15} strokeWidth={2} aria-hidden />
            Export 837
          </button>
          <button className="btn btn-primary">
            <ShieldCheck size={15} strokeWidth={2} aria-hidden />
            Run claim check
          </button>
        </div>
      </div>

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
                      <button className="bill-patient" onClick={e => goToPatient(e, p.id)}>
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
        <p>Claims are assembled automatically from documentation — nothing is submitted without biller review.</p>
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
        {selected ? (
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

            <hr className="divider" />

            <button className="btn btn-primary" onClick={() => setRecheckedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}>
              <RefreshCw size={14} strokeWidth={2} aria-hidden />
              Recheck readiness
            </button>
            {recheckedAt ? (
              <div className="bill-recheck-note">Readiness rechecked at {recheckedAt} · no change</div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
