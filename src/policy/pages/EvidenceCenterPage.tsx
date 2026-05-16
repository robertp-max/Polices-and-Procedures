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
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  FolderOpen, Download, Upload, RefreshCw, FileText, ShieldCheck,
  Search, AlertCircle, CheckCircle2, Clock, ExternalLink, Info, X, History,
} from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { isCesTask } from '@/policy/pm/types';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import { CesEvidenceHierarchyPanel } from '@/policy/components/evidence/CesEvidenceHierarchyPanel';
import { prefetchDemoEvidenceFromIdb, resolveEvidenceDataUrl } from '@/policy/evidence/demoEvidenceRuntimeCache';
import { useDataFreshness } from '@/policy/utils/useDataFreshness';
import { StalenessBanner, AriaLiveRegion, LoadingState, EmptyState } from '@/policy/components/ui';
import {
  type EvidenceAuditEvent,
  type EvidenceMode,
  type EvidenceStatus,
  logEvidenceDevWarning,
  toEvidenceModeLabel,
  validateEvidenceUploadInput,
} from '@/policy/evidence/evidenceModel';

// ── Configuration ──────────────────────────────────────────────
// Override at build time with VITE_HHC_API_BASE.
const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

const REQUESTED_MODE: EvidenceMode =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_EVIDENCE_MODE || 'DEMO_LOCAL').toUpperCase() === 'BACKEND_LIVE'
    ? 'BACKEND_LIVE'
    : 'DEMO_LOCAL';

const DEFAULT_EVENT  = 'EVT-DEMO-001';

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
  task_id:          string | null;
  form_id:          string | null;
  form_instance_id?: string | null;
  kind?:            string;
  status:           EvidenceStatus;
  version:          number;
  superseded_by:    string | null;
  local_data_url:   string | null;
  signature_status: string | null;
  source_system:    string | null;
  mime_type:        string | null;
  size_bytes:       number | null;
  created_at:       string;
  updated_at:       string;
}

