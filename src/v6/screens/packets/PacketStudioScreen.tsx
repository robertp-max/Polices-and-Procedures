import { useEffect, useMemo, useState } from 'react';
import { packetsApi } from '@/policy/packets/api/packetsApi';
import {
  PACKET_TEMPLATES,
  type PacketTemplateDefinition,
} from '@/policy/packets/registries/templateRegistry';
import EventSelectorCalendar from './eventSelector/EventSelectorCalendar';
import type { EventCardModel } from './eventSelector/eventCardModel';

type LoadState = 'registry' | 'loading' | 'api' | 'fallback';

function availabilityClass(availability: PacketTemplateDefinition['availability']): string {
  switch (availability) {
    case 'Available':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'Planned':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case 'Needs configuration':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'Restricted':
      return 'border-rose-200 bg-rose-50 text-rose-800';
    default:
      return 'border-hairline bg-surface-glass text-muted';
  }
}

function formatLastUsed(value: string | null): string {
  return value ?? 'Not used yet';
}

export default function PacketStudioScreen() {
  const [templates, setTemplates] = useState<readonly PacketTemplateDefinition[]>(PACKET_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCardModel | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    packetsApi.listPacketTemplates()
      .then((response) => {
        if (cancelled) return;
        setTemplates(response.templates);
        setLoadState('api');
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setTemplates(PACKET_TEMPLATES);
        setLoadState('fallback');
        setLoadError(error instanceof Error ? error.message : 'Packet template API unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.packet_template_id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const templateStats = useMemo(() => {
    const available = templates.filter((template) => template.availability === 'Available').length;
    const categories = new Set(templates.map((template) => template.category)).size;
    return { available, categories };
  }, [templates]);

  return (
    <div className="min-h-full bg-surface text-ink">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-xl px-lg py-xl">
        <header className="flex flex-col gap-md border-b border-hairline pb-lg lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Packet Studio
            </p>
            <h1 className="mt-xs text-3xl font-semibold tracking-normal text-ink">
              Mandated Event Packet Studio
            </h1>
            <p className="mt-sm text-sm leading-6 text-muted">
              Template compatibility and CES event selection.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templates.length}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Templates</div>
            </div>
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templateStats.available}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Available</div>
            </div>
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templateStats.categories}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Categories</div>
            </div>
          </div>
        </header>

        {loadState === 'fallback' && loadError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-md py-sm text-sm text-amber-900">
            Using bundled packet templates. API response: {loadError}
          </div>
        ) : null}

        <section className="grid gap-lg xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="flex flex-col gap-md">
            <div>
              <h2 className="text-lg font-semibold text-ink">Template</h2>
              <p className="mt-xs text-sm text-muted">
                Source: {loadState === 'api' ? 'packet API' : loadState === 'loading' ? 'loading API' : 'template registry'}
              </p>
            </div>

            <div className="grid gap-sm">
              {templates.map((template) => {
                const selected = selectedTemplateId === template.packet_template_id;
                return (
                  <button
                    key={template.packet_template_id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.packet_template_id);
                      setSelectedEvent(null);
                    }}
                    className={[
                      'rounded-md border p-md text-left transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                      selected
                        ? 'border-brand-teal bg-brand-teal/10 shadow-rest'
                        : 'border-hairline bg-surface-glass hover:bg-surface-hover',
                    ].join(' ')}
                    aria-pressed={selected}
                  >
                    <div className="flex flex-wrap items-center gap-xs">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        {template.category}
                      </span>
                      <span className={`rounded-full border px-sm py-[2px] text-[11px] font-semibold ${availabilityClass(template.availability)}`}>
                        {template.availability}
                      </span>
                    </div>
                    <div className="mt-sm text-base font-semibold text-ink">{template.title}</div>
                    <div className="mt-xs text-sm leading-5 text-muted">{template.description}</div>
                    <div className="mt-sm grid gap-xs text-xs text-muted">
                      <span>Archetype: {template.packet_archetype_id}</span>
                      <span>Last used: {formatLastUsed(template.lastUsedAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            {selectedTemplate ? (
              <div className="flex flex-col gap-md">
                <div className="flex flex-col gap-sm border-b border-hairline pb-md lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">Event</h2>
                    <p className="mt-xs text-sm text-muted">
                      Filtered by {selectedTemplate.packet_template_id}
                    </p>
                  </div>
                  {selectedEvent ? (
                    <div className="rounded-md border border-hairline bg-surface-glass px-md py-sm text-sm">
                      <div className="font-semibold text-ink">{selectedEvent.eventTitle}</div>
                      <div className="text-muted">{selectedEvent.eventDate}</div>
                    </div>
                  ) : null}
                </div>
                <EventSelectorCalendar
                  selectedTemplate={selectedTemplate}
                  onSelectEvent={setSelectedEvent}
                  agencyLabel="Care Indeed Home Health"
                />
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-hairline bg-surface-glass px-lg text-center text-sm text-muted">
                No packet template selected.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
