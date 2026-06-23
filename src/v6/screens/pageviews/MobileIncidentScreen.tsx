import { AlertCircle, ClipboardCheck, FileText, ShieldCheck, Upload } from 'lucide-react';
import { MetricGrid, SurfaceCard, type MetricTileData, type SurfaceCardData } from '../../components';
import { FormField, Input, Textarea, ToneBadge } from '../../primitives';

const metrics = [
  { label: 'Open task', value: 'INC-1044', helper: 'Field incident workflow', tone: 'orange' },
  { label: 'Evidence', value: '3/5', helper: 'Photos and notes attached', tone: 'teal' },
  { label: 'Escalation', value: 'Active', helper: 'Supervisor notified', tone: 'orange' },
  { label: 'Packet state', value: 'Draft', helper: 'Not survey-ready', tone: 'amber' },
] satisfies readonly MetricTileData[];

// Design cross-ref (Agent 04/07): mobile-incident aligns to V6_DESIGN.html ~1423 (mobileIncidentCards, metrics).
// Title, description, cards, and metrics now match design prototype exactly. See also V6_DESIGN_RECONCILIATION for mobile-incident MATCHED_REFERENCE.

const incidentCards = [
  {
    body: 'Field user can capture event time, location, patient impact, and immediate action from mobile.',
    icon: AlertCircle,
    progress: 58,
    status: 'review-required',
    title: 'Incident intake',
    tone: 'orange',
  },
  {
    body: 'Photos, witness notes, and supervisor attestation attach directly to the workflow instance.',
    icon: Upload,
    progress: 72,
    status: 'pending',
    title: 'Evidence capture',
    tone: 'teal',
  },
  {
    body: 'Administrator and clinical manager are notified before closure or survey packet inclusion.',
    icon: ShieldCheck,
    progress: 66,
    status: 'ready',
    title: 'Escalation path',
    tone: 'teal',
  },
] satisfies readonly SurfaceCardData[];

const previewRows = [
  ['Event', 'Exposure follow-up'],
  ['Policy anchor', 'OSHA 29 CFR 1910.1030'],
  ['Responsible owner', 'HR Administrator'],
  ['Review window', 'Due today'],
  ['Packet state', 'Evidence pending'],
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
