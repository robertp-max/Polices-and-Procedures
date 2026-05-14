import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ExternalLink, FileImage, FileText, FileWarning, ShieldCheck } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import { resolveEvidenceDataUrl, dataUrlToBlobUrlForHtml } from '@/policy/evidence/demoEvidenceRuntimeCache';
import {
  formInstanceLinkAliases,
  resolveFormInstanceFromArtifactCandidates,
} from '@/policy/compliance-execution/cesFormInstanceId';
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
      const decoded = decodeURIComponent(htmlDataUrl.replace(/^data:text\/html;charset=utf-8,/, ''));
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

    const formByPrimary =
      resolveFormInstanceFromArtifactCandidates(primaryId, formInstances)
      ?? formInstances.find(item => item.id === primaryId);
    if (formByPrimary) {
      return { kind: 'form_instance' as const, formInstance: formByPrimary };
    }
    const evidenceByPrimary = evidence.find(item => item.id === primaryId);
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
  const rawEvidenceHtmlSrc = previewMode === 'html' ? (ecignPacketPrintUrl ?? evidencePreviewUrl) : undefined;
  const evidenceHtmlIframeSrc = useIframeSafeSrc(rawEvidenceHtmlSrc);

  // Auto-convert signed HTML evidence to a real PDF for display.
  const isSignedArtifact = activeEvidence
    ? ['signed_package', 'signed_form_instance', 'signed_certificate'].includes(activeEvidence.artifactType || activeEvidence.kind || '')
    : false;
  const evidencePdfTitle = activeEvidence?.name?.replace(/\.html?$/i, '.pdf') || 'signed-document.pdf';
  const { pdfBlobUrl: evidencePdfBlobUrl, converting: evidencePdfConverting } = useHtmlToPdfBlobUrl(
    rawEvidenceHtmlSrc,
    isSignedArtifact && previewMode === 'html',
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
  }, [resolved, evidence]);

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
    <div className="h-full overflow-auto bg-[#081425] px-6 py-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Artifact Viewer</p>
          <h1 className="text-lg font-semibold">
            {decodeURIComponent(artifactId || '') || 'Unknown Artifact'}
          </h1>
        </div>
        <Link to="/evidence" className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5">
          Back to Evidence Center
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-8 rounded-lg border border-white/10 bg-black/20 p-4">
          {metadata.kind === 'form_instance' && resolved.kind === 'form_instance' && (
            <div className="mb-4 rounded border border-cyan-300/35 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              <div className="font-semibold">Completed form instance record</div>
              <div className="mt-1 text-xs">
                Template <code>{resolved.formInstance.formId}</code> is the reusable definition. Completed instance <code>{resolved.formInstance.id}</code> is the execution artifact.
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to={formWorkspaceRoute}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-cyan-300/45 px-2 py-1 text-[11px] uppercase tracking-[0.12em]"
                >
                  Open form workspace <ExternalLink size={12} />
                </Link>
                {iframeDisplaySrc && (
                  <a
                    href={iframeDisplaySrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-white/25 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-white/80"
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
                        html = decodeURIComponent(printSrc.replace(/^data:text\/html;charset=utf-8,/, ''));
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
                    className="inline-flex items-center gap-1 rounded border border-orange-300/50 bg-orange-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-200"
                  >
                    Download PDF
                  </button>
                )}
              </div>
              {immutableFormArtifactUrl && (
                <p className="mt-2 text-[10px] text-white/55">
                  Showing persisted signed snapshot. The workspace link opens the live form for reference.
                </p>
              )}
              <div className="mt-3 rounded border border-white/15 bg-black/25 p-2">
                <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-cyan-100/80">
                  Completed form rendering
                </div>
                {immutableFormArtifactUrl && (
                  <p className="mb-2 text-[10px] text-emerald-200/90">
                    Showing persisted immutable snapshot (signed form instance or signed package). This is not a live editable workspace.
                  </p>
                )}
                {formInstanceIsTerminal && !immutableFormArtifactUrl && (
                  <div className="mb-2 rounded border border-amber-300/40 bg-amber-500/10 p-2 text-[11px] text-amber-100">
                    No signed snapshot found. If you just signed this form, return to the CES sprint and
                    re-sign — the signed document will be saved and viewable here.
                  </div>
                )}
                {iframeDisplaySrc ? (
                  <div className="relative">
                    {formPdfConverting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded z-10">
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-cyan-300 border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-[11px] text-cyan-200">Generating PDF...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      title={`form-instance-${resolved.formInstance.id}`}
                      src={iframeDisplaySrc}
                      className="h-[560px] w-full rounded border border-white/10 bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded border border-white/10 bg-black/40 text-xs text-white/60">
                    No renderable preview for this state.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeEvidence && (
            <div className="space-y-3">
              {(isEvidenceImmutable(activeEvidence.status) || activeEvidence.auditFrozen) && (
                <div className="rounded border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                  {activeEvidence.auditFrozen ? 'Audit-frozen evidence — no replacement or supersede' : 'Locked evidence — immutable record'}
                </div>
              )}
              {previewMode === 'image' && (
                <div className="rounded border border-white/10 bg-black/20 p-2">
                  <img src={evidencePreviewUrl} alt={activeEvidence.name} className="max-h-[520px] w-full rounded object-contain" />
                </div>
              )}
              {previewMode === 'pdf' && (
                <div className="h-[560px] rounded border border-white/10 bg-black/30 p-2">
                  <iframe title={activeEvidence.name} src={evidencePdfSafeSrc || evidencePreviewUrl || ''} className="h-full w-full rounded border border-white/10" />
                </div>
              )}
              {(previewMode === 'html' || (!!ecignPacketPrintUrl && previewMode === 'missing')) && (
                <div className="h-[620px] rounded border border-white/10 bg-black/30 p-2 relative">
                  {evidencePdfConverting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded z-10">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-cyan-300 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-[11px] text-cyan-200">Generating PDF...</p>
                      </div>
                    </div>
                  )}
                  {evidencePdfBlobUrl ? (
                    <iframe title={activeEvidence.name} src={evidencePdfBlobUrl} className="h-full w-full rounded border border-white/10" />
                  ) : (
                    <iframe title={activeEvidence.name} src={evidenceHtmlIframeSrc || ''} className="h-full w-full rounded border border-white/10 bg-white" />
                  )}
                </div>
              )}
              {previewMode === 'file' && (
                <div className="rounded border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                  <div className="mb-2 flex items-center gap-2 text-white"><FileText size={15} /> Document preview is not supported inline.</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={evidencePreviewUrl || '#'} target="_blank" rel="noopener noreferrer" className="rounded border border-teal-300/40 px-2 py-1 text-xs text-teal-200">
                      Open file
                    </a>
                    <a href={evidencePreviewUrl || '#'} download={activeEvidence.name} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80">
                      Download
                    </a>
                  </div>
                </div>
              )}
              {previewMode === 'missing' && !ecignPacketPrintUrl && (
                <div className="rounded border border-amber-300/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                  <div className="mb-2 flex items-center gap-2"><FileWarning size={15} /> File data not found</div>
                  <p>This document may have been uploaded before persistence was enabled, or exceeded the storage limit. Re-upload to make it viewable.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {evidencePreviewUrl && (
                  <>
                    <a href={evidencePreviewUrl} target="_blank" rel="noopener noreferrer" className="rounded border border-teal-300/40 px-2 py-1 text-xs text-teal-200">
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
                        const html = decodeURIComponent(printSrc.replace(/^data:text\/html;charset=utf-8,/, ''));
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
                      className="rounded border border-emerald-300/40 px-2 py-1 text-xs text-emerald-200"
                    >
                      Download PDF
                    </button>
                  </>
                )}
                {!evidencePreviewUrl && activeEvidence.objectPath && (
                  <div className="rounded border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-white/60">
                    Object path: <code className="text-white/80">{activeEvidence.objectPath}</code>
                    <span className="ml-2 text-amber-200/80">— no file data found; re-upload or re-sign to persist</span>
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
                  className="inline-flex items-center gap-1 rounded border border-cyan-300/35 px-2 py-1 text-xs text-cyan-200/80"
                >
                  <FileImage size={12} /> Artifact permalink
                </Link>
              </div>
            </div>
          )}

          {metadata.kind === 'evidence_package' && packageContext && resolved.kind === 'evidence_package' && (
            <div className="space-y-3 text-xs">
              <div className="rounded border border-indigo-300/35 bg-indigo-500/10 p-3">
                <div className="font-semibold text-indigo-100">Evidence package summary</div>
                <div className="mt-1 text-indigo-100/90">
                  Event <code>{resolved.eventId}</code> · Task <code>{resolved.taskId}</code>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>Form instances: <span className="text-white">{packageContext.taskFormInstances.length}</span></div>
                  <div>Evidence files: <span className="text-white">{packageContext.taskEvidence.length}</span></div>
                  <div>Signatures/certificates: <span className="text-white">{packageContext.taskApprovals.length}</span></div>
                  <div>Audit rows: <span className="text-white">{packageContext.taskAudit.length}</span></div>
                </div>
              </div>

              <div className="rounded border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-white/70">Completed Form Instances</div>
                {packageContext.taskFormInstances.length === 0 ? (
                  <p className="text-white/50">No linked form instances.</p>
                ) : (
                  <ul className="space-y-1">
                    {packageContext.taskFormInstances.map(instance => (
                      <li key={instance.id} className="flex flex-wrap items-center gap-2 text-white/85">
                        <span>{instance.formId}</span>
                        <span className="text-white/50">· {instance.status}</span>
                        <Link className="text-teal-200 underline" to={buildArtifactRoute(instance.id, { eventId: instance.eventId, taskId: instance.taskId, formId: instance.formId, formInstanceId: instance.id, type: 'form_instance' })} target="_blank" rel="noopener noreferrer">Open</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-white/70">Uploaded Evidence &amp; Signed Documents</div>
                {packageContext.taskEvidence.length === 0 ? (
                  <p className="text-white/50">No linked evidence artifacts.</p>
                ) : (
                  <ul className="space-y-2">
                    {packageContext.taskEvidence.map(doc => {
                      const docUrl = resolveEvidenceDataUrl(doc);
                      return (
                        <li key={doc.id} className="rounded border border-white/8 bg-black/15 p-2">
                          <div className="flex flex-wrap items-center gap-2 text-white/85">
                            <span className="font-medium">{doc.name}</span>
                            <span className="text-white/40 text-[10px]">{doc.kind}</span>
                            <span className="text-white/50">· {doc.status}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <Link className="text-teal-200 underline text-[11px]" to={buildArtifactRoute(doc.id, { eventId: doc.eventId, taskId: doc.taskId, formId: doc.linkedFormId || doc.formIds[0], formInstanceId: doc.linkedFormInstanceId, evidenceId: doc.id, type: doc.kind })} target="_blank" rel="noopener noreferrer">View artifact</Link>
                            {docUrl && (
                              <>
                                <a className="text-emerald-200 underline text-[11px]" href={docUrl} download={doc.name}>Download</a>
                                <button
                                  type="button"
                                  className="text-white/70 underline text-[11px]"
                                  onClick={() => {
                                    const w = window.open(docUrl, '_blank');
                                    if (w) setTimeout(() => { w.print(); }, 600);
                                  }}
                                >
                                  Print
                                </button>
                              </>
                            )}
                            {!docUrl && <span className="text-amber-200/60 text-[10px]">file data unavailable — re-upload to persist</span>}
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
            <div className="rounded border border-emerald-300/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              <div className="mb-1 flex items-center gap-2 font-semibold"><ShieldCheck size={15} /> eCIgn certificate/signature artifact</div>
              <p>This artifact references a signature/approval record captured in CES audit history.</p>
            </div>
          )}

          {metadata.kind === 'audit_packet' && (
            <div className="rounded border border-indigo-300/40 bg-indigo-500/10 p-3 text-sm text-indigo-100">
              <div className="mb-1 font-semibold">Audit packet/export artifact</div>
              <p>Certification record metadata is available for this audit packet reference.</p>
            </div>
          )}

          {metadata.kind === 'unknown' && (
            <div className="rounded border border-rose-300/40 bg-rose-500/10 p-3 text-sm text-rose-100">
              Artifact was not found in the current CES store snapshot.
            </div>
          )}
        </section>

        <aside className="col-span-12 lg:col-span-4 rounded-lg border border-white/10 bg-black/20 p-4">
          <h2 className="mb-2 text-sm font-semibold">Metadata</h2>
          <dl className="space-y-2 text-xs">
            {metadata.rows.map(row => (
              <div key={row.label} className="grid grid-cols-[140px_1fr] gap-2 border-b border-white/10 pb-1">
                <dt className="text-white/60">{row.label}</dt>
                <dd className="break-all text-white/90">{row.value || '—'}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 rounded border border-white/10 bg-black/20 p-2">
            <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/60">Audit events</div>
            {metadata.auditEvents.length === 0 ? (
              <p className="text-xs text-white/50">No audit events linked.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-white/80">
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
              <div className="mt-3 rounded border border-indigo-300/25 bg-indigo-500/10 p-2">
                <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-indigo-200/80">
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
                        <div className="text-white/90 font-medium">
                          {task.signerIndex}. {task.assignedToName || task.assignedTo}
                          <span className="text-white/50 ml-1">· {task.assignedToRole || task.slotFieldId}</span>
                        </div>
                        <div className="text-white/50 text-[10px]">
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
              <div className="mt-3 rounded border border-amber-300/25 bg-amber-500/10 p-2">
                <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-amber-200/80">
                  Prior Versions ({superseded.length})
                </div>
                <ul className="space-y-1 text-[10px]">
                  {superseded.map(d => (
                    <li key={d.id} className="flex items-center gap-2 text-amber-100/70">
                      <span>v{d.artifactVersion ?? '?'}</span>
                      <span className="text-amber-100/50">· {d.supersededAt ? new Date(d.supersededAt).toLocaleString() : 'superseded'}</span>
                      <Link
                        to={buildArtifactRoute(d.id, { eventId: d.eventId, evidenceId: d.id, type: d.kind })}
                        className="text-amber-200 underline"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </aside>
      </div>
    </div>
  );
}

export default ArtifactViewerPage;
