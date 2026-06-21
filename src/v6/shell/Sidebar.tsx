import { Activity, Search } from 'lucide-react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { getRouteChrome, SIDEBAR_SECTIONS } from '../routing/routePresentation';
import { routeToPreviewPath, V6_REAL_ROUTE_COUNT, V6_ROUTES } from '../routing/routeRegistry';

const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden h-screen w-sidebar shrink-0 overflow-y-auto border-r border-hairline bg-surface-glass px-lg py-lg text-ink laptop:block">
      <div className="mb-xl flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm" aria-label="CareIndeed">
          <span className="relative block h-[52px] w-[36px] shrink-0 text-brand-orange">
            <span className="absolute left-sm top-0 h-lg w-lg rounded-lg border-2 border-brand-orange" />
            <span className="absolute left-xs top-lg h-xl w-xl rounded-xl border-2 border-brand-orange" />
            <span className="absolute bottom-sm left-0 h-lg w-lg rounded-lg border-2 border-brand-orange" />
          </span>
          <span className="grid gap-xs">
            <span className="text-[21px] leading-none text-ink">CareIndeed</span>
            <span className="text-[6px] leading-none text-secondary">The Heart of Home Health</span>
          </span>
        </div>
        <button
          aria-label="Collapse sidebar placeholder"
          className="grid h-tap w-tap place-items-center rounded-lg border border-card bg-surface text-brand-teal shadow-rest transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
          type="button"
        >
          <span className="text-body">|&lt;</span>
        </button>
      </div>

      <div className="mb-3xl rounded-lg border border-hairline bg-surface p-lg shadow-rest">
        <div className="flex items-center justify-between gap-lg">
          <div className="grid gap-xs">
            <p className="text-display text-secondary">{V6_REAL_ROUTE_COUNT}</p>
            <p className="text-tag uppercase tracking-tag text-brand-teal">views</p>
          </div>
          <Activity aria-hidden="true" className="h-icon-lg w-icon-lg text-tone-teal-text" />
        </div>
      </div>

      <label className="mb-xl flex h-control items-center gap-sm rounded-lg border border-card bg-surface px-md text-muted shadow-rest">
        <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
        <span className="sr-only">Filter views</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none"
          placeholder="Filter views..."
          type="search"
        />
      </label>

      <nav aria-label="V6 routes" className="grid gap-xl">
        {SIDEBAR_SECTIONS.map((section) => {
          const sectionRoutes = section.hashIds
            .map((hashId) => shellRoutes.find((route) => route.hashId === hashId))
            .filter((route): route is (typeof shellRoutes)[number] => Boolean(route));

          return (
          <section className="grid gap-sm" key={section.label}>
            <h2 className="text-tag font-light uppercase tracking-tag text-brand-teal-deep">{section.label}</h2>
            <div className="grid gap-xs">
              {sectionRoutes.map((route) => {
                const chrome = getRouteChrome(route);
                const Icon = chrome.icon;
                const isCurrent = Boolean(matchPath({ path: route.path, end: !route.path.endsWith('/*') }, location.pathname));

                return (
                <Link
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cx(
                    'flex min-h-row-compact items-center gap-sm rounded-md px-sm py-sm text-sm font-medium transition duration-fast ease-standard',
                    'focus-visible:outline-none focus-visible:shadow-focus',
                    isCurrent
                      ? 'bg-brand-teal text-on-brand shadow-rest'
                      : 'text-secondary hover:bg-surface-hover hover:text-brand-teal',
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
