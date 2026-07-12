import { describe, expect, it, vi } from 'vitest';

import { createDiffRouter } from '../../../../server/packets/routes/diff';
import type { PacketVersionDiff } from './diffService';

type RouteHandler = (
  req: Record<string, unknown>,
  res: { json: ReturnType<typeof vi.fn> },
  next: ReturnType<typeof vi.fn>,
) => void;

interface RouterStack {
  readonly stack: readonly {
    readonly route?: {
      readonly path: string;
      readonly stack: readonly { readonly handle: RouteHandler }[];
    };
  }[];
}

function firstRoute(router: unknown): { path: string; handler: RouteHandler } {
  const stack = (router as RouterStack).stack;
  const route = stack.find((layer) => layer.route !== undefined)?.route;
  expect(route).toBeDefined();
  const handler = route?.stack[0]?.handle;
  expect(handler).toBeDefined();
  return {
    path: route?.path ?? '',
    handler: handler as RouteHandler,
  };
}

async function flushAsyncRoute(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('packet diff route', () => {
  it('uses the governed packet-scoped section 18.3 route and passes packet identity to the service', async () => {
    const diff: PacketVersionDiff = {
      fromVersion: 'v1',
      toVersion: 'v2',
      sectionDiffs: [],
      pageDiffs: [],
      dataDiffs: [],
      attachmentDiffs: [],
      workflowDiffs: [],
      signatureRequirementDiffs: [],
      diffs: [],
      summary: 'No section, page, data, attachment, workflow, or signature-requirement diffs.',
    };
    const diffVersions = vi.fn((
      _packetInstanceId: string,
      _fromVersion: string,
      _toVersion: string,
    ) => diff);
    const service = { diffVersions };
    const { path, handler } = firstRoute(createDiffRouter({ service }));
    const json = vi.fn();
    const next = vi.fn();

    expect(path).toBe('/:packetInstanceId/diff');

    handler(
      {
        params: { packetInstanceId: 'packet-1' },
        query: { fromVersion: ' v1 ', toVersion: 'v2' },
        app: { locals: {} },
      },
      { json },
      next,
    );
    await flushAsyncRoute();

    expect(next).not.toHaveBeenCalled();
    expect(diffVersions).toHaveBeenCalledWith('packet-1', 'v1', 'v2');
    expect(json).toHaveBeenCalledWith(diff);
  });

  it('rejects fabricated inline snapshot diffs when no service can resolve governed versions', async () => {
    const { handler } = firstRoute(createDiffRouter());
    const json = vi.fn();
    const next = vi.fn();

    handler(
      {
        params: { packetInstanceId: 'packet-1' },
        query: {
          fromVersion: 'v1',
          toVersion: 'v2',
          fromSnapshot: JSON.stringify({ versionId: 'v1', data: { value: 1 } }),
          toSnapshot: JSON.stringify({ versionId: 'v2', data: { value: 2 } }),
        },
        app: { locals: {} },
      },
      { json },
      next,
    );
    await flushAsyncRoute();

    expect(json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      code: 'internal_error',
      status: 501,
      details: { reason: 'packet_diff_service_missing' },
    }));
  });
});
