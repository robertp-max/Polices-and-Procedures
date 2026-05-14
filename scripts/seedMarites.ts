/**
 * seedMarites.ts
 *
 * One-time provisioning script for Marites Arzaga (maritesa@careindeed.com).
 * Creates the Cognito user, sets a permanent password, and activates the
 * DynamoDB registration record so she can log in immediately.
 *
 * Usage:
 *   npx tsx scripts/seedMarites.ts
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
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const REGION       = process.env.AWS_REGION ?? 'us-west-1';
const TABLE        = process.env.REGISTRATION_TABLE_NAME!;

const USER = {
  email:      'maritesa@careindeed.com',
  name:       'Marites Arzaga',
  givenName:  'Marites',
  familyName: 'Arzaga',
  password:   'caregiver2012!',
};

async function main() {
  if (!USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set in .env');
  if (!TABLE)        throw new Error('REGISTRATION_TABLE_NAME is not set in .env');

  const cognito = new CognitoIdentityProviderClient({ region: REGION });
  const dynamo  = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

  // 1. Create Cognito user (skip if already exists)
  let userExists = false;
  try {
    await cognito.send(new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username:   USER.email,
    }));
    userExists = true;
    console.log(`Cognito user already exists: ${USER.email}`);
  } catch {
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId:    USER_POOL_ID,
      Username:      USER.email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email',          Value: USER.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'given_name',     Value: USER.givenName },
        { Name: 'family_name',    Value: USER.familyName },
        { Name: 'name',           Value: USER.name },
      ],
    }));
    console.log(`Cognito user created: ${USER.email}`);
  }

  // 2. Set permanent password
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username:   USER.email,
    Password:   USER.password,
    Permanent:  true,
  }));
  console.log(`Password set (permanent)${userExists ? ' (updated)' : ''}`);

  // 3. Upsert DynamoDB registration record as active
  const now = new Date().toISOString();
  await dynamo.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk:                `EMAIL#${USER.email}`,
      sk:                'REGISTRATION',
      email:             USER.email,
      emailDomain:       'careindeed.com',
      cognitoUsername:   USER.email,
      status:            'active',
      setupCompletedAt:  now,
      approvedAt:        now,
      approvedBy:        'system-seed',
      createdAt:         now,
      updatedAt:         now,
    },
  }));
  console.log('DynamoDB registration record upserted (status: active)');

  console.log('\nDone. Marites Arzaga can now log in at the portal.');
  console.log(`  Email   : ${USER.email}`);
  console.log(`  Role    : Super Admin`);
}

main().catch((err) => {
  console.error('Script failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
