import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Download, ExternalLink, FileText, Loader2, PenLine, Search, ShieldCheck, X } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { CalendarApi, type BradTrainingFile, type BradTrainingResponse } from '@/policy/services/calendarApi';

/* ════════════════════════════════════════════════════════════════
   Evidence Center — Windows-Explorer-style folder view.
   Exactly three layers: Year → Event → Documents (flat; no sub-folders
   below an event). Top level also has special "Brad Training" and
   "Draft Evidence Packets" folders. Folders are color-coded by event
   domain. Light glass theme (inherits the time-of-day tokens).
   ════════════════════════════════════════════════════════════════ */

/* ─── Glossy folder icon (parametric color, classic tabbed shape) ─── */
function FolderIcon({ color, size = 84 }: { color: string; size?: number }) {
  const id = useMemo(() => `fg-${color.replace(/[^a-z0-9]/gi, '')}-${Math.round(size)}`, [color, size]);
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" aria-hidden className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={`${id}-tab`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* tab */}
      <path d="M6 14 q0-6 6-6 h26 q4 0 6 4 l4 6 h-48 z" fill={`url(#${id}-tab)`} />
      {/* body */}
      <rect x="4" y="16" width="92" height="58" rx="8" fill={`url(#${id})`} />
      {/* top sheen */}
      <rect x="8" y="20" width="84" height="14" rx="6" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}

/* ─── Domain → folder color (stable, works on a light background) ─── */
const DOMAIN_COLORS: Record<string, string> = {
  qapi: '#00897B',
  governance: '#5C6BC0',
  governing: '#5C6BC0',
  clinical: '#EF6C53',
  infection: '#E2683C',
  'infection-control': '#E2683C',
  hr: '#3B82F6',
  training: '#3B82F6',
  compliance: '#D9892B',
  risk: '#E11D48',
  'patient-safety': '#E11D48',
  security: '#64748B',
  it: '#64748B',
  billing: '#16A34A',
  finance: '#16A34A',
  policy: '#0EA5E9',
  audit: '#9333EA',
};
const PALETTE = ['#00897B', '#5C6BC0', '#E2683C', '#3B82F6', '#D9892B', '#16A34A', '#9333EA', '#0EA5E9', '#E11D48', '#64748B'];
const YEAR_COLOR = '#F5C242';
const BRAD_COLOR = '#14B8A6';
const PACKET_COLOR = '#7C3AED';
const MOCK_PACKET_COLOR = '#E2683C';  // orange — Mock Event Packets
const ADM_PACKET_COLOR = '#3B82F6';   // blue — Patient Admission Packets
type DriveKind = 'brad' | 'mock' | 'admission';

function hashColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function colorForDomain(domain?: string): string {
  const d = (domain ?? '').toLowerCase();
  for (const key of Object.keys(DOMAIN_COLORS)) if (d.includes(key)) return DOMAIN_COLORS[key];
  return hashColor(d || 'event');
}

const SPECIAL = { bradTraining: '__brad_training__', draftPackets: '__draft_packets__' } as const;

function yearOf(iso?: string): string {
  const m = /^(\d{4})/.exec(String(iso ?? ''));
  return m ? m[1] : 'Undated';
}

/* ─── Document metadata helpers ─────────────────────────────────── */
interface DocMeta { filingPeriodKey?: string; classification?: string; sourcePointer?: string; contentHash?: string }
function parseMeta(doc: EvidenceDoc): DocMeta {
  try { return doc.note ? (JSON.parse(doc.note) as DocMeta) : {}; } catch { return {}; }
}
function docLabel(doc: EvidenceDoc): string {
  return doc.name || doc.id;
}

interface DriveCrumb { id: string; name: string }
type View =
  | { level: 'root' }
  | { level: 'year'; year: string }
  | { level: 'event'; year: string; eventId: string; eventTitle: string; color: string }
  | { level: 'special'; key: string; title: string }
  | { level: 'drive'; folderId: string; trail: DriveCrumb[]; kind: DriveKind };

