import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, FlaskConical, MessageSquare, Search, Users,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { MESSAGE_THREADS } from '../data/workspace'
import type { MessageThread } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './msg.css'

type ChannelFilter = 'all' | MessageThread['channel']

const CHANNEL_META: Record<MessageThread['channel'], { tone: StatusTone; label: string }> = {
  clinical: { tone: 'progress', label: 'Clinical' },
  ops: { tone: 'warn', label: 'Ops' },
  billing: { tone: 'neutral', label: 'Billing' },
  compliance: { tone: 'bad', label: 'Compliance' },
}

const FILTERS: { key: ChannelFilter; label: string }[] = [
  { key: 'all', label: 'All channels' },
  { key: 'clinical', label: 'Clinical' },
  { key: 'ops', label: 'Ops' },
  { key: 'billing', label: 'Billing' },
  { key: 'compliance', label: 'Compliance' },
]

export default function MessagesScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [channel, setChannel] = useState<ChannelFilter>('all')
  const [selectedId, setSelectedId] = useState(MESSAGE_THREADS[0]?.id ?? null)
  /** Thread ids opened this session — local read state only (no server write). */
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())

  const isUnread = (t: MessageThread) => t.unread && !readIds.has(t.id)

  // Selecting an unread thread marks it read in local React state.
  useEffect(() => {
    if (!selectedId) return
    const thread = MESSAGE_THREADS.find(t => t.id === selectedId)
    if (!thread?.unread) return
    setReadIds(prev => {
      if (prev.has(selectedId)) return prev
      const next = new Set(prev)
      next.add(selectedId)
      return next
    })
  }, [selectedId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MESSAGE_THREADS.filter(t => {
      if (channel !== 'all' && t.channel !== channel) return false
      if (!q) return true
      const patient = t.patientId ? getPatient(t.patientId) : undefined
      const hay = [
        t.subject, t.preview, ...t.participants,
        patient ? `${patient.firstName} ${patient.lastName}` : '',
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [query, channel])

  const selected = MESSAGE_THREADS.find(t => t.id === selectedId) ?? null
  const selectedUnread = selected ? isUnread(selected) : false
  const unread = MESSAGE_THREADS.filter(t => isUnread(t)).length

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain COR · messages</div>
          <h1 className="screen-title">Messages</h1>
          <div className="screen-sub">
            In-app clinical and ops threads with patient context — design prototype, not Connect rail.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/work-queue')}>
            Work queue
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={false}
            title="Visual only · no message is sent"
            onClick={() => { /* visual only — compose is not wired */ }}
          >
            <MessageSquare size={15} strokeWidth={2} aria-hidden />
            Compose
          </button>
        </div>
      </div>

      <div className="msg-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · threads are not delivered to real staff inboxes.
          External Connect remains a future integration option, not this nav destination.
        </span>
      </div>

      <RelatedNav route="/messages" />

      <div className="msg-stats">
        <StatCard icon={<MessageSquare size={16} strokeWidth={1.75} aria-hidden />} kicker="Open threads" value={MESSAGE_THREADS.length} sub="Synthetic sample" accent="teal" />
        <StatCard icon={<Users size={16} strokeWidth={1.75} aria-hidden />} kicker="Unread" value={unread} sub="Needs attention" accent="orange" />
        <StatCard icon={<MessageSquare size={16} strokeWidth={1.75} aria-hidden />} kicker="Patient-linked" value={MESSAGE_THREADS.filter(t => t.patientId).length} sub="Chart context available" accent="teal" />
        <StatCard icon={<MessageSquare size={16} strokeWidth={1.75} aria-hidden />} kicker="Compliance" value={MESSAGE_THREADS.filter(t => t.channel === 'compliance').length} sub="Vendor / BAA threads" accent="warn" />
      </div>

      <div className="msg-workspace">
        <section className="card" aria-label="Message threads">
          <div className="msg-toolbar">
            <label className="msg-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search messages</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search subject, people, or patient" />
            </label>
            <div className="msg-filters" role="toolbar" aria-label="Filter by channel">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={'msg-filter' + (channel === f.key ? ' is-active' : '')}
                  aria-pressed={channel === f.key}
                  onClick={() => setChannel(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<MessageSquare size={26} strokeWidth={1.5} />} title="No threads match" sub="Clear filters. All threads are synthetic." />
          ) : (
            <div className="msg-list">
              {filtered.map(t => {
                const patient = t.patientId ? getPatient(t.patientId) : undefined
                const meta = CHANNEL_META[t.channel]
                const unreadRow = isUnread(t)
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={'msg-row' + (t.id === selectedId ? ' is-selected' : '') + (unreadRow ? ' is-unread' : '')}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <span className="msg-row-main">
                      <span className="msg-row-top">
                        <strong className="msg-subject">{t.subject}</strong>
                        {unreadRow ? <StatusChip tone="warn">Unread</StatusChip> : null}
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="msg-preview">{t.preview}</span>
                      <span className="msg-meta">
                        {patient ? (
                          <span className="msg-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            {patient.firstName} {patient.lastName}
                          </span>
                        ) : (
                          <span>No patient link</span>
                        )}
                        <span className="msg-dot" aria-hidden />
                        <span>{t.participants.join(' · ')}</span>
                        <span className="msg-dot" aria-hidden />
                        <span>{t.when}</span>
                      </span>
                    </span>
                    <ArrowRight size={14} strokeWidth={2} className="msg-go" aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="card msg-inspector" aria-label="Thread inspector">
          {selected ? (
            <div className="msg-detail">
              <div className="card-kicker">Thread</div>
              <h2 className="card-title msg-detail-title">{selected.subject}</h2>
              <div className="msg-detail-chips">
                <StatusChip tone={CHANNEL_META[selected.channel].tone}>{CHANNEL_META[selected.channel].label}</StatusChip>
                {selectedUnread ? <StatusChip tone="warn">Unread</StatusChip> : <StatusChip tone="good">Read</StatusChip>}
              </div>
              <p className="msg-detail-copy">{selected.preview}</p>
              <div className="msg-detail-block">
                <span className="card-kicker">Participants</span>
                <strong>{selected.participants.join(', ')}</strong>
              </div>
              {selected.patientId ? (() => {
                const p = getPatient(selected.patientId!)
                if (!p) return null
                return (
                  <button type="button" className="msg-patient" onClick={() => navigate(`/patients/${p.id}`)}>
                    <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                    <span>
                      <strong>{p.firstName} {p.lastName}</strong>
                      <span>MRN {p.mrn} · open chart</span>
                    </span>
                    <ArrowRight size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })() : null}
              <div className="msg-related">
                <span className="card-kicker">Continue in</span>
                <div className="msg-related-actions">
                  {selected.related.map(r => (
                    <button key={r.to} type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(r.to)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="msg-footnote">
                Compose / reply / escalate controls are visual only. Nothing is sent. Opening a thread marks it
                read in this session only.
              </p>
            </div>
          ) : (
            <EmptyState icon={<MessageSquare size={26} strokeWidth={1.5} />} title="Select a thread" sub="Choose a message to inspect context and related work." />
          )}
        </aside>
      </div>
    </div>
  )
}
