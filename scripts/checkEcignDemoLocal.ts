import { readFileSync } from 'node:fs';
import path from 'node:path';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const root = process.cwd();
  const demoLocalPath = path.resolve(root, 'src/policy/ecign/demoLocalApi.ts');
  const apiPath = path.resolve(root, 'src/policy/ecign/api.ts');
  const signingWorkspacePath = path.resolve(root, 'src/policy/components/FormSigningWorkspace.tsx');

  const demoLocalSource = readFileSync(demoLocalPath, 'utf8');
  const apiSource = readFileSync(apiPath, 'utf8');
  const workspaceSource = readFileSync(signingWorkspacePath, 'utf8');

  const requiredAuditActions = [
    'SIGNATURE_SESSION_CREATED',
    'CONSENT_ACCEPTED',
    'IDENTITY_CONFIRMED',
    'DOCUMENT_REVIEWED',
    'SIGNATURE_APPLIED',
    'ATTESTATION_ACCEPTED',
    'SIGNATURE_FINALIZED',
    'CERTIFICATE_CREATED',
    'ARTIFACT_REGISTERED',
  ];
  for (const action of requiredAuditActions) {
    assert(demoLocalSource.includes(`'${action}'`) || demoLocalSource.includes(`"${action}"`), `Missing demo-local audit action: ${action}`);
  }

  const requiredDemoHandlers = [
    "path === '/ecign/instances' && method === 'POST'",
    "matchVerify && method === 'POST'",
    "matchReview && method === 'POST'",
    "matchSign && method === 'POST'",
    "matchLock && method === 'POST'",
    "matchArtifacts && method === 'PATCH'",
    "path === '/ecign/versions' && method === 'POST'",
  ];
  for (const marker of requiredDemoHandlers) {
    assert(apiSource.includes(marker), `Missing DEMO_LOCAL route handler marker: ${marker}`);
  }

  assert(apiSource.includes('ALLOW_LIVE_FALLBACK'), 'Missing live fallback gate');
  assert(apiSource.includes('ECIGN_BACKEND_UNAVAILABLE'), 'Missing unavailable backend user-safe error');
  assert(workspaceSource.includes('CERTIFICATE_CREATED'), 'Missing certificate-created audit append in workspace');
  assert(workspaceSource.includes('uploadEvidence'), 'Missing finalized artifact creation in workspace');
  assert(workspaceSource.includes('captureSignedFormSnapshot'), 'Missing isolated signed snapshot capture in workspace');

  console.log(`[check:ecign-demo-local] OK (${requiredAuditActions.length} audit markers + fallback and artifact markers verified).`);
}

main().catch((error) => {
  console.error('[check:ecign-demo-local] FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
});
