import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BatteryWarning,
  CheckCircle2,
  FlaskConical,
  Link2,
  Search,
  Shield,
  Siren,
  Users,
} from 'lucide-react'
import { getPatient, patients } from '../data/patients'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './emp.css'

/* ──────────────────────────────────────────────────────────────────────────
 * Emergency preparedness (EMP) — patient profiles, priority, exercises.
 * Synthetic design prototype. Anchors EMP-002.
 * ────────────────────────────────────────────────────────────────────────── */

type Priority = 'critical' | 'high' | 'medium' | 'low'
type ProfileStatus = 'current' | 'needs-refresh' | 'incomplete'
type StatusFilter = 'all' | ProfileStatus
type PriorityFilter = 'all' | Priority
type DetailTab = 'overview' | 'dependencies' | 'plan' | 'related'

type EmergencyProfile = {
  id: string
  patientId: string
  priority: Priority
  dependencies: string
  evacuation: string
  lastReview: string
  status: ProfileStatus
  powerDependent: boolean
  contacts: string
  notes: string
}

const PROFILES: EmergencyProfile[] = [
  {
    id: 'emp-1',
    patientId: 'pt-elena',
    priority: 'high',
    dependencies: 'Walker · lives alone',
    evacuation: 'Caregiver neighbor',
    lastReview: 'SOC day 1 · Jul 29',
    status: 'current',
    powerDependent: false,
    contacts: 'Neighbor · M. Chen (on file)',
    notes: 'Fall risk + lives alone. Level 2 priority on continuity list (synthetic).',
  },
  {
    id: 'emp-2',
    patientId: 'pt-walter',
    priority: 'critical',
    dependencies: 'O2 concentrator · power dependent',
    evacuation: 'Daughter on file',
    lastReview: 'Jul 20',
    status: 'needs-refresh',
    powerDependent: true,
    contacts: 'Daughter · L. Feld',
    notes: 'Oxygen concentrator requires generator / shelter plan refresh before fire season drills.',
  },
  {
    id: 'emp-3',
    patientId: 'pt-june',
    priority: 'medium',
    dependencies: 'Dysphagia precautions',
    evacuation: 'Self · caregiver assist',
    lastReview: 'Missing SOC attach',
    status: 'incomplete',
    powerDependent: false,
    contacts: 'Self',
    notes: 'Emergency profile incomplete — functional dependency and alternate contacts not captured.',
  },
  {
    id: 'emp-4',
    patientId: 'pt-dorothy',
    priority: 'high',
    dependencies: 'Stage 4 pressure ulcer · wound supplies',
    evacuation: 'MSW coordination',
    lastReview: 'Jun 15',
    status: 'needs-refresh',
    powerDependent: false,
    contacts: 'Son · on chart',
    notes: 'Wound supplies and mobility barriers need recert-window refresh.',
  },
  {
    id: 'emp-5',
    patientId: 'pt-margaret',
    priority: 'medium',
    dependencies: 'Wound care · diabetes',
    evacuation: 'Self',
    lastReview: 'Jul 22',
    status: 'current',
    powerDependent: false,
    contacts: 'Spouse on file',
    notes: 'Reviewed at SOC. Education packet delivered (synthetic).',
  },
  {
    id: 'emp-6',
    patientId: 'pt-harold',
    priority: 'high',
    dependencies: 'COPD · new admission',
    evacuation: 'Not yet assessed',
    lastReview: 'Pending SOC',
    status: 'incomplete',
    powerDependent: false,
    contacts: 'Intake only',
    notes: 'Pending SOC assessment — emergency profile required on comprehensive assessment (EMP-002).',
  },
]

const STATUS_META: Record<ProfileStatus, { tone: StatusTone; label: string }> = {
  current: { tone: 'good', label: 'Current' },
  'needs-refresh': { tone: 'warn', label: 'Needs refresh' },
  incomplete: { tone: 'bad', label: 'Incomplete' },
}

