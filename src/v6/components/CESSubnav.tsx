import { Link, useLocation } from 'react-router-dom';

const cesSubnavItems = [
  { label: 'Calendar', path: '/ces/calendar' },
  { label: 'Sprint Board', path: '/ces/board' },
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

  const isActivePath = (itemPath: string) => {
    if (currentPath === itemPath) return true;
    if (itemPath === '/ces/calendar' && currentPath.startsWith('/ces/calendar')) return true;
    if (itemPath === '/ces/board' && currentPath === '/ces/board') return true;
    if (itemPath === '/workflows' && (currentPath === '/workflows' || currentPath.startsWith('/workflows/'))) return true;
    if (itemPath === '/compliance/master-controls' && currentPath.startsWith('/compliance/master-controls')) return true;
    if (itemPath === '/audit' && currentPath.startsWith('/audit')) return true;
    if (itemPath === '/evidence' && currentPath.startsWith('/evidence')) return true;
    if (itemPath === '/ces/reports' && currentPath.startsWith('/ces/reports')) return true;
    // contextual deep routes activate their parent subitem (hidden ones like events/my-tasks not in visible subnav)
    if (itemPath === '/ces/board' && currentPath.startsWith('/events/')) return true; // e.g. swimlane activates Sprint Board contextually if appropriate
    return false;
  };

  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="CES subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">CES:</span>
      {cesSubnavItems.map((item) => {
        const isActive = isActivePath(item.path);
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
