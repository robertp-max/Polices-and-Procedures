import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PersonalOpsPanel } from './PersonalOpsPanel';
import { Topbar } from './Topbar';
import { usePersonalOpsStore } from '../../policy/stores/personalOpsStore';
import { cx } from '../utils/classNames';


export function V6Shell() {
  const { pathname } = useLocation();
  const { isPersonalOpsOpen, togglePersonalOps } = usePersonalOpsStore();
  const mainRef = useRef<HTMLElement | null>(null);
  const [hasScrolledMain, setHasScrolledMain] = useState(false);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    main.scrollTo({ top: 0, left: 0 });
    // Dispatch to the scroll listener so it updates hasScrolledMain (setState must not be called directly from effect body).
    main.dispatchEvent(new Event('scroll'));
  }, [pathname]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return undefined;

    const handleScroll = () => {
      setHasScrolledMain(main.scrollTop > 16);
    };

    handleScroll();
    main.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      main.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-light text-ink">
      <Sidebar />
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row">
          <main
            className={cx(
              // Reduced right padding so wide content (e.g. 4-col swimlanes, boards) uses full width next to Sidebar.
              // Topbar (fixed dock at top-right) overlays content top area; z-50 ensures nav bar always visible above content.
              'v6-main-scrollmask min-h-0 flex-1 overflow-auto py-3xl pl-3xl pr-3xl',
              hasScrolledMain && 'v6-main-scrollmask--scrolled',
            )}
            id="main-content"
            ref={mainRef}
          >
            <Outlet />
          </main>
          {isPersonalOpsOpen && (
            <div className="sticky top-0 h-screen">
              {/* Theme toggle + sign out live INSIDE the panel header now. */}
              <PersonalOpsPanel onClose={togglePersonalOps} />
            </div>
          )}
        </div>
      </div>
      {/* Floating personal-ops toggle (only when the panel is closed), pinned to the top-right corner. */}
      {!isPersonalOpsOpen && (
        <Topbar
          className="fixed right-4 top-4 z-command"
          isPersonalOpsOpen={false}
          onPersonalOpsToggle={togglePersonalOps}
        />
      )}
    </div>
  );
}
