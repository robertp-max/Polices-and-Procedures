import { Link, useLocation } from 'react-router-dom';

const cesSubnavItems = [
  { label: 'Evidence Studio', path: '/evidence', brand: true },
  { label: 'Calendar', path: '/ces/calendar' },
  { label: 'Workflows', path: '/workflows' },
  { label: 'Master Controls', path: '/compliance/master-controls' },
  { label: 'Audit Mode', path: '/audit' },
  { label: 'Reports', path: '/ces/reports' },
];

/**
 * Static sub-navigation for all pages in the CES group.
 * Rendered once from the parent so it is consistent and always present
 * when navigating between CES pages (no duplication, no disappearing).
 * Evidence Studio leads and is branded "CI Evidence Studio" with a glowing
 * orange "CI" mark.
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

  return (
    <div className="mb-lg flex flex-wrap items-center justify-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="Compliance subnav">
      <style>{`
        @keyframes ciGlowPulse {
          0%, 100% { text-shadow: 0 0 5px rgba(226,104,60,0.55), 0 0 11px rgba(226,104,60,0.30); }
          50%      { text-shadow: 0 0 9px rgba(226,104,60,0.95), 0 0 20px rgba(226,104,60,0.55); }
        }
        .ci-mark { color: #E2683C; font-weight: 800; letter-spacing: 0.02em; animation: ciGlowPulse 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ci-mark { animation: none; text-shadow: 0 0 8px rgba(226,104,60,0.6); } }
      `}</style>
      {cesSubnavItems.map((item) => {
        const isActive = activeTo === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded px-sm py-xs text-brand-teal hover:bg-surface-hover hover:text-brand-teal-deep border-b-2 ${
              isActive ? 'border-brand-teal text-brand-teal-deep font-medium' : 'border-transparent hover:border-brand-teal'
            }`}
          >
            {item.brand ? (<><span className="ci-mark">CI</span> Evidence Studio</>) : item.label}
          </Link>
        );
      })}
    </div>
  );
}
