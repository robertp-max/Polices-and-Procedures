import { ShieldAlert, BookOpen, AlertTriangle } from 'lucide-react';
import {
  MetricGrid,
  DataTable,
  ToneTag,
  type MetricTileData,
  type DataTableColumn,
} from '../../components';
import { Badge, ToneBadge } from '../../primitives';

interface OverrideRow extends Record<string, string> {
  overrideId: string;
  subject: string;
  gate: string;
  reason: string;
  approvers: string;
  status: string;
}

const metrics = [
  { label: 'Active Overrides', value: '5', helper: 'Active dual-signature overrides', tone: 'orange' },
  { label: 'Pending Sign-off', value: '2', helper: 'Awaiting secondary supervisor', tone: 'amber' },
  { label: 'Expired Overrides', value: '18', helper: 'Completed or deactivated overrides', tone: 'teal' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<OverrideRow>[] = [
  { key: 'overrideId', label: 'Override ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'gate', label: 'Gate' },
  { key: 'reason', label: 'Bypass Reason' },
  { key: 'approvers', label: 'Approvers Pair' },
  { key: 'status', label: 'State', status: true },
];

const rows: readonly OverrideRow[] = [
  { overrideId: 'OVR-101', subject: 'James Carter', gate: 'Gate 3: Health', reason: 'TB Screening delay', approvers: 'DON / HR Director', status: 'review-required' },
  { overrideId: 'OVR-102', subject: 'Liam O\'Connor', gate: 'Gate 2: Credentials', reason: 'License verification delay', approvers: 'DON / Compliance Officer', status: 'awaiting' },
  { overrideId: 'OVR-103', subject: 'Emma Watson', gate: 'Gate 4: Training', reason: 'Orientation module transfer', approvers: 'HR Coordinator / DON', status: 'complete' },
];

export function OnboardingV2GovernanceScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-governance"
      data-route="/onboarding-v2/governance"
      data-template="reports"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/onboarding-v2/governance</ToneTag>
            <ToneTag tone="slate">onboarding-v2-governance</ToneTag>
            <ToneTag tone="slate">reports</ToneTag>
            <ToneTag tone="teal">Onboarding v2</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Onboarding Overrides</h2>
            <p className="max-w-content text-sm text-secondary">
              Management panel for active dual-signature overrides, safety limits, and regulatory bypass validation.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <ToneBadge size="sm" status="active" />
          <Badge variant="count">Onboarding Overrides</Badge>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Override Authorizations</h3>
                <p className="mt-xs text-sm text-muted">Auditable logs of active and signed bypass settings.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Override authorizations table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Governance checks">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />
              Safety Alerts
            </h3>
            <div className="rounded-md bg-tone-orange-bg p-md text-sm text-tone-orange-text flex items-start gap-sm mb-md">
              <AlertTriangle aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 mt-xs" />
              <div>
                <p className="font-medium">Approver pairs must match</p>
                <p className="text-xs mt-xs opacity-90">All overrides require a designated Clinical Director + Compliance Officer or HR Director pair signature.</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Audit Constraints
            </h3>
            <p className="text-sm text-secondary">
              Overrides carry strict expiration gates. Expired entries automatically block subject logins and trigger supervisor email warnings.
            </p>
          </section>
        </aside>
      </section>
    </section>
  );
}
