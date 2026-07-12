import type { PacketDriveConnector } from '@/policy/packets/contracts';
import { LocalDriveAdapter } from './localDriveAdapter.js';

export type {
  DriveArtifactPointer,
  DriveDestination,
  DriveDestinationRequest,
  PacketDriveConnector,
  PriorPacketExclusion,
  PriorPacketLookupResult,
  PriorPacketQuery,
  PublishArtifactsRequest,
  PublishArtifactsResult,
  ReadSidecarRequest,
  VerifyArtifactHashRequest,
  VerifyArtifactHashResult,
} from '@/policy/packets/contracts';

export const PACKET_DRIVE_CONNECTOR = 'local' as const;

export type PacketDriveConnectorSelection = typeof PACKET_DRIVE_CONNECTOR;

export function createPacketDriveConnector(cacheRoot?: string): PacketDriveConnector {
  return new LocalDriveAdapter(cacheRoot);
}
