import { Shield, Key, Heart, Award, FileSearch, ShieldCheck } from 'lucide-react';
import {
  DataTable,
  ProgressMeter,
  SurfaceCard,
  ToneTag,
  type DataTableColumn,
} from '../../components';
import { Badge, ToneBadge } from '../../primitives';

interface RosterRow extends Record<string, string> {
  subjectId: string;
  name: string;
  role: string;
  gate1: string;
  gate2: string;
  gate3: string;
  gate4: string;
  gate5: string;
}

const columns: readonly DataTableColumn<RosterRow>[] = [
  { key: 'subjectId', label: 'Subject ID' },
  { key: 'name', label: 'Subject Name' },
  { key: 'role', label: 'Role' },
  { key: 'gate1', label: 'Background', status: true },
  { key: 'gate2', label: 'Credentials', status: true },
  { key: 'gate3', label: 'Health', status: true },
  { key: 'gate4', label: 'Training', status: true },
  { key: 'gate5', label: 'Supervised', status: true },
];

const rows: readonly RosterRow[] = [
  { subjectId: 'SUB-2001', name: 'James Carter', role: 'RN Case Manager', gate1: 'validated', gate2: 'pending', gate3: 'locked', gate4: 'complete', gate5: 'locked' },
  { subjectId: 'SUB-2002', name: 'Sophia Martinez', gate1: 'validated', gate2: 'validated', gate3: 'passed', gate4: 'complete', gate5: 'signed', role: 'Home Health Aide' },
  { subjectId: 'SUB-2003', name: 'Liam O\'Connor', gate1: 'validated', gate2: 'pending', gate3: 'locked', gate4: 'complete', gate5: 'locked', role: 'Physical Therapist' },
];

const timelineEvents = [
  { label: 'Batch initialized', value: '2026-06-01 08:00 UTC', detail: 'System generated trigger event' },
  { label: 'Subject record created', value: '2026-06-01 08:05 UTC', detail: 'Initial hash-chain anchor set' },
  { label: 'Background sweep complete', value: '2026-06-02 14:30 UTC', detail: 'Identity & criminal checks validated' },
  { label: 'Override request logged', value: '2026-06-19 11:22 UTC', detail: 'Licensure verification request' },
] as const;

export function OnboardingV2BatchScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-batch"
      data-route="/onboarding-v2/batches/:batchId"
      data-template="detail"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/onboarding-v2/batches/:batchId</ToneTag>
            <ToneTag tone="slate">onboarding-v2-batch</ToneTag>
            <ToneTag tone="slate">detail</ToneTag>
            <ToneTag tone="teal">Onboarding v2</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Batch Detail View</h2>
            <p className="max-w-content text-sm text-secondary">
              Subject roster, 5 fixed gate statuses, phase progress, and hash-chain audit timeline.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <ToneBadge size="sm" status="active" />
          <Badge variant="count">BAT-001</Badge>
        </div>
      </section>

      <section className="grid gap-lg tablet-l:grid-cols-5">
        {[
          { icon: Shield, label: 'Background', status: 'validated' },
          { icon: Key, label: 'Credentials', status: 'pending' },
          { icon: Heart, label: 'Health Safety', status: 'review-required' },
          { icon: Award, label: 'Training', status: 'complete' },
          { icon: FileSearch, label: 'Supervised', status: 'locked' },
        ].map((gate) => {
          const Icon = gate.icon;
          return (
            <div className="rounded-lg border border-card bg-surface p-md shadow-rest flex flex-col items-center gap-xs text-center" key={gate.label}>
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-slate-bg text-brand-teal mb-sm">
                <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <span className="text-sm font-medium text-ink">{gate.label}</span>
              <ToneBadge size="sm" status={gate.status} />
            </div>
          );
        })}
      </section>

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Batch Subjects Roster</h3>
                <p className="mt-xs text-sm text-muted">Detailed view of subjects in the batch and their gate positions.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Batch subjects table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4">
          <SurfaceCard
            card={{
              body: 'Overall batch progress calculated across active subjects and cleared gates.',
              icon: ShieldCheck,
              progress: 68,
              status: 'active',
              title: 'Batch Progress Meter',
              tone: 'teal',
            }}
          >
            <ProgressMeter label="Batch clearance completion" tone="teal" value={68} />
          </SurfaceCard>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">Hash-Chain Timeline</h3>
            <div className="grid gap-md">
              {timelineEvents.map((event) => (
                <div className="border-l-2 border-hairline pl-md relative" key={event.label}>
                  <span className="absolute -left-[5px] top-xs h-[8px] w-[8px] rounded-full bg-brand-teal" />
                  <p className="text-xs text-brand-orange font-mono">{event.value}</p>
                  <p className="text-sm font-medium text-ink mt-xs">{event.label}</p>
                  <p className="text-xs text-muted mt-xs">{event.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
