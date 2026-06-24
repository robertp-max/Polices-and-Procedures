import { Link, useLocation } from 'react-router-dom';

const cesSubnavItems = [
  { label: 'CES Calendar', path: '/ces/calendar' },
  { label: 'Kanban Board', path: '/ces/board' },
  { label: 'Events Board', path: '/ces/events' },
  { label: 'Workflows Library', path: '/workflows' },
  { label: 'Master Controls', path: '/compliance/master-controls' },
  { label: 'Evidence Center', path: '/evidence' },
  { label: 'Audit Mode', path: '/audit' },
  { label: 'My Tasks', path: '/my-tasks' },
  { label: 'CES Reports', path: '/ces/reports' },
];

/**
 * Static sub-navigation for all pages in the CES group.
 * Rendered once from the parent so it is consistent and always present
 * when navigating between CES pages (no duplication, no disappearing).
 */
export function CESSubnav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="CES subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">CES:</span>
      {cesSubnavItems.map((item) => {
        const isActive = currentPath === item.path ||
          (item.path === '/workflows' && currentPath.startsWith('/workflows')) ||
          (item.path === '/ces/board' && currentPath === '/ces/board') ||
          (item.path === '/evidence' && currentPath.startsWith('/evidence')) ||
          (item.path === '/audit' && currentPath.startsWith('/audit'));
        return (
          <Link
            key={item.path}
            to={item.path}
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
