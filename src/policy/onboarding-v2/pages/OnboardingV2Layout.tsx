import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Zap, ListChecks, FileSearch2, ShieldCheck } from 'lucide-react';

interface RailItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const RAIL: RailItem[] = [
  { to: '/onboarding-v2/dashboard',  label: 'Dashboard',         icon: LayoutDashboard, description: 'Live KPI strip, batch list, system feed' },
  { to: '/onboarding-v2/activate',   label: 'Activation',        icon: Zap,             description: 'Ingest a trigger and preview reconciliation' },
  { to: '/onboarding-v2/batches',    label: 'Batches',           icon: ListChecks,      description: 'All onboarding execution batches' },
  { to: '/onboarding-v2/audit',      label: 'Audit Readiness',   icon: FileSearch2,     description: 'Per-subject surveyor dossier' },
  { to: '/onboarding-v2/governance', label: 'Governance',        icon: ShieldCheck,     description: 'Overrides, vendors, policy bindings' },
];

export function OnboardingV2Layout() {
  return (
    <div className="flex h-full min-h-[calc(100vh-100px)] gap-4">
      {/* Sub-rail */}
      <aside className="w-[260px] shrink-0 border-r border-[#E5E7EB] bg-white/80 backdrop-blur-sm rounded-l-[12px]">
        <div className="px-4 py-4 border-b border-[#E5E7EB]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Onboarding</div>
          <div className="text-[15px] font-semibold text-[#0B2545] leading-tight">Compliance Activation</div>
          <div className="mt-1 text-[10px] text-[#6B7280]">v2 · Audit-grade execution module</div>
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
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'text-[#0B1220] hover:bg-[#F2F4F7]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-[#E07B2C] mt-0.5' : 'text-[#13355E] mt-0.5'} />
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">{item.label}</div>
                      <div className={`text-[10px] mt-0.5 leading-snug ${isActive ? 'text-white/70' : 'text-[#6B7280]'}`}>
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
      <section className="flex-1 min-w-0 bg-white rounded-r-[12px] border border-[#E5E7EB] overflow-hidden">
        <Outlet />
      </section>
    </div>
  );
}
