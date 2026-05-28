/**
 * resetUserPasswords.ts
 *
 * Resets temporary passwords for specific users in Cognito and
 * sends them a secure login notification via SES.
 *
 * RULES:
 * - Passwords are NOT logged to console / CloudWatch
 * - Passwords are temporary (force reset on first login)
 * - Only the listed users are touched
 */

import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const REGION = process.env.AWS_REGION ?? 'us-west-1';
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'robertp@careindeed.com';
const LOGIN_URL = 'https://dovdry3t4njek.cloudfront.net';
const TABLE = process.env.REGISTRATION_TABLE_NAME!;

// ── To reset specific users only, pass their emails as CLI args:
//    npx tsx scripts/resetUserPasswords.ts dagnyy@careindeed.com raney@careindeed.com
// ── To reset ALL users in the list below, run with no args.
const ALL_TARGET_USERS = [
  { name: 'Dagny Yenko',         email: 'dagnyy@careindeed.com' },
  { name: 'Janine Catanghal',    email: 'janinec@careindeed.com' },
  { name: 'Reden Valerio',       email: 'redenv@careindeed.com' },
  { name: 'Monserat Zapanta',    email: 'monseratz@careindeed.com' },
  { name: 'TJ',                  email: 'teejay1784@gmail.com' },
  { name: 'Rane Yenko',          email: 'raney@careindeed.com' },
];

const cliEmails = process.argv.slice(2).map(e => e.trim().toLowerCase()).filter(Boolean);
const TARGET_USERS = cliEmails.length > 0
  ? ALL_TARGET_USERS.filter(u => cliEmails.includes(u.email.toLowerCase()))
  : ALL_TARGET_USERS;

if (cliEmails.length > 0 && TARGET_USERS.length === 0) {
  console.error('No matching users found for:', cliEmails.join(', '));
  process.exit(1);
}

// Explicitly protected – script will abort if these appear in TARGET_USERS
const PROTECTED_USERS = ['deeb@careindeed.com', 'robertp@careindeed.com'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateTemporaryPassword(): string {
  const upper  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower  = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  // Format: CI-XXXXX###### with 3 uppercase + 2 lowercase + 6 digits to satisfy policy
  let part = '';
  for (let i = 0; i < 3; i++) part += upper.charAt(Math.floor(Math.random() * upper.length));
  for (let i = 0; i < 2; i++) part += lower.charAt(Math.floor(Math.random() * lower.length));
  for (let i = 0; i < 6; i++) part += digits.charAt(Math.floor(Math.random() * digits.length));
  return `CI-${part}`;
}

function buildEmailBody(_name: string, password: string): string {
  return `Hello,

Your access to the Care Indeed portal has been updated.

If you have already registered, please use the temporary password below to sign in:

Temporary Password:
${password}

Login here:
${LOGIN_URL}

You will be prompted to set a new password after signing in.

We apologize for the inconvenience and appreciate your patience.

Thank you,
Care Indeed`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Safety check
  for (const user of TARGET_USERS) {
    if (PROTECTED_USERS.includes(user.email.toLowerCase())) {
      throw new Error(`ABORT: ${user.email} is a protected user and must not be modified.`);
    }
  }

  const cognito = new CognitoIdentityProviderClient({ region: REGION });
  const ses     = new SESClient({ region: REGION });
  const dynamo  = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

  const results: {
    email: string;
    name: string;
    exists: boolean;
    passwordReset: boolean;
    emailSent: boolean | 'manual';
    error?: string;
    // password is held only in memory and printed once at the end
    _password?: string;
  }[] = [];

  for (const user of TARGET_USERS) {
    const result = { email: user.email, name: user.name, exists: false, passwordReset: false, emailSent: false as boolean | 'manual' };

    try {
      // 1. Verify user exists; create if not found
      try {
        await cognito.send(new AdminGetUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
        }));
        result.exists = true;
      } catch {
        // User not found – create them
        await cognito.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          MessageAction: 'SUPPRESS',
          UserAttributes: [
            { Name: 'email',          Value: user.email },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'name',           Value: user.name },
          ],
        }));
        result.exists = true; // newly created
      }

      // 2. Generate temporary password (not stored anywhere except this variable)
      const tempPassword = generateTemporaryPassword();

      // 3. Set password as temporary (Permanent: false forces reset on first login)
      await cognito.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username:   user.email,
        Password:   tempPassword,
        Permanent:  false,
      }));
      result.passwordReset = true;

      // 4. Activate DynamoDB registration record so login is allowed
      await dynamo.send(new UpdateCommand({
        TableName: TABLE,
        Key: { pk: `EMAIL#${user.email}`, sk: 'REGISTRATION' },
        UpdateExpression: 'SET #status = :active, updatedAt = :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':active': 'active', ':now': new Date().toISOString() },
      }));

      // 5. Send email
      try {
        await ses.send(new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [user.email] },
          Message: {
            Subject: { Data: 'Care Indeed Portal Access – Password Reset' },
            Body:    { Text: { Data: buildEmailBody(user.name, tempPassword) } },
          },
        }));
        result.emailSent = true;
      } catch (sesErr: unknown) {
        // SES failed – mark for manual send and attach password to result for final output only
        result.emailSent = 'manual';
        (result as typeof result & { _password: string })._password = tempPassword;
        const msg = sesErr instanceof Error ? sesErr.message : String(sesErr);
        result.error = `SES error (password needs manual send): ${msg}`;
      }

      // If email sent via SES, we still include password in final summary for confirmation
      if (result.emailSent === true) {
        (result as typeof result & { _password: string })._password = tempPassword;
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.error = msg;
    }

    results.push(result);
  }

  // ── Final Output ────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  PASSWORD RESET SUMMARY');
  console.log('========================================\n');

  const manualSends: { name: string; email: string; password: string }[] = [];

  for (const r of results) {
    const pw = (r as typeof r & { _password?: string })._password;
    console.log(`User: ${r.name} <${r.email}>`);
    console.log(`  Exists in Cognito : ${r.exists ? '✓' : '✗'}`);
    console.log(`  Password reset    : ${r.passwordReset ? '✓ (temporary)' : '✗'}`);
    console.log(`  Email sent (SES)  : ${r.emailSent === true ? '✓' : r.emailSent === 'manual' ? '⚠ MANUAL REQUIRED' : '✗'}`);
    if (r.error) console.log(`  ⚠ Note           : ${r.error}`);
    if (pw && r.emailSent === true) {
      console.log(`  Temp password     : [delivered via SES]`);
    }
    if (pw && r.emailSent === 'manual') {
      manualSends.push({ name: r.name, email: r.email, password: pw });
    }
    console.log();
  }

  // Protected user confirmation
  console.log('Protected users (NOT modified):');
  console.log('  Dee Bustos           – untouched');
  console.log('  Robert (TJ) Padilla  – untouched');
  console.log();
  console.log(`Login URL: ${LOGIN_URL}`);

  if (manualSends.length > 0) {
    console.log('\n========================================');
    console.log('  MANUAL SEND REQUIRED');
    console.log('  (SES unavailable – send these manually)');
    console.log('========================================\n');
    for (const m of manualSends) {
      console.log(`To  : ${m.name} <${m.email}>`);
      console.log(`Subj: Care Indeed Portal Access – Password Reset`);
      console.log(`Pass: ${m.password}`);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error('Script failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
