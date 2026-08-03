import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Bell, CheckCircle2, Clock3, FileText, FlaskConical,
  PackageCheck, Pencil, Pill, Plus, Send, Stethoscope, ClipboardList,
} from 'lucide-react'
import { orders } from '../data/clinical'
import { getPatient } from '../data/patients'
import type { Order } from '../data/types'
import { Drawer, PatientAvatar, StatCard, StatusChip, Tabs } from '../ui'
import type { StatusTone } from '../ui'
import './ord.css'

/* ---------- Static lookups (view-layer presentation only — no PHI) ---------- */

const CATEGORY_META: Record<Order['category'], { label: string; chip: string; icon: React.ReactNode }> = {
  medication: { label: 'Medication', chip: 'chip-brand', icon: <Pill size={11} strokeWidth={2} aria-hidden /> },
  'plan-of-care': { label: 'Plan of care', chip: 'chip-teal', icon: <ClipboardList size={11} strokeWidth={2} aria-hidden /> },
  lab: { label: 'Lab', chip: 'chip-neutral', icon: <FlaskConical size={11} strokeWidth={2} aria-hidden /> },
  dme: { label: 'DME', chip: 'chip-neutral', icon: <PackageCheck size={11} strokeWidth={2} aria-hidden /> },
  referral: { label: 'Referral', chip: 'chip-neutral', icon: <Stethoscope size={11} strokeWidth={2} aria-hidden /> },
}

const STATUS_META: Record<Order['status'], { tone: StatusTone; label: string }> = {
  draft: { tone: 'neutral', label: 'Draft' },
  sent: { tone: 'progress', label: 'Sent' },
  'pending-signature': { tone: 'warn', label: 'Pending signature' },
  signed: { tone: 'good', label: 'Signed' },
  declined: { tone: 'bad', label: 'Declined' },
}

const DUE_WARN = new Set(['In 4 hours', 'Today', 'Before SOC'])

type TabKey = 'all' | Order['status']

const TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending-signature', label: 'Pending signature' },
  { key: 'sent', label: 'Sent' },
  { key: 'signed', label: 'Signed' },
  { key: 'draft', label: 'Draft' },
]

// Synthetic per-order timeline — illustrative only, not a real audit trail.
const ORDER_TIMELINES: Record<string, { label: string; when: string }[]> = {
  'ord-1': [
    { label: 'Order created', when: 'Jul 29' },
    { label: 'Sent to physician', when: 'Jul 29' },
    { label: 'Viewed by Dr. Cho', when: 'Today · 9:41 AM' },
  ],
  'ord-2': [
    { label: 'Order created', when: 'Jul 29' },
    { label: 'Sent to physician', when: 'Jul 29' },
    { label: 'Awaiting physician response', when: 'Due today' },
  ],
  'ord-3': [
    { label: 'Order created', when: 'Jul 30' },
    { label: 'Sent to physician', when: 'Jul 30' },
    { label: 'Signed by Dr. Cho', when: 'Jul 30' },
  ],
  'ord-4': [
    { label: 'Order created', when: 'Jul 30' },
    { label: 'Sent to physician', when: 'Jul 30' },
    { label: 'Awaiting DME confirmation', when: 'Due Aug 6' },
  ],
  'ord-5': [
    { label: 'Order created', when: 'Aug 1' },
    { label: 'Sent to physician', when: 'Aug 1' },
    { label: 'Awaiting signature', when: 'Due Aug 5' },
  ],
  'ord-6': [
    { label: 'Order created', when: 'Jul 31' },
    { label: 'Sent to physician', when: 'Jul 31' },
    { label: 'Signed by Dr. Raman', when: 'Jul 31' },
  ],
  'ord-7': [
    { label: 'Order created', when: 'Aug 2' },
    { label: 'Sent to physician', when: 'Aug 2' },
    { label: 'Awaiting physician response', when: 'Due Aug 5' },
  ],
  'ord-8': [
    { label: 'Order created', when: 'Aug 2' },
    { label: 'Sent to physician', when: 'Aug 2' },
    { label: 'Awaiting signature', when: 'Needed before SOC' },
  ],
  'ord-9': [
    { label: 'Order drafted', when: 'Aug 2' },
  ],
  'ord-10': [
    { label: 'Order created', when: 'Aug 1' },
    { label: 'Sent to physician', when: 'Aug 1' },
    { label: 'Signed by Dr. Cho', when: 'Aug 1' },
  ],
}

