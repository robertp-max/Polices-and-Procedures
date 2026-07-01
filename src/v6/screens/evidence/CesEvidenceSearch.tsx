import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, Folder as FolderIcon, FileText, Clock } from 'lucide-react';
import { CalendarApi, type ManifestSearchRow } from '@/policy/services/calendarApi';

/* ═══════════════════════════════════════════════════════════════════════════
   CES Evidence Drive — search / filter / Advanced Search layer.

   READ-ONLY. This component ONLY filters the existing manifest data
   (GET /api/calendar/manifest/rows). It NEVER creates, renames, moves, deletes,
   or reorganizes any Google Drive folder or file. It searches only the CES
   Evidence Drive manifest (rooted at the canonical CES root), never all of
   Google Drive. File rows open Google Drive Link; folder rows open Folder URL.
   ═══════════════════════════════════════════════════════════════════════════ */

const RECENT_KEY = 'cesEvidenceRecentSearches:v1';
const RECENT_MAX = 5;

// Only these three Location presets (2026 Brad Training stays searchable, not a preset).
const LOCATION_PRESETS = ['01_CES', 'Event Packets', 'Mock Records'] as const;

const TYPE_OPTIONS = ['Any', 'Folder', 'PDF', 'Google Docs', 'Google Sheets', 'DOCX', 'XLSX', 'CSV', 'Markdown', 'JSON', 'ZIP', 'Image', 'Video'] as const;
const OWNER_OPTIONS = ['Anyone', 'Robert', 'Dee', 'Marites', 'Vanessa', 'System generated', 'Custom person/email'] as const;
const DATE_OPTIONS = ['Any time', 'Today', 'Last 7 days', 'Last 30 days', 'This year', 'Custom date range'] as const;
const STATUS_OPTIONS = ['Any status', 'Signed', 'Pending signature', 'Missing evidence', 'Generated packet', 'Supporting proof', 'Superseded', 'Required'] as const;

type TypeOpt = (typeof TYPE_OPTIONS)[number];
type OwnerOpt = (typeof OWNER_OPTIONS)[number];
type DateOpt = (typeof DATE_OPTIONS)[number];
type StatusOpt = (typeof STATUS_OPTIONS)[number];

interface AdvancedState {
  type: TypeOpt;
  owner: OwnerOpt;
  ownerCustom: string;
  hasWords: string;
  itemName: string;
  location: 'Anywhere' | (typeof LOCATION_PRESETS)[number] | 'Custom';
  locationCustom: string;
  date: DateOpt;
  dateFrom: string;
  dateTo: string;
  eventId: string;
  workflowId: string;
  policyId: string;
  formId: string;
  packetName: string;
  status: StatusOpt;
}

const EMPTY_ADV: AdvancedState = {
  type: 'Any', owner: 'Anyone', ownerCustom: '', hasWords: '', itemName: '',
  location: 'Anywhere', locationCustom: '', date: 'Any time', dateFrom: '', dateTo: '',
  eventId: '', workflowId: '', policyId: '', formId: '', packetName: '', status: 'Any status',
};

/* ── localStorage recent searches ── */
function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string').slice(0, RECENT_MAX) : [];
  } catch { return []; }
}
function writeRecent(term: string, current: string[]): string[] {
  const t = term.trim();
  if (!t) return current;
  const next = [t, ...current.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore quota */ }
  return next;
}

/* ── matching helpers ── */
const norm = (s: string) => (s || '').toLowerCase();
const ext = (name: string) => { const m = (name || '').toLowerCase().match(/\.([a-z0-9]+)$/); return m ? m[1] : ''; };

