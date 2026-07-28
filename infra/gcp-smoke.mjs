// Live smoke test of the provisioned Care Indeed LMS infra, using the same SDK
// patterns as src/learning/adapters/gcp/*. Verifies Firestore, Cloud KMS, GCS, Cloud Tasks.
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { CloudTasksClient } from '@google-cloud/tasks';
import { createHash, createVerify, createPublicKey } from 'node:crypto';

const PROJECT = 'data-hangout-500409-j4';
const STAGING = `${PROJECT}-lms-staging-dev`;
const ARTIFACTS = `${PROJECT}-lms-artifacts-dev`;
const KEY = `projects/${PROJECT}/locations/us/keyRings/lms-signing/cryptoKeys/gate-manifest-signer/cryptoKeyVersions/1`;
const TASKS_LOC = 'us-central1';
const ts = Date.now();
const out = {};

// 1) Firestore — write/read/delete a subject doc (FirestoreRecordStore pattern)
{
  const db = new Firestore({ projectId: PROJECT });
  const ref = db.collection('cihh-subjects').doc(`smoke-${ts}`).collection('assignments').doc('as-1');
  await ref.set({ id: 'as-1', subjectId: `smoke-${ts}`, status: 'READY' });
  const got = await ref.get();
  out.firestore = got.exists && got.data().status === 'READY' ? 'PASS' : 'FAIL';
  await ref.delete();
  await db.terminate();
}

// 2) Cloud KMS — sign & verify treating the domain digest string as an opaque message
//    (both sides hash it identically → internally consistent). Mirrors the KmsSigner fix.
{
  const kms = new KeyManagementServiceClient();
  const payloadSha256 = createHash('sha256').update(`gate-state-${ts}`).digest('hex'); // domain fingerprint
  const digest = createHash('sha256').update(payloadSha256).digest(); // sign over SHA256(fingerprintString)
  const [signRes] = await kms.asymmetricSign({ name: KEY, digest: { sha256: digest } });
  const signature = Buffer.from(signRes.signature).toString('base64');
  const [pub] = await kms.getPublicKey({ name: KEY });
  const verifier = createVerify('SHA256');
  verifier.update(payloadSha256); // node re-hashes the same string → same digest
  verifier.end();
  out.kms = verifier.verify(createPublicKey(pub.pem), Buffer.from(signature, 'base64')) ? 'PASS' : 'FAIL';
}

// 3) GCS — putStaging -> promote -> cleanup (GcsArtifactStore pattern).
//    Signed-URL generation needs a service-account identity (works on Cloud Run as the SA);
//    with user ADC locally it can't sign, so it's reported separately as SKIP.
{
  const storage = new Storage({ projectId: PROJECT });
  const key = `manifest/smoke-${ts}.json`;
  const bytes = Buffer.from(JSON.stringify({ smoke: ts }));
  await storage.bucket(STAGING).file(key).save(bytes, { contentType: 'application/json', resumable: false });
  await storage.bucket(STAGING).file(key).copy(storage.bucket(ARTIFACTS).file(key));
  const [meta] = await storage.bucket(ARTIFACTS).file(key).getMetadata();
  out.gcs = meta.generation ? 'PASS' : 'FAIL';
  try {
    const [url] = await storage.bucket(ARTIFACTS).file(key).getSignedUrl({ action: 'read', expires: Date.now() + 60_000 });
    out.gcsSignedUrl = url.startsWith('https://') ? 'PASS' : 'FAIL';
  } catch {
    out.gcsSignedUrl = 'SKIP (needs SA identity; OK on Cloud Run)';
  }
  await storage.bucket(STAGING).file(key).delete().catch(() => {});
  await storage.bucket(ARTIFACTS).file(key).delete().catch(() => {});
}

// 4) Cloud Tasks — create a deterministic-named task, then delete it (CloudTasksJobQueue pattern)
{
  const tasks = new CloudTasksClient();
  const parent = tasks.queuePath(PROJECT, TASKS_LOC, 'certificate-render');
  const name = `${parent}/tasks/smoke-${ts}`;
  try {
    const [task] = await tasks.createTask({
      parent,
      task: {
        name,
        httpRequest: {
          httpMethod: 'POST',
          url: 'https://example.invalid/jobs/certificate-render',
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify({ smoke: ts })).toString('base64'),
        },
      },
    });
    out.tasks = task.name === name ? 'PASS' : 'FAIL';
    await tasks.deleteTask({ name }); // remove so it never actually delivers
  } catch (e) {
    out.tasks = `FAIL: ${e.message}`;
  }
}

console.log(JSON.stringify(out, null, 2));
const allPass = Object.values(out).every((v) => v === 'PASS' || String(v).startsWith('SKIP'));
console.log(allPass ? 'ALL_PASS' : 'SOME_FAILED');
process.exit(allPass ? 0 : 1);
