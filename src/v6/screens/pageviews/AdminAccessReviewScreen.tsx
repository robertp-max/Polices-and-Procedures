import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, X } from 'lucide-react';
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
  const { getAccessToken, isDemo, status } = useAuth();
  const canOperate = status === 'authenticated' && !isDemo;
  const [campaigns, setCampaigns] = useState<AccessReviewCampaignRow[] | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ scope: 'org:careindeed', reviewType: 'phi_access_profile', dueAt: '', policyBasis: '', trigger: 'scheduled', requiredReviewers: '' });

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setNote({ kind: 'err', text: 'Live access-review campaigns require an authorized administrator session.' });
      setCampaigns([]);
      return;
    }
    try {
      const res = await AuthApi.listAccessReviewCampaigns(token);
      setCampaigns(res.campaigns);
    } catch (e) {
      setNote({ kind: 'err', text: e instanceof Error ? e.message : 'Unable to load campaigns.' });
      setCampaigns([]);
    }
  }, [getAccessToken]);
  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const create = async () => {
    setNote(null);
    if (!form.dueAt || !form.policyBasis.trim()) {
      setNote({ kind: 'err', text: 'Due date and policy basis are required.' });
      return;
    }
    try {
      const token = getAccessToken();
      if (!token) throw new Error('An authorized administrator session is required.');
      await AuthApi.createAccessReviewCampaign(token, {
        scope: form.scope,
        reviewType: form.reviewType,
        dueAt: form.dueAt,
        policyBasis: form.policyBasis,
        trigger: form.trigger,
        requiredReviewers: form.requiredReviewers.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setNote({ kind: 'ok', text: 'Campaign scheduled.' });
      setForm((f) => ({ ...f, policyBasis: '', dueAt: '' }));
      setShowCreate(false);
      await load();
    } catch (e) {
      setNote({ kind: 'err', text: e instanceof Error ? e.message : 'Create failed (policyBasis is required).' });
    }
  };

  const summary = useMemo(() => {
    const now = new Date();
    const dueSoonCutoff = new Date(now);
    dueSoonCutoff.setDate(dueSoonCutoff.getDate() + 30);
    const rows = campaigns ?? [];
    return {
      total: rows.length,
      overdue: rows.filter((campaign) => new Date(campaign.dueAt) < now).length,
      dueSoon: rows.filter((campaign) => {
        const due = new Date(campaign.dueAt);
        return due >= now && due <= dueSoonCutoff;
      }).length,
      policyBased: rows.filter((campaign) => campaign.policyBasis.trim()).length,
    };
  }, [campaigns]);

  const reviewTypeLabel = (value: string) => REVIEW_TYPES.find((type) => type.value === value)?.label ?? value;
  const triggerLabel = (value: string) => TRIGGERS.find((trigger) => trigger.value === value)?.label ?? value;

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-access-review" data-route="/admin/access-review" data-template="matrix">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex items-start gap-md">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-tone-teal-bg text-brand-teal">
            <CalendarClock aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-light text-brand-teal-deep">Policy-owned review schedule</h2>
            <p className="mt-xs max-w-[780px] text-xs font-light leading-relaxed text-muted">Every campaign needs a named policy basis. The system does not invent a universal quarterly cadence.</p>
          </div>
        </div>
        <Button size="sm" disabled={!canOperate} className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 disabled:opacity-50" onClick={() => setShowCreate((open) => !open)}>
          <span className="inline-flex items-center gap-xs">{showCreate ? <X aria-hidden className="h-4 w-4" /> : <Plus aria-hidden className="h-4 w-4" />}{showCreate ? 'Close form' : 'Schedule review'}</span>
        </Button>
      </div>

      {note && (
        <div className={`rounded-md border px-md py-sm text-sm ${note.kind === 'ok' ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'}`} role="status">{note.text}</div>
      )}

      <div className="grid gap-md tablet-l:grid-cols-4" aria-label="Access review summary">
        {([
          ['Campaigns', summary.total, 'Scheduled with policy basis'],
          ['Due in 30 days', summary.dueSoon, 'Upcoming review work'],
          ['Overdue', summary.overdue, 'Needs follow-up'],
          ['Policy basis', summary.policyBased, 'Named authority recorded'],
        ] as const).map(([label, value, detail]) => (
          <article className="rounded-[22px] bg-white p-lg shadow-[0_12px_32px_rgba(0,47,48,0.06)]" key={label}>
            <p className="text-2xl font-light text-brand-orange">{campaigns ? value : '—'}</p>
            <p className="mt-sm text-sm font-medium text-brand-teal-deep">{label}</p>
            <p className="mt-xs text-[11px] font-light text-muted">{detail}</p>
          </article>
        ))}
      </div>

      {showCreate && <section className="rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]">
        <div className="mb-lg">
          <h2 className="text-h3 font-medium text-brand-teal-deep">Schedule a review</h2>
          <p className="mt-xs text-xs font-light text-muted">Scope, due date, trigger, reviewers, and policy authority become part of the campaign record.</p>
        </div>
        <div className="grid gap-md tablet-l:grid-cols-2">
          <FormField label="Scope" required>{(p) => <Input {...p} value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} />}</FormField>
          <FormField label="Review type">{(p) => <Select {...p} options={REVIEW_TYPES} value={form.reviewType} onChange={(e) => setForm((f) => ({ ...f, reviewType: e.target.value }))} />}</FormField>
          <FormField label="Due date" required>{(p) => <Input {...p} type="date" value={form.dueAt} onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))} />}</FormField>
          <FormField label="Trigger">{(p) => <Select {...p} options={TRIGGERS} value={form.trigger} onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))} />}</FormField>
          <FormField label="Policy basis" required>{(p) => <Input {...p} value={form.policyBasis} onChange={(e) => setForm((f) => ({ ...f, policyBasis: e.target.value }))} placeholder="CO-DG-101 §4.2" />}</FormField>
          <FormField label="Required reviewers (comma-separated)">{(p) => <Input {...p} value={form.requiredReviewers} onChange={(e) => setForm((f) => ({ ...f, requiredReviewers: e.target.value }))} />}</FormField>
        </div>
        <div className="mt-lg flex justify-end gap-sm">
          <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button size="sm" disabled={!form.dueAt || !form.policyBasis.trim()} className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 disabled:opacity-50" onClick={() => void create()}>Schedule campaign</Button>
        </div>
      </section>}

      <section className="rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h2 className="text-h3 font-medium text-brand-teal-deep">Scheduled campaigns</h2>
            <p className="mt-xs text-xs font-light text-muted">Review timing is visible beside the exact policy basis used to create it.</p>
          </div>
          {campaigns?.length ? <ToneTag tone="teal">{campaigns.length} total</ToneTag> : null}
        </div>
        {!campaigns ? (
          <p className="mt-sm text-sm text-muted">Loading…</p>
        ) : campaigns.length === 0 ? (
          <div className="mt-lg rounded-2xl bg-surface p-xl text-center">
            <p className="text-sm font-medium text-ink">No campaigns scheduled</p>
            <p className="mt-xs text-xs font-light text-muted">Create one only when you can name the policy authority and accountable reviewers.</p>
          </div>
        ) : (
          <div className="mt-lg overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-glass text-tag uppercase tracking-tag text-muted">
                <tr><th className="px-md py-sm">Review</th><th className="px-md py-sm">Scope &amp; authority</th><th className="px-md py-sm">Due</th><th className="px-md py-sm">Trigger</th><th className="px-md py-sm">Reviewers</th></tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {campaigns.map((c) => (
                  <tr key={c.campaignId}>
                    <td className="px-md py-md"><span className="font-medium text-ink">{reviewTypeLabel(c.reviewType)}</span></td>
                    <td className="px-md py-md"><span className="block text-secondary">{c.scope}</span><span className="mt-xs block text-[11px] font-medium text-brand-teal">{c.policyBasis}</span></td>
                    <td className="px-md py-md"><ToneTag tone={new Date(c.dueAt) < new Date() ? 'orange' : 'slate'}>{c.dueAt.slice(0, 10)}</ToneTag></td>
                    <td className="px-md py-md text-secondary">{triggerLabel(c.trigger)}</td>
                    <td className="px-md py-md text-secondary">{c.requiredReviewers.length ? c.requiredReviewers.join(', ') : 'Not assigned'}</td>
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