const PHYSICIAN_CONTACTS: Record<string, { phone: string; fax: string }> = {
  'Dr. Susan Cho': { phone: '(408) 555-0142', fax: '(408) 555-0143' },
  'Dr. Leo Vance': { phone: '(408) 555-0178', fax: '(408) 555-0179' },
  'Dr. Priya Raman': { phone: '(408) 555-0165', fax: '(408) 555-0166' },
  'Dr. Marcus Oh': { phone: '(408) 555-0190', fax: '(408) 555-0191' },
}

export default function OrdersScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('all')
  const [selected, setSelected] = useState<Order | null>(null)

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: orders.length, 'pending-signature': 0, sent: 0, signed: 0, draft: 0, declined: 0 }
    for (const o of orders) c[o.status]++
    return c
  }, [])

  const filtered = useMemo(
    () => (tab === 'all' ? orders : orders.filter(o => o.status === tab)),
    [tab],
  )

  const openOrder = (o: Order) => setSelected(o)
  const goToPatientOrders = (patientId: string) => navigate(`/patients/${patientId}/orders`)

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Orders</h1>
          <div className="screen-sub">4 open · 1 signature overdue soon</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-primary">
            <Plus size={15} strokeWidth={2.25} aria-hidden />
            New order
          </button>
        </div>
      </div>

      <div className="ord-stats">
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} />}
          kicker="Pending signature"
          value={counts['pending-signature']}
          sub="1 overdue in 4 hours"
          accent="warn"
        />
        <StatCard
          icon={<Send size={16} strokeWidth={1.75} />}
          kicker="Sent"
          value={counts.sent}
          sub="Awaiting physician response"
          accent="teal"
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} />}
          kicker="Signed"
          value={counts.signed}
          sub="Filed to the chart"
          accent="good"
        />
        <StatCard
          icon={<FileText size={16} strokeWidth={1.75} />}
          kicker="Draft"
          value={counts.draft}
          sub="Not yet sent"
          accent="orange"
        />
      </div>

      <Tabs
        items={TAB_ITEMS.map(t => ({ key: t.key, label: t.label, count: counts[t.key] }))}
        active={tab}
        onChange={k => setTab(k as TabKey)}
      />

      <section className="card ord-card" aria-label="Orders list">
        <div className="ord-card-head">
          <div className="card-kicker">Orders control center</div>
          <div className="ord-result-count">Showing {filtered.length} of {orders.length} orders</div>
        </div>

        <div className="ord-table-wrap">
          <table className="table ord-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Patient</th>
                <th>Category</th>
                <th>Ordered by</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const patient = getPatient(o.patientId)
                const cat = CATEGORY_META[o.category]
                const status = STATUS_META[o.status]
                const dueIsWarn = !!o.due && DUE_WARN.has(o.due)
                return (
                  <tr
                    key={o.id}
                    className="is-clickable"
                    tabIndex={0}
                    role="button"
                    aria-label={`Open order detail for ${o.summary}`}
                    onClick={() => openOrder(o)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openOrder(o)
                      }
                    }}
                  >
                    <td>
                      <div className="ord-summary-cell">
                        <span className="ord-summary-title">{o.summary}</span>
                        {o.urgent ? (
                          <span className="chip chip-bad ord-urgent-chip">
                            <AlertTriangle size={11} strokeWidth={2.25} aria-hidden />
                            Urgent
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      {patient ? (
                        <button
                          type="button"
                          className="ord-patient-cell"
                          onClick={e => {
                            e.stopPropagation()
                            goToPatientOrders(patient.id)
                          }}
                        >
                          <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                          <span className="ord-patient-name">{patient.firstName} {patient.lastName}</span>
                        </button>
                      ) : (
                        <span className="ord-patient-name">Unknown patient</span>
                      )}
                    </td>
                    <td>
                      <span className={'chip ' + cat.chip}>
                        {cat.icon}
                        {cat.label}
                      </span>
                    </td>
                    <td>
                      <div className="ord-by-cell">
                        <span className="ord-by-name">{o.orderedBy}</span>
                        <span className="ord-by-date">{o.date}</span>
                      </div>
                    </td>
                    <td>
                      {o.due ? (
                        dueIsWarn ? (
                          <span className="chip chip-warn">
                            <Clock3 size={11} strokeWidth={2.25} aria-hidden />
                            {o.due}
                          </span>
                        ) : (
                          <span className="ord-due-plain">{o.due}</span>
                        )
                      ) : (
                        <span className="ord-due-plain">—</span>
                      )}
                    </td>
                    <td>
                      <StatusChip tone={status.tone}>{status.label}</StatusChip>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.summary : ''}
        sub={selected ? `${CATEGORY_META[selected.category].label} · ${STATUS_META[selected.status].label}` : undefined}
      >
        {selected ? (() => {
          const patient = getPatient(selected.patientId)
          const timeline = ORDER_TIMELINES[selected.id] ?? []
          const contact = PHYSICIAN_CONTACTS[selected.orderedBy]
          return (
            <>
              {patient ? (
                <section className="ord-drawer-section">
                  <button
                    type="button"
                    className="ord-drawer-patient"
                    onClick={() => goToPatientOrders(patient.id)}
                  >
                    <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} />
                    <span className="ord-drawer-patient-info">
                      <span className="ord-drawer-patient-name">{patient.firstName} {patient.lastName}</span>
                      <span className="ord-drawer-patient-meta">MRN {patient.mrn} · {patient.payer}</span>
                    </span>
                  </button>
                </section>
              ) : null}

              <section className="ord-drawer-section">
                <div className="card-kicker">Order</div>
                <p className="ord-drawer-summary">{selected.summary}</p>
                <div className="ord-drawer-tags">
                  <span className={'chip ' + CATEGORY_META[selected.category].chip}>
                    {CATEGORY_META[selected.category].icon}
                    {CATEGORY_META[selected.category].label}
                  </span>
                  {selected.urgent ? (
                    <span className="chip chip-bad">
                      <AlertTriangle size={11} strokeWidth={2.25} aria-hidden />
                      Urgent
                    </span>
                  ) : null}
                </div>
                <div className="ord-drawer-meta-grid">
                  <div>
                    <div className="ord-drawer-meta-label">Ordered by</div>
                    <div className="ord-drawer-meta-value">{selected.orderedBy}</div>
                  </div>
                  <div>
                    <div className="ord-drawer-meta-label">Date</div>
                    <div className="ord-drawer-meta-value">{selected.date}</div>
                  </div>
                  <div>
                    <div className="ord-drawer-meta-label">Due</div>
                    <div className="ord-drawer-meta-value">{selected.due ?? '—'}</div>
                  </div>
                </div>
              </section>

              <hr className="divider" />

              <section className="ord-drawer-section">
                <div className="card-kicker">Order timeline</div>
                <ol className="ord-timeline">
                  {timeline.map((t, i) => (
                    <li key={t.label} className="ord-timeline-item">
                      <span className="ord-timeline-rail" aria-hidden>
                        <span className="ord-timeline-dot" />
                        {i < timeline.length - 1 ? <span className="ord-timeline-line" /> : null}
                      </span>
                      <span className="ord-timeline-body">
                        <span className="ord-timeline-label">{t.label}</span>
                        <span className="ord-timeline-when">{t.when}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <hr className="divider" />

              <section className="ord-drawer-section">
                <div className="card-kicker">Physician contact</div>
                <div className="ord-contact-card">
                  <div className="ord-contact-name">{selected.orderedBy}</div>
                  {contact ? (
                    <div className="ord-contact-detail">
                      Phone {contact.phone} · Fax {contact.fax}
                    </div>
                  ) : (
                    <div className="ord-contact-detail">Contact details not on file</div>
                  )}
                </div>
              </section>

              <div className="ord-drawer-actions">
                <button className="btn btn-primary">
                  <Bell size={15} strokeWidth={2} aria-hidden />
                  Send reminder
                </button>
                <button className="btn btn-secondary">
                  <Pencil size={15} strokeWidth={2} aria-hidden />
                  Edit order
                </button>
              </div>
            </>
          )
        })() : null}
      </Drawer>
    </div>
  )
}
