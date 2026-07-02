import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, Bot, CalendarClock, CheckCircle2, ClipboardList, CloudUpload, Download,
  FileSearch, FileStack, FolderOpen, Loader2, Printer, ShieldCheck, Upload, XCircle,
} from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { Button, ToneBadge } from '@/v6/primitives';
import { MetricGrid, ToneTag, type MetricTileData } from '@/v6/components';
import { CalendarApi, type EvidenceHealthResponse } from '@/policy/services/calendarApi';
import {
  buildIdempotencyKey, buildEvidenceIdentityScope,
  detectFormat, extractRecordFromCell, generateMeetingAgenda, intakeId,
  parseSourceFile, resolvePacketMembershipsForEvidence, resolvePacketSignatureRequirement,
  runBradReview, sanitizeFileName,
  type BradReviewRun, type CanonicalEvidence, type EvidenceIntakeBatch,
  type EvidenceSourceRecord, type MeetingAgenda, type SourceSystem,
} from '@/policy/evidence/intake';
import {
  applyDriveOutcome, createDraftFormInstance, createPacketTasks, persistCanonicalEvidence,
} from '@/policy/evidence/intake/intakeService';
import { EVIDENCE_PACKET_TYPES_BY_ID } from '@/policy/evidence/packetStudio/evidencePacketTypes';

/* ─── Local view types ──────────────────────────────────────────── */

interface IntakeFile {
  fileId: string;
  fileName: string;
  format: string;
  parseStatus: string;
  recordCount: number;
  note?: string;
}

interface RecordRow extends EvidenceSourceRecord {
  rawFields: Record<string, unknown>;
  dedupKind?: 'new' | 'duplicate' | 'new_version';
  driveStatus?: 'pending' | 'uploading' | 'uploaded' | 'failed';
  driveError?: string;
  driveWebViewLink?: string;
  canonicalEvidenceId?: string;
  /** True once filed into Evidence Center (independent of Drive). */
  filed?: boolean;
}

const SOURCE_SYSTEMS: { value: SourceSystem; label: string }[] = [
  { value: 'unknown', label: 'Auto / Unknown' },
  { value: 'salesforce', label: 'Salesforce export' },
  { value: 'wellsky', label: 'WellSky export' },
  { value: 'care_indeed', label: 'Care Indeed system' },
  { value: 'manual', label: 'Manual upload' },
];

const ACCEPTED = '.json,.csv,.tsv,.md,.markdown,.txt,.xlsx,.xls,.pdf,.docx';

async function readFile(file: File): Promise<{ text?: string; headBytes: Uint8Array }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const headBytes = bytes.subarray(0, 8);
  const fmt = detectFormat(file.name, file.type, headBytes);
  let text: string | undefined;
  if (['json', 'csv', 'tsv', 'markdown', 'txt'].includes(fmt)) {
    text = new TextDecoder('utf-8').decode(bytes);
  }
  return { text, headBytes };
}

