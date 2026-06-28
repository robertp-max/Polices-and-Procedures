import type { GuidedStorePredicateId } from './types';
import type { RehearsalContext } from './rehearsal';

/* ═══════════════════════════════════════════════════════════════════════════
   Browser DOM probe + predicate resolver for guided-tour rehearsal/validation.
   Same-origin only — controls inside the embedded Studio iframe are not
   resolvable here (their predicates return null = unknown).
   ═══════════════════════════════════════════════════════════════════════════ */

export function probeSelector(selector: string): { found: boolean; visible: boolean; clickable: boolean; count: number } {
  const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  if (nodes.length === 0) return { found: false, visible: false, clickable: false, count: 0 };
  const el = nodes[0];
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0.01;
  const disabled = (el as HTMLButtonElement).disabled === true || el.getAttribute('aria-disabled') === 'true';
  const clickable = visible && !disabled && style.pointerEvents !== 'none';
  return { found: true, visible, clickable, count: nodes.length };
}

export function evalDomPredicate(id: GuidedStorePredicateId): boolean | null {
  switch (id) {
    case 'event_selected': {
      const el = document.querySelector('[data-tour-target="event.search"]') as HTMLSelectElement | HTMLInputElement | null;
      if (el) {
        if (el.getAttribute('data-tour-selected') === 'true') return true;
        if ('value' in el && String((el as HTMLSelectElement).value ?? '').trim().length > 0) return true;
        return false;
      }
      return document.querySelector('[data-tour-target="event.selected"]') ? true : null;
    }
    case 'event_workspace_visible': {
      if (document.querySelector('[data-tour-target="event.studio"]')) return true;
      // Fallback: the Evidence Studio route container is present.
      return document.querySelector('[data-route^="/evidence"]') ? true : null;
    }
    // The following live inside the Studio iframe — not resolvable from the parent.
    case 'packet_template_selected':
    case 'packet_builder_ready':
    case 'packet_generated':
    case 'packet_export_ready':
    case 'packet_download_available':
      return null;
  }
}

export function routeReady(currentRoute: string, route?: string): boolean {
  if (!route) return true;
  return currentRoute.startsWith(route);
}

/** Build the rehearsal context from the live DOM + current route. */
export function buildDomRehearsalContext(currentRoute: string): RehearsalContext {
  return {
    currentRoute,
    probe: probeSelector,
    evalPredicate: (id) => evalDomPredicate(id),
    routeReady: (route) => routeReady(currentRoute, route),
  };
}
