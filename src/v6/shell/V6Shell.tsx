import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
  const [navOpen, setNavOpen] = useState(false);

  // Close the nav drawer whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [pathname]);

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
      {/* Top-left: hamburger + logo (always visible; opens the nav drawer) */}
      <div className="fixed left-3 top-3 z-modal flex items-center gap-2">
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          className="grid h-10 w-10 place-items-center rounded-lg border border-hairline bg-surface/90 text-brand-teal-deep shadow-rest backdrop-blur transition-colors hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <img src="/ci-logo-gray.png" alt="Care Indeed" className="h-9 w-auto object-contain" />
      </div>

      {/* Off-canvas nav drawer + backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 z-command bg-ink/20 backdrop-blur-sm"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cx(
          'fixed left-0 top-0 z-command h-full transition-transform duration-base ease-standard',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar />
      </div>

      {/* Full-width content */}
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row">
          <main
            className={cx(
              'v6-main-scrollmask min-h-0 flex-1 overflow-auto px-3xl pb-3xl pt-16',
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
