#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { DemoAuthStack } from '../lib/demo-auth-stack.js';

const app = new cdk.App();
new DemoAuthStack(app, 'DemoAuthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-west-2',
  },
});
