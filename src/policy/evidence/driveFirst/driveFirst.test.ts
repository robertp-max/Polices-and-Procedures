/**
 * Drive-first evidence architecture — acceptance-gate tests.
 *
 * Proves, against deterministic in-memory adapters (no cloud resources):
 *  - wrong-role users cannot accept evidence; no self-approval
 *  - accepted evidence cannot be overwritten in place; supersede versions forward
 *  - non-evidence operations (audit events, metadata updates) create no Drive file
 *  - finalization creates exactly ONE Drive file + ONE metadata record
 *  - retries with the same commandId never duplicate the Drive file
 *  - the stored Drive file id matches the returned link; sha256 matches the bytes
 *  - temporary storage is deleted after success; failures stay recoverable
 *  - missing/trashed/access-denied files are integrity defects, never "valid"
 *  - links resolve to the canonical Drive reference with _blank + noopener
 *  - packets read canonical Drive evidence, fail closed, and land in Drive
 *  - eCign finalization stores the signed artifact in Drive with signer metadata
 *  - no PHI in audit payloads; the audit hash chain stays intact
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryDriveEvidenceRepository,
} from './driveEvidenceRepository';
import { InMemoryTempObjectStore, tempUploadPath } from './tempObjectStore';
import { InMemoryEvidenceMetadataStore, MetadataStoreError } from './metadataStore';
import { InMemoryAuditLedger, AuditPhiError } from './auditLedger';
import {
  UploadSessionStore,
  finalizeEvidence,
  finalizeSignedArtifact,
  sha256HexBytes,
  FinalizeError,
  type FinalizeDeps,
  type FinalizeEvidenceInput,
} from './finalizeEvidence';
import { reviewEvidence, supersedeEvidence, ReviewError } from './reviewEvidence';
import {
  checkEvidenceIntegrity,
  scanForOrphans,
  resolveEvidenceLink,
} from './integrityChecker';
import { generateSurveyPacket, PacketError } from './generatePacket';
import type { Actor } from './contracts';

const NURSE: Actor = { userId: 'user-nurse-1', role: 'learner' };
const DON: Actor = { userId: 'user-don-1', role: 'supervisor' };
const ADMIN: Actor = { userId: 'user-admin-1', role: 'admin' };
const FOLDER = 'folder-event-evidence';
const EXPORTS_FOLDER = 'folder-exports';

type Deps = FinalizeDeps & {
  drive: InMemoryDriveEvidenceRepository;
  temp: InMemoryTempObjectStore;
  metadata: InMemoryEvidenceMetadataStore;
  audit: InMemoryAuditLedger;
};

function makeDeps(): Deps {
  let tick = 0;
  return {
    drive: new InMemoryDriveEvidenceRepository(),
    temp: new InMemoryTempObjectStore(),
    metadata: new InMemoryEvidenceMetadataStore(),
    audit: new InMemoryAuditLedger(),
    sessions: new UploadSessionStore(),
    now: () => `2026-02-01T00:00:00.${String(++tick).padStart(3, '0')}Z`,
  };
}

async function stage(
  deps: Deps,
  actor: Actor,
  commandId: string,
  content: string,
  fileName = 'evt-1001-supporting-doc.pdf',
): Promise<FinalizeEvidenceInput> {
  const bytes = new TextEncoder().encode(content);
  const path = tempUploadPath(actor.userId, commandId, fileName);
  await deps.temp.put(path, bytes, 'application/pdf');
  return {
    commandId,
    actor,
    eventId: 'evt-1001',
    tempPath: path,
    evidenceType: 'supporting_documentation',
    fileName,
    mimeType: 'application/pdf',
    driveFolderId: FOLDER,
  };
}

describe('drive-first evidence finalization', () => {
  let deps: Deps;
  beforeEach(() => { deps = makeDeps(); });

  it('creates exactly one Drive file and one metadata record; link, id, and sha256 agree; temp is deleted', async () => {
    const input = await stage(deps, NURSE, 'cmd-fin-1', 'inservice sign-in sheet bytes');
    const result = await finalizeEvidence(deps, input);

    expect(await deps.drive.fileCount()).toBe(1);
    expect(await deps.metadata.recordCount()).toBe(1);

    const record = await deps.metadata.get(result.evidenceId);
    expect(record).not.toBeNull();
    expect(record!.driveFileId).toBe(result.driveFileId);
    expect(result.driveWebViewLink).toContain(result.driveFileId);
    const driveBytes = await deps.drive.getFileBytes(result.driveFileId);
    expect(sha256HexBytes(driveBytes)).toBe(record!.sha256);
    expect(record!.status).toBe('submitted');

    // Temporary storage is deleted after successful finalization.
    expect(await deps.temp.objectCount()).toBe(0);
    expect(deps.sessions.get('cmd-fin-1')!.state).toBe('completed');
  });

  it('retry with the same commandId creates no duplicate Drive file', async () => {
    const input = await stage(deps, NURSE, 'cmd-retry-1', 'same artifact');
    const first = await finalizeEvidence(deps, input);
    const second = await finalizeEvidence(deps, input);

    expect(second.driveFileId).toBe(first.driveFileId);
    expect(second.evidenceId).toBe(first.evidenceId);
    expect(second.reconciled).toBe(true);
    expect(await deps.drive.fileCount()).toBe(1);
    expect(await deps.metadata.recordCount()).toBe(1);
  });

  it('Drive-created-but-metadata-failed stays recoverable: retry reconciles the existing file', async () => {
    const input = await stage(deps, NURSE, 'cmd-partial-1', 'partial failure artifact');
    deps.metadata.failNextPut();
    await expect(finalizeEvidence(deps, input)).rejects.toMatchObject({ code: 'metadata_error' });

    // The Drive file exists; metadata does not; the session demands reconciliation.
    expect(await deps.drive.fileCount()).toBe(1);
    expect(await deps.metadata.recordCount()).toBe(0);
    expect(deps.sessions.get('cmd-partial-1')!.state).toBe('reconciliation_required');
    expect(deps.audit.entries().some((e) => e.result === 'partial_failure')).toBe(true);

    // Retry with the SAME commandId: reconciles, does not duplicate.
    const result = await finalizeEvidence(deps, input);
    expect(result.reconciled).toBe(true);
    expect(await deps.drive.fileCount()).toBe(1);
    expect(await deps.metadata.recordCount()).toBe(1);
    expect(deps.sessions.get('cmd-partial-1')!.state).toBe('completed');
  });

  it('refuses PHI-looking evidence names', async () => {
    const input = await stage(deps, NURSE, 'cmd-phi-1', 'x', 'patient-jane-doe-dob-01-02-1950.pdf');
    await expect(finalizeEvidence(deps, input)).rejects.toBeInstanceOf(FinalizeError);
    expect(await deps.drive.fileCount()).toBe(0);
  });

  it('missing temp object fails without touching Drive', async () => {
    const input = await stage(deps, NURSE, 'cmd-miss-1', 'x');
    await deps.temp.delete(input.tempPath);
    await expect(finalizeEvidence(deps, input)).rejects.toMatchObject({ code: 'temp_object_missing' });
    expect(await deps.drive.fileCount()).toBe(0);
  });
});

describe('review authority and immutability', () => {
  let deps: Deps;
  beforeEach(() => { deps = makeDeps(); });

  async function submitOne(commandId = 'cmd-sub-1') {
    const input = await stage(deps, NURSE, commandId, `artifact ${commandId}`);
    return finalizeEvidence(deps, input);
  }

  it('wrong-role users cannot accept evidence', async () => {
    const { evidenceId } = await submitOne();
    await expect(
      reviewEvidence(deps, { commandId: 'cmd-rev-1', actor: NURSE, evidenceId, decision: 'accepted' }),
    ).rejects.toMatchObject({ code: 'unauthorized' });
  });

  it('a user cannot approve their own evidence, even with a reviewer role', async () => {
    const selfReviewer: Actor = { userId: NURSE.userId, role: 'supervisor' };
    const { evidenceId } = await submitOne();
    await expect(
      reviewEvidence(deps, { commandId: 'cmd-rev-2', actor: selfReviewer, evidenceId, decision: 'accepted' }),
    ).rejects.toMatchObject({ code: 'self_review_forbidden' });
  });

  it('acceptance locks the record: no in-place overwrite of the artifact identity', async () => {
    const { evidenceId, sha256 } = await submitOne();
    const accepted = await reviewEvidence(deps, {
      commandId: 'cmd-rev-3', actor: DON, evidenceId, decision: 'accepted',
    });
    expect(accepted.status).toBe('accepted');
    expect(accepted.lockedAt).toBeTruthy();
    expect(accepted.sha256).toBe(sha256);

    await expect(deps.metadata.update(evidenceId, { sha256: 'deadbeef' }))
      .rejects.toBeInstanceOf(MetadataStoreError);
    await expect(deps.metadata.update(evidenceId, { driveFileId: 'drive-file-9999' }))
      .rejects.toMatchObject({ code: 'accepted_evidence_locked' });
    await expect(deps.metadata.update(evidenceId, { status: 'rejected' }))
      .rejects.toMatchObject({ code: 'accepted_evidence_locked' });
    const record = (await deps.metadata.get(evidenceId))!;
    await expect(deps.metadata.put({ ...record, sha256: 'deadbeef' }))
      .rejects.toMatchObject({ code: 'accepted_evidence_locked' });
  });

  it('superseding creates a new evidence record and preserves the old one', async () => {
    const { evidenceId } = await submitOne();
    await reviewEvidence(deps, { commandId: 'cmd-rev-4', actor: DON, evidenceId, decision: 'accepted' });

    const replacementBytes = new TextEncoder().encode('corrected artifact');
    const replacementPath = tempUploadPath(DON.userId, 'cmd-sup-1', 'evt-1001-supporting-doc-v2.pdf');
    await deps.temp.put(replacementPath, replacementBytes, 'application/pdf');

    const result = await supersedeEvidence(deps, {
      commandId: 'cmd-sup-1',
      actor: DON,
      supersedesEvidenceId: evidenceId,
      replacement: {
        eventId: 'evt-1001',
        tempPath: replacementPath,
        evidenceType: 'supporting_documentation',
        fileName: 'evt-1001-supporting-doc-v2.pdf',
        mimeType: 'application/pdf',
        driveFolderId: FOLDER,
      },
    });

    expect(result.newEvidence.evidenceId).not.toBe(evidenceId);
    const newRecord = (await deps.metadata.get(result.newEvidence.evidenceId))!;
    expect(newRecord.supersedesEvidenceId).toBe(evidenceId);
    const oldRecord = (await deps.metadata.get(evidenceId))!;
    expect(oldRecord.status).toBe('superseded');
    expect(oldRecord.driveFileId).toBeTruthy();      // prior artifact preserved
    expect(await deps.drive.fileCount()).toBe(2);    // both versions exist in Drive
  });

  it('rejection requires a reason and preserves the resubmission trail', async () => {
    const { evidenceId } = await submitOne();
    await expect(
      reviewEvidence(deps, { commandId: 'cmd-rev-5', actor: DON, evidenceId, decision: 'rejected' }),
    ).rejects.toMatchObject({ code: 'invalid_state' });
    const rejected = await reviewEvidence(deps, {
      commandId: 'cmd-rev-6', actor: DON, evidenceId, decision: 'rejected', rejectionReason: 'wrong quarter',
    });
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('wrong quarter');
  });
});

describe('non-evidence domains are metadata only', () => {
  it('audit events and operational updates create no Drive file', async () => {
    const deps = makeDeps();
    deps.audit.append({
      actorUserId: ADMIN.userId, actorRole: ADMIN.role, action: 'eventTaskUpdate',
      entityType: 'task', entityId: 'task-77', eventId: 'evt-1001', result: 'ok',
    });
    deps.audit.append({
      actorUserId: ADMIN.userId, actorRole: ADMIN.role, action: 'adminUpdateUserSetup',
      entityType: 'learner', entityId: 'learner-9', result: 'ok',
    });
    expect(deps.audit.entries()).toHaveLength(2);
    expect(await deps.drive.fileCount()).toBe(0);
    expect(await deps.temp.objectCount()).toBe(0);
  });
});

describe('integrity checker and link resolution', () => {
  let deps: Deps;
  let evidenceId: string;
  let driveFileId: string;

  beforeEach(async () => {
    deps = makeDeps();
    const input = await stage(deps, NURSE, 'cmd-int-1', 'integrity target');
    const result = await finalizeEvidence(deps, input);
    evidenceId = result.evidenceId;
    driveFileId = result.driveFileId;
  });

  it('reports current for a healthy record (hash verified)', async () => {
    const record = (await deps.metadata.get(evidenceId))!;
    const report = await checkEvidenceIntegrity(record, deps.drive, { recomputeHash: true });
    expect(report.status).toBe('current');
  });

  it('a missing Drive file is an integrity defect and an orphaned record', async () => {
    deps.drive.simulateHardDelete(driveFileId);
    const record = (await deps.metadata.get(evidenceId))!;
    expect((await checkEvidenceIntegrity(record, deps.drive)).status).toBe('missing');
    const orphans = await scanForOrphans(deps.metadata, deps.drive);
    expect(orphans.orphanedFirestoreRecords).toContain(evidenceId);
  });

  it('a trashed Drive file is never shown as valid evidence', async () => {
    deps.drive.simulateTrash(driveFileId);
    const record = (await deps.metadata.get(evidenceId))!;
    expect((await checkEvidenceIntegrity(record, deps.drive)).status).toBe('trashed');
    const link = await resolveEvidenceLink(record, deps.drive);
    expect(link.ok).toBe(false);
    if (!link.ok) expect(link.integrityStatus).toBe('trashed');
  });

  it('access-denied evidence is not presented as available', async () => {
    deps.drive.simulateAccessLoss(driveFileId);
    const record = (await deps.metadata.get(evidenceId))!;
    expect((await checkEvidenceIntegrity(record, deps.drive)).status).toBe('access_denied');
    const link = await resolveEvidenceLink(record, deps.drive);
    expect(link.ok).toBe(false);
  });

  it('detects out-of-band edits: revision change and hash mismatch', async () => {
    deps.drive.simulateContentTamper(driveFileId, new TextEncoder().encode('tampered'));
    const record = (await deps.metadata.get(evidenceId))!;
    expect((await checkEvidenceIntegrity(record, deps.drive)).status).toBe('revision_changed');
    // Without a recorded revision, the recomputed hash still catches it.
    const noRev = { ...record, driveRevisionId: undefined };
    expect((await checkEvidenceIntegrity(noRev, deps.drive, { recomputeHash: true })).status).toBe('hash_mismatch');
  });

  it('detects orphaned Drive files (file with no metadata record)', async () => {
    await deps.drive.createFile({
      idempotencyKey: 'cmd-stray-1', parentFolderId: FOLDER, name: 'stray.bin',
      mimeType: 'application/octet-stream', bytes: new TextEncoder().encode('stray'),
    });
    const orphans = await scanForOrphans(deps.metadata, deps.drive);
    expect(orphans.orphanedDriveFiles).toHaveLength(1);
    expect(orphans.orphanedFirestoreRecords).toHaveLength(0);
  });

  it('valid evidence links use the canonical Drive reference, new tab, safe rel', async () => {
    const record = (await deps.metadata.get(evidenceId))!;
    const link = await resolveEvidenceLink(record, deps.drive);
    expect(link.ok).toBe(true);
    if (link.ok) {
      expect(link.href).toContain(driveFileId);
      expect(link.href).toContain('drive.google.com');
      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noopener noreferrer');
    }
  });
});

describe('eCign signed artifacts', () => {
  it('finalization stores the executed package in Drive with signer metadata', async () => {
    const deps = makeDeps();
    const bytes = new TextEncoder().encode('executed signed package pdf bytes');
    const path = tempUploadPath(DON.userId, 'cmd-sign-1', 'form-instance-42-signed.pdf');
    await deps.temp.put(path, bytes, 'application/pdf');
    const result = await finalizeSignedArtifact(deps, {
      commandId: 'cmd-sign-1',
      actor: DON,
      eventId: 'evt-1001',
      tempPath: path,
      fileName: 'form-instance-42-signed.pdf',
      mimeType: 'application/pdf',
      driveFolderId: 'folder-signed-forms',
      formId: 'form-42',
      formInstanceId: 'fi-42-1',
      signedBy: DON.userId,
      signedAt: '2026-02-01T00:00:00Z',
    });
    const record = (await deps.metadata.get(result.evidenceId))!;
    expect(record.evidenceType).toBe('signed_artifact');
    expect(record.signedBy).toBe(DON.userId);
    expect(record.driveFileId).toBe(result.driveFileId);
    expect(await deps.drive.fileCount()).toBe(1);
  });

  it('rejects a signed artifact without signer identity binding', async () => {
    const deps = makeDeps();
    const path = tempUploadPath(DON.userId, 'cmd-sign-2', 'form-signed.pdf');
    await deps.temp.put(path, new TextEncoder().encode('x'), 'application/pdf');
    await expect(finalizeEvidence(deps, {
      commandId: 'cmd-sign-2', actor: DON, eventId: 'evt-1001', tempPath: path,
      evidenceType: 'signed_artifact', fileName: 'form-signed.pdf',
      mimeType: 'application/pdf', driveFolderId: 'folder-signed-forms',
    })).rejects.toMatchObject({ code: 'validation_error' });
  });
});

describe('survey packet generation', () => {
  let deps: Deps;

  beforeEach(async () => {
    deps = makeDeps();
    for (const n of [1, 2]) {
      const input = await stage(deps, NURSE, `cmd-pk-${n}`, `accepted artifact ${n}`, `evt-1001-doc-${n}.pdf`);
      const { evidenceId } = await finalizeEvidence(deps, input);
      await reviewEvidence(deps, { commandId: `cmd-pkr-${n}`, actor: DON, evidenceId, decision: 'accepted' });
    }
  });

  it('reads canonical Drive evidence, publishes the packet to Drive, indexes it, and leaves no temp objects', async () => {
    const before = await deps.drive.fileCount();
    const result = await generateSurveyPacket(deps, {
      commandId: 'cmd-export-1', actor: ADMIN, eventId: 'evt-1001',
      exportId: 'export-1', driveExportsFolderId: EXPORTS_FOLDER,
    });
    expect(result.includedEvidenceIds).toHaveLength(2);
    // Final packet lives in Drive (one new file) — no permanent GCS copy.
    expect(await deps.drive.fileCount()).toBe(before + 1);
    expect(await deps.temp.objectCount()).toBe(0);
    const packetRecord = (await deps.metadata.get(result.packet.evidenceId))!;
    expect(packetRecord.evidenceType).toBe('final_package');
    expect(packetRecord.sha256).toBe(result.packetSha256);
    const packetBytes = await deps.drive.getFileBytes(result.packet.driveFileId);
    expect(sha256HexBytes(packetBytes)).toBe(result.packetSha256);
  });

  it('fails closed when any accepted evidence is missing or inaccessible', async () => {
    const accepted = (await deps.metadata.listByEvent('evt-1001')).filter((r) => r.status === 'accepted');
    deps.drive.simulateTrash(accepted[0].driveFileId);
    await expect(generateSurveyPacket(deps, {
      commandId: 'cmd-export-2', actor: ADMIN, eventId: 'evt-1001',
      exportId: 'export-2', driveExportsFolderId: EXPORTS_FOLDER,
    })).rejects.toBeInstanceOf(PacketError);
    // Nothing new was published and the failure is audited.
    expect(deps.audit.entries().some((e) => e.action === 'exportSurveyPacket' && e.result === 'error')).toBe(true);
  });

  it('wrong-role users cannot generate packets', async () => {
    await expect(generateSurveyPacket(deps, {
      commandId: 'cmd-export-3', actor: NURSE, eventId: 'evt-1001',
      exportId: 'export-3', driveExportsFolderId: EXPORTS_FOLDER,
    })).rejects.toMatchObject({ code: 'unauthorized' });
  });
});

describe('audit ledger safety', () => {
  it('refuses PHI-like payloads and forbidden keys', () => {
    const audit = new InMemoryAuditLedger();
    expect(() => audit.append({
      actorUserId: 'u1', actorRole: 'admin', action: 'evidenceAccept',
      entityType: 'evidence', entityId: 'ev-1', result: 'ok',
      detail: 'patient jane doe reviewed',
    })).toThrow(AuditPhiError);
    expect(() => audit.append({
      actorUserId: 'u1', actorRole: 'admin', action: 'x', entityType: 'evidence',
      entityId: 'ev-1', result: 'ok',
      ...( { ssn: '123-45-6789' } as Record<string, string>),
    } as never)).toThrow(AuditPhiError);
  });

  it('maintains an intact hash chain across entries', () => {
    const audit = new InMemoryAuditLedger();
    for (let i = 0; i < 5; i += 1) {
      audit.append({
        actorUserId: `u${i}`, actorRole: 'admin', action: 'eventTaskUpdate',
        entityType: 'task', entityId: `task-${i}`, result: 'ok',
      });
    }
    expect(audit.verifyChain()).toEqual([]);
    const entries = audit.entries();
    expect(entries[0].previousAuditHash).toBe('GENESIS');
    expect(entries[3].currentAuditHash).toBe(entries[4].previousAuditHash);
  });
});

describe('ReviewError export sanity', () => {
  it('exposes typed codes for API mapping', () => {
    const err = new ReviewError('unauthorized');
    expect(err.code).toBe('unauthorized');
  });
});
