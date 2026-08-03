import { createHash } from 'node:crypto';
import type { Actor } from '../identity/session.js';
import type { ArtifactResolver, EcignAdapter, EcignVerification, VerifiedArtifact } from './adapters.js';
import { ACADEMY_MODULES, academyModule } from './academyBank.js';
import { GovernanceAcademyService } from './academyService.js';
import type {
  AccessClass,
  BoardRoleTerm,
  BylawCharterVersion,
  GovernanceAuthorityProfile,
  GovernanceRecord,
  GovernanceRecordType,
  GoverningBodyMember,
  SourceAuthorityMetadata,
  VersionedRecord,
} from './contracts.js';
import { GovernanceMeetingService } from './meetingService.js';
import { governanceMutation, mutationContext, write, type CommandContext } from './mutations.js';
import { InMemoryGovernanceRepository } from './repository.js';
import { GovernanceService } from './service.js';

export const TEST_ORGANIZATION_ID = 'care-indeed-test';
export const TEST_NOW = '2026-07-22T17:00:00.000Z';

export function testActor(userId: string, roles: string[] = ['grp-leadership-governing-body']): Actor {
  return {
    type: 'user',
    user_id: userId,
    display_name: userId,
    roles,
    attributes: { branches: [TEST_ORGANIZATION_ID], service_lines: [], access_classes: [] },
    mfa_enrolled: true,
    identity_assurance: 2,
  };
}

export function testContext(userId: string, key: string, now = TEST_NOW, roles?: string[]): CommandContext {
  return {
    organizationId: TEST_ORGANIZATION_ID,
    actor: testActor(userId, roles),
    correlationId: `correlation:${key}`,
    idempotencyKey: `idempotency:${key}`,
    now,
  };
}

export function testBase(id: string, createdBy = 'fixture'): VersionedRecord {
  return {
    id,
    organizationId: TEST_ORGANIZATION_ID,
    version: 1,
    schemaVersion: 2,
    createdAt: TEST_NOW,
    createdBy,
    updatedAt: TEST_NOW,
    updatedBy: createdBy,
  };
}

export const TEST_ACCESS_CLASSES: AccessClass[] = [
  'board_general', 'committee_restricted', 'executive_session', 'personnel_confidential',
  'patient_safety_restricted', 'compliance_investigation', 'attorney_client_privileged',
  'attorney_work_product', 'financial_confidential', 'public_published',
];

export const TEST_BYLAW_VERSION: BylawCharterVersion = {
  ...testBase('bylaws-version-2026-1'),
  documentType: 'bylaws',
  artifactId: 'bylaws-approved-v1',
  documentVersion: '2026.1',
  approvalArtifactId: 'ecign-bylaws-approval-v1',
  contentSha256: createHash('sha256').update('approved-bylaws-2026.1').digest('hex'),
  approvalStatus: 'approved',
  approvedAt: '2026-01-01T00:00:00.000Z',
  effectiveAt: '2026-01-01T00:00:00.000Z',
  supersededAt: null,
  accessClass: 'board_general',
};

export const TEST_COMMITTEE_CHARTER_VERSION: BylawCharterVersion = {
  ...testBase('charter-quality-v2'),
  documentType: 'committee_charter',
  artifactId: 'charter-quality-approved-v2',
  documentVersion: '2.0',
  approvalArtifactId: 'ecign-charter-quality-v2',
  contentSha256: createHash('sha256').update('quality-charter-v2').digest('hex'),
  approvalStatus: 'approved',
  approvedAt: '2026-01-01T00:00:00.000Z',
  effectiveAt: '2026-01-01T00:00:00.000Z',
  supersededAt: null,
  accessClass: 'committee_restricted',
};

export const TEST_PROFILE: GovernanceAuthorityProfile = {
  ...testBase('authority-profile-v1'),
  sourceBylawVersionRecordId: TEST_BYLAW_VERSION.id,
  sourceBylawArtifactId: 'bylaws-approved-v1',
  sourceBylawVersion: '2026.1',
  sourceCharterArtifactIds: [],
  sourceCharterVersionRecordIds: [],
  approvalStatus: 'approved',
  effectiveAt: '2026-01-01T00:00:00.000Z',
  supersededAt: null,
  authorizedSeatIds: ['seat-chair', 'seat-secretary', 'seat-director'],
  openingQuorum: { kind: 'majority_authorized' },
  itemQuorum: { kind: 'majority_authorized' },
  voteThresholds: { qapi_pip: { kind: 'majority_present' } },
  remoteAttendanceAllowed: true,
  remoteAttendanceRequirements: ['continuous two-way communication'],
  writtenConsentAllowed: true,
  writtenConsentThreshold: { kind: 'majority_authorized' },
  specialMeetingRules: ['verified notice required'],
  emergencyMeetingRules: ['ratification return required'],
  committeeAuthority: {},
};

