// Access-tier resolution + the privileged/official evidence boundary.

import { beforeEach, describe, expect, it } from 'vitest';

import {
  PRIVILEGED_ACCESS_BANNERS,
  TABLETOP_ACCESS_MODE_PRECEDENCE,
  UAT_REVIEWER_ALLOWLIST,
  clearPrivilegedTabletopAccessLog,
  getPrivilegedTabletopAccessLog,
  isPrivilegedAccessMode,
  isSuperAdminIdentity,
  isUatReviewerIdentity,
  logPrivilegedTabletopAccess,
  resolvePrivilegedAccessMode,
  resolveTabletopAccessMode,
  toTabletopAccessIdentity,
  type TabletopAccessIdentity,
} from '../../compliance/accessMode';
import { commitEvidence } from '../../compliance/complianceStore';
import type { EvidenceSaveInput } from '../../compliance/complianceEvidenceAdapter';

const DEE_EMAIL = UAT_REVIEWER_ALLOWLIST.emails[0];

function identity(patch: Partial<TabletopAccessIdentity> = {}): TabletopAccessIdentity {
  return {
    userId: 'user-gb-7',
    cognitoSub: 'sub-gb-7',
    email: 'member@careindeed.com',
    emailVerified: true,
    appRole: 'Governing Body',
    isDemo: false,
    authenticated: true,
    ...patch,
  };
}

function evidenceInput(patch: Partial<EvidenceSaveInput> = {}): EvidenceSaveInput {
  return {
    schemaVersion: 2,
    assignmentId: 'gb:tabletop2026:tabletop2026-q1',
    learnerId: 'user-super-1',
    role: 'GB',
    sourceId: 'tabletop2026-q1',
    sourceType: 'tabletop',
    sourceVersion: null,
    effectiveDate: null,
    readCompletedAt: null,
    attestedAt: '2026-05-01T10:00:00.000Z',
    answersSnapshot: {},
    score: 1000,
    scoreMaximum: 1000,
    passThreshold: 950,
    scoreScale: 'points_1000',
    outcome: 'passed',
    criticalErrors: [],
    attemptNumber: 1,
    remediationPath: 'none',
    activeTimeSeconds: 600,
    completedAt: '2026-05-01T10:00:00.000Z',
    ...patch,
  };
}

