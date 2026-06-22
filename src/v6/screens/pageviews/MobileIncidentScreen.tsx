import { AlertCircle, ClipboardCheck, FileText, ShieldCheck, Upload } from 'lucide-react';
import { MetricGrid, SurfaceCard, type MetricTileData, type SurfaceCardData } from '../../components';
import { FormField, Input, Textarea, ToneBadge } from '../../primitives';

const metrics = [
  { label: 'Priority', value: 'High', helper: '24-hour sweep lock', tone: 'orange' },
  { label: 'Incident Type', value: 'Exposure', helper: 'OSHA control check', tone: 'orange' },
  { label: 'Evidence', value: '3', helper: 'Files expected', tone: 'teal' },
  { label: 'Owner', value: 'HR Admin', helper: 'Coordinator review', tone: 'teal' },
] satisfies readonly MetricTileData[];

const incidentCards = [
  {
    body: 'Field-reported exposure event needs source notes, witness context, and immediate safety measures before packet lock.',
    icon: AlertCircle,
    progress: 40,
    status: 'review-required',
    title: 'Incident intake',
    tone: 'orange',
  },
  {
    body: 'Attach exposure log, witness attestation, route note, and supervisor acknowledgment before administrator review.',
    icon: Upload,
    progress: 58,
    status: 'pending',
    title: 'Evidence capture',
    tone: 'teal',
  },
  {
    body: 'Coordinator escalation opens after evidence is uploaded and the OSHA control checklist is acknowledged.',
    icon: ShieldCheck,
    progress: 72,
    status: 'ready',
    title: 'Escalation posture',
    tone: 'green',
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
