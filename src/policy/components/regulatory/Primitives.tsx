/* ═══════════════════════════════════════════════════════════════
   Regulatory primitives — UrgencyChip, DomainBadge, PolicyRef,
   EvidenceStatusDot. Small, composable pieces that drive the
   Regulatory Execution Center look & feel.
   ═══════════════════════════════════════════════════════════════ */
import type { ReactNode } from 'react';
import {
  DOMAIN_PALETTE,
  URGENCY_PALETTE,
  type RegulatoryDomain,
  type UrgencyLevel,
} from '@/policy/data/regulatoryEvents';

/* ─── Domain dot + label (legend-friendly) ─────────────────── */
export function DomainDot({ domain, size = 8 }: { domain: RegulatoryDomain; size?: number }) {
  const p = DOMAIN_PALETTE[domain];
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: p.color,
      }}
    />
  );
}

export function DomainBadge({ domain, subtle = false }: { domain: RegulatoryDomain; subtle?: boolean }) {
  const p = DOMAIN_PALETTE[domain];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]"
      style={{
        color: p.color,
        background: subtle ? 'transparent' : p.soft,
        border: `1px solid ${subtle ? 'transparent' : p.border}`,
      }}
    >
      <DomainDot domain={domain} size={6} />
      {p.label}
    </span>
  );
}

/* ─── Urgency chip ─────────────────────────────────────────── */
export function UrgencyChip({ urgency, compact = false }: { urgency: UrgencyLevel; compact?: boolean }) {
  const u = URGENCY_PALETTE[urgency];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-montserrat font-bold uppercase tracking-[0.14em] ${
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{
        color: u.color,
        background: u.soft,
        border: `1px solid ${u.color}55`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: u.color }} />
      {u.label}
    </span>
  );
}

/* ─── Policy ref pill ──────────────────────────────────────── */
export function PolicyRef({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono-jb font-bold tracking-wider text-[#FFC107]/85">
      {id}
    </span>
  );
}

/* ─── Evidence status dot ──────────────────────────────────── */
export function EvidenceDot({ status }: { status: 'complete' | 'in-progress' | 'pending' | 'missing' }) {
  const color =
    status === 'complete'    ? '#10B981' :
    status === 'in-progress' ? '#FBBF24' :
    status === 'missing'     ? '#EF4444' :
                               'rgba(255,255,255,0.35)';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
      }}
    />
  );
}

/* ─── Panel shell — FLAT on the single glass ───────────────── */
/* Panels are intentionally flat: NO background, NO border, NO shadow.
   All page content sits directly on the one-glass shell canvas. A
   soft accent line under the header preserves structural rhythm. */
export function Panel({
  title,
  icon,
  action,
  children,
  className = '',
  accent = 'rgba(var(--ci-accent-rgb),0.40)',
  dense = false,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: string;
  dense?: boolean;
}) {
  return (
    <section className={`relative ${className}`}>
      {(title || action) && (
        <header
          className={`flex items-center justify-between ${dense ? 'pt-1 pb-2.5 mb-2.5' : 'pt-1 pb-3 mb-3'}`}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 group">
            {icon && <span style={{ color: accent }} className="icon-interactive">{icon}</span>}
            {title && (
              <h3 className="font-montserrat font-bold text-white text-[13px] uppercase tracking-[0.14em] icon-interactive">
                {title}
              </h3>
            )}
          </div>
          {action}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
