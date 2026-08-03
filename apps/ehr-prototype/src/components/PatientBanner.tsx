import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarRange, MapPin, ShieldAlert } from 'lucide-react'
import type { Patient } from '../data/types'
import { PatientAvatar } from '../ui'
import './patient-banner.css'

export function PatientBanner({ patient, cta, compact }: {
  patient: Patient
  cta?: { label: string; to: string }
  compact?: boolean
}) {
  const navigate = useNavigate()
  const p = patient
  return (
    <section className={'pb card' + (compact ? ' pb-compact' : '')} aria-label={`Patient ${p.firstName} ${p.lastName}`}>
      <div className="pb-identity">
        <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} size="lg" />
        <div className="pb-who">
          <div className="pb-name-row">
            <h2 className="pb-name">{p.firstName} {p.lastName}</h2>
            {p.episode.status === 'active' && <span className="chip chip-teal">Active episode</span>}
            {p.episode.status === 'pending-soc' && <span className="chip chip-brand">SOC pending</span>}
            {p.episode.status === 'discharge-planned' && <span className="chip chip-neutral">Discharge planned</span>}
            {p.flags.map(f => (
              <span key={f} className={'chip ' + (f === 'Fall risk' ? 'chip-warn' : 'chip-neutral')}>{f}</span>
            ))}
          </div>
          <div className="pb-meta">
            {p.age} years · {p.pronouns} · MRN {p.mrn} · {p.payer}
            <span className="pb-meta-geo"><MapPin size={12} strokeWidth={2} aria-hidden /> {p.city}</span>
          </div>
        </div>
      </div>

      <div className="pb-facts">
        <div className="pb-fact">
          <div className="pb-fact-label">Primary diagnosis</div>
          <div className="pb-fact-value">{p.primaryDx.code} · {p.primaryDx.label}</div>
        </div>
        <div className="pb-fact">
          <div className="pb-fact-label">Allergies</div>
          <div className="pb-fact-value pb-allergy">
            {p.allergies.length === 0 ? 'No known allergies' : p.allergies.map(a => (
              <span key={a.substance}><ShieldAlert size={12.5} strokeWidth={2} aria-hidden /> {a.substance} · {a.reaction}</span>
            ))}
          </div>
        </div>
        <div className="pb-fact">
          <div className="pb-fact-label">Episode</div>
          <div className="pb-fact-value">
            <CalendarRange size={12.5} strokeWidth={2} aria-hidden /> SOC {p.episode.socDate} · Day {p.episode.day} of {p.episode.length}
          </div>
        </div>
      </div>

      {cta ? (
        <button className="btn btn-primary pb-cta" onClick={() => navigate(cta.to)}>
          {cta.label}
          <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
        </button>
      ) : null}
    </section>
  )
}
