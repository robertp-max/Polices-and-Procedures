// The single navigation runtime for the Governing Body portal (spec §2).
//
// Contract:
//   * user-initiated navigation → history.pushState (creates a Back target);
//   * initial normalization, legacy redirects, invalid-state recovery and
//     scroll updates → history.replaceState (never a new entry);
//   * popstate applies the incoming state WITHOUT pushing a new one;
//   * adjacent duplicate entries are suppressed;
//   * history.scrollRestoration is 'manual' — we save the outgoing scroll
//     position and restore it after the destination renders;
//   * navigation NEVER submits, attests, scores, approves, votes, or creates
//     evidence: it only changes which state is displayed.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  closeTopmostLayer,
  parseGovernanceRoute,
  routesEqual,
  serializeGovernanceRoute,
  type GovernanceRouteState,
} from './governanceRoute';

/** Scroll container used by the V6 shell; falls back to the window. */
function getScroller(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>('.governance-workspace main') ?? null;
}

function readScroll(): number {
  const el = getScroller();
  if (el) return el.scrollTop;
  return typeof window === 'undefined' ? 0 : window.scrollY;
}

function applyScroll(y: number): void {
  const el = getScroller();
  // Instant only: smooth scrolling silently no-ops on the V6 main scroller.
  if (el) el.scrollTop = y;
  else if (typeof window !== 'undefined') window.scrollTo(0, y);
}

interface GovernanceHistoryState {
  gbRoute?: GovernanceRouteState;
  gbDepth?: number;
  gbFocusKey?: string;
}

const GOVERNANCE_PORTAL_PATH = '/governance';

function portalUrl(route: GovernanceRouteState): string {
  return `${GOVERNANCE_PORTAL_PATH}${serializeGovernanceRoute(route)}`;
}

export interface GovernanceRouter {
  route: GovernanceRouteState;
  /** Push a new history entry (user-initiated navigation). */
  navigate: (next: GovernanceRouteState, options?: { replace?: boolean }) => void;
  /** Patch the current route, pushing a new entry by default. */
  patch: (partial: Partial<GovernanceRouteState>, options?: { replace?: boolean }) => void;
  /**
   * Close the topmost transient layer exactly as browser Back would. Uses real
   * history.back() when this state was pushed, so Escape and Back agree.
   */
  closeTopmost: () => void;
  /** True while a popstate result is being applied (suppresses pushes). */
  isApplyingPop: boolean;
}

