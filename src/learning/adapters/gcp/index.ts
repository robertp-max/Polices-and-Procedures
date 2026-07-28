/**
 * Care Indeed LMS — GCP environment wiring.
 *
 * ⚠️ UNVERIFIED. Requires @google-cloud/{firestore,storage,kms,tasks} + credentials.
 * Assembles a provider-neutral LearningEnv (ports.ts) from live GCP clients. The
 * application service (TrainingService) and HTTP router are unchanged — this is the
 * one place production infrastructure is bound.
 */
// @ts-nocheck — depends on @google-cloud/* packages
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { CloudTasksClient } from '@google-cloud/tasks';
import type { Clock, ContentRegistry, LearningEnv } from '../../domain/ports';
import type { ContentRevision } from '../../domain/types';
import { FirestoreRecordStore, FirestoreEventStore } from './firestore';
import { GcsArtifactStore } from './gcs';
import { KmsSigner } from './kms';
import { CloudTasksJobQueue } from './tasks';

class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Resolves content revisions from a Firestore registry projection of the journey content. */
class FirestoreContentRegistry implements ContentRegistry {
  constructor(private db: Firestore, private prefix = 'cihh') {}
  async resolve(id: string, version: string): Promise<ContentRevision | null> {
    const doc = await this.db.collection(`${this.prefix}-content`).doc(`${id}@${version}`).get();
    return doc.exists ? (doc.data() as ContentRevision) : null;
  }
  async isAvailable(id: string, version: string, sha256: string): Promise<boolean> {
    const r = await this.resolve(id, version);
    return !!r && r.available && r.sha256 === sha256;
  }
}

export interface GcpConfig {
  projectId: string;
  location: string; // e.g. us-central1
  tenantPrefix?: string; // default 'cihh'
  stagingBucket: string;
  artifactsBucket: string;
  kmsKeyVersionName: string;
  jobsHandlerBaseUrl: string;
  jobsOidcServiceAccount: string;
}

/** Build the live GCP LearningEnv. Credentials come from ADC (GOOGLE_APPLICATION_CREDENTIALS). */
export function makeGcpEnv(cfg: GcpConfig): LearningEnv {
  const prefix = cfg.tenantPrefix ?? 'cihh';
  const db = new Firestore({ projectId: cfg.projectId });
  const storage = new Storage({ projectId: cfg.projectId });
  const kms = new KeyManagementServiceClient();
  const tasks = new CloudTasksClient();

  return {
    clock: new SystemClock(),
    content: new FirestoreContentRegistry(db, prefix),
    events: new FirestoreEventStore(db, prefix),
    records: new FirestoreRecordStore(db, prefix),
    artifacts: new GcsArtifactStore(storage, cfg.stagingBucket, cfg.artifactsBucket),
    signer: new KmsSigner(kms, cfg.kmsKeyVersionName),
    jobs: new CloudTasksJobQueue(tasks, cfg.projectId, cfg.location, cfg.jobsHandlerBaseUrl, cfg.jobsOidcServiceAccount),
  };
}

export function gcpConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GcpConfig {
  const need = (k: string) => {
    const v = env[k];
    if (!v) throw new Error(`Missing required env var ${k}`);
    return v;
  };
  return {
    projectId: need('GCP_PROJECT_ID'),
    location: env.GCP_LOCATION ?? 'us-central1',
    tenantPrefix: env.LMS_TENANT_PREFIX ?? 'cihh',
    stagingBucket: need('LMS_STAGING_BUCKET'),
    artifactsBucket: need('LMS_ARTIFACTS_BUCKET'),
    kmsKeyVersionName: need('LMS_KMS_KEY_VERSION'),
    jobsHandlerBaseUrl: need('LMS_JOBS_HANDLER_URL'),
    jobsOidcServiceAccount: need('LMS_JOBS_OIDC_SA'),
  };
}
