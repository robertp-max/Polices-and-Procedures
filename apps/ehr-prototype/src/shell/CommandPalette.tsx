import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, ClipboardList, FileSignature, Inbox, LayoutDashboard, Receipt,
  Search, ShieldCheck, Stethoscope, TrendingUp, User, Users,
} from 'lucide-react'
import { patients } from '../data/patients'
import { PatientAvatar } from '../ui'

const DESTINATIONS = [
  { to: '/today', label: 'Today', icon: LayoutDashboard, hint: 'Dashboard' },
  { to: '/patients', label: 'Patients', icon: Users, hint: 'Roster' },
  { to: '/intake', label: 'Referral & intake', icon: Inbox, hint: 'Pipeline' },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays, hint: 'Week view' },
  { to: '/clinical', label: 'Clinical', icon: Stethoscope, hint: 'Documentation' },
  { to: '/orders', label: 'Orders', icon: FileSignature, hint: 'Worklist' },
  { to: '/quality', label: 'Quality & compliance', icon: ShieldCheck, hint: 'QAPI' },
  { to: '/billing', label: 'Billing', icon: Receipt, hint: 'Claims' },
  { to: '/reports', label: 'Reports', icon: TrendingUp, hint: 'Insights' },
  { to: '/business-plan', label: 'Business Plan', icon: ClipboardList, hint: 'Mode' },
  { to: '/requirements', label: 'Requirements', icon: ClipboardList, hint: 'Mode' },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pats = patients
      .filter(p => !q || `${p.firstName} ${p.lastName} ${p.mrn} ${p.primaryDx.label}`.toLowerCase().includes(q))
      .slice(0, q ? 6 : 3)
      .map(p => ({
        kind: 'patient' as const,
        key: p.id,
        label: `${p.firstName} ${p.lastName}`,
        hint: `MRN ${p.mrn} · ${p.primaryDx.code}`,
        to: `/patients/${p.id}`,
        patient: p,
      }))
    const dests = DESTINATIONS
      .filter(d => !q || d.label.toLowerCase().includes(q))
      .map(d => ({ kind: 'nav' as const, key: d.to, label: d.label, hint: d.hint, to: d.to, icon: d.icon }))
    return [...pats, ...dests]
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => { setCursor(0) }, [query])

  if (!open) return null

  const go = (to: string) => { onClose(); navigate(to) }

  return (
    <div className="cp-scrim" onMouseDown={onClose}>
      <div className="cp" role="dialog" aria-label="Search" onMouseDown={e => e.stopPropagation()}>
        <div className="cp-input">
          <Search size={16} strokeWidth={1.75} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search patients, screens, records…"
            aria-label="Search patients and screens"
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
              if (e.key === 'Enter' && results[cursor]) go(results[cursor].to)
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="cp-results">
          {results.length === 0 && <div className="cp-empty">No matches — try a patient name or MRN.</div>}
          {results.map((r, i) => (
            <button
              key={r.kind + r.key}
              className={'cp-row' + (i === cursor ? ' is-cursor' : '')}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(r.to)}
            >
              {r.kind === 'patient'
                ? <PatientAvatar first={r.patient.firstName} last={r.patient.lastName} tone={r.patient.photoTone} size="sm" />
                : <span className="cp-ico"><r.icon size={15} strokeWidth={1.75} aria-hidden /></span>}
              <span className="cp-label">{r.label}</span>
              <span className="cp-hint">{r.hint}</span>
              {r.kind === 'patient' && <span className="cp-kind"><User size={11} strokeWidth={2} aria-hidden /> Patient</span>}
            </button>
          ))}
        </div>
        <div className="cp-foot">↑↓ navigate · Enter open · Synthetic data only</div>
      </div>
    </div>
  )
}
