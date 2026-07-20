import { Router } from 'express';
import { env } from '../../env.js';
import {
  FileLocalPacketStore,
  type PacketMetadataStore,
} from '../store.js';
import { createPacketApprovalRouter } from './approval.js';
import { createPacketBradRouter } from './brad.js';
import { createDiffRouter } from './diff.js';
import { createPacketEcignRouter } from './ecign.js';
import { createPacketLifecycleRouter } from './lifecycle.js';
import { createPacketPostLockRouter } from './postLock.js';
import { createQapiPriorRouter } from './qapiPrior.js';
import { createPacketReadinessRouter } from './readiness.js';
import { createPacketSignedPackageRouter } from './signedPackage.js';
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
  // Wave-4 (Integration #3): approval readiness -> signing -> signed package -> publish/certify/lock,
  // plus prior-QAPI retrieval. eCIgn and prior-QAPI use their built-in envelope/local-Drive defaults.
  router.use(createPacketApprovalRouter({ store }));
  router.use(createPacketEcignRouter());
  router.use(createPacketSignedPackageRouter({ store }));
  router.use(createPacketPostLockRouter({ store }));
  router.use(createQapiPriorRouter());

  return router;
}

export const packetsRouter: Router = createPacketsRouter();

export { packetTemplatesRouter } from './templates.js';
