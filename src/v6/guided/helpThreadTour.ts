import type { GuidedTour, GuidedTourStep } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Help Center thread guided tour (co-pilot).
   Brad opens the Help Center discussions, then hands off to the human to write
   and post the thread (typing is the human's job). No PHI in threads.
   ═══════════════════════════════════════════════════════════════════════════ */

const sel = (key: string) => `[data-tour-target="${key}"]`;

export function helpThreadTourKey(): string {
  return 'help_thread';
}

export function buildHelpThreadTour(slotValues: Record<string, unknown>, now: string): GuidedTour {
  const base = { canSkip: false as const, showNextOnlyAfterComplete: true as const, highlightStyle: 'brad_rainbow_glow' as const };

  const steps: GuidedTourStep[] = [
    {
      ...base, id: 'step-1', order: 1, placement: 'bottom', navStep: true,
      actor: 'brad', autoAction: { kind: 'navigate', route: '/help/threads' },
      title: 'Opening Help Center discussions',
      instruction: 'I’m opening the Help Center discussion threads — where the team asks and answers questions (no PHI).',
      targetSelector: sel('nav.help'), targetDescription: 'Help Center',
      allowedActions: [{ selector: sel('nav.help'), action: 'click' }],
      waitFor: { type: 'route_change', route: '/help/threads' },
      autoCompleteWhen: { route: '/help/threads' },
    },
    {
      ...base, id: 'step-2', order: 2, placement: 'left', actor: 'human',
      title: 'Your turn: start a thread',
      instruction: 'Click “Start a thread” to open a new discussion.',
      targetSelector: sel('thread.start'), targetDescription: '“Start a thread” button',
      allowedActions: [{ selector: sel('thread.start'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I clicked “Start a thread”' },
    },
    {
      ...base, id: 'step-3', order: 3, placement: 'left', actor: 'human',
      title: 'Your turn: write your question',
      instruction: 'Give it a short title and describe what you need. Keep it free of PHI — no patient names, dates, or identifiers.',
      targetSelector: sel('thread.title'), targetDescription: 'Thread title + details',
      allowedActions: [{ selector: sel('thread.title'), action: 'input' }],
      waitFor: { type: 'manual_confirm', label: 'I’ve written my question' },
    },
    {
      ...base, id: 'step-4', order: 4, placement: 'top', actor: 'human',
      title: 'Your turn: post it',
      instruction: 'Click “Post thread” to share it with the team. You can follow replies from the thread afterward.',
      targetSelector: sel('thread.post'), targetDescription: '“Post thread” button',
      allowedActions: [{ selector: sel('thread.post'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I posted my thread' },
    },
  ];

  return {
    id: 'tour-help_thread',
    title: 'Start a Help Center discussion',
    description: 'Open the Help Center threads, write your question, and post it for the team.',
    intent: 'start_help_thread',
    normalizedPrompt: 'start a help center thread',
    tourKey: helpThreadTourKey(),
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
