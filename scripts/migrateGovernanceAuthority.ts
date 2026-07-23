import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';
import { GOVERNANCE_ACTIONS, type GovernanceRecord } from '../server/governance/contracts.js';
import { governanceMutation, mutationContext, newRecordBase, write, type CommandContext } from '../server/governance/mutations.js';
import { createGovernanceRepository } from '../server/governance/repository.js';
import type { Actor } from '../server/identity/session.js';

const id = z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/);
const artifactId = z.string().trim().min(3).max(160).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/);
const iso = z.string().datetime({ offset: true });
const sha256 = z.string().regex(/^[a-f0-9]{64}$/i);
const accessClass = z.enum([
  'board_general', 'committee_restricted', 'executive_session', 'personnel_confidential',
  'patient_safety_restricted', 'compliance_investigation', 'attorney_client_privileged',
  'attorney_work_product', 'financial_confidential', 'public_published',
]);
const threshold = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('majority_present') }).strict(),
  z.object({ kind: z.literal('majority_authorized') }).strict(),
  z.object({ kind: z.literal('two_thirds_present') }).strict(),
  z.object({ kind: z.literal('two_thirds_authorized') }).strict(),
  z.object({ kind: z.literal('unanimous_authorized') }).strict(),
  z.object({ kind: z.literal('fixed'), approvalsRequired: z.number().int().min(1).max(100) }).strict(),
]);
const action = z.enum(GOVERNANCE_ACTIONS);

const bylawSchema = z.object({
  id, documentType: z.enum(['bylaws', 'committee_charter']), artifactId, documentVersion: z.string().trim().min(1).max(80),
  approvalArtifactId: artifactId, contentSha256: sha256, approvalStatus: z.literal('approved'), approvedAt: iso,
  effectiveAt: iso, supersededAt: z.null(), accessClass,
}).strict();

const memberSchema = z.object({
  id, personId: id, displayName: z.string().trim().min(1).max(160), status: z.literal('active'),
  appointmentArtifactId: artifactId, appointedAt: iso, votingSeatId: id,
  orientationStatus: z.enum(['not_assigned', 'assigned', 'in_progress', 'complete', 'expired']),
  accessClasses: z.array(accessClass).min(1).max(10),
}).strict();

const roleTermSchema = z.object({
  id, memberId: id, role: z.enum(['chair', 'vice_chair', 'secretary', 'treasurer', 'director', 'committee_chair']),
  startsAt: iso, endsAt: iso.nullable(), appointmentArtifactId: artifactId, active: z.literal(true),
}).strict();

const committeeSchema = z.object({
  id, name: z.string().trim().min(1).max(160), charterVersionId: id,
  authority: z.array(action).max(GOVERNANCE_ACTIONS.length), status: z.literal('active'),
}).strict();

const committeeMembershipSchema = z.object({
  id, committeeId: id, memberId: id, role: z.enum(['chair', 'member', 'advisor']), voting: z.boolean(),
  startsAt: iso, endsAt: iso.nullable(),
}).strict();

const profileSchema = z.object({
  id, sourceBylawVersionRecordId: id, sourceBylawArtifactId: artifactId,
  sourceBylawVersion: z.string().trim().min(1).max(80),
  sourceCharterArtifactIds: z.array(artifactId).max(50), sourceCharterVersionRecordIds: z.array(id).max(50),
  approvalStatus: z.literal('approved'), effectiveAt: iso, supersededAt: z.null(),
  authorizedSeatIds: z.array(id).min(1).max(100), openingQuorum: threshold, itemQuorum: threshold,
  voteThresholds: z.record(id, threshold), remoteAttendanceAllowed: z.boolean(),
  remoteAttendanceRequirements: z.array(z.string().trim().min(1).max(500)).max(20), writtenConsentAllowed: z.boolean(),
  writtenConsentThreshold: threshold, specialMeetingRules: z.array(z.string().trim().min(1).max(500)).max(30),
  emergencyMeetingRules: z.array(z.string().trim().min(1).max(500)).max(30),
  committeeAuthority: z.record(id, z.array(action).max(GOVERNANCE_ACTIONS.length)),
}).strict();

const sourceSchema = z.object({
  id, sourceSystem: z.string().trim().min(1).max(160), sourceRecordId: id, sourceVersion: z.string().trim().min(1).max(120),
  effectiveAt: iso, approvalStatus: z.literal('approved'), ownerId: id, asOf: iso, dataThrough: iso,
  freshnessEvaluatedAt: iso, freshness: z.literal('current'), posture: z.literal('live_verified'), holdReason: z.null(),
  conflictRecordIds: z.array(id).max(50), supersedesId: id.nullable(), supersededById: z.null(),
  impact: z.enum(['informational', 'review_required']), contentSha256: sha256, accessClass,
  retentionClass: z.enum(['standard', 'claims', 'phi-access', 'legal-hold']), legalHold: z.boolean(),
}).strict();

const bundleSchema = z.object({
  schemaVersion: z.literal(2), organizationId: id, exportedAt: iso,
  bylawCharterVersions: z.array(bylawSchema).min(1).max(50), members: z.array(memberSchema).min(1).max(100),
  roleTerms: z.array(roleTermSchema).min(1).max(200), committees: z.array(committeeSchema).max(50),
  committeeMemberships: z.array(committeeMembershipSchema).max(300), profile: profileSchema,
  sources: z.array(sourceSchema).max(100),
}).strict();

