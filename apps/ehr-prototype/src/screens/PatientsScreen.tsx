import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Download, Search, UserPlus, Users,
} from 'lucide-react'
import { patients } from '../data/patients'
import type { Patient, RiskLevel } from '../data/types'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, ProgressBar, StatusChip } from '../ui'
import './pts.css'

type FilterKey = 'all' | 'high-risk' | 'soc-pending' | 'recert'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high-risk', label: 'High risk' },
  { key: 'soc-pending', label: 'SOC pending' },
  { key: 'recert', label: 'Recert window' },
]

const RISK_TONE = {
  high: 'bad',
  moderate: 'warn',
  low: 'good',
} as const

const RISK_LABEL: Record<RiskLevel, string> = {
  high: 'High risk',
  moderate: 'Moderate',
  low: 'Low',
}

function matchesFilter(p: Patient, key: FilterKey): boolean {
  switch (key) {
    case 'high-risk': return p.riskLevel === 'high'
    case 'soc-pending': return p.episode.status === 'pending-soc'
    case 'recert': return p.flags.includes('Recert window')
    default: return true
  }
}

function caseManager(p: Patient): { name: string; role: string } {
  const cm = p.team.find(t => t.role.toLowerCase().includes('case manager'))
  if (cm) return cm
  const lead = p.team[0]
  return lead ?? { name: '—', role: '' }
}

export default function PatientsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = { all: patients.length, 'high-risk': 0, 'soc-pending': 0, recert: 0 }
    for (const p of patients) {
      if (matchesFilter(p, 'high-risk')) counts['high-risk']++
      if (matchesFilter(p, 'soc-pending')) counts['soc-pending']++
      if (matchesFilter(p, 'recert')) counts.recert++
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return patients.filter(p => {
      if (!matchesFilter(p, filter)) return false
      if (!q) return true
      const haystack = [
        p.firstName, p.lastName, p.mrn, p.primaryDx.code, p.primaryDx.label,
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [query, filter])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Patients</h1>
          <div className="screen-sub">
            {patients.length} on service · {filterCounts['high-risk']} high risk · {filterCounts['soc-pending']} SOC pending · {filterCounts.recert} in recert window
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/episodes')}>
            Episodes
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/intake')}>
            Intake
          </button>
          <button className="btn btn-secondary">
            <Download size={15} strokeWidth={2} aria-hidden />
            Export list
          </button>
          <button className="btn btn-primary">
            <UserPlus size={15} strokeWidth={2} aria-hidden />
            Add patient
          </button>
        </div>
      </div>

      <div className="pts-toolbar">

      <RelatedNav route="/patients" />
        <label className="field-input pts-search">
          <Search size={15} strokeWidth={1.75} aria-hidden />
          <input
            type="text"
            placeholder="Search by name, MRN, or diagnosis"
            aria-label="Search patients"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>
        <div className="pts-chips" role="group" aria-label="Filter patients by status">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={'pts-chip' + (filter === f.key ? ' is-active' : '')}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="pts-chip-count">{filterCounts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="card pts-card" aria-label="Patient roster">
        <div className="pts-card-head">
          <div className="card-kicker">Roster</div>
          <div className="pts-result-count">Showing {filtered.length} of {patients.length} patients</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} strokeWidth={1.5} />}
            title="No patients match these filters"
            sub="Try a different search term or clear the filter chips."
          />
        ) : (
          <div className="pts-table-wrap">
            <table className="table pts-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Primary diagnosis</th>
                  <th>Episode</th>
                  <th>Risk</th>
                  <th>Next visit</th>
                  <th>Record integrity</th>
                  <th>Case manager</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const episodePct = Math.min(100, (p.episode.day / p.episode.length) * 100)
                  const integrityComplete = p.integrity.passed >= p.integrity.total
                  const cm = caseManager(p)
                  return (
                    <tr
                      key={p.id}
                      className="is-clickable"
                      tabIndex={0}
                      role="button"
                      aria-label={`Open chart for ${p.firstName} ${p.lastName}`}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      onKeyDown={e => {
                        if (e.target !== e.currentTarget) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/patients/${p.id}`)
                        }
                      }}
                    >
                      <td>
                        <div className="pts-patient-cell">
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <div className="pts-patient-who">
                            <div className="pts-patient-name">{p.firstName} {p.lastName}</div>
                            <div className="pts-patient-mrn">MRN {p.mrn}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="pts-dx" title={`${p.primaryDx.code} · ${p.primaryDx.label}`}>
                          <span className="pts-dx-code">{p.primaryDx.code}</span>
                          <span className="pts-dx-label">{p.primaryDx.label}</span>
                        </div>
                      </td>
                      <td>
                        <div className="pts-episode">
                          <div className="pts-episode-day">Day {p.episode.day} of {p.episode.length}</div>
                          <div className="pts-mini-bar">
                            <ProgressBar
                              pct={episodePct}
                              color="var(--teal-400)"
                              label={`${p.firstName} ${p.lastName} episode day ${p.episode.day} of ${p.episode.length}`}
                            />
                          </div>
                          {p.episode.status !== 'active' && (
                            <div className="pts-episode-note">
                              {p.episode.status === 'pending-soc' ? 'SOC pending' : 'Discharge planned'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusChip tone={RISK_TONE[p.riskLevel]}>{RISK_LABEL[p.riskLevel]}</StatusChip>
                      </td>
                      <td>
                        <div className="pts-next-visit">
                          <div className="pts-next-when">{p.nextVisit ? `${p.nextVisit.date} · ${p.nextVisit.time}` : 'Not scheduled'}</div>
                          <div className="pts-next-type">{p.nextVisit?.type ?? '—'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="pts-integrity">
                          <div className={'pts-integrity-value' + (integrityComplete ? '' : ' is-warn')}>
                            {!integrityComplete && <AlertTriangle size={11} strokeWidth={2.25} aria-hidden />}
                            {p.integrity.passed}<span>/{p.integrity.total}</span>
                          </div>
                          <div className="pts-mini-bar">
                            <ProgressBar
                              pct={(p.integrity.passed / p.integrity.total) * 100}
                              color={integrityComplete ? 'var(--green-300)' : 'var(--yellow-300)'}
                              label={`${p.firstName} ${p.lastName} record integrity ${p.integrity.passed} of ${p.integrity.total} checks passed`}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="pts-cm">
                          <div className="pts-cm-name">{cm.name}</div>
                          {cm.role && !cm.role.toLowerCase().includes('case manager') && (
                            <div className="pts-cm-role">{cm.role}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
