import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, FileSignature, FileText, FlaskConical, Search, Signature,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { CONTROLLED_DOCUMENTS } from '../data/workspace'
import type { ControlledDocument } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './docs.css'

type StatusFilter = 'all' | ControlledDocument['status']

const STATUS_META: Record<ControlledDocument['status'], { tone: StatusTone; label: string }> = {
  draft: { tone: 'neutral', label: 'Draft' },
  'pending-signature': { tone: 'warn', label: 'Pending signature' },
  signed: { tone: 'good', label: 'Signed' },
  void: { tone: 'bad', label: 'Void' },
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending-signature', label: 'Pending signature' },
  { key: 'signed', label: 'Signed' },
  { key: 'draft', label: 'Draft' },
]

export default function DocumentsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState(CONTROLLED_DOCUMENTS[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CONTROLLED_DOCUMENTS.filter(d => {
      if (filter !== 'all' && d.status !== filter) return false
      if (!q) return true
      const patient = d.patientId ? getPatient(d.patientId) : undefined
      const hay = [d.title, d.kind, d.signer ?? '', patient ? `${patient.firstName} ${patient.lastName}` : ''].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [query, filter])

  const selected = CONTROLLED_DOCUMENTS.find(d => d.id === selectedId) ?? null
  const pending = CONTROLLED_DOCUMENTS.filter(d => d.status === 'pending-signature').length

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain DOC · documents & signatures</div>
          <h1 className="screen-title">Documents & signatures</h1>
          <div className="screen-sub">
            Controlled packets and signature queue — in-app design, not external eCign rail.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/forms')}>
            Forms library
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/legal-evidence')}>
            Legal evidence
          </button>
          <button type="button" className="btn btn-primary" title="Visual only · no signature is captured">
            <Signature size={15} strokeWidth={2} aria-hidden />
            Request signature
          </button>
        </div>
      </div>

      <div className="docs-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · nothing is signed or sealed. Production eCign remains a
          candidate signing rail; this screen owns the EHR operator experience.
        </span>
      </div>

      <RelatedNav route="/documents" />

      <div className="docs-stats">
        <StatCard icon={<FileText size={16} strokeWidth={1.75} aria-hidden />} kicker="Documents" value={CONTROLLED_DOCUMENTS.length} sub="Sample set" accent="teal" />
        <StatCard icon={<FileSignature size={16} strokeWidth={1.75} aria-hidden />} kicker="Pending signature" value={pending} sub="Blocks claim / seal paths" accent="warn" />
        <StatCard icon={<Signature size={16} strokeWidth={1.75} aria-hidden />} kicker="Signed" value={CONTROLLED_DOCUMENTS.filter(d => d.status === 'signed').length} sub="Intent recorded (sample)" accent="good" />
        <StatCard icon={<FileText size={16} strokeWidth={1.75} aria-hidden />} kicker="Draft" value={CONTROLLED_DOCUMENTS.filter(d => d.status === 'draft').length} sub="Not ready for intent" accent="orange" />
      </div>

      <div className="docs-workspace">
        <section className="card" aria-label="Document registry">
          <div className="docs-toolbar">
            <label className="docs-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search documents</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, signer, or patient" />
            </label>
            <div className="docs-filters" role="toolbar" aria-label="Filter by status">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={'docs-filter' + (filter === f.key ? ' is-active' : '')}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<FileText size={26} strokeWidth={1.5} />} title="No documents match" sub="Clear filters. All documents are synthetic." />
          ) : (
            <div className="docs-list">
              {filtered.map(d => {
                const patient = d.patientId ? getPatient(d.patientId) : undefined
                const meta = STATUS_META[d.status]
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={'docs-row' + (d.id === selectedId ? ' is-selected' : '')}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <span className="docs-row-main">
                      <span className="docs-row-top">
                        <span className="docs-id">{d.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{d.kind}</span>
                      </span>
                      <span className="docs-title">{d.title}</span>
                      <span className="docs-meta">
                        {patient ? (
                          <span className="docs-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            {patient.firstName} {patient.lastName}
                          </span>
                        ) : <span>No patient</span>}
                        <span className="docs-dot" aria-hidden />
                        <span>{d.pages} pages</span>
                        {d.signer ? (
                          <>
                            <span className="docs-dot" aria-hidden />
                            <span>{d.signer}</span>
                          </>
                        ) : null}
                      </span>
                    </span>
                    <ArrowRight size={14} className="docs-go" strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="card docs-inspector" aria-label="Document inspector">
          {selected ? (
            <div className="docs-detail">
              <div className="card-kicker">Document</div>
              <h2 className="card-title docs-detail-title">{selected.title}</h2>
              <StatusChip tone={STATUS_META[selected.status].tone}>{STATUS_META[selected.status].label}</StatusChip>
              {selected.patientId ? (() => {
                const p = getPatient(selected.patientId!)
                if (!p) return null
                return (
                  <button type="button" className="docs-patient" onClick={() => navigate(`/patients/${p.id}`)}>
                    <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                    <span>
                      <strong>{p.firstName} {p.lastName}</strong>
                      <span>MRN {p.mrn} · open chart</span>
                    </span>
                    <ArrowRight size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })() : null}
              <div className="docs-grid">
                <div>
                  <span className="card-kicker">Signer</span>
                  <strong>{selected.signer ?? 'Not assigned'}</strong>
                </div>
                <div>
                  <span className="card-kicker">Pages</span>
                  <strong>{selected.pages}</strong>
                </div>
              </div>
              <div className="docs-related">
                <span className="card-kicker">Continue in</span>
                <div className="docs-related-actions">
                  {selected.related.map(r => (
                    <button key={r.to + r.label} type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(r.to)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="docs-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={selected.status === 'signed' || selected.status === 'void'}
                  title="Visual only · no signature is captured"
                >
                  Capture signature
                </button>
              </div>
              <p className="docs-footnote">Signature capture is visual only. No certificate or intent is written.</p>
            </div>
          ) : (
            <EmptyState icon={<FileSignature size={26} strokeWidth={1.5} />} title="Select a document" sub="Inspect signature state and related workspaces." />
          )}
        </aside>
      </div>
    </div>
  )
}
