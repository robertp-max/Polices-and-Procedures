import { Calendar, User, ShieldCheck } from 'lucide-react';
import {
  MetricGrid,
  ToneTag,
  type MetricTileData,
} from '../../components';
import { Button } from '../../primitives';

const metrics = [
  { label: 'Current Phase', value: 'Review', helper: 'Awaiting board approval', tone: 'amber' },
  { label: 'Version', value: 'v2.4', helper: 'Last revision 2026-06-12', tone: 'teal' },
  { label: 'ACHC Standard', value: 'HC-11A', helper: 'Mapped standard target', tone: 'green' },
] satisfies readonly MetricTileData[];

export function PolicyLifecycleDetailScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="policy-lifecycle-detail"
      data-route="/policy-lifecycle/:policyId"
      data-template="lifecycle"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/policy-lifecycle/:policyId</ToneTag>
            <ToneTag tone="slate">policy-lifecycle-detail</ToneTag>
            <ToneTag tone="slate">lifecycle</ToneTag>
            <ToneTag tone="teal">System</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">ADM-HR-004 - Staffing Qualifications</h2>
            <p className="max-w-content text-sm text-secondary">
              Lifecycle audits, version comparisons, and review logs for the selected policy record.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button>Approve Policy</Button>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">Policy Draft Content Preview</h3>
            <div className="rounded-md border border-hairline bg-tone-slate-bg p-lg text-sm text-secondary leading-relaxed">
              <p className="mb-md"><strong>1. Objective:</strong> Establish qualifications and credential checks for home health agency field workforce members.</p>
              <p className="mb-md"><strong>2. Scope:</strong> Applies to all RN, LVN, HHA, and therapy tracks prior to independent visit clearance.</p>
              <p><strong>3. Compliance:</strong> Governed under CMS 42 CFR 484.115 and ACHC standard expectations.</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Version history">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Audit Log Details
            </h3>
            <div className="grid gap-sm text-sm">
              <div className="rounded-md bg-tone-slate-bg p-md flex flex-col gap-xs">
                <span className="font-medium text-ink flex items-center gap-xs">
                  <User aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Edited by HR coordinator
                </span>
                <span className="text-xs text-muted flex items-center gap-xs">
                  <Calendar aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  2026-06-12 09:15 UTC
                </span>
              </div>
              <div className="rounded-md bg-tone-slate-bg p-md flex flex-col gap-xs">
                <span className="font-medium text-ink flex items-center gap-xs">
                  <User aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Created by Compliance Officer
                </span>
                <span className="text-xs text-muted flex items-center gap-xs">
                  <Calendar aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  2026-06-01 10:00 UTC
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
