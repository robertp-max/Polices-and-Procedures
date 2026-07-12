import type { PacketArchetypeId, PacketModuleId } from '@/policy/packets/contracts';
import {
  toSelectionOutput,
  type PacketTemplateDefinition,
  type PacketTemplateSelectionOutput,
} from '@/policy/packets/registries/templateRegistry';

export const TEMPLATE_SELECTOR_COLLECTIONS = ['all', 'favorites', 'recent'] as const;

export type TemplateSelectorCollection = (typeof TEMPLATE_SELECTOR_COLLECTIONS)[number];

export interface TemplateSelectorCard {
  id: string;
  title: string;
  description: string;
  archetypeId: PacketArchetypeId;
  category: string;
  availability: PacketTemplateDefinition['availability'];
  availabilityLabel: PacketTemplateDefinition['availability'];
  lastUsedAt: string | null;
  lastUsedLabel: string;
  isFavorite: boolean;
  isRecentlyUsed: boolean;
  recentRank: number | null;
  compatibleEventFamilyIds: readonly string[];
  requiredModuleIds: readonly PacketModuleId[];
  selectionOutput: PacketTemplateSelectionOutput;
}

export interface TemplateSelectorProjectionOptions {
  favoriteTemplateIds?: ReadonlySet<string> | readonly string[];
  recentTemplateIds?: readonly string[];
  lastUsedByTemplateId?: Readonly<Record<string, string | null | undefined>>;
}

export interface TemplateSelectorFilters {
  query?: string;
  category?: string;
  collection?: TemplateSelectorCollection;
}

function toTemplateIdSet(ids: ReadonlySet<string> | readonly string[] | undefined): ReadonlySet<string> {
  if (!ids) return new Set<string>();
  return ids instanceof Set ? ids : new Set(ids);
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function formatTemplateLastUsed(lastUsedAt: string | null | undefined): string {
  if (!lastUsedAt) return 'Not used yet';

  const time = Date.parse(lastUsedAt);
  if (Number.isNaN(time)) return lastUsedAt;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(time));
}

export function projectTemplateSelectorCards(
  templates: readonly PacketTemplateDefinition[],
  options: TemplateSelectorProjectionOptions = {},
): TemplateSelectorCard[] {
  const favoriteIds = toTemplateIdSet(options.favoriteTemplateIds);
  const recentIds = options.recentTemplateIds ?? [];
  const recentRankById = new Map<string, number>();
  recentIds.forEach((templateId, index) => {
    recentRankById.set(templateId, index + 1);
  });

  return templates.map((template) => {
    const lastUsedOverride = options.lastUsedByTemplateId?.[template.packet_template_id];
    const lastUsedAt = lastUsedOverride === undefined
      ? template.lastUsedAt ?? null
      : lastUsedOverride;
    const selectionOutput = toSelectionOutput(template);

    return {
      id: template.packet_template_id,
      title: template.title,
      description: template.description,
      archetypeId: template.packet_archetype_id,
      category: template.category,
      availability: template.availability,
      availabilityLabel: template.availability,
      lastUsedAt,
      lastUsedLabel: formatTemplateLastUsed(lastUsedAt),
      isFavorite: favoriteIds.has(template.packet_template_id),
      isRecentlyUsed: recentRankById.has(template.packet_template_id),
      recentRank: recentRankById.get(template.packet_template_id) ?? null,
      compatibleEventFamilyIds: selectionOutput.compatible_event_family_ids,
      requiredModuleIds: selectionOutput.required_modules,
      selectionOutput,
    };
  });
}

export function templateSelectorCategories(cards: readonly TemplateSelectorCard[]): readonly string[] {
  return Array.from(new Set(cards.map((card) => card.category))).sort((left, right) => left.localeCompare(right));
}

function cardMatchesQuery(card: TemplateSelectorCard, query: string): boolean {
  if (!query) return true;

  const searchable = [
    card.title,
    card.description,
    card.archetypeId,
    card.category,
    card.availabilityLabel,
    ...card.compatibleEventFamilyIds,
  ].join(' ');

  return normalizeSearch(searchable).includes(query);
}

export function filterTemplateSelectorCards(
  cards: readonly TemplateSelectorCard[],
  filters: TemplateSelectorFilters = {},
): TemplateSelectorCard[] {
  const query = normalizeSearch(filters.query ?? '');
  const category = filters.category ?? 'All categories';
  const collection = filters.collection ?? 'all';

  return cards.filter((card) => {
    if (collection === 'favorites' && !card.isFavorite) return false;
    if (collection === 'recent' && !card.isRecentlyUsed) return false;
    if (category !== 'All categories' && card.category !== category) return false;
    return cardMatchesQuery(card, query);
  });
}

export function selectTemplateCard(card: TemplateSelectorCard): PacketTemplateSelectionOutput {
  return card.selectionOutput;
}

export function emitTemplateSelection(
  card: TemplateSelectorCard,
  onSelect: (selectionOutput: PacketTemplateSelectionOutput) => void,
): void {
  onSelect(selectTemplateCard(card));
}