function member(id: string, personId: string, displayName: string, seat: string): GoverningBodyMember {
  return {
    ...testBase(id),
    personId,
    displayName,
    status: 'active',
    appointmentArtifactId: `appointment-${id}`,
    appointedAt: '2026-01-01T00:00:00.000Z',
    votingSeatId: seat,
    orientationStatus: 'complete',
    accessClasses: [...TEST_ACCESS_CLASSES],
  };
}

export const TEST_MEMBERS = [
  member('member-chair', 'person-chair', 'Board Chair', 'seat-chair'),
  member('member-secretary', 'person-secretary', 'Board Secretary', 'seat-secretary'),
  member('member-director', 'person-director', 'Director', 'seat-director'),
] as const;

function roleTerm(id: string, memberId: string, role: BoardRoleTerm['role']): BoardRoleTerm {
  return {
    ...testBase(id),
    memberId,
    role,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2027-01-01T00:00:00.000Z',
    appointmentArtifactId: `role-${id}`,
    active: true,
  };
}

export const TEST_ROLE_TERMS = [
  roleTerm('term-chair', 'member-chair', 'chair'),
  roleTerm('term-secretary', 'member-secretary', 'secretary'),
  roleTerm('term-director', 'member-director', 'director'),
] as const;

export const TEST_LIVE_SOURCE: SourceAuthorityMetadata = {
  ...testBase('source-qapi-live'),
  sourceSystem: 'Care Indeed QAPI production source',
  sourceRecordId: 'QAPI-2026-Q2-CERTIFIED',
  sourceVersion: '2026-Q2-final.1',
  effectiveAt: '2026-07-15T00:00:00.000Z',
  approvalStatus: 'approved',
  ownerId: 'person-qapi-owner',
  asOf: '2026-06-30T23:59:59.000Z',
  dataThrough: '2026-06-30T23:59:59.000Z',
  freshnessEvaluatedAt: TEST_NOW,
  freshness: 'current',
  posture: 'live_verified',
  holdReason: null,
  conflictRecordIds: [],
  supersedesId: null,
  supersededById: null,
  impact: 'informational',
  contentSha256: createHash('sha256').update('certified-qapi-source').digest('hex'),
  accessClass: 'board_general',
  retentionClass: 'standard',
  legalHold: false,
};

export const TEST_POLICY_SOURCES: SourceAuthorityMetadata[] = [...new Set(ACADEMY_MODULES.flatMap((module) => module.policyVersionIds))]
  .map((policyId) => ({
    ...testBase(`source-policy-${policyId.toLowerCase()}`),
    sourceSystem: 'Care Indeed controlled policy lifecycle',
    sourceRecordId: policyId,
    sourceVersion: 'controlled-2026.07',
    effectiveAt: '2026-07-01T00:00:00.000Z',
    approvalStatus: 'approved',
    ownerId: 'person-policy-owner',
    asOf: '2026-07-01T00:00:00.000Z',
    dataThrough: '2026-07-01T00:00:00.000Z',
    freshnessEvaluatedAt: TEST_NOW,
    freshness: 'current',
    posture: 'live_verified',
    holdReason: null,
    conflictRecordIds: [],
    supersedesId: null,
    supersededById: null,
    impact: 'informational',
    contentSha256: createHash('sha256').update(`controlled-policy:${policyId}:2026.07`).digest('hex'),
    accessClass: 'board_general',
    retentionClass: 'standard',
    legalHold: false,
  }));

export function academySourceIds(moduleId: string): string[] {
  const definition = academyModule(moduleId);
  if (!definition) throw new Error(`Unknown test Academy module: ${moduleId}`);
  return TEST_POLICY_SOURCES
    .filter((source) => definition.policyVersionIds.includes(source.sourceRecordId))
    .map((source) => source.id);
}

