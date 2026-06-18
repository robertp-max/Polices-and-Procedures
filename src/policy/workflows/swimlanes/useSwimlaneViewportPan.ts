import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

interface SwimlanePanSession {
  pointerId: number;
  startX: number;
  startY: number;
  startScrollLeft: number;
  startScrollTop: number;
}

interface UseSwimlaneViewportPanOptions {
  disabled: boolean;
  onBackgroundClick: () => void;
}

export function useSwimlaneViewportPan({
  disabled,
  onBackgroundClick,
}: UseSwimlaneViewportPanOptions) {
  const [isGrabDragging, setIsGrabDragging] = useState(false);
  const panSessionRef = useRef<SwimlanePanSession | null>(null);
  const suppressClickRef = useRef(false);

  const finishGrabDrag = useCallback(() => {
    if (!panSessionRef.current) return;
    panSessionRef.current = null;
    setIsGrabDragging(false);
  }, []);

  const handleViewportPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (disabled) return;
    if (event.pointerType !== 'mouse') return;
    if (event.button !== 0 && event.button !== 1) return;
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, label, [role="dialog"], [data-no-swimlane-pan]')) return;

    panSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      startScrollTop: event.currentTarget.scrollTop,
    };
    suppressClickRef.current = false;
    setIsGrabDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.button === 1) event.preventDefault();
  }, [disabled]);

  const handleViewportPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const session = panSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    event.currentTarget.scrollLeft = session.startScrollLeft - deltaX;
    event.currentTarget.scrollTop = session.startScrollTop - deltaY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) suppressClickRef.current = true;
    event.preventDefault();
  }, []);

  const handleViewportPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (panSessionRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishGrabDrag();
  }, [finishGrabDrag]);

  const handleViewportClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onBackgroundClick();
  }, [onBackgroundClick]);

  return {
    isGrabDragging,
    handleViewportClick,
    handleViewportPointerDown,
    handleViewportPointerMove,
    handleViewportPointerUp,
  };
}
