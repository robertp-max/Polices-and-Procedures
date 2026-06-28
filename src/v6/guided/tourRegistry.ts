import type { GuidedDomain, GuidedTour } from './types';
import { buildEventPacketTour, eventPacketTourKey } from './eventPacketTour';
import { buildHelpThreadTour, helpThreadTourKey } from './helpThreadTour';
import { buildCommunityTour, communityTourKey } from './communityTour';

/* ═══════════════════════════════════════════════════════════════════════════
   Guided-tour registry — maps a classified domain to its tour builder + key.
   Domains NOT present here are not buildable tours (the classifier won't launch
   them; the chat falls through to a normal Brad answer).
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TourBuilderEntry {
  key: (slotValues: Record<string, unknown>) => string;
  build: (slotValues: Record<string, unknown>, now: string) => GuidedTour;
}

export const GUIDED_TOURS: Partial<Record<GuidedDomain, TourBuilderEntry>> = {
  event_packet: { key: eventPacketTourKey, build: buildEventPacketTour },
  help_thread: { key: helpThreadTourKey, build: buildHelpThreadTour },
  community: { key: communityTourKey, build: buildCommunityTour },
};

/** Domains that have a buildable guided tour. */
export const TOURABLE_DOMAINS = new Set<GuidedDomain>(Object.keys(GUIDED_TOURS) as GuidedDomain[]);

export function getTourBuilder(domain: GuidedDomain | undefined): TourBuilderEntry | undefined {
  return domain ? GUIDED_TOURS[domain] : undefined;
}
