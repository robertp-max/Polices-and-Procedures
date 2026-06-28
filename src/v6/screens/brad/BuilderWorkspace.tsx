import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, KeyRound, ShieldCheck, Users, FileText, Boxes, Cloud, ListChecks,
  ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Lock,
} from 'lucide-react';
import { bradApi, type SuperAdminMe, type GeneratedObject, type CloudPlan, type MassAddSummary } from './bradApi';
import { REUSABLE_REPORT_TYPES } from './builderReportTypes';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad Builder (Super Admin only). Server re-verifies Super Admin on EVERY
   call; this page also hides itself for non-Super-Admins. Risky writes require
   an explicit "Super Admin confirmation" checkbox. Beta: reviewable + removable.
   ═══════════════════════════════════════════════════════════════════════════ */

const inputCls = 'w-full rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-3 py-2 text-sm text-ink outline-none focus:border-brand-teal focus-visible:shadow-focus';
const labelCls = 'grid gap-1 text-xs font-medium text-muted';
const btnPrimary = 'inline-flex items-center gap-2 rounded-lg bg-brand-teal px-lg py-2 text-sm font-medium text-on-brand transition hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50';

type WizardId = 'otp' | 'permission' | 'role' | 'mass-add' | 'reports' | 'component' | 'cloud' | 'pending';

const TILES: Array<{ id: WizardId; label: string; Icon: typeof Wrench; desc: string }> = [
  { id: 'otp', label: 'Generate OTP', Icon: KeyRound, desc: 'Issue a secure, expiring, one-time password.' },
  { id: 'permission', label: 'Create Permission', Icon: ShieldCheck, desc: 'Draft a new permission object.' },
  { id: 'role', label: 'Create Role / Group', Icon: Users, desc: 'Draft a role / permission group.' },
  { id: 'mass-add', label: 'Mass Add Users', Icon: Users, desc: 'Validate + draft a user import (dry-run first).' },
  { id: 'reports', label: 'Build Reusable Reports', Icon: FileText, desc: 'Define a versioned report template.' },
  { id: 'component', label: 'Build New Component', Icon: Boxes, desc: 'Draft a component request spec.' },
  { id: 'cloud', label: 'Update Google Cloud', Icon: Cloud, desc: 'Allowlisted, dry-run-first cloud changes.' },
  { id: 'pending', label: 'Review Pending Builder Changes', Icon: ListChecks, desc: 'Builder-created objects + audit trail.' },
];

export default function BuilderWorkspace() {
  const navigate = useNavigate();
  const [me, setMe] = useState<SuperAdminMe | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [wizard, setWizard] = useState<WizardId | null>(null);

  useEffect(() => {
    void bradApi.me().then(setMe).catch(() => setMe(null)).finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <div className="grid place-items-center py-2xl text-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  // Client-side gate (the server ALSO blocks every /builder route with 403).
  if (!me?.isSuperAdmin) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-tone-orange-border bg-tone-orange-bg p-xl text-center">
        <Lock aria-hidden className="mx-auto h-8 w-8 text-brand-orange" />
        <h1 className="mt-md text-h3 font-medium text-ink">Access restricted</h1>
        <p className="mt-sm text-sm text-tone-orange-text">Brad Builder is available to approved Super Admin users only. {me?.reason ? `(${me.reason})` : ''}</p>
        <button type="button" onClick={() => navigate('/iadministrator')} className="mt-lg inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-lg py-2 text-sm font-medium text-ink hover:bg-tone-teal-bg">
          <ArrowLeft className="h-4 w-4" /> Back to Brad
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-xl font-light">
      <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-lg py-md shadow-rest">
        <div className="flex items-center gap-md">
          <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-brand-orange"><Wrench aria-hidden className="h-icon-md w-icon-md" /></span>
          <div>
            <h1 className="text-base font-medium text-ink">Brad Builder</h1>
            <p className="text-sm text-muted">Super Admin tools for users, permissions, reusable reports, OTPs, cloud updates, and component requests.</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/iadministrator')} className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-1.5 text-xs font-medium text-ink hover:bg-tone-teal-bg">
          <ArrowLeft className="h-4 w-4" /> Back to Brad
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-2 text-xs text-tone-orange-text">
        <AlertTriangle aria-hidden className="mt-0.5 h-icon-sm w-icon-sm shrink-0" />
        <span><strong>Builder Beta</strong> — available for review. Subject to modification or removal. Builder actions are guarded; Brad can draft, validate, preview, and apply allowlisted Super Admin changes on this review branch.</span>
      </div>

      {/* Wizard tiles */}
      <div className="grid grid-cols-1 gap-md tablet-p:grid-cols-2 desktop:grid-cols-4">
        {TILES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setWizard(t.id)}
            className={`flex min-h-[112px] flex-col justify-between gap-md rounded-lg border p-lg text-left shadow-rest transition hover:-translate-y-0.5 hover:border-brand-teal hover:shadow-hover focus-visible:outline-none focus-visible:shadow-focus motion-reduce:hover:translate-y-0 ${wizard === t.id ? 'border-brand-teal bg-tone-teal-bg' : 'border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset'}`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-tone-teal-bg text-brand-teal"><t.Icon aria-hidden className="h-icon-md w-icon-md" /></span>
            <span><span className="block text-sm font-medium text-ink">{t.label}</span><span className="mt-0.5 block text-xs text-muted">{t.desc}</span></span>
          </button>
        ))}
      </div>

      {/* Selected wizard */}
      {wizard && (
        <div className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          {wizard === 'otp' && <OtpWizard />}
          {wizard === 'permission' && <PermissionWizard />}
          {wizard === 'role' && <RoleWizard />}
          {wizard === 'mass-add' && <MassAddWizard />}
          {wizard === 'reports' && <ReportTemplateWizard />}
          {wizard === 'component' && <ComponentWizard />}
          {wizard === 'cloud' && <CloudWizard />}
          {wizard === 'pending' && <PendingWizard />}
        </div>
      )}
    </div>
  );
}