const PRIORITY_META: Record<Priority, { tone: StatusTone; label: string }> = {
  critical: { tone: 'bad', label: 'Critical' },
  high: { tone: 'warn', label: 'High' },
  medium: { tone: 'progress', label: 'Medium' },
  low: { tone: 'neutral', label: 'Low' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'current', label: 'Current' },
  { key: 'needs-refresh', label: 'Needs refresh' },
  { key: 'incomplete', label: 'Incomplete' },
]

const PRIORITY_FILTERS: { key: PriorityFilter; label: string }[] = [
  { key: 'all', label: 'All priorities' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'plan', label: 'Plan & drills' },
  { key: 'related', label: 'Related' },
]

const EXERCISES = [
  { id: 'ex-1', title: 'Tabletop · wildfire smoke', when: 'Mar 2026', result: 'After-action filed (sample)' },
  { id: 'ex-2', title: 'Call-tree drill · after hours', when: 'Jun 2026', result: 'Gaps → QAPI PIP link' },
]

function saveDisabledReason(p: EmergencyProfile): string | null {
  if (p.status === 'current') return 'Profile already marked current in this sample.'
  return null
}

export default function EmergencyPrepScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(PROFILES[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [openDrawer, setOpenDrawer] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PROFILES.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false
      if (!q) return true
      const patient = getPatient(p.patientId)
      const hay = [
        p.id,
        p.dependencies,
        p.evacuation,
        p.contacts,
        p.notes,
        p.status,
        p.priority,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, priorityFilter])

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

  const selected = PROFILES.find(p => p.id === selectedId) ?? null
  const currentCount = PROFILES.filter(p => p.status === 'current').length
  const powerCount = PROFILES.filter(p => p.powerDependent).length
  const incompleteCount = PROFILES.filter(p => p.status === 'incomplete').length
  const coveragePct = Math.round((currentCount / Math.max(patients.length, 1)) * 100)

  const selectProfile = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const saveBlock = selected ? saveDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain EMP · emergency preparedness</div>
          <h1 className="screen-title">Emergency preparedness</h1>
          <div className="screen-sub">
            Patient-specific profiles, priority, power dependencies, command posture, and exercise evidence.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/patients')}>
            <Users size={15} strokeWidth={2} aria-hidden />
            Patients
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/security')}>
            Security
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setOpenDrawer(true)}>
            <Siren size={15} strokeWidth={2} aria-hidden />
            Open patient profile
          </button>
        </div>
      </div>

      <div className="emp-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no emergency profile is saved, no drill is logged, and no continuity
          list is distributed. Production requires authorized EMP requirements.
        </span>
      </div>

      <RelatedNav route="/emergency" />

      <div className="emp-stats">
        <StatCard
          icon={<Shield size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Profiles current"
          value={`${coveragePct}%`}
          sub={`${currentCount} of ${patients.length} census sample current`}
          accent="teal"
        />
        <StatCard
          icon={<BatteryWarning size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Power-dependent"
          value={powerCount}
          sub="Device / oxygen dependency"
          accent="warn"
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Exercises YTD"
          value={EXERCISES.length}
          sub="With after-action labels"
          accent="good"
        />
        <StatCard
          icon={<Siren size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Missing / incomplete"
          value={incompleteCount}
          sub="SOC or refresh required"
          accent={incompleteCount > 0 ? 'bad' : 'good'}
        />
      </div>

      <div className="emp-workspace">
        <section className="card emp-registry" aria-label="Emergency profile registry">
          <div className="emp-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title emp-card-title">Patient emergency profiles</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="emp-toolbar">
            <label className="emp-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search emergency profiles</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, dependency, or contact"
              />
            </label>
            <div className="emp-filter-block">
              <span className="emp-filter-label" id="emp-status-filters">Status</span>
              <div className="emp-filters" role="toolbar" aria-labelledby="emp-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'emp-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="emp-filter-block">
              <span className="emp-filter-label" id="emp-priority-filters">Priority</span>
              <div className="emp-filters" role="toolbar" aria-labelledby="emp-priority-filters">
                {PRIORITY_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'emp-filter emp-filter-priority' + (priorityFilter === f.key ? ' is-active' : '')}
                    aria-pressed={priorityFilter === f.key}
                    onClick={() => setPriorityFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Siren size={26} strokeWidth={1.5} />}
              title="No profiles match"
              sub="Clear filters or search. All profiles are synthetic."
            />
          ) : (
            <div className="emp-list" role="listbox" aria-label="Emergency profile list">
              {filtered.map(prof => {
                const patient = getPatient(prof.patientId)
                const meta = STATUS_META[prof.status]
                const isSelected = prof.id === selectedId
                return (
                  <button
                    key={prof.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'emp-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectProfile(prof.id)}
                  >
                    <span
                      className={
                        'emp-row-icon' +
                        (prof.priority === 'critical' || prof.status === 'incomplete'
                          ? ' is-bad'
                          : prof.status === 'needs-refresh'
                            ? ' is-warn'
                            : '')
                      }
                      aria-hidden
                    >
                      {prof.powerDependent ? (
                        <BatteryWarning size={16} strokeWidth={1.75} />
                      ) : (
                        <Siren size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="emp-row-main">
                      <span className="emp-row-top">
                        <span className="emp-id">{prof.id}</span>
                        <StatusChip tone={PRIORITY_META[prof.priority].tone}>
                          {PRIORITY_META[prof.priority].label}
                        </StatusChip>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        {prof.powerDependent ? (
                          <span className="chip chip-warn">Power</span>
                        ) : null}
                      </span>
                      <span className="emp-title">
                        {patient
                          ? `${patient.firstName} ${patient.lastName}`
                          : prof.patientId}
                      </span>
                      <span className="emp-meta">
                        {patient ? (
                          <span className="emp-who">
                            <PatientAvatar
                              first={patient.firstName}
                              last={patient.lastName}
                              tone={patient.photoTone}
                              size="sm"
                            />
                            <span className="emp-who-name">MRN {patient.mrn}</span>
                          </span>
                        ) : null}
                        <span className="emp-dot" aria-hidden />
                        <span>{prof.dependencies}</span>
                        <span className="emp-dot" aria-hidden />
                        <span>Reviewed · {prof.lastReview}</span>
                      </span>
                    </span>
                    <ArrowRight className="emp-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="emp-inspector" aria-label="Emergency profile inspector">
          {selected ? (
            <div className="card emp-inspector-card">
              <div className="emp-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title emp-card-title">{selected.id}</h2>
                  <p className="emp-inspector-title">
                    {(() => {
                      const p = getPatient(selected.patientId)
                      return p ? `${p.firstName} ${p.lastName}` : selected.patientId
                    })()}
                  </p>
                </div>
                <div className="emp-drawer-status">
                  <StatusChip tone={PRIORITY_META[selected.priority].tone}>
                    {PRIORITY_META[selected.priority].label}
                  </StatusChip>
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                </div>
              </div>

              <div className="emp-tabs" role="tablist" aria-label="Profile detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'emp-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="emp-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="emp-panel">
                    {(() => {
                      const p = getPatient(selected.patientId)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          className="emp-drawer-patient"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <span>
                            <strong>
                              {p.firstName} {p.lastName}
                            </strong>
                            <span>
                              MRN {p.mrn} · {p.city} · open chart
                            </span>
                          </span>
                          <ArrowRight size={14} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })()}
                    {selected.status === 'incomplete' ? (
                      <div className="emp-callout is-bad" role="status">
                        <Siren size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Profile incomplete</strong>
                          <span>
                            Every active patient needs a reviewed profile and current emergency instructions
                            (EMP-002).
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <p className="emp-drawer-copy">{selected.notes}</p>
                    <div className="emp-drawer-grid">
                      <div>
                        <span className="card-kicker">Priority</span>
                        <strong>{PRIORITY_META[selected.priority].label}</strong>
                        <span>Continuity list class</span>
                      </div>
                      <div>
                        <span className="card-kicker">Last review</span>
                        <strong>{selected.lastReview}</strong>
                        <span>Prototype labels only</span>
                      </div>
                      <div>
                        <span className="card-kicker">Evacuation</span>
                        <strong>{selected.evacuation}</strong>
                        <span>Shelter / transport plan</span>
                      </div>
                      <div>
                        <span className="card-kicker">Contacts</span>
                        <strong>{selected.contacts}</strong>
                        <span>Alternate / caregiver</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'dependencies' ? (
                  <div className="emp-panel">
                    <p className="emp-drawer-copy">
                      Capture electricity/device/oxygen needs, medications and supplies, mobility barriers,
                      language/accessibility, and caregiver capacity.
                    </p>
                    <div className="emp-drawer-grid">
                      <div>
                        <span className="card-kicker">Dependencies</span>
                        <strong>{selected.dependencies}</strong>
                        <span>Functional / clinical</span>
                      </div>
                      <div>
                        <span className="card-kicker">Power dependent</span>
                        <strong>{selected.powerDependent ? 'Yes' : 'No'}</strong>
                        <span>Device / oxygen</span>
                      </div>
                    </div>
                    {selected.powerDependent ? (
                      <div className="emp-callout is-warn" role="status">
                        <BatteryWarning size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Power dependency</strong>
                          <span>
                            Continuity lists and handoff packets must surface generator / shelter plans for
                            authorized responders.
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {detailTab === 'plan' ? (
                  <div className="emp-panel">
                    <p className="emp-drawer-copy">
                      Agency exercises produce after-action evidence that may feed QAPI. Rows below are visual
                      samples only.
                    </p>
                    <ul className="emp-exercise-list">
                      {EXERCISES.map(ex => (
                        <li key={ex.id}>
                          <strong>{ex.title}</strong>
                          <span>
                            {ex.when} · {ex.result}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/qapi')}>
                      Open QAPI programme
                      <ArrowRight size={13} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="emp-panel">
                    <div className="emp-related-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/qapi')}>
                        <Link2 size={13} strokeWidth={2} aria-hidden />
                        QAPI
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/patients')}
                      >
                        Patients
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/security')}
                      >
                        Security
                      </button>
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

              <div className="emp-inspector-foot">
                <div className="emp-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/patients/${selected.patientId}`)}
                    title="Navigate only"
                  >
                    Open chart
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!saveBlock}
                    title={saveBlock ?? 'Visual only · no profile is saved'}
                  >
                    Save profile
                  </button>
                </div>
                <p className="emp-drawer-footnote">
                  {saveBlock
                    ? `Save disabled · ${saveBlock}`
                    : 'Save / distribute / drill-log controls are visual only. No emergency record is written.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card emp-inspector-empty">
              <EmptyState
                icon={<Siren size={26} strokeWidth={1.5} />}
                title="Select a profile"
                sub="Inspect dependencies, plan, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title="Patient emergency profile"
        sub="Review-only · nothing is saved or distributed"
      >
        <div className="emp-panel">
          <p className="emp-drawer-copy">
            Production profiles live on the comprehensive assessment and plan, then propagate to authorized
            continuity lists and handoff packets. This drawer is layout only.
          </p>
          <div className="emp-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpenDrawer(false)}>
              Close
            </button>
            <button type="button" className="btn btn-primary" disabled title="Visual only · no profile is opened">
              Load from assessment
            </button>
          </div>
          <p className="emp-drawer-footnote">Load is disabled. No durable write occurs in this prototype.</p>
        </div>
      </Drawer>
    </div>
  )
}
