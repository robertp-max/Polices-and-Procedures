import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BotMessageSquare, CalendarClock, CheckCheck, ClipboardCheck,
  FileSignature, Lock, MapPin, Route, Sparkles, Video,
} from 'lucide-react'
import { elena, getPatient } from '../data/patients'
import { bradSuggestions, nextBestActions, todayVisits } from '../data/clinical'
import { WORK_QUEUE } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { PatientBanner } from '../components/PatientBanner'
import { StatCard, StatusChip } from '../ui'
import './today.css'

const SLICE_STEPS = [
  { key: 'referral', label: 'Referral', state: 'done' },
  { key: 'soc', label: 'SOC', state: 'current' },
  { key: 'poc', label: 'POC', state: 'todo' },
  { key: 'visit', label: 'Visit', state: 'todo' },
  { key: 'claim', label: 'Claim-ready', state: 'todo' },
  { key: 'qapi', label: 'QAPI', state: 'todo' },
] as const

const VISIT_STATUS_TONE = {
  'completed': 'good',
  'scheduled': 'progress',
  'in-progress': 'progress',
  'documentation-due': 'warn',
  'missed': 'bad',
} as const

function timeToMinutes(t: string): number {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + parseInt(m[2], 10)
}

const VISIT_STATUS_LABEL = {
  'completed': 'Completed',
  'scheduled': 'Scheduled',
  'in-progress': 'In progress',
  'documentation-due': 'Note due',
  'missed': 'Missed',
} as const

/** Map local NBA ids → shared WORK_QUEUE destinations when titles align. */
function actionHref(actionId: string): string {
  if (actionId === 'act-1') return WORK_QUEUE.find(w => w.id === 'wq-1')?.href ?? '/oasis'
  // Elena POC signature — never Walter wq-2. Prefer Elena orders/signature work item.
  if (actionId === 'act-2') {
    const elenaOrders = WORK_QUEUE.find(
      w =>
        w.patientId === 'pt-elena' &&
        (w.href === '/orders' ||
          /signature|plan of care|cms-485|poc/i.test(`${w.title} ${w.detail}`)),
    )
    return elenaOrders?.href ?? '/orders'
  }
  if (actionId === 'act-3') return '/medications'
  return '/work-queue'
}