/* ─── shared bits ────────────────────────────────────────────────────────────*/

function WizardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-md">
      <h2 className="text-h3 font-medium text-ink">{title}</h2>
      {children}
    </div>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return <div className="flex items-start gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-2 text-sm text-tone-orange-text"><AlertTriangle className="mt-0.5 h-icon-sm w-icon-sm shrink-0" /> {msg}</div>;
}
function OkNote({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-2 rounded-md border border-tone-teal-border bg-tone-teal-bg px-md py-2 text-sm text-brand-teal-deep"><CheckCircle2 className="mt-0.5 h-icon-sm w-icon-sm shrink-0" /> <div>{children}</div></div>;
}

function useSubmit<T>() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const run = useCallback(async (fn: () => Promise<T>) => {
    setBusy(true); setError(null);
    try { setResult(await fn()); } catch (e) { setError((e as Error).message); setResult(null); } finally { setBusy(false); }
  }, []);
  return { busy, error, result, run, setError };
}

/* ─── Generate OTP ───────────────────────────────────────────────────────────*/
function OtpWizard() {
  const [targetUserId, setTarget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [ttlMinutes, setTtl] = useState(15);
  const [deliveryMethod, setDelivery] = useState('manual-copy');
  const [confirm, setConfirm] = useState(false);
  const s = useSubmit<{ otpId: string; otp: string; expiresAt: string; notice: string }>();
  return (
    <WizardShell title="Generate OTP">
      <p className="text-sm text-muted">OTPs are server-generated (not model-generated), cryptographically secure, expiring, one-time, hashed at rest, and never logged. The value is shown once.</p>
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Target user (id or email)<input className={inputCls} value={targetUserId} onChange={(e) => setTarget(e.target.value)} placeholder="usr-... or name@careindeed.com" /></label>
        <label className={labelCls}>Purpose<input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="password reset" /></label>
        <label className={labelCls}>Expiration (minutes)<input type="number" min={1} max={1440} className={inputCls} value={ttlMinutes} onChange={(e) => setTtl(Number(e.target.value))} /></label>
        <label className={labelCls}>Delivery<select className={inputCls} value={deliveryMethod} onChange={(e) => setDelivery(e.target.value)}><option value="manual-copy">Manual copy</option><option value="email">Email (if wired)</option></select></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && (
        <OkNote>
          <div className="font-medium">{s.result.notice}</div>
          <div className="mt-1 font-mono text-base text-ink">OTP: {s.result.otp}</div>
          <div className="mt-1 text-xs text-muted">id {s.result.otpId} · expires {new Date(s.result.expiresAt).toLocaleString()}</div>
        </OkNote>
      )}
      <div><button type="button" disabled={s.busy || !confirm || !targetUserId.trim() || !purpose.trim()} className={btnPrimary} onClick={() => s.run(() => bradApi.builder.otp({ targetUserId, purpose, ttlMinutes, deliveryMethod, confirm }))}>{s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Generate OTP</button></div>
    </WizardShell>
  );
}

/* ─── Create Permission ──────────────────────────────────────────────────────*/
function PermissionWizard() {
  const [f, setF] = useState({ key: '', displayName: '', description: '', scope: 'agency', riskLevel: 'low', allowedRoles: '', active: false });
  const [confirm, setConfirm] = useState(false);
  const s = useSubmit<{ object: GeneratedObject }>();
  return (
    <WizardShell title="Create Permission">
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Permission key<input className={inputCls} value={f.key} onChange={(e) => setF({ ...f, key: e.target.value })} placeholder="domain.action" /></label>
        <label className={labelCls}>Display name<input className={inputCls} value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Description<input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label className={labelCls}>Scope<input className={inputCls} value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} /></label>
        <label className={labelCls}>Risk level<select className={inputCls} value={f.riskLevel} onChange={(e) => setF({ ...f, riskLevel: e.target.value })}><option>low</option><option>medium</option><option>high</option></select></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Allowed roles (comma-separated)<input className={inputCls} value={f.allowedRoles} onChange={(e) => setF({ ...f, allowedRoles: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="h-4 w-4 accent-brand-teal" /> Active</label>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && <OkNote>Permission draft created: <code>{s.result.object.metadata.object_id}</code> (status {s.result.object.metadata.write_status}).</OkNote>}
      <div><button type="button" disabled={s.busy || !confirm || !f.key.trim() || !f.displayName.trim()} className={btnPrimary} onClick={() => s.run(() => bradApi.builder.createPermission({ ...f, allowedRoles: f.allowedRoles.split(',').map((x) => x.trim()).filter(Boolean), confirm }))}>{s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Create permission</button></div>
    </WizardShell>
  );
}

/* ─── Create Role / Group ────────────────────────────────────────────────────*/
function RoleWizard() {
  const [f, setF] = useState({ name: '', description: '', permissions: '', defaultRoute: '/iadministrator', accessTier: 'standard', effectiveDate: '' });
  const [confirm, setConfirm] = useState(false);
  const s = useSubmit<{ object: GeneratedObject; permissionDiff: { added: string[]; removed: string[] } }>();
  return (
    <WizardShell title="Create Role / Permission Group">
      <p className="text-sm text-muted">Roles cannot grant Super Admin / Owner / Editor and cannot self-promote the current user.</p>
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Name<input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className={labelCls}>Access tier<input className={inputCls} value={f.accessTier} onChange={(e) => setF({ ...f, accessTier: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Description<input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Permissions (comma-separated)<input className={inputCls} value={f.permissions} onChange={(e) => setF({ ...f, permissions: e.target.value })} placeholder="policy.read, evidence.read" /></label>
        <label className={labelCls}>Default landing route<input className={inputCls} value={f.defaultRoute} onChange={(e) => setF({ ...f, defaultRoute: e.target.value })} /></label>
        <label className={labelCls}>Effective date<input type="date" className={inputCls} value={f.effectiveDate} onChange={(e) => setF({ ...f, effectiveDate: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && <OkNote>Role draft created: <code>{s.result.object.metadata.object_id}</code>. Added permissions: {s.result.permissionDiff.added.join(', ') || 'none'}.</OkNote>}
      <div><button type="button" disabled={s.busy || !confirm || !f.name.trim()} className={btnPrimary} onClick={() => s.run(() => bradApi.builder.createRole({ ...f, permissions: f.permissions.split(',').map((x) => x.trim()).filter(Boolean), confirm }))}>{s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Create role draft</button></div>
    </WizardShell>
  );
}

/* ─── Mass Add Users ─────────────────────────────────────────────────────────*/
function MassAddWizard() {
  const [csv, setCsv] = useState('firstName,lastName,email,role,department\nJane,Rivera,jrivera@careindeed.com,clinician,Nursing\n');
  const [confirm, setConfirm] = useState(false);
  const dry = useSubmit<{ summary: MassAddSummary }>();
  const commit = useSubmit<{ object: GeneratedObject; summary: MassAddSummary; blocker: string }>();

  function parseRows() {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
      return row;
    });
  }
  const summary = commit.result?.summary ?? dry.result?.summary;
  return (
    <WizardShell title="Mass Add Users">
      <p className="text-sm text-muted">Paste CSV with headers: firstName, lastName, email, role, department, startDate, supervisor. Dry-run first. Super Admin / elevated roles can never be created via mass add. Real account creation is not wired — a draft import object is recorded.</p>
      <textarea className={`${inputCls} font-mono`} rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={dry.busy} className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-lg py-2 text-sm font-medium text-ink hover:bg-tone-teal-bg disabled:opacity-50" onClick={() => dry.run(() => bradApi.builder.massAddDryRun(parseRows()))}>{dry.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />} Dry-run</button>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
        <button type="button" disabled={commit.busy || !confirm} className={btnPrimary} onClick={() => commit.run(() => bradApi.builder.massAddCommit(parseRows(), confirm))}>{commit.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Create import draft</button>
      </div>
      {dry.error && <ErrorNote msg={dry.error} />}
      {commit.error && <ErrorNote msg={commit.error} />}
      {summary && (
        <div className="grid gap-2 rounded-md border border-hairline bg-canvas p-md text-sm text-ink">
          <div className="flex flex-wrap gap-4 text-xs"><span>Valid: <strong className="text-brand-teal">{summary.valid}</strong></span><span>Duplicates: <strong>{summary.duplicates}</strong></span><span>Invalid: <strong>{summary.invalid}</strong></span><span>Risky: <strong className="text-brand-orange">{summary.risky}</strong></span><span>Total: {summary.total}</span></div>
          <div className="grid gap-1">
            {summary.rows.map((r) => (
              <div key={r.index} className="text-xs text-muted">{r.email || '(no email)'} · {r.role || '(no role)'} {r.issues.length ? <span className="text-brand-orange">— {r.issues.join('; ')}</span> : <span className="text-brand-teal">— ok</span>}</div>
            ))}
          </div>
        </div>
      )}
      {commit.result && <OkNote>Import draft created: <code>{commit.result.object.metadata.object_id}</code>. {commit.result.blocker}</OkNote>}
    </WizardShell>
  );
}

/* ─── Build Reusable Reports ─────────────────────────────────────────────────*/
function ReportTemplateWizard() {
  const [f, setF] = useState({ name: '', reportType: REUSABLE_REPORT_TYPES[0] as string, description: '', sourceDomains: '', outputFormat: 'pdf', owner: '', accessRoles: '', status: 'draft' });
  const [confirm, setConfirm] = useState(false);
  const s = useSubmit<{ object: GeneratedObject; version: number }>();
  const list = useSubmit<{ templates: GeneratedObject[] }>();
  useEffect(() => { void list.run(() => bradApi.builder.listReportTemplates()); }, []);
  return (
    <WizardShell title="Build Reusable Reports">
      <p className="text-sm text-muted">Templates are versioned Brad-generated objects with source traceability. Each run creates a separate output object; canonical reports are never overwritten.</p>
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Report name<input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className={labelCls}>Report type<select className={inputCls} value={f.reportType} onChange={(e) => setF({ ...f, reportType: e.target.value })}>{REUSABLE_REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Description<input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label className={labelCls}>Source domains (comma-separated)<input className={inputCls} value={f.sourceDomains} onChange={(e) => setF({ ...f, sourceDomains: e.target.value })} /></label>
        <label className={labelCls}>Output format<select className={inputCls} value={f.outputFormat} onChange={(e) => setF({ ...f, outputFormat: e.target.value })}><option>pdf</option><option>csv</option><option>json</option></select></label>
        <label className={labelCls}>Owner<input className={inputCls} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} /></label>
        <label className={labelCls}>Access roles (comma-separated)<input className={inputCls} value={f.accessRoles} onChange={(e) => setF({ ...f, accessRoles: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && <OkNote>Template created: <code>{s.result.object.metadata.object_id}</code> (v{s.result.version}).</OkNote>}
      <div><button type="button" disabled={s.busy || !confirm || !f.name.trim()} className={btnPrimary} onClick={() => s.run(async () => { const r = await bradApi.builder.createReportTemplate({ ...f, sourceDomains: f.sourceDomains.split(',').map((x) => x.trim()).filter(Boolean), accessRoles: f.accessRoles.split(',').map((x) => x.trim()).filter(Boolean), confirm }); await list.run(() => bradApi.builder.listReportTemplates()); return r; })}>{s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Create template</button></div>
      {list.result && list.result.templates.length > 0 && (
        <div className="grid gap-1 rounded-md border border-hairline bg-canvas p-md text-xs text-muted">
          <div className="font-medium text-ink">Template library ({list.result.templates.length})</div>
          {list.result.templates.map((t) => <div key={t.metadata.object_id}>{(t.content as { name?: string; reportType?: string; version?: number }).name} · {(t.content as { reportType?: string }).reportType} · v{(t.content as { version?: number }).version}</div>)}
        </div>
      )}
    </WizardShell>
  );
}

/* ─── Build New Component ─────────────────────────────────────────────────────*/
function ComponentWizard() {
  const [f, setF] = useState({ componentName: '', targetArea: '', purpose: '', dataSources: '', permissionsNeeded: '', actionsAllowed: '', uiNotes: '', riskLevel: 'low', acceptanceCriteria: '' });
  const [confirm, setConfirm] = useState(false);
  const s = useSubmit<{ object: GeneratedObject }>();
  return (
    <WizardShell title="Build New Component">
      <p className="text-sm text-muted">Creates a component REQUEST spec only. Brad never modifies core UI files, auto-commits, deploys, or creates production routes from Builder.</p>
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Component name<input className={inputCls} value={f.componentName} onChange={(e) => setF({ ...f, componentName: e.target.value })} /></label>
        <label className={labelCls}>Target area / page<input className={inputCls} value={f.targetArea} onChange={(e) => setF({ ...f, targetArea: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Purpose<input className={inputCls} value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} /></label>
        <label className={labelCls}>Data sources (comma-separated)<input className={inputCls} value={f.dataSources} onChange={(e) => setF({ ...f, dataSources: e.target.value })} /></label>
        <label className={labelCls}>Permissions needed (comma-separated)<input className={inputCls} value={f.permissionsNeeded} onChange={(e) => setF({ ...f, permissionsNeeded: e.target.value })} /></label>
        <label className={labelCls}>Risk level<select className={inputCls} value={f.riskLevel} onChange={(e) => setF({ ...f, riskLevel: e.target.value })}><option>low</option><option>medium</option><option>high</option></select></label>
        <label className={labelCls}>Actions allowed (comma-separated)<input className={inputCls} value={f.actionsAllowed} onChange={(e) => setF({ ...f, actionsAllowed: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>UI notes<input className={inputCls} value={f.uiNotes} onChange={(e) => setF({ ...f, uiNotes: e.target.value })} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Acceptance criteria (comma-separated)<input className={inputCls} value={f.acceptanceCriteria} onChange={(e) => setF({ ...f, acceptanceCriteria: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && <OkNote>Component spec created: <code>{s.result.object.metadata.object_id}</code>.</OkNote>}
      <div><button type="button" disabled={s.busy || !confirm || !f.componentName.trim()} className={btnPrimary} onClick={() => s.run(() => bradApi.builder.createComponentSpec({ ...f, dataSources: f.dataSources.split(',').map((x) => x.trim()).filter(Boolean), permissionsNeeded: f.permissionsNeeded.split(',').map((x) => x.trim()).filter(Boolean), actionsAllowed: f.actionsAllowed.split(',').map((x) => x.trim()).filter(Boolean), acceptanceCriteria: f.acceptanceCriteria.split(',').map((x) => x.trim()).filter(Boolean), confirm }))}>{s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Boxes className="h-4 w-4" />} Create component spec</button></div>
    </WizardShell>
  );
}

/* ─── Update Google Cloud ────────────────────────────────────────────────────*/
const CLOUD_OP_TYPES = ['cloudrun.scaling.update', 'cloudrun.env.update', 'cloudrun.secret.attach', 'gcp.api.enable', 'deploy.labels.update', 'secretmanager.brad_entry.upsert', 'artifactregistry.brad_metadata.upsert'];
function CloudWizard() {
  const [type, setType] = useState(CLOUD_OP_TYPES[0]);
  const [resource, setResource] = useState('feature-brad-builder-beta');
  const [description, setDescription] = useState('set min instances 0 / max 2');
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(2);
  const [confirm, setConfirm] = useState(false);
  const dry = useSubmit<{ plan: CloudPlan }>();
  const propose = useSubmit<{ object: GeneratedObject; plan: CloudPlan; approvalId: string | null }>();
  const ops = [{ type, resource, description, params: { min, max } }];
  const plan = propose.result?.plan ?? dry.result?.plan;
  return (
    <WizardShell title="Update Google Cloud">
      <div className="flex items-start gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-2 text-xs text-tone-orange-text"><AlertTriangle className="mt-0.5 h-icon-sm w-icon-sm shrink-0" /><span>Google Cloud Builder is Beta. Changes are subject to review, modification, or removal. Only allowlisted low-risk dev/app settings. Destructive/expensive operations are rejected. Min instances default 0; max default low.</span></div>
      <div className="grid gap-md tablet-p:grid-cols-2">
        <label className={labelCls}>Operation type<select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>{CLOUD_OP_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={labelCls}>Resource (service / secret)<input className={inputCls} value={resource} onChange={(e) => setResource(e.target.value)} /></label>
        <label className={`${labelCls} tablet-p:col-span-2`}>Description (no secret values)<input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className={labelCls}>Min instances<input type="number" min={0} className={inputCls} value={min} onChange={(e) => setMin(Number(e.target.value))} /></label>
        <label className={labelCls}>Max instances<input type="number" min={1} className={inputCls} value={max} onChange={(e) => setMax(Number(e.target.value))} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={dry.busy} className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-lg py-2 text-sm font-medium text-ink hover:bg-tone-teal-bg disabled:opacity-50" onClick={() => dry.run(() => bradApi.builder.cloudDryRun(ops))}>{dry.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />} Dry-run (no mutation)</button>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4 accent-brand-teal" /> Super Admin confirmation</label>
        <button type="button" disabled={propose.busy || !confirm} className={btnPrimary} onClick={() => propose.run(() => bradApi.builder.proposeCloud(ops))}>{propose.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Propose change set</button>
      </div>
      {dry.error && <ErrorNote msg={dry.error} />}
      {propose.error && <ErrorNote msg={propose.error} />}
      {plan && (
        <div className="grid gap-1 rounded-md border border-hairline bg-canvas p-md text-xs">
          <div>Allowlist: <strong className={plan.allowlistValid ? 'text-brand-teal' : 'text-brand-orange'}>{plan.allowlistValid ? 'VALID' : 'INVALID'}</strong> · risk: <strong>{plan.riskLevel}</strong></div>
          {plan.disallowedReasons.length > 0 && <div className="text-brand-orange">Blocked: {plan.disallowedReasons.join('; ')}</div>}
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-ink">{plan.dryRunSummary.join('\n')}</pre>
        </div>
      )}
      {propose.result && <OkNote>Cloud change set object <code>{propose.result.object.metadata.object_id}</code> created (status {propose.result.object.metadata.write_status}). {propose.result.approvalId ? 'Awaiting Super Admin approval before any apply.' : ''}</OkNote>}
    </WizardShell>
  );
}

/* ─── Review Pending Builder Changes ─────────────────────────────────────────*/
function PendingWizard() {
  const s = useSubmit<{ objects: GeneratedObject[]; approvals: unknown[]; audit: unknown[] }>();
  useEffect(() => { void s.run(() => bradApi.builder.pending()); }, []);
  return (
    <WizardShell title="Review Pending Builder Changes">
      <button type="button" className="w-fit inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-1.5 text-xs font-medium text-ink hover:bg-tone-teal-bg" onClick={() => s.run(() => bradApi.builder.pending())}><ListChecks className="h-4 w-4" /> Refresh</button>
      {s.error && <ErrorNote msg={s.error} />}
      {s.result && (
        <div className="grid gap-2">
          <div className="text-xs text-muted">{s.result.objects.length} Builder object(s) · {s.result.approvals.length} pending approval(s) · {s.result.audit.length} audit entries.</div>
          {s.result.objects.map((o) => (
            <div key={o.metadata.object_id} className="rounded-md border border-hairline bg-canvas p-md text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-ink">{o.metadata.object_type}</span><span className="rounded-full border border-hairline px-2 py-0.5">{o.metadata.write_status}</span></div>
              <div className="mt-1 text-muted">id {o.metadata.object_id.slice(0, 36)}… · by {o.metadata.requested_by_user_id} · {new Date(o.metadata.generated_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </WizardShell>
  );
}
