import { Link } from 'react-router-dom';

const cesLinks = [
  { label: 'CES Calendar', path: '/ces/calendar' },
  { label: 'Kanban Board', path: '/ces/board' },
  { label: 'Events Board', path: '/ces/events' },
  { label: 'Workflows Library', path: '/workflows' },
  { label: 'Master Controls', path: '/compliance/master-controls' },
  { label: 'Evidence Center', path: '/evidence' },
  { label: 'Audit Mode', path: '/audit' },
  { label: 'My Tasks', path: '/my-tasks' },
  { label: 'CES Reports', path: '/ces/reports' },
] as const;

/**
 * Static CES group sub-navigation.
 * Rendered once for all pages in the CES group so it is consistent and always present.
 * Matches V1 subitem discoverability at top of workspace.
 */
export function CESSubnav() {
  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="CES subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">CES:</span>
      {cesLinks.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="rounded px-sm py-xs text-brand-teal hover:bg-surface-hover hover:text-brand-teal-deep border-b-2 border-transparent hover:border-brand-teal"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
