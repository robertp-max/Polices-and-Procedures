import { Router } from 'express';
import { env } from '../../env.js';
import {
  FileLocalPacketStore,
  type PacketMetadataStore,
} from '../store.js';
import { createPacketBradRouter } from './brad.js';
import { createPacketLifecycleRouter } from './lifecycle.js';
import { createPacketSourcesRouter } from './sources.js';
import { packetTemplatesRouter } from './templates.js';

export interface PacketsRouterOptions {
  store?: PacketMetadataStore;
}

export function createPacketsRouter(options: PacketsRouterOptions = {}): Router {
  const router = Router();
  const store = options.store ?? new FileLocalPacketStore(env.packetStoreCacheRoot);

  router.use('/templates', packetTemplatesRouter);
  router.use(createPacketSourcesRouter({ store }));
  router.use(createPacketBradRouter({ store }));
  router.use(createPacketLifecycleRouter({ store }));

  return router;
}

export const packetsRouter: Router = createPacketsRouter();

export { packetTemplatesRouter } from './templates.js';
