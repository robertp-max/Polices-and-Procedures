import { Router } from 'express';
import { env } from '../../env.js';
import {
  FileLocalPacketStore,
  type PacketMetadataStore,
} from '../store.js';
import { createPacketBradRouter } from './brad.js';
import { createDiffRouter } from './diff.js';
import { createPacketLifecycleRouter } from './lifecycle.js';
import { createPacketReadinessRouter } from './readiness.js';
import { createPacketSourcesRouter } from './sources.js';
import { createPacketSupplementalRouter } from './supplemental.js';
import { packetTemplatesRouter } from './templates.js';
import { createWorkflowTriggersRouter } from './workflowTriggers.js';

export interface PacketsRouterOptions {
  store?: PacketMetadataStore;
}

export function createPacketsRouter(options: PacketsRouterOptions = {}): Router {
  const router = Router();
  const store = options.store ?? new FileLocalPacketStore(env.packetStoreCacheRoot);

  router.use('/templates', packetTemplatesRouter);
  router.use(createPacketSourcesRouter({ store }));
  router.use(createPacketLifecycleRouter({ store }));
  router.use(createDiffRouter());
  router.use(createWorkflowTriggersRouter({ store }));
  router.use(createPacketReadinessRouter({ store }));
  router.use(createPacketSupplementalRouter({ packetStore: store }));
  router.use(createPacketBradRouter({ store }));

  return router;
}

export const packetsRouter: Router = createPacketsRouter();

export { packetTemplatesRouter } from './templates.js';
