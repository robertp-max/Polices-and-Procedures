import { ensureFolderPath, uploadFile } from './server/googleDrive.ts';
import { Readable } from 'node:stream';
(async () => {
  const segs = ['01_CES', 'Evidence', '2026', 'June', 'qapi_meeting-20260609-10'];
  const folderId = await ensureFolderPath(segs);
  console.log('EVENT_FOLDER_ID:', folderId);
  const content = 'MOCK TEST EVIDENCE  NO PHI  DRIVE ACCESS PROBE qapi_meeting-20260609-10';
  const buf = Buffer.from(content, 'utf8');
  const up = await uploadFile({ parentId: folderId, name: 'drive-access-probe.txt', mimeType: 'text/plain', buffer: buf });
  console.log('UPLOAD_FILE_ID:', up.fileId);
  console.log('UPLOAD_WEB:', up.webViewLink);
  console.log('FOLDER_URL: https://drive.google.com/drive/folders/' + folderId);
})();