export function EvidenceFolderExplorer() {
  const navigate = useNavigate();
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const [view, setView] = useState<View>({ level: 'root' });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<EvidenceDoc | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<BradTrainingFile | null>(null);

  // Brad Training library is browsed LIVE from the real "2026 Brad Training"
  // Drive folder — URL/metadata only (no bytes). Each level fetches just its
  // immediate children (the tree holds 2k+ files); results are cached per
  // folder so back-navigation is instant.
  const driveCacheRef = useRef<Map<string, BradTrainingResponse>>(new Map());
  const [drive, setDrive] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data: BradTrainingResponse | null; error?: string }>(
    { status: 'idle', data: null },
  );
  const loadDrive = useCallback((folderId: string, kind: DriveKind, force = false) => {
    const cacheKey = `${kind}:${folderId || '__root__'}`;
    if (!force) {
      const cached = driveCacheRef.current.get(cacheKey);
      if (cached) { setDrive({ status: 'ready', data: cached }); return; }
    }
    setDrive({ status: 'loading', data: null });
    const fetcher = kind === 'brad'
      ? CalendarApi.bradTrainingDocs(folderId || undefined)
      : CalendarApi.packetLibraryDocs(kind, folderId || undefined);
    fetcher
      .then((r) => { driveCacheRef.current.set(cacheKey, r); setDrive({ status: 'ready', data: r }); })
      .catch((e: unknown) => setDrive({ status: 'error', data: null, error: e instanceof Error ? e.message : 'Failed to reach Google Drive.' }));
  }, []);
  const driveFolderId = view.level === 'drive' ? view.folderId : null;
  const driveKind = view.level === 'drive' ? view.kind : null;
  useEffect(() => { if (driveFolderId !== null && driveKind !== null) loadDrive(driveFolderId, driveKind); }, [driveFolderId, driveKind, loadDrive]);

  const events = useMemo(() => REGULATORY_EVENTS.filter((e) => !e.isContext), []);
  const allDocs = useMemo(() => Object.values(evidenceByEvent).flat() as EvidenceDoc[], [evidenceByEvent]);

  // Years present in event data + any year with evidence.
  const years = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(yearOf(e.date)));
    allDocs.forEach((d) => set.add(yearOf(d.createdAt)));
    return Array.from(set).filter((y) => y !== 'Undated').sort((a, b) => Number(b) - Number(a));
  }, [events, allDocs]);

  // Documents for the special folders.
  const draftPacketDocs = useMemo(
    () => allDocs.filter((d) => d.artifactVersion === 'packet-studio-v1' || /packet/i.test(d.name)),
    [allDocs],
  );
  const eventsForYear = useMemo(() => {
    if (view.level !== 'year') return [];
    const list = events.filter((e) => yearOf(e.date) === view.year);
    const q = query.trim().toLowerCase();
    return q ? list.filter((e) => `${e.title} ${e.id} ${e.domain}`.toLowerCase().includes(q)) : list;
  }, [view, events, query]);

  const docsForView = useMemo((): EvidenceDoc[] => {
    if (view.level === 'event') return (evidenceByEvent[view.eventId] ?? []) as EvidenceDoc[];
    if (view.level === 'special') return draftPacketDocs;
    return [];
  }, [view, evidenceByEvent, draftPacketDocs]);

  const goDrive = (folderId: string, trail: DriveCrumb[], kind: DriveKind = 'brad') => { setSelected(null); setSelectedDrive(null); setView({ level: 'drive', folderId, trail, kind }); };

  const crumbs = useMemo(() => {
    const out: { label: string; onClick?: () => void }[] = [{ label: 'Evidence', onClick: () => { setView({ level: 'root' }); setSelected(null); setSelectedDrive(null); } }];
    if (view.level === 'year') out.push({ label: view.year });
    if (view.level === 'event') {
      out.push({ label: view.year, onClick: () => { setView({ level: 'year', year: view.year }); setSelected(null); } });
      out.push({ label: view.eventTitle });
    }
    if (view.level === 'special') out.push({ label: view.title });
    if (view.level === 'drive') {
      view.trail.forEach((c, i) => {
        const isLast = i === view.trail.length - 1;
        out.push(isLast ? { label: c.name } : { label: c.name, onClick: () => goDrive(c.id, view.trail.slice(0, i + 1), view.kind) });
      });
    }
    return out;
  }, [view]);

  const openDoc = (doc: EvidenceDoc) => setSelected(doc);

  return (
    <section className="grid gap-lg" data-hash-id="evidence-center" data-route="/evidence" data-template="evidence">
      {/* Header + breadcrumb */}
      <div className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
        <div className="flex flex-wrap items-center gap-sm text-sm">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-sm">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted" />}
              {c.onClick ? (
                <button type="button" onClick={c.onClick} className="font-medium text-brand-teal hover:text-brand-teal-deep">{c.label}</button>
              ) : (
                <span className="font-medium text-ink">{c.label}</span>
              )}
            </span>
          ))}
          {view.level === 'year' && (
            <label className="ml-auto flex items-center gap-xs rounded-lg border border-hairline bg-surface px-md py-xs text-xs text-secondary">
              <Search className="h-4 w-4 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter events…" aria-label="Filter events" className="w-44 bg-transparent text-ink outline-none placeholder:text-muted" />
            </label>
          )}
        </div>
        <p className="mt-sm text-xs text-muted">Year → Event → Documents. Folders are color-coded by event domain; documents file flat inside each event.</p>
      </div>

      <div className={`grid gap-lg ${(selected || selectedDrive) ? 'desktop:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]' : ''}`}>
        {/* Folder / document canvas */}
        <div className="min-h-[420px] rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="flex flex-wrap gap-sm">
            {/* ROOT: years + special folders */}
            {view.level === 'root' && (
              <>
                {years.map((y) => (
                  <FolderCell key={y} color={YEAR_COLOR} label={y} sub={`${events.filter((e) => yearOf(e.date) === y).length} events`} onOpen={() => setView({ level: 'year', year: y })} />
                ))}
                <FolderCell color={BRAD_COLOR} label="Brad Training" sub="Training library" onOpen={() => goDrive('', [{ id: '', name: 'Brad Training' }], 'brad')} />
                <FolderCell color={MOCK_PACKET_COLOR} label="Mock Event Packets" sub="Live from Drive" onOpen={() => goDrive('', [{ id: '', name: 'Mock Event Packets' }], 'mock')} />
                <FolderCell color={ADM_PACKET_COLOR} label="Patient Admission Packet" sub="Live from Drive" onOpen={() => goDrive('', [{ id: '', name: 'Patient Admission Packet' }], 'admission')} />
                <FolderCell color={PACKET_COLOR} label="Draft Evidence Packets" sub={`${draftPacketDocs.length} docs`} onOpen={() => setView({ level: 'special', key: SPECIAL.draftPackets, title: 'Draft Evidence Packets' })} />
              </>
            )}

            {/* YEAR: event folders (color-coded) */}
            {view.level === 'year' && (
              eventsForYear.length === 0
                ? <EmptyState label="No events match this filter." />
                : eventsForYear.map((e) => (
                    <FolderCell
                      key={e.id}
                      color={colorForDomain(e.domain)}
                      label={e.title}
                      sub={`${(evidenceByEvent[e.id] ?? []).length} docs`}
                      onOpen={() => setView({ level: 'event', year: view.year, eventId: e.id, eventTitle: e.title, color: colorForDomain(e.domain) })}
                    />
                  ))
            )}

            {/* BRAD TRAINING: live folder-by-folder navigation of Google Drive (URL only) */}
            {view.level === 'drive' && (
              drive.status === 'loading'
                ? <div className="flex h-48 w-full items-center justify-center gap-sm text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading from Google Drive…</div>
                : drive.status === 'error'
                  ? <DriveAccessError message={drive.error} folderUrl={drive.data?.folderUrl ?? null} onRetry={() => loadDrive(view.folderId, view.kind, true)} />
                  : (drive.data && (drive.data.folders.length > 0 || drive.data.files.length > 0))
                    ? <>
                        {drive.data.folders.map((f) => (
                          <FolderCell key={f.id} color={view.kind === 'mock' ? MOCK_PACKET_COLOR : view.kind === 'admission' ? ADM_PACKET_COLOR : BRAD_COLOR} label={f.name} onOpen={() => goDrive(f.id, [...view.trail, { id: f.id, name: f.name }], view.kind)} />
                        ))}
                        {drive.data.files.map((f) => (
                          <DriveDocCell key={f.id} file={f} selected={selectedDrive?.id === f.id} onOpen={(d) => { setSelected(null); setSelectedDrive(d); }} />
                        ))}
                      </>
                    : <EmptyState label="This Google Drive folder is empty." />
            )}

            {/* EVENT or DRAFT PACKETS: filed evidence documents (flat) */}
            {(view.level === 'event' || view.level === 'special') && (
              docsForView.length === 0
                ? <EmptyState label={view.level === 'special' ? 'No documents yet. File evidence from Brad Evidence Intake.' : 'No documents in this event yet. File or upload evidence to populate it.'} />
                : docsForView.map((doc) => <DocCell key={doc.id} doc={doc} selectedId={selected?.id} onOpen={openDoc} />)
            )}
          </div>
        </div>

        {/* Document viewer — full-screen sheet on mobile, right rail on desktop */}
        {(selected || selectedDrive) && (
          <div
            className="fixed inset-0 z-[950] overflow-y-auto bg-surface p-md tablet-l:static tablet-l:z-auto tablet-l:overflow-visible tablet-l:bg-transparent tablet-l:p-0"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
          >
            {selectedDrive
              ? <DriveDocViewer file={selectedDrive} onClose={() => setSelectedDrive(null)} />
              : selected && <DocumentViewer
                  doc={selected}
                  onClose={() => setSelected(null)}
                  onOpenForm={() => {
                    const formId = selected.linkedFormId || selected.formIds?.[0];
                    if (formId) navigate(`/forms/${encodeURIComponent(formId)}`);
                  }}
                  onSign={() => {
                    const formId = selected.linkedFormId || selected.formIds?.[0];
                    if (formId) navigate(`/forms/${encodeURIComponent(formId)}/esign?evidenceId=${encodeURIComponent(selected.id)}`);
                  }}
                />}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-hairline text-sm text-muted">{label}</div>;
}

function FolderCell({ color, label, sub, onOpen }: { color: string; label: string; sub?: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={onOpen}
      className="group flex w-[132px] flex-col items-center gap-xs rounded-lg p-md text-center hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
      title={label}
    >
      <FolderIcon color={color} />
      <span className="mt-xs line-clamp-2 text-sm font-medium text-ink">{label}</span>
      {sub && <span className="text-[10px] uppercase tracking-tag text-muted">{sub}</span>}
    </button>
  );
}

function DocCell({ doc, selectedId, onOpen }: { doc: EvidenceDoc; selectedId?: string; onOpen: (doc: EvidenceDoc) => void }) {
  const meta = parseMeta(doc);
  const isUploaded = doc.driveUploadStatus === 'uploaded' && !!doc.driveFileId;
  return (
    <button
      type="button"
      onClick={() => onOpen(doc)}
      className={`group flex w-[132px] flex-col items-center gap-xs rounded-lg p-md text-center hover:bg-surface-hover focus:outline-none ${selectedId === doc.id ? 'bg-tone-teal-bg' : ''}`}
      title={docLabel(doc)}
    >
      <span className="relative">
        <FileText className="h-12 w-12 text-brand-teal" strokeWidth={1.4} />
        {isUploaded && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-teal ring-2 ring-surface" title="On Google Drive" />}
      </span>
      <span className="mt-xs line-clamp-2 text-xs font-medium text-ink">{docLabel(doc)}</span>
      {meta.filingPeriodKey && <span className="text-[10px] uppercase tracking-tag text-muted">{meta.filingPeriodKey}</span>}
    </button>
  );
}

/* ─── Right-panel document viewer with eCIgn signing ────────────── */
function DocumentViewer({ doc, onClose, onSign, onOpenForm }: { doc: EvidenceDoc; onClose: () => void; onSign: () => void; onOpenForm: () => void }) {
  const meta = parseMeta(doc);
  const formId = doc.linkedFormId || doc.formIds?.[0];
  const signable = !!formId;
  const driveLink = doc.webViewLink;
  const row = (k: string, v?: string | null) => v ? (
    <div className="flex justify-between gap-md border-b border-hairline/60 py-xs text-xs">
      <span className="text-muted">{k}</span><span className="text-right text-ink break-all">{v}</span>
    </div>
  ) : null;

  return (
    <aside className="grid content-start gap-lg rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
      <div className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-sm">
          <FileText className="h-6 w-6 text-brand-teal" />
          <h2 className="text-h3 font-medium text-ink break-all">{docLabel(doc)}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close viewer" className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
      </div>

      {/* Preview surface (Letter aspect) */}
      <div className="aspect-[8.5/11] w-full overflow-auto rounded-lg border border-card bg-white p-lg text-[#1f1c1b] shadow-rest">
        <div className="border-b-4 border-[#00797D] pb-md">
          <p className="text-[10px] uppercase tracking-tag text-[#6b6b6b]">Care Indeed · Evidence</p>
          <h3 className="mt-xs text-lg font-medium">{docLabel(doc)}</h3>
          {meta.classification && <p className="mt-xs text-xs text-[#6b6b6b]">{meta.classification}{meta.filingPeriodKey ? ` · filed ${meta.filingPeriodKey}` : ''}</p>}
        </div>
        <div className="mt-md grid gap-xs text-xs">
          {row('Evidence ID', doc.id)}
          {row('Status', doc.status)}
          {row('Kind', doc.kind)}
          {row('Source pointer', meta.sourcePointer)}
          {row('Content hash', meta.contentHash ?? doc.checksum)}
          {row('Created', doc.createdAt)}
          {row('Created by', doc.createdBy)}
          {row('Drive status', doc.driveUploadStatus)}
        </div>
      </div>

      {/* Actions */}
      <div className="grid gap-sm">
        {driveLink && (
          <a href={driveLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-sm font-medium text-brand-teal-deep hover:bg-surface-hover">
            <Download className="h-4 w-4" /> Open in Google Drive (secure link)
          </a>
        )}
        {signable && (
          <button
            type="button"
            onClick={onOpenForm}
            title="Open the fillable form (not raw source text)"
            className="flex min-h-tap items-center justify-center gap-sm rounded-lg border border-brand-teal bg-surface-glass px-md py-sm text-sm font-medium text-brand-teal hover:bg-surface-hover"
          >
            <FileText className="h-4 w-4" /> Open fillable form
          </button>
        )}
        <button
          type="button"
          onClick={onSign}
          disabled={!signable}
          title={signable ? 'Sign this document with eCIgn' : 'eCIgn signing applies to form/packet documents (open the linked form to sign).'}
          className="flex min-h-tap items-center justify-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-md py-sm text-sm font-medium text-on-brand enabled:hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45"
        >
          <PenLine className="h-4 w-4" /> Sign with eCIgn
        </button>
        <p className="flex items-center gap-xs text-[10px] uppercase tracking-tag text-muted">
          <ShieldCheck className="h-3 w-3" /> eCIgn applies consent + signature profile; Brad never signs for a human.
        </p>
      </div>
    </aside>
  );
}

/* ─── Brad Training: documents seeded LIVE from Google Drive (URL only) ── */
const drivePreviewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

function shortType(mime: string): string {
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('document') || mime.includes('word')) return 'DOC';
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet')) return 'SHEET';
  if (mime.includes('presentation') || mime.includes('slide')) return 'SLIDES';
  if (mime.startsWith('image/')) return 'IMG';
  return 'FILE';
}

function DriveDocCell({ file, selected, onOpen }: { file: BradTrainingFile; selected: boolean; onOpen: (f: BradTrainingFile) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(file)}
      className={`group flex w-[132px] flex-col items-center gap-xs rounded-lg p-md text-center hover:bg-surface-hover focus:outline-none ${selected ? 'bg-tone-teal-bg' : ''}`}
      title={file.name}
    >
      <span className="relative">
        <FileText className="h-12 w-12 text-brand-teal" strokeWidth={1.4} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-teal ring-2 ring-surface" title="On Google Drive" />
      </span>
      <span className="mt-xs line-clamp-2 text-xs font-medium text-ink">{file.name}</span>
      <span className="text-[10px] uppercase tracking-tag text-muted">{shortType(file.mimeType)}</span>
    </button>
  );
}

/* Right-panel viewer that renders the document DIRECTLY from Google Drive.
   The embed only shows content to users signed into Google with Care Indeed
   shared-drive access; otherwise Google renders its own "request access" /
   sign-in surface, reinforced by the note below. We never store the bytes. */
function DriveDocViewer({ file, onClose }: { file: BradTrainingFile; onClose: () => void }) {
  return (
    <aside className="grid content-start gap-lg rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
      <div className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-sm">
          <FileText className="h-6 w-6 text-brand-teal" />
          <h2 className="text-h3 font-medium text-ink break-all">{file.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close viewer" className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
      </div>

      {/* Live Drive preview (Letter aspect) — clicking opens the document in a
          new tab, served directly from Google Drive. */}
      <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-card bg-white shadow-rest">
        <iframe
          title={file.name}
          src={drivePreviewUrl(file.id)}
          className="h-full w-full"
          allow="autoplay"
          referrerPolicy="no-referrer"
        />
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noreferrer"
          title="Open this document in a new tab (from Google Drive)"
          className="group absolute inset-0 flex items-end justify-end p-sm"
        >
          <span className="flex items-center gap-xs rounded-lg bg-brand-teal/90 px-sm py-xs text-[11px] font-medium text-white opacity-0 shadow-rest transition group-hover:opacity-100">
            <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
          </span>
        </a>
      </div>

      <p className="flex items-start gap-xs rounded-lg border border-amber-300/60 bg-amber-50/70 px-md py-sm text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Click the preview to open the document in a new tab. If it’s blank or shows a sign-in prompt, log into the Care Indeed shared drive on Google.
      </p>

      <div className="grid gap-sm">
        <a href={file.webViewLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-sm font-medium text-brand-teal-deep hover:bg-surface-hover">
          <ExternalLink className="h-4 w-4" /> Open in Google Drive (secure link)
        </a>
        <p className="flex items-center gap-xs text-[10px] uppercase tracking-tag text-muted">
          <ShieldCheck className="h-3 w-3" /> Seeded by URL only — Care Indeed never copies these training documents.
        </p>
      </div>
    </aside>
  );
}

function DriveAccessError({ message, folderUrl, onRetry }: { message?: string; folderUrl: string | null; onRetry: () => void }) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-sm rounded-lg border border-dashed border-amber-300/70 bg-amber-50/50 px-lg text-center">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <p className="text-sm font-medium text-amber-800">Please log into the Care Indeed shared drive to view Brad Training.</p>
      {message && <p className="text-[11px] text-amber-700/80">{message}</p>}
      <div className="mt-xs flex items-center gap-sm">
        <button type="button" onClick={onRetry} className="rounded-lg border border-amber-400 px-md py-xs text-xs font-medium text-amber-800 hover:bg-amber-100">Retry</button>
        {folderUrl && <a href={folderUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-tone-teal-border px-md py-xs text-xs font-medium text-brand-teal-deep hover:bg-surface-hover">Open in Google Drive</a>}
      </div>
    </div>
  );
}

export default EvidenceFolderExplorer;
