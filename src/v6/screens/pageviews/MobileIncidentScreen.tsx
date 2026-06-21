import { AlertCircle, FileText, Upload, Save } from 'lucide-react';
import {
  MetricGrid,
  SurfaceCard,
  ToneTag,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Button, FormField, Input, Textarea } from '../../primitives';

const metrics = [
  { label: 'Priority', value: 'High', helper: 'Requires 24-hour sweep lock', tone: 'orange' },
  { label: 'Incident Type', value: 'Exposure', helper: 'Need OSHA control check', tone: 'orange' },
  { label: 'Assigned Coordinator', value: 'HR Admin', helper: 'Staging verification review', tone: 'teal' },
] satisfies readonly MetricTileData[];

const infoCard = {
  body: 'Field-reported incident under OSHA 29 CFR 1910.1030 control. Re-upload or update exposure logs below.',
  icon: AlertCircle,
  progress: 40,
  status: 'review-required',
  title: 'OSHA Exposure Record',
  tone: 'orange',
} satisfies SurfaceCardData;

export function MobileIncidentScreen() {
  return (
    <section
      className="grid gap-xl max-w-modal-md mx-auto"
      data-group="CES"
      data-hash-id="mobile-incident"
      data-route="/calendar/event/:eventId/task/:taskId"
      data-template="detail"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/calendar/event/:eventId/task/:taskId</ToneTag>
            <ToneTag tone="slate">mobile-incident</ToneTag>
            <ToneTag tone="slate">detail</ToneTag>
            <ToneTag tone="teal">CES</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Mobile Incident Intake</h2>
            <p className="max-w-content text-sm text-secondary">
              Upload evidence, complete exposure details, and confirm incident reports from mobile devices.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button iconLeft={<Save aria-hidden="true" className="h-icon-sm w-icon-sm" />}>
            Submit Report
          </Button>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-lg">
        <SurfaceCard card={infoCard} />

        <form className="grid gap-lg rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h3 className="text-h3 font-medium text-ink border-b border-hairline pb-sm flex items-center gap-sm">
            <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
            Report Details
          </h3>

          <FormField label="Incident Date & Time">
            {(props) => <Input {...props} type="datetime-local" />}
          </FormField>

          <FormField label="Detailed Description of exposure / incident">
            {(props) => <Textarea {...props} placeholder="Please describe the incident, exposure type, and immediate safety measures taken..." />}
          </FormField>

          <FormField label="Attach Evidence / Witness attestation files">
            {(props) => (
              <div {...props} className="border-2 border-dashed border-hairline rounded-lg p-lg text-center bg-tone-slate-bg flex flex-col items-center justify-center gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-surface text-brand-teal shadow-rest">
                  <Upload aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Click or drag files to upload</p>
                  <p className="text-xs text-muted mt-xs">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>
            )}
          </FormField>
        </form>
      </section>
    </section>
  );
}
