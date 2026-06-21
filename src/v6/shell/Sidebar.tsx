import { ChevronLeft } from 'lucide-react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { getRouteChrome, SIDEBAR_SECTIONS } from '../routing/routePresentation';
import { routeToPreviewPath, V6_ROUTES } from '../routing/routeRegistry';
import { Topbar } from './Topbar';

const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');

export interface SidebarProps {
  isPersonalOpsOpen?: boolean;
  onPersonalOpsToggle?: () => void;
}

export function Sidebar({ isPersonalOpsOpen, onPersonalOpsToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="sticky top-0 hidden h-screen w-sidebar shrink-0 overflow-y-auto border-r border-hairline bg-white/70 text-ink shadow-[10px_0_28px_rgba(0,65,66,0.06)] backdrop-blur-xl laptop:block">
      <div className="flex items-center justify-between gap-md px-2xl pb-lg pt-2xl">
        <div className="flex items-center gap-sm" aria-label="Care Indeed">
          <img
            src="/ci-logo-gray.png"
            alt="Care Indeed"
            className="h-12 w-auto object-contain"
          />
        </div>
        <button
          aria-label="Collapse sidebar placeholder"
          className="grid h-9 w-9 place-items-center rounded-full border border-tone-teal-border bg-white text-brand-teal shadow-rest transition duration-fast ease-standard hover:translate-y-[-1px] hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </button>
      </div>

      <div className="px-lg pb-xl">
        <Topbar
          className="w-fit rounded-lg border border-tone-teal-border/60 bg-white/80 p-xs shadow-rest"
          isPersonalOpsOpen={isPersonalOpsOpen}
          onPersonalOpsToggle={onPersonalOpsToggle}
        />
      </div>

      <nav aria-label="V6 routes" className="grid gap-xl px-lg pb-2xl">
        {SIDEBAR_SECTIONS.map((section) => {
          const sectionRoutes = section.hashIds
            .map((hashId) => shellRoutes.find((route) => route.hashId === hashId))
            .filter((route): route is (typeof shellRoutes)[number] => Boolean(route));

          return (
          <section className="grid gap-sm" key={section.label}>
            <h2 className="px-sm text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{section.label}</h2>
            <div className="grid gap-xs">
              {sectionRoutes.map((route) => {
                const chrome = getRouteChrome(route);
                const Icon = chrome.icon;
                const isCurrent = Boolean(matchPath({ path: route.path, end: !route.path.endsWith('/*') }, location.pathname));

                return (
                <Link
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cx(
                    'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                    'focus-visible:outline-none focus-visible:shadow-focus',
                    isCurrent
                      ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                      : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                  )}
                  key={route.hashId}
                  to={routeToPreviewPath(route.path)}
                >
                  {Icon ? <Icon aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0" /> : null}
                  <span>{chrome.navLabel}</span>
                </Link>
                );
              })}
            </div>
          </section>
          );
        })}
      </nav>
    </aside>
  );
}
