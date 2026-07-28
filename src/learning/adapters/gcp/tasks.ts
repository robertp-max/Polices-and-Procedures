/**
 * Care Indeed LMS — Cloud Tasks job-queue adapter (ADR-LEARNING-002 outbox relay).
 *
 * ⚠️ UNVERIFIED. Requires `@google-cloud/tasks` + credentials. Implements the JobQueue
 * port for async work (certificate rendering, evidence validation, notifications,
 * projections). Idempotency is enforced via a deterministic task name so a retried
 * enqueue with the same key is a no-op (ALREADY_EXISTS is swallowed).
 */
// @ts-nocheck — depends on @google-cloud/tasks
import { CloudTasksClient } from '@google-cloud/tasks';
import type { JobQueue } from '../../domain/ports';

export class CloudTasksJobQueue implements JobQueue {
  constructor(
    private client: CloudTasksClient,
    private project: string,
    private location: string,
    private handlerBaseUrl: string, // Cloud Run worker base, e.g. https://lms-worker-xxxx.run.app
    private oidcServiceAccount: string,
  ) {}

  async enqueue(queue: string, payload: Record<string, unknown>, idempotencyKey: string): Promise<void> {
    const parent = this.client.queuePath(this.project, this.location, queue);
    const name = `${parent}/tasks/${encodeURIComponent(idempotencyKey)}`;
    try {
      await this.client.createTask({
        parent,
        task: {
          name, // deterministic → dedupe within the queue's retention window
          httpRequest: {
            httpMethod: 'POST',
            url: `${this.handlerBaseUrl}/jobs/${queue}`,
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            oidcToken: { serviceAccountEmail: this.oidcServiceAccount },
          },
        },
      });
    } catch (e) {
      const code = (e as { code?: number }).code;
      if (code === 6 /* ALREADY_EXISTS */) return; // idempotent no-op
      throw e;
    }
  }
}
