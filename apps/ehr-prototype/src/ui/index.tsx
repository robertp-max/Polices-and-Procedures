import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, XCircle } from 'lucide-react'
import './ui.css'

/* ---------- StatCard ---------- */

export function StatCard(props: {
  icon: ReactNode
  kicker: string
  value: ReactNode
  sub: string
  accent?: 'teal' | 'orange' | 'good' | 'warn' | 'bad'
  meter?: { pct: number; label?: string }
}) {
  const accentVar = {
    teal: 'var(--teal-400)',
    orange: 'var(--orange-400)',
    good: 'var(--green-300)',
    warn: 'var(--yellow-300)',
    bad: 'var(--red-300)',
  }[props.accent ?? 'teal']
  return (
    <div className="stat-card" style={{ ['--stat-accent' as string]: accentVar }}>
      <div className="stat-card-head">
        {props.icon}
        <span className="card-kicker">{props.kicker}</span>
      </div>
      <div className="stat-card-value">{props.value}</div>
      {props.meter ? (
        <ProgressBar
          pct={props.meter.pct}
          color={accentVar}
          label={props.meter.label ?? `${props.kicker} ${Math.round(props.meter.pct)}%`}
        />
      ) : null}
      <div className="stat-card-sub">{props.sub}</div>
    </div>
  )
}

/* ---------- Progress ---------- */

export function ProgressBar({ pct, color, label }: { pct: number; color?: string; label?: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progress ${Math.round(pct)}%`}
    >
      <div className="progress-fill" style={{ width: `${pct}%`, ['--progress-color' as string]: color }} />
    </div>
  )
}

export function ProgressRing({ pct, size = 64, stroke = 6, color = 'var(--teal-400)', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `${pct}%`}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="ring-value" style={{ fontSize: size * 0.26 }}>{Math.round(pct)}%</span>
    </span>
  )
}

/* ---------- StatusChip (icon + label, never color alone) ---------- */

export type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'progress'

const TONE_STYLE: Record<StatusTone, { bg: string; fg: string; icon: ReactNode }> = {
  good: { bg: 'var(--status-good-bg)', fg: 'var(--status-good)', icon: <CheckCircle2 size={12} strokeWidth={2} /> },
  warn: { bg: 'var(--status-warn-bg)', fg: 'var(--status-warn)', icon: <AlertTriangle size={12} strokeWidth={2} /> },
  bad: { bg: 'var(--status-bad-bg)', fg: 'var(--status-bad)', icon: <XCircle size={12} strokeWidth={2} /> },
  neutral: { bg: 'var(--gray-100)', fg: 'var(--ink-soft)', icon: <CircleDashed size={12} strokeWidth={2} /> },
  progress: { bg: 'var(--teal-200)', fg: 'var(--teal-600)', icon: <Clock3 size={12} strokeWidth={2} /> },
}

export function StatusChip({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  const s = TONE_STYLE[tone]
  return (
    <span className="status-chip" style={{ background: s.bg, color: s.fg }}>
      {s.icon}
      {children}
    </span>
  )
}

/* ---------- Tabs ---------- */

export function Tabs({ items, active, onChange }: {
  items: { key: string; label: string; count?: number }[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map(t => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={'tab' + (active === t.key ? ' is-active' : '')}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {t.count != null && t.count > 0 ? <span className="tab-count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

/* ---------- PatientAvatar ---------- */

export function PatientAvatar({ first, last, tone, size }: { first: string; last: string; tone: string; size?: 'sm' | 'lg' }) {
  const cls = 'avatar avatar-' + (['teal', 'apricot', 'plum', 'sage', 'sand'].includes(tone) ? tone : 'teal')
  return <span className={cls + (size ? ` avatar-${size}` : '')}>{first[0]}{last[0]}</span>
}

/* ---------- EmptyState ---------- */

export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="empty-state">
      {icon}
      <div className="empty-state-title">{title}</div>
      {sub ? <div>{sub}</div> : null}
    </div>
  )
}

/* ---------- Drawer (modal: trap + Escape + restore focus) ---------- */

export function Drawer({ open, onClose, title, sub, children }: {
  open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode
}) {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => closeRef.current?.focus(), 0)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      triggerRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="drawer-head">
          <div>
            <div className="card-title" id={titleId} style={{ fontSize: 17 }}>{title}</div>
            {sub ? <div className="screen-sub">{sub}</div> : null}
          </div>
          <button ref={closeRef} className="icon-btn" aria-label="Close" onClick={onClose}>
            <XCircle size={19} strokeWidth={1.75} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  )
}

/* ---------- Sparkline (direct-labeled, single series) ---------- */

export function Sparkline({ points, width = 120, height = 36, color = 'var(--viz-1)', label }: {
  points: number[]; width?: number; height?: number; color?: string; label?: string
}) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const pad = 3
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(pad + (height - pad * 2) * (1 - (p - min) / span)).toFixed(1)}`)
    .join(' ')
  const lastY = pad + (height - pad * 2) * (1 - (points[points.length - 1] - min) / span)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={width} height={height} role="img" aria-label={label}>
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={width - 0.5} cy={lastY} r={3.5} fill={color} stroke="var(--surface)" strokeWidth={2} />
      </svg>
      {label ? <span className="sparkline-label">{label}</span> : null}
    </span>
  )
}