export class TestArtifactResolver implements ArtifactResolver {
  readonly name = 'test-packet-studio';

  async verify(request: Parameters<ArtifactResolver['verify']>[0]): Promise<VerifiedArtifact> {
    if (request.sourceMetadata.posture !== 'live_verified') throw new Error('Test artifact source is not live verified.');
    return {
      artifactId: request.artifactId,
      artifactVersion: '7',
      contentSha256: createHash('sha256').update(`${request.artifactId}:content:v7`).digest('hex'),
      organizationId: request.organizationId,
      meetingId: request.meetingId,
      sourceOwnerId: request.sourceMetadata.ownerId as string,
      sourceCertified: request.sourceMetadata.approvalStatus === 'approved',
      sourcePosture: request.sourceMetadata.posture,
      asOf: request.sourceMetadata.asOf as string,
      dataThrough: request.sourceMetadata.dataThrough as string,
      retentionClass: request.sourceMetadata.retentionClass,
      legalHold: request.sourceMetadata.legalHold,
      superseded: false,
      accessClass: request.sourceMetadata.accessClass,
      adapter: this.name,
    };
  }
}

export class TestEcignAdapter implements EcignAdapter {
  readonly name = 'test-ecign';
  readonly signatureUsers = new Map<string, Set<string>>();

  async verifyFinalMinutes(minutes: Parameters<EcignAdapter['verifyFinalMinutes']>[0]): Promise<EcignVerification | null> {
    if (!minutes.ecignInstanceId || !minutes.approvedContentSha256) return null;
    return {
      instanceId: minutes.ecignInstanceId,
      state: 'signed_locked',
      finalContentSha256: minutes.approvedContentSha256,
      manifestSha256: createHash('sha256').update(`${minutes.ecignInstanceId}:manifest`).digest('hex'),
      signedAt: '2026-07-23T20:00:00.000Z',
      retentionUntil: '2036-07-23T20:00:00.000Z',
      signerUserIds: [...minutes.requiredSignerMemberIds],
    };
  }

  async verifySignatureArtifact(instanceId: string, signerMemberId: string): Promise<{ contentSha256: string; lockedAt: string } | null> {
    if (!this.signatureUsers.get(instanceId)?.has(signerMemberId)) return null;
    return {
      contentSha256: createHash('sha256').update(`${instanceId}:${signerMemberId}`).digest('hex'),
      lockedAt: '2026-07-23T20:00:00.000Z',
    };
  }
}

export async function seedRecord(
  repository: InMemoryGovernanceRepository,
  type: GovernanceRecordType,
  record: GovernanceRecord,
): Promise<void> {
  const context = testContext('fixture', `seed:${type}:${record.id}`);
  await repository.transact(mutationContext(context), governanceMutation({
    context,
    scope: `fixture.seed:${type}:${record.id}`,
    request: { type, id: record.id },
    writes: [write(type, record, null)],
    response: { id: record.id },
    eventType: 'governance.fixture.seeded',
    action: 'fixture.seed',
    resourceType: type,
    resourceId: record.id,
  }));
}

export interface GovernanceTestFixture {
  repository: InMemoryGovernanceRepository;
  artifacts: TestArtifactResolver;
  ecign: TestEcignAdapter;
  meetings: GovernanceMeetingService;
  academy: GovernanceAcademyService;
  service: GovernanceService;
}

export async function createGovernanceTestFixture(): Promise<GovernanceTestFixture> {
  const repository = new InMemoryGovernanceRepository();
  const artifacts = new TestArtifactResolver();
  const ecign = new TestEcignAdapter();
  const meetings = new GovernanceMeetingService({ repository, artifacts, ecign });
  const academy = new GovernanceAcademyService(repository, meetings);
  const service = new GovernanceService(repository, meetings, academy);
  await seedRecord(repository, 'bylaw_charter_version', TEST_BYLAW_VERSION);
  await seedRecord(repository, 'authority_profile', TEST_PROFILE);
  for (const item of TEST_MEMBERS) await seedRecord(repository, 'member', item);
  for (const item of TEST_ROLE_TERMS) await seedRecord(repository, 'role_term', item);
  await seedRecord(repository, 'source_metadata', TEST_LIVE_SOURCE);
  for (const item of TEST_POLICY_SOURCES) await seedRecord(repository, 'source_metadata', item);
  return { repository, artifacts, ecign, meetings, academy, service };
}
