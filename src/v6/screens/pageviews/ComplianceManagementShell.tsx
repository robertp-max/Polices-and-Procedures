import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Building2, ShieldCheck, Stethoscope } from 'lucide-react';
import {
  workspaceTabActiveClass,
  workspaceTabClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';

interface TabItem { label: string; to: string; match: (path: string) => boolean }

// Single "Registry and Contracts" header. "Registry Management" is the renamed
// Control Register (route unchanged: /compliance/master-controls).
const REGISTRY_TABS: readonly TabItem[] = [
  { label: 'Registry Management', to: '/compliance/master-controls', match: (path) => path.startsWith('/compliance/master-controls') },
  { label: 'Vendor Management', to: '/compliance/vendors', match: (path) => path.startsWith('/compliance/vendors') },
  { label: 'Contractor Management', to: '/compliance/contractors', match: (path) => path.startsWith('/compliance/contractors') },
];

const META = {
  vendor: {
    eyebrow: 'COMPLIANCE · ENTITY OVERSIGHT',
    title: 'Vendor risk, agreements, and lifecycle',
    description: 'Classify each business relationship, generate proportionate requirements, and keep approvals, evidence, renewals, incidents, and offboarding reconstructable.',
    icon: Building2,
  },
  contractor: {
    eyebrow: 'COMPLIANCE · CONTINGENT WORKFORCE',
    title: 'Contractor clearance and assignment readiness',
    description: 'Review the individual—not the supplier—across classification, credentials, screenings, training, competency, supervision, access, and offboarding.',
    icon: Stethoscope,
  },
} as const;

/** The single Registry & Contracts header — app-canonical workspace tab chrome. */
export function RegistryContractsNav() {
  const { pathname } = useLocation();
  return (
    <div className="mb-lg">
      <p className="mb-xs px-xs font-montserrat text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Registry and Contracts</p>
      <nav aria-label="Registry and Contracts sections" className={workspaceTabNavClass}>
        {REGISTRY_TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={`${workspaceTabClass} ${active ? workspaceTabActiveClass : workspaceTabInactiveClass}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function ComplianceManagementShell({ kind, children, actions }: { kind: 'vendor' | 'contractor'; children: ReactNode; actions?: ReactNode }) {
  const meta = META[kind];
  const Icon = meta.icon;
  return (
    <section className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFAF7] px-4 pb-16 pt-4 font-roboto text-ink tablet-p:px-8 tablet-l:px-12">
      <main className="mx-auto w-full max-w-[1400px]">
        <RegistryContractsNav />
        {/* Header hero — no brand watermark here; the logo watermark is reserved for home pages. */}
        <header className="relative overflow-hidden rounded-[28px] bg-white px-lg py-xl shadow-[0_18px_48px_rgba(0,47,48,0.08)] tablet-l:px-2xl tablet-l:py-2xl">
          <div className="flex flex-col gap-lg desktop:flex-row desktop:items-end desktop:justify-between">
            <div className="max-w-[820px]">
              <p className="font-montserrat text-[11px] font-medium uppercase tracking-[0.18em] text-brand-orange">{meta.eyebrow}</p>
              <h1 className="mt-sm font-roboto text-[clamp(2.15rem,4vw,3.65rem)] font-light leading-[1.04] tracking-[-0.035em] text-brand-teal-deep">{meta.title}</h1>
              <p className="mt-md max-w-[760px] text-sm font-light leading-relaxed text-secondary tablet-l:text-base">{meta.description}</p>
              <div className="mt-lg flex flex-wrap gap-sm">
                <span className="inline-flex items-center gap-xs rounded-full bg-tone-teal-bg px-md py-xs text-[11px] font-medium text-tone-teal-text"><BadgeCheck aria-hidden className="h-3.5 w-3.5" /> Server-authoritative records</span>
                <span className="inline-flex items-center gap-xs rounded-full bg-tone-orange-bg px-md py-xs text-[11px] font-medium text-tone-orange-text"><ShieldCheck aria-hidden className="h-3.5 w-3.5" /> Hard stops enforced</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-sm"><Icon aria-hidden className="hidden h-10 w-10 text-brand-teal/30 tablet-p:block" strokeWidth={1.3} />{actions}</div>
          </div>
        </header>
        <div className="mt-xl">{children}</div>
      </main>
    </section>
  );
}
