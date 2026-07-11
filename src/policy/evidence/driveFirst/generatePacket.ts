/**
 * Drive-first evidence architecture — survey/audit packet generation.
 *
 * Packets read CANONICAL Google Drive evidence (verified fresh each run),
 * assemble in temporary processing storage only, publish the final packet to
 * Drive, index it in metadata, and clean up. Missing or inaccessible evidence
 * fails closed — a packet is never silently labeled complete.
 */
import type { Actor } from './contracts';
import { REVIEWER_ROLES } from './contracts';
import { checkEvidenceIntegrity } from './integrityChecker';
import { packetBuildPath } from './tempObjectStore';
import type { FinalizeDeps, FinalizeEvidenceResult } from './finalizeEvidence';
import { finalizeEvidence, sha256HexBytes } from './finalizeEvidence';

export class PacketError extends Error {
  readonly code: 'unauthorized' | 'no_accepted_evidence' | 'evidence_unverifiable';
  readonly problems?: string[];
  constructor(code: PacketError['code'], message?: string, problems?: string[]) {
    super(message ?? code);
    this.code = code;
    this.name = 'PacketError';
    this.problems = problems;
  }
}

export interface GeneratePacketInput {
  commandId: string;
  actor: Actor;
  eventId: string;
  exportId: string;
  /** Destination Drive folder for the finalized packet. */
  driveExportsFolderId: string;
  packetName?: string;
}

export interface GeneratePacketResult {
  packet: FinalizeEvidenceResult;
  includedEvidenceIds: string[];
  packetSha256: string;
}

/**
 * Build a survey packet from accepted evidence for an event.
 * Flow: export-job metadata → resolve accepted evidence → verify every Drive
 * file → retrieve server-side → assemble in temp → hash → publish to Drive →
 * index metadata → audit → delete temp objects → return the canonical link.
 */
export async function generateSurveyPacket(
  deps: FinalizeDeps,
  input: GeneratePacketInput,
): Promise<GeneratePacketResult> {
  if (!REVIEWER_ROLES.includes(input.actor.role)) {
    throw new PacketError('unauthorized', `role "${input.actor.role}" cannot generate survey packets.`);
  }

  // 2. Resolve accepted evidence through metadata.
  const accepted = (await deps.metadata.listByEvent(input.eventId)).filter((r) => r.status === 'accepted');
  if (accepted.length === 0) {
    throw new PacketError('no_accepted_evidence', `event ${input.eventId} has no accepted evidence.`);
  }

  // 3–4. Verify EVERY required Drive file; fail closed on any defect.
  const problems: string[] = [];
  for (const record of accepted) {
    const report = await checkEvidenceIntegrity(record, deps.drive, { recomputeHash: true });
    if (report.status !== 'current') {
      problems.push(`${record.evidenceId}: ${report.status}${report.detail ? ` (${report.detail})` : ''}`);
    }
  }
  if (problems.length > 0) {
    deps.audit.append({
      actorUserId: input.actor.userId,
      actorRole: input.actor.role,
      action: 'exportSurveyPacket',
      entityType: 'export',
      entityId: input.exportId,
      eventId: input.eventId,
      commandId: input.commandId,
      result: 'error',
      detail: `evidence verification failed: ${problems.join('; ')}`,
    });
    throw new PacketError('evidence_unverifiable', 'packet blocked: evidence failed Drive verification.', problems);
  }

  // 5–7. Retrieve artifacts server-side, assemble in TEMP storage, hash.
  const parts: Uint8Array[] = [];
  for (const record of accepted) {
    parts.push(await deps.drive.getFileBytes(record.driveFileId));
  }
  const totalLength = parts.reduce((n, p) => n + p.length, 0);
  const packetBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    packetBytes.set(part, offset);
    offset += part.length;
  }
  const packetFileName = `${input.packetName ?? `${input.eventId}-survey-packet`}.bin`;
  const buildPath = packetBuildPath(input.exportId, packetFileName);
  await deps.temp.put(buildPath, packetBytes, 'application/octet-stream');
  const packetSha256 = sha256HexBytes(packetBytes);

  // 8–12. Publish the finalized packet to Drive as evidence, index metadata,
  // audit, and delete the temp build object (all inside finalizeEvidence).
  const packet = await finalizeEvidence(deps, {
    commandId: input.commandId,
    actor: input.actor,
    eventId: input.eventId,
    tempPath: buildPath,
    evidenceType: 'final_package',
    fileName: packetFileName,
    mimeType: 'application/octet-stream',
    driveFolderId: input.driveExportsFolderId,
    sourceSurface: 'SurveyPacketExport',
  });

  return {
    packet,
    includedEvidenceIds: accepted.map((r) => r.evidenceId),
    packetSha256,
  };
}
