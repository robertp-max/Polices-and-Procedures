import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, Calendar, CalendarClock, Check, ChevronDown, ClipboardList,
  FileSignature, FileText, History, Inbox, ListChecks, Lock, MapPin,
  MessageSquare, Pill, PlayCircle, Receipt, Send, ShieldAlert, ShieldCheck,
  Stethoscope, Target, UserX, Users,
} from 'lucide-react'
import type { Assessment, Order, PatientDocument, TimelineEntry, VisitEvent } from '../data/types'
import { getPatient } from '../data/patients'
import {
  assessments, documents, elenaTimeline, integrityChecks, medications, orders, weekVisits,
} from '../data/clinical'
import { EPISODES } from '../data/workspace'
import { PatientBanner } from '../components/PatientBanner'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, ProgressBar, ProgressRing, StatusChip, Tabs } from '../ui'
import type { StatusTone } from '../ui'
import './chart.css'

const TAB_KEYS = [
  'overview', 'timeline', 'plan-of-care', 'assessments', 'visits', 'orders', 'medications', 'documents',
] as const
type TabKey = typeof TAB_KEYS[number]

const TAB_LABEL: Record<TabKey, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  'plan-of-care': 'Plan of care',
  assessments: 'Assessments',
  visits: 'Visits',
  orders: 'Orders',
  medications: 'Medications',
  documents: 'Documents',
}

const AVATAR_TONES = ['teal', 'apricot', 'plum', 'sage', 'sand']

const KIND_META: Record<TimelineEntry['kind'], { icon: typeof Inbox; tint: 'teal' | 'orange' }> = {
  referral: { icon: Inbox, tint: 'teal' },
  intake: { icon: ClipboardList, tint: 'teal' },
  soc: { icon: Stethoscope, tint: 'teal' },
  visit: { icon: MapPin, tint: 'teal' },
  order: { icon: FileSignature, tint: 'teal' },
  document: { icon: FileText, tint: 'teal' },
  quality: { icon: ShieldCheck, tint: 'orange' },
  billing: { icon: Receipt, tint: 'orange' },
}

const INTEGRITY_TONE: Record<'passed' | 'attention' | 'blocked', StatusTone> = {
  passed: 'good',
  attention: 'warn',
  blocked: 'bad',
}

const VISIT_STATUS: Record<VisitEvent['status'], { tone: StatusTone; label: string }> = {
  completed: { tone: 'good', label: 'Completed' },
  scheduled: { tone: 'progress', label: 'Scheduled' },
  'in-progress': { tone: 'progress', label: 'In progress' },
  'documentation-due': { tone: 'warn', label: 'Note due' },
  missed: { tone: 'bad', label: 'Missed' },
}

const ORDER_STATUS: Record<Order['status'], { tone: StatusTone; label: string }> = {
  draft: { tone: 'neutral', label: 'Draft' },
  sent: { tone: 'progress', label: 'Sent' },
  'pending-signature': { tone: 'warn', label: 'Pending signature' },
  signed: { tone: 'good', label: 'Signed' },
  declined: { tone: 'bad', label: 'Declined' },
}

const ORDER_CATEGORY_LABEL: Record<Order['category'], string> = {
  medication: 'Medication',
  'plan-of-care': 'Plan of care',
  lab: 'Lab',
  dme: 'DME',
  referral: 'Referral',
}

const ASSESS_STATUS: Record<Assessment['status'], { tone: StatusTone; label: string }> = {
  complete: { tone: 'good', label: 'Complete' },
  'in-progress': { tone: 'progress', label: 'In progress' },
  'not-started': { tone: 'neutral', label: 'Not started' },
  'due-soon': { tone: 'warn', label: 'Due soon' },
}

const DOC_STATUS: Record<PatientDocument['status'], { tone: StatusTone; label: string }> = {
  final: { tone: 'good', label: 'Final' },
  'pending-signature': { tone: 'warn', label: 'Pending signature' },
  draft: { tone: 'neutral', label: 'Draft' },
}

const DOC_CATEGORY_LABEL: Record<PatientDocument['category'], string> = {
  consent: 'Consent',
  assessment: 'Assessment',
  physician: 'Physician',
  'plan-of-care': 'Plan of care',
  billing: 'Billing',
}

const DOC_CONTINUE_LINKS = [
  { to: '/documents', label: 'Documents workspace' },
  { to: '/forms', label: 'Forms library' },
  { to: '/legal-evidence', label: 'Legal evidence' },
] as const

