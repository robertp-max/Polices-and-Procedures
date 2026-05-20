/**
 * seedDeeb.ts
 *
 * One-time provisioning script for Dee Bustos (deeb@careindeed.com).
 * Creates the Cognito user if needed, sets a permanent password, and marks the
 * DynamoDB registration record as active.
 *
 * Security:
 * - The password is never printed to stdout/stderr.
 * - The script validates Dee remains in PROTECTED_USERS in resetUserPasswords.ts
 *   before applying changes.
 *
 * Usage:
 *   npx tsx scripts/seedDeeb.ts
 *
 * Requires .env with:
 *   COGNITO_USER_POOL_ID, AWS_REGION, REGISTRATION_TABLE_NAME
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'node:fs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const REGION = process.env.AWS_REGION ?? 'us-west-1';
const TABLE = process.env.REGISTRATION_TABLE_NAME!;

const USER = {
  email: 'deeb@careindeed.com',
  name: 'Dee Bustos',
  givenName: 'Dee',
  familyName: 'Bustos',
  password: 'Caregiver2012!',
};

function assertProtectedUserInvariant() {
  const resetScriptPath = path.resolve(__dirname, './resetUserPasswords.ts');
  const resetScript = readFileSync(resetScriptPath, 'utf8').toLowerCase();
  if (!resetScript.includes(USER.email.toLowerCase())) {
    throw new Error(
      'Safety check failed: Dee is missing from PROTECTED_USERS in scripts/resetUserPasswords.ts',
    );
  }
}

async function main() {
  if (!USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set in .env');
  if (!TABLE) throw new Error('REGISTRATION_TABLE_NAME is not set in .env');

  assertProtectedUserInvariant();

  const cognito = new CognitoIdentityProviderClient({ region: REGION });
  const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

  let userExists = false;
  try {
    await cognito.send(new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: USER.email,
    }));
    userExists = true;
    console.log(`Cognito user already exists: ${USER.email}`);
  } catch {
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: USER.email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: USER.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'given_name', Value: USER.givenName },
        { Name: 'family_name', Value: USER.familyName },
        { Name: 'name', Value: USER.name },
      ],
    }));
    console.log(`Cognito user created: ${USER.email}`);
  }

  // Apply a permanent password and do not emit the value in logs.
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: USER.email,
    Password: USER.password,
    Permanent: true,
  }));
  console.log(`Password set (permanent)${userExists ? ' (updated)' : ''}`);

  const now = new Date().toISOString();
  await dynamo.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EMAIL#${USER.email}`,
      sk: 'REGISTRATION',
      email: USER.email,
      emailDomain: 'careindeed.com',
      cognitoUsername: USER.email,
      status: 'active',
      setupCompletedAt: now,
      approvedAt: now,
      approvedBy: 'system-seed',
      createdAt: now,
      updatedAt: now,
    },
  }));

  console.log('DynamoDB registration record upserted (status: active)');
  console.log('\nDone. Dee Bustos can now log in at the portal.');
  console.log(`  Email: ${USER.email}`);
  console.log('  Protection: verified in resetUserPasswords.ts');
}

main().catch((err) => {
  console.error('Script failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
