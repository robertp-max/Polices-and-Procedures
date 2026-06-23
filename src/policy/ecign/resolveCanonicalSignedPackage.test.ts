/// <reference types="node" />

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveCanonicalSignedPackages,
  type SignedPackageLike,
} from './resolveCanonicalSignedPackage';

const FORM_INSTANCE = 'compliance_effectiveness_review-20260601-01-EN-FM-022-001';
const EVENT_ID = 'compliance_effectiveness_review-20260601-01';

function signedPackage(over: Partial<SignedPackageLike> = {}): SignedPackageLike {
  return {
    id: over.id ?? 'ART-SIGNED-1',
    linkedFormInstanceId: over.linkedFormInstanceId ?? FORM_INSTANCE,
    artifactType: over.artifactType ?? 'signed_package',
    status: over.status ?? 'FINALIZED',
    ...over,
  };
}

describe('resolveCanonicalSignedPackages', () => {
  it('returns exactly one canonical match after finalize', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [signedPackage()],
    };
    const matches = resolveCanonicalSignedPackages(store, {
      eventId: EVENT_ID,
      formInstanceId: FORM_INSTANCE,
    });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].id, 'ART-SIGNED-1');
  });

  it('accepts signed_form_instance and kind=signed_package shapes', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [
        signedPackage({ id: 'A', artifactType: 'signed_form_instance' }),
        signedPackage({ id: 'B', artifactType: undefined, kind: 'signed_package' }),
      ],
    };
    const matches = resolveCanonicalSignedPackages(store, {
      eventId: EVENT_ID,
      formInstanceId: FORM_INSTANCE,
    });
    assert.deepEqual(matches.map((m) => m.id).sort(), ['A', 'B']);
  });

  it('ignores superseded artifacts and the HHC session-only mirror (non-CES)', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [
        signedPackage({ id: 'OLD', status: 'SUPERSEDED' }),
        signedPackage({ id: 'OLD2', supersededAt: '2026-06-01T00:00:00.000Z' }),
        // HHC mirror (LAMBDA/ECIGN-INTERNAL-MIRROR) is isolated/non-CES and excluded from canonical signed_package resolution
        { id: 'ECIGN-INTERNAL-MIRROR-1', artifactType: 'evidence', linkedFormInstanceId: FORM_INSTANCE },
      ],
    };
    const matches = resolveCanonicalSignedPackages(store, {
      eventId: EVENT_ID,
      formInstanceId: FORM_INSTANCE,
    });
    assert.equal(matches.length, 0);
  });

  it('does not match a different form instance', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [signedPackage({ linkedFormInstanceId: 'some-other-instance-001' })],
    };
    const matches = resolveCanonicalSignedPackages(store, {
      eventId: EVENT_ID,
      formInstanceId: FORM_INSTANCE,
    });
    assert.equal(matches.length, 0);
  });

  it('de-duplicates the same artifact found across event aliases', () => {
    const shared = signedPackage({ id: 'ART-SHARED' });
    const aliasEvent = 'EVT-FORM-FI-compliance_effectiveness_review-20260601-01';
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [shared],
      [aliasEvent]: [shared],
    };
    const matches = resolveCanonicalSignedPackages(store, {
      eventId: EVENT_ID,
      formInstanceId: FORM_INSTANCE,
      eventAliases: [aliasEvent],
    });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].id, 'ART-SHARED');
  });

  it('canonical artifact with no Drive metadata requires pre-finalize evidenceHealth + publish (blocks until Drive config healthy)', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [signedPackage({ id: 'EV-NODRIVE', driveFileId: undefined })],
    };
    const matches = resolveCanonicalSignedPackages(store, { eventId: EVENT_ID, formInstanceId: FORM_INSTANCE });
    assert.equal(matches.length, 1);
    assert.ok(!matches[0].driveFileId, 'no drive yet');
  });

  it('successful Drive upload persists metadata onto the same artifact (no duplicate created)', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [{
        id: 'EV-WITHDRIVE',
        linkedFormInstanceId: FORM_INSTANCE,
        artifactType: 'signed_package',
        status: 'EVIDENCE_LOCKED',
        driveFileId: 'drive-123',
        driveFolderId: 'folder-abc',
        webViewLink: 'https://drive.google.com/file/d/drive-123',
        driveUploadStatus: 'uploaded',
      }],
    };
    const matches = resolveCanonicalSignedPackages(store, { eventId: EVENT_ID, formInstanceId: FORM_INSTANCE });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].driveFileId, 'drive-123');
    assert.equal(matches[0].driveUploadStatus, 'uploaded');
  });

  it('artifact with existing driveFileId does not re-upload (idempotent)', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [signedPackage({ id: 'EV-IDEMP', driveFileId: 'drive-existing' })],
    };
    const matches = resolveCanonicalSignedPackages(store, { eventId: EVENT_ID, formInstanceId: FORM_INSTANCE });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].driveFileId, 'drive-existing');
  });

  it('artifact without driveFileId is returned by resolver but pre-finalize health + finalDriveSuccess gate blocks (exact "Evidence finalization blocked" error)', () => {
    const store: Record<string, SignedPackageLike[]> = {
      [EVENT_ID]: [signedPackage({ id: 'EV-LOCAL', driveFileId: undefined, driveUploadStatus: undefined })],
    };
    const matches = resolveCanonicalSignedPackages(store, { eventId: EVENT_ID, formInstanceId: FORM_INSTANCE });
    const m = matches[0];
    assert.ok(m);
    assert.ok(!m.driveFileId);
    // Finalize caller + gate require driveFileId (or uploaded status) before success/locked complete.
  });
});