interface AuditEntry {
  ts:            string;
  action:        EvidenceAuditEvent;
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
  VALIDATING:     'bg-sky-500/15 text-sky-300 border-sky-500/30',
  VALIDATED:      'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  EVIDENCE_LOCKED:'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PROMOTED:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJECTED:       'bg-rose-500/15 text-rose-300 border-rose-500/30',
  SUPERSEDED:     'bg-violet-500/15 text-violet-300 border-violet-500/30',
  EXPORTED:       'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  RETAINED:       'bg-slate-500/15 text-slate-300 border-slate-500/30',
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

function estimateDataUrlBytes(dataUrl: string | null | undefined): number | null {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (meta.includes(';base64')) {
    const clean = payload.replace(/\s/g, '');
    const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
  }
  try {
    return decodeURIComponent(payload).length;
  } catch {
    return payload.length;
  }
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
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qEventId = (query.get('event_id') || '').trim();
  const qEvidenceId = (query.get('evidence_id') || '').trim();
  const qFormId = (query.get('form_id') || '').trim();
  const qPolicyId = (query.get('policy_id') || '').trim();
  const qWorkflowId = (query.get('workflow_id') || '').trim();
  const qTaskId = (query.get('task_id') || '').trim();
  const qRequirementId = (query.get('requirement_id') || '').trim();
  const qFormInstanceId = (query.get('form_instance_id') || '').trim();
  // Stabilization N-07 / Fix 3: URL-back the hierarchy/files toggle so
  // `/evidence?view=files` is a working deep link. Identity/fetch logic
  // untouched (Protected-adjacent — see N-07 audit §5).
  const qCenterView = query.get('view') === 'files' ? 'files' : 'hierarchy';
  const [, setSearchParams] = useSearchParams();

  // Stabilization R-05: client-side staleness notice. Threshold 3 min — the
  // Evidence list drifts faster than the CES task list (uploads + signature
  // events arrive often during active drills). Pure UI advisory; we do NOT
  // re-architect the fetch or identity logic for this Protected-adjacent
  // surface. Refresh action simply re-runs the existing mount path.
  const freshness = useDataFreshness({ stalenessThresholdMs: 3 * 60 * 1000 });

  const [eventId,    setEventId]    = useState(qEventId || DEFAULT_EVENT);
  const [eventInput, setEventInput] = useState(qEventId || DEFAULT_EVENT);
  const [search,     setSearch]     = useState('');
  const [filterEventId,    setFilterEventId]    = useState(qEventId);
  const [filterFormId,     setFilterFormId]     = useState(qFormId);
  const [filterPolicyId,   setFilterPolicyId]   = useState(qPolicyId);
  const [filterWorkflowId, setFilterWorkflowId] = useState(qWorkflowId);
  const [filterTaskId, setFilterTaskId] = useState(qTaskId);
  const [filterEvidenceId, setFilterEvidenceId] = useState(qEvidenceId);
  const [files,   setFiles] = useState<EvidenceFile[]>([]);
  const [audit,   setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [selected, setSelected] = useState<EvidenceFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [memCacheVersion, setMemCacheVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<EvidenceMode>(REQUESTED_MODE);
  const [centerView, setCenterViewState] = useState<'hierarchy' | 'files'>(qCenterView);
  const setCenterView = useCallback((next: 'hierarchy' | 'files') => {
    setCenterViewState(next);
    setSearchParams(prev => {
      const merged = new URLSearchParams(prev);
      if (next === 'hierarchy') merged.delete('view');
      else merged.set('view', next);
      return merged;
    }, { replace: true });
  }, [setSearchParams]);
  const isDemoMode = effectiveMode === 'DEMO_LOCAL';
  const store = useRegulatoryExecutionStore();
  const projectedTasks = useProjectedTasks('full');
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const hierarchyEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(event => !event.isContext),
    [generatedEvents, triggeredEvents],
  );
  const cesTasks = useMemo(() => projectedTasks.filter(isCesTask), [projectedTasks]);
  const resolveEventAliases = useCallback((id: string): string[] => {
    const source = store.eventInstancesById[id]?.sourceEventId ?? id;
    const instanceIds = store.eventInstanceIdsBySourceEventId[source] ?? [];
    return Array.from(new Set([id, source, ...instanceIds]));
  }, [store.eventInstanceIdsBySourceEventId, store.eventInstancesById]);
  const toEvidenceFile = useCallback((doc: ReturnType<typeof useRegulatoryExecutionStore.getState>['evidence'][string][number]): EvidenceFile => {
    const dataUrl = resolveEvidenceDataUrl(doc);
    const estimatedBytes = estimateDataUrlBytes(dataUrl);
    const resolvedSize = (doc.fileSize && doc.fileSize > 0) ? doc.fileSize : estimatedBytes;
    return ({
    evidence_id: doc.id,
    filename: doc.name,
    policy_id: doc.policyId,
    workflow_id: doc.workflowId,
    event_id: doc.eventId,
    task_id: doc.taskId || null,
    form_id: doc.linkedFormId || doc.formIds[0] || null,
    status: doc.status,
    version: doc.version,
    superseded_by: doc.supersededById ?? null,
    local_data_url: dataUrl ?? null,
    signature_status: doc.status === 'EVIDENCE_LOCKED' ? 'LOCKED' : null,
    source_system: 'ces-store',
    mime_type: doc.mimeType ?? null,
    size_bytes: resolvedSize ?? null,
    created_at: doc.createdAt,
    updated_at: doc.uploadedAt ?? doc.createdAt,
  });
  }, []);
  const toAuditEntry = useCallback((row: ReturnType<typeof useRegulatoryExecutionStore.getState>['taskAuditByEventId'][string][number]): AuditEntry => ({
    ts: row.timestamp,
    action: (row.action as EvidenceAuditEvent),
    actor: row.actorId ?? null,
    source_system: 'ces-store',
    evidence_id: row.entityType === 'evidence' ? row.entityId : null,
    upload_id: null,
    before_status: null,
    after_status: null,
  }), []);
  const normalizedEvidenceByEvent = useMemo(() => {
    const out: Record<string, typeof store.evidence[string]> = {};
    const candidateEventIds = new Set<string>([
      ...hierarchyEvents.map(event => event.id),
      ...cesTasks.map(task => task.event_id).filter((value): value is string => Boolean(value)),
      ...Object.keys(store.evidence),
    ]);
    candidateEventIds.forEach(eventId => {
      const docs = resolveEventAliases(eventId)
        .flatMap(alias => store.evidence[alias] ?? [])
        .filter((item, idx, arr) => arr.findIndex(candidate => candidate.id === item.id) === idx);
      if (docs.length > 0) {
        out[eventId] = docs;
      }
    });
    return out;
  }, [cesTasks, hierarchyEvents, resolveEventAliases, store.evidence]);
  const normalizedEvidenceIds = useMemo(() => (
    Object.values(normalizedEvidenceByEvent).flatMap(items => items.map(item => item.id))
  ), [normalizedEvidenceByEvent]);
  const normalizedAuditByEvent = useMemo(() => {
    const out: Record<string, typeof store.taskAuditByEventId[string]> = {};
    const candidateEventIds = new Set<string>([
      ...hierarchyEvents.map(event => event.id),
      ...cesTasks.map(task => task.event_id).filter((value): value is string => Boolean(value)),
      ...Object.keys(store.taskAuditByEventId),
    ]);
    candidateEventIds.forEach(eventId => {
      const rows = resolveEventAliases(eventId)
        .flatMap(alias => store.taskAuditByEventId[alias] ?? [])
        .filter((item, idx, arr) => arr.findIndex(candidate => candidate.auditId === item.auditId) === idx);
      if (rows.length > 0) {
        out[eventId] = rows;
      }
    });
    return out;
  }, [cesTasks, hierarchyEvents, resolveEventAliases, store.taskAuditByEventId]);

  useEffect(() => {
    if (!isDemoMode || normalizedEvidenceIds.length === 0) return;
    let active = true;
    prefetchDemoEvidenceFromIdb(normalizedEvidenceIds).then(() => {
      if (!active) return;
      // Force a re-render after async IDB warm-up so rows that were IDB-only
      // resolve without needing a manual page refresh.
      setMemCacheVersion(v => v + 1);
    }).catch(() => {});
    return () => { active = false; };
  }, [isDemoMode, normalizedEvidenceIds]);

  const load = useCallback(async (id: string) => {
    if (isDemoMode) {
      const aliases = resolveEventAliases(id);
      const docs = aliases
        .flatMap(alias => store.evidence[alias] ?? [])
        .filter((item, idx, arr) => arr.findIndex(candidate => candidate.id === item.id) === idx)
        .filter(item => (item.artifactType || item.kind) !== 'signed_form_instance');
      const auditRows = aliases
        .flatMap(alias => store.taskAuditByEventId[alias] ?? [])
        .filter(row => row.entityType === 'evidence' || row.action === 'FILE_UPLOADED' || row.action === 'FILE_VALIDATED' || row.action === 'EVIDENCE_PROMOTED' || row.action === 'EVIDENCE_LOCKED')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setFiles(docs.map(toEvidenceFile));
      setAudit(auditRows.map(toAuditEntry));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await jsonOrThrow<ListResponse>(
        await fetch(`${API_BASE}/events/${encodeURIComponent(id)}/files`)
      );
      setFiles(data.files || []);
      setAudit(data.audit || []);
    } catch (e) {
      if (effectiveMode === 'BACKEND_LIVE') {
        setEffectiveMode('DEMO_LOCAL');
        setError('Backend evidence endpoints are unavailable. The page switched to local demo evidence mode.');
        logEvidenceDevWarning('Evidence Center backend unavailable. Falling back to DEMO_LOCAL mode.', e);
        const aliases = resolveEventAliases(id);
        const docs = aliases
          .flatMap(alias => store.evidence[alias] ?? [])
          .filter((item, idx, arr) => arr.findIndex(candidate => candidate.id === item.id) === idx)
          .filter(item => (item.artifactType || item.kind) !== 'signed_form_instance');
        const auditRows = aliases
          .flatMap(alias => store.taskAuditByEventId[alias] ?? [])
          .filter(row => row.entityType === 'evidence' || row.action === 'FILE_UPLOADED' || row.action === 'FILE_VALIDATED' || row.action === 'EVIDENCE_PROMOTED' || row.action === 'EVIDENCE_LOCKED')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setFiles(docs.map(toEvidenceFile));
        setAudit(auditRows.map(toAuditEntry));
      } else {
        setError((e as Error).message);
        setFiles([]);
        setAudit([]);
      }
    } finally {
      setLoading(false);
    }
  }, [effectiveMode, isDemoMode, resolveEventAliases, store.evidence, store.taskAuditByEventId, toAuditEntry, toEvidenceFile]);

  useEffect(() => { load(eventId); }, [eventId, load]);

  useEffect(() => {
    const nextEvent = (query.get('event_id') || '').trim();
    const nextEvidence = (query.get('evidence_id') || '').trim();
    const nextForm = (query.get('form_id') || '').trim();
    const nextPolicy = (query.get('policy_id') || '').trim();
    if (nextEvent) {
      setEventId(nextEvent);
      setEventInput(nextEvent);
      setFilterEventId(nextEvent);
    }
    if (nextEvidence) setFilterEvidenceId(nextEvidence);
    if (nextForm) setFilterFormId(nextForm);
    if (nextPolicy) setFilterPolicyId(nextPolicy);
    if (qWorkflowId) setFilterWorkflowId(qWorkflowId);
    if (qTaskId) setFilterTaskId(qTaskId);
  }, [query]);

  useEffect(() => {
    if (!qTaskId) return;
    const match = files.find(item => (item.task_id || '').toLowerCase() === qTaskId.toLowerCase());
    if (match) setSelected(match);
  }, [files, qTaskId]);

  const filtered = useMemo(() => {
    let result = files;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((f) =>
        [f.filename, f.policy_id, f.workflow_id, f.event_id, f.task_id || '', f.form_id || '', f.status, f.source_system || '', f.evidence_id]
          .join(' ').toLowerCase().includes(q)
      );
    }
    const fid = filterFormId.trim().toLowerCase();
    if (fid) result = result.filter((f) => (f.form_id || '').toLowerCase().includes(fid));
    const evid = filterEventId.trim().toLowerCase();
    if (evid) result = result.filter((f) => f.event_id.toLowerCase().includes(evid));
    const pid = filterPolicyId.trim().toLowerCase();
    if (pid) result = result.filter((f) => f.policy_id.toLowerCase().includes(pid));
    const wid = filterWorkflowId.trim().toLowerCase();
    if (wid) result = result.filter((f) => f.workflow_id.toLowerCase().includes(wid));
    const tid = filterTaskId.trim().toLowerCase();
    if (tid) result = result.filter((f) => (f.task_id || '').toLowerCase().includes(tid));
    const eid = filterEvidenceId.trim().toLowerCase();
    if (eid) result = result.filter((f) => f.evidence_id.toLowerCase().includes(eid));
    return result;
  }, [files, search, filterEventId, filterFormId, filterPolicyId, filterWorkflowId, filterTaskId, filterEvidenceId, memCacheVersion]);

  useEffect(() => {
    const eid = filterEvidenceId.trim();
    if (!eid) return;
    const hit = filtered.find((f) => f.evidence_id.toLowerCase() === eid.toLowerCase());
    if (hit) setSelected(hit);
  }, [filterEvidenceId, filtered]);

  const onSelectEvent = () => {
    const v = eventInput.trim();
    if (v && v !== eventId) setEventId(v);
    else load(eventId);
  };

  const onDownload = async (f: EvidenceFile) => {
    if (isDemoMode) {
      if (!f.local_data_url) {
        setError('Download is unavailable for this local demo record because file bytes were not persisted.');
        return;
      }
      const a = document.createElement('a');
      a.href = f.local_data_url;
      a.download = f.filename;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
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

    const uploadPolicyId = (qPolicyId || filterPolicyId).trim();
    const uploadWorkflowId = (qWorkflowId || filterWorkflowId).trim();
    const uploadFormId = (qFormId || filterFormId).trim();
    const uploadTaskId = (qTaskId || filterTaskId).trim();
    if (qEventId && qEventId !== eventId) {
      setError(`Context mismatch: URL event_id=${qEventId} does not match selected event_id=${eventId}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (qRequirementId && !uploadTaskId) {
      setError('Task-linked requirement upload requires task_id in context.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const eventExists = hierarchyEvents.some(item => item.id === eventId) || resolveEventAliases(eventId).length > 0 || eventId.startsWith('EVT-FORM-');
    const validation = validateEvidenceUploadInput({
      policyId: uploadPolicyId,
      workflowId: uploadWorkflowId,
      eventId,
      eventExists,
      requiredFormBinding: Boolean(uploadFormId),
      formId: uploadFormId || undefined,
      requiredTaskBinding: Boolean(uploadTaskId),
      taskId: uploadTaskId || undefined,
    });
    if (!validation.ok) {
      setError(validation.message || 'Evidence validation failed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isDemoMode) {
      setUploading(true);
      setUploadMsg(null);
      setError(null);
      try {
        const linkedInstance = qFormInstanceId
          || resolveEventAliases(eventId)
            .flatMap(alias => store.generatedFormInstancesByEventId[alias] ?? [])
            .find(instance =>
              instance.status !== 'SUPERSEDED'
              && (!uploadTaskId || instance.taskId === uploadTaskId)
              && (!uploadFormId || instance.formId === uploadFormId),
            )?.id;
        const evidenceId = store.uploadEvidence(eventId, {
          taskId: uploadTaskId || undefined,
          policyIds: [uploadPolicyId],
          workflowId: uploadWorkflowId,
          formIds: uploadFormId ? [uploadFormId] : [],
          linkedFormId: uploadFormId || undefined,
          linkedFormInstanceId: linkedInstance || undefined,
          name: file.name,
          kind: 'attachment',
          sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          localDataUrl: await new Promise<string | undefined>(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
            reader.onerror = () => resolve(undefined);
            reader.readAsDataURL(file);
          }),
        });
        if (!evidenceId) {
          setError(store.evidenceErrorsByEventId[eventId] || 'Evidence upload failed validation and was not persisted.');
          return;
        }
        await load(eventId);
        const persisted = resolveEventAliases(eventId)
          .flatMap(alias => store.evidence[alias] ?? [])
          .some(item => item.id === evidenceId);
        if (!persisted) {
          setError(`Upload failed persistence check for evidence_id=${evidenceId}.`);
          return;
        }
        const uploaded = resolveEventAliases(eventId)
          .flatMap(alias => store.evidence[alias] ?? [])
          .find(item => item.id === evidenceId);
        if (uploaded) setSelected(toEvidenceFile(uploaded));
        setUploadMsg(`✓ ${file.name} → EVIDENCE_LOCKED (evidence_id=${evidenceId})`);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

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
            policy_id:     uploadPolicyId,
            workflow_id:   uploadWorkflowId,
            event_id:      eventId,
            form_id:       uploadFormId || null,
            task_id:       uploadTaskId || null,
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
    <div className="flex flex-col h-full bg-[var(--ci-bg,#070d18)] text-[var(--ci-text-primary,#e2e8f0)]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-[var(--ci-border,rgba(103,232,249,0.2))] bg-[var(--ci-surface-muted,rgba(15,23,42,0.35))] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FolderOpen size={22} className="text-cyan-300" />
          <h1 className="text-xl font-semibold tracking-tight text-[var(--ci-text-primary,#f8fafc)]">Evidence Center</h1>
          <span className="ml-2 text-xs text-[var(--ci-text-muted,#cbd5e1)]">
            Evidence mode: {toEvidenceModeLabel(effectiveMode)}
          </span>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete ALL signed forms, uploaded evidence, task state, form instances, and certifications? This cannot be undone.')) {
                  store.clearAllEvidence();
                  window.location.reload();
                }
              }}
              className="rounded border border-red-400/50 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/25"
            >
              Clear All Evidence
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-[var(--ci-text-muted,#cbd5e1)] max-w-3xl">
          Every file is bound to a <span className="text-[var(--ci-text-primary,#f8fafc)] font-semibold">policy / workflow / event</span> triplet
          and read through the API — never directly from S3.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCenterView('hierarchy')}
            className={`rounded border px-2.5 py-2 min-h-[44px] text-xs ${centerView === 'hierarchy' ? 'border-cyan-300/60 bg-cyan-300/20 text-cyan-100' : 'border-cyan-300/25 bg-slate-900/45 text-slate-300'}`}
          >
            CES hierarchy
          </button>
          <button
            type="button"
            onClick={() => setCenterView('files')}
            className={`rounded border px-2.5 py-2 min-h-[44px] text-xs ${centerView === 'files' ? 'border-cyan-300/60 bg-cyan-300/20 text-cyan-100' : 'border-cyan-300/25 bg-slate-900/45 text-slate-300'}`}
          >
            File ledger
          </button>
        </div>
        {isDemoMode && (
          <div className="mt-3 flex items-start gap-2 rounded border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>DEMO_LOCAL: Evidence metadata is stored locally for this demo environment.</span>
          </div>
        )}
        {(qTaskId || qRequirementId) && (
          <div className="mt-3 flex items-start gap-2 rounded border border-[#2D8C83] bg-[#0F4A45] px-3 py-2 text-sm text-[#A7F3D0] select-none">
            <Info size={16} className="mt-0.5 flex-shrink-0 text-[#6EE7B7]" />
            <div>
              <div className="font-medium text-[#D1FAE5]">You are uploading evidence for this task requirement.</div>
              <div className="text-xs text-[#6EE7B7] mt-1 font-mono">
                event={eventId} · task={qTaskId || filterTaskId || '—'} · form={qFormId || filterFormId || '—'} · requirement={qRequirementId || '—'}
              </div>
            </div>
          </div>
        )}
        {freshness.isPotentiallyStale && (
          <div className="mt-3">
            <StalenessBanner
              lastVisibleAt={freshness.lastVisibleAt}
              onRefresh={() => {
                freshness.acknowledge();
                window.location.reload();
              }}
              onDismiss={freshness.acknowledge}
              message="Evidence may have been uploaded, signed, or superseded while you were away."
            />
          </div>
        )}
      </div>

      {centerView === 'hierarchy' ? (
        <CesEvidenceHierarchyPanel
          events={hierarchyEvents}
          tasks={cesTasks}
          evidenceByEvent={normalizedEvidenceByEvent}
          approvals={store.approvals}
          auditByEvent={normalizedAuditByEvent}
          onSelectEvent={(id) => {
            setEventId(id);
            setEventInput(id);
          }}
        />
      ) : (
      <>
      {/* ── Main grid: left = browser+table+audit, right = guidance ── */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left column */}
        <div className="col-span-12 xl:col-span-9 flex flex-col overflow-hidden">
          {/* Filter bar */}
          <div className="px-3 sm:px-6 py-3 flex flex-wrap items-center gap-3 border-b border-cyan-300/15 bg-slate-950/30 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Event ID</label>
              <input
                title="Event ID filter"
                aria-label="Event ID"
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectEvent()}
                placeholder="EVT-..."
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-48 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
              <button
                onClick={onSelectEvent}
                className="px-3 py-1 text-sm min-h-[44px] rounded bg-slate-800/80 hover:bg-slate-700/90 border border-cyan-300/25 text-slate-100"
              >
                Load
              </button>
              <span className="text-[10px] text-slate-400">
                Accepts regulatory IDs and form-generated IDs (EVT-FORM-FI...)
              </span>
            </div>

            {/* Narrow client-side filters — applied to the already-loaded files */}
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Event</label>
              <input
                title="Filter by Event ID"
                aria-label="Filter by Event ID"
                value={filterEventId}
                onChange={(e) => setFilterEventId(e.target.value)}
                placeholder="EVT-... / EVT-FORM-FI..."
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-44 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Form</label>
              <input
                title="Filter by Form ID"
                aria-label="Filter by Form ID"
                value={filterFormId}
                onChange={(e) => setFilterFormId(e.target.value)}
                placeholder="GV-FM-017…"
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-32 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Policy</label>
              <input
                title="Filter by Policy ID"
                aria-label="Filter by Policy ID"
                value={filterPolicyId}
                onChange={(e) => setFilterPolicyId(e.target.value)}
                placeholder="GV-OG-005…"
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-32 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Workflow</label>
              <input
                title="Filter by Workflow ID"
                aria-label="Filter by Workflow ID"
                value={filterWorkflowId}
                onChange={(e) => setFilterWorkflowId(e.target.value)}
                placeholder="WF-..."
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-32 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Task</label>
              <input
                title="Filter by Task ID"
                aria-label="Filter by Task ID"
                value={filterTaskId}
                onChange={(e) => setFilterTaskId(e.target.value)}
                placeholder="TASK-..."
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-32 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-wider text-slate-300">Evidence ID</label>
              <input
                title="Filter by Evidence ID"
                aria-label="Filter by Evidence ID"
                value={filterEvidenceId}
                onChange={(e) => setFilterEvidenceId(e.target.value)}
                placeholder="EVD-…"
                className="bg-slate-900/85 border border-cyan-300/25 rounded px-2 py-1 text-sm w-36 text-slate-100 focus:outline-none focus:border-cyan-300/75"
              />
            </div>
            {(filterEventId || filterFormId || filterPolicyId || filterWorkflowId || filterTaskId || filterEvidenceId) && (
              <button
                onClick={() => {
                  setFilterEventId('');
                  setFilterFormId('');
                  setFilterPolicyId('');
                  setFilterWorkflowId('');
                  setFilterTaskId('');
                  setFilterEvidenceId('');
                }}
                className="text-xs px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700/90 border border-cyan-300/25 text-slate-200"
                title="Clear filters"
              >
                ✕ Clear filters
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-200/70" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter files…"
                  className="bg-slate-900/85 border border-cyan-300/25 rounded pl-7 pr-2 py-1 text-sm w-56 text-slate-100 focus:outline-none focus:border-cyan-300/75"
                />
              </div>
              <button
                onClick={() => load(eventId)}
                disabled={loading}
                className="px-2 py-1 text-sm min-h-[44px] rounded bg-slate-800/80 hover:bg-slate-700/90 border border-cyan-300/25 text-slate-100 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={onUploadClick}
                disabled={uploading}
                className="px-3 py-1 text-sm min-h-[44px] rounded bg-cyan-300/15 hover:bg-cyan-300/25 border border-cyan-300/45 text-cyan-200 disabled:opacity-50 inline-flex items-center gap-1"
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
          <AriaLiveRegion politeness="polite" message={(uploadMsg ?? error) || ''} />

          {/* Table */}
          <div className="flex-1 overflow-auto px-6 pt-4">
            {loading && files.length === 0 ? (
              <LoadingState variant="block" label="Loading evidence…" />
            ) : filtered.length === 0 ? (
              <EvidenceCenterEmptyState eventId={eventId} onUpload={onUploadClick} />
            ) : (
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead className="text-xs uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="text-left px-3 py-2">Filename</th>
                    <th className="text-left px-3 py-2">Policy / Workflow / Event</th>
                    <th className="text-left px-3 py-2">Form / Task</th>
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
                      className="bg-slate-900/75 hover:bg-slate-800/90 cursor-pointer border border-cyan-300/15 select-none"
                      onClick={() => setSelected(f)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-cyan-200/80" />
                          <Link
                            to={buildArtifactRoute(f.evidence_id, {
                              eventId: f.event_id,
                              taskId: f.task_id ?? undefined,
                              formId: f.form_id ?? undefined,
                              evidenceId: f.evidence_id,
                              type: 'evidence',
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-50 underline decoration-dotted"
                          >
                            {f.filename}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-300">
                        <div><Link to={`/library/${encodeURIComponent(f.policy_id)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{f.policy_id}</Link></div>
                        <div><Link to={`/workflows/${encodeURIComponent(f.workflow_id)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{f.workflow_id}</Link></div>
                        <div className="text-slate-100"><Link to={`/calendar/event/${encodeURIComponent(f.event_id)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{f.event_id}</Link></div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-300">
                        <div>{f.form_id ? <Link to={`/forms/${encodeURIComponent(f.form_id)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{f.form_id}</Link> : '—'}</div>
                        <div>{f.task_id ? <Link to={`/calendar/event/${encodeURIComponent(f.event_id)}/task/${encodeURIComponent(f.task_id)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{f.task_id}</Link> : '—'}</div>
                      </td>
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
                      <td className="px-3 py-2 text-xs text-slate-300">{f.source_system || '—'}</td>
                      <td className="px-3 py-2 text-xs text-slate-300">{formatTs(f.created_at)}</td>
                      <td className="px-3 py-2 text-xs text-slate-300 text-right">{formatBytes(f.size_bytes)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            to={buildArtifactRoute(f.evidence_id, {
                              eventId: f.event_id,
                              taskId: f.task_id ?? undefined,
                              formId: f.form_id ?? undefined,
                              evidenceId: f.evidence_id,
                              type: 'evidence',
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-300/35 text-teal-100 inline-flex items-center gap-1"
                            title="Open artifact viewer"
                          >
                            <ExternalLink size={12} /> View Artifact
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDownload(f); }}
                            className="text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700/90 border border-cyan-300/25 text-slate-100 inline-flex items-center gap-1"
                            title="Get presigned download URL"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Audit panel */}
          <div className="border-t border-cyan-300/15 px-6 py-4 max-h-72 overflow-auto bg-slate-950/25">
            <div className="flex items-center gap-2 mb-2">
              <History size={16} className="text-cyan-200/80" />
              <h2 className="text-sm font-semibold tracking-tight text-slate-100">Audit log — event {eventId}</h2>
              <span className="text-xs text-slate-400">({audit.length} entries)</span>
            </div>
            {audit.length === 0 ? (
              <div className="text-xs text-slate-400">No audit entries yet for this event.</div>
            ) : (
              <ul className="space-y-1.5">
                {audit.map((a, i) => (
                  <li key={`${a.ts}-${i}`} className="text-xs flex flex-wrap items-center gap-2 bg-slate-900/70 border border-cyan-300/15 rounded px-2 py-1.5">
                    <Clock size={11} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-300">{formatTs(a.ts)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-cyan-200 bg-cyan-300/10 border border-cyan-300/35 rounded px-1.5 py-0.5">
                      {a.action}
                    </span>
                    <span className="text-slate-100">{a.actor || 'system'}</span>
                    {a.source_system && <span className="text-slate-400">· {a.source_system}</span>}
                    {a.evidence_id && <span className="text-slate-400">· {a.evidence_id}</span>}
                    {(a.before_status || a.after_status) && (
                      <span className="text-slate-400">
                        {a.before_status || '·'} → <span className="text-slate-100">{a.after_status || '·'}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right contextual guidance */}
        <aside className="hidden xl:flex xl:col-span-3 flex-col border-l border-cyan-300/15 bg-slate-950/45 overflow-auto">
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Info size={16} className="text-cyan-300" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">What is "evidence"?</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Any file that proves a regulated activity happened — QAPI minutes, signed forms,
                competency checklists, training rosters, OASIS lock confirmations.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-300" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Why the triplet?</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Every artifact is bound to a <code className="text-slate-100">policy_id</code>,
                {' '}<code className="text-slate-100">workflow_id</code>, and
                {' '}<code className="text-slate-100">event_id</code>. A surveyor can pull a single
                event packet and reconstruct the entire chain of custody.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <History size={16} className="text-cyan-300" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">Audit log</h3>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Append-only entries record who initiated each upload, every status transition, and
                every download URL we mint. Nothing in this view is editable.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-cyan-300" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-100">What to do next</h3>
              </div>
              <ol className="mt-1.5 text-xs text-slate-300 leading-relaxed list-decimal pl-4 space-y-1">
                <li>Pick the event you're documenting (top-left).</li>
                <li>Click <span className="text-cyan-200">Upload evidence</span> and choose a file.</li>
                <li>Verify the new row appears with status <code>EVIDENCE_LOCKED</code>.</li>
                <li>Use <span className="text-slate-100">Download</span> to obtain a short-lived presigned URL.</li>
              </ol>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed border-t border-cyan-300/15 pt-3">
              API: <code className="break-all text-slate-200">{API_BASE}</code>
            </div>
          </div>
        </aside>
      </div>
      </>
      )}

      {/* Detail drawer */}
      {selected && <DetailDrawer file={selected} onClose={() => setSelected(null)} onDownload={onDownload} />}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
export function EvidenceCenterEmptyState({ eventId, onUpload }: { eventId: string; onUpload: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen size={42} />}
      title="No evidence uploaded for this event yet."
      description={
        <>
          Event <code style={{ color: 'var(--ci-text-primary)' }}>{eventId}</code> has no files in
          the compliance store. Upload the first artifact to start the audit chain.
        </>
      }
      action={
        <button
          onClick={onUpload}
          className="px-4 py-2 text-sm rounded inline-flex items-center gap-2"
          style={{
            background: 'var(--ci-surface-2)',
            border: '1px solid var(--ci-border)',
            color: 'var(--ci-link)',
          }}
        >
          <Upload size={14} /> Upload evidence
        </button>
      }
    />
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
        className="w-[min(100vw,420px)] max-w-full bg-slate-950 border-l border-cyan-300/20 h-full overflow-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-cyan-300" />
              <h3 className="text-sm font-semibold text-slate-100">File metadata</h3>
            </div>
            <p className="mt-1 text-base text-slate-50 break-all">{file.filename}</p>
          </div>
          <button title="Close" aria-label="Close panel" onClick={onClose} className="text-slate-400 hover:text-slate-100"><X size={16} /></button>
        </div>

        <dl className="mt-5 space-y-2 text-xs">
          <Field k="evidence_id"      v={file.evidence_id} />
          <Field k="policy_id"        v={file.policy_id} />
          <Field k="workflow_id"      v={file.workflow_id} />
          <Field k="event_id"         v={file.event_id} />
          <Field k="task_id"          v={file.task_id || '—'} />
          <Field k="form_id"          v={file.form_id || '—'} />
          <Field k="status"           v={file.status} />
          <Field k="version"          v={String(file.version)} />
          <Field k="superseded_by"    v={file.superseded_by || '—'} />
          <Field k="signature_status" v={file.signature_status || 'NONE'} />
          <Field k="source_system"    v={file.source_system || '—'} />
          <Field k="mime_type"        v={file.mime_type || '—'} />
          <Field k="size"             v={formatBytes(file.size_bytes)} />
          <Field k="created_at"       v={formatTs(file.created_at)} />
          <Field k="updated_at"       v={formatTs(file.updated_at)} />
        </dl>

        <button
          onClick={() => window.open(buildArtifactRoute(file.evidence_id, {
            eventId: file.event_id,
            taskId: file.task_id || undefined,
            formId: file.form_id || undefined,
            formInstanceId: file.form_instance_id || undefined,
            evidenceId: file.evidence_id,
            type: file.kind,
          }), '_blank', 'noopener,noreferrer')}
          className="mt-5 w-full px-3 py-2 text-sm rounded bg-teal-300/15 hover:bg-teal-300/25 border border-teal-300/45 text-teal-200 inline-flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} /> View in Artifact Viewer
        </button>

        <button
          onClick={() => onDownload(file)}
          className="mt-2 w-full px-3 py-2 text-sm rounded bg-cyan-300/15 hover:bg-cyan-300/25 border border-cyan-300/45 text-cyan-200 inline-flex items-center justify-center gap-2"
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
      <dt className="text-slate-400 inline-block w-2/5">{k}</dt>
      <dd className="text-slate-100 inline-block w-3/5 text-right break-all border-b border-cyan-300/15 pb-1.5">{v}</dd>
    </>
  );
}

export default EvidenceCenterPage;
