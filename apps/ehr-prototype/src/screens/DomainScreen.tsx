import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Compass, HardHat, ListChecks } from 'lucide-react'
import { REGISTER_DOMAINS, REQUIREMENT_REGISTER } from '../data/requirementsSpec'
import { ALL_NAV_ITEMS } from '../data/navigation'
import { EmptyState, StatusChip } from '../ui'
import './domain.css'

const PRIORITY_CHIP: Record<string, string> = {
  MUST: 'chip-brand', SHOULD: 'chip-teal', CONDITIONAL: 'chip-neutral', UNSET: 'chip-neutral',
}

/**
 * Destination for navigation areas the requirements define but the prototype
 * has not built. It never pretends to be the feature: it names the domain,
 * shows that domain's real requirement statements from the register, and states
 * plainly that nothing here is implemented.
 */
export default function DomainScreen() {
  const { domainId = '' } = useParams()
  const navigate = useNavigate()
  const domain = REGISTER_DOMAINS.find(d => d.id === domainId.toUpperCase())

  if (!domain) {
    return (
      <div className="screen">
        <div className="card">
          <EmptyState
            icon={<Compass size={28} strokeWidth={1.5} />}
            title="Unknown domain"
            sub={`No requirement domain matches "${domainId}".`}
          />
        </div>
      </div>
    )
  }

  const rows = REQUIREMENT_REGISTER.filter(r => r.domainId === domain.id)
  const navAreas = ALL_NAV_ITEMS.filter(i => i.domainId === domain.id)

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain {domain.num} · {domain.id}</div>
          <h1 className="screen-title">{domain.name}</h1>
          <div className="screen-sub">{domain.description}</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Open requirements register
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <section className="card dom-notice" aria-label="Implementation status">
        <span className="dom-notice-icon"><HardHat size={17} strokeWidth={1.75} aria-hidden /></span>
        <div className="dom-notice-body">
          <div className="dom-notice-head">
            <h2 className="card-title">Not built in this prototype</h2>
            <StatusChip tone="neutral">Planned</StatusChip>
          </div>
          <p className="dom-notice-text">
            This area is in the requirements baseline but has no implementation yet.
            The programme is at a planning baseline and is not build authorized, so
            nothing here is wired to data, and no screen in this domain should be
            treated as evidence of a working capability.
          </p>
          {navAreas.length > 0 && (
            <div className="dom-notice-areas">
              <span className="dom-notice-areas-label">Navigation areas in this domain</span>
              <div className="dom-chip-row">
                {navAreas.map(a => (
                  <span key={a.label + a.to} className={'chip ' + (a.status === 'built' ? 'chip-good' : 'chip-neutral')}>
                    {a.label}{a.status === 'built' ? ' · built' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card" aria-label="Requirements for this domain">
        <div className="dom-section-head">
          <div>
            <div className="card-kicker">From the register</div>
            <h2 className="card-title">Requirements in scope</h2>
          </div>
          <span className="chip chip-neutral">
            <ListChecks size={12} strokeWidth={2} aria-hidden />
            {rows.length === 0 ? 'No sampled statements' : `${rows.length} sampled statement${rows.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={26} strokeWidth={1.5} />}
            title="No statements sampled for this domain"
            sub="The register carries 170 statements in total; this prototype samples a subset. Open the register to see the full inventory and its gaps."
          />
        ) : (
          <ul className="dom-req-list">
            {rows.map(r => (
              <li className="dom-req" key={r.id}>
                <div className="dom-req-top">
                  <span className="dom-req-id">{r.id}</span>
                  <span className="dom-req-title">{r.title}</span>
                  <span className={'chip ' + (PRIORITY_CHIP[r.priority] ?? 'chip-neutral')}>{r.priority}</span>
                </div>
                <p className="dom-req-text">{r.text}</p>
                {r.acceptance ? (
                  <p className="dom-req-acceptance">
                    <span className="dom-req-acceptance-label">Acceptance</span>
                    {r.acceptance}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="dom-foot">
          Statements are reproduced verbatim from the requirements baseline
          (CI-EHR-SRS-PM-001). This view samples the register rather than
          restating all 170 requirements.
        </p>
      </section>
    </div>
  )
}
