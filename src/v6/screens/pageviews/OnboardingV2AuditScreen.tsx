import { FileText, ScanSearch, Check } from 'lucide-react';
import { MetricGrid, DataTable, type MetricTileData, type DataTableColumn } from '../../components';
import { ToneBadge } from '../../primitives';

interface AuditRow extends Record<string, string> {
  subjectId: string;
  name: string;
  licHash: string;
  bgHash: string;
  healthHash: string;
  auditState: string;
}

const metrics = [
  { label: 'Audited subjects', value: '47', helper: 'Total activations audited', tone: 'teal' },
  { label: 'Verifiable chains', value: '45', helper: 'Undisrupted hash validation', tone: 'green' },
  { label: 'Active overrides', value: '2', helper: 'Dual signature bypass logs', tone: 'orange' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<AuditRow>[] = [
  { key: 'subjectId', label: 'Subject ID' },
  { key: 'name', label: 'Subject' },
  { key: 'licHash', label: 'License Check Hash' },
  { key: 'bgHash', label: 'Background Check Hash' },
  { key: 'healthHash', label: 'Health Check Hash' },
  { key: 'auditState', label: 'Verification State', status: true },
];

const rows: readonly AuditRow[] = [
  { subjectId: 'SUB-2001', name: 'James Carter', licHash: 'sha256-4c28a...', bgHash: 'sha256-11f8b...', healthHash: 'pending-hold', auditState: 'attention' },
  { subjectId: 'SUB-2002', name: 'Sophia Martinez', licHash: 'sha256-9a2f2...', bgHash: 'sha256-cc120...', healthHash: 'sha256-bb8a3...', auditState: 'validated' },
  { subjectId: 'SUB-2003', name: 'Liam O\'Connor', licHash: 'sha256-e2f0a...', bgHash: 'sha256-43b8a...', healthHash: 'pending-hold', auditState: 'attention' },
  { subjectId: 'SUB-2004', name: 'Emma Watson', licHash: 'sha256-8a3b1...', bgHash: 'sha256-ff32c...', healthHash: 'sha256-aa28e...', auditState: 'validated' },
];

export function OnboardingV2AuditScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-audit"
      data-route="/onboarding-v2/audit"
      data-template="evidence"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Verification Audit Trail</h3>
                <p className="mt-xs text-sm text-muted">Audited hash state for all active and historical subjects.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Verification audit table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Overrides check">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ScanSearch aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Active Overrides
            </h3>
            <p className="text-sm text-secondary mb-md">
              Administrative bypass logs currently active under dual-signature validation rules.
            </p>
            <div className="grid gap-sm">
              <div className="rounded-md bg-tone-slate-bg p-md">
                <div className="flex items-center justify-between mb-sm">
                  <span className="text-sm font-medium text-ink">SUB-2001 Override</span>
                  <ToneBadge size="sm" status="review-required" />
                </div>
                <p className="text-xs text-muted">Bypassed health screen for temporary orientation demo.</p>
              </div>
              <div className="rounded-md bg-tone-slate-bg p-md">
                <div className="flex items-center justify-between mb-sm">
                  <span className="text-sm font-medium text-ink">SUB-2003 Override</span>
                  <ToneBadge size="sm" status="review-required" />
                </div>
                <p className="text-xs text-muted">Bypassed licensure verification pending primary validation.</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Audit Integrity Check
            </h3>
            <div className="rounded-md bg-tone-green-bg p-md text-sm text-tone-green-text flex items-start gap-sm">
              <Check aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 mt-xs" />
              <div>
                <p className="font-medium">Chains are intact</p>
                <p className="text-xs mt-xs opacity-90">All active subject verification chains matched successfully against standard anchors.</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
