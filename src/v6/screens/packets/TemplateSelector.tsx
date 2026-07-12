import { useEffect, useMemo, useState } from 'react';

import { packetsApi } from '@/policy/packets/api/packetsApi';
import {
  PACKET_TEMPLATES,
  type PacketTemplateDefinition,
  type PacketTemplateSelectionOutput,
} from '@/policy/packets/registries/templateRegistry';

import {
  emitTemplateSelection,
  filterTemplateSelectorCards,
  projectTemplateSelectorCards,
  templateSelectorCategories,
  TEMPLATE_SELECTOR_COLLECTIONS,
  type TemplateSelectorCard,
  type TemplateSelectorCollection,
} from './templateSelectorModel';

export interface TemplateSelectorProps {
  templates?: readonly PacketTemplateDefinition[];
  favoriteTemplateIds?: ReadonlySet<string> | readonly string[];
  recentTemplateIds?: readonly string[];
  lastUsedByTemplateId?: Readonly<Record<string, string | null | undefined>>;
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: TemplateSelectorCollection;
  className?: string;
  onSelect?: (selectionOutput: PacketTemplateSelectionOutput) => void;
}

const COLLECTION_LABELS = {
  all: 'All',
  favorites: 'Favorites',
  recent: 'Recently used',
} as const satisfies Record<TemplateSelectorCollection, string>;

const AVAILABILITY_CLASSES = {
  Available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Planned: 'border-sky-200 bg-sky-50 text-sky-700',
  'Needs configuration': 'border-amber-200 bg-amber-50 text-amber-800',
  Restricted: 'border-rose-200 bg-rose-50 text-rose-700',
} as const satisfies Record<PacketTemplateDefinition['availability'], string>;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function availabilityClass(card: TemplateSelectorCard): string {
  return AVAILABILITY_CLASSES[card.availability];
}

function eventFamilySummary(card: TemplateSelectorCard): string {
  if (card.compatibleEventFamilyIds.length === 0) return 'No compatible event families listed';
  if (card.compatibleEventFamilyIds.length <= 2) return card.compatibleEventFamilyIds.join(', ');
  return `${card.compatibleEventFamilyIds.slice(0, 2).join(', ')} +${card.compatibleEventFamilyIds.length - 2}`;
}

