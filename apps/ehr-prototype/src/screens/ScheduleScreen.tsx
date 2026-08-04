import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock, CalendarPlus, CalendarRange, Car, MapPin, Users, Video,
} from 'lucide-react'
import { weekVisits } from '../data/clinical'
import { getPatient, patients } from '../data/patients'
import type { VisitEvent } from '../data/types'
import { WORK_QUEUE } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, PatientAvatar, StatusChip } from '../ui'
import './sched.css'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

const DAYS: { key: DayKey; label: string; date: string; match: string; isToday: boolean }[] = [
  { key: 'mon', label: 'Mon', date: 'Aug 3', match: 'Today', isToday: true },
  { key: 'tue', label: 'Tue', date: 'Aug 4', match: 'Tomorrow', isToday: false },
  { key: 'wed', label: 'Wed', date: 'Aug 5', match: 'Aug 5', isToday: false },
  { key: 'thu', label: 'Thu', date: 'Aug 6', match: 'Aug 6', isToday: false },
  { key: 'fri', label: 'Fri', date: 'Aug 7', match: 'Aug 7', isToday: false },
]

const DISCIPLINE_LABEL: Record<VisitEvent['discipline'], string> = {
  SN: 'Skilled nursing',
  PT: 'Physical therapy',
  OT: 'Occupational therapy',
  ST: 'Speech therapy',
  MSW: 'Medical social work',
  HHA: 'Home health aide',
}

const DISCIPLINE_CHIP: Record<VisitEvent['discipline'], string> = {
  SN: 'chip-teal',
  PT: 'chip-brand',
  OT: 'chip-neutral',
  ST: 'chip-neutral',
  MSW: 'chip-neutral',
  HHA: 'chip-neutral',
}

const VISIT_STATUS_TONE = {
  completed: 'good',
  scheduled: 'progress',
  'in-progress': 'progress',
  'documentation-due': 'warn',
  missed: 'bad',
} as const

const VISIT_STATUS_LABEL = {
  completed: 'Completed',
  scheduled: 'Scheduled',
  'in-progress': 'In progress',
  'documentation-due': 'Note due',
  missed: 'Missed',
} as const

const TEAM_TONE: Record<string, string> = {
  'Taylor Brooks': 'teal',
  'Iris Duan': 'apricot',
  'Marcus Webb': 'plum',
  'Dana Whitfield': 'sage',
  'Amaia Ross': 'sand',
}

function timeToMinutes(t: string): number {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + parseInt(m[2], 10)
}

function estimateDrive(visitCount: number): string {
  if (visitCount === 0) return '—'
  return `~${visitCount * 12 + 8} min`
}

