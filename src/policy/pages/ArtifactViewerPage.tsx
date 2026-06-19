import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ExternalLink, FileImage, FileText, FileWarning, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import { resolveEvidenceDataUrl, dataUrlToBlobUrlForHtml, prefetchDemoEvidenceFromIdb } from '@/policy/evidence/demoEvidenceRuntimeCache';
import { getFlag as getPmFlag } from '@/policy/pm/featureFlags';
import {
  formInstanceLinkAliases,
  resolveFormInstanceFromArtifactCandidates,
} from '@/policy/compliance-execution/cesFormInstanceId';
import { resolveFormInstanceFromArtifact } from '@/policy/artifacts/artifactToFormInstance';
import { isEvidenceImmutable } from '@/policy/evidence/evidenceModel';

type ArtifactKind = 'form_instance' | 'evidence' | 'signature' | 'audit_packet' | 'evidence_package' | 'metadata_only' | 'unknown';

interface MetadataRow {
  label: string;
  value: string;
}

function parseNoteField(note: string | undefined, key: string): string | undefined {
  if (!note) return undefined;
  const match = note.match(new RegExp(`${key}=([^;]+)`, 'i'));
  return match?.[1]?.trim();
}
function parseEcignSessionId(note: string | undefined): string | undefined {
  return parseNoteField(note, 'ecign_session_id') || parseNoteField(note, 'ecign_instance_id');
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

/** Avoid blank iframes: huge data URLs fail in browsers; use a revocable blob URL for the session.
 *  Handles both HTML and PDF data URLs. */
function useIframeSafeSrc(raw: string | undefined): string | undefined {
  const [out, setOut] = useState<string | undefined>(raw);
  const revokeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (revokeRef.current) {
      URL.revokeObjectURL(revokeRef.current);
      revokeRef.current = undefined;
    }
    if (!raw) {
      setOut(undefined);
      return;
    }
    if (raw.startsWith('data:text/html') && raw.length > 80_000) {
      const blobUrl = dataUrlToBlobUrlForHtml(raw);
      if (blobUrl) {
        revokeRef.current = blobUrl;
        setOut(blobUrl);
        return;
      }
    }
    // PDF data URLs — convert to blob URL so the browser's native PDF viewer handles it.
    if (raw.startsWith('data:application/pdf')) {
      try {
        const resp = fetch(raw);
        resp.then(r => r.blob()).then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          revokeRef.current = blobUrl;
          setOut(blobUrl);
        });
        return;
      } catch { /* fall through */ }
    }
    setOut(raw);
    return () => {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = undefined;
      }
    };
  }, [raw]);
  return out;
}

function decodeHtmlDataUrl(dataUrl: string): string | undefined {
  if (!dataUrl.startsWith('data:text/html')) return undefined;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return undefined;
  const meta = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  try {
    if (/;base64/i.test(meta)) {
      const binary = atob(payload.replace(/\s/g, ''));
      const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    }
    return decodeURIComponent(payload);
  } catch {
    return undefined;
  }
}


/**
 * Render the signed HTML artifact in an iframe directly.
 *
 * Previously this hook used html2pdf.js → html2canvas to rasterize the
 * HTML into a PDF. That pipeline lost text fidelity, broke fonts, and
 * routinely dropped the Care Indeed brand logo. The user has demanded
 * the artifact PDF look IDENTICAL to the print view; the only way to
 * guarantee that is to render the SAME HTML the print view uses.
 *
 * We now convert the HTML data URL into a blob URL (since data URLs
 * over ~2 MB break iframe rendering in Chrome) and display it natively.
 */
function useHtmlToPdfBlobUrl(
  htmlDataUrl: string | undefined,
  shouldConvert: boolean,
  _pdfTitle?: string,
): { pdfBlobUrl: string | undefined; converting: boolean } {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | undefined>(undefined);
  const revokeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (revokeRef.current) {
      URL.revokeObjectURL(revokeRef.current);
      revokeRef.current = undefined;
    }
    setPdfBlobUrl(undefined);

    if (!htmlDataUrl || !shouldConvert) return;
    if (!htmlDataUrl.startsWith('data:text/html')) return;

    try {
      const decoded = decodeHtmlDataUrl(htmlDataUrl);
      if (!decoded) return;
      const blob = new Blob([decoded], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      revokeRef.current = blobUrl;
      setPdfBlobUrl(blobUrl);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[ArtifactViewer] failed to materialize HTML blob URL', err);
    }

    return () => {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = undefined;
      }
    };
  }, [htmlDataUrl, shouldConvert]);

  return { pdfBlobUrl, converting: false };
}

function classifyEvidencePreview(doc: EvidenceDoc): 'image' | 'pdf' | 'html' | 'file' | 'missing' {
  const url = resolveEvidenceDataUrl(doc);
  if (!url) return 'missing';
  const mime = (doc.mimeType || '').toLowerCase();
  const lowerName = doc.name.toLowerCase();
  if (url.startsWith('data:image') || mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerName)) {
    return 'image';
  }
  if (url.startsWith('data:application/pdf') || mime.includes('pdf') || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (url.startsWith('data:text/html') || mime.includes('html') || lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
    return 'html';
  }
  return 'file';
}

