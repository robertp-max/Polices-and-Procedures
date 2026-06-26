import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CloudUpload, ExternalLink, FileStack, Loader2, Upload, XCircle } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { CalendarApi, type EvidenceHealthResponse } from '@/policy/services/calendarApi';
import {
  buildEvidenceIdentityScope, buildIdempotencyKey, detectFormat, extractRecordFromCell,
  parseSourceFile, sanitizeFileName, type EvidenceSourceRecord, type SourceSystem,
} from '@/policy/evidence/intake';
import { applyDriveOutcome, persistCanonicalEvidence } from '@/policy/evidence/intake/intakeService';

/* ════════════════════════════════════════════════════════════════
   Studio landing — the rebranded generation surface. Launches the
   full branded Care Indeed Packet Studio and folds in the one useful
   capability from the old Intake tab: drop source files → parse,
   resolve created-date, classify, and FILE them into the Evidence
   Library (and Drive when reachable). Light glass theme.
   ════════════════════════════════════════════════════════════════ */

const STUDIO_URL = '/care_indeed_pdf_studio.html';
const ACCEPTED = '.json,.csv,.tsv,.md,.markdown,.txt';

const CADENCES = [
  { label: 'Monthly QAPI', hint: 'qapi_monthly' },
  { label: 'Quarterly QAPI', hint: 'qapi_quarterly' },
  { label: 'Annual QAPI', hint: 'qapi_annual' },
  { label: 'Governing Body', hint: 'governing_body' },
  { label: 'Clinical Record Review', hint: 'clinical_record_review' },
];

async function readText(file: File): Promise<{ text?: string; headBytes: Uint8Array }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const fmt = detectFormat(file.name, file.type, bytes.subarray(0, 8));
  const text = ['json', 'csv', 'tsv', 'markdown', 'txt'].includes(fmt) ? new TextDecoder('utf-8').decode(bytes) : undefined;
  return { text, headBytes: bytes.subarray(0, 8) };
}
function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

