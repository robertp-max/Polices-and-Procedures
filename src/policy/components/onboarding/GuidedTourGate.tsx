import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { incrementLoginCountOncePerSession } from './loginCounter';
import { preloadBradAvatar } from './BradTourAvatar';
import { MissionPromptOverlay } from './MissionPromptOverlay';
import { GuidedTourOverlay } from './GuidedTourOverlay';
import { TOUR_RESTART_EVENT } from './tourCards';

/* ═══════════════════════════════════════════════════════════════
   GuidedTourGate

   Mounts ONCE inside the persistent CommandCenterLayout (outside
   <main> to avoid stacking-context traps). Resolves on auth-settled.
   Renders the welcome / mission overlay on every login.

   Uses sessionStorage instead of a ref to survive React Strict Mode's
   simulated double-invocation of effects.

   Listens for careindeed:tour:restart to restart the guided tour.
   ═══════════════════════════════════════════════════════════════ */

const SESSION_SHOWN_FLAG = 'ci_tour_gate_shown_v1';

type Phase = 'idle' | 'welcome' | 'tour' | 'closed';

export function GuidedTourGate() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>('idle');
  const isSwimlaneRoute = /^\/(workflows\/.+swimlane|events\/.+\/swimlane)(\/|$|\?)/.test(location.pathname);

  // Show the welcome overlay once per browser session per login.
  // sessionStorage survives React Strict Mode double-invocation
  // (ref does not, because state resets on the simulated remount).
  useEffect(() => {
    if (loading || !isAuthenticated || isSwimlaneRoute) return;
    if (sessionStorage.getItem(SESSION_SHOWN_FLAG)) return;
    sessionStorage.setItem(SESSION_SHOWN_FLAG, '1');
    preloadBradAvatar();
    incrementLoginCountOncePerSession();
    setPhase('welcome');
  }, [loading, isAuthenticated, isSwimlaneRoute]);

  // Clear the session flag on logout so the next login shows it again.
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem(SESSION_SHOWN_FLAG);
      setPhase('idle');
    }
  }, [isAuthenticated]);

  // Any component may dispatch TOUR_RESTART_EVENT to reopen the tour.
  useEffect(() => {
    if (isSwimlaneRoute) {
      setPhase('closed');
      return;
    }
    const onRestart = () => setPhase('tour');
    window.addEventListener(TOUR_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(TOUR_RESTART_EVENT, onRestart);
  }, [isSwimlaneRoute]);

  const closeWelcome = useCallback(() => setPhase('closed'), []);
  const startTour = useCallback(() => setPhase('tour'), []);
  const closeTour = useCallback(() => setPhase('closed'), []);

  if (isSwimlaneRoute) return null;
  if (phase === 'welcome') {
    return <MissionPromptOverlay onClose={closeWelcome} onStartTour={startTour} />;
  }
  if (phase === 'tour') {
    return <GuidedTourOverlay required={false} onClose={closeTour} />;
  }
  return null;
}

/** Programmatic helper for any UI affordance to restart the guided tour. */
export function restartGuidedTour(): void {
  try {
    window.dispatchEvent(new Event(TOUR_RESTART_EVENT));
  } catch {
    /* noop */
  }
}
