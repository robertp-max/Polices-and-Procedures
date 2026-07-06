import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { primaryNavItems, workspaceSubnavItems } from '../routing/navigationManifest';
import { cx } from '../utils/classNames';

export function TopNav() {
  const { pathname } = useLocation();

  const activePrimaryItem = useMemo(() => {
    return primaryNavItems.find(item => {
      if (item.matchPaths?.some(match => pathname.startsWith(match.replace(/:\w+/g, '')))) return true;
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return true;
      return false;
    });
  }, [pathname]);

  const activeGroupId = activePrimaryItem?.id;

  const subnavItems = useMemo(() => {
    if (!activeGroupId) return [];
    if (activeGroupId === 'ces' || activeGroupId === 'dashboard') {
      return workspaceSubnavItems.ces || [];
    }
    if (activeGroupId === 'taxonomy') return workspaceSubnavItems.taxonomy || [];
    if (activeGroupId === 'onboarding') return workspaceSubnavItems.onboarding || [];
    if (activeGroupId === 'admin') return workspaceSubnavItems.admin || [];
    return [];
  }, [activeGroupId]);

  const showSubnav = subnavItems.length > 0;

  return (
    <div className="flex flex-col w-full bg-transparent z-50 shrink-0">
      {/* Top Primary Nav Bar */}
      <nav className="w-full flex justify-center py-6">
        <div className="flex items-center rounded-full bg-white shadow-sm px-8 py-3 gap-12">
          {primaryNavItems.map(item => {
            const isActive = activePrimaryItem?.id === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cx(
                  'text-sm tracking-widest uppercase transition duration-300',
                  isActive ? 'text-brand-teal font-semibold' : 'text-slate-400 hover:text-brand-teal'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Secondary Nav Pills */}
      {showSubnav && (
        <nav className="w-full flex justify-center mt-2 mb-6">
          <div className="flex items-center rounded-full bg-white shadow-sm p-1 gap-2">
            {subnavItems.map(item => {
              // Basic active check for subnav
              const isActive = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cx(
                    'px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300',
                    isActive 
                      ? 'bg-brand-teal text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-brand-teal'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