describe('tabletop access tiers', () => {
  it('resolves Dee as uat_reviewer before her broader admin role', () => {
    expect(TABLETOP_ACCESS_MODE_PRECEDENCE).toEqual(['uat_reviewer', 'superadmin', 'official', 'blocked']);

    // Dee has a broader admin role, but tabletop access is intentionally
    // narrowed and labeled as reviewer mode.
    expect(resolveTabletopAccessMode(identity({ appRole: 'Administrator', email: DEE_EMAIL }), false)).toBe(
      'uat_reviewer',
    );
    expect(resolveTabletopAccessMode(identity({ email: DEE_EMAIL }), false)).toBe('uat_reviewer');
    expect(resolveTabletopAccessMode(identity(), true)).toBe('official');
    expect(resolveTabletopAccessMode(identity(), false)).toBe('blocked');
    expect(resolveTabletopAccessMode(null, true)).toBe('blocked');
  });

  it('grants superadmin from the server-provided appRole in any of its canonical spellings', () => {
    for (const role of ['super_admin', 'Administrator', 'Admin', 'System Administrator']) {
      expect(isSuperAdminIdentity(identity({ appRole: role }))).toBe(true);
      expect(resolveTabletopAccessMode(identity({ appRole: role }), false)).toBe('superadmin');
    }
    expect(isSuperAdminIdentity(identity({ appRole: 'Governing Body' }))).toBe(false);
    // The local demo-bypass identity is never privileged even though its
    // hard-coded appRole is 'Administrator'.
    expect(isSuperAdminIdentity(identity({ appRole: 'Administrator', isDemo: true }))).toBe(false);
  });

  it('resolves the UAT reviewer by immutable identity, not display name', () => {
    // By verified email.
    expect(isUatReviewerIdentity(identity({ email: DEE_EMAIL }))).toBe(true);
    // Case/whitespace-insensitive on the SESSION email only.
    expect(isUatReviewerIdentity(identity({ email: `  ${DEE_EMAIL.toUpperCase()} ` }))).toBe(true);
    expect(isUatReviewerIdentity(identity({ email: DEE_EMAIL, emailVerified: false }))).toBe(false);
    // By subject id.
    expect(isUatReviewerIdentity(identity({ email: 'x@y.z', emailVerified: false, userId: 'usr-deeb-admin' }))).toBe(true);
  });

  it('denies an impostor who only copies the display name', () => {
    // `displayName` is not even part of the identity this module reads.
    const impostor = toTabletopAccessIdentity({
      userId: 'user-impostor',
      cognitoSub: 'sub-impostor',
      email: 'impostor@example.com',
      appRole: 'Governing Body',
      isDemo: false,
      // A display name is deliberately unreadable by the access model.
      displayName: 'Dee Bustos',
    } as never);
    expect(impostor).not.toHaveProperty('displayName');
    expect(isUatReviewerIdentity(impostor)).toBe(false);
    expect(resolvePrivilegedAccessMode(impostor)).toBeNull();
    expect(resolveTabletopAccessMode(impostor, false)).toBe('blocked');
  });

  it('ignores the legacy editable `role` alias and reads only the server appRole', () => {
    const spoofed = toTabletopAccessIdentity({
      userId: 'user-spoof',
      cognitoSub: 'sub-spoof',
      email: 'spoof@example.com',
      appRole: 'Governing Body',
      role: 'Administrator',
      isDemo: false,
    } as never);
    expect(spoofed.appRole).toBe('Governing Body');
    expect(isSuperAdminIdentity(spoofed)).toBe(false);
  });

  it('labels privileged sessions with the contractual banner copy', () => {
    expect(PRIVILEGED_ACCESS_BANNERS.uat_reviewer.label).toBe('UAT Reviewer Access');
    expect(PRIVILEGED_ACCESS_BANNERS.uat_reviewer.body).toBe(
      'This account may review tabletop exercises before readiness prerequisites are complete. Reviewer attempts do not satisfy official Governing Body readiness or compliance requirements.',
    );
    expect(PRIVILEGED_ACCESS_BANNERS.superadmin.label).toBe('Super Admin Full Access');
    expect(PRIVILEGED_ACCESS_BANNERS.superadmin.body).toContain('do not create official completion evidence');
  });
});

describe('privileged attempts never become official evidence', () => {
  beforeEach(() => {
    clearPrivilegedTabletopAccessLog();
  });

  it('rejects a save made under a privileged session context', async () => {
    for (const accessMode of ['superadmin', 'uat_reviewer'] as const) {
      const result = await commitEvidence('gb:tabletop2026:tabletop2026-q1', evidenceInput(), {
        authenticatedSubjectId: 'user-super-1',
        accessMode,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe('rejected');
    }
  });

  it('rejects a record stamped as a privileged attempt even on an official context', async () => {
    const result = await commitEvidence(
      'gb:tabletop2026:tabletop2026-q1',
      evidenceInput({ privilegedAccessMode: 'superadmin' }),
      { authenticatedSubjectId: 'user-super-1', accessMode: 'official' },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('rejected');
  });

  it('keeps the pre-existing local-demo and cross-user guards intact', async () => {
    const demo = await commitEvidence('gb:tabletop2026:tabletop2026-q1', evidenceInput({ learnerId: 'gb-chair-local' }), {
      authenticatedSubjectId: 'gb-chair-local',
    });
    expect(demo.ok).toBe(false);

    const crossUser = await commitEvidence('gb:tabletop2026:tabletop2026-q1', evidenceInput({ learnerId: 'user-a' }), {
      authenticatedSubjectId: 'user-b',
    });
    expect(crossUser.ok).toBe(false);
  });

  it('records a privileged session in the audit log, always flagged non-official', () => {
    logPrivilegedTabletopAccess({
      accessMode: 'uat_reviewer',
      subjectId: 'user-dee',
      caseId: 'tabletop2026-q1',
      mode: 'solo',
      at: '2026-05-01T09:00:00.000Z',
    });
    const log = getPrivilegedTabletopAccessLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ accessMode: 'uat_reviewer', caseId: 'tabletop2026-q1', official: false });
    expect(isPrivilegedAccessMode(log[0].accessMode)).toBe(true);
  });
});