const SEARCH_FIELDS: (keyof ManifestSearchRow)[] = [
  'rawFileName', 'displayName', 'fullFolderPath', 'parentFolderPath', 'folderName', 'fileType',
  'fileId', 'driveLink', 'folderUrl', 'notes', 'eventId', 'workflowId', 'policyId', 'formId',
  'packetName', 'signerName', 'createdBy', 'evidenceStatus',
];
function haystack(r: ManifestSearchRow): string {
  return SEARCH_FIELDS.map((f) => String(r[f] ?? '')).join(' ').toLowerCase();
}
function matchesText(r: ManifestSearchRow, query: string): boolean {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = haystack(r);
  return tokens.every((t) => hay.includes(t));
}
function matchesType(r: ManifestSearchRow, type: TypeOpt): boolean {
  if (type === 'Any') return true;
  if (type === 'Folder') return r.kind === 'folder';
  const ft = norm(r.fileType);
  const e = ext(r.rawFileName);
  switch (type) {
    case 'PDF': return ft === 'pdf' || e === 'pdf';
    case 'DOCX': return ft === 'docx' || e === 'docx' || e === 'doc';
    case 'XLSX': return ft === 'xlsx' || e === 'xlsx' || e === 'xls';
    case 'CSV': return ft === 'csv' || e === 'csv';
    case 'Markdown': return ft === 'md' || ft === 'markdown' || e === 'md' || e === 'markdown';
    case 'JSON': return ft === 'json' || e === 'json';
    case 'ZIP': return ft === 'zip' || e === 'zip';
    case 'Image': return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(e) || ft === 'image';
    case 'Video': return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(e) || ft === 'video';
    case 'Google Docs': return ft.includes('gdoc') || ft.includes('google doc') || ft === 'document';
    case 'Google Sheets': return ft.includes('gsheet') || ft.includes('google sheet') || ft === 'spreadsheet';
    default: return false;
  }
}
function matchesOwner(r: ManifestSearchRow, owner: OwnerOpt, custom: string): boolean {
  if (owner === 'Anyone') return true;
  if (owner === 'System generated') return /\[defencible\]/i.test(r.notes) || norm(r.createdBy) === 'system';
  const term = norm(owner === 'Custom person/email' ? custom : owner).trim();
  if (!term) return true;
  // Owner/uploader metadata is not in the manifest — match only where it genuinely
  // appears (createdBy / signerName / notes). Never fabricated.
  return norm(r.createdBy).includes(term) || norm(r.signerName).includes(term) || norm(r.notes).includes(term);
}
function matchesLocation(r: ManifestSearchRow, loc: AdvancedState['location'], custom: string): boolean {
  if (loc === 'Anywhere') return true;
  if (loc === 'Custom') {
    const t = norm(custom).trim();
    if (!t) return true;
    return [r.fullFolderPath, r.parentFolderPath, r.folderName, r.folderId].some((v) => norm(v).includes(t));
  }
  return norm(r.fullFolderPath).includes(norm(loc));
}
function matchesDate(r: ManifestSearchRow, date: DateOpt, from: string, to: string): boolean {
  if (date === 'Any time') return true;
  if (!r.lastUpdated) return false;
  const d = new Date(r.lastUpdated);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (date === 'Custom date range') {
    if (from && d < new Date(from)) return false;
    if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); if (d > end) return false; }
    return true;
  }
  if (date === 'This year') return d.getFullYear() === now.getFullYear();
  const days = date === 'Today' ? 1 : date === 'Last 7 days' ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d >= cutoff;
}
const fieldContains = (val: string, q: string) => !q.trim() || norm(val).includes(norm(q).trim());

