#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { CesApiStack } from '../lib/ces-api-stack.js';

/* ═══════════════════════════════════════════════════════════════
   CES metadata API — CDK entry point.

   Provisions the NON-PHI CES metadata backend (DynamoDB + HTTP API +
   Lambda) that REPLACES browser localStorage for CES execution /
   evidence-pointer state. Files/artifacts continue to live in Google
   Drive; this backend only ever stores metadata + pointers.

   STAGING ONLY. Region defaults to us-west-1 (matches DemoAuthStack /
   the confirmed account). Production frontend/distribution is NOT
   touched by this app.
   ═══════════════════════════════════════════════════════════════ */

const app = new cdk.App();

const env = (app.node.tryGetContext('env') as string | undefined) ?? process.env.APP_ENV ?? 'staging';
if (env !== 'staging' && env !== 'prod') {
  throw new Error(`Invalid env "${env}". Must be "staging" or "prod".`);
}

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION ?? 'us-west-1';

// Origins allowed to call the API directly (CORS). The primary path is
// same-origin through CloudFront (/api/*), so CORS mainly matters for local dev.
const allowedOriginsRaw = (app.node.tryGetContext('allowedOrigins') as string | undefined) ?? process.env.ALLOWED_ORIGINS;
const allowedOrigins = (allowedOriginsRaw && allowedOriginsRaw.trim().length > 0
  ? allowedOriginsRaw.split(',')
  : [
      'https://d14dlrdifuuet5.cloudfront.net', // staging CloudFront (same-origin proxy target)
      'http://localhost:5173',
    ])
  .map(o => o.trim())
  .filter(Boolean);

new CesApiStack(app, `CesApi-${env}`, {
  environment: env,
  allowedOrigins,
  env: { account, region },
  description: `CES metadata API — DynamoDB + HTTP API + Lambda (${env})`,
  tags: {
    app: 'ci-policy-app',
    component: 'ces-metadata-api',
    environment: env,
    managedBy: 'cdk',
  },
});
