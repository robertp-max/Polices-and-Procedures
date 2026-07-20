import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../../errors.js';
import {
  diffPacketVersions,
  type PacketVersionDiff,
  type PacketVersionSnapshot,
} from '../../../src/policy/packets/editing/diffService.js';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export interface PacketDiffLookupService {
  readonly diffVersions?: (
    packetInstanceId: string,
    fromVersion: string,
    toVersion: string,
  ) => PacketVersionDiff | Promise<PacketVersionDiff>;
  readonly getVersionSnapshot?: (
    packetInstanceId: string,
    versionId: string,
  ) => PacketVersionSnapshot | Promise<PacketVersionSnapshot>;
}

export interface DiffRouterOptions {
  readonly service?: PacketDiffLookupService;
}

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function parseVersionParam(value: unknown, name: string): string {
  const first = firstQueryValue(value);
  if (typeof first === 'string' && first.trim().length > 0) return first.trim();

  throw new ApiError('validation_error', `${name} query parameter is required.`, 400, {
    field: name,
  });
}

function parsePacketInstanceId(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();

  throw new ApiError('validation_error', 'packetInstanceId path parameter is required.', 400, {
    field: 'packetInstanceId',
  });
}

function serviceFromRequest(req: Request, configured: PacketDiffLookupService | undefined): PacketDiffLookupService | undefined {
  if (configured !== undefined) return configured;

  const locals = req.app.locals as Record<string, unknown>;
  const candidates = [
    locals['packetDiffService'],
    locals['packetsDiffService'],
    locals['diffService'],
    locals['packetVersionStore'],
  ];

  return candidates.find((candidate): candidate is PacketDiffLookupService => {
    if (!isRecord(candidate)) return false;
    return typeof candidate['diffVersions'] === 'function' || typeof candidate['getVersionSnapshot'] === 'function';
  });
}

async function resolveDiff(
  service: PacketDiffLookupService | undefined,
  packetInstanceId: string,
  fromVersion: string,
  toVersion: string,
): Promise<PacketVersionDiff> {
  if (service === undefined) {
    throw new ApiError('internal_error', 'Packet diff service is not configured.', 501, {
      reason: 'packet_diff_service_missing',
    });
  }

  if (service.diffVersions !== undefined) {
    return service.diffVersions(packetInstanceId, fromVersion, toVersion);
  }

  if (service.getVersionSnapshot !== undefined) {
    const before = await service.getVersionSnapshot(packetInstanceId, fromVersion);
    const after = await service.getVersionSnapshot(packetInstanceId, toVersion);
    return diffPacketVersions(before, after);
  }

  throw new ApiError('internal_error', 'Packet diff service cannot resolve versions.', 501, {
    reason: 'packet_diff_service_missing',
  });
}

export function createDiffRouter(options: DiffRouterOptions = {}) {
  const router = Router();

  router.get('/:packetInstanceId/diff', asyncH(async (req, res) => {
    const packetInstanceId = parsePacketInstanceId(req.params['packetInstanceId']);
    const fromVersion = parseVersionParam(req.query['fromVersion'], 'fromVersion');
    const toVersion = parseVersionParam(req.query['toVersion'], 'toVersion');
    const diff = await resolveDiff(
      serviceFromRequest(req, options.service),
      packetInstanceId,
      fromVersion,
      toVersion,
    );

    res.json(diff);
  }));

  return router;
}

export const diffRouter = createDiffRouter();

export default diffRouter;
