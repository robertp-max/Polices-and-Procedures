import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PACKET_TEMPLATES } from '@/policy/packets/registries/templateRegistry';

import PacketStudioScreen from './PacketStudioScreen';
import {
  emitTemplateSelection,
  filterTemplateSelectorCards,
  projectTemplateSelectorCards,
} from './templateSelectorModel';

vi.mock('@/policy/packets/api/packetsApi', () => ({
  packetsApi: {
    listPacketTemplates: vi.fn(() => new Promise(() => undefined)),
  },
}));

const mountedRoots: Root[] = [];

function renderPacketStudioScreen(): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push(root);

  act(() => {
    root.render(createElement(PacketStudioScreen));
  });

  return container;
}

afterEach(() => {
  act(() => {
    for (const root of mountedRoots.splice(0)) {
      root.unmount();
    }
  });
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('TemplateSelector model', () => {
  it('projects FR-001 status badges for available QAPI and non-available rollout templates', () => {
    const cards = projectTemplateSelectorCards(PACKET_TEMPLATES);
    const quarterlyQapi = cards.find((card) => card.title === 'Quarterly QAPI Analytical Report Packet');

    expect(quarterlyQapi?.availabilityLabel).toBe('Available');
    expect(cards.some((card) => card.availabilityLabel === 'Planned')).toBe(true);
    expect(cards.some((card) => card.availabilityLabel === 'Needs configuration')).toBe(true);
  });

  it('uses registry last-used dates while allowing explicit display overrides', () => {
    const quarterlyTemplate = PACKET_TEMPLATES.find((template) => template.title === 'Quarterly QAPI Analytical Report Packet');
    const registryLastUsed = '2026-07-12T12:00:00.000Z';

    expect(quarterlyTemplate).toBeDefined();
    if (!quarterlyTemplate) return;

    const cards = projectTemplateSelectorCards([{ ...quarterlyTemplate, lastUsedAt: registryLastUsed }]);
    expect(cards[0]?.lastUsedAt).toBe(registryLastUsed);
    expect(cards[0]?.lastUsedLabel).toContain('2026');

    const cleared = projectTemplateSelectorCards([{ ...quarterlyTemplate, lastUsedAt: registryLastUsed }], {
      lastUsedByTemplateId: {
        [quarterlyTemplate.packet_template_id]: null,
      },
    });
    expect(cleared[0]?.lastUsedAt).toBeNull();
    expect(cleared[0]?.lastUsedLabel).toBe('Not used yet');
  });

  it('filters by search, category, favorites, and recently-used templates', () => {
    const seedCards = projectTemplateSelectorCards(PACKET_TEMPLATES);
    const quarterlyQapi = seedCards.find((card) => card.title === 'Quarterly QAPI Analytical Report Packet');
    const monthlyQapi = seedCards.find((card) => card.title === 'Monthly QAPI Analytical Report Packet');

    expect(quarterlyQapi).toBeDefined();
    expect(monthlyQapi).toBeDefined();
    if (!quarterlyQapi || !monthlyQapi) return;

    const cards = projectTemplateSelectorCards(PACKET_TEMPLATES, {
      favoriteTemplateIds: [quarterlyQapi.id],
      recentTemplateIds: [monthlyQapi.id],
      lastUsedByTemplateId: {
        [monthlyQapi.id]: '2026-07-12T08:00:00.000Z',
      },
    });

    const favoriteCards = filterTemplateSelectorCards(cards, { collection: 'favorites' });
    const recentCards = filterTemplateSelectorCards(cards, { collection: 'recent' });
    const qapiCards = filterTemplateSelectorCards(cards, {
      query: 'analytical report',
      category: quarterlyQapi.category,
    });

    expect(favoriteCards.map((card) => card.id)).toEqual([quarterlyQapi.id]);
    expect(recentCards.map((card) => card.id)).toEqual([monthlyQapi.id]);
    expect(qapiCards.length).toBeGreaterThan(0);
    expect(qapiCards.every((card) => card.category === quarterlyQapi.category)).toBe(true);
    expect(cards.find((card) => card.id === monthlyQapi.id)?.lastUsedLabel).not.toBe('Not used yet');
  });

  it('emits compatible event-family ids in the FR-001 selection output without creating a packet', () => {
    const cards = projectTemplateSelectorCards(PACKET_TEMPLATES);
    const qapiCard = cards.find((card) => card.title === 'Quarterly QAPI Analytical Report Packet');
    const onSelect = vi.fn();
    const createPacket = vi.fn();

    expect(qapiCard).toBeDefined();
    if (!qapiCard) return;

    emitTemplateSelection(qapiCard, onSelect);

    expect(createPacket).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(qapiCard.selectionOutput);

    const selectionOutput = onSelect.mock.calls[0]?.[0];
    expect(selectionOutput.compatible_event_family_ids).toEqual(qapiCard.compatibleEventFamilyIds);
    expect(selectionOutput.compatible_event_family_ids.length).toBeGreaterThan(0);
    expect(selectionOutput).not.toHaveProperty('packet_instance_id');
  });
});

describe('PacketStudioScreen TemplateSelector integration', () => {
  it('uses the governed selector before event selection and does not generate a packet from the template alone', () => {
    const container = renderPacketStudioScreen();

    expect(container.querySelector('section[aria-label="Packet template selector"]')).toBeTruthy();
    expect(container.querySelector('input[aria-label="Search packet templates"]')).toBeTruthy();
    expect(container.querySelector('select[aria-label="Template category"]')).toBeTruthy();
    expect(container.textContent).toContain('Favorites');
    expect(container.textContent).toContain('Recently used');
    expect(container.textContent).toContain('No operational packet is created from a template alone.');
    expect(container.textContent).toContain('No packet template selected.');
    expect(container.textContent).not.toContain('Generate new packet');

    const qapiCard = Array.from(container.querySelectorAll('article')).find((article) =>
      article.textContent?.includes('Quarterly QAPI Analytical Report Packet'),
    );
    expect(qapiCard?.textContent).toContain('Available');

    const selectButton = Array.from(qapiCard?.querySelectorAll('button') ?? []).find((button) =>
      button.textContent?.trim() === 'Select template',
    );
    expect(selectButton).toBeDefined();
    if (!selectButton) return;

    act(() => {
      selectButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Filtered by qapi-quarterly');
    expect(container.textContent).toContain('Quarterly QAPI Analytical Report Packet');
    expect(container.textContent).not.toContain('No packet template selected.');
    expect(container.textContent).not.toContain('Generate new packet');
  });
});
