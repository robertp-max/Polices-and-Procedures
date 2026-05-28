import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

function visibleWorkspaceRect(element: HTMLElement | null): DOMRect | null {
  if (!element || typeof window === 'undefined') return null;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const viewportPadding = 12;
  const width = Math.min(rect.width, Math.max(320, window.innerWidth - viewportPadding * 2));
  const height = Math.min(rect.height, Math.max(320, window.innerHeight - viewportPadding * 2));
  const left = Math.min(
    Math.max(rect.left, viewportPadding),
    Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
  );
  const top = Math.min(
    Math.max(rect.top, viewportPadding),
    Math.max(viewportPadding, window.innerHeight - height - viewportPadding),
  );

  return new DOMRect(left, top, width, height);
}

export function useSwimlaneModalPosition<T extends HTMLElement>(
  workspaceRef: RefObject<T | null>,
  active: boolean,
) {
  const [workspaceRect, setWorkspaceRect] = useState<DOMRect | null>(null);
  const lockedRectRef = useRef<DOMRect | null>(null);

  const captureWorkspaceRect = useCallback(() => {
    const rect = visibleWorkspaceRect(workspaceRef.current);
    lockedRectRef.current = rect;
    setWorkspaceRect(rect);
    return rect;
  }, [workspaceRef]);

  useEffect(() => {
    if (!active) {
      lockedRectRef.current = null;
      setWorkspaceRect(null);
      return undefined;
    }

    captureWorkspaceRect();

    const updateWorkspaceRect = () => {
      const rect = visibleWorkspaceRect(workspaceRef.current) ?? lockedRectRef.current;
      lockedRectRef.current = rect;
      setWorkspaceRect(rect);
    };

    window.addEventListener('resize', updateWorkspaceRect);
    return () => window.removeEventListener('resize', updateWorkspaceRect);
  }, [active, captureWorkspaceRect, workspaceRef]);

  return { workspaceRect, captureWorkspaceRect };
}
