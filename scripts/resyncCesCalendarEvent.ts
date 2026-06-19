/**
 * Resync a CES Calendar event with enriched description/metadata,
 * self-heal stale mappings, and re-attach existing Drive evidence.
 *
 * Usage:
 *   npx tsx scripts/resyncCesCalendarEvent.ts qapi_meeting-20260609-10
 */
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveCalendarEvent } from '../server/googleCalendar.js';
import { attachDriveFileToEvent } from '../server/googleCalendar.js';
import { syncEvent } from '../server/sync/eventSync.js';
import {
  buildEnrichedPlannerPayload,
  getCesEnrichment,
} from '../server/cesCalendarEventBuilder.js';
import { getCesMetadataStore, type CesEvidenceRef } from '../server/cesMetadataStore.js';
import { env } from '../server/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const EVENT_ID = process.argv[2] ?? 'qapi_meeting-20260609-10';

async function main() {
  if (!env.calendarId) {
    console.error('GOOGLE_CALENDAR_ID not set');
    process.exit(1);
  }
  if (!env.calendarCredentialsPresent) {
    console.error('Google credentials not found');
    process.exit(1);
  }

  const enrichment = getCesEnrichment(EVENT_ID);
  if (!enrichment) {
    console.error(`No CES enrichment registry entry for ${EVENT_ID}`);
    process.exit(1);
  }

  const payload = buildEnrichedPlannerPayload(enrichment, { version: 99 });

  console.log('── Resolving / resyncing Calendar event ──');
  const resolved = await resolveCalendarEvent(EVENT_ID, payload);
  if (!resolved) {
    console.error('resolveCalendarEvent returned null');
    process.exit(1);
  }

  // Force enriched description + extendedProperties update.
  const syncResult = await syncEvent(payload, {
    trigger: 'script:resyncCesCalendarEvent',
    actor: 'service-account',
    env: enrichment.env ?? 'SANDBOX',
  });

  console.log('Resolve action:', resolved.action);
  console.log('Stale Google ID:', resolved.staleGoogleId ?? '(none)');
  console.log('Healed mapping:', resolved.healed);
  console.log('Duplicate avoided:', resolved.duplicateAvoided);
  console.log('Sync action:', syncResult.action, syncResult.ok ? 'OK' : 'FAILED');
  console.log('Live Google event ID:', syncResult.google_event_id ?? resolved.event.googleEventId);
  console.log('Calendar ID:', env.calendarId);

  const liveGoogleId = syncResult.google_event_id ?? resolved.event.googleEventId;

  console.log('\n── Re-attaching Drive evidence ──');
  const evidencePath = path.join(repoRoot, '.cache', 'ces-metadata', 'evidence', `${EVENT_ID}.json`);
  let items: CesEvidenceRef[] = [];
  if (fs.existsSync(evidencePath)) {
    items = JSON.parse(fs.readFileSync(evidencePath, 'utf8')) as CesEvidenceRef[];
  } else {
    items = await getCesMetadataStore().listEvidence(EVENT_ID);
  }

  const store = getCesMetadataStore();
  const attachResults: Array<{ fileName: string; status: string; duplicate: boolean }> = [];

  for (const item of items) {
    const result = await attachDriveFileToEvent(EVENT_ID, {
      fileId: item.driveFileId,
      fileUrl: item.driveFileUrl,
      title: item.fileName,
      mimeType: item.mimeType,
    });
    attachResults.push({
      fileName: item.fileName,
      status: result.status,
      duplicate: result.duplicate,
    });
    await store.upsertEvidence({
      ...item,
      calendarEventId: liveGoogleId,
      attachmentStatus: result.status,
    });
    console.log(`  ${item.fileName}: ${result.status}${result.duplicate ? ' (duplicate)' : ''}`);
  }

  console.log('\n── Verification ──');
  const verify = await resolveCalendarEvent(EVENT_ID, payload);
  console.log('Post-verify Google event ID:', verify?.event.googleEventId);
  console.log('Description includes CES EVENT:', verify?.event.description?.includes('CES EVENT') ?? false);
  console.log('Evidence items:', items.length);
  console.log('Attachments:', attachResults.map(r => `${r.fileName}=${r.status}`).join(', '));

  const out = {
    eventId: EVENT_ID,
    calendarId: env.calendarId,
    staleGoogleId: resolved.staleGoogleId,
    liveGoogleEventId: liveGoogleId,
    action: resolved.action,
    syncAction: syncResult.action,
    healed: resolved.healed,
    duplicateAvoided: resolved.duplicateAvoided,
    attachments: attachResults,
    evidenceCount: items.length,
  };
  console.log('\n' + JSON.stringify(out, null, 2));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});