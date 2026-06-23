import { pingDrive, findFolder, ensureFolderPath, _resetFolderCache } from './server/googleDrive.ts';
import { env } from './server/env.ts';
_resetFolderCache();
console.log('START_PROBE');
(async () => {
  try {
    const p = await pingDrive();
    console.log('PING:', JSON.stringify(p));
  } catch(e) { console.error('PING_ERR:', e.message || e); }
  const root = env.driveEvidenceRootFolderId;
  console.log('ROOT:', root);
  try {
    const f = await findFolder('Evidence', root);
    console.log('FIND:', f);
  } catch(e) { console.error('FIND_ERR:', e.message || e); }
  try {
    const fid = await ensureFolderPath(['01_CES','Evidence','2026','June','qapi_meeting-20260609-10']);
    console.log('ENSURE_ID:', fid);
  } catch(e) { console.error('ENSURE_ERR:', e.message || e); }
  console.log('END_PROBE');
})();