export default function ScheduleScreen() {
  const navigate = useNavigate()
  const dayRefs = useRef<Record<DayKey, HTMLElement | null>>({ mon: null, tue: null, wed: null, thu: null, fri: null })

  const [addOpen, setAddOpen] = useState(false)
  const [addedVisits, setAddedVisits] = useState<VisitEvent[]>([])
  const [formPatientId, setFormPatientId] = useState(patients[0].id)
  const [formDay, setFormDay] = useState(DAYS[0].match)
  const [formTime, setFormTime] = useState('10:00 AM')
  const [formDiscipline, setFormDiscipline] = useState<VisitEvent['discipline']>('SN')
  const [formDuration, setFormDuration] = useState(45)
  const [formLocation, setFormLocation] = useState<VisitEvent['location']>('home')

  const allVisits = useMemo(() => [...weekVisits, ...addedVisits], [addedVisits])

  const byDay = useMemo(
    () => DAYS.map(day => ({
      ...day,
      visits: allVisits
        .filter(v => v.date === day.match)
        .slice()
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    })),
    [allVisits],
  )

  const weekStats = useMemo(() => {
    const total = allVisits.length
    const soc = allVisits.filter(v => v.type.toLowerCase().includes('start of care')).length
    const recert = allVisits.filter(v => v.type.toLowerCase().includes('recert')).length
    const notesDue = allVisits.filter(v => v.status === 'documentation-due').length
    return { total, soc, recert, notesDue }
  }, [allVisits])

  const coverage = useMemo(() => {
    const seen = new Map<string, { name: string; role: string }>()
    allVisits.forEach(v => {
      if (seen.has(v.clinician)) return
      const name = v.clinician.split(',')[0].trim()
      seen.set(v.clinician, { name, role: DISCIPLINE_LABEL[v.discipline] })
    })
    return Array.from(seen.values())
  }, [allVisits])

  function scrollToday() {
    dayRefs.current.mon?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' })
  }

  function resetForm() {
    setFormPatientId(patients[0].id)
    setFormDay(DAYS[0].match)
    setFormTime('10:00 AM')
    setFormDiscipline('SN')
    setFormDuration(45)
    setFormLocation('home')
  }

  function handleAddVisit(e: FormEvent) {
    e.preventDefault()
    const id = `v-new-${addedVisits.length + 1}`
    setAddedVisits(prev => [...prev, {
      id,
      patientId: formPatientId,
      date: formDay,
      time: formTime,
      durationMin: formDuration,
      discipline: formDiscipline,
      type: DISCIPLINE_LABEL[formDiscipline],
      clinician: 'Taylor Brooks, RN',
      status: 'scheduled',
      location: formLocation,
    }])
    setAddOpen(false)
    resetForm()
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Schedule</h1>
          <div className="screen-sub">Week of Aug 3 – Aug 9 · Taylor Brooks, RN</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/field-visits')}>
            Field visits
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/work-queue')}>
            Work queue
          </button>
          <button className="btn btn-secondary" onClick={scrollToday}>
            <CalendarClock size={15} strokeWidth={2} aria-hidden />
            Today
          </button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <CalendarPlus size={15} strokeWidth={2} aria-hidden />
            Add visit
          </button>
        </div>
      </div>

      <RelatedNav route="/schedule" />

      <div className="sched-body">
        <aside className="sched-rail">
          <section className="card card-pad sched-rail-card" aria-label="This week summary">
            <div className="sched-rail-head">
              <span className="sched-rail-icon"><CalendarRange size={15} strokeWidth={1.75} aria-hidden /></span>
              <div>
                <div className="card-kicker">This week</div>
                <h2 className="card-title" style={{ fontSize: 16, marginTop: 1 }}>{weekStats.total} visits scheduled</h2>
              </div>
            </div>
            <div className="sched-week-stats">
              <div className="sched-week-stat">
                <span className="sched-week-stat-value">{weekStats.total}</span>
                <span className="sched-week-stat-label">Total visits</span>
              </div>
              <div className="sched-week-stat">
                <span className="sched-week-stat-value">{weekStats.soc}</span>
                <span className="sched-week-stat-label">Start of care</span>
              </div>
              <div className="sched-week-stat">
                <span className="sched-week-stat-value">{weekStats.recert}</span>
                <span className="sched-week-stat-label">Recertification</span>
              </div>
              <div className="sched-week-stat">
                <span className="sched-week-stat-value">{weekStats.notesDue}</span>
                <span className="sched-week-stat-label">Notes due</span>
              </div>
            </div>
          </section>

          <section className="card card-pad sched-rail-card" aria-label="Coverage this week">
            <div className="sched-rail-head">
              <span className="sched-rail-icon sched-rail-icon-teal"><Users size={15} strokeWidth={1.75} aria-hidden /></span>
              <div>
                <div className="card-kicker">Coverage</div>
                <h2 className="card-title" style={{ fontSize: 16, marginTop: 1 }}>Care team this week</h2>
              </div>
            </div>
            <ul className="sched-coverage-list">
              {coverage.map(c => {
                const [first, ...rest] = c.name.split(' ')
                return (
                  <li key={c.name} className="sched-coverage-row">
                    <PatientAvatar first={first} last={rest.join(' ') || first} tone={TEAM_TONE[c.name] ?? 'teal'} size="sm" />
                    <div className="sched-coverage-who">
                      <span className="sched-coverage-name">{c.name}</span>
                      <span className="sched-coverage-role">{c.role}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="sched-related">
              <span className="card-kicker">Continue in</span>
              <div className="sched-related-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/work-queue')}>Work queue</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/field-visits')}>Field visits</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(WORK_QUEUE.find(w => w.id === 'wq-5')?.href ?? '/field-visits')}>Missed-visit task</button>
              </div>
            </div>
          </section>
        </aside>

        <div className="sched-grid">
          {byDay.map(day => (
            <section
              key={day.key}
              ref={el => { dayRefs.current[day.key] = el }}
              className={'sched-day' + (day.isToday ? ' is-today' : '')}
              aria-label={`${day.label} ${day.date}${day.isToday ? ' · today' : ''}`}
            >
              <div className="sched-day-head">
                <span className="sched-day-headline">
                  <span className="sched-day-label">{day.label}</span>
                  <span className="sched-day-date">{day.date}</span>
                </span>
                {day.isToday ? <span className="chip chip-teal">Today</span> : null}
              </div>

              <div className="sched-day-list">
                {day.visits.length === 0 ? (
                  <div className="sched-day-empty">No visits scheduled</div>
                ) : (
                  day.visits.map(v => {
                    const p = getPatient(v.patientId)
                    return (
                      <div key={v.id} className="sched-visit">
                        <div className="sched-visit-time">{v.time}</div>
                        <button
                          className="sched-visit-patient"
                          onClick={() => navigate(`/patients/${v.patientId}`)}
                        >
                          {p ? `${p.firstName} ${p.lastName}` : 'Unknown patient'}
                        </button>
                        <div className="sched-visit-type">{v.type}</div>
                        <div className="sched-visit-meta">
                          <span className={'chip ' + DISCIPLINE_CHIP[v.discipline]}>{DISCIPLINE_LABEL[v.discipline]}</span>
                          <span className="sched-visit-duration">
                            {v.location === 'telehealth'
                              ? <Video size={12} strokeWidth={2} aria-hidden />
                              : <MapPin size={12} strokeWidth={2} aria-hidden />}
                            {v.durationMin} min
                          </span>
                        </div>
                        <StatusChip tone={VISIT_STATUS_TONE[v.status]}>{VISIT_STATUS_LABEL[v.status]}</StatusChip>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="sched-day-foot">
                <span>{day.visits.length} visit{day.visits.length === 1 ? '' : 's'}</span>
                <span className="sched-day-drive">
                  <Car size={12} strokeWidth={2} aria-hidden /> {estimateDrive(day.visits.length)}
                </span>
              </div>
            </section>
          ))}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add visit"
        sub="Draft a visit for this week — synthetic prototype, nothing is filed or submitted."
      >
        <form className="sched-form" onSubmit={handleAddVisit}>
          <div className="sched-field">
            <label htmlFor="sched-add-patient">Patient</label>
            <select
              id="sched-add-patient"
              value={formPatientId}
              onChange={e => setFormPatientId(e.target.value)}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>

          <div className="sched-field-row">
            <div className="sched-field">
              <label htmlFor="sched-add-day">Day</label>
              <select
                id="sched-add-day"
                value={formDay}
                onChange={e => setFormDay(e.target.value)}
              >
                {DAYS.map(d => (
                  <option key={d.key} value={d.match}>{d.label} {d.date}</option>
                ))}
              </select>
            </div>
            <div className="sched-field">
              <label htmlFor="sched-add-time">Time</label>
              <input
                id="sched-add-time"
                type="text"
                value={formTime}
                placeholder="10:00 AM"
                onChange={e => setFormTime(e.target.value)}
              />
            </div>
          </div>

          <div className="sched-field-row">
            <div className="sched-field">
              <label htmlFor="sched-add-discipline">Discipline</label>
              <select
                id="sched-add-discipline"
                value={formDiscipline}
                onChange={e => setFormDiscipline(e.target.value as VisitEvent['discipline'])}
              >
                {Object.entries(DISCIPLINE_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sched-field">
              <label htmlFor="sched-add-duration">Duration (min)</label>
              <input
                id="sched-add-duration"
                type="number"
                min={15}
                step={15}
                value={formDuration}
                onChange={e => setFormDuration(Number(e.target.value) || 45)}
              />
            </div>
          </div>

          <div className="sched-field">
            <label htmlFor="sched-add-location">Location</label>
            <select
              id="sched-add-location"
              value={formLocation}
              onChange={e => setFormLocation(e.target.value as VisitEvent['location'])}
            >
              <option value="home">Home visit</option>
              <option value="telehealth">Telehealth</option>
            </select>
          </div>

          <p className="sched-form-help">Assigned to Taylor Brooks, RN. Added visits appear on this week's grid only.</p>

          <div className="sched-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add to schedule</button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
