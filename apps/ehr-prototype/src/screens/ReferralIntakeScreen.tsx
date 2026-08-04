import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Ban, Building2, CalendarCheck2, CalendarClock, Clock3, CreditCard,
  Inbox, ShieldCheck, Stethoscope, User, UserPlus,
} from 'lucide-react'
import { referrals } from '../data/clinical'
import type { Referral } from '../data/types'
import { useNavigate } from 'react-router-dom'
import { EPISODES } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './intake.css'

type Stage = Referral['stage']

const COLUMN_ORDER: Stage[] = ['new', 'insurance-verification', 'scheduling-soc', 'soc-scheduled', 'non-admit']

const STAGE_META: Record<Stage, { label: string; icon: ReactNode }> = {
  'new': { label: 'New', icon: <Inbox size={15} strokeWidth={1.75} /> },
  'insurance-verification': { label: 'Insurance verification', icon: <ShieldCheck size={15} strokeWidth={1.75} /> },
  'scheduling-soc': { label: 'Scheduling SOC', icon: <CalendarClock size={15} strokeWidth={1.75} /> },
  'soc-scheduled': { label: 'SOC scheduled', icon: <CalendarCheck2 size={15} strokeWidth={1.75} /> },
  'non-admit': { label: 'Non-admit', icon: <Ban size={15} strokeWidth={1.75} /> },
}

function slaChipClass(hoursLeft: number): string {
  if (hoursLeft <= 12) return 'chip-bad'
  if (hoursLeft <= 24) return 'chip-warn'
  return 'chip-neutral'
}

function slaToneWord(r: Referral): 'good' | 'warn' | 'bad' | 'neutral' {
  if (r.stage === 'non-admit') return 'neutral'
  if (r.slaHoursLeft <= 12) return 'bad'
  if (r.slaHoursLeft <= 24) return 'warn'
  return 'good'
}

function slaNoteText(r: Referral): string {
  if (r.stage === 'non-admit') return 'Referral closed as non-admit — no SLA clock running.'
  if (r.slaHoursLeft <= 12) return `${r.slaHoursLeft} hours left to reach the SOC target — escalate today.`
  if (r.slaHoursLeft <= 24) return `${r.slaHoursLeft} hours left to reach the SOC target.`
  return `${r.slaHoursLeft} hours left to reach the SOC target — on track.`
}

interface EligItem { label: string; tone: StatusTone; note: string }

function eligibilityFor(stage: Stage): EligItem[] {
  const demographics: EligItem = { label: 'Demographics & contact', tone: 'good', note: 'Captured at intake' }
  switch (stage) {
    case 'new':
      return [
        demographics,
        { label: 'Insurance eligibility', tone: 'neutral', note: 'Not yet verified' },
        { label: 'Face-to-face encounter', tone: 'neutral', note: 'Pending scheduling' },
      ]
    case 'insurance-verification':
      return [
        demographics,
        { label: 'Insurance eligibility', tone: 'warn', note: 'In progress · awaiting payer' },
        { label: 'Face-to-face encounter', tone: 'neutral', note: 'Pending' },
      ]
    case 'scheduling-soc':
      return [
        demographics,
        { label: 'Insurance eligibility', tone: 'good', note: 'Verified' },
        { label: 'Face-to-face encounter', tone: 'warn', note: 'Signed · awaiting upload' },
      ]
    case 'soc-scheduled':
      return [
        demographics,
        { label: 'Insurance eligibility', tone: 'good', note: 'Verified' },
        { label: 'Face-to-face encounter', tone: 'good', note: 'On file' },
      ]
    case 'non-admit':
      return [
        demographics,
        { label: 'Insurance eligibility', tone: 'bad', note: 'Not eligible · out-of-network plan' },
        { label: 'Face-to-face encounter', tone: 'neutral', note: 'Not required · non-admit' },
      ]
    default:
      return [demographics]
  }
}

