import { AlertCircle, ClipboardCheck, FileText, ShieldCheck, Upload } from 'lucide-react';
import { MetricGrid, SurfaceCard, type MetricTileData, type SurfaceCardData } from '../../components';
import { FormField, Input, Textarea, ToneBadge } from '../../primitives';
import type { Tone } from '../../tokens';
import {
  REGULATORY_EVENTS,
  relativeLabel,
  type RegulatoryEvent,
  type UrgencyLevel,
} from '@/policy/data/regulatoryEvents';

// Design cross-ref (Agent 04/07): mobile-incident aligns to V6_DESIGN.html ~1423 (mobileIncidentCards, metrics).
// Title, description, cards, and metrics now match design prototype exactly. See also V6_DESIGN_RECONCILIATION for mobile-incident MATCHED_REFERENCE.
//
// Data source: real regulatory event seed records (REGULATORY_EVENTS). The
// metric tiles, incident status cards, and right-panel preview rows are all
// derived from the actual event dataset rather than hardcoded sample values.

/** Real, actionable event records (holidays / context markers excluded). */
const incidentEvents: RegulatoryEvent[] = REGULATORY_EVENTS.filter((event) => !event.isContext);

/** Map seed urgency to a valid ToneBadge status code (no invented values). */
function urgencyToStatus(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'complete':
      return 'complete';
    case 'blocked':
      return 'blocked';
    case 'missing-evidence':
      return 'missing-evidence';
    case 'overdue':
    case 'critical':
      return 'attention';
    case 'due-soon':
      return 'pending';
    case 'on-track':
      return 'active';
    case 'scheduled':
    default:
      return 'upcoming';
  }
}

/** Map seed urgency to a V6 Tone (derived from real urgency, no invention). */
function urgencyToTone(urgency: UrgencyLevel): Tone {
  switch (urgency) {
    case 'complete':
      return 'green';
    case 'overdue':
    case 'critical':
      return 'red';
    case 'blocked':
    case 'missing-evidence':
      return 'orange';
    case 'due-soon':
      return 'amber';
    case 'on-track':
      return 'teal';
    case 'scheduled':
    default:
      return 'slate';
  }
}

/** Evidence completion ratio for an event, as a 0-100 progress value. */
function evidenceProgress(event: RegulatoryEvent): number {
  const forms = event.requiredForms ?? [];
  if (forms.length === 0) return 0;
  const done = forms.filter((form) => form.status === 'complete').length;
  return Math.round((done / forms.length) * 100);
}

const metrics = [
  {
    label: 'Open task',
    value: incidentEvents[0]?.id ?? '—',
    helper: incidentEvents[0]?.title ?? 'Field incident workflow',
    tone: 'orange',
  },
  {
    label: 'Evidence',
    value: incidentEvents[0]
      ? `${(incidentEvents[0].requiredForms ?? []).filter((f) => f.status === 'complete').length}/${(incidentEvents[0].requiredForms ?? []).length}`
      : '—',
    helper: 'Required forms complete',
    tone: 'teal',
  },
  {
    label: 'Escalation',
    value: incidentEvents[0]?.complianceFlags?.auditRisk
      ? incidentEvents[0].complianceFlags.auditRisk.charAt(0).toUpperCase() + incidentEvents[0].complianceFlags.auditRisk.slice(1)
      : '—',
    helper: incidentEvents[0]?.ownerRole ?? 'Supervisor notified',
    tone: 'orange',
  },
  {
    label: 'Packet state',
    value: incidentEvents[0]?.minutes?.status
      ? incidentEvents[0].minutes.status.charAt(0).toUpperCase() + incidentEvents[0].minutes.status.slice(1)
      : '—',
    helper: incidentEvents[0]?.summary ? 'Workflow record state' : 'Not survey-ready',
    tone: 'amber',
  },
] satisfies readonly MetricTileData[];

// Same three design icons; cycled deterministically across real records.
const cardIcons = [AlertCircle, Upload, ShieldCheck] as const;

