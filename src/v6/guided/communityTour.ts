import type { GuidedTour, GuidedTourStep } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Community guided tour (co-pilot).
   There is no separate "/community" surface yet — the team's no-PHI social space
   is the Help Center discussion threads, plus the personal panel ("me :)") for
   your profile/notifications. Brad opens the Community discussions and hands off
   to the human to browse their profile and start/share a discussion.
   ═══════════════════════════════════════════════════════════════════════════ */

const sel = (key: string) => `[data-tour-target="${key}"]`;

export function communityTourKey(): string {
  return 'community';
}

export function buildCommunityTour(slotValues: Record<string, unknown>, now: string): GuidedTour {
  const base = { canSkip: false as const, showNextOnlyAfterComplete: true as const, highlightStyle: 'brad_rainbow_glow' as const };

  const steps: GuidedTourStep[] = [
    {
      ...base, id: 'step-1', order: 1, placement: 'bottom', navStep: true,
      actor: 'brad', autoAction: { kind: 'navigate', route: '/help/threads' },
      title: 'Opening the Community space',
      instruction: 'I’m opening the team’s Community discussions — a no-PHI space to ask, share, and follow topics together.',
      targetSelector: sel('nav.help'), targetDescription: 'Help Center / Community',
      allowedActions: [{ selector: sel('nav.help'), action: 'click' }],
      waitFor: { type: 'route_change', route: '/help/threads' },
      autoCompleteWhen: { route: '/help/threads' },
    },
    {
      ...base, id: 'step-2', order: 2, placement: 'left', actor: 'human',
      title: 'Your turn: open your profile & notifications',
      instruction: 'Open “me :)” in the top-right to see your personal panel — your focus items, notifications, and work queue.',
      targetSelector: sel('nav.profile'), targetDescription: '“me :)” personal panel',
      allowedActions: [{ selector: sel('nav.profile'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I’ve checked my panel' },
    },
    {
      ...base, id: 'step-3', order: 3, placement: 'left', actor: 'human',
      title: 'Your turn: start or open a discussion',
      instruction: 'Start a new discussion, or open an existing one to join the conversation.',
      targetSelector: sel('thread.start'), targetDescription: '“Start a thread” button',
      allowedActions: [{ selector: sel('thread.start'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I started / opened a discussion' },
    },
    {
      ...base, id: 'step-4', order: 4, placement: 'top', actor: 'human',
      title: 'Your turn: share your message',
      instruction: 'Post your message to share it with the team. Keep it free of PHI — no patient names, dates, or identifiers.',
      targetSelector: sel('thread.post'), targetDescription: '“Post thread” button',
      allowedActions: [{ selector: sel('thread.post'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I shared my message' },
    },
  ];

  return {
    id: 'tour-community',
    title: 'Join the Community',
    description: 'Open the Community discussions, check your profile, and share with the team.',
    intent: 'join_community',
    normalizedPrompt: 'join the community',
    tourKey: communityTourKey(),
    version: '1.0.0',
    routeScope: ['/iadministrator', '/help'],
    roleScope: [],
    requiredSlots: [],
    slotValues,
    steps,
    completionPolicy: 'strict_gated',
    mode: 'copilot',
    reusable: true,
    createdBy: 'brad_generated',
    createdAt: now,
    updatedAt: now,
  };
}