export default function PatientChartScreen() {
  const { patientId, tab } = useParams<{ patientId: string; tab?: string }>()
  const navigate = useNavigate()
  const patient = patientId ? getPatient(patientId) : undefined
  const [breakdownOpen, setBreakdownOpen] = useState(true)

  if (!patient) {
    return (
      <div className="screen">
        <div className="screen-head">
          <div>
            <h1 className="screen-title">Patient not found</h1>
            <div className="screen-sub">This patient record doesn’t exist in this prototype.</div>
          </div>
        </div>
        <div className="card card-pad chart-not-found">
          <EmptyState
            icon={<UserX size={28} strokeWidth={1.5} />}
            title="No matching chart"
            sub="Check the patient list and try again."
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/patients')}>
            Back to patients
          </button>
        </div>
      </div>
    )
  }

  const id = patient.id
  const requestedTab = tab ?? 'overview'
  const activeTab: TabKey = (TAB_KEYS as readonly string[]).includes(requestedTab) ? (requestedTab as TabKey) : 'overview'

  const patientVisits = weekVisits.filter(v => v.patientId === id)
  const patientOrders = orders.filter(o => o.patientId === id)
  const patientMeds = medications.filter(m => m.patientId === id)
  const patientDocs = documents.filter(d => d.patientId === id)
  const patientAssessments = assessments.filter(a => a.patientId === id)
  const patientTimeline = elenaTimeline.filter(t => t.patientId === id)
  const isElena = id === 'pt-elena'
  const planOrder = patientOrders.find(o => o.category === 'plan-of-care')
  const needsReviewMed = patientMeds.find(m => m.status === 'needs-review')
  const otherMeds = patientMeds.filter(m => m.id !== needsReviewMed?.id)
  const episode = EPISODES.find(e => e.patientId === id)

  const tabItems = TAB_KEYS.map(key => ({
    key,
    label: TAB_LABEL[key],
    count: {
      overview: undefined,
      timeline: patientTimeline.length || undefined,
      'plan-of-care': undefined,
      assessments: patientAssessments.length || undefined,
      visits: patientVisits.length || undefined,
      orders: patientOrders.length || undefined,
      medications: patientMeds.length || undefined,
      documents: patientDocs.length || undefined,
    }[key],
  }))

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">{patient.firstName} {patient.lastName}</h1>
          <div className="screen-sub">MRN {patient.mrn} · {patient.payer} · {patient.city}</div>
        </div>
      </div>

      <PatientBanner
        patient={patient}
        cta={id === 'pt-elena' ? { label: 'Continue SOC', to: '/patients/pt-elena/assessments' } : undefined}
      />

      <RelatedNav route="/patients" />

      <Tabs items={tabItems} active={activeTab} onChange={key => navigate(`/patients/${id}/${key}`)} />

      <div className="chart-tabpanel">
        {activeTab === 'overview' && (
          <>
            <div className="chart-related card card-pad">
              <span className="card-kicker">Continue in{episode ? ` · episode ${episode.period}` : ''}</span>
              <div className="chart-related-actions">
                {(episode?.related ?? [
                  { to: '/schedule', label: 'Schedule' },
                  { to: '/clinical', label: 'Clinical' },
                  { to: '/orders', label: 'Orders' },
                  { to: '/billing', label: 'Billing' },
                ]).map(r => (
                  <button key={r.to + r.label} type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(r.to)}>{r.label}</button>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/work-queue')}>Work queue</button>
              </div>
            </div>
            <div className="chart-overview-grid">
              <section className="card card-pad" aria-label="Care team">
                <div className="chart-card-head">
                  <Users size={15} strokeWidth={1.75} />
                  <span className="card-kicker">Care team</span>
                </div>
                <div className="chart-team-list">
                  {patient.team.map((m, i) => {
                    const parts = m.name.trim().split(/\s+/)
                    const first = parts[0] ?? m.name
                    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0]
                    return (
                      <div className="chart-team-row" key={m.role + m.name}>
                        <PatientAvatar first={first} last={last} tone={AVATAR_TONES[i % AVATAR_TONES.length]} size="sm" />
                        <div className="chart-team-who">
                          <div className="chart-team-name">{m.name}</div>
                          <div className="chart-team-role">{m.role}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="card card-pad" aria-label="Record integrity">
                <div className="chart-integrity-head">
                  <div className="chart-card-head" style={{ marginBottom: 0 }}>
                    <Lock size={15} strokeWidth={1.75} />
                    <span className="card-kicker">Record integrity</span>
                  </div>
                  <ProgressRing
                    pct={(patient.integrity.passed / patient.integrity.total) * 100}
                    size={52}
                    stroke={5}
                    color={
                      patient.integrity.passed >= patient.integrity.total
                        ? 'var(--green-300)'
                        : patient.integrity.passed / patient.integrity.total >= 0.75
                          ? 'var(--yellow-300)'
                          : 'var(--orange-400)'
                    }
                    label={`${patient.integrity.passed} of ${patient.integrity.total} checks passing`}
                  />
                </div>
                <div className="chart-integrity-count">{patient.integrity.passed}<span> / {patient.integrity.total} checks passing</span></div>
                {isElena ? (
                  <div className="chart-integrity-list">
                    {integrityChecks.map(c => (
                      <div className="chart-integrity-row" key={c.id}>
                        <StatusChip tone={INTEGRITY_TONE[c.status]}>{c.label}</StatusChip>
                        <div className="chart-integrity-detail">{c.detail}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chart-empty-note">
                    <ListChecks size={16} strokeWidth={1.5} aria-hidden />
                    Full checklist history is wired for Elena Martinez’s episode in this prototype.
                  </div>
                )}
              </section>

              <section className="card card-pad" aria-label="Upcoming visits">
                <div className="chart-card-head">
                  <CalendarClock size={15} strokeWidth={1.75} />
                  <span className="card-kicker">Upcoming visits</span>
                </div>
                {patientVisits.length === 0 ? (
                  <div className="chart-empty-note">
                    <Calendar size={16} strokeWidth={1.5} aria-hidden />
                    No visits scheduled.
                  </div>
                ) : (
                  <div className="chart-visit-list">
                    {patientVisits.slice(0, 5).map(v => (
                      <div className="chart-visit-row" key={v.id}>
                        <div className="chart-visit-when">
                          <div className="chart-visit-date">{v.date}</div>
                          <div className="chart-visit-time">{v.time}</div>
                        </div>
                        <div className="chart-visit-body">
                          <span className="chip chip-outline">{v.discipline}</span>
                          <span className="chart-visit-type">{v.type}</span>
                        </div>
                        <StatusChip tone={VISIT_STATUS[v.status].tone}>{VISIT_STATUS[v.status].label}</StatusChip>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="card card-pad chart-activity" aria-label="Recent activity">
              <div className="chart-activity-head">
                <div className="chart-card-head" style={{ marginBottom: 0 }}>
                  <History size={15} strokeWidth={1.75} />
                  <span className="card-kicker">Recent activity</span>
                </div>
                <button
                  type="button"
                  className="btn-inline"
                  title="Opens chart timeline tab"
                  onClick={() => navigate(`/patients/${id}/timeline`)}
                >
                  Full timeline <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
                </button>
              </div>
              {patientTimeline.length === 0 ? (
                <div className="chart-empty-note">
                  <History size={16} strokeWidth={1.5} aria-hidden />
                  No recorded activity for this patient yet.
                </div>
              ) : (
                <div className="chart-activity-list">
                  {patientTimeline.slice(0, 4).map(t => {
                    const meta = KIND_META[t.kind]
                    const Icon = meta.icon
                    return (
                      <div className="chart-activity-row" key={t.id}>
                        <span className={'chart-kind-circle is-' + meta.tint} aria-hidden>
                          <Icon size={14} strokeWidth={1.75} />
                        </span>
                        <div className="chart-activity-body">
                          <div className="chart-activity-title">{t.title}</div>
                          <div className="chart-activity-detail">{t.detail}</div>
                        </div>
                        <div className="chart-activity-when">{t.when}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'timeline' && (
          <section className="card card-pad" aria-label="Patient timeline">
            {patientTimeline.length === 0 ? (
              <EmptyState icon={<History size={28} strokeWidth={1.5} />} title="No timeline events" sub="Nothing has been recorded for this patient yet." />
            ) : (
              <ol className="chart-timeline">
                {patientTimeline.map((t, i) => {
                  const meta = KIND_META[t.kind]
                  const Icon = meta.icon
                  return (
                    <li className="chart-timeline-item" key={t.id}>
                      <div className="chart-timeline-rail">
                        <span className={'chart-kind-circle is-' + meta.tint} aria-hidden>
                          <Icon size={14} strokeWidth={1.75} />
                        </span>
                        {i < patientTimeline.length - 1 && <span className="chart-timeline-connector" aria-hidden />}
                      </div>
                      <div className="chart-timeline-content">
                        <div className="chart-timeline-when">{t.when}</div>
                        <div className="chart-timeline-title">{t.title}</div>
                        <div className="chart-timeline-detail">{t.detail}</div>
                        <div className="chart-timeline-actor">{t.actor}</div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        )}

        {activeTab === 'plan-of-care' && (
          <>
            {isElena ? (
              <>
                <section className="card card-pad chart-poc-callout" aria-label="Plan of care status">
                  <StatusChip tone="warn">Pending physician signature</StatusChip>
                  <div className="chart-poc-callout-text">Sent to Dr. Susan Cho · Jul 29</div>
                  <button
                    type="button"
                    className="btn btn-outline-accent btn-sm"
                    title="Visual only · opens orders workspace · no reminder is sent"
                    onClick={() => navigate('/orders')}
                  >
                    <Send size={13} strokeWidth={2} aria-hidden />
                    Send reminder
                  </button>
                </section>

                <section className="card card-pad chart-poc-section" aria-label="Certification period">
                  <div className="card-kicker">Certification period</div>
                  <div className="chart-poc-cert">Jul 29 – Sep 26 · Cert 1</div>
                </section>

                <section className="card card-pad chart-poc-section" aria-label="Diagnoses">
                  <div className="card-kicker">Diagnoses</div>
                  <div className="chart-dx-list">
                    <div className="chart-dx-row chart-dx-primary">
                      <span className="chip chip-brand">Primary</span>
                      <span className="chart-dx-code">Z47.1</span>
                      <span className="chart-dx-label">Orthopedic aftercare · s/p right hip replacement</span>
                    </div>
                    {[
                      { code: 'M25.551', label: 'Pain in right hip' },
                      { code: 'Z79.899', label: 'Long-term use of other drug therapy (anticoagulant)' },
                      { code: 'E78.5', label: 'Hyperlipidemia, unspecified' },
                      { code: 'I10', label: 'Essential (primary) hypertension' },
                    ].map(dx => (
                      <div className="chart-dx-row" key={dx.code}>
                        <span className="chip chip-outline">Secondary</span>
                        <span className="chart-dx-code">{dx.code}</span>
                        <span className="chart-dx-label">{dx.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card card-pad chart-poc-section" aria-label="Orders and frequencies">
                  <div className="card-kicker">Orders &amp; frequencies</div>
                  <div className="chart-freq-list">
                    {[
                      { d: 'SN', freq: '2w9', detail: 'Skilled nursing — SOC follow-up, med management' },
                      { d: 'PT', freq: '2w9', detail: 'Physical therapy — gait training, hip precautions' },
                      { d: 'HHA', freq: '3w9', detail: 'Home health aide — personal care' },
                    ].map(o => (
                      <div className="chart-freq-row" key={o.d}>
                        <span className="chip chip-teal">{o.d}</span>
                        <span className="chart-freq-code">{o.freq}</span>
                        <span className="chart-freq-detail">{o.detail}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card card-pad chart-poc-section" aria-label="Goals">
                  <div className="card-kicker">Goals</div>
                  <div className="chart-goal-list">
                    {[
                      { goal: 'Ambulate 150 ft with front-wheeled walker without loss of balance', by: 'Aug 26' },
                      { goal: 'Independent with hip precautions (no bending past 90°, no internal rotation)', by: 'Aug 12' },
                      { goal: 'Pain rated ≤ 3/10 with activity', by: 'Aug 19' },
                      { goal: 'Verbalize understanding of anticoagulant regimen and bleeding precautions', by: 'Aug 5' },
                    ].map((g, i) => (
                      <div className="chart-goal-row" key={i}>
                        <Target size={14} strokeWidth={1.75} aria-hidden />
                        <span className="chart-goal-text">{g.goal}</span>
                        <span className="chart-goal-by">By {g.by}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card card-pad chart-poc-section" aria-label="Safety measures and DME">
                  <div className="card-kicker">Safety measures &amp; DME</div>
                  <div className="chart-safety-list">
                    <div className="chart-safety-row"><Check size={14} strokeWidth={2} aria-hidden /> Front-wheeled walker — in home</div>
                    <div className="chart-safety-row"><Check size={14} strokeWidth={2} aria-hidden /> Grab bars — bathroom, recommended at SOC</div>
                    <div className="chart-safety-row is-muted"><Check size={14} strokeWidth={2} aria-hidden /> Oxygen precautions — N/A</div>
                  </div>
                </section>
              </>
            ) : planOrder ? (
              <section className="card card-pad chart-poc-callout" aria-label="Plan of care status">
                <StatusChip tone={ORDER_STATUS[planOrder.status].tone}>{ORDER_STATUS[planOrder.status].label}</StatusChip>
                <div className="chart-poc-callout-text">{planOrder.summary} · {planOrder.orderedBy} · {planOrder.date}</div>
                <div className="chart-poc-callout-sub">
                  Episode SOC {patient.episode.socDate} · {patient.episode.length}-day certification period · primary diagnosis {patient.primaryDx.code}
                </div>
              </section>
            ) : (
              <section className="card card-pad">
                <EmptyState icon={<FileSignature size={28} strokeWidth={1.5} />} title="No plan of care on file" sub="A CMS-485 has not been drafted for this episode yet." />
              </section>
            )}
          </>
        )}

        {activeTab === 'assessments' && (
          <section className="card card-pad" aria-label="Assessments">
            {patientAssessments.length === 0 ? (
              <EmptyState icon={<ClipboardList size={28} strokeWidth={1.5} />} title="No assessments on file" sub="Nothing has been scheduled for this episode yet." />
            ) : (
              <div className="chart-assess-list">
                {patientAssessments.map(a => (
                  <div className="chart-assess-item" key={a.id}>
                    <div className="chart-assess-row">
                      <div className="chart-assess-who">
                        <div className="chart-assess-name">{a.name}</div>
                        <div className="chart-assess-meta">{a.discipline} · {a.window}</div>
                      </div>
                      <div className="chart-assess-progress">
                        <ProgressBar
                          pct={a.completion}
                          color={a.completion === 100 ? 'var(--green-300)' : 'var(--orange-400)'}
                          label={`${a.name} assessment ${a.completion}% complete`}
                        />
                        <span className="chart-assess-pct">{a.completion}%</span>
                      </div>
                      <StatusChip tone={ASSESS_STATUS[a.status].tone}>{ASSESS_STATUS[a.status].label}</StatusChip>
                      {a.items ? (
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={breakdownOpen ? 'Collapse section breakdown' : 'Expand section breakdown'}
                          aria-expanded={breakdownOpen}
                          title="Toggle section breakdown"
                          onClick={() => setBreakdownOpen(o => !o)}
                        >
                          <ChevronDown size={16} strokeWidth={2} style={{ transform: breakdownOpen ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }} />
                        </button>
                      ) : null}
                    </div>
                    {a.items && breakdownOpen ? (
                      <div className="chart-assess-breakdown">
                        {a.items.map(sec => (
                          <div className="chart-assess-section-row" key={sec.section}>
                            <span className="chart-assess-section-label">{sec.section}</span>
                            <ProgressBar
                              pct={(sec.done / sec.total) * 100}
                              label={`${a.name} · ${sec.section} ${sec.done} of ${sec.total} items`}
                            />
                            <span className="chart-assess-section-count">{sec.done}/{sec.total}</span>
                          </div>
                        ))}
                        <div className="chart-assess-callout">
                          <ShieldAlert size={14} strokeWidth={1.75} aria-hidden />
                          7 responses need clinician confirmation
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          title="Visual only · opens OASIS workspace · assessment is not mutated here"
                          onClick={() => navigate('/oasis')}
                        >
                          <PlayCircle size={14} strokeWidth={2} aria-hidden />
                          Resume assessment
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'visits' && (
          <section className="card" aria-label="Visits">
            {patientVisits.length === 0 ? (
              <div className="card-pad"><EmptyState icon={<Calendar size={28} strokeWidth={1.5} />} title="No visits" sub="No visits are scheduled for this patient." /></div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Discipline</th>
                    <th>Type</th>
                    <th>Clinician</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientVisits.map(v => (
                    <tr key={v.id}>
                      <td>{v.date}</td>
                      <td>{v.time}</td>
                      <td><span className="chip chip-outline">{v.discipline}</span></td>
                      <td>{v.type}</td>
                      <td>{v.clinician}</td>
                      <td><StatusChip tone={VISIT_STATUS[v.status].tone}>{VISIT_STATUS[v.status].label}</StatusChip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="card" aria-label="Orders">
            {patientOrders.length === 0 ? (
              <div className="card-pad"><EmptyState icon={<FileSignature size={28} strokeWidth={1.5} />} title="No orders" sub="No orders have been placed for this patient." /></div>
            ) : (
              <div className="chart-order-list">
                {patientOrders.map(o => (
                  <div className="chart-order-row" key={o.id}>
                    <div className="chart-order-body">
                      <div className="chart-order-summary-row">
                        <span className="chart-order-summary">{o.summary}</span>
                        <span className="chip chip-teal">{ORDER_CATEGORY_LABEL[o.category]}</span>
                        {o.urgent ? <span className="chip chip-bad">Urgent</span> : null}
                      </div>
                      <div className="chart-order-meta">{o.orderedBy} · {o.date}{o.due ? ` · Due ${o.due}` : ''}</div>
                    </div>
                    <StatusChip tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</StatusChip>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'medications' && (
          <>
            {needsReviewMed ? (
              <section className="card card-pad chart-med-alert" aria-label="Medication needs review">
                <div className="chart-med-alert-head">
                  <ShieldAlert size={16} strokeWidth={1.75} aria-hidden />
                  <span className="card-kicker">Needs review</span>
                </div>
                <div className="chart-med-alert-name">{needsReviewMed.name} {needsReviewMed.dose} · {needsReviewMed.frequency}</div>
                <p className="chart-med-alert-note">{needsReviewMed.note}</p>
                <div className="chart-med-alert-actions">
                  <button
                    type="button"
                    className="btn btn-teal btn-sm"
                    title="Visual only · no message is sent"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare size={13} strokeWidth={2} aria-hidden />
                    Message physician
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled
                    title="Visual only · reconciliation is not complete while high-risk discrepancy is open"
                  >
                    <Check size={13} strokeWidth={2} aria-hidden />
                    Mark reconciled
                  </button>
                </div>
                <p className="chart-med-alert-foot">
                  Reconciliation is not complete. Mark reconciled stays disabled until the discrepancy is resolved in production.
                </p>
              </section>
            ) : null}

            <section className="card" aria-label="Medications">
              {otherMeds.length === 0 && !needsReviewMed ? (
                <div className="card-pad"><EmptyState icon={<Pill size={28} strokeWidth={1.5} />} title="No medications on file" sub="No medications have been recorded for this patient." /></div>
              ) : otherMeds.length === 0 ? null : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Route</th>
                      <th>Frequency</th>
                      <th>Start</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherMeds.map(m => (
                      <tr key={m.id}>
                        <td>
                          {m.name} {m.dose}
                          {m.highRisk ? <span className="chip chip-bad chart-med-highrisk"><ShieldAlert size={11} strokeWidth={2} aria-hidden /> High-risk</span> : null}
                        </td>
                        <td>{m.route}</td>
                        <td>{m.frequency}</td>
                        <td>{m.startDate}</td>
                        <td><StatusChip tone={m.status === 'active' ? 'good' : m.status === 'held' ? 'warn' : 'neutral'}>{m.status === 'active' ? 'Active' : m.status === 'held' ? 'Held' : 'Discontinued'}</StatusChip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {patientMeds.length > 0 && (
                <div className={'chart-med-footer' + (needsReviewMed ? ' is-attention' : '')}>
                  {needsReviewMed
                    ? `Medication reconciliation incomplete · open discrepancy · SOC ${patient.episode.socDate}`
                    : `Medication list reconciled at SOC · ${patient.episode.socDate}`}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'documents' && (
          <>
            <div className="chart-related card card-pad">
              <span className="card-kicker">Continue in</span>
              <div className="chart-related-actions">
                {DOC_CONTINUE_LINKS.map(r => (
                  <button
                    key={r.to}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    title={`Opens ${r.label}`}
                    onClick={() => navigate(r.to)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <section className="card" aria-label="Documents">
              {patientDocs.length === 0 ? (
                <div className="card-pad"><EmptyState icon={<FileText size={28} strokeWidth={1.5} />} title="No documents on file" sub="No documents have been uploaded for this patient." /></div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Pages</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDocs.map(d => (
                      <tr key={d.id} className="chart-doc-row">
                        <td>
                          <span className="chart-doc-title"><FileText size={14} strokeWidth={1.75} aria-hidden /> {d.title}</span>
                        </td>
                        <td><span className="chip chip-outline">{DOC_CATEGORY_LABEL[d.category]}</span></td>
                        <td>{d.date}</td>
                        <td>{d.pages}</td>
                        <td><StatusChip tone={DOC_STATUS[d.status].tone}>{DOC_STATUS[d.status].label}</StatusChip></td>
                        <td className="chart-doc-open">
                          <button
                            type="button"
                            className="btn-inline"
                            title="Opens documents workspace · prototype review only"
                            onClick={() => navigate('/documents')}
                          >
                            Open in Documents
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
