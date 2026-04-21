import { useEffect, useMemo, useState } from 'react';
import { Cloud, CloudOff, CloudUpload, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { useCalendarSyncStore, type EventSyncStatus } from '@/policy/stores/calendarSyncStore';
import { useToastStore } from '@/policy/components/regulatory/Toast';
import { categoryLabel } from '@/policy/utils/complianceClassification';
import type { MandateType } from '@/policy/data/regulatoryEvents';

const MANDATE_STYLE: Record<MandateType, { label: string; fg: string; border: string; bg: string }> = {
  'federal-required':    { label: 'Federal Required',    fg: '#EF4444', border: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.08)' },
  'conditional-federal': { label: 'Conditional Federal', fg: '#FBBF24', border: 'rgba(251,191,36,0.4)',  bg: 'rgba(251,191,36,0.08)' },
  'policy-driven':       { label: 'Policy-Driven',       fg: '#A78BFA', border: 'rgba(167,139,250,0.4)', bg: 'rgba(167,139,250,0.08)' },
  'state-required':      { label: 'State Required',      fg: '#F97316', border: 'rgba(249,115,22,0.4)',  bg: 'rgba(249,115,22,0.08)' },
};

export function MandateBadge({ mandateType }: { mandateType?: MandateType }) {
  if (!mandateType) return null;
  const s = MANDATE_STYLE[mandateType];
  return (
    <span
      className="inline-flex items-center px-1.5 py-[2px] rounded-md text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]"
      style={{ color: s.fg, background: s.bg, border: `1px solid ${s.border}` }}
      title={`Mandate type: ${s.label}`}
    >
      {s.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Per-Event Calendar Sync Control
   ----------------------------------------------------------------
   A small, event-scoped badge + action row that:
     • shows the current sync lifecycle (Not Synced / Synced / Error)
     • exposes a "Push to Google Calendar" button — MANUAL ONLY
     • re-fires as a "Retry" when the last push failed, and upgrades
       to a loud visual state when the event is regulatorily required
     • displays the last-synced timestamp and any error message
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  event: RegulatoryEvent;
  compact?: boolean;
}

const STATUS_STYLE: Record<EventSyncStatus, { fg: string; bg: string; border: string; label: string }> = {
  NOT_SYNCED: { fg: '#94A3B8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)', label: 'Not Synced' },
  SYNCING:    { fg: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.40)',  label: 'Syncing…'  },
  SYNCED:     { fg: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  label: 'Synced'    },
  ERROR:      { fg: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.45)',   label: 'Error'     },
};

export function EventSyncBadge({ event }: { event: RegulatoryEvent }) {
  // Subscribe narrowly so the badge re-renders on lifecycle changes only.
  const meta = useCalendarSyncStore((s) => s.eventMeta[event.id]);
  const resolved = useMemo(() => {
    if (meta) return meta;
    return useCalendarSyncStore.getState().getMeta(event);
  }, [meta, event]);

  const style = STATUS_STYLE[resolved.syncStatus];
  const Icon =
    resolved.syncStatus === 'SYNCED' ? CheckCircle2
    : resolved.syncStatus === 'SYNCING' ? CloudUpload
    : resolved.syncStatus === 'ERROR' ? AlertTriangle
    : CloudOff;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]"
      style={{ color: style.fg, background: style.bg, border: `1px solid ${style.border}` }}
      title={resolved.lastSyncError ?? `Google Calendar: ${style.label}`}
    >
      <Icon size={10} />
      {style.label}
    </span>
  );
}

export function EventSyncControl({ event, compact = false }: Props) {
  const meta       = useCalendarSyncStore((s) => s.eventMeta[event.id]);
  const syncEvent  = useCalendarSyncStore((s) => s.syncEvent);
  const clearError = useCalendarSyncStore((s) => s.clearError);
  const push       = useToastStore((s) => s.push);
  const [pending, setPending] = useState(false);

  // Hydrate meta the first time we render an event we have never seen —
  // this keeps the per-event row accurate without mutating state on mount.
  const resolved = meta ?? useCalendarSyncStore.getState().getMeta(event);

  useEffect(() => {
    // Intentionally empty: we MUST NOT trigger sync on mount/load/edit.
    // This placeholder exists to make the MANUAL-ONLY contract explicit.
  }, [event.id]);

  const onPush = async () => {
    setPending(true);
    try {
      const result = await syncEvent(event);
      if (result.ok) {
        push(
          'success',
          result.action === 'updated' ? 'Event updated in Google Calendar' : 'Event pushed to Google Calendar',
          event.title,
        );
      } else {
        push(
          result.requiredFailure ? 'error' : 'warn',
          result.requiredFailure ? 'REQUIRED event failed to sync' : 'Sync failed',
          result.error ?? 'Sync failed. Please retry or contact system admin.',
        );
      }
    } finally {
      setPending(false);
    }
  };

  const status   = resolved.syncStatus;
  const required = resolved.required;
  const isError  = status === 'ERROR';
  const label    =
    status === 'SYNCED' ? 'Update in Google Calendar'
    : isError           ? 'Retry push'
    : 'Push to Google Calendar';

  return (
    <div
      className={`rounded-lg border ${isError && required ? 'border-[#EF4444]/60 bg-[#EF4444]/[0.06]' : 'border-white/10 bg-white/[0.02]'} p-2.5`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <EventSyncBadge event={event} />
          <MandateBadge mandateType={event.mandateType} />
          <span className="text-[9px] font-montserrat font-bold text-white/40 uppercase tracking-[0.16em]">
            {categoryLabel(resolved.category)}
          </span>
          {required && !event.mandateType && (
            <span className="text-[9px] font-montserrat font-bold text-[#FBBF24] uppercase tracking-[0.16em]">
              · Required
            </span>
          )}
        </div>
        {resolved.lastSyncedAt && !compact && (
          <span className="text-[9.5px] font-roboto text-white/40">
            {new Date(resolved.lastSyncedAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
            {resolved.lastAction && <> · {resolved.lastAction}</>}
          </span>
        )}
      </div>

      {isError && (
        <div className="mb-2 flex items-start gap-1.5 text-[10.5px] font-roboto text-[#FCA5A5] leading-snug">
          <AlertTriangle size={11} className="mt-0.5 shrink-0" />
          <span>
            {resolved.lastSyncError ?? 'Sync failed. Please retry or contact system admin.'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          onClick={onPush}
          disabled={pending || status === 'SYNCING'}
          className={`
            flex items-center gap-1.5 rounded-md px-2 py-1
            text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]
            disabled:opacity-50
            ${isError
              ? 'border border-[#EF4444]/50 bg-[#EF4444]/15 text-[#FCA5A5] hover:bg-[#EF4444]/20'
              : status === 'SYNCED'
                ? 'border border-[#10B981]/40 bg-[#10B981]/10 text-[#6EE7B7] hover:bg-[#10B981]/15'
                : 'border border-[#FFC107]/40 bg-[#FFC107]/10 text-[#FFC107] hover:bg-[#FFC107]/15'}
          `}
          title={
            status === 'SYNCED'
              ? 'Re-push this event to update its Google Calendar entry.'
              : 'Push this event to Google Calendar (manual sync only).'
          }
        >
          {isError ? <RotateCcw size={11} /> : <Cloud size={11} />}
          {pending ? 'Pushing…' : label}
        </button>
        {isError && (
          <button
            onClick={() => clearError(event.id)}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9.5px] font-montserrat text-white/50 hover:text-white/80"
            title="Dismiss the error without re-syncing"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