function base64FromString(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

const classTone = (c: string): 'teal' | 'orange' | 'slate' =>
  c === 'unknown_needs_review' ? 'orange' : 'teal';

export function BradEvidenceIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialEvent = searchParams.get('eventId') ?? searchParams.get('event') ?? undefined;
  const [eventId, setEventId] = useState<string | undefined>(
    initialEvent ?? REGULATORY_EVENTS.find((e) => /qapi/i.test(e.title))?.id ?? REGULATORY_EVENTS[0]?.id,
  );
  const selectedEvent = useMemo(() => REGULATORY_EVENTS.find((e) => e.id === eventId), [eventId]);
  const [sourceHint, setSourceHint] = useState<SourceSystem>('unknown');
  const [intendedMonth, setIntendedMonth] = useState<string>('');

  const [batch, setBatch] = useState<EvidenceIntakeBatch>(() => ({
    batchId: intakeId('BATCH'),
    uploadedBy: 'robertp@careindeed.com',
    uploadedAt: new Date().toISOString(),
    status: 'waiting_for_upload',
    sourceFileIds: [],
    recordCount: 0,
    parsedCount: 0,
    failedCount: 0,
    unresolvedCount: 0,
  }));
  const [files, setFiles] = useState<IntakeFile[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [review, setReview] = useState<BradReviewRun | null>(null);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [draftFormIds, setDraftFormIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [driveHealth, setDriveHealth] = useState<EvidenceHealthResponse | null>(null);
  const [toast, setToast] = useState<{ tone: 'teal' | 'orange'; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    CalendarApi.evidenceHealth().then((h) => { if (alive) setDriveHealth(h); }).catch(() => { if (alive) setDriveHealth({ ok: false, enabled: false, provider: 'unknown', drive: { reachable: false, error: 'unreachable' } }); });
    return () => { alive = false; };
  }, []);

  const driveReachable = !!driveHealth?.drive?.reachable;

  /* ─── Derived packet binding (declared before handlers that use it) ─── */
  const packetTypeForEvent = useMemo(() => {
    const wf = selectedEvent?.workflowId;
    if (wf) {
      for (const [, p] of EVIDENCE_PACKET_TYPES_BY_ID) if (p.workflowIds.includes(wf)) return p.packetTypeId;
    }
    if (/qapi/i.test(selectedEvent?.title ?? '')) return 'qapi-quarterly-committee';
    return 'custom-event-packet';
  }, [selectedEvent]);
  const packetBinding = useMemo(() => EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeForEvent), [packetTypeForEvent]);

  /* ─── Upload + parse + extract (real, client-side) ─────────────── */
  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setBusy('parsing');
    setBatch((b) => ({ ...b, status: 'parsing' }));
    const newFiles: IntakeFile[] = [];
    const newRecords: RecordRow[] = [];
    for (const file of Array.from(fileList)) {
      const fileId = intakeId('FILE', sanitizeFileName(file.name));
      const { text, headBytes } = await readFile(file);
      const parsed = parseSourceFile({ fileName: file.name, mimeType: file.type, text, headBytes, byteLength: file.size });
      newFiles.push({
        fileId, fileName: file.name, format: parsed.format, parseStatus: parsed.parseStatus,
        recordCount: parsed.records.length, note: parsed.note,
      });
      for (const cell of parsed.records) {
        const rec = extractRecordFromCell(cell, {
          batchId: batch.batchId, sourceFileId: fileId, sourceFileName: file.name,
          sourceSystem: sourceHint, uploadedAt: new Date().toISOString(),
        });
        newRecords.push({ ...rec, rawFields: cell.fields });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);

    // Compute dedup decisions across the full set (idempotency invariant).
    setRecords((prev) => {
      const all = [...prev, ...newRecords];
      const seen = new Map<string, string>(); // idempotencyKey -> identityScope (first)
      const identitySeen = new Set<string>();
      for (const r of all) {
        if (!r.filingPeriodKey) { r.dedupKind = undefined; continue; }
        const idem = buildIdempotencyKey({ sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId, sourceSystemCreatedAt: r.sourceSystemCreatedAt, contentHash: r.contentHash, sourcePointer: r.sourcePointer });
        const scope = buildEvidenceIdentityScope({ sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId, sourceSystemCreatedAt: r.sourceSystemCreatedAt, contentHash: r.contentHash, sourcePointer: r.sourcePointer });
        if (seen.has(idem)) r.dedupKind = 'duplicate';
        else if (identitySeen.has(scope)) r.dedupKind = 'new_version';
        else r.dedupKind = 'new';
        seen.set(idem, scope);
        identitySeen.add(scope);
      }
      return all;
    });

    const parsedCount = newRecords.length;
    const failedCount = newFiles.filter((f) => f.parseStatus !== 'parsed').length;
    const unresolved = newRecords.filter((r) => r.status === 'needs_date_review').length;
    setBatch((b) => ({
      ...b,
      status: unresolved > 0 ? 'needs_date_review' : 'classified',
      sourceFileIds: [...b.sourceFileIds, ...newFiles.map((f) => f.fileId)],
      recordCount: b.recordCount + parsedCount,
      parsedCount: b.parsedCount + parsedCount,
      failedCount: b.failedCount + failedCount,
      unresolvedCount: b.unresolvedCount + unresolved,
    }));
    setBusy(null);
    if (failedCount > 0) setToast({ tone: 'orange', text: `${failedCount} file(s) need supported extraction (XLSX/PDF/DOCX). Structured rows parsed where available.` });
  }, [batch.batchId, sourceHint]);

  const eventKeyFor = useCallback(() => eventId ?? `intake-${batch.batchId}`, [eventId, batch.batchId]);
  const readyRecords = useCallback(
    () => records.filter((r) => r.status !== 'needs_date_review' && r.filingPeriodKey && r.dedupKind !== 'duplicate'),
    [records],
  );

  /** Persist one ready record as canonical evidence in Evidence Center (idempotent, no Drive). */
  const persistOne = useCallback((r: RecordRow, eventKey: string) => {
    const id = { sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId, sourceSystemCreatedAt: r.sourceSystemCreatedAt, contentHash: r.contentHash, sourcePointer: r.sourcePointer };
    return persistCanonicalEvidence(r, {
      eventKey, eventId, workflowId: selectedEvent?.workflowId, policyIds: selectedEvent?.policyRefs ?? [],
      identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
    });
  }, [eventId, selectedEvent]);

  /* ─── File canonical evidence into Evidence Center (independent of Drive) ─── */
  const handleFileToEvidence = useCallback(() => {
    const eventKey = eventKeyFor();
    setBusy('file');
    const updated = new Map<string, RecordRow>();
    let filed = 0;
    for (const r of readyRecords()) {
      const persisted = persistOne(r, eventKey);
      if (persisted.evidenceId) {
        filed += 1;
        updated.set(r.sourceRecordKey, { ...r, canonicalEvidenceId: persisted.evidenceId, filed: true, driveStatus: r.driveStatus ?? 'pending' });
      }
    }
    setRecords((prev) => prev.map((r) => updated.get(r.sourceRecordKey) ?? r));
    setBatch((b) => ({ ...b, status: 'organized' }));
    setBusy(null);
    setToast(filed > 0
      ? { tone: 'teal', text: `Filed ${filed} canonical evidence record(s) into Evidence Center (Drive status: pending until uploaded).` }
      : { tone: 'orange', text: 'No records ready to file — resolve created dates first (bind a real CES event with policy + workflow).' });
  }, [eventKeyFor, readyRecords, persistOne]);

  /* ─── Upload canonical evidence to real Drive (honest; files first if needed) ─── */
  const handleDriveUpload = useCallback(async () => {
    if (!driveReachable) return;
    const eventKey = eventKeyFor();
    setBusy('drive');
    const updated = new Map<string, RecordRow>();
    for (const r of readyRecords()) {
      const persisted = persistOne(r, eventKey);
      const canonicalId = persisted.evidenceId;
      if (!canonicalId) continue;
      try {
        const out = await CalendarApi.intakeUploadEvidence({
          canonicalEvidenceId: canonicalId,
          filingPeriodKey: r.filingPeriodKey!,
          filingQuarterKey: r.filingQuarterKey ?? undefined,
          classification: r.classification,
          title: `${r.classification} ${r.sourcePointer}`,
          fileName: `${sanitizeFileName(r.sourceFileName)}-${r.sourcePointer.replace(/[^A-Za-z0-9]+/g, '-')}.json`,
          mimeType: 'application/json',
          contentBase64: base64FromString(JSON.stringify(r.rawFields, null, 2)),
          eventId,
        });
        applyDriveOutcome(eventKey, canonicalId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
        updated.set(r.sourceRecordKey, { ...r, canonicalEvidenceId: canonicalId, filed: true, driveStatus: 'uploaded', driveWebViewLink: out.driveWebViewLink });
      } catch (e) {
        const err = e as { message?: string; code?: string };
        applyDriveOutcome(eventKey, canonicalId, { ok: false, errorCode: err.code, errorMessage: err.message });
        updated.set(r.sourceRecordKey, { ...r, canonicalEvidenceId: canonicalId, filed: true, driveStatus: 'failed', driveError: err.message ?? err.code });
      }
    }
    setRecords((prev) => prev.map((r) => updated.get(r.sourceRecordKey) ?? r));
    const failed = [...updated.values()].filter((r) => r.driveStatus === 'failed').length;
    setBatch((b) => ({ ...b, status: 'organized' }));
    setBusy(null);
    setToast(failed > 0
      ? { tone: 'orange', text: `${updated.size - failed} uploaded to Drive, ${failed} failed (filed in Evidence Center, retryable).` }
      : { tone: 'teal', text: `${updated.size} canonical evidence file(s) uploaded to Drive.` });
  }, [driveReachable, eventKeyFor, readyRecords, persistOne, eventId]);

  /* ─── Brad full-population review ──────────────────────────────── */
  const handleReview = useCallback(() => {
    setBusy('review');
    const rawByKey: Record<string, Record<string, unknown>> = {};
    records.forEach((r) => { rawByKey[r.sourceRecordKey] = r.rawFields; });
    const run = runBradReview({
      batchId: batch.batchId,
      reviewRunId: intakeId('REVIEW'),
      reviewType: 'general',
      mode: 'full_population',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      eventId,
      records,
      rawFieldsByRecordKey: rawByKey,
      failedRecords: files.filter((f) => f.parseStatus !== 'parsed').length,
    });
    setReview(run);
    setBatch((b) => ({ ...b, status: run.status === 'partial' ? 'review_available' : 'review_available' }));
    setBusy(null);
  }, [records, files, batch.batchId, eventId]);

  const handleAgenda = useCallback(() => {
    if (!review) return;
    setAgenda(generateMeetingAgenda(review, { agendaId: intakeId('AGENDA'), generatedAt: new Date().toISOString(), eventId }));
    setBatch((b) => ({ ...b, status: 'drafts_ready' }));
  }, [review, eventId]);

  const handleDraftForms = useCallback(() => {
    if (!eventId) { setToast({ tone: 'orange', text: 'Select a CES event before generating draft forms.' }); return; }
    const binding = packetBinding;
    const created: string[] = [];
    for (const formId of binding?.requiredFormIds ?? []) {
      const id = createDraftFormInstance(eventId, formId, selectedEvent?.policyRefs ?? [], selectedEvent?.workflowId);
      if (id) created.push(id);
    }
    setDraftFormIds(created);
    setToast(created.length
      ? { tone: 'teal', text: `Created ${created.length} draft form instance(s) from real form IDs.` }
      : { tone: 'orange', text: 'No real form IDs resolved for this packet (needs mapping).' });
  }, [eventId, selectedEvent, packetBinding]);

  const handlePlanTasks = useCallback(() => {
    if (!eventId) { setToast({ tone: 'orange', text: 'Select a CES event before generating tasks.' }); return; }
    const packetTypeId = packetTypeForEvent;
    const packet = packetTypeId ? EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId) : undefined;
    const period = records.find((r) => r.filingPeriodKey)?.filingPeriodKey ?? intendedMonth ?? '';
    const packetId = `EPS-${packetTypeId ?? 'custom-event-packet'}-${period || 'period'}`;
    const specs = createPacketTasks({
      eventId,
      packetId,
      workflowId: selectedEvent?.workflowId,
      requiredSignerRoles: packet?.requiredSignerRoles ?? ['Director of Nursing', 'Administrator'],
      signer: { userId: 'robertp', roles: ['DON', 'Administrator'] },
      hasAgenda: !!agenda,
      hasDraftForms: draftFormIds.length > 0,
      hasUnresolvedDates: batch.unresolvedCount > 0,
    });
    setToast({ tone: 'teal', text: `Created ${specs.length} deterministic packet task(s), including exactly one signing task.` });
  }, [eventId, selectedEvent, records, intendedMonth, agenda, draftFormIds, batch.unresolvedCount, packetTypeForEvent]);

  /* ─── Derived (signing + membership previews) ──────────────────── */
  const signatureReq = useMemo(() => resolvePacketSignatureRequirement({
    packetId: `EPS-${packetTypeForEvent}-preview`,
    eventId: eventId ?? 'event',
    requiredSignerRoles: packetBinding?.requiredSignerRoles ?? ['Director of Nursing', 'Administrator'],
    signer: { userId: 'robertp', roles: ['DON', 'Administrator'] },
  }), [packetTypeForEvent, eventId, packetBinding]);

  const memberships = useMemo(() => {
    const first = records.find((r) => r.filingPeriodKey);
    if (!first) return [];
    const canon: CanonicalEvidence = {
      evidenceId: 'preview', batchId: batch.batchId, sourceFileName: first.sourceFileName, sourceFileId: first.sourceFileId,
      sourcePointer: first.sourcePointer, sourceSystem: first.sourceSystem, sourceRecordId: first.sourceRecordId,
      sourceSystemCreatedAt: first.sourceSystemCreatedAt, occurrenceAt: first.occurrenceAt, reportedAt: first.reportedAt,
      filingPeriodKey: first.filingPeriodKey!, filingQuarterKey: first.filingQuarterKey!, classification: first.classification,
      contentHash: first.contentHash, recordVersion: 1, driveFileId: null, driveFolderId: null, driveFolderPath: null,
      driveUploadStatus: 'pending', linkedEventIds: eventId ? [eventId] : [], linkedWorkflowIds: [], linkedSwimlaneIds: [],
      linkedPacketIds: [], createdAt: first.uploadedAt, createdBy: 'Brad',
    };
    return resolvePacketMembershipsForEvidence(canon, { eventId, workflowId: selectedEvent?.workflowId, createdBy: 'Brad' });
  }, [records, eventId, selectedEvent, batch.batchId]);

  const metrics: MetricTileData[] = [
    { label: 'Records', value: String(batch.recordCount), helper: 'Parsed source records', tone: 'teal' },
    { label: 'Needs date review', value: String(records.filter((r) => r.status === 'needs_date_review').length), helper: 'Ambiguous created date', tone: 'orange' },
    { label: 'Reviewed', value: review ? `${review.reviewedRecords}/${review.totalRecords}` : '—', helper: review?.status === 'partial' ? 'Partial' : 'Full population', tone: review?.status === 'partial' ? 'amber' : 'green' },
    { label: 'Drive', value: driveReachable ? 'Reachable' : 'Unavailable', helper: driveHealth ? (driveReachable ? 'Real persistence' : driveHealth.drive.error ?? 'offline') : 'checking…', tone: driveReachable ? 'green' : 'slate' },
  ];

  const hasReadyRecords = records.some((r) => r.status !== 'needs_date_review' && r.filingPeriodKey && r.dedupKind !== 'duplicate');

  return (
    <section className="grid gap-xl" data-hash-id="evidence-intake" data-route="/evidence/intake" data-template="evidence">
      <MetricGrid metrics={metrics} />

      {/* A. Intake header */}
      <section className="rounded-lg border border-hairline bg-surface-glass p-xl shadow-rest">
        <div className="flex flex-col gap-lg desktop:flex-row desktop:items-start desktop:justify-between">
          <div className="max-w-3xl">
            <ToneTag tone="teal">Brad Evidence Intake</ToneTag>
            <h1 className="mt-md text-3xl font-medium text-ink">Upload source exports — Brad files, reviews, and drafts</h1>
            <p className="mt-sm text-sm font-light leading-relaxed text-secondary">
              Brad parses uploaded source files, resolves each record&rsquo;s <strong>source-system created date</strong> (the filing
              month is never the occurrence or upload date), classifies and deduplicates the evidence, files it to Google Drive,
              runs a full-population review, and prepares draft forms, agendas, tasks, and a packet for human approval.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg text-xs text-secondary">
            <label className="grid gap-xs">Source system hint
              <select aria-label="Source system hint" title="Source system hint" value={sourceHint} onChange={(e) => setSourceHint(e.target.value as SourceSystem)} className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-sm text-sm text-ink">
                {SOURCE_SYSTEMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="grid gap-xs">Intended reporting period
              <input aria-label="Intended reporting period" title="Intended reporting period (YYYY-MM)" type="month" value={intendedMonth} onChange={(e) => setIntendedMonth(e.target.value)} className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-sm text-sm text-ink" />
            </label>
            <label className="grid gap-xs">CES event (packet binding)
              <select aria-label="CES event packet binding" title="CES event packet binding" value={eventId ?? ''} onChange={(e) => setEventId(e.target.value)} className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-sm text-sm text-ink">
                {REGULATORY_EVENTS.filter((e) => !e.isContext).slice(0, 80).map((e) => <option key={e.id} value={e.id}>{e.title} ({e.id})</option>)}
              </select>
            </label>
            <div className="flex items-center justify-between"><span>Status</span><ToneBadge status={batch.status === 'completed' ? 'validated' : 'review-required'} /></div>
          </div>
        </div>
      </section>

      {/* B. Upload area */}
      <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
        <div className="flex items-center justify-between gap-md">
          <h2 className="text-h2 font-medium text-ink">1. Upload source files</h2>
          <span className="text-xs text-muted">Accepted: JSON · CSV · TSV · MD · TXT (parsed) · XLSX · XLS · PDF · DOCX (extraction-gated)</span>
        </div>
        <div className="mt-lg flex flex-wrap items-center gap-sm">
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={busy === 'parsing'}>
            {busy === 'parsing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Choose files
          </Button>
          <span className="text-xs text-secondary">{files.length} file(s) · {batch.recordCount} record(s) · {batch.failedCount} need extraction</span>
        </div>
        {files.length > 0 && (
          <div className="mt-lg grid gap-sm">
            {files.map((f) => (
              <div key={f.fileId} className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-sm">
                <span className="flex items-center gap-sm text-ink"><FolderOpen className="h-4 w-4 text-brand-teal" /> {f.fileName}</span>
                <span className="flex items-center gap-sm text-xs text-muted">
                  <ToneTag tone="slate">{f.format}</ToneTag>
                  <ToneTag tone={f.parseStatus === 'parsed' ? 'teal' : 'orange'}>{f.parseStatus}{f.recordCount ? ` · ${f.recordCount} rec` : ''}</ToneTag>
                </span>
                {f.note && <span className="w-full text-xs text-tone-orange-text">{f.note}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* C. Record organization */}
      {records.length > 0 && (
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">2. Record organization &amp; created-date filing</h2>
          <p className="mt-xs text-xs text-secondary">Filing month/quarter is derived from the source-system created date. Occurrence dates are retained as metadata only.</p>
          <div className="mt-lg overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-[10px] uppercase tracking-tag text-muted">
                  <th className="py-sm pr-md">Source pointer</th>
                  <th className="py-sm pr-md">Created date</th>
                  <th className="py-sm pr-md">Occurrence</th>
                  <th className="py-sm pr-md">Filing</th>
                  <th className="py-sm pr-md">Classification</th>
                  <th className="py-sm pr-md">Dedup</th>
                  <th className="py-sm pr-md">Drive</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 200).map((r) => (
                  <tr key={r.sourceRecordKey} className="border-b border-hairline/60 text-secondary">
                    <td className="py-sm pr-md font-mono text-[11px] text-ink">{r.sourceFileName}<br /><span className="text-muted">{r.sourcePointer}</span></td>
                    <td className="py-sm pr-md">{r.resolvedCreatedAt ? <span title={r.createdDateSource ?? ''}>{r.resolvedCreatedAt.slice(0, 10)} <ToneTag tone={r.createdDateConfidence === 'high' ? 'teal' : r.createdDateConfidence === 'unresolved' ? 'orange' : 'slate'}>{r.createdDateConfidence}</ToneTag></span> : <ToneTag tone="orange">needs review</ToneTag>}</td>
                    <td className="py-sm pr-md">{r.occurrenceAt ? r.occurrenceAt.slice(0, 10) : '—'}</td>
                    <td className="py-sm pr-md">{r.filingPeriodKey ? <span className="text-ink">{r.filingPeriodKey} · {r.filingQuarterKey}</span> : '—'}</td>
                    <td className="py-sm pr-md"><ToneTag tone={classTone(r.classification)}>{r.classification}</ToneTag> <span className="text-muted">{Math.round(r.classificationConfidence * 100)}%</span></td>
                    <td className="py-sm pr-md">{r.dedupKind === 'duplicate' ? <ToneTag tone="slate">duplicate</ToneTag> : r.dedupKind === 'new_version' ? <ToneTag tone="orange">new version</ToneTag> : <ToneTag tone="teal">canonical</ToneTag>}</td>
                    <td className="py-sm pr-md">{r.driveStatus === 'uploaded'
                      ? (r.driveWebViewLink
                          ? <a href={r.driveWebViewLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-xs text-brand-teal hover:text-brand-teal-deep" title="View in Google Drive (secure link)"><CheckCircle2 className="h-4 w-4" /> Drive</a>
                          : <span className="inline-flex items-center gap-xs text-brand-teal"><CheckCircle2 className="h-4 w-4" /> uploaded</span>)
                      : r.driveStatus === 'failed' ? <span title={r.driveError} className="inline-flex"><XCircle className="h-4 w-4 text-[#c74601]" /></span>
                      : r.filed ? <span className="text-muted" title="Filed in Evidence Center; Drive upload pending">filed · pending</span>
                      : <span className="text-muted">not filed</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 200 && <p className="mt-sm text-xs text-muted">Showing first 200 of {records.length} records. Review covers the full population.</p>}
        </section>
      )}

      {/* Two-column: actions + Brad panels */}
      <section className="grid gap-xl desktop:grid-cols-1">
        <div className="grid gap-lg">
          {/* F. Actions */}
          <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">3. Actions</h2>
            <div className="mt-lg flex flex-wrap gap-sm">
              <Button variant="secondary" onClick={handleReview} disabled={records.length === 0 || busy === 'review'}>
                {busy === 'review' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />} Review all records (full population)
              </Button>
              <Button
                variant="secondary"
                onClick={handleFileToEvidence}
                disabled={!hasReadyRecords || busy === 'file'}
                title={!hasReadyRecords ? 'No records with a resolved created date to file.' : 'File canonical evidence into Evidence Center now (Drive upload is a separate step).'}
              >
                {busy === 'file' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />} File to Evidence Center
              </Button>
              <Button
                variant="secondary"
                onClick={handleDriveUpload}
                disabled={!driveReachable || !hasReadyRecords || busy === 'drive'}
                title={!driveReachable ? `Google Drive is not reachable (${driveHealth?.drive.error ?? 'offline'}). Configure the service account to enable real uploads.` : !hasReadyRecords ? 'No records with a resolved created date to upload.' : 'Upload canonical evidence to Drive (secure Drive link), filed by created date'}
              >
                {busy === 'drive' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />} Upload to Google Drive
              </Button>
              <Button variant="tertiary" onClick={handleDraftForms} disabled={!eventId} title={packetBinding?.mappingStatus === 'needs_mapping' ? 'Packet needs mapping — draft forms may be unavailable' : 'Generate draft form instances from real form IDs'}>
                <ClipboardList className="h-4 w-4" /> Generate draft forms
              </Button>
              <Button variant="tertiary" onClick={handleAgenda} disabled={!review} title={!review ? 'Run a review first — agendas use findings, not filenames' : 'Generate a meeting agenda from reviewed findings'}>
                <CalendarClock className="h-4 w-4" /> Generate meeting agenda
              </Button>
              <Button variant="tertiary" onClick={handlePlanTasks} disabled={!eventId} title="Create deterministic review/approval/signature tasks (one packet-signing task)">
                <ShieldCheck className="h-4 w-4" /> Generate review &amp; signature tasks
              </Button>
              <Button variant="tertiary" onClick={() => navigate(`/evidence/packet-studio${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`)}>
                <FileStack className="h-4 w-4" /> Open in Evidence Packet Studio
              </Button>
              <Button variant="tertiary" disabled title="Export runs in Evidence Packet Studio after human review and approval">
                <Printer className="h-4 w-4" /> Export PDF
              </Button>
              <Button variant="tertiary" disabled title="The final approved packet uploads to Drive from Evidence Packet Studio after signature">
                <Download className="h-4 w-4" /> Upload final packet to Drive
              </Button>
            </div>
            {toast && (
              <div className={`mt-md rounded-lg border p-md text-sm ${toast.tone === 'teal' ? 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'}`}>
                {toast.text}
              </div>
            )}
          </section>

          {/* E. Draft outputs */}
          {(review || agenda || draftFormIds.length > 0) && (
            <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
              <h2 className="text-h2 font-medium text-ink">4. Draft outputs (pending human approval)</h2>
              <div className="mt-lg grid gap-md">
                {review && (
                  <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
                    <div className="flex flex-wrap items-center gap-sm">
                      <ToneTag tone={review.status === 'partial' ? 'orange' : 'teal'}>{review.status}</ToneTag>
                      <span className="text-sm font-medium text-ink">Brad review — {review.modelOrEngineVersion}</span>
                    </div>
                    <p className="mt-sm text-sm text-secondary">{review.coverageStatement}</p>
                    <p className="mt-xs text-xs text-muted">Total {review.totalRecords} · reviewed {review.reviewedRecords} · failed/unreadable {review.failedRecords} · skipped {review.skippedRecords} · {review.findings.length} draft finding(s)</p>
                  </div>
                )}
                {agenda && (
                  <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
                    <div className="flex flex-wrap items-center gap-sm"><CalendarClock className="h-4 w-4 text-brand-teal" /><span className="text-sm font-medium text-ink">Draft meeting agenda</span>{agenda.basedOnPartialReview && <ToneTag tone="orange">partial coverage</ToneTag>}</div>
                    <p className="mt-sm text-xs text-secondary">{agenda.summary}</p>
                    <ul className="mt-sm grid gap-xs text-xs text-secondary">
                      {agenda.sections.slice(0, 6).map((s) => <li key={s.sectionId}>• <strong className="text-ink">{s.title}</strong> ({s.items.length})</li>)}
                    </ul>
                  </div>
                )}
                {draftFormIds.length > 0 && (
                  <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
                    <span className="text-sm font-medium text-ink">Draft form instances ({draftFormIds.length})</span>
                    <p className="mt-xs text-xs text-muted">{draftFormIds.join(', ')}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* D. Brad review panel + bindings */}
        <aside className="grid content-start gap-lg">
          <section className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
            <div className="flex items-center gap-sm"><Bot className="h-icon-sm w-icon-sm text-brand-teal" /><h2 className="text-h3 font-medium text-ink">Brad review</h2></div>
            {review ? (
              <div className="mt-md grid gap-sm text-sm">
                <div className="flex justify-between"><span className="text-secondary">Reviewed</span><strong className="text-ink">{review.reviewedRecords}/{review.totalRecords}</strong></div>
                <div className="flex justify-between"><span className="text-secondary">Failed / unreadable</span><strong className="text-ink">{review.failedRecords}</strong></div>
                <div className="flex justify-between"><span className="text-secondary">Findings</span><strong className="text-ink">{review.findings.length}</strong></div>
                <div className="mt-sm grid gap-xs">
                  {review.findings.slice(0, 5).map((f) => (
                    <div key={f.findingId} className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm text-xs">
                      <div className="flex items-center justify-between"><span className="font-medium text-ink">{f.findingType}</span><ToneTag tone={f.severity === 'critical' || f.severity === 'high' ? 'orange' : 'slate'}>{f.severity}</ToneTag></div>
                      <p className="mt-xs text-secondary">{f.factualBasis}</p>
                      <p className="mt-xs text-[10px] uppercase tracking-tag text-muted">{f.sourcePointer}{f.reference ? ` · ${f.reference}` : ''}{f.requiresLicensedClinicianReview ? ' · Requires licensed clinician review' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-md text-sm font-light text-secondary">Run <strong>Review all records</strong> for a full-population, draft-only review with per-record source pointers.</p>
            )}
          </section>

          <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <h2 className="text-h3 font-medium text-ink">Packet binding &amp; signers</h2>
            <div className="mt-md grid gap-sm text-xs text-secondary">
              <div className="flex justify-between"><span>Event</span><strong className="text-ink">{selectedEvent?.id ?? 'manual'}</strong></div>
              <div className="flex justify-between"><span>Packet type</span><strong className="text-ink">{packetBinding?.label ?? 'Custom'}</strong></div>
              <div className="flex justify-between"><span>Mapping</span><ToneTag tone={packetBinding?.mappingStatus === 'ready' ? 'teal' : packetBinding?.mappingStatus === 'partial' ? 'orange' : 'slate'}>{packetBinding?.mappingStatus ?? 'needs_mapping'}</ToneTag></div>
              <div className="mt-sm rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm">
                <span className="font-medium text-ink">Signing</span>
                <p className="mt-xs">Roles: {signatureReq.requiredSignerRoles.join(' / ')}</p>
                <p>Signatures required: <strong className="text-ink">{signatureReq.requiredSignatureCount}</strong>{signatureReq.dualCapacity ? ' (dual-capacity DON + Administrator)' : ''}</p>
                {signatureReq.dualCapacity && <p className="mt-xs italic text-muted">{signatureReq.attestationText}</p>}
              </div>
            </div>
          </section>

          {memberships.length > 0 && (
            <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
              <h2 className="text-h3 font-medium text-ink">Packet memberships (preview)</h2>
              <p className="mt-xs text-[10px] uppercase tracking-tag text-muted">One canonical record → monthly + quarterly + classification packets</p>
              <div className="mt-md grid gap-sm">
                {memberships.map((m) => (
                  <div key={m.membershipId} className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm text-xs">
                    <span className="font-medium text-ink">{m.packetId}</span>
                    <p className="mt-xs text-secondary">{m.inclusionReason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!driveReachable && driveHealth && (
            <section className="rounded-lg border border-tone-orange-border bg-tone-orange-bg p-lg text-xs text-tone-orange-text">
              <div className="flex items-center gap-sm"><AlertTriangle className="h-4 w-4" /><strong>Drive not reachable</strong></div>
              <p className="mt-xs">Real Drive persistence is not configured ({driveHealth.drive.error ?? 'offline'}). Uploads are disabled — no simulated success is recorded. Configure the service account to enable real evidence filing.</p>
            </section>
          )}
        </aside>
      </section>
    </section>
  );
}

export default BradEvidenceIntake;