export function useGovernanceRouter(): GovernanceRouter {
  const [route, setRoute] = useState<GovernanceRouteState>(() => {
    if (typeof window === 'undefined') return { view: 'home' };
    return parseGovernanceRoute(window.location.hash, window.location.pathname).state;
  });

  const applyingPop = useRef(false);
  // Depth of entries this portal pushed — lets closeTopmost prefer real
  // history.back() (so Forward still works) and only synthesize when we are at
  // the portal's first entry.
  const pushDepth = useRef(0);
  const pendingScroll = useRef<number | null>(null);
  const pendingFocusKey = useRef<string | null>(null);
  const focusSequence = useRef(0);
  // Mirrors `route` so navigate() can read the current value WITHOUT running
  // history side effects inside a setState updater. React StrictMode invokes
  // updaters twice in development; doing pushState in there produced duplicate
  // history entries and made the second Back appear to do nothing.
  const routeRef = useRef(route);
  routeRef.current = route;

  // One-time: take manual control of scroll and normalize the entry URL.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const previous = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      /* not supported — restoration below still runs */
    }
    const parsed = parseGovernanceRoute(window.location.hash, window.location.pathname);
    const existing = window.history.state as GovernanceHistoryState | null;
    const depth = typeof existing?.gbDepth === 'number' ? existing.gbDepth : 0;
    const initialRoute =
      existing?.gbRoute && routesEqual(existing.gbRoute, parsed.state)
        ? { ...parsed.state, scrollY: existing.gbRoute.scrollY }
        : parsed.state;
    pushDepth.current = depth;
    // Legacy/invalid entry URLs are corrected in place — never pushed.
    window.history.replaceState(
      { gbRoute: initialRoute, gbDepth: depth, gbFocusKey: existing?.gbFocusKey },
      '',
      portalUrl(initialRoute),
    );
    routeRef.current = initialRoute;
    setRoute(initialRoute);
    return () => {
      try {
        window.history.scrollRestoration = previous;
      } catch {
        /* ignore */
      }
    };
  }, []);

  // Restore scroll after the destination has painted.
  useEffect(() => {
    const y = pendingScroll.current;
    const focusKey = pendingFocusKey.current;
    if (y === null && !focusKey) return;
    pendingScroll.current = null;
    pendingFocusKey.current = null;
    const frame = window.requestAnimationFrame(() => {
      if (y !== null) applyScroll(y);
      if (focusKey) {
        document.querySelector<HTMLElement>(`[data-gb-history-focus="${CSS.escape(focusKey)}"]`)?.focus();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  const navigate = useCallback(
    (next: GovernanceRouteState, options?: { replace?: boolean }) => {
      if (typeof window === 'undefined') return;
      // Never create an entry while applying a popstate result.
      if (applyingPop.current && !options?.replace) return;

      const current = routeRef.current;
      // Repeated clicks on the active destination must not stack entries.
      if (routesEqual(current, next) && !options?.replace) return;

      const url = portalUrl(next);
      if (options?.replace) {
        const existing = window.history.state as GovernanceHistoryState | null;
        window.history.replaceState(
          { gbRoute: next, gbDepth: pushDepth.current, gbFocusKey: existing?.gbFocusKey },
          '',
          url,
        );
      } else {
        // Record where we are leaving from (incl. scroll) so Back restores it.
        const outgoing = { ...current, scrollY: readScroll() };
        const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        let focusKey = active?.dataset.gbHistoryFocus;
        if (active && !focusKey) {
          focusSequence.current += 1;
          focusKey = `gb-focus-${focusSequence.current}`;
          active.dataset.gbHistoryFocus = focusKey;
        }
        window.history.replaceState(
          { gbRoute: outgoing, gbDepth: pushDepth.current, gbFocusKey: focusKey },
          '',
          portalUrl(current),
        );
        pushDepth.current += 1;
        window.history.pushState({ gbRoute: next, gbDepth: pushDepth.current }, '', url);
        pendingScroll.current = next.scrollY ?? 0;
      }
      routeRef.current = next;
      setRoute(next);
    },
    [],
  );

  const patch = useCallback(
    (partial: Partial<GovernanceRouteState>, options?: { replace?: boolean }) => {
      navigate({ ...routeRef.current, ...partial }, options);
    },
    [navigate],
  );

  // Back/Forward — apply the incoming state, never push.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPop = (event: PopStateEvent) => {
      applyingPop.current = true;
      const historyState = event.state as GovernanceHistoryState | null;
      const parsedLocation = parseGovernanceRoute(window.location.hash, window.location.pathname);
      const incoming = historyState?.gbRoute ?? parsedLocation.state;
      pushDepth.current = historyState?.gbDepth ?? 0;
      pendingScroll.current = incoming.scrollY ?? 0;
      pendingFocusKey.current = historyState?.gbFocusKey ?? null;
      if (parsedLocation.normalized || !routesEqual(incoming, parsedLocation.state)) {
        const normalized = { ...parsedLocation.state, scrollY: incoming.scrollY };
        window.history.replaceState(
          { gbRoute: normalized, gbDepth: pushDepth.current, gbFocusKey: historyState?.gbFocusKey },
          '',
          portalUrl(normalized),
        );
        routeRef.current = normalized;
        setRoute(normalized);
      } else {
        routeRef.current = incoming;
        setRoute(incoming);
      }
      // Release on the next tick so navigations triggered by the newly
      // rendered destination are not swallowed.
      window.setTimeout(() => {
        applyingPop.current = false;
      }, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Same-document fragment edits fire hashchange without a meaningful
  // governance history state. Normalize and render them in place.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const parsed = parseGovernanceRoute(window.location.hash, window.location.pathname);
      if (!parsed.normalized && routesEqual(routeRef.current, parsed.state)) return;
      const currentState = window.history.state as GovernanceHistoryState | null;
      window.history.replaceState(
        { gbRoute: parsed.state, gbDepth: currentState?.gbDepth ?? pushDepth.current, gbFocusKey: currentState?.gbFocusKey },
        '',
        portalUrl(parsed.state),
      );
      routeRef.current = parsed.state;
      setRoute(parsed.state);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const closeTopmost = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Prefer real Back so Forward continues to work and Escape === Back.
    if (pushDepth.current > 0) {
      window.history.back();
      return;
    }
    // At the portal's first entry (e.g. a deep link straight into a drawer):
    // synthesize the close so the user is not ejected from /governance.
    const collapsed = closeTopmostLayer(route);
    if (collapsed) navigate(collapsed, { replace: true });
  }, [navigate, route]);

  return { route, navigate, patch, closeTopmost, isApplyingPop: applyingPop.current };
}
