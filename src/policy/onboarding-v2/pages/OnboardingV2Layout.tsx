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
    <div className="flex h-full min-h-[calc(100vh-100px)] gap-4">
      {/* Sub-rail */}
      <aside
        className="w-[260px] shrink-0 border-r bg-white/80 backdrop-blur-sm rounded-l-[12px]"
        style={{ borderColor: 'var(--ci-border)' }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--ci-border)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--ci-text-muted)' }}>Onboarding</div>
          <div className="text-[15px] font-semibold leading-tight" style={{ color: 'var(--ces-navy-deep)' }}>Compliance Activation</div>
          <div className="mt-1 text-[10px]" style={{ color: 'var(--ci-text-muted)' }}>v2 · Audit-grade execution module</div>
        </div>
        <nav className="px-2 py-2 space-y-0.5">
          {RAIL.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-start gap-2.5 px-3 py-2.5 rounded-md text-[12px] transition ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'hover:bg-[#F2F4F7]'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--ces-navy-deep)' : undefined,
                  color: isActive ? '#fff' : 'var(--ci-text)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      className="mt-0.5"
                      style={{ color: isActive ? '#E07B2C' : 'var(--ces-navy)' }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">{item.label}</div>
                      <div
                        className="text-[10px] mt-0.5 leading-snug"
                        style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--ci-text-muted)' }}
                      >
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

      {/* Surface */}
      <section
        className="flex-1 min-w-0 bg-white rounded-r-[12px] border overflow-hidden"
        style={{ borderColor: 'var(--ci-border)' }}
      >
        <Outlet />
      </section>
    </div>
  );
}