export default function TodayScreen() {
  const navigate = useNavigate()
  const [done, setDone] = useState<Record<string, boolean>>({})
  const doneCount = nextBestActions.filter(a => done[a.id]).length
  const openQueue = WORK_QUEUE.filter(w => w.status !== 'done')

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Good afternoon, Taylor</h1>
          <div className="screen-sub">Monday, August 3 · 4 visits today · 1 SOC episode needs attention</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/work-queue')}>
            Work queue
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/schedule')}>
            <CalendarClock size={15} strokeWidth={2} aria-hidden />
            My schedule
          </button>
          <button className="btn btn-teal" onClick={() => navigate('/clinical')}>
            Start visit documentation
          </button>
        </div>
      </div>

      <PatientBanner
        patient={elena}
        cta={{ label: 'Continue SOC', to: '/patients/pt-elena/assessments' }}
      />

      <RelatedNav route="/today" />

      <section className="card slice" aria-label="Live vertical slice">
        <div className="slice-lead">
          <span className="slice-lead-icon"><Route size={15} strokeWidth={2} aria-hidden /></span>
          <div>
            <div className="card-kicker">Live vertical slice</div>
            <div className="slice-lead-text">Referral → SOC → POC → visit → claim-ready → QAPI</div>
          </div>
        </div>
        <ol className="slice-steps">
          {SLICE_STEPS.map((s, i) => (
            <li key={s.key} className={'slice-step is-' + s.state}>
              <span className="slice-dot" aria-hidden />
              <span className="slice-step-label">{s.label}</span>
              {i < SLICE_STEPS.length - 1 && <span className="slice-bar" aria-hidden />}
            </li>
          ))}
        </ol>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patients/pt-elena/timeline')}>
          Open walkthrough
          <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
        </button>
      </section>

      <div className="today-stats">
        <StatCard
          icon={<ClipboardCheck size={16} strokeWidth={1.75} />}
          kicker="SOC completion"
          value={<>{elena.socCompletion}<small>%</small></>}
          sub="7 items need review before signature"
          accent="orange"
          meter={{ pct: elena.socCompletion }}
        />
        <StatCard
          icon={<CalendarClock size={16} strokeWidth={1.75} />}
          kicker="Next visit"
          value="2:30 PM"
          sub="Skilled nursing · Elena Martinez · today"
          accent="teal"
        />
        <StatCard
          icon={<FileSignature size={16} strokeWidth={1.75} />}
          kicker="Open orders"
          value="4"
          sub="1 physician signature due in 4 hours"
          accent="warn"
        />
        <StatCard
          icon={<Lock size={16} strokeWidth={1.75} />}
          kicker="Record integrity"
          value={<>11<small> / 13</small></>}
          sub="2 checks blocking claim readiness"
          accent="good"
          meter={{ pct: (11 / 13) * 100 }}
        />
      </div>

      <div className="today-columns">
        <section className="card today-queue" aria-label="Next best actions">
          <div className="today-queue-head">
            <div>
              <div className="card-kicker">Clinical work queue</div>
              <h2 className="card-title" style={{ fontSize: 17 }}>Next best actions</h2>
            </div>
            <button type="button" className="btn-inline" onClick={() => navigate('/work-queue')}>
              Full queue ({openQueue.length}) <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <div className="today-queue-list">
            {nextBestActions.map(a => (
              <label key={a.id} className={'queue-row' + (done[a.id] ? ' is-done' : '')}>
                <input
                  type="checkbox"
                  checked={!!done[a.id]}
                  onChange={() => setDone(d => ({ ...d, [a.id]: !d[a.id] }))}
                  aria-label={a.title}
                />
                <span className="queue-check" aria-hidden><CheckCheck size={12} strokeWidth={2.5} /></span>
                <span className="queue-body">
                  <span className="queue-title">{a.title}</span>
                  <span className="queue-detail">{a.detail}</span>
                  {a.blocking ? <span className="queue-blocking">{a.blocking}</span> : null}
                </span>
                <span className="queue-due">{a.due}</span>
                <button
                  type="button"
                  className="queue-go-btn"
                  aria-label={`Open ${a.title}`}
                  onClick={e => {
                    e.preventDefault()
                    navigate(actionHref(a.id))
                  }}
                >
                  <ArrowRight className="queue-go" size={15} strokeWidth={2} aria-hidden />
                </button>
              </label>
            ))}
          </div>
          <div className="today-related">
            <span className="card-kicker">Continue in</span>
            <div className="today-related-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/work-queue')}>
                Work queue
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/messages')}>
                Messages
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/schedule')}>
                Schedule
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(WORK_QUEUE[0]?.href ?? '/oasis')}
              >
                {WORK_QUEUE[0]?.title ?? 'SOC OASIS'}
              </button>
            </div>
          </div>
        </section>

        <section className="card brad" aria-label="Brad clinical assist">
          <div className="brad-head">
            <span className="brad-mark"><BotMessageSquare size={16} strokeWidth={1.75} aria-hidden /></span>
            <div>
              <div className="card-kicker">Brad clinical assist</div>
              <h2 className="card-title" style={{ fontSize: 16 }}>Review, don’t replace</h2>
            </div>
          </div>
          <p className="brad-note">
            Drafted from the referral and today’s assessment. Nothing is filed, signed,
            or submitted without clinician review.
          </p>
          {bradSuggestions.map(s => (
            <div key={s.id} className="brad-suggestion">
              <div className="brad-suggestion-kicker">
                <Sparkles size={12} strokeWidth={2} aria-hidden />
                {s.confidence === 'needs-confirmation' ? 'Suggested follow-up' : 'Draft ready'}
              </div>
              <div className="brad-suggestion-title">{s.title}</div>
              <p className="brad-suggestion-body">{s.body}</p>
              <div className="brad-sources">Sources: {s.sources.join(' · ')}</div>
            </div>
          ))}
          <button className="btn btn-outline-accent btn-sm" onClick={() => navigate('/patients/pt-elena/medications')}>
            Review in medication list
          </button>
        </section>
      </div>

      <section className="card" aria-label="Today's visits">
        <div className="today-queue-head" style={{ paddingBottom: 4 }}>
          <div>
            <div className="card-kicker">Field schedule</div>
            <h2 className="card-title" style={{ fontSize: 17 }}>Today’s visits</h2>
          </div>
          <button className="btn-inline" onClick={() => navigate('/schedule')}>
            Full schedule <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
        <div className="visit-strip">
          {todayVisits
            .slice()
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
            .map(v => {
              const p = getPatient(v.patientId)!
              return (
                <button key={v.id} className="visit-card" onClick={() => navigate(`/patients/${p.id}`)}>
                  <div className="visit-time">
                    {v.time}
                    {v.location === 'telehealth'
                      ? <Video size={13} strokeWidth={2} aria-hidden />
                      : <MapPin size={13} strokeWidth={2} aria-hidden />}
                  </div>
                  <div className="visit-patient">{p.firstName} {p.lastName}</div>
                  <div className="visit-type">{v.type}</div>
                  <StatusChip tone={VISIT_STATUS_TONE[v.status]}>{VISIT_STATUS_LABEL[v.status]}</StatusChip>
                </button>
              )
            })}
        </div>
      </section>
    </div>
  )
}
