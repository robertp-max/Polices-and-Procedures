import type { GuidedTour, GuidedTourStep, GuidedTourSlot } from './types';
import { PACKET_TYPE_OPTIONS } from './guidedAssistanceClassifier';

/* ═══════════════════════════════════════════════════════════════════════════
   Event-packet guided tour builder.
   ----------------------------------------------------------------------------
   Generates the deterministic 8-step, strict-gated walkthrough for
   "generate an event packet". Steps target stable data-tour-target anchors and
   each declares a completion condition the runner validates before revealing
   the next step. Does NOT bypass workflow/evidence/eCIgn/packet/permission
   gates — it only points the user at the real controls in order.
   ═══════════════════════════════════════════════════════════════════════════ */

const sel = (key: string) => `[data-tour-target="${key}"]`;

function packetLabel(value: unknown): string {
  const v = String(value ?? 'general');
  return PACKET_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? 'General';
}

export const EVENT_PACKET_TOUR_KEY_PREFIX = 'event_packet';

export function eventPacketTourKey(slotValues: Record<string, unknown>): string {
  return `${EVENT_PACKET_TOUR_KEY_PREFIX}:${String(slotValues.packet_type ?? 'general')}`;
}

/** Build the (8-step) event-packet tour. `now` is injected so callers control timestamps. */
export function buildEventPacketTour(
  slotValues: Record<string, unknown>,
  now: string,
): GuidedTour {
  const packet = packetLabel(slotValues.packet_type);
  const eventLabel = String(slotValues.event ?? 'your event');

  const base = {
    canSkip: false as const,
    showNextOnlyAfterComplete: true as const,
    highlightStyle: 'brad_rainbow_glow' as const,
  };

  const steps: GuidedTourStep[] = [
    // ── Brad auto-runs these safe, deterministic steps (no human click needed). ──
    {
      ...base, id: 'step-1', order: 1, placement: 'bottom', navStep: true,
      actor: 'brad', autoAction: { kind: 'navigate', route: '/evidence' },
      title: 'Opening Evidence Studio',
      instruction: 'I’m opening the Evidence Studio for you — that’s where the Event Packet is built.',
      targetSelector: sel('nav.evidence'), targetDescription: 'Evidence Studio',
      allowedActions: [{ selector: sel('nav.evidence'), action: 'click' }],
      waitFor: { type: 'route_change', route: '/evidence' },
      autoCompleteWhen: { route: '/evidence' },
    },
    {
      ...base, id: 'step-2', order: 2, placement: 'bottom',
      actor: 'brad', autoAction: { kind: 'set_select', selector: sel('event.search'), valueFromSlot: 'event' },
      title: 'Confirming your event',
      instruction: `I’m setting the event to ${eventLabel}. If you need a different one, just change the event selector.`,
      targetSelector: sel('event.search'), targetDescription: 'Event selector',
      allowedActions: [{ selector: sel('event.search'), action: 'select' }],
      waitFor: { type: 'store_predicate', predicateId: 'event_selected', args: {} },
      autoCompleteWhen: { predicate: 'event_selected' },
    },
    // ── Human checkpoints — Brad explains, you do it, then continue (no lock). ──
    {
      ...base, id: 'step-3', order: 3, placement: 'left', actor: 'human', frameScoped: true,
      title: 'Your turn: choose the packet template',
      instruction: `In the Studio panel, select the ${packet} packet template (or confirm the highlighted one), then continue.`,
      targetSelector: sel('event.packet-template'), targetDescription: 'Packet template (in the Studio)',
      allowedActions: [{ selector: sel('event.packet-template'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I’ve selected the template' },
    },
    {
      ...base, id: 'step-4', order: 4, placement: 'left', actor: 'human',
      title: 'Your turn: add source documents',
      instruction: 'Add any source documents for this packet (use “Add source” / drag-and-drop). This needs your files, so I can’t do it for you.',
      targetSelector: '[title="Parse + file source documents into the Evidence Library"]', targetDescription: 'Add source documents',
      allowedActions: [],
      waitFor: { type: 'manual_confirm', label: 'I’ve added my documents (or none needed)' },
    },
    {
      ...base, id: 'step-5', order: 5, placement: 'left', actor: 'human', frameScoped: true,
      title: 'Your turn: generate the packet',
      instruction: `In the Studio, click Continue / Generate to assemble the ${packet} packet. Existing workflow, evidence, and signature gates still apply.`,
      targetSelector: sel('event.generate-packet'), targetDescription: 'Generate packet (in the Studio)',
      allowedActions: [{ selector: sel('event.generate-packet'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'I’ve generated the packet' },
    },
    {
      ...base, id: 'step-6', order: 6, placement: 'left', actor: 'human', frameScoped: true,
      title: 'Your turn: review evidence & blockers',
      instruction: 'Review the evidence requirements and resolve any blockers before exporting.',
      targetSelector: sel('event.evidence-tab'), targetDescription: 'Evidence requirements (in the Studio)',
      allowedActions: [{ selector: sel('event.evidence-tab'), action: 'click' }],
      waitFor: { type: 'manual_confirm', label: 'Reviewed — no open blockers' },
    },
    {
      ...base, id: 'step-7', order: 7, placement: 'left', actor: 'human', frameScoped: true,
      title: 'Your turn: sign (if required)',
      instruction: 'If the packet requires signatures, sign with eCIgn. I never sign on your behalf.',
      targetSelector: sel('event.continue'), targetDescription: 'Signature step (in the Studio)',
      allowedActions: [],
      waitFor: { type: 'manual_confirm', label: 'Signed, or signatures not needed' },
    },
    {
      ...base, id: 'step-8', order: 8, placement: 'left', actor: 'human', frameScoped: true,
      title: 'Your turn: export / download',
      instruction: 'When all gates pass, export and download the packet. You approve the final output — I won’t auto-export.',
      targetSelector: sel('packet.download'), targetDescription: 'Export / download (in the Studio)',
      allowedActions: [
        { selector: sel('event.export-packet'), action: 'click' },
        { selector: sel('packet.download'), action: 'click' },
      ],
      waitFor: { type: 'manual_confirm', label: 'Exported / downloaded' },
    },
  ];

  const requiredSlots: GuidedTourSlot[] = [
    { id: 'event', label: 'Event', required: true, type: 'event' },
    { id: 'packet_type', label: 'Packet type', required: true, type: 'choice', options: PACKET_TYPE_OPTIONS },
  ];

  return {
    id: `tour-${eventPacketTourKey(slotValues)}`,
    title: `Generate a ${packet} event packet`,
    description: `Step-by-step walkthrough to generate and export a ${packet} packet for ${eventLabel}.`,
    intent: 'generate_event_packet',
    normalizedPrompt: `generate ${packet.toLowerCase()} event packet`,
    tourKey: eventPacketTourKey(slotValues),
    version: '1.0.0',
    routeScope: ['/iadministrator', '/evidence', '/compliance', '/ces', '/audit'],
    roleScope: [],
    requiredSlots,
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
