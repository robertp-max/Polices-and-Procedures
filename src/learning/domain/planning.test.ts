import { describe, it, expect } from 'vitest';
import {
  resolveApplicableRequirements,
  deriveInitialStatus,
  buildAssignment,
  type BuildAssignmentInput,
} from './planning';
import type { ContentRevision, RequirementDefinition, RoleAssignment } from './types';

const now = new Date('2026-07-27T00:00:00.000Z');

function role(roleCode: RoleAssignment['roleCode'], dutyFlags: string[] = [], effectiveTo?: string): RoleAssignment {
  return {
    id: `ra-${roleCode}`,
    subjectId: 's1',
    roleCode,
    isPrimary: true,
    dutyFlags,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveTo,
    sourceSystem: 'registry',
    sourceRecordId: 'r1',
  };
}

function req(partial: Partial<RequirementDefinition>): RequirementDefinition {
  return {
    id: 'REQ-1',
    version: 1,
    code: 'REQ-1',
    name: 'Req',
    kind: 'TRAINING',
    applicableRoleCodes: ['RN'],
    policyVersionRefs: [],
    evidenceSpecRefs: [],
    prerequisiteRequirementRefs: [],
    certificateScopes: [],
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    status: 'PUBLISHED',
    ...partial,
  };
}

describe('role/duty requirement resolution (no self-selected roles)', () => {
  it('includes a requirement when a subject role matches', () => {
    const out = resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('RN')] }, [req({})], now);
    expect(out).toHaveLength(1);
  });

  it('excludes a requirement when no role matches', () => {
    const out = resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('HHA')] }, [req({ applicableRoleCodes: ['RN'] })], now);
    expect(out).toHaveLength(0);
  });

  it('requires ALL duty flags when the requirement specifies them', () => {
    const r = req({ applicableRoleCodes: ['HHA'], dutyFlags: ['SKILLED_ASSIST'] });
    expect(resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('HHA', ['SKILLED_ASSIST'])] }, [r], now)).toHaveLength(1);
    expect(resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('HHA', [])] }, [r], now)).toHaveLength(0);
  });

  it('ignores unpublished, not-yet-effective, and expired requirements', () => {
    expect(resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('RN')] }, [req({ status: 'DRAFT' })], now)).toHaveLength(0);
    expect(resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('RN')] }, [req({ effectiveFrom: '2099-01-01T00:00:00.000Z' })], now)).toHaveLength(0);
    expect(resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('RN')] }, [req({ effectiveTo: '2020-01-01T00:00:00.000Z' })], now)).toHaveLength(0);
  });

  it('ignores expired role assignments', () => {
    const out = resolveApplicableRequirements({ subjectId: 's1', roleAssignments: [role('RN', [], '2020-01-01T00:00:00.000Z')] }, [req({})], now);
    expect(out).toHaveLength(0);
  });
});

const content = (over: Partial<ContentRevision> = {}): ContentRevision => ({
  id: 'RN-001',
  version: '1',
  sha256: 'abc',
  adapterType: 'JOURNEY',
  publicationStatus: 'PUBLISHED',
  available: true,
  ...over,
});

const baseBuild = (over: Partial<BuildAssignmentInput> = {}): BuildAssignmentInput => ({
  subjectId: 's1',
  roleAssignmentIds: ['ra-RN'],
  requirement: req({ contentRef: { id: 'RN-001', version: '1', sha256: 'abc' } }),
  content: content(),
  satisfiedRequirementIds: new Set(),
  assignedAt: now.toISOString(),
  availableAt: now.toISOString(),
  idFactory: () => 'assign-1',
  ...over,
});

describe('assignment status is derived, never a client claim', () => {
  it('READY when content resolves with a matching hash and no prereqs', () => {
    expect(deriveInitialStatus(baseBuild()).status).toBe('READY');
  });

  it('LOCKED_PREREQUISITE when a prerequisite requirement is unsatisfied', () => {
    const r = req({ prerequisiteRequirementRefs: [{ id: 'GAO', version: 1 }] });
    expect(deriveInitialStatus(baseBuild({ requirement: r })).status).toBe('LOCKED_PREREQUISITE');
  });

  it('PENDING_CONTENT when content cannot resolve', () => {
    expect(deriveInitialStatus(baseBuild({ content: null })).status).toBe('PENDING_CONTENT');
  });

  it('BLOCKED_CONTENT on a hash mismatch', () => {
    const d = deriveInitialStatus(baseBuild({ content: content({ sha256: 'DIFFERENT' }) }));
    expect(d.status).toBe('BLOCKED_CONTENT');
    expect(d.reasonCodes).toContain('CONTENT_HASH_MISMATCH');
  });

  it('buildAssignment pins content ref + never yields COMPLETED', () => {
    const a = buildAssignment(baseBuild());
    expect(a.pinnedContentRef).toEqual({ id: 'RN-001', version: '1', sha256: 'abc' });
    expect(a.status).not.toBe('COMPLETED');
    expect(a.version).toBe(1);
  });
});
