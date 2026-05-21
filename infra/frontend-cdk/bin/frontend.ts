#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack.js';
import { FrontendAlarmsStack } from '../lib/frontend-alarms-stack.js';

const app = new cdk.App();

// ── Resolve deployment parameters ──────────────────────────────────────────
// Pass -c env=staging|prod on the CLI, or set APP_ENV in the environment.
const env = (app.node.tryGetContext('env') as string | undefined)
  ?? process.env.APP_ENV
  ?? 'staging';

if (env !== 'staging' && env !== 'prod') {
  throw new Error(`Invalid env "${env}". Must be "staging" or "prod".`);
}

const awsAccount = process.env.CDK_DEFAULT_ACCOUNT;
const awsRegion  = process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION ?? 'us-west-2';

// GitHub repository in "org/repo" format.
// Override with:  cdk deploy -c githubRepo=careindeed/ci-policy-app
// or set GITHUB_REPO env var in your deploy environment.
// TODO: Replace the default value before the first deploy.
const githubRepo = (app.node.tryGetContext('githubRepo') as string | undefined)
  ?? process.env.GITHUB_REPO
  ?? 'careindeed/ci-policy-app';

// Optional email for CloudFront alarm notifications.
// Set ALARM_EMAIL or pass -c alarmEmail=you@example.com
const alarmEmail = (app.node.tryGetContext('alarmEmail') as string | undefined)
  ?? process.env.ALARM_EMAIL
  ?? '';

// ── Main stack (us-west-2) ──────────────────────────────────────────────────
// S3 bucket + CloudFront distribution + OAC + security headers +
// cache policies + GitHub Actions IAM role.
// All data-bearing resources are in the CA/West region.
const frontendStack = new FrontendStack(app, `CiPolicyFrontend-${env}`, {
  environment: env,
  githubRepo,
  env: { account: awsAccount, region: awsRegion },
  description: `ci-policy-app frontend — S3 + CloudFront (${env})`,
  tags: {
    app:         'ci-policy-app',
    component:   'frontend',
    environment: env,
    managedBy:   'cdk',
  },
});

// ── Alarms stack (us-east-1) ────────────────────────────────────────────────
// CloudFront publishes metrics ONLY to CloudWatch in us-east-1.
// This stack contains no application data or user data.
// Region placement is a hard AWS requirement — see FrontendAlarmsStack header.
new FrontendAlarmsStack(app, `CiPolicyFrontendAlarms-${env}`, {
  environment:    env,
  distributionId: frontendStack.distributionId,
  alarmEmail,
  env: { account: awsAccount, region: 'us-east-1' },
  description: `ci-policy-app frontend alarms (CloudFront metrics — must be us-east-1) (${env})`,
  tags: {
    app:         'ci-policy-app',
    component:   'frontend-alarms',
    environment: env,
    managedBy:   'cdk',
  },
});