export function ArtifactViewerPage() {
  const { artifactId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const queryArtifactType = searchParams.get('type') || undefined;
  const qEventId = searchParams.get('event_id') || undefined;
  const qTaskId = searchParams.get('task_id') || undefined;
  const qFormId = searchParams.get('form_id') || undefined;
  const qFormInstanceId = searchParams.get('form_instance_id') || undefined;
  const qEvidenceId = searchParams.get('evidence_id') || undefined;

  const store = useRegulatoryExecutionStore();
  const generatedEvents = useAutogenStore(state => state.generatedEvents);
  const triggeredEvents = useAutogenStore(state => state.triggeredEvents);

  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents],
    [generatedEvents, triggeredEvents],
  );

  const formInstances = useMemo(
    () => dedupeById(Object.values(store.generatedFormInstancesByEventId).flat()),
    [store.generatedFormInstancesByEventId],
  );
  const evidence = useMemo(
    () => dedupeById(Object.values(store.evidence).flat()),
    [store.evidence],
  );
  const auditRows = useMemo(
    () => Object.values(store.taskAuditByEventId).flat(),
    [store.taskAuditByEventId],
  );

  /* ─── MVP-P0-ECIGN-002 — IDB prefetch on mount (Wave 3) ───────────────
   * The Wave 2 evidence cache writes large blobs to IndexedDB (memory +
   * localStorage cap to ~4 MB; IDB is the only durable channel for big
   * signed-package HTML). The synchronous `resolveEvidenceDataUrl` used
   * throughout this page only checks memory + localStorage; on a cold tab
   * reload, IDB-only blobs would render as missing artifacts.
   *
   * To preserve the "stored snapshot is byte-stable + retrievable" invariant
   * across full page reloads, we proactively warm the memory cache from IDB
   * for every evidence row visible to this page. The set is bounded by the
   * already-deduplicated `evidence` array; we stringify the id list to
   * suppress no-op re-runs while the page is mounted.
   *
   * Gated on `signed_snapshot_capture` flag for instant rollback.
   * Per MVP plan L1208 ("ECIGN-002 — cache version bump; old browsers
   * re-init; no data loss") the IDB schema is governed by the Wave 2
   * `EVIDENCE_BLOB_DB_VERSION` constant; this prefetch is read-only and
   * does not create or migrate stores.
   *
   * Post-Wave-5A defect fix (DEFECT_ARTIFACT_RETRIEVAL_INVESTIGATION_REPORT):
   * after the prefetch resolves we bump `memCacheVersion` so the
   * `immutableFormArtifactUrl` useMemo below re-runs and the sync
   * `resolveEvidenceDataUrl` re-reads the now-warm memCache. Without this
   * bump, IDB-only blobs (e.g. > 4 MB packets after localStorage eviction)
   * hydrated into memCache invisibly to React and the viewer rendered the
   * amber "Signed artifact not available in this session" banner forever. */
  const evidenceIdsKey = useMemo(() => evidence.map(d => d.id).sort().join('|'), [evidence]);
  const [memCacheVersion, setMemCacheVersion] = useState(0);
  useEffect(() => {
    if (!getPmFlag('signed_snapshot_capture')) return;
    if (!evidenceIdsKey) return;
    const ids = evidenceIdsKey.split('|').filter(Boolean);
    if (ids.length === 0) return;
    let cancelled = false;
    prefetchDemoEvidenceFromIdb(ids)
      .then(() => { if (!cancelled) setMemCacheVersion(v => v + 1); })
      .catch(() => { /* IDB best-effort; sync layer still works */ });
    return () => { cancelled = true; };
  }, [evidenceIdsKey]);

  const resolved = useMemo(() => {
    const primaryId = decodeURIComponent(artifactId).trim();
    const candidates = [primaryId, qEvidenceId, qFormInstanceId].filter((value): value is string => Boolean(value));
    const normalizedType = (queryArtifactType || '').toLowerCase();
    if ((normalizedType === 'evidence_package' || normalizedType === 'package') && qEventId && qTaskId) {
      // ── Normalize task id for evidence package lookups ──
      // Upstream callers often pass `${taskId}:package` (a virtual artifact
      // id). The package contents live under the bare task id, so strip any
      // trailing `:package` / `::package` suffix before matching.
      const normalizedTaskId = qTaskId.replace(/[:]{1,2}package$/i, '');
      return { kind: 'evidence_package' as const, eventId: qEventId, taskId: normalizedTaskId };
    }

    const evidenceByPrimary = evidence.find(item => item.id === primaryId);
    if (
      evidenceByPrimary &&
      (normalizedType === 'evidence' || normalizedType === 'signed_package' || normalizedType === 'signed_form_instance' || normalizedType === '')
    ) {
      return { kind: 'evidence' as const, evidenceDoc: evidenceByPrimary };
    }

    const formByPrimary = resolveFormInstanceFromArtifact({
      primaryArtifactId: primaryId,
      queryFormInstanceId: qFormInstanceId,
      formInstances,
      evidence,
      preferEvidenceBinding: normalizedType === 'evidence' || normalizedType === 'signed_package' || normalizedType === 'signed_form_instance',
    }).formInstance;
    if (formByPrimary) {
      return { kind: 'form_instance' as const, formInstance: formByPrimary };
    }
    if (evidenceByPrimary) {
      return { kind: 'evidence' as const, evidenceDoc: evidenceByPrimary };
    }
    const approvalByPrimary = store.approvals.find(item => item.id === primaryId);
    if (approvalByPrimary) {
      return { kind: 'signature' as const, approval: approvalByPrimary };
    }

    const formInstance = candidates
      .map(id => resolveFormInstanceFromArtifactCandidates(id, formInstances) ?? formInstances.find(item => item.id === id))
      .find(Boolean);
    if (formInstance) {
      return { kind: 'form_instance' as const, formInstance };
    }

    const evidenceDoc = candidates.map(id => evidence.find(item => item.id === id)).find(Boolean);
    if (evidenceDoc) {
      return { kind: 'evidence' as const, evidenceDoc };
    }

    const approval = candidates.map(id => store.approvals.find(item => item.id === id)).find(Boolean);
    if (approval) {
      return { kind: 'signature' as const, approval };
    }

    const certificationEntry = Object.entries(store.certifications).find(([, cert]) => cert.auditPacketRef === primaryId);
    if (certificationEntry) {
      return { kind: 'audit_packet' as const, eventId: certificationEntry[0], certification: certificationEntry[1] };
    }

    const auditHit = auditRows.find(row => row.auditId === primaryId || row.entityId === primaryId);
    if (auditHit) {
      return { kind: 'metadata_only' as const, auditHit };
    }

    return { kind: 'unknown' as const };
  }, [artifactId, qEvidenceId, qFormInstanceId, evidence, formInstances, store.approvals, store.certifications, auditRows, queryArtifactType, qEventId, qTaskId]);

  const metadata = useMemo((): { kind: ArtifactKind; rows: MetadataRow[]; auditEvents: string[] } => {
    const unknownRows: MetadataRow[] = [
      { label: 'Artifact ID', value: decodeURIComponent(artifactId || '') || '—' },
      { label: 'Artifact Type', value: queryArtifactType || 'unknown' },
      { label: 'Event ID', value: qEventId || '—' },
      { label: 'Task ID', value: qTaskId || '—' },
      { label: 'Requirement ID', value: '—' },
      { label: 'Form ID', value: qFormId || '—' },
      { label: 'Form Instance ID', value: qFormInstanceId || '—' },
      { label: 'Evidence ID', value: qEvidenceId || '—' },
      { label: 'Policy ID', value: '—' },
      { label: 'Workflow ID', value: '—' },
      { label: 'Uploaded/Completed By', value: '—' },
      { label: 'Uploaded/Completed Date', value: '—' },
      { label: 'Status', value: 'unknown' },
      { label: 'Version', value: '—' },
    ];

    if (resolved.kind === 'form_instance') {
      const form = FORMS_DATASET.find(item => item.id === resolved.formInstance.formId);
      const event = allEvents.find(item => item.id === resolved.formInstance.eventId);
      const relatedAudit = auditRows
        .filter(row =>
          row.entityId === resolved.formInstance.id
          || (row.after && JSON.stringify(row.after).includes(resolved.formInstance.id))
          || row.eventId === resolved.formInstance.eventId,
        )
        .slice(0, 30)
        .map(row => `${new Date(row.timestamp).toLocaleString()} · ${row.action}`);
      return {
        kind: 'form_instance',
        rows: [
          { label: 'Artifact ID', value: resolved.formInstance.id },
          { label: 'Artifact Type', value: 'completed_form_instance' },
          { label: 'Event ID', value: resolved.formInstance.eventId },
          { label: 'Task ID', value: resolved.formInstance.taskId || qTaskId || '—' },
          { label: 'Requirement ID', value: resolved.formInstance.requirementId || '—' },
          { label: 'Form ID', value: resolved.formInstance.formId },
          { label: 'Form Instance ID', value: resolved.formInstance.id },
          { label: 'Evidence ID', value: '—' },
          { label: 'Policy ID', value: resolved.formInstance.policyIds[0] || event?.policyRefs?.[0] || '—' },
          { label: 'Workflow ID', value: resolved.formInstance.workflowId || event?.workflowId || '—' },
          { label: 'Uploaded/Completed By', value: 'Current User' },
          { label: 'Uploaded/Completed Date', value: resolved.formInstance.updatedAt || resolved.formInstance.createdAt },
          { label: 'Status', value: resolved.formInstance.status },
          { label: 'Version', value: String(resolved.formInstance.sequence) },
          { label: 'Form Template Name', value: form?.name ?? resolved.formInstance.formId },
        ],
        auditEvents: relatedAudit,
      };
    }

    if (resolved.kind === 'evidence') {
      const doc = resolved.evidenceDoc;
      const requirementId = qTaskId ? `${qTaskId}::evidence` : parseNoteField(doc.note, 'requirement_id');
      const ecignSessionId = doc.ecignSessionId || doc.signatureSessionId || parseEcignSessionId(doc.note) || '—';
      const relatedAudit = auditRows
        .filter(row =>
          row.entityId === doc.id
          || (row.after && JSON.stringify(row.after).includes(doc.id))
          || row.eventId === doc.eventId,
        )
        .slice(0, 30)
        .map(row => `${new Date(row.timestamp).toLocaleString()} · ${row.action}`);
      return {
        kind: 'evidence',
        rows: [
          { label: 'Artifact ID', value: doc.id },
          { label: 'Artifact Type', value: doc.artifactType || queryArtifactType || doc.kind || 'evidence' },
          { label: 'Event ID', value: doc.eventId },
          { label: 'Task ID', value: doc.taskId || qTaskId || '—' },
          { label: 'Requirement ID', value: requirementId || '—' },
          { label: 'Form ID', value: doc.linkedFormId || doc.formIds[0] || qFormId || '—' },
          { label: 'Form Instance ID', value: doc.linkedFormInstanceId || qFormInstanceId || '—' },
          { label: 'eCIgn Session ID', value: ecignSessionId },
          { label: 'Evidence ID', value: doc.id },
          { label: 'Policy ID', value: doc.policyId || doc.policyIds[0] || '—' },
          { label: 'Workflow ID', value: doc.workflowId || '—' },
          { label: 'Uploaded/Completed By', value: doc.uploadedBy || doc.createdBy || '—' },
          { label: 'Uploaded/Completed Date', value: doc.uploadedAt || doc.createdAt || '—' },
          { label: 'Status', value: doc.status },
          { label: 'Version', value: String(doc.version) },
          ...(doc.driveFileId ? [{ label: 'Drive File ID', value: doc.driveFileId }] : []),
          ...(doc.driveFolderId ? [{ label: 'Drive Folder ID', value: doc.driveFolderId }] : []),
          ...(doc.webViewLink ? [{ label: 'Drive Web URL', value: doc.webViewLink }] : []),
          ...(doc.driveUploadedAt ? [{ label: 'Drive Uploaded At', value: doc.driveUploadedAt }] : []),
          ...(doc.driveUploadStatus ? [{ label: 'Drive Upload Status', value: doc.driveUploadStatus }] : []),
        ],
        auditEvents: relatedAudit,
      };
    }

    if (resolved.kind === 'signature') {
      const relatedAudit = auditRows
        .filter(row => row.entityId === resolved.approval.id || row.eventId === resolved.approval.eventId)
        .slice(0, 30)
        .map(row => `${new Date(row.timestamp).toLocaleString()} · ${row.action}`);
      return {
        kind: 'signature',
        rows: [
          { label: 'Artifact ID', value: resolved.approval.id },
          { label: 'Artifact Type', value: 'ecign_signature' },
          { label: 'Event ID', value: resolved.approval.eventId },
          { label: 'Task ID', value: resolved.approval.targetId || qTaskId || '—' },
          { label: 'Requirement ID', value: 'signature_required' },
          { label: 'Form ID', value: resolved.approval.targetKind === 'form' ? (resolved.approval.targetId || '—') : '—' },
          { label: 'Form Instance ID', value: qFormInstanceId || '—' },
          { label: 'Evidence ID', value: qEvidenceId || '—' },
          { label: 'Policy ID', value: '—' },
          { label: 'Workflow ID', value: '—' },
          { label: 'Uploaded/Completed By', value: resolved.approval.approver || resolved.approval.requestedBy || '—' },
          { label: 'Uploaded/Completed Date', value: resolved.approval.decidedAt || resolved.approval.requestedAt || '—' },
          { label: 'Status', value: resolved.approval.status },
          { label: 'Version', value: '1' },
        ],
        auditEvents: relatedAudit,
      };
    }

    if (resolved.kind === 'audit_packet') {
      const relatedAudit = auditRows
        .filter(row => row.eventId === resolved.eventId)
        .slice(0, 30)
        .map(row => `${new Date(row.timestamp).toLocaleString()} · ${row.action}`);
      return {
        kind: 'audit_packet',
        rows: [
          { label: 'Artifact ID', value: resolved.certification.auditPacketRef || decodeURIComponent(artifactId) },
          { label: 'Artifact Type', value: 'audit_packet_export' },
          { label: 'Event ID', value: resolved.eventId },
          { label: 'Task ID', value: qTaskId || '—' },
          { label: 'Requirement ID', value: 'event_certification' },
          { label: 'Form ID', value: qFormId || '—' },
          { label: 'Form Instance ID', value: qFormInstanceId || '—' },
          { label: 'Evidence ID', value: qEvidenceId || '—' },
          { label: 'Policy ID', value: allEvents.find(event => event.id === resolved.eventId)?.policyRefs?.[0] || '—' },
          { label: 'Workflow ID', value: allEvents.find(event => event.id === resolved.eventId)?.workflowId || '—' },
          { label: 'Uploaded/Completed By', value: resolved.certification.certifiedBy || '—' },
          { label: 'Uploaded/Completed Date', value: resolved.certification.certifiedAt || '—' },
          { label: 'Status', value: resolved.certification.disposition || 'certified' },
          { label: 'Version', value: '1' },
        ],
        auditEvents: relatedAudit,
      };
    }

    if (resolved.kind === 'evidence_package') {
      const packageAudit = auditRows
        .filter(row => row.eventId === resolved.eventId && (!row.entityType || row.entityType === 'task' || row.entityId === resolved.taskId))
        .slice(0, 40)
        .map(row => `${new Date(row.timestamp).toLocaleString()} · ${row.action}`);
      const linkedFormCount = formInstances.filter(i => i.eventId === resolved.eventId && (i.taskId === resolved.taskId || !resolved.taskId)).length;
      const linkedEvidenceCount = evidence.filter(d => d.eventId === resolved.eventId && (d.taskId === resolved.taskId || !resolved.taskId)).length;
      const totalLinkedDocs = linkedFormCount + linkedEvidenceCount;
      const packageStatus = totalLinkedDocs > 0 ? 'package_ready' : 'incomplete — 0 linked documents';
      return {
        kind: 'evidence_package',
        rows: [
          { label: 'Artifact ID', value: decodeURIComponent(artifactId) || `${resolved.eventId}::${resolved.taskId}` },
          { label: 'Artifact Type', value: 'evidence_package' },
          { label: 'Event ID', value: resolved.eventId },
          { label: 'Task ID', value: resolved.taskId },
          { label: 'Requirement ID', value: qTaskId ? `${qTaskId}::package` : '—' },
          { label: 'Form ID', value: qFormId || '—' },
          { label: 'Form Instance ID', value: qFormInstanceId || '—' },
          { label: 'Evidence ID', value: qEvidenceId || '—' },
          { label: 'Policy ID', value: allEvents.find(event => event.id === resolved.eventId)?.policyRefs?.[0] || '—' },
          { label: 'Workflow ID', value: allEvents.find(event => event.id === resolved.eventId)?.workflowId || '—' },
          { label: 'Uploaded/Completed By', value: 'Current User' },
          { label: 'Uploaded/Completed Date', value: new Date().toISOString() },
          { label: 'Status', value: packageStatus },
          { label: 'Linked Documents', value: String(totalLinkedDocs) },
          { label: 'Version', value: '1' },
        ],
        auditEvents: packageAudit,
      };
    }

    if (resolved.kind === 'metadata_only') {
      return {
        kind: 'metadata_only',
        rows: [
          ...unknownRows,
          { label: 'Artifact Type', value: resolved.auditHit.entityType || queryArtifactType || 'metadata_only' },
          { label: 'Event ID', value: resolved.auditHit.eventId },
          { label: 'Status', value: resolved.auditHit.action },
        ],
        auditEvents: [`${new Date(resolved.auditHit.timestamp).toLocaleString()} · ${resolved.auditHit.action}`],
      };
    }

    return { kind: 'unknown', rows: unknownRows, auditEvents: [] };
  }, [resolved, artifactId, queryArtifactType, qEventId, qTaskId, qFormId, qFormInstanceId, qEvidenceId, allEvents, auditRows]);

  const activeEvidence = resolved.kind === 'evidence' ? resolved.evidenceDoc : null;
  const previewMode = activeEvidence ? classifyEvidencePreview(activeEvidence) : null;
  const evidencePreviewUrl = activeEvidence ? resolveEvidenceDataUrl(activeEvidence) : undefined;
  const evidencePdfSafeSrc = useIframeSafeSrc(previewMode === 'pdf' ? evidencePreviewUrl : undefined);

  // Resolve the full eCIgn Signature Packet FIRST so it can be used as the iframe src.
  // When opening a signed_form_instance or signed_certificate evidence artifact, we always
  // prefer to display the linked signed_package (full packet: form + certificate + audit trail)
  // instead of the bare form-only HTML.
  const ecignPacketPrintUrl = useMemo(() => {
    if (!activeEvidence) return undefined;
    const at = activeEvidence.artifactType || activeEvidence.kind;
    if (at !== 'signed_form_instance' && at !== 'signed_certificate') return undefined;
    const sessionId = parseEcignSessionId(activeEvidence.note);
    const packet = evidence.find(doc => {
      if ((doc.artifactType || doc.kind) !== 'signed_package') return false;
      if (doc.eventId !== activeEvidence.eventId) return false;
      if (sessionId) return parseEcignSessionId(doc.note) === sessionId;
      return doc.linkedFormInstanceId === activeEvidence.linkedFormInstanceId;
    });
    return packet ? resolveEvidenceDataUrl(packet) : undefined;
  }, [activeEvidence, evidence]);

  // When we have a signed_package URL, use it as the iframe source; otherwise fall back to the
  // raw evidence data URL. The hook must be called unconditionally (Rules of Hooks).
  // Also handle the case where the evidence doc's own data is missing (previewMode === 'missing')
  // but the linked eCIgn packet still has a valid URL — without this, the iframe gets src=""
  // and renders about:blank.
  const hasPacketFallback = previewMode === 'missing' && !!ecignPacketPrintUrl;
  const rawEvidenceHtmlSrc = (previewMode === 'html' || hasPacketFallback) ? (ecignPacketPrintUrl ?? evidencePreviewUrl) : undefined;
  const evidenceHtmlIframeSrc = useIframeSafeSrc(rawEvidenceHtmlSrc);

  // Auto-convert signed HTML evidence to a real PDF for display.
  const isSignedArtifact = activeEvidence
    ? ['signed_package', 'signed_form_instance', 'signed_certificate'].includes(activeEvidence.artifactType || activeEvidence.kind || '')
    : false;
  const evidencePdfTitle = activeEvidence?.name?.replace(/\.html?$/i, '.pdf') || 'signed-document.pdf';
  const { pdfBlobUrl: evidencePdfBlobUrl, converting: evidencePdfConverting } = useHtmlToPdfBlobUrl(
    rawEvidenceHtmlSrc,
    isSignedArtifact && (previewMode === 'html' || hasPacketFallback),
    evidencePdfTitle,
  );

  const packageContext = useMemo(() => {
    if (resolved.kind !== 'evidence_package') return null;
    const taskFormInstances = formInstances.filter(instance => (
      instance.eventId === resolved.eventId
      && (instance.taskId === resolved.taskId || !resolved.taskId)
    ));
    const taskEvidence = evidence.filter(doc => (
      doc.eventId === resolved.eventId
      && (doc.taskId === resolved.taskId || !resolved.taskId)
    ));
    const taskApprovals = store.approvals.filter(approval => (
      approval.eventId === resolved.eventId
      && (approval.targetId === resolved.taskId || approval.note?.includes(resolved.taskId))
    ));
    const taskAudit = auditRows.filter(row => (
      row.eventId === resolved.eventId
      && (row.entityId === resolved.taskId || row.entityType === 'task' || row.entityType === 'evidence' || row.entityType === 'formInstance')
    ));
    return { taskFormInstances, taskEvidence, taskApprovals, taskAudit };
  }, [resolved, formInstances, evidence, store.approvals, auditRows]);
  const formWorkspaceRoute = resolved.kind === 'form_instance'
    ? `/forms/${encodeURIComponent(resolved.formInstance.formId)}?form_instance_id=${encodeURIComponent(resolved.formInstance.id)}&event_id=${encodeURIComponent(resolved.formInstance.eventId)}&task_id=${encodeURIComponent(resolved.formInstance.taskId || qTaskId || '')}&form_id=${encodeURIComponent(resolved.formInstance.formId)}`
    : '';

  /**
   * Immutable execution snapshot priority:
   * Prefer signed_package (full eCIgn packet: form + certificate + audit trail + integrity)
   * over signed_form_instance (form only without certificate).
   */
  const { immutableFormArtifactUrl, fullPacketUrl } = useMemo(() => {
    if (resolved.kind !== 'form_instance') return { immutableFormArtifactUrl: undefined, fullPacketUrl: undefined };
    const linkAliases = new Set(formInstanceLinkAliases(resolved.formInstance));
    const linked = evidence.filter(doc => doc.linkedFormInstanceId && linkAliases.has(doc.linkedFormInstanceId));
    const ts = (d: EvidenceDoc) => new Date(d.finalizedAt || d.uploadedAt || d.createdAt).getTime();
    const latest = (docs: EvidenceDoc[]) => [...docs].sort((a, b) => ts(b) - ts(a))[0];
    const formOnly = linked.filter(d => d.artifactType === 'signed_form_instance' || d.kind === 'signed_form_instance');
    const packets = linked.filter(d => d.artifactType === 'signed_package' || d.kind === 'signed_package');
    const packetsLocked = packets.filter(d => d.status === 'EVIDENCE_LOCKED');
    const bestPacket = latest(packetsLocked.length ? packetsLocked : packets);
    const bestFormOnly = latest(formOnly);
    const packetUrl = bestPacket ? resolveEvidenceDataUrl(bestPacket) : undefined;
    const formOnlyUrl = bestFormOnly ? resolveEvidenceDataUrl(bestFormOnly) : undefined;
    return {
      immutableFormArtifactUrl: packetUrl || formOnlyUrl,
      fullPacketUrl: packetUrl,
    };
    // memCacheVersion is intentionally a dep without being referenced in the
    // body: it's a re-run tick bumped by the IDB prefetch effect above after
    // memCache is warmed, so the sync `resolveEvidenceDataUrl` calls hit the
    // newly hydrated bytes. Removing it re-introduces the rendering bug where
    // IDB-only blobs (e.g. >4 MB packets after localStorage eviction) appear
    // permanently unavailable in the viewer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, evidence, memCacheVersion]);

  const formInstanceIsTerminal = resolved.kind === 'form_instance'
    && ['COMPLETED', 'SIGNED', 'LOCKED'].includes(resolved.formInstance.status);
  // Never embed the live editable workspace for a locked/signed/completed form —
  // only show the immutable signed snapshot, or a "no snapshot" message.
  const allowLiveWorkspace = resolved.kind === 'form_instance'
    && !immutableFormArtifactUrl
    && !formInstanceIsTerminal;
  const completedFormIframeSrc = immutableFormArtifactUrl
    || (allowLiveWorkspace ? formWorkspaceRoute : undefined);
  const iframeDisplaySrcRaw = useIframeSafeSrc(completedFormIframeSrc);

  // Auto-convert signed form instance HTML to real PDF for display.
  const formPdfTitle = resolved.kind === 'form_instance'
    ? `${resolved.formInstance.formId}-${resolved.formInstance.id}.pdf`
    : 'signed-form.pdf';
  const { pdfBlobUrl: formPdfBlobUrl, converting: formPdfConverting } = useHtmlToPdfBlobUrl(
    immutableFormArtifactUrl,
    formInstanceIsTerminal && !!immutableFormArtifactUrl && immutableFormArtifactUrl.startsWith('data:text/html'),
    formPdfTitle,
  );
  const iframeDisplaySrc = formPdfBlobUrl || iframeDisplaySrcRaw;

  return (
    <div
      className="h-full overflow-auto px-6 py-6 font-roboto text-[#263C3D]"
      style={{
        background:
          'radial-gradient(circle at 76% -10%, rgba(255,255,255,0.95), transparent 30%), radial-gradient(circle at 8% 8%, rgba(0,121,112,0.08), transparent 34%), linear-gradient(135deg, #EEF9F9 0%, #F8FFFF 52%, #F2FAFA 100%)',
      }}
    >
      <div className="mb-6">
        <PageHeader
          eyebrow="ARTIFACTS / TRACE"
          title={decodeURIComponent(artifactId || '') || 'Artifact Viewer'}
          description="Immutable execution snapshot. Signed artifacts, evidence packages, and audit records rendered with full fidelity."
          actions={
            <Link
              to="/evidence"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DDEBEB] bg-white/78 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#426768] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_28px_-24px_rgba(0,65,66,0.35)] transition hover:border-[#B8E9E7] hover:text-[#004142]"
            >
              ← Back to Evidence Center
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-[22px] border border-[#DDEBEB] bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_26px_70px_-48px_rgba(0,65,66,0.50)] backdrop-blur-[18px]">
          {metadata.kind === 'form_instance' && resolved.kind === 'form_instance' && (
            <div className="mb-4 rounded-[16px] border border-[#B8E9E7] bg-[#F0FBFB] p-4 text-sm text-[#263C3D]">
              <div className="font-semibold text-[#004142]">Completed form instance record</div>
              <div className="mt-1 text-xs text-[#426768]">
                Template <code>{resolved.formInstance.formId}</code> is the reusable definition. Completed instance <code>{resolved.formInstance.id}</code> is the execution artifact.
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to={formWorkspaceRoute}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#B8E9E7] bg-white/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#007970]"
                >
                  Open form workspace <ExternalLink size={12} />
                </Link>
                {iframeDisplaySrc && (
                  <a
                    href={iframeDisplaySrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[#DDEBEB] bg-white/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#426768]"
                  >
                    Open full view
                  </a>
                )}
                {(fullPacketUrl || iframeDisplaySrc) && (
                  <button
                    type="button"
                    onClick={async () => {
                      /*
                       * Download = open packet HTML in a print popup and let
                       * the browser save it as PDF via its native print
                       * engine. This is the SAME pipeline the print view
                       * uses, so the resulting PDF is byte-for-byte
                       * identical to what the user sees.  No html2pdf.js.
                       */
                      const printSrc = fullPacketUrl || immutableFormArtifactUrl;
                      if (!printSrc) return;
                      const formTemplateName = FORMS_DATASET.find(item => item.id === resolved.formInstance.formId)?.name;
                      const fname = `${(formTemplateName || resolved.formInstance.formId).replace(/[/\\?%*:|"<>]/g, '-').trim()} — ${resolved.formInstance.id}`;
                      if (printSrc.startsWith('data:application/pdf')) {
                        const resp = await fetch(printSrc);
                        const blob = await resp.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = `${fname}.pdf`;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                        return;
                      }
                      // HTML packet — open print popup so the browser PDF engine handles save.
                      let html: string;
                      if (printSrc.startsWith('data:text/html')) {
                        html = decodeHtmlDataUrl(printSrc) ?? '';
                        if (!html) return;
                      } else {
                        const r = await fetch(printSrc);
                        html = await r.text();
                      }
                      const win = window.open('', '_blank', 'width=840,height=980');
                      if (!win) return;
                      win.document.write(html);
                      win.document.title = fname;
                      win.document.close();
                      const print = () => { try { win.focus(); win.print(); } catch { /* noop */ } };
                      win.addEventListener('load', print, { once: true });
                      setTimeout(print, 450);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#FFD8C6] bg-[#FFF6F1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C74601]"
                  >
                    Download PDF
                  </button>
                )}
              </div>
              {immutableFormArtifactUrl && (
                <p className="mt-2 text-[10px] text-[#607C7D]">
                  Showing persisted signed snapshot. The workspace link opens the live form for reference.
                </p>
              )}
              <div className="mt-3 rounded-[8px] border border-[#DDEBEB] bg-white p-2 shadow-[0_24px_62px_-42px_rgba(0,65,66,0.48)]">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#426768]">
                  Completed form rendering
                </div>
                {immutableFormArtifactUrl && (
                  <p className="mb-2 text-[10px] text-[#007970]">
                    Showing persisted immutable snapshot (signed form instance or signed package). This is not a live editable workspace.
                  </p>
                )}
                {formInstanceIsTerminal && !immutableFormArtifactUrl && (
                  <div className="mb-2 space-y-1 rounded-[12px] border border-[#FFD8C6] bg-[#FFF6F1] p-2 text-[11px] text-[#9A3412]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="rounded bg-[#FFE5D6] px-1 py-0.5 text-[9px] uppercase tracking-widest text-[#C74601]">MISSING</span>
                      Artifact not available
                    </div>
                    <p>
                      Signed document data must be persisted via the real backend/Drive path for production evidence.
                      Session-only storage is not supported for final CES artifacts.
                    </p>
                    <p className="text-[#C74601]">
                      Ensure Google Drive persistence is configured and the eCign finalize succeeded with Drive metadata.
                      Re-attempt finalize after fixing configuration.
                    </p>
                  </div>
                )}
                {iframeDisplaySrc ? (
                  <div className="relative">
                    {formPdfConverting && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/80 backdrop-blur-[2px]">
                        <div className="text-center">
                          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-[#B8E9E7] border-t-[#007970]" />
                          <p className="text-[11px] text-[#007970]">Generating PDF...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      title={`form-instance-${resolved.formInstance.id}`}
                      src={iframeDisplaySrc}
                      className="h-[72vh] min-h-[680px] w-full rounded-[4px] border border-[#DDEBEB] bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-[10px] border border-[#DDEBEB] bg-[#F8FFFF] text-xs text-[#607C7D]">
                    No renderable preview for this state.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeEvidence && (
            <div className="space-y-3">
              {(isEvidenceImmutable(activeEvidence.status) || activeEvidence.auditFrozen) && (
                <div className="rounded-full border border-[#B8E9E7] bg-[#F0FBFB] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#007970]">
                  {activeEvidence.auditFrozen ? 'Audit-frozen evidence — no replacement or supersede' : 'Locked evidence — immutable record'}
                </div>
              )}
              {previewMode === 'image' && (
                <div className="rounded-[8px] border border-[#DDEBEB] bg-white p-2 shadow-[0_24px_62px_-42px_rgba(0,65,66,0.48)]">
                  <img src={evidencePreviewUrl} alt={activeEvidence.name} className="max-h-[72vh] min-h-[520px] w-full rounded-[4px] object-contain" />
                </div>
              )}
              {previewMode === 'pdf' && (
                <div className="h-[72vh] min-h-[680px] rounded-[8px] border border-[#DDEBEB] bg-white p-2 shadow-[0_24px_62px_-42px_rgba(0,65,66,0.48)]">
                  <iframe title={activeEvidence.name} src={evidencePdfSafeSrc || evidencePreviewUrl || ''} className="h-full w-full rounded-[4px] border border-[#DDEBEB]" />
                </div>
              )}
              {(previewMode === 'html' || (!!ecignPacketPrintUrl && previewMode === 'missing')) && (
                <div className="relative h-[78vh] min-h-[720px] rounded-[8px] border border-[#DDEBEB] bg-white p-2 shadow-[0_24px_62px_-42px_rgba(0,65,66,0.48)]">
                  {evidencePdfConverting && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/80 backdrop-blur-[2px]">
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-[#B8E9E7] border-t-[#007970]" />
                        <p className="text-[11px] text-[#007970]">Generating PDF...</p>
                      </div>
                    </div>
                  )}
                  {(evidencePdfBlobUrl || evidenceHtmlIframeSrc) ? (
                    <iframe title={activeEvidence.name} src={evidencePdfBlobUrl || evidenceHtmlIframeSrc} className="h-full w-full rounded-[4px] border border-[#DDEBEB] bg-white" />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[4px] border border-[#DDEBEB] bg-[#F8FFFF] text-xs text-[#607C7D]">
                      Signed document preview is loading or unavailable.
                    </div>
                  )}
                </div>
              )}
              {previewMode === 'file' && (
                <div className="rounded-[14px] border border-[#DDEBEB] bg-white p-3 text-sm text-[#426768]">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-[#004142]"><FileText size={15} /> Document preview is not supported inline.</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={evidencePreviewUrl || '#'} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#B8E9E7] bg-[#F0FBFB] px-3 py-1 text-xs font-semibold text-[#007970]">
                      Open file
                    </a>
                    <a href={evidencePreviewUrl || '#'} download={activeEvidence.name} className="rounded-full border border-[#DDEBEB] bg-white/78 px-3 py-1 text-xs font-semibold text-[#426768]">
                      Download
                    </a>
                  </div>
                </div>
              )}
              {previewMode === 'missing' && !ecignPacketPrintUrl && (
                <div className="rounded-[14px] border border-[#FFD8C6] bg-[#FFF6F1] p-3 text-sm text-[#9A3412]">
                  <div className="mb-2 flex items-center gap-2"><FileWarning size={15} /> File data not found</div>
                  <p>This document may have been uploaded before persistence was enabled, or exceeded the storage limit. Re-upload to make it viewable.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {evidencePreviewUrl && (
                  <>
                    <a href={evidencePreviewUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#B8E9E7] bg-[#F0FBFB] px-3 py-1 text-xs font-semibold text-[#007970]">
                      Open document
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        /*
                         * Download = open packet HTML in a print popup so the
                         * browser's native PDF engine produces the saved file.
                         * This is the SAME rendering pipeline as the print
                         * view, ensuring 1:1 visual fidelity, including the
                         * Care Indeed brand header.
                         */
                        const printSrc = ecignPacketPrintUrl || evidencePreviewUrl;
                        if (!printSrc) return;
                        if (printSrc.startsWith('data:application/pdf') || (activeEvidence.mimeType === 'application/pdf' && printSrc.startsWith('data:'))) {
                          const resp = await fetch(printSrc);
                          const blob = await resp.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          a.download = activeEvidence.name.endsWith('.pdf') ? activeEvidence.name : activeEvidence.name.replace(/\.html?$/i, '') + '.pdf';
                          a.click();
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                          return;
                        }
                        if (!printSrc.startsWith('data:text/html')) {
                          const a = document.createElement('a');
                          a.href = printSrc;
                          a.download = activeEvidence.name;
                          a.click();
                          return;
                        }
                        const html = decodeHtmlDataUrl(printSrc);
                        if (!html) return;
                        const fname = (activeEvidence.name || activeEvidence.linkedFormId || 'eCIgn-Artifact').replace(/[/\\?%*:|"<>]/g, '-').trim().replace(/\.html?$/i, '');
                        const win = window.open('', '_blank', 'width=840,height=980');
                        if (!win) return;
                        win.document.write(html);
                        win.document.title = fname;
                        win.document.close();
                        const print = () => { try { win.focus(); win.print(); } catch { /* noop */ } };
                        win.addEventListener('load', print, { once: true });
                        setTimeout(print, 450);
                      }}
                      className="rounded-full border border-[#B8E9E7] bg-white/78 px-3 py-1 text-xs font-semibold text-[#007970]"
                    >
                      Download PDF
                    </button>
                  </>
                )}
                {!evidencePreviewUrl && activeEvidence.objectPath && (
                  <div className="rounded-[12px] border border-[#DDEBEB] bg-white/78 px-3 py-2 text-[11px] text-[#607C7D]">
                    Object path: <code className="text-[#263C3D]">{activeEvidence.objectPath}</code>
                    <span className="ml-2 text-[#C74601]">— no file data found; re-upload or re-sign to persist</span>
                  </div>
                )}
                <Link
                  to={buildArtifactRoute(activeEvidence.id, {
                    eventId: activeEvidence.eventId,
                    taskId: activeEvidence.taskId,
                    formId: activeEvidence.linkedFormId || activeEvidence.formIds[0],
                    formInstanceId: activeEvidence.linkedFormInstanceId,
                    evidenceId: activeEvidence.id,
                    type: activeEvidence.kind,
                  })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#DDEBEB] bg-white/78 px-3 py-1 text-xs font-semibold text-[#426768]"
                >
                  <FileImage size={12} /> Artifact permalink
                </Link>
              </div>
            </div>
          )}

          {metadata.kind === 'evidence_package' && packageContext && resolved.kind === 'evidence_package' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-[16px] border border-[#B8E9E7] bg-[#F0FBFB] p-3">
                <div className="font-semibold text-[#004142]">Evidence package summary</div>
                <div className="mt-1 text-[#426768]">
                  Event <code>{resolved.eventId}</code> · Task <code>{resolved.taskId}</code>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>Form instances: <span className="font-semibold text-[#004142]">{packageContext.taskFormInstances.length}</span></div>
                  <div>Evidence files: <span className="font-semibold text-[#004142]">{packageContext.taskEvidence.length}</span></div>
                  <div>Signatures/certificates: <span className="font-semibold text-[#004142]">{packageContext.taskApprovals.length}</span></div>
                  <div>Audit rows: <span className="font-semibold text-[#004142]">{packageContext.taskAudit.length}</span></div>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#DDEBEB] bg-white/78 p-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#426768]">Completed Form Instances</div>
                {packageContext.taskFormInstances.length === 0 ? (
                  <p className="text-[#607C7D]">No linked form instances.</p>
                ) : (
                  <ul className="space-y-1">
                    {packageContext.taskFormInstances.map(instance => (
                      <li key={instance.id} className="flex flex-wrap items-center gap-2 text-[#263C3D]">
                        <span>{instance.formId}</span>
                        <span className="text-[#607C7D]">· {instance.status}</span>
                        <Link className="font-semibold text-[#007970] underline" to={buildArtifactRoute(instance.id, { eventId: instance.eventId, taskId: instance.taskId, formId: instance.formId, formInstanceId: instance.id, type: 'form_instance' })} target="_blank" rel="noopener noreferrer">Open</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-[16px] border border-[#DDEBEB] bg-white/78 p-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#426768]">Uploaded Evidence &amp; Signed Documents</div>
                {packageContext.taskEvidence.length === 0 ? (
                  <p className="text-[#607C7D]">No linked evidence artifacts.</p>
                ) : (
                  <ul className="space-y-2">
                    {packageContext.taskEvidence.map(doc => {
                      const docUrl = resolveEvidenceDataUrl(doc);
                      return (
                        <li key={doc.id} className="rounded-[12px] border border-[#E2EEEE] bg-white p-2">
                          <div className="flex flex-wrap items-center gap-2 text-[#263C3D]">
                            <span className="font-medium">{doc.name}</span>
                            <span className="text-[10px] text-[#607C7D]">{doc.kind}</span>
                            <span className="text-[#607C7D]">· {doc.status}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <Link className="text-[11px] font-semibold text-[#007970] underline" to={buildArtifactRoute(doc.id, { eventId: doc.eventId, taskId: doc.taskId, formId: doc.linkedFormId || doc.formIds[0], formInstanceId: doc.linkedFormInstanceId, evidenceId: doc.id, type: doc.kind })} target="_blank" rel="noopener noreferrer">View artifact</Link>
                            {docUrl && (
                              <>
                                <a className="text-[11px] font-semibold text-[#007970] underline" href={docUrl} download={doc.name}>Download</a>
                                <button
                                  type="button"
                                  className="text-[11px] font-semibold text-[#426768] underline"
                                  onClick={() => {
                                    const w = window.open(docUrl, '_blank');
                                    if (w) setTimeout(() => { w.print(); }, 600);
                                  }}
                                >
                                  Print
                                </button>
                              </>
                            )}
                            {!docUrl && <span className="text-[10px] text-[#C74601]">file data unavailable — re-upload to persist</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {metadata.kind === 'signature' && (
            <div className="mt-3 rounded-[16px] border border-[#B8E9E7] bg-[#F0FBFB] p-4">
              <div className="flex items-center gap-2 font-semibold text-[#004142]"><ShieldCheck size={15} /> eCIgn certificate/signature artifact</div>
              <p className="mt-1 text-xs text-[#426768]">This artifact references a signature/approval record captured in CES audit history.</p>
            </div>
          )}

          {metadata.kind === 'audit_packet' && (
            <div className="mt-3 rounded-[16px] border border-[#DDEBEB] bg-white/78 p-4">
              <div className="font-semibold text-[#004142]">Audit packet/export artifact</div>
              <p className="mt-1 text-xs text-[#426768]">Certification record metadata is available for this audit packet reference.</p>
            </div>
          )}

          {metadata.kind === 'unknown' && (
            <div className="mt-3 rounded-[16px] border border-[#FFD8C6] bg-[#FFF6F1] p-4">
              <div className="flex items-center gap-2 font-semibold text-[#C74601]"><FileWarning size={15} /> Artifact unavailable</div>
              <p className="mt-1 text-xs text-[#9A3412]">
                This artifact ID was not found in the current CES store snapshot, Evidence Center metadata,
                form instances, signatures, or certification records.
              </p>
              <p className="mt-1 text-[10px] text-[#C74601]">
                If this should be a signed artifact, re-open the originating CES task or Evidence Center row
                and verify the signed package exists after refresh. Missing bytes must be re-signed or re-uploaded
                before the artifact is survey-defensible.
              </p>
            </div>
          )}
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-[22px] border border-[#DDEBEB] bg-white/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_26px_70px_-48px_rgba(0,65,66,0.50)] backdrop-blur-[18px]">
            <div className="mb-3">
              <div className="font-montserrat text-[10px] font-bold uppercase tracking-[0.22em] text-[#607C7D]">METADATA</div>
            </div>
            <dl className="space-y-2 text-xs">
              {metadata.rows.map(row => (
                <div key={row.label} className="grid grid-cols-[138px_1fr] gap-2 border-b border-[#DDEBEB] pb-1 last:border-b-0 last:pb-0">
                  <dt className="font-medium text-[#607C7D]">{row.label}</dt>
                  <dd className="break-all font-mono text-[11px] text-[#263C3D]">{row.value || '—'}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 border-t border-[#DDEBEB] pt-3">
              <div className="mb-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#607C7D]">Audit Events</div>
              {metadata.auditEvents.length === 0 ? (
                <p className="text-xs text-[#607C7D]">No audit events linked.</p>
              ) : (
                <ul className="max-h-[140px] space-y-1 overflow-auto text-[11px] text-[#426768]">
                  {metadata.auditEvents.slice(0, 12).map((item, idx) => (
                    <li key={`audit-${idx}-${item.slice(0, 120)}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

          {/* Multi-signer roster (if signer tasks exist for this form instance) */}
          {resolved.kind === 'form_instance' && (() => {
            const signerTasks = store.signerTasksByFormInstanceId?.[resolved.formInstance.id] ?? [];
            if (signerTasks.length === 0) return null;
            return (
              <div className="mt-4 border-t border-[#DDEBEB] pt-3">
                <div className="mb-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#607C7D]">
                  Signer Roster ({signerTasks.length} signer{signerTasks.length !== 1 ? 's' : ''})
                </div>
                <ul className="space-y-1.5">
                  {signerTasks
                    .sort((a, b) => a.signerIndex - b.signerIndex)
                    .map(task => (
                    <li key={task.taskId} className="flex items-start gap-2 text-[11px]">
                      <span
                        className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: task.status === 'signed' ? '#10B981' : task.status === 'declined' ? '#DC2626' : '#F59E0B' }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-[#263C3D]">
                          {task.signerIndex}. {task.assignedToName || task.assignedTo}
                          <span className="ml-1 text-[#607C7D]">· {task.assignedToRole || task.slotFieldId}</span>
                        </div>
                        <div className="text-[10px] text-[#607C7D]">
                          Group {task.sequenceGroup} · {task.status}
                          {task.status === 'declined' && task.declineReason ? ` — ${task.declineReason}` : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Evidence version history (superseded artifacts) */}
          {activeEvidence && (() => {
            const superseded = evidence.filter(d =>
              d.supersededById === activeEvidence.id
              || (d.linkedFormInstanceId === activeEvidence.linkedFormInstanceId
                && d.artifactType === activeEvidence.artifactType
                && d.id !== activeEvidence.id
                && d.status === 'SUPERSEDED')
            );
            if (superseded.length === 0) return null;
            return (
              <div className="mt-3 rounded-[14px] border border-[#FFD8C6] bg-[#FFF6F1] p-2">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C74601]">
                  Prior Versions ({superseded.length})
                </div>
                <ul className="space-y-1 text-[10px]">
                  {superseded.map(d => (
                    <li key={d.id} className="flex items-center gap-2 text-[#9A3412]">
                      <span>v{d.artifactVersion ?? '?'}</span>
                      <span className="text-[#C74601]">· {d.supersededAt ? new Date(d.supersededAt).toLocaleString() : 'superseded'}</span>
                      <Link
                        to={buildArtifactRoute(d.id, { eventId: d.eventId, evidenceId: d.id, type: d.kind })}
                        className="font-semibold text-[#C74601] underline"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ArtifactViewerPage;
