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
  console.log('Calendar ID from .env :', CALENDAR_ID);
  console.log('Credentials path      :', CRED_PATH);

  const auth = new google.auth.GoogleAuth({
    keyFile: CRED_PATH,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
  const authClient = await auth.getClient();
  const cal = google.calendar({ version: 'v3', auth: authClient as never });

  // Try to access the specific calendar
  try {
    const r = await cal.calendars.get({ calendarId: CALENDAR_ID });
    console.log('\n✅ Calendar FOUND:', r.data.summary, '| ID:', r.data.id);
  } catch (e: unknown) {
    const msg = (e as Error).message ?? String(e);
    console.log('\n❌ Calendar NOT accessible:', msg);
  }

  // List all calendars the service account can see
  console.log('\n── Calendars visible to this service account ──');
  try {
    const list = await cal.calendarList.list({ maxResults: 50 });
    const items = list.data.items ?? [];
    if (items.length === 0) {
      console.log('  (none — service account has not been granted access to any calendar)');
      console.log('\n  👉 Fix: In Google Calendar, open "Home Health Compliance" calendar settings');
      console.log('     → "Share with specific people" → add:');
      console.log('     hh-enterprise-policy-architect@orbital-stage-443721-v1.iam.gserviceaccount.com');
      console.log('     with permission: "Make changes to events"');
    } else {
      for (const c of items) {
        console.log(' -', c.summary, '\n   ID:', c.id);
      }
    }
  } catch (e: unknown) {
    console.log('Could not list calendars:', (e as Error).message);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
