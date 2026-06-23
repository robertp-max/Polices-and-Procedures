/**
 * Direct Google Calendar API verify + patch for qapi_meeting-20260609-10.
 * Does NOT trust local cache or app API — only live events.get / events.patch.
 *
 * Usage: npx tsx scripts/verifyAndPatchLiveGoogleEvent.ts
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { env } from '../server/env.js';
import {
  buildCesCalendarDescription,
  buildCesExtendedProperties,
  getCesEnrichment,
} from '../server/cesCalendarEventBuilder.js';
import { loadCesExecutionSnapshot } from '../server/cesCalendarCompletion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const APP_EVENT_ID = 'qapi_meeting-20260609-10';
const EXPECTED_GOOGLE_ID = 'vgfkoc7odienac2mjlh44eahek';
const TARGET_DATE = '2026-06-09';

const REQUIRED_MARKERS = [
  'CARE INDEED HOME HEALTH',
  'CES EVENT',
  'Completion:',
  'Workflow:',
  'Required Signer Roles',
  'Evidence:',
  'Drive Evidence Folder',
  'MOCK TEST EVENT',
  'NO PHI',
] as const;

function normalizeCheckText(s: string): string {
  return s.replace(/[—–-]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
}

function hasAllMarkers(description: string): boolean {
  const norm = normalizeCheckText(description);
  return REQUIRED_MARKERS.every(marker => norm.includes(normalizeCheckText(marker)));
}

function safeSummary(ev: {
  id?: string | null;
  summary?: string | null;
  start?: { date?: string | null; dateTime?: string | null } | null;
  end?: { date?: string | null; dateTime?: string | null } | null;
  description?: string | null;
  extendedProperties?: { private?: Record<string, string> | null } | null;
  attachments?: unknown[] | null;
}) {
  return {
    googleEventId: ev.id ?? null,
    summary: ev.summary ?? null,
    start: ev.start?.dateTime ?? ev.start?.date ?? null,
    end: ev.end?.dateTime ?? ev.end?.date ?? null,
    descriptionLength: (ev.description ?? '').length,
    descriptionPreview: (ev.description ?? '').slice(0, 800),
    extendedPrivateKeys: Object.keys(ev.extendedProperties?.private ?? {}).sort(),
    attachmentsCount: (ev.attachments ?? []).length,
  };
}

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: env.credentialsPath,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  const authClient = await auth.getClient();
  return google.calendar({ version: 'v3', auth: authClient as never });
}

async function fetchLiveEvent(calendar: ReturnType<typeof google.calendar>, googleEventId: string) {
  const res = await calendar.events.get({
    calendarId: env.calendarId,
    eventId: googleEventId,
  });
  return res.data;
}

async function listNearDuplicates(calendar: ReturnType<typeof google.calendar>) {
  const res = await calendar.events.list({
    calendarId: env.calendarId,
    timeMin: `${TARGET_DATE}T00:00:00Z`,
    timeMax: `${TARGET_DATE}T23:59:59Z`,
    singleEvents: true,
    maxResults: 50,
    showDeleted: false,
    q: 'QAPI Committee Meeting',
  });
  const items = res.data.items ?? [];
  const norm = (t: string) => t.replace(/^\[Compliance\]\s*/i, '').trim().toLowerCase();
  const matches = items.filter(ev => {
    const title = norm(ev.summary ?? '');
    const date = ev.start?.date ?? ev.start?.dateTime?.slice(0, 10) ?? '';
    return date === TARGET_DATE && (title.includes('qapi committee meeting') || title.includes('qapi'));
  });
  return matches.map(ev => ({
    googleEventId: ev.id,
    summary: ev.summary,
    start: ev.start?.dateTime ?? ev.start?.date,
    appEventId: (ev.extendedProperties?.private as Record<string, string> | undefined)?.appEventId
      ?? (ev.extendedProperties?.private as Record<string, string> | undefined)?.event_id,
    hasCesMarker: (ev.description ?? '').includes('CES EVENT'),
    attachmentsCount: (ev.attachments ?? []).length,
  }));
}

