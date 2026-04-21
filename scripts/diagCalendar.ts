import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? '';
const CRED_RAW    = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './server/credentials/service-account.json';
const CRED_PATH   = path.isAbsolute(CRED_RAW) ? CRED_RAW : path.resolve(repoRoot, CRED_RAW);

async function main() {
  console.log('Calendar ID in .env :', CALENDAR_ID);
  console.log('Credentials         :', CRED_PATH);

  const auth = new google.auth.GoogleAuth({
    keyFile: CRED_PATH,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
  const authClient = await auth.getClient();
  const cal = google.calendar({ version: 'v3', auth: authClient as never });

  // 1. Try calendars.get (requires at least viewer permission)
  console.log('\n── Test 1: calendars.get ──');
  try {
    const r = await cal.calendars.get({ calendarId: CALENDAR_ID });
    console.log('✅ calendars.get OK — name:', r.data.summary, '| id:', r.data.id);
  } catch (e: unknown) {
    console.log('❌ calendars.get failed:', (e as Error).message);
  }

  // 2. Try events.list (requires at least viewer permission)
  console.log('\n── Test 2: events.list ──');
  try {
    const r = await cal.events.list({ calendarId: CALENDAR_ID, maxResults: 3 });
    console.log('✅ events.list OK — items found:', r.data.items?.length ?? 0);
  } catch (e: unknown) {
    console.log('❌ events.list failed:', (e as Error).message);
  }

  // 3. Try events.insert with a test event (requires "Make changes to events")
  console.log('\n── Test 3: events.insert (write test) ──');
  try {
    const r = await cal.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: '[TEST — DELETE ME] CI Planner write test',
        start: { date: '2026-04-22' },
        end:   { date: '2026-04-23' },
        extendedProperties: { private: { appEventId: 'test-write-check', source: 'ci-diag' } },
      },
    });
    console.log('✅ Write access CONFIRMED — event id:', r.data.id);
    // Clean up the test event immediately
    await cal.events.delete({ calendarId: CALENDAR_ID, eventId: r.data.id! });
    console.log('✅ Test event cleaned up. Ready to push all events.');
  } catch (e: unknown) {
    const msg = (e as Error).message ?? '';
    if (msg.includes('insufficientPermissions') || msg.includes('Forbidden')) {
      console.log('❌ WRITE BLOCKED — permission is "See all event details" (read-only)');
      console.log('   FIX: In calendar settings → Shared with → click "See all event details" dropdown');
      console.log('        → change to "Make changes to events" → it saves automatically');
    } else {
      console.log('❌ Write test failed:', msg);
    }
  }

  // 4. If ID seems wrong, find all calendars the service account can list
  console.log('\n── Service account calendar list (if any) ──');
  try {
    const list = await cal.calendarList.list();
    const items = list.data.items ?? [];
    if (items.length === 0) {
      console.log('  (empty — normal for service accounts)');
    } else {
      for (const c of items) console.log(' -', c.summary, '\n   ID:', c.id);
    }
  } catch (e: unknown) {
    console.log('  list error:', (e as Error).message);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
