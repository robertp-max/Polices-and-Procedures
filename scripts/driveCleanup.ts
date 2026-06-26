/**
 * One-off Drive maintenance: keep the "Brad Training" folder, trash everything
 * else at the root of the evidence shared drive.
 *
 *   Dry run (default): lists root items, marks what WOULD be trashed.
 *   Apply:             tsx scripts/driveCleanup.ts --apply   (moves to Trash)
 *
 * Uses the configured service-account key (.env GOOGLE_APPLICATION_CREDENTIALS).
 * Trash is recoverable in Drive for ~30 days — this never permanently deletes.
 */
import 'dotenv/config';
import { google } from 'googleapis';

const KEEP = /brad\s*training/i;

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const driveId = process.env.GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID;
  const rootId = process.env.GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID ?? driveId;
  if (!keyFile || !driveId) { console.error('Missing GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID in .env'); process.exit(1); }

  const auth = new google.auth.GoogleAuth({ keyFile, scopes: ['https://www.googleapis.com/auth/drive'] });
  const drive = google.drive({ version: 'v3', auth: (await auth.getClient()) as never });

  const res = await drive.files.list({
    corpora: 'drive', driveId, includeItemsFromAllDrives: true, supportsAllDrives: true,
    q: `'${rootId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType)', pageSize: 1000,
  });
  const items = res.data.files ?? [];
  console.log(`Root of shared drive ${driveId} — ${items.length} item(s):\n`);

  const toTrash: { id: string; name: string }[] = [];
  for (const f of items) {
    const keep = KEEP.test(f.name ?? '');
    console.log(`  ${keep ? '[KEEP ]' : '[TRASH]'} ${f.name}  (${f.mimeType?.includes('folder') ? 'folder' : 'file'}, id=${f.id})`);
    if (!keep && f.id) toTrash.push({ id: f.id, name: f.name ?? f.id });
  }

  if (!apply) {
    console.log(`\nDRY RUN — nothing changed. ${toTrash.length} item(s) would be trashed. Re-run with --apply to trash them.`);
    return;
  }

  console.log(`\nAPPLY — trashing ${toTrash.length} item(s)…`);
  for (const t of toTrash) {
    await drive.files.update({ fileId: t.id, requestBody: { trashed: true }, supportsAllDrives: true });
    console.log(`  trashed: ${t.name} (${t.id})`);
  }
  console.log(`\nDone. ${toTrash.length} item(s) moved to Trash (recoverable ~30 days). Kept anything matching /brad training/i.`);
}

main().catch((e) => { console.error('ERR', e?.message || e); process.exit(1); });
