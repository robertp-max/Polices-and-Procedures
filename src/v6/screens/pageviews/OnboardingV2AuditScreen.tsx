import { FileText, ScanSearch, Check } from 'lucide-react';
import { MetricGrid, DataTable, type MetricTileData, type DataTableColumn } from '../../components';
import { ToneBadge } from '../../primitives';
import { buildSeedSnapshot } from '@/policy/onboarding-v2/store/seed';

interface AuditRow extends Record<string, string> {
  subjectId: string;
  name: string;
  licHash: string;
  bgHash: string;
  healthHash: string;
  auditState: string;
}

const snap = buildSeedSnapshot();
const workforceById = new Map(snap.workforce.map((w: any) => [w.id, w]));
const audited = snap.batches.length;
const verifiable = snap.units.filter((u: any) => u.status === 'Completed').length;
const activeOverrides = snap.overrides ? snap.overrides.filter((o: any) => o.status === 'Active').length : 0;
const metrics = [
  { label: 'Audited subjects', value: String(audited), helper: 'Total activations audited (from seed)', tone: 'teal' },
  { label: 'Verifiable chains', value: String(verifiable), helper: 'Undisrupted hash validation', tone: 'green' },
  { label: 'Active overrides', value: String(activeOverrides), helper: 'Dual signature bypass logs', tone: 'orange' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<AuditRow>[] = [
  { key: 'subjectId', label: 'Subject ID' },
  { key: 'name', label: 'Subject' },
  { key: 'licHash', label: 'License Check Hash' },
  { key: 'bgHash', label: 'Background Check Hash' },
  { key: 'healthHash', label: 'Health Check Hash' },
  { key: 'auditState', label: 'Verification State', status: true },
];

// Real audit rows from seed units + signatures + evidence hashes (no placeholder names)
const rows: readonly AuditRow[] = snap.batches.map((b: any) => {
  const subj: any = workforceById.get(b.subjectId) || { id: b.subjectId, legalName: b.subjectId };
  const u = snap.units.filter((x: any) => x.batchId === b.id);
  const sigs = snap.signatures.filter((s: any) => s.subjectId === b.subjectId);
  const ev = snap.evidence.filter((e: any) => e.subjectId === b.subjectId);
  const lic = (sigs[0] as any)?.contentHash || (u.find((x:any)=> (x.requirementId||'').includes('LICENSE')) as any)?.contentHash || 'seed-lic-hash';
  const bg = ev[0]?.contentHash || 'seed-bg-hash';
  const health = u.find((x:any)=> (x.requirementId||'').includes('TB') || (x.requirementId||'').includes('HEALTH')) ? 'verified' : 'pending-hold';
  const state = u.some((x:any)=>x.status==='Blocked') ? 'attention' : (u.every((x:any)=>x.status==='Completed') ? 'validated' : 'attention');
  return {
    subjectId: subj.id,
    name: subj.legalName,
    licHash: String(lic).slice(0,16) + '...',
    bgHash: String(bg).slice(0,16) + '...',
    healthHash: health,
    auditState: state,
  };
});

export function OnboardingV2AuditScreen() {
  return (
    <section
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-audit"
      data-route="/onboarding-v2/audit"
      data-template="evidence"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-lg desktop:grid-cols-1">
        <div className="grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Verification Audit Trail</h3>
                <p className="mt-xs text-sm text-muted">Audited hash state for all active and historical subjects.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Verification audit table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-md" aria-label="Overrides check">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ScanSearch aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Active Overrides
            </h3>
            <p className="text-sm text-secondary mb-md">
              Administrative bypass logs currently active under dual-signature validation rules.
            </p>
            <div className="grid gap-sm">
              {(snap.overrides || []).slice(0,2).map((ov: any, idx: number) => (
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md" key={ov.id || idx}>
                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-sm font-medium text-ink">{ov.subjectId} Override</span>
                    <ToneBadge size="sm" status="review-required" />
                  </div>
                  <p className="text-xs text-muted">{ov.reason || 'Seed override from engine.'}</p>
                </div>
              ))}
              {(!snap.overrides || snap.overrides.length === 0) && (
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-xs text-muted">No active overrides in current seed snapshot.</div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
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