export function TemplateSelector({
  templates,
  favoriteTemplateIds,
  recentTemplateIds,
  lastUsedByTemplateId,
  initialQuery = '',
  initialCategory = 'All categories',
  initialCollection = 'all',
  className,
  onSelect,
}: TemplateSelectorProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [collection, setCollection] = useState<TemplateSelectorCollection>(initialCollection);
  const [remoteTemplates, setRemoteTemplates] = useState<readonly PacketTemplateDefinition[]>(PACKET_TEMPLATES);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'fallback'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (templates) return undefined;

    let cancelled = false;
    setLoadState('loading');
    setLoadError(null);

    packetsApi.listPacketTemplates()
      .then((response) => {
        if (cancelled) return;
        setRemoteTemplates(response.templates);
        setLoadState('loaded');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRemoteTemplates(PACKET_TEMPLATES);
        setLoadState('fallback');
        setLoadError(error instanceof Error ? error.message : 'Packet template API unavailable.');
      });

    return () => {
      cancelled = true;
    };
  }, [templates]);

  const cards = useMemo(
    () => projectTemplateSelectorCards(templates ?? remoteTemplates, {
      favoriteTemplateIds,
      recentTemplateIds,
      lastUsedByTemplateId,
    }),
    [favoriteTemplateIds, lastUsedByTemplateId, recentTemplateIds, remoteTemplates, templates],
  );

  const categories = useMemo(() => templateSelectorCategories(cards), [cards]);

  const visibleCards = useMemo(
    () => filterTemplateSelectorCards(cards, { query, category, collection }),
    [cards, category, collection, query],
  );

  const handleSelect = (card: TemplateSelectorCard) => {
    if (!onSelect) return;
    emitTemplateSelection(card, onSelect);
  };

  return (
    <section className={cx('space-y-lg', className)} aria-label="Packet template selector">
      <div className="flex flex-col gap-md laptop:flex-row laptop:items-end laptop:justify-between">
        <div className="space-y-xs">
          <p className="text-xs font-semibold uppercase tracking-tag text-muted">FR-001</p>
          <h2 className="text-2xl font-semibold text-ink">Packet template selector</h2>
          <p className="max-w-3xl text-sm text-muted">
            No operational packet is created from a template alone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-sm text-xs text-muted">
          <span className="rounded-lg border border-border bg-surface px-md py-xs">
            {cards.length} templates
          </span>
          {loadState === 'loading' ? (
            <span className="rounded-lg border border-border bg-surface px-md py-xs">Loading registry</span>
          ) : null}
          {loadState === 'fallback' && loadError ? (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-md py-xs text-amber-800" title={loadError}>
              Registry fallback
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-md laptop:grid-cols-[minmax(240px,1fr)_220px_auto] laptop:items-end">
        <label className="space-y-xs">
          <span className="text-xs font-semibold uppercase tracking-tag text-muted">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-border bg-white px-md py-sm text-sm text-ink outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            placeholder="Search title, archetype, category, event family"
            aria-label="Search packet templates"
          />
        </label>

        <label className="space-y-xs">
          <span className="text-xs font-semibold uppercase tracking-tag text-muted">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-border bg-white px-md py-sm text-sm text-ink outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            aria-label="Template category"
          >
            <option>All categories</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption}>{categoryOption}</option>
            ))}
          </select>
        </label>

        <div className="flex rounded-lg border border-border bg-surface p-1" aria-label="Template collection">
          {TEMPLATE_SELECTOR_COLLECTIONS.map((collectionOption) => (
            <button
              key={collectionOption}
              type="button"
              onClick={() => setCollection(collectionOption)}
              className={cx(
                'rounded-md px-md py-sm text-xs font-semibold transition',
                collection === collectionOption
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-muted hover:bg-white hover:text-ink',
              )}
              aria-pressed={collection === collectionOption}
            >
              {COLLECTION_LABELS[collectionOption]}
            </button>
          ))}
        </div>
      </div>

      {visibleCards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-lg py-xl text-sm text-muted">
          No packet templates match the current filters.
        </div>
      ) : (
        <div className="grid gap-md tablet:grid-cols-2 desktop:grid-cols-3">
          {visibleCards.map((card) => (
            <article
              key={card.id}
              className="flex min-h-[280px] flex-col rounded-lg border border-border bg-surface p-lg shadow-sm transition hover:border-brand-teal/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 space-y-xs">
                  <p className="text-xs font-semibold uppercase tracking-tag text-muted">{card.category}</p>
                  <h3 className="text-lg font-semibold leading-tight text-ink">{card.title}</h3>
                </div>
                <span className={cx('shrink-0 rounded-full border px-sm py-[3px] text-[11px] font-semibold', availabilityClass(card))}>
                  {card.availabilityLabel}
                </span>
              </div>

              <p className="mt-md line-clamp-3 text-sm leading-6 text-muted">{card.description}</p>

              <dl className="mt-lg grid gap-sm text-xs">
                <div className="flex items-start justify-between gap-md border-t border-border pt-sm">
                  <dt className="font-semibold uppercase tracking-tag text-muted">Archetype</dt>
                  <dd className="text-right font-mono text-ink">{card.archetypeId}</dd>
                </div>
                <div className="flex items-start justify-between gap-md border-t border-border pt-sm">
                  <dt className="font-semibold uppercase tracking-tag text-muted">Event families</dt>
                  <dd className="text-right text-ink" title={card.compatibleEventFamilyIds.join(', ')}>
                    {eventFamilySummary(card)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md border-t border-border pt-sm">
                  <dt className="font-semibold uppercase tracking-tag text-muted">Last used</dt>
                  <dd className="text-right text-ink">{card.lastUsedLabel}</dd>
                </div>
              </dl>

              <div className="mt-md flex flex-wrap gap-xs">
                {card.isFavorite ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-sm py-[3px] text-[11px] font-semibold text-amber-800">
                    Favorite
                  </span>
                ) : null}
                {card.isRecentlyUsed ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-sm py-[3px] text-[11px] font-semibold text-sky-700">
                    Recently used
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleSelect(card)}
                className="mt-auto rounded-lg bg-brand-teal px-md py-sm text-sm font-semibold text-white transition hover:bg-brand-teal-deep focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
              >
                Select template
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TemplateSelector;
