import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  Pill,
  Search,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'
import { medications } from '../data/clinical'
import { getPatient, patients } from '../data/patients'
import type { Medication } from '../data/types'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './med.css'

type MedStatus = Medication['status']
type StatusFilter = 'all' | MedStatus
type RiskFilter = 'all' | 'high-risk' | 'needs-review'

const STATUS_META: Record<MedStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  held: { tone: 'warn', label: 'Held' },
  discontinued: { tone: 'neutral', label: 'Discontinued' },
  'needs-review': { tone: 'bad', label: 'Needs review' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'needs-review', label: 'Needs review' },
  { key: 'held', label: 'Held' },
  { key: 'discontinued', label: 'Discontinued' },
]

const RISK_FILTERS: { key: RiskFilter; label: string }[] = [
  { key: 'all', label: 'All risks' },
  { key: 'high-risk', label: 'High-risk' },
  { key: 'needs-review', label: 'Needs review' },
]

function reconcileDisabledReason(med: Medication): string | null {
  if (med.status === 'discontinued') return 'Discontinued meds are not reconciled on this path.'
  if (med.status === 'active' && !med.highRisk && !med.note) {
    return 'No open discrepancy on this sample item.'
  }
  return null
}

export default function MedicationsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(medications[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return medications.filter(med => {
      if (statusFilter !== 'all' && med.status !== statusFilter) return false
      if (riskFilter === 'high-risk' && !med.highRisk) return false
      if (riskFilter === 'needs-review' && med.status !== 'needs-review') return false
      if (!q) return true
      const patient = getPatient(med.patientId)
      const hay = [
        med.id,
        med.name,
        med.dose,
        med.route,
        med.frequency,
        med.note ?? '',
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, riskFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(m => m.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = medications.find(m => m.id === selectedId) ?? null
  const activeCount = medications.filter(m => m.status === 'active' || m.status === 'needs-review').length
  const reviewCount = medications.filter(m => m.status === 'needs-review').length
  const highRiskCount = medications.filter(m => m.highRisk).length
  const allergyCount = patients.reduce((n, p) => n + p.allergies.length, 0)
  const reconcileBlock = selected ? reconcileDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain CLN · medications & allergies</div>
          <h1 className="screen-title">Medications & allergies</h1>
          <div className="screen-sub">
            Sourced lists, high-risk flags, and reconciliation proposals — never auto-filed without
            clinician intent.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/orders')}>
            Orders
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clinical')}>
            Clinical desk
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no reconciliation is filed"
            onClick={() => {
              const next = medications.find(m => m.status === 'needs-review' || m.highRisk)
              if (next) setSelectedId(next.id)
            }}
          >
            <Pill size={15} strokeWidth={2} aria-hidden />
            Start reconciliation
          </button>
        </div>
      </div>

      <div className="med-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · reconcile, hold, or discontinue actions do not write the legal
          medication list. Production requires authorized CLN-004 requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/medications" />

      <div className="med-stats">
        <StatCard
          icon={<Pill size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active / review"
          value={activeCount}
          sub={`${medications.length} meds in sample set`}
          accent="teal"
        />
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Needs review"
          value={reviewCount}
          sub="Clinician resolution required"
          accent={reviewCount === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="High-risk flags"
          value={highRiskCount}
          sub="Anticoagulant, opioid, insulin, etc."
          accent={highRiskCount === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<Stethoscope size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Allergies (patients)"
          value={allergyCount}
          sub="Across synthetic patient roster"
          accent="orange"
        />
      </div>

      <div className="med-workspace">
        <section className="card med-registry" aria-label="Medication list">
          <div className="med-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title med-card-title">Medications</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="med-toolbar">
            <label className="med-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search medications</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search drug, dose, patient, or note"
              />
            </label>

            <div className="med-filter-block">
              <span className="med-filter-label" id="med-status-filters">Status</span>
              <div className="med-filters" role="toolbar" aria-labelledby="med-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'med-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="med-filter-block">
              <span className="med-filter-label" id="med-risk-filters">Risk</span>
              <div className="med-filters" role="toolbar" aria-labelledby="med-risk-filters">
                {RISK_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'med-filter med-filter-risk' + (riskFilter === f.key ? ' is-active' : '')}
                    aria-pressed={riskFilter === f.key}
                    onClick={() => setRiskFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Pill size={26} strokeWidth={1.5} />}
              title="No medications match"
              sub="Clear filters or search. All medications are synthetic."
            />
          ) : (
            <div className="med-list" role="listbox" aria-label="Medication list">
              {filtered.map(med => {
                const patient = getPatient(med.patientId)
                const meta = STATUS_META[med.status]
                const isSelected = med.id === selectedId
                return (
                  <button
                    key={med.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'med-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(med.id)}
                  >
                    <span
                      className={
                        'med-row-icon' +
                        (med.status === 'needs-review'
                          ? ' is-review'
                          : med.highRisk
                            ? ' is-risk'
                            : '')
                      }
                      aria-hidden
                    >
                      {med.highRisk || med.status === 'needs-review' ? (
                        <ShieldAlert size={16} strokeWidth={1.75} />
                      ) : (
                        <Pill size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="med-row-main">
                      <span className="med-row-top">
                        <span className="med-id">{med.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        {med.highRisk ? <StatusChip tone="warn">High-risk</StatusChip> : null}
                      </span>
                      <span className="med-title">{med.name}</span>
                      <span className="med-matter">
                        {med.dose} · {med.route} · {med.frequency}
                      </span>
                      <span className="med-meta">
                        {patient ? (
                          <span className="med-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="med-who-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </span>
                        ) : (
                          <span className="med-who-soft">No patient</span>
                        )}
                        <span className="med-dot" aria-hidden />
                        <span>Started {med.startDate}</span>
                      </span>
                    </span>
                    <ArrowRight className="med-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="med-inspector" aria-label="Medication inspector">
          {selected ? (
            <div className="card med-inspector-card">
              <div className="med-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title med-card-title">{selected.name}</h2>
                  <p className="med-inspector-title">
                    {selected.dose} · {selected.route} · {selected.frequency}
                  </p>
                </div>
                <div className="med-status-row">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  {selected.highRisk ? <StatusChip tone="warn">High-risk</StatusChip> : null}
                </div>
              </div>

              <div className="med-inspector-body">
                {(() => {
                  const p = getPatient(selected.patientId)
                  if (!p) return null
                  return (
                    <>
                      <button
                        type="button"
                        className="med-patient"
                        onClick={() => navigate(`/patients/${p.id}`)}
                      >
                        <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                        <span>
                          <strong>
                            {p.firstName} {p.lastName}
                          </strong>
                          <span>
                            MRN {p.mrn} · open chart
                          </span>
                        </span>
                        <ArrowRight size={14} strokeWidth={2} aria-hidden />
                      </button>

                      {p.allergies.length > 0 ? (
                        <div className="med-allergy-callout" role="status">
                          <AlertTriangle size={16} strokeWidth={2} aria-hidden />
                          <div>
                            <strong>Allergies on chart</strong>
                            <span>
                              {p.allergies.map(a => `${a.substance} (${a.reaction})`).join(' · ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="med-copy">No allergies recorded on this synthetic chart.</p>
                      )}
                    </>
                  )
                })()}

                {selected.note ? (
                  <div className="med-note-callout" role="status">
                    <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Clinical note / discrepancy</strong>
                      <span>{selected.note}</span>
                    </div>
                  </div>
                ) : null}

                <div className="med-grid">
                  <div>
                    <span className="card-kicker">Dose</span>
                    <strong>{selected.dose}</strong>
                    <span>Unit as labeled</span>
                  </div>
                  <div>
                    <span className="card-kicker">Route / frequency</span>
                    <strong>
                      {selected.route} · {selected.frequency}
                    </strong>
                    <span>As documented</span>
                  </div>
                  <div>
                    <span className="card-kicker">Start</span>
                    <strong>{selected.startDate}</strong>
                    <span>Sample timeline</span>
                  </div>
                  <div>
                    <span className="card-kicker">Record id</span>
                    <strong className="med-mono">{selected.id}</strong>
                    <span>Synthetic only</span>
                  </div>
                </div>

                <div className="med-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="med-related-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/orders')}
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/legal-evidence')}
                    >
                      Legal evidence
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/patients/${selected.patientId}`)}
                    >
                      Patient chart
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/clinical')}
                    >
                      Clinical desk
                    </button>
                  </div>
                </div>
              </div>

              <div className="med-inspector-foot">
                <div className="med-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no hold is written"
                  >
                    Hold
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!reconcileBlock}
                    title={reconcileBlock ?? 'Visual only · no reconciliation is filed'}
                  >
                    Reconcile
                  </button>
                </div>
                <p className="med-footnote">
                  {reconcileBlock
                    ? `Reconcile disabled · ${reconcileBlock} No durable write occurs in this prototype.`
                    : 'Reconcile / hold / discontinue are visual only. Imported or AI-extracted data stays proposed until authorized human intent.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card med-inspector-empty">
              <EmptyState
                icon={<Pill size={26} strokeWidth={1.5} />}
                title="Select a medication"
                sub="Inspect dose, risk flags, allergies, and related orders."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
