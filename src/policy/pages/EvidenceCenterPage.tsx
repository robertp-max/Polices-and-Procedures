/**
 * Evidence Center — demo-ready file system view backed by AWS Phase 1 demo backend.
 *
 * Reads from:
 *   GET  {API_BASE}/events/{event_id}/files
 *   GET  {API_BASE}/files/{evidence_id}/download   (returns presigned URL)
 *   POST {API_BASE}/uploads/init                    (presigned PUT URL)
 *
 * Triplet enforcement: policy_id, workflow_id, event_id are mandatory.
 * No direct S3 listing or hard-coded S3 URLs.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FolderOpen, Download, Upload, RefreshCw, FileText, ShieldCheck,
  Search, AlertCircle, CheckCircle2, Clock, ExternalLink, Info, X, History,
} from 'lucide-react';

// ── Configuration ──────────────────────────────────────────────
// Override at build time with VITE_HHC_API_BASE.
const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

const DEFAULT_EVENT  = 'EVT-DEMO-001';
const DEFAULT_POLICY = 'POL-DEMO-001';
const DEFAULT_WF     = 'WF-DEMO-001';
const DEFAULT_FORM   = 'FRM-DEMO-001';

// Phase-1 actor stub (replace with Cognito JWT later). Read from localStorage so a user
// can self-identify in the demo without an auth flow. Defaults to a Compliance Officer.
function actorHeaders(): Record<string, string> {
  try {
    const id   = localStorage.getItem('hhc_actor_id')   || 'demo-user';
    const role = localStorage.getItem('hhc_actor_role') || 'Compliance Officer';
    return { 'x-hhc-actor-id': id, 'x-hhc-actor-role': role };
  } catch {
    return { 'x-hhc-actor-id': 'demo-user', 'x-hhc-actor-role': 'Compliance Officer' };
  }
}

// ── Types ──────────────────────────────────────────────────────
interface EvidenceFile {
  evidence_id:      string;
  filename:         string;
  policy_id:        string;
  workflow_id:      string;
  event_id:         string;
  form_id:          string | null;
  status:           string;
  signature_status: string | null;
  source_system:    string | null;
  mime_type:        string | null;
  size_bytes:       number | null;
  created_at:       string;
  updated_at:       string;
}

interface AuditEntry {
  ts:            string;
  action:        string;
  actor:         string | null;
  source_system: string | null;
  evidence_id:   string | null;
  upload_id:     string | null;
  before_status: string | null;
  after_status:  string | null;
}

interface ListResponse {
  event_id: string;
  files:    EvidenceFile[];
  audit:    AuditEntry[];
}

interface InitResponse {
  upload_id:          string;
  evidence_id:        string;
  presigned_put_url:  string;
  expires_in_seconds: number;
  required_headers:   Record<string, string>;
  s3_key_raw:         string;
}

interface DownloadResponse {
  evidence_id:        string;
  filename:           string;
  mime_type:          string | null;
  size_bytes:         number | null;
  presigned_get_url:  string;
  expires_in_seconds: number;
}

interface ValidateResponse {
  upload_id:        string;
  evidence_id:      string;
  status:           string;
  sha256:           string;
  size_bytes:       number;
  mime_type:        string;
  s3_key_validated: string;
  idempotent?:      boolean;
}

interface PromoteResponse {
  upload_id:   string;
  evidence_id: string;
  status:      string;
  s3_bucket:   string;
  s3_key:      string;
  sha256:      string | null;
  idempotent?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  PENDING_UPLOAD: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  UPLOADED:       'bg-sky-500/15 text-sky-300 border-sky-500/30',
  VALIDATED:      'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  PROMOTED:          'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  APPROVED_EVIDENCE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  SIGNED:            'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  FAILED:         'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function formatBytes(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTs(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data as { error?: string })?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// ── Component ──────────────────────────────────────────────────
export function EvidenceCenterPage() {
  const [eventId,    setEventId]    = useState(DEFAULT_EVENT);
  const [eventInput, setEventInput] = useState(DEFAULT_EVENT);
  const [search,     setSearch]     = useState('');
  const [filterFormId,     setFilterFormId]     = useState('');
  const [filterPolicyId,   setFilterPolicyId]   = useState('');
  const [filterEvidenceId, setFilterEvidenceId] = useState('');
  const [files,   setFiles] = useState<EvidenceFile[]>([]);
  const [audit,   setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [selected, setSelected] = useState<EvidenceFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jsonOrThrow<ListResponse>(
        await fetch(`${API_BASE}/events/${encodeURIComponent(id)}/files`)
      );
      setFiles(data.files || []);
      setAudit(data.audit || []);
    } catch (e) {
      setError((e as Error).message);
      setFiles([]);
      setAudit([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(eventId); }, [eventId, load]);

  const filtered = useMemo(() => {
    let result = files;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((f) =>
        [f.filename, f.policy_id, f.workflow_id, f.event_id, f.form_id || '', f.status, f.source_system || '', f.evidence_id]
          .join(' ').toLowerCase().includes(q)
      );
    }
    const fid = filterFormId.trim().toLowerCase();
    if (fid) result = result.filter((f) => (f.form_id || '').toLowerCase().includes(fid));
    const pid = filterPolicyId.trim().toLowerCase();
    if (pid) result = result.filter((f) => f.policy_id.toLowerCase().includes(pid));
    const eid = filterEvidenceId.trim().toLowerCase();
    if (eid) result = result.filter((f) => f.evidence_id.toLowerCase().includes(eid));
    return result;
  }, [files, search, filterFormId, filterPolicyId, filterEvidenceId]);

  const onSelectEvent = () => {
    const v = eventInput.trim();
    if (v && v !== eventId) setEventId(v);
    else load(eventId);
  };

  const onDownload = async (f: EvidenceFile) => {
    try {
      const data = await jsonOrThrow<DownloadResponse>(
        await fetch(
          `${API_BASE}/files/${encodeURIComponent(f.evidence_id)}/download?event_id=${encodeURIComponent(f.event_id)}`,
          { headers: actorHeaders() }
        )
      );
      window.open(data.presigned_get_url, '_blank', 'noopener');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const onFileChosen = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    setError(null);
    try {
      const ah = actorHeaders();
      // 1. /uploads/init  → metadata + presigned PUT
      setUploadMsg(`Initiating upload…`);
      const init = await jsonOrThrow<InitResponse>(
        await fetch(`${API_BASE}/uploads/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...ah },
          body: JSON.stringify({
            policy_id:     DEFAULT_POLICY,
            workflow_id:   DEFAULT_WF,
            event_id:      eventId,
            form_id:       DEFAULT_FORM,
            filename:      file.name,
            mime_type:     file.type || 'application/octet-stream',
            size_bytes:    file.size,
            source_system: 'hhc',
          }),
        })
      );

      // 2. PUT bytes to S3 (presigned)
      setUploadMsg(`Uploading ${file.name}…`);
      const put = await fetch(init.presigned_put_url, {
        method: 'PUT',
        headers: init.required_headers,
        body: file,
      });
      if (!put.ok) throw new Error(`S3 PUT failed: ${put.status}`);

      // 3. /uploads/{id}/validate → hash + size/MIME check + copy to validated/
      setUploadMsg(`Validating…`);
      const val = await jsonOrThrow<ValidateResponse>(
        await fetch(`${API_BASE}/uploads/${encodeURIComponent(init.upload_id)}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...ah },
          body: JSON.stringify({ event_id: eventId }),
        })
      );

      // 4. /uploads/{id}/promote → copy to prod bucket, status APPROVED_EVIDENCE
      setUploadMsg(`Promoting to evidence…`);
      const prm = await jsonOrThrow<PromoteResponse>(
        await fetch(`${API_BASE}/uploads/${encodeURIComponent(init.upload_id)}/promote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...ah },
          body: JSON.stringify({ event_id: eventId }),
        })
      );

      setUploadMsg(
        `✓ ${file.name} → ${prm.status} (evidence_id=${prm.evidence_id}, sha256=${(val.sha256 || '').slice(0, 12)}…)`
      );
      await load(eventId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e14] text-slate-200">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <FolderOpen size={22} className="text-[#FFC107]" />
          <h1 className="text-xl font-semibold tracking-tight">Evidence Center</h1>
          <span className="ml-2 text-xs text-slate-400">
            Phase 1 demo backend · us-west-1
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400 max-w-3xl">
          Every file is bound to a <span className="text-slate-200 font-medium">policy / workflow / event</span> triplet
          and read through the API — never directly from S3.
        </p>
      </div>

      {/* ── Main grid: left = browser+table+audit, right = guidance ── */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left column */}
        <div className="col-span-12 xl:col-span-9 flex flex-col overflow-hidden">
          {/* Filter bar */}
          <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-500">Event ID</label>
              <input
                title="Event ID filter"
                aria-label="Event ID"
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectEvent()}
                placeholder="EVT-..."
                className="bg-[#0f141c] border border-white/10 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-[#FFC107]/60"
              />
              <button
                onClick={onSelectEvent}
                className="px-3 py-1 text-sm rounded bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Load
              </button>
            </div>

            {/* Narrow client-side filters — applied to the already-loaded files */}
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-500">Form</label>
              <input
                title="Filter by Form ID"
                aria-label="Filter by Form ID"
                value={filterFormId}
                onChange={(e) => setFilterFormId(e.target.value)}
                placeholder="GV-FM-017…"
                className="bg-[#0f141c] border border-white/10 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:border-[#FFC107]/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-500">Policy</label>
              <input
                title="Filter by Policy ID"
                aria-label="Filter by Policy ID"
                value={filterPolicyId}
                onChange={(e) => setFilterPolicyId(e.target.value)}
                placeholder="GV-OG-005…"
                className="bg-[#0f141c] border border-white/10 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:border-[#FFC107]/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-500">Evidence ID</label>
              <input
                title="Filter by Evidence ID"
                aria-label="Filter by Evidence ID"
                value={filterEvidenceId}
                onChange={(e) => setFilterEvidenceId(e.target.value)}
                placeholder="EVD-…"
                className="bg-[#0f141c] border border-white/10 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:border-[#FFC107]/60"
              />
            </div>
            {(filterFormId || filterPolicyId || filterEvidenceId) && (
              <button
                onClick={() => { setFilterFormId(''); setFilterPolicyId(''); setFilterEvidenceId(''); }}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400"
                title="Clear filters"
              >
                ✕ Clear filters
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter files…"
                  className="bg-[#0f141c] border border-white/10 rounded pl-7 pr-2 py-1 text-sm w-56 focus:outline-none focus:border-[#FFC107]/60"
                />
              </div>
              <button
                onClick={() => load(eventId)}
                disabled={loading}
                className="px-2 py-1 text-sm rounded bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={onUploadClick}
                disabled={uploading}
                className="px-3 py-1 text-sm rounded bg-[#FFC107]/15 hover:bg-[#FFC107]/25 border border-[#FFC107]/40 text-[#FFC107] disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload evidence'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                title="Upload evidence file"
                aria-label="Upload evidence file"
                className="hidden"
                onChange={onFileChosen}
              />
            </div>
          </div>

          {/* Inline messages */}
          {(error || uploadMsg) && (
            <div className="px-6 pt-3 space-y-2">
              {error && (
                <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 break-all">{error}</div>
                  <button title="Dismiss error" aria-label="Dismiss error" onClick={() => setError(null)} className="text-rose-300/60 hover:text-rose-300"><X size={14} /></button>
                </div>
              )}
              {uploadMsg && (
                <div className="flex items-start gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 break-all">{uploadMsg}</div>
                  <button title="Dismiss" aria-label="Dismiss" onClick={() => setUploadMsg(null)} className="text-emerald-300/60 hover:text-emerald-300"><X size={14} /></button>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto px-6 pt-4">
            {loading && files.length === 0 ? (
              <div className="text-sm text-slate-500 py-12 text-center">Loading evidence…</div>
            ) : filtered.length === 0 ? (
              <EmptyState eventId={eventId} onUpload={onUploadClick} />
            ) : (
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Filename</th>
                    <th className="text-left px-3 py-2">Policy / Workflow / Event</th>
                    <th className="text-left px-3 py-2">Form</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-left px-3 py-2">Created</th>
                    <th className="text-right px-3 py-2">Size</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr
                      key={f.evidence_id}
                      className="bg-[#0f141c] hover:bg-[#141b25] cursor-pointer border border-white/5"
                      onClick={() => setSelected(f)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
                          <span className="text-slate-100">{f.filename}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">
                        <div>{f.policy_id}</div>
                        <div>{f.workflow_id}</div>
                        <div className="text-slate-300">{f.event_id}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">{f.form_id || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[f.status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>
                          {f.status}
                        </span>
                        {f.signature_status && f.signature_status !== 'NONE' && (
                          <span className="ml-1 text-[10px] text-emerald-300 inline-flex items-center gap-0.5">
                            <ShieldCheck size={10} /> {f.signature_status}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">{f.source_system || '—'}</td>
                      <td className="px-3 py-2 text-xs text-slate-400">{formatTs(f.created_at)}</td>
                      <td className="px-3 py-2 text-xs text-slate-400 text-right">{formatBytes(f.size_bytes)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDownload(f); }}
                          className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 inline-flex items-center gap-1"
                          title="Get presigned download URL"
                        >
                          <Download size={12} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Audit panel */}
          <div className="border-t border-white/5 px-6 py-4 max-h-72 overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <History size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold tracking-tight">Audit log — event {eventId}</h2>
              <span className="text-xs text-slate-500">({audit.length} entries)</span>
            </div>
            {audit.length === 0 ? (
              <div className="text-xs text-slate-500">No audit entries yet for this event.</div>
            ) : (
              <ul className="space-y-1.5">
                {audit.map((a, i) => (
                  <li key={`${a.ts}-${i}`} className="text-xs flex flex-wrap items-center gap-2 bg-[#0f141c] border border-white/5 rounded px-2 py-1.5">
                    <Clock size={11} className="text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400">{formatTs(a.ts)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/30 rounded px-1.5 py-0.5">
                      {a.action}
                    </span>
                    <span className="text-slate-300">{a.actor || 'system'}</span>
                    {a.source_system && <span className="text-slate-500">· {a.source_system}</span>}
                    {a.evidence_id && <span className="text-slate-500">· {a.evidence_id}</span>}
                    {(a.before_status || a.after_status) && (
                      <span className="text-slate-500">
                        {a.before_status || '·'} → <span className="text-slate-300">{a.after_status || '·'}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right contextual guidance */}
        <aside className="hidden xl:flex xl:col-span-3 flex-col border-l border-white/5 bg-[#0c1118] overflow-auto">
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Info size={16} className="text-[#FFC107]" />
                <h3 className="text-sm font-semibold tracking-tight">What is "evidence"?</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Any file that proves a regulated activity happened — QAPI minutes, signed forms,
                competency checklists, training rosters, OASIS lock confirmations.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#FFC107]" />
                <h3 className="text-sm font-semibold tracking-tight">Why the triplet?</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Every artifact is bound to a <code className="text-slate-200">policy_id</code>,
                {' '}<code className="text-slate-200">workflow_id</code>, and
                {' '}<code className="text-slate-200">event_id</code>. A surveyor can pull a single
                event packet and reconstruct the entire chain of custody.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#FFC107]" />
                <h3 className="text-sm font-semibold tracking-tight">Audit log</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Append-only entries record who initiated each upload, every status transition, and
                every download URL we mint. Nothing in this view is editable.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-[#FFC107]" />
                <h3 className="text-sm font-semibold tracking-tight">What to do next</h3>
              </div>
              <ol className="mt-1.5 text-xs text-slate-400 leading-relaxed list-decimal pl-4 space-y-1">
                <li>Pick the event you're documenting (top-left).</li>
                <li>Click <span className="text-[#FFC107]">Upload evidence</span> and choose a file.</li>
                <li>Verify the new row appears with status <code>PENDING_UPLOAD</code> → <code>UPLOADED</code>.</li>
                <li>Use <span className="text-slate-200">Download</span> to obtain a short-lived presigned URL.</li>
              </ol>
            </div>

            <div className="text-[10px] text-slate-600 leading-relaxed border-t border-white/5 pt-3">
              API: <code className="break-all">{API_BASE}</code>
            </div>
          </div>
        </aside>
      </div>

      {/* Detail drawer */}
      {selected && <DetailDrawer file={selected} onClose={() => setSelected(null)} onDownload={onDownload} />}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ eventId, onUpload }: { eventId: string; onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <FolderOpen size={42} className="text-slate-600 mb-3" />
      <h3 className="text-base font-semibold text-slate-200">No evidence uploaded for this event yet.</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md">
        Event <code className="text-slate-300">{eventId}</code> has no files in the
        compliance store. Upload the first artifact to start the audit chain.
      </p>
      <button
        onClick={onUpload}
        className="mt-4 px-4 py-2 text-sm rounded bg-[#FFC107]/15 hover:bg-[#FFC107]/25 border border-[#FFC107]/40 text-[#FFC107] inline-flex items-center gap-2"
      >
        <Upload size={14} /> Upload evidence
      </button>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────
function DetailDrawer({
  file, onClose, onDownload,
}: {
  file: EvidenceFile;
  onClose: () => void;
  onDownload: (f: EvidenceFile) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div
        className="w-[420px] max-w-full bg-[#0c1118] border-l border-white/10 h-full overflow-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#FFC107]" />
              <h3 className="text-sm font-semibold">File metadata</h3>
            </div>
            <p className="mt-1 text-base text-slate-100 break-all">{file.filename}</p>
          </div>
          <button title="Close" aria-label="Close panel" onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={16} /></button>
        </div>

        <dl className="mt-5 space-y-2 text-xs">
          <Field k="evidence_id"      v={file.evidence_id} />
          <Field k="policy_id"        v={file.policy_id} />
          <Field k="workflow_id"      v={file.workflow_id} />
          <Field k="event_id"         v={file.event_id} />
          <Field k="form_id"          v={file.form_id || '—'} />
          <Field k="status"           v={file.status} />
          <Field k="signature_status" v={file.signature_status || 'NONE'} />
          <Field k="source_system"    v={file.source_system || '—'} />
          <Field k="mime_type"        v={file.mime_type || '—'} />
          <Field k="size"             v={formatBytes(file.size_bytes)} />
          <Field k="created_at"       v={formatTs(file.created_at)} />
          <Field k="updated_at"       v={formatTs(file.updated_at)} />
        </dl>

        <button
          onClick={() => onDownload(file)}
          className="mt-5 w-full px-3 py-2 text-sm rounded bg-[#FFC107]/15 hover:bg-[#FFC107]/25 border border-[#FFC107]/40 text-[#FFC107] inline-flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} /> Open presigned download
        </button>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-slate-500 inline-block w-2/5">{k}</dt>
      <dd className="text-slate-200 inline-block w-3/5 text-right break-all border-b border-white/5 pb-1.5">{v}</dd>
    </>
  );
}

export default EvidenceCenterPage;