const incidentCards = incidentEvents.map((event, index) => ({
  body: event.summary ?? event.regulatoryDriver ?? '—',
  icon: cardIcons[index % cardIcons.length],
  progress: evidenceProgress(event),
  status: urgencyToStatus(event.urgency),
  title: event.title,
  tone: urgencyToTone(event.urgency),
})) satisfies readonly SurfaceCardData[];

const previewEvent = incidentEvents[0];
const previewRows = [
  ['Event', previewEvent?.title ?? '—'],
  ['Policy anchor', previewEvent?.policyRefs?.length ? previewEvent.policyRefs.join(', ') : '—'],
  ['Responsible owner', previewEvent?.ownerRole ?? '—'],
  ['Review window', previewEvent?.date ? relativeLabel(previewEvent.date) : '—'],
  ['Packet state', previewEvent?.minutes?.status
    ? previewEvent.minutes.status.charAt(0).toUpperCase() + previewEvent.minutes.status.slice(1)
    : '—'],
] as const;

export function MobileIncidentScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="CES"
      data-hash-id="mobile-incident"
      data-route="/calendar/event/:eventId/task/:taskId"
      data-template="detail"
    >
      <div>
        <h1 className="text-h2 font-medium text-ink">Mobile Incident Execution - Field Intake</h1>
        <p className="mt-xs text-sm text-muted">Mobile-first action surface for event context, task proof, signature, evidence capture, and approval.</p>
      </div>
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-lg">
          <section className="grid gap-lg tablet-l:grid-cols-3" aria-label="Incident status cards">
            {incidentCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </section>

          <form className="grid gap-lg rounded-lg border border-card bg-white/[.58] p-xl shadow-rest backdrop-blur-xl">
            <h3 className="flex items-center gap-sm border-b border-hairline pb-sm text-h3 font-medium text-ink">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Report Details
            </h3>

            <div className="grid gap-lg tablet-l:grid-cols-2">
              <FormField label="Incident Date & Time">
                {(props) => <Input {...props} type="datetime-local" />}
              </FormField>

              <FormField label="Coordinator">
                {(props) => <Input {...props} readOnly value="HR Administrator" />}
              </FormField>
            </div>

            <FormField label="Detailed Description of exposure / incident">
              {(props) => <Textarea {...props} placeholder="Describe the exposure, immediate response, and people notified." />}
            </FormField>

            <FormField label="Attach evidence / witness attestation files">
              {({ 'aria-describedby': ariaDescribedBy, id, invalid }) => (
                <div
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={invalid || undefined}
                  className="flex min-h-[180px] flex-col items-center justify-center gap-sm rounded-lg border-2 border-dashed border-tone-teal-border bg-tone-teal-bg/45 p-lg text-center"
                  id={id}
                  role="button"
                  tabIndex={0}
                >
                  <span className="grid h-tap w-tap place-items-center rounded-md bg-white/[.66] text-brand-teal shadow-rest">
                    <Upload aria-hidden="true" className="h-icon-md w-icon-md" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">Click or drag files to upload</p>
                    <p className="mt-xs text-xs text-muted">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              )}
            </FormField>
          </form>
        </div>

        <aside className="grid content-start gap-lg" aria-label="Incident review preview">
          <section className="rounded-lg border border-card bg-white/[.58] p-xl shadow-rest backdrop-blur-xl">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h2 className="text-h2 font-medium text-ink">Right panel preview</h2>
                <p className="mt-xs text-sm text-muted">Review context before submitting the incident packet.</p>
              </div>
              <ToneBadge size="sm" status="review-required" />
            </div>
            <dl className="grid gap-sm">
              {previewRows.map(([label, value]) => (
                <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={label}>
                  <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                  <dd className="mt-xs text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <SurfaceCard
            card={{
              body: 'The packet can advance after evidence upload, supervisor acknowledgment, and administrator review.',
              icon: ClipboardCheck,
              progress: 64,
              status: 'ready',
              title: 'Advance readiness',
              tone: 'teal',
            }}
          />
        </aside>
      </section>
    </section>
  );
}

export default MobileIncidentScreen;
