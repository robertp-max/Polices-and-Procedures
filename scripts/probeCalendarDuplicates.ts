/**
 * Probe Google Calendar duplicates for June 2026 CES targets.
 * Usage: npx tsx scripts/probeCalendarDuplicates.ts
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listEvents, listCiEvents, findByEventId } from '../server/googleCalendar.js';
import { reportGoogleRawDuplicates } from '../server/cesCalendarDedup.js';
import { getCesMetadataStore } from '../server/cesMetadataStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TARGETS = [
  'qapi_meeting-20260609-10',
  'infection_control_review_quarterly-20260624-02',
  'physician_signatures-20260521-01',
];

function normTitle(t: string) {
  return t.replace(/^\[Compliance\]\s*/i, '').trim().toLowerCase();
}

async function main() {
  console.log('── Target event by-app resolution ──');
  for (const id of TARGETS) {
    const ev = await findByEventId(id);
    const evidence = await getCesMetadataStore().listEvidence(id);
    console.log({
      appEventId: id,
      found: !!ev,
      googleEventId: ev?.googleEventId,
      title: ev?.title,
      date: ev?.date,
      workflowId: ev?.workflowId,
      completionPercent: ev?.completionPercent,
      hasCompletionInDescription: ev?.description?.includes('Completion:'),
      evidenceCount: evidence.length,
    });
  }

  console.log('\n── Google Calendar June 2026 QAPI/IC/physician rows ──');
  const gEvents = await listEvents({ start: '2026-06-01', end: '2026-06-30' });
  const interesting = gEvents.filter(e => {
    const t = normTitle(e.title);
    return TARGETS.includes(e.event_id) || t.includes('qapi') || t.includes('infection control') || t.includes('physician');
  });
  for (const e of interesting) {
    console.log({
      appEventId: e.event_id,
      googleEventId: e.googleEventId,
      title: e.title,
      date: e.date,
      workflowId: e.workflowId,
      completionPercent: e.completionPercent,
      hasCesDescription: e.description?.includes('CES EVENT'),
    });
  }

  const raw = await listCiEvents();
  const googleDupes = reportGoogleRawDuplicates(raw.filter(ev => {
    const d = ev.start?.date ?? ev.start?.dateTime?.slice(0, 10) ?? '';
    return d.startsWith('2026-06') || d.startsWith('2026-05');
  }));
  console.log('\n── Live Google duplicate groups (May/June, reported not deleted) ──');
  console.log(JSON.stringify(googleDupes.filter(d =>
    d.title.toLowerCase().includes('qapi') ||
    d.title.toLowerCase().includes('infection') ||
    d.title.toLowerCase().includes('physician'),
  ), null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});