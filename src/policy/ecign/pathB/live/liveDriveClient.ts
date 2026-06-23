/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2-live B: ISOLATED live Drive client boundary.
 *
 * The ONLY module that imports googleapis / touches credentials. Excluded from the
 * app build (src/policy is not in tsconfig.app) and NOT imported by tests or the
 * app — only by the manual sandbox proof. Uses the least-privilege `drive.file`
 * scope, writes only to the caller-supplied sandbox folder, sets NO public
 * permissions, and performs NO deletes. Credentials are read by GoogleAuth (keyFile
 * / GOOGLE_APPLICATION_CREDENTIALS) and never logged, returned, or stored here.
 */
import { Readable } from 'node:stream';
import { google } from 'googleapis';
import type { DriveClient, DriveSandboxUploadInput, DriveSandboxUploadResult } from './driveSandboxPublisher';

export interface LiveDriveClientOptions {
  /** Path to the service-account/credential file (else GoogleAuth uses the env default). */
  readonly credentialPath?: string;
  readonly scopes?: readonly string[];
}

/** Construct a real Drive client implementing the injected `DriveClient` boundary. */
export function createLiveDriveClient(opts: LiveDriveClientOptions = {}): DriveClient {
  const auth = new google.auth.GoogleAuth({
    keyFile: opts.credentialPath,
    // Least privilege: app may only touch files it creates (sandbox-scoped).
    scopes: [...(opts.scopes ?? ['https://www.googleapis.com/auth/drive.file'])],
  });
  const drive = google.drive({ version: 'v3', auth });

  return {
    async uploadToFolder(input: DriveSandboxUploadInput): Promise<DriveSandboxUploadResult> {
      const res = await drive.files.create({
        requestBody: { name: input.name, parents: [input.folderId] },
        media: { mimeType: input.mimeType, body: Readable.from(Buffer.from(input.bytes)) },
        fields: 'id, webViewLink',
        // NO permissions changes anywhere — never public.
      });
      const fileId = res.data.id;
      if (!fileId) throw new Error('Drive upload returned no file id');
      return { fileId, webViewLink: res.data.webViewLink ?? undefined };
    },
    async downloadBytes(fileId: string): Promise<Uint8Array> {
      const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
      return new Uint8Array(res.data as unknown as ArrayBuffer);
    },
  };
}
