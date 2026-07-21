import { useCallback, useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { AuthApi, type AccessReviewCampaignRow } from '@/auth/api';
import { ToneTag } from '../../components';
import { Button, FormField, Input, Select } from '../../primitives';

/**
 * ADR-0002 §B11 / Phase 6 — access-review campaigns. Cadence is POLICY-OWNED:
 * a campaign cannot be scheduled without a named policyBasis (server-enforced).
 */
const REVIEW_TYPES = [
  { value: 'phi_access_profile', label: 'PHI access profile' },
  { value: 'security_access', label: 'Security access' },
  { value: 'page_access', label: 'Page access' },
  { value: 'signature_authority', label: 'Signature authority' },
  { value: 'delegation', label: 'Delegation' },
  { value: 'privileged_access', label: 'Privileged access' },
];
const TRIGGERS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'role_change', label: 'Role change' },
  { value: 'supervisor_change', label: 'Supervisor change' },
  { value: 'organizational_change', label: 'Organizational change' },
  { value: 'license_or_competency_change', label: 'License/competency change' },
  { value: 'suspension_or_reactivation', label: 'Suspension/reactivation' },
  { value: 'termination', label: 'Termination' },
  { value: 'incident', label: 'Incident' },
  { value: 'audit_finding', label: 'Audit finding' },
];

export function AdminAccessReviewScreen() {
  const { getAccessToken } = useAuth();
  const [campaigns, setCampaigns] = useState<AccessReviewCampaignRow[] | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [form, setForm] = useState({ scope: 'org:careindeed', reviewType: 'phi_access_profile', dueAt: '', policyBasis: '', trigger: 'scheduled', requiredReviewers: '' });

  const load = useCallback(async () => {
    try {
      const res = await AuthApi.listAccessReviewCampaigns(getAccessToken() ?? '');
      setCampaigns(res.campaigns);
    } catch (e) {
      setNote({ kind: 'err', text: e instanceof Error ? e.message : 'Unable to load campaigns.' });
      setCampaigns([]);
    }
  }, [getAccessToken]);
  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    setNote(null);
    try {
      await AuthApi.createAccessReviewCampaign(getAccessToken() ?? '', {
        scope: form.scope,
        reviewType: form.reviewType,
        dueAt: form.dueAt || new Date().toISOString(),
        policyBasis: form.policyBasis,
        trigger: form.trigger,
        requiredReviewers: form.requiredReviewers.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setNote({ kind: 'ok', text: 'Campaign scheduled.' });
      setForm((f) => ({ ...f, policyBasis: '', dueAt: '' }));
      await load();
    } catch (e) {
      setNote({ kind: 'err', text: e instanceof Error ? e.message : 'Create failed (policyBasis is required).' });
    }
  };

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-access-review" data-route="/admin/access-review" data-template="matrix">
      <div className="sr-only"><h1>Access Review</h1></div>
      <header className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
        <div className="flex items-center gap-sm">
          <CalendarClock aria-hidden className="h-icon-md w-icon-md text-brand-teal" />
          <h1 className="text-xl font-medium text-brand-teal-deep">Access review campaigns</h1>
        </div>
        <p className="mt-xs text-sm text-secondary">Cadence is policy-owned — every campaign requires a named policy basis (e.g. CO-DG-101 §4.2 = annual PHI-access review). The server refuses to schedule one without it.</p>
      </header>

      {note && (
        <div className={`rounded-md border px-md py-sm text-sm ${note.kind === 'ok' ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'}`} role="status">{note.text}</div>
      )}

      <section className="rounded-2xl border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
        <h2 className="mb-md text-h3 font-medium text-ink">Schedule a review</h2>
        <div className="grid gap-md tablet-l:grid-cols-2">
          <FormField label="Scope" required>{(p) => <Input {...p} value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} />}</FormField>
          <FormField label="Review type">{(p) => <Select {...p} options={REVIEW_TYPES} value={form.reviewType} onChange={(e) => setForm((f) => ({ ...f, reviewType: e.target.value }))} />}</FormField>
          <FormField label="Due date">{(p) => <Input {...p} type="date" value={form.dueAt} onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))} />}</FormField>
          <FormField label="Trigger">{(p) => <Select {...p} options={TRIGGERS} value={form.trigger} onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))} />}</FormField>
          <FormField label="Policy basis" required>{(p) => <Input {...p} value={form.policyBasis} onChange={(e) => setForm((f) => ({ ...f, policyBasis: e.target.value }))} placeholder="CO-DG-101 §4.2" />}</FormField>
          <FormField label="Required reviewers (comma-separated)">{(p) => <Input {...p} value={form.requiredReviewers} onChange={(e) => setForm((f) => ({ ...f, requiredReviewers: e.target.value }))} />}</FormField>
        </div>
        <div className="mt-md flex justify-end">
          <Button size="sm" className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95" onClick={() => void create()}>Schedule campaign</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
        <h2 className="text-h3 font-medium text-ink">Scheduled campaigns</h2>
        {!campaigns ? (
          <p className="mt-sm text-sm text-muted">Loading…</p>
        ) : campaigns.length === 0 ? (
          <p className="mt-sm text-sm text-muted">No campaigns scheduled.</p>
        ) : (
          <div className="mt-md overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-glass text-tag uppercase tracking-tag text-muted">
                <tr><th className="px-md py-sm">Type</th><th className="px-md py-sm">Scope</th><th className="px-md py-sm">Due</th><th className="px-md py-sm">Trigger</th><th className="px-md py-sm">Policy basis</th></tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {campaigns.map((c) => (
                  <tr key={c.campaignId}>
                    <td className="px-md py-sm"><ToneTag tone="teal">{c.reviewType}</ToneTag></td>
                    <td className="px-md py-sm text-secondary">{c.scope}</td>
                    <td className="px-md py-sm text-secondary">{c.dueAt.slice(0, 10)}</td>
                    <td className="px-md py-sm text-secondary">{c.trigger}</td>
                    <td className="px-md py-sm text-ink">{c.policyBasis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminAccessReviewScreen;
