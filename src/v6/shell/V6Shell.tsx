import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PersonalOpsPanel } from './PersonalOpsPanel';
import { Topbar } from './Topbar';
import { usePersonalOpsStore } from '../../policy/stores/personalOpsStore';


export function V6Shell() {
  const location = useLocation();
  const { isPersonalOpsOpen, togglePersonalOps } = usePersonalOpsStore();
  const mainRef = useRef<HTMLElement | null>(null);
  const [hasScrolledMain, setHasScrolledMain] = useState(false);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    main.scrollTo({ top: 0, left: 0 });
    setHasScrolledMain(false);
  }, [location.pathname]);

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

  const verticalMask = hasScrolledMain
    ? 'linear-gradient(to bottom, transparent 0, black 42px, black calc(100% - 42px), transparent 100%)'
    : 'linear-gradient(to bottom, black 0, black calc(100% - 42px), transparent 100%)';
  const horizontalMask = 'linear-gradient(to right, transparent 0, black 42px, black calc(100% - 42px), transparent 100%)';

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-light text-ink">
      <Sidebar />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row">
          <main
            className="min-h-0 flex-1 overflow-auto px-3xl py-3xl"
            id="main-content"
            ref={mainRef}
            style={{
              maskImage: [
                verticalMask,
                horizontalMask,
              ].join(', '),
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
              WebkitMaskImage: [
                verticalMask,
                horizontalMask,
              ].join(', '),
            }}
          >
            <Outlet />
          </main>
          {isPersonalOpsOpen && (
            <div className="sticky top-0 h-screen">
              <PersonalOpsPanel onClose={togglePersonalOps} />
            </div>
          )}
        </div>
      </div>
      <Topbar
        className="fixed right-0 top-6 z-50"
        isPersonalOpsOpen={isPersonalOpsOpen}
        onPersonalOpsToggle={togglePersonalOps}
      />
    </div>
  );
}