async function main() {
  if (!env.calendarId) {
    console.error('GOOGLE_CALENDAR_ID not set');
    process.exit(1);
  }
  if (!env.calendarCredentialsPresent) {
    console.error('Google credentials missing');
    process.exit(1);
  }

  const calendar = await getClient();
  console.log('Calendar ID:', env.calendarId);
  console.log('Target googleEventId:', EXPECTED_GOOGLE_ID);

  let live = await fetchLiveEvent(calendar, EXPECTED_GOOGLE_ID);
  console.log('\n── Step 1: Live GET (before patch) ──');
  console.log(JSON.stringify(safeSummary(live), null, 2));

  const alreadyEnriched = hasAllMarkers(live.description ?? '');
  const extBefore = (live.extendedProperties?.private ?? {}) as Record<string, string>;
  const needsExtAlign = extBefore.ecignStatus !== 'not_started_missing_canonical_form_instance'
    || extBefore.evidenceAttachedCount !== '6'
    || extBefore.completionPercent !== '25';
  console.log('\nAlready enriched (live description check):', alreadyEnriched ? 'yes' : 'no');
  console.log('Ext props need alignment:', needsExtAlign ? 'yes' : 'no');

  let patchExecuted = false;
  let patchResult: Record<string, unknown> = { skipped: true, reason: 'already enriched' };

  if (!alreadyEnriched || needsExtAlign) {
    const enrichment = getCesEnrichment(APP_EVENT_ID);
    if (!enrichment) {
      console.error('No enrichment registry for', APP_EVENT_ID);
      process.exit(1);
    }

    const snapshot = await loadCesExecutionSnapshot(enrichment);
    let description = buildCesCalendarDescription(enrichment, snapshot);
    // Ensure user-visible safety marker uses spaced form (no em dash) for Calendar UI check.
    description = description.replace(
      enrichment.mockMarker ?? '',
      'MOCK TEST EVENT  NO PHI  JUNE 2026 MONTHLY QAPI/CES E2E TEST',
    );

    const extPrivate = {
      ...(live.extendedProperties?.private ?? {}),
      ...buildCesExtendedProperties(enrichment, { snapshot }),
      appEventId: APP_EVENT_ID,
      event_id: APP_EVENT_ID,
      workflowId: 'TPL-QA-MONTHLY-QAPI',
      policyRefs: 'QA-PG-001',
      completionPercent: String(snapshot.completionPercent),
      evidenceCount: '6',
      evidenceAttachedCount: '6',
      ecignStatus: 'not_started_missing_canonical_form_instance',
      calendarAttachmentStatus: 'attached',
      driveFolderId: '1BVjBzFqLDVUHibfPXUz4vA1soJxUJyGR',
      noPhi: 'true',
      source: 'CI_CES',
    };

    console.log('\n── Step 3-4: PATCH live event (description + extendedProperties.private only) ──',
      !alreadyEnriched ? 'description missing markers' : 'ext props alignment');
    const patched = await calendar.events.patch({
      calendarId: env.calendarId,
      eventId: EXPECTED_GOOGLE_ID,
      requestBody: {
        description,
        extendedProperties: { private: extPrivate },
      },
    });
    patchExecuted = true;
    patchResult = {
      googleEventId: patched.data.id,
      updated: patched.data.updated,
      descriptionLength: (patched.data.description ?? '').length,
      extKeys: Object.keys(patched.data.extendedProperties?.private ?? {}).sort(),
    };
    console.log(JSON.stringify(patchResult, null, 2));
    live = patched.data;
  }

  console.log('\n── Step 6: Live GET (after patch, fresh fetch) ──');
  const refetch = await fetchLiveEvent(calendar, EXPECTED_GOOGLE_ID);
  const refetchSummary = safeSummary(refetch);
  console.log(JSON.stringify(refetchSummary, null, 2));

  const ext = (refetch.extendedProperties?.private ?? {}) as Record<string, string>;
  const proof = {
    descriptionHasCesEvent: (refetch.description ?? '').includes('CES EVENT'),
    descriptionHasCompletion: (refetch.description ?? '').includes('Completion:'),
    descriptionHasWorkflow: (refetch.description ?? '').includes('Workflow:'),
    descriptionHasSignerRoles: (refetch.description ?? '').includes('Required Signer Roles'),
    descriptionHasEvidence: (refetch.description ?? '').includes('Evidence:'),
    descriptionHasDriveFolder: (refetch.description ?? '').includes('Drive Evidence Folder'),
    descriptionHasMockSafety: normalizeCheckText(refetch.description ?? '').includes('MOCK TEST EVENT NO PHI'),
    extAppEventId: ext.appEventId,
    extCompletionPercent: ext.completionPercent,
    extEvidenceCount: ext.evidenceCount,
    extEcignStatus: ext.ecignStatus,
    extSource: ext.source,
    attachmentsCount: (refetch.attachments ?? []).length,
    googleEventIdUnchanged: refetch.id === EXPECTED_GOOGLE_ID,
  };
  console.log('\n── Step 7: Re-fetch proof ──');
  console.log(JSON.stringify(proof, null, 2));

  const allJune9 = await calendar.events.list({
    calendarId: env.calendarId,
    timeMin: `${TARGET_DATE}T00:00:00Z`,
    timeMax: `${TARGET_DATE}T23:59:59Z`,
    singleEvents: true,
    maxResults: 100,
    orderBy: 'startTime',
  });
  const qapiJune9 = (allJune9.data.items ?? []).filter(ev =>
    /qapi/i.test(ev.summary ?? '') || /qapi/i.test(ev.description ?? ''),
  );
  console.log('\n── All QAPI-tagged events on 2026-06-09 ──');
  console.log(JSON.stringify(qapiJune9.map(ev => ({
    googleEventId: ev.id,
    summary: ev.summary,
    start: ev.start?.dateTime ?? ev.start?.date,
    descriptionLength: (ev.description ?? '').length,
    hasCesMarker: (ev.description ?? '').includes('CES EVENT'),
    appEventId: (ev.extendedProperties?.private as Record<string, string> | undefined)?.appEventId,
    attachmentsCount: (ev.attachments ?? []).length,
  })), null, 2));

  const dupes = await listNearDuplicates(calendar);
  console.log('\n── Step 8: Duplicate scan 2026-06-09 QAPI ──');
  console.log(JSON.stringify(dupes, null, 2));

  const canonical = dupes.find(d => d.googleEventId === EXPECTED_GOOGLE_ID)
    ?? dupes.find(d => d.appEventId === APP_EVENT_ID)
    ?? dupes.find(d => d.hasCesMarker);
  const duplicateIds = dupes
    .map(d => d.googleEventId)
    .filter((id): id is string => !!id && id !== (canonical?.googleEventId ?? EXPECTED_GOOGLE_ID));

  console.log('\n══ FINAL REPORT ══');
  console.log(JSON.stringify({
    liveAlreadyHadEnrichment: alreadyEnriched,
    calendarApiPatchExecuted: patchExecuted,
    calendarPatchResult: patchResult,
    refetchProof: proof,
    canonicalGoogleEventId: refetch.id,
    duplicateGoogleEventIds: duplicateIds,
    completionPercentWritten: ext.completionPercent ?? snapshotFallback(refetch.description),
    attachmentsCountAfterPatch: (refetch.attachments ?? []).length,
    ecignSigningRun: false,
    commits: false,
    pushes: false,
  }, null, 2));
}

function snapshotFallback(desc: string | null | undefined): string | null {
  const m = (desc ?? '').match(/Completion:\s*\n?\s*(\d+)%/);
  return m?.[1] ?? null;
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});