function parseArguments() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const actorIndex = args.indexOf('--actor');
  if (inputIndex < 0 || !args[inputIndex + 1]) throw new Error('Usage: --input <approved-bundle.json> [--apply --actor <canonical-user-id>]');
  return {
    input: resolve(args[inputIndex + 1]),
    apply: args.includes('--apply'),
    actorId: actorIndex >= 0 ? args[actorIndex + 1] : null,
  };
}

function assertReferences(bundle: z.infer<typeof bundleSchema>): void {
  const bylawIds = new Set(bundle.bylawCharterVersions.map((record) => record.id));
  const memberIds = new Set(bundle.members.map((record) => record.id));
  const committeeIds = new Set(bundle.committees.map((record) => record.id));
  const seats = bundle.members.map((record) => record.votingSeatId);
  if (new Set(seats).size !== seats.length) throw new Error('Active voting seats must be unique.');
  if (!bylawIds.has(bundle.profile.sourceBylawVersionRecordId)) throw new Error('Authority profile bylaw version is missing.');
  if (!bundle.profile.sourceCharterVersionRecordIds.every((recordId) => bylawIds.has(recordId))) throw new Error('Authority profile charter version is missing.');
  if (!bundle.roleTerms.every((record) => memberIds.has(record.memberId))) throw new Error('Role term references an unknown member.');
  if (!bundle.committees.every((record) => bylawIds.has(record.charterVersionId))) throw new Error('Committee references an unknown controlled charter version.');
  if (!bundle.committeeMemberships.every((record) => memberIds.has(record.memberId) && committeeIds.has(record.committeeId))) throw new Error('Committee membership reference is invalid.');
  if (!bundle.members.every((record) => bundle.profile.authorizedSeatIds.includes(record.votingSeatId))) throw new Error('Active member seat is absent from the authority profile.');
}

function recordFromInput<T extends { id: string }>(context: CommandContext, value: T): T & ReturnType<typeof newRecordBase> {
  return { ...newRecordBase(context, value.id), ...value };
}

async function main() {
  const args = parseArguments();
  const raw = await readFile(args.input, 'utf8');
  const bundle = bundleSchema.parse(JSON.parse(raw));
  assertReferences(bundle);
  const bundleSha256 = createHash('sha256').update(raw).digest('hex');
  const actorId = args.actorId ?? 'dry-run';
  const actor: Actor = {
    type: 'user', user_id: actorId, roles: [],
    attributes: { branches: [bundle.organizationId], service_lines: [], access_classes: [] },
    mfa_enrolled: true, identity_assurance: 2,
  };
  const context: CommandContext = {
    organizationId: bundle.organizationId,
    actor,
    correlationId: `governance-migration:${bundleSha256.slice(0, 24)}`,
    idempotencyKey: `governance-migration:${bundleSha256}`,
    now: bundle.exportedAt,
  };
  const records: Array<{ type: Parameters<typeof write>[0]; record: GovernanceRecord }> = [
    ...bundle.bylawCharterVersions.map((value) => ({ type: 'bylaw_charter_version' as const, record: recordFromInput(context, value) as GovernanceRecord })),
    ...bundle.members.map((value) => ({ type: 'member' as const, record: recordFromInput(context, value) as GovernanceRecord })),
    ...bundle.roleTerms.map((value) => ({ type: 'role_term' as const, record: recordFromInput(context, value) as GovernanceRecord })),
    ...bundle.committees.map((value) => ({ type: 'committee' as const, record: recordFromInput(context, value) as GovernanceRecord })),
    ...bundle.committeeMemberships.map((value) => ({ type: 'committee_membership' as const, record: recordFromInput(context, value) as GovernanceRecord })),
    { type: 'authority_profile', record: recordFromInput(context, bundle.profile) as GovernanceRecord },
    ...bundle.sources.map((value) => ({ type: 'source_metadata' as const, record: recordFromInput(context, value) as GovernanceRecord })),
  ];
  if (records.length > 78) throw new Error('Bootstrap bundle exceeds the atomic 78-domain-record migration boundary; split it through a reviewed migration plan.');
  const duplicateKeys = records.map(({ type, record }) => `${type}:${record.id}`);
  if (new Set(duplicateKeys).size !== duplicateKeys.length) throw new Error('Bootstrap bundle contains duplicate record keys.');
  const summary = { ok: true, apply: args.apply, organizationId: bundle.organizationId, bundleSha256, recordCount: records.length };
  if (!args.apply) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }
  if (!args.actorId) throw new Error('--actor is required with --apply.');
  const repository = createGovernanceRepository();
  if (repository.provider !== 'dynamodb') throw new Error('Apply is blocked unless GOVERNANCE_DYNAMO_TABLE selects the production DynamoDB adapter.');
  for (const { type, record } of records) {
    if (await repository.get(bundle.organizationId, type, record.id)) throw new Error(`Target record already exists: ${type}/${record.id}`);
  }
  await repository.transact(mutationContext(context), governanceMutation({
    context,
    scope: `governance.bootstrap:${bundle.organizationId}:${bundleSha256}`,
    request: { bundleSha256, recordKeys: duplicateKeys },
    writes: records.map(({ type, record }) => write(type, record, null)),
    response: summary,
    eventType: 'governance.authority_bundle.migrated',
    action: 'governance.bootstrap',
    resourceType: 'authority_profile',
    resourceId: bundle.profile.id,
    payload: { bundleSha256, recordCount: records.length, exportedAt: bundle.exportedAt },
  }));
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown migration error.' })}\n`);
  process.exitCode = 1;
});