export function StudioLanding() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const [driveHealth, setDriveHealth] = useState<EvidenceHealthResponse | null>(null);
  const [eventId, setEventId] = useState<string>(
    REGULATORY_EVENTS.find((e) => /qapi/i.test(e.title) && (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId)?.id
    ?? REGULATORY_EVENTS.find((e) => !e.isContext)?.id ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ filed: number; uploaded: number; failed: number } | null>(null);

  useEffect(() => {
    let on = true;
    CalendarApi.evidenceHealth().then((h) => on && setDriveHealth(h)).catch(() => on && setDriveHealth({ ok: false, enabled: false, provider: 'unknown', drive: { reachable: false, error: 'unreachable' } }));
    return () => { on = false; };
  }, []);
  const driveReachable = !!driveHealth?.drive?.reachable;

  const events = useMemo(() => REGULATORY_EVENTS.filter((e) => !e.isContext), []);
  const selectedEvent = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);
  const filedCount = useMemo(
    () => (Object.values(evidenceByEvent).flat() as EvidenceDoc[]).filter((d) => d.artifactVersion === 'evidence-intake-v1').length,
    [evidenceByEvent],
  );

  const launch = useCallback(() => window.open(STUDIO_URL, '_blank', 'noopener,noreferrer'), []);

  const handleFiles = useCallback(async (list: FileList | null) => {
    if (!list || !list.length || !selectedEvent) return;
    setBusy(true);
    let filed = 0, uploaded = 0, failed = 0;
    const policyIds = selectedEvent.policyRefs ?? [];
    const workflowId = selectedEvent.workflowId;
    for (const file of Array.from(list)) {
      const { text, headBytes } = await readText(file);
      const parsed = parseSourceFile({ fileName: file.name, mimeType: file.type, text, headBytes, byteLength: file.size });
      if (parsed.parseStatus !== 'parsed') { failed += 1; continue; }
      const fileId = `FILE-${sanitizeFileName(file.name)}-${Date.now()}`;
      for (const cell of parsed.records) {
        const rec: EvidenceSourceRecord = extractRecordFromCell(cell, {
          batchId: `studio-${Date.now()}`, sourceFileId: fileId, sourceFileName: file.name,
          sourceSystem: 'unknown' as SourceSystem, uploadedAt: new Date().toISOString(),
        });
        if (rec.status === 'needs_date_review' || !rec.filingPeriodKey) continue;
        const id = { sourceSystem: rec.sourceSystem, sourceRecordId: rec.sourceRecordId, sourceSystemCreatedAt: rec.sourceSystemCreatedAt, contentHash: rec.contentHash, sourcePointer: rec.sourcePointer };
        const persisted = persistCanonicalEvidence(rec, {
          eventKey: eventId, eventId, workflowId, policyIds,
          identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
        });
        if (!persisted.evidenceId || persisted.reused) continue;
        filed += 1;
        if (driveReachable) {
          try {
            const out = await CalendarApi.intakeUploadEvidence({
              canonicalEvidenceId: persisted.evidenceId, filingPeriodKey: rec.filingPeriodKey,
              filingQuarterKey: rec.filingQuarterKey ?? undefined, classification: rec.classification,
              title: `${rec.classification} ${rec.sourcePointer}`,
              fileName: `${sanitizeFileName(file.name)}-${rec.sourcePointer.replace(/[^A-Za-z0-9]+/g, '-')}.json`,
              mimeType: 'application/json', contentBase64: b64(JSON.stringify(cell.fields, null, 2)), eventId,
            });
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
            uploaded += 1;
          } catch (e) {
            const err = e as { message?: string; code?: string };
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: false, errorCode: err.code, errorMessage: err.message });
            failed += 1;
          }
        }
      }
    }
    setResult({ filed, uploaded, failed });
    setBusy(false);
  }, [selectedEvent, eventId, driveReachable]);

  return (
    <section className="grid gap-lg">
      {/* Hero / launch */}
      <section className="rounded-lg border border-hairline bg-surface-glass p-xl shadow-rest">
        <div className="flex flex-col gap-lg desktop:flex-row desktop:items-start desktop:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-sm text-brand-teal"><FileStack className="h-icon-sm w-icon-sm" /><span className="text-tag uppercase tracking-tag">Evidence Packet Studio</span></div>
            <h1 className="mt-sm text-3xl font-medium text-ink">Generate a branded, survey-defensible packet</h1>
            <p className="mt-sm text-sm font-light leading-relaxed text-secondary">
              Build the full multi-page Care Indeed packet — cover, agenda, KPI dashboards, findings, evidence index, signature blocks — for monthly, quarterly, and annual cadences. Source documents you add here are filed into the Evidence Library and Drive, ready to assemble.
            </p>
            <div className="mt-lg flex flex-wrap items-center gap-sm">
              <button type="button" onClick={launch} className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white hover:bg-brand-teal-deep">
                <ExternalLink className="h-icon-sm w-icon-sm" /> Launch Packet Studio
              </button>
              <span className={`flex items-center gap-xs rounded-full border px-md py-xs text-xs ${driveReachable ? 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'}`}>
                <span className={`h-2 w-2 rounded-full ${driveReachable ? 'bg-brand-teal' : 'bg-[#c74601]'}`} />
                Google Drive {driveReachable ? 'connected' : (driveHealth ? 'unavailable' : 'checking…')}
              </span>
              <span className="text-xs text-muted">{filedCount} evidence item(s) in the Library</span>
            </div>
          </div>
        </div>
        <div className="mt-lg flex flex-wrap gap-sm">
          {CADENCES.map((c) => (
            <button key={c.hint} type="button" onClick={launch} className="rounded-lg border border-card bg-tone-slate-bg px-md py-sm text-xs font-medium text-secondary hover:bg-surface-hover hover:text-brand-teal-deep">
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Add source documents → file into Library */}
      <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h2 className="text-h2 font-medium text-ink">Add source documents</h2>
            <p className="mt-xs text-xs text-secondary">JSON · CSV · TSV · MD · TXT — Brad resolves the source-system created date, classifies, dedupes, and files each record into the Evidence Library{driveReachable ? ' and Google Drive' : ''}.</p>
          </div>
          <label className="grid gap-xs text-xs text-secondary">
            File to event
            <select aria-label="File to event" title="File to event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="min-w-[260px] rounded-lg border border-hairline bg-surface px-md py-sm text-sm text-ink">
              {events.slice(0, 80).map((e) => <option key={e.id} value={e.id}>{e.title} ({e.id})</option>)}
            </select>
          </label>
        </div>
        <div className="mt-lg flex flex-wrap items-center gap-sm">
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy || !eventId} className="flex items-center gap-sm rounded-lg border border-card bg-tone-slate-bg px-md py-sm text-sm text-secondary hover:bg-surface-hover disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Choose files
          </button>
          {driveReachable && <span className="flex items-center gap-xs text-xs text-muted"><CloudUpload className="h-4 w-4 text-brand-teal" /> Uploads to Drive automatically</span>}
        </div>
        {result && (
          <div className={`mt-md flex flex-wrap items-center gap-md rounded-lg border p-md text-sm ${result.failed > 0 ? 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text' : 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep'}`}>
            <span className="flex items-center gap-xs"><CheckCircle2 className="h-4 w-4" /> Filed {result.filed} to Library</span>
            {driveReachable && <span className="flex items-center gap-xs"><CloudUpload className="h-4 w-4" /> {result.uploaded} uploaded to Drive</span>}
            {result.failed > 0 && <span className="flex items-center gap-xs"><XCircle className="h-4 w-4" /> {result.failed} failed/skipped</span>}
            <span className="text-xs text-muted">Open the Evidence Library tab to browse them.</span>
          </div>
        )}
      </section>
    </section>
  );
}

export default StudioLanding;
