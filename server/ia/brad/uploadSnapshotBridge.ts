import fs from 'node:fs';
import { parseJsonLoose } from '../../sourceExtraction.js';
import { getDemoSnapshot } from './demoSnapshot.js';
import { getUploadStore, type UploadMeta } from './uploads.js';
import type { BradSourceSnapshot, SnapshotIncident, SnapshotMetric, SnapshotPip } from './sourceSnapshot.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Upload -> BradSourceSnapshot bridge.

   Root cause fixed here: server/routes/brad.ts's report/event-packet/qapi-
   minutes endpoints always called getDemoSnapshot(eventId) — a hardcoded
   fixture — even when a real document had been uploaded via POST /api/brad/
   upload for that exact event. uploads.ts saves the bytes but nothing ever
   read them back, so an uploaded source was silently ignored and Brad always
   generated from the demo snapshot (the "shell packet" bug for this pipeline).

   resolveBradSnapshot() now prefers the most recently uploaded source for the
   event when one exists. It never invents fields: a field only changes from
   the base/demo snapshot when the upload actually contains recognizable
   content for it, and every merge is annotated in followUps so the generated
   object is auditable back to its real source.
   ═══════════════════════════════════════════════════════════════════════════ */

const BINARY_UPLOAD_RE = /pdf|officedocument|msword/i;
const BINARY_EXT_RE = /\.(pdf|docx?|xlsx?)$/i;

function readUploadText(meta: UploadMeta): string | null {
  if (BINARY_UPLOAD_RE.test(meta.mime) || BINARY_EXT_RE.test(meta.filename)) return null; // no approved extractor here
  try {
    return fs.readFileSync(meta.storedPath, 'utf8');
  } catch {
    return null;
  }
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  const lower = new Map(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
  for (const k of keys) {
    const v = lower.get(k.toLowerCase());
    if (v !== undefined) return v;
  }
  return undefined;
}
const asStrArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const asStr = (v: unknown): string | undefined => (v === undefined || v === null ? undefined : String(v));

function extractMetrics(root: Record<string, unknown>): SnapshotMetric[] {
  const source = pick(root, ['kpis', 'metrics', 'quality_indicators']);
  if (!Array.isArray(source)) return [];
  const out: SnapshotMetric[] = [];
  for (const item of source) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const name = pick(rec, ['name', 'indicator', 'title']);
    if (!name) continue;
    out.push({ name: String(name), value: pick(rec, ['value', 'result']) as string | number | undefined, target: pick(rec, ['target']) as string | number | undefined });
  }
  return out;
}

function extractPips(root: Record<string, unknown>): SnapshotPip[] {
  const source = pick(root, ['pips', 'pipHistory', 'performance_improvement_projects']);
  if (!Array.isArray(source)) return [];
  const out: SnapshotPip[] = [];
  for (const item of source) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const title = pick(rec, ['title', 'issue', 'name']);
    const id = pick(rec, ['id', 'pipId', 'pip_id']);
    if (!title && !id) continue;
    const status = String(pick(rec, ['status']) ?? '').toLowerCase();
    out.push({
      id: asStr(id) ?? `pip-${out.length + 1}`,
      title: asStr(title) ?? 'Untitled PIP',
      status: /clos|resolv/.test(status) ? 'closed' : /monitor/.test(status) ? 'monitoring' : 'open',
    });
  }
  return out;
}

const SEVERITIES = new Set(['low', 'moderate', 'high']);

function extractIncidents(root: Record<string, unknown>): SnapshotIncident[] {
  const source = pick(root, ['incidents', 'incident_log', 'adverseEvents', 'adverse_events']);
  if (!Array.isArray(source)) return [];
  const out: SnapshotIncident[] = [];
  for (const item of source) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const type = pick(rec, ['type', 'category']);
    const summary = pick(rec, ['summary', 'description', 'reason']);
    if (!type && !summary) continue;
    const severityRaw = String(pick(rec, ['severity']) ?? '').toLowerCase();
    out.push({
      id: asStr(pick(rec, ['id', 'incident_id'])) ?? `inc-${out.length + 1}`,
      type: asStr(type) ?? 'unspecified',
      severity: (SEVERITIES.has(severityRaw) ? severityRaw : 'moderate') as SnapshotIncident['severity'],
      summary: asStr(summary) ?? '',
    });
  }
  return out;
}

/**
 * Best-effort mapping from an arbitrary uploaded document to BradSourceSnapshot
 * fields. Never invents: a field only overrides the base snapshot when the
 * upload actually contains recognizable content for it.
 */
export function mergeUploadIntoSnapshot(base: BradSourceSnapshot, meta: UploadMeta): BradSourceSnapshot {
  const provenance = `Source: uploaded file "${meta.filename}" (${meta.size} bytes, ingested ${meta.dateCreatedInSystem}).`;
  const text = readUploadText(meta);
  if (!text || !text.trim()) {
    return { ...base, followUps: [...base.followUps, `${provenance} No extractable text content — packet uses base event data only.`] };
  }

  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch { parsed = parseJsonLoose(text); }
  if (!parsed || typeof parsed !== 'object') {
    return { ...base, followUps: [...base.followUps, `${provenance} Non-JSON content (${text.length} chars) — attached as unstructured evidence, not auto-summarized.`] };
  }

  const root = parsed as Record<string, unknown>;
  const metrics = extractMetrics(root);
  const pips = extractPips(root);
  const incidents = extractIncidents(root);
  const attendees = asStrArray(pick(root, ['attendees', 'attendeesPresent', 'roster']));
  const eventTitleFromUpload = asStr(pick(root, ['event_title', 'eventTitle', 'meeting_title']));

  return {
    ...base,
    eventTitle: eventTitleFromUpload ?? base.eventTitle,
    attendees: attendees.length ? attendees : base.attendees,
    metrics: metrics.length ? metrics : base.metrics,
    pips: pips.length ? pips : base.pips,
    incidents: incidents.length ? incidents : base.incidents,
    followUps: [
      ...base.followUps,
      `${provenance} Derived ${metrics.length} metric(s), ${pips.length} PIP(s), ${incidents.length} incident(s) from the uploaded source — verify before relying on this packet.`,
    ],
  };
}

/**
 * Resolve the snapshot Brad should generate from for this event: the most
 * recently uploaded source document when one exists for this event, merged
 * over the demo/base snapshot; the unmodified demo snapshot otherwise.
 */
export function resolveBradSnapshot(eventId: string | undefined): BradSourceSnapshot {
  const base = getDemoSnapshot(eventId);
  if (!eventId) return base; // no event to scope an upload to — never cross-attach another event's file
  const uploads = getUploadStore().list(eventId); // most-recent-first, already scoped to this eventId
  if (!uploads.length) return base;
  return mergeUploadIntoSnapshot(base, uploads[0]);
}
