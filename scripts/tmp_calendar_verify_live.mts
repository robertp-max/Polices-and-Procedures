import { syncDeterministicEvent, detectAndOptionallyCleanDuplicates, summarizeSyncStats } from '../server/sync/eventSync';
import type { PlannerEventPayload } from '../server/mappers';

const now = new Date();
const date = now.toISOString().slice(0, 10);

function sample(id: string, title: string): PlannerEventPayload {
  return {
    event_id: id,
    appEventId: id,
    title,
    summary: `Verification sample for ${id}`,
    date,
    time: '10:00',
    timezone: 'America/Los_Angeles',
    category: 'Compliance',
    owner: 'Compliance Team',
    status: 'scheduled',
    env: 'PROD',
    source: 'CI_ENGINE',
    version: 1,
  };
}

const samples = [
  sample('EVT-VERIFY-LIVE-001', 'Live Verify Event 001'),
  sample('EVT-VERIFY-LIVE-002', 'Live Verify Event 002'),
  sample('EVT-VERIFY-LIVE-003', 'Live Verify Event 003'),
];

const first = [] as Awaited<ReturnType<typeof syncDeterministicEvent>>[];
for (const p of samples) first.push(await syncDeterministicEvent(p));
console.log('FIRST', JSON.stringify(summarizeSyncStats(first)));

for (const r of first) {
  if (!r.google_event_id) continue;
  const details = await import('../server/googleCalendar');
  const g = await details.getEvent(r.google_event_id);
  const desc = g.description ?? '';
  const ok = desc.includes(`https://dovdry3t4njek.cloudfront.net/calendar?event=${encodeURIComponent(r.event_id)}`);
  console.log(ok ? 'APP_LINK_OK' : 'APP_LINK_MISSING', r.event_id, r.google_event_id);
}

const second = [] as Awaited<ReturnType<typeof syncDeterministicEvent>>[];
for (const p of samples) second.push(await syncDeterministicEvent(p));
console.log('SECOND', JSON.stringify(summarizeSyncStats(second)));

const dry = await detectAndOptionallyCleanDuplicates({ dryRun: true, maxScan: 250 });
console.log('DRY_CLEANUP', JSON.stringify(dry));