export function CesEvidenceSearch() {
  const [rows, setRows] = useState<ManifestSearchRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [term, setTerm] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [adv, setAdv] = useState<AdvancedState>(EMPTY_ADV);
  const [applied, setApplied] = useState<{ term: string; adv: AdvancedState } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecent(readRecent()); }, []);
  useEffect(() => {
    let on = true;
    CalendarApi.manifestRows()
      .then((r) => { if (on) { setRows(r.rows || []); setLoadErr(r.error ?? null); setLoading(false); } })
      .catch((e) => { if (on) { setRows([]); setLoadErr(e instanceof Error ? e.message : 'Manifest unavailable'); setLoading(false); } });
    return () => { on = false; };
  }, []);
  // Close the dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const commitRecent = useCallback((t: string) => { setRecent((cur) => writeRecent(t, cur)); }, []);

  // Run a basic (search-bar) search — a completed search records the term.
  const runBasicSearch = useCallback((raw?: string) => {
    const t = (raw ?? term).trim();
    setTerm(t);
    setAdv((a) => ({ ...EMPTY_ADV, hasWords: '', location: a.location })); // basic search resets advanced fields
    setApplied({ term: t, adv: EMPTY_ADV });
    if (t) commitRecent(t);
    setDropdownOpen(false);
  }, [term, commitRecent]);

  const runAdvancedSearch = useCallback(() => {
    const t = (adv.hasWords || term).trim();
    setApplied({ term, adv });
    if (t) commitRecent(t);
    setAdvancedOpen(false);
    setDropdownOpen(false);
  }, [adv, term, commitRecent]);

  const results = useMemo(() => {
    if (!applied) return null;
    const a = applied.adv;
    const text = applied.term;
    return rows.filter((r) =>
      matchesText(r, text)
      && fieldContains(haystack(r), a.hasWords)
      && (!a.itemName.trim() || fieldContains(r.rawFileName, a.itemName) || fieldContains(r.displayName, a.itemName))
      && matchesType(r, a.type)
      && matchesOwner(r, a.owner, a.ownerCustom)
      && matchesLocation(r, a.location, a.locationCustom)
      && matchesDate(r, a.date, a.dateFrom, a.dateTo)
      && fieldContains(r.eventId, a.eventId)
      && fieldContains(r.workflowId, a.workflowId)
      && fieldContains(r.policyId, a.policyId)
      && fieldContains(r.formId, a.formId)
      && fieldContains(r.packetName, a.packetName)
      && (a.status === 'Any status' || r.evidenceStatus === a.status),
    );
  }, [applied, rows]);

  const openRow = (r: ManifestSearchRow) => {
    const url = r.kind === 'folder' ? (r.folderUrl || r.driveLink) : (r.driveLink || r.folderUrl);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const setPresetLocation = (loc: AdvancedState['location']) => {
    const next = { ...EMPTY_ADV, location: loc };
    setAdv(next);
    setApplied({ term: term.trim(), adv: next });
    if (term.trim()) commitRecent(term.trim());
  };

  const clearSearch = () => { setTerm(''); setApplied(null); setAdv(EMPTY_ADV); };

  return (
    <div className="mb-8" ref={boxRef}>
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-full border border-[#EAE4E3] bg-[#FAFBF8] px-4 py-2.5 shadow-sm focus-within:border-[#007970]">
          <Search className="h-5 w-5 text-[#747470]" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') runBasicSearch(); if (e.key === 'Escape') setDropdownOpen(false); }}
            placeholder="Search CES Evidence Drive"
            className="flex-1 bg-transparent font-roboto text-sm text-[#1F1C1B] outline-none placeholder:text-[#A8A29E]"
            aria-label="Search CES Evidence Drive"
          />
          {(term || applied) && (
            <button type="button" onClick={clearSearch} className="rounded-full p-1 text-[#747470] hover:bg-[#EAE4E3]" aria-label="Clear search"><X className="h-4 w-4" /></button>
          )}
          <button type="button" onClick={() => { setAdv((a) => ({ ...a, hasWords: a.hasWords || term })); setAdvancedOpen(true); setDropdownOpen(false); }} className="rounded-full p-1.5 text-[#747470] hover:bg-[#EAE4E3]" aria-label="Advanced search" title="Advanced search">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => runBasicSearch()} className="rounded-full bg-[#007970] px-5 py-1.5 font-montserrat text-xs font-medium uppercase tracking-wider text-white hover:bg-[#005f58]">Search</button>
        </div>

        {/* Dropdown: only the last 5 real searches + Advanced Search */}
        {dropdownOpen && !advancedOpen && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#EAE4E3] bg-white shadow-xl">
            <div className="px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-[#A8A29E]">Recent searches</div>
            {recent.length === 0 ? (
              <div className="px-4 pb-3">
                <p className="font-roboto text-sm text-[#747470]">No recent searches yet</p>
                <p className="mt-1 font-roboto text-xs text-[#A8A29E]">Search by file name, event ID, packet, folder, form, policy, or Drive URL.</p>
              </div>
            ) : (
              <ul>
                {recent.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => runBasicSearch(s)} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#FAFBF8]">
                      <Clock className="h-4 w-4 text-[#A8A29E]" />
                      <span className="font-roboto text-sm text-[#1F1C1B]">{s}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => { setAdv((a) => ({ ...a, hasWords: a.hasWords || term })); setAdvancedOpen(true); }} className="flex w-full items-center gap-3 border-t border-[#EAE4E3] px-4 py-3 text-left hover:bg-[#FAFBF8]">
              <SlidersHorizontal className="h-4 w-4 text-[#007970]" />
              <span className="font-montserrat text-sm font-medium text-[#007970]">Advanced Search</span>
            </button>
          </div>
        )}
      </div>

      {/* Location presets (exactly 3) */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-roboto text-xs text-[#A8A29E]">Location:</span>
        {(['Anywhere', ...LOCATION_PRESETS] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setPresetLocation(loc as AdvancedState['location'])}
            className={`rounded-full border px-3 py-1 font-roboto text-xs transition-colors ${applied?.adv.location === loc ? 'border-[#007970] bg-[#E5FEFF] text-[#007970]' : 'border-[#EAE4E3] bg-white text-[#524D4B] hover:border-[#007970]'}`}
          >
            {loc === 'Anywhere' ? 'Anywhere in CES Evidence Drive' : loc}
          </button>
        ))}
      </div>

      {loadErr && <p className="mt-2 font-roboto text-xs text-[#C74601]">Manifest unavailable ({loadErr}). Search will work once the API is reachable.</p>}

      {/* Results */}
      {results && (
        <div className="mt-5 rounded-2xl border border-[#EAE4E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAE4E3] px-5 py-3">
            <span className="font-montserrat text-sm font-medium text-[#1F1C1B]">{results.length} result{results.length === 1 ? '' : 's'}{applied?.term ? ` for “${applied.term}”` : ''}</span>
            <button type="button" onClick={clearSearch} className="font-roboto text-xs text-[#007970] hover:underline">Clear</button>
          </div>
          {results.length === 0 ? (
            <div className="px-5 py-10 text-center font-roboto text-sm text-[#747470]">{loading ? 'Loading manifest…' : 'No matching evidence in the CES Evidence Drive manifest.'}</div>
          ) : (
            <ul className="max-h-[460px] divide-y divide-[#F1EEED] overflow-y-auto">
              {results.slice(0, 300).map((r, i) => (
                <li key={`${r.fileId || r.folderId}-${i}`}>
                  <button type="button" onClick={() => openRow(r)} className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-[#FAFBF8]">
                    {r.kind === 'folder' ? <FolderIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" /> : <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-roboto text-sm font-medium text-[#1F1C1B]">{r.displayName || r.rawFileName || r.folderName || '(untitled)'}</span>
                      <span className="block truncate font-roboto text-xs text-[#747470]">{r.fullFolderPath || r.parentFolderPath}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {r.fileType && <span className="rounded bg-[#F1EEED] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#747470]">{r.fileType}</span>}
                        {r.evidenceStatus && <span className="rounded bg-[#E5FEFF] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#007970]">{r.evidenceStatus}</span>}
                        {r.eventId && <span className="rounded bg-[#FFF0E5] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#C74601]">{r.eventId}</span>}
                        {r.formId && <span className="rounded bg-[#F3E8FF] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#7C3AED]">{r.formId}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Advanced Search modal */}
      {advancedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAdvancedOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-montserrat text-lg font-medium text-[#1F1C1B]">Advanced Search</h3>
              <button type="button" onClick={() => setAdvancedOpen(false)} className="rounded-full p-1.5 text-[#747470] hover:bg-[#EAE4E3]" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <Field label="Type">
                <select value={adv.type} onChange={(e) => setAdv({ ...adv, type: e.target.value as TypeOpt })} className={selectCls}>
                  {TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              <Field label="Owner / Uploaded by">
                <select value={adv.owner} onChange={(e) => setAdv({ ...adv, owner: e.target.value as OwnerOpt })} className={selectCls}>
                  {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {adv.owner === 'Custom person/email' && (
                  <input value={adv.ownerCustom} onChange={(e) => setAdv({ ...adv, ownerCustom: e.target.value })} placeholder="name or email" className={`${inputCls} mt-2`} />
                )}
              </Field>

              <Field label="Has the words"><input value={adv.hasWords} onChange={(e) => setAdv({ ...adv, hasWords: e.target.value })} placeholder="any of these words across metadata" className={inputCls} /></Field>
              <Field label="Item name"><input value={adv.itemName} onChange={(e) => setAdv({ ...adv, itemName: e.target.value })} placeholder="file name or display name" className={inputCls} /></Field>

              <Field label="Location">
                <select value={adv.location} onChange={(e) => setAdv({ ...adv, location: e.target.value as AdvancedState['location'] })} className={selectCls}>
                  <option value="Anywhere">Anywhere in CES Evidence Drive</option>
                  {LOCATION_PRESETS.map((o) => <option key={o} value={o}>{o}</option>)}
                  <option value="Custom">Custom folder path contains…</option>
                </select>
                {adv.location === 'Custom' && (
                  <input value={adv.locationCustom} onChange={(e) => setAdv({ ...adv, locationCustom: e.target.value })} placeholder="folder path / name / ID contains…" className={`${inputCls} mt-2`} />
                )}
              </Field>

              <Field label="Date modified">
                <select value={adv.date} onChange={(e) => setAdv({ ...adv, date: e.target.value as DateOpt })} className={selectCls}>
                  {DATE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {adv.date === 'Custom date range' && (
                  <div className="mt-2 flex gap-2">
                    <input type="date" value={adv.dateFrom} onChange={(e) => setAdv({ ...adv, dateFrom: e.target.value })} className={inputCls} />
                    <input type="date" value={adv.dateTo} onChange={(e) => setAdv({ ...adv, dateTo: e.target.value })} className={inputCls} />
                  </div>
                )}
              </Field>

              <fieldset className="rounded-2xl border border-[#EAE4E3] p-4">
                <legend className="px-1 font-roboto text-xs font-medium text-[#747470]">Evidence metadata</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={adv.eventId} onChange={(e) => setAdv({ ...adv, eventId: e.target.value })} placeholder="Event ID" className={inputCls} />
                  <input value={adv.workflowId} onChange={(e) => setAdv({ ...adv, workflowId: e.target.value })} placeholder="Workflow ID" className={inputCls} />
                  <input value={adv.policyId} onChange={(e) => setAdv({ ...adv, policyId: e.target.value })} placeholder="Policy ID" className={inputCls} />
                  <input value={adv.formId} onChange={(e) => setAdv({ ...adv, formId: e.target.value })} placeholder="Form ID" className={inputCls} />
                  <input value={adv.packetName} onChange={(e) => setAdv({ ...adv, packetName: e.target.value })} placeholder="Packet name" className={`${inputCls} sm:col-span-2`} />
                </div>
              </fieldset>

              <Field label="Evidence status">
                <select value={adv.status} onChange={(e) => setAdv({ ...adv, status: e.target.value as StatusOpt })} className={selectCls}>
                  {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setAdv(EMPTY_ADV)} className="rounded-full border border-[#EAE4E3] px-5 py-2 font-montserrat text-xs font-medium uppercase tracking-wider text-[#524D4B] hover:bg-[#FAFBF8]">Reset</button>
              <button type="button" onClick={() => setAdvancedOpen(false)} className="rounded-full px-5 py-2 font-montserrat text-xs font-medium uppercase tracking-wider text-[#747470] hover:bg-[#FAFBF8]">Cancel</button>
              <button type="button" onClick={runAdvancedSearch} className="rounded-full bg-[#007970] px-7 py-2 font-montserrat text-xs font-medium uppercase tracking-wider text-white hover:bg-[#005f58]">Search</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectCls = 'w-full rounded-xl border border-[#EAE4E3] bg-white px-3 py-2 font-roboto text-sm text-[#1F1C1B] outline-none focus:border-[#007970]';
const inputCls = 'w-full rounded-xl border border-[#EAE4E3] bg-white px-3 py-2 font-roboto text-sm text-[#1F1C1B] outline-none placeholder:text-[#A8A29E] focus:border-[#007970]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-roboto text-xs font-medium text-[#747470]">{label}</span>
      {children}
    </label>
  );
}

export default CesEvidenceSearch;
