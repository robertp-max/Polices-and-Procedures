import { BookOpenCheck, ClipboardCheck, GraduationCap, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cx } from '../../utils/classNames';

const journeyNav = [
  { label: 'Overview', to: '/journey', icon: LayoutDashboard, match: ['/journey'] },
  { label: 'Journey v1', to: '/journey/v1-journey', icon: BookOpenCheck, match: ['/journey/v1-journey', '/journey/module'] },
  { label: 'Appendix F', to: '/journey/appendix-f', icon: ClipboardCheck, match: ['/journey/appendix-f'] },
  { label: 'Supervisor', to: '/journey/supervisor', icon: ShieldCheck, match: ['/journey/supervisor'] },
] as const;

interface JourneyLearningShellProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle: string;
}

export function JourneyLearningShell({ children, eyebrow = 'Care Indeed Home Health', title, subtitle }: JourneyLearningShellProps) {
  const { pathname } = useLocation();

  return (
    <div className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] overflow-hidden rounded-2xl border border-hairline bg-surface-glass text-ink shadow-glass-inset">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_100%_12%,rgba(0,121,125,0.11),transparent_32%),linear-gradient(135deg,rgba(247,254,255,0.92),rgba(255,255,255,0.74)_52%,rgba(250,248,248,0.86))]" />

      <header className="relative z-base border-b border-hairline bg-white/72 px-lg py-md shadow-glass-inset backdrop-blur-xl">
        <div className="mx-auto flex max-w-content flex-col gap-md desktop:flex-row desktop:items-center desktop:justify-between">
          <Link to="/journey" className="flex min-w-0 items-center gap-md" aria-label="Journey course home">
            <span className="grid h-tap w-tap shrink-0 place-items-center rounded-lg border border-tone-teal-border bg-tone-teal-bg text-brand-teal shadow-pill-action">
              <GraduationCap aria-hidden="true" className="h-icon-md w-icon-md" />
            </span>
            <span className="min-w-0">
              <span className="block text-tag uppercase tracking-tag text-muted">{eyebrow}</span>
              <span className="block truncate text-h2 font-medium text-brand-teal-deep">Onboarding Journey</span>
            </span>
          </Link>

          <nav className="flex gap-sm overflow-x-auto" aria-label="Journey primary">
            {journeyNav.map((item) => {
              const Icon = item.icon;
              const active = item.match.some((matchPath) => pathname === matchPath || pathname.startsWith(matchPath + '/'));

              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'inline-flex min-h-control shrink-0 items-center gap-sm rounded-lg border px-md text-xs font-medium transition duration-fast ease-standard',
                    active
                      ? 'border-tone-teal-border bg-tone-teal-bg text-brand-teal shadow-pill-action'
                      : 'border-hairline bg-white/48 text-secondary hover:bg-surface-hover hover:text-brand-teal-deep',
                  )}
                  key={item.to}
                  to={item.to}
                >
                  <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-base mx-auto grid w-full max-w-content gap-xl px-lg py-xl desktop:px-2xl" id="journey-main-content">
        <section className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <span className="rounded-md border border-tone-teal-border bg-tone-teal-bg px-sm py-xs text-tag uppercase tracking-tag text-brand-teal">
              Maria Santos, RN
            </span>
            <span className="rounded-md border border-tone-orange-border bg-tone-orange-bg px-sm py-xs text-tag uppercase tracking-tag text-brand-orange">
              GAO active
            </span>
          </div>
          <div className="grid gap-xs">
            <h1 className="text-display font-medium text-brand-teal-deep">{title}</h1>
            <p className="max-w-[760px] text-sm text-secondary">{subtitle}</p>
          </div>
        </section>

        {children}
      </main>

      <footer className="relative z-base border-t border-hairline bg-white/64 px-lg py-md text-center text-tag text-muted backdrop-blur-xl">
        No PHI. Demo training data only. Clearance, evidence, and signature gates remain governed by HomeHealth onboarding policy.
      </footer>
    </div>
  );
}

