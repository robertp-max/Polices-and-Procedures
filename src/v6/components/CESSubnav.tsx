import { Link, useLocation } from 'react-router-dom';

const cesSubnavItems = [
  { label: 'Calendar', path: '/ces/calendar' },
  { label: 'Sprint Board', path: '/ces/board' },
  { label: 'Events Board', path: '/ces/events' },
  { label: 'Workflows', path: '/workflows' },
  { label: 'Master Controls', path: '/compliance/master-controls' },
  { label: 'Audit Mode', path: '/audit' },
  { label: 'Evidence Center', path: '/evidence' },
  { label: 'Reports', path: '/ces/reports' },
];

/**
 * Static sub-navigation for all pages in the CES group.
 * Rendered once from the parent so it is consistent and always present
 * when navigating between CES pages (no duplication, no disappearing).
 */
export function CESSubnav() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Longest-match reduce ensures exactly ONE active tab (no double underlines)
  const activeTo = cesSubnavItems.reduce((best: string | null, item) => {
    const to = item.path;
    if (currentPath === to || currentPath.startsWith(to + '/')) {
      if (!best || to.length > best.length) {
        return to;
      }
    }
    return best;
  }, null as string | null);

  // Contextual: /events/* swimlanes activate Events Board
  const effectiveActive = currentPath.startsWith('/events/') ? '/ces/events' : activeTo;

  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="CES subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">CES:</span>
      {cesSubnavItems.map((item) => {
        const isActive = effectiveActive === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded px-sm py-xs text-brand-teal hover:bg-surface-hover hover:text-brand-teal-deep border-b-2 ${
              isActive ? 'border-brand-teal text-brand-teal-deep font-medium' : 'border-transparent hover:border-brand-teal'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
