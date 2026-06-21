import { NavLink } from 'react-router-dom';
import { Badge } from '../primitives';
import { cx } from '../utils/classNames';
import { routeToPreviewPath, routesByGroup, V6_REAL_ROUTE_COUNT } from '../routing/routeRegistry';

const groupOrder = ['Overview', 'CES', 'Taxonomy', 'Onboarding', 'Onboarding v2', 'System', 'Admin'] as const;

export function Sidebar() {
  const groups = routesByGroup();

  return (
    <aside className="hidden w-sidebar shrink-0 border-r border-hairline bg-surface-glass px-lg py-lg text-ink laptop:block">
      <div className="mb-lg grid gap-sm">
        <div className="text-h3 font-medium text-brand-teal">CareIndeed</div>
        <Badge>{V6_REAL_ROUTE_COUNT} routes</Badge>
      </div>
      <nav aria-label="V6 placeholder routes" className="grid gap-lg">
        {groupOrder.map((group) => (
          <section className="grid gap-xs" key={group}>
            <h2 className="text-tag font-medium uppercase tracking-tag text-muted">{group}</h2>
            <div className="grid gap-xs">
              {(groups[group] ?? []).map((route) => (
                <NavLink
                  className={({ isActive }) =>
                    cx(
                      'rounded-md px-sm py-sm text-sm font-medium transition duration-fast ease-standard',
                      'focus-visible:outline-none focus-visible:shadow-focus',
                      isActive
                        ? 'bg-brand-teal text-on-brand shadow-rest'
                        : 'text-secondary hover:bg-surface-hover hover:text-brand-teal',
                    )
                  }
                  key={route.hashId}
                  to={routeToPreviewPath(route.path)}
                >
                  {route.title}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