export default function ReferralIntakeScreen() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Referral | null>(null)
  const pendingSoc = EPISODES.find(e => e.status === 'pending-soc')

  const columns = useMemo(
    () => COLUMN_ORDER.map(stage => ({ stage, items: referrals.filter(r => r.stage === stage) })),
    [],
  )

  // App "today" is Aug 3 (see TodayScreen greeting) — synthetic prototype clock.
  const newToday = referrals.filter(r => r.received.startsWith('Aug 3')).length
  const awaitingVerification = referrals.filter(r => r.stage === 'insurance-verification').length
  const socScheduledCount = referrals.filter(r => r.stage === 'soc-scheduled').length
  const unassignedCount = referrals.filter(r => r.owner === 'Unassigned').length

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Referral & intake</h1>
          <div className="screen-sub">{referrals.length} active referrals · {unassignedCount} unassigned</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-primary">
            <UserPlus size={15} strokeWidth={2} aria-hidden />
            New referral
          </button>
        </div>
      </div>

      <RelatedNav route="/intake" />

      <div className="intake-stats">
        <StatCard
          icon={<UserPlus size={16} strokeWidth={1.75} />}
          kicker="New today"
          value={newToday}
          sub="Referrals received today"
          accent="teal"
        />
        <StatCard
          icon={<ShieldCheck size={16} strokeWidth={1.75} />}
          kicker="Awaiting verification"
          value={awaitingVerification}
          sub="Insurance eligibility pending payer response"
          accent="warn"
        />
        <StatCard
          icon={<CalendarCheck2 size={16} strokeWidth={1.75} />}
          kicker="SOC scheduled"
          value={socScheduledCount}
          sub="Visit confirmed with patient or caregiver"
          accent="good"
        />
        <StatCard
          icon={<Clock3 size={16} strokeWidth={1.75} />}
          kicker="Median referral → SOC"
          value="26h"
          sub="Receipt to start-of-care visit, last 30 days"
          accent="orange"
        />
      </div>

      <div className="intake-board">
        {columns.map(col => {
          const meta = STAGE_META[col.stage]
          const muted = col.stage === 'non-admit'
          return (
            <section key={col.stage} className={'intake-column' + (muted ? ' is-muted' : '')} aria-label={meta.label}>
              <div className="intake-column-head">
                <span className="intake-column-title">
                  <span className="intake-column-icon" aria-hidden>{meta.icon}</span>
                  {meta.label}
                </span>
                <span className="chip chip-neutral">{col.items.length}</span>
              </div>
              <div className="intake-column-body">
                {col.items.length === 0 ? (
                  <div className="intake-column-empty">No referrals in this stage.</div>
                ) : (
                  col.items.map(r => (
                    <button key={r.id} className="intake-card" onClick={() => setSelected(r)}>
                      <div className="intake-card-top">
                        <span className="intake-card-name">{r.name}, {r.age}</span>
                        {r.stage !== 'non-admit' && (
                          <span className={'chip intake-sla-chip ' + slaChipClass(r.slaHoursLeft)}>
                            <Clock3 size={10.5} strokeWidth={2} aria-hidden />
                            {r.slaHoursLeft}h left
                          </span>
                        )}
                      </div>
                      <div className="intake-card-dx">{r.diagnosis}</div>
                      <div className="intake-card-meta">
                        <span className="intake-card-source">
                          <Building2 size={12} strokeWidth={1.75} aria-hidden />
                          {r.source}
                        </span>
                        <span className="intake-card-received">{r.received}</span>
                      </div>
                      <div className="intake-card-bottom">
                        <span className="chip chip-outline">{r.payer}</span>
                        {r.owner === 'Unassigned' ? (
                          <span className="chip chip-warn">Unassigned</span>
                        ) : (
                          <span className="intake-card-owner">
                            <User size={12} strokeWidth={1.75} aria-hidden />
                            {r.owner}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ''}
        sub={selected ? `${selected.age} yrs · ${selected.diagnosis}` : undefined}
      >
        {selected && (
          <div className="intake-drawer">
            <div className="intake-fact-grid">
              <div className="intake-fact">
                <div className="intake-fact-label">Referral source</div>
                <div className="intake-fact-value">
                  <Building2 size={13} strokeWidth={1.75} aria-hidden />
                  {selected.source}
                </div>
              </div>
              <div className="intake-fact">
                <div className="intake-fact-label">Diagnosis</div>
                <div className="intake-fact-value">
                  <Stethoscope size={13} strokeWidth={1.75} aria-hidden />
                  {selected.diagnosis}
                </div>
              </div>
              <div className="intake-fact">
                <div className="intake-fact-label">Payer</div>
                <div className="intake-fact-value">
                  <CreditCard size={13} strokeWidth={1.75} aria-hidden />
                  {selected.payer}
                </div>
              </div>
              <div className="intake-fact">
                <div className="intake-fact-label">Received</div>
                <div className="intake-fact-value">
                  <Clock3 size={13} strokeWidth={1.75} aria-hidden />
                  {selected.received}
                </div>
              </div>
            </div>

            <div className="intake-drawer-section">
              <div className="card-kicker">Owner</div>
              {selected.owner === 'Unassigned' ? (
                <span className="chip chip-warn intake-owner-chip">Unassigned · needs a coordinator</span>
              ) : (
                <span className="intake-card-owner intake-owner-chip">
                  <User size={13} strokeWidth={1.75} aria-hidden />
                  {selected.owner}
                </span>
              )}
            </div>

            <div className="intake-drawer-section">
              <div className="card-kicker">Eligibility checklist</div>
              <div className="intake-elig-list">
                {eligibilityFor(selected.stage).map(item => (
                  <div key={item.label} className="intake-elig-row">
                    <span className="intake-elig-label">{item.label}</span>
                    <StatusChip tone={item.tone}>{item.note}</StatusChip>
                  </div>
                ))}
              </div>
            </div>

            <div className={'intake-sla-note intake-sla-note-' + slaToneWord(selected)}>
              <Clock3 size={14} strokeWidth={1.75} aria-hidden />
              {slaNoteText(selected)}
            </div>

            <div className="intake-related">
              <span className="card-kicker">Continue in</span>
              <div className="intake-related-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); navigate('/schedule') }}>Schedule SOC</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); navigate('/authorizations') }}>Authorizations</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); navigate('/patients') }}>Patients</button>
                {(pendingSoc?.related ?? []).map(r => (
                  <button key={r.to + r.label} type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); navigate(r.to) }}>{r.label}</button>
                ))}
              </div>
            </div>

            <div className="intake-drawer-actions">
              {selected.stage === 'non-admit' ? (
                <span className="chip chip-neutral intake-closed-chip">
                  <Ban size={11} strokeWidth={2} aria-hidden />
                  Closed · non-admit
                </span>
              ) : (
                <>
                  <button className="btn btn-primary">
                    <CalendarCheck2 size={15} strokeWidth={2} aria-hidden />
                    Schedule SOC
                  </button>
                  <button className="btn btn-secondary">
                    <UserPlus size={15} strokeWidth={2} aria-hidden />
                    Assign to me
                  </button>
                  <button className="btn btn-ghost">
                    <Ban size={15} strokeWidth={2} aria-hidden />
                    Mark non-admit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
