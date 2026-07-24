import { useEffect, useRef, useState } from 'react';

const IDLE_AFTER_MS = 2 * 60 * 1000;

function hasBlockingTabletopDialog(): boolean {
  return Boolean(document.querySelector('.bs-root [role="dialog"][aria-modal="true"]'));
}

export function useActiveTime(): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastActivityAt = useRef(0);

  useEffect(() => {
    lastActivityAt.current = Date.now();
    const markActive = () => {
      lastActivityAt.current = Date.now();
    };
    const events: Array<keyof WindowEventMap> = ['keydown', 'pointerdown', 'touchstart', 'scroll'];
    events.forEach((eventName) =>
      window.addEventListener(eventName, markActive, { passive: true, capture: true }),
    );

    const timer = window.setInterval(() => {
      const active =
        document.visibilityState === 'visible' &&
        document.hasFocus() &&
        Date.now() - lastActivityAt.current < IDLE_AFTER_MS &&
        !hasBlockingTabletopDialog();
      if (active) setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, markActive, { capture: true }),
      );
    };
  }, []);

  return elapsedSeconds;
}
