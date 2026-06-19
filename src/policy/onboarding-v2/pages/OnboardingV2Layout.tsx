import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Zap, ListChecks, FileSearch2, ShieldCheck } from 'lucide-react';
interface RailItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  description: string;
}

const RAIL: RailItem[] = [
  { to: '/onboarding-v2/dashboard',  label: 'Dashboard',         icon: LayoutDashboard, description: 'Live KPI strip, batch list, system feed' },
  { to: '/onboarding-v2/activate',   label: 'Activation',        icon: Zap,             description: 'Ingest a trigger and preview reconciliation' },
  { to: '/onboarding-v2/batches',    label: 'Batches',           icon: ListChecks,      description: 'All onboarding execution batches' },
  { to: '/onboarding-v2/audit',      label: 'Audit Readiness',   icon: FileSearch2,     description: 'Per-subject surveyor dossier' },
  { to: '/onboarding-v2/governance', label: 'Governance',        icon: ShieldCheck,     description: 'Overrides, vendors, policy bindings' },
];

/* U-05 (Wave 4) — Onboarding V2 visual harmonization.
 * Previous palette: bespoke hex literals (#E5E7EB borders, #0B2545 navy,
 * #13355E icon accent, #E07B2C active orange). Migrated to canonical
 * design tokens:
 *   border #E5E7EB           → var(--ci-border)
 *   navy   #0B2545 (active)  → var(--ces-navy-deep)
 *   nav    #13355E (icon)    → var(--ces-navy)
 *   active accent #E07B2C    → kept (matches CI orange family; tokenization
 *                              of orange shade variants is a follow-on)
 * Layout, spacing, and behavior are unchanged. Scoped to onboarding-v2/**;
 * does NOT touch CommandCenterLayout (FROZEN) or other onboarding rebuild
 * surfaces (per Wave 4 "DO NOT TOUCH unrelated onboarding rebuild"). */
export function OnboardingV2Layout() {
  return (
    <div className="flex h-full min-h-[calc(100vh-100px)] gap-4 p-1">
      {/* Premium sub-rail — clean corporate dark glass hierarchy matching design ref */}
      <aside
        className="w-[248px] shrink-0 border-r rounded-l-[14px] border-[var(--v3-border-subtle)] bg-[var(--v3-glass-card)] overflow-hidden"
        style={{ backdropFilter: 'var(--v3-glass-blur)' }}
      >
        <div className="px-4 py-4 border-b border-[var(--v3-border-subtle)]">
          <div className="text-[10px] font-montserrat font-semibold uppercase tracking-[0.18em] text-[var(--v3-text-tertiary)]">ONBOARDING V2</div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-[var(--v3-text-primary)]">Compliance Activation</div>
          <div className="mt-0.5 text-[10px] text-[var(--v3-text-secondary)]">v2 · Audit-grade execution engine</div>
        </div>
        <nav className="px-2 py-3 space-y-0.5">
          {RAIL.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-start gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
                    isActive
                      ? 'bg-[rgba(var(--ci-accent-rgb),0.12)] border border-[var(--brand-primary,#00797D)]/30'
                      : 'hover:bg-[var(--v3-surface-elevated)] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      className="mt-px shrink-0"
                      style={{ color: isActive ? 'var(--brand-primary,#00797D)' : 'var(--v3-text-secondary)' }}
                    />
                    <div className="min-w-0">
                      <div className={`font-semibold leading-tight ${isActive ? 'text-[var(--v3-text-primary)]' : 'text-[var(--v3-text-primary)]'}`}>{item.label}</div>
                      <div className="text-[10px] mt-px leading-snug text-[var(--v3-text-tertiary)]">
                        {item.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Content surface — blends with shell glass, premium carded inner content */}
      <div className="flex-1 min-w-0 overflow-hidden rounded-r-[14px] border border-[var(--v3-border-subtle)] bg-[var(--v3-glass-card)]" style={{ backdropFilter: 'var(--v3-glass-blur)' }}>
        <div className="h-full overflow-auto p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
