import type { HelpGuidedTour } from '../types';

// Help Center metadata layer over the live tour builders in src/v6/guided.
// `domain` values must stay in sync with GUIDED_TOURS in tourRegistry.ts —
// only domains with a registered builder belong here.
export const HELP_TOURS: HelpGuidedTour[] = [
  {
    tourId: 'tour-event-packet',
    domain: 'event_packet',
    title: 'Build an Evidence Packet',
    description:
      'Brad opens Evidence Studio and sets the event, then hands you the controls: pick a template, add documents, generate, review, and export.',
    badges: ['guided-tour', 'evidence', 'office-staff', 'no-phi'],
    category: 'guided-tours',
    estimatedTime: '8 min',
    articleId: 'HC-TOUR-EVENT-PACKET',
  },
  {
    tourId: 'tour-help-thread',
    domain: 'help_thread',
    title: 'Start a Help Thread',
    description:
      'Brad opens the thread surface and points to the Start Thread, title, and post controls while you write a no-PHI question.',
    badges: ['guided-tour', 'community', 'office-staff', 'no-phi'],
    category: 'guided-tours',
    estimatedTime: '4 min',
    articleId: 'HC-TOUR-HELP-THREAD',
  },
  {
    tourId: 'tour-community',
    domain: 'community',
    title: 'Join a Community Discussion',
    description:
      'Brad walks you through opening your personal panel and posting in a no-PHI community discussion.',
    badges: ['guided-tour', 'community', 'office-staff', 'no-phi'],
    category: 'guided-tours',
    estimatedTime: '4 min',
    articleId: 'HC-TOUR-COMMUNITY',
  },
];

export function getHelpTour(tourId: string): HelpGuidedTour | undefined {
  return HELP_TOURS.find((t) => t.tourId === tourId);
}
